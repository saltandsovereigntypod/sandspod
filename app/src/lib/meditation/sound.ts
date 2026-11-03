// Sound to sit with: layers you mix yourself, each at its own level. A drone
// in a key you choose; pink or brown noise; rain; wind; a fire; a frame drum
// at a trance tempo, which changes to a callback near the end of a timed sit;
// singing-bowl rounds; and binaural tones under the noise. All of it made by
// us (synth.ts and scripts/sounds/meditation_beds.py), nothing recorded.
// Everything fades in as you begin and out as the sit ends, and stops with
// the timer. Each moment's mix (frameAt) is worked out from the time gone by,
// like the bells, so a sit together hears its drum or bowls in step. Played
// by components/meditation/sitSound.ts (the app, expo-audio) and webSound.ts
// (Web Audio: the app's web build and the website). Pure.

import { bowlSamples, binauralSamples, callbackBeats, callbackSamples, droneSamples, drumLoopBeats, drumSamples, type Pcm } from './synth.ts';
import { MAX_MINUTES, type SitPlan } from './timer.ts';

const MIN = 60_000;

export type LayerId = 'drone' | 'pink' | 'brown' | 'rain' | 'wind' | 'fire' | 'drum' | 'bowls' | 'binaural';

export const LAYERS: { id: LayerId; label: string; line: string }[] = [
  { id: 'drone', label: 'Drone', line: 'A low, steady hum in the key you choose.' },
  { id: 'pink', label: 'Pink noise', line: 'Soft, even noise, like a distant waterfall.' },
  { id: 'brown', label: 'Brown noise', line: 'Deeper noise, like surf or a far-off rumble.' },
  { id: 'rain', label: 'Rain', line: 'Rain falling steadily.' },
  { id: 'wind', label: 'Wind', line: 'Wind rising and falling.' },
  { id: 'fire', label: 'Fire', line: 'A fire’s low roar and crackle.' },
  { id: 'drum', label: 'Frame drum', line: 'A steady trance beat, with a callback near the end of a timed sit.' },
  { id: 'bowls', label: 'Singing bowls', line: 'A bowl struck now and then, round the seven tones, or 432 Hz.' },
  { id: 'binaural', label: 'Binaural layers', line: 'Two close tones, one in each ear, under the noise. Headphones needed.' },
];

/** Bed layers played from files (scripts/sounds/meditation_beds.py). */
export const BEDS = ['pink', 'brown', 'rain', 'wind', 'fire'] as const;
export type Bed = (typeof BEDS)[number];

export const LEVELS: { value: number; label: string }[] = [
  { value: 0, label: 'Off' },
  { value: 0.25, label: 'Soft' },
  { value: 0.5, label: 'Medium' },
  { value: 0.8, label: 'Full' },
];

/** The twelve keys for the drone, around the octave below middle C. */
export const KEYS: { id: string; hz: number }[] = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'].map((id, i) => ({ id, hz: Math.round(130.81 * Math.pow(2, i / 12) * 100) / 100 }));

export const TEMPOS = [3, 3.5, 4, 4.5, 5, 5.5, 6, 7] as const;
export const DEFAULT_TEMPO = 4.5;

/**
 * The seven tones often given to the chakras on crystal bowls (C to B,
 * root to crown), and 432 Hz. The note-to-chakra match is a modern
 * convention, not an old teaching.
 */
export const BOWL_TONES: { id: string; label: string; hz: number }[] = [
  { id: 'root', label: 'Root (C)', hz: 261.63 },
  { id: 'sacral', label: 'Sacral (D)', hz: 293.66 },
  { id: 'solar', label: 'Solar plexus (E)', hz: 329.63 },
  { id: 'heart', label: 'Heart (F)', hz: 349.23 },
  { id: 'throat', label: 'Throat (G)', hz: 392 },
  { id: 'brow', label: 'Brow (A)', hz: 440 },
  { id: 'crown', label: 'Crown (B)', hz: 493.88 },
  { id: '432', label: '432 Hz', hz: 432 },
];
export type BowlSet = 'chakras' | '432' | 'both';
export const BOWL_SETS: { value: BowlSet; label: string }[] = [
  { value: 'chakras', label: 'The seven tones, rising' },
  { value: '432', label: '432 Hz only' },
  { value: 'both', label: 'The seven, then 432 Hz' },
];
export const BOWL_GAPS = [15, 30, 60] as const;

