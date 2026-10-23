-- Applied to sandspod-dev on 2026-10-23 (by SQL; the migration tool timed out).
-- Coven rituals: rituals a coven performs together, whose steps are each
-- assigned to a member, to everyone holding a position, or to the whole
-- coven. When the ritual is run, the current step is shared live, and it
-- shows its full instructions to whoever the step belongs to; they (or the
-- ritual's leader) mark it done and the ritual moves on.
--
-- Who leads: the founder, positions that lead (can_manage) or moderate the
-- coven, and positions given can_lead_rituals. Members see their coven's
-- rituals; site moderators see every coven's. All changes go through the
-- functions below, so a ritual and its steps always change together.

alter table public.coven_ranks add column if not exists can_lead_rituals boolean not null default false;

-- 'lead' joins the permissions coven_permission answers.
create or replace function public.coven_permission(target uuid, permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.coven_members m
    join public.covens c on c.id = m.coven_id
    left join public.coven_ranks r on r.id = m.rank_id
    where m.coven_id = target
      and m.user_id = auth.uid()
      and m.status = 'active'
      and c.status = 'active'
      and (
        c.founder_id = auth.uid()
        or case permission
          when 'member' then true
          when 'manage' then coalesce(r.can_manage, false)
          when 'review' then coalesce(r.can_review or r.can_manage, false)
          when 'moderate' then coalesce(r.can_moderate or r.can_manage, false)
          when 'lead' then coalesce(r.can_lead_rituals or r.can_moderate or r.can_manage, false)
          else false
        end
      )
  );
$$;

create table if not exists public.coven_rituals (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  intention text check (intention is null or char_length(intention) <= 500),
  description text check (description is null or char_length(description) <= 4000),
  scheduled_for timestamptz,
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'live', 'done', 'cancelled')),
  current_step_id uuid,
  started_at timestamptz,
  ended_at timestamptz,
  led_by uuid references auth.users (id) on delete set null,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_rituals_coven_idx on public.coven_rituals (coven_id, status, scheduled_for);

create table if not exists public.coven_ritual_steps (
  id uuid primary key default gen_random_uuid(),
  ritual_id uuid not null references public.coven_rituals (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  position integer not null default 0,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  instructions text check (instructions is null or char_length(instructions) <= 4000),
  spoken_text text check (spoken_text is null or char_length(spoken_text) <= 4000),
  duration_minutes integer check (duration_minutes is null or duration_minutes between 0 and 240),
  -- Neither set: the step is the whole coven's.
  assigned_user_id uuid references auth.users (id) on delete set null,
  assigned_rank_id uuid references public.coven_ranks (id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  completed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (assigned_user_id is null or assigned_rank_id is null)
);

create index if not exists coven_ritual_steps_ritual_idx on public.coven_ritual_steps (ritual_id, position);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'coven_rituals_current_step_fk') then
    alter table public.coven_rituals add constraint coven_rituals_current_step_fk
      foreign key (current_step_id) references public.coven_ritual_steps (id) on delete set null;
  end if;
end;
$$;

alter table public.coven_rituals enable row level security;
alter table public.coven_ritual_steps enable row level security;

create policy "Members and moderators see coven rituals" on public.coven_rituals
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());
create policy "Members and moderators see ritual steps" on public.coven_ritual_steps
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());

-- Is this step this person's? Theirs by name, by their position, or the whole coven's.
create or replace function public.coven_step_is_mine(p_step uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.coven_ritual_steps s
    join public.coven_members m on m.coven_id = s.coven_id and m.user_id = auth.uid() and m.status = 'active'
    where s.id = p_step
      and (
        s.assigned_user_id = auth.uid()
        or (s.assigned_rank_id is not null and s.assigned_rank_id = m.rank_id)
        or (s.assigned_user_id is null and s.assigned_rank_id is null)
      )
  );
$$;

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

create or replace function public.coven_ritual_prune(p_ritual uuid, p_kept uuid[])
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.coven_ritual_steps where ritual_id = p_ritual and id <> all (coalesce(p_kept, '{}'));
$$;

