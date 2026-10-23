-- Applied to sandspod-dev on 2026-10-24 (by SQL).
-- Ritual parts go only to members who could take part: someone who hasn't
-- signed the coven's current agreements (or is banned from covens) can't be
-- given a step. save_coven_ritual refuses it, and coven_ritual_people tells
-- the planner who can be chosen.

-- Create or replace a ritual and its steps in one go.
-- p_ritual: { title, intention, description, scheduled_for, status } (status 'draft' or 'scheduled').
-- p_steps: [{ id?, title, instructions, spoken_text, duration_minutes, assigned_user_id, assigned_rank_id }] in order.
create or replace function public.save_coven_ritual(p_coven uuid, p_ritual_id uuid, p_ritual jsonb, p_steps jsonb)
returns public.coven_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_rituals;
  step jsonb;
  n integer := 0;
  kept uuid[] := '{}';
  step_id uuid;
  person uuid;
  rank uuid;
begin
  if not (public.coven_in_good_standing(p_coven) and public.coven_permission(p_coven, 'lead')) and not public.is_community_moderator() then
    raise exception 'Only those who lead the coven''s rituals can plan them.';
  end if;
  if jsonb_typeof(coalesce(p_steps, '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_steps, '[]'::jsonb)) > 60 then
    raise exception 'A ritual can have up to 60 steps.';
  end if;
  if coalesce(p_ritual->>'status', 'scheduled') not in ('draft', 'scheduled') then
    raise exception 'A ritual is saved as a draft or as scheduled.';
  end if;

  if p_ritual_id is null then
    insert into public.coven_rituals (coven_id, title, intention, description, scheduled_for, status, created_by)
    values (p_coven, btrim(p_ritual->>'title'), nullif(btrim(p_ritual->>'intention'), ''), nullif(btrim(p_ritual->>'description'), ''),
            nullif(p_ritual->>'scheduled_for', '')::timestamptz, coalesce(p_ritual->>'status', 'scheduled'), auth.uid())
    returning * into saved;
  else
    select * into saved from public.coven_rituals where id = p_ritual_id and coven_id = p_coven for update;
    if saved.id is null then raise exception 'That ritual was not found.'; end if;
    if saved.status = 'live' then raise exception 'End the ritual before changing it.'; end if;
    update public.coven_rituals
    set title = btrim(p_ritual->>'title'),
        intention = nullif(btrim(p_ritual->>'intention'), ''),
        description = nullif(btrim(p_ritual->>'description'), ''),
        scheduled_for = nullif(p_ritual->>'scheduled_for', '')::timestamptz,
        status = coalesce(p_ritual->>'status', 'scheduled'),
        current_step_id = null, started_at = null, ended_at = null, led_by = null,
        updated_at = now()
    where id = saved.id
    returning * into saved;
  end if;

  for step in select * from jsonb_array_elements(coalesce(p_steps, '[]'::jsonb)) loop
    n := n + 1;
    person := nullif(step->>'assigned_user_id', '')::uuid;
    rank := nullif(step->>'assigned_rank_id', '')::uuid;
    if person is not null and rank is not null then raise exception 'Step %: give it to one person or one position, not both.', n; end if;
    if person is not null and not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = person and status = 'active') then
      raise exception 'Step %: that person is not a member of this coven.', n;
    end if;
    -- Only someone who could take part can be given a part.
    if person is not null and (public.coven_unsigned_agreements(p_coven, person) > 0 or public.is_community_banned(person)) then
      raise exception 'Step %: % needs to sign the coven''s current agreements before they can be given a part.', n,
        coalesce((select display_name from public.coven_profiles where user_id = person), 'That member');
    end if;
    if rank is not null and not exists (select 1 from public.coven_ranks where id = rank and coven_id = p_coven) then
      raise exception 'Step %: that position is not one of this coven''s.', n;
    end if;
    step_id := nullif(step->>'id', '')::uuid;
    if step_id is not null and exists (select 1 from public.coven_ritual_steps where id = step_id and ritual_id = saved.id) then
      update public.coven_ritual_steps
      set position = n, title = btrim(step->>'title'), instructions = nullif(btrim(step->>'instructions'), ''),
          spoken_text = nullif(btrim(step->>'spoken_text'), ''), duration_minutes = nullif(step->>'duration_minutes', '')::integer,
          assigned_user_id = person, assigned_rank_id = rank,
          started_at = null, completed_at = null, completed_by = null, updated_at = now()
      where id = step_id;
    else
      insert into public.coven_ritual_steps (ritual_id, coven_id, position, title, instructions, spoken_text, duration_minutes, assigned_user_id, assigned_rank_id)
      values (saved.id, p_coven, n, btrim(step->>'title'), nullif(btrim(step->>'instructions'), ''), nullif(btrim(step->>'spoken_text'), ''),
              nullif(step->>'duration_minutes', '')::integer, person, rank)
      returning id into step_id;
    end if;
    kept := array_append(kept, step_id);
  end loop;

  -- Steps left out of the list are removed.
  perform public.coven_ritual_prune(saved.id, kept);
  return saved;
end;
$$;

-- The coven's active members, and whether each can be given a part now.
create or replace function public.coven_ritual_people(p_coven uuid)
returns table (user_id uuid, eligible boolean)
language sql
stable
security definer
set search_path = public
as $$
  select m.user_id,
         public.coven_unsigned_agreements(p_coven, m.user_id) = 0 and not public.is_community_banned(m.user_id)
  from public.coven_members m
  where m.coven_id = p_coven and m.status = 'active'
    and (public.coven_permission(p_coven, 'lead') or public.is_community_moderator());
$$;

revoke execute on function public.coven_ritual_people(uuid) from public, anon;
grant execute on function public.coven_ritual_people(uuid) to authenticated;
