-- NOT YET APPLIED. Birth charts: encrypted sync of the chart vault.
-- Needs every migration before it (through 20261117000000_cycle_moon.sql).
-- Additive and safe to run again (paste it whole). The app and the website
-- work without it: charts stay encrypted on the device, and "keep with my
-- account" says it isn't ready yet, until it's applied.
--
-- * astro_vault: one row per person, only ciphertext. Birth charts (the
--   person's own and any they add for others: name, birth date, time, place
--   and time zone) are encrypted on the device (app/src/lib/astro/vault.ts,
--   the same scheme as Cycle & Moon with its own labels) with a random data
--   key; the data key is kept here only wrapped, by a key made from the
--   person's chart passphrase (scrypt, parameters and salt in `kdf`) and by
--   one made from their recovery key. Nothing here can be read without one
--   of those, which never leave the device. Only the owner can read or
--   change their row. `revision` goes up by one on every change, so two
--   devices saving at once don't overwrite each other (the second sees the
--   revision moved, merges, and saves again).
-- * Deleting: the owner can delete the row at any time ("Delete all my
--   charts"); deleting the account removes it too (on delete cascade).
-- * No new foreign key between existing tables: the only reference is from
--   this new table to auth.users.

create table if not exists public.astro_vault (
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
  if not exists (select 1 from pg_constraint where conname = 'astro_vault_shape_check') then
    alter table public.astro_vault add constraint astro_vault_shape_check check (
      version = 1
      and char_length(ciphertext) between 40 and 2000000
      and (kdf is null or (jsonb_typeof(kdf) = 'object' and pg_column_size(kdf) <= 500))
      and (pass_key is null or char_length(pass_key) <= 200)
      and (recovery_key is null or char_length(recovery_key) <= 200)
    );
  end if;
end;
$$;

create or replace function public.astro_vault_touch()
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

drop trigger if exists astro_vault_touch on public.astro_vault;
create trigger astro_vault_touch before update on public.astro_vault
  for each row execute function public.astro_vault_touch();

alter table public.astro_vault enable row level security;

drop policy if exists "Chart vault: owner reads" on public.astro_vault;
create policy "Chart vault: owner reads" on public.astro_vault
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Chart vault: owner adds" on public.astro_vault;
create policy "Chart vault: owner adds" on public.astro_vault
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Chart vault: owner changes" on public.astro_vault;
create policy "Chart vault: owner changes" on public.astro_vault
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Chart vault: owner deletes" on public.astro_vault;
create policy "Chart vault: owner deletes" on public.astro_vault
  for delete to authenticated using (user_id = auth.uid());

revoke all on public.astro_vault from anon;
grant select, insert, update, delete on public.astro_vault to authenticated;
