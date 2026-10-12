import { daysBetween, dayRuler, dayRulerLabel, longDate, relativeDay, shortDate, timeOfDay } from './calendar.ts';
import { eclipseLabel, eclipsesBetween, type Eclipse } from './astro/eclipses.ts';
import { correspondencesFor, goodForToday, journalPrompt, type Correspondences } from './dayInfo.ts';
import { holidayDay, holidaysToday, nextHolidayAfterToday, type Holiday, type HolidayChoice } from './holidays.ts';
import { fullMoonName, HOLIDAY_TERM, traditionDay, usesFolkMoonNames, type TraditionDay } from './traditionDay.ts';
import { moonSign, moonState, nextMoonIngress, nextPhase, PRINCIPAL_NAMES, signAtSyzygy, upcomingPhases, type MoonState, type PrincipalPhase } from './moon.ts';

export type HorizonItem =
  | { kind: 'moon'; phase: PrincipalPhase; title: string; detail: string }
  | { kind: 'holiday'; title: string; detail: string };

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

/** Everything the Today screen shows that can be computed from the date alone. */
export function buildToday(now: Date, choice: HolidayChoice = { traditions: ['wheel'], custom: [] }, primary = 'wheel'): TodayModel {
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

  const running = holidaysToday(now, choice);
  const holidayWhen = running.map((holiday) => (holiday.days > 1 ? `Day ${holidayDay(holiday, now)} of ${holiday.days}` : 'Today'));
  const upcoming = nextHolidayAfterToday(now, choice);

  const phase = upcomingPhases(now, 1)[0];
  const phaseTitle =
    phase.phase === 'new' || phase.phase === 'full'
      ? `${PRINCIPAL_NAMES[phase.phase]} in ${signAtSyzygy(phase.date, phase.phase)}`
      : PRINCIPAL_NAMES[phase.phase];
  const { themes } = dayRuler(now);

  const horizon: HorizonItem[] = [{ kind: 'moon', phase: phase.phase, title: phaseTitle, detail: whenLabel(now, phase.date) }];
  if (upcoming) horizon.push({ kind: 'holiday', title: upcoming.name, detail: whenLabel(now, upcoming.date) });

  const sign = moonSign(now);
  const nextEclipse = eclipsesBetween(now, new Date(now.getTime() + 60 * 86_400_000))[0] ?? null;

  return {
    tradition: traditionDay(now, primary),
    holidayTerms: running.map((holiday) => HOLIDAY_TERM[holiday.traditionIds[0]] ?? 'Holy day'),
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
