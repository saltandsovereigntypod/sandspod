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

import { actionOf, ALTAR_EFFECTS, applyAction, type AltarEffect, type StepAction } from './stepActions.ts';
import { CONTRIBUTION_KINDS, defaultContribution, type ContributionKind, type StepContribution } from './contributions.ts';
import { presetOf, presetParams, PRESETS, type PresetId } from '../meditation/scripts.ts';
import { QUARTERS, type QuarterId } from '../altar/circle.ts';

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
  | 'scry'
  | 'bell'
  | 'circle'
  | 'release_circle'
  | 'quarters'
  | 'release_quarters'
  | 'call_quarter'
  | 'release_quarter'
  | 'match'
  | 'bowl'
  | 'toast'
  | 'libation'
  | 'sweep'
  | 'pendulum'
  | 'scry_mirror'
  | 'grind'
  | 'cut_cord'
  | 'simmer'
  | 'grid'
  | 'draw_deck';

/** How the builder's "At the altar" choice groups them. */
export type DeedGroup = 'circle' | 'write' | 'give' | 'fire' | 'work' | 'let_go';
export const DEED_GROUPS: { id: DeedGroup; label: string }[] = [
  { id: 'circle', label: 'Circle and quarters' },
  { id: 'write', label: 'Write' },
  { id: 'give', label: 'Give and place' },
  { id: 'fire', label: 'Candles and incense' },
  { id: 'work', label: 'Read and work' },
  { id: 'let_go', label: 'Let go' },
];

export type AtAltar = {
  /** The step action it fills in (stepActions.ts). */
  action: string;
  /** Its plain name in the builder's list. */
  name: string;
  deed: AltarDeed;
  group: DeedGroup;
  /** The live step's button. */
  button: string;
  /** How the step is taken: everyone together (the default) or one at a time. */
  turn?: 'together' | 'in_turn';
  /** What to do with what is placed (stepFlow's "with them"). */
  withItems?: string;
  /** A step for one quarter: which (quarterSteps.ts). */
  quarter?: QuarterId;
};

/** The step actions for each quarter (stepActions.ts: call_air… release_earth), by quarter. */
const QUARTER_ACTION: Record<QuarterId, string> = { east: 'air', south: 'fire', west: 'water', north: 'earth' };
export const quarterCallAction = (id: QuarterId) => `call_${QUARTER_ACTION[id]}`;
export const quarterReleaseAction = (id: QuarterId) => `release_${QUARTER_ACTION[id]}`;

