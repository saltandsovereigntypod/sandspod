-- Applied to sandspod-dev on 2026-10-23 (migrations "covens_1_tables", "covens_2a_permission_helpers",
-- "covens_2b_guard_functions"; the triggers, policies and functions went in by SQL because the
-- migration tool timed out on them).
-- Digital covens: a discoverable directory of covens that witches can found,
-- join or apply to, with the coven's own ranks, rules, creed, requirements and
-- signed agreements, applications for membership and for higher positions, a
-- live coven chat and a shared coven altar (both over Supabase Realtime).
--
-- Who can do what is decided here, not in the browser:
--   * Everyone (signed in or not) can browse active covens and their public
--     documents, so seekers can read the rules and creed before applying.
--   * Joining needs a community profile, which records that the person
--     confirmed they are 18 or older and agreed to the community guidelines.
--   * Inside a coven, the founder can do everything; each rank the coven
--     defines carries can_manage (settings, documents, ranks), can_review
--     (applications and advancement) and can_moderate (chat, mutes, removals).
--   * Chat and the altar need "good standing": an active member who has signed
--     the current version of every agreement, is not muted and is not banned.
--   * Site moderators (user_roles.role 'admin' or 'moderator') can see and act
--     on every coven, every chat and every report.
--
-- Multi-step changes (founding, joining, deciding applications, changing a
-- member's rank) go through the security-definer functions at the end, so the
-- checks and the writes happen together.

-- ---------------------------------------------------------------------------
-- Helpers that do not depend on the coven tables
-- ---------------------------------------------------------------------------

create or replace function public.is_community_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'moderator')
  );
$$;

-- Direct writes from the browser run as the "authenticated" role; the
-- security-definer functions below run as their owner. The guard triggers
-- (which run as the caller, not as definers) use this to let those functions
-- change columns the browser may not touch.
create or replace function public.coven_client_write()
returns boolean
language sql
stable
set search_path = public
as $$
  select current_user in ('authenticated', 'anon');
$$;

-- ---------------------------------------------------------------------------
-- Community profile, site bans and blocks
-- ---------------------------------------------------------------------------

