-- NOT YET APPLIED. Cycle & Moon: encrypted sync, and an opt-in "in moon time"
-- status for chosen covens and people.
-- Needs every migration before it (through 20261115000000_coven_members_visiting_from_no_fk.sql).
-- Additive and safe to run again (paste it whole). The app and the website
-- work without it: Cycle & Moon keeps everything on the device until it's
-- applied.
--
-- * cycle_moon_vault: one row per person, only ciphertext. The notes are
--   encrypted on the device (app/src/lib/cycle/vault.ts) with a random data
--   key; the data key is kept here only wrapped, by a key made from the
--   person's passphrase (scrypt, parameters and salt in `kdf`) and by one
--   made from their recovery key. Nothing here can be read without one of
--   those, which never leave the device. Only the owner can read or change
--   their row. `revision` goes up by one on every change, so two devices
--   saving at once don't overwrite each other (the second sees the revision
--   moved, merges, and saves again).
-- * cycle_moon_status: a separate, plaintext status the person chooses to
--   publish: one of four fixed phrases (app/src/lib/cycle/status.ts), never
--   dates or notes, for at most eight days, to the covens and people they
--   choose. It can be read by them, while it lasts, and by its owner; a
--   coven sees it only while both are active members of that coven.
--   cycle_moon_statuses(coven) is what the coven's Members page reads.
-- * Deleting: the owner can delete both rows at any time ("Delete all my
--   Cycle & Moon data"); deleting the account removes them too
--   (supabase/functions/delete-account, and on delete cascade).
-- * No new foreign key between existing tables: the only references are from
--   these new tables to auth.users.

create table if not exists public.cycle_moon_vault (
  user_id uuid primary key references auth.users (id) on delete cascade,
  version smallint not null default 1,
  kdf jsonb,
  pass_key text,
  recovery_key text,
  ciphertext text not null,
  revision bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cycle_moon_vault_shape_check') then
    alter table public.cycle_moon_vault add constraint cycle_moon_vault_shape_check check (
      version = 1
      and char_length(ciphertext) between 40 and 4000000
      and (kdf is null or (jsonb_typeof(kdf) = 'object' and pg_column_size(kdf) <= 500))
      and (pass_key is null or char_length(pass_key) <= 200)
      and (recovery_key is null or char_length(recovery_key) <= 200)
    );
  end if;
end;
$$;

create or replace function public.cycle_moon_vault_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := now();
  new.user_id := old.user_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

drop trigger if exists cycle_moon_vault_touch on public.cycle_moon_vault;
create trigger cycle_moon_vault_touch before update on public.cycle_moon_vault
  for each row execute function public.cycle_moon_vault_touch();

alter table public.cycle_moon_vault enable row level security;

drop policy if exists "Cycle & Moon vault: owner reads" on public.cycle_moon_vault;
create policy "Cycle & Moon vault: owner reads" on public.cycle_moon_vault
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Cycle & Moon vault: owner adds" on public.cycle_moon_vault;
create policy "Cycle & Moon vault: owner adds" on public.cycle_moon_vault
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Cycle & Moon vault: owner changes" on public.cycle_moon_vault;
create policy "Cycle & Moon vault: owner changes" on public.cycle_moon_vault
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Cycle & Moon vault: owner deletes" on public.cycle_moon_vault;
create policy "Cycle & Moon vault: owner deletes" on public.cycle_moon_vault
  for delete to authenticated using (user_id = auth.uid());

revoke all on public.cycle_moon_vault from anon;
grant select, insert, update, delete on public.cycle_moon_vault to authenticated;

-- ---------------------------------------------------------------------------
-- The status shared with covens and people
-- ---------------------------------------------------------------------------

create table if not exists public.cycle_moon_status (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null,
  shared_covens uuid[] not null default '{}',
  shared_people uuid[] not null default '{}',
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cycle_moon_status_status_check') then
    alter table public.cycle_moon_status add constraint cycle_moon_status_status_check
      check (status in ('moon_time', 'moon_time_resting', 'resting', 'quiet'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cycle_moon_status_shape_check') then
    alter table public.cycle_moon_status add constraint cycle_moon_status_shape_check check (
      cardinality(shared_covens) <= 50
      and cardinality(shared_people) <= 200
      and cardinality(shared_covens) + cardinality(shared_people) > 0
    );
  end if;
end;
$$;

create index if not exists cycle_moon_status_covens_idx on public.cycle_moon_status using gin (shared_covens);
create index if not exists cycle_moon_status_people_idx on public.cycle_moon_status using gin (shared_people);

-- Whether the person asking may see this status: their own, or shared with
-- them by name, or shared with a coven both are active members of; and only
-- until it ends. Security definer, so it reads coven_members past its own
-- policies without recursing.
create or replace function public.cycle_moon_status_visible(p_owner uuid, p_covens uuid[], p_people uuid[], p_expires timestamptz)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and (
    p_owner = auth.uid()
    or (
      p_expires > now()
      and (
        auth.uid() = any (p_people)
        or exists (
          select 1
          from public.coven_members mine
          join public.coven_members theirs on theirs.coven_id = mine.coven_id
          where mine.user_id = auth.uid() and mine.status = 'active'
            and theirs.user_id = p_owner and theirs.status = 'active'
            and mine.coven_id = any (p_covens)
        )
      )
    )
  );
$$;

-- Only to covens they belong to, for at most eight days.
create or replace function public.cycle_moon_status_check()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.expires_at > now() + interval '8 days' then
    new.expires_at := now() + interval '8 days';
  end if;
  new.shared_covens := coalesce(array(
    select distinct c from unnest(new.shared_covens) c
    where exists (select 1 from public.coven_members m where m.coven_id = c and m.user_id = new.user_id and m.status = 'active')
  ), '{}');
  new.shared_people := coalesce(array(select distinct p from unnest(new.shared_people) p where p <> new.user_id), '{}');
  if cardinality(new.shared_covens) + cardinality(new.shared_people) = 0 then
    raise exception 'Choose at least one of your covens, or someone, to share it with.' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists cycle_moon_status_check on public.cycle_moon_status;
create trigger cycle_moon_status_check before insert or update on public.cycle_moon_status
  for each row execute function public.cycle_moon_status_check();

alter table public.cycle_moon_status enable row level security;

drop policy if exists "Cycle & Moon status: owner and those it's shared with read" on public.cycle_moon_status;
create policy "Cycle & Moon status: owner and those it's shared with read" on public.cycle_moon_status
  for select to authenticated using (public.cycle_moon_status_visible(user_id, shared_covens, shared_people, expires_at));
drop policy if exists "Cycle & Moon status: owner adds" on public.cycle_moon_status;
create policy "Cycle & Moon status: owner adds" on public.cycle_moon_status
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Cycle & Moon status: owner changes" on public.cycle_moon_status;
create policy "Cycle & Moon status: owner changes" on public.cycle_moon_status
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Cycle & Moon status: owner deletes" on public.cycle_moon_status;
create policy "Cycle & Moon status: owner deletes" on public.cycle_moon_status
  for delete to authenticated using (user_id = auth.uid());

revoke all on public.cycle_moon_status from anon;
grant select, insert, update, delete on public.cycle_moon_status to authenticated;

-- A coven's Members page: who in this coven has shared a status with this
-- coven or with you, while it lasts. Only the status words, never whom else
-- it's shared with. For active members of the coven only.
create or replace function public.cycle_moon_statuses(p_coven uuid)
returns table (user_id uuid, status text)
language sql
stable
security definer
set search_path = public
as $$
  select s.user_id, s.status
  from public.cycle_moon_status s
  join public.coven_members m on m.coven_id = p_coven and m.user_id = s.user_id and m.status = 'active'
  where auth.uid() is not null
    and s.user_id <> auth.uid()
    and s.expires_at > now()
    and exists (select 1 from public.coven_members me where me.coven_id = p_coven and me.user_id = auth.uid() and me.status = 'active')
    and (p_coven = any (s.shared_covens) or auth.uid() = any (s.shared_people));
$$;

revoke execute on function public.cycle_moon_statuses(uuid) from public, anon;
grant execute on function public.cycle_moon_statuses(uuid) to authenticated;
revoke execute on function public.cycle_moon_status_visible(uuid, uuid[], uuid[], timestamptz) from public, anon;
grant execute on function public.cycle_moon_status_visible(uuid, uuid[], uuid[], timestamptz) to authenticated;

notify pgrst, 'reload schema';
