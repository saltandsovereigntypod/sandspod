-- Coven initiation and training programs, mentors, who may manage and see
-- them, and the coven's own practice calendar.
--
-- * Programs: each coven designs its own initiation (kind 'initiation') and
--   training ('training') programs: stages in order, each with detailed
--   tasks (study, practice, reflection, ritual, attending a rite, a Book of
--   Shadows page, an oath, a meeting, service). A task says how many times
--   it's done, whether the person writes something for it, and who signs it
--   off: the person themselves, their mentor, or a program manager. A stage
--   can ask for a minimum time (a year and a day) and says who confirms it's
--   passed. A program can raise its graduates to a position.
-- * Who: the coven's head (the founder, or a position that leads the coven)
--   chooses who manages programs and who sees everyone's progress, by
--   position (can_manage_programs, can_view_progress) or by name
--   (coven_grants). Program managers design programs, assign them to people
--   or to whole positions (anyone who later holds the position is enrolled
--   too), assign mentors, sign off work and pass stages.
-- * Mentors: one per member per coven. A mentor sees their mentee's progress
--   and signs off the tasks and stages left to mentors.
-- * Ready-made programs (coven_program_templates), one initiation and one
--   training program for each holiday calendar, are copied into a coven as
--   drafts to make its own.
-- * The coven's practice calendar: holiday traditions (and chosen holidays,
--   the coven's own days and counting calendars), the same choices as a
--   person's Settings → Calendar, set by those who lead the coven.
-- Programs, enrollments, progress, mentors and grants change only through
-- the functions below.

-- ---------------------------------------------------------------------------
-- Powers and the coven calendar
-- ---------------------------------------------------------------------------

alter table public.coven_ranks add column if not exists can_manage_programs boolean not null default false;
alter table public.coven_ranks add column if not exists can_view_progress boolean not null default false;

alter table public.covens add column if not exists practice_traditions text[] not null default '{}';
alter table public.covens add column if not exists practice_holidays text[] not null default '{}';
alter table public.covens add column if not exists practice_custom jsonb not null default '[]'::jsonb;
alter table public.covens add column if not exists practice_calendars text[] not null default '{}';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'covens_practice_calendar_check') then
    alter table public.covens add constraint covens_practice_calendar_check check (
      cardinality(practice_traditions) <= 12
      and cardinality(practice_holidays) <= 200
      and cardinality(practice_calendars) <= 12
      and jsonb_typeof(practice_custom) = 'array'
      and jsonb_array_length(practice_custom) <= 60
    );
  end if;
end;
$$;

-- Powers given by name, alongside those that come with a position.
create table if not exists public.coven_grants (
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  power text not null check (power in ('manage_programs', 'view_progress')),
  granted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (coven_id, user_id, power)
);

alter table public.coven_grants enable row level security;
create policy "Members and moderators see the coven's grants" on public.coven_grants
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());

-- The coven's permissions, now with 'programs' (design, assign, sign off) and
-- 'progress' (see everyone's progress).
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
          when 'schedule' then coalesce(r.can_schedule_rites or r.can_manage, false)
          when 'write_book' then coalesce(r.can_write_book or r.can_approve_book or r.can_manage, false)
          when 'approve_book' then coalesce(r.can_approve_book or r.can_manage, false)
          when 'programs' then coalesce(r.can_manage_programs or r.can_manage, false)
            or exists (select 1 from public.coven_grants g where g.coven_id = target and g.user_id = auth.uid() and g.power = 'manage_programs')
          when 'progress' then coalesce(r.can_view_progress or r.can_manage_programs or r.can_manage, false)
            or exists (select 1 from public.coven_grants g where g.coven_id = target and g.user_id = auth.uid())
          else false
        end
      )
  );
$$;

