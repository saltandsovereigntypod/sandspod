// Where someone is on a dedication journey, and what's next for them today.
// Saved as one craft entry per started journey (collection
// 'journeys.progress', see ./store.ts). Everything here is pure, so it can be
// tested. Nothing is ever failed: a journey waits while paused, stages can be
// moved on from whenever the person chooses, and the suggested lengths are
// only suggestions.

import { shortDate } from '../calendar.ts';
import { holidaysBetween, TRADITIONS, type Holiday, type HolidayChoice } from '../holidays.ts';
import { nextPhase } from '../moon.ts';
import { premadeDraft, type Premade } from '../rituals/premade/index.ts';
import type { TemplateDraft } from '../rituals/types.ts';
import type { Journey, Lesson, Practice, Rite, Stage, StageKind } from './types.ts';

export const PROGRESS_COLLECTION = 'journeys.progress';

export type PracticeLogEntry = { at: string; note?: string };

export type DecisionKind = 'continue' | 'pause' | 'stop' | 'another';
export type Decision = { kind: DecisionKind; at: string; note?: string };

export type JourneyProgress = {
  journeyId: string;
  startedAt: string;
  /** Index into journey.stages. */
  stage: number;
  /** When the current stage began; moved on by the length of any pause, so pauses don't count. */
  stageStartedAt?: string;
  /** Lesson id → when it was marked read. */
  lessonsRead: Record<string, string>;
  /** Practice id → each time it was done. */
  practiceLog: Record<string, PracticeLogEntry[]>;
  /** Stage kind → when it was finished or moved on from. */
  stageDoneAt: Partial<Record<StageKind, string>>;
  /** Set while paused: when the pause began. */
  paused?: string;
  /** Time spent paused, in milliseconds, over the whole journey. */
  pausedMs?: number;
  /** The discernment choice. */
  decision?: Decision;
  /** Discernment answers, by question index. */
  answers?: Record<string, string>;
  /** Stage kind → the ritual session begun from its rite (to notice when it's finished). */
  riteSessions?: Partial<Record<StageKind, string>>;
  /** Stage kind → when its rite was done. */
  ritesDoneAt?: Partial<Record<StageKind, string>>;
  dedicatedAt?: string;
  rededications: string[];
};

export type JourneyStatus = 'active' | 'paused' | 'stopped' | 'dedicated';

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
const dayDiff = (from: Date, to: Date) => Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY);

export function newProgress(journeyId: string, now: Date): JourneyProgress {
  const at = now.toISOString();
  return { journeyId, startedAt: at, stage: 0, stageStartedAt: at, lessonsRead: {}, practiceLog: {}, stageDoneAt: {}, rededications: [] };
}

/** Fill anything an older or partial copy is missing, so the screens never trip over it. */
export function normalizeProgress(p: Partial<JourneyProgress> & { journeyId: string }): JourneyProgress {
  const startedAt = p.startedAt ?? new Date(0).toISOString();
  return {
    ...p,
    journeyId: p.journeyId,
    startedAt,
    stage: Number.isInteger(p.stage) && (p.stage as number) >= 0 ? (p.stage as number) : 0,
    lessonsRead: p.lessonsRead ?? {},
    practiceLog: p.practiceLog ?? {},
    stageDoneAt: p.stageDoneAt ?? {},
    rededications: Array.isArray(p.rededications) ? p.rededications : [],
  };
}

export function journeyStatus(p: JourneyProgress): JourneyStatus {
  if (p.decision && (p.decision.kind === 'stop' || p.decision.kind === 'another')) return 'stopped';
  if (p.paused) return 'paused';
  if (p.dedicatedAt) return 'dedicated';
  return 'active';
}

