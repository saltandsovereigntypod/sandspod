// Cycle & Moon: the maths. A person's bleeds and notes, compared with the
// moon (moon.ts, the same Meeus phases the rest of the app uses): which day
// of their cycle it is, the inner season (a modern framework, not biology),
// where in the lunar month each bleed began, a gentle estimate of the next,
// and patterns in their notes. Pure, so the app and the website (js/core/
// cycle.js) work it out the same way.
//
// Nothing here predicts fertility or is meant for contraception: the season
// windows are rough, and the estimate of the next bleed is only ever "about".

import { moonState, PRINCIPAL_NAMES } from '../moon.ts';
import type { Bleed, CycleData, CycleSettings, DayNote, Flow, MoonPattern, MoonQuarter, Season, Situation } from './types.ts';

const DAY = 86_400_000;
export const SYNODIC_DAYS = 29.530588861;
/** Without a cycle of their own yet, the seasons are laid out over this many days. */
export const DEFAULT_LENGTH = 28;
/** Without an end marked, a bleed is taken to last this long. */
export const DEFAULT_BLEED_DAYS = 5;
/** Gaps between bleeds outside this are left out of the rhythm (a skipped month, pregnancy, a long pause). */
const PLAUSIBLE = { min: 15, max: 60 } as const;
/** How many recent cycles the rhythm is read from. */
const RECENT = 6;

const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function fromKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || '');
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getMonth() === +m[2] - 1 ? d : null;
}
export const isDayKey = (key: unknown): key is string => typeof key === 'string' && !!fromKey(key);
/** Whole days from a to b (b later is positive). */
export function daysBetween(a: string, b: string): number {
  const x = fromKey(a);
  const y = fromKey(b);
  if (!x || !y) return 0;
  return Math.round((Date.UTC(y.getFullYear(), y.getMonth(), y.getDate()) - Date.UTC(x.getFullYear(), x.getMonth(), x.getDate())) / DAY);
}
export function addDays(key: string, n: number): string {
  const d = fromKey(key) ?? new Date();
  return dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
}
/** Noon on that day, where the moon is read. */
const noon = (key: string) => {
  const d = fromKey(key) ?? new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
};

// ── The saved shape ──────────────────────────────────────────────────────

const FLOWS: Flow[] = ['spotting', 'light', 'medium', 'heavy'];
const SITUATIONS: Situation[] = ['irregular', 'hormonal', 'pregnant', 'postpartum', 'perimenopause'];
export const REMINDER_AHEAD_CHOICES = [1, 2, 3, 5] as const;

export const DEFAULT_SETTINGS: CycleSettings = {
  mode: 'cycle',
  situations: [],
  archetypes: false,
  today: true,
  altar: false,
  grimoire: false,
  reminders: { on: false, full: false, ahead: 3, at: 9 * 60 },
  updatedAt: '',
};

export function emptyData(): CycleData {
  return { version: 1, bleeds: [], notes: [], settings: { ...DEFAULT_SETTINGS, reminders: { ...DEFAULT_SETTINGS.reminders } }, removed: {} };
}

const str = (v: unknown, max = 4000) => (typeof v === 'string' ? v.slice(0, max) : '');
const iso = (v: unknown) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : '');
const rating = (v: unknown) => (typeof v === 'number' && v >= 1 && v <= 5 ? Math.round(v) : null);

