import { daysBetween, dayRuler, dayRulerLabel, longDate, relativeDay, shortDate, timeOfDay } from './calendar.ts';
import { eclipseLabel, eclipsesBetween, type Eclipse } from './astro/eclipses.ts';
import { correspondencesFor, goodForToday, journalPrompt, type Correspondences } from './dayInfo.ts';
import { holidayDay, holidaysToday, nextHolidayAfterToday, type Holiday, type HolidayChoice } from './holidays.ts';
import { mergeCalendarEvents, type CalendarEvent } from './calendars/index.ts';
import { fullMoonName, HOLIDAY_TERM, traditionDay, usesFolkMoonNames, type TraditionDay } from './traditionDay.ts';
import { moonSign, moonState, nextMoonIngress, nextPhase, PRINCIPAL_NAMES, signAtSyzygy, upcomingPhases, type MoonState, type PrincipalPhase } from './moon.ts';

export type HorizonItem =
  | { kind: 'moon'; phase: PrincipalPhase; title: string; detail: string }
  | { kind: 'holiday'; title: string; detail: string; id: string };

export type TodayModel = {
  dateLine: string;
  rulerLine: string;
  moon: MoonState;
  /** e.g. "Moon in Libra · enters Scorpio tomorrow at 10:22 AM" */
  signLine: string;
  /** e.g. "97% illuminated" */
  illuminationLine: string;
  /** The next new or full moon, e.g. "Full Moon in Taurus · Oct 26" (shown under On the horizon). */
  nextSyzygyLine: string;
  /** Holidays running today only; empty on ordinary days. */
  holidaysToday: Holiday[];
  /** e.g. "Today", "Day 3 of 7" for each of holidaysToday. */
  holidayWhen: string[];
  /** The next moon phase, then the next holiday after today. */
  horizon: HorizonItem[];
  /** The day as the main calendar names it (Athenian date, Norse weekday god, …). */
  tradition: TraditionDay | null;
  /** The word for a holy day in each of holidaysToday ("Sabbat", "Blót & feast", …). */
  holidayTerms: string[];
  /** "The New Moon in Libra is good for …" */
  goodFor: string;
  correspondences: Correspondences;
  prompt: string;
  /** The next eclipse if it falls within 60 days, e.g. "Total solar eclipse in Leo · Aug 12". */
  eclipseLine: string | null;
  nextEclipse: Eclipse | null;
};

function whenLabel(now: Date, date: Date): string {
  const days = daysBetween(now, date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${shortDate(date)} · ${days} days`;
}

// The word for an observance of one of the other calendars (Settings → Calendar → Also show).
const CALENDAR_TERM: Record<string, string> = {
  'calendar:moon': 'The moon',
  'calendar:roman': 'Feriae',
  'calendar:attic': 'Festival',
  'calendar:icelandic': 'Old Icelandic year',
  'calendar:kemetic': 'Festival',
  'calendar:hindu': 'Tithi & festival',
  'calendar:slavic': 'Festival',
  'calendar:coligny': 'Coligny calendar',
};

/**
 * Everything the Today screen shows that can be computed from the date alone.
 * `calendarEvents` are observances of the other calendars shown (from
 * lib/calendars), merged in among the holidays: those running today show with
 * them, and the next one (other than the moon's own, already on the horizon)
 * can be the next holiday.
 */
export function buildToday(
  now: Date,
  choice: HolidayChoice = { traditions: ['wheel'], custom: [] },
  primary = 'wheel',
  calendarEvents: CalendarEvent[] = [],
): TodayModel {
  const moon = moonState(now);
  const nextFull = nextPhase(now, 'full');
  const nextNew = nextPhase(now, 'new');

  // Under the horizon: whichever of new/full comes first.
  const fullFirst = nextFull.getTime() < nextNew.getTime();
  const syzygyPhase = fullFirst ? 'full' : 'new';
  const syzygyDate = fullFirst ? nextFull : nextNew;
  const syzygyWhen = relativeDay(now, syzygyDate);
  const folk = syzygyPhase === 'full' && usesFolkMoonNames(primary) ? ` · ${fullMoonName(syzygyDate)}` : '';
  const nextSyzygyLine = `${PRINCIPAL_NAMES[syzygyPhase]} in ${signAtSyzygy(syzygyDate, syzygyPhase)}${folk} · ${syzygyWhen.charAt(0).toUpperCase()}${syzygyWhen.slice(1)}`;

  const ingress = nextMoonIngress(now);
  const signLine = `Moon in ${moonSign(now)} · enters ${ingress.sign} ${relativeDay(now, ingress.date)} at ${timeOfDay(ingress.date)}`;

  const running = mergeCalendarEvents(holidaysToday(now, choice), calendarEvents).filter((holiday) => holidayDay(holiday, now) > 0);
  const holidayWhen = running.map((holiday) => (holiday.days > 1 ? `Day ${holidayDay(holiday, now)} of ${holiday.days}` : 'Today'));
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const nextHoliday = nextHolidayAfterToday(now, choice);
  const upcoming =
    mergeCalendarEvents(
      nextHoliday ? [nextHoliday] : [],
      calendarEvents.filter((event) => event.calendar !== 'moon' && event.date.getTime() >= tomorrow.getTime()),
    )[0] ?? null;

  const phase = upcomingPhases(now, 1)[0];
  const phaseTitle =
    phase.phase === 'new' || phase.phase === 'full'
      ? `${PRINCIPAL_NAMES[phase.phase]} in ${signAtSyzygy(phase.date, phase.phase)}`
      : PRINCIPAL_NAMES[phase.phase];
  const { themes } = dayRuler(now);

  const horizon: HorizonItem[] = [{ kind: 'moon', phase: phase.phase, title: phaseTitle, detail: whenLabel(now, phase.date) }];
  if (upcoming) horizon.push({ kind: 'holiday', title: upcoming.name, detail: whenLabel(now, upcoming.date), id: upcoming.id });

  const sign = moonSign(now);
  const nextEclipse = eclipsesBetween(now, new Date(now.getTime() + 60 * 86_400_000))[0] ?? null;

  return {
    tradition: traditionDay(now, primary),
    holidayTerms: running.map((holiday) => HOLIDAY_TERM[holiday.traditionIds[0]] ?? CALENDAR_TERM[holiday.traditionIds[0]] ?? 'Holy day'),
    goodFor: goodForToday(moon.name, sign),
    correspondences: correspondencesFor(now),
    prompt: journalPrompt(now, moon.name, running),
    eclipseLine: nextEclipse ? `${eclipseLabel(nextEclipse)} · ${whenLabel(now, nextEclipse.date)}` : null,
    nextEclipse,
    dateLine: longDate(now),
    rulerLine: `${dayRulerLabel(now)} · ${themes}`,
    moon,
    signLine,
    illuminationLine: `${Math.round(moon.illumination * 100)}% illuminated`,
    nextSyzygyLine,
    holidaysToday: running,
    holidayWhen,
    horizon,
  };
}
