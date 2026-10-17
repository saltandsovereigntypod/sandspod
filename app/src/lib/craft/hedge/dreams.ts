// The dream journal: what a dream entry holds, the moon it came under, and
// the patterns across many dreams (symbols that keep returning, the phases
// dreams cluster in). Pure, so it can be tested.

import { moonSign, moonState, type PhaseName, type ZodiacSign } from '../../moon.ts';
import { dateFromKey, localDateKey } from '../../rituals/lifecycle.ts';

export const DREAMS = 'hedge.dreams';

export type Dream = {
  /** The morning you woke from it, "YYYY-MM-DD". */
  date: string;
  title: string;
  dream: string;
  feelings: string;
  /** Lower-case symbols, as tags. */
  symbols: string[];
  lucid: boolean;
  /** 1 (a wisp) to 5 (vivid as waking). */
  vividness: number;
  recurring: boolean;
  /** Worked out from the date, for the night before that morning. */
  moonPhase: PhaseName;
  moonSign: ZodiacSign;
};

/** Dreams the given entries carry, with their store ids. */
export type DreamEntry = { id: string; createdAt: string; data: Dream };

export const PHASES: PhaseName[] = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];

export const VIVIDNESS: { value: number; label: string }[] = [
  { value: 1, label: 'A wisp' },
  { value: 2, label: 'Faint' },
  { value: 3, label: 'Clear' },
  { value: 4, label: 'Vivid' },
  { value: 5, label: 'Like waking' },
];

/**
 * The moon of the night a dream came in. Dreams are written down in the
 * morning, so the moon is read at 3 am on that date, in the small hours
 * when most remembered dreams happen.
 */
export function dreamMoon(dateKey: string): { moonPhase: PhaseName; moonSign: ZodiacSign } {
  const day = dateFromKey(dateKey) ?? new Date();
  const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 3);
  return { moonPhase: moonState(at).name, moonSign: moonSign(at) };
}

export function blankDream(now: Date): Dream {
  const date = localDateKey(now);
  return { date, title: '', dream: '', feelings: '', symbols: [], lucid: false, vividness: 3, recurring: false, ...dreamMoon(date) };
}

