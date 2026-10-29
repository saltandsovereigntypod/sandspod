-- NOT YET APPLIED. The coven's moon calendar: how the coven counts its days.
-- Needs every coven migration before it (through 20261113000000_coven_head_signs_off_training.sql).
-- Additive and safe to run again (paste it whole).
--
-- * covens.moon_calendar: a JSON object in the same keys as a person's
--   settings (calendar_count_by and calendar_opt_moon_names, _southNames,
--   _yearStart and _blue), so a member who takes the coven's calendar for
--   their own copies it as it is. The calendars the coven shows beside the
--   date are covens.practice_calendars (20261027000000_coven_programs.sql).
--   Empty ({}) means the coven hasn't said.
-- * Who: those who manage the coven change it, as they change the rest of
--   the coven's details and its practice calendar ("Coven leaders and
--   moderators update covens", coven_permission(id, 'manage'), which takes
--   in the coven's head and the heads of covens above it). Members and
--   anyone who may see the coven read it with the coven.
-- * Daughter covens: copying the practice calendar from the mother coven
--   (coven_copy_calendar) carries the moon calendar too.

alter table public.covens add column if not exists moon_calendar jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'covens_moon_calendar_check') then
    alter table public.covens add constraint covens_moon_calendar_check check (
      jsonb_typeof(moon_calendar) = 'object'
      and pg_column_size(moon_calendar) <= 2000
    );
  end if;
end;
$$;

-- The practice calendar, now with the moon calendar, carried to a daughter.
create or replace function public.coven_copy_calendar(p_from uuid, p_to uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  src public.covens;
begin
  select * into src from public.covens where id = p_from;
  update public.covens set practice_traditions = src.practice_traditions, practice_holidays = src.practice_holidays,
    practice_custom = src.practice_custom, practice_calendars = src.practice_calendars, moon_calendar = src.moon_calendar
  where id = p_to;
  perform public.coven_note_copy(p_to, 'calendar', p_to, p_from, p_from);
  return p_to;
end;
$$;