create table if not exists public.coven_profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 40),
  pronouns text check (pronouns is null or char_length(pronouns) <= 40),
  bio text check (bio is null or char_length(bio) <= 500),
  age_confirmed_at timestamptz not null default now(),
  guidelines_agreed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_bans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  reason text check (reason is null or char_length(reason) <= 1000),
  banned_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_blocks (
  blocker_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create or replace function public.is_community_banned(target uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.community_bans where user_id = target);
$$;

-- ---------------------------------------------------------------------------
-- Covens and their ranks, documents and signatures
-- ---------------------------------------------------------------------------

create table if not exists public.covens (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60),
  name text not null check (char_length(btrim(name)) between 3 and 80),
  tagline text check (tagline is null or char_length(tagline) <= 160),
  description text check (description is null or char_length(description) <= 5000),
  tradition text check (tradition is null or char_length(tradition) <= 80),
  tags text[] not null default '{}' check (cardinality(tags) <= 12),
  meeting_rhythm text check (meeting_rhythm is null or char_length(meeting_rhythm) <= 160),
  timezone text check (timezone is null or char_length(timezone) <= 64),
  joining text not null default 'application' check (joining in ('open', 'application', 'closed')),
  visibility text not null default 'listed' check (visibility in ('listed', 'unlisted')),
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  moderation_note text check (moderation_note is null or char_length(moderation_note) <= 1000),
  application_questions jsonb not null default '[]'::jsonb
    check (jsonb_typeof(application_questions) = 'array' and jsonb_array_length(application_questions) <= 20),
  altar_background text check (altar_background is null or altar_background ~ '^[a-z0-9-]{1,60}$'),
  member_limit integer check (member_limit is null or member_limit between 2 and 1000),
  founder_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists covens_directory_idx on public.covens (status, visibility, created_at desc);

create table if not exists public.coven_ranks (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  description text check (description is null or char_length(description) <= 1000),
  requirements text check (requirements is null or char_length(requirements) <= 2000),
  level integer not null default 1 check (level between 1 and 99),
  can_manage boolean not null default false,
  can_review boolean not null default false,
  can_moderate boolean not null default false,
  is_default boolean not null default false,
  open_to_applications boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_ranks_coven_idx on public.coven_ranks (coven_id, level);
create unique index if not exists coven_ranks_one_default on public.coven_ranks (coven_id) where is_default;

create table if not exists public.coven_members (
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rank_id uuid references public.coven_ranks (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'left', 'removed', 'banned')),
  muted_until timestamptz,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (coven_id, user_id)
);

create index if not exists coven_members_user_idx on public.coven_members (user_id, status);

create table if not exists public.coven_documents (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  kind text not null default 'other' check (kind in ('creed', 'rules', 'requirements', 'agreement', 'other')),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body text not null default '' check (char_length(body) <= 20000),
  visibility text not null default 'public' check (visibility in ('public', 'members')),
  requires_signature boolean not null default false,
  published boolean not null default true,
  position integer not null default 0,
  version integer not null default 1,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Seekers sign agreements before they join, so an agreement must be readable by them.
  check (not requires_signature or visibility = 'public')
);

create index if not exists coven_documents_coven_idx on public.coven_documents (coven_id, position);

create table if not exists public.coven_signatures (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.coven_documents (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  version integer not null,
  signed_name text not null check (char_length(btrim(signed_name)) between 2 and 80),
  signed_at timestamptz not null default now(),
  unique (document_id, user_id, version)
);

create index if not exists coven_signatures_user_idx on public.coven_signatures (user_id, coven_id);

-- ---------------------------------------------------------------------------
-- Applications and advancement
-- ---------------------------------------------------------------------------

create table if not exists public.coven_applications (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  message text check (message is null or char_length(message) <= 4000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'withdrawn')),
  reviewer_id uuid references auth.users (id) on delete set null,
  reviewer_note text check (reviewer_note is null or char_length(reviewer_note) <= 2000),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index if not exists coven_applications_coven_idx on public.coven_applications (coven_id, status, created_at desc);
create unique index if not exists coven_applications_one_pending on public.coven_applications (coven_id, user_id) where status = 'pending';

create table if not exists public.coven_advancement_requests (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  rank_id uuid not null references public.coven_ranks (id) on delete cascade,
  statement text check (statement is null or char_length(statement) <= 4000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'withdrawn')),
  reviewer_id uuid references auth.users (id) on delete set null,
  reviewer_note text check (reviewer_note is null or char_length(reviewer_note) <= 2000),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index if not exists coven_advancement_coven_idx on public.coven_advancement_requests (coven_id, status, created_at desc);
create unique index if not exists coven_advancement_one_pending on public.coven_advancement_requests (coven_id, user_id) where status = 'pending';

-- ---------------------------------------------------------------------------
-- Live chat and the shared altar
-- ---------------------------------------------------------------------------

create table if not exists public.coven_messages (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(body) <= 2000),
  reply_to uuid references public.coven_messages (id) on delete set null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid references auth.users (id) on delete set null
);

create index if not exists coven_messages_coven_idx on public.coven_messages (coven_id, created_at desc);

create table if not exists public.coven_altar_items (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  kind text not null check (kind in ('candle', 'object')),
  -- Only the site's own altar pictures, never an outside address.
  image text not null check (image ~ '^(\.\./|/)assets/altar/[A-Za-z0-9/_.-]+\.(png|PNG|jpg|jpeg|webp)$' and image !~ '\.\./.*\.\./'),
  label text check (label is null or char_length(label) <= 80),
  intention text check (intention is null or char_length(intention) <= 280),
  x real not null default 0.5 check (x between 0 and 1),
  y real not null default 0.6 check (y between 0 and 1),
  scale real not null default 1 check (scale between 0.4 and 2.5),
  rotation real not null default 0 check (rotation between -180 and 180),
  z integer not null default 0,
  lit boolean not null default false,
  lit_at timestamptz,
  lit_by uuid references auth.users (id) on delete set null,
  burn_minutes integer not null default 60 check (burn_minutes between 5 and 1440),
  placed_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_altar_items_coven_idx on public.coven_altar_items (coven_id);

-- ---------------------------------------------------------------------------
-- Reports
-- ---------------------------------------------------------------------------

create table if not exists public.coven_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid default auth.uid() references auth.users (id) on delete set null,
  coven_id uuid references public.covens (id) on delete cascade,
  target_type text not null check (target_type in ('coven', 'message', 'member', 'application', 'altar_item', 'document')),
  target_id uuid,
  target_user_id uuid references auth.users (id) on delete set null,
  reason text not null check (reason in ('harassment', 'hate', 'sexual', 'minor', 'self_harm', 'spam', 'scam', 'coercion', 'other')),
  details text check (details is null or char_length(details) <= 2000),
  snapshot text check (snapshot is null or char_length(snapshot) <= 4000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  resolution_note text check (resolution_note is null or char_length(resolution_note) <= 2000),
  resolved_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists coven_reports_status_idx on public.coven_reports (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Permission helpers (security definer, so policies can use them without
-- recursing into the policies of the tables they read)
-- ---------------------------------------------------------------------------

create or replace function public.is_coven_member(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coven_members
    where coven_id = target and user_id = auth.uid() and status = 'active'
  );
$$;

-- 'member', 'manage', 'review' or 'moderate', for an active member of an active coven.
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
          else false
        end
      )
  );
$$;

-- How senior someone is in a coven: the founder outranks everyone.
create or replace function public.coven_level(target uuid, person uuid default auth.uid())
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when c.founder_id = person then 1000
    else coalesce((
      select r.level from public.coven_members m
      left join public.coven_ranks r on r.id = m.rank_id
      where m.coven_id = target and m.user_id = person and m.status = 'active'
    ), 0)
  end
  from public.covens c where c.id = target;
$$;

-- Agreements this person still has to sign (current versions only).
create or replace function public.coven_unsigned_agreements(target uuid, person uuid default auth.uid())
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.coven_documents d
  where d.coven_id = target and d.requires_signature and d.published
    and not exists (
      select 1 from public.coven_signatures s
      where s.document_id = d.id and s.user_id = person and s.version = d.version
    );
$$;

create or replace function public.coven_in_good_standing(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.coven_permission(target, 'member')
    and not public.is_community_banned()
    and public.coven_unsigned_agreements(target) = 0
    and not exists (
      select 1 from public.coven_members
      where coven_id = target and user_id = auth.uid() and muted_until > now()
    );
$$;

-- Shown in the directory as a computed column: select=*,member_count
create or replace function public.member_count(public.covens)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.coven_members where coven_id = $1.id and status = 'active';
$$;

-- ---------------------------------------------------------------------------
-- Guard triggers
-- ---------------------------------------------------------------------------

create or replace function public.touch_coven_row()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.guard_coven_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  new.slug := old.slug;
  if public.coven_client_write() and not public.is_community_moderator() then
    new.founder_id := old.founder_id;
    new.moderation_note := old.moderation_note;
    -- Leaders may archive or reopen their coven, but a suspension is the moderators' to lift.
    if old.status = 'suspended' or new.status = 'suspended' then
      new.status := old.status;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.guard_coven_document()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  if tg_op = 'INSERT' then
    new.version := 1;
  else
    new.coven_id := old.coven_id;
    -- Changing the words of a document makes earlier signatures out of date.
    if new.body is distinct from old.body or new.title is distinct from old.title
       or (new.requires_signature and not old.requires_signature) then
      new.version := old.version + 1;
    else
      new.version := old.version;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.fill_coven_signature()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  doc public.coven_documents;
begin
  select * into doc from public.coven_documents where id = new.document_id;
  if doc.id is null or not doc.published then
    raise exception 'That document is not available to sign.';
  end if;
  new.coven_id := doc.coven_id;
  new.version := doc.version;
  new.signed_at := now();
  if public.coven_client_write() then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

create or replace function public.guard_coven_rank()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if tg_op = 'UPDATE' then
    new.coven_id := old.coven_id;
  end if;
  -- One default rank per coven: choosing a new one clears the old.
  if new.is_default then
    update public.coven_ranks set is_default = false
    where coven_id = new.coven_id and id <> new.id and is_default;
  end if;
  return new;
end;
$$;

create or replace function public.guard_coven_message()
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
    if char_length(btrim(new.body)) = 0 then
      raise exception 'A message needs some words.';
    end if;
    if (select count(*) from public.coven_messages
        where user_id = auth.uid() and created_at > now() - interval '30 seconds') >= 8 then
      raise exception 'You are sending messages very quickly. Please wait a moment.';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.guard_coven_altar_item()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  if tg_op = 'INSERT' then
    new.placed_by := auth.uid();
    new.created_at := now();
    if (select count(*) from public.coven_altar_items where coven_id = new.coven_id) >= 80 then
      raise exception 'The coven altar is full. Clear something away first.';
    end if;
  else
    new.coven_id := old.coven_id;
    new.kind := old.kind;
    new.image := old.image;
    new.placed_by := old.placed_by;
    new.created_at := old.created_at;
  end if;
  if new.kind <> 'candle' then
    new.lit := false;
  end if;
  if new.lit and (tg_op = 'INSERT' or not old.lit) then
    new.lit_at := now();
    new.lit_by := auth.uid();
  elsif not new.lit then
    new.lit_at := null;
    new.lit_by := null;
  else
    new.lit_at := old.lit_at;
    new.lit_by := old.lit_by;
  end if;
  return new;
end;
$$;

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

drop trigger if exists covens_guard on public.covens;
create trigger covens_guard before update on public.covens
  for each row execute function public.guard_coven_update();

drop trigger if exists coven_profiles_touch on public.coven_profiles;
create trigger coven_profiles_touch before update on public.coven_profiles
  for each row execute function public.touch_coven_row();

drop trigger if exists coven_members_touch on public.coven_members;
create trigger coven_members_touch before update on public.coven_members
  for each row execute function public.touch_coven_row();

drop trigger if exists coven_ranks_guard on public.coven_ranks;
create trigger coven_ranks_guard before insert or update on public.coven_ranks
  for each row execute function public.guard_coven_rank();

drop trigger if exists coven_documents_guard on public.coven_documents;
create trigger coven_documents_guard before insert or update on public.coven_documents
  for each row execute function public.guard_coven_document();

drop trigger if exists coven_signatures_fill on public.coven_signatures;
create trigger coven_signatures_fill before insert on public.coven_signatures
  for each row execute function public.fill_coven_signature();

drop trigger if exists coven_messages_guard on public.coven_messages;
create trigger coven_messages_guard before insert on public.coven_messages
  for each row execute function public.guard_coven_message();

drop trigger if exists coven_altar_items_guard on public.coven_altar_items;
create trigger coven_altar_items_guard before insert or update on public.coven_altar_items
  for each row execute function public.guard_coven_altar_item();

drop trigger if exists coven_reports_fill on public.coven_reports;
create trigger coven_reports_fill before insert on public.coven_reports
  for each row execute function public.fill_coven_report();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.coven_profiles enable row level security;
alter table public.community_bans enable row level security;
alter table public.user_blocks enable row level security;
alter table public.covens enable row level security;
alter table public.coven_ranks enable row level security;
alter table public.coven_members enable row level security;
alter table public.coven_documents enable row level security;
alter table public.coven_signatures enable row level security;
alter table public.coven_applications enable row level security;
alter table public.coven_advancement_requests enable row level security;
alter table public.coven_messages enable row level security;
alter table public.coven_altar_items enable row level security;
alter table public.coven_reports enable row level security;

-- Profiles are pseudonymous (a chosen name, pronouns, a short bio) and shown
-- to other signed-in witches beside their messages and applications.
create policy "Signed-in people can read community profiles" on public.coven_profiles
  for select to authenticated using (true);
create policy "People create their own community profile" on public.coven_profiles
  for insert to authenticated with check (user_id = auth.uid());
create policy "People update their own community profile" on public.coven_profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "People delete their own community profile" on public.coven_profiles
  for delete to authenticated using (user_id = auth.uid());

create policy "People see their own ban; moderators see all" on public.community_bans
  for select to authenticated using (user_id = auth.uid() or public.is_community_moderator());
create policy "Moderators manage bans" on public.community_bans
  for all to authenticated using (public.is_community_moderator()) with check (public.is_community_moderator());

create policy "People manage their own blocks" on public.user_blocks
  for all to authenticated using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

create policy "Anyone can see active covens; members and moderators see theirs" on public.covens
  for select to anon, authenticated
  using (status = 'active' or public.is_coven_member(id) or public.is_community_moderator());
create policy "Coven leaders and moderators update covens" on public.covens
  for update to authenticated
  using (public.coven_permission(id, 'manage') or public.is_community_moderator())
  with check (public.coven_permission(id, 'manage') or public.is_community_moderator());
create policy "Moderators delete covens" on public.covens
  for delete to authenticated using (public.is_community_moderator());

create policy "Ranks are visible with their coven" on public.coven_ranks
  for select to anon, authenticated
  using (exists (select 1 from public.covens c where c.id = coven_id));
create policy "Coven leaders and moderators manage ranks" on public.coven_ranks
  for all to authenticated
  using (public.coven_permission(coven_id, 'manage') or public.is_community_moderator())
  with check (public.coven_permission(coven_id, 'manage') or public.is_community_moderator());

create policy "Members see their coven's members; people see their own rows" on public.coven_members
  for select to authenticated
  using (user_id = auth.uid() or public.is_coven_member(coven_id) or public.is_community_moderator());

create policy "Public documents show with their coven; members see all" on public.coven_documents
  for select to anon, authenticated
  using (
    (published and visibility = 'public' and exists (select 1 from public.covens c where c.id = coven_id))
    or public.is_coven_member(coven_id)
    or public.is_community_moderator()
  );
create policy "Coven leaders and moderators manage documents" on public.coven_documents
  for all to authenticated
  using (public.coven_permission(coven_id, 'manage') or public.is_community_moderator())
  with check (public.coven_permission(coven_id, 'manage') or public.is_community_moderator());

create policy "People see their signatures; reviewers see their coven's" on public.coven_signatures
  for select to authenticated
  using (user_id = auth.uid() or public.coven_permission(coven_id, 'review') or public.is_community_moderator());
create policy "Signed-in people with a profile sign documents they can read" on public.coven_signatures
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.coven_profiles p where p.user_id = auth.uid())
    and not public.is_community_banned()
    and exists (select 1 from public.coven_documents d where d.id = document_id)
  );

create policy "Applicants, reviewers and moderators read applications" on public.coven_applications
  for select to authenticated
  using (user_id = auth.uid() or public.coven_permission(coven_id, 'review') or public.is_community_moderator());

create policy "Members, reviewers and moderators read advancement requests" on public.coven_advancement_requests
  for select to authenticated
  using (user_id = auth.uid() or public.coven_permission(coven_id, 'review') or public.is_community_moderator());

create policy "Members and moderators read coven chat" on public.coven_messages
  for select to authenticated
  using (public.is_coven_member(coven_id) or public.is_community_moderator());
create policy "Members in good standing send messages" on public.coven_messages
  for insert to authenticated
  with check (user_id = auth.uid() and public.coven_in_good_standing(coven_id));

create policy "Members and moderators see the coven altar" on public.coven_altar_items
  for select to authenticated
  using (public.is_coven_member(coven_id) or public.is_community_moderator());
create policy "Members in good standing place things on the altar" on public.coven_altar_items
  for insert to authenticated
  with check (public.coven_in_good_standing(coven_id));
create policy "Members in good standing tend the altar" on public.coven_altar_items
  for update to authenticated
  using (public.coven_in_good_standing(coven_id) or public.is_community_moderator())
  with check (public.coven_in_good_standing(coven_id) or public.is_community_moderator());
create policy "Placers and moderators clear altar items" on public.coven_altar_items
  for delete to authenticated
  using (
    (placed_by = auth.uid() and public.coven_in_good_standing(coven_id))
    or public.coven_permission(coven_id, 'moderate')
    or public.is_community_moderator()
  );

create policy "Signed-in people report" on public.coven_reports
  for insert to authenticated with check (reporter_id = auth.uid());
create policy "Reporters see their reports; moderators see all" on public.coven_reports
  for select to authenticated using (reporter_id = auth.uid() or public.is_community_moderator());
create policy "Moderators resolve reports" on public.coven_reports
  for update to authenticated using (public.is_community_moderator()) with check (public.is_community_moderator());

-- ---------------------------------------------------------------------------
-- Functions the pages call
-- ---------------------------------------------------------------------------

create or replace function public.coven_require_profile()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Please sign in first.';
  end if;
  if public.is_community_banned() then
    raise exception 'Your account cannot take part in covens.';
  end if;
  if not exists (select 1 from public.coven_profiles where user_id = auth.uid()) then
    raise exception 'Set up your community profile first (and confirm you are 18 or older).';
  end if;
end;
$$;

create or replace function public.create_coven(
  p_name text,
  p_slug text,
  p_tagline text default null,
  p_description text default null,
  p_tradition text default null,
  p_tags text[] default '{}',
  p_joining text default 'application',
  p_visibility text default 'listed',
  p_meeting_rhythm text default null,
  p_founder_rank text default 'High Priestess'
)
returns public.covens
language plpgsql
security definer
set search_path = public
as $$
declare
  created public.covens;
  top_rank uuid;
  agreement uuid;
  founder_name text;
begin
  perform public.coven_require_profile();
  if (select count(*) from public.covens where founder_id = auth.uid() and status <> 'archived') >= 5 then
    raise exception 'You can found up to five covens.';
  end if;
  if exists (select 1 from public.covens where slug = p_slug) then
    raise exception 'That coven address is taken. Try another.';
  end if;

  insert into public.covens (name, slug, tagline, description, tradition, tags, joining, visibility, meeting_rhythm, founder_id)
  values (btrim(p_name), p_slug, nullif(btrim(p_tagline), ''), nullif(btrim(p_description), ''), nullif(btrim(p_tradition), ''),
          coalesce(p_tags, '{}'), p_joining, p_visibility, nullif(btrim(p_meeting_rhythm), ''), auth.uid())
  returning * into created;

  insert into public.coven_ranks (coven_id, name, description, level, is_default, open_to_applications)
  values
    (created.id, 'Seeker', 'New to the coven, learning its ways.', 1, true, false),
    (created.id, 'Dedicant', 'Has committed to a year and a day of study with the coven.', 2, false, true),
    (created.id, 'Initiate', 'Initiated into the coven''s mysteries.', 3, false, true);
  insert into public.coven_ranks (coven_id, name, description, level, can_review, can_moderate, open_to_applications)
  values (created.id, 'Elder', 'Guides the coven, welcomes seekers and keeps the circle safe.', 4, true, true, true);
  insert into public.coven_ranks (coven_id, name, description, level, can_manage, can_review, can_moderate)
  values (created.id, coalesce(nullif(btrim(p_founder_rank), ''), 'High Priestess'), 'Leads the coven.', 5, true, true, true)
  returning id into top_rank;

  insert into public.coven_members (coven_id, user_id, rank_id) values (created.id, auth.uid(), top_rank);

  insert into public.coven_documents (coven_id, kind, title, body, position)
  values
    (created.id, 'creed', 'Our creed', '', 1),
    (created.id, 'rules', 'Coven rules', '', 2),
    (created.id, 'requirements', 'What we ask of members', '', 3);
  insert into public.coven_documents (coven_id, kind, title, body, requires_signature, position)
  values (created.id, 'agreement', 'Member agreement',
    E'I am 18 or older.\nI will treat every member with respect, and keep what is shared in this coven within it.\nI understand that no one may pressure me for money, secrets, private photographs or anything I do not freely offer, and that I may leave at any time.\nI will follow the Salt & Sovereignty community guidelines.',
    true, 4)
  returning id into agreement;

  select display_name into founder_name from public.coven_profiles where user_id = auth.uid();
  insert into public.coven_signatures (document_id, coven_id, user_id, version, signed_name)
  values (agreement, created.id, auth.uid(), 1, founder_name);

  return created;
end;
$$;

create or replace function public.coven_seat_available(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select c.member_limit is null
    or (select count(*) from public.coven_members m where m.coven_id = c.id and m.status = 'active') < c.member_limit
  from public.covens c where c.id = target;
$$;

create or replace function public.join_coven(p_coven uuid)
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
  if c.joining <> 'open' then raise exception 'This coven takes applications rather than open joining.'; end if;
  select * into existing from public.coven_members where coven_id = p_coven and user_id = auth.uid();
  if existing.status = 'active' then return existing; end if;
  if existing.status in ('removed', 'banned') then raise exception 'You cannot rejoin this coven.'; end if;
  if not public.coven_seat_available(p_coven) then raise exception 'This coven is full.'; end if;
  if public.coven_unsigned_agreements(p_coven) > 0 then raise exception 'Please sign the coven''s agreements first.'; end if;

  insert into public.coven_members (coven_id, user_id, rank_id, status, joined_at)
  values (p_coven, auth.uid(), (select id from public.coven_ranks where coven_id = p_coven and is_default limit 1), 'active', now())
  on conflict (coven_id, user_id) do update set status = 'active', rank_id = excluded.rank_id, joined_at = now(), muted_until = null
  returning * into joined;
  return joined;
end;
$$;

create or replace function public.apply_to_coven(p_coven uuid, p_answers jsonb default '{}'::jsonb, p_message text default null)
returns public.coven_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.covens;
  existing public.coven_members;
  question jsonb;
  created public.coven_applications;
begin
  perform public.coven_require_profile();
  select * into c from public.covens where id = p_coven;
  if c.id is null or c.status <> 'active' then raise exception 'That coven is not open right now.'; end if;
  if c.joining = 'closed' then raise exception 'This coven is not taking new members right now.'; end if;
  select * into existing from public.coven_members where coven_id = p_coven and user_id = auth.uid();
  if existing.status = 'active' then raise exception 'You are already a member.'; end if;
  if existing.status = 'banned' then raise exception 'You cannot apply to this coven.'; end if;
  if exists (select 1 from public.coven_applications where coven_id = p_coven and user_id = auth.uid() and status = 'pending') then
    raise exception 'Your application is already waiting for review.';
  end if;
  if (select count(*) from public.coven_applications where coven_id = p_coven and user_id = auth.uid() and status = 'declined'
      and decided_at > now() - interval '30 days') > 0 then
    raise exception 'You can apply to this coven again 30 days after a decision.';
  end if;
  if public.coven_unsigned_agreements(p_coven) > 0 then raise exception 'Please sign the coven''s agreements first.'; end if;
  if jsonb_typeof(coalesce(p_answers, '{}'::jsonb)) <> 'object' then raise exception 'Answers are not in the right shape.'; end if;
  for question in select * from jsonb_array_elements(c.application_questions) loop
    if coalesce((question->>'required')::boolean, false)
       and char_length(btrim(coalesce(p_answers->>(question->>'id'), ''))) = 0 then
      raise exception 'Please answer: %', question->>'prompt';
    end if;
    if char_length(coalesce(p_answers->>(question->>'id'), '')) > 4000 then
      raise exception 'One of your answers is too long.';
    end if;
  end loop;

  insert into public.coven_applications (coven_id, user_id, answers, message)
  values (p_coven, auth.uid(), coalesce(p_answers, '{}'::jsonb), nullif(btrim(p_message), ''))
  returning * into created;
  return created;
end;
$$;

create or replace function public.withdraw_coven_request(p_kind text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind = 'application' then
    update public.coven_applications set status = 'withdrawn', decided_at = now()
    where id = p_id and user_id = auth.uid() and status = 'pending';
  elsif p_kind = 'advancement' then
    update public.coven_advancement_requests set status = 'withdrawn', decided_at = now()
    where id = p_id and user_id = auth.uid() and status = 'pending';
  else
    raise exception 'Unknown request.';
  end if;
  if not found then raise exception 'That request is no longer waiting.'; end if;
end;
$$;

create or replace function public.decide_coven_application(p_application uuid, p_approve boolean, p_note text default null)
returns public.coven_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  app public.coven_applications;
begin
  select * into app from public.coven_applications where id = p_application for update;
  if app.id is null then raise exception 'That application was not found.'; end if;
  if not (public.coven_permission(app.coven_id, 'review') or public.is_community_moderator()) then
    raise exception 'Only the coven''s reviewers can decide applications.';
  end if;
  if app.status <> 'pending' then raise exception 'That application has already been decided.'; end if;
  if app.user_id = auth.uid() and not public.is_community_moderator() then
    raise exception 'You cannot decide your own application.';
  end if;

  if p_approve then
    if public.is_community_banned(app.user_id) then raise exception 'That person cannot take part in covens.'; end if;
    if not public.coven_seat_available(app.coven_id) then raise exception 'The coven is full.'; end if;
    insert into public.coven_members (coven_id, user_id, rank_id, status, joined_at)
    values (app.coven_id, app.user_id, (select id from public.coven_ranks where coven_id = app.coven_id and is_default limit 1), 'active', now())
    on conflict (coven_id, user_id) do update set status = 'active', rank_id = excluded.rank_id, joined_at = now(), muted_until = null;
  end if;

  update public.coven_applications
  set status = case when p_approve then 'approved' else 'declined' end,
      reviewer_id = auth.uid(), reviewer_note = nullif(btrim(p_note), ''), decided_at = now()
  where id = p_application
  returning * into app;
  return app;
end;
$$;

create or replace function public.request_coven_advancement(p_coven uuid, p_rank uuid, p_statement text default null)
returns public.coven_advancement_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
  created public.coven_advancement_requests;
begin
  if not public.coven_in_good_standing(p_coven) then
    raise exception 'You need to be a member in good standing (with the agreements signed) to ask for advancement.';
  end if;
  select * into r from public.coven_ranks where id = p_rank and coven_id = p_coven;
  if r.id is null or not r.open_to_applications then raise exception 'That position is not open to applications.'; end if;
  if r.level <= public.coven_level(p_coven) then raise exception 'You already hold that position or a higher one.'; end if;
  if exists (select 1 from public.coven_advancement_requests where coven_id = p_coven and user_id = auth.uid() and status = 'pending') then
    raise exception 'You already have a request waiting for review.';
  end if;
  insert into public.coven_advancement_requests (coven_id, user_id, rank_id, statement)
  values (p_coven, auth.uid(), p_rank, nullif(btrim(p_statement), ''))
  returning * into created;
  return created;
end;
$$;

-- Reviewers may raise people to positions below their own; only leaders
-- (can_manage) and the founder grant positions that carry powers.
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
              and not (r.can_manage or r.can_review or r.can_moderate))
        )
    );
