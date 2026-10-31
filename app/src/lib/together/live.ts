// Rituals together: a ritual run live by people in different places (a
// coven, or friends invited by a link). One person hosts; whoever leads (the
// host, or someone the lead is passed to) moves everyone through the same
// steps. There is a shared candle-lighting moment, a gentle list of who's
// here, a quiet chat (or none), and a shared ending where each person says
// "it is done" and may keep a note in their own journal.
//
// Pure: no React, no Supabase. The app (app/src/app/(tabs)/rituals/together/)
// and the website (rituals/together/, via js/core/together.js) read the same
// rules; the database's live_ritual_act
// (supabase/migrations/20261120000000_rituals_together_mentorship.sql) applies
// the same reducer, so a change made by the leader is checked twice and lands
// the same everywhere.

import { cleanCode, CODE_ALPHABET, SITE_ORIGIN } from '../covens/invites.ts';
import type { RitualStep as CovenRitualStep } from '../covens/model.ts';
import type { TemplateDraft } from '../rituals/types.ts';

export const LIVE_CODE_LENGTH = 8;
export const MAX_STEPS = 60;
export const MAX_PEOPLE = 60;
/** Someone counts as here when the live channel sees them, or they checked in within this long. */
export const HERE_SECONDS = 75;
/** A ritual nobody has touched for this long is treated as over. */
export const STALE_HOURS = 12;
export const MESSAGE_MAX = 1000;
export const NOTE_MAX = 2000;

export type LiveStep = { title: string; body: string; spoken: string; minutes: number | null };
export type LiveStatus = 'gathering' | 'live' | 'closing' | 'ended';
/** Where the ritual came from, so the page can link back to it. */
export type LiveSource = {
  kind: 'premade' | 'template' | 'spell' | 'gathering' | 'community' | 'free';
  ref?: string | null;
  /** A coven gathering's coven, for its link. */
  coven_slug?: string | null;
  preparation?: string;
  closing?: string;
};

export type LiveRitual = {
  id: string;
  host_id: string;
  leader_id: string | null;
  coven_id: string | null;
  coven_ritual_id: string | null;
  title: string;
  intention: string | null;
  steps: LiveStep[];
  source: LiveSource;
  invite_code: string;
  status: LiveStatus;
  current_step: number;
  candle_lit_at: string | null;
  candle_lit_by: string | null;
  quiet: boolean;
  version: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LivePerson = {
  live_id: string;
  user_id: string;
  role: 'host' | 'guest';
  joined_at: string;
  last_seen_at: string;
  done_at: string | null;
  left_at: string | null;
  removed_at: string | null;
  quiet: boolean;
};

export type LiveMessage = { id: string; live_id: string; user_id: string; body: string; created_at: string; deleted_at: string | null };

export type LiveAction =
  | { type: 'begin' }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'go'; step: number }
  | { type: 'pass'; to: string }
  | { type: 'light' }
  | { type: 'quiet'; on: boolean }
  | { type: 'close' }
  | { type: 'end' };

/** The part of the ritual the reducer changes (and the database stores). */
export type LiveState = Pick<LiveRitual, 'host_id' | 'leader_id' | 'status' | 'current_step' | 'candle_lit_at' | 'candle_lit_by' | 'quiet' | 'version' | 'started_at' | 'ended_at'> & {
  steps_count: number;
};

export type Reduced = { ok: true; state: LiveState } | { ok: false; error: string; state: LiveState };

export const stateOf = (live: LiveRitual): LiveState => ({
  host_id: live.host_id,
  leader_id: live.leader_id,
  status: live.status,
  current_step: live.current_step,
  candle_lit_at: live.candle_lit_at,
  candle_lit_by: live.candle_lit_by,
  quiet: live.quiet,
  version: live.version,
  started_at: live.started_at,
  ended_at: live.ended_at,
  steps_count: live.steps.length,
});

/** Who leads now: whoever the lead was passed to, else the host. */
export const leaderOf = (s: Pick<LiveState, 'host_id' | 'leader_id'>) => s.leader_id || s.host_id;

