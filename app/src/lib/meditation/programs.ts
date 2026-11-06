// Binaural PROGRAMS: sessions that change over time. A program is a run of
// stages, each with a beat that ramps (or holds) from one frequency to
// another, a carrier tone (the base pitch: a planetary or chakra fork, a
// Solfeggio tone, the OM pitch, or your own), an optional bed (pink noise,
// rain, fire, a drone, bowls, forks, a drum at journey tempo), timed text
// cues and strikes, and, for the deep ones, a return ramp to waking (alpha
// up to low beta) at the end. The same program stretches to any of its
// lengths. It is played through the Listen engine (sound.ts frameAt, synth
// binaural loops): the beat is moved along a 0.5 Hz lattice and the two
// nearest steps are crossfaded, so the ramp is smooth. Honest framing: these
// are aids to relaxation, focus and intention; the research is mixed.
// Pure, so it can be tested; played by components/meditation/sitSound.

import { COSMIC, CHAKRA, CLEARING_HZ, OM_HZ, SOLFEGGIO, WEIGHTED_HZ, forkKey } from './forks.ts';
import { DEFAULT_MIX, LAYERS, bowlKey, bowlStrikes, cleanMix, frameAt, levelOf, masterAt, strikesDue, type LayerId, type SoundMix, type Strike, type Voice } from './sound.ts';
import { DEFAULT_PLAN, type SitPlan } from './timer.ts';

const MIN = 60_000;

export type ProgramGroup = 'everyday' | 'craft' | 'devotional';
export const GROUPS: { id: ProgramGroup; label: string; line: string }[] = [
  { id: 'everyday', label: 'Everyday', line: 'For ordinary days: calm, focus, rest, protection and intention.' },
  { id: 'craft', label: 'Craft & spirit', line: 'Longer inward work: journeying, scrying, dreaming and the astral.' },
  { id: 'devotional', label: 'Devotional', line: 'Sit with a deity you already honour, and leave an offering.' },
];

/** A strike on a cue: 'bell' (a bright bowl), 'bowl:N' (the chakra bowl N, 0 to 6) or 'fork:HZ'. */
export type CueStrike = string;
export type Cue = { /** Fraction of the whole (0 to 1). */ at?: number; /** Or minutes before the end. */ fromEnd?: number; text: string; strike?: CueStrike };
/** Beat points spread evenly over a stage; 'H' is the program's hold beat. */
export type Beat = number | 'H';
export type Stage = { id: string; label: string; weight: number; beat: Beat[]; carrier?: string; fixedMin?: number };

export type Program = {
  id: string;
  group: ProgramGroup;
  title: string;
  /** What it is for, in a sentence. */
  line: string;
  /** How to use it. */
  how: string;
  lengths: number[];
  length: number;
  carrier: string;
  /** Carriers you may swap in (the first is the default). */
  carriers: string[];
  /** The beat the long middle holds. */
  hold: number;
  stages: Stage[];
  bed: Partial<Record<LayerId, number>>;
  key?: string;
  tempo?: number;
  bowlSet?: SoundMix['bowlSet'];
  bowlEvery?: number;
  forkSet?: SoundMix['forkSet'];
  cues: Cue[];
  /** Ends with the return to waking (alpha to low beta). */
  deep?: boolean;
  /** Fades to nothing over the last minutes (sleep). */
  fadeMin?: number;
  /** The breathing pacer is on by default. */
  breath?: boolean;
  /** An alternative hold (Centering at the Schumann resonance). */
  alt?: { label: string; hold: number };
  /** 4096 Hz clearing forks can be struck at three points. */
  forks?: boolean;
  /** The drum can be turned on over it. */
  drumOption?: boolean;
  /** For night use, with a wake-back-to-bed alarm. */
  wbtb?: boolean;
  /** The deity, for devotional programs: name, Library key, framing and offering. */
  deity?: { name: string; key: string; framing: string; offering: string };
  /** The path the deity belongs to, so a closed tradition can be left out. */
  tradition?: string;
  /** Resolved from the moment: the planetary hour, or your patron. */
  dynamic?: 'hour' | 'patron';
  /** Where it belongs on the moon and sabbat kits, for linking. */
  tags?: string[];
};

// ─── Carriers ─────────────────────────────────────────────────────────────

export type CarrierChoice = { id: string; label: string; hz: number; line: string };
const fromFork = (prefix: string, f: { id: string; label: string; hz: number[]; line: string }): CarrierChoice => ({ id: prefix + f.id, label: f.label, hz: f.hz[0], line: f.line });
/** Every carrier you can choose, from the tuning forks module and the OM, grounding and Schumann-adjacent tones. */
export const CARRIER_CHOICES: CarrierChoice[] = [
  { id: 'om', label: 'OM 136.1 Hz', hz: OM_HZ, line: 'The Earth-year pitch, often used to centre.' },
  { id: 'weighted', label: 'Grounding 128 Hz', hz: WEIGHTED_HZ, line: 'Low and steady, the weighted fork’s pitch.' },
  ...COSMIC.filter((f) => f.id !== 'earth-year').map((f) => fromFork('', f)),
  ...SOLFEGGIO.map((f) => fromFork('sf', f)),
  ...CHAKRA.map((f) => fromFork('', f)),
];
/** Carrier ids are the forks' own ids; Solfeggio ones are "sf174". A bare number is your own, in Hz. */
export function carrierHz(id: string): number {
  const found = CARRIER_CHOICES.find((c) => c.id === id);
  if (found) return found.hz;
  const n = Number(id);
  return Number.isFinite(n) && n >= 60 && n <= 1000 ? n : OM_HZ;
}
export const carrierLabel = (id: string) => CARRIER_CHOICES.find((c) => c.id === id)?.label ?? `${Math.round(carrierHz(id) * 10) / 10} Hz`;

// ─── The wording ──────────────────────────────────────────────────────────

export const PROGRAM_HONESTY =
  'Binaural beats are used here as an aid to relaxation, focus and intention. Studies of what they do are mixed: some find calming effects, some find none, and none of this is medical treatment. If it helps, good; if it does nothing for you, you have lost nothing.';
export const PROGRAM_NOTICE =
  'Before the first one: you need headphones for the binaural effect, since each ear must hear its own tone. Never play these while driving or operating machinery. If you have epilepsy or any seizure disorder, speak to your doctor first. The deeper programs always end by bringing you back up to waking; do not skip that part.';
export const PROGRAM_NOTICE_KEY = 'meditation.programs.noticed';

// ─── Building blocks for the data below ───────────────────────────────────

const st = (id: string, label: string, weight: number, beat: Beat[], extra: Partial<Stage> = {}): Stage => ({ id, label, weight, beat, ...extra });
/** The return to waking: from the hold up through alpha to low beta, over a fixed few minutes. */
const back = (min: number, to = 13, carrier?: string): Stage => st('return', 'Coming back', 1, ['H', 10, to], { fixedMin: min, ...(carrier ? { carrier } : {}) });
const gentleBack = (min: number, to = 12): Stage => st('return', 'Coming back', 1, ['H', to], { fixedMin: min });
const c = (at: number, text: string, strike?: CueStrike): Cue => ({ at, text, ...(strike ? { strike } : {}) });
const e = (fromEnd: number, text: string, strike?: CueStrike): Cue => ({ fromEnd, text, ...(strike ? { strike } : {}) });

const BED = { pink: { pink: 0.3 }, rain: { rain: 0.4, pink: 0.1 } };

type Base = Omit<Program, 'length' | 'carriers' | 'cues'> & { cues?: Cue[]; length?: number; carriers?: string[] };
const P = (p: Base): Program => ({ ...p, length: p.length ?? p.lengths[Math.floor((p.lengths.length - 1) / 2)], carriers: p.carriers ?? [p.carrier], cues: p.cues ?? [] });

/** A devotional program: arrive, descend into theta, hold, return; the deity's own cues. */
function deity(o: {
  id: string; title: string; name: string; key: string; tradition: string; line: string; framing: string; offering: string; how: string;
  carrier: string; carriers?: string[]; hold: number; drone?: string; bowlSet?: Program['bowlSet']; bowlEvery?: number; bed: Program['bed']; cues: Cue[]; lengths?: number[]; extra?: Partial<Base>;
}): Program {
  return P({
    id: o.id, group: 'devotional', title: o.title, line: o.line, how: o.how, lengths: o.lengths ?? [15, 20, 30, 45], carrier: o.carrier, carriers: o.carriers, hold: o.hold, deep: o.hold < 8,
    stages: [st('arrive', 'Arriving', 2, [11, 10]), st('descend', 'Settling', 3, [10, 'H']), st('hold', 'With them', 6, ['H', 'H']), o.hold < 8 ? back(4) : gentleBack(3)],
    bed: o.bed, key: o.drone, bowlSet: o.bowlSet, bowlEvery: o.bowlEvery, cues: o.cues, deity: { name: o.name, key: o.key, framing: o.framing, offering: o.offering }, tradition: o.tradition, ...o.extra,
  });
}

// ─── Everyday ─────────────────────────────────────────────────────────────