/** The newest progress for a journey that's still going, else the newest at all. */
export function progressFor<T extends { data: JourneyProgress; createdAt: string }>(entries: T[], journeyId: string): T | null {
  const mine = entries.filter((e) => e.data?.journeyId === journeyId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return mine.find((e) => journeyStatus(normalizeProgress(e.data)) !== 'stopped') ?? mine[0] ?? null;
}

export const stageIndex = (journey: Journey, p: JourneyProgress) => Math.max(0, Math.min(journey.stages.length - 1, p.stage));

export function currentStage(journey: Journey, p: JourneyProgress): { stage: Stage; index: number } {
  const index = stageIndex(journey, p);
  return { stage: journey.stages[index], index };
}

// ------------------------------------------------------------------ cadence

export type CadenceContext = {
  /** Which calendars the person keeps (for the hemisphere, and to prefer their own). */
  choice?: HolidayChoice | null;
  /** Calendars hidden in Settings: never used. */
  hidden?: string[];
};

export type CalendarEvent = { name: string; date: Date; days: number };

/** The Wheel of the Year in the hemisphere the person keeps (northern unless they chose only the southern). */
function wheelId(choice?: HolidayChoice | null) {
  const t = choice?.traditions ?? [];
  return t.includes('wheel_south') && !t.includes('wheel') ? 'wheel_south' : 'wheel';
}

/** The eight sabbats between two dates. */
export function sabbatsBetween(from: Date, to: Date, choice?: HolidayChoice | null): CalendarEvent[] {
  return holidaysBetween(from, to, { traditions: [wheelId(choice)], custom: [] }).map(toEvent);
}

const toEvent = (h: Holiday): CalendarEvent => ({ name: h.name, date: h.date, days: h.days });

/**
 * Where a bare holiday id (as journeys list them: 'samhain', 'noumenia')
 * is kept: every calendar that has it, preferring the person's own, and the
 * southern Wheel only for those who keep it. Hidden calendars are left out.
 */
export function holyDayPicks(ids: string[], choice?: HolidayChoice | null, hidden: string[] = []): string[] {
  const kept = choice?.traditions ?? [];
  const wheel = wheelId(choice);
  const picks: string[] = [];
  for (const id of ids) {
    const homes = TRADITIONS.filter((t) => t.holidays.some((h) => h.id === id)).map((t) => t.id);
    const usable = homes.filter((t) => (t === 'wheel' || t === 'wheel_south' ? t === wheel : true));
    const shown = usable.filter((t) => !hidden.includes(t));
    const preferred = shown.filter((t) => kept.includes(t));
    const home = preferred[0] ?? shown[0];
    if (home) picks.push(`${home}/${id}`);
  }
  return picks;
}

/** A journey's holy days between two dates, in date order. */
export function holyDaysBetween(
  journey: Pick<Journey, 'holyDays'>,
  from: Date,
  to: Date,
  choice?: HolidayChoice | null,
  hidden: string[] = [],
): Holiday[] {
  const picked = holyDayPicks(journey.holyDays ?? [], choice, hidden);
  if (!picked.length) return [];
  return holidaysBetween(from, to, { traditions: ['custom'], custom: [], picked });
}

/** The full moons between two dates. */
export function fullMoonsBetween(from: Date, to: Date): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  let at = nextPhase(new Date(from.getTime() - DAY), 'full');
  while (at.getTime() <= to.getTime() && out.length < 40) {
    out.push({ name: 'Full moon', date: startOfDay(at), days: 1 });
    at = nextPhase(new Date(at.getTime() + DAY), 'full');
  }
  return out;
}

export type PracticeState = {
  practice: Practice;
  count: number;
  times: number;
  done: boolean;
  /** Good to do today. */
  due: boolean;
  /** When it next comes round, if not today. */
  nextAt: Date | null;
  /** What it waits for ("Full moon", "Noumenia"…), when it keeps a calendar. */
  nextName: string | null;
  lastAt: Date | null;
};

// A moon or holy day is kept from the day before to the day after.
const WINDOW_BEFORE = 1;
const WINDOW_AFTER = 1;

function eventCadence(events: CalendarEvent[], now: Date, last: Date | null) {
  const today = startOfDay(now).getTime();
  for (const e of events) {
    const open = addDays(e.date, -WINDOW_BEFORE).getTime();
    const close = addDays(e.date, e.days - 1 + WINDOW_AFTER).getTime();
    if (close < today) continue;
    if (open <= today) {
      // In this window: due unless already done in it.
      if (!last || last.getTime() < open) return { due: true, nextAt: e.date, nextName: e.name };
      continue;
    }
    return { due: false, nextAt: e.date, nextName: e.name };
  }
  return { due: false, nextAt: null, nextName: null };
}