/** Those in the ritual now: joined, not gone, not asked to leave. */
export const activePeople = <T extends Pick<LivePerson, 'left_at' | 'removed_at'>>(people: T[]) => people.filter((p) => !p.left_at && !p.removed_at);

// The words for each refusal; the database raises the same ones.
export const ERRORS = {
  ended: 'The ritual has ended.',
  notLeader: 'Only the one leading can do that.',
  notHost: 'Only the host can do that.',
  notStarted: 'The ritual hasn’t begun yet.',
  started: 'The ritual has already begun.',
  noStep: 'There is no such step.',
  first: 'This is the first step.',
  notHere: 'They aren’t in the ritual.',
} as const;

/**
 * Apply one action by `actor`. Each change that lands moves `version` on by
 * one, so a page acting on an older picture of the ritual can be told to look again.
 *
 * - begin: the host or leader, while people gather; to the first step.
 * - next / back / go: the leader, while it's under way. Next from the last step opens the shared ending.
 * - pass: the leader or the host, to someone in the ritual (the host takes it back the same way).
 * - light: the leader or the host, once: the shared candle.
 * - quiet: the host; no chat for anyone while on.
 * - close: the leader or the host; the shared ending (each says "it is done").
 * - end: the host.
 */
export function reduceLive(state: LiveState, action: LiveAction, actor: string, people: Pick<LivePerson, 'user_id' | 'left_at' | 'removed_at'>[], now: Date = new Date()): Reduced {
  const fail = (error: string): Reduced => ({ ok: false, error, state });
  const done = (patch: Partial<LiveState>): Reduced => ({ ok: true, state: { ...state, ...patch, version: state.version + 1 } });
  const at = now.toISOString();
  const leads = actor === leaderOf(state);
  const hosts = actor === state.host_id;
  if (state.status === 'ended') return fail(ERRORS.ended);
  switch (action.type) {
    case 'begin':
      if (!leads && !hosts) return fail(ERRORS.notLeader);
      if (state.status !== 'gathering') return fail(ERRORS.started);
      if (state.steps_count < 1) return fail(ERRORS.noStep);
      return done({ status: 'live', current_step: 0, started_at: state.started_at ?? at });
    case 'next':
      if (!leads) return fail(ERRORS.notLeader);
      if (state.status !== 'live') return fail(ERRORS.notStarted);
      if (state.current_step >= state.steps_count - 1) return done({ status: 'closing' });
      return done({ current_step: state.current_step + 1 });
    case 'back':
      if (!leads) return fail(ERRORS.notLeader);
      if (state.status === 'closing') return done({ status: 'live', current_step: Math.max(0, state.steps_count - 1) });
      if (state.status !== 'live') return fail(ERRORS.notStarted);
      if (state.current_step <= 0) return fail(ERRORS.first);
      return done({ current_step: state.current_step - 1 });
    case 'go':
      if (!leads) return fail(ERRORS.notLeader);
      if (state.status !== 'live' && state.status !== 'closing') return fail(ERRORS.notStarted);
      if (!Number.isInteger(action.step) || action.step < 0 || action.step >= state.steps_count) return fail(ERRORS.noStep);
      return done({ status: 'live', current_step: action.step });
    case 'pass': {
      if (!leads && !hosts) return fail(ERRORS.notLeader);
      if (action.to !== state.host_id && !activePeople(people).some((p) => p.user_id === action.to)) return fail(ERRORS.notHere);
      return done({ leader_id: action.to === state.host_id ? null : action.to });
    }
    case 'light':
      if (!leads && !hosts) return fail(ERRORS.notLeader);
      if (state.candle_lit_at) return { ok: true, state };
      return done({ candle_lit_at: at, candle_lit_by: actor });
    case 'quiet':
      if (!hosts) return fail(ERRORS.notHost);
      if (state.quiet === !!action.on) return { ok: true, state };
      return done({ quiet: !!action.on });
    case 'close':
      if (!leads && !hosts) return fail(ERRORS.notLeader);
      if (state.status === 'closing') return { ok: true, state };
      return done({ status: 'closing', started_at: state.started_at ?? at });
    case 'end':
      if (!hosts) return fail(ERRORS.notHost);
      return done({ status: 'ended', ended_at: at, leader_id: null });
  }
}

