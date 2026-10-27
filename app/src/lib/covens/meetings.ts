// Coven meetings, on top of the ritual builder (builder.ts): who a meeting
// is for, its own chat and who reads it afterwards, the meeting as it
// happens (the floor, an item's time, motions seconded and amended, votes
// called), what a motion or an election needs to pass, actions and how they
// carry forward, and the minutes written when it ends.
//
// The database keeps the same rules (supabase/migrations/20261107000200_coven_meetings.sql:
// coven_ritual_open_to, coven_meeting_chat_window, coven_meeting_reads_history
// and the rest); these mirror them so the screens can say what will happen.
// Pure, so it can be tested; the website uses the same (js/core/covens.js).

import { recordPageBlocks } from '../grimoire/coven.ts';
import { cleanPlan, isVoteAction, rolePeople, specsOf, type BuilderStep, type CustomAction, type MeetingSettings, type RitualPlan } from './builder.ts';
import { cleanValues, voteOptions, THRESHOLDS, type FieldSpec } from './fields.ts';
import type { RitualTask } from './contributions.ts';
import { andList, assigneeFromKey, assigneeLabel, cleanAssignees, includesMember, type Assignee, type PickEntry } from './picker.ts';
import { tallyVotes, voteResult, type VoteTally } from './script.ts';

const MINUTE = 60_000;
const DAY = 86_400_000;

export const DEFAULT_LEAD_MINUTES = 15;
export const DEFAULT_LENGTH_MINUTES = 90;

type Membership = { status: string; rank_id: string | null } | null | undefined;

/** Who is looking: their membership, and whether they are the coven's head or one of the site's moderators. */
export type MeetingViewer = { userId: string | null; membership: Membership; head?: boolean; site?: boolean };

/** What a meeting needs of its coven_rituals row. */
export type MeetingRow = {
  id: string;
  kind?: string | null;
  status: string;
  scheduled_for: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  created_by?: string | null;
  led_by?: string | null;
  plan?: unknown;
  audience?: unknown;
  chat_readers?: unknown;
  title?: string;
};

// ─── Settings and roles ──────────────────────────────────────────────────

/** A meeting's settings with their defaults filled in. */
export function meetingSettings(plan: Pick<RitualPlan, 'meeting' | 'roles' | 'template'>): Required<Omit<MeetingSettings, 'chair_role' | 'secretary_role'>> & { chair_role: string | null; secretary_role: string | null } {
  const m = plan.meeting ?? {};
  return {
    lead_minutes: m.lead_minutes ?? DEFAULT_LEAD_MINUTES,
    length_minutes: m.length_minutes ?? DEFAULT_LENGTH_MINUTES,
    chair_role: meetingRoleId(plan, 'chair'),
    secretary_role: meetingRoleId(plan, 'secretary'),
    series: m.series || plan.template || 'meeting',
    minutes_view: m.minutes_view ?? 'audience',
  };
}

const ROLE_NAMES = {
  chair: ['chair', 'chairperson', 'chair person', 'facilitator', 'presiding officer', 'convenor'],
  secretary: ['secretary', 'note taker', 'notetaker', 'scribe', 'clerk', 'minute taker'],
};

/** The meeting's Chair or Secretary role: the one its settings name, or the role called so. Mirrors public.coven_meeting_role. */
export function meetingRoleId(plan: Pick<RitualPlan, 'meeting' | 'roles'>, which: 'chair' | 'secretary'): string | null {
  const chosen = plan.meeting?.[which === 'chair' ? 'chair_role' : 'secretary_role'];
  if (chosen && plan.roles.some((r) => r.id === chosen)) return chosen;
  return plan.roles.find((r) => ROLE_NAMES[which].includes(r.name.trim().toLowerCase()))?.id ?? null;
}

/** Whether a list names this person (an empty list names no one). */
const names = (list: Assignee[], v: Pick<MeetingViewer, 'membership' | 'userId'>) => cleanAssignees(list).length > 0 && includesMember(list, v.membership, v.userId);

/** Whether this person is cast as the meeting's Chair (or Secretary). */
export function castAs(plan: Pick<RitualPlan, 'meeting' | 'roles'>, which: 'chair' | 'secretary', v: Pick<MeetingViewer, 'membership' | 'userId'>): boolean {
  const id = meetingRoleId(plan, which);
  return !!id && names(rolePeople(plan, [id]), v);
}

/** The meeting's actions are carried forward to later meetings of the same series. */
export const seriesOf = (plan: Pick<RitualPlan, 'meeting' | 'roles' | 'template'>) => meetingSettings(plan).series;

// ─── Who it is for ───────────────────────────────────────────────────────

/** A saved audience: a list of {kind, id}, or null for the whole coven (empty, or naming the whole coven, is the whole coven). */
export function cleanAudience(raw: unknown): Assignee[] | null {
  const list = cleanAssignees(raw);
  return list.length && !list.some((a) => a.kind === 'coven') ? list : null;
}

