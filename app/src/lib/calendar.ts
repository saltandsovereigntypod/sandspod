import { sunReaches } from './moon.ts';

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

// Cross-quarter days use their traditional fixed dates. The solstices and
// equinoxes are worked out from the Sun's position each year, so they land
// on the right day (anywhere from the 19th to the 23rd) in local time.
const SABBATS: ({ name: string; month: number; day: number } | { name: string; sun: 0 | 90 | 180 | 270 })[] = [
  { name: 'Imbolc', month: 1, day: 1 },
  { name: 'Ostara', sun: 0 },
  { name: 'Beltane', month: 4, day: 1 },
  { name: 'Litha', sun: 90 },
  { name: 'Lammas', month: 7, day: 1 },
  { name: 'Mabon', sun: 180 },
  { name: 'Samhain', month: 9, day: 31 },
  { name: 'Yule', sun: 270 },
];

/** The next sabbat on or after the start of `from`'s day, in local time. */
export function nextSabbat(from: Date): Sabbat {
  const today = startOfDay(from);
  for (const year of [from.getFullYear(), from.getFullYear() + 1]) {
    for (const s of SABBATS) {
      const date = 'sun' in s ? startOfDay(sunReaches(year, s.sun)) : new Date(year, s.month, s.day);
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

/**
 * A Date from a Date or ISO string. Plain "YYYY-MM-DD" strings are calendar
 * dates (the altar stores ritual dates that way), so they become local
 * midnight rather than UTC midnight, which would show the day before in the Americas.
 */
export function parseCalendarDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const plain = typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  const date = plain ? new Date(+plain[1], +plain[2] - 1, +plain[3]) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "September 22, 2026"; null when unparseable. */
export function fullDate(value: Date | string | null | undefined): string | null {
  const date = parseCalendarDate(value);
  if (!date) return null;
  return `${MONTHS_LONG[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** "3:05 PM" in local time. */
export function timeOfDay(date: Date): string {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
}