/** Every meaningful thing done at the altar, as a step. Moving, turning and resizing are left out. */
export const AT_ALTAR: AtAltar[] = [
  { action: 'write_petition', name: 'Write a petition', deed: 'petition', group: 'write', button: 'Write your petition at the altar', withItems: 'Fold it into the petition box, or beneath a candle.' },
  { action: 'write_intention', name: 'Write an intention', deed: 'intention', group: 'write', button: 'Set your intention at the altar' },
  { action: 'write_gratitude', name: 'Write a gratitude note', deed: 'gratitude', group: 'write', button: 'Add to the gratitude bowl' },
  { action: 'place_offering', name: 'Make an offering', deed: 'offering', group: 'give', button: 'Set out your offering', withItems: 'Set it out in a bowl or dish on the altar.' },
  { action: 'pour_libation', name: 'Pour a libation', deed: 'libation', group: 'give', button: 'Pour your libation', withItems: 'Pour it from the chalice into a bowl on the altar.' },
  { action: 'toast_blessing', name: 'Raise the chalice', deed: 'toast', group: 'give', button: 'Raise the chalice at the altar' },
  { action: 'light_candle', name: 'Light a candle', deed: 'light', group: 'fire', button: 'Light a candle at the altar', turn: 'in_turn' },
  { action: 'light_with_match', name: 'Light a candle with a match', deed: 'match', group: 'fire', button: 'Strike a match at the altar', turn: 'in_turn' },
  { action: 'burn_incense', name: 'Burn incense', deed: 'incense', group: 'fire', button: 'Light the incense' },
  { action: 'set_item', name: 'Place an item', deed: 'place', group: 'give', button: 'Choose something to place', withItems: 'Set it on the altar and say what it is there for.' },
  { action: 'draw_card', name: 'Draw a card', deed: 'card', group: 'work', button: 'Lay your card on the altar' },
  { action: 'burn_petitions', name: 'Burn a petition', deed: 'release', group: 'let_go', button: 'Burn your petition' },
  { action: 'bury_petitions', name: 'Bury a petition', deed: 'release', group: 'let_go', button: 'Bury your petition' },
  { action: 'release_petitions', name: 'Release a petition', deed: 'release', group: 'let_go', button: 'Release your petition' },
  { action: 'dress_candle', name: 'Anoint and dress a candle', deed: 'anoint', group: 'fire', button: 'Dress your candle' },
  { action: 'carve_candle', name: 'Carve a candle', deed: 'carve', group: 'fire', button: 'Carve your candle' },
  { action: 'charge_crystal', name: 'Charge a crystal', deed: 'charge_crystal', group: 'work', button: 'Charge a crystal' },
  { action: 'charge_water', name: 'Charge water', deed: 'offering', group: 'give', button: 'Set out water to charge', withItems: 'Choose Water, in a bowl or chalice.' },
  { action: 'make_jar', name: 'Make a spell jar', deed: 'jar', group: 'work', button: 'Make your spell jar' },
  { action: 'make_sachet', name: 'Make a sachet', deed: 'sachet', group: 'work', button: 'Make your sachet' },
  { action: 'cord_cutting', name: 'Tie and burn a cord', deed: 'cord', group: 'let_go', button: 'Tie a cord between two candles' },
  { action: 'scry', name: 'Scry', deed: 'scry', group: 'work', button: 'Scry at the altar' },
  { action: 'ring_bell', name: 'Ring the bell', deed: 'bell', group: 'work', button: 'Ring the bell at the altar' },
  { action: 'strike_bowl', name: 'Strike the singing bowl', deed: 'bowl', group: 'work', button: 'Strike the bowl at the altar' },
  { action: 'cast_circle', name: 'Cast the circle', deed: 'circle', group: 'circle', button: 'Cast the circle at the altar' },
  { action: 'open_circle', name: 'Release the circle', deed: 'release_circle', group: 'circle', button: 'Release the circle at the altar' },
  { action: 'call_quarters', name: 'Call the quarters', deed: 'quarters', group: 'circle', button: 'Call the quarters at the altar' },
  { action: 'release_quarters', name: 'Release the quarters', deed: 'release_quarters', group: 'circle', button: 'Release the quarters at the altar' },
  { action: 'call_quarters_turns', name: 'Call the quarters, one at a time', deed: 'quarters', group: 'circle', button: 'Call your quarter at the altar', turn: 'in_turn' },
  { action: 'release_quarters_turns', name: 'Release the quarters, one at a time', deed: 'release_quarters', group: 'circle', button: 'Release your quarter at the altar', turn: 'in_turn' },
  ...QUARTERS.map((q): AtAltar => ({ action: quarterCallAction(q.id), name: `Call the ${q.name}`, deed: 'call_quarter', group: 'circle', button: `Call the ${q.name} at the altar`, quarter: q.id })),
  ...QUARTERS.map((q): AtAltar => ({ action: quarterReleaseAction(q.id), name: `Release the ${q.name}`, deed: 'release_quarter', group: 'circle', button: `Release the ${q.name} at the altar`, quarter: q.id })),
  { action: 'cleanse_space', name: 'Sweep the altar', deed: 'sweep', group: 'let_go', button: 'Sweep the altar with the besom' },
  { action: 'ask_pendulum', name: 'Ask the pendulum', deed: 'pendulum', group: 'work', button: 'Ask the pendulum at the altar' },
  { action: 'scry_mirror', name: 'Scry in the mirror', deed: 'scry_mirror', group: 'work', button: 'Scry in the mirror at the altar' },
  { action: 'grind_herbs', name: 'Grind herbs in the mortar', deed: 'grind', group: 'work', button: 'Grind your herbs at the altar' },
  { action: 'cut_cord', name: 'Cut a cord with the bolline', deed: 'cut_cord', group: 'let_go', button: 'Cut the cord at the altar' },
  { action: 'simmer_pot', name: 'Set a simmer pot going', deed: 'simmer', group: 'give', button: 'Set the simmer pot going in the cauldron' },
  { action: 'crystal_grid', name: 'Activate a crystal grid', deed: 'grid', group: 'work', button: 'Activate the grid with the wand' },
  { action: 'draw_from_deck', name: 'Draw from the deck on the altar', deed: 'draw_deck', group: 'work', button: 'Draw from the deck at the altar' },
];

