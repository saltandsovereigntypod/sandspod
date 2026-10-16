// Patron deities: the guide, each deity's sacred days and devotions, the
// deities someone keeps, and what that brings to Today and reminders. Pure.

import { startOfDay } from '../calendar.ts';
import { upcomingSacred, devotionOfDay, type SacredOn } from './days.ts';
import { DEITY_DEVOTIONS } from './devotions.ts';
import { myDeities, type MyDeity } from './mine.ts';
import type { DeityDevotion } from './types.ts';

export { PATRON_GUIDE } from './guide.ts';
export { DEITY_DEVOTIONS };
export * from './mine.ts';
export * from './days.ts';
export type * from './types.ts';

const byKey = new Map(DEITY_DEVOTIONS.map((d) => [d.key, d]));
export const devotionOf = (key: string | null | undefined): DeityDevotion | null => (key ? byKey.get(key) ?? null : null);

type SettingsLike = Record<string, unknown> | null | undefined;
const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export type DeityLine = {
  deity: MyDeity;
  /** "Your patron · Hekate", "Dedicated · Thor". */
  label: string;
  line: string;
  detail?: string;
  /** Their Library entry, or My deities for one in your own words. */
  href: string;
  /** A sacred day falling today. */
  holyToday: boolean;
};

function when(on: SacredOn): string {
  if (on.inDays === 0) return 'today';
  if (on.inDays === 1) return 'tomorrow';
  if (on.inDays < 7) return `on ${WEEKDAY[on.date.getDay()]}`;
  return `in ${on.inDays} days`;
}

/** A line on Today for each patron and dedicated deity (patrons first), at most `max`. */
export function deityLines(settings: SettingsLike, now: Date, max = 3): DeityLine[] {
  const close = myDeities(settings).filter((d) => d.level !== 'exploring').slice(0, max);
  return close.map((deity) => {
    const label = `${deity.level === 'patron' ? 'Your patron' : 'Dedicated'} · ${deity.name}`;
    const href = deity.key ? `/today/library/traditional:deity:${deity.key}` : '/more/settings/deities';
    const devotion = devotionOf(deity.key);
    if (!devotion) {
      return { deity, label, line: `A few quiet minutes with ${deity.name}`, detail: 'A candle, a word of thanks, a small offering.', href, holyToday: false };
    }
    const next = upcomingSacred(devotion, now, 8)[0];
    const daily = devotionOfDay(devotion, now) ?? undefined;
    if (next) {
      // "Thursday, Thor's day" already says when, unless it's today or tomorrow.
      const words = when(next);
      const named = words.startsWith('on ') && next.day.name.toLowerCase().includes(words.slice(3).toLowerCase());
      return { deity, label, line: named ? next.day.name : `${next.day.name} ${words}`, detail: daily, href, holyToday: next.inDays === 0 };
    }
    return { deity, label, line: daily ?? `A few quiet minutes with ${deity.name}`, href, holyToday: false };
  });
}

export type SacredReminderSource = { key: string; name: string; devotion: DeityDevotion };

/** The kept deities (patron and dedicated) with sacred days, for reminders. */
export function sacredSources(settings: SettingsLike): SacredReminderSource[] {
  return myDeities(settings)
    .filter((d) => d.level !== 'exploring' && d.key)
    .map((d) => ({ key: d.key!, name: d.name, devotion: devotionOf(d.key) }))
    .filter((s): s is SacredReminderSource => !!s.devotion && s.devotion.sacred.length > 0);
}

/** Each sacred day of `sources` over the next `days`, one per deity per day. */
export function sacredReminders(sources: SacredReminderSource[], from: Date, days: number): { key: string; name: string; date: Date; title: string; body: string }[] {
  const out: { key: string; name: string; date: Date; title: string; body: string }[] = [];
  for (const s of sources) {
    const seen = new Set<number>();
    for (const on of upcomingSacred(s.devotion, startOfDay(from), days)) {
      if (seen.has(on.date.getTime())) continue;
      seen.add(on.date.getTime());
      out.push({ key: s.key, name: s.name, date: on.date, title: `${s.name}: ${on.day.name}`, body: devotionOfDay(s.devotion, on.date) ?? on.day.why });
    }
  }
  return out;
}