const EVERYDAY: Program[] = [
  P({
    id: 'grounding', group: 'everyday', title: 'Grounding', line: 'Come down out of your head and into your body and the ground under you.',
    how: 'Sit or lie with your feet or back supported. The beat slides from a relaxed alpha to a low, steady 8 Hz and rests there, over a low drone. Let your breath sink; nothing else is asked. Good after a long day, before ritual, or when you feel scattered.',
    lengths: [10, 15, 20], carrier: 'weighted', carriers: ['weighted', 'om', 'saturn'], hold: 8, bed: { brown: 0.35, drone: 0.25 }, key: 'C',
    stages: [st('arrive', 'Arriving', 2, [11, 10]), st('settle', 'Settling', 4, [10, 'H']), st('hold', 'Rooted', 8, ['H', 'H']), gentleBack(2, 11)],
    cues: [c(0.02, 'Feel the places where you are held: seat, back, feet.'), c(0.2, 'Let your weight go down into whatever is under you. You do not have to hold yourself up.'), c(0.42, 'Breathe out slowly, and imagine roots or warmth running from your base into the ground.'), c(0.65, 'Whatever you are carrying, let the earth take some of its weight.'), e(1.8, 'Come back gently. Keep a little of that heaviness with you.')],
  }),
  P({
    id: 'centering', group: 'everyday', title: 'Centering', line: 'Find your middle: steady, open and awake, at 10 Hz or the Schumann 7.83 Hz.',
    how: 'A plain alpha session under the OM pitch. Switch on the Schumann option and the held beat becomes 7.83 Hz, the Earth’s lowest electromagnetic resonance, often used in practice as a symbol of being in tune with the planet. That tie to the brain is a modern idea, not an established one.',
    lengths: [5, 10, 15, 20], carrier: 'om', carriers: ['om', 'earth-day', 'sun'], hold: 10, alt: { label: 'Schumann 7.83 Hz', hold: 7.83 }, bed: BED.pink,
    stages: [st('arrive', 'Arriving', 2, [13, 'H']), st('hold', 'Centred', 8, ['H', 'H']), gentleBack(1.5, 12)],
    cues: [c(0.03, 'Find the middle of your body, somewhere between your navel and your heart.'), c(0.3, 'Breathe in as if to that point, and out from it. Let the attention rest there.'), c(0.6, 'If you are pulled off centre, no matter. Return, as often as you need to.'), e(1.2, 'Open your attention outwards again, keeping the centre.', 'bell')],
  }),
  P({
    id: 'anxiety', group: 'everyday', title: 'Anxiety easing', line: 'Step down gently from tense and busy to calm, with a breathing pacer.',
    how: 'The beat steps down from 16 Hz (alert, a little wired) through 13 and 11 to a settled 9 Hz, a few minutes at each step. The circle on screen expands and softens at six breaths a minute; breathe with it, or ignore it. This is for ordinary worry and stress, not a treatment: if anxiety is severe or constant, please speak to a doctor or a helpline.',
    lengths: [10, 15, 20, 30], carrier: 'sf174', carriers: ['sf174', 'moon', 'weighted'], hold: 9, breath: true, bed: { rain: 0.3, pink: 0.15 },
    stages: [st('meet', 'Meeting it', 2, [16, 16, 14]), st('ease', 'Easing', 2, [13, 13, 12]), st('soften', 'Softening', 2, [11, 11, 10]), st('settle', 'Settled', 3, [9.5, 'H']), gentleBack(1.5, 11)],
    cues: [c(0.02, 'Breathe with the circle if you like. Out is longer than in.'), c(0.1, 'Name what you feel, in one word. You do not have to fix it yet.'), c(0.28, 'Let your shoulders drop an inch. Unclench your jaw.'), c(0.5, 'You are safe in this minute. Feel your feet, your hands.'), c(0.75, 'Nothing needs solving now. Let the breath rock you.'), e(1.4, 'Notice the calmer place you have reached. You can come back to it with a few slow breaths.')],
  }),
  P({
    id: 'clearing', group: 'everyday', title: 'Clearing & cleansing', line: 'Rise to bright, alert clarity after a heavy day, a quarrel or a long illness in the house.',
    how: 'Unlike most, this one climbs: from alpha up through 12 and 14 to a clear 16 Hz, over the 741 Hz tone (often given as cleansing). Turn on the 4096 Hz option and a bright fork is struck three times, the tone used to clear stones and space. Do it by an open window if you can, and finish by washing your hands.',
    lengths: [10, 15, 20], carrier: 'sf741', carriers: ['sf741', 'sf417', 'mercury'], hold: 16, forks: true, bed: { fire: 0.2, pink: 0.12 },
    stages: [st('arrive', 'Arriving', 2, [10, 11]), st('rise', 'Rising', 5, [11, 14]), st('clear', 'Clear', 4, [14, 'H']), gentleBack(1.5, 13)],
    cues: [c(0.02, 'Breathe out all that is stale. Let it go with the exhale.'), c(0.25, 'Picture a clean light starting at your feet and rising, pushing out anything dull.'), c(0.5, 'Sweep it over your arms, your face, the room around you.'), c(0.75, 'Bright, plain and clear. Nothing here that is not yours.'), e(1.2, 'Stretch. Shake out your hands. Open a window if you can.')],
  }),
  P({
    id: 'focus', group: 'everyday', title: 'Focus & study', line: 'A steady low-beta bed for reading, writing or work, under the Mercury tone.',
    how: 'The beat lifts into a steady 14 Hz (low beta) and stays there, quietly, under soft noise. Choose one task before you press Play. A cue near the start asks for your intention; there is little else, so as not to interrupt. If it fatigues you, use a shorter length or stop.',
    lengths: [25, 45, 60, 90], length: 45, carrier: 'mercury', carriers: ['mercury', 'earth-day', 'sun'], hold: 14, bed: { pink: 0.3, brown: 0.12 },
    stages: [st('arrive', 'Settling in', 1.5, [10, 12]), st('focus', 'Focused', 10, [13, 'H', 'H']), gentleBack(2, 11)],
    cues: [c(0.01, 'Choose one task. Say it to yourself: this, for this long.'), c(0.5, 'Halfway. If your attention has drifted, you can simply take it back.'), e(2.2, 'Wrap up where you are. Write down where you will start next time.', 'bell')],
  }),
  P({
    id: 'sleep', group: 'everyday', title: 'Sleep', line: 'Theta into delta, then fading out, so you can drop off with it.',
    how: 'Lie in bed with headphones you can sleep in, or a speaker low on the bedside. The beat falls from alpha to 6, 4, 2 Hz and the whole sound fades away over the last quarter of an hour, with no waking at the end. There is no return step, by design. If you are awake after, that is fine; rest is still rest.',
    lengths: [20, 30, 45, 60, 90], length: 45, carrier: 'sf174', carriers: ['sf174', 'om', 'moon'], hold: 2, fadeMin: 15, bed: { brown: 0.35, rain: 0.2 },
    stages: [st('arrive', 'Winding down', 2, [10, 8]), st('theta', 'Drifting', 3, [8, 5]), st('delta', 'Deep rest', 5, [5, 2.5, 'H'])],
    cues: [c(0.02, 'Let your body be heavy. There is nothing left to do today.'), c(0.12, 'Count your breaths backwards from twenty. If you lose count, begin again.'), c(0.3, 'Let the thoughts go past like clouds. You do not have to follow any of them.')],
  }),
  P({
    id: 'protection', group: 'everyday', title: 'Protection', line: 'A steady alpha for a warding visualisation, under the Mars or Saturn tone.',
    how: 'Steady 10 Hz alpha with a low drone and the faintest crackle of fire. The cues walk you through a simple warding: a circle of light, a boundary, a close. It is a visualisation to steady yourself, not a guarantee of anything. Use Mars for a bright, active ward, or Saturn for a firm, quiet boundary.',
    lengths: [10, 15, 20], carrier: 'mars', carriers: ['mars', 'saturn'], hold: 10, bed: { fire: 0.15, drone: 0.2, pink: 0.12 }, key: 'D',
    stages: [st('arrive', 'Arriving', 2, [12, 'H']), st('ward', 'Warding', 8, ['H', 'H']), gentleBack(1.5, 12)],
    cues: [c(0.04, 'Stand or sit tall. Feel the ground hold you, and your spine straight.'), c(0.2, 'Picture a point of light in your chest, warm and bright. Let it grow outwards.'), c(0.4, 'See it open into a circle all around you, above and below: a sphere you stand in the middle of.', 'bell'), c(0.6, 'At its edge, set a boundary of whatever you like: flame, mirror, stone, thorn. Nothing harmful comes in; what is yours stays.'), c(0.8, 'Say in your own words: I am held, and I am well guarded.'), e(1.3, 'Draw a deep breath and seal it with a touch to your heart. Open your eyes when you are ready.', 'bell')],
  }),
  P({
    id: 'success', group: 'everyday', title: 'Success & confidence', line: 'Alpha lifting into low beta: calm that turns to readiness, under the Sun or Jupiter tone.',
    how: 'You begin relaxed and end up bright. The beat rises from 10 to 14 Hz, so use it before an interview, a pitch, a performance or a hard conversation. The cues ask you to rehearse it going well. This is mental rehearsal, which has some research behind it, not a spell guaranteed to work.',
    lengths: [10, 15, 20], carrier: 'sun', carriers: ['sun', 'jupiter'], hold: 13, bed: { pink: 0.22, drone: 0.15 }, key: 'D',
    stages: [st('settle', 'Settling', 3, [11, 10]), st('rehearse', 'Rehearsing', 4, [10, 11]), st('rise', 'Rising', 4, [11, 'H']), st('ready', 'Ready', 2, ['H', 14])],
    cues: [c(0.03, 'Breathe slowly. Let go of any need to get this perfect.'), c(0.2, 'See the situation ahead. Where are you? Who is there? How do you carry yourself?'), c(0.4, 'Watch yourself do it well: steady voice, clear words, easy shoulders.'), c(0.6, 'Feel what that is like in your body. Remember that feeling; you can call it back.'), c(0.8, 'Build it up. Brighter, taller, warmer. You are ready.'), e(0.5, 'Open your eyes. Go.', 'bell')],
  }),
  P({
    id: 'ancestors', group: 'everyday', title: 'Ancestor work', line: 'Theta for sitting with the beloved dead, with the way opened at the start and closed at the end.',
    how: 'Prepare a candle, water and a photograph or name. Under the OM tone (or Saturn, the old ruler of time and the dead) the beat sinks to theta. A bell opens the way, you sit, and a bell closes it, then you are brought back. Honour only your own beloved dead; do not call up strangers. If grief rises, let it; stop if it is too much.',
    lengths: [15, 20, 30, 45], carrier: 'om', carriers: ['om', 'saturn'], hold: 6, deep: true, bed: { drone: 0.25, fire: 0.1, pink: 0.1 }, key: 'D', tags: ['samhain'],
    stages: [st('arrive', 'Arriving', 2, [11, 10]), st('descend', 'Settling', 3, [10, 'H']), st('hold', 'Sitting with them', 7, ['H', 'H']), back(4)],
    cues: [c(0.02, 'Light your candle. Say their name, or the names of those you want to remember.'), c(0.09, 'If it is right, say: I open the way for my beloved dead who wish to come, and for none else.', 'bell'), c(0.3, 'Sit with them. Say what you wish to say. Then be quiet, and listen with the whole body.'), c(0.55, 'Notice any feeling, picture or memory that arrives. You do not have to explain it.'), e(5.3, 'Tell them what you are grateful for. Offer a few words of love.'), e(4.6, 'Say: thank you for coming. I close the way. Go in peace and rest well. Nothing follows me.', 'bell'), e(2.5, 'Feel the room, your body, the day. You are here, and it is now.'), e(1.0, 'Wriggle your fingers. Take a full breath. Eat or drink something when you are done.')],
  }),
  P({
    id: 'abundance', group: 'everyday', title: 'Abundance', line: 'Gratitude and receiving, under the Jupiter tone (growth, generosity and good fortune).',
    how: 'A soft alpha session with a bowl struck now and then. Start by counting what you already have; then picture, without grasping, what you would like to grow. It supports a mindset of noticing and receiving, and it works best next to practical steps: it does not make money appear.',
    lengths: [10, 15, 20], carrier: 'jupiter', carriers: ['jupiter', 'sun', 'venus'], hold: 9.5, bed: { pink: 0.2, bowls: 0.35 }, bowlSet: '432', bowlEvery: 60,
    stages: [st('arrive', 'Arriving', 2, [12, 10]), st('hold', 'Receiving', 8, ['H', 'H']), gentleBack(1.5, 12)],
    cues: [c(0.04, 'Think of three things you have right now that you would miss if they were gone.'), c(0.25, 'Let thanks warm your chest. Gratitude is the soil.'), c(0.5, 'Now picture one thing you would like to grow. Make it small enough to be real.'), c(0.7, 'See yourself receiving it with open hands. Not grabbing, only open.'), e(1.3, 'Decide one practical step you will take today. Then open your eyes.', 'bell')],
  }),
  P({
    id: 'love', group: 'everyday', title: 'Love & self-love', line: 'Warmth and kindness towards yourself and those you love, under the Venus tone.',
    how: 'Hold a hand to your heart. The cues are loving-kindness phrases, a long-practised meditation: first to yourself, then to someone dear, then outwards. It is a gentle alpha session. If self-kindness feels hard, that is common; stay with the easiest person and go slowly.',
    lengths: [10, 15, 20], carrier: 'venus', carriers: ['venus', 'sf528', 'moon'], hold: 9, bed: { pink: 0.18, bowls: 0.3 }, bowlSet: 'chakras', bowlEvery: 60,
    stages: [st('arrive', 'Arriving', 2, [12, 10]), st('hold', 'Warmth', 8, ['H', 'H']), gentleBack(1.5, 12)],
    cues: [c(0.04, 'Place a hand over your heart. Feel its warmth and its beat.'), c(0.2, 'Say to yourself: may I be safe. May I be well. May I be at ease.'), c(0.45, 'Picture someone you love. Say to them: may you be safe. May you be well. May you be at ease.'), c(0.68, 'Let the circle widen: friends, neighbours, those you find difficult. May you all be at ease.'), e(1.3, 'Bring it back to yourself. Whatever you needed to hear, say it once more.', 'bell')],
  }),
  P({
    id: 'healing', group: 'everyday', title: 'Healing rest', line: 'A long, soft rest for body and mind, offered as comfort rather than treatment.',
    how: 'For days when you are unwell, worn out, grieving or simply need to stop. It slows to a gentle 7 Hz over rain and the 285 Hz tone (often given as renewal and rest). It makes no medical claims and does not replace care from a doctor; it is only a kind place to lie down.',
    lengths: [15, 20, 30, 45], carrier: 'sf285', carriers: ['sf285', 'moon', 'sf174'], hold: 7, bed: { rain: 0.35, brown: 0.2 },
    stages: [st('arrive', 'Arriving', 2, [11, 10]), st('descend', 'Softening', 3, [10, 'H']), st('rest', 'Resting', 7, ['H', 'H']), back(3, 12)],
    cues: [c(0.03, 'You do not have to do anything. Being here is enough.'), c(0.2, 'Let your body be held. Wherever there is discomfort, let your breath go near it, gently, without pushing.'), c(0.5, 'Rest is work too. You are allowed to stop.'), c(0.75, 'Imagine warm light resting on you like a blanket.'), e(2.5, 'Slowly come back. Take your time. Have something warm to drink.')],
  }),
  P({
    id: 'shadow', group: 'everyday', title: 'Shadow work', line: 'Theta for looking at what you usually avoid, with a deliberate grounding return.',
    how: 'Choose one question beforehand (for example: what am I avoiding?). The beat sinks to theta under the Saturn tone, you ask and you wait for what comes, then the return switches to the 128 Hz grounding pitch to bring you down into your body. Keep a notebook handy. Shadow work can bring up hard material: you can open your eyes at any moment, and if it is heavy, speak to someone you trust or a counsellor.',
    lengths: [15, 20, 30, 45], carrier: 'saturn', carriers: ['saturn', 'moon', 'om'], hold: 6, deep: true, bed: { drone: 0.25, pink: 0.12 }, key: 'C', tags: ['moon-dark'],
    stages: [st('arrive', 'Arriving', 2, [11, 10]), st('descend', 'Going in', 3, [10, 'H']), st('hold', 'Looking', 7, ['H', 'H']), st('ground', 'Grounding', 1, ['H', 10, 13], { fixedMin: 5, carrier: 'weighted' })],
    cues: [c(0.03, 'Ask your question once, clearly. Then let go of the need for an answer.'), c(0.25, 'Something may rise: a face, a feeling, a memory. Look at it kindly. You are not in danger here.'), c(0.5, 'Ask it what it needs. Do not argue with the answer.'), e(6.6, 'Thank what has shown itself. You do not have to deal with it all now.', 'bell'), e(4.5, 'Begin to ground. Feel your feet, your hands, the weight of your body.'), e(2.6, 'Name five things you can see in the room, and four you can touch.'), e(1.0, 'Take a deep breath. Open your eyes. Write down what came, plainly, before it fades.', 'bell')],
  }),
  P({
    id: 'creativity', group: 'everyday', title: 'Creativity', line: 'The alpha-theta border, where ideas loosen, under the Venus or Mercury tone.',
    how: 'The beat hovers around 7 to 8 Hz, the edge between relaxed and drifting. Have something to write or draw on within reach. Think of a project or a question, then let images come without judging them. Come back and capture what you can before it fades.',
    lengths: [15, 20, 30], carrier: 'venus', carriers: ['venus', 'mercury', 'moon'], hold: 7.5, bed: { pink: 0.18, rain: 0.2 },
    stages: [st('arrive', 'Arriving', 2, [11, 10]), st('border', 'The border', 8, [9, 'H', 8, 'H']), gentleBack(2.5, 13)],
    cues: [c(0.03, 'Hold your project or question lightly in mind, like a stone in an open hand.'), c(0.25, 'Let pictures, words and colours drift past. Do not choose between them yet.'), c(0.55, 'If a thread pulls at you, follow it a little way and see where it goes.'), e(2.2, 'Come up slowly, holding on to one or two of the best things you saw.'), e(0.8, 'Open your eyes and write or draw straight away, without editing.', 'bell')],
  }),
];

