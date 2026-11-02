-- Runs coven-notify's due work once a minute: chat reminders before
-- gatherings and answer summaries that waited out their few minutes.
-- The job calls with the (public) anon key and a secret made here and kept
-- only in Vault; coven-notify checks it through coven_cron_ok, which only the
-- service key may call.

create extension if not exists pg_net;
create extension if not exists pg_cron;

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'coven_cron_secret') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(24), 'hex'), 'coven_cron_secret', 'coven-notify scheduled job');
  end if;
end;
$$;

create or replace function public.coven_cron_ok(p_secret text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from vault.decrypted_secrets where name = 'coven_cron_secret' and decrypted_secret = p_secret);
$$;
revoke all on function public.coven_cron_ok(text) from public, anon, authenticated;
grant execute on function public.coven_cron_ok(text) to service_role;

select cron.unschedule('coven-notify-due') where exists (select 1 from cron.job where jobname = 'coven-notify-due');
select cron.schedule('coven-notify-due', '* * * * *', $cron$
  select net.http_post(
    url := 'https://aiiqyesczxrrujznwoke.supabase.co/functions/v1/coven-notify',
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpaXF5ZXNjenhycnVqem53b2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzE1MzMsImV4cCI6MjEwMDIwNzUzM30.Viby7MSWZP8tDXwbZL6pALv3eSaZwgi9RoWlb7KoVJ0',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'coven_cron_secret')),
    body := '{"due": true}'::jsonb,
    timeout_milliseconds := 20000);
$cron$);