/** Whatever was stored (or decrypted), as a sound CycleData. Unknown parts are dropped. */
export function normalizeData(raw: unknown): CycleData {
  const out = emptyData();
  if (!raw || typeof raw !== 'object') return out;
  const r = raw as Record<string, unknown>;
  const seen = new Set<string>();
  for (const b of Array.isArray(r.bleeds) ? r.bleeds : []) {
    const x = b as Record<string, unknown>;
    if (!x || typeof x.id !== 'string' || !isDayKey(x.start) || seen.has(x.id)) continue;
    seen.add(x.id);
    const flow: Record<string, Flow> = {};
    if (x.flow && typeof x.flow === 'object') {
      for (const [k, v] of Object.entries(x.flow as Record<string, unknown>)) if (isDayKey(k) && FLOWS.includes(v as Flow)) flow[k] = v as Flow;
    }
    const end = isDayKey(x.end) && daysBetween(x.start, x.end) >= 0 ? x.end : null;
    out.bleeds.push({ id: x.id, start: x.start, end, flow, updatedAt: iso(x.updatedAt) });
  }
  const dates = new Set<string>();
  for (const n of Array.isArray(r.notes) ? r.notes : []) {
    const x = n as Record<string, unknown>;
    if (!x || !isDayKey(x.date) || dates.has(x.date)) continue;
    dates.add(x.date);
    out.notes.push({
      date: x.date,
      energy: rating(x.energy),
      intuition: rating(x.intuition),
      mood: str(x.mood, 200),
      body: str(x.body, 1000),
      dreams: str(x.dreams),
      text: str(x.text),
      updatedAt: iso(x.updatedAt),
    });
  }
  const s = (r.settings && typeof r.settings === 'object' ? r.settings : {}) as Record<string, unknown>;
  const rem = (s.reminders && typeof s.reminders === 'object' ? s.reminders : {}) as Record<string, unknown>;
  out.settings = {
    mode: s.mode === 'moon' ? 'moon' : 'cycle',
    situations: Array.isArray(s.situations) ? SITUATIONS.filter((x) => (s.situations as unknown[]).includes(x)) : [],
    archetypes: s.archetypes === true,
    today: s.today !== false,
    altar: s.altar === true,
    grimoire: s.grimoire === true,
    reminders: {
      on: rem.on === true,
      full: rem.full === true,
      ahead: REMINDER_AHEAD_CHOICES.includes(rem.ahead as 1) ? (rem.ahead as number) : 3,
      at: typeof rem.at === 'number' && rem.at >= 0 && rem.at < 1440 ? Math.round(rem.at) : 9 * 60,
    },
    updatedAt: iso(s.updatedAt),
  };
  if (r.removed && typeof r.removed === 'object') {
    for (const [k, v] of Object.entries(r.removed as Record<string, unknown>)) if (iso(v)) out.removed[k] = v as string;
  }
  return out;
}

/** Two copies of the data (this device's and the account's), as one: the newer of each bleed, note and the settings; deletions kept. */
export function mergeData(a: CycleData, b: CycleData): CycleData {
  const removed: Record<string, string> = { ...a.removed };
  for (const [k, v] of Object.entries(b.removed)) if (!removed[k] || removed[k] < v) removed[k] = v;
  const newer = <T extends { updatedAt: string }>(x: T | undefined, y: T | undefined) => (!x ? y : !y ? x : y.updatedAt > x.updatedAt ? y : x);
  const gone = (key: string, updatedAt: string) => !!removed[key] && removed[key] >= updatedAt;

  const bleeds = new Map<string, Bleed>();
  for (const x of [...a.bleeds, ...b.bleeds]) bleeds.set(x.id, newer(bleeds.get(x.id), x)!);
  const notes = new Map<string, DayNote>();
  for (const x of [...a.notes, ...b.notes]) notes.set(x.date, newer(notes.get(x.date), x)!);
  return {
    version: 1,
    bleeds: [...bleeds.values()].filter((x) => !gone(x.id, x.updatedAt)).sort((x, y) => (x.start < y.start ? -1 : 1)),
    notes: [...notes.values()].filter((x) => !gone(`note:${x.date}`, x.updatedAt)).sort((x, y) => (x.date < y.date ? -1 : 1)),
    settings: b.settings.updatedAt > a.settings.updatedAt ? b.settings : a.settings,
    removed,
  };
}

// ── Changing it ──────────────────────────────────────────────────────────

const stamp = (now: Date) => now.toISOString();

export function changeSettings(data: CycleData, change: Partial<CycleSettings>, now: Date): CycleData {
  return { ...data, settings: { ...data.settings, ...change, updatedAt: stamp(now) } };
}