-- Reviewers can't hand out the new powers either.
create or replace function public.coven_can_grant(p_coven uuid, p_rank uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_community_moderator()
    or exists (
      select 1 from public.coven_ranks r
      where r.id = p_rank and r.coven_id = p_coven
        and (
          public.coven_level(p_coven) = 1000
          or (public.coven_permission(p_coven, 'manage') and r.level <= public.coven_level(p_coven))
          or (public.coven_permission(p_coven, 'review') and r.level < public.coven_level(p_coven)
              and not (r.can_manage or r.can_review or r.can_moderate or r.can_manage_programs or r.can_view_progress))
        )
    );
$$;

-- ---------------------------------------------------------------------------
-- Mentors
-- ---------------------------------------------------------------------------

create table if not exists public.coven_mentors (
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  mentor_id uuid not null references auth.users (id) on delete cascade,
  assigned_by uuid references auth.users (id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (coven_id, user_id),
  check (user_id <> mentor_id)
);

create index if not exists coven_mentors_mentor_idx on public.coven_mentors (coven_id, mentor_id);

create or replace function public.coven_is_mentor_of(p_coven uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.coven_mentors where coven_id = p_coven and user_id = p_user and mentor_id = auth.uid())
    and public.coven_permission(p_coven, 'member');
$$;

-- Whether this person may see that member's progress: their own, their
-- mentee's, anyone's for those given 'progress', and site moderators.
create or replace function public.coven_sees_progress(p_coven uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_user = auth.uid()
    or public.coven_is_mentor_of(p_coven, p_user)
    or public.coven_permission(p_coven, 'progress')
    or public.is_community_moderator();
$$;

alter table public.coven_mentors enable row level security;
create policy "Mentors, mentees and progress keepers see mentorships" on public.coven_mentors
  for select to authenticated using (
    user_id = auth.uid() or mentor_id = auth.uid()
    or public.coven_permission(coven_id, 'progress') or public.is_community_moderator()
  );

-- ---------------------------------------------------------------------------
-- Programs
-- ---------------------------------------------------------------------------

create table if not exists public.coven_programs (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  kind text not null check (kind in ('initiation', 'training')),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  summary text check (summary is null or char_length(summary) <= 500),
  description text check (description is null or char_length(description) <= 8000),
  template_id text,
  -- Graduates rise to this position.
  award_rank_id uuid references public.coven_ranks (id) on delete set null,
  -- Members may begin it themselves (otherwise only those assigned).
  self_enroll boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'open', 'archived')),
  position integer not null default 0,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_programs_coven_idx on public.coven_programs (coven_id, status, position);

create table if not exists public.coven_program_stages (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.coven_programs (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  position integer not null default 0,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  intro text check (intro is null or char_length(intro) <= 6000),
  -- The least time someone spends in the stage (a year and a day is 366).
  min_days integer check (min_days is null or min_days between 0 and 1500),
  -- Who confirms the stage is passed: their mentor (or a program manager),
  -- a program manager only, or the person themselves once every task is done.
  passed_by text not null default 'mentor' check (passed_by in ('mentor', 'manager', 'self')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_program_stages_program_idx on public.coven_program_stages (program_id, position);

create table if not exists public.coven_program_tasks (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.coven_program_stages (id) on delete cascade,
  program_id uuid not null references public.coven_programs (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  position integer not null default 0,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  kind text not null default 'practice' check (kind in ('study', 'practice', 'reflection', 'ritual', 'attend', 'book', 'oath', 'meeting', 'service', 'other')),
  instructions text check (instructions is null or char_length(instructions) <= 8000),
  resources text check (resources is null or char_length(resources) <= 4000),
  -- How many times it's done (13 esbats, 30 days of meditation).
  times integer not null default 1 check (times between 1 and 400),
  -- 'text': they write something for it (a reflection, an essay, notes).
  response text not null default 'none' check (response in ('none', 'text')),
  checked_by text not null default 'mentor' check (checked_by in ('self', 'mentor', 'manager')),
  -- A holiday it belongs to, as "tradition/holiday" (e.g. "wheel/samhain").
  holiday text check (holiday is null or char_length(holiday) <= 80),
  minutes integer check (minutes is null or minutes between 0 and 1440),
  optional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_program_tasks_stage_idx on public.coven_program_tasks (stage_id, position);

-- Who has to go through a program: a person, or everyone in a position.
create table if not exists public.coven_program_assignments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.coven_programs (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  rank_id uuid references public.coven_ranks (id) on delete cascade,
  assigned_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check ((user_id is null) <> (rank_id is null))
);

create unique index if not exists coven_program_assignments_user_idx on public.coven_program_assignments (program_id, user_id) where user_id is not null;
create unique index if not exists coven_program_assignments_rank_idx on public.coven_program_assignments (program_id, rank_id) where rank_id is not null;

create table if not exists public.coven_program_enrollments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.coven_programs (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'withdrawn')),
  stage_id uuid references public.coven_program_stages (id) on delete set null,
  stage_started_at timestamptz,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  assigned_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (program_id, user_id)
);

create index if not exists coven_program_enrollments_user_idx on public.coven_program_enrollments (coven_id, user_id);

create table if not exists public.coven_program_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.coven_program_enrollments (id) on delete cascade,
  task_id uuid not null references public.coven_program_tasks (id) on delete cascade,
  program_id uuid not null references public.coven_programs (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  times_done integer not null default 0 check (times_done between 0 and 400),
  -- in_progress: begun, not yet the full number of times; submitted: waiting
  -- for sign-off; approved: done; returned: sent back with feedback.
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'approved', 'returned')),
  response text check (response is null or char_length(response) <= 8000),
  submitted_at timestamptz,
  checked_by uuid references auth.users (id) on delete set null,
  checked_at timestamptz,
  feedback text check (feedback is null or char_length(feedback) <= 2000),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, task_id)
);

create index if not exists coven_program_progress_coven_idx on public.coven_program_progress (coven_id, status);

create table if not exists public.coven_program_stage_passes (
  enrollment_id uuid not null references public.coven_program_enrollments (id) on delete cascade,
  stage_id uuid not null references public.coven_program_stages (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  passed_at timestamptz not null default now(),
  passed_by uuid references auth.users (id) on delete set null,
  note text check (note is null or char_length(note) <= 2000),
  primary key (enrollment_id, stage_id)
);

-- Ready-made programs, the same for every coven.
create table if not exists public.coven_program_templates (
  id text primary key,
  kind text not null check (kind in ('initiation', 'training')),
  tradition text,
  title text not null,
  summary text,
  description text,
  stages jsonb not null default '[]'::jsonb,
  position integer not null default 0
);

alter table public.coven_programs enable row level security;
alter table public.coven_program_stages enable row level security;
alter table public.coven_program_tasks enable row level security;
alter table public.coven_program_assignments enable row level security;
alter table public.coven_program_enrollments enable row level security;
alter table public.coven_program_progress enable row level security;
alter table public.coven_program_stage_passes enable row level security;
alter table public.coven_program_templates enable row level security;

-- Members see open and archived programs; drafts are for those who manage them.
create or replace function public.coven_program_visible(p_program uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coven_programs p
    where p.id = p_program
      and (
        public.is_community_moderator()
        or (public.is_coven_member(p.coven_id) and (p.status <> 'draft' or public.coven_permission(p.coven_id, 'programs')))
      )
  );
$$;

create policy "Members see the coven's programs" on public.coven_programs
  for select to authenticated using (public.coven_program_visible(id));
create policy "Members see program stages" on public.coven_program_stages
  for select to authenticated using (public.coven_program_visible(program_id));
create policy "Members see program tasks" on public.coven_program_tasks
  for select to authenticated using (public.coven_program_visible(program_id));
create policy "Program managers and progress keepers see assignments" on public.coven_program_assignments
  for select to authenticated using (
    public.coven_permission(coven_id, 'programs') or public.coven_permission(coven_id, 'progress') or public.is_community_moderator()
    or user_id = auth.uid()
  );
create policy "Enrollments are seen by the person, their mentor and progress keepers" on public.coven_program_enrollments
  for select to authenticated using (public.coven_sees_progress(coven_id, user_id));
create policy "Progress is seen by the person, their mentor and progress keepers" on public.coven_program_progress
  for select to authenticated using (public.coven_sees_progress(coven_id, user_id));
create policy "Stage passes are seen by the person, their mentor and progress keepers" on public.coven_program_stage_passes
  for select to authenticated using (public.coven_sees_progress(coven_id, user_id));
create policy "Anyone reads the ready-made programs" on public.coven_program_templates
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- Grants and mentors
-- ---------------------------------------------------------------------------

-- The coven's head names who manages programs and who sees everyone's progress.
create or replace function public.set_coven_grant(p_coven uuid, p_user uuid, p_power text, p_enabled boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.coven_permission(p_coven, 'manage') or public.is_community_moderator()) then
    raise exception 'Only the coven''s head chooses who manages programs and who sees progress.';
  end if;
  if p_power not in ('manage_programs', 'view_progress') then raise exception 'Unknown power.'; end if;
  if p_enabled then
    if not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_user and status = 'active') then
      raise exception 'That person is not a member of this coven.';
    end if;
    insert into public.coven_grants (coven_id, user_id, power, granted_by) values (p_coven, p_user, p_power, auth.uid())
    on conflict do nothing;
  else
    delete from public.coven_grants where coven_id = p_coven and user_id = p_user and power = p_power;
  end if;
  return p_enabled;
end;
$$;

-- Give a member a mentor (or none, with p_mentor null).
create or replace function public.set_coven_mentor(p_coven uuid, p_user uuid, p_mentor uuid)
returns public.coven_mentors
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_mentors;
begin
  if not ((public.coven_in_good_standing(p_coven) and public.coven_permission(p_coven, 'programs')) or public.is_community_moderator()) then
    raise exception 'Only those who manage the coven''s programs assign mentors.';
  end if;
  if not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_user and status = 'active') then
    raise exception 'That person is not a member of this coven.';
  end if;
  if p_mentor is null then
    delete from public.coven_mentors where coven_id = p_coven and user_id = p_user returning * into saved;
    return saved;
  end if;
  if p_mentor = p_user then raise exception 'Someone can''t mentor themselves.'; end if;
  if not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_mentor and status = 'active') then
    raise exception 'The mentor must be a member of this coven.';
  end if;
  if public.coven_unsigned_agreements(p_coven, p_mentor) > 0 or public.is_community_banned(p_mentor) then
    raise exception 'The mentor needs to sign the coven''s current agreements first.';
  end if;
  insert into public.coven_mentors (coven_id, user_id, mentor_id, assigned_by) values (p_coven, p_user, p_mentor, auth.uid())
  on conflict (coven_id, user_id) do update set mentor_id = excluded.mentor_id, assigned_by = excluded.assigned_by, assigned_at = now()
  returning * into saved;
  return saved;
