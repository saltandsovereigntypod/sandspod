-- NOT YET APPLIED. Needs 20261101000000_coven_ritual_contributions.sql first
-- (coven_ritual_settings, coven_assignees_include, coven_clean_assignees).
--
-- The members' record: who has been taking part in the coven and who hasn't,
-- so its head can see how each member is doing (and, if it comes to it,
-- decide whether they stay).
--
-- * Attendance: when a member opens a ritual while it is under way, the app
--   and the website call record_coven_ritual_presence (once is enough; again
--   changes nothing). Those who lead rituals, and those who see the record,
--   can correct it ("was there in person" / "wasn't there"). Rituals held
--   before this was added show attendance as not recorded
--   (coven_attendance_since).
-- * "Can't make it": a member answering Can't make it to a rite can add a
--   short note for the leaders. Leaders can mark an absence excused.
-- * Mentor check-ins: a mentor logs when they met their mentee, with a note.
--   The head, those who see the record and that mentor read them; the mentee
--   only if the head chooses (coven_ritual_settings.mentees_see_checkins).
-- * Leader notes: private notes on a member, read only by those who see the
--   record (never by the member themselves).
-- * Removals: removing or banning someone through remove_coven_member keeps
--   the reason with their record.
-- * Who sees the record: the coven's head (its founder) always, the site's
--   moderators, and the positions and people the head chooses
--   (coven_ritual_settings.record_viewers), as with ritual participation.
--   Each member sees their own standing (never leader notes).
--
-- The record is read through coven_member_record_overview and
-- coven_member_record, which check who is asking. They give counts and kinds
-- of what people wrote for rituals, never the words, and count chat
-- messages in the whole coven's chat only (never one-to-one or group talk,
-- and never what was said).

-- ---------------------------------------------------------------------------
-- Settings: who sees the record, and whether mentees read their check-ins
-- ---------------------------------------------------------------------------

alter table public.coven_ritual_settings add column if not exists record_viewers jsonb not null default '[]'::jsonb
  check (jsonb_typeof(record_viewers) = 'array' and jsonb_array_length(record_viewers) <= 40);
alter table public.coven_ritual_settings add column if not exists mentees_see_checkins boolean not null default false;