export type BinauralPreset = 'delta' | 'theta4' | 'theta6' | 'alpha' | 'descent' | 'custom';
export const BINAURAL_PRESETS: { value: BinauralPreset; label: string; beat: number; line: string }[] = [
  { value: 'delta', label: 'Delta, 2 Hz', beat: 2, line: 'Slow: for deep rest.' },
  { value: 'theta4', label: 'Theta, 4 Hz', beat: 4, line: 'For drifting and dreaming.' },
  { value: 'theta6', label: 'Theta, 6 Hz', beat: 6, line: 'For inward journeys.' },
  { value: 'alpha', label: 'Alpha, 10 Hz', beat: 10, line: 'For relaxed, open attention.' },
  { value: 'descent', label: 'Slow descent', beat: 10, line: 'From alpha down to theta over the sit, in gentle steps.' },
  { value: 'custom', label: 'Your own', beat: 7, line: 'Choose the beat and the carrier.' },
];
/** The slow descent's steps: alpha (10 Hz) down to theta (5 Hz). */
export const DESCENT = [10, 8, 6.5, 5];
export const CARRIERS = [100, 150, 200, 250] as const;
export const BEATS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14] as const;
export const BINAURAL_NOTE =
  'Binaural layers need headphones: each ear hears a slightly different tone, and the difference is heard as a slow beat. Research into what they do is mixed, so take them as a gentle aid, not a promise. Don’t use them if you have epilepsy or a seizure disorder, and never while driving or doing anything that needs your attention.';

export type SoundMix = {
  /** Each layer's level, 0 (off) to 1. */
  levels: Partial<Record<LayerId, number>>;
  /** The drone's key (KEYS id). */
  key: string;
  /** The drum's beats a second. */
  tempo: number;
  bowlSet: BowlSet;
  /** Seconds between bowl strikes. */
  bowlEvery: number;
  binaural: BinauralPreset;
  carrier: number;
  /** The beat, for Your own. */
  beat: number;
};

export const DEFAULT_MIX: SoundMix = { levels: {}, key: 'D', tempo: DEFAULT_TEMPO, bowlSet: 'chakras', bowlEvery: 30, binaural: 'theta6', carrier: 200, beat: 7 };

const near = <T extends number>(list: readonly T[], v: unknown, fallback: T): T => {
  const n = Number(v);
  return Number.isFinite(n) ? list.reduce((best, x) => (Math.abs(x - n) < Math.abs(best - n) ? x : best), list[0]) : fallback;
};

export function cleanMix(raw: unknown): SoundMix {
  const m = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const rawLevels = (m.levels && typeof m.levels === 'object' ? m.levels : {}) as Record<string, unknown>;
  const levels: Partial<Record<LayerId, number>> = {};
  for (const l of LAYERS) {
    const v = Number(rawLevels[l.id]);
    if (Number.isFinite(v) && v > 0) levels[l.id] = Math.min(1, Math.round(v * 100) / 100);
  }
  return {
    levels,
    key: KEYS.some((k) => k.id === m.key) ? (m.key as string) : DEFAULT_MIX.key,
    tempo: near(TEMPOS, m.tempo, DEFAULT_TEMPO),
    bowlSet: BOWL_SETS.some((b) => b.value === m.bowlSet) ? (m.bowlSet as BowlSet) : 'chakras',
    bowlEvery: near(BOWL_GAPS, m.bowlEvery, 30),
    binaural: BINAURAL_PRESETS.some((b) => b.value === m.binaural) ? (m.binaural as BinauralPreset) : DEFAULT_MIX.binaural,
    carrier: near(CARRIERS, m.carrier, 200),
    beat: near(BEATS, m.beat, 7),
  };
}

export const levelOf = (mix: SoundMix, id: LayerId) => mix.levels[id] ?? 0;
export const mixOn = (mix: SoundMix) => LAYERS.some((l) => levelOf(mix, l.id) > 0);
export const keyHz = (key: string) => KEYS.find((k) => k.id === key)?.hz ?? KEYS[2].hz;
export const binauralBeat = (mix: SoundMix) => (mix.binaural === 'custom' ? mix.beat : (BINAURAL_PRESETS.find((b) => b.value === mix.binaural)?.beat ?? 6));

/** "Drone in D · Rain · Frame drum, 4.5 beats a second". */
export function mixLine(mix: SoundMix): string {
  const parts: string[] = [];
  for (const l of LAYERS) {
    if (!levelOf(mix, l.id)) continue;
    if (l.id === 'drone') parts.push(`Drone in ${mix.key}`);
    else if (l.id === 'drum') parts.push(`Frame drum, ${mix.tempo} beats a second`);
    else if (l.id === 'bowls') parts.push(`Singing bowls every ${mix.bowlEvery} seconds`);
    else if (l.id === 'binaural') parts.push(mix.binaural === 'descent' ? 'Binaural layers, alpha to theta' : `Binaural layers, ${binauralBeat(mix)} Hz`);
    else parts.push(l.label);
  }
  return parts.join(' · ') || 'Silence';
}

// ─── Each moment's mix ───────────────────────────────────────────────────

