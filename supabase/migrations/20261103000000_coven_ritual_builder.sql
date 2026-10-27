-- NOT YET APPLIED. Needs 20261101000000_coven_ritual_contributions.sql and
-- 20261102000000_coven_member_record.sql first.
--
-- The coven ritual builder (app: lib/covens/builder.ts, fields.ts,
-- templates.ts, script.ts; website: covens/coven/builder.js). Additive: new
-- columns with defaults, new tables, and new versions of functions that take
-- what they took before and more, so rituals planned with the earlier planner
-- (and pages that haven't updated) keep working.
--
-- * Gatherings: a ritual is a rite or a meeting (kind), and keeps its plan:
--   the sections the coven names and orders, the roles it casts once for the
--   whole gathering, a checklist for before, and what happens afterwards.
-- * Steps: each sits in a section, can be for roles (whoever is cast in them;
--   save_coven_ritual turns roles into the step's people, so every check that
--   asks "is this step mine?" works as before, and recasting a role moves its
--   steps on the next save), has a turn mode (together, one at a time, those
--   named only, one on behalf of all) and details (the values of its fields,
--   who was chosen, a linked page of the coven's Book, the coven's own
--   action). A one-at-a-time step keeps whose turn it is (turn_order,
--   turn_at); a vote keeps its result (outcome).
-- * Votes: those the step names (by role, position or person; everyone when
--   none) vote once each, while the vote is under way. An open ballot shows
--   who voted how; a secret one only the totals, and only once it closes.
-- * The checklist: each person ticks what they've done before the rite; the
--   coven's head and those the head chooses see who has (as participation).
-- * Afterwards: the altar can be left untouched for some hours after the rite
--   (no one tends or clears it, its keepers included, until the time is up or
--   a keeper or ritual leader ends it early). Papers can be left on the altar.
-- * The record: when a gathering ends, who was there, the steps as they
--   happened, how many took part in what (never what anyone wrote) and its
--   votes are kept; its leader adds notes and reflection later.
-- * The coven's library: templates, its own actions and saved blocks of
--   steps, kept per coven by those who lead its rituals.
--
-- Everything changes through the functions below. Nothing here loosens the
-- rules before it: parts still go only to members in good standing who have
-- signed the coven's current agreements, and what people wrote stays as
-- private as it was.

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------

alter table public.coven_rituals add column if not exists kind text not null default 'rite'
  check (kind in ('rite', 'meeting'));
alter table public.coven_rituals add column if not exists plan jsonb not null default '{}'::jsonb
  check (jsonb_typeof(plan) = 'object' and octet_length(plan::text) <= 60000);

alter table public.coven_ritual_steps add column if not exists section text
  check (section is null or char_length(section) <= 40);
alter table public.coven_ritual_steps add column if not exists roles jsonb not null default '[]'::jsonb
  check (jsonb_typeof(roles) = 'array' and jsonb_array_length(roles) <= 20);
alter table public.coven_ritual_steps add column if not exists turn_mode text not null default 'assigned'
  check (turn_mode in ('together', 'in_turn', 'assigned', 'on_behalf'));
alter table public.coven_ritual_steps add column if not exists details jsonb not null default '{}'::jsonb
  check (jsonb_typeof(details) = 'object' and octet_length(details::text) <= 24000);
alter table public.coven_ritual_steps add column if not exists turn_order uuid[] not null default '{}';
alter table public.coven_ritual_steps add column if not exists turn_at integer not null default 0;
alter table public.coven_ritual_steps add column if not exists outcome jsonb
  check (outcome is null or jsonb_typeof(outcome) = 'object');

-- The altar's quiet time after a rite.
alter table public.coven_altars add column if not exists held_until timestamptz;
alter table public.coven_altars add column if not exists held_by_ritual uuid references public.coven_rituals (id) on delete set null;

-- Papers can be left on the altar after the rite.
alter table public.coven_ritual_contributions drop constraint if exists coven_ritual_contributions_fate_check;
alter table public.coven_ritual_contributions add constraint coven_ritual_contributions_fate_check
  check (fate in ('keep', 'burn', 'bury', 'release', 'petition', 'altar'));

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- The coven's templates, its own actions and saved blocks of steps.
create table if not exists public.coven_ritual_library (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  kind text not null check (kind in ('template', 'action', 'block')),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body jsonb not null default '{}'::jsonb check (jsonb_typeof(body) = 'object' and octet_length(body::text) <= 200000),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_ritual_library_coven_idx on public.coven_ritual_library (coven_id, kind, title);

-- Each person's ticks on a rite's checklist.
create table if not exists public.coven_ritual_prep_ticks (
  ritual_id uuid not null references public.coven_rituals (id) on delete cascade,
  item_id text not null check (char_length(item_id) between 1 and 40),
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (ritual_id, item_id, user_id)
);

-- One vote each on a vote step.
create table if not exists public.coven_ritual_votes (
  step_id uuid not null references public.coven_ritual_steps (id) on delete cascade,
  ritual_id uuid not null references public.coven_rituals (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  choice text not null check (char_length(choice) between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (step_id, user_id)
);

create index if not exists coven_ritual_votes_ritual_idx on public.coven_ritual_votes (ritual_id);

-- What a gathering leaves behind (counts, never anyone's words).
create table if not exists public.coven_ritual_records (
  ritual_id uuid primary key references public.coven_rituals (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  title text not null,
  kind text not null default 'rite',
  held_at timestamptz,
  ended_at timestamptz,
  led_by uuid references auth.users (id) on delete set null,
  attendees uuid[] not null default '{}',
  steps jsonb not null default '[]'::jsonb,
  counts jsonb not null default '{}'::jsonb,
  votes jsonb not null default '[]'::jsonb,
  plan jsonb not null default '{}'::jsonb,
  notes text check (notes is null or char_length(notes) <= 8000),
  notes_by uuid references auth.users (id) on delete set null,
  notes_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_ritual_records_coven_idx on public.coven_ritual_records (coven_id, ended_at desc);

alter table public.coven_ritual_library enable row level security;
alter table public.coven_ritual_prep_ticks enable row level security;
alter table public.coven_ritual_votes enable row level security;
alter table public.coven_ritual_records enable row level security;

drop policy if exists "Members and moderators see the coven's ritual library" on public.coven_ritual_library;
create policy "Members and moderators see the coven's ritual library" on public.coven_ritual_library
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());
-- Ticks and votes: each person reads their own; the rest come through the functions below.
drop policy if exists "People see their own ticks" on public.coven_ritual_prep_ticks;
create policy "People see their own ticks" on public.coven_ritual_prep_ticks
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "People see their own votes" on public.coven_ritual_votes;
create policy "People see their own votes" on public.coven_ritual_votes
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Members and moderators see the coven's ritual records" on public.coven_ritual_records;
create policy "Members and moderators see the coven's ritual records" on public.coven_ritual_records
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());

-- ---------------------------------------------------------------------------
-- Plans and roles
-- ---------------------------------------------------------------------------

-- The people and positions cast in these roles (role ids), as a list of {kind, id}.
create or replace function public.coven_plan_role_people(p_plan jsonb, p_roles jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select coalesce(jsonb_agg(c), '[]'::jsonb)
  from jsonb_array_elements(case when jsonb_typeof(p_plan->'roles') = 'array' then p_plan->'roles' else '[]'::jsonb end) r,
       jsonb_array_elements(case when jsonb_typeof(r->'cast') = 'array' then r->'cast' else '[]'::jsonb end) c
  where jsonb_typeof(p_roles) = 'array' and p_roles ? (r->>'id');
$$;

-- WHO keys ("role:<id>", "rank:<id>", "user:<id>", "coven") as a list of {kind, id}.
create or replace function public.coven_plan_who(p_plan jsonb, p_keys jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select jsonb_build_object('kind', split_part(k, ':', 1), 'id', substr(k, strpos(k, ':') + 1)) as x
    from jsonb_array_elements_text(case when jsonb_typeof(p_keys) = 'array' then p_keys else '[]'::jsonb end) k
    where k like 'rank:%' or k like 'user:%'
    union all
    select '{"kind":"coven","id":"coven"}'::jsonb where jsonb_typeof(p_keys) = 'array' and p_keys ? 'coven'
    union all
    select c
    from jsonb_array_elements(case when jsonb_typeof(p_plan->'roles') = 'array' then p_plan->'roles' else '[]'::jsonb end) r,
         jsonb_array_elements(case when jsonb_typeof(r->'cast') = 'array' then r->'cast' else '[]'::jsonb end) c
    where jsonb_typeof(p_keys) = 'array' and p_keys ? ('role:' || (r->>'id'))
  ) t;
$$;

-- A plan checked and cleaned: up to 20 sections, roles (cast only with
-- members in good standing who have signed up to date, or positions) and
-- checklist items; afterwards within bounds.
create or replace function public.coven_clean_plan(p_coven uuid, p_plan jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  sections jsonb := '[]'::jsonb;
  roles jsonb := '[]'::jsonb;
  checklist jsonb := '[]'::jsonb;
  item jsonb;
  hold integer;
  follow jsonb;
  follow_hours integer;
begin
  if p_plan is null or jsonb_typeof(p_plan) <> 'object' then return '{}'::jsonb; end if;
  if octet_length(p_plan::text) > 60000 then raise exception 'That plan is too long.'; end if;
  for item in select * from jsonb_array_elements(case when jsonb_typeof(p_plan->'sections') = 'array' then p_plan->'sections' else '[]'::jsonb end) loop
    if coalesce(btrim(item->>'name'), '') = '' or coalesce(item->>'id', '') = '' then continue; end if;
    sections := sections || jsonb_build_array(jsonb_build_object('id', left(item->>'id', 40), 'name', left(btrim(item->>'name'), 60)));
  end loop;
  if jsonb_array_length(sections) > 20 then raise exception 'A gathering can have up to 20 sections.'; end if;
  for item in select * from jsonb_array_elements(case when jsonb_typeof(p_plan->'roles') = 'array' then p_plan->'roles' else '[]'::jsonb end) loop
    if coalesce(btrim(item->>'name'), '') = '' or coalesce(item->>'id', '') = '' then continue; end if;
    roles := roles || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'id', left(item->>'id', 40),
      'name', left(btrim(item->>'name'), 60),
      'cast', public.coven_clean_assignees(p_coven, item->'cast', btrim(item->>'name'), true),
      'speaks', case when item->>'speaks' = 'false' then false end
    )));
  end loop;
  if jsonb_array_length(roles) > 20 then raise exception 'A gathering can have up to 20 roles.'; end if;
  for item in select * from jsonb_array_elements(case when jsonb_typeof(p_plan->'checklist') = 'array' then p_plan->'checklist' else '[]'::jsonb end) loop
    if coalesce(btrim(item->>'text'), '') = '' or coalesce(item->>'id', '') = '' then continue; end if;
    checklist := checklist || jsonb_build_array(jsonb_build_object(
      'id', left(item->>'id', 40),
      'text', left(btrim(item->>'text'), 200),
      'remind', case when item->>'remind' in ('none', 'hour', 'day') then item->>'remind' else 'hour' end
    ));
  end loop;
  if jsonb_array_length(checklist) > 20 then raise exception 'A checklist can have up to 20 things.'; end if;
  hold := case when (p_plan->'afterwards'->>'hold_hours') ~ '^[0-9]{1,4}$' then least((p_plan->'afterwards'->>'hold_hours')::integer, 168) end;
  follow := case when jsonb_typeof(p_plan->'afterwards'->'follow_up') = 'object' then p_plan->'afterwards'->'follow_up' end;
  follow_hours := case when (follow->>'after_hours') ~ '^[0-9]{1,5}$' then least((follow->>'after_hours')::integer, 1440) end;
  return jsonb_strip_nulls(jsonb_build_object(
    'sections', sections,
    'roles', roles,
    'checklist', checklist,
    'afterwards', jsonb_build_object(
      'hold_hours', case when hold > 0 then hold end,
      'notes', left(coalesce(p_plan->'afterwards'->>'notes', ''), 2000),
      'follow_up', case when coalesce(btrim(follow->>'text'), '') <> '' and follow_hours > 0
        then jsonb_build_object('text', left(btrim(follow->>'text'), 200), 'after_hours', follow_hours) end
    ),
    'template', nullif(left(coalesce(p_plan->>'template', ''), 60), '')
  ));
end;
$$;

-- Papers can now be left on the altar ('altar').
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
     or fate not in ('keep', 'burn', 'bury', 'release', 'petition', 'altar') then
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

-- ---------------------------------------------------------------------------
-- Saving a gathering
-- ---------------------------------------------------------------------------

-- The planner, now with the gathering's kind and plan, and each step's
-- section, roles, turn mode and details. Roles become the step's people (with
-- anyone its fields name, which the page adds to assignees); a vote step
-- keeps who may vote (details.vote_voters). Pages that send none of these
-- save as before, and a ritual's plan and kind are kept when they're left out.
-- p_ritual: { title, intention, description, scheduled_for, status, occasion, occasion_name, kind?, plan? }
-- p_steps: [{ id?, title, instructions, spoken_text, duration_minutes, assignees, assigned_user_id, assigned_rank_id,
--             action, items, contribution, altar_action, altar_color, altar_form, altar_image, altar_label,
--             altar_access, altar_tenders, section?, roles?, turn_mode?, details? }] in order.
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
  next_kind text;
  next_plan jsonb;
  role_ids jsonb;
  step_details jsonb;
  voters jsonb;
  turn text;
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

  next_kind := coalesce(nullif(p_ritual->>'kind', ''), saved.kind, 'rite');
  if next_kind not in ('rite', 'meeting') then raise exception 'A gathering is a rite or a meeting.'; end if;
  next_plan := case when p_ritual ? 'plan' then public.coven_clean_plan(p_coven, p_ritual->'plan') else coalesce(saved.plan, '{}'::jsonb) end;

  if saved.id is null then
    insert into public.coven_rituals (coven_id, title, intention, description, scheduled_for, status, occasion, occasion_name, kind, plan, created_by)
    values (p_coven, btrim(p_ritual->>'title'), nullif(btrim(p_ritual->>'intention'), ''), nullif(btrim(p_ritual->>'description'), ''),
            next_when, next_status, nullif(p_ritual->>'occasion', ''), nullif(btrim(p_ritual->>'occasion_name'), ''), next_kind, next_plan, auth.uid())
    returning * into saved;
  else
    update public.coven_rituals
    set title = btrim(p_ritual->>'title'), intention = nullif(btrim(p_ritual->>'intention'), ''),
        description = nullif(btrim(p_ritual->>'description'), ''), scheduled_for = next_when, status = next_status,
        occasion = nullif(p_ritual->>'occasion', ''), occasion_name = nullif(btrim(p_ritual->>'occasion_name'), ''),
        kind = next_kind, plan = next_plan,
        current_step_id = null, started_at = null, ended_at = null, led_by = null, updated_at = now()
    where id = saved.id
    returning * into saved;
  end if;

  for step in select * from jsonb_array_elements(coalesce(p_steps, '[]'::jsonb)) loop
    n := n + 1;
    -- Its roles: only those the plan has.
    select coalesce(jsonb_agg(r), '[]'::jsonb) into role_ids
    from (select distinct r from jsonb_array_elements_text(case when jsonb_typeof(step->'roles') = 'array' then step->'roles' else '[]'::jsonb end) r
          where exists (select 1 from jsonb_array_elements(coalesce(next_plan->'roles', '[]'::jsonb)) x where x->>'id' = r) limit 20) t;
    -- Its people: its list and those cast in its roles, otherwise the older one person or position.
    who := public.coven_clean_assignees(p_coven,
      (case when jsonb_typeof(step->'assignees') = 'array' then step->'assignees' else '[]'::jsonb end) || public.coven_plan_role_people(next_plan, role_ids),
      'Step ' || n, true);
    if jsonb_array_length(who) = 0 then
      person := nullif(step->>'assigned_user_id', '')::uuid;
      rank := nullif(step->>'assigned_rank_id', '')::uuid;
      if person is not null and rank is not null then raise exception 'Step %: give it to one person or one position, not both.', n; end if;
      if person is not null then who := jsonb_build_array(jsonb_build_object('kind', 'user', 'id', person));
      elsif rank is not null then who := jsonb_build_array(jsonb_build_object('kind', 'rank', 'id', rank));
      end if;
      who := public.coven_clean_assignees(p_coven, who, 'Step ' || n, true);
    end if;
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
    turn := coalesce(nullif(step->>'turn_mode', ''), 'assigned');
    if turn not in ('together', 'in_turn', 'assigned', 'on_behalf') then raise exception 'Step %: unknown choice for how it is done.', n; end if;
    step_details := case when jsonb_typeof(step->'details') = 'object' then (step->'details') - 'vote_voters' else '{}'::jsonb end;
    if octet_length(step_details::text) > 20000 then raise exception 'Step %: there is too much in it.', n; end if;
    -- A vote keeps who may vote: those its fields name (everyone when none; no one while its roles are uncast).
    if step->>'action' = 'vote' and jsonb_typeof(step_details->'fields'->'voters') = 'array' and jsonb_array_length(step_details->'fields'->'voters') > 0 then
      voters := public.coven_clean_assignees(p_coven, public.coven_plan_who(next_plan, step_details->'fields'->'voters'), 'Step ' || n, false);
      step_details := step_details || jsonb_build_object('vote_voters', case when jsonb_array_length(voters) = 0 then '[{"kind":"nobody","id":"nobody"}]'::jsonb else voters end);
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
          section = nullif(left(step->>'section', 40), ''), roles = role_ids, turn_mode = turn, details = step_details,
          turn_order = '{}', turn_at = 0, outcome = null,
          started_at = null, completed_at = null, completed_by = null, updated_at = now()
      where id = step_id;
    else
      insert into public.coven_ritual_steps (ritual_id, coven_id, position, title, instructions, spoken_text, duration_minutes,
                                             assigned_user_id, assigned_rank_id, assignees, action, items, contribution,
                                             altar_action, altar_color, altar_form, altar_image, altar_label, altar_access, altar_tenders,
                                             section, roles, turn_mode, details)
      values (saved.id, p_coven, n, btrim(step->>'title'), nullif(btrim(step->>'instructions'), ''), nullif(btrim(step->>'spoken_text'), ''),
              nullif(step->>'duration_minutes', '')::integer, person, rank, who,
              nullif(step->>'action', ''), public.coven_clean_items(step->'items', 'Step ' || n), public.coven_clean_contribution(step->'contribution'),
              nullif(step->>'altar_action', ''), nullif(step->>'altar_color', ''), nullif(step->>'altar_form', ''),
              nullif(step->>'altar_image', ''), nullif(btrim(step->>'altar_label'), ''), access, tenders,
              nullif(left(step->>'section', 40), ''), role_ids, turn, step_details)
      returning id into step_id;
    end if;
    kept := array_append(kept, step_id);
  end loop;

  perform public.coven_ritual_prune(saved.id, kept);
  -- Votes cast on an earlier plan of the steps no longer count.
  delete from public.coven_ritual_votes where ritual_id = saved.id;
  return saved;
end;
$$;

-- ---------------------------------------------------------------------------
-- Turns
-- ---------------------------------------------------------------------------

-- The order people take a one-at-a-time step in: the step's people, those
-- who are here first (in the order they arrived), then the rest; anyone a
-- leader has marked as not there is left out.
create or replace function public.coven_ritual_turn_order(p_step uuid)
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(m.user_id order by (a.present is true) desc, a.joined_at nulls last, p.display_name nulls last, m.joined_at), '{}')
  from public.coven_ritual_steps s
  join public.coven_members m on m.coven_id = s.coven_id and m.status = 'active'
  left join public.coven_ritual_attendance a on a.ritual_id = s.ritual_id and a.user_id = m.user_id
  left join public.coven_profiles p on p.user_id = m.user_id
  where s.id = p_step and public.coven_step_for(s.id, m.user_id) and a.present is not false;
$$;

-- Whether the caller steers this live ritual: those who lead the coven's rituals, or its leader.
create or replace function public.coven_ritual_steers(p_ritual uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coven_rituals r
    where r.id = p_ritual
      and ((public.coven_in_good_standing(r.coven_id) and (public.coven_permission(r.coven_id, 'lead') or r.led_by = auth.uid()))
           or public.is_community_moderator())
  );
$$;

-- The one whose turn it is says they're done, or the leader moves on (p_skip: past someone who isn't ready).
create or replace function public.next_coven_ritual_turn(p_step uuid, p_skip boolean default false)
returns public.coven_ritual_steps
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.coven_ritual_steps;
  r public.coven_rituals;
  whose uuid;
begin
  select * into s from public.coven_ritual_steps where id = p_step for update;
  if s.id is null then raise exception 'That step was not found.'; end if;
  select * into r from public.coven_rituals where id = s.ritual_id;
  if r.status <> 'live' or r.current_step_id is distinct from s.id then raise exception 'That step isn''t the one under way.'; end if;
  if s.turn_mode <> 'in_turn' then raise exception 'This step isn''t taken in turn.'; end if;
  whose := s.turn_order[s.turn_at + 1];
  if not public.coven_ritual_steers(r.id) and (p_skip or whose is distinct from auth.uid() or not public.coven_in_good_standing(s.coven_id)) then
    raise exception 'It isn''t your turn.';
  end if;
  update public.coven_ritual_steps
  set turn_at = least(turn_at + 1, coalesce(array_length(turn_order, 1), 0)), updated_at = now()
  where id = s.id
  returning * into s;
  return s;
end;
$$;

-- The leader sets the order (people among the step's), or starts the turns again from the default (p_order null).
create or replace function public.set_coven_ritual_turns(p_step uuid, p_order uuid[])
returns public.coven_ritual_steps
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.coven_ritual_steps;
  r public.coven_rituals;
begin
  select * into s from public.coven_ritual_steps where id = p_step for update;
  if s.id is null then raise exception 'That step was not found.'; end if;
  select * into r from public.coven_rituals where id = s.ritual_id;
  if not public.coven_ritual_steers(r.id) then raise exception 'Only those who lead the coven''s rituals can do that.'; end if;
  if r.status <> 'live' or r.current_step_id is distinct from s.id then raise exception 'That step isn''t the one under way.'; end if;
  if p_order is not null and exists (select 1 from unnest(p_order) u where not public.coven_step_for(s.id, u)) then
    raise exception 'Everyone in the order must be one of the step''s people.';
  end if;
  update public.coven_ritual_steps
  set turn_order = coalesce(p_order, public.coven_ritual_turn_order(s.id)), turn_at = 0, updated_at = now()
  where id = s.id
  returning * into s;
  return s;
end;
$$;

-- ---------------------------------------------------------------------------
-- Votes
-- ---------------------------------------------------------------------------

-- A vote step's answers: its own list, or For, Against and Abstain.
create or replace function public.coven_vote_options(p_details jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select case
    when jsonb_typeof(p_details->'fields'->'options') = 'array' and jsonb_array_length(p_details->'fields'->'options') >= 2
      then p_details->'fields'->'options'
    else '["For", "Against", "Abstain"]'::jsonb
  end;
$$;

-- Close a vote: count it and keep the result on the step. Called as the ritual moves on.
create or replace function public.coven_ritual_close_vote(p_step uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.coven_ritual_steps;
  result jsonb;
begin
  select * into s from public.coven_ritual_steps where id = p_step;
  if s.id is null or s.action is distinct from 'vote' then return null; end if;
  if s.outcome is not null then return s.outcome; end if;
  select jsonb_build_object('counts', coalesce(jsonb_object_agg(t.choice, t.n), '{}'::jsonb), 'total', coalesce(sum(t.n), 0), 'closed_at', now())
  into result
  from (select v.choice, count(*)::integer as n from public.coven_ritual_votes v where v.step_id = s.id group by v.choice) t;
  update public.coven_ritual_steps set outcome = result, updated_at = now() where id = s.id;
  return result;
end;
$$;

-- Cast (or change) your vote while the vote is under way.
create or replace function public.cast_coven_ritual_vote(p_step uuid, p_choice text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.coven_ritual_steps;
  r public.coven_rituals;
  voters jsonb;
begin
  select * into s from public.coven_ritual_steps where id = p_step;
  if s.id is null or s.action is distinct from 'vote' then raise exception 'That step isn''t a vote.'; end if;
  select * into r from public.coven_rituals where id = s.ritual_id;
  if r.status <> 'live' or r.current_step_id is distinct from s.id then raise exception 'Votes are cast while the vote is under way.'; end if;
  if s.outcome is not null then raise exception 'This vote has closed.'; end if;
  if not public.coven_in_good_standing(s.coven_id) then
    raise exception 'You need to be a member in good standing (with the agreements signed) to vote.';
  end if;
  if not (public.coven_vote_options(s.details) ? p_choice) then raise exception 'Choose one of the answers.'; end if;
  voters := case when jsonb_typeof(s.details->'vote_voters') = 'array' then s.details->'vote_voters' else '[]'::jsonb end;
  if jsonb_array_length(voters) > 0 and not public.coven_assignees_include(s.coven_id, voters, auth.uid()) then
    raise exception 'This vote is for the people named on it.';
  end if;
  insert into public.coven_ritual_votes (step_id, ritual_id, coven_id, user_id, choice)
  values (s.id, s.ritual_id, s.coven_id, auth.uid(), p_choice)
  on conflict (step_id, user_id) do update set choice = excluded.choice, updated_at = now();
  return true;
end;
$$;

-- The leader closes a vote before the step ends.
create or replace function public.close_coven_ritual_vote(p_step uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.coven_ritual_steps;
begin
  select * into s from public.coven_ritual_steps where id = p_step;
  if s.id is null then raise exception 'That step was not found.'; end if;
  if not public.coven_ritual_steers(s.ritual_id) then raise exception 'Only those who lead the coven''s rituals can close a vote.'; end if;
  return public.coven_ritual_close_vote(s.id);
end;
$$;

-- A ritual's votes as the caller may see them: your own answer; the totals
-- (for a secret ballot, only once it has closed); and for an open ballot,
-- who voted how.
create or replace function public.coven_ritual_votes_for(p_ritual uuid)
returns table (step_id uuid, counts jsonb, total integer, mine text, ballots jsonb, closed boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or not (public.is_coven_member(r.coven_id) or public.is_community_moderator()) then return; end if;
  return query
    select s.id,
           case
             when s.outcome is not null then s.outcome->'counts'
             when s.details->'fields'->>'ballot' = 'secret' then null
             else (select coalesce(jsonb_object_agg(t.choice, t.n), '{}'::jsonb) from (select v.choice, count(*)::integer as n from public.coven_ritual_votes v where v.step_id = s.id group by v.choice) t)
           end,
           (select count(*)::integer from public.coven_ritual_votes v where v.step_id = s.id),
           (select v.choice from public.coven_ritual_votes v where v.step_id = s.id and v.user_id = auth.uid()),
           case when coalesce(s.details->'fields'->>'ballot', 'open') <> 'secret'
             then (select coalesce(jsonb_agg(jsonb_build_object('user_id', v.user_id, 'choice', v.choice) order by v.created_at), '[]'::jsonb) from public.coven_ritual_votes v where v.step_id = s.id)
           end,
           s.outcome is not null
    from public.coven_ritual_steps s
    where s.ritual_id = r.id and s.action = 'vote'
    order by s.position;
end;
$$;

-- ---------------------------------------------------------------------------
-- The checklist
-- ---------------------------------------------------------------------------

-- Tick (or untick) something on a rite's checklist.
create or replace function public.tick_coven_ritual_prep(p_ritual uuid, p_item text, p_done boolean default true)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.status not in ('draft', 'scheduled', 'live') then raise exception 'That rite isn''t coming up.'; end if;
  if not public.coven_permission(r.coven_id, 'member') then raise exception 'Only members can tick the checklist.'; end if;
  if not exists (select 1 from jsonb_array_elements(case when jsonb_typeof(r.plan->'checklist') = 'array' then r.plan->'checklist' else '[]'::jsonb end) c where c->>'id' = p_item) then
    raise exception 'That isn''t on the checklist.';
  end if;
  if coalesce(p_done, true) then
    insert into public.coven_ritual_prep_ticks (ritual_id, item_id, coven_id, user_id)
    values (r.id, p_item, r.coven_id, auth.uid())
    on conflict (ritual_id, item_id, user_id) do nothing;
  else
    delete from public.coven_ritual_prep_ticks where ritual_id = r.id and item_id = p_item and user_id = auth.uid();
  end if;
  return coalesce(p_done, true);
end;
$$;

-- For each checklist item: how many have ticked it, whether you have, and
-- (for those who see participation) who has.
create or replace function public.coven_ritual_prep(p_ritual uuid)
returns table (item_id text, done integer, mine boolean, users uuid[])
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
    select c->>'id',
           (select count(*)::integer from public.coven_ritual_prep_ticks t where t.ritual_id = r.id and t.item_id = c->>'id'),
           exists (select 1 from public.coven_ritual_prep_ticks t where t.ritual_id = r.id and t.item_id = c->>'id' and t.user_id = auth.uid()),
           case when sees then (select array_agg(t.user_id order by t.created_at) from public.coven_ritual_prep_ticks t where t.ritual_id = r.id and t.item_id = c->>'id') end
    from jsonb_array_elements(case when jsonb_typeof(r.plan->'checklist') = 'array' then r.plan->'checklist' else '[]'::jsonb end) c;
end;
$$;

-- ---------------------------------------------------------------------------
-- The altar's quiet time, and the record
-- ---------------------------------------------------------------------------

-- Keeper-only fields, now with the quiet time after a rite.
create or replace function public.guard_coven_altar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(current_setting('coven.altar_keeper', true), '') <> 'on' then
    if tg_op = 'INSERT' then raise exception 'Start an altar from the coven''s altars.'; end if;
    if new.coven_id <> old.coven_id or new.is_main <> old.is_main or new.name <> old.name or new.edit_mode <> old.edit_mode
       or new.locked <> old.locked or new.created_by is distinct from old.created_by or new.archived_at is distinct from old.archived_at
       or new.held_until is distinct from old.held_until or new.held_by_ritual is distinct from old.held_by_ritual then
      raise exception 'Only the altar''s keeper changes that.';
    end if;
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

-- Who may change an altar: as before, but while it is left untouched after a rite, no one.
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
  if a.held_until is not null and a.held_until > now() then return false; end if;
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
    elsif a.held_until is not null and a.held_until > now() then
      why := 'The altar is left untouched after the rite until ' || to_char(a.held_until at time zone 'UTC', 'FMDD Mon, HH24:MI') || ' UTC.';
    elsif a.locked then
      why := 'This altar is locked by its keeper.';
    elsif a.edit_mode = 'keeper' then
      why := 'Only this altar''s keeper tends it. You can watch it here.';
    else
      why := 'Only the people its keeper has chosen tend this altar. You can watch it here.';
    end if;
  end if;
  return jsonb_build_object('can_edit', can, 'keeper', keeper, 'ritual_id', r.id, 'reason', why, 'held_until', a.held_until);
end;
$$;

-- End the quiet time early: the altar's keepers, or those who lead the coven's rituals.
create or replace function public.release_coven_altar_hold(p_altar uuid)
returns public.coven_altars
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.coven_altars;
begin
  select * into a from public.coven_altars where id = p_altar;
  if a.id is null then raise exception 'That altar was not found.'; end if;
  if not (public.coven_altar_keeper(a.id) or (public.coven_in_good_standing(a.coven_id) and public.coven_permission(a.coven_id, 'lead'))) then
    raise exception 'Only the altar''s keepers and those who lead the coven''s rituals can end its quiet time.';
  end if;
  perform set_config('coven.altar_keeper', 'on', true);
  update public.coven_altars set held_until = null, held_by_ritual = null where id = a.id returning * into a;
  perform set_config('coven.altar_keeper', 'off', true);
  return a;
end;
$$;

-- Keep what a gathering left behind: who was there, the steps as they
-- happened, counts of what was offered (never the words) and its votes.
-- Done again, it's brought up to date; the leader's notes stay.
create or replace function public.coven_ritual_write_record(p_ritual uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.coven_ritual_records (ritual_id, coven_id, title, kind, held_at, ended_at, led_by, attendees, steps, counts, votes, plan)
  select r.id, r.coven_id, r.title, r.kind, coalesce(r.started_at, r.scheduled_for), coalesce(r.ended_at, now()), r.led_by,
         coalesce((select array_agg(a.user_id order by a.joined_at nulls last) from public.coven_ritual_attendance a where a.ritual_id = r.id and a.present is true), '{}'),
         coalesce((select jsonb_agg(jsonb_build_object('title', s.title, 'section', s.section, 'done', s.completed_at is not null, 'completed_by', s.completed_by) order by s.position)
                   from public.coven_ritual_steps s where s.ritual_id = r.id), '[]'::jsonb),
         coalesce((select jsonb_object_agg(t.kind, t.n) from (select c.kind, count(*)::integer as n from public.coven_ritual_contributions c where c.ritual_id = r.id and c.status <> 'written' group by c.kind) t), '{}'::jsonb),
         coalesce((select jsonb_agg(jsonb_build_object('title', s.title, 'motion', coalesce(s.details->'fields'->>'motion', ''), 'options', public.coven_vote_options(s.details),
                                                       'counts', coalesce(s.outcome->'counts', '{}'::jsonb), 'total', coalesce((s.outcome->>'total')::integer, 0)) order by s.position)
                   from public.coven_ritual_steps s where s.ritual_id = r.id and s.action = 'vote'), '[]'::jsonb),
         r.plan
  from public.coven_rituals r
  where r.id = p_ritual
  on conflict (ritual_id) do update
    set title = excluded.title, kind = excluded.kind, held_at = excluded.held_at, ended_at = excluded.ended_at, led_by = excluded.led_by,
        attendees = excluded.attendees, steps = excluded.steps, counts = excluded.counts, votes = excluded.votes, plan = excluded.plan, updated_at = now();
end;
$$;

-- What happens as a gathering ends: its altar left untouched for the hours
-- its plan says, and its record kept.
create or replace function public.coven_ritual_after(p_ritual uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  hold integer;
  altar uuid;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null then return; end if;
  hold := case when (r.plan->'afterwards'->>'hold_hours') ~ '^[0-9]{1,4}$' then least((r.plan->'afterwards'->>'hold_hours')::integer, 168) else 0 end;
  if hold > 0 then
    altar := coalesce(r.altar_id, (select m.id from public.coven_altars m where m.coven_id = r.coven_id and m.is_main limit 1));
    if altar is not null then
      perform set_config('coven.altar_keeper', 'on', true);
      update public.coven_altars set held_until = now() + hold * interval '1 hour', held_by_ritual = r.id where id = altar;
      perform set_config('coven.altar_keeper', 'off', true);
    end if;
  end if;
  perform public.coven_ritual_write_record(r.id);
end;
$$;

-- Moving a live ritual on: as before (what was written ahead is offered, the
-- papers let go at the end), and now a vote closes when its step is left, a
-- one-at-a-time step begins with its order of turns, and at the end the
-- altar's quiet time begins and the record is kept.
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
    perform public.coven_ritual_close_vote(r.current_step_id);
  end if;
  if p_step is null then
    perform public.coven_ritual_release_papers(p_ritual);
    update public.coven_rituals set status = 'done', current_step_id = null, ended_at = now(), updated_at = now()
    where id = p_ritual returning * into r;
    perform public.coven_ritual_after(p_ritual);
  else
    update public.coven_ritual_steps
    set started_at = now(), completed_at = null, completed_by = null, outcome = null,
        turn_order = case when turn_mode = 'in_turn' then public.coven_ritual_turn_order(id) else '{}' end, turn_at = 0,
        updated_at = now()
    where id = p_step;
    -- Going back to a vote opens it again, with the votes already cast.
    update public.coven_rituals set current_step_id = p_step, updated_at = now() where id = p_ritual returning * into r;
  end if;
  return r;
end;
$$;

-- The leader's notes and reflection on a gathering, added or changed afterwards.
create or replace function public.set_coven_ritual_record_notes(p_ritual uuid, p_notes text)
returns public.coven_ritual_records
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_ritual_records;
begin
  select * into saved from public.coven_ritual_records where ritual_id = p_ritual;
  if saved.ritual_id is null then raise exception 'That gathering has no record yet.'; end if;
  if not ((public.coven_in_good_standing(saved.coven_id) and (public.coven_permission(saved.coven_id, 'lead') or saved.led_by = auth.uid())) or public.is_community_moderator()) then
    raise exception 'Only its leader and those who lead the coven''s rituals add notes.';
  end if;
  if char_length(coalesce(p_notes, '')) > 8000 then raise exception 'Keep the notes under 8,000 characters.'; end if;
  update public.coven_ritual_records
  set notes = nullif(btrim(p_notes), ''), notes_by = auth.uid(), notes_at = now(), updated_at = now()
  where ritual_id = p_ritual
  returning * into saved;
  return saved;
end;
$$;

-- ---------------------------------------------------------------------------
-- The coven's library: templates, its own actions, saved blocks
-- ---------------------------------------------------------------------------

create or replace function public.save_coven_ritual_library(p_coven uuid, p_id uuid, p_kind text, p_title text, p_body jsonb)
returns public.coven_ritual_library
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_ritual_library;
begin
  if not ((public.coven_in_good_standing(p_coven) and public.coven_permission(p_coven, 'lead')) or public.is_community_moderator()) then
    raise exception 'Only those who lead the coven''s rituals keep its templates, actions and blocks.';
  end if;
  if p_kind not in ('template', 'action', 'block') then raise exception 'Unknown kind.'; end if;
  if coalesce(btrim(p_title), '') = '' then raise exception 'Give it a name.'; end if;
  if p_body is null or jsonb_typeof(p_body) <> 'object' or octet_length(p_body::text) > 200000 then raise exception 'That is too long to keep.'; end if;
  if p_id is null then
    if (select count(*) from public.coven_ritual_library where coven_id = p_coven) >= 300 then
      raise exception 'The coven keeps up to 300 templates, actions and blocks. Remove one first.';
    end if;
    insert into public.coven_ritual_library (coven_id, kind, title, body, created_by, updated_by)
    values (p_coven, p_kind, left(btrim(p_title), 120), p_body, auth.uid(), auth.uid())
    returning * into saved;
  else
    update public.coven_ritual_library
    set title = left(btrim(p_title), 120), body = p_body, updated_by = auth.uid(), updated_at = now()
    where id = p_id and coven_id = p_coven and kind = p_kind
    returning * into saved;
    if saved.id is null then raise exception 'That was not found.'; end if;
  end if;
  return saved;
end;
$$;

create or replace function public.remove_coven_ritual_library(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_coven uuid;
begin
  select coven_id into owner_coven from public.coven_ritual_library where id = p_id;
  if owner_coven is null then return false; end if;
  if not ((public.coven_in_good_standing(owner_coven) and public.coven_permission(owner_coven, 'lead')) or public.is_community_moderator()) then
    raise exception 'Only those who lead the coven''s rituals keep its templates, actions and blocks.';
  end if;
  delete from public.coven_ritual_library where id = p_id;
  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may call what, and live updates
-- ---------------------------------------------------------------------------

revoke execute on function
  public.coven_clean_plan(uuid, jsonb),
  public.coven_ritual_turn_order(uuid),
  public.coven_ritual_steers(uuid),
  public.coven_ritual_close_vote(uuid),
  public.coven_ritual_write_record(uuid),
  public.coven_ritual_after(uuid),
  public.coven_ritual_move(uuid, uuid),
  public.guard_coven_altar()
from public, anon, authenticated;
revoke execute on function
  public.coven_plan_role_people(jsonb, jsonb),
  public.coven_plan_who(jsonb, jsonb),
  public.coven_vote_options(jsonb),
  public.coven_clean_contribution(jsonb),
  public.save_coven_ritual(uuid, uuid, jsonb, jsonb),
  public.next_coven_ritual_turn(uuid, boolean),
  public.set_coven_ritual_turns(uuid, uuid[]),
  public.cast_coven_ritual_vote(uuid, text),
  public.close_coven_ritual_vote(uuid),
  public.coven_ritual_votes_for(uuid),
  public.tick_coven_ritual_prep(uuid, text, boolean),
  public.coven_ritual_prep(uuid),
  public.coven_altar_can_edit(uuid),
  public.coven_altar_access(uuid),
  public.release_coven_altar_hold(uuid),
  public.set_coven_ritual_record_notes(uuid, text),
  public.save_coven_ritual_library(uuid, uuid, text, text, jsonb),
  public.remove_coven_ritual_library(uuid)
from public, anon;
grant execute on function
  public.coven_plan_role_people(jsonb, jsonb),
  public.coven_plan_who(jsonb, jsonb),
  public.coven_vote_options(jsonb),
  public.coven_clean_contribution(jsonb),
  public.save_coven_ritual(uuid, uuid, jsonb, jsonb),
  public.next_coven_ritual_turn(uuid, boolean),
  public.set_coven_ritual_turns(uuid, uuid[]),
  public.cast_coven_ritual_vote(uuid, text),
  public.close_coven_ritual_vote(uuid),
  public.coven_ritual_votes_for(uuid),
  public.tick_coven_ritual_prep(uuid, text, boolean),
  public.coven_ritual_prep(uuid),
  public.coven_altar_can_edit(uuid),
  public.coven_altar_access(uuid),
  public.release_coven_altar_hold(uuid),
  public.set_coven_ritual_record_notes(uuid, text),
  public.save_coven_ritual_library(uuid, uuid, text, text, jsonb),
  public.remove_coven_ritual_library(uuid)
to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_ritual_records') then
      alter publication supabase_realtime add table public.coven_ritual_records;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_ritual_library') then
      alter publication supabase_realtime add table public.coven_ritual_library;
    end if;
  end if;
end;
$$;