// ─── Craft & spirit ───────────────────────────────────────────────────────

const CRAFT: Program[] = [
  P({
    id: 'obe', group: 'craft', title: 'Out-of-body & astral', line: 'A long relaxation down to about 4 Hz, a long hold, and a full return.',
    how: 'Long and slow by design. Lie flat, warm, headphones on, in the dark. The first half relaxes the body in stages down towards 4 Hz; then a long hold in the borderland between waking and sleep; then eight minutes bringing you fully back. Many people simply fall asleep, and that is fine. Experiences of leaving the body are reported but not scientifically established, and nothing here promises one. The return matters: do not stop it early.',
    lengths: [45, 60, 90], carrier: 'om', carriers: ['om', 'moon', 'weighted'], hold: 4, deep: true, bed: { pink: 0.25, drone: 0.18 }, key: 'C',
    stages: [st('relax', 'Relaxing', 4, [10, 8]), st('deepen', 'Deepening', 4, [8, 6, 4.5]), st('hold', 'The borderland', 8, [4.5, 'H', 'H', 4.5]), back(8)],
    cues: [c(0.02, 'Lie flat and still. Take three slow breaths, and let each out with a sigh.'), c(0.07, 'Move your attention through your body: feet, calves, thighs. Let each one go heavy and warm.'), c(0.15, 'Belly, chest, hands, arms, shoulders, neck, face. Let go of each in turn.'), c(0.3, 'Your body is asleep. Your mind is awake and quiet.'), c(0.38, 'You may notice buzzing, vibration or floating. Do not grab at it. Stay calm and let it come and go.'), c(0.5, 'Hold a simple intention: to rise gently out of your body, safe and free. Or simply to watch the dark behind your eyes.'), c(0.65, 'If you drift, drift. If you wake, return to the intention. There is no failing here.'), e(8.7, 'Begin your return. Let your intention go. Feel your body again, heavy and whole.', 'bell'), e(6.0, 'Feel your feet and your hands. You are back in your own body, safe in your bed or chair.'), e(3.0, 'Take a deeper breath. Begin to move your fingers and toes.'), e(0.8, 'Stretch. Open your eyes. Sit up slowly and have some water.', 'bell')],
  }),
  P({
    id: 'lucid', group: 'craft', title: 'Lucid dreaming & dream recall', line: 'Night use: a settling-in with dream intentions, and an optional wake-back-to-bed alarm.',
    how: 'Play it as you go to bed. It settles you to a theta-delta drift with the intention to notice that you are dreaming and to remember your dreams, then fades. Switch on the wake-back-to-bed alarm and your phone will wake you after the hours you choose, for the classic technique of waking, recalling, and returning to sleep with the intention. Keep a notebook and write before you move. Lucid dreaming is reported but varies hugely from person to person.',
    lengths: [20, 30, 45], carrier: 'moon', carriers: ['moon', 'sf174', 'om'], hold: 4, wbtb: true, fadeMin: 12, bed: { brown: 0.25, rain: 0.2 },
    stages: [st('arrive', 'Winding down', 2, [10, 7]), st('theta', 'Drifting', 3, [7, 5]), st('delta', 'Sleeping', 4, [5, 'H', 3])],
    cues: [c(0.02, 'Tonight you will notice when you are dreaming, and you will remember.'), c(0.14, 'Say it a few times in your own words: I notice I am dreaming. I remember my dreams.'), c(0.3, 'Picture your hands in a dream. Look at them. Ask: am I dreaming?'), c(0.5, 'Let go now. Let the thought of the dream carry you down.')],
  }),
  P({
    id: 'divination', group: 'craft', title: 'Divination & scrying', line: 'A receptive 6 Hz to drop into before cards, a mirror, a bowl or a pendulum.',
    how: 'The beat settles at 6 Hz, the lower edge of theta, under the Moon tone, with a few bell-like strikes. Have your tarot, pendulum or mirror ready and your question clear. Play it first, then read as it brings you back to a clear alpha, so you are receptive but not asleep. Also found in the Psychic drop-in, before each exercise.',
    lengths: [5, 10, 15, 20], length: 10, carrier: 'moon', carriers: ['moon', 'sf852', 'venus'], hold: 6, bed: { pink: 0.15, bowls: 0.25 }, bowlSet: '432', bowlEvery: 90, tags: ['moon-full'],
    stages: [st('arrive', 'Arriving', 2, [11, 10]), st('descend', 'Softening', 3, [10, 8, 'H']), st('hold', 'Receptive', 5, ['H', 'H']), st('wake', 'Clearing', 1, ['H', 10, 11], { fixedMin: 1.5 })],
    cues: [c(0.04, 'Hold your question in mind. Say it once, in a sentence, then let it go.'), c(0.3, 'Soften your gaze. Whatever you will look at, look without trying.'), c(0.6, 'Images, words or hunches may come. Let them. Do not judge them yet.'), e(1.4, 'Come up to clear attention. Your question is held. Open your eyes to your cards, glass or pendulum.', 'bell')],
  }),
  P({
    id: 'trance', group: 'craft', title: 'Trance & journeying', line: 'Theta at 4 to 4.5 Hz, with an optional frame drum at journey tempo.',
    how: 'The beat sinks to 4.5 Hz, matching the pulse (four to four-and-a-half beats a second) long used in shamanic-style journey drumming. Turn on the drum and it plays at that tempo, with the callback pattern near the end to call you home. Set an intention or a destination first, in your own tradition and with respect to closed ones. A full return follows.',
    lengths: [20, 30, 45, 60], carrier: 'om', carriers: ['om', 'saturn', 'moon'], hold: 4.5, deep: true, drumOption: true, tempo: 4.5, bed: { pink: 0.12, drone: 0.2 }, key: 'D',
    stages: [st('arrive', 'Gathering', 2, [11, 10]), st('descend', 'Descending', 3, [10, 7, 'H']), st('journey', 'The journey', 8, ['H', 'H']), back(4)],
    cues: [c(0.03, 'Hold your intention or the place you wish to go. Say it once to yourself.'), c(0.12, 'Find your way in: a hollow tree, a stair, a path down. Go through it.'), c(0.3, 'Walk on. Notice what you see, hear, smell. Ask what you came to ask.'), c(0.6, 'Whatever you meet, be curious and polite. You may leave at any time.'), e(5.3, 'Thank who you have met. Turn and go back the way you came.', 'bell'), e(3.0, 'Come up and out. Feel your body, the floor, the room.'), e(1.0, 'Take a deep breath. Move. Open your eyes. Write down what you saw.', 'bell')],
  }),
  P({
    id: 'planetary-hour', group: 'craft', title: 'Planetary hour', line: 'The carrier and the beat are chosen from the planetary hour you are in now.',
    how: 'Opens with the ruler of the current planetary hour (from your location, or the Craft timing page) and sets the carrier tone and a beat to suit it: Mars bright and active, Saturn slow and firm, and so on. The tie between planets and tones is a long-standing tradition, not a measurement. Open it where you can see the hour.',
    lengths: [10, 15, 20], carrier: 'sun', hold: 10, dynamic: 'hour', bed: { pink: 0.2, drone: 0.15 },
    stages: [st('arrive', 'Arriving', 2, [12, 10]), st('hold', 'In the hour', 8, ['H', 'H']), gentleBack(1.5, 12)],
  }),
  P({
    id: 'chakra', group: 'craft', title: 'Chakra climb', line: 'Seven stages rising from root to crown, each on its own carrier pitch and bowl.',
    how: 'Each chakra gets its own stage, carrier (256 Hz for the root up to 480 Hz for the crown, from the chakra fork set) and a bowl strike as you arrive. The beat stays in alpha, 8 to 10 Hz. Attend to the place in the body for each. A short step back to the root grounds you. The chakra system is a modern western reading of older Indian ideas; take it as a map, not an anatomy.',
    lengths: [14, 21, 28, 35], length: 21, carrier: 'root', carriers: ['root'], hold: 9, bed: { pink: 0.18 },
    stages: [
      st('root', 'Root', 1, [10, 9], { carrier: 'root' }), st('sacral', 'Sacral', 1, [9, 9], { carrier: 'sacral' }), st('solar', 'Solar plexus', 1, [9, 9], { carrier: 'solar' }), st('heart', 'Heart', 1, [9, 8.5], { carrier: 'heart' }),
      st('throat', 'Throat', 1, [8.5, 9], { carrier: 'throat' }), st('third-eye', 'Third eye', 1, [9, 9], { carrier: 'third-eye' }), st('crown', 'Crown', 1, [9, 8], { carrier: 'crown' }),
      st('return', 'Back to earth', 1, [8, 10, 12], { carrier: 'root', fixedMin: 2.5 }),
    ],
    cues: [
      c(0.0, 'Root: at the base of your spine. Safety, the body, belonging. Breathe into the ground.', 'bowl:0'), c(0.1, 'Sacral: below the navel. Feeling, pleasure, flow. Let it move like water.', 'bowl:1'), c(0.2, 'Solar plexus: above the navel. Will, confidence, warmth like a small sun.', 'bowl:2'),
      c(0.3, 'Heart: the centre of the chest. Love and grief together, open and held.', 'bowl:3'), c(0.4, 'Throat: voice and truth. Let it soften and open.', 'bowl:4'), c(0.5, 'Third eye: between the brows. Insight, imagination, quiet seeing.', 'bowl:5'),
      c(0.6, 'Crown: the top of the head. Stillness, the wider whole, spaciousness.', 'bowl:6'), e(2.3, 'Bring the light back down through each centre to your root. Feel the earth hold you.'), e(0.7, 'Rub your hands together. Open your eyes.', 'bell'),
    ],
  }),
];