/** How a practice stands today, by its `every` cadence. */
export function practiceState(practice: Practice, journey: Journey, p: JourneyProgress, now: Date, ctx: CadenceContext = {}): PracticeState {
  const log = p.practiceLog[practice.id] ?? [];
  const times = Math.max(1, practice.times || 1);
  const count = log.length;
  const lastAt = log.length ? new Date(log.reduce((a, b) => (a.at > b.at ? a : b)).at) : null;
  const base = { practice, count, times, lastAt };
  if (count >= times) return { ...base, done: true, due: false, nextAt: null, nextName: null };
  const today = startOfDay(now);

  const after = (next: Date) => (next.getTime() <= today.getTime() ? { due: true, nextAt: null } : { due: false, nextAt: next });
  const ahead = addDays(now, 400);
  let every = practice.every;
  if (every === 'holy-day' && !(journey.holyDays ?? []).length) every = 'month';

  switch (every) {
    case 'day':
      return { ...base, done: false, nextName: null, ...(lastAt ? after(addDays(lastAt, 1)) : { due: true, nextAt: null }) };
    case 'week':
      return { ...base, done: false, nextName: null, ...(lastAt ? after(addDays(lastAt, 7)) : { due: true, nextAt: null }) };
    case 'month':
      return { ...base, done: false, nextName: null, ...(lastAt ? after(startOfDay(addMonths(lastAt, 1))) : { due: true, nextAt: null }) };
    case 'esbat':
      return { ...base, done: false, ...eventCadence(fullMoonsBetween(addDays(now, -3), ahead), now, lastAt) };
    case 'sabbat':
      return { ...base, done: false, ...eventCadence(sabbatsBetween(addDays(now, -3), ahead, ctx.choice), now, lastAt) };
    case 'holy-day': {
      const events = holyDaysBetween(journey, addDays(now, -3), ahead, ctx.choice, ctx.hidden).map(toEvent);
      return { ...base, done: false, ...eventCadence(events, now, lastAt) };
    }
    default:
      // Once, or as often as you like: due until it's done (never twice in a day).
      return {
        ...base,
        done: false,
        nextName: null,
        ...(lastAt && dayDiff(lastAt, now) < 1 ? { due: false, nextAt: addDays(today, 1) } : { due: true, nextAt: null }),
      };
  }
}

// ------------------------------------------------------------------ stages

export type StageCompletion = {
  lessonsRead: number;
  lessonsTotal: number;
  practicesDone: number;
  practicesTotal: number;
  riteDone: boolean;
  hasRite: boolean;
  /** Everything in it done (lessons read, practices done enough times, its rite, its choice). */
  complete: boolean;
  /** 0–1, for a progress bar. */
  fraction: number;
  /** Finished or moved on from. */
  doneAt: string | null;
};

export function stageCompletion(journey: Journey, p: JourneyProgress, index: number): StageCompletion {
  const stage = journey.stages[index];
  const lessonsTotal = stage.lessons.length;
  const lessonsRead = stage.lessons.filter((l) => p.lessonsRead[l.id]).length;
  const practicesTotal = stage.practices.reduce((n, pr) => n + Math.max(1, pr.times || 1), 0);
  const practicesDone = stage.practices.reduce((n, pr) => n + Math.min(Math.max(1, pr.times || 1), (p.practiceLog[pr.id] ?? []).length), 0);
  const hasRite = !!stage.rite;
  const riteDone = !hasRite || !!p.ritesDoneAt?.[stage.kind] || (stage.kind === 'dedication' && !!p.dedicatedAt);
  const choiceMade = stage.kind !== 'discernment' || !!p.decision;
  const dedicated = stage.kind !== 'dedication' || !!p.dedicatedAt;
  const parts = lessonsTotal + practicesTotal + (hasRite ? 1 : 0) + (stage.kind === 'discernment' ? 1 : 0);
  const doneParts = lessonsRead + practicesDone + (hasRite && riteDone ? 1 : 0) + (stage.kind === 'discernment' && p.decision ? 1 : 0);
  const complete = stage.kind !== 'ongoing' && lessonsRead === lessonsTotal && practicesDone === practicesTotal && riteDone && choiceMade && dedicated;
  return {
    lessonsRead,
    lessonsTotal,
    practicesDone,
    practicesTotal,
    riteDone,
    hasRite,
    complete,
    fraction: parts ? doneParts / parts : 1,
    doneAt: p.stageDoneAt[stage.kind] ?? null,
  };
}

