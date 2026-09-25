import { daysBetween, dayRuler, dayRulerLabel, longDate, nextSabbat, relativeDay, shortDate } from './calendar';
import { moonState, nextPhase, PRINCIPAL_NAMES, signAtSyzygy, type MoonState } from './moon';

export type HorizonItem = {
  kind: 'new' | 'full' | 'sabbat';
  title: string;
  detail: string;
};

export type TodayModel = {
  dateLine: string;
  rulerLine: string;
  moon: MoonState;
  /** e.g. "97% · Full Moon in Aries tomorrow" */
  moonLine: string;
  horizon: [HorizonItem, HorizonItem];
};

/** Everything the Today screen shows that can be computed from the date alone. */
export function buildToday(now: Date): TodayModel {
  const moon = moonState(now);
  const nextFull = nextPhase(now, 'full');
  const nextNew = nextPhase(now, 'new');

  // The moon line names whichever of new/full comes first; the horizon shows the other.
  const fullFirst = nextFull.getTime() < nextNew.getTime();
  const headlinePhase = fullFirst ? 'full' : 'new';
  const headlineDate = fullFirst ? nextFull : nextNew;
  const otherPhase = fullFirst ? 'new' : 'full';
  const otherDate = fullFirst ? nextNew : nextFull;

  const percent = Math.round(moon.illumination * 100);
  const headline = `${PRINCIPAL_NAMES[headlinePhase]} in ${signAtSyzygy(headlineDate, headlinePhase)} ${relativeDay(now, headlineDate)}`;
  const moonLine = `${percent}% · ${headline}`;

  const sabbat = nextSabbat(now);
  const sabbatDays = daysBetween(now, sabbat.date);
  const { themes } = dayRuler(now);

  return {
    dateLine: longDate(now),
    rulerLine: `${dayRulerLabel(now)} · ${themes}`,
    moon,
    moonLine,
    horizon: [
      {
        kind: otherPhase,
        title: PRINCIPAL_NAMES[otherPhase],
        detail: shortDate(otherDate),
      },
      {
        kind: 'sabbat',
        title: sabbat.name,
        detail: sabbatDays === 0 ? 'Today' : `${shortDate(sabbat.date)} · ${sabbatDays} ${sabbatDays === 1 ? 'day' : 'days'}`,
      },
    ],
  };
}