// ─── Devotional ───────────────────────────────────────────────────────────

const DEV: Program[] = [
  deity({
    id: 'dev-hekate', title: 'Hekate', name: 'Hekate', key: 'hekate', tradition: 'hellenic', line: 'Dark moon and the crossroads, deep theta, three bell strikes.',
    framing: 'Hekate of the crossroads, keys and torches, honoured in antiquity at the dark of the moon with the Deipnon, a supper left out at the crossroads. A modern devotion, not a reconstruction.',
    offering: 'A candle, a key, garlic or honey, a little food left outside for those who have none.',
    how: 'Best on the dark moon or at the Deipnon, in the evening. Light a torch-candle and, if you have one, set a key before you. Three bell strikes mark the opening of the way, the meeting, and the closing. A full return ends it.',
    carrier: 'moon', carriers: ['moon', 'saturn'], hold: 5.5, bed: { drone: 0.2, fire: 0.1, pink: 0.1 }, drone: 'C',
    cues: [c(0.03, 'Light your candle. Say: Hekate, keeper of the keys, I stand at your crossroads and I ask you to be near.', 'bell'), c(0.22, 'See three roads before you under a dark sky. Where do you need to choose, or let go?'), c(0.45, 'She may come as a torch, a dog, a woman at the turn of the road. Greet her. Listen.', 'bell'), c(0.7, 'Ask what you need to put down at this crossroads tonight. Leave it there.'), e(5.0, 'Offer your thanks. Say: Hekate, I thank you. I leave your crossroads and walk on.', 'bell'), e(2.3, 'Come back through the dark: your feet, your breath, the room. Keep your candle until it is done.')],
    extra: { tags: ['moon-dark', 'deipnon'] },
  }),
  deity({
    id: 'dev-aphrodite', title: 'Aphrodite / Venus', name: 'Aphrodite', key: 'aphrodite', tradition: 'hellenic', line: 'Beauty, love and pleasure, on Venus’s tone.',
    framing: 'Aphrodite of the Greeks, Venus of the Romans: love, beauty, pleasure, the sea-foam and the dove. Honoured on Fridays, Venus’s day, in the old planetary tradition.',
    offering: 'Roses, honey, a sweet drink, a mirror polished, a kindness done to yourself.',
    how: 'Friday evening, a candle and flowers if you have them. Dress or sit as you would for someone you love. A gentle alpha session, nothing dark.',
    carrier: 'venus', carriers: ['venus', 'sf528'], hold: 9, bed: { pink: 0.15, bowls: 0.3 }, bowlSet: 'chakras', bowlEvery: 60,
    cues: [c(0.04, 'Light a rose-coloured candle. Say: Aphrodite, who loves laughter and beauty, be here with me.', 'bell'), c(0.3, 'Think of something you find beautiful. Let it fill you.'), c(0.55, 'Ask her what you can love in yourself more openly. Listen with warmth.'), e(1.8, 'Thank her. Keep a little of that tenderness in your day.', 'bell')],
    extra: { tags: ['love'] },
  }),
  deity({
    id: 'dev-hermes', title: 'Hermes / Thoth', name: 'Hermes', key: 'hermes', tradition: 'hellenic', line: 'Messenger and scribe: words, thresholds and learning, on Mercury’s tone.',
    framing: 'Hermes of the Greeks, guide at thresholds and bringer of messages, and Thoth of the Egyptians, scribe of the gods and keeper of writing. Joined by the Hellenistic Hermes Trismegistus, a later blend. Their link to Mercury is traditional.',
    offering: 'A little incense, honey, a coin at a crossroads, or a page of your best writing.',
    how: 'Wednesday, Mercury’s day, is the classic time. Have a notebook beside you. Ask for clarity in one matter of speech, study or travel.',
    carrier: 'mercury', carriers: ['mercury'], hold: 9, bed: { pink: 0.2, bowls: 0.2 }, bowlSet: '432', bowlEvery: 90,
    cues: [c(0.04, 'Say: Hermes, swift and clever, and Thoth, who keeps the record, be with me. Open my mind.', 'bell'), c(0.3, 'Hold the matter you need clarity on: a message, a decision, a thing to learn.'), c(0.6, 'Listen for a word, a line, an image. Write it down when you come back.'), e(1.8, 'Thank them. Your words go well.', 'bell')],
  }),
  deity({
    id: 'dev-brigid', title: 'Brigid', name: 'Brigid', key: 'brigid', tradition: 'celtic', line: 'The flame, the forge and the well, with a fire bed and the Sun’s tone.',
    framing: 'Brigid of the Irish, goddess and later saint: poetry, smithcraft, healing, the sacred flame and the holy well. Honoured at Imbolc, 1 and 2 February, in the Irish calendar and across the modern Wheel.',
    offering: 'A candle or an oil lamp, fresh water from a spring or tap, bread, a poem, a Brigid’s cross of rushes.',
    how: 'Light a real flame if you may, with water nearby. The recorded fire sounds under it. Imbolc is the natural time, but any day works.',
    carrier: 'sun', carriers: ['sun', 'venus'], hold: 9, bed: { fire: 0.4, pink: 0.1 },
    cues: [c(0.04, 'Light your flame. Say: Brigid, keeper of the flame, kindle me.', 'bell'), c(0.25, 'Look into the flame. Warmth, craft, and the first green under snow.'), c(0.5, 'At the well: cool water, clear and healing. Ask what is stirring in you.'), c(0.75, 'At the forge: what do you want to shape this season? Hold it in the heat of the flame.'), e(1.8, 'Thank her. Take a sip of water and bless yourself with it.', 'bell')],
    extra: { tags: ['imbolc'] },
  }),
  deity({
    id: 'dev-selene', title: 'Selene / Artemis', name: 'Artemis', key: 'artemis', tradition: 'hellenic', line: 'The moon and the wild, on the Moon tone.',
    framing: 'Selene, the Greek moon herself, and Artemis, huntress and lady of the wild places, who the later Greeks tied to the moon. Old and separate, joined in modern practice.',
    offering: 'Water in a silver or clear bowl under the moon, white flowers, milk, a night walk.',
    how: 'Under the full moon, or a clear night with the window open. Moonlit water in a bowl, if you have it.',
    carrier: 'moon', carriers: ['moon', 'sf852'], hold: 7, bed: { pink: 0.15, rain: 0.15 },
    cues: [c(0.04, 'Say: Selene, silver in the night, and Artemis of the wild wood, I greet you.', 'bell'), c(0.3, 'See the moon above, cool and clear, and its light on your face.'), c(0.55, 'Ask what wants to run free in you. Listen for the wild answer.'), e(2.5, 'Thank her. Look up at the moon, or imagine it, once more.', 'bell')],
    extra: { tags: ['moon-full'] },
  }),
  deity({
    id: 'dev-freyja', title: 'Freyja', name: 'Freyja', key: 'freyja', tradition: 'norse', line: 'Love, seiðr and the lady of the hall, on Venus’s tone.',
    framing: 'Freyja of the Norse, lady of love, desire, gold and seiðr (a kind of sorcery), who takes half the battle-slain to her hall Fólkvangr. Our sources are late (Eddas, written in Christian times) and the modern devotion is a reconstruction.',
    offering: 'Mead or a sweet drink, honey, amber, a flower, a pledge to value yourself.',
    how: 'Friday is hers in the northern week. A candle, a drink for her, and your own words. Honour her without leaning on any group’s claim to the tradition.',
    carrier: 'venus', carriers: ['venus', 'sun'], hold: 7.5, bed: { drone: 0.2, pink: 0.12, fire: 0.1 }, drone: 'D',
    cues: [c(0.04, 'Say: Freyja, lady of the hall, give me the courage to want what I want.', 'bell'), c(0.3, 'Picture her hall, gold and amber. Take the seat she offers.'), c(0.55, 'Ask what you have been undervaluing in yourself.'), e(4.5, 'Thank her. Pour your offering out onto the earth or a plant.', 'bell')],
  }),
  deity({
    id: 'dev-morrigan', title: 'The Morrígan', name: 'The Morrígan', key: 'morrigan', tradition: 'celtic', line: 'Sovereignty, battle and fate, deep and unflinching.',
    framing: 'The Morrígan of Irish myth: a goddess of battle, sovereignty and prophecy, often seen as crow or raven, sometimes as three sisters. Approach with respect; many devotees hold her demanding.',
    offering: 'Water or dark ale, a black feather found, a promise kept, an act of courage.',
    how: 'At dusk or in dark weather. Be honest with her, and do not offer what you cannot give. A full return grounds you after.',
    carrier: 'mars', carriers: ['mars', 'saturn'], hold: 6, bed: { drone: 0.25, fire: 0.1 }, drone: 'C',
    cues: [c(0.04, 'Say: Morrígan, great queen, I am here and I will speak truly.', 'bell'), c(0.3, 'Hear wings. Black on a grey sky. What battle is yours, and what is not?'), c(0.55, 'Ask what you must claim as your own sovereignty. Accept the answer, even if it is hard.'), e(5.0, 'Thank her. Promise nothing you cannot keep.', 'bell')],
  }),
  deity({
    id: 'dev-apollo', title: 'Apollo', name: 'Apollo', key: 'apollo', tradition: 'hellenic', line: 'Light, music, prophecy and healing, on the Sun’s tone.',
    framing: 'Apollo of the Greeks: god of light, song, prophecy (Delphi) and, with his son Asclepius, healing. The Romans took him over largely unchanged. His link to the sun is a later, partly Roman idea.',
    offering: 'A bay leaf, honey, a song or a poem, a clear morning, a hymn.',
    how: 'Morning or noon, facing the light. Sing or hum if you like. Ask for clarity, harmony or an honest hearing.',
    carrier: 'sun', carriers: ['sun', 'mercury'], hold: 10, bed: { pink: 0.15, bowls: 0.25 }, bowlSet: 'chakras', bowlEvery: 60,
    cues: [c(0.04, 'Say: Apollo, bright one, bring clear light to my mind.', 'bell'), c(0.3, 'Hear a lyre, or a clear voice. Let the sound set you in order.'), c(0.6, 'Ask what you need to see plainly. Listen for the answer in your own words.'), e(1.8, 'Thank him. Carry a little of that brightness into the day.', 'bell')],
  }),
  deity({
    id: 'dev-persephone', title: 'Persephone', name: 'Persephone', key: 'persephone', tradition: 'hellenic', line: 'Return, descent and the seed in the dark.',
    framing: 'Persephone of the Greeks, maiden and queen of the dead, who goes down each year and returns. Honoured in the Eleusinian Mysteries, whose secrets are unknown; the modern seasonal reading is just that.',
    offering: 'A pomegranate seed, grain, a spring flower, or something you let go of.',
    how: 'At the autumn or spring turn, or any time of change. A single seed or flower held in the hand.',
    carrier: 'venus', carriers: ['venus', 'moon', 'saturn'], hold: 6, bed: { drone: 0.2, rain: 0.15, pink: 0.1 }, drone: 'D',
    cues: [c(0.04, 'Say: Persephone, queen below and maiden above, I walk with you.', 'bell'), c(0.3, 'Go down with her into the quiet underworld. Rest there. Nothing is wasted in the dark.'), c(0.55, 'Plant in your mind a seed of what you want to keep. Watch it root.'), e(5.0, 'Thank her. Rise with her, bringing the seed up into the light.', 'bell')],
  }),
  deity({
    id: 'dev-isis', title: 'Isis', name: 'Isis', key: 'isis', tradition: 'egyptian', line: 'Mother, magician and keeper of names, on the Moon’s tone.',
    framing: 'Isis of Egypt: mother of Horus, lady of magic who learned Ra’s secret name, and in Roman times a goddess worshipped across the empire. Kemetic devotion today is lived by many; take care to honour that and credit it.',
    offering: 'Water, incense, flowers, bread, a lit lamp, a kindness to someone who is grieving.',
    how: 'At the new or full moon, or when you need to protect or restore something. A white cloth, a lamp, fresh water.',
    carrier: 'moon', carriers: ['moon', 'sf285'], hold: 6.5, bed: { drone: 0.2, pink: 0.12 }, drone: 'D',
    cues: [c(0.04, 'Say: Isis, great of magic, lady of many names, be near.', 'bell'), c(0.3, 'See her wings spread in shelter around you. Be held.'), c(0.55, 'Ask what you need to restore, mend or protect.'), e(5.0, 'Thank her. Pour out a little water in her name.', 'bell')],
  }),
  deity({
    id: 'dev-cernunnos', title: 'Cernunnos', name: 'Cernunnos', key: 'cernunnos', tradition: 'celtic', line: 'The antlered one of the wild wood, with rain and drone.',
    framing: 'Cernunnos, the antlered figure on the Gaulish Pillar of the Boatmen and the Gundestrup cauldron. We have the image and the name, almost nothing else; most of what is said of him is modern.',
    offering: 'Acorns, nuts, fresh water poured at a tree, a litter-pick, time outdoors.',
    how: 'Outside in a wood if you can, or by an open window with a plant. Dusk or dawn.',
    carrier: 'earth-day', carriers: ['earth-day', 'om', 'weighted'], hold: 6.5, bed: { rain: 0.3, drone: 0.2, pink: 0.1 }, drone: 'C',
    cues: [c(0.04, 'Say: Cernunnos, horned one, keeper of the wild, I come with respect.', 'bell'), c(0.3, 'Walk in a forest in your mind. Feel moss, bark, the heartbeat of the trees.'), c(0.55, 'Ask what wildness you have forgotten in yourself.'), e(5.0, 'Thank him. Touch a plant, tree or stone when you finish.', 'bell')],
  }),
  deity({
    id: 'dev-odin', title: 'Odin', name: 'Odin', key: 'odin', tradition: 'norse', line: 'Wisdom won at a cost, runes and the hanged god.',
    framing: 'Odin of the Norse: god of wisdom, poetry and the dead, who hung from the tree nine nights to win the runes. Known from the Eddas, which are late and written in Christian times. Some modern groups have claimed him for political ends; this program does not.',
    offering: 'Mead or ale, a rune you have made, a piece of study, a poem, a promise to learn.',
    how: 'Evening, with something to write on, or runes you are learning. Ask for insight, not power.',
    carrier: 'mercury', carriers: ['mercury', 'saturn'], hold: 6, bed: { drone: 0.25, fire: 0.1 }, drone: 'C',
    cues: [c(0.04, 'Say: Odin, wanderer, seeker of wisdom, I come to learn.', 'bell'), c(0.3, 'Stand under a great tree in the wind. What would you give for a new understanding?'), c(0.55, 'Ask for one thing to be made clear. Listen.'), e(5.0, 'Thank him. Write down what came, plainly.', 'bell')],
  }),
  deity({
    id: 'dev-lilith', title: 'Lilith', name: 'Lilith', key: 'lilith', tradition: 'modern', line: 'Independence, the night and the refused, in a modern devotion.',
    framing: 'Lilith appears in Mesopotamian demon-lists, in later Jewish folklore, and in modern feminist and occult writing as a figure of independence. Much of what is said of her is recent. This program draws only on the modern reading; the Jewish mystical material belongs to a closed tradition and is left alone.',
    offering: 'Red wine or water, a dark candle, a boundary you finally keep, a refusal.',
    how: 'At night, in your own space. Honest with yourself about what you refuse. Full return follows.',
    carrier: 'moon', carriers: ['moon', 'saturn'], hold: 6, bed: { drone: 0.2, rain: 0.12, pink: 0.1 }, drone: 'C',
    cues: [c(0.04, 'Say: Lilith, of the night and the wind, help me keep what is mine.', 'bell'), c(0.3, 'What have you agreed to that you did not want? Say no to it in your mind.'), c(0.55, 'Ask for the strength to stand on your own. Listen.'), e(5.0, 'Thank her. Leave your offering and your decision with her.', 'bell')],
  }),
  P({
    id: 'patron', group: 'devotional', title: 'Your patron', line: 'Picked from your My deities: the carrier and the hold come from your deity’s planet and element.',
    how: 'Reads the patron, dedicated or exploring deity you have kept under Settings, My practice, My deities, and chooses the carrier from their planet and the beat from their element: water deep, fire bright, earth low and steady, air light. If we have a program for your deity, you are offered that one first. Without one saved, it is a general devotional sit under the OM tone. These pairings are tradition and modern correspondence, not measurement.',
    lengths: [15, 20, 30, 45], carrier: 'om', hold: 7, deep: true, dynamic: 'patron', bed: { drone: 0.2, pink: 0.12 }, key: 'D',
    stages: [st('arrive', 'Arriving', 2, [11, 10]), st('descend', 'Settling', 3, [10, 'H']), st('hold', 'With them', 6, ['H', 'H']), back(4)],
    cues: [c(0.04, 'Greet them by name, aloud or inward. Light a candle if you wish.', 'bell'), c(0.3, 'Say what has been on your heart since you last sat with them.'), c(0.55, 'Be quiet. Notice what you notice: an image, a feeling, a word.'), e(5.0, 'Thank them. Leave your offering, in whatever form it takes.', 'bell')],
    deity: { name: 'Your deity', key: '', framing: 'Your own relationship, in your own words.', offering: 'Whatever you usually give them: a candle, water, a word, an act.' },
  }),
];

