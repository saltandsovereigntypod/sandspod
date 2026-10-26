-- Deleting a coven altar for good.
--
-- Clearing an altar away (archive_coven_altar) hides it and keeps it so its
-- keepers can bring it back. This removes it: the altar, everything on it and
-- who was chosen to tend it, for the whole coven. Only those who may clear it
-- away may delete it (its keepers: the coven's head, positions that keep
-- altars, whoever started it, and the site's moderators), never the coven's
-- main ritual altar, and not while a ritual is under way at it.
--
-- Rituals held at it go back to the coven's main altar (altar_id null), and a
-- petition whose altar it was keeps its petition without an altar. The
-- foreign keys would do both (on delete set null, on delete cascade); they are
-- done here by name so the function says what it removes.

create or replace function public.delete_coven_altar(p_altar uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.coven_altars;
begin
  select * into a from public.coven_altars where id = p_altar for update;
  if a.id is null then return false; end if;
  if a.is_main then raise exception 'The coven''s ritual altar stays. Clear things from it instead.'; end if;
  if not public.coven_altar_keeper(a.id) then raise exception 'Only the altar''s keeper deletes it.'; end if;
  if (public.coven_altar_live_ritual(a.id)).id is not null then raise exception 'A ritual is under way at this altar.'; end if;

  update public.coven_rituals set altar_id = null, updated_at = now() where altar_id = a.id;
  update public.coven_petitions set altar_id = null where altar_id = a.id;
  delete from public.coven_altar_objects where altar_id = a.id;
  delete from public.coven_altar_editors where altar_id = a.id;
  delete from public.coven_altars where id = a.id;
  return true;
end;
$$;

revoke execute on function public.delete_coven_altar(uuid) from public, anon;
grant execute on function public.delete_coven_altar(uuid) to authenticated;
