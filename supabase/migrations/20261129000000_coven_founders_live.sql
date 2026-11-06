-- Coven founders and rituals together (app: lib/covens/founding.ts,
-- app/src/app/(tabs)/coven/leading/, the Moderation screen; website:
-- covens/leading/, covens/moderation/, rituals/together/).
--
-- 1. Being listed in Find a coven needs the moderators' approval. Anyone may
--    still found a coven and practise in it by invitation (unlisted); only the
--    directory listing waits. covens.listing_approved_at marks approval; a
--    trigger keeps an unapproved coven unlisted whatever a client sends, so
--    older app versions can't list one either. Every coven that existed
--    before this is approved (grandfathered).
--    coven_listing_applications: the founder's application (their path,
--    experience, why, how they'll keep members safe, the guidelines and 18+);
--    the moderators (user_roles 'admin' or 'moderator', is_community_moderator)
--    approve, ask for changes or decline with a note. Written only through the
--    functions below.
-- 2. coven_leader_training: the founder's training ("Leading a coven: the
--    founder's training", courses/core/founder.ts), one row per passed
--    module. Needed before applying to be listed; optional for unlisted
--    covens. leader_training_done() is the badge. The quiz is scored on the
--    device (choice questions only) and the score is checked against the pass
--    mark here; it is training, not an exam, so that is enough.
-- 3. Rituals together begun from a coven gathering: when the host ends it,
--    everyone who took part (and is a member) is marked present at the
--    gathering and its record is written, so it shows in the members' record.
--
-- Additive: one new column, two new tables (RLS on, read-only to clients),
-- functions and triggers. No new foreign key from an existing table.

-- ---------------------------------------------------------------------------
-- 1. Listing approval
-- ---------------------------------------------------------------------------

alter table public.covens add column if not exists listing_approved_at timestamptz;

-- Grandfather every coven that already exists.
update public.covens set listing_approved_at = created_at where listing_approved_at is null;

-- An unapproved coven stays unlisted; only moderators (or the review
-- function, or the service role) set or clear approval.
create or replace function public.guard_coven_listing()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_community_moderator() or coalesce(current_setting('coven.listing_review', true), '') = 'on' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.listing_approved_at := null;
  else
    new.listing_approved_at := old.listing_approved_at;
  end if;
  if new.listing_approved_at is null and new.visibility = 'listed' then
    new.visibility := 'unlisted';
  end if;
  return new;
end;
$$;

drop trigger if exists covens_listing_guard on public.covens;
create trigger covens_listing_guard before insert or update on public.covens
  for each row execute function public.guard_coven_listing();

create table if not exists public.coven_listing_applications (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'changes', 'approved', 'declined', 'withdrawn')),
  leader_title text not null default 'Leader' check (char_length(leader_title) between 1 and 60),
  path text not null check (char_length(path) between 1 and 2000),
  experience text not null check (char_length(experience) between 1 and 4000),
  why text not null check (char_length(why) between 1 and 4000),
  safety text not null check (char_length(safety) between 1 and 4000),
  agreed_guidelines_at timestamptz not null,
  confirmed_adult_at timestamptz not null,
  training_completed_at timestamptz,
  moderator_note text check (moderator_note is null or char_length(moderator_note) <= 2000),
  reviewer_id uuid references auth.users(id) on delete set null,
  submitted_at timestamptz not null default now(),
  decided_at timestamptz,
  updated_at timestamptz not null default now()
);

create unique index if not exists coven_listing_applications_open on public.coven_listing_applications (coven_id) where status in ('pending', 'changes');
create index if not exists coven_listing_applications_status_idx on public.coven_listing_applications (status, submitted_at desc);
create index if not exists coven_listing_applications_user_idx on public.coven_listing_applications (user_id);
create index if not exists coven_listing_applications_reviewer_idx on public.coven_listing_applications (reviewer_id) where reviewer_id is not null;

alter table public.coven_listing_applications enable row level security;

drop policy if exists "Founders, the coven's leaders and moderators read listing applications" on public.coven_listing_applications;
create policy "Founders, the coven's leaders and moderators read listing applications" on public.coven_listing_applications
  for select to authenticated
  using (user_id = (select auth.uid()) or public.coven_permission(coven_id, 'manage') or public.is_community_moderator());

-- ---------------------------------------------------------------------------
-- 2. The founder's training
-- ---------------------------------------------------------------------------

create table if not exists public.coven_leader_training (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null check (module_id ~ '^core-founder-[a-z-]{2,40}$'),
  score integer not null check (score >= 0),
  max integer not null check (max > 0 and score <= max),
  passed_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

alter table public.coven_leader_training enable row level security;

drop policy if exists "People see their own training; moderators see all" on public.coven_leader_training;
create policy "People see their own training; moderators see all" on public.coven_leader_training
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_community_moderator());

-- The modules, in order (lib/covens/founding.ts FOUNDER_MODULES).
create or replace function public.leader_training_modules()
returns text[]
language sql
immutable
set search_path = public
as $$
  select array[
    'core-founder-holding-space',
    'core-founder-safeguarding',
    'core-founder-rites-in-app',
    'core-founder-conflict-endings',
    'core-founder-cultural-respect',
    'core-founder-crisis-signposting',
    'core-founder-legal-basics'
  ]::text[];
