// Where someone is in their Year and a Day, kept as one craft entry in
// 'yearday.progress' (synced like journey progress: on the phone or in the
// browser at once, and in the account when signed in). Pure, so it can be
// tested. Nothing is graded or failed: things are marked done, self-checks
// ticked and reflections written only by the person, for themselves.

import { MOONS, trackById, TRACKS, type TrackId } from './plan.ts';
import { daysBetween, isDayKey, moonView, positionOn, yearSchedule, type MoonView, type Position } from './schedule.ts';

export const YEAR_COLLECTION = 'yearday.progress';
export const REFLECTION_MAX = 4000;

export type Reflection = { text: string; at: string };

export type YearProgress = {
  version: 1;
  track: TrackId;
  /** The first day, 'YYYY-MM-DD'. */
  startDate: string;
  /** Keep the southern Wheel's festivals (the eclectic and Wiccan tracks). */
  south?: boolean;
  startedAt: string;
  /** Item key (a lesson's 'read:<id>', a practice's key) → when it was marked done. */
  done: Record<string, string>;
  /** '<moon id>:<index>' → when the self-check was ticked. */
  checks: Record<string, string>;
  /** Moon id → the reflection. */
  reflections: Record<string, Reflection>;
  /** Reminders for the year's moons (the phone's notifications; a calendar file on the website). */
  remind: boolean;
  dedicatedAt?: string;
  /** A line about the day, if they wrote one. */
  dedicationNote?: string;
  /** Set if they set the year aside. */
  stoppedAt?: string;
};

export type YearStatus = 'waiting' | 'active' | 'complete' | 'dedicated' | 'stopped';

const isTrack = (t: unknown): t is TrackId => TRACKS.some((x) => x.id === t);
const record = <T>(v: unknown, ok: (x: unknown) => x is T): Record<string, T> => {
  const out: Record<string, T> = {};
  if (v && typeof v === 'object') for (const [k, x] of Object.entries(v as Record<string, unknown>)) if (ok(x)) out[k] = x;
  return out;
};
const isString = (x: unknown): x is string => typeof x === 'string';
const isReflection = (x: unknown): x is Reflection => !!x && typeof (x as Reflection).text === 'string';

export function newYear(track: TrackId, startDate: string, now: Date, south = false): YearProgress {
  return { version: 1, track, startDate, ...(south ? { south: true } : {}), startedAt: now.toISOString(), done: {}, checks: {}, reflections: {}, remind: true };
}

/** Fill anything an older or partial copy is missing. */
export function normalizeYear(raw: unknown): YearProgress | null {
  const p = raw as Partial<YearProgress> | null;
  if (!p || typeof p !== 'object' || !isDayKey(p.startDate)) return null;
  return {
    ...p,
    version: 1,
    track: isTrack(p.track) ? p.track : 'eclectic',
    startDate: p.startDate,
    startedAt: isString(p.startedAt) ? p.startedAt : new Date(0).toISOString(),
    done: record(p.done, isString),
    checks: record(p.checks, isString),
    reflections: record(p.reflections, isReflection),
    remind: p.remind !== false,
  };
}

type Entry = { id: string; createdAt: string; updatedAt?: string; deletedAt?: string | null; data: unknown };

/** The year in hand: the newest copy not set aside (or, failing that, the newest). */
export function currentYear<E extends Entry>(entries: E[]): (E & { data: YearProgress }) | null {
  const years = entries
    .filter((e) => !e.deletedAt)
    .map((e) => ({ ...e, data: normalizeYear(e.data) }))
    .filter((e): e is E & { data: YearProgress } => !!e.data)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return years.find((e) => !e.data.stoppedAt) ?? null;
}

export function yearStatus(p: YearProgress, today: string): YearStatus {
  if (p.stoppedAt) return 'stopped';
  if (p.dedicatedAt) return 'dedicated';
  const pos = positionOn(yearSchedule(p.startDate), today);
  if (pos.phase === 'before') return 'waiting';
  if (pos.phase === 'day' || pos.phase === 'after') return 'complete';
  return 'active';
}

export const config = (p: YearProgress) => ({ track: p.track, startDate: p.startDate, south: !!p.south });

export const readKey = (docId: string) => `read:${docId}`;
export const checkKey = (moonId: string, index: number) => `${moonId}:${index}`;

/** Mark something done or not. */
export function setDone(p: YearProgress, key: string, on: boolean, now: Date): YearProgress {
  const done = { ...p.done };
  if (on) done[key] = done[key] ?? now.toISOString();
  else delete done[key];
  return { ...p, done };
}

