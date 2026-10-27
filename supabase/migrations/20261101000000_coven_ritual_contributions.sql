-- NOT YET APPLIED. Coven ritual planning, second pass: clearer steps, any mix
-- of people per step, items from the altar, and what a step asks of people.
--
-- * Steps: each step can now be for any mix of the whole coven, positions and
--   people (assignees, a list of {kind: 'coven'|'rank'|'user', id}); older
--   steps keep their one person or one position (assigned_user_id /
--   assigned_rank_id), which are still filled when the list is one of either.
--   A step remembers the action it was made from (action), the altar's things
--   it uses (items) and what it asks of people (contribution). During a step
--   the altar can also be tended by chosen people (altar_access 'chosen',
--   altar_tenders), and a step can release the ritual's papers.
-- * Contributions: something written, placed or done for a step, by each
--   person it is for or by one person for the coven, ahead of time or during
--   the step. Who may read each one is set per step (only the writer; the
--   writer and those who lead the coven's rituals; the whole coven; the whole
--   coven without names), and anyone may seal their own as private: it still
--   takes part and others can hold it for them ("supports") without reading
--   it, and only its writer sees who. Only the writer tends it, marks it
--   answered or closes it. A written petition can become a coven petition
--   once offered (linked both ways, so it can be tended after the ritual);
--   other writings are kept, or burned, buried or released.
-- * Participation: the coven's head, and the positions and people the head
--   chooses, see how many have written for each step and who has and hasn't,
--   never what they wrote.
--
-- Everything changes through the functions below. Nothing here loosens the
-- rules before it: parts still go only to members in good standing who have
-- signed the coven's current agreements, and blocks are kept.

-- ---------------------------------------------------------------------------
-- Steps
-- ---------------------------------------------------------------------------

alter table public.coven_ritual_steps add column if not exists assignees jsonb not null default '[]'::jsonb
  check (jsonb_typeof(assignees) = 'array' and jsonb_array_length(assignees) <= 40);
alter table public.coven_ritual_steps add column if not exists action text
  check (action is null or action ~ '^[a-z_]{1,40}$');
alter table public.coven_ritual_steps add column if not exists items jsonb not null default '[]'::jsonb
  check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 24 and octet_length(items::text) <= 20000);
alter table public.coven_ritual_steps add column if not exists contribution jsonb
  check (contribution is null or (jsonb_typeof(contribution) = 'object' and octet_length(contribution::text) <= 2000));
alter table public.coven_ritual_steps add column if not exists altar_tenders jsonb not null default '[]'::jsonb
  check (jsonb_typeof(altar_tenders) = 'array' and jsonb_array_length(altar_tenders) <= 40);

alter table public.coven_ritual_steps drop constraint if exists coven_ritual_steps_altar_action_check;
alter table public.coven_ritual_steps add constraint coven_ritual_steps_altar_action_check
  check (altar_action is null or altar_action in ('light_candle', 'place_item', 'light_all', 'snuff_all', 'release_papers'));
alter table public.coven_ritual_steps drop constraint if exists coven_ritual_steps_altar_access_check;
alter table public.coven_ritual_steps add constraint coven_ritual_steps_altar_access_check
  check (altar_access in ('assigned', 'everyone', 'leader', 'chosen'));

-- A coven petition that began in a ritual, so it can be traced back (and, later, tended in one list).
alter table public.coven_petitions add column if not exists source_ritual_id uuid references public.coven_rituals (id) on delete set null;
alter table public.coven_petitions add column if not exists source_step_id uuid references public.coven_ritual_steps (id) on delete set null;

-- Whether someone is among a list of {kind, id}: the whole coven, their
-- position, or them by name. An empty list is the whole coven.
create or replace function public.coven_assignees_include(p_coven uuid, p_list jsonb, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coven_members m
    where m.coven_id = p_coven and m.user_id = p_user and m.status = 'active'
      and (
        jsonb_array_length(coalesce(p_list, '[]'::jsonb)) = 0
        or exists (
          select 1 from jsonb_array_elements(coalesce(p_list, '[]'::jsonb)) a
          where a->>'kind' = 'coven'
             or (a->>'kind' = 'user' and a->>'id' = p_user::text)
             or (a->>'kind' = 'rank' and m.rank_id is not null and a->>'id' = m.rank_id::text)
        )
      )
  );
$$;

-- Whether a step is someone's: by its list, or (older steps) its one person
-- or position, or the whole coven's.
create or replace function public.coven_step_for(p_step uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.coven_ritual_steps s
    join public.coven_members m on m.coven_id = s.coven_id and m.user_id = p_user and m.status = 'active'
    where s.id = p_step
      and case
        when jsonb_array_length(s.assignees) > 0 then public.coven_assignees_include(s.coven_id, s.assignees, p_user)
        else s.assigned_user_id = p_user
          or (s.assigned_rank_id is not null and s.assigned_rank_id = m.rank_id)
          or (s.assigned_user_id is null and s.assigned_rank_id is null)
      end
  );
$$;

