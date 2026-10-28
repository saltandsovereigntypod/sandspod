-- NOT YET APPLIED. The coven's head signs off anyone's training, her own too.
-- Needs every coven migration before it (through 20261112000000_coven_lineage.sql:
-- coven_is_head counts the heads of covens above this one).
-- Additive and safe to run again (paste it whole).
--
-- * Until now nobody could sign off their own training: not a mentor, not a
--   program manager, not the coven's head. The head (coven_is_head: the
--   coven's founder, or the head of a mother or grandmother coven) now may,
--   for anyone in the coven and for herself, while in good standing there:
--   sign off or send back any task whatever its checked_by, score written
--   test answers and release the result, allow another attempt at a test,
--   and confirm (or pass early) any stage whatever its passed_by, which
--   finishes the program after the last stage.
-- * Everyone else keeps the rule: mentors and program managers never sign
--   off their own training.
-- * Kept honestly: the head's own sign-offs carry her as checked_by,
--   scored_by and passed_by, the same person as the trainee, so the app and
--   the website say "signed off by her, as the coven's head, on her own
--   training".
-- * Positions and waiting lists are unchanged. The coven's own head already
--   leads it (finishing a program never moves her, and fill_coven_position
--   says "The coven's founder already leads it"); a mother coven's head
--   ranks above every position in a daughter (coven_level 1001), so
--   coven_queue_unfit keeps her off its lists. "You cannot give yourself a
--   position" never stands in the head's way, so it stays as it is.
-- * Signing off directly: sign_off_coven_task signs off any unfinished task
--   in a stage someone has reached, sent for sign-off or not (begun, sent
--   back, or not yet touched), with an optional note, for whoever may sign
--   that task off (coven_can_check: the head, for anyone and herself; a
--   program manager or mentor, as before, never their own). It's kept as
--   such: coven_program_progress.signed_directly.
-- * Test keys: the head already sees every test's key (coven_quiz_view, as
--   one who manages programs). Her own attempts now come back with their key
--   and her own draft scores, so she can score her written answers.

-- Signed off without being sent for sign-off first (sign_off_coven_task).
alter table public.coven_program_progress add column if not exists signed_directly boolean not null default false;