/** The bleed that covers a day: begun on or before it and not ended before it (an open one covers ten days at most). */
export function bleedOn(data: CycleData, key: string): Bleed | null {
  for (const b of sortedBleeds(data).reverse()) {
    if (daysBetween(b.start, key) < 0) continue;
    const last = b.end ?? addDays(b.start, 9);
    return daysBetween(key, last) >= 0 ? b : null;
  }
  return null;
}

/** Mark a bleed as beginning on `key` (or move the start of the one that covers it). */
export function startBleed(data: CycleData, key: string, makeId: () => string, now: Date): CycleData {
  const near = data.bleeds.find((b) => Math.abs(daysBetween(b.start, key)) <= 3 && (!b.end || daysBetween(key, b.end) >= 0));
  if (near) return putBleed(data, { ...near, start: key, end: near.end && daysBetween(key, near.end) < 0 ? null : near.end }, now);
  return putBleed(data, { id: makeId(), start: key, end: null, flow: {}, updatedAt: '' }, now);
}

/** Mark the bleed that covers `key` (or the latest before it) as ending that day. */
export function endBleed(data: CycleData, key: string, now: Date): CycleData {
  const b = bleedOn(data, key) ?? sortedBleeds(data).reverse().find((x) => daysBetween(x.start, key) >= 0 && daysBetween(x.start, key) <= 14);
  return b ? putBleed(data, { ...b, end: key }, now) : data;
}

export function setFlow(data: CycleData, key: string, flow: Flow | null, now: Date): CycleData {
  const b = bleedOn(data, key);
  if (!b) return data;
  const next = { ...b.flow };
  if (flow) next[key] = flow;
  else delete next[key];
  return putBleed(data, { ...b, flow: next }, now);
}

export function putBleed(data: CycleData, bleed: Bleed, now: Date): CycleData {
  const b = { ...bleed, updatedAt: stamp(now) };
  return { ...data, bleeds: [...data.bleeds.filter((x) => x.id !== b.id), b].sort((x, y) => (x.start < y.start ? -1 : 1)) };
}

export function removeBleed(data: CycleData, id: string, now: Date): CycleData {
  return { ...data, bleeds: data.bleeds.filter((x) => x.id !== id), removed: { ...data.removed, [id]: stamp(now) } };
}

export function noteOn(data: CycleData, key: string): DayNote | null {
  return data.notes.find((n) => n.date === key) ?? null;
}

export const emptyNote = (key: string): DayNote => ({ date: key, energy: null, intuition: null, mood: '', body: '', dreams: '', text: '', updatedAt: '' });
export const noteIsEmpty = (n: DayNote) => n.energy == null && n.intuition == null && !n.mood.trim() && !n.body.trim() && !n.dreams.trim() && !n.text.trim();

/** Keep a day's notes (an empty note is removed). */
export function putNote(data: CycleData, note: DayNote, now: Date): CycleData {
  const rest = data.notes.filter((n) => n.date !== note.date);
  if (noteIsEmpty(note)) return { ...data, notes: rest, removed: { ...data.removed, [`note:${note.date}`]: stamp(now) } };
  return { ...data, notes: [...rest, { ...note, updatedAt: stamp(now) }].sort((x, y) => (x.date < y.date ? -1 : 1)) };
}

// ── Cycles ───────────────────────────────────────────────────────────────

export const sortedBleeds = (data: CycleData) => [...data.bleeds].sort((a, b) => (a.start < b.start ? -1 : 1));

/** How many days a bleed lasted: to its end, or (with no end marked) to the last day with flow logged, and at least the usual five. */
export function bleedDays(bleed: Bleed): number {
  if (bleed.end) return daysBetween(bleed.start, bleed.end) + 1;
  const flowDays = Object.keys(bleed.flow).map((k) => daysBetween(bleed.start, k) + 1).filter((n) => n > 0 && n <= 10);
  return Math.max(DEFAULT_BLEED_DAYS, ...flowDays);
}

export type CycleStats = {
  /** Recent cycle lengths in days, oldest first. */
  lengths: number[];
  /** The middle of them, or null with none yet. */
  typical: number | null;
  shortest: number | null;
  longest: number | null;
  /** The recent cycles differ by more than a week. */
  varies: boolean;
};

