// Spell follow-through: after a spell or working is logged, a short check-in
// a day, a week and four weeks on ("How is it going? Any signs?"). The
// choice and what you write ride inside the journal entry
// (user_rituals.metadata.checkIns), beside "Did it work?" (lookBack.ts), so
// no new table is needed and the Journal shows them under the working. The
// four-week check-in can answer "Did it work?" too. Reminders come through
// the usual reminders (schedule.ts, turned off in Settings → Reminders).
// Pure, so it can be tested.

import { answerLookBack, readLookBack, type Outcome } from './lookBack.ts';
import { dateFromKey, localDateKey } from './lifecycle.ts';
import type { JournalRow } from './types.ts';

export const CHECK_IN_DAYS = [1, 7, 28] as const;
export type CheckInDay = (typeof CHECK_IN_DAYS)[number];

export type Feeling = 'moving' | 'signs' | 'quiet' | 'arrived' | 'unsure';

export const FEELINGS: { id: Feeling; label: string }[] = [
  { id: 'moving', label: 'Things are moving' },
  { id: 'signs', label: 'Small signs' },
  { id: 'quiet', label: 'Quiet so far' },
  { id: 'arrived', label: 'It has come' },
  { id: 'unsure', label: 'Hard to say' },
];

export const feelingLabel = (id: string | null | undefined) => FEELINGS.find((f) => f.id === id)?.label ?? '';

export type CheckInNote = {
  day: CheckInDay;
  /** When you wrote it, "YYYY-MM-DD". */
  date: string;
  feeling: Feeling | null;
  /** Signs noticed, in your words. */
  signs: string;
};

/** What metadata.checkIns holds. */
export type CheckIns = {
  /** Asked for; false once turned off (so it isn't offered again). */
  on: boolean;
  /** The day counted from, "YYYY-MM-DD": the working's day. */
  from: string;
  notes: CheckInNote[];
};

type EntryLike = Pick<JournalRow, 'id' | 'title' | 'metadata' | 'ritual_date'> & Partial<Pick<JournalRow, 'created_at' | 'ended_at'>>;

const SIGNS_MAX = 600;
const isDay = (v: unknown): v is CheckInDay => (CHECK_IN_DAYS as readonly unknown[]).includes(v);
const keyOf = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : '');

/** The day a working was done, "YYYY-MM-DD". */
export function workingDay(entry: Pick<JournalRow, 'ritual_date'> & Partial<Pick<JournalRow, 'created_at' | 'ended_at'>>, now: Date): string {
  return keyOf(entry.ritual_date) || (entry.ended_at ? localDateKey(new Date(entry.ended_at)) : '') || (entry.created_at ? localDateKey(new Date(entry.created_at)) : '') || localDateKey(now);
}

export function readCheckIns(entry: Pick<JournalRow, 'metadata'> | null | undefined): CheckIns | null {
  const raw = (entry?.metadata as Record<string, unknown> | undefined)?.checkIns;
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const from = keyOf(r.from);
  if (!from) return null;
  const notes = (Array.isArray(r.notes) ? r.notes : [])
    .filter((n): n is Record<string, unknown> => !!n && typeof n === 'object' && isDay((n as Record<string, unknown>).day))
    .map((n) => ({
      day: n.day as CheckInDay,
      date: keyOf(n.date) || from,
      feeling: FEELINGS.some((f) => f.id === n.feeling) ? (n.feeling as Feeling) : null,
      signs: typeof n.signs === 'string' ? n.signs.slice(0, SIGNS_MAX) : '',
    }));
  return { on: r.on !== false, from, notes };
}

function withCheckIns<T extends Pick<JournalRow, 'metadata'>>(entry: T, checkIns: CheckIns): T {
  return { ...entry, metadata: { ...(entry.metadata ?? {}), checkIns } };
}

/** The date of each check-in: the working's day plus 1, 7 and 28 days. */
export function checkInDate(from: string, day: CheckInDay): string {
  const start = dateFromKey(from);
  if (!start) return from;
  return localDateKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + day));
}

/** Offered under a working that has none yet and was done in the last four weeks. */
export function offerCheckIns(entry: EntryLike, now: Date): boolean {
  if (readCheckIns(entry)) return false;
  const last = checkInDate(workingDay(entry, now), 28);
  return localDateKey(now) < last;
}