-- Whether the caller may sign off training in that coven as its head (her own included).
create or replace function public.coven_head_signs_off(p_coven uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and public.coven_is_head(p_coven)
    and public.coven_in_good_standing(p_coven);
$$;

-- As in 20261027000000_coven_programs.sql, with the head through for anyone, herself included.
create or replace function public.coven_can_check(p_coven uuid, p_user uuid, p_checked_by text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.coven_head_signs_off(p_coven)
    or (p_user <> auth.uid() and (
      public.coven_program_manager(p_coven)
      or (p_checked_by in ('mentor', 'self') and public.coven_is_mentor_of(p_coven, p_user) and public.coven_in_good_standing(p_coven))
    ));
$$;

-- As in 20261027000000_coven_programs.sql; the message names the head too.
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
    raise exception 'Only % can sign this off.', case t.checked_by when 'manager' then 'a program manager or the coven''s head' else 'their mentor, a program manager or the coven''s head' end;
  end if;
  update public.coven_program_progress
  set status = case when p_approve then 'approved' else 'returned' end,
      times_done = case when p_approve then t.times else times_done end,
      checked_by = auth.uid(), checked_at = now(), feedback = nullif(btrim(p_feedback), ''), signed_directly = false, updated_at = now()
  where id = saved.id returning * into saved;
  return saved;
end;
$$;

-- Sign off a task directly: any unfinished task in a stage they've reached,
-- whether or not it was sent for sign-off, with an optional note. For whoever
-- may sign that task off (coven_can_check). Kept as signed_directly.
create or replace function public.sign_off_coven_task(p_enrollment uuid, p_task uuid, p_note text default null)
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
begin
  select * into e from public.coven_program_enrollments where id = p_enrollment for update;
  if e.id is null then raise exception 'That enrollment was not found.'; end if;
  select * into t from public.coven_program_tasks where id = p_task and program_id = e.program_id;
  if t.id is null then raise exception 'That task isn''t part of this program.'; end if;
  if not public.coven_can_check(e.coven_id, e.user_id, t.checked_by) then
    raise exception 'Only % can sign this off.', case t.checked_by when 'manager' then 'a program manager or the coven''s head' else 'their mentor, a program manager or the coven''s head' end;
  end if;
  if e.status <> 'active' then raise exception 'This program isn''t under way.'; end if;
  select position into current_position from public.coven_program_stages where id = e.stage_id;
  select position into task_position from public.coven_program_stages where id = t.stage_id;
  if task_position > coalesce(current_position, 0) then raise exception 'That task belongs to a later stage.'; end if;
  if char_length(coalesce(p_note, '')) > 2000 then raise exception 'Keep the note under 2,000 characters.'; end if;
  select * into saved from public.coven_program_progress where enrollment_id = e.id and task_id = t.id for update;
  if saved.status = 'approved' then raise exception 'That task is already signed off.'; end if;
  insert into public.coven_program_progress (enrollment_id, task_id, program_id, coven_id, user_id, times_done, status, submitted_at,
                                             checked_by, checked_at, feedback, signed_directly)
  values (e.id, t.id, e.program_id, e.coven_id, e.user_id, t.times, 'approved', null, auth.uid(), now(), nullif(btrim(p_note), ''), true)
  on conflict (enrollment_id, task_id) do update
    set times_done = excluded.times_done, status = 'approved', checked_by = excluded.checked_by, checked_at = excluded.checked_at,
        feedback = excluded.feedback, signed_directly = true, updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

-- As in 20261111000100_coven_test_keys_and_waiting_lists.sql (graduating
-- respects the places), with the head confirming any stage, her own too.
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
  -- The head, for anyone (herself included); a program manager, for anyone else.
  manager := public.coven_head_signs_off(e.coven_id) or (public.coven_program_manager(e.coven_id) and e.user_id <> auth.uid());
  if not (
    manager
    or (s.passed_by = 'mentor' and public.coven_is_mentor_of(e.coven_id, e.user_id) and public.coven_in_good_standing(e.coven_id))
    or (s.passed_by = 'self' and e.user_id = auth.uid() and public.coven_in_good_standing(e.coven_id))
  ) then
    raise exception 'Only % confirms this stage.', case s.passed_by when 'manager' then 'a program manager or the coven''s head' when 'mentor' then 'their mentor, a program manager or the coven''s head' else 'the person in it' end;
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

-- As in 20261110000100_coven_courses.sql, with the head allowing herself another attempt too.
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
  if not (public.coven_head_signs_off(e.coven_id) or (public.coven_program_manager(e.coven_id) and e.user_id <> auth.uid())) then
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

-- As in 20261111000100_coven_test_keys_and_waiting_lists.sql; the head sees
-- the key in her own attempts too (she sees every test's key already).
create or replace function public.coven_quiz_key_open(p_coven uuid, p_user uuid, p_quiz uuid, p_task uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when p_user = auth.uid() then public.coven_quiz_passed_by_me(p_quiz, p_task) or public.coven_head_signs_off(p_coven)
    when public.coven_program_manager(p_coven) then true
    when public.coven_program_overseer(p_coven, p_user) then not public.coven_quiz_taking(p_coven, p_quiz, p_task)
    else false
  end;
$$;

-- As in 20261111000100_coven_test_keys_and_waiting_lists.sql; the head
-- scoring her own attempt sees her own draft scores.
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
  if a.user_id = auth.uid() and a.status in ('submitted', 'scored') and not public.coven_head_signs_off(a.coven_id) then
    a.manual_scores := '{}'::jsonb;
    a.feedback := null;
    a.total := null;
  end if;
  return a;
end;
$$;

revoke execute on function public.coven_head_signs_off(uuid), public.sign_off_coven_task(uuid, uuid, text) from public, anon;
grant execute on function public.coven_head_signs_off(uuid), public.sign_off_coven_task(uuid, uuid, text) to authenticated;