export function cycleStats(data: CycleData): CycleStats {
  const bleeds = sortedBleeds(data);
  const lengths: number[] = [];
  for (let i = 1; i < bleeds.length; i++) {
    const n = daysBetween(bleeds[i - 1].start, bleeds[i].start);
    if (n >= PLAUSIBLE.min && n <= PLAUSIBLE.max) lengths.push(n);
  }
  const recent = lengths.slice(-RECENT);
  if (!recent.length) return { lengths: [], typical: null, shortest: null, longest: null, varies: false };
  const sorted = [...recent].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const typical = sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  const shortest = sorted[0];
  const longest = sorted[sorted.length - 1];
  return { lengths: recent, typical, shortest, longest, varies: longest - shortest > 7 };
}

/** Cycles that don't keep a steady rhythm, by what they've told us or by what's logged. */
export function isIrregular(data: CycleData, stats = cycleStats(data)): boolean {
  return stats.varies || data.settings.situations.some((s) => s === 'irregular' || s === 'perimenopause' || s === 'postpartum');
}

// ── Seasons ──────────────────────────────────────────────────────────────

export const SEASONS: Season[] = ['winter', 'spring', 'summer', 'autumn'];
export const SEASON_NAMES: Record<Season, string> = { winter: 'inner winter', spring: 'inner spring', summer: 'inner summer', autumn: 'inner autumn' };

/**
 * The inner season of a cycle day: winter while bleeding, then spring, a
 * week or so of summer about two weeks before the next bleed, and autumn
 * until it comes. Rough on purpose; bodies don't keep to windows.
 */
export function seasonForCycleDay(day: number, length: number, bleedLength: number): Season {
  const winterEnd = Math.max(1, Math.min(10, bleedLength));
  if (day <= winterEnd) return 'winter';
  const summerStart = Math.max(winterEnd + 2, length - 15);
  const summerEnd = Math.min(summerStart + 6, Math.max(summerStart, length - 3));
  if (day < summerStart) return 'spring';
  if (day <= summerEnd) return 'summer';
  return 'autumn';
}

export function moonFraction(at: Date): number {
  return moonState(at).fraction;
}

export function quarterOf(fraction: number): MoonQuarter {
  const f = ((fraction % 1) + 1) % 1;
  if (f < 0.125 || f >= 0.875) return 'dark';
  if (f < 0.375) return 'waxing';
  if (f < 0.625) return 'full';
  return 'waning';
}

export const QUARTER_NAMES: Record<MoonQuarter, string> = { dark: 'dark moon', waxing: 'waxing moon', full: 'full moon', waning: 'waning moon' };

/** Following the moon alone: its dark is inner winter, its waxing spring, its full summer and its waning autumn. */
export const MOON_SEASON: Record<MoonQuarter, Season> = { dark: 'winter', waxing: 'spring', full: 'summer', waning: 'autumn' };

export const moonQuarterOn = (key: string) => quarterOf(moonFraction(noon(key)));

/** Where a day falls in their cycle: which bleed it follows, the day, and the season (null without a bleed to count from, or long after one). */
export function cycleDayOn(data: CycleData, key: string, stats = cycleStats(data)): { bleed: Bleed; day: number; length: number; season: Season; bleeding: boolean } | null {
  const bleeds = sortedBleeds(data);
  let i = -1;
  for (let j = bleeds.length - 1; j >= 0; j--) {
    if (daysBetween(bleeds[j].start, key) >= 0) {
      i = j;
      break;
    }
  }
  if (i < 0) return null;
  const bleed = bleeds[i];
  const day = daysBetween(bleed.start, key) + 1;
  const next = bleeds[i + 1];
  const actual = next ? daysBetween(bleed.start, next.start) : null;
  const length = actual && actual >= PLAUSIBLE.min && actual <= PLAUSIBLE.max ? actual : (stats.typical ?? DEFAULT_LENGTH);
  // Long after the last bleed (a pause, a pregnancy), there's no day to count.
  if (day > Math.max(length + 21, PLAUSIBLE.max)) return null;
  const blen = bleedDays(bleed);
  return { bleed, day, length, season: seasonForCycleDay(day, length, blen), bleeding: day <= blen };
}

