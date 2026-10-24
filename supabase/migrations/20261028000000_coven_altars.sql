-- Coven altars: the whole altar, shared.
--
-- A coven has one main ritual altar, kept by the coven's head, and any member
-- in good standing can start more. Each altar is the same document the
-- personal altar saves (saved_altars.altar_data), split so several people can
-- tend it at once: the altar's own settings in coven_altars, and every object
-- on it as its own row in coven_altar_objects (keyed by its altarObjectId), so
-- two people moving two candles never overwrite each other.
--
-- The coven's head decides who may do all of this, through the powers each
-- position carries (below): who starts altars, who tends them, who keeps them.
--
-- Who can change an altar (coven_altar_can_edit), always a member in good
-- standing:
--   * While a coven ritual is live on it, the ritual decides: its leader and
--     the altar's keeper always can, and otherwise the current step's
--     altar_access: 'assigned' (whoever the step belongs to, everyone when it
--     is the whole coven's), 'everyone', or 'leader' (only the leader).
--   * Otherwise its keeper always can (the coven's head, positions that keep
--     altars, and for an altar a member started, that member too). A locked
--     altar is its keepers' alone. edit_mode says who else: 'members'
--     (everyone), 'chosen' (positions that tend altars, and the people and
--     positions in coven_altar_editors) or 'keeper' (no one else).
-- Everyone in the coven, and site moderators, can see every altar.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- A picture an altar may show: the site's own artwork, or a picture a member
-- uploaded to their own folder in the public user-assets bucket.
create or replace function public.coven_altar_picture_ok(p_url text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select p_url is null or p_url = ''
    or (p_url ~ '^(\.\./|/)?assets/altar/[A-Za-z0-9/_.%-]+\.(png|PNG|jpg|jpeg|webp|svg)$' and p_url !~ '\.\./.*\.\./')
    or p_url ~ '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/user-assets/[A-Za-z0-9/_.%-]+$';
$$;

-- Every address inside an object's data must be one of those pictures: no
-- outside links, no pictures kept only on someone's phone.
create or replace function public.coven_altar_data_ok(p_data jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select p_data::text !~* '"\s*(data|file|javascript|content|blob):'
    and not exists (
      select 1 from regexp_matches(p_data::text, '(https?://[^"\\ ]*)', 'g') as m
      where not public.coven_altar_picture_ok(m[1])
    );
$$;

create table if not exists public.coven_altars (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  is_main boolean not null default false,
  edit_mode text not null default 'members' check (edit_mode in ('members', 'chosen', 'keeper')),
  locked boolean not null default false,
  background text not null default '' check (public.coven_altar_picture_ok(background)),
  background_name text not null default '' check (char_length(background_name) <= 120),
  groups jsonb not null default '[]'::jsonb check (jsonb_typeof(groups) = 'array' and octet_length(groups::text) <= 20000),
  active_group_id text check (active_group_id is null or char_length(active_group_id) <= 80),
  -- Any other altar_data fields the altar keeps (as saved_altars does).
  extra jsonb not null default '{}'::jsonb check (jsonb_typeof(extra) = 'object' and octet_length(extra::text) <= 20000),
  -- Cleared away by its keeper: hidden, and kept so it can be brought back.
  archived_at timestamptz,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists coven_altars_one_main on public.coven_altars (coven_id) where is_main;
create index if not exists coven_altars_coven_idx on public.coven_altars (coven_id, created_at);

create table if not exists public.coven_altar_objects (
  altar_id uuid not null references public.coven_altars (id) on delete cascade,
  object_key text not null check (object_key ~ '^[A-Za-z0-9_.:-]{1,100}$'),
  coven_id uuid not null references public.covens (id) on delete cascade,
  -- Where it sits in the altar's list (the order things were set down).
  position double precision not null default 0,
  -- The object exactly as the personal altar saves it (lib/altar/types.ts SavedObject).
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 32000),
  updated_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (altar_id, object_key)
);

create index if not exists coven_altar_objects_coven_idx on public.coven_altar_objects (coven_id);

-- The people and positions a keeper has chosen to tend an altar ('chosen').
create table if not exists public.coven_altar_editors (
  id uuid primary key default gen_random_uuid(),
  altar_id uuid not null references public.coven_altars (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  rank_id uuid references public.coven_ranks (id) on delete cascade,
  active boolean not null default true,
  added_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check ((user_id is null) <> (rank_id is null))
);

create unique index if not exists coven_altar_editors_user on public.coven_altar_editors (altar_id, user_id) where user_id is not null;
create unique index if not exists coven_altar_editors_rank on public.coven_altar_editors (altar_id, rank_id) where rank_id is not null;

-- Which altar a ritual is held at (none: the coven's main altar), and what
-- each step lets people do there.
alter table public.coven_rituals add column if not exists altar_id uuid references public.coven_altars (id) on delete set null;
alter table public.coven_ritual_steps add column if not exists altar_access text not null default 'assigned'
  check (altar_access in ('assigned', 'everyone', 'leader'));


-- ---------------------------------------------------------------------------
-- Position powers for altars and chat
-- ---------------------------------------------------------------------------
-- The coven's head decides what every position can do. These join the
-- position powers the head (and those who lead the coven) set in Positions:
--   can_start_altars  starts new altars for the coven (every position, to begin with)
--   can_tend_altars   tends altars kept for chosen people, the main altar among them
--   can_keep_altars   keeps every altar: chooses who tends each one, locks it
--   can_chat          talks in the coven's chat (every position, to begin with)
alter table public.coven_ranks add column if not exists can_start_altars boolean not null default true;
alter table public.coven_ranks add column if not exists can_tend_altars boolean not null default false;
alter table public.coven_ranks add column if not exists can_keep_altars boolean not null default false;
alter table public.coven_ranks add column if not exists can_chat boolean not null default true;

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
          when 'lead' then coalesce(r.can_lead_rituals or r.can_moderate or r.can_manage, false)
          when 'schedule' then coalesce(r.can_schedule_rites or r.can_manage, false)
          when 'write_book' then coalesce(r.can_write_book or r.can_approve_book or r.can_manage, false)
          when 'approve_book' then coalesce(r.can_approve_book or r.can_manage, false)
          when 'programs' then coalesce(r.can_manage_programs or r.can_manage, false)
            or exists (select 1 from public.coven_grants g where g.coven_id = target and g.user_id = auth.uid() and g.power = 'manage_programs')
          when 'progress' then coalesce(r.can_view_progress or r.can_manage_programs or r.can_manage, false)
            or exists (select 1 from public.coven_grants g where g.coven_id = target and g.user_id = auth.uid())
          when 'start_altars' then coalesce(r.can_start_altars or r.can_keep_altars or r.can_manage, true)
          when 'tend_altars' then coalesce(r.can_tend_altars or r.can_keep_altars or r.can_manage, false)
          when 'keep_altars' then coalesce(r.can_keep_altars or r.can_manage, false)
          when 'chat' then coalesce(r.can_chat or r.can_moderate or r.can_manage, true)
          else false
        end
      )
  );
$$;

-- Reviewers can't hand out positions that keep or tend the altars either.
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
              and not (r.can_manage or r.can_review or r.can_moderate or r.can_manage_programs or r.can_view_progress
                       or r.can_keep_altars or r.can_tend_altars))
        )
    );
