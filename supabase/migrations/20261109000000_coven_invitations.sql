-- NOT YET APPLIED. Coven invitations: invite links anyone can open, and
-- personal invitations sent to someone in the app. Additive and safe to run
-- again (paste it whole).
--
-- * Who may invite (coven_can_invite): those with the coven's 'manage' or
--   'review' permission always, and, when the coven turns on
--   covens.members_can_invite, any active member in good standing. Never
--   anyone banned from covens.
-- * Invite links (coven_invite_links): a ten-letter code from an alphabet
--   with no look-alikes (no 0, 1, I or O), made here with gen_random_bytes.
--   A link may run out (expires_at), be used a set number of times
--   (max_uses) and be revoked. Its inviters see the coven's links; no one
--   else reads them. coven_invite_preview(code) says, to anyone (signed in
--   or not), only what an invitation card shows: the coven's name, address,
--   tagline, tradition and member count, and whether the link still works.
-- * Personal invitations (coven_invitations): one person, from one inviter,
--   with an optional message. One waiting at a time for each person and
--   coven. Seen by the person invited, the inviter, the coven's managers and
--   reviewers (and site moderators). They lapse after 30 days.
-- * Accepting either one skips the application: an invitation is the coven's
--   approval. It works for covens that take applications, closed covens and
--   unlisted ones, joins at the default position, and closes any application
--   still waiting as approved. It still needs a community profile (signed
--   in, 18+, not banned), every agreement signed (the error says so, as
--   join_coven does, so the screen can show them), and a free seat. Someone
--   removed from a coven comes back only through a personal invitation, never
--   a link; someone banned from it never does.
-- * Every write goes through the functions below. invite_to_coven allows 30
--   invitations a day for each inviter in each coven.
-- * Phone notes: coven-notify { invitation_id } tells the person invited, and
--   tells the inviter when it's accepted (coven_request_notices keeps each to
--   once).

-- gen_random_bytes comes from pgcrypto, which Supabase keeps in the
-- "extensions" schema (already there on every project).
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'extensions' and p.proname = 'gen_random_bytes'
  ) then
    create schema if not exists extensions;
    create extension if not exists pgcrypto with schema extensions;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- The setting, and who may invite
-- ---------------------------------------------------------------------------

alter table public.covens add column if not exists members_can_invite boolean not null default false;

