// The quarters in a coven ritual: each quarter called or released as a step
// of its own ("Call the East", "Release the North"), or all four one at a
// time, each by the person the planner chose for it, in the ritual's own
// calling order (North first, say; East, South, West, North when not
// chosen) and released in reverse of it. Live, the person whose quarter it
// is sees only that quarter glow on the coven's altar, and tapping its
// marker there calls (or releases) it, which counts as their part
// (AltarRitual.tsx; the website's chat-panel.js and coven-altar.js). The
// order is kept in the plan (builder.ts RitualPlan.quarter_order) and on
// each quarters step's details, which the database keeps as they are.
// Pure, so the app and the website (SaltCore.covens.quarterSteps) agree.

import { AT_ALTAR, atAltarOf } from './altarActions.ts';
import { defaultPartWords } from './fields.ts';
import { CALL_ORDER, cleanQuarterOrder, quarterOf, releaseOrderOf, type QuarterId } from '../altar/circle.ts';

// The order's own words and moves, for the website's builder (which loads only the coven bundle).
export { CALL_ORDER, orderLine, orderStartingWith, quarterOf, releaseOrderOf } from '../altar/circle.ts';

type StepLike = { action?: string | null; details?: unknown; turn_mode?: string | null };
type RoleLike = { id: string; cast?: { kind: string; id: string }[] };

const QUARTER_DEEDS = ['call_quarter', 'release_quarter', 'quarters', 'release_quarters'];

export type QuarterStep = {
  mode: 'call' | 'release';
  /** A step for one quarter ("Call the East"), or null for the quarters together or in turn. */
  single: QuarterId | null;
  /** One at a time, a quarter each turn (the step is taken one at a time). */
  turns: boolean;
  /** The quarters in the order they are taken: the ritual's order, or its reverse to release. */
  quarters: QuarterId[];
  /** Who calls each (a WHO key: "user:…", "role:…") and their own words, as the planner wrote them. */
  parts: Partial<Record<QuarterId, { who?: string; words?: string }>>;
};

const detailsOf = (step: StepLike | null | undefined): Record<string, unknown> => (step?.details && typeof step.details === 'object' ? (step.details as Record<string, unknown>) : {});

/** The ritual's calling order: the plan's, else one kept on any of its steps, else East, South, West, North. */
export function ritualQuarterOrder(plan: { quarter_order?: unknown } | null | undefined, steps: StepLike[] = []): QuarterId[] {
  const own = cleanQuarterOrder(plan?.quarter_order);
  if (own) return own;
  for (const s of steps) {
    const kept = cleanQuarterOrder(detailsOf(s).quarter_order);
    if (kept) return kept;
  }
  return [...CALL_ORDER];
}

/** A plan with its calling order read back from its steps when the plan itself lost it (the database keeps the plan to what it knows). */
export function withQuarterOrder<P extends { quarter_order?: QuarterId[] }>(plan: P, steps: StepLike[]): P {
  if (cleanQuarterOrder(plan.quarter_order)) return plan;
  const order = ritualQuarterOrder(null, steps);
  return order.join() === CALL_ORDER.join() ? plan : { ...plan, quarter_order: order };
}

/** The order a quarters step's callers are listed in while planning: the ritual's order to call, its reverse to release. Null for other steps. */
export function quarterPartOrder(step: StepLike, order: readonly QuarterId[]): QuarterId[] | null {
  const qs = quarterStepOf({ ...step, details: { ...detailsOf(step), fields: {} } }, order);
  return qs && !qs.single ? qs.quarters : null;
}

/** The table's row for a quarters step: by its kept deed, or by its action when it was chosen from the list of actions. */
function quarterRow(step: StepLike) {
  const row = atAltarOf(step);
  if (row && QUARTER_DEEDS.includes(row.deed)) return row;
  if (row) return null;
  return AT_ALTAR.find((a) => a.action === step.action && QUARTER_DEEDS.includes(a.deed)) ?? null;
}

/** Whether the step calls or releases quarters (any of the quarter actions). */
export const isQuarterStep = (step: StepLike | null | undefined) => !!step && !!quarterRow(step);

