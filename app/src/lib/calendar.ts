// Traditional planetary rulers of the weekdays, and the Wheel of the Year.

export type DayRuler = { planet: string; themes: string };

// Index matches Date.getDay(): 0 = Sunday.
const DAY_RULERS: DayRuler[] = [
  { planet: 'Sun', themes: 'success & vitality' },
  { planet: 'Moon', themes: 'intuition & dreams' },
  { planet: 'Mars', themes: 'courage & protection' },
  { planet: 'Mercury', themes: 'communication & study' },
  { planet: 'Jupiter', themes: 'abundance & growth' },
  { planet: 'Venus', themes: 'love & beauty' },
  { planet: 'Saturn', themes: 'banishing & boundaries' },
];

export function dayRuler(date: Date): DayRuler {
  return DAY_RULERS[date.getDay()];
}

/** "Jupiter's day" */
export function dayRulerLabel(date: Date): string {
  const { planet } = dayRuler(date);
  return planet === 'Sun' || planet === 'Moon' ? `The ${planet}'s day` : `${planet}'s day`;
}

export type Sabbat = { name: string; date: Date };

// Cross-quarter days use their traditional fixed dates. Solstices and
// equinoxes move between the 19th and 23rd; these are the usual dates and
// are close enough for a "coming up" reminder.
const SABBATS: { name: string; month: number; day: number }[] = [
  { name: 'Imbolc', month: 1, day: 1 },
  { name: 'Ostara', month: 2, day: 20 },
  { name: 'Beltane', month: 4, day: 1 },
  { name: 'Litha', month: 5, day: 21 },
  { name: 'Lammas', month: 7, day: 1 },
  { name: 'Mabon', month: 8, day: 22 },
  { name: 'Samhain', month: 9, day: 31 },
  { name: 'Yule', month: 11, day: 21 },
];

/** The next sabbat on or after the start of `from`'s day, in local time. */
export function nextSabbat(from: Date): Sabbat {
  const today = startOfDay(from);
  for (const year of [from.getFullYear(), from.getFullYear() + 1]) {
    for (const s of SABBATS) {
      const date = new Date(year, s.month, s.day);
      if (date.getTime() >= today.getTime()) return { name: s.name, date };
    }
  }
  throw new Error('unreachable');
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole calendar days from `from` to `to` in local time (0 = same day). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000);
}

/** "today", "tomorrow", or e.g. "Oct 10". */
export function relativeDay(from: Date, to: Date): string {
  const days = daysBetween(from, to);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return shortDate(to);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function shortDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** "Thursday · September 25" */
export function longDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} · ${MONTHS_LONG[date.getMonth()]} ${date.getDate()}`;
}
