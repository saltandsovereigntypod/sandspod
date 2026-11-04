// How a coven ritual step runs, in five plain parts: what happens (its
// title), who does it (one at a time, everyone together, or one person),
// what goes on the altar (its items), what to do with them (details
// .with_items) and who moves it on (details.ender: the ritual's leader unless
// the planner chose someone for that step). From those come the pop-ups
// everyone sees while it runs ("Step 2 of 7 · …", "Your turn", "Everyone's
// done. Move to step 3?") and when a step is finished by itself: the last
// person has passed, everyone here has tapped Done, every item is on the
// altar, the time is up. Kept on the step's own details (coven_ritual_steps
// .details), so no new columns; steps saved before this read as led by the
// leader. Pure, so the app and the website (js/core/covens.js,
// SaltCore.covens.stepFlow) say and decide the same.

import { andList, assigneesOf, includesMember, type Assignee } from './picker.ts';
import { quarterPart, quarterStepOf } from './quarterSteps.ts';
import type { QuarterId } from '../altar/circle.ts';

/** Who moves a step on: the ritual's leader (the default), one person ("user:<id>") or a role ("role:<id>"). */
export const LEADER_ENDER = 'leader';

export function cleanEnder(raw: unknown): string {
  return typeof raw === 'string' && /^(user|role):[\w-]{1,80}$/.test(raw) ? raw : LEADER_ENDER;
}

/** The step's ender, from its details (older steps: the leader). */
export const stepEnder = (step: { details?: unknown }): string => cleanEnder(step.details && typeof step.details === 'object' ? (step.details as { ender?: unknown }).ender : null);

/** What to do with the items placed, from its details ('' when not said). */
export const stepWithItems = (step: { details?: unknown }): string => {
  const v = step.details && typeof step.details === 'object' ? (step.details as { with_items?: unknown }).with_items : '';
  return typeof v === 'string' ? v.trim() : '';
};

type RoleLike = { id: string; name: string; cast?: Assignee[] };

/** "The leader" (or the leader's name), the person, or the role. */
export function enderLabel(ender: string, ctx: { roles: Pick<RoleLike, 'id' | 'name'>[]; nameOf: (id: string) => string }, leaderName = ''): string {
  if (ender.startsWith('user:')) return ctx.nameOf(ender.slice(5));
  if (ender.startsWith('role:')) {
    const role = ctx.roles.find((r) => r.id === ender.slice(5));
    if (role) return role.name;
  }
  return leaderName || 'The leader';
}

/**
 * Whether you move this step on. The leader's steps: those who lead (the
 * ritual's leader, the coven's leaders). A person's: that person. A role's:
 * whoever is cast in it, or the leader while no one is.
 */
export function mayMoveOn(ender: string, ctx: { roles: RoleLike[]; leads: boolean; userId: string | null; membership: { status: string; rank_id: string | null } | null }): boolean {
  if (ender.startsWith('user:')) return !!ctx.userId && ender.slice(5) === ctx.userId;
  if (ender.startsWith('role:')) {
    const cast = ctx.roles.find((r) => r.id === ender.slice(5))?.cast ?? [];
    if (cast.length) return includesMember(cast, ctx.membership, ctx.userId);
  }
  return ctx.leads;
}

// ─── Who does it ─────────────────────────────────────────────────────────

/** One at a time, everyone together, or one person. */
export type FlowKind = 'turns' | 'together' | 'one';

type StepLike = { turn_mode?: string | null; assignees?: Assignee[] | null; assigned_user_id?: string | null; assigned_rank_id?: string | null };

export function flowKind(step: StepLike): FlowKind {
  if (step.turn_mode === 'in_turn') return 'turns';
  if (step.turn_mode === 'together') return 'together';
  if (step.turn_mode === 'on_behalf') return 'one';
  const list = assigneesOf(step);
  return list.length === 1 && list[0].kind === 'user' ? 'one' : 'together';
}

