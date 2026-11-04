// The live ritual at the coven's altar: everyone stays on the altar screen,
// and the step under way lives in the Ritual tab of the panel along the
// bottom (components/covens/AltarRitual.tsx; the website's
// covens/coven/chat-panel.js). What it says and decides, kept pure so the
// app and the website (js/core/covens.js, SaltCore.covens.ritualPanel) agree:
//
// - how to do the step: the builder's own directions when written, otherwise
//   a plain default for its kind (every altar deed, every sit, every writing
//   step, together / one at a time / one person);
// - whose altar glows: only the person whose turn it is (on a step done
//   together, everyone doing it), never those watching, until they've done it;
// - when the panel opens by itself (the step begins, your turn comes, the
//   step is finished and you move it on), and the line on its slim bar;
// - a sit in the panel: in step from the step's own start, never before it,
//   with each person's own choices (Settings → Covens & privacy).

import { atAltarOf, sitStepOf, type AltarDeed } from './altarActions.ts';
import type { ContributionKind } from './contributions.ts';
import type { FlowKind } from './stepFlow.ts';
import { DEFAULT_MIX, LAYERS, type LayerId, type SoundMix } from '../meditation/sound.ts';
import { presetOf, presetPlan, type PresetId } from '../meditation/scripts.ts';
import type { BreathPattern, SitPlan } from '../meditation/timer.ts';

// ─── How to ──────────────────────────────────────────────────────────────

/** A plain default for each "At the altar" deed (altarActions AT_ALTAR, by action): where to tap and what to do. */
export const DEED_HOWTO: Record<string, string> = {
  write_petition: 'Write your petition in the box below and tap Place it. It is folded onto the altar, into the petition box.',
  write_intention: 'Tap Write it below: the altar’s intention card opens. Write it plainly, in the present tense, and it stays on the altar.',
  write_gratitude: 'Tap Write it below and add a few words of thanks to the gratitude bowl on the altar.',
  place_offering: 'Tap the glowing bowl or dish on the altar, then Offer, and choose what you give. No dish yet? Place one from the tiles or the cabinet first.',
  pour_libation: 'Tap the glowing chalice on the altar. Fill it if it’s empty, then pour your libation into a bowl.',
  toast_blessing: 'Tap the glowing chalice on the altar. Fill it if it’s empty, then raise it and say your blessing.',
  light_candle: 'Tap a glowing unlit candle on the altar, then Light candle.',
  light_with_match: 'Tap the glowing box of matches, strike one, then tap an unlit candle and Light candle.',
  burn_incense: 'Tap the glowing incense on the altar, then Light.',
  set_item: 'Tap a tile below to set it on the altar, or open the cabinet. Then move it where it belongs and say what it is there for.',
  draw_card: 'Tap Draw below: the altar’s reading sheet opens. Draw your card and lay it on the altar.',
  burn_petitions: 'Tap the glowing petition box, choose your petition, and burn it. The ash is left for the besom.',
  bury_petitions: 'Tap the glowing petition box, choose your petition, and bury it.',
  release_petitions: 'Tap the glowing petition box, choose your petition, and release it.',
  dress_candle: 'Tap the glowing candle on the altar, then Anoint, and choose the oil and the way you dress it.',
  carve_candle: 'Tap the glowing candle on the altar, then Carve, and choose what you carve into it.',
  charge_crystal: 'Tap the glowing crystal on the altar, then Charge, and hold your intention while it charges.',
  charge_water: 'Tap the glowing bowl or chalice, then Offer, and choose Water to set it out to charge.',
  make_jar: 'Tap Make it below: the spell jar sheet opens. Choose what goes in, seal it, and it is set on the altar.',
  make_sachet: 'Tap Make it below: the sachet sheet opens. Choose the herbs and stones, tie it, and it is set on the altar.',
  cord_cutting: 'Tap a glowing candle, then Tie a cord, and tap a second candle. The cord burns between them when they are lit.',
  scry: 'Tap Scry below: the scrying sheet opens over the altar. Gaze softly, and note what comes before you speak of it.',
  ring_bell: 'Tap the glowing bell on the altar, then Ring.',
  strike_bowl: 'Tap the glowing singing bowl on the altar, then Strike, and let it sound out.',
  cast_circle: 'Tap the glowing athame or wand on the altar, then trace the circle round the altar with your finger. Or tap Cast it for me.',
  open_circle: 'Tap the glowing athame or wand on the altar, then trace the circle the other way to release it. Or tap Release it for me.',
  call_quarters: 'Tap each quarter’s spot at the edge of the altar to call it, in the ritual’s order (East first unless it says otherwise). Or open the circle panel: tap the glowing athame or wand, or Call them below.',
  release_quarters: 'Tap each lit quarter at the edge of the altar to release it, in reverse of the order they were called. Or open the circle panel: tap the glowing athame or wand, or Release them below.',
  call_quarters_turns: 'When it’s your turn, only your quarter glows at the edge of the altar. Face it, say your words, then tap it to call it. The next caller’s turn follows.',
  release_quarters_turns: 'When it’s your turn, only your quarter glows at the edge of the altar. Face it, thank it and bid it farewell, then tap it to release it.',
  call_air: 'Face the East. Say the words, then tap the glowing East at the right-hand edge of the altar to call it.',
  call_fire: 'Face the South. Say the words, then tap the glowing South at the front edge of the altar to call it.',
  call_water: 'Face the West. Say the words, then tap the glowing West at the left-hand edge of the altar to call it.',
  call_earth: 'Face the North. Say the words, then tap the glowing North at the back edge of the altar to call it.',
  release_air: 'Face the East. Thank it and bid it farewell, then tap the lit East at the right-hand edge of the altar to release it.',
  release_fire: 'Face the South. Thank it and bid it farewell, then tap the lit South at the front edge of the altar to release it.',
  release_water: 'Face the West. Thank it and bid it farewell, then tap the lit West at the left-hand edge of the altar to release it.',
  release_earth: 'Face the North. Thank it and bid it farewell, then tap the lit North at the back edge of the altar to release it.',
  cleanse_space: 'Tap the glowing besom on the altar, then Sweep, and draw it across the altar.',
  ask_pendulum: 'Tap the glowing pendulum on the altar, ask your question, then tap Ask. Its answer shows here.',
  scry_mirror: 'Tap the glowing mirror on the altar, or Scry below, and gaze softly into the glass.',
  grind_herbs: 'Tap the glowing mortar on the altar, add your herbs and resins, then Grind.',
  cut_cord: 'Tap the glowing bolline on the altar, then choose the cord to cut.',
  simmer_pot: 'Tap the glowing cauldron on the altar, choose what goes in, then start the simmer pot.',
  crystal_grid: 'Tap the glowing wand on the altar, then Activate, and touch each stone of the grid in turn.',
  draw_from_deck: 'Tap the glowing deck on the altar, then Draw. Your card or rune is laid beside it and shows here.',
};