/** Seconds to fade in at the start and out at the end. */
export const FADE_MS = 12_000;
/** The callback is only drummed for timed sits at least this long. */
const CALLBACK_MIN_SIT = 3 * MIN;

/** The whole sound's length (settling, the sit, coming back), or null while an open-ended sit goes on. */
function soundEnd(plan: SitPlan, endedAtMs: number | null): number | null {
  if (plan.minutes !== null) return (plan.settle + plan.minutes + plan.warm) * MIN;
  return endedAtMs === null ? null : endedAtMs + plan.warm * MIN;
}

/** How loud everything is, 0 to 1: faded in from the start, and out to nothing at the end. */
export function masterAt(plan: SitPlan, elapsedMs: number, endedAtMs: number | null = null, fadeMs = FADE_MS): number {
  if (elapsedMs < 0) return 0;
  const end = soundEnd(plan, endedAtMs);
  const inF = Math.min(1, elapsedMs / fadeMs);
  const outF = end === null ? 1 : Math.max(0, Math.min(1, (end - elapsedMs) / fadeMs));
  return Math.round(Math.min(inF, outF) * 1000) / 1000;
}

/** When the callback begins (ms from the start), or null when there's none. */
export function callbackStart(mix: SoundMix, plan: SitPlan): number | null {
  if (plan.minutes === null || plan.minutes * MIN < CALLBACK_MIN_SIT || !levelOf(mix, 'drum')) return null;
  return (plan.settle + plan.minutes) * MIN - callbackBeats(mix.tempo).seconds * 1000;
}

/** The binaural beats sounding `sitMs` into the sit, and how loud each (they crossfade on the slow descent). */
export function binauralAt(mix: SoundMix, plan: SitPlan, sitMs: number): { beat: number; weight: number }[] {
  if (mix.binaural !== 'descent') return [{ beat: binauralBeat(mix), weight: 1 }];
  const length = plan.minutes === null ? 30 * MIN : plan.minutes * MIN;
  // Each step held, then a slow crossfade into the next.
  const pos = Math.max(0, Math.min(1, sitMs / length)) * (DESCENT.length - 1);
  const i = Math.min(DESCENT.length - 2, Math.floor(pos));
  const f = Math.max(0, Math.min(1, (pos - i - 0.6) / 0.4));
  return [
    { beat: DESCENT[i], weight: Math.round(Math.sqrt(1 - f) * 1000) / 1000 },
    { beat: DESCENT[i + 1], weight: Math.round(Math.sqrt(f) * 1000) / 1000 },
  ].filter((x) => x.weight > 0);
}

/** A loop or one-shot sound, by key: a bed's name, or what to make (synth.ts). */
export type Voice = { key: string; volume: number; /** Where in it to be now (ms), for those kept in step. */ atMs: number };

/**
 * What should be sounding `elapsedMs` in (pauses left out), and how loud:
 * each voice's key, its volume (already faded) and where in it to be.
 */
export function frameAt(mix: SoundMix, plan: SitPlan, elapsedMs: number, endedAtMs: number | null = null): Voice[] {
  const master = masterAt(plan, elapsedMs, endedAtMs);
  if (!master) return [];
  const settle = plan.settle * MIN;
  const sitMs = Math.max(0, elapsedMs - settle);
  const out: Voice[] = [];
  const add = (key: string, level: number, atMs = elapsedMs) => level > 0 && out.push({ key, volume: Math.round(level * master * 1000) / 1000, atMs });
  const bin = levelOf(mix, 'binaural');
  // Binaural tones sit under pink noise: if no noise is chosen, a soft pink comes with them.
  const noise = BEDS.some((b) => levelOf(mix, b) > 0);
  for (const bed of BEDS) add(bed, bed === 'pink' && !noise && bin ? Math.min(0.25, bin * 0.5) : levelOf(mix, bed));
  add(`drone:${keyHz(mix.key)}`, levelOf(mix, 'drone') * 0.7);
  const drum = levelOf(mix, 'drum');
  if (drum && elapsedMs >= settle) {
    const cb = callbackStart(mix, plan);
    const ended = plan.minutes === null && endedAtMs !== null && elapsedMs >= endedAtMs;
    if (cb !== null && elapsedMs >= cb) {
      if (elapsedMs < cb + callbackBeats(mix.tempo).seconds * 1000) add(`callback:${mix.tempo}`, drum, elapsedMs - cb);
    } else if (!ended && (plan.minutes === null || elapsedMs < settle + plan.minutes * MIN)) {
      add(`drum:${mix.tempo}`, drum, elapsedMs - settle);
    }
  }
  if (bin) for (const b of binauralAt(mix, plan, sitMs)) add(`binaural:${mix.carrier}:${b.beat}`, bin * 0.5 * b.weight);
  return out;
}