$$;

create or replace function public.decide_coven_advancement(p_request uuid, p_approve boolean, p_note text default null)
returns public.coven_advancement_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.coven_advancement_requests;
begin
  select * into req from public.coven_advancement_requests where id = p_request for update;
  if req.id is null then raise exception 'That request was not found.'; end if;
  if req.status <> 'pending' then raise exception 'That request has already been decided.'; end if;
  if req.user_id = auth.uid() and not public.is_community_moderator() then raise exception 'You cannot decide your own request.'; end if;
  if not (public.coven_permission(req.coven_id, 'review') or public.is_community_moderator()) then
    raise exception 'Only the coven''s reviewers can decide advancement.';
  end if;
  if p_approve then
    if not public.coven_can_grant(req.coven_id, req.rank_id) then
      raise exception 'That position must be granted by someone more senior.';
    end if;
    update public.coven_members set rank_id = req.rank_id
    where coven_id = req.coven_id and user_id = req.user_id and status = 'active';
    if not found then raise exception 'That person is no longer a member.'; end if;
  end if;
  update public.coven_advancement_requests
  set status = case when p_approve then 'approved' else 'declined' end,
      reviewer_id = auth.uid(), reviewer_note = nullif(btrim(p_note), ''), decided_at = now()
  where id = p_request
  returning * into req;
  return req;
