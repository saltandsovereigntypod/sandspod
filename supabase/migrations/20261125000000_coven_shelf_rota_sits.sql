-- NOT YET APPLIED. Needs the coven migrations before it (covens, rites,
-- rsvps, coven_permission with 'lead', user_blocks, coven_profiles).
--
-- Four things, each additive (new tables only; no new foreign key from an
-- existing table):
--
-- * The coven's shared shelf (coven_shelf_items): the coven's own things,
--   kept like My Shelves (app lib/shelves/model.ts ShelfItem, in `item`),
--   with who holds each, and whether it needs cleansing. Members see and add;
--   whoever added or holds a thing may change it; those who lead the coven's
--   rites (coven_permission 'lead') and its head change or remove anything.
-- * The duties rota (coven_rota_duties, coven_rota_swaps): duties that turn
--   among members from one gathering to the next. The leader sets each duty
--   and its order of people; the app works out who has it at each gathering
--   (lib/covens/rota.ts), so nothing is stored per gathering except swaps.
--   A swap is asked of one member, who accepts or declines; a leader may
--   simply reassign (a swap made accepted at once).
-- * Public sits (public_sits, public_sit_people): a group meditation anyone
--   signed in can schedule in Community; others join, and at the start time
--   everyone's timer starts together. No audio or video passes between
--   people. Only how many are sitting is shown (joined_count, kept by a
--   trigger), never who. Blocks work both ways, as for the rest of the
--   community: you don't see sits hosted by someone you've blocked or who
--   has blocked you, and a community ban stops scheduling and joining.
--   Reports go to the moderators as for Community Rituals (the app's
--   pre-filled email), with hide and block on the device and the account.
--
-- The year in review needs no tables: it is worked out from what each person
-- can already read (lib/covens/yearReview.ts).

-- ---------------------------------------------------------------------------
-- The coven's shared shelf
-- ---------------------------------------------------------------------------

create table if not exists public.coven_shelf_items (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  -- The thing, as My Shelves keeps it (name, shelf, quantity, where, notes...).
  item jsonb not null check (jsonb_typeof(item) = 'object' and octet_length(item::text) <= 16000),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  -- Who keeps it between gatherings; null: the coven's store.
  holder_id uuid references auth.users (id) on delete set null,
  needs_cleansing boolean not null default false,
  cleansed_on date,
  added_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_shelf_items_coven_idx on public.coven_shelf_items (coven_id, name);
create index if not exists coven_shelf_items_holder_idx on public.coven_shelf_items (holder_id) where holder_id is not null;

create or replace function public.coven_shelf_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  if tg_op = 'UPDATE' then
    new.coven_id := old.coven_id;
    new.added_by := old.added_by;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists coven_shelf_items_touch on public.coven_shelf_items;
create trigger coven_shelf_items_touch before insert or update on public.coven_shelf_items
  for each row execute function public.coven_shelf_touch();

alter table public.coven_shelf_items enable row level security;

drop policy if exists "Members and moderators see the coven's shelf" on public.coven_shelf_items;
create policy "Members and moderators see the coven's shelf" on public.coven_shelf_items
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());
drop policy if exists "Members in good standing add to the shelf" on public.coven_shelf_items;
create policy "Members in good standing add to the shelf" on public.coven_shelf_items
  for insert to authenticated with check (added_by = auth.uid() and public.coven_in_good_standing(coven_id));
drop policy if exists "Who added or holds a thing, and leaders, change it" on public.coven_shelf_items;
create policy "Who added or holds a thing, and leaders, change it" on public.coven_shelf_items
  for update to authenticated
  using (public.coven_in_good_standing(coven_id) and (added_by = auth.uid() or holder_id = auth.uid() or public.coven_permission(coven_id, 'lead')))
  with check (public.coven_in_good_standing(coven_id) and (added_by = auth.uid() or holder_id = auth.uid() or public.coven_permission(coven_id, 'lead')));
