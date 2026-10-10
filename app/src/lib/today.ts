import { daysBetween, dayRuler, dayRulerLabel, longDate, relativeDay, shortDate, timeOfDay } from './calendar.ts';
import { holidayDay, nextHoliday, type Holiday, type HolidayChoice } from './holidays.ts';
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
  /** e.g. "97% · Full Moon in Aries tomorrow" */
  moonLine: string;
  /** The holiday running today, or else the next one, from the chosen calendars. */
  holiday: Holiday | null;
  /** e.g. "Today", "Day 3 of 7", "Oct 31 · 21 days" */
  holidayWhen: string;
  /** Always the next moon phase, then the next holiday. */
  horizon: HorizonItem[];
};

function whenLabel(now: Date, date: Date): string {
  const days = daysBetween(now, date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${shortDate(date)} · ${days} days`;
}

/** Everything the Today screen shows that can be computed from the date alone. */
export function buildToday(now: Date, choice: HolidayChoice = { traditions: ['wheel'], custom: [] }): TodayModel {
  const moon = moonState(now);
  const nextFull = nextPhase(now, 'full');
  const nextNew = nextPhase(now, 'new');

  // The moon line names whichever of new/full comes first.
  const fullFirst = nextFull.getTime() < nextNew.getTime();
  const headlinePhase = fullFirst ? 'full' : 'new';
  const headlineDate = fullFirst ? nextFull : nextNew;

  const percent = Math.round(moon.illumination * 100);
  const headline = `${PRINCIPAL_NAMES[headlinePhase]} in ${signAtSyzygy(headlineDate, headlinePhase)} ${relativeDay(now, headlineDate)}`;
  const moonLine = `${percent}% · ${headline}`;

  const ingress = nextMoonIngress(now);
  const signLine = `Moon in ${moonSign(now)} · enters ${ingress.sign} ${relativeDay(now, ingress.date)} at ${timeOfDay(ingress.date)}`;

  const holiday = nextHoliday(now, choice);
  const running = holiday ? holidayDay(holiday, now) : 0;
  const holidayWhen = !holiday
    ? ''
    : running > 0 && holiday.days > 1
      ? `Day ${running} of ${holiday.days}`
      : whenLabel(now, holiday.date);

  const phase = upcomingPhases(now, 1)[0];
  const phaseTitle =
    phase.phase === 'new' || phase.phase === 'full'
      ? `${PRINCIPAL_NAMES[phase.phase]} in ${signAtSyzygy(phase.date, phase.phase)}`
      : PRINCIPAL_NAMES[phase.phase];
  const { themes } = dayRuler(now);

  const horizon: HorizonItem[] = [{ kind: 'moon', phase: phase.phase, title: phaseTitle, detail: whenLabel(now, phase.date) }];
  if (holiday) horizon.push({ kind: 'holiday', title: holiday.name, detail: holidayWhen });

  return {
    dateLine: longDate(now),
    rulerLine: `${dayRulerLabel(now)} · ${themes}`,
    moon,
    signLine,
    moonLine,
    holiday,
    holidayWhen,
    horizon,
  };
}