/** The people named on a step (by id), for a one-person step's Done. */
export const doersOf = (step: StepLike): string[] => assigneesOf(step).filter((a) => a.kind === 'user').map((a) => a.id);

type PresenceLike = { user_id: string; place?: string; done?: string | null };

/** Who is at the ritual now: on its page or at a coven altar. */
export function presentIn(presence: PresenceLike[]): string[] {
  return [...new Set(presence.filter((p) => !p.place || /^(ritual|rituals|altar:)/.test(p.place)).map((p) => p.user_id))];
}

/** Who has tapped Done on this step. */
export const doneIn = (presence: PresenceLike[], stepId: string): string[] => [...new Set(presence.filter((p) => p.done === stepId).map((p) => p.user_id))];

type ItemLike = { name: string; image?: string; key?: string };
type ObjectLike = { imagePath?: string; label?: string; entityId?: string };

/** Each listed item, ticked once something like it is on the altar (same picture, or its name in the label). */
export function itemsOnAltar(items: ItemLike[], objects: ObjectLike[] | null | undefined): { name: string; placed: boolean }[] {
  const list = objects ?? [];
  return items.map((it) => {
    const name = it.name.trim().toLowerCase();
    const placed = list.some((o) => (!!it.image && o.imagePath === it.image) || (!!it.key && o.entityId === it.key) || (!!name && (o.label ?? '').toLowerCase().includes(name)));
    return { name: it.name, placed };
  });
}

// ─── When it is finished ─────────────────────────────────────────────────

export type FlowInput = {
  kind: FlowKind;
  /** One at a time: the order and how far along. */
  turns?: { order: string[]; at: number } | null;
  /** Who is here, and who has tapped Done. */
  present: string[];
  done: string[];
  /** A one-person step's person (empty: whoever's step it is). */
  doers?: string[];
  /** The items to place, ticked; null when the altar can't be seen from here. */
  items?: { name: string; placed: boolean }[] | null;
  /** When its time runs out (ms), if it has a time. */
  endsAt?: number | null;
  now?: number;
};

/**
 * Whether the step has finished by itself, and what it still waits for. One
 * at a time: the last person has passed (or, with no order, everyone here
 * tapped Done). Together: everyone here has tapped Done, or the time is up.
 * One person: they have tapped Done. Items listed: each is on the altar too.
 */
export function stepProgress(input: FlowInput): { complete: boolean; waiting: string } {
  const done = new Set(input.done);
  const present = [...new Set([...input.present, ...input.done])];
  const timeUp = !!input.endsAt && (input.now ?? Date.now()) >= input.endsAt;
  let people = false;
  let waiting = '';
  const order = input.turns?.order ?? [];
  if (input.kind === 'turns' && order.length) {
    const at = Math.max(0, input.turns?.at ?? 0);
    people = at >= order.length;
    waiting = people ? '' : `Turn ${at + 1} of ${order.length}`;
  } else if (input.kind === 'one') {
    const doers = input.doers ?? [];
    people = doers.length ? doers.some((d) => done.has(d)) : done.size > 0;
    waiting = people ? '' : 'Waiting for them to tap Done';
  } else {
    const count = present.filter((p) => done.has(p)).length;
    people = timeUp || (present.length > 0 && count === present.length);
    waiting = people ? '' : `${count} of ${present.length || 1} done`;
  }
  const missing = (input.items ?? []).filter((i) => !i.placed).map((i) => i.name);
  if (missing.length) waiting = [waiting, `Still to place: ${andList(missing)}`].filter(Boolean).join(' · ');
  return { complete: people && !missing.length, waiting };
}

// ─── What people see ─────────────────────────────────────────────────────