/** Ask for the check-ins (or ask again after turning them off). Notes already written are kept. */
export function startCheckIns<T extends EntryLike>(entry: T, now: Date): T {
  const current = readCheckIns(entry);
  return withCheckIns(entry, { on: true, from: current?.from ?? workingDay(entry, now), notes: current?.notes ?? [] });
}

export function stopCheckIns<T extends EntryLike>(entry: T, now: Date): T {
  const current = readCheckIns(entry);
  return withCheckIns(entry, { on: false, from: current?.from ?? workingDay(entry, now), notes: current?.notes ?? [] });
}

/** The check-ins still to come or due, in order, with their dates. */
export function pendingCheckIns(entry: Pick<JournalRow, 'metadata'>): { day: CheckInDay; date: string }[] {
  const c = readCheckIns(entry);
  if (!c?.on) return [];
  return CHECK_IN_DAYS.filter((d) => !c.notes.some((n) => n.day === d)).map((day) => ({ day, date: checkInDate(c.from, day) }));
}

/**
 * The check-in due now: the latest whose day has come and that isn't
 * written. An earlier one missed gives way to the later one, so you're only
 * ever asked once.
 */
export function dueCheckIn(entry: Pick<JournalRow, 'metadata'>, now: Date): { day: CheckInDay; date: string } | null {
  const today = localDateKey(now);
  const c = readCheckIns(entry);
  if (!c?.on) return null;
  const come = CHECK_IN_DAYS.filter((d) => checkInDate(c.from, d) <= today);
  const latest = come[come.length - 1];
  if (!latest || c.notes.some((n) => n.day >= latest)) return null;
  return { day: latest, date: checkInDate(c.from, latest) };
}

export type CheckInAnswer = { feeling: Feeling | null; signs: string; /** At four weeks: "Did it work?", answered here too. */ answer?: Outcome | null };

/** Write a check-in. On the 28th day, an answer also answers "Did it work?" (if it wasn't already). */
export function answerCheckIn<T extends EntryLike>(entry: T, day: CheckInDay, a: CheckInAnswer, now: Date): T {
  const c = readCheckIns(entry) ?? { on: true, from: workingDay(entry, now), notes: [] };
  const note: CheckInNote = { day, date: localDateKey(now), feeling: a.feeling, signs: a.signs.trim().slice(0, SIGNS_MAX) };
  let next = withCheckIns(entry, { ...c, notes: [...c.notes.filter((n) => n.day !== day), note].sort((x, y) => x.day - y.day) });
  if (a.answer && !readLookBack(next)?.answer) next = answerLookBack(next as never, { answer: a.answer, outcome: note.signs }, now) as T;
  return next;
}

export const dayWords = (day: CheckInDay) => (day === 1 ? 'A day on' : day === 7 ? 'A week on' : 'Four weeks on');

/** One line for a note: "A week on · Small signs · a robin at the window". */
export const noteLine = (n: CheckInNote) => [dayWords(n.day), feelingLabel(n.feeling), n.signs].filter(Boolean).join(' · ');

/** The reminders to ask, for schedule.ts (keys "checkin:…", turned off with Settings → Reminders → Check-ins). */
export function checkInReminders(entry: Pick<JournalRow, 'id' | 'title' | 'metadata'>): { key: string; id: string; date: string; title: string; body: string }[] {
  return pendingCheckIns(entry).map(({ day, date }) => ({
    key: `checkin:${entry.id}:${day}`,
    id: entry.id,
    date,
    title: 'How is it going?',
    body: `${dayWords(day)} from “${entry.title || 'your working'}”. Any signs? A line in your journal is enough.`,
  }));
}

/** The Journal's rows for written check-ins, under the working's own title. */
export function checkInTimeline(entry: Pick<JournalRow, 'id' | 'title' | 'metadata'>): { id: string; date: string; title: string; detail: string }[] {
  return (readCheckIns(entry)?.notes ?? []).map((n) => ({
    id: `${entry.id}:checkin:${n.day}`,
    date: n.date,
    title: `Check-in · ${entry.title || 'Untitled Ritual'}`,
    detail: [dayWords(n.day), feelingLabel(n.feeling), n.signs].filter(Boolean).join(' · '),
  }));
}