-- When attendance began to be kept: set once, the first time this runs.
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'coven_attendance_since' and pronamespace = 'public'::regnamespace) then
    execute format(
      'create function public.coven_attendance_since() returns timestamptz language sql immutable as %L',
      format('select %L::timestamptz', now())
    );
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.coven_ritual_attendance (
  ritual_id uuid not null references public.coven_rituals (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- null: nothing known (only a note sent ahead); true: there; false: a leader says they weren't.
  present boolean,
  -- When they first opened the ritual while it was under way.
  joined_at timestamptz,
  -- A leader's correction.
  marked_by uuid references auth.users (id) on delete set null,
  marked_at timestamptz,
  -- Their note with "Can't make it".
  apology text check (apology is null or char_length(apology) <= 280),
  apology_at timestamptz,
  excused boolean not null default false,
  excused_by uuid references auth.users (id) on delete set null,
  excused_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (ritual_id, user_id)
);

create index if not exists coven_ritual_attendance_member_idx on public.coven_ritual_attendance (coven_id, user_id);

create table if not exists public.coven_mentor_checkins (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  -- The mentee.
  user_id uuid not null references auth.users (id) on delete cascade,
  mentor_id uuid not null references auth.users (id) on delete cascade,
  met_on date not null default current_date,
  note text check (note is null or char_length(note) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists coven_mentor_checkins_member_idx on public.coven_mentor_checkins (coven_id, user_id, met_on desc);

create table if not exists public.coven_member_notes (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  -- Whom the note is about.
  user_id uuid not null references auth.users (id) on delete cascade,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists coven_member_notes_member_idx on public.coven_member_notes (coven_id, user_id, created_at desc);

create table if not exists public.coven_member_removals (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('removed', 'banned')),
  reason text check (reason is null or char_length(reason) <= 1000),
  removed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists coven_member_removals_member_idx on public.coven_member_removals (coven_id, user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Who sees what
-- ---------------------------------------------------------------------------

-- The coven's head always (and the site's moderators); otherwise the
-- positions and people the head chose.
create or replace function public.coven_sees_record(p_coven uuid)
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
      where st.coven_id = p_coven and jsonb_array_length(st.record_viewers) > 0
        and public.coven_permission(p_coven, 'member')
        and public.coven_assignees_include(p_coven, st.record_viewers, auth.uid())
    );
$$;

-- Who may correct attendance and excuse absences: those who lead the coven's
-- rituals, and those who see the record.
create or replace function public.coven_marks_attendance(p_coven uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_community_moderator()
    or (public.coven_in_good_standing(p_coven) and (public.coven_permission(p_coven, 'lead') or public.coven_sees_record(p_coven)));
$$;

create or replace function public.coven_mentees_see_checkins(p_coven uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select mentees_see_checkins from public.coven_ritual_settings where coven_id = p_coven), false);
$$;

alter table public.coven_ritual_attendance enable row level security;
alter table public.coven_mentor_checkins enable row level security;
alter table public.coven_member_notes enable row level security;
alter table public.coven_member_removals enable row level security;

drop policy if exists "People see their own attendance; leaders see the coven's" on public.coven_ritual_attendance;
create policy "People see their own attendance; leaders see the coven's" on public.coven_ritual_attendance
  for select to authenticated using (
    user_id = auth.uid() or public.coven_permission(coven_id, 'lead') or public.coven_sees_record(coven_id) or public.is_community_moderator()
  );
drop policy if exists "Mentors, record keepers and (if allowed) mentees see check-ins" on public.coven_mentor_checkins;
create policy "Mentors, record keepers and (if allowed) mentees see check-ins" on public.coven_mentor_checkins
  for select to authenticated using (
    mentor_id = auth.uid() or public.coven_sees_record(coven_id)
    or (user_id = auth.uid() and public.coven_mentees_see_checkins(coven_id))
  );
drop policy if exists "Record keepers see notes about others" on public.coven_member_notes;
create policy "Record keepers see notes about others" on public.coven_member_notes
  for select to authenticated using (public.coven_sees_record(coven_id) and user_id <> auth.uid());
drop policy if exists "Record keepers see removals" on public.coven_member_removals;
create policy "Record keepers see removals" on public.coven_member_removals
  for select to authenticated using (public.coven_sees_record(coven_id) and user_id <> auth.uid());

-- ---------------------------------------------------------------------------
-- Attendance
-- ---------------------------------------------------------------------------

-- Called when a member opens a ritual that is under way. Once is enough;
-- a leader's correction stands.
create or replace function public.record_coven_ritual_presence(p_ritual uuid)
returns public.coven_ritual_attendance
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  saved public.coven_ritual_attendance;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.status <> 'live' then return null; end if;
  if not public.coven_permission(r.coven_id, 'member') then return null; end if;
  insert into public.coven_ritual_attendance (ritual_id, coven_id, user_id, present, joined_at, updated_at)
  values (r.id, r.coven_id, auth.uid(), true, now(), now())
  on conflict (ritual_id, user_id) do update
    set present = case when coven_ritual_attendance.marked_by is null then true else coven_ritual_attendance.present end,
        joined_at = coalesce(coven_ritual_attendance.joined_at, now()),
        updated_at = case when coven_ritual_attendance.joined_at is null then now() else coven_ritual_attendance.updated_at end
  returning * into saved;
  return saved;
end;
$$;

-- A leader's correction: p_present true ("was there in person"), false
-- ("wasn't there"), or null to go back to what was recorded.
create or replace function public.mark_coven_ritual_attendance(p_ritual uuid, p_user uuid, p_present boolean)
returns public.coven_ritual_attendance
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  saved public.coven_ritual_attendance;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null then raise exception 'That ritual was not found.'; end if;
  if not public.coven_marks_attendance(r.coven_id) then raise exception 'Only those who lead the coven''s rituals can correct attendance.'; end if;
  if r.status not in ('live', 'done') then raise exception 'Attendance is kept once a ritual has begun.'; end if;
  if not exists (select 1 from public.coven_members where coven_id = r.coven_id and user_id = p_user) then
    raise exception 'That person is not in this coven.';
  end if;
  insert into public.coven_ritual_attendance (ritual_id, coven_id, user_id, present, marked_by, marked_at, updated_at)
  values (r.id, r.coven_id, p_user, p_present, case when p_present is null then null else auth.uid() end, case when p_present is null then null else now() end, now())
  on conflict (ritual_id, user_id) do update
    set present = case when p_present is null then coven_ritual_attendance.joined_at is not null else p_present end,
        marked_by = case when p_present is null then null else auth.uid() end,
        marked_at = case when p_present is null then null else now() end,
        updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

-- "Can't make it", with a short note for the leaders (null takes the note back).
-- Answers the rite as not going too.
create or replace function public.send_coven_ritual_apology(p_ritual uuid, p_note text)
returns public.coven_ritual_attendance
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  saved public.coven_ritual_attendance;
  note text := nullif(btrim(coalesce(p_note, '')), '');
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.status not in ('scheduled', 'live') then raise exception 'That rite isn''t on the calendar.'; end if;
  if not public.coven_permission(r.coven_id, 'member') then raise exception 'Only members can answer.'; end if;
  if char_length(coalesce(note, '')) > 280 then raise exception 'Keep the note to 280 characters.'; end if;
  insert into public.coven_ritual_rsvps (ritual_id, coven_id, user_id, response, updated_at)
  values (r.id, r.coven_id, auth.uid(), 'not_going', now())
  on conflict (ritual_id, user_id) do update set response = 'not_going', updated_at = now();
  insert into public.coven_ritual_attendance (ritual_id, coven_id, user_id, apology, apology_at, updated_at)
  values (r.id, r.coven_id, auth.uid(), note, case when note is null then null else now() end, now())
  on conflict (ritual_id, user_id) do update
    set apology = note, apology_at = case when note is null then null else now() end, updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

-- Mark an absence excused (or not).
create or replace function public.excuse_coven_ritual_absence(p_ritual uuid, p_user uuid, p_excused boolean)
returns public.coven_ritual_attendance
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  saved public.coven_ritual_attendance;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null then raise exception 'That ritual was not found.'; end if;
  if not public.coven_marks_attendance(r.coven_id) then raise exception 'Only those who lead the coven''s rituals can excuse an absence.'; end if;
  if not exists (select 1 from public.coven_members where coven_id = r.coven_id and user_id = p_user) then
    raise exception 'That person is not in this coven.';
  end if;
  insert into public.coven_ritual_attendance (ritual_id, coven_id, user_id, excused, excused_by, excused_at, updated_at)
  values (r.id, r.coven_id, p_user, coalesce(p_excused, false), case when p_excused then auth.uid() end, case when p_excused then now() end, now())
  on conflict (ritual_id, user_id) do update
    set excused = coalesce(p_excused, false),
        excused_by = case when p_excused then auth.uid() end,
        excused_at = case when p_excused then now() end,
        updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

-- ---------------------------------------------------------------------------
-- Mentor check-ins, leader notes, removals
-- ---------------------------------------------------------------------------

create or replace function public.log_coven_mentor_checkin(p_coven uuid, p_user uuid, p_met_on date, p_note text)
returns public.coven_mentor_checkins
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_mentor_checkins;
begin
  if not (public.coven_in_good_standing(p_coven) and public.coven_is_mentor_of(p_coven, p_user)) then
    raise exception 'Only their mentor logs check-ins.';
  end if;
  if p_met_on is not null and p_met_on > current_date + 1 then raise exception 'Choose a day that has already come.'; end if;
  insert into public.coven_mentor_checkins (coven_id, user_id, mentor_id, met_on, note)
  values (p_coven, p_user, auth.uid(), coalesce(p_met_on, current_date), nullif(btrim(coalesce(p_note, '')), ''))
  returning * into saved;
  return saved;
end;
$$;

create or replace function public.remove_coven_mentor_checkin(p_checkin uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.coven_mentor_checkins;
begin
  select * into c from public.coven_mentor_checkins where id = p_checkin;
  if c.id is null then return false; end if;
  if not (c.mentor_id = auth.uid() or public.is_community_moderator()
          or exists (select 1 from public.covens where id = c.coven_id and founder_id = auth.uid())) then
    raise exception 'Only the mentor who logged it can take it back.';
  end if;
  delete from public.coven_mentor_checkins where id = c.id;
  return true;
end;
$$;

create or replace function public.add_coven_member_note(p_coven uuid, p_user uuid, p_body text)
returns public.coven_member_notes
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_member_notes;
begin
  if not (public.is_community_moderator() or (public.coven_in_good_standing(p_coven) and public.coven_sees_record(p_coven))) then
    raise exception 'Only those who keep the members'' record write notes in it.';
  end if;
  if p_user = auth.uid() then raise exception 'Notes are kept about others.'; end if;
  if not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_user) then
    raise exception 'That person is not in this coven.';
  end if;
  insert into public.coven_member_notes (coven_id, user_id, author_id, body)
  values (p_coven, p_user, auth.uid(), btrim(p_body))
  returning * into saved;
  return saved;
end;
$$;

create or replace function public.remove_coven_member_note(p_note uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n public.coven_member_notes;
begin
  select * into n from public.coven_member_notes where id = p_note;
  if n.id is null then return false; end if;
  if not (n.author_id = auth.uid() or public.is_community_moderator()
          or exists (select 1 from public.covens where id = n.coven_id and founder_id = auth.uid())) then
    raise exception 'Only whoever wrote a note, or the coven''s head, can remove it.';
  end if;
  delete from public.coven_member_notes where id = n.id;
  return true;
end;
$$;

-- Remove or ban someone (update_coven_member checks who may), keeping the reason with their record.
create or replace function public.remove_coven_member(p_coven uuid, p_user uuid, p_status text, p_reason text default null)
returns public.coven_members
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.coven_members;
begin
  if p_status not in ('removed', 'banned') then raise exception 'Choose to remove or to ban.'; end if;
  if char_length(coalesce(p_reason, '')) > 1000 then raise exception 'Keep the reason to 1000 characters.'; end if;
  updated := public.update_coven_member(p_coven, p_user, null, p_status, null, false);
  insert into public.coven_member_removals (coven_id, user_id, status, reason, removed_by)
  values (p_coven, p_user, p_status, nullif(btrim(coalesce(p_reason, '')), ''), auth.uid());
  return updated;
end;
$$;

-- The coven's head chooses who else sees the record, and whether mentees read their check-ins.
create or replace function public.set_coven_record_viewers(p_coven uuid, p_viewers jsonb, p_mentees_see_checkins boolean default null)
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
    raise exception 'Only the coven''s head chooses who sees the members'' record.';
  end if;
  viewers := public.coven_clean_assignees(p_coven, coalesce(p_viewers, '[]'::jsonb), 'Who sees the record', false);
  insert into public.coven_ritual_settings (coven_id, record_viewers, mentees_see_checkins, updated_by, updated_at)
  values (p_coven, viewers, coalesce(p_mentees_see_checkins, false), auth.uid(), now())
  on conflict (coven_id) do update
    set record_viewers = excluded.record_viewers,
        mentees_see_checkins = coalesce(p_mentees_see_checkins, coven_ritual_settings.mentees_see_checkins),
        updated_by = auth.uid(), updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reading the record
-- ---------------------------------------------------------------------------

-- Each programme a member is in, summed up (never what they wrote for it).
create or replace function public.coven_record_studies(p_coven uuid, p_users uuid[], p_withdrawn boolean)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', e.id, 'user_id', e.user_id, 'program_id', e.program_id, 'title', p.title, 'kind', p.kind, 'status', e.status,
    'started_at', e.started_at, 'completed_at', e.completed_at, 'stage_started_at', e.stage_started_at,
    'stage_title', st.title,
    'stage_index', case when st.id is null then null else (select count(*) from public.coven_program_stages s2 where s2.program_id = e.program_id and s2.position < st.position) end,
    'stage_count', (select count(*) from public.coven_program_stages s3 where s3.program_id = e.program_id),
    'tasks_required', (select count(*) from public.coven_program_tasks t where t.program_id = e.program_id and not t.optional),
    'tasks_approved', (select count(*) from public.coven_program_progress g join public.coven_program_tasks t on t.id = g.task_id where g.enrollment_id = e.id and g.status = 'approved' and not t.optional),
    'waiting', (select count(*) from public.coven_program_progress g where g.enrollment_id = e.id and g.status = 'submitted'),
    'returned', (select count(*) from public.coven_program_progress g where g.enrollment_id = e.id and g.status = 'returned'),
    'last_activity', greatest(
      e.started_at, e.stage_started_at, e.completed_at,
      (select max(g.updated_at) from public.coven_program_progress g where g.enrollment_id = e.id),
      (select max(g.submitted_at) from public.coven_program_progress g where g.enrollment_id = e.id),
      (select max(x.passed_at) from public.coven_program_stage_passes x where x.enrollment_id = e.id)
    )
  ) order by e.started_at), '[]'::jsonb)
  from public.coven_program_enrollments e
  join public.coven_programs p on p.id = e.program_id
  left join public.coven_program_stages st on st.id = e.stage_id
  where e.coven_id = p_coven and e.user_id = any (p_users) and (p_withdrawn or e.status <> 'withdrawn');
$$;

-- Everyone in the coven, for the overview: the rituals held since p_since
-- (null: ever), who was there, answered, did their part or wrote, their
-- studies, mentors and check-ins, and how much else they've done. The pages
-- sum it up (lib/covens/record.ts).
create or replace function public.coven_member_record_overview(p_coven uuid, p_since timestamptz default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  since timestamptz := coalesce(p_since, '-infinity'::timestamptz);
  people uuid[];
  out jsonb;
begin
  if not public.coven_sees_record(p_coven) then
    raise exception 'Only the coven''s head, and those they choose, see the members'' record.';
  end if;
  select coalesce(array_agg(user_id), '{}') into people from public.coven_members where coven_id = p_coven and status = 'active';
  with held as (
    select r.id, r.title, coalesce(r.started_at, r.scheduled_for, r.created_at) as held_at, r.status
    from public.coven_rituals r
    where r.coven_id = p_coven and r.status in ('done', 'live')
      and coalesce(r.started_at, r.scheduled_for, r.created_at) >= since
  )
  select jsonb_build_object(
    'since', p_since,
    'attendance_since', public.coven_attendance_since(),
    'now', now(),
    'members', coalesce((select jsonb_agg(jsonb_build_object('user_id', m.user_id, 'joined_at', m.joined_at, 'rank_id', m.rank_id, 'muted_until', m.muted_until))
      from public.coven_members m where m.coven_id = p_coven and m.status = 'active'), '[]'::jsonb),
    'rituals', coalesce((select jsonb_agg(jsonb_build_object('id', h.id, 'title', h.title, 'held_at', h.held_at, 'status', h.status) order by h.held_at) from held h), '[]'::jsonb),
    'attendance', coalesce((select jsonb_agg(jsonb_build_object('ritual_id', a.ritual_id, 'user_id', a.user_id, 'present', a.present, 'excused', a.excused, 'apology', a.apology_at is not null))
      from public.coven_ritual_attendance a join held h on h.id = a.ritual_id), '[]'::jsonb),
    'rsvps', coalesce((select jsonb_agg(jsonb_build_object('ritual_id', v.ritual_id, 'user_id', v.user_id, 'response', v.response))
      from public.coven_ritual_rsvps v join held h on h.id = v.ritual_id), '[]'::jsonb),
    'marks', coalesce((select jsonb_agg(jsonb_build_object('ritual_id', x.ritual_id, 'user_id', x.user_id, 'count', x.n))
      from (select k.ritual_id, k.user_id, count(*) as n from public.coven_ritual_step_marks k join held h on h.id = k.ritual_id group by k.ritual_id, k.user_id) x), '[]'::jsonb),
    'contributions', coalesce((select jsonb_agg(jsonb_build_object('ritual_id', x.ritual_id, 'user_id', x.user_id, 'count', x.n))
      from (select c.ritual_id, c.user_id, count(*) as n from public.coven_ritual_contributions c join held h on h.id = c.ritual_id group by c.ritual_id, c.user_id) x), '[]'::jsonb),
    'studies', public.coven_record_studies(p_coven, people, false),
    'mentors', coalesce((select jsonb_agg(jsonb_build_object('user_id', mm.user_id, 'mentor_id', mm.mentor_id, 'assigned_at', mm.assigned_at))
      from public.coven_mentors mm where mm.coven_id = p_coven), '[]'::jsonb),
    'checkins', coalesce((select jsonb_agg(jsonb_build_object('user_id', x.user_id, 'mentor_id', x.mentor_id, 'count', x.n, 'last', x.last))
      from (select ci.user_id, ci.mentor_id, count(*) as n, max(ci.met_on) as last from public.coven_mentor_checkins ci where ci.coven_id = p_coven group by ci.user_id, ci.mentor_id) x), '[]'::jsonb),
    'activity', coalesce((select jsonb_agg(jsonb_build_object(
        'user_id', u,
        'tendings', (select count(*) from public.coven_petition_tendings t where t.coven_id = p_coven and t.user_id = u and t.created_at >= since),
        'messages', (select count(*) from public.coven_messages g where g.coven_id = p_coven and g.user_id = u and g.conversation_id is null and g.deleted_at is null and g.created_at >= since),
        'last_tending', (select max(t.created_at) from public.coven_petition_tendings t where t.coven_id = p_coven and t.user_id = u),
        'last_message', (select max(g.created_at) from public.coven_messages g where g.coven_id = p_coven and g.user_id = u and g.conversation_id is null),
        'last_present', (select max(coalesce(a.joined_at, a.marked_at)) from public.coven_ritual_attendance a where a.coven_id = p_coven and a.user_id = u and a.present),
        'last_mark', (select max(k.created_at) from public.coven_ritual_step_marks k where k.coven_id = p_coven and k.user_id = u),
        'last_contribution', (select max(c.updated_at) from public.coven_ritual_contributions c where c.coven_id = p_coven and c.user_id = u),
        'last_rsvp', (select max(v.updated_at) from public.coven_ritual_rsvps v where v.coven_id = p_coven and v.user_id = u),
        'last_study', (select max(g.updated_at) from public.coven_program_progress g where g.coven_id = p_coven and g.user_id = u)
      )) from unnest(people) as u), '[]'::jsonb)
  ) into out;
  return out;
end;
$$;

-- One member's record since they joined (their own, for anyone: "My standing").
-- Leader notes and removals only for those who see the record, never about
-- themselves; mentor check-ins about them only for those who see the record
-- and, if the head allows it, for the member.
create or replace function public.coven_member_record(p_coven uuid, p_user uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  m public.coven_members;
  keeper boolean := public.coven_sees_record(p_coven);
  own boolean := p_user = auth.uid();
  checkins_open boolean;
  out jsonb;
begin
  select * into m from public.coven_members where coven_id = p_coven and user_id = p_user;
  if m.user_id is null then raise exception 'That person is not in this coven.'; end if;
  if not (keeper or (own and public.is_coven_member(p_coven))) then
    raise exception 'Only the coven''s head, and those they choose, see the members'' record.';
  end if;
  checkins_open := (keeper and not own) or public.coven_mentees_see_checkins(p_coven) or public.is_community_moderator();
  with rites as (
    select r.* from public.coven_rituals r
    where r.coven_id = p_coven and r.status in ('done', 'live', 'scheduled')
      and coalesce(r.started_at, r.scheduled_for, r.created_at) >= m.joined_at - interval '1 day'
  )
  select jsonb_build_object(
    'user_id', m.user_id, 'joined_at', m.joined_at, 'rank_id', m.rank_id, 'status', m.status, 'muted_until', m.muted_until,
    'attendance_since', public.coven_attendance_since(),
    'now', now(),
    'own', own,
    'keeper', keeper,
    'marks_attendance', public.coven_marks_attendance(p_coven),
    'rituals', coalesce((select jsonb_agg(jsonb_build_object(
        'id', r.id, 'title', r.title, 'status', r.status, 'occasion', r.occasion,
        'scheduled_for', r.scheduled_for, 'held_at', coalesce(r.started_at, r.scheduled_for, r.created_at),
        'rsvp', (select v.response from public.coven_ritual_rsvps v where v.ritual_id = r.id and v.user_id = p_user),
        'present', a.present, 'joined_at', a.joined_at, 'corrected', a.marked_by is not null,
        'excused', coalesce(a.excused, false), 'apology', a.apology, 'apology_sent', a.apology_at is not null,
        'steps', coalesce((select jsonb_agg(s.title order by s.position) from public.coven_ritual_step_marks k join public.coven_ritual_steps s on s.id = k.step_id where k.ritual_id = r.id and k.user_id = p_user), '[]'::jsonb),
        'finished', (select count(*) from public.coven_ritual_steps s where s.ritual_id = r.id and s.completed_by = p_user),
        'contributions', coalesce((select jsonb_agg(jsonb_build_object(
            'step', s.title,
            'kind', case when c.private or c.visibility = 'me' then null else c.kind end,
            'sealed', c.private or c.visibility = 'me',
            'status', c.status) order by s.position)
          from public.coven_ritual_contributions c join public.coven_ritual_steps s on s.id = c.step_id
          where c.ritual_id = r.id and c.user_id = p_user), '[]'::jsonb)
      ) order by coalesce(r.started_at, r.scheduled_for, r.created_at) desc)
      from rites r left join public.coven_ritual_attendance a on a.ritual_id = r.id and a.user_id = p_user), '[]'::jsonb),
    'studies', public.coven_record_studies(p_coven, array[p_user], true),
    'mentor', (select jsonb_build_object('mentor_id', mm.mentor_id, 'assigned_at', mm.assigned_at) from public.coven_mentors mm where mm.coven_id = p_coven and mm.user_id = p_user),
    'checkins_hidden', not checkins_open,
    'checkins', case when checkins_open then coalesce((select jsonb_agg(jsonb_build_object('id', ci.id, 'mentor_id', ci.mentor_id, 'met_on', ci.met_on, 'note', ci.note, 'created_at', ci.created_at) order by ci.met_on desc, ci.created_at desc)
      from public.coven_mentor_checkins ci where ci.coven_id = p_coven and ci.user_id = p_user), '[]'::jsonb) else '[]'::jsonb end,
    'mentees', coalesce((select jsonb_agg(jsonb_build_object(
        'user_id', mm.user_id, 'assigned_at', mm.assigned_at,
        'checkins', coalesce((select jsonb_agg(jsonb_build_object('id', ci.id, 'mentor_id', ci.mentor_id, 'met_on', ci.met_on, 'note', ci.note, 'created_at', ci.created_at) order by ci.met_on desc, ci.created_at desc)
          from public.coven_mentor_checkins ci where ci.coven_id = p_coven and ci.user_id = mm.user_id and ci.mentor_id = p_user), '[]'::jsonb),
        'studies', public.coven_record_studies(p_coven, array[mm.user_id], false)
      ) order by mm.assigned_at)
      from public.coven_mentors mm where mm.coven_id = p_coven and mm.mentor_id = p_user), '[]'::jsonb),
    'activity', jsonb_build_object(
      'tendings', (select count(*) from public.coven_petition_tendings t where t.coven_id = p_coven and t.user_id = p_user),
      'last_tending', (select max(t.created_at) from public.coven_petition_tendings t where t.coven_id = p_coven and t.user_id = p_user),
      'messages', (select count(*) from public.coven_messages g where g.coven_id = p_coven and g.user_id = p_user and g.conversation_id is null and g.deleted_at is null),
      'last_message', (select max(g.created_at) from public.coven_messages g where g.coven_id = p_coven and g.user_id = p_user and g.conversation_id is null)
    ),
    'notes', case when keeper and not own then coalesce((select jsonb_agg(jsonb_build_object('id', n.id, 'author_id', n.author_id, 'body', n.body, 'created_at', n.created_at) order by n.created_at desc)
      from public.coven_member_notes n where n.coven_id = p_coven and n.user_id = p_user), '[]'::jsonb) else '[]'::jsonb end,
    'removals', case when keeper and not own then coalesce((select jsonb_agg(jsonb_build_object('status', x.status, 'reason', x.reason, 'removed_by', x.removed_by, 'created_at', x.created_at) order by x.created_at desc)
      from public.coven_member_removals x where x.coven_id = p_coven and x.user_id = p_user), '[]'::jsonb) else '[]'::jsonb end
  ) into out;
  return out;
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may call what
-- ---------------------------------------------------------------------------

revoke execute on function public.coven_record_studies(uuid, uuid[], boolean) from public, anon, authenticated;
revoke execute on function
  public.coven_attendance_since(),
  public.coven_sees_record(uuid),
  public.coven_marks_attendance(uuid),
  public.coven_mentees_see_checkins(uuid),
  public.record_coven_ritual_presence(uuid),
  public.mark_coven_ritual_attendance(uuid, uuid, boolean),
  public.send_coven_ritual_apology(uuid, text),
  public.excuse_coven_ritual_absence(uuid, uuid, boolean),
  public.log_coven_mentor_checkin(uuid, uuid, date, text),
  public.remove_coven_mentor_checkin(uuid),
  public.add_coven_member_note(uuid, uuid, text),
  public.remove_coven_member_note(uuid),
  public.remove_coven_member(uuid, uuid, text, text),
  public.set_coven_record_viewers(uuid, jsonb, boolean),
  public.coven_member_record_overview(uuid, timestamptz),
  public.coven_member_record(uuid, uuid)
from public, anon;
grant execute on function
  public.coven_attendance_since(),
  public.coven_sees_record(uuid),
  public.coven_marks_attendance(uuid),
  public.coven_mentees_see_checkins(uuid),
  public.record_coven_ritual_presence(uuid),
  public.mark_coven_ritual_attendance(uuid, uuid, boolean),
  public.send_coven_ritual_apology(uuid, text),
  public.excuse_coven_ritual_absence(uuid, uuid, boolean),
  public.log_coven_mentor_checkin(uuid, uuid, date, text),
  public.remove_coven_mentor_checkin(uuid),
  public.add_coven_member_note(uuid, uuid, text),
  public.remove_coven_member_note(uuid),
  public.remove_coven_member(uuid, uuid, text, text),
  public.set_coven_record_viewers(uuid, jsonb, boolean),
  public.coven_member_record_overview(uuid, timestamptz),
  public.coven_member_record(uuid, uuid)
to authenticated;
