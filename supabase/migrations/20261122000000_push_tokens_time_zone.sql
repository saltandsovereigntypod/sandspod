-- Applied 2026-10-31. Each phone's time zone, so a gathering's phone note
-- gives the time in the reader's own zone (coven-notify covenGathering).
alter table public.push_tokens add column if not exists time_zone text check (time_zone is null or char_length(time_zone) <= 64);
create or replace function public.register_push_token(p_token text, p_platform text, p_time_zone text)
returns boolean language sql security definer set search_path to 'public' as $$
  insert into public.push_tokens (token, user_id, platform, time_zone, updated_at)
  values (p_token, auth.uid(), p_platform, nullif(left(btrim(coalesce(p_time_zone, '')), 64), ''), now())
  on conflict (token) do update set user_id = auth.uid(), platform = excluded.platform, time_zone = coalesce(excluded.time_zone, push_tokens.time_zone), updated_at = now()
  returning true;
$$;
revoke execute on function public.register_push_token(text, text, text) from anon;
grant execute on function public.register_push_token(text, text, text) to authenticated;