export const PROGRAMS: Program[] = [...EVERYDAY, ...CRAFT, ...DEV];
export const programById = (id: unknown): Program | null => PROGRAMS.find((p) => p.id === id) ?? null;
export const programsIn = (group: ProgramGroup, list: Program[] = PROGRAMS) => list.filter((p) => p.group === group);

/** Programs not tied to a closed tradition (ids from the Library's closed list); a program whose `tradition` is closed is left out. */
export function openPrograms(list: Program[], closedIds: string[]): Program[] {
  const closed = new Set(closedIds.map((s) => s.toLowerCase()));
  return list.filter((p) => !p.tradition || !closed.has(p.tradition.toLowerCase()));
}

// ─── The planetary hour ───────────────────────────────────────────────────

export type HourName = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';
const HOUR_HOLD: Record<HourName, { hold: number; carrier: string; line: string }> = {
  Sun: { hold: 10, carrier: 'sun', line: 'Sun’s hour: vitality, success and clarity.' },
  Moon: { hold: 6.5, carrier: 'moon', line: 'Moon’s hour: dreams, intuition, home and feeling.' },
  Mars: { hold: 10, carrier: 'mars', line: 'Mars’s hour: courage, protection and drive.' },
  Mercury: { hold: 11, carrier: 'mercury', line: 'Mercury’s hour: study, words and travel.' },
  Jupiter: { hold: 9, carrier: 'jupiter', line: 'Jupiter’s hour: growth, luck and generosity.' },
  Venus: { hold: 8.5, carrier: 'venus', line: 'Venus’s hour: love, beauty and harmony.' },
  Saturn: { hold: 6, carrier: 'saturn', line: 'Saturn’s hour: boundaries, endings and the ancestors.' },
};
export const hourCarrier = (planet: string): string => HOUR_HOLD[planet as HourName]?.carrier ?? 'om';