drop policy if exists "Who added a thing, and leaders, take it off" on public.coven_shelf_items;
create policy "Who added a thing, and leaders, take it off" on public.coven_shelf_items
  for delete to authenticated
  using ((added_by = auth.uid() and public.coven_in_good_standing(coven_id)) or public.coven_permission(coven_id, 'lead') or public.is_community_moderator());

grant select, insert, update, delete on public.coven_shelf_items to authenticated;

-- ---------------------------------------------------------------------------
-- The duties rota
-- ---------------------------------------------------------------------------

create table if not exists public.coven_rota_duties (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  detail text check (detail is null or char_length(detail) <= 500),
  -- Which gatherings it turns at: every one, rites only, or meetings only.
  applies text not null default 'all' check (applies in ('all', 'rite', 'meeting')),
  -- The people it turns among, in order (user ids).
  rotation uuid[] not null default '{}' check (cardinality(rotation) <= 200),
  -- Counting starts with the first gathering on or after this moment.
  starts_at timestamptz not null default now(),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_rota_duties_coven_idx on public.coven_rota_duties (coven_id, active, sort_order);

create table if not exists public.coven_rota_swaps (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  ritual_id uuid not null references public.coven_rituals (id) on delete cascade,
  duty_id uuid not null references public.coven_rota_duties (id) on delete cascade,
  -- Whose turn it was, and who takes it.
  from_user uuid not null references auth.users (id) on delete cascade,
  to_user uuid not null references auth.users (id) on delete cascade,
  -- A straight trade: the duty to_user had at the same gathering, which from_user takes.
  exchange_duty_id uuid references public.coven_rota_duties (id) on delete set null,
  note text check (note is null or char_length(note) <= 280),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'withdrawn')),
  requested_by uuid default auth.uid() references auth.users (id) on delete set null,
  decided_at timestamptz,
  asked_notified_at timestamptz,
  answer_notified_at timestamptz,
  created_at timestamptz not null default now(),
  check (from_user <> to_user)
);

create index if not exists coven_rota_swaps_coven_idx on public.coven_rota_swaps (coven_id, status, created_at);
create index if not exists coven_rota_swaps_ritual_idx on public.coven_rota_swaps (ritual_id);
create index if not exists coven_rota_swaps_to_idx on public.coven_rota_swaps (to_user, status);

create or replace function public.coven_rota_duty_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if tg_op = 'UPDATE' then
    new.coven_id := old.coven_id;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists coven_rota_duties_touch on public.coven_rota_duties;
create trigger coven_rota_duties_touch before insert or update on public.coven_rota_duties
  for each row execute function public.coven_rota_duty_touch();

-- A swap's own fields never change; only its answer does, and only as its
-- people may: the one asked accepts or declines, the one who asked
-- withdraws, a leader does any of these. Both must be active members, and
-- the gathering and duty must be the coven's own.
create or replace function public.coven_rota_swap_guard()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  leads boolean := public.coven_permission(new.coven_id, 'lead');
begin
  if tg_op = 'INSERT' then
    if not exists (select 1 from public.coven_rituals where id = new.ritual_id and coven_id = new.coven_id)
       or not exists (select 1 from public.coven_rota_duties where id = new.duty_id and coven_id = new.coven_id)
       or (new.exchange_duty_id is not null and not exists (select 1 from public.coven_rota_duties where id = new.exchange_duty_id and coven_id = new.coven_id))
       or not exists (select 1 from public.coven_members where coven_id = new.coven_id and user_id = new.to_user and status = 'active') then
      raise exception 'That swap doesn''t fit this coven.';
    end if;
    new.requested_by := auth.uid();
    new.asked_notified_at := null;
    new.answer_notified_at := null;
    if leads and new.status = 'accepted' then
      new.decided_at := now();
    else
      new.status := 'pending';
      new.decided_at := null;
    end if;
    return new;
  end if;
  if new.ritual_id <> old.ritual_id or new.duty_id <> old.duty_id or new.from_user <> old.from_user or new.to_user <> old.to_user
     or new.coven_id <> old.coven_id or new.exchange_duty_id is distinct from old.exchange_duty_id or new.requested_by is distinct from old.requested_by then
    raise exception 'A swap can only be answered.';
  end if;
  if public.coven_client_write() and new.status <> old.status then
    if not (
      leads
      or (old.status = 'pending' and auth.uid() = old.to_user and new.status in ('accepted', 'declined'))
      or (old.status = 'pending' and auth.uid() = old.from_user and new.status = 'withdrawn')
    ) then
      raise exception 'That answer isn''t yours to give.';
    end if;
    new.decided_at := now();
  end if;
  -- The notified marks are set by the coven-notify function (service role) only.
  if public.coven_client_write() then
    new.asked_notified_at := old.asked_notified_at;
    new.answer_notified_at := old.answer_notified_at;
  end if;
  return new;