export function setCheck(p: YearProgress, key: string, on: boolean, now: Date): YearProgress {
  const checks = { ...p.checks };
  if (on) checks[key] = checks[key] ?? now.toISOString();
  else delete checks[key];
  return { ...p, checks };
}

export function setReflection(p: YearProgress, moonId: string, text: string, now: Date): YearProgress {
  const reflections = { ...p.reflections };
  const clean = text.slice(0, REFLECTION_MAX);
  if (clean.trim()) reflections[moonId] = { text: clean, at: now.toISOString() };
  else delete reflections[moonId];
  return { ...p, reflections };
}

/** Move the first day (what's done stays done). */
export const setStart = (p: YearProgress, startDate: string): YearProgress => (isDayKey(startDate) ? { ...p, startDate } : p);
export const setTrack = (p: YearProgress, track: TrackId): YearProgress => ({ ...p, track });
export const setRemind = (p: YearProgress, remind: boolean): YearProgress => ({ ...p, remind });

export function dedicate(p: YearProgress, now: Date, note = ''): YearProgress {
  return { ...p, dedicatedAt: now.toISOString(), ...(note.trim() ? { dedicationNote: note.trim().slice(0, REFLECTION_MAX) } : {}) };
}
export function undedicate(p: YearProgress): YearProgress {
  const next = { ...p };
  delete next.dedicatedAt;
  delete next.dedicationNote;
  return next;
}
export const stopYear = (p: YearProgress, now: Date): YearProgress => ({ ...p, stoppedAt: now.toISOString() });

export type MoonSummary = { n: number; done: number; total: number; checks: number; checksTotal: number; reflected: boolean };

export function moonSummary(p: YearProgress, view: MoonView): MoonSummary {
  const keys = [...view.readings.map((r) => readKey(r.id)), ...view.practices.map((i) => i.key)];
  const checks = view.moon.milestones.filter((_, i) => p.checks[checkKey(view.moon.id, i)]).length;
  return {
    n: view.moon.n,
    done: keys.filter((k) => p.done[k]).length,
    total: keys.length,
    checks,
    checksTotal: view.moon.milestones.length,
    reflected: !!p.reflections[view.moon.id]?.text.trim(),
  };
}

/** "3 of 9 done · reflection written" */
export function summaryLine(s: MoonSummary): string {
  return [`${s.done} of ${s.total} done`, s.reflected ? 'reflection written' : null].filter(Boolean).join(' · ');
}

export type YearLine = { label: string; line: string; detail?: string; href: string; position: Position };

const shortDay = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * One line for Today: "Moon 3 of 13 · Ground and boundary", with the next
 * dated thing in the moon (a festival or the moon's rite within a week) or
 * how much is done. Null when there's nothing to say (dedicated, set aside).
 */
export function todayLine(p: YearProgress, today: string): YearLine | null {
  if (p.stoppedAt || p.dedicatedAt) return null;
  const s = yearSchedule(p.startDate);
  const position = positionOn(s, today);
  const label = 'A Year and a Day';
  if (position.phase === 'before') {
    const days = daysBetween(today, s.start);
    return { label, line: days === 1 ? 'Your year and a day begins tomorrow' : `Your year and a day begins on ${shortDay(s.start)}`, href: '/rituals/year', position };
  }
  if (position.phase === 'day') return { label, line: 'Today is your day of dedication', detail: 'A year and a day since you began, if you choose it.', href: '/rituals/year/day', position };
  if (position.phase === 'after') return { label, line: 'Your year and a day is complete', detail: 'Dedicate when you are ready, or carry on learning.', href: '/rituals/year/day', position };
  const view = moonView(config(p), position.n)!;
  const soon = view.practices.find((i) => i.date && i.date >= today && daysBetween(today, i.date) <= 7 && !p.done[i.key]);
  const sum = moonSummary(p, view);
  const detail = soon
    ? `${soon.date === today ? 'Today' : shortDay(soon.date!)}: ${soon.title}`
    : summaryLine(sum);
  return { label, line: `Moon ${position.n} of ${MOONS.length} · ${view.moon.title}`, detail, href: `/rituals/year/moon/${position.n}`, position };
}

/** How far through the year, 0–1, by days. */
export function yearFraction(p: YearProgress, today: string): number {
  const s = yearSchedule(p.startDate);
  const total = daysBetween(s.start, s.day);
  return Math.max(0, Math.min(1, daysBetween(s.start, today) / total));
}

export const trackName = (p: YearProgress) => trackById(p.track).name;