/** The season of a day, by their bleeds, or by the moon in moon mode (or when there's no bleed to count from). */
export function seasonOn(data: CycleData, key: string, stats = cycleStats(data)): { season: Season; byMoon: boolean } {
  if (data.settings.mode === 'cycle') {
    const c = cycleDayOn(data, key, stats);
    if (c) return { season: c.season, byMoon: false };
  }
  return { season: MOON_SEASON[moonQuarterOn(key)], byMoon: true };
}

// ── The next bleed, gently ───────────────────────────────────────────────

export type Estimate = {
  /** Days from today to the likely start (negative: later than the usual rhythm). */
  daysAway: number;
  /** When it varies, the span it may fall in, as days from today. */
  span: [number, number] | null;
  line: string;
};

const aboutDays = (n: number) => (n <= 0 ? 'about now' : n === 1 ? 'in about a day' : `in about ${n} days`);

/**
 * A gentle estimate of the next bleed, or null when one wouldn't be honest:
 * following the moon, pregnant, too little logged, after a birth until a
 * rhythm returns, or while bleeding now.
 */
export function nextBleedEstimate(data: CycleData, now: Date, stats = cycleStats(data)): Estimate | null {
  const s = data.settings;
  if (s.mode !== 'cycle' || s.situations.includes('pregnant')) return null;
  if (!stats.typical) return null;
  if (s.situations.includes('postpartum') && stats.lengths.length < 2) return null;
  const bleeds = sortedBleeds(data);
  const last = bleeds[bleeds.length - 1];
  const today = dayKey(now);
  const c = cycleDayOn(data, today, stats);
  if (!c || c.bleed.id !== last.id || c.bleeding) return null;
  const daysAway = stats.typical - (c.day - 1);
  const wide = isIrregular(data, stats) && stats.shortest != null && stats.longest != null && stats.longest - stats.shortest > 4;
  const span: [number, number] | null = wide ? [stats.shortest! - (c.day - 1), stats.longest! - (c.day - 1)] : null;
  let line: string;
  if (daysAway < -3) line = 'Your bleed may come a little later than your recent rhythm. Cycles shift; if you’re worried, a doctor or nurse can help.';
  else if (span && span[1] > 0) line = `Your bleed may start sometime ${span[0] <= 0 ? 'from now' : `from about ${span[0]} ${span[0] === 1 ? 'day' : 'days'}`} to about ${span[1]} days from now.`;
  else line = `Your bleed may start ${aboutDays(daysAway)}.`;
  return { daysAway, span, line };
}

// ── The moon at each bleed ──────────────────────────────────────────────

export const PATTERN_OF: Record<MoonQuarter, MoonPattern> = { dark: 'white', waxing: 'pink', full: 'red', waning: 'purple' };

export type BleedMoon = {
  bleed: Bleed;
  /** 0 new, 0.5 full. */
  fraction: number;
  phase: string;
  pattern: MoonPattern;
  /** Whole days from the nearest new moon, and the nearest full. */
  fromNew: number;
  fromFull: number;
};

export function bleedMoon(bleed: Bleed): BleedMoon {
  const at = noon(bleed.start);
  const state = moonState(at);
  const f = state.fraction;
  return {
    bleed,
    fraction: f,
    phase: state.name,
    pattern: PATTERN_OF[quarterOf(f)],
    fromNew: Math.round(Math.min(f, 1 - f) * SYNODIC_DAYS),
    fromFull: Math.round(Math.abs(f - 0.5) * SYNODIC_DAYS),
  };
}

/** Each bleed and the moon it began under, newest first. */
export const bleedMoons = (data: CycleData) => sortedBleeds(data).reverse().map(bleedMoon);

const within = (n: number) => (n === 0 ? 'on the day of' : `within ${n} ${n === 1 ? 'day' : 'days'} of`);
const QUARTER_WORDS: Record<MoonPattern, string> = { white: 'near the new moon', pink: 'under a waxing moon', red: 'near the full moon', purple: 'under a waning moon' };
export const PATTERN_NAMES: Record<MoonPattern, string> = { white: 'White Moon', pink: 'Pink Moon', red: 'Red Moon', purple: 'Purple Moon' };