create or replace function public.coven_step_is_mine(p_step uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.coven_step_for(p_step, auth.uid());
$$;

-- A list of {kind, id} checked against the coven and cleaned (no repeats,
-- the whole coven alone when it's there). With p_parts, every person named
-- must be able to take a part now (signed up to date, not banned).
create or replace function public.coven_clean_assignees(p_coven uuid, p_list jsonb, p_where text, p_parts boolean)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  a jsonb;
  cleaned jsonb := '[]'::jsonb;
  who uuid;
begin
  if p_list is null or jsonb_typeof(p_list) <> 'array' then return '[]'::jsonb; end if;
  if jsonb_array_length(p_list) > 40 then raise exception '%: choose up to 40.', p_where; end if;
  for a in select * from jsonb_array_elements(p_list) loop
    if a->>'kind' = 'coven' then
      return '[{"kind":"coven","id":"coven"}]'::jsonb;
    elsif a->>'kind' = 'rank' then
      if not exists (select 1 from public.coven_ranks where id = (a->>'id')::uuid and coven_id = p_coven) then
        raise exception '%: that position is not one of this coven''s.', p_where;
      end if;
    elsif a->>'kind' = 'user' then
      who := (a->>'id')::uuid;
      if not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = who and status = 'active') then
        raise exception '%: that person is not a member of this coven.', p_where;
      end if;
      if p_parts and (public.coven_unsigned_agreements(p_coven, who) > 0 or public.is_community_banned(who)) then
        raise exception '%: % needs to sign the coven''s current agreements before they can be given a part.', p_where,
          coalesce((select display_name from public.coven_profiles where user_id = who), 'That member');
      end if;
    else
      raise exception '%: choose the whole coven, a position or a person.', p_where;
    end if;
    if not cleaned @> jsonb_build_array(jsonb_build_object('kind', a->>'kind', 'id', a->>'id')) then
      cleaned := cleaned || jsonb_build_array(jsonb_build_object('kind', a->>'kind', 'id', a->>'id'));
    end if;
  end loop;
  return cleaned;
end;
$$;

-- What a step asks of people, checked and cleaned (null when it asks nothing).
create or replace function public.coven_clean_contribution(p jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  kind text := p->>'kind';
  verb text;
  fate text := coalesce(p->>'fate', 'keep');
begin
  if p is null or jsonb_typeof(p) <> 'object' or kind is null then return null; end if;
  verb := case
    when kind in ('petition', 'intention', 'gratitude', 'vow', 'ancestor', 'question', 'reflection') then 'write'
    when kind in ('offering', 'candle') then 'place'
    when kind in ('light_candle', 'libation', 'card') then 'do'
  end;
  if verb is null then raise exception 'Unknown kind of contribution.'; end if;
  if coalesce(p->>'mode', 'each') not in ('one', 'each')
     or coalesce(p->>'timing', 'live') not in ('ahead', 'live')
     or coalesce(p->>'visibility', 'coven') not in ('me', 'leader', 'coven', 'coven_unnamed')
     or fate not in ('keep', 'burn', 'bury', 'release', 'petition') then
    raise exception 'Unknown choice for a contribution.';
  end if;
  if (fate = 'petition' and kind <> 'petition') or (verb <> 'write' and fate <> 'keep') then fate := 'keep'; end if;
  return jsonb_strip_nulls(jsonb_build_object(
    'mode', coalesce(p->>'mode', 'each'), 'kind', kind, 'timing', coalesce(p->>'timing', 'live'),
    'visibility', coalesce(p->>'visibility', 'coven'), 'fate', fate,
    'prompt', nullif(left(btrim(coalesce(p->>'prompt', '')), 280), '')
  ));
end;
$$;

-- A step's items: {key, name, image, category, color?, form?}, pictures only from the altar's own or members' uploads.
create or replace function public.coven_clean_items(p jsonb, p_where text)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  it jsonb;
  cleaned jsonb := '[]'::jsonb;
begin
  if p is null or jsonb_typeof(p) <> 'array' then return '[]'::jsonb; end if;
  if jsonb_array_length(p) > 24 then raise exception '%: choose up to 24 items.', p_where; end if;
  for it in select * from jsonb_array_elements(p) loop
    if coalesce(it->>'key', '') = '' or coalesce(btrim(it->>'name'), '') = '' then continue; end if;
    if not public.coven_altar_picture_ok(it->>'image') then raise exception '%: that picture can''t go on a coven altar.', p_where; end if;
    cleaned := cleaned || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'key', left(it->>'key', 200), 'name', left(btrim(it->>'name'), 120), 'image', coalesce(it->>'image', ''),
      'category', left(coalesce(it->>'category', ''), 40), 'color', left(it->>'color', 20), 'form', left(it->>'form', 40)
    )));
  end loop;
  return cleaned;
end;
$$;

-- The planner: as before, with each step's people, action, items, what it
-- asks of people, and who tends the altar during it.
-- p_steps: [{ id?, title, instructions, spoken_text, duration_minutes, assignees, assigned_user_id, assigned_rank_id,
--             action, items, contribution, altar_action, altar_color, altar_form, altar_image, altar_label,
--             altar_access, altar_tenders }] in order.
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
  who jsonb;
  tenders jsonb;
  access text;
  next_status text := coalesce(p_ritual->>'status', 'scheduled');
  next_when timestamptz := nullif(p_ritual->>'scheduled_for', '')::timestamptz;
  scheduler boolean := public.coven_permission(p_coven, 'schedule') or public.is_community_moderator();
