// The ritual lifecycle: start a session from a template, step through it,
// pause, finish, and turn it into a journal entry. Pure functions that mirror
// js/ritual-lifecycle.js and altar/js/features/ritual-system.js so sessions
// started here look the same as sessions started on the website's altar.

import { moonState } from '../moon.ts';
import type {
  JournalAnswers,
  JournalRow,
  RitualEvent,
  RitualSession,
  SessionStatus,
  SessionStepRow,
  StepDraft,
  TemplateDraft,
  TemplateRow,
  TemplateStepRow,
} from './types.ts';

export const LIFECYCLE_VERSION = 1;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** RFC 4122 v4 id. Uses the platform's generator when there is one. */
export function uuid(): string {
  const native = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID;
  if (native) return native.call((globalThis as { crypto?: unknown }).crypto);
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Same buckets as the website's getRitualTimeOfDay. */
export function ritualTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return 'Late Night';
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
}

export function weekdayName(date: Date): string {
  return WEEKDAYS[date.getDay()];
}

export function contextSnapshot(now: Date): Record<string, unknown> {
  let timezone = '';
  let locale = '';
  try {
    const options = Intl.DateTimeFormat().resolvedOptions();
    timezone = options.timeZone ?? '';
    locale = options.locale ?? '';
  } catch {
    // Intl can be missing on very old engines; the fields are optional.
  }
  return {
    capturedAt: now.toISOString(),
    dayOfWeek: weekdayName(now),
    timeOfDay: ritualTimeOfDay(now),
    moonPhase: moonState(now).name,
    timezone,
    locale,
    source: 'app',
  };
}

function eventIdentity(event: Partial<RitualEvent>): string {
  return event.idempotencyKey || [event.type, event.stepId ?? '', event.occurredAt ?? ''].join(':');
}

/** Append an event once; a repeated idempotency key is ignored (as on the website). */
export function appendEvent<T extends { event_log: RitualEvent[]; updated_at: string }>(
  session: T,
  event: Omit<RitualEvent, 'occurredAt'> & { occurredAt?: string },
  now: Date,
): T {
  const candidate: RitualEvent = { occurredAt: now.toISOString(), ...event } as RitualEvent;
  const log = Array.isArray(session.event_log) ? session.event_log : [];
  const identity = eventIdentity(candidate);
  if (log.some((existing) => eventIdentity(existing) === identity)) return session;
  return { ...session, event_log: [...log, candidate], updated_at: now.toISOString() };
}

/** Minutes as typed ("2.5") to whole seconds, or null for no timer. */
export function minutesToSeconds(minutes: string): number | null {
  const value = Number(String(minutes).trim().replace(',', '.'));
  if (!String(minutes).trim() || !Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 60);
}

export function secondsToMinutes(seconds: number | null | undefined): string {
  if (!seconds) return '';
  const minutes = seconds / 60;
  return Number.isInteger(minutes) ? String(minutes) : String(Math.round(minutes * 10) / 10);
}

type StepSource = Pick<
  TemplateStepRow,
  'title' | 'instructions' | 'spoken_text' | 'duration_seconds' | 'completion_mode' | 'actions' | 'linked_entities' | 'metadata'
> & { id: string | null; sort_order: number };