/** One honest line about where their recent bleeds fell in the lunar month, or null with none logged. */
export function patternSummary(data: CycleData): string | null {
  const moons = bleedMoons(data).slice(0, 6);
  if (!moons.length) return null;
  if (moons.length === 1) {
    const m = moons[0];
    return `Your last bleed began ${m.fromNew <= m.fromFull ? `${within(m.fromNew)} the new moon` : `${within(m.fromFull)} the full moon`}, the pattern some call the ${PATTERN_NAMES[m.pattern]}.`;
  }
  for (let n = moons.length; n >= 2; n--) {
    const last = moons.slice(0, n);
    const nearNew = Math.max(...last.map((m) => m.fromNew));
    if (nearNew <= 3) return `Your last ${n} bleeds began ${within(nearNew)} the new moon.`;
    const nearFull = Math.max(...last.map((m) => m.fromFull));
    if (nearFull <= 3) return `Your last ${n} bleeds began ${within(nearFull)} the full moon.`;
  }
  for (let n = moons.length; n >= 2; n--) {
    const last = moons.slice(0, n);
    if (last.every((m) => m.pattern === last[0].pattern)) return `Your last ${n} bleeds began ${QUARTER_WORDS[last[0].pattern]}, the pattern some call the ${PATTERN_NAMES[last[0].pattern]}.`;
  }
  return 'Your recent bleeds began in different parts of the lunar month. People move between the patterns, and that is as it should be.';
}

// ── The wheel ────────────────────────────────────────────────────────────

export type WheelModel = {
  /** The lunar month shown: the day of the new moon that began it, and the day of the next. */
  from: string;
  to: string;
  /** Each day of it: where it sits on the wheel (0 new, 0.5 full) and their season that day. */
  days: { key: string; fraction: number; season: Season; bleeding: boolean; byMoon: boolean }[];
  /** Where each recent bleed began on the wheel, newest first. */
  bleeds: { fraction: number; pattern: MoonPattern; start: string }[];
  /** Today, on the wheel. */
  today: number;
  /** New, first quarter, full, last quarter. */
  marks: { fraction: number; name: string }[];
};

/** The lunar month around today with their seasons laid on it, and where their recent bleeds began. */
export function wheelModel(data: CycleData, now: Date): WheelModel {
  const today = dayKey(now);
  const f = moonFraction(noon(today));
  // Back to the day of the last new moon, then on to the next.
  let from = addDays(today, -Math.round(f * SYNODIC_DAYS));
  for (let i = 0; i < 3 && moonFraction(noon(from)) > 0.5; i++) from = addDays(from, 1);
  const stats = cycleStats(data);
  const days: WheelModel['days'] = [];
  for (let i = 0; i < 31; i++) {
    const key = addDays(from, i);
    const fraction = moonFraction(noon(key));
    if (i > 20 && fraction < 0.2) break;
    const s = seasonOn(data, key, stats);
    const c = data.settings.mode === 'cycle' ? cycleDayOn(data, key, stats) : null;
    days.push({ key, fraction, season: s.season, bleeding: !!c?.bleeding && daysBetween(key, today) >= 0, byMoon: s.byMoon });
  }
  return {
    from,
    to: addDays(from, days.length),
    days,
    bleeds: bleedMoons(data)
      .slice(0, 6)
      .map((m) => ({ fraction: m.fraction, pattern: m.pattern, start: m.bleed.start })),
    today: f,
    marks: [
      { fraction: 0, name: PRINCIPAL_NAMES.new },
      { fraction: 0.25, name: PRINCIPAL_NAMES.firstQuarter },
      { fraction: 0.5, name: PRINCIPAL_NAMES.full },
      { fraction: 0.75, name: PRINCIPAL_NAMES.lastQuarter },
    ],
  };
}