/** A plain default for each sit (meditation PRESETS). */
export const SIT_HOWTO: Record<PresetId, string> = {
  ground: 'Sit or stand comfortably and close your eyes. Follow the lines here: roots down, light down, steady at the heart. The bell begins and ends it.',
  clearing: 'Sit comfortably and breathe slowly with the circle. Let each out-breath carry the day away. The bell begins and ends it.',
  candle: 'Gaze at the lit candle on the altar with soft eyes. When your mind wanders, come back to the flame. The bell begins and ends it.',
};

/** A plain default for what each person is asked for in the ritual (contributions.ts). */
export const ASK_HOWTO: Record<ContributionKind, string> = {
  petition: 'Write your petition in the box below, then offer it to set it on the altar.',
  intention: 'Write your intention in the box below, in the present tense, then offer it to set it on the altar.',
  gratitude: 'Write what you are grateful for in the box below, then offer it.',
  vow: 'Write your vow in the box below. Speak it aloud when it is your turn, then offer it.',
  ancestor: 'Write the name of the ancestor you honour in the box below, then offer it to set it on the altar.',
  question: 'Write your question in the box below, then offer it.',
  reflection: 'Write a few words of reflection in the box below. Only you see it unless you choose otherwise.',
  offering: 'Choose your offering below, then offer it to set it on the altar.',
  candle: 'Choose your candle below, then offer it to set it on the altar.',
  light_candle: 'Light your own candle on the altar: tap it, then Light candle.',
  libation: 'Pour your own libation: tap the chalice on the altar, fill it, then pour.',
  card: 'Draw your card, then lay it on the altar.',
};

/** How the step is taken, as a last default. */
export const KIND_HOWTO: Record<FlowKind, string> = {
  together: 'Everyone does this together. Follow the words, then tap Done.',
  turns: 'One at a time. When it’s your turn, do your part, then tap I’ve done my part.',
  one: 'One person does this step while everyone else watches and listens.',
};

type HowToStep = {
  instructions?: string | null;
  action?: string | null;
  details?: unknown;
  contribution?: { kind?: string } | null;
};

/** The default how-to for a step's kind: its deed, its sit, what it asks, or how it is taken. */
export function defaultHowTo(step: HowToStep, kind: FlowKind): string {
  const deed = atAltarOf(step);
  if (deed && DEED_HOWTO[deed.action]) return DEED_HOWTO[deed.action];
  const sit = sitStepOf(step);
  if (sit) return SIT_HOWTO[sit.id];
  const ask = step.contribution?.kind as ContributionKind | undefined;
  if (ask && ASK_HOWTO[ask]) return ASK_HOWTO[ask];
  return KIND_HOWTO[kind];
}

