// Written guidance for a sit: a meditation given one line at a time, each
// fading in and resting on the screen until the next, paced to the length
// of the sit (lineAt). Our own words. Two short ones are kept as presets to
// begin a ritual with: Ground & centre (3 minutes) and Clearing (5), which a
// coven rite's step can start for everyone (covens/altarActions.ts). Pure.

import { cleanPlan, planParams, type SitPlan } from './timer.ts';
import type { SitKind } from './log.ts';

export type ScriptId = 'grounding' | 'clearing' | 'cauldrons' | 'guide' | 'elements' | 'body' | 'rest';

export type Script = { id: ScriptId; title: string; kind: SitKind; line: string; /** Where it comes from, said plainly. */ source: string; lines: string[] };

export const SCRIPTS: Script[] = [
  {
    id: 'grounding',
    title: 'Grounding & centring',
    kind: 'grounding',
    line: 'Roots down into the earth, and back to your centre.',
    source: 'A common modern witchcraft practice, the “tree of life” grounding. Our own words.',
    lines: [
      'Sit with your feet flat on the floor and let your hands rest.',
      'Breathe in slowly, and let the breath out a little longer than it came in.',
      'Feel the weight of your body, held by the ground beneath you.',
      'Imagine roots growing from the base of your spine, down through the floor.',
      'They reach into the cool, dark soil, past stones and water, deeper with each breath.',
      'Let anything you don’t need sink down along them, into the earth, to be made new.',
      'Now draw the earth’s steady strength up through the roots, as a tree draws water.',
      'Let it rise through your legs and spine and settle in your belly.',
      'Feel branches reach up from the crown of your head towards the sky.',
      'Draw down light from above, through the branches, to meet the earth’s strength at your heart.',
      'Rest here, between earth and sky, steady and whole.',
      'Let the roots and branches draw gently back. Keep the steadiness.',
      'When you’re ready, open your eyes. You are here.',
    ],
  },
  {
    id: 'clearing',
    title: 'Clearing',
    kind: 'breath',
    line: 'Breathing out what you carry in, before you begin.',
    source: 'A short clearing before ritual, in our own words.',
    lines: [
      'Settle where you are and let your shoulders drop.',
      'Breathe in through your nose, slowly, and out through your mouth.',
      'With each breath out, let go of the day: its errands, its noise, its worries.',
      'Imagine them leaving you as grey smoke, carried away and thinning to nothing.',
      'Breathe in clear, bright air, and feel it fill you from your feet to your crown.',
      'Notice anything still clinging: a thought, a tightness. Breathe it out too.',
      'Picture a ring of salt, or of soft light, around the place where you sit.',
      'Inside it, only what you invite may stay.',
      'Breathe in clean and steady. Breathe out what remains.',
      'You are clear, and ready to begin.',
    ],
  },
  {
    id: 'cauldrons',
    title: 'The three cauldrons',
    kind: 'visualisation',
    line: 'Warming, turning and filling the three cauldrons within.',
    source: 'Drawn from “The Cauldron of Poesy”, an early medieval Irish poem that names three cauldrons in a person. Using it as a meditation is modern.',
    lines: [
      'Settle, and let your breathing slow.',
      'The old Irish poem tells of three cauldrons within each of us. Find them now.',
      'Low in your belly sits the cauldron of warming: the cauldron of the body, of health and strength.',
      'See how it sits. Upright, tilted, or on its side. There is no wrong way.',
      'Breathe warmth into it, and feel it settle on its base, gently filling.',
      'In your chest is the cauldron of motion, turned by joy and by sorrow.',
      'Notice how it sits today. Let your breath steady it, a little at a time.',
      'In your head is the cauldron of knowledge, where inspiration is poured.',
      'Imagine it turning upright to receive, and something bright beginning to fill it.',
      'Feel all three together: body, heart and mind, each held and warming.',
      'Rest with them, and notice what each one asks of you.',
      'Let the images fade, and keep the warmth.',
      'Breathe deeply, move your fingers, and come back.',
    ],
  },
  {
    id: 'guide',
    title: 'Meeting a guide',
    kind: 'pathworking',
    line: 'A path through a wood, to meet one who may guide you.',
    source: 'A modern pathworking, in our own words. Go only as far as feels right.',
    lines: [
      'Close your eyes, and breathe until your body feels heavy and calm.',
      'Before you is a path into a quiet wood. It is safe, and you can leave it whenever you wish.',
      'Walk slowly. Notice the ground underfoot, the light through the leaves, the smell of the air.',
      'The path opens into a clearing, with somewhere to sit.',
      'Sit, and ask, silently, for a guide who has your good at heart to come.',
      'Wait without hurrying. Something may come: a figure, an animal, a light, a feeling. Or nothing yet.',
      'If something comes, greet it with courtesy. Ask its name, if it will give one.',
      'Ask if it has anything to show or tell you. Listen without forcing an answer.',
      'If anything feels wrong, thank it, stand, and walk back the way you came.',
      'When it’s time, thank whatever came, or the clearing itself.',
      'Walk back along the path, out of the wood, the way you came in.',
      'Feel your body in the chair again. Wriggle your fingers and toes.',
      'Open your eyes. Note what you met before it fades.',
    ],
  },
  {
    id: 'elements',
    title: 'Elemental journey',
    kind: 'visualisation',
    line: 'Earth, air, fire and water, one after another.',
    source: 'Built on the four classical elements as modern witchcraft uses them. Our own words.',
    lines: [
      'Settle, and breathe slowly and evenly.',
      'Begin with earth. Feel your weight, your bones, the ground holding you.',
      'Imagine a cave of cool stone around you, quiet and still. Rest in its steadiness.',
      'Now air. Feel the breath moving in and out of you, cool on its way in.',
      'Imagine a hilltop and a wide sky, wind moving through your thoughts and clearing them.',
      'Now fire. Feel the warmth of your own body, your heart beating.',
      'Imagine a hearth fire before you, its light and heat. What do you want to burn bright?',
      'Now water. Feel the moisture of your breath, the tides of your feeling.',
      'Imagine a still pool. Look into it and let it show you what it will.',
      'Hold all four together: steady, clear, bright and deep.',
      'Thank each element in turn, and let the images go.',
      'Feel your body in the room. Breathe, and open your eyes.',
    ],
  },
  {
    id: 'body',
    title: 'Body scan',
    kind: 'body',
    line: 'Attention moving slowly through the body, from feet to crown.',
    source: 'A body scan, a common modern mindfulness practice. Our own words.',
    lines: [
      'Lie down or sit comfortably, and let your eyes close.',
      'Bring your attention to your feet. Notice whatever is there, without changing it.',
      'Move up to your ankles, your calves, your knees. Just noticing.',
      'Your thighs and hips. Let them be heavy.',
      'Your belly, rising and falling with the breath.',
      'Your lower back, your upper back. Let them soften where they can.',
      'Your chest, and the heart beating within it.',
      'Your hands, your arms, your shoulders. Let your shoulders drop.',
      'Your neck and throat. Your jaw: let it loosen.',
      'Your face, your eyes, your forehead, the crown of your head.',
      'Now feel the whole body at once, breathing.',
      'If your mind wandered, that is fine. You came back.',
      'Take a deeper breath, stretch gently, and open your eyes.',
    ],
  },
  {
    id: 'rest',
    title: 'Deep rest',
    kind: 'body',
    line: 'Lying still and resting awake, in the manner of yoga nidra.',
    source: 'In the style of yoga nidra, a modern guided rest drawn from Indian yoga. This is our own simple version, not a teaching of that tradition.',
    lines: [
      'Lie down on your back, with something soft under your head and knees. Cover yourself if you’ll be cool.',
      'Let your body be completely still. You are resting, and you are awake.',
      'Say to yourself a short, kind wish, in the present tense, as though it is already true.',
      'Bring your attention to your right hand: thumb, fingers, palm, wrist. Then your whole right arm.',
      'Now your left hand and arm. Then your right leg, and your left.',
      'Your back against the floor. Your belly. Your chest. Your face.',
      'Feel the whole body as one, heavy and at ease.',
      'Notice the breath without changing it. Count ten breaths backwards, slowly.',
      'If you lose count, simply begin again. There is nothing to achieve.',
      'Imagine warmth, then coolness. Heaviness, then lightness.',
      'Rest in the stillness that’s left. Let it hold you.',
      'Say your wish to yourself again.',
      'Begin to notice the room: the sounds, the air on your skin.',
      'Move slowly, roll to one side, and sit up when you’re ready.',
    ],
  },
];

