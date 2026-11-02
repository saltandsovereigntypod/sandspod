// Steps that are done for real at the coven's altar: "Write a petition"
// opens the altar's own petition writer and places the paper, "Make an
// offering" the offering picker, "Light a candle" lights one, "Draw a card"
// lays tonight's card down, and so on. One table, used by the ritual
// builder (the "At the altar" kind of step) and the live ritual (the step's
// button, which goes to the coven's altar and opens the same sheet there);
// the website reads it from js/core/covens.js (SaltCore.covens.altarActions).
//
// A step chosen from here keeps which deed it is on its details
// (details.at_altar), so no new columns. Doing the deed at the altar counts
// as that person's Done for the step (stepFlow.ts), and on a step taken in
// turn it passes their turn. Pure, so it can be tested.

import { actionOf, applyAction, type StepAction } from './stepActions.ts';

/** What the altar opens or does. */
export type AltarDeed =
  | 'petition'
  | 'intention'
  | 'gratitude'
  | 'offering'
  | 'light'
  | 'incense'
  | 'place'
  | 'card'
  | 'release'
  | 'anoint'
  | 'carve'
  | 'charge_crystal'
  | 'jar'
  | 'sachet'
  | 'cord'
  | 'scry';

export type AtAltar = {
  /** The step action it fills in (stepActions.ts). */
  action: string;
  /** Its plain name in the builder's list. */
  name: string;
  deed: AltarDeed;
  /** The live step's button. */
  button: string;
  /** How the step is taken: everyone together (the default) or one at a time. */
  turn?: 'together' | 'in_turn';
  /** What to do with what is placed (stepFlow's "with them"). */
  withItems?: string;
};

/** Every meaningful thing done at the altar, as a step. Moving, turning and resizing are left out. */
export const AT_ALTAR: AtAltar[] = [
  { action: 'write_petition', name: 'Write a petition', deed: 'petition', button: 'Write your petition at the altar', withItems: 'Fold it into the petition box, or beneath a candle.' },
  { action: 'write_intention', name: 'Write an intention', deed: 'intention', button: 'Set your intention at the altar' },
  { action: 'write_gratitude', name: 'Write a gratitude note', deed: 'gratitude', button: 'Add to the gratitude bowl' },
  { action: 'place_offering', name: 'Make an offering', deed: 'offering', button: 'Set out your offering', withItems: 'Set it out in a bowl or dish on the altar.' },
  { action: 'pour_libation', name: 'Pour a libation', deed: 'offering', button: 'Pour your libation', withItems: 'Pour it into a bowl or chalice on the altar.' },
  { action: 'light_candle', name: 'Light a candle', deed: 'light', button: 'Light a candle at the altar', turn: 'in_turn' },
  { action: 'burn_incense', name: 'Burn incense', deed: 'incense', button: 'Light the incense' },
  { action: 'set_item', name: 'Place an item', deed: 'place', button: 'Choose something to place', withItems: 'Set it on the altar and say what it is there for.' },
  { action: 'draw_card', name: 'Draw a card', deed: 'card', button: 'Lay your card on the altar' },
  { action: 'burn_petitions', name: 'Burn a petition', deed: 'release', button: 'Burn your petition' },
  { action: 'bury_petitions', name: 'Bury a petition', deed: 'release', button: 'Bury your petition' },
  { action: 'release_petitions', name: 'Release a petition', deed: 'release', button: 'Release your petition' },
  { action: 'dress_candle', name: 'Anoint and dress a candle', deed: 'anoint', button: 'Dress your candle' },
  { action: 'carve_candle', name: 'Carve a candle', deed: 'carve', button: 'Carve your candle' },
  { action: 'charge_crystal', name: 'Charge a crystal', deed: 'charge_crystal', button: 'Charge a crystal' },
  { action: 'charge_water', name: 'Charge water', deed: 'offering', button: 'Set out water to charge', withItems: 'Choose Water, in a bowl or chalice.' },
  { action: 'make_jar', name: 'Make a spell jar', deed: 'jar', button: 'Make your spell jar' },
  { action: 'make_sachet', name: 'Make a sachet', deed: 'sachet', button: 'Make your sachet' },
  { action: 'cord_cutting', name: 'Tie and burn a cord', deed: 'cord', button: 'Tie a cord between two candles' },
  { action: 'scry', name: 'Scry', deed: 'scry', button: 'Scry at the altar' },
];

export const ALTAR_DEEDS = [...new Set(AT_ALTAR.map((a) => a.deed))];

/** The step's "Done at the altar" choice: each deed once, by its plain name ('' is nothing done there). */
export const DEED_CHOICES: { value: AltarDeed | ''; label: string }[] = [
  { value: '', label: 'Nothing to do there' },
  ...ALTAR_DEEDS.map((deed) => ({ value: deed, label: deed === 'release' ? 'Burn, bury or release a petition' : AT_ALTAR.find((a) => a.deed === deed)!.name })),
];

export const isAltarDeed = (v: unknown): v is AltarDeed => typeof v === 'string' && (ALTAR_DEEDS as string[]).includes(v);

/** The table's row for a step: by its kept deed and action. */
export function atAltarOf(step: { action?: string | null; details?: unknown } | null | undefined): AtAltar | null {
  const deed = step?.details && typeof step.details === 'object' ? (step.details as { at_altar?: unknown }).at_altar : null;
  if (!isAltarDeed(deed)) return null;
  return AT_ALTAR.find((a) => a.deed === deed && a.action === step?.action) ?? AT_ALTAR.find((a) => a.deed === deed) ?? null;
}

/** The "At the altar" list in the builder: the actions, under their plain names. */
export function atAltarActions(query = ''): StepAction[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const out: StepAction[] = [];
  for (const row of AT_ALTAR) {
    const action = actionOf(row.action);
    if (!action) continue;
    const named: StepAction = { ...action, label: row.name };
    if (words.every((w) => [row.name, action.name, ...(action.keywords ?? [])].join(' ').toLowerCase().includes(w))) out.push(named);
  }
  return out;
}

/**
 * Choosing one: its five parts filled in. What happens (the action's name,
 * directions and words), who (the whole coven, together or in turn), nothing
 * set on the altar by itself (the person does it there), what to do with what
 * they place, and the leader moving it on. Nothing asked to be written in the
 * ritual itself: the altar's own writer takes the words.
 */
export function atAltarStep(actionId: string) {
  const row = AT_ALTAR.find((a) => a.action === actionId);
  const action = actionOf(actionId);
  if (!row || !action) return null;
  return {
    ...applyAction(action),
    title: row.name.slice(0, 120),
    altar_action: '' as const,
    contribution: null,
    turn_mode: row.turn ?? ('together' as const),
    roles: [] as string[],
    assignees: [],
    details: { at_altar: row.deed, ...(row.withItems ? { with_items: row.withItems } : {}) },
  };
}

/** Where the live step's button goes: the coven's altar, opening the deed for this step. */
export const deedQuery = (deed: AltarDeed, stepId: string) => `do=${encodeURIComponent(deed)}&step=${encodeURIComponent(stepId)}`;

/**
 * Done at the altar: it counts as this person's Done for the step, and on a
 * step taken in turn, when it is their turn, it passes the turn on.
 */
export function deedFinish(step: { turn_mode?: string | null; turn_order?: string[] | null; turn_at?: number | null }, userId: string | null): { done: boolean; passTurn: boolean } {
  const order = step.turn_order ?? [];
  const myTurn = step.turn_mode === 'in_turn' && !!userId && order[step.turn_at ?? 0] === userId;
  return { done: !!userId, passTurn: myTurn };
}