end;
$$;

-- Change a member's rank, mute them, or remove or ban them from the coven.
create or replace function public.update_coven_member(
  p_coven uuid,
  p_user uuid,
  p_rank uuid default null,
  p_status text default null,
  p_muted_until timestamptz default null,
  p_clear_mute boolean default false
)
returns public.coven_members
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.coven_members;
  site_moderator boolean := public.is_community_moderator();
  updated public.coven_members;
begin
  select * into target from public.coven_members where coven_id = p_coven and user_id = p_user for update;
  if target.coven_id is null then raise exception 'That person is not in this coven.'; end if;
  if p_user = auth.uid() and not site_moderator then raise exception 'You cannot change your own membership here.'; end if;
  if not site_moderator then
    if p_user = (select founder_id from public.covens where id = p_coven) then
      raise exception 'Only site moderators can act on a coven''s founder.';
    end if;
    if public.coven_level(p_coven, p_user) >= public.coven_level(p_coven) then
      raise exception 'You can only act on members junior to you.';
    end if;
  end if;

  if p_rank is not null then
    if not public.coven_can_grant(p_coven, p_rank) or not (site_moderator or public.coven_permission(p_coven, 'review')) then
      raise exception 'You cannot grant that position.';
    end if;
  end if;
  if (p_status is not null or p_muted_until is not null or p_clear_mute)
     and not (site_moderator or public.coven_permission(p_coven, 'moderate')) then
    raise exception 'Only the coven''s moderators can mute or remove members.';
  end if;
  if p_status is not null and p_status not in ('active', 'removed', 'banned') then
    raise exception 'Unknown membership status.';
  end if;

  update public.coven_members
  set rank_id = coalesce(p_rank, rank_id),
      status = coalesce(p_status, status),
      muted_until = case when p_clear_mute then null else coalesce(p_muted_until, muted_until) end
  where coven_id = p_coven and user_id = p_user
  returning * into updated;
  return updated;