/** The planet whose hour it is at `now`, from a day's planetary hours (astro/hours.ts), or null. */
export function planetNow(hours: { planet: string; start: Date; end: Date }[] | null | undefined, now: Date): HourName | null {
  const h = (hours ?? []).find((x) => now.getTime() >= x.start.getTime() && now.getTime() < x.end.getTime());
  return h && h.planet in HOUR_HOLD ? (h.planet as HourName) : null;
}

// ─── Your patron ──────────────────────────────────────────────────────────

type Element = 'fire' | 'water' | 'earth' | 'air' | 'spirit';
const ELEMENT_HOLD: Record<Element, number> = { water: 6, earth: 7.5, fire: 10, air: 9, spirit: 7 };
/** What the patron mapping knows: the deity's usual planet and element (traditional correspondences). */
export const PATRON_TABLE: Record<string, { planet: HourName; element: Element }> = {
  hekate: { planet: 'Moon', element: 'water' }, selene: { planet: 'Moon', element: 'water' }, artemis: { planet: 'Moon', element: 'earth' }, diana: { planet: 'Moon', element: 'earth' },
  aphrodite: { planet: 'Venus', element: 'water' }, venus: { planet: 'Venus', element: 'water' }, freyja: { planet: 'Venus', element: 'earth' }, hathor: { planet: 'Venus', element: 'water' }, frigg: { planet: 'Venus', element: 'air' },
  hermes: { planet: 'Mercury', element: 'air' }, mercury: { planet: 'Mercury', element: 'air' }, thoth: { planet: 'Mercury', element: 'air' }, odin: { planet: 'Mercury', element: 'air' }, athena: { planet: 'Mercury', element: 'air' }, minerva: { planet: 'Mercury', element: 'air' },
  apollo: { planet: 'Sun', element: 'fire' }, brigid: { planet: 'Sun', element: 'fire' }, ra: { planet: 'Sun', element: 'fire' }, lugh: { planet: 'Sun', element: 'fire' }, helios: { planet: 'Sun', element: 'fire' },
  morrigan: { planet: 'Mars', element: 'fire' }, mars: { planet: 'Mars', element: 'fire' }, sekhmet: { planet: 'Mars', element: 'fire' }, ares: { planet: 'Mars', element: 'fire' }, kali: { planet: 'Mars', element: 'fire' },
  zeus: { planet: 'Jupiter', element: 'air' }, jupiter: { planet: 'Jupiter', element: 'air' }, thor: { planet: 'Jupiter', element: 'air' }, lakshmi: { planet: 'Jupiter', element: 'water' },
  persephone: { planet: 'Saturn', element: 'earth' }, hades: { planet: 'Saturn', element: 'earth' }, saturn: { planet: 'Saturn', element: 'earth' }, hel: { planet: 'Saturn', element: 'earth' }, anubis: { planet: 'Saturn', element: 'earth' }, osiris: { planet: 'Saturn', element: 'earth' },
  isis: { planet: 'Moon', element: 'water' }, nyx: { planet: 'Moon', element: 'water' }, cerridwen: { planet: 'Moon', element: 'water' }, lilith: { planet: 'Moon', element: 'water' }, cernunnos: { planet: 'Sun', element: 'earth' }, demeter: { planet: 'Saturn', element: 'earth' }, ceres: { planet: 'Saturn', element: 'earth' }, dionysus: { planet: 'Venus', element: 'water' }, poseidon: { planet: 'Jupiter', element: 'water' }, neptune: { planet: 'Jupiter', element: 'water' },
};
const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^.*\//, '').replace(/^the\s+/, '').replace(/[^a-z]/g, '');
/** The deity's table row, from a Library key ("traditional/deity/hekate") or a name, or null. */
export function patronEntry(deityLike: { key?: string | null; name?: string } | null | undefined) {
  if (!deityLike) return null;
  const tries = [deityLike.key ? slug(deityLike.key) : '', slug(deityLike.name ?? ''), slug((deityLike.name ?? '').split(/[\s/,(]/)[0])].filter(Boolean);
  for (const t of tries) if (PATRON_TABLE[t]) return { slug: t, ...PATRON_TABLE[t] };
  return null;
}
/** The devotional program we have for this deity, by name or key (Selene is Artemis's; Thoth is Hermes's), or null. */
export function deityProgramId(deityLike: { key?: string | null; name?: string } | null | undefined): string | null {
  const e1 = patronEntry(deityLike);
  const s = e1?.slug ?? slug(deityLike?.name ?? '');
  const alias: Record<string, string> = { selene: 'artemis', thoth: 'hermes', venus: 'aphrodite' };
  const key = alias[s] ?? s;
  return PROGRAMS.find((p) => p.group === 'devotional' && p.deity?.key === key) ? `dev-${key}` : null;
}

/** The program to offer for the person's deities: the closest one with its own program, else the generic patron one. */
export function patronChoice(list: { key: string | null; name: string; level: 'exploring' | 'dedicated' | 'patron' }[]): { programId: string; deity: { key: string | null; name: string } | null } {
  const ordered = [...list].sort((a, b) => ['patron', 'dedicated', 'exploring'].indexOf(a.level) - ['patron', 'dedicated', 'exploring'].indexOf(b.level));
  const first = ordered[0];
  if (!first) return { programId: 'patron', deity: null };
  return { programId: deityProgramId(first) ?? 'patron', deity: { key: first.key, name: first.name } };
}

/** The program with its moment-dependent parts filled in: the planetary hour's carrier and beat, or the patron's. */
export function resolveProgram(p: Program, ctx: { planet?: string | null; deity?: { key?: string | null; name?: string } | null } = {}): Program {
  if (p.dynamic === 'hour') {
    const row = HOUR_HOLD[(ctx.planet as HourName) ?? 'Sun'] ?? HOUR_HOLD.Sun;
    const planet = HOUR_HOLD[(ctx.planet as HourName)] ? (ctx.planet as string) : null;
    return {
      ...p, carrier: row.carrier, carriers: [row.carrier, ...Object.values(HOUR_HOLD).map((r) => r.carrier).filter((x) => x !== row.carrier)], hold: row.hold,
      line: planet ? `${planet}’s hour: ${row.line.replace(/^[^:]*: /, '')}` : p.line,
      cues: [c(0.04, planet ? `It is ${row.line} Take that as your theme.` : 'Choose the hour’s theme yourself, or set the place in Craft timing.', 'bell'), c(0.4, 'Hold one small intention that fits it. Let the tone carry it.'), e(1.8, 'Let it go. Return to your day, with the hour’s theme in mind.', 'bell')],
    };
  }
  if (p.dynamic === 'patron') {
    const entry = patronEntry(ctx.deity);
    const carrier = entry ? HOUR_HOLD[entry.planet].carrier : p.carrier;
    const hold = entry ? ELEMENT_HOLD[entry.element] : p.hold;
    const name = ctx.deity?.name?.trim();
    const stages = p.stages.map((s) => ({ ...s }));
    return {
      ...p, carrier, carriers: [carrier, 'om', 'moon'], hold, deep: hold < 8,
      stages: hold < 8 ? stages : [...stages.slice(0, 3), gentleBack(3)],
      title: name ? `Your patron: ${name}` : p.title,
      line: name ? `${name}: carrier from ${entry?.planet ?? 'the OM pitch'}, ${entry ? entry.element + ' beat' : 'a steady theta-alpha border'}.` : p.line,
      deity: { ...p.deity!, name: name || p.deity!.name },
      cues: p.cues.map((q, i) => (i === 0 && name ? { ...q, text: `Greet ${name} by name, aloud or inward. Light a candle if you wish.` } : q)),
    };
  }
  return p;
}

// ─── Compiling a run ──────────────────────────────────────────────────────

export type Opts = { carrier?: string; schumann?: boolean; breath?: boolean; forks?: boolean; drum?: boolean; /** Keep the cue text but not the cue strikes. */ silent?: boolean };
export type Segment = { id: string; label: string; startMs: number; endMs: number; beat: number[]; carrier: string };
export type TimedCue = { atMs: number; text: string; strike?: CueStrike };
export type Compiled = { program: Program; totalMs: number; segments: Segment[]; cues: TimedCue[]; mix: SoundMix; breath: boolean; carrier: string; hold: number; /** Overall loudness, 0 to 1. */ volume: number };

/** Stage lengths (ms) for a total: fixed ones (the return) first, capped at a third of the whole, the rest by weight. */
export function stageLengths(stages: Pick<Stage, 'weight' | 'fixedMin'>[], totalMs: number): number[] {
  const fixed = stages.map((s) => (s.fixedMin ? Math.min(s.fixedMin * MIN, totalMs * 0.35) : 0));
  const left = Math.max(0, totalMs - fixed.reduce((a, b) => a + b, 0));
  const weight = stages.reduce((a, s, i) => a + (fixed[i] ? 0 : s.weight), 0) || 1;
  return stages.map((s, i) => (fixed[i] ? fixed[i] : (left * s.weight) / weight));
}

const clampBeat = (b: number) => Math.max(0.5, Math.min(40, b));

/** When each of a program's own cues comes (ms from the start), in the order written: a fraction of the whole, or minutes before the end. */
export const cueTimes = (p: Pick<Program, 'cues'>, totalMs: number): number[] => p.cues.map((q) => Math.max(0, Math.min(totalMs - 1000, q.at !== undefined ? q.at * totalMs : totalMs - (q.fromEnd ?? 0) * MIN)));

export function compile(p: Program, minutes: number, o: Opts = {}): Compiled {
  const mins = Math.max(1, Math.min(240, minutes || p.length));
  const totalMs = mins * MIN;
  const hold = o.schumann && p.alt ? p.alt.hold : p.hold;
  const carrier = o.carrier && (p.carriers.includes(o.carrier) || Number.isFinite(Number(o.carrier))) ? o.carrier : p.carrier;
  const lens = stageLengths(p.stages, totalMs);
  let t = 0;
  const segments: Segment[] = p.stages.map((s, i) => {
    const seg = { id: s.id, label: s.label, startMs: t, endMs: t + lens[i], beat: s.beat.map((b) => clampBeat(b === 'H' ? hold : b)), carrier: s.carrier ?? carrier };
    t += lens[i];
    return seg;
  });
  const at = cueTimes(p, totalMs);
  const cues: TimedCue[] = p.cues.map((q, i) => ({ atMs: at[i], text: q.text, ...(q.strike ? { strike: q.strike } : {}) }));
  if (o.forks && p.forks) {
    [0.25, 0.5, 0.75].forEach((f, i) => cues.push({ atMs: f * totalMs, text: i === 0 ? 'A bright fork rings: let it clear the air.' : 'Another strike, another sweep of clear.', strike: `fork:${CLEARING_HZ}` }));
  }
  cues.sort((a, b) => a.atMs - b.atMs);
  const levels: Partial<Record<LayerId, number>> = { ...p.bed };
  if (p.drumOption && o.drum) levels.drum = 0.45;
  const mix = cleanMix({ ...DEFAULT_MIX, levels, key: p.key ?? DEFAULT_MIX.key, tempo: p.tempo ?? DEFAULT_MIX.tempo, bowlSet: p.bowlSet ?? 'chakras', bowlEvery: p.bowlEvery ?? 60, forkSet: p.forkSet ?? DEFAULT_MIX.forkSet });
  if (!Object.keys(mix.levels).length) mix.levels = { pink: 0.2 };
  return { program: p, totalMs, segments, cues, mix, breath: o.breath ?? !!p.breath, carrier, hold, volume: 1 };
}

/** The plan the sound is worked out against: the run's whole length, no bells of its own. */
export const programPlan = (c: Compiled): SitPlan => ({ ...DEFAULT_PLAN, minutes: c.totalMs / MIN, settle: 0, warm: 0, startBell: false, endBell: false, every: 0 });
/** When the sound ends (ms from the start). */
export const programEnd = (c: Compiled) => c.totalMs;

const segmentAt = (c: Compiled, ms: number): { seg: Segment; i: number } => {
  const t = Math.max(0, Math.min(c.totalMs, ms));
  const i = c.segments.findIndex((s) => t < s.endMs);
  const at = i < 0 ? c.segments.length - 1 : i;
  return { seg: c.segments[at], i: at };
};

/** The stage you are in at `ms`. */
export const stageAt = (c: Compiled, ms: number): Segment => segmentAt(c, ms).seg;

/** Linear interpolation over points spread evenly (one point is flat). */
export function interpolate(points: number[], f: number): number {
  if (points.length === 1) return points[0];
  const x = Math.max(0, Math.min(1, f)) * (points.length - 1);
  const i = Math.min(points.length - 2, Math.floor(x));
  return points[i] + (points[i + 1] - points[i]) * (x - i);
}

/** The beat (Hz) at `ms`: each stage's points ramp across the stage. */
export function beatAt(c: Compiled, ms: number): number {
  const { seg } = segmentAt(c, ms);
  const len = seg.endMs - seg.startMs;
  return Math.round(interpolate(seg.beat, len > 0 ? (ms - seg.startMs) / len : 1) * 100) / 100;
}

/** A carrier change crossfades over this long, centred on the stage boundary. */
const XFADE_MS = 20_000;
/** The carrier(s) sounding at `ms`: the stage's, and the next (or last) one while a change is crossfading, each with its weight. */
export function carriersAt(c: Compiled, ms: number): { id: string; hz: number; weight: number }[] {
  const { seg, i } = segmentAt(c, ms);
  const mk = (id: string, w: number) => ({ id, hz: Math.round(carrierHz(id)), weight: w });
  const next = c.segments[i + 1];
  const prev = c.segments[i - 1];
  if (next && next.carrier !== seg.carrier && seg.endMs - ms < XFADE_MS / 2) {
    const frac = Math.max(0, Math.min(0.5, 0.5 - (seg.endMs - ms) / XFADE_MS));
    return [mk(seg.carrier, Math.sqrt(1 - frac)), mk(next.carrier, Math.sqrt(frac))];
  }
  if (prev && prev.carrier !== seg.carrier && ms - seg.startMs < XFADE_MS / 2) {
    const frac = 0.5 + (ms - seg.startMs) / XFADE_MS;
    return [mk(prev.carrier, Math.sqrt(1 - frac)), mk(seg.carrier, Math.sqrt(frac))];
  }
  return [mk(seg.carrier, 1)];
}

/** The binaural loops to play at `ms` and how loud each (they sit on a 0.5 Hz lattice; two neighbours crossfade). */
export function binauralVoices(c: Compiled, ms: number): { key: string; weight: number }[] {
  const beat = beatAt(c, ms);
  const lo = Math.floor(beat * 2) / 2;
  const f = (beat - lo) / 0.5;
  const steps = [
    { beat: lo, w: Math.sqrt(1 - f) },
    { beat: lo + 0.5, w: Math.sqrt(f) },
  ].filter((s) => s.w > 0.001);
  const out: { key: string; weight: number }[] = [];
  for (const car of carriersAt(c, ms)) for (const s of steps) out.push({ key: `binaural:${car.hz}:${s.beat}`, weight: Math.round(car.weight * s.w * 1000) / 1000 });
  return out;
}

/** The level the whole run is multiplied by: sleep fades to nothing over its last minutes. */
export function gainAt(c: Compiled, ms: number): number {
  const fade = (c.program.fadeMin ?? 0) * MIN;
  if (!fade) return 1;
  return Math.round(Math.max(0, Math.min(1, (c.totalMs - ms) / Math.min(fade, c.totalMs))) * 1000) / 1000;
}

/** The text cue to show at `ms`: the latest one, for 75 seconds, else null. */
export function cueNow(c: Compiled, ms: number): TimedCue | null {
  let cur: TimedCue | null = null;
  for (const q of c.cues) if (q.atMs <= ms) cur = q;
  return cur && ms - cur.atMs < 75_000 ? cur : null;
}

/** The sound key a cue's strike makes. */
export function strikeKey(s: CueStrike): string {
  const [kind, n] = s.split(':');
  if (kind === 'fork') return forkKey([Number(n) || CLEARING_HZ]);
  if (kind === 'bowl') return bowlKey(Math.max(0, Math.min(6, Number(n) || 0)));
  return bowlKey(7);
}

/** Every strike to sound (cues first by being tagged with tone -2, then the bed's bowls and forks). */
export function programStrikes(c: Compiled): Strike[] {
  const bed = bowlStrikes(c.mix, programPlan(c));
  return [...bed, ...c.cues.filter((q) => q.strike).map((q) => ({ atMs: q.atMs, tone: -2, key: strikeKey(q.strike!) }))].sort((a, b) => a.atMs - b.atMs);
}

/** One look at the sound for a program: the bed (the Listen engine), the binaural stage, and a strike if due. */
export function programTick(c: Compiled, strikes: Strike[], fromMs: number, elapsedMs: number): { voices: Voice[]; strike: { key: string; volume: number } | null } {
  const plan = programPlan(c);
  const master = masterAt(plan, elapsedMs);
  const g = gainAt(c, elapsedMs) * c.volume;
  if (!master || !g) return { voices: [], strike: null };
  const voices = frameAt(c.mix, plan, elapsedMs).map((v) => ({ ...v, volume: Math.round(v.volume * g * 1000) / 1000 }));
  for (const b of binauralVoices(c, elapsedMs)) voices.push({ key: b.key, volume: Math.round(0.3 * b.weight * master * g * 1000) / 1000, atMs: elapsedMs });
  const due = strikesDue(strikes, fromMs, elapsedMs)[0];
  const strikeMaster = masterAt(plan, elapsedMs, null, 4000) * g;
  const level = due ? (due.tone === -2 ? 0.7 : levelOf(c.mix, due.key ? 'forks' : 'bowls')) : 0;
  const volume = Math.round(level * strikeMaster * 1000) / 1000;
  return { voices, strike: due && volume > 0 && due.key ? { key: due.key, volume } : due && volume > 0 ? { key: bowlKey(due.tone), volume } : null };
}

export const isDone = (c: Compiled, elapsedMs: number) => elapsedMs >= c.totalMs;

// ─── The breathing pacer ──────────────────────────────────────────────────

/** Six breaths a minute: in for 4 seconds, out for 6. */
export const BREATH_CYCLE_MS = 10_000;
export function breathAt(ms: number): { phase: 'in' | 'out'; scale: number; label: string } {
  const t = ((ms % BREATH_CYCLE_MS) + BREATH_CYCLE_MS) % BREATH_CYCLE_MS;
  const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);
  if (t < 4000) return { phase: 'in', scale: Math.round((0.55 + 0.45 * ease(t / 4000)) * 1000) / 1000, label: 'Breathe in' };
  return { phase: 'out', scale: Math.round((1 - 0.45 * ease((t - 4000) / 6000)) * 1000) / 1000, label: 'Breathe out' };
}