/**
 * Whether a gathering is open to this person: anyone in the coven when it's
 * for the whole coven; otherwise those it names, those cast in its roles,
 * whoever planned it and the coven's head. The site's moderators always.
 * Mirrors public.coven_ritual_open_to.
 */
export function inAudience(r: Pick<MeetingRow, 'audience' | 'plan' | 'created_by'>, v: MeetingViewer): boolean {
  if (v.site) return true;
  if (!v.userId || v.membership?.status !== 'active') return false;
  const audience = cleanAudience(r.audience);
  if (!audience) return true;
  if (v.head || (r.created_by && r.created_by === v.userId)) return true;
  if (includesMember(audience, v.membership, v.userId)) return true;
  const plan = cleanPlan(r.plan, 'meeting');
  return names(rolePeople(plan, plan.roles.map((x) => x.id)), v);
}

/** "Everyone in the coven", or "Every Elder, the Maiden and Rowan". */
export function audienceLabel(audience: unknown, ranks: { id: string; name: string }[], nameOf: (id: string) => string): string {
  const list = cleanAudience(audience);
  if (!list) return 'Everyone in the coven';
  return andList(list.map((a) => assigneeLabel(a, ranks, nameOf)));
}

/** Who steers the meeting and who keeps its notes, for this person. */
export type MeetingPowers = { open: boolean; chair: boolean; secretary: boolean; steers: boolean; keepsNotes: boolean };

/**
 * `leads`: they lead the coven's rituals and are in good standing (or are a
 * site moderator). The Chair steers too; the Secretary keeps the notes.
 * Mirrors public.coven_meeting_steers and coven_meeting_keeps_notes.
 */
export function meetingPowers(r: MeetingRow, v: MeetingViewer & { leads: boolean; standing: boolean }): MeetingPowers {
  const plan = cleanPlan(r.plan, 'meeting');
  const open = inAudience(r, v);
  const chair = v.standing && castAs(plan, 'chair', v);
  const secretary = v.standing && castAs(plan, 'secretary', v);
  const steers = open && (v.leads || (v.standing && !!r.led_by && r.led_by === v.userId) || chair);
  return { open, chair, secretary, steers, keepsNotes: steers || (open && secretary) };
}

// ─── The meeting's chat ──────────────────────────────────────────────────

/** A meeting as it happens (coven_meeting_state). */
export type Amendment = { id: string; text: string; by: string | null; at: string; status: 'proposed' | 'accepted' | 'rejected' };
export type MeetingItem = { notes?: string; seconded_by?: string; seconded_at?: string; amendments?: Amendment[]; vote_called_at?: string; extra_minutes?: number };
export type MeetingState = {
  ritual_id: string;
  coven_id?: string;
  chat_opened_at: string | null;
  chat_closed_at: string | null;
  chat_until: string | null;
  floor_user: string | null;
  floor_since: string | null;
  hands: string[];
  items: Record<string, MeetingItem>;
  minutes_page_id: string | null;
  updated_at?: string;
};

export const emptyState = (ritualId: string): MeetingState => ({ ritual_id: ritualId, chat_opened_at: null, chat_closed_at: null, chat_until: null, floor_user: null, floor_since: null, hands: [], items: {}, minutes_page_id: null });

/** A state row as it arrives (or none yet). */
export function cleanState(raw: unknown, ritualId: string): MeetingState {
  const s = raw && typeof raw === 'object' ? (raw as Partial<MeetingState>) : {};
  const str = (v: unknown) => (typeof v === 'string' && v ? v : null);
  const items: Record<string, MeetingItem> = {};
  if (s.items && typeof s.items === 'object') {
    for (const [k, v] of Object.entries(s.items)) items[k] = cleanItem(v);
  }
  return {
    ...emptyState(ritualId),
    chat_opened_at: str(s.chat_opened_at),
    chat_closed_at: str(s.chat_closed_at),
    chat_until: str(s.chat_until),
    floor_user: str(s.floor_user),
    floor_since: str(s.floor_since),
    hands: Array.isArray(s.hands) ? s.hands.filter((h): h is string => typeof h === 'string') : [],
    items,
    minutes_page_id: str(s.minutes_page_id),
    ...(s.updated_at ? { updated_at: s.updated_at } : {}),
  };
}

