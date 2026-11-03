// Runs of days in a row: the one going now (ending today or yesterday) and
// the longest. Shared by the divination patterns and the meditation patterns,
// kept apart so a page needing only this doesn't carry the decks with it. Pure.

import { dateFromKey, localDateKey } from './rituals/lifecycle.ts';

const DAY_MS = 86_400_000;

export type DayStreaks = {
  /** Days in a row, ending today or yesterday. */
  current: number;
  longest: number;
  /** The last day of the longest run, "YYYY-MM-DD". */
  longestEnd: string | null;
  /** Distinct days. */
  days: number;
};

/** Runs of days with something kept (a reading, a sit): the one going now (ending today or yesterday) and the longest. */
export function dayStreaks(dateKeys: string[], now: Date): DayStreaks {
  const days = [...new Set(dateKeys)].filter((k) => dateFromKey(k)).sort();
  let longest = 0;
  let longestEnd: string | null = null;
  let run = 0;
  let prev: Date | null = null;
  for (const key of days) {
    const day = dateFromKey(key)!;
    run = prev && Math.round((day.getTime() - prev.getTime()) / DAY_MS) === 1 ? run + 1 : 1;
    if (run > longest) [longest, longestEnd] = [run, key];
    prev = day;
  }
  const today = localDateKey(now);
  const yesterday = localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const last = days[days.length - 1];
  return { current: last === today || last === yesterday ? run : 0, longest, longestEnd, days: days.length };
}
