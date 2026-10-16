// Rituals run on the altar: what each step does to the things on it. A step's
// candle actions (light_all / extinguish_all, the website's automation) light
// or snuff candles; the words of a step can also suggest lighting a candle of
// a colour, lighting incense or setting out an offering, which the altar
// offers as a tap rather than doing by itself. The closing puts out what's
// still burning, if you like. Pure, so it can be tested.

import { ALTAR_ARTWORK } from '../artworkData.ts';
import { incenseLife, isIncense, lightIncense, putOutIncense } from '../incense.ts';
import { candleLife, isCandle, isLit, lightCandle, snuffCandle } from '../livingState.ts';
import { canHoldOffering } from '../offerings.ts';
import type { AltarDocument } from '../snapshot.ts';
import type { SavedObject } from '../types.ts';
import { appendEvent, currentStep, stepElapsed } from '../../rituals/lifecycle.ts';
import { INTENTIONS, intentionByKey, suggestIngredients } from '../../rituals/planner.ts';
import type { JournalRow, RitualLinkRow, RitualSession, SessionStepRow, StepAction, StepDraft, TemplateDraft } from '../../rituals/types.ts';

export type EffectMoment = 'start' | 'end' | 'closing';

/** What a step does to the altar. `objectIds` are altarObjectIds on the altar. */
export type AltarEffect = {
  /** Stable for a step and moment, so an effect is never carried out twice. */
  id: string;
  kind: 'light' | 'snuff' | 'light_incense' | 'put_out_incense' | 'offering';
  moment: EffectMoment;
  stepId: string | null;
  objectIds: string[];
  /** Carried out by itself (a step's own candle action) rather than offered as a tap. */
  auto: boolean;
  /** Button words: "Light the white candles". */
  label: string;
  /** Why, in a few words: "This step lights the altar’s candles." */
  reason: string;
};

export type StepPlan = {
  stepId: string | null;
  index: number;
  title: string;
  start: AltarEffect[];
  end: AltarEffect[];
};

export type AltarRitualPlan = {
  steps: StepPlan[];
  /** What to do when the ritual is closed: the closing words and anything still burning. */
  closing: { text: string; effects: AltarEffect[] };
  /** Candle colours the ritual's intention calls for, best first. */
  intentionColors: string[];
};

/** A step as either the editor (StepDraft) or a running session (SessionStepRow) holds it. */
export type StepLike = Pick<SessionStepRow, 'title' | 'actions'> & {
  id?: string | null;
  instructions?: string | null;
  spoken_text?: string | null;
};

export type PlanOptions = {
  /**
   * 'all' (the website's way): a step's "light all candles" lights every candle.
   * 'matching': only the candles whose colour the step names or the intention
   * calls for, falling back to every candle when none match.
   */
  candleScope?: 'all' | 'matching';
  /** The ritual's intention key (lib/rituals/planner INTENTIONS), when known. */
  intentionKey?: string | null;
  /** The ritual's intention in words, to find a key in when none is given. */
  intention?: string | null;
  /** The closing words (from the template or draft; sessions don't carry them). */
  closing?: string | null;
  /** The moment to judge which candles are spent, ms. */
  now?: number;
};

const COLORS: string[] = [...ALTAR_ARTWORK.candleColors].sort((a, b) => b.length - a.length);
const idOf = (object: SavedObject) => String(object.altarObjectId || '');

/** A candle's colour word ("white"), from its own field or its label. */
export function candleColorName(object: SavedObject): string {
  const own = String(object.color || '').toLowerCase().trim();
  if (own) return own;
  const label = String(object.label || '').toLowerCase();
  return COLORS.find((c) => new RegExp(`\\b${c}\\b`).test(label)) ?? '';
}

/** Colours named alongside "candle" in a step's words: "Light the green candle" → ["green"]. */
export function colorsInText(text: string): string[] {
  const out: string[] = [];
  for (const sentence of text.toLowerCase().split(/[.;!?\n]+/)) {
    if (!/\bcandles?\b|\btapers?\b|\bvotives?\b|\btea ?lights?\b/.test(sentence)) continue;
    for (const color of COLORS) if (new RegExp(`\\b${color}\\b`).test(sentence) && !out.includes(color)) out.push(color);
  }
  return out;
}

/** The intention key a ritual works for: as given, or found in its words. */
export function intentionKeyFor(key: string | null | undefined, words: string | null | undefined): string | null {
  if (key && intentionByKey(key)) return key;
  const text = String(words || '').toLowerCase();
  if (!text) return null;
  const hit = INTENTIONS.find((i) => text.includes(i.key) || i.keywords.some((k) => new RegExp(`\\b${k}\\b`).test(text)));
  return hit?.key ?? null;
}