/** The step's how-to: the builder's own directions when written, otherwise the default. */
export function stepHowTo(step: HowToStep, kind: FlowKind): { text: string; builder: boolean } {
  const own = (step.instructions ?? '').trim();
  return own ? { text: own, builder: true } : { text: defaultHowTo(step, kind), builder: false };
}

// ─── Who the altar glows for ─────────────────────────────────────────────

/**
 * Whether the step's target on the altar glows for you: only while the step
 * still waits for you. One at a time (with an order): only on your turn.
 * Together, or one person's step: when it is yours and you haven't done it.
 * Never for those watching.
 */
export function glowsForMe(input: { kind: FlowKind; mine: boolean; myTurn: boolean; hasOrder: boolean; iDone: boolean; complete: boolean }): boolean {
  if (input.complete || input.iDone) return false;
  if (input.kind === 'turns' && input.hasOrder) return input.myTurn;
  return input.mine;
}

/** What glows for each deed, said plainly (the app's deedTargets.ts and the website's coven-altar.js find it on the altar). */
export const DEED_TARGET: Record<AltarDeed, string> = {
  petition: '',
  intention: '',
  gratitude: '',
  offering: 'a bowl or dish',
  light: 'an unlit candle',
  incense: 'unlit incense',
  place: '',
  card: '',
  release: 'the petition box',
  anoint: 'a candle',
  carve: 'a candle',
  charge_crystal: 'a crystal',
  jar: '',
  sachet: '',
  cord: 'the candles',
  scry: '',
  bell: 'the bell',
  circle: 'the athame or wand',
  release_circle: 'the athame or wand',
  quarters: 'the athame or wand',
  release_quarters: 'the athame or wand',
  call_quarter: 'your quarter at the edge of the altar',
  release_quarter: 'your quarter at the edge of the altar',
  match: 'the matches',
  bowl: 'the singing bowl',
  toast: 'the chalice',
  libation: 'the chalice',
  sweep: 'the besom',
  pendulum: 'the pendulum',
  scry_mirror: 'the mirror',
  grind: 'the mortar',
  cut_cord: 'the bolline',
  simmer: 'the cauldron',
  grid: 'the crystals',
  draw_deck: 'the deck',
};

/** Deeds done in the panel itself, or on a sheet opened from it, rather than at a glowing thing. */
export const PANEL_DEEDS: AltarDeed[] = ['petition', 'intention', 'gratitude', 'card', 'jar', 'sachet', 'scry', 'place'];

/** Deeds whose result (the card drawn, the pendulum's answer) is shown in the panel. */
export const RESULT_DEEDS: AltarDeed[] = ['card', 'draw_deck', 'pendulum', 'grind', 'grid'];

// ─── The panel opening by itself, and its slim bar ───────────────────────

type CueFlow = { myTurn: boolean; isEnder: boolean; progress: { complete: boolean } } | null | undefined;

/** What the panel answers to: a new step, your turn, a finished step you move on. '' when nothing is under way. */
export function panelCue(stepId: string | null | undefined, flow: CueFlow): string {
  if (!stepId || !flow) return '';
  const turn = flow.myTurn && !flow.progress.complete ? ':turn' : '';
  const end = flow.isEnder && flow.progress.complete ? ':end' : '';
  return `${stepId}${turn}${end}`;
}

/** Whether to open the panel on the Ritual tab (with a soft chime and a glow): the cue has changed to something new. */
export const opensPanel = (before: string, now: string): boolean => !!now && now !== before;

/** The slim bar's line: "Step 3 · Your turn: Call the quarters", or on a quarter's turn "Step 3 · Your turn: call the East". */
export function panelBarLine(input: { index: number; title: string; mine: boolean; myTurn: boolean; kind: FlowKind; iDone: boolean; complete: boolean; isEnder: boolean; quarterLine?: string | null }): string {
  const title = (input.myTurn && input.quarterLine ? input.quarterLine.replace(/^(Call|Release)/, (w) => w.toLowerCase()) : input.title.trim()) || 'A step';
  const head = `Step ${input.index + 1}`;
  if (input.complete) return `${head} · ${input.isEnder ? 'Finished: move on when ready' : 'Finished'}`;
  if (input.myTurn) return `${head} · Your turn: ${title}`;
  if (input.mine && !input.iDone && input.kind !== 'turns') return `${head} · Yours: ${title}`;
  return `${head} · ${title}`;
}

// ─── A sit in the panel ──────────────────────────────────────────────────

