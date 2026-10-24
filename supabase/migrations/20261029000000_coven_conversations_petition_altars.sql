-- Coven conversations, phone notifications for messages, and petition altars.
--
-- Conversations: besides the whole coven's chat (coven_messages with no
-- conversation_id), members can talk one to one ('direct') or in a small
-- named group ('group'). Only those in a conversation read it; site
-- moderators see what's reported (coven_reports.snapshot), not private talk.
-- Starting or writing in any conversation needs the chat power
-- (coven_permission 'chat'), and no one can open a conversation with someone
-- who has blocked them, or whom they've blocked.
--
-- Phone notifications: each device signs up with its Expo push token
-- (register_push_token); coven_chat_settings says, per coven, whether you
-- want notifications for the coven chat and for your conversations, and a
-- conversation can be muted. The coven-notify edge function sends them.
--
-- Petitions: each petition now has its own coven altar (coven_petitions.altar_id),
-- kept by whoever asked and tended by the whole coven, instead of a candle on
-- the shared altar. Answering or closing a petition clears its altar away.

-- ---------------------------------------------------------------------------
-- Conversations
-- ---------------------------------------------------------------------------

create table if not exists public.coven_conversations (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  kind text not null check (kind in ('direct', 'group')),
  name text check (name is null or char_length(btrim(name)) between 1 and 80),
  -- A one-to-one conversation is the only one for its two people: "<lower id>:<higher id>".
  direct_key text unique,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz
);

create index if not exists coven_conversations_coven_idx on public.coven_conversations (coven_id, last_message_at desc nulls last);