/** Candle colours for an intention, best first ("white" stays out: it suits anything). */
export function intentionCandleColors(key: string | null | undefined): string[] {
  const intention = intentionByKey(key ?? null);
  if (!intention) return [];
  return suggestIngredients(intention).candle.map((item) => item.ref.split('/').pop() ?? '').filter(Boolean);
}

const usableCandle = (object: SavedObject, now: number) => isCandle(object) && !!idOf(object) && !candleLife(object, now).spent;

function candleChoice(objects: SavedObject[], colors: string[], now: number): SavedObject[] {
  const candles = objects.filter((o) => usableCandle(o, now));
  if (!colors.length) return candles;
  return candles.filter((o) => colors.includes(candleColorName(o)));
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
const listWords = (words: string[]) => (words.length <= 1 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`);

function candleLabel(verb: 'Light' | 'Snuff', chosen: SavedObject[], colors: string[]): string {
  if (colors.length && chosen.length) return `${verb} the ${listWords(colors)} ${plural(chosen.length, 'candle', 'candles')}`;
  return chosen.length === 1 ? `${verb} the candle` : `${verb} all the candles`;
}

function stepText(step: StepLike): string {
  return [step.title, step.instructions ?? '', step.spoken_text ?? ''].join('. ');
}

const actionTypes = (actions: StepAction[] | null | undefined, when: 'start' | 'end') =>
  (Array.isArray(actions) ? actions : []).filter((a) => a.when === when).map((a) => a.type);

/** What one step does to the altar as it begins and as it ends. */
export function planStep(step: StepLike, index: number, objects: SavedObject[], options: PlanOptions = {}): StepPlan {
  const now = options.now ?? Date.now();
  const stepId = step.id ?? null;
  const key = `${stepId ?? `step-${index}`}`;
  const text = stepText(step);
  const named = colorsInText(text);
  const intentionColors = intentionCandleColors(intentionKeyFor(options.intentionKey, options.intention));
  const matching = options.candleScope === 'matching';
  const start: AltarEffect[] = [];
  const end: AltarEffect[] = [];

  const scoped = (): { chosen: SavedObject[]; colors: string[] } => {
    if (!matching) return { chosen: candleChoice(objects, [], now), colors: [] };
    for (const colors of [named, intentionColors]) {
      const chosen = candleChoice(objects, colors, now);
      if (colors.length && chosen.length) return { chosen, colors: colors.filter((c) => chosen.some((o) => candleColorName(o) === c)) };
    }
    return { chosen: candleChoice(objects, [], now), colors: [] };
  };

  for (const [when, list] of [['start', start], ['end', end]] as const) {
    for (const type of actionTypes(step.actions, when)) {
      if (type !== 'light_all' && type !== 'extinguish_all') continue;
      const { chosen, colors } = scoped();
      // Snuffing also reaches a lit candle that has just burned past its life.
      const pool = type === 'light_all' ? chosen : [...chosen, ...objects.filter((o) => isCandle(o) && isLit(o) && !chosen.includes(o) && (!matching || !colors.length))];
      const ids = pool.map(idOf).filter(Boolean);
      if (!ids.length) continue;
      const verb = type === 'light_all' ? 'Light' : 'Snuff';
      list.push({
        id: `${key}:${when}:${type}`,
        kind: type === 'light_all' ? 'light' : 'snuff',
        moment: when,
        stepId,
        objectIds: ids,
        auto: true,
        label: candleLabel(verb, chosen, colors),
        reason: when === 'start' ? `This step ${verb === 'Light' ? 'lights' : 'snuffs'} the candles as it begins.` : `This step ${verb === 'Light' ? 'lights' : 'snuffs'} the candles as it ends.`,
      });
    }
  }

  const lower = text.toLowerCase();
  const lightsAll = start.some((e) => e.kind === 'light');
  // "Light the green candle" with no candle action of its own: offered as a tap.
  if (!lightsAll && /\b(light|kindle|ignite)\b/.test(lower) && named.length) {
    const chosen = candleChoice(objects, named, now);
    if (chosen.length) {
      start.push({
        id: `${key}:start:light-named`,
        kind: 'light',
        moment: 'start',
        stepId,
        objectIds: chosen.map(idOf),
        auto: false,
        label: candleLabel('Light', chosen, named.filter((c) => chosen.some((o) => candleColorName(o) === c))),
        reason: 'The step asks for this candle.',
      });
    }
  }
  if (/\bincense\b|\bresin\b|\bcharcoal\b|\bsmoke\b/.test(lower) && /\b(light|burn|kindle)\b/.test(lower)) {
    const incense = objects.filter((o) => isIncense(o) && idOf(o) && !incenseLife(o, now).lit && !incenseLife(o, now).ash);
    if (incense.length) {
      start.push({
        id: `${key}:start:incense`,
        kind: 'light_incense',
        moment: 'start',
        stepId,
        objectIds: incense.map(idOf),
        auto: false,
        label: incense.length === 1 ? 'Light the incense' : 'Light the incense on the altar',
        reason: 'The step burns incense.',
      });
    }
  }
  if (/\boffer(ing|ings)?\b|\bset out\b|\bleave (a|some|an)\b|\bpour\b/.test(lower)) {
    const holders = objects.filter((o) => canHoldOffering(o) || o.type === 'deity').filter((o) => !!idOf(o));
    start.push({
      id: `${key}:start:offering`,
      kind: 'offering',
      moment: 'start',
      stepId,
      objectIds: holders.map(idOf),
      auto: false,
      label: 'Place the offering now',
      reason: holders.length ? 'Set it in a bowl or before a presence on the altar.' : 'Set it on the altar, or add a bowl to hold it.',
    });
  }
  return { stepId, index, title: step.title, start, end };
}

/** The whole ritual on this altar: each step's effects, and the closing. */
export function planRitualOnAltar(steps: StepLike[], objects: SavedObject[], options: PlanOptions = {}): AltarRitualPlan {
  const now = options.now ?? Date.now();
  const planned = steps.map((step, index) => planStep(step, index, objects, { ...options, now }));
  return {
    steps: planned,
    closing: closingPlan(objects, options.closing ?? '', now),
    intentionColors: intentionCandleColors(intentionKeyFor(options.intentionKey, options.intention)),
  };
}

/** The closing: its words, then the candles and incense still burning, put out if you like. */
export function closingPlan(objects: SavedObject[], text: string, now: number = Date.now()): { text: string; effects: AltarEffect[] } {
  const effects: AltarEffect[] = [];
  const lit = objects.filter((o) => isCandle(o) && isLit(o) && idOf(o));
  if (lit.length) {
    effects.push({
      id: 'closing:snuff',
      kind: 'snuff',
      moment: 'closing',
      stepId: null,
      objectIds: lit.map(idOf),
      auto: false,
      label: lit.length === 1 ? 'Snuff the candle' : `Snuff the ${lit.length} candles`,
      reason: 'Or let them burn on while you stay in the room with them.',
    });
  }
  const burning = objects.filter((o) => isIncense(o) && incenseLife(o, now).lit && idOf(o));
  if (burning.length) {
    effects.push({
      id: 'closing:incense',
      kind: 'put_out_incense',
      moment: 'closing',
      stepId: null,
      objectIds: burning.map(idOf),
      auto: false,
      label: 'Put out the incense',
      reason: 'Or let it burn down by itself.',
    });
  }
  return { text: text.trim(), effects };
}

/**
 * What completing a step sets off on the altar, mirroring the website's
 * automation (lib/rituals/automation completionActions): the finished step's
 * end effects, then the next step's start effects. Skipping runs nothing.
 */
export function transitionEffects(plan: AltarRitualPlan, before: RitualSession, after: RitualSession): AltarEffect[] {
  const finished = before.session_steps.find((s) => s.status === 'active');
  if (!finished) return [];
  const done = after.session_steps.find((s) => s.id === finished.id);
  if (done?.status !== 'completed') return [];
  const next = after.session_steps.find((s) => s.status === 'active' && s.id !== finished.id);
  const planOf = (id: string | undefined) => plan.steps.find((p) => p.stepId === id);
  return [...(planOf(finished.id)?.end ?? []), ...(planOf(next?.id)?.start ?? [])];
}

/** Effects for the step showing now (as it began). */
export function currentEffects(plan: AltarRitualPlan, session: RitualSession): StepPlan | null {
  const step = currentStep(session);
  return step ? (plan.steps.find((p) => p.stepId === step.id) ?? null) : null;
}

/** Carry out an effect on the altar. Offerings only prompt; the altar opens its offering sheet. */
export function applyAltarEffect(doc: AltarDocument, effect: AltarEffect, now: string): AltarDocument {
  const ids = new Set(effect.objectIds);
  const change =
    effect.kind === 'light'
      ? lightCandle
      : effect.kind === 'snuff'
        ? snuffCandle
        : effect.kind === 'light_incense'
          ? lightIncense
          : effect.kind === 'put_out_incense'
            ? putOutIncense
            : null;
  if (!change || !ids.size) return doc;
  let changed = false;
  const objects = doc.objects.map((o) => {
    if (!ids.has(idOf(o))) return o;
    const next = change(o, now);
    if (next !== o) changed = true;
    return next;
  });
  return changed ? { ...doc, objects } : doc;
}

/**
 * Go back a step: the step showing now waits again, and the one before it is
 * open once more (its time so far is kept). The website's runner only goes
 * forward; a session stepped back here still finishes the same way there.
 */
export function stepBack(session: RitualSession, now: Date): RitualSession {
  if (session.status !== 'active') return session;
  const ordered = [...session.session_steps].sort((a, b) => a.sort_order - b.sort_order);
  const step = currentStep(session);
  const index = step ? ordered.findIndex((s) => s.id === step.id) : ordered.length;
  const previous = [...ordered.slice(0, index)].reverse().find((s) => s.status === 'completed' || s.status === 'skipped');
  if (!previous) return session;
  const at = now.toISOString();
  const steps = session.session_steps.map((s): SessionStepRow => {
    if (step && s.id === step.id && s.status === 'active') return { ...s, status: 'pending', elapsed_seconds: stepElapsed(s, session, now), started_at: null };
    if (s.id === previous.id) return { ...s, status: 'active', started_at: at, completed_at: null };
    return s;
  });
  return appendEvent(
    { ...session, session_steps: steps, current_step_order: previous.sort_order },
    { type: 'step_reopened', stepId: previous.id, stepTitle: previous.title, source: 'app', idempotencyKey: `step_reopened:${session.id}:${previous.id}:${now.getTime()}` },
    now,
  );
}

/** A draft begun on this altar: the session and its journal entry are linked to it. */
export function draftForAltar(draft: TemplateDraft, altarId: string): TemplateDraft {
  return { ...draft, linked_altar_id: altarId };
}

/**
 * Link a running session to the altar it is being done on, so its journal
 * entry links the altar too (journalPayload / journalLinks use linked_altar_id).
 */
export function linkSessionToAltar(session: RitualSession, altarId: string, now: Date): RitualSession {
  if (!altarId || session.linked_altar_id === altarId) return session;
  return appendEvent(
    { ...session, linked_altar_id: altarId, metadata: { ...session.metadata, ranOnAltar: altarId } },
    { type: 'altar_linked', altarId, source: 'app', idempotencyKey: `altar_linked:${session.id}:${altarId}` },
    now,
  );
}

/**
 * ritual_links rows tying a journal entry to the altar it was done on and to
 * the objects on it, shaped like the website's createRitualJournalLinks.
 * saveJournal already writes the altar link when the session is linked; this
 * is for an entry saved before it was (de-duplicate with uniqueLinks).
 */
export function altarJournalLinks(journal: Pick<JournalRow, 'id'>, userId: string, altarId: string, objects: SavedObject[]): RitualLinkRow[] {
  const uuidLike = /^[0-9a-f-]{36}$/i;
  const links: RitualLinkRow[] = [{ user_id: userId, ritual_id: journal.id, link_type: 'altar', saved_altar_id: altarId, label: 'Linked altar', metadata: {} }];
  for (const object of objects) {
    const label = String(object.label || 'Altar item');
    if (object.instanceId && uuidLike.test(String(object.instanceId))) {
      links.push({ user_id: userId, ritual_id: journal.id, link_type: 'used_object_instance', object_instance_id: String(object.instanceId), label, metadata: {} });
    }
    if (object.apothecaryItemId && uuidLike.test(String(object.apothecaryItemId))) {
      links.push({ user_id: userId, ritual_id: journal.id, link_type: 'used_apothecary_item', apothecary_item_id: String(object.apothecaryItemId), label, metadata: {} });
    }
  }
  return links;
}

/** The line for the altar's own log ('altar.history'). */
export function ritualHistoryText(title: string | null | undefined, status: 'completed' | 'abandoned'): string {
  const name = String(title || '').trim() || 'A ritual';
  return status === 'completed' ? `“${name}” was worked here.` : `“${name}” was begun here and set aside.`;
}

/** Steps for the planner from a draft (the editor's shape). */
export const draftSteps = (draft: TemplateDraft): StepLike[] =>
  draft.steps.map((s: StepDraft, i) => ({ id: s.id ?? `draft-${i}`, title: s.title, instructions: s.instructions, spoken_text: s.spoken_text, actions: s.actions }));

/** "Step 2 of 5 · 03:10 left" pieces for the overlay. */
export function stepProgress(session: RitualSession, now: Date): { index: number; count: number; elapsed: number; remaining: number | null } {
  const step = currentStep(session);
  const ordered = [...session.session_steps].sort((a, b) => a.sort_order - b.sort_order);
  const index = step ? ordered.findIndex((s) => s.id === step.id) : ordered.length;
  const elapsed = step ? stepElapsed(step, session, now) : 0;
  const duration = Number(step?.duration_seconds || 0);
  return { index, count: ordered.length, elapsed, remaining: duration > 0 ? Math.max(0, duration - elapsed) : null };
}