/**
 * Where everyone's sit is, from the step's start (its started_at): waiting
 * before it (never begun early, even with a clock a little ahead), running,
 * or over for someone arriving after it ended.
 */
export function sitSync(input: { startedAt: string | number | null | undefined; minutes: number; now: number }): {
  phase: 'waiting' | 'running' | 'over';
  startMs: number | null;
  elapsedMs: number;
  leftMs: number;
} {
  const start = input.startedAt == null || input.startedAt === '' ? NaN : typeof input.startedAt === 'number' ? input.startedAt : new Date(input.startedAt).getTime();
  const total = Math.max(0, input.minutes) * 60_000;
  if (!Number.isFinite(start)) return { phase: 'waiting', startMs: null, elapsedMs: 0, leftMs: total };
  const elapsed = input.now - start;
  if (elapsed < 0) return { phase: 'waiting', startMs: start, elapsedMs: 0, leftMs: total };
  if (elapsed >= total) return { phase: 'over', startMs: start, elapsedMs: total, leftMs: 0 };
  return {
    phase: 'running',
    startMs: start,
    elapsedMs: elapsed,
    leftMs: total - elapsed,
  };
}

/** Each person's choices for sits in a coven ritual, kept in their settings. */
export const RITUAL_SIT_KEYS = {
  guidance: 'ritual_sit_guidance',
  breath: 'ritual_sit_breath',
  bells: 'ritual_sit_bells',
  sound: 'ritual_sit_sound',
  layers: 'ritual_sit_layers',
} as const;

export type RitualSitPrefs = {
  guidance: boolean;
  breath: boolean;
  bells: boolean;
  sound: boolean;
  layers: LayerId[];
};

/** Guidance, the breath circle and bells on; sound off until chosen (a room of phones all humming is a lot), with a drone when it is. */
export const RITUAL_SIT_DEFAULTS: RitualSitPrefs = {
  guidance: true,
  breath: true,
  bells: true,
  sound: false,
  layers: ['drone'],
};

const flag = (v: unknown, fallback: boolean) => (v === true || v === 'true' ? true : v === false || v === 'false' ? false : fallback);

export function ritualSitPrefs(settings: Record<string, unknown> | null | undefined): RitualSitPrefs {
  const s = settings ?? {};
  const raw = s[RITUAL_SIT_KEYS.layers];
  const layers =
    typeof raw === 'string'
      ? raw
          .split(',')
          .map((x) => x.trim())
          .filter((x): x is LayerId => LAYERS.some((l) => l.id === x))
      : RITUAL_SIT_DEFAULTS.layers;
  return {
    guidance: flag(s[RITUAL_SIT_KEYS.guidance], RITUAL_SIT_DEFAULTS.guidance),
    breath: flag(s[RITUAL_SIT_KEYS.breath], RITUAL_SIT_DEFAULTS.breath),
    bells: flag(s[RITUAL_SIT_KEYS.bells], RITUAL_SIT_DEFAULTS.bells),
    sound: flag(s[RITUAL_SIT_KEYS.sound], RITUAL_SIT_DEFAULTS.sound),
    layers: typeof raw === 'string' ? layers : RITUAL_SIT_DEFAULTS.layers,
  };
}

/** The layers chosen, toggled one on or off, as the setting keeps them. */
export const withLayer = (prefs: RitualSitPrefs, layer: LayerId, on: boolean): string =>
  LAYERS.map((l) => l.id)
    .filter((id) => (id === layer ? on : prefs.layers.includes(id)))
    .join(',');

/** The sit's plan in the panel: the preset's length, its bells only if you keep them. */
export function ritualSitPlan(id: PresetId, prefs: RitualSitPrefs): SitPlan {
  const plan = presetPlan(id);
  return prefs.bells ? plan : { ...plan, startBell: false, endBell: false, every: 0 };
}

/** The sound with it, or null: your chosen layers at a gentle level. */
export function ritualSitMix(prefs: RitualSitPrefs): SoundMix | null {
  if (!prefs.sound || !prefs.layers.length) return null;
  return {
    ...DEFAULT_MIX,
    levels: Object.fromEntries(prefs.layers.map((l) => [l, 0.5])),
  };
}

/** The breath circle's pace in a ritual sit: in for four, out for six, no holds. */
export const RITUAL_BREATH: BreathPattern = {
  inhale: 4,
  hold: 0,
  exhale: 6,
  rest: 0,
};

/** The guidance the sit shows, if any (candle gazing has none: the altar's candle is the guide). */
export const ritualSitScript = (id: PresetId, prefs: RitualSitPrefs) => (prefs.guidance ? (presetOf(id)?.script ?? null) : null);

/** A candle-gazing sit looks at the altar's own lit candle. */
export const gazesAtCandle = (id: PresetId) => presetOf(id)?.focus === 'candle';