/** Someone leaving or asked to leave: if they led, the lead returns to the host. */
export function afterLeaving(state: LiveState, userId: string): LiveState {
  return state.leader_id === userId ? { ...state, leader_id: null, version: state.version + 1 } : state;
}

/** Whether the ritual is over: ended, or untouched for half a day. */
export function isOver(live: Pick<LiveRitual, 'status' | 'updated_at'>, now: Date = new Date()): boolean {
  return live.status === 'ended' || now.getTime() - new Date(live.updated_at).getTime() > STALE_HOURS * 3600_000;
}

/** Who's here: those in the ritual whom the live channel sees, or who checked in lately. Host first, then by when they came. */
export function whoIsHere<T extends LivePerson>(people: T[], online: Iterable<string>, now: Date = new Date()): T[] {
  const on = new Set(online);
  return activePeople(people)
    .filter((p) => on.has(p.user_id) || now.getTime() - new Date(p.last_seen_at).getTime() <= HERE_SECONDS * 1000)
    .sort((a, b) => (a.role === b.role ? a.joined_at.localeCompare(b.joined_at) : a.role === 'host' ? -1 : 1));
}

/** The shared ending: how many of those in the ritual have said "it is done". */
export function endingCount(people: Pick<LivePerson, 'left_at' | 'removed_at' | 'done_at'>[]): { done: number; of: number; all: boolean } {
  const here = activePeople(people);
  const done = here.filter((p) => !!p.done_at).length;
  return { done, of: here.length, all: here.length > 0 && done === here.length };
}

/** Whether this person may write in the chat now (and see the box to). */
export function canChat(live: Pick<LiveRitual, 'status' | 'quiet'>, me: Pick<LivePerson, 'left_at' | 'removed_at'> | null | undefined): boolean {
  return !!me && !me.left_at && !me.removed_at && !live.quiet && live.status !== 'ended';
}

/** The line under the title: where the ritual stands. */
export function statusLine(live: Pick<LiveRitual, 'status' | 'current_step' | 'steps'>): string {
  switch (live.status) {
    case 'gathering':
      return 'Gathering. The ritual begins when the leader is ready.';
    case 'live':
      return `Step ${live.current_step + 1} of ${live.steps.length}`;
    case 'closing':
      return 'The ending. Each of you says when it is done.';
    case 'ended':
      return 'This ritual has ended.';
  }
}

// ─── Where the steps come from ───────────────────────────────────────────

const text = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);
const minutesOf = (value: unknown): number | null => {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(n) && n > 0 ? Math.min(600, Math.round(n * 10) / 10) : null;
};

/** Steps checked and trimmed to what the database keeps (at most sixty, each with a title). */
export function cleanSteps(steps: Partial<LiveStep>[]): LiveStep[] {
  return steps
    .map((s) => ({ title: text(s.title, 120), body: text(s.body, 4000), spoken: text(s.spoken, 2000), minutes: minutesOf(s.minutes) }))
    .filter((s) => s.title)
    .slice(0, MAX_STEPS);
}

export type LiveStart = { title: string; intention: string; steps: LiveStep[]; source: LiveSource };

/** A ritual from a draft: a premade working, a saved template or spell (draftFromTemplate), a community ritual. */
export function startFromDraft(draft: TemplateDraft, source: Pick<LiveSource, 'kind' | 'ref'>): LiveStart {
  return {
    title: text(draft.title, 120) || 'A ritual together',
    intention: text(draft.intention, 500),
    steps: cleanSteps(draft.steps.map((s) => ({ title: s.title, body: s.instructions, spoken: s.spoken_text, minutes: minutesOf(s.minutes) }))),
    source: { kind: source.kind, ref: source.ref ?? null, preparation: text(draft.preparation, 4000), closing: text(draft.closing, 4000) },
  };
}