/** Days into the current stage (pauses don't count) against its suggested length. */
export function stagePace(journey: Journey, p: JourneyProgress, now: Date): { day: number; suggested: number; over: boolean; daysLeft: number } {
  const { stage } = currentStage(journey, p);
  const start = new Date(p.stageStartedAt ?? p.startedAt);
  const until = p.paused ? new Date(p.paused) : now;
  const day = Math.max(1, dayDiff(start, until) + 1);
  const suggested = Math.max(1, stage.days);
  return { day, suggested, over: day > suggested, daysLeft: Math.max(0, suggested - day) };
}

/** Days since the journey began, without the paused time. */
export function journeyDays(p: JourneyProgress, now: Date): number {
  const until = p.paused ? new Date(p.paused) : now;
  const ms = until.getTime() - new Date(p.startedAt).getTime() - (p.pausedMs ?? 0);
  return Math.max(0, Math.floor(ms / DAY));
}

/** The whole journey's suggested length in days, without the ongoing year. */
export const suggestedDays = (journey: Journey) => journey.stages.filter((s) => s.kind !== 'ongoing').reduce((n, s) => n + s.days, 0);

// ------------------------------------------------------------------ today

export type NextStep =
  | { kind: 'paused'; since: Date }
  | { kind: 'stopped' }
  | { kind: 'lesson'; lesson: Lesson; stage: Stage }
  | { kind: 'practice'; practice: Practice; state: PracticeState; stage: Stage }
  | { kind: 'rite'; rite: Rite; stage: Stage }
  | { kind: 'discern'; stage: Stage }
  | { kind: 'rededicate'; dueAt: Date }
  | { kind: 'advance'; stage: Stage; next: Stage | null }
  | { kind: 'waiting'; stage: Stage; nextAt: Date | null; nextName: string | null; practice: Practice | null };

/** Everything worth doing today, the most fitting first. Never a requirement: just an offer. */
export function nextSteps(journey: Journey, p: JourneyProgress, now: Date, ctx: CadenceContext = {}): NextStep[] {
  const status = journeyStatus(p);
  if (status === 'stopped') return [{ kind: 'stopped' }];
  if (status === 'paused') return [{ kind: 'paused', since: new Date(p.paused!) }];
  const { stage, index } = currentStage(journey, p);
  const steps: NextStep[] = [];

  if (stage.kind === 'ongoing' || p.dedicatedAt) {
    const re = rededication(p, now);
    if (re && re.due) steps.push({ kind: 'rededicate', dueAt: re.nextAt });
  }

  const unread = stage.lessons.find((l) => !p.lessonsRead[l.id]);
  if (unread) steps.push({ kind: 'lesson', lesson: unread, stage });

  const states = stage.practices.map((pr) => practiceState(pr, journey, p, now, ctx));
  for (const state of states) if (state.due) steps.push({ kind: 'practice', practice: state.practice, state, stage });

  const completion = stageCompletion(journey, p, index);
  if (stage.rite && !completion.riteDone) {
    // The threshold opens the way, so its rite comes as soon as you like; the dedication waits for its reading.
    if (stage.kind !== 'dedication' || !unread) steps.push({ kind: 'rite', rite: stage.rite, stage });
  }
  if (stage.kind === 'discernment' && !p.decision && !unread) steps.push({ kind: 'discern', stage });

  const next = journey.stages[index + 1] ?? null;
  if (completion.complete && next) steps.push({ kind: 'advance', stage, next });

  if (!steps.length) {
    const waiting = states
      .filter((s) => !s.done && s.nextAt)
      .sort((a, b) => a.nextAt!.getTime() - b.nextAt!.getTime())[0];
    steps.push({ kind: 'waiting', stage, nextAt: waiting?.nextAt ?? null, nextName: waiting?.nextName ?? null, practice: waiting?.practice ?? null });
  }
  return steps;
}