create or replace function public.coven_can_invite(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and not public.is_community_banned()
    and (
      public.coven_permission(target, 'manage')
      or public.coven_permission(target, 'review')
      or (
        coalesce((select c.members_can_invite from public.covens c where c.id = target), false)
        and public.coven_in_good_standing(target)
      )
    );
$$;

-- What the invite screens need to know: whether you may invite, and the setting.
create or replace function public.coven_invite_settings(p_coven uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'may_invite', public.coven_can_invite(p_coven),
    'members_can_invite', coalesce((select c.members_can_invite from public.covens c where c.id = p_coven), false)
  );
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.coven_invite_links (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  code text not null unique check (code ~ '^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{10}$'),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  max_uses integer check (max_uses is null or max_uses between 1 and 1000),
  uses integer not null default 0 check (uses >= 0),
  revoked_at timestamptz,
  note text check (note is null or char_length(note) <= 80)
);

create index if not exists coven_invite_links_coven_idx on public.coven_invite_links (coven_id, created_at desc);
create index if not exists coven_invite_links_creator_idx on public.coven_invite_links (created_by, coven_id, created_at desc);

create table if not exists public.coven_invitations (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  invited_by uuid references auth.users (id) on delete set null,
  message text check (message is null or char_length(message) <= 500),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'revoked', 'expired')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create unique index if not exists coven_invitations_one_pending on public.coven_invitations (coven_id, user_id) where status = 'pending';
create index if not exists coven_invitations_user_idx on public.coven_invitations (user_id, status, created_at desc);
create index if not exists coven_invitations_coven_idx on public.coven_invitations (coven_id, status, created_at desc);
create index if not exists coven_invitations_inviter_idx on public.coven_invitations (invited_by, coven_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row-level security: reads only; every write is a function below
-- ---------------------------------------------------------------------------

alter table public.coven_invite_links enable row level security;
alter table public.coven_invitations enable row level security;

drop policy if exists "Inviters see their coven's invite links" on public.coven_invite_links;
create policy "Inviters see their coven's invite links" on public.coven_invite_links
  for select to authenticated
  using (public.coven_can_invite(coven_id) or public.is_community_moderator());

drop policy if exists "The invited, inviters, managers and reviewers see invitations" on public.coven_invitations;
create policy "The invited, inviters, managers and reviewers see invitations" on public.coven_invitations
  for select to authenticated
  using (
    user_id = auth.uid()
    or invited_by = auth.uid()
    or public.coven_permission(coven_id, 'manage')
    or public.coven_permission(coven_id, 'review')
    or public.is_community_moderator()
  );

revoke insert, update, delete on public.coven_invite_links from anon, authenticated;
revoke insert, update, delete on public.coven_invitations from anon, authenticated;
revoke select on public.coven_invite_links from anon;
revoke select on public.coven_invitations from anon;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- A code as typed or pasted: capitals, no spaces or dashes.
create or replace function public.coven_invite_code_clean(p_code text)
returns text
language sql
immutable
set search_path = public
as $$
  select left(upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')), 40);
$$;

-- Why a link can't be used now, or null when it can.
create or replace function public.coven_invite_link_problem(l public.coven_invite_links, c public.covens)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when l.id is null then 'not_found'
    when l.revoked_at is not null then 'revoked'
    when l.expires_at is not null and l.expires_at <= now() then 'expired'
    when l.max_uses is not null and l.uses >= l.max_uses then 'used_up'
    when c.id is null or c.status <> 'active' then 'coven_not_active'
    else null
  end;
$$;

-- Bring the caller into the coven by invitation (the invite counts as approval).
-- Not for calling directly: accept_coven_invite_link and respond_to_coven_invitation use it.
create or replace function public.coven_admit_invited(p_coven uuid, p_personal boolean, p_inviter uuid)
returns public.coven_members
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.covens;
  existing public.coven_members;
  joined public.coven_members;
begin
  perform public.coven_require_profile();
  select * into c from public.covens where id = p_coven;
  if c.id is null or c.status <> 'active' then raise exception 'That coven is not open right now.'; end if;
  select * into existing from public.coven_members where coven_id = p_coven and user_id = auth.uid();
  if existing.status = 'active' then return existing; end if;
  if existing.status = 'banned' then raise exception 'You cannot join this coven.'; end if;
  if existing.status = 'removed' and not p_personal then
    raise exception 'This link can’t bring you back into this coven. Ask its leaders for a personal invitation.';
  end if;
  if not public.coven_seat_available(p_coven) then raise exception 'This coven is full.'; end if;
  if public.coven_unsigned_agreements(p_coven) > 0 then raise exception 'Please sign the coven''s agreements first.'; end if;

  insert into public.coven_members (coven_id, user_id, rank_id, status, joined_at)
  values (p_coven, auth.uid(), (select id from public.coven_ranks where coven_id = p_coven and is_default limit 1), 'active', now())
  on conflict (coven_id, user_id) do update set status = 'active', rank_id = excluded.rank_id, joined_at = now(), muted_until = null
  returning * into joined;

  -- An application still waiting is answered by the invitation.
  update public.coven_applications
  set status = 'approved', reviewer_id = p_inviter, decided_at = now()
  where coven_id = p_coven and user_id = auth.uid() and status = 'pending';

  return joined;
end;
$$;

revoke execute on function public.coven_admit_invited(uuid, boolean, uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Invite links
-- ---------------------------------------------------------------------------

create or replace function public.create_coven_invite_link(
  p_coven uuid,
  p_expires_in_days integer default null,
  p_max_uses integer default null,
  p_note text default null
)
returns public.coven_invite_links
language plpgsql
security definer
set search_path = public
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  bytes bytea;
  made text;
  tries integer := 0;
  created public.coven_invite_links;
begin
  perform public.coven_require_profile();
  if not public.coven_can_invite(p_coven) then raise exception 'You can’t invite people to this coven.'; end if;
  if p_expires_in_days is not null and (p_expires_in_days < 1 or p_expires_in_days > 365) then
    raise exception 'Choose how long the link lasts: up to a year.';
  end if;
  if p_max_uses is not null and (p_max_uses < 1 or p_max_uses > 1000) then
    raise exception 'Choose how many times the link can be used: up to 1,000.';
  end if;
  if char_length(btrim(coalesce(p_note, ''))) > 80 then raise exception 'Keep the note to 80 characters.'; end if;
  if (select count(*) from public.coven_invite_links
      where coven_id = p_coven and created_by = auth.uid() and created_at > now() - interval '1 day') >= 30 then
    raise exception 'You have made a lot of invite links today. Please wait a little.';
  end if;

  loop
    bytes := extensions.gen_random_bytes(10);
    made := '';
    for i in 0..9 loop
      made := made || substr(alphabet, (get_byte(bytes, i) & 31) + 1, 1);
    end loop;
    begin
      insert into public.coven_invite_links (coven_id, code, created_by, expires_at, max_uses, note)
      values (
        p_coven,
        made,
        auth.uid(),
        case when p_expires_in_days is null then null else now() + make_interval(days => p_expires_in_days) end,
        p_max_uses,
        nullif(btrim(p_note), '')
      )
      returning * into created;
      return created;
    exception when unique_violation then
      tries := tries + 1;
      if tries >= 5 then raise; end if;
    end;
  end loop;
end;
$$;

create or replace function public.revoke_coven_invite_link(p_link uuid)
returns public.coven_invite_links
language plpgsql
security definer
set search_path = public
as $$
declare
  l public.coven_invite_links;
begin
  select * into l from public.coven_invite_links where id = p_link for update;
  if l.id is null then raise exception 'That link was not found.'; end if;
  if not (
    (l.created_by = auth.uid() and public.coven_can_invite(l.coven_id))
    or public.coven_permission(l.coven_id, 'manage')
    or public.coven_permission(l.coven_id, 'review')
    or public.is_community_moderator()
  ) then
    raise exception 'Only whoever made the link, or the coven''s leaders and reviewers, can revoke it.';
  end if;
  if l.revoked_at is null then
    update public.coven_invite_links set revoked_at = now() where id = p_link returning * into l;
  end if;
  return l;
end;
$$;

-- What an invite link shows before anyone signs in, and nothing more.
create or replace function public.coven_invite_preview(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  l public.coven_invite_links;
  c public.covens;
  problem text;
begin
  select * into l from public.coven_invite_links where code = public.coven_invite_code_clean(p_code);
  if l.id is not null then
    select * into c from public.covens where id = l.coven_id;
  end if;
  problem := public.coven_invite_link_problem(l, c);
  return jsonb_build_object(
    'valid', problem is null,
    'reason', problem,
    'coven', case when c.id is not null and c.status = 'active' then jsonb_build_object(
      'name', c.name,
      'slug', c.slug,
      'tagline', c.tagline,
      'tradition', c.tradition,
      'member_count', (select count(*)::integer from public.coven_members m where m.coven_id = c.id and m.status = 'active')
    ) else null end
  );
end;
$$;

grant execute on function public.coven_invite_preview(text) to anon, authenticated;

create or replace function public.accept_coven_invite_link(p_code text)
returns public.coven_members
language plpgsql
security definer
set search_path = public
as $$
declare
  l public.coven_invite_links;
  c public.covens;
  existing public.coven_members;
  joined public.coven_members;
  problem text;
begin
  perform public.coven_require_profile();
  select * into l from public.coven_invite_links where code = public.coven_invite_code_clean(p_code) for update;
  if l.id is not null then
    select * into c from public.covens where id = l.coven_id;
    -- Already in: nothing to use up.
    select * into existing from public.coven_members where coven_id = l.coven_id and user_id = auth.uid();
    if existing.status = 'active' then return existing; end if;
  end if;
  problem := public.coven_invite_link_problem(l, c);
  if problem = 'not_found' then raise exception 'That invite link wasn’t found. Check the code and try again.'; end if;
  if problem = 'revoked' then raise exception 'That invite link was revoked. Ask the coven for a new one.'; end if;
  if problem = 'expired' then raise exception 'That invite link has expired. Ask the coven for a new one.'; end if;
  if problem = 'used_up' then raise exception 'That invite link has been used as many times as it can be. Ask the coven for a new one.'; end if;
  if problem is not null then raise exception 'That coven is not open right now.'; end if;

  joined := public.coven_admit_invited(l.coven_id, false, l.created_by);
  update public.coven_invite_links set uses = uses + 1 where id = l.id;
  return joined;
end;
$$;

-- ---------------------------------------------------------------------------
-- Personal invitations
-- ---------------------------------------------------------------------------

-- Find someone to invite by the start of their coven name: at least two
-- letters, ten at most, and never anyone already in the coven, banned,
-- blocked either way, or already invited.
create or replace function public.search_invitable_people(p_coven uuid, p_query text)
returns table (user_id uuid, display_name text, avatar_url text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  q text := btrim(coalesce(p_query, ''));
begin
  if not public.coven_can_invite(p_coven) then raise exception 'You can’t invite people to this coven.'; end if;
  if char_length(q) < 2 then return; end if;
  q := replace(replace(replace(left(q, 40), '\', '\\'), '%', '\%'), '_', '\_');
  return query
    select p.user_id, p.display_name, nullif(to_jsonb(p)->>'avatar_url', '')
    from public.coven_profiles p
    where lower(p.display_name) like lower(q) || '%' escape '\'
      and p.user_id <> auth.uid()
      and not public.is_community_banned(p.user_id)
      and not exists (
        select 1 from public.coven_members m
        where m.coven_id = p_coven and m.user_id = p.user_id and m.status in ('active', 'banned')
      )
      and not exists (
        select 1 from public.user_blocks b
        where (b.blocker_id = auth.uid() and b.blocked_id = p.user_id)
           or (b.blocker_id = p.user_id and b.blocked_id = auth.uid())
      )
      and not exists (
        select 1 from public.coven_invitations i
        where i.coven_id = p_coven and i.user_id = p.user_id and i.status = 'pending' and i.created_at > now() - interval '30 days'
      )
    order by lower(p.display_name), p.user_id
    limit 10;
end;
$$;

create or replace function public.invite_to_coven(p_coven uuid, p_user uuid, p_message text default null)
returns public.coven_invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  created public.coven_invitations;
  them public.coven_members;
begin
  perform public.coven_require_profile();
  if not public.coven_can_invite(p_coven) then raise exception 'You can’t invite people to this coven.'; end if;
  if p_user is null or p_user = auth.uid() then raise exception 'Choose someone to invite.'; end if;
  if char_length(btrim(coalesce(p_message, ''))) > 500 then raise exception 'Keep the message to 500 characters.'; end if;
  if not exists (select 1 from public.coven_profiles where user_id = p_user)
     or public.is_community_banned(p_user)
     or exists (
       select 1 from public.user_blocks b
       where (b.blocker_id = auth.uid() and b.blocked_id = p_user) or (b.blocker_id = p_user and b.blocked_id = auth.uid())
     ) then
    raise exception 'You can’t invite this person.';
  end if;
  select * into them from public.coven_members where coven_id = p_coven and user_id = p_user;
  if them.status = 'active' then raise exception 'They’re already in the coven.'; end if;
  if them.status = 'banned' then raise exception 'You can’t invite this person.'; end if;
  if (select count(*) from public.coven_invitations
      where coven_id = p_coven and invited_by = auth.uid() and created_at > now() - interval '1 day') >= 30 then
    raise exception 'You have sent a lot of invitations today. Please wait until tomorrow.';
  end if;

  -- One that has lapsed makes way for a new one.
  update public.coven_invitations set status = 'expired', decided_at = now()
  where coven_id = p_coven and user_id = p_user and status = 'pending' and created_at <= now() - interval '30 days';
  if exists (select 1 from public.coven_invitations where coven_id = p_coven and user_id = p_user and status = 'pending') then
    raise exception 'They already have an invitation waiting.';
  end if;

  insert into public.coven_invitations (coven_id, user_id, invited_by, message)
  values (p_coven, p_user, auth.uid(), nullif(btrim(p_message), ''))
  returning * into created;
  return created;
end;
$$;

create or replace function public.respond_to_coven_invitation(p_invitation uuid, p_accept boolean)
returns public.coven_invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.coven_invitations;
begin
  if auth.uid() is null then raise exception 'Please sign in first.'; end if;
  select * into inv from public.coven_invitations where id = p_invitation and user_id = auth.uid() for update;
  if inv.id is null then raise exception 'That invitation was not found.'; end if;
  if inv.status = 'revoked' then raise exception 'That invitation was taken back.'; end if;
  if inv.status <> 'pending' then raise exception 'That invitation has already been answered.'; end if;
  if inv.created_at <= now() - interval '30 days' then raise exception 'That invitation has expired. Ask the coven for a new one.'; end if;

  if p_accept then
    perform public.coven_admit_invited(inv.coven_id, true, inv.invited_by);
  end if;

  update public.coven_invitations
  set status = case when p_accept then 'accepted' else 'declined' end, decided_at = now()
  where id = p_invitation
  returning * into inv;
  return inv;
end;
$$;

create or replace function public.revoke_coven_invitation(p_invitation uuid)
returns public.coven_invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.coven_invitations;
begin
  select * into inv from public.coven_invitations where id = p_invitation for update;
  if inv.id is null then raise exception 'That invitation was not found.'; end if;
  if not (
    inv.invited_by = auth.uid()
    or public.coven_permission(inv.coven_id, 'manage')
    or public.coven_permission(inv.coven_id, 'review')
    or public.is_community_moderator()
  ) then
    raise exception 'Only whoever sent the invitation, or the coven''s leaders and reviewers, can take it back.';
  end if;
  if inv.status <> 'pending' then raise exception 'That invitation has already been answered.'; end if;
  update public.coven_invitations set status = 'revoked', decided_at = now() where id = p_invitation returning * into inv;
  return inv;
end;
$$;

-- ---------------------------------------------------------------------------
-- Phone notes, and live counts
-- ---------------------------------------------------------------------------

-- coven-notify claims each invitation's notes once ('new' to the person
-- invited, 'answer' to the inviter when it's accepted).
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'coven_request_notices') then
    alter table public.coven_request_notices drop constraint if exists coven_request_notices_request_kind_check;
    alter table public.coven_request_notices add constraint coven_request_notices_request_kind_check
      check (request_kind in ('application', 'advancement', 'grimoire_submission', 'invitation'));
  end if;
end;
$$;

-- The Coven tab's count updates the moment an invitation arrives or is taken back.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_invitations') then
      alter publication supabase_realtime add table public.coven_invitations;
    end if;
  end if;
end;
$$;