/** A coven gathering's steps, as its planner set them out. */
export function startFromGathering(ritual: { id: string; title: string; intention: string | null }, steps: Pick<CovenRitualStep, 'position' | 'title' | 'instructions' | 'spoken_text' | 'duration_minutes'>[], covenSlug: string): LiveStart {
  return {
    title: text(ritual.title, 120) || 'A ritual together',
    intention: text(ritual.intention, 500),
    steps: cleanSteps([...steps].sort((a, b) => a.position - b.position).map((s) => ({ title: s.title, body: s.instructions ?? '', spoken: s.spoken_text ?? '', minutes: s.duration_minutes }))),
    source: { kind: 'gathering', ref: ritual.id, coven_slug: covenSlug },
  };
}

/** Where the ritual came from, on the app (`app`) or the website. Null when there's nowhere to go back to. */
export function sourceHref(source: LiveSource | null | undefined, app: boolean): string | null {
  if (!source?.ref) return null;
  const ref = encodeURIComponent(source.ref);
  switch (source.kind) {
    case 'premade':
      return app ? `/rituals/premade/${ref}` : `/rituals/premade/?id=${ref}`;
    case 'template':
    case 'spell':
      return app ? `/rituals/templates/${ref}` : `/rituals/?template=${ref}`;
    case 'community':
      return app ? `/rituals/community/${ref}` : `/rituals/community/?id=${ref}`;
    case 'gathering':
      if (!source.coven_slug) return null;
      return app ? `/coven/c/${encodeURIComponent(source.coven_slug)}/ritual/${ref}` : `/covens/coven/?c=${encodeURIComponent(source.coven_slug)}&tab=rituals&ritual=${ref}`;
    default:
      return null;
  }
}

// ─── Invite links ────────────────────────────────────────────────────────

const LIVE_CODE = new RegExp(`^[${CODE_ALPHABET}]{${LIVE_CODE_LENGTH}}$`);

/** The code in whatever someone pasted: the code, the website's link (…/rituals/together/?code=…) or the app's. */
export function parseLiveCode(input: string | null | undefined): string | null {
  const raw = String(input ?? '').trim();
  if (!raw) return null;
  const param = raw.match(/[?&#]code=([^&#\s]+)/i);
  const path = raw.match(/\/together\/join\/([A-Za-z0-9-]+)/i);
  const code = cleanCode(param ? decodeURIComponent(param[1]) : path ? path[1] : /[/:?=]/.test(raw) ? '' : raw);
  return LIVE_CODE.test(code) ? code : null;
}

/** The link to share: the website's page, which opens the app for those who have it. */
export const liveLink = (code: string) => `${SITE_ORIGIN}/rituals/together/?code=${encodeURIComponent(code)}`;
export const appLiveLink = (code: string) => `saltandsovereignty://rituals/together?code=${encodeURIComponent(code)}`;
export const shareLiveMessage = (title: string, link: string) => `Join me for ${title}, a ritual together on Salt & Sovereignty: ${link}`;

// ─── The ending, for your own journal ────────────────────────────────────

/** What goes in your journal from a ritual done together (the journal form's answers). */
export function journalAnswers(live: Pick<LiveRitual, 'title' | 'intention' | 'steps'>, note: string, people: number, now: Date = new Date()) {
  const together = people > 1 ? `Done together with ${people - 1} ${people - 1 === 1 ? 'other' : 'others'}, live.` : 'Done as a ritual together.';
  return {
    title: text(live.title, 120),
    intention: text(live.intention, 500),
    what_happened_during: `${together} Steps: ${live.steps.map((s) => s.title).join(' · ')}`.slice(0, 4000),
    notes: text(note, NOTE_MAX),
    ritual_date: now.toISOString().slice(0, 10),
  };
}

/** The guidance shown before joining or hosting: plain, kind and safe. */
export const TOGETHER_GUIDANCE = [
  'Rituals together are text only: there is no camera or microphone.',
  'The host can ask someone to leave. You can block or report anyone, and you won’t see messages from people you’ve blocked.',
  'Only share an invite link with people you’d be glad to practise with. Anyone with the link and a community profile (18+) can join until the ritual ends.',
] as const;
