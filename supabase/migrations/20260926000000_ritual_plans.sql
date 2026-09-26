-- Applied to sandspod-dev on 2026-09-26 (migration "ritual_plans").
-- Planned rituals from the app's planner, synced per account.
create table if not exists public.ritual_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  planned_date date not null,
  planned_time text not null default '21:00' check (planned_time ~ '^\d{1,2}:\d{2}$'),
  title text not null,
  intention text,
  intention_key text,
  template_id uuid references public.ritual_templates (id) on delete set null,
  draft jsonb,
  ingredients jsonb not null default '[]'::jsonb,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ritual_plans_user_date_idx on public.ritual_plans (user_id, planned_date);

alter table public.ritual_plans enable row level security;

create policy "Users manage own ritual plans" on public.ritual_plans
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