end;
$$;

-- ---------------------------------------------------------------------------
-- Designing programs
-- ---------------------------------------------------------------------------

create or replace function public.coven_program_manager(p_coven uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (public.coven_in_good_standing(p_coven) and public.coven_permission(p_coven, 'programs')) or public.is_community_moderator();
$$;

-- Remove stages and tasks a save left out (their progress goes with them).
create or replace function public.coven_program_prune(p_program uuid, p_stages uuid[], p_tasks uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.coven_program_tasks where program_id = p_program and not (id = any (p_tasks));
  delete from public.coven_program_stages where program_id = p_program and not (id = any (p_stages));
end;
$$;

-- Create or replace a program with its stages and tasks in one go.
-- p_program: { kind, title, summary, description, award_rank_id, self_enroll, status ('draft'|'open') }
-- p_stages: [{ id?, title, intro, min_days, passed_by, tasks: [{ id?, title, kind, instructions, resources,
--             times, response, checked_by, holiday, minutes, optional }] }] in order.
-- Stages and tasks keep their ids, so progress already made stays with them.
create or replace function public.save_coven_program(p_coven uuid, p_program_id uuid, p_program jsonb, p_stages jsonb)
returns public.coven_programs
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_programs;
  stage jsonb;
  task jsonb;
  s_n integer := 0;
  t_n integer;
  total integer := 0;
  v_stage uuid;
  v_task uuid;
  kept_stages uuid[] := '{}';
  kept_tasks uuid[] := '{}';
  award uuid := nullif(p_program->>'award_rank_id', '')::uuid;
  next_status text := coalesce(nullif(p_program->>'status', ''), 'draft');
  next_kind text := coalesce(nullif(p_program->>'kind', ''), 'training');
begin
  if not public.coven_program_manager(p_coven) then
    raise exception 'Only those the coven''s head has chosen can design its programs.';
  end if;
  if jsonb_typeof(coalesce(p_stages, '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_stages, '[]'::jsonb)) > 30 then
    raise exception 'A program can have up to 30 stages.';
  end if;
  if next_status not in ('draft', 'open') then raise exception 'A program is saved as a draft or as open.'; end if;
  if next_status = 'open' and jsonb_array_length(coalesce(p_stages, '[]'::jsonb)) = 0 then
    raise exception 'Add a stage before opening the program.';
  end if;
  if award is not null and not exists (select 1 from public.coven_ranks where id = award and coven_id = p_coven) then
    raise exception 'That position is not one of this coven''s.';
  end if;

  if p_program_id is not null then
    select * into saved from public.coven_programs where id = p_program_id and coven_id = p_coven for update;
    if saved.id is null then raise exception 'That program was not found.'; end if;
  end if;
  -- Raising graduates to a position is the coven's head's to choose.
  if p_program ? 'award_rank_id' and award is distinct from saved.award_rank_id and award is not null
     and not (public.coven_permission(p_coven, 'manage') or public.is_community_moderator()) then
    raise exception 'Only the coven''s head chooses a position for those who finish a program.';
  end if;

  if saved.id is null then
    insert into public.coven_programs (coven_id, kind, title, summary, description, template_id, award_rank_id, self_enroll, status, created_by,
                                       position)
    values (p_coven, next_kind, btrim(p_program->>'title'), nullif(btrim(p_program->>'summary'), ''), nullif(btrim(p_program->>'description'), ''),
            nullif(p_program->>'template_id', ''), award, coalesce((p_program->>'self_enroll')::boolean, false), next_status, auth.uid(),
            coalesce((select max(position) + 1 from public.coven_programs where coven_id = p_coven), 0))
    returning * into saved;
  else
    update public.coven_programs
    set kind = next_kind, title = btrim(p_program->>'title'), summary = nullif(btrim(p_program->>'summary'), ''),
        description = nullif(btrim(p_program->>'description'), ''),
        -- Left out, the position stays as it was; only the coven's head changes it.
        award_rank_id = case when p_program ? 'award_rank_id' and (public.coven_permission(p_coven, 'manage') or public.is_community_moderator())
                             then award else saved.award_rank_id end,
        self_enroll = coalesce((p_program->>'self_enroll')::boolean, false),
        status = case when saved.status = 'archived' then 'archived' else next_status end, updated_at = now()
    where id = saved.id
    returning * into saved;
  end if;

  for stage in select * from jsonb_array_elements(coalesce(p_stages, '[]'::jsonb)) loop
    s_n := s_n + 1;
    if nullif(btrim(stage->>'title'), '') is null then raise exception 'Stage %: give it a title.', s_n; end if;
    if jsonb_typeof(coalesce(stage->'tasks', '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(stage->'tasks', '[]'::jsonb)) > 60 then
      raise exception 'Stage %: up to 60 tasks.', s_n;
    end if;
    v_stage := nullif(stage->>'id', '')::uuid;
    if v_stage is not null and exists (select 1 from public.coven_program_stages where id = v_stage and program_id = saved.id) then
      update public.coven_program_stages
      set position = s_n, title = btrim(stage->>'title'), intro = nullif(btrim(stage->>'intro'), ''),
          min_days = nullif(stage->>'min_days', '')::integer, passed_by = coalesce(nullif(stage->>'passed_by', ''), 'mentor'), updated_at = now()
      where id = v_stage;
    else
      insert into public.coven_program_stages (program_id, coven_id, position, title, intro, min_days, passed_by)
      values (saved.id, p_coven, s_n, btrim(stage->>'title'), nullif(btrim(stage->>'intro'), ''), nullif(stage->>'min_days', '')::integer,
              coalesce(nullif(stage->>'passed_by', ''), 'mentor'))
      returning id into v_stage;
    end if;
    kept_stages := array_append(kept_stages, v_stage);

    t_n := 0;
    for task in select * from jsonb_array_elements(coalesce(stage->'tasks', '[]'::jsonb)) loop
      t_n := t_n + 1;
      total := total + 1;
      if total > 400 then raise exception 'A program can have up to 400 tasks.'; end if;
      if nullif(btrim(task->>'title'), '') is null then raise exception 'Stage %, task %: give it a title.', s_n, t_n; end if;
      v_task := nullif(task->>'id', '')::uuid;
      if v_task is not null and exists (select 1 from public.coven_program_tasks where id = v_task and program_id = saved.id) then
        update public.coven_program_tasks
        set stage_id = v_stage, position = t_n, title = btrim(task->>'title'), kind = coalesce(nullif(task->>'kind', ''), 'practice'),
            instructions = nullif(btrim(task->>'instructions'), ''), resources = nullif(btrim(task->>'resources'), ''),
            times = coalesce(nullif(task->>'times', '')::integer, 1), response = coalesce(nullif(task->>'response', ''), 'none'),
            checked_by = coalesce(nullif(task->>'checked_by', ''), 'mentor'), holiday = nullif(task->>'holiday', ''),
            minutes = nullif(task->>'minutes', '')::integer, optional = coalesce((task->>'optional')::boolean, false), updated_at = now()
        where id = v_task;
      else
        insert into public.coven_program_tasks (stage_id, program_id, coven_id, position, title, kind, instructions, resources, times, response,
                                                checked_by, holiday, minutes, optional)
        values (v_stage, saved.id, p_coven, t_n, btrim(task->>'title'), coalesce(nullif(task->>'kind', ''), 'practice'),
                nullif(btrim(task->>'instructions'), ''), nullif(btrim(task->>'resources'), ''), coalesce(nullif(task->>'times', '')::integer, 1),
                coalesce(nullif(task->>'response', ''), 'none'), coalesce(nullif(task->>'checked_by', ''), 'mentor'), nullif(task->>'holiday', ''),
                nullif(task->>'minutes', '')::integer, coalesce((task->>'optional')::boolean, false))
        returning id into v_task;
      end if;
      kept_tasks := array_append(kept_tasks, v_task);
    end loop;
  end loop;

  perform public.coven_program_prune(saved.id, kept_stages, kept_tasks);
  -- Anyone enrolled whose stage was removed moves to the first stage they haven't passed.
  update public.coven_program_enrollments e
  set stage_id = (select s.id from public.coven_program_stages s
                  where s.program_id = saved.id
                    and not exists (select 1 from public.coven_program_stage_passes p where p.enrollment_id = e.id and p.stage_id = s.id)
                  order by s.position limit 1),
      stage_started_at = coalesce(e.stage_started_at, now()), updated_at = now()
  where e.program_id = saved.id and e.status in ('active', 'paused') and (e.stage_id is null or not (e.stage_id = any (kept_stages)));
  return saved;
end;
$$;

-- Copy a ready-made program into the coven as a draft to make its own.
create or replace function public.copy_coven_program_template(p_coven uuid, p_template text)
returns public.coven_programs
language plpgsql
security definer
set search_path = public
as $$
declare
  tpl public.coven_program_templates;
begin
  select * into tpl from public.coven_program_templates where id = p_template;
  if tpl.id is null then raise exception 'That ready-made program was not found.'; end if;
  return public.save_coven_program(
    p_coven, null,
    jsonb_build_object('kind', tpl.kind, 'title', tpl.title, 'summary', tpl.summary, 'description', tpl.description,
                       'template_id', tpl.id, 'status', 'draft'),
    tpl.stages
  );
end;
$$;

-- Open, archive, return to draft, or delete a program.
create or replace function public.set_coven_program_status(p_program uuid, p_status text)
returns public.coven_programs
language plpgsql
security definer
set search_path = public
as $$
declare
  prog public.coven_programs;
begin
  select * into prog from public.coven_programs where id = p_program for update;
  if prog.id is null then raise exception 'That program was not found.'; end if;
  if not public.coven_program_manager(prog.coven_id) then
    raise exception 'Only those the coven''s head has chosen can manage its programs.';
  end if;
  if p_status = 'deleted' then
    delete from public.coven_programs where id = prog.id;
    return prog;
  end if;
  if p_status not in ('draft', 'open', 'archived') then raise exception 'Unknown program status.'; end if;
  if p_status = 'open' and not exists (select 1 from public.coven_program_stages where program_id = prog.id) then
    raise exception 'Add a stage before opening the program.';
  end if;
  update public.coven_programs set status = p_status, updated_at = now() where id = prog.id returning * into prog;
  return prog;
end;
$$;

-- ---------------------------------------------------------------------------
-- Who goes through a program
-- ---------------------------------------------------------------------------

-- Enroll someone (called by the functions below). An earlier withdrawal is
-- picked up where it left off; a finished program isn't begun again.
create or replace function public.coven_program_enroll(p_program uuid, p_user uuid, p_by uuid)
returns public.coven_program_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  prog public.coven_programs;
  saved public.coven_program_enrollments;
begin
  select * into prog from public.coven_programs where id = p_program;
  if prog.id is null or prog.status <> 'open' then return null; end if;
  if not exists (select 1 from public.coven_members where coven_id = prog.coven_id and user_id = p_user and status = 'active') then
    return null;
  end if;
  insert into public.coven_program_enrollments (program_id, coven_id, user_id, stage_id, stage_started_at, assigned_by)
  values (prog.id, prog.coven_id, p_user,
          (select id from public.coven_program_stages where program_id = prog.id order by position limit 1), now(), p_by)
  on conflict (program_id, user_id) do update
    set status = case when public.coven_program_enrollments.status = 'withdrawn' then 'active' else public.coven_program_enrollments.status end,
        updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

-- Assign a program to a person (p_user) or to everyone in a position
-- (p_rank), now and whenever someone later takes that position.
create or replace function public.assign_coven_program(p_program uuid, p_user uuid, p_rank uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  prog public.coven_programs;
  person uuid;
  n integer := 0;
begin
  select * into prog from public.coven_programs where id = p_program;
  if prog.id is null then raise exception 'That program was not found.'; end if;
  if not public.coven_program_manager(prog.coven_id) then
    raise exception 'Only those the coven''s head has chosen can assign its programs.';
  end if;
  if prog.status <> 'open' then raise exception 'Open the program before assigning it.'; end if;
  if (p_user is null) = (p_rank is null) then raise exception 'Assign it to one person or one position.'; end if;
  if p_user is not null and not exists (select 1 from public.coven_members where coven_id = prog.coven_id and user_id = p_user and status = 'active') then
    raise exception 'That person is not a member of this coven.';
  end if;
  if p_rank is not null and not exists (select 1 from public.coven_ranks where id = p_rank and coven_id = prog.coven_id) then
    raise exception 'That position is not one of this coven''s.';
  end if;
  if p_user is not null then
    insert into public.coven_program_assignments (program_id, coven_id, user_id, assigned_by) values (prog.id, prog.coven_id, p_user, auth.uid())
    on conflict do nothing;
  else
    insert into public.coven_program_assignments (program_id, coven_id, rank_id, assigned_by) values (prog.id, prog.coven_id, p_rank, auth.uid())
    on conflict do nothing;
  end if;
  for person in
    select user_id from public.coven_members
    where coven_id = prog.coven_id and status = 'active' and (user_id = p_user or (p_rank is not null and rank_id = p_rank))
  loop
    if (public.coven_program_enroll(prog.id, person, auth.uid())).id is not null then n := n + 1; end if;
  end loop;
  return n;
end;
$$;

-- Stop assigning (people already enrolled carry on unless withdrawn).
create or replace function public.unassign_coven_program(p_assignment uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.coven_program_assignments;
begin
  select * into a from public.coven_program_assignments where id = p_assignment;
  if a.id is null then return false; end if;
  if not public.coven_program_manager(a.coven_id) then
    raise exception 'Only those the coven''s head has chosen can assign its programs.';
  end if;
  delete from public.coven_program_assignments where id = a.id;
  return true;
end;
$$;

-- Begin a program members may take up themselves.
create or replace function public.start_coven_program(p_program uuid)
returns public.coven_program_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  prog public.coven_programs;
  saved public.coven_program_enrollments;
begin
  select * into prog from public.coven_programs where id = p_program;
  if prog.id is null or prog.status <> 'open' then raise exception 'That program isn''t open.'; end if;
  if not public.coven_in_good_standing(prog.coven_id) then
    raise exception 'Sign the coven''s current agreements before beginning a program.';
  end if;
  if not prog.self_enroll and not exists (
    select 1 from public.coven_program_assignments a
    join public.coven_members m on m.coven_id = a.coven_id and m.user_id = auth.uid() and m.status = 'active'
    where a.program_id = prog.id and (a.user_id = auth.uid() or a.rank_id = m.rank_id)
  ) then
    raise exception 'This program is begun when the coven assigns it to you.';
  end if;
  saved := public.coven_program_enroll(prog.id, auth.uid(), auth.uid());
  return saved;
end;
$$;

-- Someone who joins or takes a position is enrolled in what's assigned to it.
create or replace function public.coven_program_enroll_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  a record;
begin
  if new.status <> 'active' then return new; end if;
  if tg_op = 'UPDATE' and new.rank_id is not distinct from old.rank_id and old.status = 'active' then return new; end if;
  for a in
    select program_id from public.coven_program_assignments
    where coven_id = new.coven_id and (rank_id = new.rank_id or user_id = new.user_id)
  loop
    perform public.coven_program_enroll(a.program_id, new.user_id, null);
  end loop;
  return new;
end;
$$;

drop trigger if exists coven_members_enroll_programs on public.coven_members;
create trigger coven_members_enroll_programs after insert or update of rank_id, status on public.coven_members
  for each row execute function public.coven_program_enroll_member();

-- Pause, resume or withdraw an enrollment. Program managers may do any; the
-- person may withdraw themselves (no one is held in a program).
create or replace function public.set_coven_enrollment_status(p_enrollment uuid, p_status text)
returns public.coven_program_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.coven_program_enrollments;
begin
  select * into e from public.coven_program_enrollments where id = p_enrollment for update;
  if e.id is null then raise exception 'That enrollment was not found.'; end if;
  if p_status not in ('active', 'paused', 'withdrawn') then raise exception 'Unknown status.'; end if;
  if e.status = 'completed' then raise exception 'That program is already finished.'; end if;
  if not (public.coven_program_manager(e.coven_id) or (e.user_id = auth.uid() and p_status = 'withdrawn')) then
    raise exception 'Only those who manage the coven''s programs can do that.';
  end if;
  update public.coven_program_enrollments set status = p_status, updated_at = now() where id = e.id returning * into e;
  return e;
end;
$$;

-- ---------------------------------------------------------------------------
-- Doing the work
-- ---------------------------------------------------------------------------

-- Log a task: one more time done (p_count), and/or what they wrote. When it's
-- been done as many times as asked it's sent for sign-off, or counted done if
-- the task is checked by the person themselves.
create or replace function public.record_coven_task(p_enrollment uuid, p_task uuid, p_response text default null, p_count integer default 1)
returns public.coven_program_progress
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.coven_program_enrollments;
  t public.coven_program_tasks;
  current_position integer;
  task_position integer;
  saved public.coven_program_progress;
  done integer;
begin
  select * into e from public.coven_program_enrollments where id = p_enrollment for update;
  if e.id is null or e.user_id <> auth.uid() then raise exception 'That isn''t your program.'; end if;
  if e.status <> 'active' then raise exception 'This program is % for now.', case e.status when 'paused' then 'paused' else e.status end; end if;
  if not public.coven_in_good_standing(e.coven_id) then raise exception 'Sign the coven''s current agreements to carry on.'; end if;
  select * into t from public.coven_program_tasks where id = p_task and program_id = e.program_id;
  if t.id is null then raise exception 'That task isn''t part of this program.'; end if;
  select position into current_position from public.coven_program_stages where id = e.stage_id;
  select position into task_position from public.coven_program_stages where id = t.stage_id;
  if task_position > coalesce(current_position, 0) then raise exception 'That task belongs to a later stage.'; end if;
  if p_count is null or p_count < 0 or p_count > 400 then raise exception 'Count it from 0 to 400 times.'; end if;
  if t.response = 'text' and coalesce(btrim(p_response), '') = '' and p_count > 0
     and not exists (select 1 from public.coven_program_progress where enrollment_id = e.id and task_id = t.id and response is not null) then
    raise exception 'Write your response for this task.';
  end if;

  select * into saved from public.coven_program_progress where enrollment_id = e.id and task_id = t.id for update;
  if saved.status = 'approved' then raise exception 'That task is already signed off.'; end if;
  if saved.status = 'submitted' and p_count > 0 then raise exception 'That task is waiting for sign-off.'; end if;
  done := least(t.times, coalesce(saved.times_done, 0) + p_count);
  if saved.id is null then
    insert into public.coven_program_progress (enrollment_id, task_id, program_id, coven_id, user_id, times_done, response)
    values (e.id, t.id, e.program_id, e.coven_id, e.user_id, done, nullif(btrim(p_response), ''))
    returning * into saved;
  else
    update public.coven_program_progress
    set times_done = done, response = coalesce(nullif(btrim(p_response), ''), response), updated_at = now()
    where id = saved.id returning * into saved;
  end if;
  if done >= t.times then
    update public.coven_program_progress
    set status = case when t.checked_by = 'self' then 'approved' else 'submitted' end, submitted_at = now(),
        checked_by = case when t.checked_by = 'self' then auth.uid() else null end,
        checked_at = case when t.checked_by = 'self' then now() else null end, feedback = null, updated_at = now()
    where id = saved.id returning * into saved;
  elsif saved.status = 'returned' then
    update public.coven_program_progress set status = 'in_progress', updated_at = now() where id = saved.id returning * into saved;
  end if;
  return saved;
end;
$$;

-- Whether this person may sign off that task for that member.
create or replace function public.coven_can_check(p_coven uuid, p_user uuid, p_checked_by text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_user <> auth.uid() and (
    public.coven_program_manager(p_coven)
    or (p_checked_by in ('mentor', 'self') and public.coven_is_mentor_of(p_coven, p_user) and public.coven_in_good_standing(p_coven))
  );
$$;

-- Sign off a task, or send it back with feedback.
create or replace function public.check_coven_task(p_progress uuid, p_approve boolean, p_feedback text default null)
returns public.coven_program_progress
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_program_progress;
  t public.coven_program_tasks;
begin
  select * into saved from public.coven_program_progress where id = p_progress for update;
  if saved.id is null then raise exception 'That work was not found.'; end if;
  select * into t from public.coven_program_tasks where id = saved.task_id;
  if not public.coven_can_check(saved.coven_id, saved.user_id, t.checked_by) then
    raise exception 'Only % can sign this off.', case t.checked_by when 'manager' then 'a program manager' else 'their mentor or a program manager' end;
  end if;
  update public.coven_program_progress
  set status = case when p_approve then 'approved' else 'returned' end,
      times_done = case when p_approve then t.times else times_done end,
      checked_by = auth.uid(), checked_at = now(), feedback = nullif(btrim(p_feedback), ''), updated_at = now()
  where id = saved.id returning * into saved;
  return saved;
end;
$$;

-- What still stands between someone and passing their current stage.
create or replace function public.coven_stage_open_items(p_enrollment uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'tasks_left', (
      select count(*) from public.coven_program_tasks t
      where t.stage_id = e.stage_id and not t.optional
        and not exists (select 1 from public.coven_program_progress p where p.enrollment_id = e.id and p.task_id = t.id and p.status = 'approved')
    ),
    'days_left', greatest(0, coalesce(s.min_days, 0) - floor(extract(epoch from (now() - coalesce(e.stage_started_at, e.started_at))) / 86400)::integer)
  )
  from public.coven_program_enrollments e
  left join public.coven_program_stages s on s.id = e.stage_id
  where e.id = p_enrollment;
$$;

-- Confirm someone has passed their current stage and move them on; after
-- the last stage the program is finished (and they rise to its position, if
-- it gives one). Program managers may pass a stage early (p_override).
create or replace function public.pass_coven_stage(p_enrollment uuid, p_note text default null, p_override boolean default false)
returns public.coven_program_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.coven_program_enrollments;
  s public.coven_program_stages;
  prog public.coven_programs;
  left_items jsonb;
  next_stage uuid;
  manager boolean;
begin
  select * into e from public.coven_program_enrollments where id = p_enrollment for update;
  if e.id is null then raise exception 'That enrollment was not found.'; end if;
  if e.status <> 'active' then raise exception 'This program isn''t under way.'; end if;
  select * into s from public.coven_program_stages where id = e.stage_id;
  if s.id is null then raise exception 'There is no stage to pass.'; end if;
  manager := public.coven_program_manager(e.coven_id) and e.user_id <> auth.uid();
  if not (
    manager
    or (s.passed_by = 'mentor' and public.coven_is_mentor_of(e.coven_id, e.user_id) and public.coven_in_good_standing(e.coven_id))
    or (s.passed_by = 'self' and e.user_id = auth.uid() and public.coven_in_good_standing(e.coven_id))
  ) then
    raise exception 'Only % confirms this stage.', case s.passed_by when 'manager' then 'a program manager' when 'mentor' then 'their mentor or a program manager' else 'the person in it' end;
  end if;
  left_items := public.coven_stage_open_items(e.id);
  if not (manager and p_override) then
    if (left_items->>'tasks_left')::integer > 0 then
      raise exception '% still to be signed off in this stage.', case when (left_items->>'tasks_left')::integer = 1 then 'One task is' else (left_items->>'tasks_left') || ' tasks are' end;
    end if;
    if (left_items->>'days_left')::integer > 0 then
      raise exception 'This stage asks for % more days.', left_items->>'days_left';
    end if;
  end if;

  insert into public.coven_program_stage_passes (enrollment_id, stage_id, coven_id, user_id, passed_by, note)
  values (e.id, s.id, e.coven_id, e.user_id, auth.uid(), nullif(btrim(p_note), ''))
  on conflict do nothing;
  select id into next_stage from public.coven_program_stages
  where program_id = e.program_id and position > s.position order by position limit 1;
  if next_stage is not null then
    update public.coven_program_enrollments set stage_id = next_stage, stage_started_at = now(), updated_at = now()
    where id = e.id returning * into e;
  else
    update public.coven_program_enrollments set status = 'completed', completed_at = now(), stage_id = null, updated_at = now()
    where id = e.id returning * into e;
    select * into prog from public.coven_programs where id = e.program_id;
    if prog.award_rank_id is not null then
      update public.coven_members m set rank_id = prog.award_rank_id
      where m.coven_id = e.coven_id and m.user_id = e.user_id and m.status = 'active'
        and coalesce((select r.level from public.coven_ranks r where r.id = m.rank_id), 0) < (select r.level from public.coven_ranks r where r.id = prog.award_rank_id)
        and m.user_id is distinct from (select c.founder_id from public.covens c where c.id = e.coven_id);
    end if;
  end if;
  return e;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants on the functions
-- ---------------------------------------------------------------------------

revoke execute on function public.coven_program_prune(uuid, uuid[], uuid[]), public.coven_program_enroll(uuid, uuid, uuid),
  public.coven_program_enroll_member() from public, anon, authenticated;
revoke execute on function
  public.set_coven_grant(uuid, uuid, text, boolean), public.set_coven_mentor(uuid, uuid, uuid),
  public.save_coven_program(uuid, uuid, jsonb, jsonb), public.copy_coven_program_template(uuid, text),
  public.set_coven_program_status(uuid, text), public.assign_coven_program(uuid, uuid, uuid), public.unassign_coven_program(uuid),
  public.start_coven_program(uuid), public.set_coven_enrollment_status(uuid, text),
  public.record_coven_task(uuid, uuid, text, integer), public.check_coven_task(uuid, boolean, text),
  public.pass_coven_stage(uuid, text, boolean), public.coven_stage_open_items(uuid),
  public.coven_is_mentor_of(uuid, uuid), public.coven_sees_progress(uuid, uuid), public.coven_program_visible(uuid),
  public.coven_program_manager(uuid), public.coven_can_check(uuid, uuid, text)
from public, anon;
grant execute on function
  public.set_coven_grant(uuid, uuid, text, boolean), public.set_coven_mentor(uuid, uuid, uuid),
  public.save_coven_program(uuid, uuid, jsonb, jsonb), public.copy_coven_program_template(uuid, text),
  public.set_coven_program_status(uuid, text), public.assign_coven_program(uuid, uuid, uuid), public.unassign_coven_program(uuid),
  public.start_coven_program(uuid), public.set_coven_enrollment_status(uuid, text),
  public.record_coven_task(uuid, uuid, text, integer), public.check_coven_task(uuid, boolean, text),
  public.pass_coven_stage(uuid, text, boolean), public.coven_stage_open_items(uuid),
  public.coven_is_mentor_of(uuid, uuid), public.coven_sees_progress(uuid, uuid), public.coven_program_visible(uuid),
  public.coven_program_manager(uuid), public.coven_can_check(uuid, uuid, text)
to authenticated;