create or replace function public.coven_ritual_remove(p_ritual uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.coven_rituals where id = p_ritual;
$$;

create or replace function public.coven_ritual_leader(p_ritual uuid)
returns public.coven_rituals
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null then raise exception 'That ritual was not found.'; end if;
  if not (public.coven_in_good_standing(r.coven_id) and public.coven_permission(r.coven_id, 'lead')) and not public.is_community_moderator() then
    raise exception 'Only those who lead the coven''s rituals can do that.';
  end if;
  return r;
end;
$$;

-- Move a live ritual to a step (null ends it). Used by start, finish-step and go-to.
create or replace function public.coven_ritual_move(p_ritual uuid, p_step uuid)
returns public.coven_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
begin
  if p_step is null then
    update public.coven_rituals set status = 'done', current_step_id = null, ended_at = now(), updated_at = now()
    where id = p_ritual returning * into r;
  else
    update public.coven_ritual_steps set started_at = now(), completed_at = null, completed_by = null, updated_at = now() where id = p_step;
    update public.coven_rituals set current_step_id = p_step, updated_at = now() where id = p_ritual returning * into r;
  end if;
  return r;
end;
$$;

create or replace function public.start_coven_ritual(p_ritual uuid)
returns public.coven_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals := public.coven_ritual_leader(p_ritual);
  first_step uuid;
begin
  if r.status = 'live' then return r; end if;
  if r.status = 'cancelled' then raise exception 'That ritual was cancelled.'; end if;
  if exists (select 1 from public.coven_rituals where coven_id = r.coven_id and status = 'live' and id <> r.id) then
    raise exception 'Another of the coven''s rituals is under way. End it first.';
  end if;
  select id into first_step from public.coven_ritual_steps where ritual_id = r.id order by position limit 1;
  if first_step is null then raise exception 'Add a step before starting the ritual.'; end if;
  update public.coven_ritual_steps set started_at = null, completed_at = null, completed_by = null where ritual_id = r.id;
  update public.coven_rituals set status = 'live', started_at = now(), ended_at = null, led_by = auth.uid() where id = r.id;
  return public.coven_ritual_move(r.id, first_step);
end;
$$;

-- The person a step belongs to (or the ritual's leader) finishes it; the ritual moves on.
create or replace function public.finish_coven_ritual_step(p_step uuid)
returns public.coven_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.coven_ritual_steps;
  r public.coven_rituals;
  next_step uuid;
begin
  select * into s from public.coven_ritual_steps where id = p_step;
  if s.id is null then raise exception 'That step was not found.'; end if;
  select * into r from public.coven_rituals where id = s.ritual_id for update;
  if r.status <> 'live' or r.current_step_id is distinct from s.id then
    raise exception 'That step isn''t the one under way.';
  end if;
  if not (
    (public.coven_in_good_standing(s.coven_id) and (public.coven_step_is_mine(s.id) or public.coven_permission(s.coven_id, 'lead')))
    or public.is_community_moderator()
  ) then
    raise exception 'This step belongs to someone else.';
  end if;
  update public.coven_ritual_steps set completed_at = now(), completed_by = auth.uid(), updated_at = now() where id = s.id;
  select id into next_step from public.coven_ritual_steps where ritual_id = r.id and position > s.position order by position limit 1;
  return public.coven_ritual_move(r.id, next_step);
end;
$$;

-- The leader jumps to a step (to repeat or skip one), or ends the ritual (p_step null).
create or replace function public.go_to_coven_ritual_step(p_ritual uuid, p_step uuid)
returns public.coven_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals := public.coven_ritual_leader(p_ritual);
begin
  if r.status <> 'live' then raise exception 'The ritual isn''t under way.'; end if;
  if p_step is not null and not exists (select 1 from public.coven_ritual_steps where id = p_step and ritual_id = r.id) then
    raise exception 'That step isn''t part of this ritual.';
  end if;
  return public.coven_ritual_move(r.id, p_step);
end;
$$;

-- Draft, schedule or cancel a ritual that isn't under way; or delete it.
create or replace function public.set_coven_ritual_status(p_ritual uuid, p_status text)
returns public.coven_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals := public.coven_ritual_leader(p_ritual);
begin
  if p_status = 'deleted' then
    if r.status = 'live' then raise exception 'End the ritual before deleting it.'; end if;
    perform public.coven_ritual_remove(r.id);
    return r;
  end if;
  if p_status not in ('draft', 'scheduled', 'cancelled') then raise exception 'Unknown ritual status.'; end if;
  if r.status = 'live' then raise exception 'End the ritual first.'; end if;
  update public.coven_rituals set status = p_status, current_step_id = null, updated_at = now() where id = r.id returning * into r;
  return r;
end;
$$;

-- The helpers are called only by the functions above.
revoke execute on function public.coven_ritual_leader(uuid), public.coven_ritual_move(uuid, uuid), public.coven_ritual_prune(uuid, uuid[]), public.coven_ritual_remove(uuid) from public, anon, authenticated;
revoke execute on function
  public.coven_step_is_mine(uuid),
  public.save_coven_ritual(uuid, uuid, jsonb, jsonb),
  public.start_coven_ritual(uuid),
  public.finish_coven_ritual_step(uuid),
  public.go_to_coven_ritual_step(uuid, uuid),
  public.set_coven_ritual_status(uuid, text)
from public, anon;
grant execute on function
  public.coven_step_is_mine(uuid),
  public.save_coven_ritual(uuid, uuid, jsonb, jsonb),
  public.start_coven_ritual(uuid),
  public.finish_coven_ritual_step(uuid),
  public.go_to_coven_ritual_step(uuid, uuid),
  public.set_coven_ritual_status(uuid, text)
to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_rituals') then
      alter publication supabase_realtime add table public.coven_rituals;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_ritual_steps') then
      alter publication supabase_realtime add table public.coven_ritual_steps;
    end if;
  end if;
end;
$$;
