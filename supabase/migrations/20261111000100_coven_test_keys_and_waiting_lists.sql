-- NOT YET APPLIED. Needs 20261110000000_coven_open_positions.sql and
-- 20261110000100_coven_courses.sql. Additive and safe to run again (paste it whole).
--
-- 1. A test's answers only once you've passed it.
--    * A trainee no longer reads coven_quiz_attempts directly. Their own
--      attempts come through coven_quiz_attempts_seen (the app and the
--      website use it for everyone): the score, which questions they got
--      right and wrong (coven_quiz_attempts.marks: { "<question id>": true |
--      false } for the choice questions), and the written answers' points
--      and comments once released; never the right options, the
--      explanations or the scoring guide until they have passed that test.
--      Once passed, every attempt at it shows the full key.
--    * Their mentor, those who manage programs and the coven's head keep the
--      whole attempt, to score it. A mentor who is taking that same test
--      themselves and hasn't passed it sees their mentee's attempts without
--      the key (and without the right/wrong marks, which would give it
--      away): enough to score the written answers, nothing more. Those who
--      manage programs write the tests and read them whole anyway.
--    * submit_coven_quiz and score_coven_quiz hand back the attempt as the
--      caller may see it; coven_quiz_view gives the key to a mentor only
--      under the same rule.
--
-- 2. Waiting lists for full positions (coven_position_queue).
--    * Finishing a program that raises its graduates to a position no longer
--      passes over the position's places: when it is full (or others are
--      already waiting for it), the graduate joins its waiting list instead,
--      in order of when they qualified. A reviewer may also approve a
--      request on a full position onto the list (queue_coven_advancement).
--    * When a place frees up (a holder leaves, is removed, moves position, or
--      the leader raises the limit), triggers on coven_members and
--      coven_ranks call coven_queue_propose_next: the first person waiting
--      who is still an active member in good standing becomes 'proposed'
--      (anyone no longer so is marked 'left'). Nobody is moved: the coven's
--      head and those with the manage power confirm it on Review (Promote,
--      Choose someone else, Not now), through fill_coven_position and
--      hold_coven_queue_proposal.
--    * Leaders see and manage the list on the position's screen (reorder,
--      add, remove with a reason); members see their place and can
--      withdraw. Every change is kept in coven_position_queue_events.
--    * Phone notes: coven-notify { queue_id, event: 'queued' | 'proposed' |
--      'promoted' }, rung by whoever caused it (coven_queue_fresh_notes lists
--      them for the caller), once each.

-- ---------------------------------------------------------------------------
-- 1. Test answers only after passing
-- ---------------------------------------------------------------------------

alter table public.coven_quiz_attempts add column if not exists marks jsonb not null default '{}'::jsonb;

