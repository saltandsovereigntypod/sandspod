// The East Asian lunisolar calendar, for festivals such as the Mid-Autumn
// Festival, the Kitchen God's day and Mazu's birthday. It follows the
// modern Chinese rules: a month begins on the day of the new moon in China
// (UTC+8), the month holding the December solstice is the eleventh, and in
// a year of thirteen months the first month without a principal solar term
// (zhongqi) is the leap month, which repeats the number before it. Japan's
// old calendar used the same scheme, so it also dates the Japanese
// moon-viewing (Jūgoya). Pure.

import { nextPhase, sunLongitude, sunReaches } from '../moon.ts';

const DAY = 86_400_000;
const CHINA = 8 * 3_600_000;

/** The China-time day number (days since 1970-01-01) of a moment. */
const chinaDay = (time: number) => Math.floor((time + CHINA) / DAY);
/** The moment China's day `n` begins. */
const dayStart = (n: number) => n * DAY - CHINA;

/** Day numbers of the new moons (in China time) from about `from` to past `to`. */
function newMoonDays(from: number, to: number): number[] {
  const out: number[] = [];
  let cursor = new Date(dayStart(from) - 35 * DAY);
  for (;;) {
    const at = nextPhase(cursor, 'new');
    const day = chinaDay(at.getTime());
    if (!out.includes(day)) out.push(day);
    if (day > to) return out;
    cursor = new Date(at.getTime() + DAY);
  }
}

/** Whether the month from day `start` to day `next` contains a principal solar term (a multiple of 30°). */
function hasPrincipalTerm(start: number, next: number): boolean {
  const a = sunLongitude(new Date(dayStart(start)));
  let b = sunLongitude(new Date(dayStart(next)));
  if (b < a) b += 360;
  return Math.floor(b / 30) > Math.floor(a / 30);
}

export type LunarMonth = { month: number; leap: boolean; start: number };

const cache = new Map<number, LunarMonth[]>();

/** The lunar months from the eleventh month before `year`'s new year to the eleventh month of `year`. */
export function lunarMonths(year: number): LunarMonth[] {
  const hit = cache.get(year);
  if (hit) return hit;
  const s1 = chinaDay(sunReaches(year - 1, 270).getTime());
  const s2 = chinaDay(sunReaches(year, 270).getTime());
  const moons = newMoonDays(s1 - 30, s2 + 30);
  const onOrBefore = (day: number) => moons.filter((m) => m <= day).pop()!;
  const first = onOrBefore(s1);
  const last = onOrBefore(s2);
  const starts = moons.filter((m) => m >= first && m < last);
  const leapYear = starts.length === 13;
  const out: LunarMonth[] = [];
  let number = 11;
  let leapUsed = false;
  starts.forEach((start, i) => {
    if (i === 0) {
      out.push({ month: 11, leap: false, start });
      return;
    }
    const next = starts[i + 1] ?? last;
    if (leapYear && !leapUsed && !hasPrincipalTerm(start, next)) {
      leapUsed = true;
      out.push({ month: number, leap: true, start });
      return;
    }
    number = (number % 12) + 1;
    out.push({ month: number, leap: false, start });
  });
  cache.set(year, out);
  return out;
}

/** Local dates of lunar `month`/`day` (not in a leap month) between `from` and `to`. */
export function lunarDates(month: number, day: number, from: Date, to: Date): Date[] {
  const out: Date[] = [];
  for (let year = from.getFullYear() - 1; year <= to.getFullYear() + 1; year++) {
    for (const m of lunarMonths(year)) {
      if (m.leap || m.month !== month) continue;
      const utc = new Date((m.start + day - 1) * DAY);
      const date = new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
      if (date >= from && date < to && !out.some((d) => d.getTime() === date.getTime())) out.push(date);
    }
  }
  return out.sort((a, b) => a.getTime() - b.getTime());
}
