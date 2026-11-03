// What your meditation log says over time: the run of days you've sat, the
// minutes this week, month and year, the kinds of practice you come back to,
// and, gently, how settled you've felt by the moon's phase, the day of the
// week and the time of day. These are patterns in your own log, not rules,
// and the pages say so. Nothing is stored; it's all read from `meditation.sits`.
// Pure, so every number can be tested. Streaks are counted as the divination
// patterns count them (streaks.ts dayStreaks).

import { dayStreaks } from '../streaks.ts';
import type { PhaseName } from '../moon.ts';
import { localDateKey } from '../rituals/lifecycle.ts';
import { kindLabel, type SitEntry } from './log.ts';

export const PHASES: PhaseName[] = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const TIMES: { key: string; label: string; from: number; to: number }[] = [
  { key: 'early', label: 'Early morning (before 7)', from: 4, to: 7 },
  { key: 'morning', label: 'Morning', from: 7, to: 12 },
  { key: 'afternoon', label: 'Afternoon', from: 12, to: 17 },
  { key: 'evening', label: 'Evening', from: 17, to: 21 },
  { key: 'night', label: 'Night', from: 21, to: 28 },
];
/** A group needs this many sits that say how settled before it's compared. */
export const MIN_FOR_PATTERN = 3;

export const timeOfDay = (d: Date) => {
  const h = d.getHours() < 4 ? d.getHours() + 24 : d.getHours();
  return TIMES.find((t) => h >= t.from && h < t.to)?.key ?? 'night';
};

export type Group = { key: string; label: string; sits: number; minutes: number; /** Average "how settled", 1 to 5, of the sits that said; null for none. */ settled: number | null; rated: number };

function grouped(list: SitEntry[], keyOf: (e: SitEntry) => string, groups: { key: string; label: string }[]): Group[] {
  return groups.map((g) => {
    const mine = list.filter((e) => keyOf(e) === g.key);
    const rated = mine.filter((e) => e.data.settled);
    return {
      ...g,
      sits: mine.length,
      minutes: mine.reduce((n, e) => n + e.data.minutes, 0),
      settled: rated.length ? Math.round((rated.reduce((n, e) => n + (e.data.settled ?? 0), 0) / rated.length) * 10) / 10 : null,
      rated: rated.length,
    };
  });
}