function cleanItem(raw: unknown): MeetingItem {
  const i = raw && typeof raw === 'object' ? (raw as MeetingItem) : {};
  const out: MeetingItem = {};
  if (typeof i.notes === 'string' && i.notes) out.notes = i.notes;
  if (typeof i.seconded_by === 'string' && i.seconded_by) out.seconded_by = i.seconded_by;
  if (typeof i.seconded_at === 'string') out.seconded_at = i.seconded_at;
  if (typeof i.vote_called_at === 'string') out.vote_called_at = i.vote_called_at;
  if (typeof i.extra_minutes === 'number' && i.extra_minutes > 0) out.extra_minutes = i.extra_minutes;
  if (Array.isArray(i.amendments)) {
    out.amendments = i.amendments
      .filter((a) => a && typeof a.text === 'string' && typeof a.id === 'string')
      .map((a) => ({ id: a.id, text: a.text, by: typeof a.by === 'string' ? a.by : null, at: String(a.at ?? ''), status: a.status === 'accepted' || a.status === 'rejected' ? a.status : 'proposed' }));
  }
  return out;
}

export type ChatWindow = { opensAt: number | null; closesAt: number | null; open: boolean };

const ms = (iso: string | null | undefined) => (iso ? Date.parse(iso) : NaN);
const known = (n: number) => (Number.isFinite(n) ? n : null);
const least = (...xs: (number | null)[]) => {
  const list = xs.filter((x): x is number => x != null);
  return list.length ? Math.min(...list) : null;
};
const greatest = (...xs: (number | null)[]) => {
  const list = xs.filter((x): x is number => x != null);
  return list.length ? Math.max(...list) : null;
};

/**
 * When the meeting's chat opens and closes, and whether it is open now: from
 * the start less the lead time (or when the Chair opened it, or the meeting
 * started) until the planned end; while the meeting is under way; until it
 * ends, or as long after as the Chair kept it open. The Chair's "close"
 * closes it until they open it again. Mirrors public.coven_meeting_chat_window.
 */
export function chatWindow(r: MeetingRow, state: Pick<MeetingState, 'chat_opened_at' | 'chat_closed_at' | 'chat_until'> | null, now: number = Date.now()): ChatWindow {
  const settings = meetingSettings(cleanPlan(r.plan, 'meeting'));
  const start = known(ms(r.scheduled_for)) ?? known(ms(r.started_at));
  const until = known(ms(state?.chat_until));
  const opensAt = least(
    ['scheduled', 'live', 'done'].includes(r.status) && start != null ? start - settings.lead_minutes * MINUTE : null,
    known(ms(state?.chat_opened_at)),
    known(ms(r.started_at)),
  );
  const closesAt =
    r.status === 'live'
      ? until
      : r.status === 'done'
        ? greatest(known(ms(r.ended_at)) ?? known(ms(r.updated_at)), until)
        : greatest(start != null ? start + settings.length_minutes * MINUTE : null, until);
  const open = r.status !== 'cancelled' && !state?.chat_closed_at && opensAt != null && now >= opensAt && (r.status === 'live' || closesAt == null || now < closesAt);
  return { opensAt, closesAt, open };
}

/** Who reads a meeting's whole chat afterwards, as the coven's head chose. Keys: 'chair', 'secretary', 'audience', 'role:<id>', 'rank:<id>', 'user:<id>'. */
export const HISTORY_DEFAULT = ['chair', 'secretary'];

/** The keys that apply: the meeting's own, the coven's default, or the Chair and Secretary. */
export function historyKeys(meetingReaders: unknown, covenDefault: unknown): string[] {
  const clean = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter((k): k is string => typeof k === 'string' && /^(chair|secretary|audience|(role|rank|user):[A-Za-z0-9_-]{1,40})$/.test(k)))] : null);
  return clean(meetingReaders) ?? clean(covenDefault) ?? [...HISTORY_DEFAULT];
}

/** Whether this person reads the whole chat once the meeting is over. Mirrors public.coven_meeting_reads_history. */
export function readsHistory(r: MeetingRow, keys: string[], v: MeetingViewer): boolean {
  if (v.site) return true;
  if (v.head && v.membership?.status === 'active') return true;
  if (!inAudience(r, v)) return false;
  const plan = cleanPlan(r.plan, 'meeting');
  return keys.some((k) => {
    if (k === 'audience') return true;
    if (k === 'chair' || k === 'secretary') return castAs(plan, k, v);
    if (k.startsWith('role:')) return names(rolePeople(plan, [k.slice(5)]), v);
    const a = assigneeFromKey(k);
    return !!a && a.kind !== 'coven' && names([a], v);
  });
}

export type ChatAccess = ChatWindow & { read: boolean; write: boolean; history: boolean };

/**
 * What this person may do with the meeting's chat now: everyone it is for
 * reads it until the meeting is over (and while it stays open); afterwards
 * only those who read its history. Writing: those it is for, in good
 * standing, while it is open. Mirrors coven_meeting_chat_readable / _writable.
 */