export const ALTAR_DEEDS = [...new Set(AT_ALTAR.map((a) => a.deed))];

export const isAltarDeed = (v: unknown): v is AltarDeed => typeof v === 'string' && (ALTAR_DEEDS as string[]).includes(v);

const detailsOf = (step: { details?: unknown } | null | undefined): Record<string, unknown> => (step?.details && typeof step.details === 'object' ? (step.details as Record<string, unknown>) : {});

/** The table's row for a step: by its kept deed, and which of that deed's rows (details.at_altar_as, or its action). */
export function atAltarOf(step: { action?: string | null; details?: unknown } | null | undefined): AtAltar | null {
  const d = detailsOf(step);
  if (!isAltarDeed(d.at_altar)) return null;
  const deed = d.at_altar;
  // A row moved to a deed of its own (a libation was once an offering) is still found by its action.
  return AT_ALTAR.find((a) => a.deed === deed && a.action === d.at_altar_as) ?? AT_ALTAR.find((a) => a.action === d.at_altar_as) ?? AT_ALTAR.find((a) => a.deed === deed && a.action === step?.action) ?? AT_ALTAR.find((a) => a.deed === deed) ?? null;
}

/**
 * A timed sit for everyone in the step: a meditation preset (Ground &
 * centre, Clearing; meditation/scripts.ts), kept on the step's details as
 * `sit_preset`. It runs in the Ritual panel over the coven's altar for
 * everyone at once, from the step's start (ritualPanel.ts sitSync).
 */
export function sitStepOf(step: { details?: unknown } | null | undefined): { id: PresetId; label: string; minutes: number; button: string; params: Record<string, string> } | null {
  const p = presetOf(detailsOf(step).sit_preset);
  return p ? { id: p.id, label: p.label, minutes: p.minutes, button: `Begin the sit: ${p.label}`, params: presetParams(p.id) } : null;
}

/** A kept "which row" is one of the table's actions. */
export const isAtAltarAction = (v: unknown): v is string => typeof v === 'string' && AT_ALTAR.some((a) => a.action === v);

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

/** The action's directions, with what to do with what is placed after them: one "What to do". */
const directionsFor = (row: AtAltar, directions: string) => [directions.trim(), row.withItems ?? ''].filter(Boolean).join(' ');

/**
 * Choosing one: its five parts filled in. What happens (the action's name,
 * directions and words), who (the whole coven, together or in turn), nothing
 * set on the altar by itself (the person does it there), what to do (its
 * directions, with what to do with what they place), and the leader moving it
 * on. Nothing asked to be written in the ritual itself: the altar's own
 * writer takes the words.
 */
export function atAltarStep(actionId: string) {
  const row = AT_ALTAR.find((a) => a.action === actionId);
  const action = actionOf(actionId);
  if (!row || !action) return null;
  const applied = applyAction(action);
  return {
    ...applied,
    title: row.name.slice(0, 120),
    instructions: directionsFor(row, applied.instructions),
    altar_action: '' as const,
    contribution: null,
    turn_mode: row.turn ?? ('together' as const),
    roles: [] as string[],
    assignees: [],
    details: { at_altar: row.deed, at_altar_as: row.action },
  };
}

// ─── The step's one "At the altar" choice ───────────────────────────────
// Everything a step can do at the altar, in one list: what each person does
// there for real (the table above), what each person is asked to write or
// bring in the ritual itself (contributions.ts, the ones the altar doesn't
// do), and what the shared altar does by itself (stepActions.ts
// ALTAR_EFFECTS). One is chosen; steps saved before keep whatever they had.

export type AltarChoice = { value: string; label: string };
export type AltarChoiceGroup = { id: string; label: string; detail: string; options: AltarChoice[] };

/** What each person is asked for in the ritual that the altar has no writer of its own for. */
const ASKED_HERE: ContributionKind[] = ['vow', 'ancestor', 'question', 'reflection', 'candle'];

/** The shared altar's own changes, said plainly as what happens. */
const EFFECT_WORDS: Record<string, string> = {
  light_candle: 'A candle is lit',
  place_item: 'The items are set down',
  light_all: 'Every candle is lit',
  snuff_all: 'Every candle is put out',
  release_papers: 'The papers are burned, buried or released',
};