/** What a quarters step takes, in what order, and who calls each; null for any other step. */
export function quarterStepOf(step: StepLike | null | undefined, order: readonly QuarterId[] = CALL_ORDER): QuarterStep | null {
  if (!step) return null;
  const row = quarterRow(step);
  if (!row) return null;
  const mode = row.deed === 'call_quarter' || row.deed === 'quarters' ? 'call' : 'release';
  if (row.quarter) return { mode, single: row.quarter, turns: false, quarters: [row.quarter], parts: {} };
  const fields = (detailsOf(step).fields ?? {}) as { directions?: unknown; parts?: unknown };
  const chosen = Array.isArray(fields.directions) ? fields.directions.filter((d): d is QuarterId => !!quarterOf(String(d))) : [];
  const sequence = mode === 'call' ? [...order] : releaseOrderOf(order);
  const quarters = chosen.length ? sequence.filter((q) => chosen.includes(q)) : sequence;
  const parts: QuarterStep['parts'] = {};
  if (Array.isArray(fields.parts)) {
    for (const p of fields.parts as { part?: unknown; who?: unknown; words?: unknown }[]) {
      const id = String(p?.part ?? '');
      if (!quarterOf(id)) continue;
      parts[id as QuarterId] = {
        ...(typeof p.who === 'string' && p.who ? { who: p.who } : {}),
        ...(typeof p.words === 'string' && p.words.trim() ? { words: p.words.trim() } : {}),
      };
    }
  }
  return { mode, single: null, turns: step.turn_mode === 'in_turn', quarters, parts };
}

/** The person a WHO key names: a person, or the first person cast in a role; null for a position or the whole coven. */
function personOf(who: string | undefined, roles: RoleLike[]): string | null {
  if (!who) return null;
  if (who.startsWith('user:')) return who.slice(5) || null;
  if (who.startsWith('role:')) return roles.find((r) => r.id === who.slice(5))?.cast?.find((a) => a.kind === 'user')?.id ?? null;
  return null;
}

/**
 * The turns of a quarters step taken one at a time: the person for each
 * quarter, in order (one person may call two). A quarter given to no one
 * person goes to the ritual's leader. Null when it isn't such a step or no
 * quarter was given to anyone (then the usual order of turns stands).
 */
export function quarterTurnOrder(qs: QuarterStep | null, roles: RoleLike[], leaderId: string | null): string[] | null {
  if (!qs || !qs.turns || !qs.quarters.length) return null;
  const named = qs.quarters.map((q) => personOf(qs.parts[q]?.who, roles));
  if (!named.some(Boolean)) return null;
  const out = named.map((id) => id ?? leaderId);
  return out.every(Boolean) ? (out as string[]) : null;
}

/** Whether the step's turns should be set to the quarters' callers: they differ, and no turn has been taken yet. */
export function needsQuarterTurns(want: string[] | null, step: { turn_order?: string[] | null; turn_at?: number | null }): boolean {
  if (!want) return false;
  if ((step.turn_at ?? 0) > 0) return false;
  return (step.turn_order ?? []).join() !== want.join();
}

/** The quarter under way: a one-quarter step's own, or the one for this turn; null otherwise. */
export function quarterNow(qs: QuarterStep | null, turnAt: number | null | undefined): QuarterId | null {
  if (!qs) return null;
  if (qs.single) return qs.single;
  return qs.turns ? (qs.quarters[Math.max(0, turnAt ?? 0)] ?? null) : null;
}

/** "Call the East" / "Release the North". */
export const quarterDeedLine = (mode: QuarterStep['mode'], id: QuarterId) => `${mode === 'call' ? 'Call' : 'Release'} the ${quarterOf(id)!.name}`;

/** The words for a quarter: the caller's own, written in the step, or the usual ones. */
export function quarterWords(qs: QuarterStep, id: QuarterId): string {
  return qs.parts[id]?.words || defaultPartWords(qs.mode === 'call' ? 'call_quarters' : 'release_quarters', id);
}

/** The quarter under way, said plainly for the panel ("Your turn: call the East") with its words. */
export function quarterPart(qs: QuarterStep | null, turnAt: number | null | undefined): { id: QuarterId; line: string; words: string } | null {
  const id = quarterNow(qs, turnAt);
  if (!qs || !id) return null;
  return { id, line: quarterDeedLine(qs.mode, id), words: quarterWords(qs, id) };
}

/**
 * Which quarter's marker glows for you: only the quarter under way, and only
 * while the altar glows for you (ritualPanel.ts glowsForMe: on a step taken
 * in turn, only for the one whose turn it is).
 */
export const quarterGlowFor = (qs: QuarterStep | null, turnAt: number | null | undefined, glowing: boolean): QuarterId | null => (glowing ? quarterNow(qs, turnAt) : null);

/** The deed the altar waits for: one quarter called or released (with which), or all of them. */
export function quarterDeed(qs: QuarterStep | null, turnAt: number | null | undefined): { kind: 'call_quarter' | 'release_quarter' | 'quarters' | 'release_quarters'; quarter: QuarterId | null } | null {
  if (!qs) return null;
  const q = quarterNow(qs, turnAt);
  if (q) return { kind: qs.mode === 'call' ? 'call_quarter' : 'release_quarter', quarter: q };
  return { kind: qs.mode === 'call' ? 'quarters' : 'release_quarters', quarter: null };
}