$$;

-- Chat is for those whose position may talk there.
drop policy if exists "Members in good standing send messages" on public.coven_messages;
create policy "Members in good standing send messages" on public.coven_messages
  for insert to authenticated
  with check (user_id = auth.uid() and public.coven_in_good_standing(coven_id) and public.coven_permission(coven_id, 'chat'));

-- ---------------------------------------------------------------------------
-- Who keeps and who tends an altar
-- ---------------------------------------------------------------------------

-- The coven's head, and positions that keep altars, keep every altar;
-- whoever started an altar keeps it too.
create or replace function public.coven_altar_keeper(p_altar uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.coven_altars a
    join public.covens c on c.id = a.coven_id
    where a.id = p_altar
      and auth.uid() is not null
      and public.coven_permission(a.coven_id, 'member')
      and (c.founder_id = auth.uid() or public.coven_permission(a.coven_id, 'keep_altars') or (not a.is_main and a.created_by = auth.uid()))
  ) or public.is_community_moderator();
$$;

-- The live ritual being held at an altar, if there is one.
create or replace function public.coven_altar_live_ritual(p_altar uuid)
returns public.coven_rituals
language sql
stable
security definer
set search_path = public
as $$
  select r.*
  from public.coven_altars a
  join public.coven_rituals r on r.coven_id = a.coven_id and r.status = 'live'
  where a.id = p_altar
    and coalesce(r.altar_id, (select m.id from public.coven_altars m where m.coven_id = a.coven_id and m.is_main)) = a.id
  order by r.started_at desc nulls last
  limit 1;
