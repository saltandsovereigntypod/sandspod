// "Did it work?": a day to look back on a ritual or spell, and what you found
// when you did. It rides inside the journal entry (user_rituals.metadata
// .lookBack), so the website and the app read and write the same thing with
// no new table, and older entries simply have none. The pattern and wording
// follow the Hedge reading log's look-back date and outcome
// (craft/hedge/readings.ts). Pure, so it can be tested.

import { nextPhase } from '../moon.ts';
import { journalDate, journalPhase, journalThemes } from './insights.ts';
import { dateFromKey, localDateKey } from './lifecycle.ts';
import { INTENTIONS, type MoonTide } from './planner.ts';
import type { JournalRow } from './types.ts';

export type LookBackWhen = 'full_moon' | 'new_moon' | 'week' | 'month' | 'custom';
export type Outcome = 'yes' | 'partly' | 'not_yet' | 'no';

/** An earlier look-back answered "still waiting", kept so nothing you wrote is lost. */
export type Waited = { date: string; answer: Outcome | null; outcome: string; until: string };

/** What metadata.lookBack holds. */
export type LookBack = {
  /** The day to ask "Did it work?", "YYYY-MM-DD". */
  date: string;
  when: LookBackWhen;
  /** Your answer, once given. */
  answer?: Outcome;
  /** What actually happened, in your words. */
  outcome?: string;
  /** When you answered, "YYYY-MM-DD". */
  outcomeDate?: string;
  /** Earlier check-ins where you chose to keep waiting, oldest first. */
  waited?: Waited[];
};

export const ANSWERS: { id: Outcome; label: string }[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'partly', label: 'Partly' },
  { id: 'not_yet', label: 'Not yet' },
  { id: 'no', label: 'No' },
];

export const answerLabel = (id: string | null | undefined) => ANSWERS.find((a) => a.id === id)?.label ?? '';

const WHENS: LookBackWhen[] = ['full_moon', 'new_moon', 'week', 'month', 'custom'];
const OUTCOMES = ANSWERS.map((a) => a.id);

/** A moon look-back is never sooner than this many days after the working. */
export const MIN_MOON_DAYS = 3;

const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

const TIDE_OF_PHASE: Record<string, MoonTide> = {
  'New Moon': 'new',
  'Waxing Crescent': 'waxing',
  'First Quarter': 'waxing',
  'Waxing Gibbous': 'waxing',
  'Full Moon': 'full',
  'Waning Gibbous': 'waning',
  'Last Quarter': 'waning',
  'Waning Crescent': 'waning',
};

/** Work done to grow (new or waxing) is seen at the full moon; work done to release, at the new moon. */
const LOOK_AT: Record<MoonTide, 'full_moon' | 'new_moon'> = { new: 'full_moon', waxing: 'full_moon', full: 'new_moon', waning: 'new_moon' };

type EntryLike = Pick<JournalRow, 'title' | 'intention' | 'moon_phase' | 'ritual_date'> & Partial<Pick<JournalRow, 'started_at' | 'created_at'>>;

/**
 * The look-back that suits a working: its intention's own tide (a waxing
 * working looks back at the full moon, a banishing at the new moon), or else
 * the tide it was done under.
 */
export function suggestedWhen(entry: EntryLike): 'full_moon' | 'new_moon' {
  const theme = journalThemes(entry as JournalRow)[0];
  const intention = theme ? INTENTIONS.find((i) => i.label === theme) : null;
  if (intention?.tides[0]) return LOOK_AT[intention.tides[0]];
  const phase = journalPhase(entry as JournalRow);
  return phase ? LOOK_AT[TIDE_OF_PHASE[phase]] : 'full_moon';
}

/** The working's own day: its ritual date, or today. */
function workingDay(entry: EntryLike | null, now: Date): Date {
  const day = entry ? journalDate(entry as JournalRow) : null;
  return day ?? now;
}

/** The day to look back, counted from `from` (the working's day, or today when you keep waiting). */
export function lookBackDate(when: LookBackWhen, from: Date, custom = ''): string {
  if (when === 'week') return localDateKey(addDays(from, 7));
  if (when === 'month') return localDateKey(addDays(from, 30));
  if (when === 'custom') return dateFromKey(custom) ? custom : localDateKey(addDays(from, 7));
  const earliest = new Date(from.getFullYear(), from.getMonth(), from.getDate() + MIN_MOON_DAYS);
  return localDateKey(nextPhase(earliest, when === 'full_moon' ? 'full' : 'new'));
}