// ─── Your own program ─────────────────────────────────────────────────────

export const BED_CHOICES: { id: string; label: string; levels: Partial<Record<LayerId, number>> }[] = [
  { id: 'pink', label: 'Pink noise', levels: { pink: 0.3 } },
  { id: 'rain', label: 'Rain', levels: { rain: 0.4, pink: 0.1 } },
  { id: 'fire', label: 'Fire', levels: { fire: 0.35, pink: 0.1 } },
  { id: 'drone', label: 'Drone', levels: { drone: 0.3, pink: 0.12 } },
  { id: 'bowls', label: 'Bowls', levels: { bowls: 0.4, pink: 0.12 } },
  { id: 'forks', label: 'Tuning forks', levels: { forks: 0.4, pink: 0.12 } },
  { id: 'drum', label: 'Drum at journey tempo', levels: { drum: 0.45, pink: 0.1 } },
];

export type CustomCue = { atMin: number; text: string; strike?: CueStrike };
export type CustomProgram = {
  title: string;
  /** Beats (Hz) at the start, held through the middle, and the return's finish. */
  start: number;
  hold: number;
  /** Minutes: getting from start to hold, holding, and coming back. */
  descendMin: number;
  holdMin: number;
  returnMin: number;
  /** A carrier id (CARRIER_CHOICES) or a number in Hz as text. */
  carrier: string;
  bed: string;
  cues: CustomCue[];
  breath: boolean;
};