/** How the step is taken, said plainly, for the step's pop-up. */
export function kindLine(kind: FlowKind, doerName = '', minutes: number | null = null): string {
  if (kind === 'turns') return 'One person at a time. When it’s your turn you’ll get another pop-up. Your part is under the Ritual button.';
  if (kind === 'one') return `${doerName || 'One person'} does this step.`;
  return `Everyone together. Tap Done when you’ve finished.${minutes ? ` It ends by itself after ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.` : ''}`;
}

/** The pop-up everyone sees when a step begins: "Step 2 of 7 · Call the quarters", then how, what's on the altar, and who moves on. */
export function stepStartText(input: { index: number; total: number; title: string; kind: FlowKind; doerName?: string; items?: string[]; withItems?: string; enderName: string; minutes?: number | null }): { heading: string; lines: string[] } {
  const items = (input.items ?? []).filter(Boolean);
  const lines = [kindLine(input.kind, input.doerName, input.minutes ?? null)];
  if (items.length) lines.push(`On the altar: ${andList(items)}.`);
  if (input.withItems?.trim()) lines.push(`With them: ${input.withItems.trim()}`);
  lines.push(`${input.enderName || 'The leader'} moves us on.`);
  return { heading: `Step ${input.index + 1} of ${input.total} · ${input.title.trim() || 'A step'}`, lines };
}

/** The pop-up when it's your turn; on a quarters step taken in turn, "Your turn: call the East" with your words. */
export function turnPopup(part: string, quarterLine = ''): { heading: string; body: string; button: string } {
  const heading = quarterLine ? `Your turn: ${quarterLine.replace(/^(Call|Release)/, (w) => w.toLowerCase())}` : 'Your turn';
  return { heading, body: part.trim() || 'Take your turn now.', button: 'I’ve done my part' };
}

/** When a step is finished: the ender is asked to move on; everyone else waits for them. */
export function completePopup(input: { isEnder: boolean; last: boolean; index: number; enderName: string }): { heading: string; button: string | null } {
  if (!input.isEnder) return { heading: `Waiting for ${input.enderName || 'the leader'} to move on…`, button: null };
  return input.last
    ? { heading: 'Everyone’s done. Finish the ritual?', button: 'Finish the ritual' }
    : { heading: `Everyone’s done. Move to step ${input.index + 2}?`, button: `Move to step ${input.index + 2}` };
}

// ─── Gaps worth a second look while planning ─────────────────────────────

type PlanStep = StepLike & { title: string; instructions?: string; altar_action?: string | null; items?: { name: string; category?: string }[]; roles?: string[]; details?: unknown };

const CANDLE_WORDS = /\b(candles?|light(s|ing)?|flames?|kindle|wicks?)\b/i;

/** For builderWarnings: a candle spoken of but none placed, turns with no one named, a moving-on role no one plays. */
export function flowWarnings(steps: PlanStep[], roles: RoleLike[] = []): string[] {
  const out: string[] = [];
  let candleSoFar = false;
  steps.forEach((s, i) => {
    const n = i + 1;
    const text = `${s.title} ${s.instructions ?? ''} ${stepWithItems(s)}`;
    // A candle set down here or in an earlier step (a later "put out the candle" is about that one).
    candleSoFar = candleSoFar || s.altar_action === 'light_candle' || (s.items ?? []).some((it) => it.category === 'candle' || /candle/i.test(it.name));
    if (CANDLE_WORDS.test(text) && !candleSoFar) out.push(`Step ${n} speaks of a candle or lighting, but no candle is placed on the altar. Add one under “Place on the altar”.`);
    // One at a time for roles no one plays (and no one else named): no one would take a turn.
    const roles_ = (s.roles ?? []).map((id) => roles.find((r) => r.id === id));
    const people = assigneesOf(s).filter((a) => a.kind !== 'coven');
    if (s.turn_mode === 'in_turn' && roles_.length && !people.length && roles_.every((r) => !(r?.cast ?? []).length)) out.push(`Step ${n} is one at a time, but no one is cast in its roles yet, so no one would take a turn.`);
    const ender = stepEnder(s);
    if (ender.startsWith('role:')) {
      const role = roles.find((r) => r.id === ender.slice(5));
      if (!role) out.push(`Step ${n}: the role that moves it on is gone, so the leader will.`);
      else if (!(role.cast ?? []).length) out.push(`Step ${n} is moved on by ${role.name}, but no one is cast yet. Until someone is, the leader moves it on.`);
    }
  });
  return out;
}