$$;

-- When someone finished the training (their last module passed), or null.
create or replace function public.leader_training_done(p_user uuid default auth.uid())
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select case when count(distinct t.module_id) >= cardinality(public.leader_training_modules()) then max(t.passed_at) end
  from public.coven_leader_training t
  where t.user_id = p_user and t.module_id = any (public.leader_training_modules());
$$;

-- A module passed: its test's score (the pass mark is 80%). Passing again keeps the first date and the best score.
create or replace function public.record_leader_training(p_module text, p_score integer, p_max integer)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if not (p_module = any (public.leader_training_modules())) then raise exception 'That module was not found.'; end if;
  if p_max is null or p_max < 1 or p_score is null or p_score < 0 or p_score > p_max then raise exception 'That score doesn''t add up.'; end if;
  if p_score * 100 < 80 * p_max then raise exception 'Not passed yet: the pass mark is 80%%. Read the lesson again and try once more.'; end if;
  insert into public.coven_leader_training (user_id, module_id, score, max)
  values (auth.uid(), p_module, p_score, p_max)
  on conflict (user_id, module_id) do update set score = greatest(coven_leader_training.score, excluded.score), max = excluded.max;
  return public.leader_training_done(auth.uid());
end;
$$;

-- ---------------------------------------------------------------------------
-- Applying, and the moderators' answer
-- ---------------------------------------------------------------------------

create or replace function public.submit_coven_listing(
  p_coven uuid,
  p_title text,
  p_path text,
  p_experience text,
  p_why text,
  p_safety text,
  p_agree boolean,
  p_adult boolean
)
returns public.coven_listing_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.covens;
  open_row public.coven_listing_applications;
  saved public.coven_listing_applications;
  trained timestamptz;
begin
  perform public.coven_require_profile();
  select * into c from public.covens where id = p_coven;
  if c.id is null then raise exception 'That coven was not found.'; end if;
  if c.status <> 'active' then raise exception 'Only an active coven can be listed.'; end if;
  if not public.coven_permission(p_coven, 'manage') then raise exception 'Only the coven''s leaders can apply for it to be listed.'; end if;
  if c.listing_approved_at is not null then raise exception 'This coven is already approved for Find a coven.'; end if;
  if not coalesce(p_agree, false) then raise exception 'Agree to lead by the coven guidelines.'; end if;
  if not coalesce(p_adult, false) then raise exception 'Confirm you are 18 or older.'; end if;
  trained := public.leader_training_done(auth.uid());
  if trained is null then raise exception 'Finish the founder''s training (Leading a coven) first.'; end if;
  if char_length(btrim(coalesce(p_title, ''))) not between 1 and 60 then raise exception 'Choose your title as leader.'; end if;
  if char_length(btrim(coalesce(p_path, ''))) not between 1 and 2000 then raise exception 'Tell the moderators about your path or tradition (up to 2,000 characters).'; end if;
  if char_length(btrim(coalesce(p_experience, ''))) not between 1 and 4000 then raise exception 'Tell the moderators about your experience (up to 4,000 characters).'; end if;
  if char_length(btrim(coalesce(p_why, ''))) not between 1 and 4000 then raise exception 'Tell the moderators why you are founding this coven (up to 4,000 characters).'; end if;
  if char_length(btrim(coalesce(p_safety, ''))) not between 1 and 4000 then raise exception 'Tell the moderators how you will keep members safe (up to 4,000 characters).'; end if;
  if (select count(*) from public.coven_listing_applications where user_id = auth.uid() and submitted_at > now() - interval '1 day') >= 5 then
    raise exception 'You have sent a lot of applications today. Please wait a little.';
  end if;

  select * into open_row from public.coven_listing_applications where coven_id = p_coven and status in ('pending', 'changes') for update;
  if open_row.id is not null then
    update public.coven_listing_applications set
      user_id = auth.uid(), status = 'pending', leader_title = btrim(p_title), path = btrim(p_path), experience = btrim(p_experience),
      why = btrim(p_why), safety = btrim(p_safety), agreed_guidelines_at = now(), confirmed_adult_at = now(),
      training_completed_at = trained, submitted_at = now(), decided_at = null, updated_at = now()
    where id = open_row.id
    returning * into saved;
  else
    insert into public.coven_listing_applications (coven_id, user_id, leader_title, path, experience, why, safety, agreed_guidelines_at, confirmed_adult_at, training_completed_at)
    values (p_coven, auth.uid(), btrim(p_title), btrim(p_path), btrim(p_experience), btrim(p_why), btrim(p_safety), now(), now(), trained)
    returning * into saved;
  end if;
  return saved;
end;
$$;

