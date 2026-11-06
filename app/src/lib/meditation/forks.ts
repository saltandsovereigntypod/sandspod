// Tuning forks: a fork is a near-pure sine at its pitch with a faint,
// inharmonic "clang" as it is struck (a prong's second mode sits about 6.25
// times the fundamental and dies in ~150 ms), then a very long, smooth
// decay. Two struck together beat at the difference of their pitches.
// The sets below are modern conventions, not historical tunings: Solfeggio
// (popularised from the 1970s, taken from Gregorian-chant syllables by
// later writers), Cosmic Octave (Hans Cousto, 1978: planetary orbit periods
// raised by octaves into hearing), the seven-fork chakra set sold in a
// just-intonation C scale, weighted 128 Hz (the "Otto" fork physiotherapists
// and sound practitioners hold on the body) and the 4096 Hz crystal-clearing
// fork. Claims about what any of them do are traditions of practice, not
// established effects. Pure; the sound is made by synth.ts (forkSamples).

export type ForkSpec = { id: string; label: string; line: string; /** One pitch, or two struck together. */ hz: number[] };
export type ForkSetId = 'solfeggio' | 'cosmic' | 'chakra' | 'special' | 'pairs';
export type ForkSet = { id: ForkSetId; label: string; line: string; forks: ForkSpec[] };

const f = (id: string, label: string, hz: number, line: string): ForkSpec => ({ id, label, line, hz: [hz] });

export const SOLFEGGIO: ForkSpec[] = [
  f('174', '174 Hz', 174, 'Often given as the grounding, easing tone.'),
  f('285', '285 Hz', 285, 'Often given as the tone of renewal and rest.'),
  f('396', '396 Hz', 396, 'Often given as releasing fear and guilt.'),
  f('417', '417 Hz', 417, 'Often given as clearing the old and making change.'),
  f('528', '528 Hz', 528, 'Often called the tone of love and repair.'),
  f('639', '639 Hz', 639, 'Often given as connection and relationships.'),
  f('741', '741 Hz', 741, 'Often given as clear expression and cleansing.'),
  f('852', '852 Hz', 852, 'Often given as intuition and inner sight.'),
  f('963', '963 Hz', 963, 'Often given as the crown, oneness and stillness.'),
];

export const COSMIC: ForkSpec[] = [
  f('earth-year', 'Earth year (OM) 136.10', 136.1, 'The Earth’s year raised 32 octaves; the “OM” pitch, for calm and centring.'),
  f('sun', 'Sun 126.22', 126.22, 'The Sun’s rotation raised into hearing; warmth, vitality, confidence.'),
  f('moon', 'Moon (synodic) 210.42', 210.42, 'The lunar month; feeling, rhythm and rest.'),
  f('mercury', 'Mercury 141.27', 141.27, 'Mercury’s orbit; thought, speech and clear mind.'),
  f('venus', 'Venus 221.23', 221.23, 'Venus’s orbit; love, beauty and harmony.'),
  f('mars', 'Mars 144.72', 144.72, 'Mars’s orbit; drive, courage and action.'),
  f('jupiter', 'Jupiter 183.58', 183.58, 'Jupiter’s orbit; growth, generosity and good fortune.'),
  f('saturn', 'Saturn 147.85', 147.85, 'Saturn’s orbit; structure, patience and discipline.'),
  f('earth-day', 'Earth day 194.18', 194.18, 'The Earth’s day; waking, daily rhythm and presence.'),
];

/** The seven-fork chakra set, in a just-intonation C scale (root to crown). */
export const CHAKRA: ForkSpec[] = [
  f('root', 'Root 256', 256, 'C. Grounding, safety and the body.'),
  f('sacral', 'Sacral 288', 288, 'D. Feeling, pleasure and flow.'),
  f('solar', 'Solar plexus 320', 320, 'E. Will, confidence and power.'),
  f('heart', 'Heart 341.3', 341.3, 'F. Love, grief and connection.'),
  f('throat', 'Throat 384', 384, 'G. Voice, truth and expression.'),
  f('third-eye', 'Third eye 426.7', 426.7, 'A. Insight and imagination.'),
  f('crown', 'Crown 480', 480, 'B. Stillness, meaning and the wider whole.'),
];

export const CLEARING_HZ = 4096;
export const WEIGHTED_HZ = 128;
export const OM_HZ = 136.1;

export const SPECIAL: ForkSpec[] = [
  f('weighted-128', 'Weighted 128 Hz', WEIGHTED_HZ, 'The grounding fork: low, deep and steady, often held to the body.'),
  f('clearing-4096', 'Crystal clearing 4096 Hz', CLEARING_HZ, 'A very high, bright fork used to clear stones and space. Piercing, so it is played quietly here.'),
];

