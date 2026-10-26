-- Coven requests: phone notes for applications and requests to advance.
-- Optional but recommended; NOT applied. The app, the website and the
-- coven-notify edge function all work without it (the function then limits
-- each note by freshness alone, five minutes), and pick it up once applied.

-- 1. Each request rings once: the edge function claims (kind, id, event)
--    here before it sends; a second call for the same one is refused.
--    Only the service role (the edge function) touches it.
create table if not exists public.coven_request_notices (
  request_kind text not null check (request_kind in ('application', 'advancement')),
  request_id uuid not null,
  event text not null check (event in ('new', 'answer')),
  created_at timestamptz not null default now(),
  primary key (request_kind, request_id, event)
);
alter table public.coven_request_notices enable row level security;
-- No policies: signed-in people can neither read nor write it.
revoke all on public.coven_request_notices from anon, authenticated;

-- 2. Live counts: reviewers' badges update the moment someone applies or a
--    request is decided (row-level security already limits these rows to the
--    applicant, the coven's reviewers and site moderators). Without this the
--    counts still refresh when the app comes back to the front, after a
--    phone note arrives, and every two minutes on the website.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_applications') then
      alter publication supabase_realtime add table public.coven_applications;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_advancement_requests') then
      alter publication supabase_realtime add table public.coven_advancement_requests;
    end if;
  end if;
end;
$$;