begin
  if not (public.coven_in_good_standing(p_coven) and public.coven_permission(p_coven, 'lead')) and not public.is_community_moderator() then
    raise exception 'Only those who lead the coven''s rituals can plan them.';
  end if;
  if jsonb_typeof(coalesce(p_steps, '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_steps, '[]'::jsonb)) > 60 then
    raise exception 'A ritual can have up to 60 steps.';
  end if;
  if next_status not in ('draft', 'scheduled') then
    raise exception 'A ritual is saved as a draft or as scheduled.';
  end if;

  if p_ritual_id is not null then
    select * into saved from public.coven_rituals where id = p_ritual_id and coven_id = p_coven for update;
    if saved.id is null then raise exception 'That ritual was not found.'; end if;
    if saved.status = 'live' then raise exception 'End the ritual before changing it.'; end if;
  end if;
  if next_status = 'scheduled' and not scheduler
     and not (saved.id is not null and saved.status = 'scheduled' and saved.scheduled_for is not distinct from next_when) then
    raise exception 'Only those the coven''s head has allowed can put rites on the calendar. Save it as a draft for them to schedule.';
  end if;

  if saved.id is null then
    insert into public.coven_rituals (coven_id, title, intention, description, scheduled_for, status, occasion, occasion_name, created_by)
    values (p_coven, btrim(p_ritual->>'title'), nullif(btrim(p_ritual->>'intention'), ''), nullif(btrim(p_ritual->>'description'), ''),
            next_when, next_status, nullif(p_ritual->>'occasion', ''), nullif(btrim(p_ritual->>'occasion_name'), ''), auth.uid())
    returning * into saved;
  else
    update public.coven_rituals
    set title = btrim(p_ritual->>'title'), intention = nullif(btrim(p_ritual->>'intention'), ''),
        description = nullif(btrim(p_ritual->>'description'), ''), scheduled_for = next_when, status = next_status,
        occasion = nullif(p_ritual->>'occasion', ''), occasion_name = nullif(btrim(p_ritual->>'occasion_name'), ''),
        current_step_id = null, started_at = null, ended_at = null, led_by = null, updated_at = now()
    where id = saved.id
    returning * into saved;
  end if;

  for step in select * from jsonb_array_elements(coalesce(p_steps, '[]'::jsonb)) loop
    n := n + 1;
    -- Its people: the list when there is one, otherwise the older one person or position.
    who := public.coven_clean_assignees(p_coven, step->'assignees', 'Step ' || n, true);
    if jsonb_array_length(who) = 0 then
      person := nullif(step->>'assigned_user_id', '')::uuid;
      rank := nullif(step->>'assigned_rank_id', '')::uuid;
      if person is not null and rank is not null then raise exception 'Step %: give it to one person or one position, not both.', n; end if;
      if person is not null then who := jsonb_build_array(jsonb_build_object('kind', 'user', 'id', person));
      elsif rank is not null then who := jsonb_build_array(jsonb_build_object('kind', 'rank', 'id', rank));
      end if;
      who := public.coven_clean_assignees(p_coven, who, 'Step ' || n, true);
    end if;
    -- The older columns stay filled when it's one person or one position, for anything still reading them.
    person := case when jsonb_array_length(who) = 1 and who->0->>'kind' = 'user' then (who->0->>'id')::uuid end;
    rank := case when jsonb_array_length(who) = 1 and who->0->>'kind' = 'rank' then (who->0->>'id')::uuid end;
    access := coalesce(nullif(step->>'altar_access', ''), 'assigned');
    if access not in ('assigned', 'everyone', 'leader', 'chosen') then raise exception 'Step %: unknown choice for who tends the altar.', n; end if;
    tenders := case when access = 'chosen' then public.coven_clean_assignees(p_coven, step->'altar_tenders', 'Step ' || n, false) else '[]'::jsonb end;
    if access = 'chosen' and jsonb_array_length(tenders) = 0 then raise exception 'Step %: choose who tends the altar during it.', n; end if;
    if step->>'altar_action' = 'place_item' and nullif(step->>'altar_image', '') is null
       and jsonb_array_length(public.coven_clean_items(step->'items', 'Step ' || n)) = 0 then
      raise exception 'Step %: choose what is placed on the altar.', n;
    end if;
    step_id := nullif(step->>'id', '')::uuid;
    if step_id is not null and exists (select 1 from public.coven_ritual_steps where id = step_id and ritual_id = saved.id) then
      update public.coven_ritual_steps
      set position = n, title = btrim(step->>'title'), instructions = nullif(btrim(step->>'instructions'), ''),
          spoken_text = nullif(btrim(step->>'spoken_text'), ''), duration_minutes = nullif(step->>'duration_minutes', '')::integer,
          assigned_user_id = person, assigned_rank_id = rank, assignees = who,
          action = nullif(step->>'action', ''), items = public.coven_clean_items(step->'items', 'Step ' || n),
          contribution = public.coven_clean_contribution(step->'contribution'),
          altar_action = nullif(step->>'altar_action', ''), altar_color = nullif(step->>'altar_color', ''),
          altar_form = nullif(step->>'altar_form', ''), altar_image = nullif(step->>'altar_image', ''),
          altar_label = nullif(btrim(step->>'altar_label'), ''), altar_access = access, altar_tenders = tenders,
          started_at = null, completed_at = null, completed_by = null, updated_at = now()
      where id = step_id;
    else
      insert into public.coven_ritual_steps (ritual_id, coven_id, position, title, instructions, spoken_text, duration_minutes,
                                             assigned_user_id, assigned_rank_id, assignees, action, items, contribution,
                                             altar_action, altar_color, altar_form, altar_image, altar_label, altar_access, altar_tenders)
      values (saved.id, p_coven, n, btrim(step->>'title'), nullif(btrim(step->>'instructions'), ''), nullif(btrim(step->>'spoken_text'), ''),
              nullif(step->>'duration_minutes', '')::integer, person, rank, who,
              nullif(step->>'action', ''), public.coven_clean_items(step->'items', 'Step ' || n), public.coven_clean_contribution(step->'contribution'),
              nullif(step->>'altar_action', ''), nullif(step->>'altar_color', ''), nullif(step->>'altar_form', ''),
              nullif(step->>'altar_image', ''), nullif(btrim(step->>'altar_label'), ''), access, tenders)
      returning id into step_id;
    end if;
    kept := array_append(kept, step_id);
  end loop;

  perform public.coven_ritual_prune(saved.id, kept);
  return saved;
end;
$$;

-- The ritual's leader chooses its altar and who tends it during each step
-- (p_access in step order: 'assigned', 'everyone', 'leader' or 'chosen', the
-- last keeping the step's chosen people).
create or replace function public.set_coven_ritual_altar(p_ritual uuid, p_altar uuid, p_access text[])
returns public.coven_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals := public.coven_ritual_leader(p_ritual);
  s record;
  n integer := 0;
begin
  if p_altar is not null and not exists (select 1 from public.coven_altars where id = p_altar and coven_id = r.coven_id) then
    raise exception 'That altar is not one of this coven''s.';
  end if;
  if exists (select 1 from unnest(coalesce(p_access, '{}')) as x where x not in ('assigned', 'everyone', 'leader', 'chosen')) then
    raise exception 'Unknown choice.';
  end if;
  update public.coven_rituals set altar_id = p_altar, updated_at = now() where id = r.id returning * into r;
  if p_access is not null then
    for s in select id, altar_tenders from public.coven_ritual_steps where ritual_id = r.id order by position loop
      n := n + 1;
      if n <= coalesce(array_length(p_access, 1), 0) then
        if p_access[n] = 'chosen' and jsonb_array_length(s.altar_tenders) = 0 then
          raise exception 'Step %: choose who tends the altar in the planner first.', n;
        end if;
        update public.coven_ritual_steps set altar_access = p_access[n], updated_at = now() where id = s.id;
      end if;
    end loop;
  end if;
  return r;
end;
$$;

-- Who may change an altar while a ritual is live on it now includes a step's chosen tenders.
create or replace function public.coven_altar_can_edit(p_altar uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  a public.coven_altars;
  r public.coven_rituals;
  s public.coven_ritual_steps;
begin
  select * into a from public.coven_altars where id = p_altar;
  if a.id is null or a.archived_at is not null or auth.uid() is null or not public.coven_in_good_standing(a.coven_id) then return false; end if;
  r := public.coven_altar_live_ritual(a.id);
  if r.id is not null then
    if public.coven_altar_keeper(a.id) or r.led_by = auth.uid() then return true; end if;
    select * into s from public.coven_ritual_steps where id = r.current_step_id;
    if s.id is null then return false; end if;
    return case s.altar_access
      when 'everyone' then true
      when 'assigned' then public.coven_step_is_mine(s.id)
      when 'chosen' then public.coven_assignees_include(s.coven_id, s.altar_tenders, auth.uid()) and jsonb_array_length(s.altar_tenders) > 0
      else false
    end;
  end if;
  if public.coven_altar_keeper(a.id) then return true; end if;
  if a.locked or a.edit_mode = 'keeper' then return false; end if;
  if a.edit_mode = 'members' or public.coven_permission(a.coven_id, 'tend_altars') then return true; end if;
  return exists (
    select 1
    from public.coven_altar_editors e
    left join public.coven_members m on m.coven_id = a.coven_id and m.user_id = auth.uid() and m.status = 'active'
    where e.altar_id = a.id and e.active and (e.user_id = auth.uid() or (e.rank_id is not null and e.rank_id = m.rank_id))
  );
end;
$$;

create or replace function public.coven_altar_access(p_altar uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  a public.coven_altars;
  r public.coven_rituals;
  s public.coven_ritual_steps;
  can boolean;
  keeper boolean;
  why text := null;
begin
  select * into a from public.coven_altars where id = p_altar;
  if a.id is null or not (public.is_coven_member(a.coven_id) or public.is_community_moderator()) then
    return jsonb_build_object('can_edit', false, 'keeper', false, 'ritual_id', null, 'reason', 'This altar isn''t open to you.');
  end if;
  can := public.coven_altar_can_edit(a.id);
  keeper := public.coven_altar_keeper(a.id);
  r := public.coven_altar_live_ritual(a.id);
  if not can then
    if not public.coven_in_good_standing(a.coven_id) then
      why := 'Sign the coven''s current agreements to tend its altars.';
    elsif r.id is not null then
      select * into s from public.coven_ritual_steps where id = r.current_step_id;
      why := case
        when s.id is null then 'A ritual is under way here. The altar waits for its next step.'
        when s.altar_access = 'leader' then 'A ritual is under way. During this step only its leader tends the altar.'
        when s.altar_access = 'chosen' then 'A ritual is under way. During this step the altar is tended by the people its leader chose.'
        else 'A ritual is under way. During this step the altar is tended by the people whose step it is.'
      end;
    elsif a.locked then
      why := 'This altar is locked by its keeper.';
    elsif a.edit_mode = 'keeper' then
      why := 'Only this altar''s keeper tends it. You can watch it here.';
    else
      why := 'Only the people its keeper has chosen tend this altar. You can watch it here.';
    end if;
  end if;
  return jsonb_build_object('can_edit', can, 'keeper', keeper, 'ritual_id', r.id, 'reason', why);
end;
$$;

-- ---------------------------------------------------------------------------
-- Contributions
-- ---------------------------------------------------------------------------

create table if not exists public.coven_ritual_contributions (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.coven_ritual_steps (id) on delete cascade,
  ritual_id uuid not null references public.coven_rituals (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  -- Its writer (the owner). Hidden from others when anonymous, through coven_ritual_contributions_for.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('petition', 'intention', 'gratitude', 'vow', 'ancestor', 'question', 'reflection', 'offering', 'candle', 'light_candle', 'libation', 'card')),
  -- Written for the coven (the step asks one person for the coven) rather than for themselves.
  for_coven boolean not null default false,
  body text check (body is null or char_length(body) <= 2000),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array' and octet_length(items::text) <= 8000),
  -- Sealed: it takes part, but no one else (the leaders too) reads it.
  private boolean not null default false,
  -- No one else sees whose it is.
  anonymous boolean not null default false,
  -- Copied from the step when written, so a later change to the plan doesn't open it up.
  visibility text not null check (visibility in ('me', 'leader', 'coven', 'coven_unnamed')),
  fate text not null default 'keep' check (fate in ('keep', 'burn', 'bury', 'release', 'petition')),
  status text not null default 'written' check (status in ('written', 'offered', 'burned', 'buried', 'released', 'held', 'answered', 'closed')),
  -- The coven petition it became, if it did.
  petition_id uuid references public.coven_petitions (id) on delete set null,
  outcome_note text check (outcome_note is null or char_length(outcome_note) <= 1000),
  offered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists coven_ritual_contributions_one_each on public.coven_ritual_contributions (step_id, user_id);
create index if not exists coven_ritual_contributions_ritual_idx on public.coven_ritual_contributions (ritual_id, step_id);
create index if not exists coven_ritual_contributions_owner_idx on public.coven_ritual_contributions (user_id, status);

-- Others holding it for its writer: a candle lit for it, or "holding this for you".
create table if not exists public.coven_ritual_contribution_supports (
  contribution_id uuid not null references public.coven_ritual_contributions (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('candle', 'holding')),
  created_at timestamptz not null default now(),
  primary key (contribution_id, user_id, kind)
);

-- Who, beyond the coven's head, sees participation (the head chooses).
create table if not exists public.coven_ritual_settings (
  coven_id uuid primary key references public.covens (id) on delete cascade,
  participation_viewers jsonb not null default '[]'::jsonb check (jsonb_typeof(participation_viewers) = 'array' and jsonb_array_length(participation_viewers) <= 40),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.coven_ritual_contributions enable row level security;
alter table public.coven_ritual_contribution_supports enable row level security;
alter table public.coven_ritual_settings enable row level security;

-- Read directly: only your own. Everyone else's come through
-- coven_ritual_contributions_for, which seals and unnames as it should.
drop policy if exists "People read their own contributions" on public.coven_ritual_contributions;
create policy "People read their own contributions" on public.coven_ritual_contributions
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "People see their own support" on public.coven_ritual_contribution_supports;
create policy "People see their own support" on public.coven_ritual_contribution_supports
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Members and moderators see the coven's ritual settings" on public.coven_ritual_settings;
create policy "Members and moderators see the coven's ritual settings" on public.coven_ritual_settings
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());

-- Whether the caller leads the coven's rituals (for 'leader' visibility).
create or replace function public.coven_ritual_reader_leads(p_coven uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.coven_permission(p_coven, 'lead');
$$;

-- A ritual's contributions as the caller may see them: their own whole;
-- others' only when the step lets them (the whole coven, or the leaders),
-- sealed (no words, no items) when private, and without a name when anonymous
-- or the step reads without names. 'Only the writer' ones aren't listed at all.
-- Who holds a contribution is given only to its writer.
create or replace function public.coven_ritual_contributions_for(p_ritual uuid)
returns table (
  id uuid, ritual_id uuid, step_id uuid, coven_id uuid, user_id uuid, mine boolean, kind text, for_coven boolean,
  body text, items jsonb, private boolean, anonymous boolean, visibility text, fate text, status text,
  petition_id uuid, outcome_note text, support_count integer, supported_by_me boolean, supporters uuid[],
  created_at timestamptz, updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  member boolean;
  leads boolean;
begin
  select * into r from public.coven_rituals where coven_rituals.id = p_ritual;
  if r.id is null then return; end if;
  member := public.is_coven_member(r.coven_id) or public.is_community_moderator();
  if not member then return; end if;
  leads := public.coven_ritual_reader_leads(r.coven_id);
  return query
    select c.id, c.ritual_id, c.step_id, c.coven_id,
           case when c.user_id = auth.uid() or (not c.anonymous and c.visibility <> 'coven_unnamed') then c.user_id end,
           c.user_id = auth.uid(), c.kind, c.for_coven,
           case when c.user_id = auth.uid() or not c.private then c.body end,
           case when c.user_id = auth.uid() or not c.private then c.items else '[]'::jsonb end,
           c.private, c.anonymous or c.visibility = 'coven_unnamed', c.visibility, c.fate, c.status,
           c.petition_id, case when c.user_id = auth.uid() or not c.private then c.outcome_note end,
           (select count(*)::integer from public.coven_ritual_contribution_supports x where x.contribution_id = c.id),
           exists (select 1 from public.coven_ritual_contribution_supports x where x.contribution_id = c.id and x.user_id = auth.uid()),
           case when c.user_id = auth.uid() then (select array_agg(distinct x.user_id) from public.coven_ritual_contribution_supports x where x.contribution_id = c.id) end,
           c.created_at, c.updated_at
    from public.coven_ritual_contributions c
    where c.ritual_id = r.id
      and (
        c.user_id = auth.uid()
        or (c.visibility in ('coven', 'coven_unnamed'))
        or (c.visibility = 'leader' and leads)
      )
    order by c.created_at;
end;
$$;

-- Write (or rewrite) your contribution to a step, before it is offered.
-- Each person their own; or, when the step asks one person for the coven,
-- whoever writes first (or the ritual's leader, if no one has).
create or replace function public.save_coven_ritual_contribution(p_step uuid, p_body text, p_items jsonb default '[]'::jsonb, p_private boolean default false, p_anonymous boolean default false)
returns public.coven_ritual_contributions
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.coven_ritual_steps;
  r public.coven_rituals;
  ask jsonb;
  saved public.coven_ritual_contributions;
  leads boolean;
begin
  select * into s from public.coven_ritual_steps where id = p_step;
  if s.id is null or s.contribution is null then raise exception 'That step doesn''t ask for anything.'; end if;
  ask := s.contribution;
  select * into r from public.coven_rituals where id = s.ritual_id;
  if not public.coven_in_good_standing(s.coven_id) then
    raise exception 'You need to be a member in good standing (with the agreements signed) to take part.';
  end if;
  leads := public.coven_permission(s.coven_id, 'lead');
  if not (public.coven_step_is_mine(s.id) or (ask->>'mode' = 'one' and leads)) then
    raise exception 'This step asks someone else.';
  end if;
  if ask->>'timing' = 'ahead' then
    if r.status not in ('scheduled', 'live') then raise exception 'This rite isn''t on the calendar yet.'; end if;
    if r.status = 'live' and exists (select 1 from public.coven_ritual_steps p where p.ritual_id = r.id and p.id = s.id and p.completed_at is not null) then
      raise exception 'That step has passed.';
    end if;
  elsif r.status <> 'live' or r.current_step_id is distinct from s.id then
    raise exception 'This is done when the step comes.';
  end if;
  if ask->>'mode' = 'one' and exists (select 1 from public.coven_ritual_contributions where step_id = s.id and user_id <> auth.uid()) then
    raise exception 'Someone has already done this for the coven.';
  end if;
  if char_length(coalesce(p_body, '')) > 2000 then raise exception 'Keep it under 2,000 characters.'; end if;
  insert into public.coven_ritual_contributions (step_id, ritual_id, coven_id, user_id, kind, for_coven, body, items, private, anonymous, visibility, fate)
  values (s.id, s.ritual_id, s.coven_id, auth.uid(), ask->>'kind', ask->>'mode' = 'one', nullif(btrim(p_body), ''),
          public.coven_clean_items(p_items, 'Your contribution'), coalesce(p_private, false),
          coalesce(p_anonymous, false) or ask->>'visibility' = 'coven_unnamed', ask->>'visibility', coalesce(ask->>'fate', 'keep'))
  on conflict (step_id, user_id) do update
    set body = excluded.body, items = excluded.items, private = excluded.private, anonymous = excluded.anonymous, updated_at = now()
    where public.coven_ritual_contributions.status = 'written'
  returning * into saved;
  if saved.id is null then raise exception 'You''ve offered this already.'; end if;
  return saved;
end;
$$;

-- Take back your contribution before it is offered.
create or replace function public.remove_coven_ritual_contribution(p_contribution uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.coven_ritual_contributions where id = p_contribution and user_id = auth.uid() and status = 'written';
  return found;
end;
$$;

-- A written petition becoming a coven petition, in its writer's name, with
-- an altar of its own (as ask_coven_petition makes). Held among the ritual's
-- contributions instead when it's sealed or nameless (a coven petition is read
-- by the whole coven), or the writer already has three petitions held.
create or replace function public.coven_contribution_to_petition(p_contribution uuid)
returns public.coven_ritual_contributions
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.coven_ritual_contributions;
  r public.coven_rituals;
  p public.coven_petitions;
  scene public.coven_altars;
  altar uuid;
  title text;
begin
  select * into c from public.coven_ritual_contributions where id = p_contribution for update;
  if c.id is null or c.fate <> 'petition' or c.petition_id is not null then return c; end if;
  if c.private or c.anonymous or c.visibility <> 'coven' or coalesce(btrim(c.body), '') = ''
     or (select count(*) from public.coven_petitions where coven_id = c.coven_id and user_id = c.user_id and status = 'open') >= 3 then
    update public.coven_ritual_contributions set status = 'held', updated_at = now() where id = c.id returning * into c;
    return c;
  end if;
  select * into r from public.coven_rituals where id = c.ritual_id;
  title := left(btrim(split_part(btrim(c.body), E'\n', 1)), 120);
  insert into public.coven_petitions (coven_id, user_id, title, body, color, source_ritual_id, source_step_id)
  values (c.coven_id, c.user_id, title, case when char_length(btrim(c.body)) > char_length(title) then left(btrim(c.body), 2000) end, 'white', c.ritual_id, c.step_id)
  returning * into p;
  select * into scene from public.coven_altars where coven_id = c.coven_id and is_main;
  perform set_config('coven.altar_keeper', 'on', true);
  insert into public.coven_altars (coven_id, name, is_main, edit_mode, created_by, background, background_name, extra)
  values (c.coven_id, left('Petition: ' || title, 80), false, 'members', c.user_id,
          coalesce(scene.background, ''), coalesce(scene.background_name, ''), jsonb_build_object('petition_id', p.id))
  returning id into altar;
  perform set_config('coven.altar_keeper', 'off', true);
  update public.coven_petitions set altar_id = altar where id = p.id;
  update public.coven_ritual_contributions set status = 'held', petition_id = p.id, updated_at = now() where id = c.id returning * into c;
  return c;
end;
$$;

-- Offer your contribution when its step comes (whatever you wrote ahead, or
-- now). A petition meant for the coven becomes one. Returns the contribution
-- and the petition, if one was made (the page sets its candle and paper).
create or replace function public.offer_coven_ritual_contribution(p_contribution uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.coven_ritual_contributions;
  r public.coven_rituals;
begin
  select * into c from public.coven_ritual_contributions where id = p_contribution and user_id = auth.uid() for update;
  if c.id is null then raise exception 'That contribution was not found.'; end if;
  if c.status <> 'written' then return jsonb_build_object('contribution', to_jsonb(c), 'petition', null); end if;
  select * into r from public.coven_rituals where id = c.ritual_id;
  if r.status <> 'live' or r.current_step_id is distinct from c.step_id then raise exception 'Offer it when its step comes.'; end if;
  if not public.coven_in_good_standing(c.coven_id) then raise exception 'You need to be a member in good standing to take part.'; end if;
  update public.coven_ritual_contributions set status = 'offered', offered_at = now(), updated_at = now() where id = c.id returning * into c;
  if c.fate = 'petition' then c := public.coven_contribution_to_petition(c.id); end if;
  return jsonb_build_object('contribution', to_jsonb(c),
    'petition', (select to_jsonb(p) from public.coven_petitions p where p.id = c.petition_id));
end;
$$;

-- Hold someone else's contribution for them, without reading it: a candle
-- lit for it, or "holding this for you" (p_on false takes it back). Only its
-- writer sees who.
create or replace function public.support_coven_ritual_contribution(p_contribution uuid, p_kind text, p_on boolean default true)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.coven_ritual_contributions;
begin
  select * into c from public.coven_ritual_contributions where id = p_contribution;
  if c.id is null then raise exception 'That contribution was not found.'; end if;
  if c.user_id = auth.uid() then raise exception 'This one is yours.'; end if;
  if p_kind not in ('candle', 'holding') then raise exception 'Unknown choice.'; end if;
  if not public.coven_in_good_standing(c.coven_id) then raise exception 'You need to be a member in good standing to hold it.'; end if;
  if not (c.visibility in ('coven', 'coven_unnamed') or (c.visibility = 'leader' and public.coven_permission(c.coven_id, 'lead'))) then
    raise exception 'That contribution was not found.';
  end if;
  if c.status not in ('written', 'offered', 'held') then raise exception 'That isn''t being held any more.'; end if;
  if public.coven_blocked_between(auth.uid(), c.user_id) then raise exception 'You can''t do that here.'; end if;
  if coalesce(p_on, true) then
    insert into public.coven_ritual_contribution_supports (contribution_id, coven_id, user_id, kind)
    values (c.id, c.coven_id, auth.uid(), p_kind) on conflict do nothing;
  else
    delete from public.coven_ritual_contribution_supports where contribution_id = c.id and user_id = auth.uid() and kind = p_kind;
  end if;
  return (select count(*)::integer from public.coven_ritual_contribution_supports where contribution_id = c.id);
end;
$$;

-- Only its writer tends it after the ritual: keeps holding it ('held'),
-- marks it answered or closes it, with a note.
create or replace function public.tend_coven_ritual_contribution(p_contribution uuid, p_status text, p_note text default null)
returns public.coven_ritual_contributions
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.coven_ritual_contributions;
begin
  select * into c from public.coven_ritual_contributions where id = p_contribution and user_id = auth.uid() for update;
  if c.id is null then raise exception 'Only the person who wrote it tends it.'; end if;
  if p_status not in ('held', 'answered', 'closed') then raise exception 'Unknown choice.'; end if;
  if p_status = 'held' and c.status not in ('written', 'offered', 'held') then raise exception 'That has been let go already.'; end if;
  update public.coven_ritual_contributions
  set status = p_status, outcome_note = coalesce(nullif(btrim(p_note), ''), outcome_note), updated_at = now()
  where id = c.id returning * into c;
  return c;
end;
$$;

-- Offered papers meant for burning, burying or releasing, let go.
create or replace function public.coven_ritual_release_papers(p_ritual uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  changed integer;
begin
  update public.coven_ritual_contributions
  set status = case fate when 'burn' then 'burned' when 'bury' then 'buried' else 'released' end, updated_at = now()
  where ritual_id = p_ritual and status = 'offered' and fate in ('burn', 'bury', 'release');
  get diagnostics changed = row_count;
  return changed;
end;
$$;

-- Moving a live ritual on: whatever was written ahead for the step just
-- left is offered with it (a petition meant for the coven becomes one); at
-- the end, papers still waiting to be let go are.
create or replace function public.coven_ritual_move(p_ritual uuid, p_step uuid)
returns public.coven_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  c record;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.current_step_id is not null then
    for c in
      update public.coven_ritual_contributions set status = 'offered', offered_at = now(), updated_at = now()
      where step_id = r.current_step_id and status = 'written'
      returning id, fate
    loop
      if c.fate = 'petition' then perform public.coven_contribution_to_petition(c.id); end if;
    end loop;
  end if;
  if p_step is null then
    perform public.coven_ritual_release_papers(p_ritual);
    update public.coven_rituals set status = 'done', current_step_id = null, ended_at = now(), updated_at = now()
    where id = p_ritual returning * into r;
  else
    update public.coven_ritual_steps set started_at = now(), completed_at = null, completed_by = null, updated_at = now() where id = p_step;
    update public.coven_rituals set current_step_id = p_step, updated_at = now() where id = p_ritual returning * into r;
  end if;
  return r;
end;
$$;

-- Do the current step's altar action. The older four as before (each
-- person's candle or offering marked once); releasing the papers lets go of
-- those meant for burning, burying or releasing.
create or replace function public.perform_coven_step_action(p_step uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.coven_ritual_steps;
  r public.coven_rituals;
  lit_count integer;
  angle double precision;
  item public.coven_altar_items;
  person text;
  changed integer;
  picture text;
begin
  select * into s from public.coven_ritual_steps where id = p_step;
  if s.id is null or s.altar_action is null then raise exception 'That step has nothing to do on the altar.'; end if;
  select * into r from public.coven_rituals where id = s.ritual_id;
  if r.status <> 'live' or r.current_step_id is distinct from s.id then raise exception 'That step isn''t the one under way.'; end if;
  if not (
    (public.coven_in_good_standing(s.coven_id) and (public.coven_step_is_mine(s.id) or public.coven_permission(s.coven_id, 'lead')))
    or public.is_community_moderator()
  ) then
    raise exception 'This step belongs to someone else.';
  end if;

  if s.altar_action = 'release_papers' then
    changed := public.coven_ritual_release_papers(r.id);
    return jsonb_build_object('action', s.altar_action, 'count', changed);
  elsif s.altar_action in ('light_candle', 'place_item') then
    if exists (select 1 from public.coven_ritual_step_marks where step_id = s.id and user_id = auth.uid()) then
      raise exception 'You have already done this on the altar.';
    end if;
    picture := coalesce(nullif(s.altar_image, ''), (select nullif(x->>'image', '') from jsonb_array_elements(s.items) x limit 1));
    select count(*) into lit_count from public.coven_ritual_step_marks where ritual_id = r.id;
    angle := -pi() / 2 + (lit_count % 12) * (2 * pi() / 12);
    select coalesce(display_name, 'A member') into person from public.coven_profiles where user_id = auth.uid();
    -- The older shared altar (coven_altar_items) still gets its picture, for pages that show it.
    if s.altar_action = 'light_candle' or picture is not null then
      insert into public.coven_altar_items (coven_id, kind, image, label, intention, x, y, scale, lit, burn_minutes, z)
      values (
        s.coven_id,
        case when s.altar_action = 'light_candle' then 'candle' else 'object' end,
        case when s.altar_action = 'light_candle' then public.coven_candle_image(s.altar_color, s.altar_form) else picture end,
        left(coalesce(s.altar_label, case when s.altar_action = 'light_candle' then coalesce(person, 'A member') || '’s candle' else 'Offering' end), 80),
        left(r.title || ' · ' || s.title, 280),
        greatest(0.05, least(0.95, 0.5 + (0.36 - 0.07 * (lit_count / 12)) * cos(angle))),
        greatest(0.2, least(0.95, 0.66 + (0.2 - 0.04 * (lit_count / 12)) * sin(angle))),
        case when s.altar_action = 'light_candle' then 0.8 else 1 end,
        s.altar_action = 'light_candle',
        120,
        10 + lit_count
      )
      returning * into item;
    end if;
    insert into public.coven_ritual_step_marks (step_id, ritual_id, coven_id, user_id, item_id)
    values (s.id, r.id, s.coven_id, auth.uid(), item.id);
    return jsonb_build_object('action', s.altar_action, 'item_id', item.id);
  elsif s.altar_action = 'light_all' then
    update public.coven_altar_items set lit = true where coven_id = s.coven_id and kind = 'candle' and not lit;
    get diagnostics changed = row_count;
    return jsonb_build_object('action', s.altar_action, 'count', changed);
  else
    update public.coven_altar_items set lit = false where coven_id = s.coven_id and kind = 'candle' and lit;
    get diagnostics changed = row_count;
    return jsonb_build_object('action', s.altar_action, 'count', changed);
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Participation
-- ---------------------------------------------------------------------------

-- Whether the caller sees participation: the coven's head always (and the
-- site's moderators); otherwise the positions and people the head chose.
create or replace function public.coven_sees_participation(p_coven uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_community_moderator()
    or exists (select 1 from public.covens c where c.id = p_coven and c.founder_id = auth.uid() and public.is_coven_member(p_coven))
    or exists (
      select 1 from public.coven_ritual_settings st
      where st.coven_id = p_coven and jsonb_array_length(st.participation_viewers) > 0
        and public.coven_assignees_include(p_coven, st.participation_viewers, auth.uid())
    );
$$;

-- For each step of a ritual that asks something: how many are asked, how
-- many have done it, and (for those who see participation) who has and who
-- hasn't. Never what anyone wrote. Others in the coven learn only whether a
-- one-person-for-the-coven step has been done (so no one writes it twice,
-- and the leader can step in).
create or replace function public.coven_ritual_participation(p_ritual uuid)
returns table (step_id uuid, expected integer, done integer, done_users uuid[], waiting_users uuid[])
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  sees boolean;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or not (public.is_coven_member(r.coven_id) or public.is_community_moderator()) then return; end if;
  sees := public.coven_sees_participation(r.coven_id);
  return query
    with asked as (
      select s.id as sid, s.contribution->>'mode' as mode, m.user_id as uid
      from public.coven_ritual_steps s
      join public.coven_members m on m.coven_id = s.coven_id and m.status = 'active'
      where s.ritual_id = r.id and s.contribution is not null and public.coven_step_for(s.id, m.user_id)
    ),
    wrote as (
      select distinct c.step_id as sid, c.user_id as uid from public.coven_ritual_contributions c where c.ritual_id = r.id
    )
    select s.id,
           (select count(*)::integer from asked a where a.sid = s.id),
           case when s.contribution->>'mode' = 'one'
             then (select count(*)::integer from wrote w where w.sid = s.id)
             else (select count(*)::integer from wrote w join asked a on a.sid = w.sid and a.uid = w.uid where w.sid = s.id) end,
           case when sees then (select array_agg(w.uid) from wrote w where w.sid = s.id) end,
           case when sees then (select array_agg(a.uid) from asked a where a.sid = s.id and not exists (select 1 from wrote w where w.sid = s.id and w.uid = a.uid)) end
    from public.coven_ritual_steps s
    where s.ritual_id = r.id and s.contribution is not null
      and (sees or s.contribution->>'mode' = 'one')
    order by s.position;
end;
$$;

-- The coven's head chooses who else sees participation (positions and people).
create or replace function public.set_coven_participation_viewers(p_coven uuid, p_viewers jsonb)
returns public.coven_ritual_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_ritual_settings;
  viewers jsonb;
begin
  if not (exists (select 1 from public.covens where id = p_coven and founder_id = auth.uid()) and public.coven_in_good_standing(p_coven))
     and not public.is_community_moderator() then
    raise exception 'Only the coven''s head chooses who sees participation.';
  end if;
  viewers := public.coven_clean_assignees(p_coven, p_viewers, 'Who sees participation', false);
  insert into public.coven_ritual_settings (coven_id, participation_viewers, updated_by, updated_at)
  values (p_coven, viewers, auth.uid(), now())
  on conflict (coven_id) do update set participation_viewers = excluded.participation_viewers, updated_by = auth.uid(), updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may call what, and live updates
-- ---------------------------------------------------------------------------

revoke execute on function
  public.coven_step_for(uuid, uuid),
  public.coven_clean_assignees(uuid, jsonb, text, boolean),
  public.coven_contribution_to_petition(uuid),
  public.coven_ritual_release_papers(uuid),
  public.coven_ritual_move(uuid, uuid),
  public.coven_ritual_reader_leads(uuid)
from public, anon, authenticated;
revoke execute on function
  public.coven_assignees_include(uuid, jsonb, uuid),
  public.coven_clean_contribution(jsonb),
  public.coven_clean_items(jsonb, text),
  public.coven_step_is_mine(uuid),
  public.save_coven_ritual(uuid, uuid, jsonb, jsonb),
  public.set_coven_ritual_altar(uuid, uuid, text[]),
  public.coven_altar_can_edit(uuid),
  public.coven_altar_access(uuid),
  public.perform_coven_step_action(uuid),
  public.coven_ritual_contributions_for(uuid),
  public.save_coven_ritual_contribution(uuid, text, jsonb, boolean, boolean),
  public.remove_coven_ritual_contribution(uuid),
  public.offer_coven_ritual_contribution(uuid),
  public.support_coven_ritual_contribution(uuid, text, boolean),
  public.tend_coven_ritual_contribution(uuid, text, text),
  public.coven_sees_participation(uuid),
  public.coven_ritual_participation(uuid),
  public.set_coven_participation_viewers(uuid, jsonb)
from public, anon;
grant execute on function
  public.coven_assignees_include(uuid, jsonb, uuid),
  public.coven_clean_contribution(jsonb),
  public.coven_clean_items(jsonb, text),
  public.coven_step_is_mine(uuid),
  public.save_coven_ritual(uuid, uuid, jsonb, jsonb),
  public.set_coven_ritual_altar(uuid, uuid, text[]),
  public.coven_altar_can_edit(uuid),
  public.coven_altar_access(uuid),
  public.perform_coven_step_action(uuid),
  public.coven_ritual_contributions_for(uuid),
  public.save_coven_ritual_contribution(uuid, text, jsonb, boolean, boolean),
  public.remove_coven_ritual_contribution(uuid),
  public.offer_coven_ritual_contribution(uuid),
  public.support_coven_ritual_contribution(uuid, text, boolean),
  public.tend_coven_ritual_contribution(uuid, text, text),
  public.coven_sees_participation(uuid),
  public.coven_ritual_participation(uuid),
  public.set_coven_participation_viewers(uuid, jsonb)
to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    -- Each person hears only their own (the table is read by its owner alone).
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_ritual_contributions') then
      alter publication supabase_realtime add table public.coven_ritual_contributions;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_ritual_settings') then
      alter publication supabase_realtime add table public.coven_ritual_settings;
    end if;
  end if;
end;
$$;
