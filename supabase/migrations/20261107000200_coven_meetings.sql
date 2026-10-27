-- NOT YET APPLIED. Needs 20261103000000_coven_ritual_builder.sql,
-- 20261106000000_coven_grimoire.sql and 20261107000100_fix_save_coven_ritual.sql
-- first (this replaces save_coven_ritual again, keeping that fix's brackets).
--
-- Coven meetings, as detailed as rites (app: lib/covens/meetings.ts and
-- components/covens/meeting/; website: covens/coven/meeting.js). A meeting is
-- still a coven_rituals row of kind 'meeting', planned with the same builder;
-- this adds what a meeting needs on top. Additive: new columns (null meaning
-- "as before"), new tables, new versions of functions that take what they
-- took before and more.
--
-- * Who it is for (coven_rituals.audience): null is the whole coven, as
--   every gathering has been. A list of {kind, id} (the WHO picker's) keeps
--   the meeting, its steps, RSVPs, votes, notes, actions and chat from
--   everyone else. Those cast in its roles, whoever planned it, the coven's
--   head and the site's moderators always see it. Enforced here: the
--   tables' row-level security, and the functions that read or act on a
--   gathering (wrapped below so their bodies stay as they were).
-- * Its own chat (coven_meeting_messages): never part of the coven's chat,
--   its conversations or their unread counts. Open from the meeting's start
--   less a lead time the planner sets (fifteen minutes unless they say
--   otherwise) until it ends; the chair can open it early, close it, or keep
--   it open a while longer. While it's open (and until the meeting is over)
--   everyone the meeting is for reads it; those who can write in the coven
--   (in good standing) write while it's open. Afterwards only those the
--   coven's head chooses read the whole chat (coven_rituals.chat_readers,
--   with a default for the coven in coven_ritual_settings, and the Chair and
--   Secretary when nothing is chosen); everyone else has the minutes.
--   Reports, removal and blocks work as in the coven's chat.
-- * The meeting as it happens (coven_meeting_state): who has the floor (and
--   hands raised, for voice later), the chat's opening and closing, and for
--   each agenda item the secretary's notes, a motion's seconder and its
--   amendments, when the chair called the vote, and minutes added to its
--   time.
-- * Motions and elections are votes (cast, closed and kept like the vote
--   step); an election's answers are its candidates. Motions and elections
--   wait for the chair to call the vote.
-- * Actions (coven_meeting_actions): what was agreed, who does it (the WHO
--   picker's) and by when. They show on each person's To tend list and the
--   meeting page until done, and open ones carry forward to the next meeting
--   of the same kind.
-- * Minutes (save_coven_meeting_minutes): composed by the page when the
--   meeting ends and kept on the Book's Meeting minutes shelf, readable by
--   those the meeting was for (or the whole coven) and written by its Chair
--   and Secretary. The chat is never copied into them.

-- ---------------------------------------------------------------------------
-- Columns and tables
-- ---------------------------------------------------------------------------

alter table public.coven_rituals add column if not exists audience jsonb
  check (audience is null or (jsonb_typeof(audience) = 'array' and jsonb_array_length(audience) between 1 and 40));
alter table public.coven_rituals add column if not exists chat_readers jsonb
  check (chat_readers is null or (jsonb_typeof(chat_readers) = 'array' and jsonb_array_length(chat_readers) <= 40));
alter table public.coven_ritual_settings add column if not exists meeting_chat_readers jsonb
  check (meeting_chat_readers is null or (jsonb_typeof(meeting_chat_readers) = 'array' and jsonb_array_length(meeting_chat_readers) <= 40));

create table if not exists public.coven_meeting_state (
  ritual_id uuid primary key references public.coven_rituals (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  chat_opened_at timestamptz,
  chat_closed_at timestamptz,
  chat_until timestamptz,
  floor_user uuid references auth.users (id) on delete set null,
  floor_since timestamptz,
  hands uuid[] not null default '{}',
  -- Per agenda item (step id): notes, seconded_by, seconded_at, amendments, vote_called_at, extra_minutes.
  items jsonb not null default '{}'::jsonb check (jsonb_typeof(items) = 'object' and octet_length(items::text) <= 200000),
  minutes_page_id uuid references public.coven_grimoire_pages (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.coven_meeting_messages (
  id uuid primary key default gen_random_uuid(),
  ritual_id uuid not null references public.coven_rituals (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(body) <= 2000),
  reply_to uuid references public.coven_meeting_messages (id) on delete set null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid references auth.users (id) on delete set null
);

create index if not exists coven_meeting_messages_ritual_idx on public.coven_meeting_messages (ritual_id, created_at desc);

create table if not exists public.coven_meeting_actions (
  id uuid primary key default gen_random_uuid(),
  ritual_id uuid not null references public.coven_rituals (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  step_id uuid references public.coven_ritual_steps (id) on delete set null,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  assignees jsonb not null check (jsonb_typeof(assignees) = 'array' and jsonb_array_length(assignees) between 1 and 20),
  due_on date,
  status text not null default 'open' check (status in ('open', 'done', 'dropped')),
  done_by uuid references auth.users (id) on delete set null,
  done_at timestamptz,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_meeting_actions_coven_idx on public.coven_meeting_actions (coven_id, status, due_on);
create index if not exists coven_meeting_actions_ritual_idx on public.coven_meeting_actions (ritual_id);

-- Reports can name a meeting's message.
alter table public.coven_reports drop constraint if exists coven_reports_target_type_check;
alter table public.coven_reports add constraint coven_reports_target_type_check
  check (target_type in ('coven', 'message', 'member', 'application', 'altar_item', 'document', 'ritual', 'book_page', 'petition', 'book_submission', 'meeting_message'));

-- ---------------------------------------------------------------------------
-- Who a meeting is for, and who does what in it
-- ---------------------------------------------------------------------------

-- Whether a list of {kind, id} names this person (an empty list names no one,
-- unlike coven_assignees_include, where it is the whole coven).
create or replace function public.coven_list_names(p_coven uuid, p_list jsonb, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_typeof(p_list) = 'array' and jsonb_array_length(p_list) > 0
     and public.coven_assignees_include(p_coven, p_list, p_user);
$$;

-- The id of a meeting's Chair or Secretary role: the one its plan names, or
-- the role called so ("Chair", "Facilitator"; "Secretary", "Note taker").
-- Mirrors lib/covens/meetings.ts meetingRoleId.
create or replace function public.coven_meeting_role(p_plan jsonb, p_which text)
returns text
language sql
immutable
set search_path = public
as $$
  select coalesce(
    (select r->>'id' from jsonb_array_elements(case when jsonb_typeof(p_plan->'roles') = 'array' then p_plan->'roles' else '[]'::jsonb end) r
     where r->>'id' = p_plan->'meeting'->>(p_which || '_role') limit 1),
    (select r->>'id' from jsonb_array_elements(case when jsonb_typeof(p_plan->'roles') = 'array' then p_plan->'roles' else '[]'::jsonb end) r
     where lower(btrim(r->>'name')) = any (case p_which
       when 'chair' then array['chair', 'chairperson', 'chair person', 'facilitator', 'presiding officer', 'convenor']
       else array['secretary', 'note taker', 'notetaker', 'scribe', 'clerk', 'minute taker'] end)
     limit 1));
$$;

-- Whether this person is cast in the meeting's Chair (or Secretary) role.
create or replace function public.coven_meeting_cast_in(p_ritual uuid, p_which text, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select public.coven_list_names(r.coven_id,
      public.coven_plan_role_people(r.plan, jsonb_build_array(public.coven_meeting_role(r.plan, p_which))), p_user)
    from public.coven_rituals r where r.id = p_ritual
  ), false);
$$;

-- Whether a gathering is open to this person: a member of its coven (or the
-- caller a site moderator), and for a meeting kept to some, among them,
-- cast in one of its roles, its planner, or the coven's head. Mirrors
-- lib/covens/meetings.ts inAudience.
create or replace function public.coven_ritual_open_to(p_ritual uuid, p_user uuid default auth.uid())
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
begin
  if p_user is null then return false; end if;
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null then return false; end if;
  if p_user = auth.uid() and public.is_community_moderator() then return true; end if;
  if not exists (select 1 from public.coven_members where coven_id = r.coven_id and user_id = p_user and status = 'active') then return false; end if;
  if r.audience is null then return true; end if;
  return r.created_by = p_user
    or exists (select 1 from public.covens c where c.id = r.coven_id and c.founder_id = p_user)
    or public.coven_assignees_include(r.coven_id, r.audience, p_user)
    or public.coven_list_names(r.coven_id, public.coven_plan_who(r.plan,
         (select coalesce(jsonb_agg('role:' || (x->>'id')), '[]'::jsonb) from jsonb_array_elements(case when jsonb_typeof(r.plan->'roles') = 'array' then r.plan->'roles' else '[]'::jsonb end) x)), p_user);
end;
$$;

-- Raises when the gathering isn't open to the caller (the same words as when it isn't there).
create or replace function public.coven_ritual_require(p_ritual uuid)
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_ritual is not null and exists (select 1 from public.coven_rituals where id = p_ritual) and not public.coven_ritual_open_to(p_ritual) then
    raise exception 'That gathering was not found.';
  end if;
end;
$$;

create or replace function public.coven_step_ritual(p_step uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select ritual_id from public.coven_ritual_steps where id = p_step;
$$;

-- Who steers a meeting: as for any gathering (those who lead the coven's
-- rituals, its leader), and its Chair. Who keeps its notes: those, and its Secretary.
create or replace function public.coven_meeting_steers(p_ritual uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.coven_ritual_open_to(p_ritual)
    and (public.coven_ritual_steers(p_ritual)
         or exists (select 1 from public.coven_rituals r where r.id = p_ritual and public.coven_in_good_standing(r.coven_id)
                    and public.coven_meeting_cast_in(r.id, 'chair', auth.uid())));
$$;

create or replace function public.coven_meeting_keeps_notes(p_ritual uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.coven_meeting_steers(p_ritual)
    or (public.coven_ritual_open_to(p_ritual)
        and exists (select 1 from public.coven_rituals r where r.id = p_ritual and public.coven_in_good_standing(r.coven_id)
                    and public.coven_meeting_cast_in(r.id, 'secretary', auth.uid())));
$$;

-- ---------------------------------------------------------------------------
-- The meeting's chat: when it's open, and who reads it afterwards
-- ---------------------------------------------------------------------------

-- When the chat opens and closes, and whether it's open now. Mirrors
-- lib/covens/meetings.ts chatWindow.
create or replace function public.coven_meeting_chat_window(p_ritual uuid)
returns table (opens_at timestamptz, closes_at timestamptz, is_open boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  st public.coven_meeting_state;
  lead integer;
  len integer;
  start timestamptz;
  o timestamptz;
  c timestamptz;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.kind <> 'meeting' then return; end if;
  select * into st from public.coven_meeting_state where ritual_id = r.id;
  lead := case when (r.plan->'meeting'->>'lead_minutes') ~ '^[0-9]{1,3}$' then least((r.plan->'meeting'->>'lead_minutes')::integer, 240) else 15 end;
  len := case when (r.plan->'meeting'->>'length_minutes') ~ '^[0-9]{1,4}$' then greatest(5, least((r.plan->'meeting'->>'length_minutes')::integer, 720)) else 90 end;
  start := coalesce(r.scheduled_for, r.started_at);
  o := least(case when r.status in ('scheduled', 'live', 'done') then start - lead * interval '1 minute' end, st.chat_opened_at, r.started_at);
  c := case
    when r.status = 'live' then st.chat_until
    when r.status = 'done' then greatest(coalesce(r.ended_at, r.updated_at), st.chat_until)
    else greatest(start + len * interval '1 minute', st.chat_until)
  end;
  return query select o, c,
    r.status <> 'cancelled' and st.chat_closed_at is null and o is not null and now() >= o
    and (r.status = 'live' or c is null or now() < c);
end;
$$;

create or replace function public.coven_meeting_chat_open(p_ritual uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select w.is_open from public.coven_meeting_chat_window(p_ritual) w), false);
$$;

-- Whether this person reads a meeting's whole chat after it: the coven's
-- head and the site's moderators always; otherwise those the head chose
-- for this meeting (or the coven's default, or its Chair and Secretary),
-- among those the meeting is for. Keys: 'chair', 'secretary', 'audience',
-- 'role:<id>', 'rank:<id>', 'user:<id>'. Mirrors lib/covens/meetings.ts readsHistory.
create or replace function public.coven_meeting_reads_history(p_ritual uuid, p_user uuid default auth.uid())
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  keys jsonb;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or p_user is null then return false; end if;
  if p_user = auth.uid() and public.is_community_moderator() then return true; end if;
  if exists (select 1 from public.covens c where c.id = r.coven_id and c.founder_id = p_user)
     and exists (select 1 from public.coven_members m where m.coven_id = r.coven_id and m.user_id = p_user and m.status = 'active') then
    return true;
  end if;
  if not public.coven_ritual_open_to(r.id, p_user) then return false; end if;
  keys := coalesce(r.chat_readers, (select s.meeting_chat_readers from public.coven_ritual_settings s where s.coven_id = r.coven_id), '["chair", "secretary"]'::jsonb);
  return exists (
    select 1 from jsonb_array_elements_text(keys) k
    where k = 'audience'
       or (k = 'chair' and public.coven_meeting_cast_in(r.id, 'chair', p_user))
       or (k = 'secretary' and public.coven_meeting_cast_in(r.id, 'secretary', p_user))
       or (k like 'role:%' and public.coven_list_names(r.coven_id, public.coven_plan_role_people(r.plan, jsonb_build_array(substr(k, 6))), p_user))
       or ((k like 'rank:%' or k like 'user:%') and public.coven_list_names(r.coven_id, public.coven_plan_who(r.plan, jsonb_build_array(k)), p_user))
  );
end;
$$;

-- Reading a meeting's chat: while the meeting is coming up, under way or its
-- chat still open, everyone it is for; once it's over, those who read its history.
create or replace function public.coven_meeting_chat_readable(p_ritual uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.kind <> 'meeting' then return false; end if;
  if public.is_community_moderator() then return true; end if;
  if not public.coven_ritual_open_to(r.id) then return false; end if;
  if r.status in ('draft', 'scheduled', 'live') or public.coven_meeting_chat_open(r.id) then return true; end if;
  return public.coven_meeting_reads_history(r.id);
end;
$$;

-- Writing in it: someone the meeting is for, in good standing, while it's open.
create or replace function public.coven_meeting_chat_writable(p_ritual uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coven_rituals r
    where r.id = p_ritual and r.kind = 'meeting'
      and public.coven_in_good_standing(r.coven_id)
      and exists (select 1 from public.coven_members m where m.coven_id = r.coven_id and m.user_id = auth.uid() and m.status = 'active')
      and public.coven_ritual_open_to(r.id)
      and public.coven_meeting_chat_open(r.id)
  );
$$;

-- A meeting's chat message: its writer, now, in the meeting's coven, not too fast.
create or replace function public.guard_coven_meeting_message()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.coven_client_write() then
    new.user_id := auth.uid();
    new.created_at := now();
    new.edited_at := null;
    new.deleted_at := null;
    new.deleted_by := null;
    new.coven_id := (select coven_id from public.coven_rituals where id = new.ritual_id);
    if char_length(btrim(new.body)) = 0 then raise exception 'A message needs some words.'; end if;
    if new.reply_to is not null and not exists (select 1 from public.coven_meeting_messages where id = new.reply_to and ritual_id = new.ritual_id) then
      new.reply_to := null;
    end if;
    if (select count(*) from public.coven_meeting_messages where user_id = auth.uid() and created_at > now() - interval '30 seconds') >= 8 then
      raise exception 'You are sending messages very quickly. Please wait a moment.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists coven_meeting_messages_guard on public.coven_meeting_messages;
create trigger coven_meeting_messages_guard before insert on public.coven_meeting_messages
  for each row execute function public.guard_coven_meeting_message();

-- Reports keep a copy of a meeting's message too.
create or replace function public.fill_coven_report()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.status := 'open';
  new.created_at := now();
  new.resolved_at := null;
  new.resolved_by := null;
  new.resolution_note := null;
  if public.coven_client_write() then
    new.reporter_id := auth.uid();
  end if;
  -- Keep a copy of what was reported, so removing it does not lose the evidence.
  if new.target_type = 'message' and new.target_id is not null then
    select m.coven_id, m.user_id, left(m.body, 4000)
      into new.coven_id, new.target_user_id, new.snapshot
    from public.coven_messages m where m.id = new.target_id;
  elsif new.target_type = 'meeting_message' and new.target_id is not null then
    select m.coven_id, m.user_id, left(m.body, 4000)
      into new.coven_id, new.target_user_id, new.snapshot
    from public.coven_meeting_messages m where m.id = new.target_id;
  elsif new.target_type = 'coven' and new.target_id is not null then
    new.coven_id := new.target_id;
  end if;
  if (select count(*) from public.coven_reports
      where reporter_id = auth.uid() and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'You have sent a lot of reports this hour. Please wait a little.';
  end if;
  return new;
end;
$$;

create or replace function public.remove_coven_meeting_message(p_message uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.coven_meeting_messages;
begin
  select * into m from public.coven_meeting_messages where id = p_message for update;
  if m.id is null or m.deleted_at is not null then return; end if;
  if not (m.user_id = auth.uid() or (public.coven_permission(m.coven_id, 'moderate') and public.coven_ritual_open_to(m.ritual_id)) or public.is_community_moderator()) then
    raise exception 'You cannot remove that message.';
  end if;
  -- The words go; a report keeps its own copy for the moderators.
  update public.coven_meeting_messages set body = '', deleted_at = now(), deleted_by = auth.uid() where id = p_message;
end;
$$;

create or replace function public.edit_coven_meeting_message(p_message uuid, p_body text)
returns public.coven_meeting_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.coven_meeting_messages;
begin
  select * into m from public.coven_meeting_messages where id = p_message for update;
  if m.id is null or m.deleted_at is not null or m.user_id <> auth.uid() then raise exception 'You cannot edit that message.'; end if;
  if not public.coven_meeting_chat_writable(m.ritual_id) then raise exception 'The meeting''s chat is closed.'; end if;
  if char_length(btrim(p_body)) = 0 or char_length(p_body) > 2000 then raise exception 'A message needs between 1 and 2000 characters.'; end if;
  update public.coven_meeting_messages set body = p_body, edited_at = now() where id = p_message returning * into m;
  return m;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.coven_meeting_state enable row level security;
alter table public.coven_meeting_messages enable row level security;
alter table public.coven_meeting_actions enable row level security;

-- A meeting kept to some is invisible to everyone else: the gathering, its
-- steps, RSVPs, marks, record and attendance.
alter policy "Members and moderators see coven rituals" on public.coven_rituals
  using ((public.is_coven_member(coven_id) or public.is_community_moderator()) and (audience is null or public.coven_ritual_open_to(id)));
alter policy "Members and moderators see ritual steps" on public.coven_ritual_steps
  using ((public.is_coven_member(coven_id) or public.is_community_moderator()) and public.coven_ritual_open_to(ritual_id));
alter policy "Members and moderators see RSVPs" on public.coven_ritual_rsvps
  using ((public.is_coven_member(coven_id) or public.is_community_moderator()) and public.coven_ritual_open_to(ritual_id));
alter policy "Members and moderators see altar marks" on public.coven_ritual_step_marks
  using ((public.is_coven_member(coven_id) or public.is_community_moderator()) and public.coven_ritual_open_to(ritual_id));
alter policy "Members and moderators see the coven's ritual records" on public.coven_ritual_records
  using ((public.is_coven_member(coven_id) or public.is_community_moderator()) and public.coven_ritual_open_to(ritual_id));
-- A meeting's Chair and Secretary see who sent apologies, for the minutes.
alter policy "People see their own attendance; leaders see the coven's" on public.coven_ritual_attendance
  using (
    user_id = auth.uid()
    or ((public.coven_permission(coven_id, 'lead') or public.coven_sees_record(coven_id) or public.is_community_moderator()
         or public.coven_meeting_keeps_notes(ritual_id))
        and public.coven_ritual_open_to(ritual_id))
  );

drop policy if exists "Those a meeting is for see it as it happens" on public.coven_meeting_state;
create policy "Those a meeting is for see it as it happens" on public.coven_meeting_state
  for select to authenticated using (public.coven_ritual_open_to(ritual_id));
drop policy if exists "Those a meeting's chat is open to read it" on public.coven_meeting_messages;
create policy "Those a meeting's chat is open to read it" on public.coven_meeting_messages
  for select to authenticated using (public.coven_meeting_chat_readable(ritual_id));
drop policy if exists "Those a meeting is for write while its chat is open" on public.coven_meeting_messages;
create policy "Those a meeting is for write while its chat is open" on public.coven_meeting_messages
  for insert to authenticated with check (user_id = auth.uid() and public.coven_meeting_chat_writable(ritual_id));
drop policy if exists "Actions show to the meeting and to those they're for" on public.coven_meeting_actions;
create policy "Actions show to the meeting and to those they're for" on public.coven_meeting_actions
  for select to authenticated using (public.coven_ritual_open_to(ritual_id) or public.coven_list_names(coven_id, assignees, auth.uid()));

-- ---------------------------------------------------------------------------
-- Plans and saving
-- ---------------------------------------------------------------------------

-- The plan as before, and a meeting's settings: the chat's lead time, the
-- meeting's length, its Chair and Secretary roles, which meetings it follows
-- on from (for actions carried forward), and who reads its minutes.
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
  mt jsonb;
  meeting jsonb;
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
  mt := case when jsonb_typeof(p_plan->'meeting') = 'object' then p_plan->'meeting' end;
  if mt is not null then
    meeting := jsonb_strip_nulls(jsonb_build_object(
      'lead_minutes', case when (mt->>'lead_minutes') ~ '^[0-9]{1,3}$' then least((mt->>'lead_minutes')::integer, 240) end,
      'length_minutes', case when (mt->>'length_minutes') ~ '^[0-9]{1,4}$' then greatest(5, least((mt->>'length_minutes')::integer, 720)) end,
      'chair_role', case when exists (select 1 from jsonb_array_elements(roles) x where x->>'id' = mt->>'chair_role') then mt->>'chair_role' end,
      'secretary_role', case when exists (select 1 from jsonb_array_elements(roles) x where x->>'id' = mt->>'secretary_role') then mt->>'secretary_role' end,
      'series', nullif(left(btrim(coalesce(mt->>'series', '')), 60), ''),
      'minutes_view', case when mt->>'minutes_view' in ('audience', 'coven') then mt->>'minutes_view' end
    ));
  end if;
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
    'template', nullif(left(coalesce(p_plan->>'template', ''), 60), ''),
    'meeting', meeting
  ));
end;
$$;

-- The vote-like steps: a vote, a motion, an election, approving the last minutes.
create or replace function public.coven_is_vote_action(p_action text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select coalesce(p_action in ('vote', 'motion', 'election', 'approve_minutes'), false);
$$;

-- The answers: the step's own list; an election's candidates (and Abstain); otherwise For, Against and Abstain.
create or replace function public.coven_vote_options(p_details jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select case
    when jsonb_typeof(p_details->'fields'->'options') = 'array' and jsonb_array_length(p_details->'fields'->'options') >= 2
      then p_details->'fields'->'options'
    when jsonb_typeof(p_details->'fields'->'candidates') = 'array' and jsonb_array_length(p_details->'fields'->'candidates') >= 1
      then p_details->'fields'->'candidates' || '["Abstain"]'::jsonb
    else '["For", "Against", "Abstain"]'::jsonb
  end;
$$;

-- save_coven_ritual as before, and now a meeting's audience
-- (p_ritual.audience: a list of {kind, id}, or null/empty for the whole
-- coven; kept as it was when left out), set as the row is written, so no one
-- else ever sees it; motions, elections and approving the minutes keep who
-- may vote, as votes do. A gathering not open to the caller can't be changed.
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
  next_audience jsonb;
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
    if saved.id is null or not public.coven_ritual_open_to(saved.id) then raise exception 'That ritual was not found.'; end if;
    if saved.status = 'live' then raise exception 'End the ritual before changing it.'; end if;
  end if;
  if next_status = 'scheduled' and not scheduler
     and not (saved.id is not null and saved.status = 'scheduled' and saved.scheduled_for is not distinct from next_when) then
    raise exception 'Only those the coven''s head has allowed can put rites on the calendar. Save it as a draft for them to schedule.';
  end if;

  next_kind := coalesce(nullif(p_ritual->>'kind', ''), saved.kind, 'rite');
  if next_kind not in ('rite', 'meeting') then raise exception 'A gathering is a rite or a meeting.'; end if;
  next_plan := case when p_ritual ? 'plan' then public.coven_clean_plan(p_coven, p_ritual->'plan') else coalesce(saved.plan, '{}'::jsonb) end;
  next_audience := case when p_ritual ? 'audience' then public.coven_clean_assignees(p_coven, p_ritual->'audience', 'Who the meeting is for', false) else saved.audience end;
  if next_kind <> 'meeting' or jsonb_typeof(next_audience) <> 'array' or jsonb_array_length(next_audience) = 0
     or next_audience @> '[{"kind":"coven"}]'::jsonb then
    next_audience := null;
  end if;

  if saved.id is null then
    insert into public.coven_rituals (coven_id, title, intention, description, scheduled_for, status, occasion, occasion_name, kind, plan, audience, created_by)
    values (p_coven, btrim(p_ritual->>'title'), nullif(btrim(p_ritual->>'intention'), ''), nullif(btrim(p_ritual->>'description'), ''),
            next_when, next_status, nullif(p_ritual->>'occasion', ''), nullif(btrim(p_ritual->>'occasion_name'), ''), next_kind, next_plan, next_audience, auth.uid())
    returning * into saved;
  else
    update public.coven_rituals
    set title = btrim(p_ritual->>'title'), intention = nullif(btrim(p_ritual->>'intention'), ''),
        description = nullif(btrim(p_ritual->>'description'), ''), scheduled_for = next_when, status = next_status,
        occasion = nullif(p_ritual->>'occasion', ''), occasion_name = nullif(btrim(p_ritual->>'occasion_name'), ''),
        kind = next_kind, plan = next_plan, audience = next_audience,
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
    if public.coven_is_vote_action(step->>'action') and jsonb_typeof(step_details->'fields'->'voters') = 'array' and jsonb_array_length(step_details->'fields'->'voters') > 0 then
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
  if saved.kind = 'meeting' then
    insert into public.coven_meeting_state (ritual_id, coven_id) values (saved.id, saved.coven_id) on conflict (ritual_id) do nothing;
  end if;
  return saved;
end;
$$;

-- The order of turns (a round, a check-in): only those the gathering is open to.
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
  where s.id = p_step and public.coven_step_for(s.id, m.user_id) and a.present is not false
    and public.coven_ritual_open_to(s.ritual_id, m.user_id);
$$;

-- ---------------------------------------------------------------------------
-- Votes: motions, elections and approving the minutes count as votes
-- ---------------------------------------------------------------------------

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
  if s.id is null or not public.coven_is_vote_action(s.action) then return null; end if;
  if s.outcome is not null then return s.outcome; end if;
  select jsonb_build_object('counts', coalesce(jsonb_object_agg(t.choice, t.n), '{}'::jsonb), 'total', coalesce(sum(t.n), 0), 'closed_at', now())
  into result
  from (select v.choice, count(*)::integer as n from public.coven_ritual_votes v where v.step_id = s.id group by v.choice) t;
  update public.coven_ritual_steps set outcome = result, updated_at = now() where id = s.id;
  return result;
end;
$$;

-- Cast (or change) your vote while the vote is under way: for those the
-- gathering is open to, and on a motion or an election once the chair has called it.
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
  if s.id is null or not public.coven_is_vote_action(s.action) then raise exception 'That step isn''t a vote.'; end if;
  if not public.coven_ritual_open_to(s.ritual_id) then raise exception 'That step isn''t a vote.'; end if;
  select * into r from public.coven_rituals where id = s.ritual_id;
  if r.status <> 'live' or r.current_step_id is distinct from s.id then raise exception 'Votes are cast while the vote is under way.'; end if;
  if s.outcome is not null then raise exception 'This vote has closed.'; end if;
  if s.action in ('motion', 'election')
     and not exists (select 1 from public.coven_meeting_state st where st.ritual_id = r.id and st.items->(s.id::text)->>'vote_called_at' is not null) then
    raise exception 'The chair hasn''t called the vote yet.';
  end if;
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

-- Closing a vote early: those who steer the gathering, and a meeting's Chair.
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
  if s.id is null or not public.coven_ritual_open_to(s.ritual_id) then raise exception 'That step was not found.'; end if;
  if not (public.coven_ritual_steers(s.ritual_id) or public.coven_meeting_steers(s.ritual_id)) then raise exception 'Only those who lead the coven''s rituals can close a vote.'; end if;
  return public.coven_ritual_close_vote(s.id);
end;
$$;

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
  if r.id is null or not public.coven_ritual_open_to(r.id) then return; end if;
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
    where s.ritual_id = r.id and public.coven_is_vote_action(s.action)
    order by s.position;
end;
$$;

-- The record, as before, with every vote-like step (and which step it was).
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
         coalesce((select jsonb_agg(jsonb_build_object('title', s.title, 'motion', coalesce(s.details->'fields'->>'motion', s.details->'fields'->>'position', ''), 'options', public.coven_vote_options(s.details),
                                                       'counts', coalesce(s.outcome->'counts', '{}'::jsonb), 'total', coalesce((s.outcome->>'total')::integer, 0),
                                                       'step_id', s.id, 'action', s.action) order by s.position)
                   from public.coven_ritual_steps s where s.ritual_id = r.id and public.coven_is_vote_action(s.action)), '[]'::jsonb),
         r.plan
  from public.coven_rituals r
  where r.id = p_ritual
  on conflict (ritual_id) do update
    set title = excluded.title, kind = excluded.kind, held_at = excluded.held_at, ended_at = excluded.ended_at, led_by = excluded.led_by,
        attendees = excluded.attendees, steps = excluded.steps, counts = excluded.counts, votes = excluded.votes, plan = excluded.plan, updated_at = now();
end;
$$;

-- ---------------------------------------------------------------------------
-- The meeting as it happens
-- ---------------------------------------------------------------------------

-- The meeting's state row, made when first needed.
create or replace function public.coven_meeting_state_row(p_ritual uuid)
returns public.coven_meeting_state
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  st public.coven_meeting_state;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.kind <> 'meeting' or not public.coven_ritual_open_to(r.id) then raise exception 'That meeting was not found.'; end if;
  insert into public.coven_meeting_state (ritual_id, coven_id) values (r.id, r.coven_id) on conflict (ritual_id) do nothing;
  select * into st from public.coven_meeting_state where ritual_id = r.id for update;
  return st;
end;
$$;

-- One agenda item's part of the state, changed (merged) and saved.
create or replace function public.coven_meeting_put_item(p_ritual uuid, p_step uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  st public.coven_meeting_state;
  item jsonb;
begin
  st := public.coven_meeting_state_row(p_ritual);
  item := coalesce(st.items->(p_step::text), '{}'::jsonb) || p_patch;
  update public.coven_meeting_state
  set items = items || jsonb_build_object(p_step::text, jsonb_strip_nulls(item)), updated_by = auth.uid(), updated_at = now()
  where ritual_id = p_ritual;
  return jsonb_strip_nulls(item);
end;
$$;

-- The step a meeting is on, checked: one of its steps, and the one under way.
create or replace function public.coven_meeting_current(p_step uuid)
returns public.coven_rituals
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
begin
  select r2.* into r from public.coven_ritual_steps s join public.coven_rituals r2 on r2.id = s.ritual_id where s.id = p_step;
  if r.id is null or r.kind <> 'meeting' or not public.coven_ritual_open_to(r.id) then raise exception 'That item was not found.'; end if;
  if r.status <> 'live' or r.current_step_id is distinct from p_step then raise exception 'That item isn''t the one under way.'; end if;
  return r;
end;
$$;

-- The chair opens the chat early, closes it, or keeps it open p_minutes longer.
create or replace function public.set_coven_meeting_chat(p_ritual uuid, p_what text, p_minutes integer default 15)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  st public.coven_meeting_state;
  w record;
begin
  if not public.coven_meeting_steers(p_ritual) then raise exception 'Only the meeting''s Chair, and those who lead the coven''s rituals, open and close its chat.'; end if;
  select * into r from public.coven_rituals where id = p_ritual;
  if r.status = 'cancelled' then raise exception 'This meeting was cancelled.'; end if;
  st := public.coven_meeting_state_row(p_ritual);
  select * into w from public.coven_meeting_chat_window(p_ritual);
  if p_what = 'open' then
    update public.coven_meeting_state
    set chat_opened_at = case when w.opens_at is null or w.opens_at > now() then now() else chat_opened_at end,
        chat_closed_at = null,
        chat_until = case when r.status = 'done' and (w.closes_at is null or w.closes_at <= now()) then now() + greatest(5, least(coalesce(p_minutes, 15), 720)) * interval '1 minute' else chat_until end,
        updated_by = auth.uid(), updated_at = now()
    where ritual_id = p_ritual;
  elsif p_what = 'close' then
    update public.coven_meeting_state set chat_closed_at = now(), chat_until = null, updated_by = auth.uid(), updated_at = now() where ritual_id = p_ritual;
  elsif p_what = 'extend' then
    update public.coven_meeting_state
    set chat_until = greatest(now(), w.closes_at, chat_until) + greatest(5, least(coalesce(p_minutes, 15), 720)) * interval '1 minute',
        chat_closed_at = null, updated_by = auth.uid(), updated_at = now()
    where ritual_id = p_ritual;
  else
    raise exception 'Open, close or extend the chat.';
  end if;
  select * into w from public.coven_meeting_chat_window(p_ritual);
  return jsonb_build_object('opens_at', w.opens_at, 'closes_at', w.closes_at, 'open', w.is_open);
end;
$$;

-- The chair gives someone the floor (null: no one). A hook for voice later.
create or replace function public.set_coven_meeting_floor(p_ritual uuid, p_user uuid)
returns public.coven_meeting_state
language plpgsql
security definer
set search_path = public
as $$
declare
  st public.coven_meeting_state;
begin
  if not public.coven_meeting_steers(p_ritual) then raise exception 'Only the meeting''s Chair gives the floor.'; end if;
  if p_user is not null and not public.coven_ritual_open_to(p_ritual, p_user) then raise exception 'That person isn''t at this meeting.'; end if;
  st := public.coven_meeting_state_row(p_ritual);
  update public.coven_meeting_state
  set floor_user = p_user, floor_since = case when p_user is null then null else now() end,
      hands = array_remove(hands, p_user), updated_by = auth.uid(), updated_at = now()
  where ritual_id = p_ritual
  returning * into st;
  return st;
end;
$$;

-- Ask for the floor (raise your hand), or put your hand down.
create or replace function public.raise_coven_meeting_hand(p_ritual uuid, p_up boolean default true)
returns public.coven_meeting_state
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  st public.coven_meeting_state;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.kind <> 'meeting' or not public.coven_ritual_open_to(r.id) then raise exception 'That meeting was not found.'; end if;
  if r.status <> 'live' then raise exception 'Hands go up while the meeting is under way.'; end if;
  if not public.coven_in_good_standing(r.coven_id) then raise exception 'You need to be a member in good standing to ask for the floor.'; end if;
  st := public.coven_meeting_state_row(p_ritual);
  update public.coven_meeting_state
  set hands = case when coalesce(p_up, true) then array_append(array_remove(hands, auth.uid()), auth.uid()) else array_remove(hands, auth.uid()) end,
      updated_at = now()
  where ritual_id = p_ritual
  returning * into st;
  return st;
end;
$$;

-- The secretary's notes for an agenda item (during or after the meeting).
create or replace function public.set_coven_meeting_notes(p_step uuid, p_notes text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ritual uuid := public.coven_step_ritual(p_step);
begin
  if ritual is null or not public.coven_meeting_keeps_notes(ritual) then raise exception 'Only the meeting''s Secretary and Chair keep its notes.'; end if;
  if char_length(coalesce(p_notes, '')) > 8000 then raise exception 'Keep the notes for one item under 8,000 characters.'; end if;
  return public.coven_meeting_put_item(ritual, p_step, jsonb_build_object('notes', nullif(btrim(coalesce(p_notes, '')), '')));
end;
$$;

-- Second a motion (or take your seconding back). Not its proposer.
create or replace function public.second_coven_meeting_motion(p_step uuid, p_on boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  s public.coven_ritual_steps;
  item jsonb;
begin
  r := public.coven_meeting_current(p_step);
  select * into s from public.coven_ritual_steps where id = p_step;
  if s.action <> 'motion' then raise exception 'Only a motion is seconded.'; end if;
  if not public.coven_in_good_standing(r.coven_id) then raise exception 'You need to be a member in good standing to second a motion.'; end if;
  if s.details->'fields'->'proposer' ? ('user:' || auth.uid()::text) then raise exception 'The one who proposes a motion doesn''t second it.'; end if;
  select coalesce(items->(p_step::text), '{}'::jsonb) into item from public.coven_meeting_state where ritual_id = r.id;
  if coalesce(p_on, true) then
    if item->>'seconded_by' is not null and item->>'seconded_by' <> auth.uid()::text then raise exception 'It has been seconded already.'; end if;
    return public.coven_meeting_put_item(r.id, p_step, jsonb_build_object('seconded_by', auth.uid(), 'seconded_at', now()));
  end if;
  if item->>'seconded_by' = auth.uid()::text and item->>'vote_called_at' is null then
    return public.coven_meeting_put_item(r.id, p_step, jsonb_build_object('seconded_by', null, 'seconded_at', null));
  end if;
  return item;
end;
$$;

-- Propose an amendment to the motion under way.
create or replace function public.propose_coven_meeting_amendment(p_step uuid, p_text text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  item jsonb;
  list jsonb;
begin
  r := public.coven_meeting_current(p_step);
  if not public.coven_in_good_standing(r.coven_id) then raise exception 'You need to be a member in good standing to propose an amendment.'; end if;
  if coalesce(btrim(p_text), '') = '' or char_length(p_text) > 1000 then raise exception 'Write the amendment (up to 1,000 characters).'; end if;
  if not exists (select 1 from public.coven_ritual_steps where id = p_step and action = 'motion') then raise exception 'Only a motion is amended.'; end if;
  select coalesce(items->(p_step::text), '{}'::jsonb) into item from public.coven_meeting_state where ritual_id = r.id;
  if item->>'vote_called_at' is not null then raise exception 'The vote has been called.'; end if;
  list := case when jsonb_typeof(item->'amendments') = 'array' then item->'amendments' else '[]'::jsonb end;
  if jsonb_array_length(list) >= 20 then raise exception 'A motion takes up to 20 amendments.'; end if;
  return public.coven_meeting_put_item(r.id, p_step, jsonb_build_object('amendments', list || jsonb_build_array(jsonb_build_object(
    'id', left(gen_random_uuid()::text, 8), 'text', btrim(p_text), 'by', auth.uid(), 'at', now(), 'status', 'proposed'))));
end;
$$;

-- The chair accepts or sets aside an amendment.
create or replace function public.decide_coven_meeting_amendment(p_step uuid, p_amendment text, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  item jsonb;
begin
  r := public.coven_meeting_current(p_step);
  if not public.coven_meeting_steers(r.id) then raise exception 'Only the meeting''s Chair decides on amendments.'; end if;
  if p_status not in ('proposed', 'accepted', 'rejected') then raise exception 'Accept it or set it aside.'; end if;
  select coalesce(items->(p_step::text), '{}'::jsonb) into item from public.coven_meeting_state where ritual_id = r.id;
  return public.coven_meeting_put_item(r.id, p_step, jsonb_build_object('amendments', (
    select coalesce(jsonb_agg(case when a->>'id' = p_amendment then a || jsonb_build_object('status', p_status) else a end), '[]'::jsonb)
    from jsonb_array_elements(case when jsonb_typeof(item->'amendments') = 'array' then item->'amendments' else '[]'::jsonb end) a)));
end;
$$;

-- The chair calls the vote on a motion or an election.
create or replace function public.call_coven_meeting_vote(p_step uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
begin
  r := public.coven_meeting_current(p_step);
  if not public.coven_meeting_steers(r.id) then raise exception 'Only the meeting''s Chair calls the vote.'; end if;
  if not exists (select 1 from public.coven_ritual_steps where id = p_step and public.coven_is_vote_action(action)) then raise exception 'There is nothing to vote on here.'; end if;
  return public.coven_meeting_put_item(r.id, p_step, jsonb_build_object('vote_called_at', now()));
end;
$$;

-- The chair gives an item more time (or takes it back, with a negative number).
create or replace function public.extend_coven_meeting_item(p_step uuid, p_minutes integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  item jsonb;
begin
  r := public.coven_meeting_current(p_step);
  if not public.coven_meeting_steers(r.id) then raise exception 'Only the meeting''s Chair keeps its time.'; end if;
  select coalesce(items->(p_step::text), '{}'::jsonb) into item from public.coven_meeting_state where ritual_id = r.id;
  return public.coven_meeting_put_item(r.id, p_step, jsonb_build_object('extra_minutes',
    greatest(0, least(240, coalesce((item->>'extra_minutes')::integer, 0) + coalesce(p_minutes, 0)))));
end;
$$;

-- Attendance for the roll call: the meeting's Chair and Secretary can mark it too.
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
  if r.id is null or not public.coven_ritual_open_to(r.id) then raise exception 'That ritual was not found.'; end if;
  if not (public.coven_marks_attendance(r.coven_id) or (r.kind = 'meeting' and public.coven_meeting_keeps_notes(r.id))) then
    raise exception 'Only those who lead the coven''s rituals can correct attendance.';
  end if;
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

-- ---------------------------------------------------------------------------
-- Actions
-- ---------------------------------------------------------------------------

-- "Add an action": what, for whom (the WHO picker's), and by when. The Chair and Secretary.
create or replace function public.add_coven_meeting_action(p_ritual uuid, p_step uuid, p_body text, p_assignees jsonb, p_due date)
returns public.coven_meeting_actions
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  who jsonb;
  saved public.coven_meeting_actions;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.kind <> 'meeting' or not public.coven_meeting_keeps_notes(r.id) then
    raise exception 'Only the meeting''s Chair and Secretary add its actions.';
  end if;
  if coalesce(btrim(p_body), '') = '' then raise exception 'Say what is to be done.'; end if;
  who := public.coven_clean_assignees(r.coven_id, p_assignees, 'Who does it', false);
  if jsonb_array_length(who) = 0 then raise exception 'Choose who does it.'; end if;
  if p_step is not null and not exists (select 1 from public.coven_ritual_steps where id = p_step and ritual_id = r.id) then raise exception 'That item isn''t this meeting''s.'; end if;
  if (select count(*) from public.coven_meeting_actions where ritual_id = r.id) >= 100 then raise exception 'A meeting keeps up to 100 actions.'; end if;
  insert into public.coven_meeting_actions (ritual_id, coven_id, step_id, body, assignees, due_on, created_by)
  values (r.id, r.coven_id, p_step, left(btrim(p_body), 500), who, p_due, auth.uid())
  returning * into saved;
  return saved;
end;
$$;

-- Mark an action done (or open again, or dropped): those it's for, and the
-- Chair and Secretary of its meeting or of a later one it was carried into
-- (anyone who keeps the notes of a meeting in the coven), and the coven's head.
create or replace function public.set_coven_meeting_action(p_action uuid, p_status text)
returns public.coven_meeting_actions
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.coven_meeting_actions;
begin
  select * into a from public.coven_meeting_actions where id = p_action for update;
  if a.id is null then raise exception 'That action was not found.'; end if;
  if p_status not in ('open', 'done', 'dropped') then raise exception 'An action is open, done or dropped.'; end if;
  if not (
    (public.coven_list_names(a.coven_id, a.assignees, auth.uid()) and public.coven_in_good_standing(a.coven_id) and p_status <> 'dropped')
    or public.coven_meeting_keeps_notes(a.ritual_id)
    or exists (select 1 from public.covens c where c.id = a.coven_id and c.founder_id = auth.uid())
    or public.is_community_moderator()
  ) then
    raise exception 'Only those it''s for, and the meeting''s Chair and Secretary, mark an action.';
  end if;
  update public.coven_meeting_actions
  set status = p_status, done_by = case when p_status = 'done' then auth.uid() end, done_at = case when p_status = 'done' then now() end, updated_at = now()
  where id = a.id
  returning * into a;
  return a;
end;
$$;

create or replace function public.remove_coven_meeting_action(p_action uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.coven_meeting_actions;
begin
  select * into a from public.coven_meeting_actions where id = p_action;
  if a.id is null then return false; end if;
  if not public.coven_meeting_keeps_notes(a.ritual_id) then raise exception 'Only the meeting''s Chair and Secretary remove its actions.'; end if;
  delete from public.coven_meeting_actions where id = a.id;
  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Who reads the chat afterwards (the coven's head decides)
-- ---------------------------------------------------------------------------

create or replace function public.coven_clean_history_keys(p_coven uuid, p_keys jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  k text;
  out jsonb := '[]'::jsonb;
begin
  if p_keys is null or jsonb_typeof(p_keys) <> 'array' then return null; end if;
  if jsonb_array_length(p_keys) > 40 then raise exception 'Choose up to 40.'; end if;
  for k in select * from jsonb_array_elements_text(p_keys) loop
    if k in ('chair', 'secretary', 'audience') or k ~ '^role:[A-Za-z0-9_-]{1,40}$'
       or (k ~ '^rank:[0-9a-f-]{36}$' and exists (select 1 from public.coven_ranks where id = substr(k, 6)::uuid and coven_id = p_coven))
       or (k ~ '^user:[0-9a-f-]{36}$' and exists (select 1 from public.coven_members where coven_id = p_coven and user_id = substr(k, 6)::uuid and status = 'active')) then
      if not out ? k then out := out || to_jsonb(k); end if;
    end if;
  end loop;
  return out;
end;
$$;

create or replace function public.set_coven_meeting_chat_readers(p_ritual uuid, p_readers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  cleaned jsonb;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.kind <> 'meeting' then raise exception 'That meeting was not found.'; end if;
  if not (exists (select 1 from public.covens c where c.id = r.coven_id and c.founder_id = auth.uid()) and public.is_coven_member(r.coven_id))
     and not public.is_community_moderator() then
    raise exception 'Only the coven''s head chooses who reads a meeting''s whole chat.';
  end if;
  cleaned := public.coven_clean_history_keys(r.coven_id, p_readers);
  update public.coven_rituals set chat_readers = cleaned, updated_at = now() where id = r.id;
  return cleaned;
end;
$$;

create or replace function public.set_coven_meeting_defaults(p_coven uuid, p_readers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned jsonb;
begin
  if not (exists (select 1 from public.covens c where c.id = p_coven and c.founder_id = auth.uid()) and public.is_coven_member(p_coven))
     and not public.is_community_moderator() then
    raise exception 'Only the coven''s head chooses who reads meetings'' whole chats.';
  end if;
  cleaned := public.coven_clean_history_keys(p_coven, p_readers);
  insert into public.coven_ritual_settings (coven_id, meeting_chat_readers, updated_by, updated_at)
  values (p_coven, cleaned, auth.uid(), now())
  on conflict (coven_id) do update set meeting_chat_readers = excluded.meeting_chat_readers, updated_by = auth.uid(), updated_at = now();
  return cleaned;
end;
$$;

-- What the page shows about the chat: when it opens and closes, whether you
-- may read and write it, and whether you'll read it afterwards.
create or replace function public.coven_meeting_chat_access(p_ritual uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  w record;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.kind <> 'meeting' or not public.coven_ritual_open_to(r.id) then return null; end if;
  select * into w from public.coven_meeting_chat_window(r.id);
  return jsonb_build_object(
    'opens_at', w.opens_at, 'closes_at', w.closes_at, 'open', coalesce(w.is_open, false),
    'read', public.coven_meeting_chat_readable(r.id), 'write', public.coven_meeting_chat_writable(r.id),
    'history', public.coven_meeting_reads_history(r.id),
    'readers', coalesce(r.chat_readers, (select s.meeting_chat_readers from public.coven_ritual_settings s where s.coven_id = r.coven_id)),
    'readers_own', r.chat_readers is not null
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Minutes
-- ---------------------------------------------------------------------------

-- The minutes, onto the Book's Meeting minutes shelf: the same page each time
-- (a new version), read by those the meeting was for (or the whole coven,
-- p_view 'coven'), written by its Chair and Secretary. For them, those who
-- lead the coven's rituals, and its head. Returns { status, page_id }.
create or replace function public.save_coven_meeting_minutes(p_ritual uuid, p_title text, p_blocks jsonb, p_view text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  b public.coven_grimoire_books;
  shelf_id uuid;
  pg public.coven_grimoire_pages;
  st public.coven_meeting_state;
  cleaned jsonb := public.coven_grimoire_clean_blocks(p_blocks);
  view_list jsonb;
  writers jsonb;
  access jsonb;
  wanted text;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.kind <> 'meeting' or not public.coven_meeting_keeps_notes(r.id) then
    raise exception 'Only the meeting''s Chair and Secretary keep its minutes.';
  end if;
  if coalesce(btrim(p_title), '') = '' then raise exception 'Give the minutes a title.'; end if;
  b := public.open_coven_grimoire(r.coven_id);
  perform public.coven_grimoire_shelves(b.id);
  select id into shelf_id from public.coven_grimoire_sections where book_id = b.id and shelf = 'minutes';
  st := public.coven_meeting_state_row(r.id);
  select * into pg from public.coven_grimoire_pages where id = st.minutes_page_id;
  if pg.id is null then
    select * into pg from public.coven_grimoire_pages
    where book_id = b.id and metadata->>'covenRitual' = r.id::text and metadata->>'gathering' = 'minutes'
    order by created_at limit 1;
  end if;
  wanted := coalesce(p_view, r.plan->'meeting'->>'minutes_view', 'audience');
  view_list := case when wanted = 'audience' and r.audience is not null
    then public.coven_clean_assignees(r.coven_id,
           r.audience || public.coven_plan_role_people(r.plan, (select coalesce(jsonb_agg(x->>'id'), '[]'::jsonb) from jsonb_array_elements(case when jsonb_typeof(r.plan->'roles') = 'array' then r.plan->'roles' else '[]'::jsonb end) x)),
           'Who reads the minutes', false)
    end;
  writers := public.coven_clean_assignees(r.coven_id,
    public.coven_plan_role_people(r.plan, jsonb_build_array(public.coven_meeting_role(r.plan, 'chair'), public.coven_meeting_role(r.plan, 'secretary')))
      || jsonb_build_array(jsonb_build_object('kind', 'user', 'id', auth.uid())),
    'Who writes the minutes', false);
  access := jsonb_strip_nulls(jsonb_build_object('view', view_list, 'write', case when jsonb_array_length(writers) > 0 then writers end));

  if pg.id is null then
    insert into public.coven_grimoire_pages (coven_id, book_id, section_id, user_id, updated_by, title, page_type, sort_order, metadata, access)
    values (r.coven_id, b.id, shelf_id, auth.uid(), auth.uid(), left(btrim(p_title), 200), 'minutes',
            coalesce((select max(sort_order) + 1 from public.coven_grimoire_pages where section_id = shelf_id), 0),
            jsonb_build_object('covenRitual', r.id, 'gathering', 'minutes'), access)
    returning * into pg;
  else
    update public.coven_grimoire_pages
    set title = left(btrim(p_title), 200), updated_at = now(), updated_by = auth.uid(),
        access = case when p_view is not null then access else coven_grimoire_pages.access end
    where id = pg.id
    returning * into pg;
  end if;
  perform public.coven_grimoire_put_blocks(pg.id, cleaned);
  perform public.coven_grimoire_keep_version(pg.id);
  update public.coven_meeting_state set minutes_page_id = pg.id, updated_at = now() where ritual_id = r.id;
  return jsonb_build_object('status', 'published', 'page_id', pg.id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Existing functions, kept to those a gathering is open to
-- ---------------------------------------------------------------------------
-- Each is renamed to <name>_unguarded and called by a new <name> that first
-- checks the gathering is open to the caller, so the bodies stay as they were.

do $$
declare
  f text;
begin
  foreach f in array array[
    'coven_ritual_prep(uuid)',
    'tick_coven_ritual_prep(uuid, text, boolean)',
    'coven_ritual_contributions_for(uuid)',
    'coven_ritual_participation(uuid)',
    'rsvp_coven_ritual(uuid, text)',
    'record_coven_ritual_presence(uuid)',
    'send_coven_ritual_apology(uuid, text)',
    'excuse_coven_ritual_absence(uuid, uuid, boolean)',
    'start_coven_ritual(uuid)',
    'finish_coven_ritual_step(uuid)',
    'go_to_coven_ritual_step(uuid, uuid)',
    'set_coven_ritual_status(uuid, text)',
    'save_coven_ritual_contribution(uuid, text, jsonb, boolean, boolean)',
    'perform_coven_step_action(uuid)',
    'next_coven_ritual_turn(uuid, boolean)',
    'set_coven_ritual_turns(uuid, uuid[])',
    'set_coven_ritual_record_notes(uuid, text)',
    'save_coven_grimoire_gathering(uuid, uuid, text, text, jsonb)',
    'coven_member_record(uuid, uuid)',
    'coven_member_record_overview(uuid, timestamptz)'
  ] loop
    if to_regprocedure('public.' || replace(f, '(', '_unguarded(')) is null and to_regprocedure('public.' || f) is not null then
      execute format('alter function public.%s rename to %I', f, split_part(f, '(', 1) || '_unguarded');
    end if;
    if to_regprocedure('public.' || replace(f, '(', '_unguarded(')) is not null then
      execute format('revoke execute on function public.%s from public, anon, authenticated', replace(f, '(', '_unguarded('));
    end if;
  end loop;
end;
$$;

create or replace function public.coven_ritual_prep(p_ritual uuid)
returns table (item_id text, done integer, mine boolean, users uuid[])
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.coven_ritual_open_to(p_ritual) then return; end if;
  return query select * from public.coven_ritual_prep_unguarded(p_ritual);
end;
$$;

create or replace function public.tick_coven_ritual_prep(p_ritual uuid, p_item text, p_done boolean default true)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  perform public.coven_ritual_require(p_ritual);
  return public.tick_coven_ritual_prep_unguarded(p_ritual, p_item, p_done);
end;
$$;

create or replace function public.coven_ritual_contributions_for(p_ritual uuid)
returns setof record
language plpgsql stable security definer set search_path = public
as $$ begin return; end; $$;
drop function if exists public.coven_ritual_contributions_for(uuid);
do $$
declare
  cols text;
begin
  -- The same columns as the original, whatever they are.
  select string_agg(format('%I %s', n, format_type(t, null)), ', ' order by o)
  into cols
  from unnest((select proargnames from pg_proc where oid = to_regprocedure('public.coven_ritual_contributions_for_unguarded(uuid)')),
              (select proallargtypes from pg_proc where oid = to_regprocedure('public.coven_ritual_contributions_for_unguarded(uuid)')),
              (select proargmodes from pg_proc where oid = to_regprocedure('public.coven_ritual_contributions_for_unguarded(uuid)')))
       with ordinality as x(n, t, m, o)
  where m = 't';
  execute format($f$
    create or replace function public.coven_ritual_contributions_for(p_ritual uuid)
    returns table (%s)
    language plpgsql stable security definer set search_path = public
    as $b$
    begin
      if not public.coven_ritual_open_to(p_ritual) then return; end if;
      return query select * from public.coven_ritual_contributions_for_unguarded(p_ritual);
    end;
    $b$;
  $f$, cols);
end;
$$;

create or replace function public.coven_ritual_participation(p_ritual uuid)
returns table (step_id uuid, expected integer, done integer, done_users uuid[], waiting_users uuid[])
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.coven_ritual_open_to(p_ritual) then return; end if;
  return query select * from public.coven_ritual_participation_unguarded(p_ritual);
end;
$$;

create or replace function public.rsvp_coven_ritual(p_ritual uuid, p_response text)
returns public.coven_ritual_rsvps
language plpgsql security definer set search_path = public
as $$
begin
  perform public.coven_ritual_require(p_ritual);
  return public.rsvp_coven_ritual_unguarded(p_ritual, p_response);
end;
$$;

create or replace function public.record_coven_ritual_presence(p_ritual uuid)
returns public.coven_ritual_attendance
language plpgsql security definer set search_path = public
as $$
begin
  if not public.coven_ritual_open_to(p_ritual) then return null; end if;
  return public.record_coven_ritual_presence_unguarded(p_ritual);
end;
$$;

create or replace function public.send_coven_ritual_apology(p_ritual uuid, p_note text)
returns public.coven_ritual_attendance
language plpgsql security definer set search_path = public
as $$
begin
  perform public.coven_ritual_require(p_ritual);
  return public.send_coven_ritual_apology_unguarded(p_ritual, p_note);
end;
$$;

create or replace function public.excuse_coven_ritual_absence(p_ritual uuid, p_user uuid, p_excused boolean)
returns public.coven_ritual_attendance
language plpgsql security definer set search_path = public
as $$
begin
  perform public.coven_ritual_require(p_ritual);
  return public.excuse_coven_ritual_absence_unguarded(p_ritual, p_user, p_excused);
end;
$$;

create or replace function public.start_coven_ritual(p_ritual uuid)
returns public.coven_rituals
language plpgsql security definer set search_path = public
as $$
begin
  perform public.coven_ritual_require(p_ritual);
  return public.start_coven_ritual_unguarded(p_ritual);
end;
$$;

-- A meeting's Chair finishes an item and moves the meeting on too.
create or replace function public.finish_coven_ritual_step(p_step uuid)
returns public.coven_rituals
language plpgsql security definer set search_path = public
as $$
declare
  ritual uuid := public.coven_step_ritual(p_step);
  r public.coven_rituals;
  nxt uuid;
begin
  perform public.coven_ritual_require(ritual);
  select * into r from public.coven_rituals where id = ritual;
  if r.kind = 'meeting' and r.status = 'live' and r.current_step_id = p_step
     and not public.coven_ritual_steers(r.id) and public.coven_meeting_steers(r.id) then
    update public.coven_ritual_steps set completed_at = now(), completed_by = auth.uid(), updated_at = now() where id = p_step;
    select s.id into nxt from public.coven_ritual_steps s
    where s.ritual_id = r.id and s.position > (select position from public.coven_ritual_steps where id = p_step)
    order by s.position limit 1;
    return public.coven_ritual_move(r.id, nxt);
  end if;
  return public.finish_coven_ritual_step_unguarded(p_step);
end;
$$;

-- A meeting's Chair moves between items and ends the meeting too.
create or replace function public.go_to_coven_ritual_step(p_ritual uuid, p_step uuid)
returns public.coven_rituals
language plpgsql security definer set search_path = public
as $$
declare
  r public.coven_rituals;
begin
  perform public.coven_ritual_require(p_ritual);
  select * into r from public.coven_rituals where id = p_ritual;
  if r.kind = 'meeting' and r.status = 'live' and not public.coven_ritual_steers(r.id) and public.coven_meeting_steers(r.id) then
    if p_step is not null and not exists (select 1 from public.coven_ritual_steps where id = p_step and ritual_id = r.id) then
      raise exception 'That item isn''t this meeting''s.';
    end if;
    return public.coven_ritual_move(r.id, p_step);
  end if;
  return public.go_to_coven_ritual_step_unguarded(p_ritual, p_step);
end;
$$;

create or replace function public.set_coven_ritual_status(p_ritual uuid, p_status text)
returns public.coven_rituals
language plpgsql security definer set search_path = public
as $$
begin
  perform public.coven_ritual_require(p_ritual);
  return public.set_coven_ritual_status_unguarded(p_ritual, p_status);
end;
$$;

create or replace function public.save_coven_ritual_contribution(p_step uuid, p_body text, p_items jsonb default '[]'::jsonb, p_private boolean default false, p_anonymous boolean default false)
returns public.coven_ritual_contributions
language plpgsql security definer set search_path = public
as $$
begin
  perform public.coven_ritual_require(public.coven_step_ritual(p_step));
  return public.save_coven_ritual_contribution_unguarded(p_step, p_body, p_items, p_private, p_anonymous);
end;
$$;

create or replace function public.perform_coven_step_action(p_step uuid)
returns jsonb
language plpgsql security definer set search_path = public
as $$
begin
  perform public.coven_ritual_require(public.coven_step_ritual(p_step));
  return public.perform_coven_step_action_unguarded(p_step);
end;
$$;

-- A round in a meeting: its Chair moves the turns on too.
create or replace function public.next_coven_ritual_turn(p_step uuid, p_skip boolean default false)
returns public.coven_ritual_steps
language plpgsql security definer set search_path = public
as $$
declare
  s public.coven_ritual_steps;
  r public.coven_rituals;
begin
  perform public.coven_ritual_require(public.coven_step_ritual(p_step));
  select * into s from public.coven_ritual_steps where id = p_step for update;
  select * into r from public.coven_rituals where id = s.ritual_id;
  if r.kind = 'meeting' and not public.coven_ritual_steers(r.id) and public.coven_meeting_steers(r.id) then
    if r.status <> 'live' or r.current_step_id is distinct from s.id then raise exception 'That step isn''t the one under way.'; end if;
    if s.turn_mode <> 'in_turn' then raise exception 'This step isn''t taken in turn.'; end if;
    update public.coven_ritual_steps
    set turn_at = least(turn_at + 1, coalesce(array_length(turn_order, 1), 0)), updated_at = now()
    where id = s.id
    returning * into s;
    return s;
  end if;
  return public.next_coven_ritual_turn_unguarded(p_step, p_skip);
end;
$$;

create or replace function public.set_coven_ritual_turns(p_step uuid, p_order uuid[])
returns public.coven_ritual_steps
language plpgsql security definer set search_path = public
as $$
begin
  perform public.coven_ritual_require(public.coven_step_ritual(p_step));
  return public.set_coven_ritual_turns_unguarded(p_step, p_order);
end;
$$;

create or replace function public.set_coven_ritual_record_notes(p_ritual uuid, p_notes text)
returns public.coven_ritual_records
language plpgsql security definer set search_path = public
as $$
begin
  perform public.coven_ritual_require(p_ritual);
  return public.set_coven_ritual_record_notes_unguarded(p_ritual, p_notes);
end;
$$;

create or replace function public.save_coven_grimoire_gathering(p_coven uuid, p_ritual uuid, p_what text, p_title text, p_blocks jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
begin
  perform public.coven_ritual_require(p_ritual);
  return public.save_coven_grimoire_gathering_unguarded(p_coven, p_ritual, p_what, p_title, p_blocks);
end;
$$;

-- The members' record leaves out meetings the reader isn't let into.
create or replace function public.coven_member_record(p_coven uuid, p_user uuid)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  out jsonb := public.coven_member_record_unguarded(p_coven, p_user);
begin
  if jsonb_typeof(out->'rituals') = 'array' then
    out := jsonb_set(out, '{rituals}', (select coalesce(jsonb_agg(x), '[]'::jsonb) from jsonb_array_elements(out->'rituals') x
                                        where x->>'id' is null or public.coven_ritual_open_to((x->>'id')::uuid)));
  end if;
  return out;
end;
$$;

create or replace function public.coven_member_record_overview(p_coven uuid, p_since timestamptz default null)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  out jsonb := public.coven_member_record_overview_unguarded(p_coven, p_since);
begin
  if jsonb_typeof(out->'rituals') = 'array' then
    out := jsonb_set(out, '{rituals}', (select coalesce(jsonb_agg(x), '[]'::jsonb) from jsonb_array_elements(out->'rituals') x
                                        where x->>'id' is null or public.coven_ritual_open_to((x->>'id')::uuid)));
  end if;
  return out;
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may call what, and live updates
-- ---------------------------------------------------------------------------

revoke execute on function
  public.coven_meeting_state_row(uuid),
  public.coven_meeting_put_item(uuid, uuid, jsonb),
  public.coven_meeting_current(uuid),
  public.coven_clean_history_keys(uuid, jsonb),
  public.guard_coven_meeting_message()
from public, anon, authenticated;
revoke execute on function
  public.coven_list_names(uuid, jsonb, uuid),
  public.coven_meeting_role(jsonb, text),
  public.coven_meeting_cast_in(uuid, text, uuid),
  public.coven_ritual_open_to(uuid, uuid),
  public.coven_ritual_require(uuid),
  public.coven_step_ritual(uuid),
  public.coven_meeting_steers(uuid),
  public.coven_meeting_keeps_notes(uuid),
  public.coven_meeting_chat_window(uuid),
  public.coven_meeting_chat_open(uuid),
  public.coven_meeting_reads_history(uuid, uuid),
  public.coven_meeting_chat_readable(uuid),
  public.coven_meeting_chat_writable(uuid),
  public.coven_is_vote_action(text),
  public.remove_coven_meeting_message(uuid),
  public.edit_coven_meeting_message(uuid, text),
  public.set_coven_meeting_chat(uuid, text, integer),
  public.set_coven_meeting_floor(uuid, uuid),
  public.raise_coven_meeting_hand(uuid, boolean),
  public.set_coven_meeting_notes(uuid, text),
  public.second_coven_meeting_motion(uuid, boolean),
  public.propose_coven_meeting_amendment(uuid, text),
  public.decide_coven_meeting_amendment(uuid, text, text),
  public.call_coven_meeting_vote(uuid),
  public.extend_coven_meeting_item(uuid, integer),
  public.add_coven_meeting_action(uuid, uuid, text, jsonb, date),
  public.set_coven_meeting_action(uuid, text),
  public.remove_coven_meeting_action(uuid),
  public.set_coven_meeting_chat_readers(uuid, jsonb),
  public.set_coven_meeting_defaults(uuid, jsonb),
  public.coven_meeting_chat_access(uuid),
  public.save_coven_meeting_minutes(uuid, text, jsonb, text),
  public.coven_ritual_prep(uuid),
  public.tick_coven_ritual_prep(uuid, text, boolean),
  public.coven_ritual_contributions_for(uuid),
  public.coven_ritual_participation(uuid),
  public.rsvp_coven_ritual(uuid, text),
  public.record_coven_ritual_presence(uuid),
  public.send_coven_ritual_apology(uuid, text),
  public.mark_coven_ritual_attendance(uuid, uuid, boolean),
  public.excuse_coven_ritual_absence(uuid, uuid, boolean),
  public.start_coven_ritual(uuid),
  public.finish_coven_ritual_step(uuid),
  public.go_to_coven_ritual_step(uuid, uuid),
  public.set_coven_ritual_status(uuid, text),
  public.save_coven_ritual_contribution(uuid, text, jsonb, boolean, boolean),
  public.perform_coven_step_action(uuid),
  public.next_coven_ritual_turn(uuid, boolean),
  public.set_coven_ritual_turns(uuid, uuid[]),
  public.set_coven_ritual_record_notes(uuid, text),
  public.save_coven_grimoire_gathering(uuid, uuid, text, text, jsonb),
  public.coven_member_record(uuid, uuid),
  public.coven_member_record_overview(uuid, timestamptz)
from public, anon;
grant execute on function
  public.coven_list_names(uuid, jsonb, uuid),
  public.coven_meeting_role(jsonb, text),
  public.coven_meeting_cast_in(uuid, text, uuid),
  public.coven_ritual_open_to(uuid, uuid),
  public.coven_ritual_require(uuid),
  public.coven_step_ritual(uuid),
  public.coven_meeting_steers(uuid),
  public.coven_meeting_keeps_notes(uuid),
  public.coven_meeting_chat_window(uuid),
  public.coven_meeting_chat_open(uuid),
  public.coven_meeting_reads_history(uuid, uuid),
  public.coven_meeting_chat_readable(uuid),
  public.coven_meeting_chat_writable(uuid),
  public.coven_is_vote_action(text),
  public.remove_coven_meeting_message(uuid),
  public.edit_coven_meeting_message(uuid, text),
  public.set_coven_meeting_chat(uuid, text, integer),
  public.set_coven_meeting_floor(uuid, uuid),
  public.raise_coven_meeting_hand(uuid, boolean),
  public.set_coven_meeting_notes(uuid, text),
  public.second_coven_meeting_motion(uuid, boolean),
  public.propose_coven_meeting_amendment(uuid, text),
  public.decide_coven_meeting_amendment(uuid, text, text),
  public.call_coven_meeting_vote(uuid),
  public.extend_coven_meeting_item(uuid, integer),
  public.add_coven_meeting_action(uuid, uuid, text, jsonb, date),
  public.set_coven_meeting_action(uuid, text),
  public.remove_coven_meeting_action(uuid),
  public.set_coven_meeting_chat_readers(uuid, jsonb),
  public.set_coven_meeting_defaults(uuid, jsonb),
  public.coven_meeting_chat_access(uuid),
  public.save_coven_meeting_minutes(uuid, text, jsonb, text),
  public.coven_ritual_prep(uuid),
  public.tick_coven_ritual_prep(uuid, text, boolean),
  public.coven_ritual_contributions_for(uuid),
  public.coven_ritual_participation(uuid),
  public.rsvp_coven_ritual(uuid, text),
  public.record_coven_ritual_presence(uuid),
  public.send_coven_ritual_apology(uuid, text),
  public.mark_coven_ritual_attendance(uuid, uuid, boolean),
  public.excuse_coven_ritual_absence(uuid, uuid, boolean),
  public.start_coven_ritual(uuid),
  public.finish_coven_ritual_step(uuid),
  public.go_to_coven_ritual_step(uuid, uuid),
  public.set_coven_ritual_status(uuid, text),
  public.save_coven_ritual_contribution(uuid, text, jsonb, boolean, boolean),
  public.perform_coven_step_action(uuid),
  public.next_coven_ritual_turn(uuid, boolean),
  public.set_coven_ritual_turns(uuid, uuid[]),
  public.set_coven_ritual_record_notes(uuid, text),
  public.save_coven_grimoire_gathering(uuid, uuid, text, text, jsonb),
  public.coven_member_record(uuid, uuid),
  public.coven_member_record_overview(uuid, timestamptz)
to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_meeting_state') then
      alter publication supabase_realtime add table public.coven_meeting_state;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_meeting_messages') then
      alter publication supabase_realtime add table public.coven_meeting_messages;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_meeting_actions') then
      alter publication supabase_realtime add table public.coven_meeting_actions;
    end if;
  end if;
end;
$$;
