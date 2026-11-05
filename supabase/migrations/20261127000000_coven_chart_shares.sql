-- Opt-in coven chart sharing: a member may share their chart POSITIONS (never
-- birth date, time or place) with a coven they belong to. Off by default: no
-- row means nothing is shared. Members of the coven can read the rows; each
-- person writes only their own, only while a member.

create table if not exists public.coven_chart_shares (
  coven_id uuid not null references public.covens(id) on delete cascade,
  user_id uuid not null,
  positions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (coven_id, user_id)
);

alter table public.coven_chart_shares enable row level security;

create policy coven_chart_shares_select on public.coven_chart_shares
  for select to authenticated using (public.is_coven_member(coven_id));
create policy coven_chart_shares_insert on public.coven_chart_shares
  for insert to authenticated with check (user_id = auth.uid() and public.is_coven_member(coven_id));
create policy coven_chart_shares_update on public.coven_chart_shares
  for update to authenticated using (user_id = auth.uid() and public.is_coven_member(coven_id))
  with check (user_id = auth.uid() and public.is_coven_member(coven_id));
create policy coven_chart_shares_delete on public.coven_chart_shares
  for delete to authenticated using (user_id = auth.uid());

revoke all on public.coven_chart_shares from anon;