export const nextStep = (journey: Journey, p: JourneyProgress, now: Date, ctx: CadenceContext = {}) => nextSteps(journey, p, now, ctx)[0];

/** A line for a list: what's next, in words. */
export function nextStepLine(step: NextStep | undefined): string {
  if (!step) return '';
  switch (step.kind) {
    case 'paused':
      return 'Paused · waiting for you';
    case 'stopped':
      return 'Set down with grace';
    case 'lesson':
      return `Read: ${step.lesson.title}`;
    case 'practice':
      return `Today: ${step.practice.title}`;
    case 'rite':
      return `When you're ready: ${step.rite.title}`;
    case 'discern':
      return 'Time to discern: continue, pause or set it down';
    case 'rededicate':
      return 'A year on: time to rededicate';
    case 'advance':
      return step.next ? `Ready for ${step.next.title}` : 'Stage complete';
    case 'waiting':
      return step.nextAt && step.nextName
        ? `Next: ${step.nextName}, ${shortDate(step.nextAt)}`
        : step.nextAt
          ? `Next on ${shortDate(step.nextAt)}`
          : `${step.stage.title}: nothing more today`;
  }
}

// ------------------------------------------------------------------ changes

export const markRead = (p: JourneyProgress, lessonId: string, now: Date): JourneyProgress => ({
  ...p,
  lessonsRead: { ...p.lessonsRead, [lessonId]: p.lessonsRead[lessonId] ?? now.toISOString() },
});

export function markUnread(p: JourneyProgress, lessonId: string): JourneyProgress {
  const lessonsRead = { ...p.lessonsRead };
  delete lessonsRead[lessonId];
  return { ...p, lessonsRead };
}

const unpaused = (p: JourneyProgress): JourneyProgress => {
  const next = { ...p };
  delete next.paused;
  return next;
};

export function logPractice(p: JourneyProgress, practiceId: string, now: Date, note?: string): JourneyProgress {
  const entry: PracticeLogEntry = note?.trim() ? { at: now.toISOString(), note: note.trim() } : { at: now.toISOString() };
  return { ...p, practiceLog: { ...p.practiceLog, [practiceId]: [...(p.practiceLog[practiceId] ?? []), entry] } };
}

export function unlogPractice(p: JourneyProgress, practiceId: string, at: string): JourneyProgress {
  const list = (p.practiceLog[practiceId] ?? []).filter((e) => e.at !== at);
  return { ...p, practiceLog: { ...p.practiceLog, [practiceId]: list } };
}

/** Move on to the next stage, whether or not everything in this one was done. */
export function advanceStage(journey: Journey, p: JourneyProgress, now: Date): JourneyProgress {
  const { stage, index } = currentStage(journey, p);
  if (index >= journey.stages.length - 1) return p;
  return {
    ...p,
    stage: index + 1,
    stageStartedAt: now.toISOString(),
    stageDoneAt: { ...p.stageDoneAt, [stage.kind]: p.stageDoneAt[stage.kind] ?? now.toISOString() },
  };
}

/** Go back to an earlier stage (to reread or redo). Nothing done is lost. */
export function goToStage(journey: Journey, p: JourneyProgress, index: number, now: Date): JourneyProgress {
  const to = Math.max(0, Math.min(journey.stages.length - 1, index));
  if (to === p.stage) return p;
  return { ...p, stage: to, stageStartedAt: now.toISOString() };
}

export const pauseJourney = (p: JourneyProgress, now: Date): JourneyProgress => (p.paused ? p : { ...p, paused: now.toISOString() });

/** Pick up where you left off; the stage's days start again from where they stood. */
export function resumeJourney(p: JourneyProgress, now: Date): JourneyProgress {
  if (!p.paused) return p;
  const gap = Math.max(0, now.getTime() - new Date(p.paused).getTime());
  const rest = unpaused(p);
  const stageStartedAt = new Date(new Date(p.stageStartedAt ?? p.startedAt).getTime() + gap).toISOString();
  const decision = p.decision?.kind === 'pause' ? undefined : p.decision;
  return { ...rest, decision, stageStartedAt, pausedMs: (p.pausedMs ?? 0) + gap };
}

