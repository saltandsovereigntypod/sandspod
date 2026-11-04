-- The two helpers from 20261125 are SECURITY DEFINER; Postgres grants EXECUTE to
-- PUBLIC by default. not_blocked_between stays callable by signed-in users (the RLS
-- policies use it); public_sit_count is only used by triggers.
revoke execute on function public.not_blocked_between(uuid) from public, anon;
revoke execute on function public.public_sit_count() from public, anon, authenticated;
grant execute on function public.not_blocked_between(uuid) to authenticated;