$$;

create or replace function public.coven_altar_can_edit(p_altar uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  a public.coven_altars;
  r public.coven_rituals;
  s public.coven_ritual_steps;
begin
  select * into a from public.coven_altars where id = p_altar;
  if a.id is null or a.archived_at is not null or auth.uid() is null or not public.coven_in_good_standing(a.coven_id) then return false; end if;
  r := public.coven_altar_live_ritual(a.id);
  if r.id is not null then
    if public.coven_altar_keeper(a.id) or r.led_by = auth.uid() then return true; end if;
    select * into s from public.coven_ritual_steps where id = r.current_step_id;
    if s.id is null then return false; end if;
    return case s.altar_access
      when 'everyone' then true
      when 'assigned' then public.coven_step_is_mine(s.id)
      else false
    end;
  end if;
  if public.coven_altar_keeper(a.id) then return true; end if;
  if a.locked or a.edit_mode = 'keeper' then return false; end if;
  if a.edit_mode = 'members' or public.coven_permission(a.coven_id, 'tend_altars') then return true; end if;
  return exists (
    select 1
    from public.coven_altar_editors e
    left join public.coven_members m on m.coven_id = a.coven_id and m.user_id = auth.uid() and m.status = 'active'
    where e.altar_id = a.id and e.active and (e.user_id = auth.uid() or (e.rank_id is not null and e.rank_id = m.rank_id))
  );
end;
$$;

-- What the altar screen shows: whether you can change it, whether you keep
-- it, and why not when you can't.
create or replace function public.coven_altar_access(p_altar uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  a public.coven_altars;
  r public.coven_rituals;
  s public.coven_ritual_steps;
  can boolean;
  keeper boolean;
  why text := null;
begin
  select * into a from public.coven_altars where id = p_altar;
  if a.id is null or not (public.is_coven_member(a.coven_id) or public.is_community_moderator()) then
    return jsonb_build_object('can_edit', false, 'keeper', false, 'ritual_id', null, 'reason', 'This altar isn''t open to you.');
  end if;
  can := public.coven_altar_can_edit(a.id);
  keeper := public.coven_altar_keeper(a.id);
  r := public.coven_altar_live_ritual(a.id);
  if not can then
    if not public.coven_in_good_standing(a.coven_id) then
      why := 'Sign the coven''s current agreements to tend its altars.';
    elsif r.id is not null then
      select * into s from public.coven_ritual_steps where id = r.current_step_id;
      why := case
        when s.id is null then 'A ritual is under way here. The altar waits for its next step.'
        when s.altar_access = 'leader' then 'A ritual is under way. During this step only its leader tends the altar.'
        else 'A ritual is under way. During this step the altar is tended by the person whose step it is.'
      end;
    elsif a.locked then
      why := 'This altar is locked by its keeper.';
    elsif a.edit_mode = 'keeper' then
      why := 'Only this altar''s keeper tends it. You can watch it here.';
    else
      why := 'Only the people its keeper has chosen tend this altar. You can watch it here.';
    end if;
  end if;
  return jsonb_build_object('can_edit', can, 'keeper', keeper, 'ritual_id', r.id, 'reason', why);
end;
$$;

-- ---------------------------------------------------------------------------
-- Guards
-- ---------------------------------------------------------------------------

-- Keeper-only fields change only through the functions below, which say so.
create or replace function public.guard_coven_altar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(current_setting('coven.altar_keeper', true), '') <> 'on' then
    if tg_op = 'INSERT' then raise exception 'Start an altar from the coven''s altars.'; end if;
    if new.coven_id <> old.coven_id or new.is_main <> old.is_main or new.name <> old.name or new.edit_mode <> old.edit_mode
       or new.locked <> old.locked or new.created_by is distinct from old.created_by or new.archived_at is distinct from old.archived_at then
      raise exception 'Only the altar''s keeper changes that.';
    end if;
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create or replace function public.guard_coven_altar_object()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (new.altar_id <> old.altar_id or new.object_key <> old.object_key) then
    raise exception 'Move things between altars by placing them again.';
  end if;
  select coven_id into new.coven_id from public.coven_altars where id = new.altar_id;
  if not public.coven_altar_data_ok(new.data) then
    raise exception 'Only the altar''s own pictures and pictures you have uploaded can go on a coven altar.';
  end if;
  if tg_op = 'INSERT' and (select count(*) from public.coven_altar_objects where altar_id = new.altar_id) >= 250 then
    raise exception 'This altar is full. Clear something away first.';
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists coven_altars_guard on public.coven_altars;
create trigger coven_altars_guard before insert or update on public.coven_altars
  for each row execute function public.guard_coven_altar();
drop trigger if exists coven_altar_objects_guard on public.coven_altar_objects;
create trigger coven_altar_objects_guard before insert or update on public.coven_altar_objects
  for each row execute function public.guard_coven_altar_object();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.coven_altars enable row level security;
alter table public.coven_altar_objects enable row level security;
alter table public.coven_altar_editors enable row level security;

drop policy if exists "Members and moderators see the coven's altars" on public.coven_altars;
create policy "Members and moderators see the coven's altars" on public.coven_altars
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());
drop policy if exists "Those who may tend an altar set its scene" on public.coven_altars;
create policy "Those who may tend an altar set its scene" on public.coven_altars
  for update to authenticated using (public.coven_altar_can_edit(id)) with check (public.coven_altar_can_edit(id));

drop policy if exists "Members and moderators see what is on the altars" on public.coven_altar_objects;
create policy "Members and moderators see what is on the altars" on public.coven_altar_objects
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());
-- Setting things down, moving and tending them, and clearing them away.
drop policy if exists "Those who may tend an altar change what is on it" on public.coven_altar_objects;
create policy "Those who may tend an altar change what is on it" on public.coven_altar_objects
  for all to authenticated using (public.coven_altar_can_edit(altar_id)) with check (public.coven_altar_can_edit(altar_id));