/** The bowls' tones in the order they're struck, round and round. */
export function bowlRound(set: BowlSet): number[] {
  const seven = [0, 1, 2, 3, 4, 5, 6];
  return set === '432' ? [7] : set === 'both' ? [...seven, 7] : seven;
}

export type Strike = { atMs: number; tone: number };

/** Every bowl strike (ms from the start), through the sit; an open-ended one is worked out four hours ahead. */
export function bowlStrikes(mix: SoundMix, plan: SitPlan): Strike[] {
  if (!levelOf(mix, 'bowls')) return [];
  const settle = plan.settle * MIN;
  const length = (plan.minutes ?? MAX_MINUTES) * MIN;
  const round = bowlRound(mix.bowlSet);
  const out: Strike[] = [];
  for (let t = 0, i = 0; t < length - 5_000; t += mix.bowlEvery * 1000, i++) out.push({ atMs: settle + t, tone: round[i % round.length] });
  return out;
}

/** The strikes to sound now: those after the last look and up to now, the latest only, and only if it's fresh (as the bells). */
export function strikesDue(strikes: Strike[], fromMs: number, toMs: number, graceMs = 3000): Strike[] {
  const passed = strikes.filter((s) => s.atMs > fromMs && s.atMs <= toMs);
  const last = passed[passed.length - 1];
  return last && toMs - last.atMs <= graceMs ? [last] : [];
}

/** One look at the sound: what should be playing now, and a bowl to strike (with its volume) if one's due since the last look. */
export function soundTick(mix: SoundMix, plan: SitPlan, strikes: Strike[], fromMs: number, elapsedMs: number, endedAtMs: number | null = null): { voices: Voice[]; strike: { key: string; volume: number } | null } {
  const voices = frameAt(mix, plan, elapsedMs, endedAtMs);
  const due = strikesDue(strikes, fromMs, elapsedMs)[0];
  const volume = Math.round(levelOf(mix, 'bowls') * masterAt(plan, elapsedMs, endedAtMs, 4000) * 1000) / 1000;
  return { voices, strike: due && volume > 0 ? { key: bowlKey(due.tone), volume } : null };
}

/** The key a bowl tone is made under. */
export const bowlKey = (tone: number) => `bowl:${BOWL_TONES[tone]?.hz ?? 432}`;

/** Makes the sound a key names, or null for a bed (played from its file). */
export function samplesFor(key: string): Pcm | null {
  const [kind, a, b] = key.split(':');
  if (kind === 'drone') return droneSamples(Number(a));
  if (kind === 'drum') return drumSamples(Number(a));
  if (kind === 'callback') return callbackSamples(Number(a));
  if (kind === 'binaural') return binauralSamples(Number(a), Number(b));
  if (kind === 'bowl') return bowlSamples(Number(a));
  return null;
}

/** How long a made loop is (ms), for keeping a drum in step; 0 when it isn't known without making it. */
export function loopMs(key: string): number {
  const [kind, a] = key.split(':');
  if (kind === 'drum') return drumLoopBeats(Number(a)).seconds * 1000;
  return 0;
}

// ─── Kept with a sit together ────────────────────────────────────────────

/** A shared layer for a sit together: a drum or bowls, the same for everyone and in step. */
export type SharedSound = { layer: 'drum' | 'bowls'; tempo: number; bowlSet: BowlSet; bowlEvery: number } | null;

export function cleanShared(raw: unknown): SharedSound {
  const s = (raw && typeof raw === 'object' ? raw : null) as Record<string, unknown> | null;
  if (!s || (s.layer !== 'drum' && s.layer !== 'bowls')) return null;
  const m = cleanMix({ tempo: s.tempo, bowlSet: s.bowlSet, bowlEvery: s.bowlEvery });
  return { layer: s.layer, tempo: m.tempo, bowlSet: m.bowlSet, bowlEvery: m.bowlEvery };
}

/** The shared layer as a mix of its own, at a medium level. */
export function sharedMix(shared: SharedSound): SoundMix | null {
  if (!shared) return null;
  return cleanMix({ levels: { [shared.layer]: 0.5 }, tempo: shared.tempo, bowlSet: shared.bowlSet, bowlEvery: shared.bowlEvery });
}

/** Your own mix with a sit together's shared layer laid in (yours wins where you've set the same layer). */
export function withShared(mine: SoundMix | null, shared: SharedSound): SoundMix | null {
  const s = sharedMix(shared);
  if (!s) return mine;
  if (!mine) return s;
  const layer = shared!.layer;
  return { ...mine, levels: { [layer]: s.levels[layer], ...mine.levels }, tempo: layer === 'drum' ? s.tempo : mine.tempo, bowlSet: layer === 'bowls' ? s.bowlSet : mine.bowlSet, bowlEvery: layer === 'bowls' ? s.bowlEvery : mine.bowlEvery };
}