/** A point on a wheel of radius r centred at (cx, cy): the new moon at the top, going clockwise to the full at the bottom. */
export function wheelPoint(fraction: number, cx: number, cy: number, r: number): { x: number; y: number } {
  const a = fraction * 2 * Math.PI - Math.PI / 2;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** An SVG path for the arc of a wheel from one fraction to another. */
export function wheelArc(from: number, to: number, cx: number, cy: number, r: number): string {
  const a = wheelPoint(from, cx, cy, r);
  const b = wheelPoint(to, cx, cy, r);
  const large = (((to - from) % 1) + 1) % 1 > 0.5 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

// ── Patterns in the notes ────────────────────────────────────────────────

/** What their notes show over time, by season: where energy and intuition run high or low, and when dreams are written down. */
export function notePatterns(data: CycleData): string[] {
  const stats = cycleStats(data);
  const by: Record<Season, DayNote[]> = { winter: [], spring: [], summer: [], autumn: [] };
  for (const note of data.notes) by[seasonOn(data, note.date, stats).season].push(note);
  const lines: string[] = [];
  const rated = (field: 'energy' | 'intuition', word: string) => {
    const avgs = SEASONS.map((season) => {
      const vals = by[season].map((n) => n[field]).filter((v): v is number => v != null);
      return { season, count: vals.length, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 };
    }).filter((x) => x.count >= 2);
    if (avgs.length < 2 || avgs.reduce((a, b) => a + b.count, 0) < 6) return;
    avgs.sort((a, b) => b.avg - a.avg);
    if (avgs[0].avg - avgs[1].avg >= 0.5) lines.push(`Your ${word} notes peak in ${SEASON_NAMES[avgs[0].season]}.`);
    const low = avgs[avgs.length - 1];
    if (avgs.length >= 3 && avgs[avgs.length - 2].avg - low.avg >= 0.5) lines.push(`Your ${word} notes run lowest in ${SEASON_NAMES[low.season]}.`);
  };
  rated('intuition', 'intuition');
  rated('energy', 'energy');
  const dreams = SEASONS.map((season) => ({ season, count: by[season].filter((n) => n.dreams.trim()).length })).sort((a, b) => b.count - a.count);
  if (dreams[0].count >= 3 && dreams[0].count >= dreams[1].count * 1.5) lines.push(`You write down more dreams in ${SEASON_NAMES[dreams[0].season]}.`);
  return lines;
}

// ── Today ────────────────────────────────────────────────────────────────

export type TodayView = {
  /** "Day 3 · inner winter · waning moon", or "Moon day 12 · inner spring · waxing moon". */
  line: string;
  season: Season;
  quarter: MoonQuarter;
  /** Bleeding today, by what's logged. */
  bleeding: boolean;
  estimate: Estimate | null;
  /** Counted by the moon (moon mode, or no bleed to count from). */
  byMoon: boolean;
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function todayView(data: CycleData, now: Date): TodayView {
  const today = dayKey(now);
  const stats = cycleStats(data);
  const quarter = moonQuarterOn(today);
  const c = data.settings.mode === 'cycle' ? cycleDayOn(data, today, stats) : null;
  if (c) {
    return {
      line: `Day ${c.day} · ${SEASON_NAMES[c.season]} · ${QUARTER_NAMES[quarter]}`,
      season: c.season,
      quarter,
      bleeding: c.bleeding,
      estimate: nextBleedEstimate(data, now, stats),
      byMoon: false,
    };
  }
  const f = moonFraction(noon(today));
  const season = MOON_SEASON[quarter];
  return { line: `Moon day ${Math.floor(f * SYNODIC_DAYS) + 1} · ${SEASON_NAMES[season]} · ${QUARTER_NAMES[quarter]}`, season, quarter, bleeding: false, estimate: null, byMoon: true };
}

/** Whether Today's small card has something to say: chosen, and following the moon, or with a bleed in the last two months. */
export function todayCardRelevant(data: CycleData, now: Date): boolean {
  if (!data.settings.today) return false;
  if (data.settings.mode === 'moon') return true;
  const last = sortedBleeds(data).pop();
  return !!last && daysBetween(last.start, dayKey(now)) <= 60 && daysBetween(last.start, dayKey(now)) >= 0;
}

export const seasonTitle = (season: Season) => cap(SEASON_NAMES[season]);