// ─── The step under way, all together ────────────────────────────────────

export type LiveStepLike = StepLike & {
  id: string;
  title: string;
  instructions?: string | null;
  action?: string | null;
  spoken_text?: string | null;
  duration_minutes?: number | null;
  started_at?: string | null;
  turn_order?: string[] | null;
  turn_at?: number | null;
  items?: ItemLike[] | null;
  details?: unknown;
};

/**
 * Everything the live screens show about the step under way, worked out the
 * same in the app (LiveRitual.tsx) and on the website (rituals.js,
 * chat-panel.js): its pop-ups, who moves it on, Done, items ticked, finished.
 */
export function liveFlow(input: {
  step: LiveStepLike;
  index: number;
  total: number;
  roles: RoleLike[];
  leaderId: string | null;
  /** Whether you lead it (the ritual's leader, or one who leads the coven's rituals). */
  leads: boolean;
  userId: string | null;
  membership: { status: string; rank_id: string | null } | null;
  presence: PresenceLike[];
  /** What's on the altar now, or null when it can't be seen from here. */
  objects: ObjectLike[] | null;
  nameOf: (id: string) => string;
  /** "Rowan", "Every Initiate": whose step it is. */
  doerName: string;
  /** The ritual's calling order for the quarters (quarterSteps.ts ritualQuarterOrder). */
  quarterOrder?: QuarterId[];
  now?: number;
}) {
  const { step } = input;
  const ender = stepEnder(step);
  const enderName = enderLabel(ender, { roles: input.roles, nameOf: input.nameOf }, input.leaderId ? input.nameOf(input.leaderId) : '');
  const isEnder = mayMoveOn(ender, { roles: input.roles, leads: input.leads, userId: input.userId, membership: input.membership });
  const kind = flowKind(step);
  const done = doneIn(input.presence, step.id);
  const items = step.items?.length && input.objects ? itemsOnAltar(step.items, input.objects) : null;
  const endsAt = step.started_at && step.duration_minutes ? new Date(step.started_at).getTime() + step.duration_minutes * 60000 : null;
  const order = step.turn_order ?? [];
  const progress = stepProgress({ kind, turns: kind === 'turns' ? { order, at: step.turn_at ?? 0 } : null, present: presentIn(input.presence), done, doers: doersOf(step), items, endsAt, now: input.now });
  const withItems = stepWithItems(step);
  const turnNow = kind === 'turns' ? (order[step.turn_at ?? 0] ?? null) : null;
  // A quarters step: the quarter under way (one quarter's own, or this turn's), with the caller's words.
  const quarter = quarterPart(quarterStepOf(step, input.quarterOrder), step.turn_at);
  return {
    quarter,
    kind,
    ender,
    enderName,
    isEnder,
    items,
    endsAt,
    progress,
    start: stepStartText({ index: input.index, total: input.total, title: step.title, kind, doerName: input.doerName, items: (step.items ?? []).map((i) => i.name), withItems, enderName, minutes: step.duration_minutes ?? null }),
    iDone: !!input.userId && done.includes(input.userId),
    myTurn: !!input.userId && turnNow === input.userId,
    turn: quarter && kind === 'turns' ? turnPopup(quarter.words, quarter.line) : turnPopup(step.instructions || withItems || step.spoken_text || ''),
    complete: completePopup({ isEnder, last: input.index === input.total - 1, index: input.index, enderName }),
  };
}

export type LiveFlow = ReturnType<typeof liveFlow>;