create table if not exists public.coven_conversation_members (
  conversation_id uuid not null references public.coven_conversations (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  muted boolean not null default false,
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create index if not exists coven_conversation_members_user_idx on public.coven_conversation_members (user_id, coven_id);

alter table public.coven_messages add column if not exists conversation_id uuid references public.coven_conversations (id) on delete cascade;
create index if not exists coven_messages_conversation_idx on public.coven_messages (conversation_id, created_at desc);

-- Whether you're in a conversation (and still in its coven).
create or replace function public.coven_in_conversation(p_conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.coven_conversation_members cm
    join public.coven_members m on m.coven_id = cm.coven_id and m.user_id = cm.user_id and m.status = 'active'
    where cm.conversation_id = p_conversation and cm.user_id = auth.uid() and cm.left_at is null
  );
$$;

-- Whether two people have blocked each other, either way round.
create or replace function public.coven_blocked_between(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_blocks
    where (blocker_id = p_a and blocked_id = p_b) or (blocker_id = p_b and blocked_id = p_a)
  );
$$;

alter table public.coven_conversations enable row level security;
alter table public.coven_conversation_members enable row level security;

drop policy if exists "People see their conversations" on public.coven_conversations;
create policy "People see their conversations" on public.coven_conversations
  for select to authenticated using (public.coven_in_conversation(id));
drop policy if exists "People see who is in their conversations" on public.coven_conversation_members;
create policy "People see who is in their conversations" on public.coven_conversation_members
  for select to authenticated using (public.coven_in_conversation(conversation_id));

-- The whole coven's chat for its members; a conversation for those in it.
alter policy "Members and moderators read coven chat" on public.coven_messages
  using (
    (conversation_id is null and (public.is_coven_member(coven_id) or public.is_community_moderator()))
    or (conversation_id is not null and public.coven_in_conversation(conversation_id))
  );
alter policy "Members in good standing send messages" on public.coven_messages
  with check (
    user_id = auth.uid() and public.coven_in_good_standing(coven_id) and public.coven_permission(coven_id, 'chat')
    and (conversation_id is null or public.coven_in_conversation(conversation_id))
  );

-- A conversation's messages stay in its coven, and it knows when it last spoke.
create or replace function public.coven_message_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.conversation_id is not null then
    if not exists (select 1 from public.coven_conversations where id = new.conversation_id and coven_id = new.coven_id) then
      raise exception 'That conversation isn''t in this coven.';
    end if;
    update public.coven_conversations set last_message_at = new.created_at where id = new.conversation_id;
    update public.coven_conversation_members set last_read_at = new.created_at
    where conversation_id = new.conversation_id and user_id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists coven_messages_conversation on public.coven_messages;
create trigger coven_messages_conversation after insert on public.coven_messages
  for each row execute function public.coven_message_conversation();

-- One to one: the existing conversation with that person, or a new one.
create or replace function public.coven_open_direct(p_coven uuid, p_user uuid)
returns public.coven_conversations
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  key text;
  c public.coven_conversations;
begin
  if me is null or p_user is null or p_user = me then raise exception 'Choose someone to talk to.'; end if;
  if not (public.coven_in_good_standing(p_coven) and public.coven_permission(p_coven, 'chat')) then
    raise exception 'Your position in this coven doesn''t talk in the chat.';
  end if;
  if not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_user and status = 'active') then
    raise exception 'That person isn''t a member of this coven.';
  end if;
  if public.coven_blocked_between(me, p_user) then raise exception 'You can''t message this person.'; end if;
  key := p_coven::text || ':' || least(me::text, p_user::text) || ':' || greatest(me::text, p_user::text);
  select * into c from public.coven_conversations where direct_key = key;
  if c.id is null then
    insert into public.coven_conversations (coven_id, kind, direct_key, created_by) values (p_coven, 'direct', key, me)
    on conflict (direct_key) do nothing
    returning * into c;
    if c.id is null then select * into c from public.coven_conversations where direct_key = key; end if;
  end if;
  insert into public.coven_conversation_members (conversation_id, coven_id, user_id) values (c.id, p_coven, me), (c.id, p_coven, p_user)
  on conflict (conversation_id, user_id) do update set left_at = null;
  return c;
end;
$$;

-- A small group: you and the people you choose (up to 30), with a name.
create or replace function public.coven_create_group(p_coven uuid, p_name text, p_users uuid[])
returns public.coven_conversations
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  c public.coven_conversations;
  person uuid;
begin
  if not (public.coven_in_good_standing(p_coven) and public.coven_permission(p_coven, 'chat')) then
    raise exception 'Your position in this coven doesn''t talk in the chat.';
  end if;
  if coalesce(array_length(p_users, 1), 0) < 1 then raise exception 'Choose who is in the group.'; end if;
  if array_length(p_users, 1) > 30 then raise exception 'A group can have up to 30 people.'; end if;
  insert into public.coven_conversations (coven_id, kind, name, created_by)
  values (p_coven, 'group', left(btrim(coalesce(nullif(btrim(p_name), ''), 'A small circle')), 80), me)
  returning * into c;
  insert into public.coven_conversation_members (conversation_id, coven_id, user_id) values (c.id, p_coven, me);
  foreach person in array p_users loop
    if person <> me and exists (select 1 from public.coven_members where coven_id = p_coven and user_id = person and status = 'active')
       and not public.coven_blocked_between(me, person) then
      insert into public.coven_conversation_members (conversation_id, coven_id, user_id) values (c.id, p_coven, person)
      on conflict do nothing;
    end if;
  end loop;
  return c;
end;
$$;

-- Anyone in a group can bring others in (members of the coven, up to 30 in all).
create or replace function public.coven_add_to_group(p_conversation uuid, p_users uuid[])
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.coven_conversations;
  person uuid;
  n integer := 0;
begin
  select * into c from public.coven_conversations where id = p_conversation;
  if c.id is null or c.kind <> 'group' or not public.coven_in_conversation(c.id) then raise exception 'That group wasn''t found.'; end if;
  if not public.coven_permission(c.coven_id, 'chat') then raise exception 'Your position in this coven doesn''t talk in the chat.'; end if;
  foreach person in array coalesce(p_users, '{}') loop
    if (select count(*) from public.coven_conversation_members where conversation_id = c.id and left_at is null) >= 30 then exit; end if;
    if exists (select 1 from public.coven_members where coven_id = c.coven_id and user_id = person and status = 'active')
       and not public.coven_blocked_between(auth.uid(), person) then
      insert into public.coven_conversation_members (conversation_id, coven_id, user_id) values (c.id, c.coven_id, person)
      on conflict (conversation_id, user_id) do update set left_at = null;
      n := n + 1;
    end if;
  end loop;
  return n;
end;
$$;

-- Leave a conversation, mute it, or mark it read.
create or replace function public.coven_leave_conversation(p_conversation uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  update public.coven_conversation_members set left_at = now()
  where conversation_id = p_conversation and user_id = auth.uid() and left_at is null
  returning true;
$$;

create or replace function public.coven_set_conversation(p_conversation uuid, p_muted boolean, p_read boolean)
returns boolean
language sql
security definer
set search_path = public
as $$
  update public.coven_conversation_members
  set muted = coalesce(p_muted, muted), last_read_at = case when p_read then now() else last_read_at end
  where conversation_id = p_conversation and user_id = auth.uid()
  returning true;
$$;

-- ---------------------------------------------------------------------------
-- Phone notifications
-- ---------------------------------------------------------------------------

-- A device's Expo push token, signed up to whoever is signed in on it now.
create table if not exists public.push_tokens (
  token text primary key check (token ~ '^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$'),
  user_id uuid references auth.users (id) on delete cascade,
  platform text check (platform is null or platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);

create index if not exists push_tokens_user_idx on public.push_tokens (user_id);
alter table public.push_tokens enable row level security;
drop policy if exists "People see their own devices" on public.push_tokens;
create policy "People see their own devices" on public.push_tokens
  for select to authenticated using (user_id = auth.uid());

create or replace function public.register_push_token(p_token text, p_platform text)
returns boolean
language sql
security definer
set search_path = public
as $$
  insert into public.push_tokens (token, user_id, platform, updated_at) values (p_token, auth.uid(), p_platform, now())
  on conflict (token) do update set user_id = auth.uid(), platform = excluded.platform, updated_at = now()
  returning true;
$$;

-- This device stops getting notifications for you (signing out, or turning them all off).
create or replace function public.unregister_push_token(p_token text)
returns boolean
language sql
security definer
set search_path = public
as $$
  update public.push_tokens set user_id = null, updated_at = now() where token = p_token and user_id = auth.uid()
  returning true;
$$;

-- Per coven: notifications for the coven chat, and for your conversations.
create table if not exists public.coven_chat_settings (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  notify_coven boolean not null default true,
  notify_direct boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, coven_id)
);

alter table public.coven_chat_settings enable row level security;
drop policy if exists "People keep their own chat settings" on public.coven_chat_settings;
create policy "People keep their own chat settings" on public.coven_chat_settings
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_coven_member(coven_id));

-- ---------------------------------------------------------------------------
-- Petition altars
-- ---------------------------------------------------------------------------

alter table public.coven_petitions add column if not exists altar_id uuid references public.coven_altars (id) on delete set null;

-- Cleared-away altars don't count towards a coven's forty.
create or replace function public.create_coven_altar(p_coven uuid, p_name text, p_edit_mode text default 'members')
returns public.coven_altars
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_altars;
begin
  if not public.coven_in_good_standing(p_coven) then
    raise exception 'Sign the coven''s current agreements to start an altar.';
  end if;
  if not public.coven_permission(p_coven, 'start_altars') then
    raise exception 'Your position in this coven doesn''t start altars.';
  end if;
  if coalesce(p_edit_mode, 'members') not in ('members', 'chosen', 'keeper') then raise exception 'Unknown choice.'; end if;
  if (select count(*) from public.coven_altars where coven_id = p_coven and archived_at is null) >= 40 then
    raise exception 'This coven has 40 altars. Clear one away first.';
  end if;
  perform set_config('coven.altar_keeper', 'on', true);
  insert into public.coven_altars (coven_id, name, is_main, edit_mode, created_by)
  values (p_coven, left(btrim(coalesce(nullif(btrim(p_name), ''), 'An altar')), 80), false, coalesce(p_edit_mode, 'members'), auth.uid())
  returning * into saved;
  perform set_config('coven.altar_keeper', 'off', true);
  return saved;
end;
$$;

-- Asking the circle: the petition, and an altar of its own, set in the
-- ritual altar's scene, that the whole coven tends. (The app sets its
-- candle and the petition paper on it.)
create or replace function public.ask_coven_petition(p_coven uuid, p_title text, p_body text default null, p_color text default 'white')
returns public.coven_petitions
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.coven_petitions;
  scene public.coven_altars;
  altar uuid;