export const PAIRS: ForkSpec[] = [
  { id: 'ground-om', label: '128 + 136.1 Hz', line: 'Weighted 128 with the OM pitch: a slow beat of about 8 Hz, in the alpha range.', hz: [WEIGHTED_HZ, OM_HZ] },
  { id: 'om-octave', label: 'OM pair 136.1 + 68.05 Hz', line: 'The OM pitch with the octave below it: two tones that sit as one, with no beat.', hz: [OM_HZ, 68.05] },
];

export const FORK_SETS: ForkSet[] = [
  { id: 'solfeggio', label: 'Solfeggio', line: 'Nine tones from 174 to 963 Hz. A modern set, not a medieval one.', forks: SOLFEGGIO },
  { id: 'cosmic', label: 'Cosmic Octave', line: 'The planets and the Earth’s year and day as pitches (Hans Cousto, 1978).', forks: COSMIC },
  { id: 'chakra', label: 'Chakras', line: 'Seven forks, root to crown, in a just-intonation C scale.', forks: CHAKRA },
  { id: 'special', label: 'Grounding and clearing', line: 'The weighted 128 Hz fork and the 4096 Hz clearing fork.', forks: SPECIAL },
  { id: 'pairs', label: 'Pairs', line: 'Two forks struck together, so you hear them beat.', forks: PAIRS },
];

export const DEFAULT_FORK_SET: ForkSetId = 'cosmic';
export const forkSet = (id: unknown): ForkSet => FORK_SETS.find((s) => s.id === id) ?? FORK_SETS.find((s) => s.id === DEFAULT_FORK_SET)!;

/** Seconds between strikes when a set is on as a backdrop. */
export const FORK_GAPS = [30, 60, 120, 300] as const;
export const DEFAULT_FORK_GAP = 60;

/** How long a struck fork rings (seconds to fade to silence): the choices and the default. */
export const FORK_DECAYS = [20, 30, 45, 60] as const;
export const DEFAULT_FORK_DECAY = 30;

/** The beat two forks make together (Hz), or 0 for one fork. */
export function beatHz(hz: number[]): number {
  return hz.length < 2 ? 0 : Math.round(Math.abs(hz[0] - hz[1]) * 100) / 100;
}

/** "136.1" for a pitch, without trailing zeros. */
export const hzText = (hz: number) => String(Math.round(hz * 100) / 100);

/** A fork's line with its beat when it is a pair. */
export function forkLine(s: ForkSpec): string {
  const b = beatHz(s.hz);
  return b && !/beat/.test(s.line) ? `${s.line} Beats at ${hzText(b)} Hz.` : s.line;
}

/**
 * The shape of a struck fork: the clang's pitch and length, the long decay's
 * time constant (so the level has fallen 60 dB at `seconds`), a quick attack
 * and a faint slow shimmer in the level.
 */
export function forkEnvelope(decaySeconds: number) {
  const seconds = Math.min(60, Math.max(20, decaySeconds || DEFAULT_FORK_DECAY));
  return {
    seconds,
    attack: 0.003,
    tau: seconds / Math.log(1000),
    clangRatio: 6.25,
    clangGain: 0.14,
    clangTau: 0.05,
    shimmerHz: 0.37,
    shimmerDepth: 0.035,
  };
}

/** The strike's own level: very high forks are piercing, so the clearing fork is played gently. */
export const forkGain = (hz: number) => (hz >= 2000 ? 0.22 : hz >= 1000 ? 0.5 : 1);

/** The key a struck fork (or pair) is made under (sound.ts samplesFor). */
export const forkKey = (hz: number[], decay = DEFAULT_FORK_DECAY) => `fork:${hz.map(hzText).join('+')}:${decay}`;

/** The pitches and decay a fork key names, or null if it isn't one. */
export function parseForkKey(key: string): { hz: number[]; decay: number } | null {
  const [kind, a, b] = key.split(':');
  if (kind !== 'fork' || !a) return null;
  const hz = a
    .split('+')
    .map(Number)
    .filter((n) => Number.isFinite(n) && n >= 20 && n <= 8000)
    .slice(0, 2);
  return hz.length ? { hz, decay: Number(b) || DEFAULT_FORK_DECAY } : null;
}

/** The fork for a planet's hour (Cosmic Octave), or null for the nodes and the like. */
export function forkForPlanet(planet: string): ForkSpec | null {
  const id = String(planet).toLowerCase();
  return COSMIC.find((c) => c.id === id) ?? null;
}

export const FORK_NOTE =
  'These sets are modern conventions, and what any pitch does for you is a tradition of practice, not an established effect. Use them as you would a bell: to mark a moment and settle the mind.';

/** Every fork in every set, for finding one by id. */
export const ALL_FORKS: ForkSpec[] = FORK_SETS.flatMap((s) => s.forks);
export const forkById = (id: unknown): ForkSpec | null => ALL_FORKS.find((x) => x.id === id) ?? null;

/** Strike order for a set on repeat: each fork in turn, round and round. */
export const forkRound = (id: unknown): ForkSpec[] => forkSet(id).forks;