/** One symbol, tidied: trimmed, lower case, single spaces, no stray punctuation. */
export function cleanSymbol(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[#"“”.!?;:()[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Symbols typed as a list ("moon, black dog; river"), tidied and without repeats. */
export function parseSymbols(text: string): string[] {
  const out: string[] = [];
  for (const part of text.split(/[,;\n]/)) {
    const s = cleanSymbol(part);
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

/** Add a symbol to a list unless it's already there. */
export function addSymbol(list: string[], raw: string): string[] {
  const s = cleanSymbol(raw);
  return s && !list.includes(s) ? [...list, s] : list;
}

/** A saved dream read defensively: older or partial copies still show. */
export function normalizeDream(raw: unknown): Dream {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Partial<Dream>;
  const date = typeof d.date === 'string' && dateFromKey(d.date) ? d.date : localDateKey(new Date());
  const moon = dreamMoon(date);
  return {
    date,
    title: typeof d.title === 'string' ? d.title : '',
    dream: typeof d.dream === 'string' ? d.dream : '',
    feelings: typeof d.feelings === 'string' ? d.feelings : '',
    symbols: Array.isArray(d.symbols) ? d.symbols.filter((s): s is string => typeof s === 'string').map(cleanSymbol).filter(Boolean) : [],
    lucid: !!d.lucid,
    vividness: Math.min(5, Math.max(1, Math.round(Number(d.vividness) || 3))),
    recurring: !!d.recurring,
    moonPhase: PHASES.includes(d.moonPhase as PhaseName) ? (d.moonPhase as PhaseName) : moon.moonPhase,
    moonSign: typeof d.moonSign === 'string' && d.moonSign ? (d.moonSign as ZodiacSign) : moon.moonSign,
  };
}

/** Newest dream first (by the morning it came, then when it was written). */
export function sortDreams<T extends DreamEntry>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.data.date === b.data.date ? (a.createdAt < b.createdAt ? 1 : -1) : a.data.date < b.data.date ? 1 : -1));
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "October 2026" for a "YYYY-MM-DD" key. */
export function monthLabel(dateKey: string): string {
  const d = dateFromKey(dateKey);
  return d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : 'Undated';
}

/** Dreams grouped by the month they came, newest month first. */
export function groupByMonth<T extends DreamEntry>(list: T[]): { month: string; entries: T[] }[] {
  const groups: { month: string; entries: T[] }[] = [];
  for (const entry of sortDreams(list)) {
    const month = monthLabel(entry.data.date);
    const last = groups[groups.length - 1];
    if (last && last.month === month) last.entries.push(entry);
    else groups.push({ month, entries: [entry] });
  }
  return groups;
}

/** Dreams matching every word of the search, across title, text, feelings and symbols. */
export function searchDreams<T extends DreamEntry>(list: T[], query: string): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return list;
  return list.filter((e) => {
    const hay = [e.data.title, e.data.dream, e.data.feelings, e.data.symbols.join(' '), e.data.moonPhase, e.data.moonSign]
      .join(' ')
      .toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/** Symbols by how often they appear, most first; ties alphabetical. */
export function symbolCounts(list: DreamEntry[]): { symbol: string; count: number; last: string }[] {
  const counts = new Map<string, { count: number; last: string }>();
  for (const e of list) {
    for (const s of new Set(e.data.symbols)) {
      const have = counts.get(s);
      counts.set(s, { count: (have?.count ?? 0) + 1, last: !have || e.data.date > have.last ? e.data.date : have.last });
    }
  }
  return [...counts.entries()]
    .map(([symbol, v]) => ({ symbol, ...v }))
    .sort((a, b) => b.count - a.count || a.symbol.localeCompare(b.symbol));
}

/** How many dreams came under each of the eight phases, in phase order. */
export function phaseCounts(list: DreamEntry[]): { phase: PhaseName; count: number }[] {
  return PHASES.map((phase) => ({ phase, count: list.filter((e) => e.data.moonPhase === phase).length }));
}

/**
 * A plain sentence about where dreams cluster, or null with too few to say.
 * The four "in-between" phases last about a week each while the four
 * principal phases are a day or so, so counts are weighed by how long each
 * phase lasts before anything is called a cluster.
 */
export function phaseClusterNote(list: DreamEntry[]): string | null {
  if (list.length < 5) return null;
  const counts = phaseCounts(list);
  // Share of a lunation each phase name covers with the 18-hour principal window.
  const principal = 36 / (29.53 * 24);
  const share = (phase: PhaseName) => (['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'].includes(phase) ? principal : (1 - 4 * principal) / 4);
  const weighted = counts.map((c) => ({ ...c, ratio: c.count / (list.length * share(c.phase)) }));
  const top = [...weighted].sort((a, b) => b.ratio - a.ratio)[0];
  if (top.count < 2 || top.ratio < 1.5) return 'Your dreams are spread fairly evenly through the moon’s cycle so far.';
  return `More of your dreams come under the ${top.phase} than chance alone would give: ${top.count} of ${list.length}.`;
}

/** Symbols that also appeared in the dream before this one, for a gentle "this came back" note. */
export function returningSymbols(list: DreamEntry[], entry: DreamEntry): string[] {
  const others = list.filter((e) => e.id !== entry.id);
  return entry.data.symbols.filter((s) => others.some((o) => o.data.symbols.includes(s)));
}

/** Lucid, recurring and the average vividness, for the symbols page. */
export function dreamStats(list: DreamEntry[]): { total: number; lucid: number; recurring: number; vividness: number | null } {
  const total = list.length;
  return {
    total,
    lucid: list.filter((e) => e.data.lucid).length,
    recurring: list.filter((e) => e.data.recurring).length,
    vividness: total ? Math.round((list.reduce((sum, e) => sum + e.data.vividness, 0) / total) * 10) / 10 : null,
  };
}