drop policy if exists "Members and moderators see who tends the altars" on public.coven_altar_editors;
create policy "Members and moderators see who tends the altars" on public.coven_altar_editors
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------

-- The coven's main ritual altar, made the first time it's needed. Its scene
-- starts as the coven's chosen altar background.
create or replace function public.coven_ensure_main_altar(p_coven uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  found uuid;
  bg text;
begin
  select id into found from public.coven_altars where coven_id = p_coven and is_main;
  if found is not null then return found; end if;
  select altar_background into bg from public.covens where id = p_coven;
  perform set_config('coven.altar_keeper', 'on', true);
  insert into public.coven_altars (coven_id, name, is_main, edit_mode, background, background_name, created_by)
  select p_coven, 'The ritual altar', true, 'chosen', coalesce(b.path, ''), coalesce(b.name, ''), null
  from (select 1) one
  left join (values
    ('ocean', 'Moonlit Shore', '/assets/altar/backgrounds/ocean.png'),
    ('river', 'Forest River', '/assets/altar/backgrounds/river.png'),
    ('witch-cabin', 'Witch’s Cabin', '/assets/altar/backgrounds/witch-cabin.png'),
    ('dark-academia', 'Dark Academia Study', '/assets/altar/backgrounds/dark-academia.png'),
    ('gothic', 'Gothic Crypt', '/assets/altar/backgrounds/gothic.png'),
    ('cottagecore', 'Cottagecore Garden', '/assets/altar/backgrounds/cottagecore.png'),
    ('celestial', 'Celestial Hilltop', '/assets/altar/backgrounds/celestial.png'),
    ('winter-yule', 'Yule Hearth', '/assets/altar/backgrounds/winter-yule.png'),
    ('spring-meadow', 'Spring Meadow', '/assets/altar/backgrounds/spring-meadow.png'),
    ('autumn-harvest', 'Autumn Harvest', '/assets/altar/backgrounds/autumn-harvest.png'),
    ('desert-temple', 'Desert Temple', '/assets/altar/backgrounds/desert-temple.png'),
    ('candlelit-cave', 'Candlelit Crystal Cave', '/assets/altar/backgrounds/candlelit-cave.png')
  ) as b (id, name, path) on b.id = bg
  on conflict do nothing
  returning id into found;
  perform set_config('coven.altar_keeper', 'off', true);
  if found is null then
    select id into found from public.coven_altars where coven_id = p_coven and is_main;
  end if;
  return found;
end;
$$;

create or replace function public.coven_altars_for_new_coven()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.coven_ensure_main_altar(new.id);
  return new;
end;
$$;

drop trigger if exists covens_main_altar on public.covens;
create trigger covens_main_altar after insert on public.covens
  for each row execute function public.coven_altars_for_new_coven();

-- Every coven that already exists gets its main altar now.
select public.coven_ensure_main_altar(id) from public.covens;

-- Any member in good standing starts an altar of their own for the coven.
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
  if (select count(*) from public.coven_altars where coven_id = p_coven) >= 40 then
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

-- The keeper names the altar and says who tends it.
create or replace function public.set_coven_altar(p_altar uuid, p_name text, p_edit_mode text, p_locked boolean)
returns public.coven_altars
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_altars;
begin
  if not public.coven_altar_keeper(p_altar) then raise exception 'Only the altar''s keeper changes that.'; end if;
  if p_edit_mode not in ('members', 'chosen', 'keeper') then raise exception 'Unknown choice.'; end if;
  perform set_config('coven.altar_keeper', 'on', true);
  update public.coven_altars
  set name = left(btrim(coalesce(nullif(btrim(p_name), ''), name)), 80), edit_mode = p_edit_mode, locked = coalesce(p_locked, false)
  where id = p_altar
  returning * into saved;
  perform set_config('coven.altar_keeper', 'off', true);
  return saved;
end;
$$;

create or replace function public.set_coven_altar_editor(p_altar uuid, p_user uuid, p_rank uuid, p_enabled boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.coven_altars;
begin
  select * into a from public.coven_altars where id = p_altar;
  if a.id is null or not public.coven_altar_keeper(a.id) then raise exception 'Only the altar''s keeper chooses who tends it.'; end if;
  if (p_user is null) = (p_rank is null) then raise exception 'Choose one person or one position.'; end if;
  if p_user is not null and not exists (select 1 from public.coven_members where coven_id = a.coven_id and user_id = p_user and status = 'active') then
    raise exception 'That person is not a member of this coven.';
  end if;
  if p_rank is not null and not exists (select 1 from public.coven_ranks where id = p_rank and coven_id = a.coven_id) then
    raise exception 'That position is not one of this coven''s.';
  end if;
  update public.coven_altar_editors set active = coalesce(p_enabled, false)
  where altar_id = a.id and (user_id = p_user or (p_rank is not null and rank_id = p_rank));
  if p_enabled and not found then
    insert into public.coven_altar_editors (altar_id, coven_id, user_id, rank_id) values (a.id, a.coven_id, p_user, p_rank);
  end if;
  return coalesce(p_enabled, false);
end;
$$;

-- A keeper clears away an altar they started (the main altar stays), or
-- brings back one they cleared away.
create or replace function public.archive_coven_altar(p_altar uuid, p_archived boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.coven_altars;
begin
  select * into a from public.coven_altars where id = p_altar;
  if a.id is null then return false; end if;
  if a.is_main then raise exception 'The coven''s ritual altar stays. Clear things from it instead.'; end if;
  if not public.coven_altar_keeper(a.id) then raise exception 'Only the altar''s keeper clears it away.'; end if;
  if p_archived and (public.coven_altar_live_ritual(a.id)).id is not null then raise exception 'A ritual is under way at this altar.'; end if;
  perform set_config('coven.altar_keeper', 'on', true);
  update public.coven_altars set archived_at = case when p_archived then now() else null end where id = a.id;
  perform set_config('coven.altar_keeper', 'off', true);
  return coalesce(p_archived, false);
end;
$$;

-- The ritual's leader chooses its altar and what each step lets people do
-- there (p_access in step order: 'assigned', 'everyone' or 'leader').
create or replace function public.set_coven_ritual_altar(p_ritual uuid, p_altar uuid, p_access text[])
returns public.coven_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals := public.coven_ritual_leader(p_ritual);
  s record;
  n integer := 0;
begin
  if p_altar is not null and not exists (select 1 from public.coven_altars where id = p_altar and coven_id = r.coven_id) then
    raise exception 'That altar is not one of this coven''s.';
  end if;
  if exists (select 1 from unnest(coalesce(p_access, '{}')) as x where x not in ('assigned', 'everyone', 'leader')) then
    raise exception 'Unknown choice.';
  end if;
  update public.coven_rituals set altar_id = p_altar, updated_at = now() where id = r.id returning * into r;
  if p_access is not null then
    for s in select id from public.coven_ritual_steps where ritual_id = r.id order by position loop
      n := n + 1;
      if n <= coalesce(array_length(p_access, 1), 0) then
        update public.coven_ritual_steps set altar_access = p_access[n], updated_at = now() where id = s.id;
      end if;
    end loop;
  end if;
  return r;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants and live updates
-- ---------------------------------------------------------------------------

revoke execute on function public.coven_altars_for_new_coven(), public.coven_ensure_main_altar(uuid),
  public.guard_coven_altar(), public.guard_coven_altar_object() from public, anon, authenticated;
revoke execute on function
  public.coven_altar_keeper(uuid), public.coven_altar_live_ritual(uuid), public.coven_altar_can_edit(uuid), public.coven_altar_access(uuid),
  public.create_coven_altar(uuid, text, text), public.set_coven_altar(uuid, text, text, boolean),
  public.set_coven_altar_editor(uuid, uuid, uuid, boolean), public.archive_coven_altar(uuid, boolean),
  public.set_coven_ritual_altar(uuid, uuid, text[])
from public, anon;
grant execute on function
  public.coven_altar_keeper(uuid), public.coven_altar_live_ritual(uuid), public.coven_altar_can_edit(uuid), public.coven_altar_access(uuid),
  public.create_coven_altar(uuid, text, text), public.set_coven_altar(uuid, text, text, boolean),
  public.set_coven_altar_editor(uuid, uuid, uuid, boolean), public.archive_coven_altar(uuid, boolean),
  public.set_coven_ritual_altar(uuid, uuid, text[])
to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_altars') then
      alter publication supabase_realtime add table public.coven_altars;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_altar_objects') then
      alter publication supabase_realtime add table public.coven_altar_objects;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_altar_editors') then
      alter publication supabase_realtime add table public.coven_altar_editors;
    end if;
  end if;
end;
$$;