end;
$$;

drop trigger if exists coven_rota_swaps_guard on public.coven_rota_swaps;
create trigger coven_rota_swaps_guard before insert or update on public.coven_rota_swaps
  for each row execute function public.coven_rota_swap_guard();

alter table public.coven_rota_duties enable row level security;
alter table public.coven_rota_swaps enable row level security;

drop policy if exists "Members and moderators see the rota" on public.coven_rota_duties;
create policy "Members and moderators see the rota" on public.coven_rota_duties
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());
drop policy if exists "Leaders keep the rota" on public.coven_rota_duties;
create policy "Leaders keep the rota" on public.coven_rota_duties
  for all to authenticated
  using (public.coven_in_good_standing(coven_id) and public.coven_permission(coven_id, 'lead'))
  with check (public.coven_in_good_standing(coven_id) and public.coven_permission(coven_id, 'lead'));

drop policy if exists "Members and moderators see the swaps" on public.coven_rota_swaps;
create policy "Members and moderators see the swaps" on public.coven_rota_swaps
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());
drop policy if exists "Members ask to swap their own turn; leaders reassign" on public.coven_rota_swaps;
create policy "Members ask to swap their own turn; leaders reassign" on public.coven_rota_swaps
  for insert to authenticated with check (
    public.coven_in_good_standing(coven_id)
    and (from_user = auth.uid() or public.coven_permission(coven_id, 'lead'))
  );
drop policy if exists "Those in a swap, and leaders, answer it" on public.coven_rota_swaps;
create policy "Those in a swap, and leaders, answer it" on public.coven_rota_swaps
  for update to authenticated
  using (public.is_coven_member(coven_id) and (auth.uid() in (from_user, to_user) or public.coven_permission(coven_id, 'lead')))
  with check (public.is_coven_member(coven_id) and (auth.uid() in (from_user, to_user) or public.coven_permission(coven_id, 'lead')));
drop policy if exists "Leaders clear swaps" on public.coven_rota_swaps;
create policy "Leaders clear swaps" on public.coven_rota_swaps
  for delete to authenticated using (public.coven_permission(coven_id, 'lead'));

grant select, insert, update, delete on public.coven_rota_duties to authenticated;
grant select, insert, update, delete on public.coven_rota_swaps to authenticated;

-- ---------------------------------------------------------------------------
-- Public sits
-- ---------------------------------------------------------------------------