begin
  if not public.coven_in_good_standing(p_coven) then
    raise exception 'You need to be a member in good standing (with the agreements signed) to ask the circle.';
  end if;
  if (select count(*) from public.coven_petitions where coven_id = p_coven and user_id = auth.uid() and status = 'open') >= 3 then
    raise exception 'You have three petitions held already. Close one before asking again.';
  end if;
  insert into public.coven_petitions (coven_id, user_id, title, body, color)
  values (p_coven, auth.uid(), btrim(p_title), nullif(btrim(p_body), ''), coalesce(nullif(p_color, ''), 'white'))
  returning * into p;
  select * into scene from public.coven_altars where coven_id = p_coven and is_main;
  perform set_config('coven.altar_keeper', 'on', true);
  insert into public.coven_altars (coven_id, name, is_main, edit_mode, created_by, background, background_name, extra)
  values (p_coven, left('Petition: ' || btrim(p_title), 80), false, 'members', auth.uid(),
          coalesce(scene.background, ''), coalesce(scene.background_name, ''), jsonb_build_object('petition_id', p.id))
  returning id into altar;
  perform set_config('coven.altar_keeper', 'off', true);
  update public.coven_petitions set altar_id = altar where id = p.id returning * into p;
  return p;
end;
$$;

-- Tending a petition: noted once in twelve hours (the app lights its candle
-- on the petition's altar).
create or replace function public.tend_coven_petition(p_petition uuid, p_note text default null)
returns public.coven_petitions
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.coven_petitions;
begin
  select * into p from public.coven_petitions where id = p_petition for update;
  if p.id is null or p.status <> 'open' then raise exception 'That petition isn''t being held any more.'; end if;
  if not public.coven_in_good_standing(p.coven_id) then raise exception 'You need to be a member in good standing to tend petitions.'; end if;
  if exists (select 1 from public.coven_petition_tendings where petition_id = p.id and user_id = auth.uid() and created_at > now() - interval '12 hours') then
    raise exception 'You tended this petition in the last twelve hours. Its candle is still burning for you.';
  end if;
  insert into public.coven_petition_tendings (petition_id, coven_id, user_id, note) values (p.id, p.coven_id, auth.uid(), nullif(btrim(p_note), ''));
  update public.coven_petitions set last_tended_at = now() where id = p.id returning * into p;
  return p;
end;
$$;

-- Answered or closed: the petition's altar is cleared away (kept, so it can be looked back on).
create or replace function public.close_coven_petition(p_petition uuid, p_status text, p_note text default null)
returns public.coven_petitions
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.coven_petitions;
begin
  select * into p from public.coven_petitions where id = p_petition for update;
  if p.id is null then raise exception 'That petition was not found.'; end if;
  if not (p.user_id = auth.uid() or public.coven_permission(p.coven_id, 'moderate') or public.is_community_moderator()) then
    raise exception 'Only the person who asked can close a petition.';
  end if;
  if p_status not in ('answered', 'closed') then raise exception 'A petition is answered or closed.'; end if;
  update public.coven_petitions set status = p_status, outcome_note = nullif(btrim(p_note), ''), closed_at = now()
  where id = p.id returning * into p;
  perform public.coven_petition_clear_candle(p.altar_item_id);
  if p.altar_id is not null then
    perform set_config('coven.altar_keeper', 'on', true);
    update public.coven_altars set archived_at = now() where id = p.altar_id and archived_at is null;
    perform set_config('coven.altar_keeper', 'off', true);
  end if;
  return p;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants and live updates
-- ---------------------------------------------------------------------------

revoke execute on function public.coven_message_conversation() from public, anon, authenticated;
revoke execute on function
  public.coven_in_conversation(uuid), public.coven_blocked_between(uuid, uuid),
  public.coven_open_direct(uuid, uuid), public.coven_create_group(uuid, text, uuid[]), public.coven_add_to_group(uuid, uuid[]),
  public.coven_leave_conversation(uuid), public.coven_set_conversation(uuid, boolean, boolean),
  public.register_push_token(text, text), public.unregister_push_token(text)
from public, anon;
grant execute on function
  public.coven_in_conversation(uuid), public.coven_blocked_between(uuid, uuid),
  public.coven_open_direct(uuid, uuid), public.coven_create_group(uuid, text, uuid[]), public.coven_add_to_group(uuid, uuid[]),
  public.coven_leave_conversation(uuid), public.coven_set_conversation(uuid, boolean, boolean),
  public.register_push_token(text, text), public.unregister_push_token(text)
to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_conversations') then
      alter publication supabase_realtime add table public.coven_conversations;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_conversation_members') then
      alter publication supabase_realtime add table public.coven_conversation_members;
    end if;
  end if;
end;
$$;