export function chatAccess(r: MeetingRow, state: MeetingState | null, keys: string[], v: MeetingViewer & { standing: boolean }, now: number = Date.now()): ChatAccess {
  const window = chatWindow(r, state, now);
  const history = readsHistory(r, keys, v);
  if (r.kind !== 'meeting') return { ...window, read: false, write: false, history: false };
  const member = v.membership?.status === 'active';
  const open = inAudience(r, v);
  const read = !!v.site || (open && (['draft', 'scheduled', 'live'].includes(r.status) || window.open || history));
  const write = member && open && v.standing && window.open;
  return { ...window, read, write, history };
}

const timeWords = (at: number) => new Date(at).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** A line about the chat: "Opens at Thu 5 Dec, 7:15 pm", "Open until …", "Closed. The minutes are in the coven's Book." */
export function chatLine(r: MeetingRow, access: ChatAccess, now: number = Date.now()): string {
  if (r.status === 'cancelled') return 'The meeting was cancelled, so its chat stays closed.';
  if (access.open) {
    if (r.status === 'live') return access.closesAt ? `The meeting’s chat is open until ${timeWords(access.closesAt)}.` : 'The meeting’s chat is open while the meeting runs.';
    return access.closesAt ? `The meeting’s chat is open until ${timeWords(access.closesAt)}.` : 'The meeting’s chat is open.';
  }
  if (access.opensAt != null && access.opensAt > now) return `The meeting’s chat opens ${timeWords(access.opensAt)}. Until then you can read it here.`;
  if (access.opensAt == null) return 'The meeting’s chat opens once the meeting is on the calendar.';
  if (r.status === 'live' || (access.closesAt != null && access.closesAt > now)) return 'The Chair has closed the chat for now.';
  if (r.status === 'done') return access.history ? 'The meeting is over and its chat is closed. You can read it all here.' : 'The meeting is over and its chat is closed. Its minutes are kept in the coven’s Book.';
  return 'The meeting’s chat is closed.';
}

/** How the readers read: "The Chair, the Secretary and the coven’s head". */
export function historyLabel(keys: string[], plan: Pick<RitualPlan, 'roles' | 'meeting'>, ranks: { id: string; name: string }[], nameOf: (id: string) => string): string {
  const parts = keys.map((k) => {
    if (k === 'audience') return 'everyone at the meeting';
    if (k === 'chair' || k === 'secretary') {
      const id = meetingRoleId(plan, k);
      return `the ${plan.roles.find((r) => r.id === id)?.name ?? (k === 'chair' ? 'Chair' : 'Secretary')}`;
    }
    if (k.startsWith('role:')) return `the ${plan.roles.find((r) => r.id === k.slice(5))?.name ?? 'role'}`;
    const a = assigneeFromKey(k);
    return a ? (a.kind === 'rank' ? `every ${ranks.find((r) => r.id === a.id)?.name ?? 'position'}` : assigneeLabel(a, ranks, nameOf)) : '';
  });
  const list = [...new Set(parts.filter(Boolean)), 'the coven’s head'];
  const line = andList(list);
  return line.charAt(0).toUpperCase() + line.slice(1);
}

/** The choices for who reads the chat afterwards: the Chair, the Secretary, everyone at the meeting, its roles, then positions and people. */
export function historyEntries(plan: Pick<RitualPlan, 'roles' | 'meeting'>, others: PickEntry[]): PickEntry[] {
  const chair = meetingRoleId(plan, 'chair');
  const secretary = meetingRoleId(plan, 'secretary');
  return [
    { key: 'chair', label: 'The Chair', detail: 'Whoever is cast as Chair', keywords: ['chair', 'facilitator'], group: 'role' },
    { key: 'secretary', label: 'The Secretary', detail: 'Whoever is cast as Secretary', keywords: ['secretary', 'note taker', 'scribe'], group: 'role' },
    { key: 'audience', label: 'Everyone at the meeting', detail: 'Everyone it is for', keywords: ['everyone', 'all', 'audience'], group: 'role' },
    ...plan.roles.filter((r) => r.id !== chair && r.id !== secretary).map((r) => ({ key: `role:${r.id}`, label: r.name, detail: 'Role in this meeting', keywords: ['role'], group: 'role' })),
    ...others.filter((e) => e.key !== 'coven' && !e.key.startsWith('role:')),
  ];
}

// ─── The meeting as it happens ───────────────────────────────────────────

/** An item's time: "6 min left of 10", "3 min over (10 planned)". Null before it starts. */
export function itemTimer(startedAt: string | null | undefined, minutes: number | null | undefined, extra = 0, now: number = Date.now()): { elapsed: number; total: number; remaining: number; over: boolean; line: string } | null {
  const start = ms(startedAt);
  if (!Number.isFinite(start)) return null;
  const elapsed = Math.max(0, Math.floor((now - start) / MINUTE));
  const total = Math.max(0, (minutes ?? 0) + (extra ?? 0));
  if (!total) return { elapsed, total, remaining: 0, over: false, line: `${elapsed} min so far` };
  const remaining = total - elapsed;
  return { elapsed, total, remaining, over: remaining < 0, line: remaining < 0 ? `${-remaining} min over (${total} planned)` : `${remaining} min left of ${total}` };
}

