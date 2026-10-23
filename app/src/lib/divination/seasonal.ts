// A spread for the time: New moon intentions around the new moon, Full moon
// release around the full, the ancestors' spread in the days around Samhain.
// Small and pure (no deck), so Today can offer it on the app and the website.

import { moonState } from '../moon.ts';

export type SeasonalSpread = { spread: string; label: string; why: string };

/** The labels as the spreads carry them in draw.ts (a test keeps them the same). */
export const SEASONAL_LABELS = { 'new-moon': 'New moon intentions', 'full-moon': 'Full moon release', samhain: 'Samhain: the ancestors’ spread' } as const;

/** Within this much of a lunation (about a day and a half) of the new or full moon. */
const MOON_WINDOW = 0.05;

/** Whether you keep the wheel turned for the south (Samhain at the end of April). */
export function keepsSouthernWheel(settings: Record<string, unknown> | null | undefined): boolean {
  const raw = settings?.calendar_traditions;
  if (typeof raw !== 'string') return false;
  const ids = raw.split(',').map((s) => s.trim());
  return ids.includes('wheel_south') && !ids.includes('wheel');
}

/** Samhain's day this year: 31 October, or 30 April turned for the south. */
const samhainOf = (year: number, south: boolean) => (south ? new Date(year, 3, 30) : new Date(year, 9, 31));

/** The spreads that suit the day, if any: the moon's first, then Samhain's. */
export function seasonalSpreads(now: Date, { south = false }: { south?: boolean } = {}): SeasonalSpread[] {
  const out: SeasonalSpread[] = [];
  const { fraction } = moonState(now);
  if (fraction < MOON_WINDOW || fraction > 1 - MOON_WINDOW) out.push({ spread: 'new-moon', label: SEASONAL_LABELS['new-moon'], why: 'The moon is new' });
  else if (Math.abs(fraction - 0.5) < MOON_WINDOW) out.push({ spread: 'full-moon', label: SEASONAL_LABELS['full-moon'], why: 'The moon is full' });
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const samhain = samhainOf(now.getFullYear(), south).getTime();
  const days = Math.round((samhain - day) / 86_400_000);
  if (days >= -6 && days <= 7) {
    const why = days === 0 ? 'It’s Samhain' : days > 0 ? `Samhain is ${days === 1 ? 'tomorrow' : `in ${days} days`}` : 'Samhain has just passed';
    out.push({ spread: 'samhain', label: SEASONAL_LABELS.samhain, why });
  }
  return out;
}