-- Which choice questions were answered right: { "<question id>": true | false }.
create or replace function public.coven_quiz_marks(p_questions jsonb, p_answers jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select coalesce(jsonb_object_agg(q->>'id',
    case when jsonb_typeof(p_answers->(q->>'id')) = 'array' and jsonb_typeof(q->'correct') = 'array' then
      (select coalesce(array_agg(distinct (c#>>'{}')::integer order by (c#>>'{}')::integer), '{}') from jsonb_array_elements(q->'correct') c where jsonb_typeof(c) = 'number')
        = (select coalesce(array_agg(distinct (a#>>'{}')::integer order by (a#>>'{}')::integer), '{}') from jsonb_array_elements(p_answers->(q->>'id')) a where jsonb_typeof(a) = 'number')
    else false end), '{}'::jsonb)
  from jsonb_array_elements(case when jsonb_typeof(p_questions) = 'array' then p_questions else '[]'::jsonb end) q
  where q->>'type' in ('single', 'multi', 'truefalse') and coalesce(q->>'id', '') <> '';
$$;

create or replace function public.mark_coven_quiz_attempt()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.marks := public.coven_quiz_marks(new.questions, new.answers);
  return new;
end;
$$;

drop trigger if exists coven_quiz_attempts_marks on public.coven_quiz_attempts;
create trigger coven_quiz_attempts_marks before insert or update of questions, answers on public.coven_quiz_attempts
  for each row execute function public.mark_coven_quiz_attempt();

update public.coven_quiz_attempts set marks = public.coven_quiz_marks(questions, answers)
where marks = '{}'::jsonb and questions <> '[]'::jsonb;

-- Whether the caller has passed that test (that quiz anywhere, or that step).
create or replace function public.coven_quiz_passed_by_me(p_quiz uuid, p_task uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and exists (
    select 1 from public.coven_quiz_attempts a
    where a.user_id = auth.uid() and a.status = 'passed'
      and ((p_quiz is not null and a.quiz_id = p_quiz) or (p_task is not null and a.task_id = p_task))
  );
$$;

-- Whether the caller is taking that test themselves (in one of the coven's
-- programs with it on a step, whatever their enrollment's state) and hasn't passed it.
create or replace function public.coven_quiz_taking(p_coven uuid, p_quiz uuid, p_task uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (
      select 1 from public.coven_program_enrollments e
      join public.coven_program_tasks t on t.program_id = e.program_id
      where e.coven_id = p_coven and e.user_id = auth.uid()
        and ((p_quiz is not null and t.quiz_id = p_quiz) or (p_task is not null and t.id = p_task))
    )
    and not public.coven_quiz_passed_by_me(p_quiz, p_task);
$$;

-- Whether the caller may see the key in an attempt by p_user: their own once
-- they've passed that test; anyone's for those who manage programs (and the
-- coven's head); their mentee's for a mentor, unless the mentor is taking
-- that test themselves and hasn't passed it.
create or replace function public.coven_quiz_key_open(p_coven uuid, p_user uuid, p_quiz uuid, p_task uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when p_user = auth.uid() then public.coven_quiz_passed_by_me(p_quiz, p_task)
    when public.coven_program_manager(p_coven) then true
    when public.coven_program_overseer(p_coven, p_user) then not public.coven_quiz_taking(p_coven, p_quiz, p_task)
    else false
  end;
$$;

-- An attempt as the caller may see it: without the right options,
-- explanations and scoring guide unless coven_quiz_key_open; the trainee's
-- own unreleased written scores held back until the result is final.
create or replace function public.coven_quiz_attempt_shown(a public.coven_quiz_attempts)
returns public.coven_quiz_attempts
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if a.id is null then return a; end if;
  if not public.coven_quiz_key_open(a.coven_id, a.user_id, a.quiz_id, a.task_id) then
    a.questions := public.coven_quiz_strip(a.questions);
    -- A mentor taking the same test: which answers were right would show the key.
    if a.user_id is distinct from auth.uid() then a.marks := '{}'::jsonb; end if;
  end if;
  if a.user_id = auth.uid() and a.status in ('submitted', 'scored') then
    a.manual_scores := '{}'::jsonb;
    a.feedback := null;
    a.total := null;
  end if;
  return a;
end;
$$;

-- Every attempt in a coven the caller may see, as they may see it: their own,
-- their mentees', and everyone's for those who manage programs. Newest first.
create or replace function public.coven_quiz_attempts_seen(p_coven uuid)
returns setof public.coven_quiz_attempts
language sql
stable
security definer
set search_path = public
as $$
  select s.*
  from public.coven_quiz_attempts a
  cross join lateral public.coven_quiz_attempt_shown(a) s
  where a.coven_id = p_coven
    and auth.uid() is not null
    and (a.user_id = auth.uid() or public.coven_program_manager(a.coven_id) or public.coven_is_mentor_of(a.coven_id, a.user_id))
  order by a.submitted_at desc
  limit 2000;
$$;

-- The table itself, with the key: only those who may see the key in someone
-- else's attempt. Nobody reads their own here (coven_quiz_attempts_seen).
drop policy if exists "Attempts are seen by the person, their mentor and program managers" on public.coven_quiz_attempts;
drop policy if exists "Attempts with their key are seen by those scoring them" on public.coven_quiz_attempts;
create policy "Attempts with their key are seen by those scoring them" on public.coven_quiz_attempts
  for select to authenticated using (
    user_id <> auth.uid()
    and (public.coven_program_manager(coven_id) or (public.coven_is_mentor_of(coven_id, user_id) and public.coven_quiz_key_open(coven_id, user_id, quiz_id, task_id)))
  );

-- As in 20261110000100_coven_courses.sql, except that a mentor taking the
-- same test (and not yet through it) gets the questions without the key.
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
  full_key := public.coven_program_manager(quiz.coven_id)
    or (e.id is not null and public.coven_program_overseer(e.coven_id, e.user_id) and not public.coven_quiz_taking(quiz.coven_id, quiz.id, null));
  return jsonb_build_object(
    'id', quiz.id, 'coven_id', quiz.coven_id, 'title', quiz.title, 'intro', quiz.intro, 'pass_percent', quiz.pass_percent,
    'retakes', quiz.retakes, 'wait_hours', quiz.wait_hours, 'source_id', quiz.source_id, 'with_key', full_key,
    'questions', case when full_key then quiz.questions else public.coven_quiz_strip(quiz.questions) end
  );
end;
$$;

-- As in 20261110000100_coven_courses.sql; the attempt comes back as the
-- trainee may see it (with the key only when this one passed).
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
  return public.coven_quiz_attempt_shown(saved);
end;
$$;

-- As in 20261110000100_coven_courses.sql; the attempt comes back as the scorer may see it.
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
  return public.coven_quiz_attempt_shown(saved);
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Waiting lists for full positions
-- ---------------------------------------------------------------------------

create table if not exists public.coven_position_queue (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  rank_id uuid not null references public.coven_ranks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- How they came to it: finishing a program, an approved request, or added by a leader.
  source text not null check (source in ('program', 'application', 'leader')),
  -- The enrollment or the request, when there is one.
  source_id uuid,
  -- When they qualified (kept as it was), and their place in line (earliest first; reordering changes it).
  qualified_at timestamptz not null default now(),
  queued_at timestamptz not null default now(),
  -- waiting; proposed (a place is free and they're next, for the head to confirm); then promoted,
  -- passed_over (by a leader, with the reason), withdrawn (by themselves) or left (no longer a member in good standing).
  status text not null default 'waiting' check (status in ('waiting', 'proposed', 'promoted', 'passed_over', 'withdrawn', 'left')),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  proposed_at timestamptz,
  -- Whoever's change freed the place (they ring the phones for it).
  proposed_by uuid references auth.users (id) on delete set null,
  -- "Not now": the place stays empty and they stay proposed.
  deferred_at timestamptz,
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  note text check (note is null or char_length(note) <= 500),
  -- Claimed once each by coven-notify.
  queued_notified_at timestamptz,
  proposed_notified_at timestamptz,
  promoted_notified_at timestamptz,
  updated_at timestamptz not null default now()
);

create unique index if not exists coven_position_queue_one_active on public.coven_position_queue (rank_id, user_id) where status in ('waiting', 'proposed');
create unique index if not exists coven_position_queue_one_proposed on public.coven_position_queue (rank_id) where status = 'proposed';
create index if not exists coven_position_queue_line_idx on public.coven_position_queue (rank_id, status, queued_at);
create index if not exists coven_position_queue_member_idx on public.coven_position_queue (coven_id, user_id);

-- Everything that happens to an entry, and who did it.
create table if not exists public.coven_position_queue_events (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid not null references public.coven_position_queue (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  rank_id uuid not null references public.coven_ranks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  actor_id uuid default auth.uid() references auth.users (id) on delete set null,
  action text not null check (action in ('queued', 'proposed', 'promoted', 'passed_over', 'withdrawn', 'left', 'returned', 'reordered', 'not_now')),
  note text check (note is null or char_length(note) <= 500),
  at timestamptz not null default now()
);

create index if not exists coven_position_queue_events_rank_idx on public.coven_position_queue_events (rank_id, at desc);

alter table public.coven_position_queue enable row level security;
alter table public.coven_position_queue_events enable row level security;

drop policy if exists "Members see their own places; leaders see the lists" on public.coven_position_queue;
create policy "Members see their own places; leaders see the lists" on public.coven_position_queue
  for select to authenticated using (user_id = auth.uid() or public.coven_permission(coven_id, 'manage') or public.is_community_moderator());

drop policy if exists "Leaders see what happened on the lists" on public.coven_position_queue_events;
create policy "Leaders see what happened on the lists" on public.coven_position_queue_events
  for select to authenticated using (public.coven_permission(coven_id, 'manage') or public.is_community_moderator());

revoke insert, update, delete on public.coven_position_queue, public.coven_position_queue_events from anon, authenticated;
revoke select on public.coven_position_queue, public.coven_position_queue_events from anon;

-- Keep one thing that happened to an entry.
create or replace function public.coven_queue_log(p_queue uuid, p_action text, p_note text default null)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.coven_position_queue_events (queue_id, coven_id, rank_id, user_id, actor_id, action, note, at)
  select q.id, q.coven_id, q.rank_id, q.user_id, auth.uid(), p_action, left(nullif(btrim(coalesce(p_note, '')), ''), 500), clock_timestamp()
  from public.coven_position_queue q where q.id = p_queue;
$$;

-- Why someone can't be moved up now (null when they can): no longer an
-- active member, not in good standing (banned from the site, an agreement
-- unsigned, paused), or already at that level or above.
create or replace function public.coven_queue_unfit(p_coven uuid, p_user uuid, p_level integer)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when m.user_id is null then 'No longer a member of the coven.'
    when public.is_community_banned(p_user) then 'No longer in good standing.'
    when public.coven_unsigned_agreements(p_coven, p_user) > 0 then 'Has the coven’s agreements still to sign.'
    when m.muted_until is not null and m.muted_until > now() then 'Paused in the coven.'
    when public.coven_level(p_coven, p_user) >= p_level then 'Already holds this position or a higher one.'
    else null
  end
  from (select 1) x
  left join public.coven_members m on m.coven_id = p_coven and m.user_id = p_user and m.status = 'active';
$$;

-- Whether a position has a place free (no limit, or fewer holders than places).
create or replace function public.coven_rank_has_place(p_rank uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.coven_ranks r where r.id = p_rank and (r.seat_limit is null or public.coven_rank_holder_count(r.id) < r.seat_limit));
$$;

-- Someone's place in line (1 is next: whoever is proposed, then by queued_at), or null when they aren't on it.
create or replace function public.coven_queue_place(p_queue uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case when q.status in ('waiting', 'proposed') then (
    select z.n from (
      select o.id, row_number() over (order by o.status <> 'proposed', o.queued_at, o.id)::integer as n
      from public.coven_position_queue o where o.rank_id = q.rank_id and o.status in ('waiting', 'proposed')
    ) z where z.id = q.id
  ) end
  from public.coven_position_queue q where q.id = p_queue;
$$;

-- When a place is free and nobody is proposed yet: the first person waiting
-- who can be moved up becomes 'proposed' (anyone who can't is marked
-- 'left', with why). Moves nobody. Locks the position's row, as
-- coven_rank_take_seat does, so two at once wait for each other. Returns the
-- proposed entry, if any.
create or replace function public.coven_queue_propose_next(p_rank uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
  q public.coven_position_queue;
  why text;
begin
  select * into r from public.coven_ranks where id = p_rank for update;
  if r.id is null then return null; end if;
  if not exists (select 1 from public.covens c where c.id = r.coven_id and c.status = 'active') then return null; end if;
  if r.seat_limit is not null and public.coven_rank_holder_count(r.id) >= r.seat_limit then return null; end if;
  if exists (select 1 from public.coven_position_queue where rank_id = r.id and status = 'proposed') then return null; end if;
  for q in select * from public.coven_position_queue where rank_id = r.id and status = 'waiting' order by queued_at, id for update loop
    why := public.coven_queue_unfit(q.coven_id, q.user_id, r.level);
    if why is null then
      update public.coven_position_queue
      set status = 'proposed', proposed_at = now(), proposed_by = auth.uid(), deferred_at = null, updated_at = now()
      where id = q.id;
      perform public.coven_queue_log(q.id, 'proposed', null);
      return q.id;
    end if;
    update public.coven_position_queue set status = 'left', note = why, decided_at = now(), decided_by = null, updated_at = now() where id = q.id;
    perform public.coven_queue_log(q.id, 'left', why);
  end loop;
  return null;
end;
$$;

-- A member left, was removed, or moved position: their entries leave the
-- lines (or are done, for the position they were given), a proposal for a
-- position that just filled goes back to waiting, and the place they freed
-- is offered to the next in line.
create or replace function public.coven_queue_member_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  freed uuid[] := '{}';
  x uuid;
  q public.coven_position_queue;
  new_level integer;
  why text;
begin
  if tg_op = 'DELETE' or (old.status = 'active' and new.status <> 'active') then
    why := case when tg_op = 'DELETE' then 'No longer a member of the coven.'
                when new.status = 'left' then 'Left the coven.'
                else 'No longer a member of the coven.' end;
    for q in select * from public.coven_position_queue
             where coven_id = old.coven_id and user_id = old.user_id and status in ('waiting', 'proposed') for update loop
      update public.coven_position_queue set status = 'left', note = why, decided_at = now(), updated_at = now() where id = q.id;
      perform public.coven_queue_log(q.id, 'left', why);
      if q.status = 'proposed' then freed := freed || q.rank_id; end if;
    end loop;
    if old.status = 'active' and old.rank_id is not null then freed := freed || old.rank_id; end if;
  elsif new.status = 'active' and old.status = 'active' and new.rank_id is distinct from old.rank_id then
    new_level := coalesce((select level from public.coven_ranks where id = new.rank_id), 0);
    for q in select qq.* from public.coven_position_queue qq join public.coven_ranks r on r.id = qq.rank_id
             where qq.coven_id = new.coven_id and qq.user_id = new.user_id and qq.status in ('waiting', 'proposed')
               and (qq.rank_id = new.rank_id or r.level <= new_level) for update of qq loop
      if q.rank_id = new.rank_id then
        -- Given it some other way (a request, by hand): nothing more to ring for it.
        update public.coven_position_queue
        set status = 'promoted', decided_by = auth.uid(), decided_at = now(), promoted_notified_at = now(), updated_at = now()
        where id = q.id;
        perform public.coven_queue_log(q.id, 'promoted', null);
      else
        update public.coven_position_queue set status = 'left', note = 'Already holds this position or a higher one.', decided_at = now(), updated_at = now()
        where id = q.id;
        perform public.coven_queue_log(q.id, 'left', 'Already holds this position or a higher one.');
        if q.status = 'proposed' then freed := freed || q.rank_id; end if;
      end if;
    end loop;
    -- Their new position just filled: someone proposed for it waits again.
    if new.rank_id is not null and not public.coven_rank_has_place(new.rank_id) then
      for q in select * from public.coven_position_queue where rank_id = new.rank_id and status = 'proposed' and user_id <> new.user_id for update loop
        update public.coven_position_queue set status = 'waiting', proposed_at = null, deferred_at = null, updated_at = now() where id = q.id;
        perform public.coven_queue_log(q.id, 'returned', 'The place was filled.');
      end loop;
    end if;
    if old.rank_id is not null then freed := freed || old.rank_id; end if;
  end if;
  foreach x in array freed loop
    perform public.coven_queue_propose_next(x);
  end loop;
  return null;
end;
$$;

drop trigger if exists coven_members_queue on public.coven_members;
create trigger coven_members_queue after update of status, rank_id or delete on public.coven_members
  for each row execute function public.coven_queue_member_changed();

-- A leader gave a position more places (or took its limit away).
create or replace function public.coven_queue_rank_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.seat_limit is null and old.seat_limit is not null) or new.seat_limit > old.seat_limit then
    perform public.coven_queue_propose_next(new.id);
  end if;
  return null;
end;
$$;

drop trigger if exists coven_ranks_queue on public.coven_ranks;
create trigger coven_ranks_queue after update of seat_limit on public.coven_ranks
  for each row execute function public.coven_queue_rank_changed();

-- Put someone on a position's list (or find them already on it). Locks the position first.
create or replace function public.coven_queue_join(p_rank uuid, p_user uuid, p_source text, p_source_id uuid, p_note text default null)
returns public.coven_position_queue
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
  q public.coven_position_queue;
begin
  select * into r from public.coven_ranks where id = p_rank for update;
  select * into q from public.coven_position_queue where rank_id = p_rank and user_id = p_user and status in ('waiting', 'proposed');
  if q.id is not null then return q; end if;
  -- The moment itself (not the transaction's start), so two joining in one go keep their order.
  insert into public.coven_position_queue (coven_id, rank_id, user_id, source, source_id, note, qualified_at, queued_at)
  values (r.coven_id, r.id, p_user, p_source, p_source_id, left(nullif(btrim(coalesce(p_note, '')), ''), 500), clock_timestamp(), clock_timestamp())
  returning * into q;
  perform public.coven_queue_log(q.id, 'queued', p_note);
  return q;
end;
$$;

-- ---------------------------------------------------------------------------
-- Graduating respects the places (pass_coven_stage, as in
-- 20261027000000_coven_programs.sql, with the waiting list)
-- ---------------------------------------------------------------------------

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
  award public.coven_ranks;
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
      -- Under the position's lock, as coven_rank_take_seat: full, or others
      -- already in line for it, and they join the waiting list instead.
      select * into award from public.coven_ranks where id = prog.award_rank_id for update;
      if award.id is not null and exists (
        select 1 from public.coven_members m
        where m.coven_id = e.coven_id and m.user_id = e.user_id and m.status = 'active'
          and coalesce((select r.level from public.coven_ranks r where r.id = m.rank_id), 0) < award.level
          and m.user_id is distinct from (select c.founder_id from public.covens c where c.id = e.coven_id)
      ) then
        if not public.coven_rank_has_place(award.id)
           or exists (select 1 from public.coven_position_queue q where q.rank_id = award.id and q.status in ('waiting', 'proposed') and q.user_id <> e.user_id) then
          perform public.coven_queue_join(award.id, e.user_id, 'program', e.id, null);
        else
          update public.coven_members set rank_id = award.id
          where coven_id = e.coven_id and user_id = e.user_id and status = 'active';
        end if;
      end if;
    end if;
  end if;
  return e;
end;
$$;

-- ---------------------------------------------------------------------------
-- A request on a full position, approved onto the waiting list
-- ---------------------------------------------------------------------------

-- As decide_coven_advancement approving it (the same permissions and ticks),
-- except that the position is full (or others are waiting for it), so they
-- join its waiting list. The request is 'approved'; the reviewer's note is
-- kept. Returns { request, queue }.
create or replace function public.queue_coven_advancement(p_request uuid, p_note text default null, p_checked jsonb default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.coven_advancement_requests;
  r public.coven_ranks;
  v_checked jsonb;
  item jsonb;
  missing text;
  q public.coven_position_queue;
begin
  select * into req from public.coven_advancement_requests where id = p_request for update;
  if req.id is null then raise exception 'That request was not found.'; end if;
  if req.status <> 'pending' then raise exception 'That request has already been decided.'; end if;
  if req.user_id = auth.uid() and not public.is_community_moderator() then raise exception 'You cannot decide your own request.'; end if;
  if not (public.coven_permission(req.coven_id, 'review') or public.is_community_moderator()) then
    raise exception 'Only the coven''s reviewers can decide advancement.';
  end if;
  if not public.coven_can_grant(req.coven_id, req.rank_id) then
    raise exception 'That position must be granted by someone more senior.';
  end if;
  select * into r from public.coven_ranks where id = req.rank_id for update;

  v_checked := coalesce((
    select jsonb_object_agg(k, v) from jsonb_each(req.checked) as e(k, v)
    where exists (select 1 from jsonb_array_elements(r.requirement_items) i where i->>'id' = k and i->>'kind' in ('custom', 'mentor_approval'))
  ), '{}'::jsonb);
  if jsonb_typeof(p_checked) = 'array' then
    for item in select i from jsonb_array_elements(r.requirement_items) i
                where i->>'kind' in ('custom', 'mentor_approval') and p_checked ? (i->>'id') loop
      if v_checked ? (item->>'id') then continue; end if;
      if item->>'kind' = 'mentor_approval'
         and not (public.coven_is_mentor_of(req.coven_id, req.user_id) or public.coven_permission(req.coven_id, 'manage') or public.is_community_moderator()) then
        raise exception 'Only their mentor or the coven’s leaders can give the mentor’s approval.';
      end if;
      v_checked := v_checked || jsonb_build_object(item->>'id', jsonb_build_object('by', auth.uid(), 'at', now()));
    end loop;
  end if;
  select string_agg(coalesce(case when i->>'kind' = 'mentor_approval' then 'their mentor’s approval' else i->>'text' end, 'a requirement'), '; ') into missing
  from jsonb_array_elements(r.requirement_items) i
  where i->>'kind' in ('custom', 'mentor_approval') and not v_checked ? (i->>'id');
  if missing is not null then raise exception 'Tick what the position asks before approving: %.', missing; end if;

  if public.coven_rank_has_place(r.id)
     and not exists (select 1 from public.coven_position_queue o where o.rank_id = r.id and o.status in ('waiting', 'proposed') and o.user_id <> req.user_id) then
    raise exception '% has a place free: approve the request instead.', r.name;
  end if;
  if public.coven_queue_unfit(req.coven_id, req.user_id, r.level) is not null then
    raise exception 'They can’t join the waiting list: %', lower(left(public.coven_queue_unfit(req.coven_id, req.user_id, r.level), 1)) || substr(public.coven_queue_unfit(req.coven_id, req.user_id, r.level), 2);
  end if;

  q := public.coven_queue_join(r.id, req.user_id, 'application', req.id, p_note);
  update public.coven_advancement_requests
  set status = 'approved', reviewer_id = auth.uid(), reviewer_note = nullif(btrim(p_note), ''), decided_at = now(), checked = v_checked
  where id = p_request
  returning * into req;
  return jsonb_build_object('request', to_jsonb(req), 'queue', to_jsonb(q), 'place', public.coven_queue_place(q.id));
end;
$$;

-- ---------------------------------------------------------------------------
-- The leaders' tools (those who may open positions: the head, those with the
-- manage power in good standing, and site moderators)
-- ---------------------------------------------------------------------------

-- Give a position to someone: the one proposed, someone else on its list, or
-- any member who could hold it (they're put on the list first, as the
-- leader's choice). Takes the place under the position's lock. Whoever was
-- proposed, if not them, goes back to waiting in their place, or is passed
-- over (p_pass_over, with p_note as the reason). Then, if a place is still
-- free, the next in line is proposed.
create or replace function public.fill_coven_position(p_rank uuid, p_user uuid, p_note text default null, p_pass_over boolean default false)
returns public.coven_position_queue
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
  q public.coven_position_queue;
  prev public.coven_position_queue;
  why text;
  v_note text := left(nullif(btrim(coalesce(p_note, '')), ''), 500);
begin
  select * into r from public.coven_ranks where id = p_rank for update;
  if r.id is null then raise exception 'That position was not found.'; end if;
  if not public.coven_may_open_positions(r.coven_id) then
    raise exception 'Only the coven''s head and its leaders fill a position.';
  end if;
  if not public.coven_can_grant(r.coven_id, r.id) then raise exception 'That position must be granted by someone more senior.'; end if;
  if p_user = auth.uid() and not public.is_community_moderator() then raise exception 'You cannot give yourself a position.'; end if;
  if p_user = (select founder_id from public.covens where id = r.coven_id) then raise exception 'The coven''s founder already leads it.'; end if;
  why := public.coven_queue_unfit(r.coven_id, p_user, r.level);
  if why is not null then raise exception 'They can’t be given % now: %', r.name, lower(left(why, 1)) || substr(why, 2); end if;
  if not public.coven_rank_has_place(r.id) then
    raise exception '% A place has to be free first.', public.coven_rank_full_message(r.name, r.seat_limit);
  end if;
  if p_pass_over and v_note is null then raise exception 'Say why they’re passed over.'; end if;

  q := public.coven_queue_join(r.id, p_user, 'leader', null, null);
  for prev in select * from public.coven_position_queue where rank_id = r.id and status = 'proposed' and id <> q.id for update loop
    if p_pass_over then
      update public.coven_position_queue set status = 'passed_over', note = v_note, decided_by = auth.uid(), decided_at = now(), updated_at = now() where id = prev.id;
      perform public.coven_queue_log(prev.id, 'passed_over', v_note);
    else
      update public.coven_position_queue set status = 'waiting', proposed_at = null, deferred_at = null, updated_at = now() where id = prev.id;
      perform public.coven_queue_log(prev.id, 'returned', 'Someone else was chosen; they keep their place.');
    end if;
  end loop;
  update public.coven_position_queue
  set status = 'promoted', decided_by = auth.uid(), decided_at = now(), note = coalesce(v_note, coven_position_queue.note), updated_at = now()
  where id = q.id returning * into q;
  perform public.coven_queue_log(q.id, 'promoted', v_note);
  update public.coven_members set rank_id = r.id where coven_id = r.coven_id and user_id = p_user and status = 'active';
  if not found then raise exception 'That person is no longer a member.'; end if;
  perform public.coven_queue_propose_next(r.id);
  return q;
end;
$$;

-- "Not now": the place stays empty and they stay proposed (the card waits quietly).
create or replace function public.hold_coven_queue_proposal(p_queue uuid, p_note text default null)
returns public.coven_position_queue
language plpgsql
security definer
set search_path = public
as $$
declare
  q public.coven_position_queue;
begin
  select * into q from public.coven_position_queue where id = p_queue for update;
  if q.id is null then raise exception 'That place in line was not found.'; end if;
  if not public.coven_may_open_positions(q.coven_id) then raise exception 'Only the coven''s head and its leaders decide this.'; end if;
  if q.status <> 'proposed' then raise exception 'They aren''t proposed for a place just now.'; end if;
  update public.coven_position_queue set deferred_at = now(), updated_at = now() where id = q.id returning * into q;
  perform public.coven_queue_log(q.id, 'not_now', p_note);
  return q;
end;
$$;

-- Add a member to a position's list (at the end), as the leader's choice.
create or replace function public.add_to_coven_position_queue(p_rank uuid, p_user uuid, p_note text default null)
returns public.coven_position_queue
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
  q public.coven_position_queue;
  why text;
begin
  select * into r from public.coven_ranks where id = p_rank for update;
  if r.id is null then raise exception 'That position was not found.'; end if;
  if not public.coven_may_open_positions(r.coven_id) then raise exception 'Only the coven''s head and its leaders keep the waiting lists.'; end if;
  if r.is_default then raise exception 'Everyone joins the coven as %, so there is no waiting list for it.', r.name; end if;
  why := public.coven_queue_unfit(r.coven_id, p_user, r.level);
  if why is not null then raise exception 'They can’t be added: %', lower(left(why, 1)) || substr(why, 2); end if;
  if exists (select 1 from public.coven_position_queue where rank_id = r.id and user_id = p_user and status in ('waiting', 'proposed')) then
    raise exception 'They''re on the list for % already.', r.name;
  end if;
  q := public.coven_queue_join(r.id, p_user, 'leader', null, p_note);
  perform public.coven_queue_propose_next(r.id);
  select * into q from public.coven_position_queue where id = q.id;
  return q;
end;
$$;

-- Take someone off a list, with the reason (kept). If they were proposed, the next in line is.
create or replace function public.remove_from_coven_position_queue(p_queue uuid, p_reason text)
returns public.coven_position_queue
language plpgsql
security definer
set search_path = public
as $$
declare
  q public.coven_position_queue;
  was text;
  reason text := left(nullif(btrim(coalesce(p_reason, '')), ''), 500);
begin
  select * into q from public.coven_position_queue where id = p_queue;
  if q.id is null then raise exception 'That place in line was not found.'; end if;
  if not public.coven_may_open_positions(q.coven_id) then raise exception 'Only the coven''s head and its leaders keep the waiting lists.'; end if;
  if reason is null then raise exception 'Say why they''re taken off the list.'; end if;
  perform 1 from public.coven_ranks where id = q.rank_id for update;
  select * into q from public.coven_position_queue where id = p_queue for update;
  if q.status not in ('waiting', 'proposed') then raise exception 'They aren''t on the list any more.'; end if;
  was := q.status;
  update public.coven_position_queue set status = 'passed_over', note = reason, decided_by = auth.uid(), decided_at = now(), updated_at = now()
  where id = q.id returning * into q;
  perform public.coven_queue_log(q.id, 'passed_over', reason);
  if was = 'proposed' then perform public.coven_queue_propose_next(q.rank_id); end if;
  return q;
end;
$$;

-- Put a position's list in a new order: p_order is every entry on it
-- (waiting and proposed), first to last. The times already on the list are
-- handed out again in that order, so nobody's place depends on the clock.
-- A proposal already made stands (the head may choose someone else).
create or replace function public.reorder_coven_position_queue(p_rank uuid, p_order uuid[], p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
  ids uuid[];
  times timestamptz[];
  i integer;
  v_at timestamptz;
  before_place integer;
begin
  select * into r from public.coven_ranks where id = p_rank for update;
  if r.id is null then raise exception 'That position was not found.'; end if;
  if not public.coven_may_open_positions(r.coven_id) then raise exception 'Only the coven''s head and its leaders keep the waiting lists.'; end if;
  select array_agg(id order by queued_at, id), array_agg(queued_at order by queued_at, id) into ids, times
  from public.coven_position_queue where rank_id = r.id and status in ('waiting', 'proposed');
  if ids is null or p_order is null or cardinality(p_order) <> cardinality(ids)
     or exists (select unnest(p_order) except select unnest(ids)) then
    raise exception 'The list has changed since you opened it. Look again and reorder.';
  end if;
  for i in 1 .. cardinality(p_order) loop
    v_at := times[i];
    if i > 1 and v_at <= times[i - 1] then
      v_at := times[i - 1] + interval '1 millisecond';
      times[i] := v_at;
    end if;
    before_place := array_position(ids, p_order[i]);
    update public.coven_position_queue set queued_at = v_at, updated_at = now() where id = p_order[i] and queued_at is distinct from v_at;
    if before_place <> i then
      perform public.coven_queue_log(p_order[i], 'reordered', coalesce(nullif(btrim(coalesce(p_reason, '')), ''), 'Moved from ' || before_place || ' to ' || i || '.'));
    end if;
  end loop;
  return public.coven_position_queue_list(r.id);
end;
$$;

-- A member takes themselves off a list. If they were proposed, the next in line is.
create or replace function public.withdraw_from_coven_position_queue(p_queue uuid)
returns public.coven_position_queue
language plpgsql
security definer
set search_path = public
as $$
declare
  q public.coven_position_queue;
  was text;
begin
  select * into q from public.coven_position_queue where id = p_queue;
  if q.id is null or q.user_id <> auth.uid() then raise exception 'That place in line was not found.'; end if;
  perform 1 from public.coven_ranks where id = q.rank_id for update;
  select * into q from public.coven_position_queue where id = p_queue for update;
  if q.status not in ('waiting', 'proposed') then raise exception 'You aren''t on that list any more.'; end if;
  was := q.status;
  update public.coven_position_queue set status = 'withdrawn', decided_by = auth.uid(), decided_at = now(), updated_at = now()
  where id = q.id returning * into q;
  perform public.coven_queue_log(q.id, 'withdrawn', null);
  if was = 'proposed' then perform public.coven_queue_propose_next(q.rank_id); end if;
  return q;
end;
$$;

-- ---------------------------------------------------------------------------
-- What the screens read
-- ---------------------------------------------------------------------------

-- One entry as the screens show it.
create or replace function public.coven_queue_entry_json(q public.coven_position_queue)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', q.id, 'coven_id', q.coven_id, 'rank_id', q.rank_id, 'user_id', q.user_id,
    'name', coalesce((select display_name from public.coven_profiles p where p.user_id = q.user_id), 'A member'),
    'source', q.source, 'source_id', q.source_id, 'qualified_at', q.qualified_at, 'queued_at', q.queued_at,
    'status', q.status, 'proposed_at', q.proposed_at, 'deferred_at', q.deferred_at, 'decided_at', q.decided_at, 'note', q.note,
    'place', public.coven_queue_place(q.id)
  );
$$;

-- A position's list, for its leaders: who's on it, in order, how many hold
-- the position, and the latest of what happened on it.
create or replace function public.coven_position_queue_list(p_rank uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
begin
  select * into r from public.coven_ranks where id = p_rank;
  if r.id is null then raise exception 'That position was not found.'; end if;
  if not (public.coven_permission(r.coven_id, 'manage') or public.is_community_moderator()) then
    raise exception 'Only the coven''s head and its leaders see the waiting lists.';
  end if;
  return jsonb_build_object(
    'rank_id', r.id,
    'seat_limit', r.seat_limit,
    'held', public.coven_rank_holder_count(r.id),
    'entries', coalesce((
      select jsonb_agg(public.coven_queue_entry_json(q) order by q.status <> 'proposed', q.queued_at, q.id)
      from public.coven_position_queue q where q.rank_id = r.id and q.status in ('waiting', 'proposed')
    ), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(jsonb_build_object(
        'action', x.action, 'user_id', x.user_id, 'actor_id', x.actor_id, 'note', x.note, 'at', x.at,
        'name', coalesce((select display_name from public.coven_profiles p where p.user_id = x.user_id), 'A member'),
        'actor', (select display_name from public.coven_profiles p where p.user_id = x.actor_id)
      ) order by x.at desc)
      from (select * from public.coven_position_queue_events e where e.rank_id = r.id order by e.at desc limit 40) x
    ), '[]'::jsonb)
  );
end;
$$;

-- Everyone on the coven's lists, for its leaders (the Review cards and the counts).
create or replace function public.coven_position_queues(p_coven uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (public.coven_permission(p_coven, 'manage') or public.is_community_moderator()) then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(public.coven_queue_entry_json(q) || jsonb_build_object('held', public.coven_rank_holder_count(q.rank_id)) order by q.rank_id, q.status <> 'proposed', q.queued_at, q.id)
    from public.coven_position_queue q where q.coven_id = p_coven and q.status in ('waiting', 'proposed')
  ), '[]'::jsonb);
end;
$$;

-- The caller's own places in the coven's lines.
create or replace function public.coven_my_queue(p_coven uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(public.coven_queue_entry_json(q) order by q.queued_at), '[]'::jsonb)
  from public.coven_position_queue q
  where q.coven_id = p_coven and q.user_id = auth.uid() and q.status in ('waiting', 'proposed');
$$;

-- Phone notes the caller's last change made due, for the app or page to ring
-- through coven-notify { queue_id, event }: someone they put on a list
-- ('queued'), a place their change freed ('proposed'), someone they moved up
-- ('promoted'). Only the last few minutes, and only those not yet sent.
create or replace function public.coven_queue_fresh_notes(p_coven uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('queue_id', x.id, 'event', x.event)), '[]'::jsonb)
  from (
    select q.id, 'queued' as event from public.coven_position_queue q
    where q.coven_id = p_coven and q.created_by = auth.uid() and q.created_at > now() - interval '5 minutes'
      and q.queued_notified_at is null and q.status in ('waiting', 'proposed') and q.user_id <> auth.uid()
    union all
    select q.id, 'proposed' from public.coven_position_queue q
    where q.coven_id = p_coven and q.status = 'proposed' and q.proposed_by = auth.uid() and q.proposed_at > now() - interval '5 minutes'
      and (q.proposed_notified_at is null or q.proposed_notified_at < q.proposed_at)
    union all
    select q.id, 'promoted' from public.coven_position_queue q
    where q.coven_id = p_coven and q.status = 'promoted' and q.decided_by = auth.uid() and q.decided_at > now() - interval '5 minutes'
      and q.promoted_notified_at is null and q.user_id <> auth.uid()
  ) x
  where auth.uid() is not null;
$$;

-- For coven-notify: who decides a free place (the coven's head and active
-- members whose position has the manage power), never the person proposed.
create or replace function public.coven_queue_deciders(p_queue uuid)
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(distinct m.user_id), '{}')
  from public.coven_position_queue q
  join public.covens c on c.id = q.coven_id and c.status = 'active'
  join public.coven_members m on m.coven_id = q.coven_id and m.status = 'active'
  left join public.coven_ranks r on r.id = m.rank_id
  where q.id = p_queue and m.user_id <> q.user_id and (m.user_id = c.founder_id or coalesce(r.can_manage, false));
$$;

-- ---------------------------------------------------------------------------
-- Who may call what
-- ---------------------------------------------------------------------------

revoke execute on function
  public.coven_quiz_marks(jsonb, jsonb),
  public.mark_coven_quiz_attempt(),
  public.coven_quiz_passed_by_me(uuid, uuid),
  public.coven_quiz_taking(uuid, uuid, uuid),
  public.coven_quiz_attempt_shown(public.coven_quiz_attempts),
  public.coven_queue_log(uuid, text, text),
  public.coven_queue_unfit(uuid, uuid, integer),
  public.coven_queue_propose_next(uuid),
  public.coven_queue_member_changed(),
  public.coven_queue_rank_changed(),
  public.coven_queue_join(uuid, uuid, text, uuid, text),
  public.coven_queue_entry_json(public.coven_position_queue),
  public.coven_queue_deciders(uuid),
  public.coven_queue_place(uuid)
from public, anon, authenticated;

revoke execute on function
  public.coven_quiz_key_open(uuid, uuid, uuid, uuid),
  public.coven_quiz_attempts_seen(uuid),
  public.coven_quiz_view(uuid, uuid),
  public.submit_coven_quiz(uuid, uuid, jsonb),
  public.score_coven_quiz(uuid, jsonb, text, boolean),
  public.pass_coven_stage(uuid, text, boolean),
  public.coven_rank_has_place(uuid),
  public.queue_coven_advancement(uuid, text, jsonb),
  public.fill_coven_position(uuid, uuid, text, boolean),
  public.hold_coven_queue_proposal(uuid, text),
  public.add_to_coven_position_queue(uuid, uuid, text),
  public.remove_from_coven_position_queue(uuid, text),
  public.reorder_coven_position_queue(uuid, uuid[], text),
  public.withdraw_from_coven_position_queue(uuid),
  public.coven_position_queue_list(uuid),
  public.coven_position_queues(uuid),
  public.coven_my_queue(uuid),
  public.coven_queue_fresh_notes(uuid)
from public, anon;
grant execute on function
  public.coven_quiz_key_open(uuid, uuid, uuid, uuid),
  public.coven_quiz_attempts_seen(uuid),
  public.coven_quiz_view(uuid, uuid),
  public.submit_coven_quiz(uuid, uuid, jsonb),
  public.score_coven_quiz(uuid, jsonb, text, boolean),
  public.pass_coven_stage(uuid, text, boolean),
  public.coven_rank_has_place(uuid),
  public.queue_coven_advancement(uuid, text, jsonb),
  public.fill_coven_position(uuid, uuid, text, boolean),
  public.hold_coven_queue_proposal(uuid, text),
  public.add_to_coven_position_queue(uuid, uuid, text),
  public.remove_from_coven_position_queue(uuid, text),
  public.reorder_coven_position_queue(uuid, uuid[], text),
  public.withdraw_from_coven_position_queue(uuid),
  public.coven_position_queue_list(uuid),
  public.coven_position_queues(uuid),
  public.coven_my_queue(uuid),
  public.coven_queue_fresh_notes(uuid)
to authenticated;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.coven_queue_deciders(uuid), public.coven_queue_place(uuid) to service_role';
  end if;
end;
$$;
