// Moon journal insights: what someone's own ritual journal shows about how
// they work with the moon. Pure, so every sentence can be tested.

import { julianDayToDate, lunationNear, moonState, phaseJde, type PhaseName } from '../moon.ts';
import { dateFromKey } from './lifecycle.ts';
import { INTENTIONS, type MoonTide } from './planner.ts';
import type { JournalRow } from './types.ts';

export const PHASE_NAMES: PhaseName[] = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];

const TIDE_OF: Record<PhaseName, MoonTide> = {
  'New Moon': 'new',
  'Waxing Crescent': 'waxing',
  'First Quarter': 'waxing',
  'Waxing Gibbous': 'waxing',
  'Full Moon': 'full',
  'Waning Gibbous': 'waning',
  'Last Quarter': 'waning',
  'Waning Crescent': 'waning',
};

export const TIDE_WORDS: Record<MoonTide, string> = {
  new: 'the new moon',
  waxing: 'waxing moons',
  full: 'the full moon',
  waning: 'waning moons',
};

const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime() - 1;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** When a ritual happened: its date (read at 9 pm, when most rituals are) or when it was recorded. */
export function journalDate(entry: JournalRow): Date | null {
  const day = dateFromKey(entry.ritual_date);
  if (day) return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 21);
  const stamp = entry.started_at || entry.created_at;
  const date = stamp ? new Date(stamp) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

/** The phase a ritual was under: as recorded, or worked out from its date. */
export function journalPhase(entry: JournalRow): PhaseName | null {
  if (entry.moon_phase && (PHASE_NAMES as string[]).includes(entry.moon_phase)) return entry.moon_phase as PhaseName;
  const date = journalDate(entry);
  return date ? moonState(date).name : null;
}

/** Which intentions an entry was for, from its title and intention, by the planner's words. */
export function journalThemes(entry: JournalRow): string[] {
  const text = `${entry.title ?? ''} ${entry.intention ?? ''}`.toLowerCase();
  return INTENTIONS.filter((intention) =>
    [intention.label.toLowerCase(), intention.key, ...intention.keywords].some((word) => new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(text)),
  ).map((intention) => intention.label);
}

/** The number of the lunation (new moon to new moon) a moment falls in. */
export function lunationOf(date: Date): number {
  let k = lunationNear(date) + 1;
  while (julianDayToDate(phaseJde(k, 'new')).getTime() > date.getTime()) k -= 1;
  return k;
}

export type JournalInsights = {
  total: number;
  /** Rituals under each of the eight phases, in phase order. */
  byPhase: { phase: PhaseName; count: number }[];
  /** Sentences worth saying, most telling first. */
  lines: string[];
  /** The last ritual under the phase the moon is in now, from an earlier moon. */
  lastThisPhase: { phase: PhaseName; entry: JournalRow } | null;
  /** Moons in a row with at least one ritual, counting this one if it has one. */
  moonStreak: number;
  thisMoon: number;
  lastMoon: number;
  /** Recent entries still watching for results. */
  watching: JournalRow[];
};

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function journalInsights(entries: JournalRow[], now: Date): JournalInsights {
  const dated = entries
    .map((entry) => ({ entry, date: journalDate(entry), phase: journalPhase(entry) }))
    // Read at 9 pm, a ritual from earlier today is still "today", not the future.
    .filter((d): d is { entry: JournalRow; date: Date; phase: PhaseName } => !!d.date && !!d.phase && d.date.getTime() <= endOfDay(now))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  const total = dated.length;

  const byPhase = PHASE_NAMES.map((phase) => ({ phase, count: dated.filter((d) => d.phase === phase).length }));
  const tides = (['new', 'waxing', 'full', 'waning'] as MoonTide[]).map((tide) => ({
    tide,
    items: dated.filter((d) => TIDE_OF[d.phase] === tide),
  }));

  const lines: string[] = [];
  if (total >= 3) {
    const [top, second] = [...tides].sort((a, b) => b.items.length - a.items.length);
    if (top.items.length > second.items.length) {
      lines.push(`Most of your rituals fall on ${TIDE_WORDS[top.tide]}: ${top.items.length} of ${total}.`);
    } else {
      lines.push(`Your rituals are spread evenly across the moon’s tides.`);
    }

    // What each tide is used for, where there's a clear favourite.
    const tideThemes = tides
      .map(({ tide, items }) => {
        const counts = new Map<string, number>();
        for (const { entry } of items) for (const theme of journalThemes(entry)) counts.set(theme, (counts.get(theme) ?? 0) + 1);
        const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
        return best && best[1] >= 2 ? `${best[0].toLowerCase()} on ${TIDE_WORDS[tide]}` : null;
      })
      .filter(Boolean);
    if (tideThemes.length) lines.push(`You tend to work for ${tideThemes.join(', and ')}.`);

    const weekdays = new Map<number, number>();
    for (const { date } of dated) weekdays.set(date.getDay(), (weekdays.get(date.getDay()) ?? 0) + 1);
    const [day, count] = [...weekdays.entries()].sort((a, b) => b[1] - a[1])[0];
    const runnerUp = [...weekdays.values()].sort((a, b) => b - a)[1] ?? 0;
    if (count >= 2 && count > runnerUp) lines.push(`${WEEKDAYS[day]} is your most frequent ritual night (${plural(count, 'time')}).`);

    const silent = byPhase.filter((p) => p.count === 0).map((p) => p.phase);
    if (silent.length > 0 && silent.length <= 3) {
      lines.push(`You haven’t yet kept a ritual under the ${silent.join(' or the ')}.`);
    }
  }

  const current = lunationOf(now);
  const perMoon = new Map<number, number>();
  for (const { date } of dated) {
    const k = lunationOf(date);
    perMoon.set(k, (perMoon.get(k) ?? 0) + 1);
  }
  const thisMoon = perMoon.get(current) ?? 0;
  const lastMoon = perMoon.get(current - 1) ?? 0;
  let moonStreak = 0;
  for (let k = thisMoon > 0 ? current : current - 1; perMoon.has(k); k -= 1) moonStreak += 1;
  if (moonStreak >= 2) lines.unshift(`You’ve kept at least one ritual through ${plural(moonStreak, 'moon')} in a row.`);

  const phaseNow = moonState(now).name;
  const earlier = dated.find((d) => d.phase === phaseNow && lunationOf(d.date) < current);
  const lastThisPhase = earlier ? { phase: phaseNow, entry: earlier.entry } : null;

  const watching = dated
    .filter((d) => (d.entry.results ?? '').trim() && now.getTime() - d.date.getTime() <= 90 * 86_400_000)
    .slice(0, 3)
    .map((d) => d.entry);

  return { total, byPhase, lines, lastThisPhase, moonStreak, thisMoon, lastMoon, watching };
}