create table if not exists public.public_sits (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  intention text check (intention is null or char_length(intention) <= 280),
  starts_at timestamptz not null,
  -- The sit itself, in minutes (settling and coming back are in `plan`).
  minutes integer not null check (minutes between 1 and 180),
  -- The sit's bells and settling (lib/meditation/timer.ts SitPlan).
  plan jsonb not null default '{}'::jsonb check (jsonb_typeof(plan) = 'object' and octet_length(plan::text) <= 2000),
  -- Sound: a shared drum or bowls (heard in step), and a binaural preset each plays for themselves.
  sound jsonb not null default '{}'::jsonb check (jsonb_typeof(sound) = 'object' and octet_length(sound::text) <= 2000),
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled', 'removed')),
  joined_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists public_sits_starts_idx on public.public_sits (status, starts_at);
create index if not exists public_sits_host_idx on public.public_sits (host_id, starts_at desc);

create table if not exists public.public_sit_people (
  sit_id uuid not null references public.public_sits (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (sit_id, user_id)
);

create index if not exists public_sit_people_user_idx on public.public_sit_people (user_id, joined_at desc);

-- Neither has blocked the other.
create or replace function public.not_blocked_between(other uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.user_blocks
    where (blocker_id = auth.uid() and blocked_id = other) or (blocker_id = other and blocked_id = auth.uid())
  );
$$;

create or replace function public.public_sit_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.host_id := auth.uid();
    new.status := 'scheduled';
    new.joined_count := 0;
    if new.starts_at < now() - interval '5 minutes' or new.starts_at > now() + interval '60 days' then
      raise exception 'Choose a start time from now to sixty days ahead.';
    end if;
    return new;
  end if;
  if public.coven_client_write() and not public.is_community_moderator() then
    new.host_id := old.host_id;
    new.joined_count := old.joined_count;
    new.created_at := old.created_at;
    if new.status = 'removed' or old.status = 'removed' then
      new.status := old.status;
    end if;
    -- Once it has begun, it's kept as it was (only cancelling remains).
    if old.starts_at <= now() then
      new.starts_at := old.starts_at;
      new.minutes := old.minutes;
      new.plan := old.plan;
      new.sound := old.sound;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists public_sits_guard on public.public_sits;
create trigger public_sits_guard before insert or update on public.public_sits
  for each row execute function public.public_sit_guard();

-- How many are sitting, kept on the sit (who they are stays private).
create or replace function public.public_sit_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.sit_id, old.sit_id);
begin
  update public.public_sits
    set joined_count = (select count(*) from public.public_sit_people where sit_id = target)
    where id = target;
  return null;
end;
$$;

drop trigger if exists public_sit_people_count on public.public_sit_people;
create trigger public_sit_people_count after insert or delete on public.public_sit_people
  for each row execute function public.public_sit_count();

alter table public.public_sits enable row level security;
alter table public.public_sit_people enable row level security;

drop policy if exists "Signed-in people see sits, except across a block" on public.public_sits;
create policy "Signed-in people see sits, except across a block" on public.public_sits
  for select to authenticated using (
    host_id = auth.uid()
    or public.is_community_moderator()
    or (status = 'scheduled' and public.not_blocked_between(host_id))
  );
drop policy if exists "People with a community profile schedule sits" on public.public_sits;
create policy "People with a community profile schedule sits" on public.public_sits
  for insert to authenticated with check (
    host_id = auth.uid()
    and not public.is_community_banned()
    and exists (select 1 from public.coven_profiles where user_id = auth.uid())
  );
drop policy if exists "Hosts change or cancel their sits; moderators remove" on public.public_sits;
create policy "Hosts change or cancel their sits; moderators remove" on public.public_sits
  for update to authenticated
  using (host_id = auth.uid() or public.is_community_moderator())
  with check (host_id = auth.uid() or public.is_community_moderator());
drop policy if exists "Hosts and moderators delete sits" on public.public_sits;
create policy "Hosts and moderators delete sits" on public.public_sits
  for delete to authenticated using (host_id = auth.uid() or public.is_community_moderator());

drop policy if exists "People see their own places in sits" on public.public_sit_people;
create policy "People see their own places in sits" on public.public_sit_people
  for select to authenticated using (user_id = auth.uid() or public.is_community_moderator());
drop policy if exists "People join a sit they can see" on public.public_sit_people;
create policy "People join a sit they can see" on public.public_sit_people
  for insert to authenticated with check (
    user_id = auth.uid()
    and not public.is_community_banned()
    and exists (
      select 1 from public.public_sits s
      where s.id = sit_id and s.status = 'scheduled'
        and s.starts_at + make_interval(mins => s.minutes + 30) > now()
        and public.not_blocked_between(s.host_id)
    )
  );
drop policy if exists "People leave a sit" on public.public_sit_people;
create policy "People leave a sit" on public.public_sit_people
  for delete to authenticated using (user_id = auth.uid());

grant select, insert, update, delete on public.public_sits to authenticated;
grant select, insert, delete on public.public_sit_people to authenticated;
grant execute on function public.not_blocked_between(uuid) to authenticated;