export type LookBackChoice = { when: Exclude<LookBackWhen, 'custom'>; label: string; date: string; suggested: boolean };

/** The look-back choices for a working, the one that suits it first. */
export function lookBackChoices(entry: EntryLike | null, now: Date, from: Date = workingDay(entry, now)): LookBackChoice[] {
  const suggested = entry ? suggestedWhen(entry) : 'full_moon';
  const moons: LookBackChoice[] = [
    { when: 'full_moon', label: 'At the full moon', date: lookBackDate('full_moon', from), suggested: suggested === 'full_moon' },
    { when: 'new_moon', label: 'At the new moon', date: lookBackDate('new_moon', from), suggested: suggested === 'new_moon' },
  ].sort((a, b) => Number(b.suggested) - Number(a.suggested)) as LookBackChoice[];
  return [
    ...moons,
    { when: 'week', label: 'In a week', date: lookBackDate('week', from), suggested: false },
    { when: 'month', label: 'In a month', date: lookBackDate('month', from), suggested: false },
  ];
}

/** A fresh look-back for a working, as chosen (blank `when` means the suggested one). */
export function newLookBack(entry: EntryLike, now: Date, when: LookBackWhen | null = null, custom = ''): LookBack {
  const chosen = when ?? suggestedWhen(entry);
  return { date: lookBackDate(chosen, workingDay(entry, now), custom), when: chosen };
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** An entry's look-back, or null when it has none (every entry made before this existed). */
export function readLookBack(entry: Pick<JournalRow, 'metadata'> | null | undefined): LookBack | null {
  const raw = entry?.metadata && typeof entry.metadata === 'object' ? (entry.metadata as Record<string, unknown>).lookBack : null;
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const date = dateFromKey(str(r.date)) ? str(r.date) : '';
  const answer = OUTCOMES.includes(r.answer as Outcome) ? (r.answer as Outcome) : undefined;
  if (!date && !answer) return null;
  const out: LookBack = { date, when: WHENS.includes(r.when as LookBackWhen) ? (r.when as LookBackWhen) : 'custom' };
  if (answer) {
    out.answer = answer;
    out.outcome = str(r.outcome);
    out.outcomeDate = str(r.outcomeDate);
  }
  if (Array.isArray(r.waited)) {
    const waited = r.waited
      .filter((w): w is Record<string, unknown> => !!w && typeof w === 'object')
      .map((w) => ({
        date: str(w.date),
        answer: OUTCOMES.includes(w.answer as Outcome) ? (w.answer as Outcome) : null,
        outcome: str(w.outcome),
        until: str(w.until),
      }));
    if (waited.length) out.waited = waited;
  }
  return out;
}

/** The entry with this look-back (or none), every other part of its metadata kept. */
export function withLookBack<T extends Pick<JournalRow, 'metadata'>>(entry: T, lookBack: LookBack | null): T {
  const metadata = { ...((entry.metadata && typeof entry.metadata === 'object' ? entry.metadata : {}) as Record<string, unknown>) };
  if (lookBack) metadata.lookBack = lookBack;
  else delete metadata.lookBack;
  return { ...entry, metadata };
}

/**
 * Change when to look back, keeping any answer already given. `null` turns it
 * off, unless it has been answered (an answer is never thrown away).
 */
export function chooseLookBack<T extends EntryLike & Pick<JournalRow, 'metadata'>>(entry: T, when: LookBackWhen | null, now: Date, custom = ''): T {
  const current = readLookBack(entry);
  if (!when) return current?.answer ? entry : withLookBack(entry, null);
  const fresh = newLookBack(entry, now, when, custom);
  if (current && current.when === fresh.when && current.date === fresh.date) return entry;
  return withLookBack(entry, { ...(current ?? {}), ...fresh });
}

export const isAnswered = (lookBack: LookBack | null) => !!lookBack?.answer;

/** Its look-back day has come and it isn't answered yet. */
export function isDue(entry: Pick<JournalRow, 'metadata'>, now: Date): boolean {
  const lookBack = readLookBack(entry);
  return !!lookBack && !lookBack.answer && !!lookBack.date && lookBack.date <= localDateKey(now);
}

/** Workings whose look-back day has come and that don't yet say whether they worked, oldest due first. */
export function dueLookBacks<T extends Pick<JournalRow, 'metadata'>>(entries: T[], now: Date): T[] {
  return entries
    .filter((e) => isDue(e, now))
    .sort((a, b) => (readLookBack(a)!.date < readLookBack(b)!.date ? -1 : 1));
}

/** Workings still waiting for their look-back day, soonest first. */
export function waitingLookBacks<T extends Pick<JournalRow, 'metadata'>>(entries: T[], now: Date): T[] {
  const today = localDateKey(now);
  return entries
    .filter((e) => {
      const lookBack = readLookBack(e);
      return !!lookBack && !lookBack.answer && lookBack.date > today;
    })
    .sort((a, b) => (readLookBack(a)!.date < readLookBack(b)!.date ? -1 : 1));
}

export type CheckIn = {
  answer: Outcome | null;
  /** What happened, in your words. */
  outcome: string;
  /** Still waiting: look again then instead of answering now. */
  keepWaiting?: { when: LookBackWhen; custom?: string } | null;
};

/**
 * Answer "Did it work?". With keepWaiting, what you wrote is kept and the
 * look-back moves on (counted from today); otherwise the answer is recorded.
 * An entry with no look-back yet can still be answered.
 */
export function answerLookBack<T extends EntryLike & Pick<JournalRow, 'metadata'>>(entry: T, checkIn: CheckIn, now: Date): T {
  const today = localDateKey(now);
  const current = readLookBack(entry) ?? { date: today, when: 'custom' as LookBackWhen };
  const outcome = checkIn.outcome.trim();
  if (checkIn.keepWaiting) {
    const until = lookBackDate(checkIn.keepWaiting.when, now, checkIn.keepWaiting.custom ?? '');
    const { answer: _a, outcome: _o, outcomeDate: _d, ...rest } = current;
    const waited: Waited = { date: today, answer: checkIn.answer, outcome, until };
    return withLookBack(entry, { ...rest, date: until, when: checkIn.keepWaiting.when, waited: [...(current.waited ?? []), waited] });
  }
  if (!checkIn.answer) return entry;
  return withLookBack(entry, { ...current, answer: checkIn.answer, outcome, outcomeDate: today });
}

/** Take back an answer, so it can be given again. */
export function reopenLookBack<T extends Pick<JournalRow, 'metadata'>>(entry: T, now: Date): T {
  const current = readLookBack(entry);
  if (!current?.answer) return entry;
  const { answer: _a, outcome: _o, outcomeDate: _d, ...rest } = current;
  return withLookBack(entry, { ...rest, date: rest.date || localDateKey(now) });
}

/** "at the full moon" / "in a week" / "on" — the words before a look-back's date. */
export function whenWords(when: LookBackWhen): string {
  if (when === 'full_moon') return 'at the full moon';
  if (when === 'new_moon') return 'at the new moon';
  return 'on';
}

/** The question asked when the day comes, Hedge-style. */
export function dueQuestion(entry: Pick<JournalRow, 'title' | 'metadata'>, dateWords: (key: string) => string): string {
  const lookBack = readLookBack(entry);
  const title = entry.title || 'this working';
  if (!lookBack?.date) return `Did “${title}” work?`;
  const moon = lookBack.when === 'full_moon' || lookBack.when === 'new_moon';
  const when = moon ? `${whenWords(lookBack.when)} (${dateWords(lookBack.date)})` : `on ${dateWords(lookBack.date)}`;
  return `You said you’d look back on “${title}” ${when}. Did it work? It may have worked in a way you didn’t expect.`;
}

/** The notification for a look-back day, or null when there's nothing to ask. */
export function lookBackReminder(entry: Pick<JournalRow, 'id' | 'title' | 'metadata'>): { key: string; date: string; title: string; body: string; id: string } | null {
  const lookBack = readLookBack(entry);
  if (!lookBack || lookBack.answer || !lookBack.date) return null;
  return {
    key: `lookback:${entry.id}:${lookBack.date}`,
    id: entry.id,
    date: lookBack.date,
    title: 'Did it work?',
    body: `Time to look back on “${entry.title || 'your working'}”. Did it work, partly, or not yet?`,
  };
}
