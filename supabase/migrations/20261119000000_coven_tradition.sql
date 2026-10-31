-- NOT YET APPLIED. The coven's tradition: the course set it follows.
-- Needs every coven migration before it (through 20261114000000_coven_moon_calendar.sql).
-- Additive and safe to run again (paste it whole). No new foreign keys.
--
-- * covens.course_tradition: one of the course sets' ids (app/src/lib/covens/
--   covenTradition.ts, the ids of COURSE_TRADITIONS): 'hellenic', 'wheel',
--   'wheel_south', 'wicca', 'wicca_south', 'celtic', 'norse'. Null means the
--   coven hasn't said. It only orders suggestions: the matching course set
--   first in the ready-made programs, the matching holiday calendars first on
--   the Practice calendar page, and for members the matching premade rituals
--   and calendars first. The free-text covens.tradition (its description on
--   the coven's page) is untouched.
-- * Who: those who manage the coven change it, as they change the rest of the
--   coven's details ("Coven leaders and moderators update covens"); anyone who
--   may see the coven reads it with the coven. No new policy is needed.
-- * The check keeps it short and plain rather than naming every id, so a new
--   course set needs no migration.

alter table public.covens add column if not exists course_tradition text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'covens_course_tradition_check') then
    alter table public.covens add constraint covens_course_tradition_check check (
      course_tradition is null or course_tradition ~ '^[a-z_]{1,40}$'
    );
  end if;
end;
$$;