export const scriptOf = (id: unknown): Script | null => SCRIPTS.find((s) => s.id === id) ?? null;

/** Seconds each line fades in (and out). */
export const LINE_FADE_MS = 3000;
/** The shortest and longest a line rests on the screen. */
const MIN_SLOT = 10_000;
const MAX_SLOT = 120_000;
/** An open-ended sit's lines come this far apart. */
const OPEN_SLOT = 45_000;

/** How long each line has, for a sit this long (null: open-ended). The lines take up the first nine tenths, leaving quiet at the end. */
export function lineSlotMs(lines: number, sitMs: number | null): number {
  if (sitMs === null) return OPEN_SLOT;
  return Math.max(MIN_SLOT, Math.min(MAX_SLOT, (sitMs * 0.9) / Math.max(1, lines)));
}

/**
 * Which line shows `sitMs` into the sit (of `lengthMs`, or null when
 * open-ended), and how clearly (0 to 1): each fades in at its turn and out
 * just before the next; the last stays. Before the sit begins, nothing.
 */
export function lineAt(script: Pick<Script, 'lines'>, sitMs: number, lengthMs: number | null): { index: number; opacity: number } | null {
  if (sitMs < 0 || !script.lines.length) return null;
  const slot = lineSlotMs(script.lines.length, lengthMs);
  const index = Math.min(script.lines.length - 1, Math.floor(sitMs / slot));
  const into = sitMs - index * slot;
  const fadeIn = Math.min(1, into / LINE_FADE_MS);
  const last = index === script.lines.length - 1;
  const fadeOut = last ? 1 : Math.max(0, Math.min(1, (slot - into) / LINE_FADE_MS));
  return { index, opacity: Math.round(Math.min(fadeIn, fadeOut) * 100) / 100 };
}

// ─── Presets for before a ritual ─────────────────────────────────────────

export type PresetId = 'ground' | 'clearing';
export const PRESETS: { id: PresetId; label: string; minutes: number; script: ScriptId; line: string }[] = [
  { id: 'ground', label: 'Ground & centre', minutes: 3, script: 'grounding', line: 'Three minutes: roots down, light down, steady at the heart.' },
  { id: 'clearing', label: 'Clearing', minutes: 5, script: 'clearing', line: 'Five minutes: breathe out the day and set a clear space.' },
];
export const presetOf = (id: unknown) => PRESETS.find((p) => p.id === id) ?? null;

/** A preset's plan: its length, a bell to begin and to end, nothing between. */
export function presetPlan(id: PresetId): SitPlan {
  const p = presetOf(id)!;
  return cleanPlan({ minutes: p.minutes, settle: 0, warm: 0, startBell: true, endBell: true, every: 0 });
}

/** A preset as a sit's route params (the plan, its script and kind). */
export function presetParams(id: PresetId): Record<string, string> {
  const p = presetOf(id)!;
  return { ...planParams(presetPlan(id)), script: p.script, kind: scriptOf(p.script)!.kind, preset: p.id };
}