/** Who has the floor, and who has asked for it. The speaking flag voice will use later. */
export function floorState(state: Pick<MeetingState, 'floor_user' | 'hands'> | null, me: string | null, nameOf: (id: string) => string): { holder: string | null; speaking: boolean; handUp: boolean; line: string; queue: string[] } {
  const holder = state?.floor_user ?? null;
  const hands = (state?.hands ?? []).filter((h) => h !== holder);
  const line = holder ? (holder === me ? 'You have the floor.' : `${nameOf(holder)} has the floor.`) : 'No one has the floor.';
  return { holder, speaking: !!me && holder === me, handUp: !!me && hands.includes(me), line, queue: hands };
}

/** Whether the vote on this item is open for voting: a motion or an election once the Chair has called it; any other vote once its item is under way. */
export function voteCalled(step: Pick<BuilderStep, 'action'>, item: MeetingItem | undefined): boolean {
  if (!isVoteAction(step.action)) return false;
  return step.action === 'motion' || step.action === 'election' ? !!item?.vote_called_at : true;
}

/** Whether this person may second the motion: someone in good standing at the meeting, not its proposer, and not already seconded by someone else. */
export function maySecond(step: Pick<BuilderStep, 'action' | 'details'>, item: MeetingItem | undefined, me: string | null, standing: boolean): boolean {
  if (step.action !== 'motion' || !me || !standing || item?.vote_called_at) return false;
  const proposer = ((step.details.fields ?? {}).proposer as string[] | undefined) ?? [];
  if (proposer.includes(`user:${me}`)) return false;
  return !item?.seconded_by || item.seconded_by === me;
}

// ─── Results ─────────────────────────────────────────────────────────────

export type Threshold = 'simple' | 'two_thirds' | 'unanimous';
export type Outcome = 'carried' | 'failed' | 'tied' | 'no_quorum' | 'none' | 'elected' | 'chosen';
export type Result = { outcome: Outcome; line: string; winner?: string };

const isMotion = (options: string[]) => options.length === 3 && options[0] === 'For' && options[1] === 'Against' && options[2] === 'Abstain';

/**
 * Whether a motion passed: abstentions don't count either way. A simple
 * majority needs more for than against; two-thirds needs at least twice as
 * many for as against; unanimous needs no one against. A quorum, when set,
 * counts every vote cast (abstentions too).
 */
export function motionResult(tally: VoteTally, rules: { threshold?: string | null; quorum?: number | null } = {}): Result {
  const yes = tally.counts.For ?? 0;
  const no = tally.counts.Against ?? 0;
  const abstain = tally.counts.Abstain ?? 0;
  if (rules.quorum && tally.total < rules.quorum) return { outcome: 'no_quorum', line: `Not decided: ${tally.total} of the ${rules.quorum} votes needed for a quorum were cast.` };
  if (!tally.total) return { outcome: 'none', line: 'No votes were cast.' };
  const threshold = (['simple', 'two_thirds', 'unanimous'].includes(rules.threshold ?? '') ? rules.threshold : 'simple') as Threshold;
  const counts = `${yes} for, ${no} against${abstain ? `, ${abstain} abstaining` : ''}`;
  const needs = threshold === 'two_thirds' ? ' Two-thirds were needed.' : threshold === 'unanimous' ? ' Everyone voting needed to be for it.' : '';
  const carried = threshold === 'two_thirds' ? yes > 0 && yes * 3 >= (yes + no) * 2 : threshold === 'unanimous' ? yes > 0 && no === 0 : yes > no;
  if (carried) return { outcome: 'carried', line: `Carried: ${counts}.${needs}` };
  if (threshold === 'simple' && yes === no) return { outcome: 'tied', line: `Tied, so not carried: ${counts}.` };
  return { outcome: 'failed', line: `Not carried: ${counts}.${needs}` };
}

/** Who was elected: the candidate with the most votes (Abstain isn't one), unless tied or short of a quorum. */
export function electionResult(tally: VoteTally, position: string, quorum?: number | null): Result {
  if (quorum && tally.total < quorum) return { outcome: 'no_quorum', line: `Not decided: ${tally.total} of the ${quorum} votes needed for a quorum were cast.` };
  const candidates = tally.options.filter((o) => o !== 'Abstain');
  const best = Math.max(0, ...candidates.map((c) => tally.counts[c] ?? 0));
  if (!best) return { outcome: 'none', line: 'No votes were cast for a candidate.' };
  const top = candidates.filter((c) => (tally.counts[c] ?? 0) === best);
  if (top.length > 1) return { outcome: 'tied', line: `Tied between ${andList(top)} (${best} each).` };
  return { outcome: 'elected', winner: top[0], line: `${top[0]} elected${position ? ` as ${position}` : ''} (${best} of ${tally.total} votes).` };
}