create or replace function public.withdraw_coven_listing(p_application uuid)
returns public.coven_listing_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.coven_listing_applications;
begin
  select * into a from public.coven_listing_applications where id = p_application for update;
  if a.id is null or not (a.user_id = auth.uid() or public.coven_permission(a.coven_id, 'manage')) then raise exception 'That application was not found.'; end if;
  if a.status not in ('pending', 'changes') then raise exception 'That application has already been answered.'; end if;
  update public.coven_listing_applications set status = 'withdrawn', updated_at = now() where id = a.id returning * into a;
  return a;
end;
$$;

-- The moderators' answer: approve (the coven is listed at once), ask for changes, or decline. A note is needed for the last two.
create or replace function public.review_coven_listing(p_application uuid, p_decision text, p_note text default null)
returns public.coven_listing_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.coven_listing_applications;
  note text := nullif(btrim(coalesce(p_note, '')), '');
begin
  if not public.is_community_moderator() then raise exception 'Only the Salt & Sovereignty moderators can answer listing applications.'; end if;
  if p_decision not in ('approved', 'changes', 'declined') then raise exception 'Unknown choice.'; end if;
  if p_decision <> 'approved' and note is null then raise exception 'Write a note so the founder knows what to change, or why.'; end if;
  if char_length(coalesce(note, '')) > 2000 then raise exception 'Keep the note to 2,000 characters.'; end if;
  select * into a from public.coven_listing_applications where id = p_application for update;
  if a.id is null then raise exception 'That application was not found.'; end if;
  if a.status not in ('pending', 'changes') then raise exception 'That application has already been answered.'; end if;
  update public.coven_listing_applications set
    status = p_decision, moderator_note = note, reviewer_id = auth.uid(), decided_at = now(), updated_at = now()
  where id = a.id
  returning * into a;
  if p_decision = 'approved' then
    perform set_config('coven.listing_review', 'on', true);
    update public.covens set listing_approved_at = now(), visibility = 'listed' where id = a.coven_id;
    perform set_config('coven.listing_review', 'off', true);
  end if;
  return a;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. A ritual together from a coven gathering: attendance when it ends
-- ---------------------------------------------------------------------------

create or replace function public.live_ritual_record_attendance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'ended' and old.status is distinct from 'ended' and new.coven_ritual_id is not null then
    begin
      insert into public.coven_ritual_attendance (ritual_id, coven_id, user_id, present, joined_at, marked_by, marked_at)
      select new.coven_ritual_id, r.coven_id, p.user_id, true, p.joined_at, new.host_id, now()
      from public.live_ritual_people p
      join public.coven_rituals r on r.id = new.coven_ritual_id
      where p.live_id = new.id
        and p.removed_at is null
        and exists (select 1 from public.coven_members m where m.coven_id = r.coven_id and m.user_id = p.user_id and m.status = 'active')
      on conflict (ritual_id, user_id) do update
        set present = true,
            joined_at = coalesce(coven_ritual_attendance.joined_at, excluded.joined_at),
            marked_by = coalesce(coven_ritual_attendance.marked_by, excluded.marked_by),
            marked_at = coalesce(coven_ritual_attendance.marked_at, excluded.marked_at),
            updated_at = now()
        where coven_ritual_attendance.present is not true;
      perform public.coven_ritual_write_record(new.coven_ritual_id);
    exception when others then
      -- Ending the ritual never fails over its record.
      raise warning 'live_ritual_record_attendance: %', sqlerrm;
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists live_rituals_attendance on public.live_rituals;
create trigger live_rituals_attendance after update of status on public.live_rituals
  for each row execute function public.live_ritual_record_attendance();

-- ---------------------------------------------------------------------------
-- Grants (least privilege): the new tables are read-only to signed-in
-- people (row-level security decides which rows); every write goes through
-- the functions above.
-- ---------------------------------------------------------------------------

revoke all on public.coven_listing_applications from anon;
revoke insert, update, delete, truncate, references, trigger on public.coven_listing_applications from authenticated;
grant select on public.coven_listing_applications to authenticated;
revoke all on public.coven_leader_training from anon;
revoke insert, update, delete, truncate, references, trigger on public.coven_leader_training from authenticated;
grant select on public.coven_leader_training to authenticated;

revoke execute on function public.guard_coven_listing() from public, anon, authenticated;
revoke execute on function public.live_ritual_record_attendance() from public, anon, authenticated;
revoke execute on function public.leader_training_done(uuid) from public, anon;
revoke execute on function public.record_leader_training(text, integer, integer) from public, anon;
revoke execute on function public.submit_coven_listing(uuid, text, text, text, text, text, boolean, boolean) from public, anon;
revoke execute on function public.withdraw_coven_listing(uuid) from public, anon;
revoke execute on function public.review_coven_listing(uuid, text, text) from public, anon;
grant execute on function public.leader_training_modules() to authenticated;
grant execute on function public.leader_training_done(uuid) to authenticated;
grant execute on function public.record_leader_training(text, integer, integer) to authenticated;
grant execute on function public.submit_coven_listing(uuid, text, text, text, text, text, boolean, boolean) to authenticated;
grant execute on function public.withdraw_coven_listing(uuid) to authenticated;
grant execute on function public.review_coven_listing(uuid, text, text) to authenticated;