/** The step's choice now: "deed:<action>", "ask:<kind>", "effect:<effect>", or '' for nothing. All that apply, for steps saved with more than one. */
export function altarChoicesOf(step: { action?: string | null; details?: unknown; altar_action?: string | null; contribution?: Pick<StepContribution, 'kind'> | null }): string[] {
  const out: string[] = [];
  const row = atAltarOf(step);
  if (row) out.push(`deed:${row.action}`);
  if (step.contribution?.kind) out.push(`ask:${step.contribution.kind}`);
  if (step.altar_action) out.push(`effect:${step.altar_action}`);
  const sit = sitStepOf(step);
  if (sit) out.push(`sit:${sit.id}`);
  return out;
}

/** The groups to choose from. A step's own older choice (a petition asked in the ritual) stays listed so it can be seen and changed. */
export function altarChoiceGroups(current: string[] = []): AltarChoiceGroup[] {
  const asked = CONTRIBUTION_KINDS.filter((k) => ASKED_HERE.includes(k.id) || current.includes(`ask:${k.id}`));
  return [
    ...DEED_GROUPS.map((g) => ({
      id: `deed:${g.id}`,
      label: g.label,
      detail: '',
      options: AT_ALTAR.filter((a) => a.group === g.id).map((a) => ({ value: `deed:${a.action}`, label: a.name })),
    })),
    { id: 'ask', label: 'Asked of each person in the ritual', detail: '', options: asked.map((k) => ({ value: `ask:${k.id}`, label: k.label })) },
    { id: 'effect', label: 'The altar by itself', detail: '', options: ALTAR_EFFECTS.filter((e) => e.value).map((e) => ({ value: `effect:${e.value}`, label: EFFECT_WORDS[e.value] ?? e.label })) },
    { id: 'sit', label: 'A timed sit for everyone', detail: '', options: PRESETS.map((p) => ({ value: `sit:${p.id}`, label: `${p.label} (${p.minutes} min)` })) },
  ];
}

/** A line under the choice: what it does while the ritual runs. */
export function altarChoiceNote(step: Parameters<typeof altarChoicesOf>[0]): string {
  const [first] = altarChoicesOf(step);
  if (!first) return 'Nothing is done at the altar in this step.';
  const [kind, id] = first.split(':');
  if (kind === 'deed') {
    const row = atAltarOf(step)!;
    return `Each person’s step shows “${row.button}”, which opens it at the coven’s altar. Doing it there counts as their Done.`;
  }
  if (kind === 'sit') {
    const sit = sitStepOf(step)!;
    return `A ${sit.minutes}-minute sit runs in the Ritual panel at the altar for everyone at once, from when the step is started, with the guidance, breath, bells and sound each person chose.`;
  }
  if (kind === 'ask') return `Each person is asked for ${(CONTRIBUTION_KINDS.find((k) => k.id === id)?.label ?? 'something').toLowerCase()} during the step, and it is kept with the ritual.`;
  return ALTAR_EFFECTS.find((e) => e.value === id)?.detail ?? '';
}

/**
 * Choosing one ('' for nothing): the step's altar parts set to it alone. The
 * step's name and directions stay as they are; a deed only fills in what to
 * do when that was empty.
 */
export function applyAltarChoice(step: { instructions?: string; details: object; contribution?: StepContribution | null }, value: string) {
  const [kind, id] = value.split(':');
  const details = { ...step.details, at_altar: undefined, at_altar_as: undefined, sit_preset: undefined } as Record<string, unknown>;
  const patch: { altar_action: AltarEffect; contribution: StepContribution | null; details: Record<string, unknown>; instructions?: string } = { altar_action: '', contribution: null, details };
  if (kind === 'deed') {
    const row = AT_ALTAR.find((a) => a.action === id);
    if (row) {
      details.at_altar = row.deed;
      details.at_altar_as = row.action;
      if (!step.instructions?.trim()) patch.instructions = directionsFor(row, actionOf(row.action)?.directions ?? '');
    }
  } else if (kind === 'ask' && CONTRIBUTION_KINDS.some((k) => k.id === id)) {
    patch.contribution = step.contribution?.kind === id ? step.contribution : defaultContribution(id as ContributionKind, step.contribution ? { timing: step.contribution.timing } : {});
  } else if (kind === 'effect' && ALTAR_EFFECTS.some((e) => e.value === id)) {
    patch.altar_action = id as AltarEffect;
  } else if (kind === 'sit' && presetOf(id)) {
    details.sit_preset = id;
  }
  return patch;
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