function stepsFromTemplate(template: TemplateRow): StepSource[] {
  return [...(template.ritual_template_steps ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((step) => ({ ...step, id: step.id ?? null }));
}

function stepsFromDraft(steps: StepDraft[]): StepSource[] {
  return steps.map((step, index) => ({
    id: step.id,
    sort_order: index,
    title: step.title.trim() || `Step ${index + 1}`,
    instructions: step.instructions.trim() || null,
    spoken_text: step.spoken_text.trim() || null,
    duration_seconds: minutesToSeconds(step.minutes),
    completion_mode: step.completion_mode,
    actions: step.actions,
    linked_entities: [],
    metadata: {},
  }));
}

export type StartSource =
  | { kind: 'template'; template: TemplateRow }
  | { kind: 'draft'; draft: TemplateDraft }
  | { kind: 'free'; title: string; intention: string };

/**
 * A new active session. Template steps are copied (a snapshot), so editing the
 * template later never changes a ritual already done, as on the website.
 */
export function createSession(
  source: StartSource,
  options: { userId: string | null; now: Date; idFactory?: () => string },
): RitualSession {
  const makeId = options.idFactory ?? uuid;
  const now = options.now.toISOString();
  const id = makeId();

  let title: string;
  let intention: string | null;
  let templateId: string | null = null;
  let linkedAltarId: string | null = null;
  let steps: StepSource[];
  let metadata: Record<string, unknown> = { lifecycleVersion: LIFECYCLE_VERSION, app: 'mobile' };

  if (source.kind === 'template') {
    const t = source.template;
    title = t.title || 'Untitled Ritual';
    intention = t.intention || null;
    templateId = t.id;
    linkedAltarId = t.linked_altar_id;
    steps = stepsFromTemplate(t);
  } else if (source.kind === 'draft') {
    const d = source.draft;
    title = d.title.trim() || 'Untitled Ritual';
    intention = d.intention.trim() || null;
    templateId = d.id;
    linkedAltarId = d.linked_altar_id;
    steps = stepsFromDraft(d.steps);
    if (d.ingredients.length) metadata = { ...metadata, ingredients: d.ingredients };
  } else {
    title = source.title.trim() || 'Untitled Ritual';
    intention = source.intention.trim() || null;
    steps = [];
  }

  const templateSnapshot = {
    id: templateId,
    title,
    intention: intention ?? '',
    linked_altar_id: linkedAltarId,
    steps: steps.map((s) => ({
      template_step_id: s.id,
      sort_order: s.sort_order,
      title: s.title,
      instructions: s.instructions ?? '',
      spoken_text: s.spoken_text ?? '',
      duration_seconds: s.duration_seconds ?? 0,
      completion_mode: s.completion_mode,
      actions: s.actions,
    })),
  };
  if (templateId) metadata = { ...metadata, templateSnapshot };

  const sessionSteps: SessionStepRow[] = steps.map((step, index) => ({
    id: makeId(),
    session_id: id,
    template_step_id: templateId ? step.id : null,
    sort_order: index,
    title: step.title,
    instructions: step.instructions,
    spoken_text: step.spoken_text,
    duration_seconds: step.duration_seconds,
    completion_mode: step.completion_mode,
    actions: step.actions ?? [],
    linked_entities: step.linked_entities ?? [],
    status: index === 0 ? 'active' : 'pending',
    started_at: index === 0 ? now : null,
    completed_at: null,
    elapsed_seconds: 0,
    metadata: step.metadata ?? {},
  }));

  return {
    id,
    user_id: options.userId,
    template_id: templateId,
    linked_altar_id: linkedAltarId,
    title,
    intention,
    source: templateId ? 'template' : 'manual',
    status: 'active',
    current_step_order: 0,
    started_at: now,
    ended_at: null,
    paused_at: null,
    paused_seconds: 0,
    altar_snapshot: {},
    context_snapshot: contextSnapshot(options.now),
    event_log: [
      templateId
        ? { type: 'template_session_started', templateId, occurredAt: now, idempotencyKey: `session_started:${id}` }
        : { type: 'session_started', occurredAt: now, source: 'app', idempotencyKey: `session_started:${id}` },
    ],
    metadata,
    created_at: now,
    updated_at: now,
    session_steps: sessionSteps,
  };
}

export function currentStep(session: RitualSession): SessionStepRow | null {
  return (
    session.session_steps.find((s) => s.status === 'active') ??
    session.session_steps.find((s) => s.status === 'pending') ??
    null
  );
}

/** Seconds spent on a step, not counting pauses (website's getStepElapsedSeconds). */
export function stepElapsed(step: SessionStepRow, session: RitualSession, now: Date): number {
  if (!step.started_at) return Number(step.elapsed_seconds || 0);
  const end =
    step.status === 'completed' || step.status === 'skipped'
      ? new Date(step.completed_at ?? now).getTime()
      : session.status === 'paused' && session.paused_at
        ? new Date(session.paused_at).getTime()
        : now.getTime();
  return Math.max(0, Number(step.elapsed_seconds || 0) + Math.floor((end - new Date(step.started_at).getTime()) / 1000));
}

export function sessionElapsed(session: RitualSession, now: Date): number {
  const end =
    session.ended_at
      ? new Date(session.ended_at).getTime()
      : session.status === 'paused' && session.paused_at
        ? new Date(session.paused_at).getTime()
        : now.getTime();
  const started = new Date(session.started_at).getTime();
  return Math.max(0, Math.floor((end - started) / 1000) - Number(session.paused_seconds || 0));
}

function advance(session: RitualSession, status: 'completed' | 'skipped', now: Date): RitualSession {
  const step = currentStep(session);
  if (!step || session.status !== 'active') return session;
  const at = now.toISOString();
  const elapsed = stepElapsed(step, session, now);
  const next = session.session_steps.find((s) => s.sort_order > step.sort_order && s.status === 'pending') ?? null;

  const steps = session.session_steps.map((s): SessionStepRow => {
    if (s.id === step.id) return { ...s, status, completed_at: at, elapsed_seconds: elapsed };
    if (next && s.id === next.id) return { ...s, status: 'active', started_at: at };
    return s;
  });
  const updated: RitualSession = {
    ...session,
    session_steps: steps,
    current_step_order: next ? next.sort_order : session.current_step_order,
  };
  return appendEvent(
    updated,
    {
      type: status === 'completed' ? 'step_completed' : 'step_skipped',
      stepId: step.id,
      stepTitle: step.title,
      idempotencyKey: `${status === 'completed' ? 'step_completed' : 'step_skipped'}:${session.id}:${step.id}`,
    },
    now,
  );
}

export const completeStep = (session: RitualSession, now: Date) => advance(session, 'completed', now);
export const skipStep = (session: RitualSession, now: Date) => advance(session, 'skipped', now);

export function pauseSession(session: RitualSession, now: Date): RitualSession {
  if (session.status !== 'active') return session;
  const step = currentStep(session);
  const steps = session.session_steps.map((s) =>
    step && s.id === step.id && s.started_at
      ? { ...s, elapsed_seconds: stepElapsed(s, session, now), started_at: null }
      : s,
  );
  const at = now.toISOString();
  return appendEvent(
    { ...session, session_steps: steps, status: 'paused', paused_at: at },
    { type: 'session_paused', idempotencyKey: `session_paused:${session.id}:${at}` },
    now,
  );
}

export function resumeSession(session: RitualSession, now: Date): RitualSession {
  if (session.status !== 'paused') return session;
  const pausedAt = new Date(session.paused_at ?? now).getTime();
  const added = Math.max(0, Math.floor((now.getTime() - pausedAt) / 1000));
  const step = currentStep(session);
  const at = now.toISOString();
  const steps = session.session_steps.map((s) => (step && s.id === step.id && !s.started_at ? { ...s, started_at: at } : s));
  return appendEvent(
    {
      ...session,
      session_steps: steps,
      status: 'active',
      paused_at: null,
      paused_seconds: Number(session.paused_seconds || 0) + added,
    },
    { type: 'session_resumed', idempotencyKey: `session_resumed:${session.id}:${now.getTime()}` },
    now,
  );
}

/** Close the session as completed or abandoned. Finishing twice changes nothing. */
export function finishSession(session: RitualSession, status: Extract<SessionStatus, 'completed' | 'abandoned'>, now: Date): RitualSession {
  if (session.status === 'completed' || session.status === 'abandoned') return session;
  // Pausing time that was never resumed still counts as paused.
  const resumed = session.status === 'paused' ? resumeSession(session, now) : session;
  const at = now.toISOString();
  const type = status === 'completed' ? 'session_completed' : 'session_abandoned';
  return appendEvent(
    { ...resumed, status, ended_at: at, metadata: { ...resumed.metadata, companionRunnerVersion: 1 } },
    { type, source: 'app', idempotencyKey: `${type}:${session.id}` },
    now,
  );
}

/** A timed step whose timer has run out should move on by itself. */
export function timedStepDue(session: RitualSession, now: Date): boolean {
  const step = currentStep(session);
  if (!step || session.status !== 'active' || step.completion_mode !== 'timed') return false;
  const duration = Number(step.duration_seconds || 0);
  return duration > 0 && stepElapsed(step, session, now) >= duration;
}

/** "04:05" or "1:02:03". */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Local calendar date YYYY-MM-DD (what user_rituals.ritual_date holds). */
export function localDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function blankAnswers(session: RitualSession | null, now: Date): JournalAnswers {
  const started = session ? new Date(session.started_at) : now;
  return {
    title: session?.title ?? '',
    intention: session?.intention ?? '',
    moon_phase: moonState(started).name,
    feelings_before: '',
    what_happened_during: '',
    feelings_during: '',
    signs_and_symbols: '',
    what_happened_after: '',
    feelings_after: '',
    dreams_and_follow_up: '',
    results: '',
    changes_for_next_time: '',
    notes: '',
    manual_minutes: '',
    ritual_date: localDateKey(started),
  };
}

const orNull = (value: string | null | undefined) => {
  const text = String(value ?? '').trim();
  return text ? text : null;
};

/**
 * The user_rituals payload for a journal entry: the same fields the website's
 * saveRitualJournal writes. With no session it is a hand-recorded ritual,
 * like the website's My Rituals form.
 */
export function journalPayload(input: {
  session: RitualSession | null;
  answers: JournalAnswers;
  userId: string | null;
  id: string;
  existing?: Pick<JournalRow, 'grimoire_page_id' | 'created_at' | 'tags' | 'location'> | null;
  now: Date;
}): JournalRow {
  const { session, answers, userId, id, existing, now } = input;
  const started = session ? new Date(session.started_at) : dateFromKey(answers.ritual_date) ?? now;
  const measured = session?.ended_at ? sessionElapsed(session, now) : null;
  const duration = measured ?? minutesToSeconds(answers.manual_minutes);
  const context = session?.context_snapshot ?? {};
  const steps = session?.session_steps ?? [];
  const ingredients = Array.isArray(session?.metadata?.ingredients) ? session?.metadata?.ingredients : undefined;

  return {
    id,
    user_id: userId,
    title: answers.title.trim() || session?.title || 'Untitled Ritual',
    intention: orNull(answers.intention),
    notes: orNull(answers.notes),
    moon_phase: orNull(answers.moon_phase),
    linked_altar: session?.linked_altar_id ?? null,
    tags: existing?.tags ?? [],
    ritual_date: session ? localDateKey(started) : answers.ritual_date || localDateKey(now),
    source: session ? (session.source === 'template' ? 'template' : session.source) : 'manual',
    template_id: session?.template_id ?? null,
    session_id: session?.id ?? null,
    linked_altar_id: session?.linked_altar_id ?? null,
    grimoire_page_id: existing?.grimoire_page_id ?? null,
    started_at: session?.started_at ?? null,
    ended_at: session?.ended_at ?? null,
    duration_seconds: duration,
    time_of_day: typeof context.timeOfDay === 'string' ? context.timeOfDay : session ? ritualTimeOfDay(started) : null,
    day_of_week: typeof context.dayOfWeek === 'string' ? context.dayOfWeek : weekdayName(started),
    preparation: null,
    what_happened_during: orNull(answers.what_happened_during),
    what_happened_after: orNull(answers.what_happened_after),
    feelings_before: orNull(answers.feelings_before),
    feelings_during: orNull(answers.feelings_during),
    feelings_after: orNull(answers.feelings_after),
    signs_and_symbols: orNull(answers.signs_and_symbols),
    dreams_and_follow_up: orNull(answers.dreams_and_follow_up),
    results: orNull(answers.results),
    changes_for_next_time: orNull(answers.changes_for_next_time),
    altar_snapshot: session?.altar_snapshot ?? {},
    context_snapshot: context,
    metadata: {
      journalVersion: 1,
      mode: session ? 'completed_session' : 'manual',
      app: 'mobile',
      completedSteps: steps.map((s) => ({ title: s.title, status: s.status, elapsedSeconds: s.elapsed_seconds })),
      ...(ingredients ? { ingredients } : {}),
    },
    created_at: existing?.created_at ?? now.toISOString(),
    updated_at: now.toISOString(),
  };
}

export function dateFromKey(key: string | null | undefined): Date | null {
  const match = key ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(key) : null;
  if (!match) return null;
  const date = new Date(+match[1], +match[2] - 1, +match[3]);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function blankStep(): StepDraft {
  return { id: null, title: '', instructions: '', spoken_text: '', minutes: '', completion_mode: 'manual', actions: [] };
}

export function draftFromTemplate(template: TemplateRow | null): TemplateDraft {
  if (!template) {
    return {
      id: null,
      title: '',
      intention: '',
      preparation: '',
      closing: '',
      linked_altar_id: null,
      grimoire_page_id: null,
      steps: [blankStep()],
      ingredients: [],
      kind: 'template',
    };
  }
  const ingredients = Array.isArray(template.metadata?.ingredients) ? (template.metadata.ingredients as TemplateDraft['ingredients']) : [];
  return {
    id: template.id,
    title: template.title,
    intention: template.intention ?? '',
    preparation: template.preparation ?? '',
    closing: template.closing ?? '',
    linked_altar_id: template.linked_altar_id,
    grimoire_page_id: template.grimoire_page_id,
    steps: stepsFromTemplate(template).map((s) => ({
      id: s.id,
      title: s.title,
      instructions: s.instructions ?? '',
      spoken_text: s.spoken_text ?? '',
      minutes: secondsToMinutes(s.duration_seconds),
      completion_mode: s.completion_mode === 'timed' ? 'timed' : 'manual',
      actions: Array.isArray(s.actions) ? s.actions : [],
    })),
    ingredients,
    kind: template.metadata?.kind === 'spell' ? 'spell' : 'template',
  };
}

/**
 * Journal answers from a saved entry, for editing it. When the entry has a
 * measured session length, editing keeps that rather than the typed minutes.
 */
export function answersFromJournal(entry: JournalRow): JournalAnswers {
  const text = (value: string | null | undefined) => value ?? '';
  return {
    title: entry.title,
    intention: text(entry.intention),
    moon_phase: text(entry.moon_phase),
    feelings_before: text(entry.feelings_before),
    what_happened_during: text(entry.what_happened_during),
    feelings_during: text(entry.feelings_during),
    signs_and_symbols: text(entry.signs_and_symbols),
    what_happened_after: text(entry.what_happened_after),
    feelings_after: text(entry.feelings_after),
    dreams_and_follow_up: text(entry.dreams_and_follow_up),
    results: text(entry.results),
    changes_for_next_time: text(entry.changes_for_next_time),
    notes: text(entry.notes),
    manual_minutes: secondsToMinutes(entry.duration_seconds),
    ritual_date: entry.ritual_date ?? '',
  };
}

/**
 * An edited journal entry: the answers change, and everything the ritual
 * itself recorded (session, template, altar, timing) is kept.
 */
export function applyAnswers(entry: JournalRow, answers: JournalAnswers, now: Date): JournalRow {
  const measured = !!entry.session_id && !!entry.ended_at;
  const day = entry.session_id ? null : dateFromKey(answers.ritual_date);
  return {
    ...entry,
    title: answers.title.trim() || entry.title || 'Untitled Ritual',
    intention: orNull(answers.intention),
    notes: orNull(answers.notes),
    moon_phase: orNull(answers.moon_phase),
    ritual_date: day ? answers.ritual_date : entry.ritual_date,
    day_of_week: day ? weekdayName(day) : entry.day_of_week,
    duration_seconds: measured ? entry.duration_seconds : minutesToSeconds(answers.manual_minutes),
    what_happened_during: orNull(answers.what_happened_during),
    what_happened_after: orNull(answers.what_happened_after),
    feelings_before: orNull(answers.feelings_before),
    feelings_during: orNull(answers.feelings_during),
    feelings_after: orNull(answers.feelings_after),
    signs_and_symbols: orNull(answers.signs_and_symbols),
    dreams_and_follow_up: orNull(answers.dreams_and_follow_up),
    results: orNull(answers.results),
    changes_for_next_time: orNull(answers.changes_for_next_time),
    updated_at: now.toISOString(),
  };
}

/** The same checks the website's template editor makes before saving. */
export function validateDraft(draft: TemplateDraft): string | null {
  if (!draft.title.trim()) return 'Name the ritual first.';
  if (!draft.steps.length) return 'Add at least one ritual step.';
  if (draft.steps.some((s) => !s.title.trim())) return 'Each ritual step needs a title.';
  return null;
}
