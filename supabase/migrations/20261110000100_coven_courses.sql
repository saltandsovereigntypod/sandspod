-- NOT YET APPLIED. Coven courses: lessons, tests and a conversation on every
-- step of a coven's programs, and practice logged session by session.
-- Additive and safe to run again (paste it whole).
--
-- * Lessons (coven_program_documents): documents a trainee reads, linked to
--   tasks in order (coven_program_task_documents). Each coven keeps its own
--   copies: a ready-made course's lessons are copied in (source_id is the
--   course lesson's id, so copying again reuses the coven's copy and keeps
--   its edits), and the coven writes its own. A lesson may carry a file (a
--   PDF or a picture) in the private 'coven-program-files' storage bucket,
--   under '<coven id>/…'. Only the coven's members read lessons and their
--   files; those who manage programs write them. Each trainee's "read" is
--   kept (coven_program_doc_reads).
-- * Tests (coven_program_quizzes): questions with their answer key, linked
--   to a task (coven_program_tasks.quiz_id). Only those who manage programs
--   read the table; a trainee is given the questions without the key
--   (coven_quiz_view) and sees the key, with explanations, only in their own
--   attempts, after submitting. submit_coven_quiz scores single, multi and
--   true-or-false questions here; written answers wait for the mentor or a
--   program manager (score_coven_quiz), points and a comment for each.
--   Passed when total / max reaches the test's pass mark; passing marks the
--   task done. Each test allows a number of retakes (2) with a wait between
--   attempts (24 hours); a program manager may allow one more
--   (allow_coven_quiz_retake). Attempts keep the questions as they were.
-- * A conversation on each step (coven_program_messages): one thread for
--   each task and each person in the program, between them and those who
--   oversee them: their mentor, those who manage programs and the coven's
--   head. Never other members. Read marks in coven_program_thread_reads;
--   coven_program_unread gives the counts. Phone notes: coven-notify
--   { program_thread_message_id }, once each (notified_at), to those
--   coven_program_thread_people names, as their "Training messages" choice
--   allows.
-- * Practice sessions: coven_program_progress.sessions keeps each session
--   ({ on, minutes, note }) logged by log_coven_practice.
-- Every write goes through the functions below.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.coven_program_documents (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  summary text check (summary is null or char_length(summary) <= 600),
  minutes integer check (minutes is null or minutes between 0 and 600),
  body text not null default '' check (char_length(body) <= 60000),
  -- A file in the 'coven-program-files' bucket, always under the coven's own folder.
  file_path text check (file_path is null or (char_length(file_path) <= 300 and split_part(file_path, '/', 1) = coven_id::text)),
  file_name text check (file_name is null or char_length(file_name) <= 200),
  file_type text check (file_type is null or file_type in ('application/pdf', 'image/png', 'image/jpeg', 'image/webp')),
  -- The ready-made lesson (CourseDoc id) it was copied from.
  source_id text check (source_id is null or char_length(source_id) <= 120),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists coven_program_documents_source_idx on public.coven_program_documents (coven_id, source_id) where source_id is not null;
create index if not exists coven_program_documents_coven_idx on public.coven_program_documents (coven_id, title);

create table if not exists public.coven_program_quizzes (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  intro text check (intro is null or char_length(intro) <= 4000),
  pass_percent integer not null default 80 check (pass_percent between 1 and 100),
  retakes integer not null default 2 check (retakes between 0 and 20),
  wait_hours integer not null default 24 check (wait_hours between 0 and 720),
  -- [{ id, type, prompt, options?, correct?, points, explanation, rubric? }] (app/src/lib/covens/courses/types.ts Question)
  questions jsonb not null default '[]'::jsonb check (jsonb_typeof(questions) = 'array' and jsonb_array_length(questions) <= 60),
  source_id text check (source_id is null or char_length(source_id) <= 120),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists coven_program_quizzes_source_idx on public.coven_program_quizzes (coven_id, source_id) where source_id is not null;

alter table public.coven_program_tasks add column if not exists quiz_id uuid references public.coven_program_quizzes (id) on delete set null;

create table if not exists public.coven_program_task_documents (
  task_id uuid not null references public.coven_program_tasks (id) on delete cascade,
  document_id uuid not null references public.coven_program_documents (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  position integer not null default 0,
  primary key (task_id, document_id)
);

create index if not exists coven_program_task_documents_doc_idx on public.coven_program_task_documents (document_id);
create index if not exists coven_program_task_documents_coven_idx on public.coven_program_task_documents (coven_id);

create table if not exists public.coven_program_doc_reads (
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid not null references public.coven_program_documents (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, document_id)
);

create index if not exists coven_program_doc_reads_coven_idx on public.coven_program_doc_reads (coven_id, user_id);

-- Practice sessions, and extra test attempts a program manager allowed.
alter table public.coven_program_progress add column if not exists sessions jsonb not null default '[]'::jsonb;
alter table public.coven_program_progress add column if not exists quiz_extra integer not null default 0;
alter table public.coven_program_progress add column if not exists quiz_extra_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'coven_program_progress_sessions_check') then
    alter table public.coven_program_progress add constraint coven_program_progress_sessions_check
      check (jsonb_typeof(sessions) = 'array' and jsonb_array_length(sessions) <= 400 and quiz_extra between 0 and 50);
  end if;
end;
$$;

create table if not exists public.coven_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.coven_program_enrollments (id) on delete cascade,
  task_id uuid not null references public.coven_program_tasks (id) on delete cascade,
  quiz_id uuid references public.coven_program_quizzes (id) on delete set null,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  number integer not null default 1,
  -- The test as it was taken, with its key (shown to the trainee only now, after submitting).
  title text not null default '',
  questions jsonb not null default '[]'::jsonb,
  pass_percent integer not null default 80,
  -- { "<question id>": [indices] | "written answer" }
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  auto_score numeric not null default 0,
  -- { "<question id>": { "points": n, "comment": "…" } } for written answers
  manual_scores jsonb not null default '{}'::jsonb check (jsonb_typeof(manual_scores) = 'object'),
  total numeric,
  max numeric not null default 0,
  -- submitted: written answers wait to be scored; scored: scores saved, not yet released; passed / failed: final.
  status text not null default 'submitted' check (status in ('submitted', 'scored', 'passed', 'failed')),
  scored_by uuid references auth.users (id) on delete set null,
  feedback text check (feedback is null or char_length(feedback) <= 4000),
  created_at timestamptz not null default now(),
  submitted_at timestamptz not null default now(),
  scored_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists coven_quiz_attempts_enrollment_idx on public.coven_quiz_attempts (enrollment_id, task_id, number);
create index if not exists coven_quiz_attempts_coven_idx on public.coven_quiz_attempts (coven_id, status);

create table if not exists public.coven_program_messages (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.coven_program_enrollments (id) on delete cascade,
  task_id uuid not null references public.coven_program_tasks (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  -- The person going through the program (whose thread it is).
  trainee_id uuid not null references auth.users (id) on delete cascade,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  body text check ((deleted_at is not null and body is null) or char_length(btrim(body)) between 1 and 4000),
  -- A test attempt it's about, when written from a result.
  attempt_id uuid references public.coven_quiz_attempts (id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  -- Set by coven-notify when it has rung phones for it (once).
  notified_at timestamptz
);

create index if not exists coven_program_messages_thread_idx on public.coven_program_messages (enrollment_id, task_id, created_at);
create index if not exists coven_program_messages_coven_idx on public.coven_program_messages (coven_id, created_at desc);

create table if not exists public.coven_program_thread_reads (
  enrollment_id uuid not null references public.coven_program_enrollments (id) on delete cascade,
  task_id uuid not null references public.coven_program_tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (enrollment_id, task_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Who
-- ---------------------------------------------------------------------------

-- Whether that member manages the coven's programs or leads the coven (the
-- same powers coven_permission gives for 'programs' and 'manage'), for
-- deciding who hears; not about the caller.
create or replace function public.coven_user_oversees_programs(p_coven uuid, p_user uuid)
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
    where m.coven_id = p_coven and m.user_id = p_user and m.status = 'active' and c.status = 'active'
      and (
        c.founder_id = p_user
        or coalesce(r.can_manage or r.can_manage_programs, false)
        or exists (select 1 from public.coven_grants g where g.coven_id = p_coven and g.user_id = p_user and g.power = 'manage_programs')
      )
  );
$$;

-- Whether the caller oversees that member's training: their mentor, someone
-- who manages programs, or the coven's head. Never the member themselves,
-- never other members, and not site moderators.
create or replace function public.coven_program_overseer(p_coven uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and p_user <> auth.uid() and (
    public.coven_is_mentor_of(p_coven, p_user)
    or public.coven_permission(p_coven, 'programs')
    or public.coven_permission(p_coven, 'manage')
  );
$$;

-- Who may read a step's conversation: the person in the program (while a
-- member) and those who oversee them.
create or replace function public.coven_program_thread_visible(p_enrollment uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coven_program_enrollments e
    where e.id = p_enrollment
      and (
        (e.user_id = auth.uid() and public.is_coven_member(e.coven_id))
        or public.coven_program_overseer(e.coven_id, e.user_id)
      )
  );
$$;

-- Who follows a step's conversation (unread counts and phone notes): the
-- person in the program, their mentor, and whoever else has written in it;
-- when there's no mentor and no one overseeing has written yet, everyone who
-- manages programs or leads the coven. Only those who may read it.
create or replace function public.coven_program_thread_people(p_enrollment uuid, p_task uuid)
returns uuid[]
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  e public.coven_program_enrollments;
  mentor uuid;
  people uuid[];
begin
  select * into e from public.coven_program_enrollments where id = p_enrollment;
  if e.id is null then return '{}'; end if;
  select mentor_id into mentor from public.coven_mentors where coven_id = e.coven_id and user_id = e.user_id;
  if mentor is not null and not exists (select 1 from public.coven_members where coven_id = e.coven_id and user_id = mentor and status = 'active') then
    mentor := null;
  end if;
  select array_agg(distinct m.author_id) into people
  from public.coven_program_messages m
  where m.enrollment_id = e.id and m.task_id = p_task and m.author_id is not null and m.author_id <> e.user_id
    and (m.author_id = mentor or public.coven_user_oversees_programs(e.coven_id, m.author_id));
  people := coalesce(people, '{}');
  if mentor is not null then people := array_append(people, mentor); end if;
  if not exists (select 1 from unnest(people)) then
    select coalesce(array_agg(m.user_id), '{}') into people
    from public.coven_members m
    where m.coven_id = e.coven_id and m.status = 'active' and m.user_id <> e.user_id and public.coven_user_oversees_programs(e.coven_id, m.user_id);
  end if;
  if exists (select 1 from public.coven_members where coven_id = e.coven_id and user_id = e.user_id and status = 'active') then
    people := array_append(people, e.user_id);
  end if;
  return (select coalesce(array_agg(distinct p), '{}') from unnest(people) p);
end;
$$;

-- ---------------------------------------------------------------------------
-- Row-level security: reads only; every write is a function below
-- ---------------------------------------------------------------------------

alter table public.coven_program_documents enable row level security;
alter table public.coven_program_quizzes enable row level security;
alter table public.coven_program_task_documents enable row level security;
alter table public.coven_program_doc_reads enable row level security;
alter table public.coven_quiz_attempts enable row level security;
alter table public.coven_program_messages enable row level security;
alter table public.coven_program_thread_reads enable row level security;

drop policy if exists "Members read the coven's lessons" on public.coven_program_documents;
create policy "Members read the coven's lessons" on public.coven_program_documents
  for select to authenticated using (public.is_coven_member(coven_id));

drop policy if exists "Members see which lessons go with which step" on public.coven_program_task_documents;
create policy "Members see which lessons go with which step" on public.coven_program_task_documents
  for select to authenticated using (public.is_coven_member(coven_id));

-- The answer key is here: only those who manage programs read the table.
drop policy if exists "Program managers read the coven's tests" on public.coven_program_quizzes;
create policy "Program managers read the coven's tests" on public.coven_program_quizzes
  for select to authenticated using (public.coven_program_manager(coven_id));

drop policy if exists "Lessons read are seen by the reader, their mentor and progress keepers" on public.coven_program_doc_reads;
create policy "Lessons read are seen by the reader, their mentor and progress keepers" on public.coven_program_doc_reads
  for select to authenticated using (public.coven_sees_progress(coven_id, user_id));

-- Attempts hold the key as taken: the person who took it, their mentor and program managers.
drop policy if exists "Attempts are seen by the person, their mentor and program managers" on public.coven_quiz_attempts;
create policy "Attempts are seen by the person, their mentor and program managers" on public.coven_quiz_attempts
  for select to authenticated using (
    user_id = auth.uid() or public.coven_is_mentor_of(coven_id, user_id) or public.coven_program_manager(coven_id)
  );

drop policy if exists "A step's conversation is seen by the trainee and those who oversee them" on public.coven_program_messages;
create policy "A step's conversation is seen by the trainee and those who oversee them" on public.coven_program_messages
  for select to authenticated using (public.coven_program_thread_visible(enrollment_id));

drop policy if exists "People see their own read marks" on public.coven_program_thread_reads;
create policy "People see their own read marks" on public.coven_program_thread_reads
  for select to authenticated using (user_id = auth.uid());

revoke insert, update, delete on public.coven_program_documents, public.coven_program_quizzes, public.coven_program_task_documents,
  public.coven_program_doc_reads, public.coven_quiz_attempts, public.coven_program_messages, public.coven_program_thread_reads
  from anon, authenticated;
revoke select on public.coven_program_documents, public.coven_program_quizzes, public.coven_program_task_documents,
  public.coven_program_doc_reads, public.coven_quiz_attempts, public.coven_program_messages, public.coven_program_thread_reads
  from anon;

-- ---------------------------------------------------------------------------
-- Lessons
-- ---------------------------------------------------------------------------

-- Write or change one of the coven's lessons (p_id null for a new one).
-- p_doc: { title, summary, minutes, body, file_path, file_name, file_type }
create or replace function public.save_coven_program_document(p_coven uuid, p_id uuid, p_doc jsonb)
returns public.coven_program_documents
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_program_documents;
  path text := nullif(btrim(p_doc->>'file_path'), '');
begin
  if not public.coven_program_manager(p_coven) then
    raise exception 'Only those the coven''s head has chosen can write its lessons.';
  end if;
  if nullif(btrim(p_doc->>'title'), '') is null then raise exception 'Give the lesson a title.'; end if;
  if path is not null and split_part(path, '/', 1) <> p_coven::text then raise exception 'That file isn''t one of this coven''s.'; end if;
  if p_id is not null then
    select * into saved from public.coven_program_documents where id = p_id and coven_id = p_coven for update;
    if saved.id is null then raise exception 'That lesson was not found.'; end if;
    update public.coven_program_documents
    set title = btrim(p_doc->>'title'), summary = nullif(btrim(p_doc->>'summary'), ''), minutes = nullif(p_doc->>'minutes', '')::integer,
        body = coalesce(p_doc->>'body', ''), file_path = path,
        file_name = case when path is null then null else nullif(btrim(p_doc->>'file_name'), '') end,
        file_type = case when path is null then null else nullif(p_doc->>'file_type', '') end, updated_at = now()
    where id = saved.id returning * into saved;
  else
    insert into public.coven_program_documents (coven_id, title, summary, minutes, body, file_path, file_name, file_type, source_id)
    values (p_coven, btrim(p_doc->>'title'), nullif(btrim(p_doc->>'summary'), ''), nullif(p_doc->>'minutes', '')::integer, coalesce(p_doc->>'body', ''),
            path, case when path is null then null else nullif(btrim(p_doc->>'file_name'), '') end,
            case when path is null then null else nullif(p_doc->>'file_type', '') end, nullif(p_doc->>'source_id', ''))
    returning * into saved;
  end if;
  return saved;
end;
$$;

-- Delete a lesson (it leaves every step it was on). Returns it, so the
-- screen can remove its file from storage.
create or replace function public.delete_coven_program_document(p_id uuid)
returns public.coven_program_documents
language plpgsql
security definer
set search_path = public
as $$
declare
  doc public.coven_program_documents;
begin
  select * into doc from public.coven_program_documents where id = p_id;
  if doc.id is null then raise exception 'That lesson was not found.'; end if;
  if not public.coven_program_manager(doc.coven_id) then
    raise exception 'Only those the coven''s head has chosen can remove its lessons.';
  end if;
  delete from public.coven_program_documents where id = doc.id;
  return doc;
end;
$$;

-- Mark a lesson read (or not) for yourself.
create or replace function public.mark_coven_doc_read(p_document uuid, p_read boolean default true)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  doc public.coven_program_documents;
begin
  select * into doc from public.coven_program_documents where id = p_document;
  if doc.id is null or not public.is_coven_member(doc.coven_id) then raise exception 'That lesson was not found.'; end if;
  if p_read then
    insert into public.coven_program_doc_reads (user_id, document_id, coven_id) values (auth.uid(), doc.id, doc.coven_id)
    on conflict (user_id, document_id) do update set read_at = now();
  else
    delete from public.coven_program_doc_reads where user_id = auth.uid() and document_id = doc.id;
  end if;
  return p_read;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tests
-- ---------------------------------------------------------------------------

-- Problems with a test's questions, or null when they're sound.
create or replace function public.coven_quiz_problem(p_questions jsonb)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  q jsonb;
  n integer := 0;
  kind text;
  options integer;
  correct jsonb;
  ids text[] := '{}';
begin
  if jsonb_typeof(coalesce(p_questions, 'null'::jsonb)) <> 'array' then return 'The questions must be a list.'; end if;
  if jsonb_array_length(p_questions) > 60 then return 'A test can have up to 60 questions.'; end if;
  for q in select * from jsonb_array_elements(p_questions) loop
    n := n + 1;
    kind := q->>'type';
    if coalesce(q->>'id', '') = '' or (q->>'id') = any (ids) then return format('Question %s needs its own id.', n); end if;
    ids := array_append(ids, q->>'id');
    if kind is null or kind not in ('single', 'multi', 'truefalse', 'short', 'long') then return format('Question %s: choose its kind.', n); end if;
    if nullif(btrim(q->>'prompt'), '') is null then return format('Question %s needs its question.', n); end if;
    if char_length(q->>'prompt') > 2000 or char_length(coalesce(q->>'explanation', '')) > 4000 or char_length(coalesce(q->>'rubric', '')) > 4000 then
      return format('Question %s is too long.', n);
    end if;
    if jsonb_typeof(q->'points') <> 'number' or (q->>'points')::numeric < 0 or (q->>'points')::numeric > 100 then
      return format('Question %s: points from 0 to 100.', n);
    end if;
    if kind in ('single', 'multi', 'truefalse') then
      if jsonb_typeof(q->'options') <> 'array' then return format('Question %s needs its answers to choose from.', n); end if;
      options := jsonb_array_length(q->'options');
      if options < 2 or options > 12 then return format('Question %s: two to twelve answers to choose from.', n); end if;
      correct := q->'correct';
      if jsonb_typeof(correct) <> 'array' or jsonb_array_length(correct) = 0 then return format('Question %s: mark the right answer.', n); end if;
      if kind <> 'multi' and jsonb_array_length(correct) <> 1 then return format('Question %s: mark exactly one right answer.', n); end if;
      if exists (select 1 from jsonb_array_elements(correct) c where jsonb_typeof(c) <> 'number' or (c#>>'{}')::numeric not between 0 and options - 1) then
        return format('Question %s: a right answer isn''t one of its answers.', n);
      end if;
    end if;
  end loop;
  return null;
end;
$$;

-- The questions without the key (what someone taking the test is given).
create or replace function public.coven_quiz_strip(p_questions jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select coalesce(jsonb_agg(q - 'correct' - 'explanation' - 'rubric' order by n), '[]'::jsonb)
  from jsonb_array_elements(coalesce(p_questions, '[]'::jsonb)) with ordinality as x (q, n);
$$;

-- A test as this person may see it. Program managers and the trainee's
-- overseers (for p_enrollment) get the key and rubrics; anyone else in the
-- coven gets the questions alone.
create or replace function public.coven_quiz_view(p_quiz uuid, p_enrollment uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  quiz public.coven_program_quizzes;
  e public.coven_program_enrollments;
  full_key boolean;
begin
  select * into quiz from public.coven_program_quizzes where id = p_quiz;
  if quiz.id is null or not (public.is_coven_member(quiz.coven_id) or public.is_community_moderator()) then return null; end if;
  if p_enrollment is not null then select * into e from public.coven_program_enrollments where id = p_enrollment and coven_id = quiz.coven_id; end if;
  full_key := public.coven_program_manager(quiz.coven_id) or (e.id is not null and public.coven_program_overseer(e.coven_id, e.user_id));
  return jsonb_build_object(
    'id', quiz.id, 'coven_id', quiz.coven_id, 'title', quiz.title, 'intro', quiz.intro, 'pass_percent', quiz.pass_percent,
    'retakes', quiz.retakes, 'wait_hours', quiz.wait_hours, 'source_id', quiz.source_id, 'with_key', full_key,
    'questions', case when full_key then quiz.questions else public.coven_quiz_strip(quiz.questions) end
  );
end;
$$;

-- Write or change one of the coven's tests (p_id null for a new one).
-- p_quiz: { title, intro, pass_percent, retakes, wait_hours, questions }
create or replace function public.save_coven_program_quiz(p_coven uuid, p_id uuid, p_quiz jsonb)
returns public.coven_program_quizzes
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_program_quizzes;
  problem text;
begin
  if not public.coven_program_manager(p_coven) then
    raise exception 'Only those the coven''s head has chosen can write its tests.';
  end if;
  if nullif(btrim(p_quiz->>'title'), '') is null then raise exception 'Give the test a title.'; end if;
  problem := public.coven_quiz_problem(coalesce(p_quiz->'questions', '[]'::jsonb));
  if problem is not null then raise exception '%', problem; end if;
  if p_id is not null then
    select * into saved from public.coven_program_quizzes where id = p_id and coven_id = p_coven for update;
    if saved.id is null then raise exception 'That test was not found.'; end if;
    update public.coven_program_quizzes
    set title = btrim(p_quiz->>'title'), intro = nullif(btrim(p_quiz->>'intro'), ''),
        pass_percent = coalesce(nullif(p_quiz->>'pass_percent', '')::integer, 80), retakes = coalesce(nullif(p_quiz->>'retakes', '')::integer, 2),
        wait_hours = coalesce(nullif(p_quiz->>'wait_hours', '')::integer, 24), questions = coalesce(p_quiz->'questions', '[]'::jsonb), updated_at = now()
    where id = saved.id returning * into saved;
  else
    insert into public.coven_program_quizzes (coven_id, title, intro, pass_percent, retakes, wait_hours, questions, source_id)
    values (p_coven, btrim(p_quiz->>'title'), nullif(btrim(p_quiz->>'intro'), ''), coalesce(nullif(p_quiz->>'pass_percent', '')::integer, 80),
            coalesce(nullif(p_quiz->>'retakes', '')::integer, 2), coalesce(nullif(p_quiz->>'wait_hours', '')::integer, 24),
            coalesce(p_quiz->'questions', '[]'::jsonb), nullif(p_quiz->>'source_id', ''))
    returning * into saved;
  end if;
  return saved;
end;
$$;

-- Bring a ready-made course's lessons and tests into the coven (up to 40 of
-- each at a time). Those already copied (by source_id) are kept as the coven
-- has them. Returns { docs: { source_id: id }, quizzes: { source_id: id } }.
-- p_docs: [{ source_id, title, summary, minutes, body }]
-- p_quizzes: [{ source_id, title, intro, pass_percent, questions }]
create or replace function public.import_coven_course(p_coven uuid, p_docs jsonb, p_quizzes jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  doc_ids jsonb := '{}'::jsonb;
  quiz_ids jsonb := '{}'::jsonb;
  found uuid;
  problem text;
begin
  if not public.coven_program_manager(p_coven) then
    raise exception 'Only those the coven''s head has chosen can design its programs.';
  end if;
  if jsonb_array_length(coalesce(p_docs, '[]'::jsonb)) > 40 or jsonb_array_length(coalesce(p_quizzes, '[]'::jsonb)) > 40 then
    raise exception 'Up to 40 lessons and 40 tests at a time.';
  end if;
  for item in select * from jsonb_array_elements(coalesce(p_docs, '[]'::jsonb)) loop
    if nullif(item->>'source_id', '') is null or nullif(btrim(item->>'title'), '') is null then raise exception 'A lesson needs its id and title.'; end if;
    select id into found from public.coven_program_documents where coven_id = p_coven and source_id = item->>'source_id';
    if found is null then
      insert into public.coven_program_documents (coven_id, title, summary, minutes, body, source_id)
      values (p_coven, left(btrim(item->>'title'), 160), left(nullif(btrim(item->>'summary'), ''), 600), nullif(item->>'minutes', '')::integer,
              coalesce(item->>'body', ''), item->>'source_id')
      returning id into found;
    end if;
    doc_ids := doc_ids || jsonb_build_object(item->>'source_id', found);
  end loop;
  for item in select * from jsonb_array_elements(coalesce(p_quizzes, '[]'::jsonb)) loop
    if nullif(item->>'source_id', '') is null or nullif(btrim(item->>'title'), '') is null then raise exception 'A test needs its id and title.'; end if;
    select id into found from public.coven_program_quizzes where coven_id = p_coven and source_id = item->>'source_id';
    if found is null then
      problem := public.coven_quiz_problem(coalesce(item->'questions', '[]'::jsonb));
      if problem is not null then raise exception '%: %', item->>'title', problem; end if;
      insert into public.coven_program_quizzes (coven_id, title, intro, pass_percent, questions, source_id)
      values (p_coven, left(btrim(item->>'title'), 160), left(nullif(btrim(item->>'intro'), ''), 4000), coalesce(nullif(item->>'pass_percent', '')::integer, 80),
              coalesce(item->'questions', '[]'::jsonb), item->>'source_id')
      returning id into found;
    end if;
    quiz_ids := quiz_ids || jsonb_build_object(item->>'source_id', found);
  end loop;
  return jsonb_build_object('docs', doc_ids, 'quizzes', quiz_ids);
end;
$$;

-- Points for the choice questions: all of the right answers and none of the
-- wrong ones earns a question's points.
create or replace function public.coven_quiz_auto_score(p_questions jsonb, p_answers jsonb)
returns numeric
language sql
immutable
set search_path = public
as $$
  select coalesce(sum((q->>'points')::numeric), 0)
  from jsonb_array_elements(coalesce(p_questions, '[]'::jsonb)) q
  where q->>'type' in ('single', 'multi', 'truefalse')
    and jsonb_typeof(p_answers->(q->>'id')) = 'array'
    and (select coalesce(array_agg(distinct (c#>>'{}')::integer order by (c#>>'{}')::integer), '{}') from jsonb_array_elements(q->'correct') c)
      = (select coalesce(array_agg(distinct (a#>>'{}')::integer order by (a#>>'{}')::integer), '{}') from jsonb_array_elements(p_answers->(q->>'id')) a where jsonb_typeof(a) = 'number');
$$;

-- A passed test marks its task done.
create or replace function public.coven_quiz_pass_task(p_attempt public.coven_quiz_attempts)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.coven_program_tasks;
  e public.coven_program_enrollments;
begin
  select * into t from public.coven_program_tasks where id = p_attempt.task_id;
  select * into e from public.coven_program_enrollments where id = p_attempt.enrollment_id;
  if t.id is null or e.id is null then return; end if;
  insert into public.coven_program_progress (enrollment_id, task_id, program_id, coven_id, user_id, times_done, status, submitted_at, checked_by, checked_at)
  values (e.id, t.id, e.program_id, e.coven_id, e.user_id, t.times, 'approved', p_attempt.submitted_at, p_attempt.scored_by, now())
  on conflict (enrollment_id, task_id) do update
    set times_done = excluded.times_done, status = 'approved', submitted_at = coalesce(public.coven_program_progress.submitted_at, excluded.submitted_at),
        checked_by = excluded.checked_by, checked_at = now(), updated_at = now();
end;
$$;

-- Where someone stands with a step's test: attempts used and allowed, and
-- when they may next take it. { quiz_id, used, allowed, next_at, waiting, passed }
create or replace function public.coven_quiz_standing(p_enrollment uuid, p_task uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  e public.coven_program_enrollments;
  t public.coven_program_tasks;
  quiz public.coven_program_quizzes;
  prog public.coven_program_progress;
  last public.coven_quiz_attempts;
  used integer;
  next_at timestamptz;
begin
  select * into e from public.coven_program_enrollments where id = p_enrollment;
  if e.id is null or not public.coven_sees_progress(e.coven_id, e.user_id) then return null; end if;
  select * into t from public.coven_program_tasks where id = p_task and program_id = e.program_id;
  if t.id is null or t.quiz_id is null then return null; end if;
  select * into quiz from public.coven_program_quizzes where id = t.quiz_id;
  select * into prog from public.coven_program_progress where enrollment_id = e.id and task_id = t.id;
  select count(*) into used from public.coven_quiz_attempts where enrollment_id = e.id and task_id = t.id;
  select * into last from public.coven_quiz_attempts where enrollment_id = e.id and task_id = t.id order by number desc limit 1;
  if last.id is not null and (prog.quiz_extra_at is null or last.submitted_at > prog.quiz_extra_at) then
    next_at := last.submitted_at + make_interval(hours => quiz.wait_hours);
    if next_at <= now() then next_at := null; end if;
  end if;
  return jsonb_build_object(
    'quiz_id', t.quiz_id,
    'used', used,
    'allowed', 1 + coalesce(quiz.retakes, 2) + coalesce(prog.quiz_extra, 0),
    'next_at', next_at,
    'waiting', exists (select 1 from public.coven_quiz_attempts where enrollment_id = e.id and task_id = t.id and status in ('submitted', 'scored')),
    'passed', exists (select 1 from public.coven_quiz_attempts where enrollment_id = e.id and task_id = t.id and status = 'passed')
  );
end;
$$;

-- Hand in a step's test. Choice questions are scored now; with no written
-- answers the result is final at once. p_answers: { "<question id>": [indices] | "text" }
create or replace function public.submit_coven_quiz(p_enrollment uuid, p_task uuid, p_answers jsonb)
returns public.coven_quiz_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.coven_program_enrollments;
  t public.coven_program_tasks;
  quiz public.coven_program_quizzes;
  standing jsonb;
  current_position integer;
  task_position integer;
  clean jsonb := '{}'::jsonb;
  q jsonb;
  a jsonb;
  auto numeric;
  full_marks numeric;
  written boolean;
  saved public.coven_quiz_attempts;
begin
  select * into e from public.coven_program_enrollments where id = p_enrollment for update;
  if e.id is null or e.user_id <> auth.uid() then raise exception 'That isn''t your program.'; end if;
  if e.status <> 'active' then raise exception 'This program is % for now.', case e.status when 'paused' then 'paused' else e.status end; end if;
  if not public.coven_in_good_standing(e.coven_id) then raise exception 'Sign the coven''s current agreements to carry on.'; end if;
  select * into t from public.coven_program_tasks where id = p_task and program_id = e.program_id;
  if t.id is null then raise exception 'That task isn''t part of this program.'; end if;
  if t.quiz_id is null then raise exception 'That step has no test.'; end if;
  select position into current_position from public.coven_program_stages where id = e.stage_id;
  select position into task_position from public.coven_program_stages where id = t.stage_id;
  if task_position > coalesce(current_position, 0) then raise exception 'That test belongs to a later stage.'; end if;
  select * into quiz from public.coven_program_quizzes where id = t.quiz_id;
  if jsonb_array_length(quiz.questions) = 0 then raise exception 'This test has no questions yet.'; end if;

  standing := public.coven_quiz_standing(e.id, t.id);
  if (standing->>'passed')::boolean then raise exception 'You have already passed this test.'; end if;
  if (standing->>'waiting')::boolean then raise exception 'Your last attempt is waiting to be scored.'; end if;
  if (standing->>'used')::integer >= (standing->>'allowed')::integer then
    raise exception 'You have used every attempt at this test. Ask your mentor or the coven''s head about another.';
  end if;
  if standing->>'next_at' is not null then
    raise exception 'You can take this test again after %.', to_char((standing->>'next_at')::timestamptz at time zone 'UTC', 'FMDD Mon YYYY HH24:MI "UTC"');
  end if;
  if jsonb_typeof(coalesce(p_answers, 'null'::jsonb)) <> 'object' then raise exception 'Answer the questions first.'; end if;

  -- Keep only answers to this test's questions, in their right shapes.
  for q in select * from jsonb_array_elements(quiz.questions) loop
    a := p_answers->(q->>'id');
    if q->>'type' in ('single', 'multi', 'truefalse') then
      if jsonb_typeof(a) = 'array' then
        clean := clean || jsonb_build_object(q->>'id', (select coalesce(jsonb_agg(distinct x), '[]'::jsonb) from jsonb_array_elements(a) x where jsonb_typeof(x) = 'number'));
      end if;
    elsif jsonb_typeof(a) = 'string' and btrim(a#>>'{}') <> '' then
      clean := clean || jsonb_build_object(q->>'id', left(a#>>'{}', 8000));
    end if;
  end loop;

  auto := public.coven_quiz_auto_score(quiz.questions, clean);
  select coalesce(sum((x->>'points')::numeric), 0), bool_or(x->>'type' in ('short', 'long')) into full_marks, written from jsonb_array_elements(quiz.questions) x;
  insert into public.coven_quiz_attempts (enrollment_id, task_id, quiz_id, coven_id, user_id, number, title, questions, pass_percent, answers, auto_score,
                                          total, max, status)
  values (e.id, t.id, quiz.id, e.coven_id, e.user_id, (standing->>'used')::integer + 1, quiz.title, quiz.questions, quiz.pass_percent, clean, auto,
          case when written then null else auto end, full_marks,
          case when written then 'submitted'
               when full_marks = 0 or auto * 100 >= quiz.pass_percent * full_marks then 'passed'
               else 'failed' end)
  returning * into saved;
  if saved.status = 'passed' then perform public.coven_quiz_pass_task(saved); end if;
  return saved;
end;
$$;

-- Score the written answers of an attempt: p_scores { "<question id>": { points, comment } }.
-- Final (p_final) releases the result: passed or failed. Otherwise the
-- scores are kept for later ('scored') and the trainee still sees it waiting.
create or replace function public.score_coven_quiz(p_attempt uuid, p_scores jsonb, p_feedback text default null, p_final boolean default true)
returns public.coven_quiz_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_quiz_attempts;
  q jsonb;
  s jsonb;
  clean jsonb := '{}'::jsonb;
  manual numeric := 0;
  missing integer := 0;
  pts numeric;
begin
  select * into saved from public.coven_quiz_attempts where id = p_attempt for update;
  if saved.id is null then raise exception 'That attempt was not found.'; end if;
  if not public.coven_can_check(saved.coven_id, saved.user_id, 'mentor') then
    raise exception 'Only their mentor or a program manager scores this test.';
  end if;
  if saved.status not in ('submitted', 'scored') then raise exception 'That attempt has already been scored.'; end if;
  if jsonb_typeof(coalesce(p_scores, '{}'::jsonb)) <> 'object' then raise exception 'Give the scores as points for each answer.'; end if;
  for q in select * from jsonb_array_elements(saved.questions) where value->>'type' in ('short', 'long') loop
    s := p_scores->(q->>'id');
    if s is null or jsonb_typeof(s->'points') <> 'number' then
      missing := missing + 1;
      continue;
    end if;
    pts := (s->>'points')::numeric;
    if pts < 0 or pts > (q->>'points')::numeric then
      raise exception 'Question "%": from 0 to % points.', left(q->>'prompt', 60), q->>'points';
    end if;
    if char_length(coalesce(s->>'comment', '')) > 2000 then raise exception 'Keep each comment under 2,000 characters.'; end if;
    clean := clean || jsonb_build_object(q->>'id', jsonb_build_object('points', pts, 'comment', nullif(btrim(coalesce(s->>'comment', '')), '')));
    manual := manual + pts;
  end loop;
  if p_final and missing > 0 then
    raise exception '% written answer% still to score.', missing, case when missing = 1 then '' else 's' end;
  end if;
  update public.coven_quiz_attempts
  set manual_scores = clean, total = auto_score + manual, feedback = nullif(btrim(p_feedback), ''), scored_by = auth.uid(), scored_at = now(),
      status = case when not p_final then 'scored'
                    when max = 0 or (auto_score + manual) * 100 >= pass_percent * max then 'passed'
                    else 'failed' end,
      updated_at = now()
  where id = saved.id returning * into saved;
  if saved.status = 'passed' then perform public.coven_quiz_pass_task(saved); end if;
  return saved;
end;
$$;

-- Allow one more attempt at a step's test (and no wait before it).
create or replace function public.allow_coven_quiz_retake(p_enrollment uuid, p_task uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.coven_program_enrollments;
  t public.coven_program_tasks;
begin
  select * into e from public.coven_program_enrollments where id = p_enrollment;
  if e.id is null then raise exception 'That enrollment was not found.'; end if;
  if not public.coven_program_manager(e.coven_id) or e.user_id = auth.uid() then
    raise exception 'Only those who manage the coven''s programs allow another attempt.';
  end if;
  select * into t from public.coven_program_tasks where id = p_task and program_id = e.program_id;
  if t.id is null or t.quiz_id is null then raise exception 'That step has no test.'; end if;
  insert into public.coven_program_progress (enrollment_id, task_id, program_id, coven_id, user_id, quiz_extra, quiz_extra_at)
  values (e.id, t.id, e.program_id, e.coven_id, e.user_id, 1, now())
  on conflict (enrollment_id, task_id) do update
    set quiz_extra = least(50, public.coven_program_progress.quiz_extra + 1), quiz_extra_at = now(), updated_at = now();
  return public.coven_quiz_standing(e.id, t.id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Programs: lessons and tests on each task (save_coven_program, as before, plus them)
-- ---------------------------------------------------------------------------

-- Link a task's lessons and test from a save: docs [{ id } | { source_id }]
-- in order; quiz { id } | { source_id } | null. Left out, they stay as they are.
create or replace function public.coven_program_link_task(p_coven uuid, p_task uuid, p_spec jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  n integer := 0;
  found uuid;
begin
  if p_spec ? 'docs' then
    delete from public.coven_program_task_documents where task_id = p_task;
    if jsonb_typeof(p_spec->'docs') = 'array' then
      if jsonb_array_length(p_spec->'docs') > 40 then raise exception 'A task can have up to 40 lessons.'; end if;
      for item in select * from jsonb_array_elements(p_spec->'docs') loop
        found := null;
        if nullif(item->>'id', '') is not null then
          select id into found from public.coven_program_documents where id = (item->>'id')::uuid and coven_id = p_coven;
        elsif nullif(item->>'source_id', '') is not null then
          select id into found from public.coven_program_documents where source_id = item->>'source_id' and coven_id = p_coven;
        end if;
        if found is null then raise exception 'A lesson on "%" isn''t one of this coven''s.', (select title from public.coven_program_tasks where id = p_task); end if;
        n := n + 1;
        insert into public.coven_program_task_documents (task_id, document_id, coven_id, position) values (p_task, found, p_coven, n)
        on conflict (task_id, document_id) do update set position = excluded.position;
      end loop;
    end if;
  end if;
  if p_spec ? 'quiz' then
    found := null;
    if jsonb_typeof(p_spec->'quiz') = 'object' then
      if nullif(p_spec->'quiz'->>'id', '') is not null then
        select id into found from public.coven_program_quizzes where id = (p_spec->'quiz'->>'id')::uuid and coven_id = p_coven;
      elsif nullif(p_spec->'quiz'->>'source_id', '') is not null then
        select id into found from public.coven_program_quizzes where source_id = p_spec->'quiz'->>'source_id' and coven_id = p_coven;
      end if;
      if found is null then raise exception 'The test on "%" isn''t one of this coven''s.', (select title from public.coven_program_tasks where id = p_task); end if;
    end if;
    update public.coven_program_tasks set quiz_id = found where id = p_task;
  end if;
end;
$$;

-- As in 20261027000000_coven_programs.sql, and each task may also carry
-- docs and quiz (coven_program_link_task).
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
      perform public.coven_program_link_task(p_coven, v_task, task);
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
  where e.program_id = saved.id and e.status in ('active', 'paused') and (e.stage_id is null or e.stage_id <> all (kept_stages));
  return saved;
end;
$$;

-- As in 20261027000000_coven_programs.sql, except that a step with a test is
-- finished by passing the test.
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
  if t.quiz_id is not null and coalesce(p_count, 0) > 0 then raise exception 'This step is finished by passing its test.'; end if;
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
  if done >= t.times and t.quiz_id is null and not (t.response = 'text' and saved.response is null) then
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

-- ---------------------------------------------------------------------------
-- Practice, session by session
-- ---------------------------------------------------------------------------

-- Log one practice session: the day, how many minutes, and a note. Counts
-- one time done; on the last, it's sent for sign-off (or done, if the person
-- signs it off themselves) once anything the step asks them to write is written.
create or replace function public.log_coven_practice(p_enrollment uuid, p_task uuid, p_on date, p_minutes integer, p_note text default null)
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
  if t.quiz_id is not null then raise exception 'This step is finished by passing its test.'; end if;
  select position into current_position from public.coven_program_stages where id = e.stage_id;
  select position into task_position from public.coven_program_stages where id = t.stage_id;
  if task_position > coalesce(current_position, 0) then raise exception 'That task belongs to a later stage.'; end if;
  if p_on is null or p_on > (now() at time zone 'UTC')::date + 1 or p_on < (now() at time zone 'UTC')::date - 400 then
    raise exception 'Choose the day you practised.';
  end if;
  if p_minutes is null or p_minutes < 0 or p_minutes > 1440 then raise exception 'Minutes from 0 to 1,440.'; end if;
  if char_length(coalesce(p_note, '')) > 1000 then raise exception 'Keep the note under 1,000 characters.'; end if;

  select * into saved from public.coven_program_progress where enrollment_id = e.id and task_id = t.id for update;
  if saved.status = 'approved' then raise exception 'That task is already signed off.'; end if;
  if saved.status = 'submitted' then raise exception 'That task is waiting for sign-off.'; end if;
  if saved.id is null then
    insert into public.coven_program_progress (enrollment_id, task_id, program_id, coven_id, user_id, times_done)
    values (e.id, t.id, e.program_id, e.coven_id, e.user_id, 0)
    returning * into saved;
  end if;
  if jsonb_array_length(saved.sessions) >= 400 then raise exception 'That''s as many sessions as a step keeps.'; end if;
  if saved.times_done >= t.times and saved.status <> 'returned' then
    raise exception 'Every session for this step is logged.%', case when t.response = 'text' and saved.response is null then ' Write your answer and send it.' else '' end;
  end if;
  done := least(t.times, saved.times_done + 1);
  update public.coven_program_progress
  set sessions = sessions || jsonb_build_array(jsonb_build_object('on', p_on, 'minutes', p_minutes, 'note', nullif(btrim(coalesce(p_note, '')), ''), 'at', now())),
      times_done = done, status = case when status = 'returned' then 'in_progress' else status end, updated_at = now()
  where id = saved.id returning * into saved;
  -- The last one sends it for sign-off (or counts it done), once anything it asks them to write is written.
  if done >= t.times and not (t.response = 'text' and saved.response is null) then
    update public.coven_program_progress
    set status = case when t.checked_by = 'self' then 'approved' else 'submitted' end, submitted_at = now(),
        checked_by = case when t.checked_by = 'self' then auth.uid() else null end,
        checked_at = case when t.checked_by = 'self' then now() else null end, feedback = null, updated_at = now()
    where id = saved.id returning * into saved;
  end if;
  return saved;
end;
$$;

-- Take back a session logged by mistake (while the step isn't sent or done).
create or replace function public.remove_coven_practice(p_enrollment uuid, p_task uuid, p_index integer)
returns public.coven_program_progress
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.coven_program_enrollments;
  saved public.coven_program_progress;
begin
  select * into e from public.coven_program_enrollments where id = p_enrollment;
  if e.id is null or e.user_id <> auth.uid() then raise exception 'That isn''t your program.'; end if;
  select * into saved from public.coven_program_progress where enrollment_id = p_enrollment and task_id = p_task for update;
  if saved.id is null or p_index is null or p_index < 0 or p_index >= jsonb_array_length(saved.sessions) then raise exception 'That session was not found.'; end if;
  if saved.status in ('submitted', 'approved') then raise exception 'This step has already been sent or signed off.'; end if;
  update public.coven_program_progress
  set sessions = sessions - p_index, times_done = greatest(0, times_done - 1), updated_at = now()
  where id = saved.id returning * into saved;
  return saved;
end;
$$;

-- ---------------------------------------------------------------------------
-- A conversation on each step
-- ---------------------------------------------------------------------------

create or replace function public.post_coven_program_message(p_enrollment uuid, p_task uuid, p_body text, p_attempt uuid default null)
returns public.coven_program_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.coven_program_enrollments;
  saved public.coven_program_messages;
begin
  select * into e from public.coven_program_enrollments where id = p_enrollment;
  if e.id is null or not public.coven_program_thread_visible(e.id) then raise exception 'That conversation isn''t yours to join.'; end if;
  if public.is_community_banned() then raise exception 'You can''t write in covens.'; end if;
  if not exists (select 1 from public.coven_program_tasks where id = p_task and program_id = e.program_id) then
    raise exception 'That step isn''t part of this program.';
  end if;
  if coalesce(btrim(p_body), '') = '' then raise exception 'Write your message first.'; end if;
  if char_length(btrim(p_body)) > 4000 then raise exception 'Keep a message under 4,000 characters.'; end if;
  if p_attempt is not null and not exists (select 1 from public.coven_quiz_attempts where id = p_attempt and enrollment_id = e.id and task_id = p_task) then
    p_attempt := null;
  end if;
  if (select count(*) from public.coven_program_messages where author_id = auth.uid() and created_at > now() - interval '1 hour') >= 120 then
    raise exception 'That''s a lot of messages in an hour. Please wait a little.';
  end if;
  insert into public.coven_program_messages (enrollment_id, task_id, coven_id, trainee_id, author_id, body, attempt_id)
  values (e.id, p_task, e.coven_id, e.user_id, auth.uid(), btrim(p_body), p_attempt)
  returning * into saved;
  insert into public.coven_program_thread_reads (enrollment_id, task_id, user_id) values (e.id, p_task, auth.uid())
  on conflict (enrollment_id, task_id, user_id) do update set read_at = now();
  return saved;
end;
$$;

create or replace function public.remove_coven_program_message(p_message uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.coven_program_messages;
begin
  select * into m from public.coven_program_messages where id = p_message;
  if m.id is null or m.author_id is distinct from auth.uid() then raise exception 'Only whoever wrote a message can remove it.'; end if;
  update public.coven_program_messages set body = null, deleted_at = now() where id = m.id;
  return true;
end;
$$;

create or replace function public.read_coven_program_thread(p_enrollment uuid, p_task uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.coven_program_thread_visible(p_enrollment) then return false; end if;
  -- Read up to the newest message there, whatever the clocks say.
  insert into public.coven_program_thread_reads (enrollment_id, task_id, user_id, read_at)
  values (p_enrollment, p_task, auth.uid(),
          greatest(now(), (select max(created_at) from public.coven_program_messages where enrollment_id = p_enrollment and task_id = p_task)))
  on conflict (enrollment_id, task_id, user_id) do update set read_at = excluded.read_at;
  return true;
end;
$$;

-- Unread messages for the caller in a coven's step conversations they follow:
-- [{ enrollment_id, task_id, trainee_id, unread, last_at }]
create or replace function public.coven_program_unread(p_coven uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('enrollment_id', x.enrollment_id, 'task_id', x.task_id, 'trainee_id', x.trainee_id,
                                               'unread', x.unread, 'last_at', x.last_at) order by x.last_at desc), '[]'::jsonb)
  from (
    select m.enrollment_id, m.task_id, m.trainee_id, count(*)::integer as unread, max(m.created_at) as last_at
    from public.coven_program_messages m
    left join public.coven_program_thread_reads r on r.enrollment_id = m.enrollment_id and r.task_id = m.task_id and r.user_id = auth.uid()
    where m.coven_id = p_coven and m.deleted_at is null and m.author_id is distinct from auth.uid()
      and m.created_at > coalesce(r.read_at, '-infinity'::timestamptz)
    group by m.enrollment_id, m.task_id, m.trainee_id
  ) x
  where public.coven_program_thread_visible(x.enrollment_id)
    and auth.uid() = any (public.coven_program_thread_people(x.enrollment_id, x.task_id));
$$;

-- ---------------------------------------------------------------------------
-- Files: the private 'coven-program-files' bucket, '<coven id>/<file>'.
-- Members read their coven's; those who manage programs add and remove them.
-- (On a project without Supabase Storage this part is skipped.)
-- ---------------------------------------------------------------------------

-- The coven a file belongs to: the first part of its path, when it's a coven's id.
create or replace function public.coven_file_coven(p_name text)
returns uuid
language sql
immutable
set search_path = public
as $$
  select case when split_part(coalesce(p_name, ''), '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
              then split_part(p_name, '/', 1)::uuid end;
$$;

create or replace function public.coven_file_member(p_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.is_coven_member(public.coven_file_coven(p_name)), false);
$$;

create or replace function public.coven_file_manager(p_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.coven_file_coven(p_name) is not null and public.coven_program_manager(public.coven_file_coven(p_name));
$$;

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    execute $b$
      insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      values ('coven-program-files', 'coven-program-files', false, 15728640, array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
      on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types
    $b$;
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'objects') then
    execute 'drop policy if exists "Coven members read their coven''s lesson files" on storage.objects';
    execute $p$
      create policy "Coven members read their coven's lesson files" on storage.objects
        for select to authenticated
        using (bucket_id = 'coven-program-files' and public.coven_file_member(name))
    $p$;
    execute 'drop policy if exists "Program managers add lesson files" on storage.objects';
    execute $p$
      create policy "Program managers add lesson files" on storage.objects
        for insert to authenticated
        with check (bucket_id = 'coven-program-files' and public.coven_file_manager(name))
    $p$;
    execute 'drop policy if exists "Program managers remove lesson files" on storage.objects';
    execute $p$
      create policy "Program managers remove lesson files" on storage.objects
        for delete to authenticated
        using (bucket_id = 'coven-program-files' and public.coven_file_manager(name))
    $p$;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants, and live conversations
-- ---------------------------------------------------------------------------

-- Inner workings, not for calling directly (coven-notify reads the people with the service role).
revoke execute on function public.coven_quiz_pass_task(public.coven_quiz_attempts), public.coven_program_link_task(uuid, uuid, jsonb),
  public.coven_program_thread_people(uuid, uuid), public.coven_user_oversees_programs(uuid, uuid)
  from public, anon, authenticated;
revoke execute on function
  public.save_coven_program_document(uuid, uuid, jsonb), public.delete_coven_program_document(uuid), public.mark_coven_doc_read(uuid, boolean),
  public.coven_quiz_view(uuid, uuid), public.save_coven_program_quiz(uuid, uuid, jsonb), public.import_coven_course(uuid, jsonb, jsonb),
  public.coven_quiz_standing(uuid, uuid), public.submit_coven_quiz(uuid, uuid, jsonb), public.score_coven_quiz(uuid, jsonb, text, boolean),
  public.allow_coven_quiz_retake(uuid, uuid), public.log_coven_practice(uuid, uuid, date, integer, text), public.remove_coven_practice(uuid, uuid, integer),
  public.post_coven_program_message(uuid, uuid, text, uuid), public.remove_coven_program_message(uuid), public.read_coven_program_thread(uuid, uuid),
  public.coven_program_unread(uuid), public.coven_program_overseer(uuid, uuid), public.coven_program_thread_visible(uuid)
from public, anon;
grant execute on function
  public.save_coven_program_document(uuid, uuid, jsonb), public.delete_coven_program_document(uuid), public.mark_coven_doc_read(uuid, boolean),
  public.coven_quiz_view(uuid, uuid), public.save_coven_program_quiz(uuid, uuid, jsonb), public.import_coven_course(uuid, jsonb, jsonb),
  public.coven_quiz_standing(uuid, uuid), public.submit_coven_quiz(uuid, uuid, jsonb), public.score_coven_quiz(uuid, jsonb, text, boolean),
  public.allow_coven_quiz_retake(uuid, uuid), public.log_coven_practice(uuid, uuid, date, integer, text), public.remove_coven_practice(uuid, uuid, integer),
  public.post_coven_program_message(uuid, uuid, text, uuid), public.remove_coven_program_message(uuid), public.read_coven_program_thread(uuid, uuid),
  public.coven_program_unread(uuid), public.coven_program_overseer(uuid, uuid), public.coven_program_thread_visible(uuid)
to authenticated;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.coven_program_thread_people(uuid, uuid) to service_role';
  end if;
end;
$$;

-- A step's conversation updates the moment someone writes (row-level security keeps it to those who may read it).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_program_messages') then
      alter publication supabase_realtime add table public.coven_program_messages;
    end if;
  end if;
end;
$$;
