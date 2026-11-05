// Every psychic-development session is one craft entry in `psychic.sessions`
// (saved on the phone, synced with the rest of your craft entries). One shape
// for all five exercises; the ones that can be scored carry trials, hits and
// the chance of a hit on each trial. They appear in the one Journal as the
// "Psychic development" kind. Pure, so it can be tested.

import { moonState } from '../../moon.ts';
import { localDateKey } from '../../rituals/lifecycle.ts';
import type { Logged } from './stats.ts';

export const PSYCHIC_SESSIONS = 'psychic.sessions';

export type PsychicKind = 'esp' | 'remote' | 'precog' | 'psychometry' | 'intuition';

export const PSYCHIC_KINDS: { id: PsychicKind; label: string; scored: boolean }[] = [
  { id: 'esp', label: 'Card & colour guessing', scored: true },
  { id: 'remote', label: 'Remote viewing', scored: true },
  { id: 'precog', label: 'Tomorrow’s card', scored: true },
  { id: 'psychometry', label: 'Psychometry', scored: false },
  { id: 'intuition', label: 'Intuition prompt', scored: false },
];

export const psychicKindLabel = (k: string) => PSYCHIC_KINDS.find((x) => x.id === k)?.label ?? 'Psychic development';

export type PsychicSession = {
  kind: PsychicKind;
  /** When it happened (ISO) and its local day. */
  at: string;
  date: string;
  moonPhase: string;
  /** Scored exercises: trials, hits and the chance of a hit on each by luck. Zero trials when nothing could be scored. */
  trials: number;
  hits: number;
  chance: number;
  /** A one-line summary for the Journal. */
  summary: string;
  /** Exercise-specific detail (the mode, the trials, impressions, the picture, a self-rating…). */
  detail: Record<string, unknown>;
  warmup?: string;
};

export type SessionEntry = { id: string; createdAt?: string; data: PsychicSession };

const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

export function normalizeSession(raw: unknown): PsychicSession {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<PsychicSession>;
  const at = typeof r.at === 'string' && !Number.isNaN(new Date(r.at).getTime()) ? r.at : new Date(0).toISOString();
  const kind = PSYCHIC_KINDS.some((k) => k.id === r.kind) ? (r.kind as PsychicKind) : 'intuition';
  return {
    kind,
    at,
    date: typeof r.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : localDateKey(new Date(at)),
    moonPhase: typeof r.moonPhase === 'string' ? r.moonPhase : moonState(new Date(at)).name,
    trials: Math.max(0, num(r.trials)),
    hits: Math.max(0, num(r.hits)),
    chance: Math.min(1, Math.max(0, num(r.chance, 0.5))),
    summary: typeof r.summary === 'string' ? r.summary : '',
    detail: r.detail && typeof r.detail === 'object' ? (r.detail as Record<string, unknown>) : {},
    ...(typeof r.warmup === 'string' && r.warmup ? { warmup: r.warmup } : {}),
  };
}

/** A new session, stamped with the moment, the day and the moon. */
export function newSession(input: Pick<PsychicSession, 'kind' | 'summary'> & Partial<Pick<PsychicSession, 'trials' | 'hits' | 'chance' | 'detail' | 'warmup'>>, now: Date = new Date()): PsychicSession {
  return normalizeSession({ trials: 0, hits: 0, chance: 0.5, detail: {}, ...input, at: now.toISOString(), date: localDateKey(now), moonPhase: moonState(now).name });
}

/** The scored sessions of one kind (or all kinds), as the rows the stats work on. */
export function scoredRuns(list: readonly SessionEntry[], kind?: PsychicKind): Logged[] {
  return list
    .map((e) => normalizeSession(e.data))
    .filter((s) => s.trials > 0 && (!kind || s.kind === kind))
    .map((s) => ({ trials: s.trials, hits: s.hits, chance: s.chance, date: s.date, at: s.at, moonPhase: s.moonPhase }));
}

/** The one Journal's row for a session. */
export function sessionTimelineItem(e: SessionEntry) {
  const s = normalizeSession(e.data);
  return {
    kind: 'psychic' as const,
    id: e.id,
    date: s.date,
    at: s.at,
    title: psychicKindLabel(s.kind),
    detail: [s.summary, s.moonPhase].filter(Boolean).join(' · '),
    href: '/rituals/craft/psychic/progress',
  };
}
