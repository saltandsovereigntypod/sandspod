// The coven ritual planner's rules, shared with the website (js/core/covens.js
// and covens/coven-logic.js): what a step is (its name, action, directions,
// words, who does it, how long, its items and what it does on the altar, and
// anything it asks of people), who can be given a part, dates to suggest from
// the moon and the sabbats (or the coven's own calendar), copying steps from
// one of your own rituals, and the form's date and time. Pure, so it can be
// tested.

import { builtInCabinet } from '../altar/cabinet.ts';
import { nextSabbat } from '../calendar.ts';
import type { Holiday } from '../holidays.ts';
import { upcomingPhases } from '../moon.ts';

// The step itself lives in draft.ts; kept here for the screens that read it from the planner.
export * from './draft.ts';

export type Suggestion = { occasion: 'full_moon' | 'new_moon' | 'sabbat' | 'other'; name: string; label: string; date: Date };

/**
 * Coming full and new moons and the next sabbats, to suggest dates for a
 * rite. When the coven keeps its own calendar, its next holidays take the
 * sabbats' place.
 */
export function occasionSuggestions(from: Date, count = 6, covenHolidays: Holiday[] = []): Suggestion[] {
  const out: Suggestion[] = upcomingPhases(from, 12)
    .filter((p) => p.phase === 'full' || p.phase === 'new')
    .slice(0, 4)
    .map((p) => ({ occasion: p.phase === 'full' ? 'full_moon' : 'new_moon', name: '', label: p.phase === 'full' ? 'Full moon' : 'New moon', date: new Date(p.date) }));
  if (covenHolidays.length) {
    for (const h of covenHolidays.slice(0, 3)) {
      out.push({ occasion: h.traditionIds.some((id) => /^wheel/.test(id)) ? 'sabbat' : 'other', name: h.name, label: h.name, date: new Date(h.date) });
    }
  } else {
    let cursor = from;
    for (let i = 0; i < 2; i++) {
      const s = nextSabbat(cursor);
      out.push({ occasion: 'sabbat', name: s.name, label: s.name, date: new Date(s.date) });
      cursor = new Date(s.date.getTime() + 86400000 * 2);
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, count);
}

/** A suggestion's date at a sensible hour: moons at their own time (to the quarter hour), sabbats at 8pm. */
export function suggestionTime(suggestion: Pick<Suggestion, 'occasion' | 'date'>): Date {
  const d = new Date(suggestion.date);
  if (suggestion.occasion === 'sabbat') d.setHours(20, 0, 0, 0);
  else d.setMinutes(Math.round(d.getMinutes() / 15) * 15, 0, 0);
  return d;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** A time as the form's date ("2026-10-31") and time ("20:00") fields, in local time. */
export function toFields(iso: string | null | undefined): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

/** The form's date and time as an ISO time (null when there's no date; an error when it doesn't read). */
export function fromFields(date: string, time: string): string | null | Error {
  const day = date.trim();
  if (!day) return null;
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(day);
  const t = /^(\d{1,2}):(\d{2})$/.exec(time.trim() || '19:00');
  if (!m) return new Error('Write the date as year-month-day, like 2026-10-31.');
  if (!t) return new Error('Write the time as hours and minutes, like 19:30.');
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(t[1]), Number(t[2]));
  if (Number.isNaN(d.getTime()) || d.getMonth() !== Number(m[2]) - 1 || Number(t[1]) > 23) return new Error('That date or time doesn’t exist.');
  return d.toISOString();
}

/** Things a step can set on the altar: every picture in the cabinet but candles (they're lit instead). */
export const PLACEABLE = builtInCabinet
  .filter((item) => item.category !== 'candles' && item.category !== 'backgrounds')
  .flatMap((item) => {
    const forms = item.forms.filter((f) => f.image);
    return forms.map((f) => ({
      name: forms.length > 1 ? `${item.name} · ${f.label}` : item.name,
      image: f.image.replace(/^(\.\.\/)+/, '/'),
      category: String(item.category),
      keywords: item.keywords,
    }));
  })
  .filter((p) => /^\/assets\/altar\/[A-Za-z0-9/_.-]+\.(png|PNG|jpg|jpeg|webp)$/.test(p.image));

export function searchPlaceable(query: string, limit = 24) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const list = words.length ? PLACEABLE.filter((p) => words.every((w) => [p.name, p.category, ...p.keywords].join(' ').toLowerCase().includes(w))) : PLACEABLE;
  return list.slice(0, limit);
}