end;
$$;

create or replace function public.leave_coven(p_coven uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select founder_id from public.covens where id = p_coven) = auth.uid() then
    raise exception 'Hand the coven to another member before you leave it.';
  end if;
  update public.coven_members set status = 'left' where coven_id = p_coven and user_id = auth.uid() and status = 'active';
  update public.coven_advancement_requests set status = 'withdrawn', decided_at = now()
  where coven_id = p_coven and user_id = auth.uid() and status = 'pending';
end;
$$;

create or replace function public.transfer_coven(p_coven uuid, p_user uuid)
returns public.covens
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.covens;
begin
  select * into c from public.covens where id = p_coven for update;
  if c.id is null then raise exception 'That coven was not found.'; end if;
  if not (c.founder_id = auth.uid() or public.is_community_moderator()) then
    raise exception 'Only the founder or a site moderator can hand on a coven.';
  end if;
  if not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_user and status = 'active') then
    raise exception 'The new leader must be an active member.';
  end if;
  update public.covens set founder_id = p_user where id = p_coven returning * into c;
  return c;
end;
$$;

create or replace function public.remove_coven_message(p_message uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.coven_messages;
begin
  select * into m from public.coven_messages where id = p_message for update;
  if m.id is null or m.deleted_at is not null then return; end if;
  if not (m.user_id = auth.uid() or public.coven_permission(m.coven_id, 'moderate') or public.is_community_moderator()) then
    raise exception 'You cannot remove that message.';
  end if;
  -- The words go; a report keeps its own copy for the moderators.
  update public.coven_messages set body = '', deleted_at = now(), deleted_by = auth.uid() where id = p_message;
end;
$$;

create or replace function public.edit_coven_message(p_message uuid, p_body text)
returns public.coven_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.coven_messages;
begin
  select * into m from public.coven_messages where id = p_message for update;
  if m.id is null or m.deleted_at is not null or m.user_id <> auth.uid() then raise exception 'You cannot edit that message.'; end if;
  if m.created_at < now() - interval '1 day' then raise exception 'Messages can be edited for a day after sending.'; end if;
  if not public.coven_in_good_standing(m.coven_id) then raise exception 'You cannot send messages in this coven right now.'; end if;
  if char_length(btrim(p_body)) = 0 or char_length(p_body) > 2000 then raise exception 'A message needs between 1 and 2000 characters.'; end if;
  update public.coven_messages set body = p_body, edited_at = now() where id = p_message returning * into m;
  return m;
end;
$$;

create or replace function public.moderate_coven(p_coven uuid, p_status text, p_note text default null)
returns public.covens
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.covens;
begin
  if not public.is_community_moderator() then raise exception 'Only site moderators can do that.'; end if;
  if p_status not in ('active', 'suspended', 'archived') then raise exception 'Unknown coven status.'; end if;
  update public.covens set status = p_status, moderation_note = nullif(btrim(p_note), '')
  where id = p_coven returning * into c;
  return c;
end;
$$;

-- Admins name or stand down site moderators by email.
create or replace function public.set_community_moderator(p_email text, p_enabled boolean)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target uuid;
begin
  if not public.has_role('admin') then raise exception 'Only admins can name moderators.'; end if;
  select id into target from auth.users where lower(email) = lower(btrim(p_email));
  if target is null then raise exception 'No account uses that email.'; end if;
  if p_enabled then
    insert into public.user_roles (user_id, role)
    select target, 'moderator'
    where not exists (select 1 from public.user_roles where user_id = target and role = 'moderator');
  else
    delete from public.user_roles where user_id = target and role = 'moderator';
  end if;
  return target;
end;
$$;

create or replace function public.list_community_moderators()
returns table (user_id uuid, role text, email text, display_name text)
language sql
stable
security definer
set search_path = public, auth
as $$
  select r.user_id, r.role,
         case when public.has_role('admin') then u.email::text else null end,
         p.display_name
  from public.user_roles r
  join auth.users u on u.id = r.user_id
  left join public.coven_profiles p on p.user_id = r.user_id
  where r.role in ('admin', 'moderator') and public.is_community_moderator()
  order by r.role, p.display_name;
$$;

-- Functions are callable by signed-in people only (the directory needs none).
revoke execute on function
  public.create_coven(text, text, text, text, text, text[], text, text, text, text),
  public.join_coven(uuid),
  public.apply_to_coven(uuid, jsonb, text),
  public.withdraw_coven_request(text, uuid),
  public.decide_coven_application(uuid, boolean, text),
  public.request_coven_advancement(uuid, uuid, text),
  public.decide_coven_advancement(uuid, boolean, text),
  public.update_coven_member(uuid, uuid, uuid, text, timestamptz, boolean),
  public.leave_coven(uuid),
  public.transfer_coven(uuid, uuid),
  public.remove_coven_message(uuid),
  public.edit_coven_message(uuid, text),
  public.moderate_coven(uuid, text, text),
  public.set_community_moderator(text, boolean),
  public.list_community_moderators()
from public, anon;

grant execute on function
  public.create_coven(text, text, text, text, text, text[], text, text, text, text),
  public.join_coven(uuid),
  public.apply_to_coven(uuid, jsonb, text),
  public.withdraw_coven_request(text, uuid),
  public.decide_coven_application(uuid, boolean, text),
  public.request_coven_advancement(uuid, uuid, text),
  public.decide_coven_advancement(uuid, boolean, text),
  public.update_coven_member(uuid, uuid, uuid, text, timestamptz, boolean),
  public.leave_coven(uuid),
  public.transfer_coven(uuid, uuid),
  public.remove_coven_message(uuid),
  public.edit_coven_message(uuid, text),
  public.moderate_coven(uuid, text, text),
  public.set_community_moderator(text, boolean),
  public.list_community_moderators()
to authenticated;

-- Internal helpers: policies for signed-in people use them, so only they may
-- call them. is_coven_member, is_community_moderator and member_count stay
-- callable by everyone because the public directory's policies need them.
revoke execute on function
  public.coven_can_grant(uuid, uuid), public.coven_in_good_standing(uuid), public.coven_level(uuid, uuid),
  public.coven_permission(uuid, text), public.coven_require_profile(), public.coven_seat_available(uuid),
  public.coven_unsigned_agreements(uuid, uuid), public.is_community_banned(uuid)
from public, anon;
grant execute on function
  public.coven_can_grant(uuid, uuid), public.coven_in_good_standing(uuid), public.coven_level(uuid, uuid),
  public.coven_permission(uuid, text), public.coven_require_profile(), public.coven_seat_available(uuid),
  public.coven_unsigned_agreements(uuid, uuid), public.is_community_banned(uuid)
to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: chat and the altar arrive live (RLS still decides who sees them)
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_messages') then
      alter publication supabase_realtime add table public.coven_messages;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_altar_items') then
      alter publication supabase_realtime add table public.coven_altar_items;
    end if;
  end if;
end;
$$;