/** A vote-like step's result from its counts, as its kind and rules say. */
export function stepResult(step: Pick<BuilderStep, 'action' | 'details'>, counts: Record<string, number> | null | undefined, custom: CustomAction[] = []): Result {
  const values = cleanValues(specsOf(step, custom), step.details.fields);
  const options = voteOptions(values);
  const tally = tallyVotes(options, Object.entries(counts ?? {}).flatMap(([choice, n]) => Array.from({ length: n }, () => ({ choice }))));
  const quorum = typeof values.quorum === 'number' ? values.quorum : null;
  if (step.action === 'election') return electionResult(tally, String(values.position ?? ''), quorum);
  if (isMotion(options)) return motionResult(tally, { threshold: typeof values.threshold === 'string' ? values.threshold : null, quorum });
  if (quorum && tally.total < quorum) return { outcome: 'no_quorum', line: `Not decided: ${tally.total} of the ${quorum} votes needed for a quorum were cast.` };
  return { outcome: tally.total ? 'chosen' : 'none', line: voteResult(tally) };
}

/** "A simple majority", "Two-thirds", for the step's card. */
export const thresholdLabel = (value: unknown) => THRESHOLDS.find((t) => t.value === value)?.label ?? THRESHOLDS[0].label;

// ─── Actions ─────────────────────────────────────────────────────────────

export type MeetingAction = {
  id: string;
  ritual_id: string;
  coven_id: string;
  step_id: string | null;
  body: string;
  assignees: Assignee[];
  due_on: string | null;
  status: 'open' | 'done' | 'dropped';
  done_by: string | null;
  done_at: string | null;
  created_by: string | null;
  created_at: string;
};

/** Whether an action is this person's to do. */
export const actionIsMine = (a: Pick<MeetingAction, 'assignees'>, membership: Membership, userId: string | null) => names(cleanAssignees(a.assignees), { membership, userId });

const heldAt = (r: Pick<MeetingRow, 'started_at' | 'scheduled_for' | 'created_at'>) => known(ms(r.started_at)) ?? known(ms(r.scheduled_for)) ?? known(ms(r.created_at)) ?? 0;

/**
 * "Outstanding from last time": open actions from earlier meetings of the
 * same series (the same template, or the series its settings name), soonest
 * due first.
 */