/** Monday, the start of this week. */
function weekStart(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export type SitStats = {
  sits: number;
  streak: { current: number; longest: number; days: number };
  minutes: { week: number; month: number; year: number; all: number };
  kinds: { label: string; sits: number; minutes: number }[];
  byPhase: Group[];
  byWeekday: Group[];
  byTime: Group[];
  lines: string[];
};

export function sitStats(list: SitEntry[], now: Date): SitStats {
  const at = (e: SitEntry) => new Date(e.data.at);
  const since = (from: Date) => list.filter((e) => at(e) >= from && at(e) <= now).reduce((n, e) => n + e.data.minutes, 0);
  const kinds = new Map<string, { sits: number; minutes: number }>();
  for (const e of list) {
    const k = kinds.get(kindLabel(e.data)) ?? { sits: 0, minutes: 0 };
    kinds.set(kindLabel(e.data), { sits: k.sits + 1, minutes: k.minutes + e.data.minutes });
  }
  const s = dayStreaks(
    list.map((e) => localDateKey(at(e))),
    now,
  );
  const stats: SitStats = {
    sits: list.length,
    streak: { current: s.current, longest: s.longest, days: s.days },
    minutes: {
      week: since(weekStart(now)),
      month: since(new Date(now.getFullYear(), now.getMonth(), 1)),
      year: since(new Date(now.getFullYear(), 0, 1)),
      all: list.reduce((n, e) => n + e.data.minutes, 0),
    },
    kinds: [...kinds.entries()].map(([label, k]) => ({ label, ...k })).sort((a, b) => b.sits - a.sits || b.minutes - a.minutes || a.label.localeCompare(b.label)),
    byPhase: grouped(list, (e) => e.data.moonPhase, PHASES.map((p) => ({ key: p, label: p }))),
    byWeekday: grouped(list, (e) => String(at(e).getDay()), WEEKDAYS.map((w, i) => ({ key: String(i), label: w }))),
    byTime: grouped(list, (e) => timeOfDay(at(e)), TIMES),
    lines: [],
  };
  stats.lines = patternLines(stats);
  return stats;
}

/** The group where you've felt most settled, when at least two groups have enough sits to compare and it stands out. */
export function mostSettled(groups: Group[]): Group | null {
  const enough = groups.filter((g) => g.rated >= MIN_FOR_PATTERN && g.settled !== null);
  if (enough.length < 2) return null;
  const sorted = [...enough].sort((a, b) => (b.settled ?? 0) - (a.settled ?? 0));
  return (sorted[0].settled ?? 0) - (sorted[sorted.length - 1].settled ?? 0) >= 0.5 ? sorted[0] : null;
}

/** A few plain sentences: what the log says, said as a pattern, not a rule. */
export function patternLines(s: SitStats): string[] {
  const out: string[] = [];
  if (s.streak.current >= 2) out.push(`You’ve sat ${s.streak.current} days in a row.`);
  if (s.kinds[0] && s.kinds.length > 1 && s.kinds[0].sits >= 3) out.push(`${s.kinds[0].label} is the practice you come back to most.`);
  const time = mostSettled(s.byTime);
  if (time) out.push(`You’ve felt most settled in the ${time.key === 'early' ? 'early morning' : time.label.toLowerCase()} (${time.settled} of 5 on average).`);
  const day = mostSettled(s.byWeekday);
  if (day) out.push(`${day.label}s have been your most settled days (${day.settled} of 5).`);
  const phase = mostSettled(s.byPhase);
  if (phase) out.push(`Under the ${phase.label} you’ve felt most settled (${phase.settled} of 5).`);
  return out;
}

/** Minutes as words: "45 minutes", "2 hours 5 minutes". */
export function minutesWords(m: number): string {
  const h = Math.floor(m / 60);
  const r = m % 60;
  const mins = `${r} ${r === 1 ? 'minute' : 'minutes'}`;
  if (!h) return mins;
  return `${h} ${h === 1 ? 'hour' : 'hours'}${r ? ` ${mins}` : ''}`;
}

export type BeforeAfter = {
  /** Sits that said how you felt both before and after. */
  pairs: number;
  /** Averages, 1 to 5, and the average change (after less before); null with no pairs. */
  before: number | null;
  after: number | null;
  change: number | null;
  /** Sits that left you better, the same, and lower. */
  up: number;
  same: number;
  down: number;
  /** The change by kind of practice, for kinds with enough pairs. */
  byKind: { label: string; pairs: number; change: number }[];
};

const avg = (ns: number[]) => (ns.length ? Math.round((ns.reduce((a, b) => a + b, 0) / ns.length) * 10) / 10 : null);

/** How you felt before a sit and after it, from the sits that said both. */
export function beforeAfter(list: SitEntry[]): BeforeAfter {
  const pairs = list.filter((e) => e.data.before && e.data.after);
  const diffs = pairs.map((e) => e.data.after! - e.data.before!);
  const kinds = new Map<string, number[]>();
  for (const e of pairs) kinds.set(kindLabel(e.data), [...(kinds.get(kindLabel(e.data)) ?? []), e.data.after! - e.data.before!]);
  return {
    pairs: pairs.length,
    before: avg(pairs.map((e) => e.data.before!)),
    after: avg(pairs.map((e) => e.data.after!)),
    change: avg(diffs),
    up: diffs.filter((d) => d > 0).length,
    same: diffs.filter((d) => d === 0).length,
    down: diffs.filter((d) => d < 0).length,
    byKind: [...kinds.entries()]
      .filter(([, ds]) => ds.length >= MIN_FOR_PATTERN)
      .map(([label, ds]) => ({ label, pairs: ds.length, change: avg(ds)! }))
      .sort((a, b) => b.change - a.change),
  };
}

/** Before and after, in a sentence or two (none until there are enough). */
export function beforeAfterLines(b: BeforeAfter): string[] {
  if (b.pairs < MIN_FOR_PATTERN || b.change === null) return [];
  const out = [`Before a sit you’ve felt ${b.before} of 5 on average, and after, ${b.after}.`];
  if (b.change > 0) out.push(`${b.up} of ${b.pairs} sits left you feeling better than when you began.`);
  else if (b.change < 0) out.push('On average you’ve felt a little lower afterwards. That happens; it may be worth noting what came up.');
  if (b.byKind.length > 1 && b.byKind[0].change > 0) out.push(`${b.byKind[0].label} has lifted you most (by ${b.byKind[0].change} on average).`);
  return out;
}
