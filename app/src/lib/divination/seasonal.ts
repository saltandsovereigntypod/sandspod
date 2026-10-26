// A spread for the time: New moon intentions around the new moon, Full moon
// release around the full, and each sabbat's own spread in the days around
// it (the eight of the Wheel of the Year, turned for the south when you keep
// it that way). Small and pure (no deck), so Today can offer it on the app
// and the website.

import { holidaysBetween } from '../holidays.ts';
import { moonState } from '../moon.ts';

export type SeasonalSpread = { spread: string; label: string; why: string };

/** The labels as the spreads carry them in draw.ts (a test keeps them the same). */
export const SEASONAL_LABELS = {
  'new-moon': 'New moon intentions',
  'full-moon': 'Full moon release',
  samhain: 'Samhain: the ancestors’ spread',
  yule: 'Yule: the returning light',
  imbolc: 'Imbolc: the first stirring',
  ostara: 'Ostara: day and night in balance',
  beltane: 'Beltane: the fire and the flowering',
  litha: 'Litha: the sun at its height',
  lammas: 'Lammas: the first harvest',
  mabon: 'Mabon: the second harvest',
} as const;

/** The sabbats with a spread of their own: the holiday's id in the Wheel is the spread's id. */
export const SABBAT_SPREADS = ['samhain', 'yule', 'imbolc', 'ostara', 'beltane', 'litha', 'lammas', 'mabon'] as const;
export type SabbatSpread = (typeof SABBAT_SPREADS)[number];

const SABBAT_NAMES: Record<SabbatSpread, string> = {
  samhain: 'Samhain',
  yule: 'Yule',
  imbolc: 'Imbolc',
  ostara: 'Ostara',
  beltane: 'Beltane',
  litha: 'Litha',
  lammas: 'Lammas',
  mabon: 'Mabon',
};

/** Within this much of a lunation (about a day and a half) of the new or full moon. */
const MOON_WINDOW = 0.05;
/** A sabbat's spread is offered from a week before until six days after. */
const BEFORE = 7;
const AFTER = 6;

/** Whether you keep the wheel turned for the south (Samhain at the end of April). */
export function keepsSouthernWheel(settings: Record<string, unknown> | null | undefined): boolean {
  const raw = settings?.calendar_traditions;
  if (typeof raw !== 'string') return false;
  const ids = raw.split(',').map((s) => s.trim());
  return ids.includes('wheel_south') && !ids.includes('wheel');
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** The sabbat near `now`, if any, and how many days off it is (negative once it has passed). */
export function nearSabbat(now: Date, { south = false }: { south?: boolean } = {}): { spread: SabbatSpread; days: number } | null {
  const today = startOfDay(now);
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - AFTER);
  const to = new Date(today.getFullYear(), today.getMonth(), today.getDate() + BEFORE);
  const wheel = south ? 'wheel_south' : 'wheel';
  const near = holidaysBetween(from, to, { traditions: [wheel], custom: [] })
    .map((h) => ({ spread: h.id.slice(wheel.length + 1).split('-')[0] as SabbatSpread, days: Math.round((h.date.getTime() - today.getTime()) / 86_400_000) }))
    .filter((h) => (SABBAT_SPREADS as readonly string[]).includes(h.spread) && h.days >= -AFTER && h.days <= BEFORE)
    // The nearer one, if two are close; the one ahead when they are as near.
    .sort((a, b) => Math.abs(a.days) - Math.abs(b.days) || b.days - a.days);
  return near[0] ?? null;
}

/** "It’s Yule" / "Imbolc is tomorrow" / "Ostara is in 3 days" / "Beltane has just passed". */
export function sabbatWhy(spread: SabbatSpread, days: number): string {
  const name = SABBAT_NAMES[spread];
  return days === 0 ? `It’s ${name}` : days > 0 ? `${name} is ${days === 1 ? 'tomorrow' : `in ${days} days`}` : `${name} has just passed`;
}

/** The spreads that suit the day, if any: the moon's first, then the sabbat's. */
export function seasonalSpreads(now: Date, { south = false }: { south?: boolean } = {}): SeasonalSpread[] {
  const out: SeasonalSpread[] = [];
  const { fraction } = moonState(now);
  if (fraction < MOON_WINDOW || fraction > 1 - MOON_WINDOW) out.push({ spread: 'new-moon', label: SEASONAL_LABELS['new-moon'], why: 'The moon is new' });
  else if (Math.abs(fraction - 0.5) < MOON_WINDOW) out.push({ spread: 'full-moon', label: SEASONAL_LABELS['full-moon'], why: 'The moon is full' });
  const sabbat = nearSabbat(now, { south });
  if (sabbat) out.push({ spread: sabbat.spread, label: SEASONAL_LABELS[sabbat.spread], why: sabbatWhy(sabbat.spread, sabbat.days) });
  return out;
}
