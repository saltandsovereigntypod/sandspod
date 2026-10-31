-- NOT YET APPLIED. Needs the coven migrations up to 20261107000200_coven_meetings.sql
-- (coven_reports' target types, coven_ritual_open_to, coven_ritual_steers).
--
-- Rituals together and mentorship (app: lib/together/live.ts and
-- lib/together/mentorship.ts, app/src/app/(tabs)/rituals/together/ and
-- app/src/app/(tabs)/coven/mentorship/; website: rituals/together/ and
-- covens/mentorship/). Additive: new tables only, each with row-level
-- security; no new foreign key from an existing table (the new tables point
-- at covens, coven_rituals and auth.users). The only changes to existing
-- objects: coven_reports may name the new things (its target type check, and
-- a second fill trigger that keeps a copy of what was reported), and blocking
-- someone ends any mentorship between you.
--
-- Who may take part: both use the community profile (coven_profiles), which
-- can only be made by confirming you are 18 or older (age_confirmed_at), and
-- no one banned from the community. Mentorship asks more: a mentorship
-- profile (mentor_listings) confirming 18+ again and agreeing to the
-- boundaries, on both sides, before the directory shows or a pairing is made.
--
-- Rituals together (live_rituals, live_ritual_people, live_ritual_messages):
-- a host starts one from a ritual (its steps copied in). People join with
-- its invite code, or, for one begun from a coven gathering, as anyone the
-- gathering is open to. Only those in it read it, its people and its chat;
-- every change goes through the functions below, which apply the same rules
-- as lib/together/live.ts reduceLive. The host can ask someone to leave
-- (they can't come back). No one sees messages from someone they've
-- blocked or who has blocked them, and someone who blocked the host, or whom
-- the host blocked, can't join. On Realtime, so pages follow along live.
--
-- Mentorship (mentor_listings, mentorships, mentorship_messages,
-- mentorship_items, mentorship_checkins): only the two people in a pairing
-- read or write anything of it. A coven's leaders (those who run its
-- programs, or see its progress) see that a pairing exists in their coven
-- through coven_mentorship_pairs, never its notes, messages, goals or
-- check-ins. Either side ends it whenever they like.
--
-- together_notices: which phone notes coven-notify has sent (once each). No
-- policies: only the service role reads or writes it.

-- ---------------------------------------------------------------------------
-- Who may take part
-- ---------------------------------------------------------------------------

-- A community profile (made only with the 18+ confirmation), and not banned.
create or replace function public.together_eligible(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_user is not null
    and exists (select 1 from public.coven_profiles where user_id = p_user and age_confirmed_at is not null)
    and not public.is_community_banned(p_user);
$$;

-- ---------------------------------------------------------------------------
-- Rituals together
-- ---------------------------------------------------------------------------

create table if not exists public.live_rituals (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Whoever the lead was passed to; null when the host leads.
  leader_id uuid references auth.users (id) on delete set null,
  coven_id uuid references public.covens (id) on delete cascade,
  coven_ritual_id uuid references public.coven_rituals (id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  intention text check (intention is null or char_length(intention) <= 500),
  steps jsonb not null check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) between 1 and 60 and octet_length(steps::text) <= 200000),
  source jsonb not null default '{}'::jsonb check (jsonb_typeof(source) = 'object' and octet_length(source::text) <= 12000),
  invite_code text not null unique check (invite_code ~ '^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$'),
  status text not null default 'gathering' check (status in ('gathering', 'live', 'closing', 'ended')),
  current_step integer not null default -1,
  candle_lit_at timestamptz,
  candle_lit_by uuid references auth.users (id) on delete set null,
  quiet boolean not null default false,
  version integer not null default 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists live_rituals_host_idx on public.live_rituals (host_id, status);
create index if not exists live_rituals_coven_idx on public.live_rituals (coven_id, status) where coven_id is not null;
create index if not exists live_rituals_gathering_idx on public.live_rituals (coven_ritual_id) where coven_ritual_id is not null;

create table if not exists public.live_ritual_people (
  live_id uuid not null references public.live_rituals (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'guest' check (role in ('host', 'guest')),
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  done_at timestamptz,
  left_at timestamptz,
  removed_at timestamptz,
  removed_by uuid references auth.users (id) on delete set null,
  quiet boolean not null default false,
  primary key (live_id, user_id)
);

create index if not exists live_ritual_people_user_idx on public.live_ritual_people (user_id);

create table if not exists public.live_ritual_messages (
  id uuid primary key default gen_random_uuid(),
  live_id uuid not null references public.live_rituals (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users (id) on delete set null
);

create index if not exists live_ritual_messages_live_idx on public.live_ritual_messages (live_id, created_at);

-- Whether you're in it now: the host, or someone who joined and hasn't left or been asked to leave.
create or replace function public.live_ritual_is_in(p_live uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.live_ritual_people
    where live_id = p_live and user_id = auth.uid() and removed_at is null and (left_at is null or role = 'host')
  );
$$;

-- Whether you may see it (and join it without a code): in it, or, for one
-- begun from a coven gathering, someone the gathering is open to; never
-- someone asked to leave, nor across a block with the host.
create or replace function public.live_ritual_can_see(p_live uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  l public.live_rituals;
  me uuid := auth.uid();
begin
  if me is null then return false; end if;
  select * into l from public.live_rituals where id = p_live;
  if l.id is null then return false; end if;
  if l.host_id = me then return true; end if;
  if exists (select 1 from public.live_ritual_people where live_id = p_live and user_id = me and removed_at is not null) then return false; end if;
  if public.coven_blocked_between(me, l.host_id) then return false; end if;
  if exists (select 1 from public.live_ritual_people where live_id = p_live and user_id = me) then return true; end if;
  if l.coven_id is null then return false; end if;
  if not exists (select 1 from public.coven_members where coven_id = l.coven_id and user_id = me and status = 'active') then return false; end if;
  return l.coven_ritual_id is null or public.coven_ritual_open_to(l.coven_ritual_id, me);
end;
$$;

alter table public.live_rituals enable row level security;
alter table public.live_ritual_people enable row level security;
alter table public.live_ritual_messages enable row level security;

-- Reads only; every write goes through the functions below.
drop policy if exists "Those in a ritual together, or invited by its gathering, see it" on public.live_rituals;
create policy "Those in a ritual together, or invited by its gathering, see it" on public.live_rituals
  for select to authenticated using (public.live_ritual_can_see(id));

drop policy if exists "Those who may see a ritual together see who is in it" on public.live_ritual_people;
create policy "Those who may see a ritual together see who is in it" on public.live_ritual_people
  for select to authenticated using (
    user_id = auth.uid()
    or (public.live_ritual_can_see(live_id)
        and (exists (select 1 from public.live_rituals l where l.id = live_id and l.host_id = auth.uid())
             or not public.coven_blocked_between(auth.uid(), user_id)))
  );

drop policy if exists "Those in a ritual together read its chat" on public.live_ritual_messages;
create policy "Those in a ritual together read its chat" on public.live_ritual_messages
  for select to authenticated using (
    public.live_ritual_is_in(live_id) and (user_id = auth.uid() or not public.coven_blocked_between(auth.uid(), user_id))
  );

drop policy if exists "Those in a ritual together write in its chat" on public.live_ritual_messages;
create policy "Those in a ritual together write in its chat" on public.live_ritual_messages
  for insert to authenticated with check (
    user_id = auth.uid()
    and deleted_at is null and deleted_by is null
    and public.live_ritual_is_in(live_id)
    and not public.is_community_banned(auth.uid())
    and exists (select 1 from public.live_rituals l where l.id = live_id and l.status <> 'ended' and not l.quiet)
  );

-- A new invite code: eight letters and numbers that can't be misread.
create or replace function public.live_ritual_new_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  code text;
begin
  loop
    code := '';
    for i in 1..8 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.live_rituals where invite_code = code);
  end loop;
  return code;
end;
$$;

-- Start a ritual together. From a coven gathering: those who lead it (as for
-- starting it in the coven). Within a coven: its members in good standing.
-- Otherwise anyone with a community profile. Your rituals together left
-- untouched for half a day are ended first, and you may host three at once.
create or replace function public.start_live_ritual(
  p_title text,
  p_intention text,
  p_steps jsonb,
  p_source jsonb default '{}'::jsonb,
  p_coven uuid default null,
  p_gathering uuid default null
)
returns public.live_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  coven uuid := p_coven;
  steps jsonb;
  l public.live_rituals;
begin
  if not public.together_eligible(me) then
    raise exception 'Rituals together need your community profile (18+).';
  end if;
  if p_gathering is not null then
    select coven_id into coven from public.coven_rituals where id = p_gathering;
    if coven is null or not public.coven_ritual_open_to(p_gathering) or not public.coven_ritual_steers(p_gathering) then
      raise exception 'Only those who lead this gathering can begin it together.';
    end if;
  elsif coven is not null and not public.coven_in_good_standing(coven) then
    raise exception 'That coven isn''t open to you.';
  end if;
  if jsonb_typeof(p_steps) <> 'array' then raise exception 'A ritual together needs its steps.'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
      'title', left(btrim(s->>'title'), 120),
      'body', left(coalesce(s->>'body', ''), 4000),
      'spoken', left(coalesce(s->>'spoken', ''), 2000),
      'minutes', case when jsonb_typeof(s->'minutes') = 'number' and (s->>'minutes')::numeric > 0 then least((s->>'minutes')::numeric, 600) else null end
    ) order by ord), '[]'::jsonb)
    into steps
  from jsonb_array_elements(p_steps) with ordinality as e(s, ord)
  where jsonb_typeof(s) = 'object' and char_length(btrim(coalesce(s->>'title', ''))) > 0 and ord <= 60;
  if jsonb_array_length(steps) = 0 then raise exception 'A ritual together needs at least one step.'; end if;

  update public.live_rituals set status = 'ended', ended_at = now(), leader_id = null, version = version + 1, updated_at = now()
  where host_id = me and status <> 'ended' and updated_at < now() - interval '12 hours';
  if (select count(*) from public.live_rituals where host_id = me and status <> 'ended') >= 3 then
    raise exception 'You are already hosting three rituals together. End one first.';
  end if;

  insert into public.live_rituals (host_id, coven_id, coven_ritual_id, title, intention, steps, source, invite_code)
  values (me, coven, p_gathering, left(btrim(coalesce(p_title, '')), 120), nullif(left(btrim(coalesce(p_intention, '')), 500), ''),
          steps, case when jsonb_typeof(p_source) = 'object' then p_source else '{}'::jsonb end, public.live_ritual_new_code())
  returning * into l;
  insert into public.live_ritual_people (live_id, user_id, role) values (l.id, me, 'host');
  return l;
end;
$$;

-- What an invite code opens, before joining: its title, host and how many are in it.
create or replace function public.live_ritual_preview(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  l public.live_rituals;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select * into l from public.live_rituals where invite_code = upper(btrim(coalesce(p_code, '')));
  if l.id is null or l.status = 'ended' or l.updated_at < now() - interval '12 hours' then
    return jsonb_build_object('found', false);
  end if;
  if public.coven_blocked_between(auth.uid(), l.host_id) then return jsonb_build_object('found', false); end if;
  return jsonb_build_object(
    'found', true,
    'id', l.id,
    'title', l.title,
    'intention', l.intention,
    'status', l.status,
    'host_name', (select display_name from public.coven_profiles where user_id = l.host_id),
    'coven_name', (select name from public.covens where id = l.coven_id),
    'people', (select count(*) from public.live_ritual_people where live_id = l.id and left_at is null and removed_at is null)
  );
end;
$$;

-- Join (or come back to) a ritual together: by its code, or as someone its gathering is open to.
create or replace function public.join_live_ritual(p_live uuid default null, p_code text default null)
returns public.live_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  l public.live_rituals;
  by_code boolean := false;
begin
  if not public.together_eligible(me) then
    raise exception 'Rituals together need your community profile (18+).';
  end if;
  if p_code is not null and btrim(p_code) <> '' then
    select * into l from public.live_rituals where invite_code = upper(btrim(p_code));
    by_code := l.id is not null and (p_live is null or l.id = p_live);
  else
    select * into l from public.live_rituals where id = p_live;
  end if;
  if l.id is null then raise exception 'That ritual together was not found.'; end if;
  if exists (select 1 from public.live_ritual_people where live_id = l.id and user_id = me and removed_at is not null) then
    raise exception 'The host has asked you to leave this ritual.';
  end if;
  if not by_code and not public.live_ritual_can_see(l.id) then raise exception 'That ritual together was not found.'; end if;
  if public.coven_blocked_between(me, l.host_id) then raise exception 'That ritual together was not found.'; end if;
  if l.status = 'ended' or l.updated_at < now() - interval '12 hours' then raise exception 'The ritual has ended.'; end if;
  if not exists (select 1 from public.live_ritual_people where live_id = l.id and user_id = me)
     and (select count(*) from public.live_ritual_people where live_id = l.id and left_at is null and removed_at is null) >= 60 then
    raise exception 'This ritual together is full.';
  end if;
  insert into public.live_ritual_people (live_id, user_id, role)
  values (l.id, me, case when l.host_id = me then 'host' else 'guest' end)
  on conflict (live_id, user_id) do update set left_at = null, last_seen_at = now();
  return l;
end;
$$;

-- The leader's (and host's) changes: the same rules as lib/together/live.ts reduceLive.
-- p_version is the version the page acted on; a stale one is refused, so it looks again.
create or replace function public.live_ritual_act(p_live uuid, p_action text, p_version integer, p_step integer default null, p_to uuid default null, p_on boolean default null)
returns public.live_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  l public.live_rituals;
  leads boolean;
  hosts boolean;
  steps_count integer;
begin
  select * into l from public.live_rituals where id = p_live for update;
  if l.id is null or not public.live_ritual_is_in(p_live) then raise exception 'That ritual together was not found.'; end if;
  if l.status = 'ended' then raise exception 'The ritual has ended.'; end if;
  if p_version is not null and p_version <> l.version then raise exception 'The ritual has moved on. Looking again.'; end if;
  leads := me = coalesce(l.leader_id, l.host_id);
  hosts := me = l.host_id;
  steps_count := jsonb_array_length(l.steps);

  case p_action
    when 'begin' then
      if not (leads or hosts) then raise exception 'Only the one leading can do that.'; end if;
      if l.status <> 'gathering' then raise exception 'The ritual has already begun.'; end if;
      l.status := 'live'; l.current_step := 0; l.started_at := coalesce(l.started_at, now());
    when 'next' then
      if not leads then raise exception 'Only the one leading can do that.'; end if;
      if l.status <> 'live' then raise exception 'The ritual hasn’t begun yet.'; end if;
      if l.current_step >= steps_count - 1 then l.status := 'closing'; else l.current_step := l.current_step + 1; end if;
    when 'back' then
      if not leads then raise exception 'Only the one leading can do that.'; end if;
      if l.status = 'closing' then
        l.status := 'live'; l.current_step := greatest(0, steps_count - 1);
      elsif l.status <> 'live' then raise exception 'The ritual hasn’t begun yet.';
      elsif l.current_step <= 0 then raise exception 'This is the first step.';
      else l.current_step := l.current_step - 1;
      end if;
    when 'go' then
      if not leads then raise exception 'Only the one leading can do that.'; end if;
      if l.status not in ('live', 'closing') then raise exception 'The ritual hasn’t begun yet.'; end if;
      if p_step is null or p_step < 0 or p_step >= steps_count then raise exception 'There is no such step.'; end if;
      l.status := 'live'; l.current_step := p_step;
    when 'pass' then
      if not (leads or hosts) then raise exception 'Only the one leading can do that.'; end if;
      if p_to is distinct from l.host_id and not exists (
        select 1 from public.live_ritual_people where live_id = p_live and user_id = p_to and left_at is null and removed_at is null
      ) then raise exception 'They aren’t in the ritual.'; end if;
      l.leader_id := case when p_to = l.host_id then null else p_to end;
    when 'light' then
      if not (leads or hosts) then raise exception 'Only the one leading can do that.'; end if;
      if l.candle_lit_at is not null then return l; end if;
      l.candle_lit_at := now(); l.candle_lit_by := me;
    when 'quiet' then
      if not hosts then raise exception 'Only the host can do that.'; end if;
      if l.quiet = coalesce(p_on, false) then return l; end if;
      l.quiet := coalesce(p_on, false);
    when 'close' then
      if not (leads or hosts) then raise exception 'Only the one leading can do that.'; end if;
      if l.status = 'closing' then return l; end if;
      l.status := 'closing'; l.started_at := coalesce(l.started_at, now());
    when 'end' then
      if not hosts then raise exception 'Only the host can do that.'; end if;
      l.status := 'ended'; l.ended_at := now(); l.leader_id := null;
    else
      raise exception 'Unknown action.';
  end case;

  update public.live_rituals set
    status = l.status, current_step = l.current_step, leader_id = l.leader_id, candle_lit_at = l.candle_lit_at,
    candle_lit_by = l.candle_lit_by, quiet = l.quiet, started_at = l.started_at, ended_at = l.ended_at,
    version = version + 1, updated_at = now()
  where id = p_live
  returning * into l;
  return l;
end;
$$;

-- Still here (the page checks in every so often, for "who's here").
create or replace function public.live_ritual_here(p_live uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.live_ritual_people set last_seen_at = now()
  where live_id = p_live and user_id = auth.uid() and removed_at is null and left_at is null;
$$;

-- Leave (you can come back while it lasts). If you led, the lead returns to the host.
-- The host doesn't leave: they end the ritual.
create or replace function public.live_ritual_leave(p_live uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.live_rituals where id = p_live and host_id = auth.uid()) then
    raise exception 'As host, end the ritual instead.';
  end if;
  update public.live_ritual_people set left_at = now() where live_id = p_live and user_id = auth.uid() and left_at is null;
  update public.live_rituals set leader_id = null, version = version + 1, updated_at = now() where id = p_live and leader_id = auth.uid();
end;
$$;

-- The host asks someone to leave; they can't come back to this ritual.
create or replace function public.live_ritual_remove(p_live uuid, p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.live_rituals where id = p_live and host_id = auth.uid()) then
    raise exception 'Only the host can do that.';
  end if;
  if p_user = auth.uid() then raise exception 'As host, end the ritual instead.'; end if;
  update public.live_ritual_people set removed_at = now(), removed_by = auth.uid() where live_id = p_live and user_id = p_user and removed_at is null;
  update public.live_rituals set leader_id = null, version = version + 1, updated_at = now() where id = p_live and leader_id = p_user;
end;
$$;

-- Your own part: "it is done" in the shared ending, and quiet mode (no chat shown to you).
create or replace function public.live_ritual_mine(p_live uuid, p_done boolean default null, p_quiet boolean default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.live_ritual_is_in(p_live) then raise exception 'That ritual together was not found.'; end if;
  update public.live_ritual_people set
    done_at = case when p_done is null then done_at when p_done then coalesce(done_at, now()) else null end,
    quiet = coalesce(p_quiet, quiet),
    last_seen_at = now()
  where live_id = p_live and user_id = auth.uid();
  -- Touch the ritual so everyone's page sees the ending fill.
  update public.live_rituals set updated_at = now() where id = p_live and p_done is not null;
end;
$$;

-- Take a message down: its writer, or the host.
create or replace function public.live_ritual_hide_message(p_message uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.live_ritual_messages m set deleted_at = now(), deleted_by = auth.uid()
  where m.id = p_message and m.deleted_at is null
    and (m.user_id = auth.uid() or exists (select 1 from public.live_rituals l where l.id = m.live_id and l.host_id = auth.uid()));
  if not found then raise exception 'That message was not found.'; end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Mentorship
-- ---------------------------------------------------------------------------

create table if not exists public.mentor_listings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  offers boolean not null default false,
  seeks boolean not null default false,
  traditions text[] not null default '{}' check (cardinality(traditions) <= 12),
  topics text[] not null default '{}' check (cardinality(topics) <= 16),
  about text check (about is null or char_length(about) <= 600),
  -- Shown in the open directory (anyone eligible), and to fellow coven members.
  in_directory boolean not null default false,
  in_covens boolean not null default true,
  -- Confirmed by the person themselves when they set it up; required.
  adult_confirmed_at timestamptz not null,
  boundaries_agreed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mentorships (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid references public.covens (id) on delete set null,
  mentor_id uuid not null references auth.users (id) on delete cascade,
  mentee_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'proposed' check (status in ('proposed', 'active', 'declined', 'ended')),
  proposed_by uuid references auth.users (id) on delete set null,
  -- A coven leader who suggested the pairing (it still needs both to say yes).
  paired_by uuid references auth.users (id) on delete set null,
  note text check (note is null or char_length(note) <= 600),
  mentor_ok_at timestamptz,
  mentee_ok_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  ended_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (mentor_id <> mentee_id)
);

create unique index if not exists mentorships_one_open on public.mentorships (least(mentor_id, mentee_id), greatest(mentor_id, mentee_id)) where status in ('proposed', 'active');
create index if not exists mentorships_mentor_idx on public.mentorships (mentor_id, status);
create index if not exists mentorships_mentee_idx on public.mentorships (mentee_id, status);
create index if not exists mentorships_coven_idx on public.mentorships (coven_id, status) where coven_id is not null;

create table if not exists public.mentorship_messages (
  id uuid primary key default gen_random_uuid(),
  mentorship_id uuid not null references public.mentorships (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists mentorship_messages_idx on public.mentorship_messages (mentorship_id, created_at);

create table if not exists public.mentorship_items (
  id uuid primary key default gen_random_uuid(),
  mentorship_id uuid not null references public.mentorships (id) on delete cascade,
  kind text not null check (kind in ('goal', 'reading')),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  detail text check (detail is null or char_length(detail) <= 1000),
  -- A link into the Sanctuary ({kind, id, label}: lib/covens/courseLinks.ts).
  link jsonb check (link is null or (jsonb_typeof(link) = 'object' and octet_length(link::text) <= 1000)),
  done_at timestamptz,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mentorship_items_idx on public.mentorship_items (mentorship_id, kind);

create table if not exists public.mentorship_checkins (
  id uuid primary key default gen_random_uuid(),
  mentorship_id uuid not null references public.mentorships (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists mentorship_checkins_idx on public.mentorship_checkins (mentorship_id, created_at desc);

-- A community profile, not banned, and a mentorship profile with both confirmations.
create or replace function public.mentorship_eligible(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.together_eligible(p_user)
    and exists (select 1 from public.mentor_listings where user_id = p_user and adult_confirmed_at is not null and boundaries_agreed_at is not null);
$$;

-- Whether two people share a coven they're both active in.
create or replace function public.share_a_coven(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coven_members a
    join public.coven_members b on b.coven_id = a.coven_id and b.user_id = p_b and b.status = 'active'
    join public.covens c on c.id = a.coven_id and c.status = 'active'
    where a.user_id = p_a and a.status = 'active'
  );
$$;

-- Whether you're one of the pair (and, with p_active, it is under way).
create or replace function public.mentorship_party(p_mentorship uuid, p_active boolean default false)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.mentorships
    where id = p_mentorship and auth.uid() in (mentor_id, mentee_id) and (not p_active or status = 'active')
  );
$$;

alter table public.mentor_listings enable row level security;
alter table public.mentorships enable row level security;
alter table public.mentorship_messages enable row level security;
alter table public.mentorship_items enable row level security;
alter table public.mentorship_checkins enable row level security;

-- Your own listing always; others' only when you are eligible yourself, they
-- are, there's no block either way, and they chose the open directory or share a coven with you.
drop policy if exists "Eligible adults see listings shown to them" on public.mentor_listings;
create policy "Eligible adults see listings shown to them" on public.mentor_listings
  for select to authenticated using (
    user_id = auth.uid()
    or (public.mentorship_eligible(auth.uid())
        and public.mentorship_eligible(user_id)
        and (offers or seeks)
        and not public.coven_blocked_between(auth.uid(), user_id)
        and (in_directory or (in_covens and public.share_a_coven(auth.uid(), user_id))))
  );
drop policy if exists "People make their own listing" on public.mentor_listings;
create policy "People make their own listing" on public.mentor_listings
  for insert to authenticated with check (user_id = auth.uid() and public.together_eligible(auth.uid()));
drop policy if exists "People change their own listing" on public.mentor_listings;
create policy "People change their own listing" on public.mentor_listings
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.together_eligible(auth.uid()));
drop policy if exists "People remove their own listing" on public.mentor_listings;
create policy "People remove their own listing" on public.mentor_listings
  for delete to authenticated using (user_id = auth.uid());

-- Pairings: the two people only. Made and changed through the functions below.
drop policy if exists "The two people see their mentorship" on public.mentorships;
create policy "The two people see their mentorship" on public.mentorships
  for select to authenticated using (auth.uid() in (mentor_id, mentee_id));

drop policy if exists "The pair read their conversation" on public.mentorship_messages;
create policy "The pair read their conversation" on public.mentorship_messages
  for select to authenticated using (
    public.mentorship_party(mentorship_id) and (user_id = auth.uid() or not public.coven_blocked_between(auth.uid(), user_id))
  );
drop policy if exists "The pair write while it is under way" on public.mentorship_messages;
create policy "The pair write while it is under way" on public.mentorship_messages
  for insert to authenticated with check (
    user_id = auth.uid() and public.mentorship_party(mentorship_id, true) and not public.is_community_banned(auth.uid())
  );

drop policy if exists "The pair see their goals and reading" on public.mentorship_items;
create policy "The pair see their goals and reading" on public.mentorship_items
  for select to authenticated using (public.mentorship_party(mentorship_id));
drop policy if exists "The pair add goals and reading" on public.mentorship_items;
create policy "The pair add goals and reading" on public.mentorship_items
  for insert to authenticated with check (created_by = auth.uid() and public.mentorship_party(mentorship_id, true));
drop policy if exists "The pair tend goals and reading" on public.mentorship_items;
create policy "The pair tend goals and reading" on public.mentorship_items
  for update to authenticated using (public.mentorship_party(mentorship_id, true)) with check (public.mentorship_party(mentorship_id, true));
drop policy if exists "The pair remove goals and reading" on public.mentorship_items;
create policy "The pair remove goals and reading" on public.mentorship_items
  for delete to authenticated using (public.mentorship_party(mentorship_id, true));

drop policy if exists "The pair see their check-ins" on public.mentorship_checkins;
create policy "The pair see their check-ins" on public.mentorship_checkins
  for select to authenticated using (public.mentorship_party(mentorship_id));
drop policy if exists "The pair check in while it is under way" on public.mentorship_checkins;
create policy "The pair check in while it is under way" on public.mentorship_checkins
  for insert to authenticated with check (user_id = auth.uid() and public.mentorship_party(mentorship_id, true));

-- An item stays with its pairing and its maker.
create or replace function public.guard_mentorship_item()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    new.mentorship_id := old.mentorship_id;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  else
    new.created_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists mentorship_items_guard on public.mentorship_items;
create trigger mentorship_items_guard before insert or update on public.mentorship_items
  for each row execute function public.guard_mentorship_item();

-- A listing's confirmations are stamped by the database, and kept once given.
create or replace function public.guard_mentor_listing()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.adult_confirmed_at := now();
    new.boundaries_agreed_at := now();
    new.created_at := now();
  else
    new.user_id := old.user_id;
    new.adult_confirmed_at := old.adult_confirmed_at;
    new.boundaries_agreed_at := old.boundaries_agreed_at;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists mentor_listings_guard on public.mentor_listings;
create trigger mentor_listings_guard before insert or update on public.mentor_listings
  for each row execute function public.guard_mentor_listing();

-- Ask someone: to mentor you (p_as 'mentee', when they offer) or to be
-- mentored by you (p_as 'mentor', when they're looking). They must be shown
-- to you (the directory, or a coven you share); within a coven, both its
-- members. Five asks a day at most.
create or replace function public.ask_mentorship(p_other uuid, p_as text, p_coven uuid default null, p_note text default null)
returns public.mentorships
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  l public.mentor_listings;
  m public.mentorships;
begin
  if p_as not in ('mentor', 'mentee') then raise exception 'Choose whether you would mentor or be mentored.'; end if;
  if not public.mentorship_eligible(me) then raise exception 'Set up your mentorship profile first (adults only).'; end if;
  if p_other = me then raise exception 'Choose someone else.'; end if;
  select * into l from public.mentor_listings where user_id = p_other;
  if l.user_id is null or not public.mentorship_eligible(p_other) or public.coven_blocked_between(me, p_other)
     or not (l.in_directory or (l.in_covens and public.share_a_coven(me, p_other))) then
    raise exception 'That person isn''t available for mentorship.';
  end if;
  if (p_as = 'mentee' and not l.offers) or (p_as = 'mentor' and not l.seeks) then
    raise exception 'That person isn''t available for mentorship.';
  end if;
  if p_coven is not null and not (
    exists (select 1 from public.coven_members where coven_id = p_coven and user_id = me and status = 'active')
    and exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_other and status = 'active')
  ) then raise exception 'Both need to be members of the coven.'; end if;
  if (select count(*) from public.mentorships where proposed_by = me and created_at > now() - interval '1 day') >= 5 then
    raise exception 'You have asked five people today. Please wait for their answers.';
  end if;
  insert into public.mentorships (coven_id, mentor_id, mentee_id, proposed_by, note, mentor_ok_at, mentee_ok_at)
  values (p_coven,
          case when p_as = 'mentor' then me else p_other end,
          case when p_as = 'mentor' then p_other else me end,
          me, nullif(left(btrim(coalesce(p_note, '')), 600), ''),
          case when p_as = 'mentor' then now() end,
          case when p_as = 'mentee' then now() end)
  returning * into m;
  return m;
exception when unique_violation then
  raise exception 'You already have a pairing open with each other.';
end;
$$;

-- A coven's leaders (those who run its programs) suggest a pairing of two
-- members. It begins only when both say yes; a leader who is one of the pair has said yes already.
create or replace function public.pair_mentorship(p_coven uuid, p_mentor uuid, p_mentee uuid, p_note text default null)
returns public.mentorships
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  m public.mentorships;
begin
  if not (public.coven_permission(p_coven, 'programs') and public.coven_in_good_standing(p_coven)) then
    raise exception 'Only the coven''s leaders can pair members.';
  end if;
  if p_mentor = p_mentee then raise exception 'Choose two different people.'; end if;
  if not (exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_mentor and status = 'active')
          and exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_mentee and status = 'active')) then
    raise exception 'Both need to be members of the coven.';
  end if;
  if not (public.mentorship_eligible(p_mentor) and public.mentorship_eligible(p_mentee)) then
    raise exception 'Both people need a mentorship profile (adults only) first.';
  end if;
  if public.coven_blocked_between(p_mentor, p_mentee) then raise exception 'That pairing isn''t possible.'; end if;
  insert into public.mentorships (coven_id, mentor_id, mentee_id, proposed_by, paired_by, note, mentor_ok_at, mentee_ok_at)
  values (p_coven, p_mentor, p_mentee, me, me, nullif(left(btrim(coalesce(p_note, '')), 600), ''),
          case when p_mentor = me then now() end, case when p_mentee = me then now() end)
  returning * into m;
  return m;
exception when unique_violation then
  raise exception 'They already have a pairing open with each other.';
end;
$$;

-- Say yes (it begins once both have) or no.
create or replace function public.answer_mentorship(p_mentorship uuid, p_yes boolean)
returns public.mentorships
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  m public.mentorships;
  ready boolean;
begin
  select * into m from public.mentorships where id = p_mentorship for update;
  if m.id is null or me not in (m.mentor_id, m.mentee_id) then raise exception 'That mentorship was not found.'; end if;
  if m.status <> 'proposed' then raise exception 'That has already been answered.'; end if;
  if not p_yes then
    update public.mentorships set status = 'declined', ended_at = now(), ended_by = me, updated_at = now() where id = m.id returning * into m;
    return m;
  end if;
  if not public.mentorship_eligible(me) then raise exception 'Set up your mentorship profile first (adults only).'; end if;
  if public.coven_blocked_between(m.mentor_id, m.mentee_id) then raise exception 'That pairing isn''t possible.'; end if;
  if me = m.mentor_id then m.mentor_ok_at := coalesce(m.mentor_ok_at, now()); else m.mentee_ok_at := coalesce(m.mentee_ok_at, now()); end if;
  ready := m.mentor_ok_at is not null and m.mentee_ok_at is not null
          and public.mentorship_eligible(m.mentor_id) and public.mentorship_eligible(m.mentee_id);
  update public.mentorships set
    mentor_ok_at = m.mentor_ok_at, mentee_ok_at = m.mentee_ok_at,
    status = case when ready then 'active' else 'proposed' end,
    started_at = case when ready then now() end,
    updated_at = now()
  where id = m.id returning * into m;
  return m;
end;
$$;

-- Either of the pair ends it (or withdraws an ask), whenever they like.
create or replace function public.end_mentorship(p_mentorship uuid)
returns public.mentorships
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.mentorships;
begin
  update public.mentorships set status = 'ended', ended_at = now(), ended_by = auth.uid(), updated_at = now()
  where id = p_mentorship and auth.uid() in (mentor_id, mentee_id) and status in ('proposed', 'active')
  returning * into m;
  if m.id is null then raise exception 'That mentorship was not found.'; end if;
  return m;
end;
$$;

-- What a coven's leaders see: that a pairing exists (who, and since when), never its words.
create or replace function public.coven_mentorship_pairs(p_coven uuid)
returns table (id uuid, mentor_id uuid, mentee_id uuid, status text, started_at timestamptz, created_at timestamptz, paired_by uuid)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (public.coven_permission(p_coven, 'programs') or public.coven_permission(p_coven, 'progress')) then
    raise exception 'Only the coven''s leaders can see its mentorships.';
  end if;
  return query
    select m.id, m.mentor_id, m.mentee_id, m.status, m.started_at, m.created_at, m.paired_by
    from public.mentorships m
    where m.coven_id = p_coven and m.status in ('proposed', 'active')
    order by m.created_at desc;
end;
$$;

-- Blocking someone ends any mentorship between you.
create or replace function public.end_mentorships_on_block()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.mentorships set status = 'ended', ended_at = now(), ended_by = new.blocker_id, updated_at = now()
  where status in ('proposed', 'active')
    and ((mentor_id = new.blocker_id and mentee_id = new.blocked_id) or (mentor_id = new.blocked_id and mentee_id = new.blocker_id));
  return new;
end;
$$;

drop trigger if exists user_blocks_end_mentorships on public.user_blocks;
create trigger user_blocks_end_mentorships after insert on public.user_blocks
  for each row execute function public.end_mentorships_on_block();

-- ---------------------------------------------------------------------------
-- Reports, and the phone notes' bookkeeping
-- ---------------------------------------------------------------------------

alter table public.coven_reports drop constraint if exists coven_reports_target_type_check;
alter table public.coven_reports add constraint coven_reports_target_type_check
  check (target_type in ('coven', 'message', 'member', 'application', 'altar_item', 'document', 'ritual', 'book_page', 'petition', 'book_submission', 'meeting_message',
                         'live_ritual', 'live_message', 'mentorship', 'mentorship_message'));

-- Keep a copy of what was reported (after coven_reports_fill, by name), and
-- only from someone who could read it, so a report can't be used to read
-- what isn't yours.
create or replace function public.fill_together_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.target_type = 'live_message' then
    select null::uuid, m.user_id, left(m.body, 4000) into new.coven_id, new.target_user_id, new.snapshot
    from public.live_ritual_messages m where m.id = new.target_id and public.live_ritual_is_in(m.live_id);
    if not found then raise exception 'That message was not found.'; end if;
  elsif new.target_type = 'live_ritual' then
    select l.coven_id, coalesce(new.target_user_id, l.host_id), left(l.title, 4000) into new.coven_id, new.target_user_id, new.snapshot
    from public.live_rituals l where l.id = new.target_id and public.live_ritual_can_see(l.id);
    if not found then raise exception 'That ritual together was not found.'; end if;
  elsif new.target_type = 'mentorship_message' then
    select null::uuid, m.user_id, left(m.body, 4000) into new.coven_id, new.target_user_id, new.snapshot
    from public.mentorship_messages m where m.id = new.target_id and public.mentorship_party(m.mentorship_id);
    if not found then raise exception 'That message was not found.'; end if;
  elsif new.target_type = 'mentorship' then
    select null::uuid, case when m.mentor_id = auth.uid() then m.mentee_id else m.mentor_id end, left(coalesce(m.note, ''), 4000)
      into new.coven_id, new.target_user_id, new.snapshot
    from public.mentorships m where m.id = new.target_id and public.mentorship_party(m.id);
    if not found then raise exception 'That mentorship was not found.'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists coven_reports_together on public.coven_reports;
create trigger coven_reports_together before insert on public.coven_reports
  for each row execute function public.fill_together_report();

create table if not exists public.together_notices (
  kind text not null check (kind in ('live', 'mentorship', 'mentorship_message', 'mentorship_checkin')),
  ref uuid not null,
  event text not null check (char_length(event) <= 40),
  created_at timestamptz not null default now(),
  primary key (kind, ref, event)
);
alter table public.together_notices enable row level security;

-- ---------------------------------------------------------------------------
-- Grants and Realtime
-- ---------------------------------------------------------------------------

revoke all on function public.live_ritual_new_code() from public, anon, authenticated;
grant execute on function public.start_live_ritual(text, text, jsonb, jsonb, uuid, uuid) to authenticated;
grant execute on function public.live_ritual_preview(text) to authenticated;
grant execute on function public.join_live_ritual(uuid, text) to authenticated;
grant execute on function public.live_ritual_act(uuid, text, integer, integer, uuid, boolean) to authenticated;
grant execute on function public.live_ritual_here(uuid) to authenticated;
grant execute on function public.live_ritual_leave(uuid) to authenticated;
grant execute on function public.live_ritual_remove(uuid, uuid) to authenticated;
grant execute on function public.live_ritual_mine(uuid, boolean, boolean) to authenticated;
grant execute on function public.live_ritual_hide_message(uuid) to authenticated;
grant execute on function public.ask_mentorship(uuid, text, uuid, text) to authenticated;
grant execute on function public.pair_mentorship(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.answer_mentorship(uuid, boolean) to authenticated;
grant execute on function public.end_mentorship(uuid) to authenticated;
grant execute on function public.coven_mentorship_pairs(uuid) to authenticated;
revoke execute on function public.start_live_ritual(text, text, jsonb, jsonb, uuid, uuid) from anon;
revoke execute on function public.live_ritual_preview(text) from anon;
revoke execute on function public.join_live_ritual(uuid, text) from anon;
revoke execute on function public.live_ritual_act(uuid, text, integer, integer, uuid, boolean) from anon;
revoke execute on function public.ask_mentorship(uuid, text, uuid, text) from anon;
revoke execute on function public.pair_mentorship(uuid, uuid, uuid, text) from anon;
revoke execute on function public.answer_mentorship(uuid, boolean) from anon;
revoke execute on function public.end_mentorship(uuid) from anon;
revoke execute on function public.coven_mentorship_pairs(uuid) from anon;

do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['live_rituals', 'live_ritual_people', 'live_ritual_messages', 'mentorship_messages', 'mentorships'] loop
      if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = t) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end;
$$;