export function outstandingActions(actions: MeetingAction[], rituals: MeetingRow[], current: MeetingRow): MeetingAction[] {
  const series = seriesOf(cleanPlan(current.plan, 'meeting'));
  const at = heldAt(current);
  const earlier = new Set(rituals.filter((r) => r.id !== current.id && r.kind === 'meeting' && r.status !== 'cancelled' && heldAt(r) <= at && seriesOf(cleanPlan(r.plan, 'meeting')) === series).map((r) => r.id));
  return actions.filter((a) => a.status === 'open' && earlier.has(a.ritual_id)).sort((a, b) => (a.due_on ?? '9999').localeCompare(b.due_on ?? '9999') || a.created_at.localeCompare(b.created_at));
}

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const fromDay = (key: string | null | undefined) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(key ?? '');
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};
const shortDay = (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/** "Due today", "Due tomorrow", "Due 5 Dec", "Overdue since 1 Dec", "Done". */
export function actionDueLine(a: Pick<MeetingAction, 'due_on' | 'status'>, now: number = Date.now()): string {
  if (a.status === 'done') return 'Done';
  if (a.status === 'dropped') return 'Dropped';
  const due = fromDay(a.due_on);
  if (!due) return 'No date set';
  const days = Math.round((due.getTime() - dayStart(new Date(now))) / DAY);
  if (days < 0) return `Overdue since ${shortDay(due)}`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due ${shortDay(due)}`;
}

/** When to remind someone of an action: nine in the morning the day before it's due. */
export function actionRemindAt(dueOn: string | null | undefined): Date | null {
  const due = fromDay(dueOn);
  return due ? new Date(due.getFullYear(), due.getMonth(), due.getDate() - 1, 9, 0) : null;
}

/** Your open actions as reminders' tasks (lib/covens/reminders.ts): the day before each is due. */
export function actionTasks(actions: MeetingAction[], membership: (covenId: string) => Membership, userId: string | null, titleOf: (ritualId: string) => string, now: number = Date.now()): RitualTask[] {
  const out: RitualTask[] = [];
  for (const a of actions) {
    if (a.status !== 'open' || !actionIsMine(a, membership(a.coven_id), userId)) continue;
    const at = actionRemindAt(a.due_on);
    if (!at || at.getTime() <= now) continue;
    const meeting = titleOf(a.ritual_id) || 'a meeting';
    out.push({ ritualId: a.ritual_id, stepId: `action-${a.id}`, title: a.body, ritualTitle: meeting, stepTitle: `Due tomorrow, from ${meeting}`, scheduledFor: at.toISOString(), mine: true, at: at.toISOString() });
  }
  return out;
}

// ─── Minutes ─────────────────────────────────────────────────────────────

type Block = { type: string; content: string };

export type MinutesInput = {
  ritual: MeetingRow & { title: string };
  /** The meeting's steps as the builder reads them (key = step id), in order, with whether each was reached. */
  steps: (BuilderStep & { completed_at?: string | null; started_at?: string | null })[];
  attendees: string[];
  apologies: { user_id: string; note: string | null; excused: boolean }[];
  state: MeetingState | null;
  votes: { step_id: string; counts: Record<string, number> | null; total: number; ballots: { user_id: string; choice: string }[] | null; closed: boolean }[];
  actions: MeetingAction[];
  outstanding?: MeetingAction[];
  ranks: { id: string; name: string }[];
  nameOf: (id: string) => string;
  pageTitle?: (id: string) => string;
  custom?: CustomAction[];
};

const people = (ids: string[], nameOf: (id: string) => string) => [...new Set(ids)].map(nameOf).sort((a, b) => a.localeCompare(b));

/**
 * The minutes, written when the meeting ends: when it was held and who
 * chaired it, who was there and who sent apologies, each agenda item with
 * its notes, motions with who proposed and seconded them, their amendments
 * and results (a secret ballot only by its totals), elections, the actions
 * with who does them and by when, and the next meeting. Never the chat.
 */
export function composeMinutes(input: MinutesInput): { title: string; blocks: Block[] } {
  const { ritual, nameOf, ranks } = input;
  const plan = cleanPlan(ritual.plan, 'meeting');
  const whoKey = (k: string) => {
    if (k.startsWith('role:')) {
      const role = plan.roles.find((r) => r.id === k.slice(5));
      const cast = role ? role.cast.map((a) => assigneeLabel(a, ranks, nameOf)) : [];
      return role ? `${role.name}${cast.length ? ` (${andList(cast)})` : ''}` : 'A role';
    }
    const a = assigneeFromKey(k);
    return a ? assigneeLabel(a, ranks, nameOf) : '';
  };
  const whoList = (keys: unknown) => (Array.isArray(keys) ? andList((keys as string[]).map(whoKey).filter(Boolean)) : '');
  const when = known(ms(ritual.started_at)) ?? known(ms(ritual.scheduled_for)) ?? known(ms(ritual.ended_at));
  const date = when != null ? new Date(when).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const roleLine = (which: 'chair' | 'secretary') => {
    const id = meetingRoleId(plan, which);
    const role = plan.roles.find((r) => r.id === id);
    return role && role.cast.length ? `${role.name}: ${andList(role.cast.map((a) => assigneeLabel(a, ranks, nameOf)))}` : '';
  };
  const blocks: Block[] = [{ type: 'text', content: [date ? `Held ${date}.` : '', roleLine('chair'), roleLine('secretary')].filter(Boolean).join('\n') }];
  blocks.push({ type: 'heading', content: 'Present' }, { type: 'text', content: input.attendees.length ? people(input.attendees, nameOf).join(', ') : 'Not recorded.' });
  const apologies = input.apologies.filter((a) => !input.attendees.includes(a.user_id));
  if (apologies.length) {
    blocks.push({ type: 'heading', content: 'Apologies' }, { type: 'bulleted_list', content: apologies.map((a) => `${nameOf(a.user_id)}${a.excused ? ' (excused)' : ''}`).sort((a, b) => a.localeCompare(b)).join('\n') });
  }
  if (input.outstanding?.length) {
    blocks.push({ type: 'heading', content: 'Outstanding from last time' }, { type: 'bulleted_list', content: input.outstanding.map((a) => actionLine(a, ranks, nameOf)).join('\n') });
  }

  let next: string[] = [];
  let n = 0;
  for (const section of plan.sections) {
    const steps = input.steps.filter((s) => s.section === section.id && s.title.trim());
    if (!steps.length) continue;
    blocks.push({ type: 'heading', content: section.name });
    for (const step of steps) {
      n += 1;
      const specs: FieldSpec[] = specsOf(step, input.custom ?? []);
      const values = cleanValues(specs, step.details.fields);
      const item = input.state?.items[step.key];
      const reached = !!step.completed_at || !!step.started_at || !!item;
      const lines: string[] = [];
      const field = (key: string) => (typeof values[key] === 'string' ? String(values[key]).trim() : '');
      if (step.action === 'officer_report' || step.action === 'agenda_item' || step.action === 'announcement') {
        const by = whoList(values.from ?? values.presenter);
        const about = field('topic') || field('item');
        if (about || by) lines.push([about, by ? `${step.action === 'agenda_item' ? 'Brought by' : 'From'} ${by}` : ''].filter(Boolean).join('. ') + '.');
        if (field('news')) lines.push(field('news'));
      }
      if ((step.action === 'discussion' || step.action === 'round') && (field('question') || field('prompt'))) lines.push(field('question') || field('prompt'));
      if (Array.isArray(values.pages) && values.pages.length) lines.push(`Papers: ${(values.pages as string[]).map((id) => input.pageTitle?.(id) ?? 'A page of the Book').join(', ')}.`);
      if (isVoteAction(step.action)) {
        if (step.action === 'election') lines.push(`Position: ${field('position') || 'not named'}. Candidates: ${(Array.isArray(values.candidates) ? (values.candidates as string[]) : []).join(', ') || 'none named'}.`);
        else if (field('motion')) lines.push(`${step.action === 'vote' ? 'Question' : 'Motion'}: ${field('motion')}`);
        if (step.action === 'motion') {
          const proposer = whoList(values.proposer);
          const seconder = item?.seconded_by ? nameOf(item.seconded_by) : whoList(values.seconder);
          lines.push([proposer ? `Proposed by ${proposer}.` : '', seconder ? `Seconded by ${seconder}.` : 'Not seconded.'].filter(Boolean).join(' '));
          for (const a of item?.amendments ?? []) lines.push(`Amendment${a.by ? ` from ${nameOf(a.by)}` : ''}: ${a.text} (${a.status === 'accepted' ? 'accepted' : a.status === 'rejected' ? 'set aside' : 'not taken up'}).`);
        }
        const vote = input.votes.find((v) => v.step_id === step.key);
        if (vote && (vote.closed || vote.total)) {
          lines.push(stepResult(step, vote.counts, input.custom ?? []).line);
          const secret = values.ballot === 'secret';
          if (!secret && vote.ballots?.length) {
            const by = new Map<string, string[]>();
            for (const b of vote.ballots) by.set(b.choice, [...(by.get(b.choice) ?? []), nameOf(b.user_id)]);
            lines.push([...by.entries()].map(([choice, list]) => `${choice}: ${list.sort((a, b) => a.localeCompare(b)).join(', ')}`).join('. ') + '.');
          }
        } else if (reached) lines.push('No vote was taken.');
      }
      if (step.action === 'set_next_meeting') {
        next = [[field('date'), field('time')].filter(Boolean).join(' at '), field('place'), field('notes')].filter(Boolean);
        if (next.length) lines.push(`Next meeting: ${next.join(', ')}.`);
      }
      if (item?.notes) lines.push(item.notes);
      const mine = input.actions.filter((a) => a.step_id === step.key);
      for (const a of mine) lines.push(`Action: ${actionLine(a, ranks, nameOf)}`);
      if (!reached) lines.push('Not reached.');
      blocks.push({ type: 'text', content: `${n}. ${step.title.trim()}${lines.length ? `\n${lines.join('\n')}` : ''}` });
    }
  }
  if (input.actions.length) blocks.push({ type: 'heading', content: 'Actions' }, { type: 'bulleted_list', content: input.actions.map((a) => actionLine(a, ranks, nameOf)).join('\n') });
  if (next.length) blocks.push({ type: 'heading', content: 'Next meeting' }, { type: 'text', content: next.join(', ') });
  const title = `${ritual.title.trim() || 'Meeting'} · minutes${when != null ? `, ${new Date(when).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}`;
  return { title: title.slice(0, 200), blocks };
}

/** "Book the hall · Rowan · due 1 Feb". */
export function actionLine(a: Pick<MeetingAction, 'body' | 'assignees' | 'due_on' | 'status'>, ranks: { id: string; name: string }[], nameOf: (id: string) => string): string {
  const who = andList(cleanAssignees(a.assignees).map((x) => assigneeLabel(x, ranks, nameOf)));
  const due = fromDay(a.due_on);
  return [a.body.trim(), who, due ? `by ${shortDay(due)}` : '', a.status === 'done' ? 'done' : a.status === 'dropped' ? 'dropped' : ''].filter(Boolean).join(' · ');
}

/** The minutes as the Book's blocks. */
export const minutesPageBlocks = (blocks: Block[]) => recordPageBlocks(blocks);

/** Minutes as plain text (for sharing). */
export const minutesText = (minutes: { title: string; blocks: Block[] }) =>
  [minutes.title, ...minutes.blocks.map((b) => (b.type === 'heading' ? `\n${b.content.toUpperCase()}` : b.type === 'bulleted_list' ? b.content.split('\n').map((l) => `• ${l}`).join('\n') : b.content))].join('\n').trim();