export const CUSTOM_COLLECTION = 'binaural-programs';
export const DEFAULT_CUSTOM: CustomProgram = { title: 'My program', start: 10, hold: 6, descendMin: 8, holdMin: 15, returnMin: 4, carrier: 'om', bed: 'pink', cues: [], breath: false };

const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};

/** A saved program read back safely. A deep hold (under 8 Hz) always keeps a return of at least three minutes. */
export function cleanCustom(raw: unknown): CustomProgram {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const hold = Math.round(num(r.hold, 1, 30, DEFAULT_CUSTOM.hold) * 100) / 100;
  const deep = hold < 8;
  const returnMin = Math.round(num(r.returnMin, deep ? 3 : 0, 30, DEFAULT_CUSTOM.returnMin) * 10) / 10;
  const cues = (Array.isArray(r.cues) ? r.cues : [])
    .map((q) => (q && typeof q === 'object' ? (q as Record<string, unknown>) : {}))
    .map((q): CustomCue => ({ atMin: Math.round(num(q.atMin, 0, 240, 0) * 10) / 10, text: String(q.text ?? '').trim().slice(0, 200), ...(typeof q.strike === 'string' && /^(bell|bowl:[0-6]|fork:\d+(\.\d+)?)$/.test(q.strike) ? { strike: q.strike } : {}) }))
    .filter((q) => q.text || q.strike)
    .slice(0, 24);
  return {
    title: String(r.title ?? '').trim().slice(0, 60) || DEFAULT_CUSTOM.title,
    start: Math.round(num(r.start, 1, 30, DEFAULT_CUSTOM.start) * 100) / 100,
    hold,
    descendMin: Math.round(num(r.descendMin, 1, 60, DEFAULT_CUSTOM.descendMin) * 10) / 10,
    holdMin: Math.round(num(r.holdMin, 0, 180, DEFAULT_CUSTOM.holdMin) * 10) / 10,
    returnMin,
    carrier: CARRIER_CHOICES.some((x) => x.id === r.carrier) || (Number.isFinite(Number(r.carrier)) && Number(r.carrier) >= 60 && Number(r.carrier) <= 1000) ? String(r.carrier) : DEFAULT_CUSTOM.carrier,
    bed: BED_CHOICES.some((b) => b.id === r.bed) ? String(r.bed) : DEFAULT_CUSTOM.bed,
    cues,
    breath: r.breath === true,
  };
}

export const customMinutes = (s: CustomProgram) => Math.round((s.descendMin + s.holdMin + s.returnMin) * 10) / 10;

/** A saved program as a Program, with stage lengths in the minutes you gave (so any length scaling keeps their proportions). */
export function customProgram(raw: unknown, id = 'custom'): Program {
  const s = cleanCustom(raw);
  const total = customMinutes(s);
  const stages: Stage[] = [st('descend', 'Settling', s.descendMin, [s.start, 'H'])];
  if (s.holdMin > 0) stages.push(st('hold', 'Holding', s.holdMin, ['H', 'H']));
  if (s.returnMin > 0) stages.push(st('return', 'Coming back', s.returnMin, s.hold < 10 ? ['H', 10, 13] : ['H', Math.max(s.hold, 12)]));
  const bed = BED_CHOICES.find((b) => b.id === s.bed)?.levels ?? { pink: 0.2 };
  return P({
    id, group: 'craft', title: s.title, line: `Your own: ${s.start} Hz down to ${s.hold} Hz${s.returnMin ? ', then back up' : ''}.`, how: 'A program you built. The stages run at the lengths you set.',
    lengths: [Math.max(1, Math.round(total))], length: Math.max(1, Math.round(total)), carrier: s.carrier, carriers: [s.carrier], hold: s.hold, deep: s.hold < 8 && s.returnMin > 0, breath: s.breath, bed, tempo: 4.5,
    stages: stages.map((x) => ({ ...x, weight: Math.max(0.1, x.weight), ...(x.id === 'return' ? { fixedMin: s.returnMin } : {}) })),
    cues: s.cues.map((q) => ({ at: total > 0 ? Math.min(0.999, q.atMin / total) : 0, text: q.text, ...(q.strike ? { strike: q.strike } : {}) })),
  });
}

// ─── Suggested for the moon and the Wheel ─────────────────────────────────

/** The program to suggest for a moon kit or a sabbat kit (holy-page ref). */
export const KIT_PROGRAMS: Record<string, string> = {
  'moon-dark': 'dev-hekate', 'moon-new': 'centering', 'moon-waxing-crescent': 'abundance', 'moon-first-quarter': 'success', 'moon-waxing-gibbous': 'creativity', 'moon-full': 'divination', 'moon-waning-gibbous': 'healing', 'moon-last-quarter': 'clearing', 'moon-waning-crescent': 'shadow',
  'wheel-samhain': 'ancestors', 'wheel-yule': 'healing', 'wheel-imbolc': 'dev-brigid', 'wheel-ostara': 'creativity', 'wheel-beltane': 'love', 'wheel-litha': 'success', 'wheel-lammas': 'abundance', 'wheel-mabon': 'grounding',
};
export const kitProgram = (ref: string): Program | null => programById(KIT_PROGRAMS[String(ref).replace(/^wheel_south-/, 'wheel-')]);

/** A short line for the picker: how long it runs by default, and what it ends with. */
export const programMeta = (p: Program) => `${p.length} min${p.deep ? ' · ends with a return to waking' : p.fadeMin ? ' · fades out' : ''}`;
export { LAYERS };