/** The discernment choice. Continue moves on to the dedication; pause waits; stop and another set it down gently. */
export function decide(journey: Journey, p: JourneyProgress, kind: DecisionKind, now: Date, note?: string): JourneyProgress {
  const decision: Decision = note?.trim() ? { kind, at: now.toISOString(), note: note.trim() } : { kind, at: now.toISOString() };
  const withChoice: JourneyProgress = { ...p, decision };
  if (kind === 'pause') return pauseJourney(withChoice, now);
  if (kind === 'continue') {
    // On to the dedication: the stage after discernment.
    const at = journey.stages.findIndex((s) => s.kind === 'discernment');
    if (at < 0 || p.stage > at) return unpaused(withChoice);
    return advanceStage(journey, { ...unpaused(withChoice), stage: at }, now);
  }
  return unpaused(withChoice);
}

export const setAnswer = (p: JourneyProgress, index: number, text: string): JourneyProgress => ({
  ...p,
  answers: { ...(p.answers ?? {}), [String(index)]: text },
});

export const riteBegun = (p: JourneyProgress, kind: StageKind, sessionId: string): JourneyProgress => ({
  ...p,
  riteSessions: { ...(p.riteSessions ?? {}), [kind]: sessionId },
});

/** A stage's rite is done; the dedication rite also marks the day of dedication. */
export function riteDone(p: JourneyProgress, kind: StageKind, at: Date): JourneyProgress {
  if (p.ritesDoneAt?.[kind]) return p;
  const iso = at.toISOString();
  const next: JourneyProgress = { ...p, ritesDoneAt: { ...(p.ritesDoneAt ?? {}), [kind]: iso } };
  return kind === 'dedication' && !p.dedicatedAt ? { ...next, dedicatedAt: iso } : next;
}

/** After the dedication, the ongoing stage: move to it if not there yet. */
export function enterOngoing(journey: Journey, p: JourneyProgress, now: Date): JourneyProgress {
  const at = journey.stages.findIndex((s) => s.kind === 'ongoing');
  if (at < 0 || p.stage >= at) return p;
  let next = p;
  while (next.stage < at) next = advanceStage(journey, next, now);
  return next;
}

// ------------------------------------------------------------------ the year after

export type Rededication = { lastAt: Date; nextAt: Date; due: boolean; soon: boolean; daysUntil: number; count: number };

/** Yearly rededication, counted from the dedication or the last rededication. Null before dedicating. */
export function rededication(p: JourneyProgress, now: Date): Rededication | null {
  if (!p.dedicatedAt) return null;
  const all = [p.dedicatedAt, ...p.rededications].map((s) => new Date(s)).filter((d) => !Number.isNaN(d.getTime()));
  const lastAt = all.reduce((a, b) => (a > b ? a : b));
  const nextAt = new Date(lastAt.getFullYear() + 1, lastAt.getMonth(), lastAt.getDate());
  const daysUntil = dayDiff(now, nextAt);
  return { lastAt, nextAt, due: daysUntil <= 0, soon: daysUntil > 0 && daysUntil <= 30, daysUntil, count: p.rededications.length };
}

export const rededicate = (p: JourneyProgress, now: Date): JourneyProgress => ({ ...p, rededications: [...p.rededications, now.toISOString()] });

// ------------------------------------------------------------------ rites

/** A journey's rite as a template draft, to begin as a guided ritual. */
export function riteDraft(rite: Rite, journey: Pick<Journey, 'id' | 'title'>): TemplateDraft {
  const premade: Premade = {
    id: `${journey.id}-rite`,
    title: rite.title,
    kind: 'ritual',
    summary: rite.summary,
    intention: null,
    practices: ['solitary'],
    paths: [],
    minutes: rite.minutes,
    level: 'beginner',
    solo: true,
    ingredients: rite.ingredients,
    preparation: rite.preparation,
    steps: rite.steps,
    closing: rite.closing,
    safety: rite.safety,
    lore: '',
  };
  return premadeDraft(premade);
}
