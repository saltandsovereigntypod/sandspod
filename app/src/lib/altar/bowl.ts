// The singing bowl on the altar: "Strike once", or "Ring every N minutes"
// (1 to 10) until you stop it, in one of eight tones. Seven follow the modern
// chakra convention that pairs each chakra with a note of the C major scale
// (root C, sacral D, solar plexus E, heart F, throat G, third eye A, crown B;
// a twentieth-century Western pairing, one of several), and one is the
// 432 Hz many sound healers favour (a modern preference; no historical
// tuning). The sound is synthesised, nothing recorded (app/scripts/
// build-bowl-sounds.py writes assets/sounds/bowl-<tone>.mp3 from
// BOWL_PARTIALS): a few inharmonic partials of a struck bowl, each a slowly
// beating pair, with a long decay. Like the bell it rings under Candle
// sounds and Vibration in Accessibility, and as you strike it on purpose it
// sounds through the silent switch. On a coven altar everyone there hears it.
// Pure, so it can be tested; shared with the website (js/core/altar.js bowl).

import type { SavedObject } from './types.ts';

export const isSingingBowl = (o: Pick<SavedObject, 'type' | 'tool'> | null | undefined) => !!o && o.type === 'tool' && /singing-bowl/.test(String(o.tool || ''));

export type BowlToneId = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown' | '432';
export type BowlTone = { id: BowlToneId; label: string; note: string; hz: number };

/** Equal temperament from A = 440 Hz, in the octave above middle C. */
export const BOWL_TONES: BowlTone[] = [
  { id: 'root', label: 'Root', note: 'C', hz: 261.63 },
  { id: 'sacral', label: 'Sacral', note: 'D', hz: 293.66 },
  { id: 'solar', label: 'Solar plexus', note: 'E', hz: 329.63 },
  { id: 'heart', label: 'Heart', note: 'F', hz: 349.23 },
  { id: 'throat', label: 'Throat', note: 'G', hz: 392.0 },
  { id: 'third-eye', label: 'Third eye', note: 'A', hz: 440.0 },
  { id: 'crown', label: 'Crown', note: 'B', hz: 493.88 },
  { id: '432', label: '432 Hz', note: 'A', hz: 432 },
];
export const DEFAULT_TONE: BowlToneId = 'heart';
export const bowlTone = (id: unknown): BowlTone => BOWL_TONES.find((t) => t.id === id) ?? BOWL_TONES.find((t) => t.id === DEFAULT_TONE)!;
/** The tone kept on the bowl (`bowlTone` on the object). */
export const toneOf = (o: SavedObject | null | undefined) => bowlTone(o?.bowlTone);
export const toneLabel = (t: BowlTone) => (t.id === '432' ? '432 Hz' : `${t.label} · ${t.note}`);

/**
 * The partials of a struck bowl, as multiples of its tone: a bowl's modes sit
 * at roughly 1, 2.7, 5.1 and 8.4 times the fundamental, not whole-number
 * harmonics. Each sounds as two close pitches `beat` Hz apart (the slow
 * wavering of a real bowl) and fades over `decay` seconds.
 */
export const BOWL_PARTIALS = [
  { ratio: 1, gain: 1, decay: 9, beat: 0.6 },
  { ratio: 2.71, gain: 0.45, decay: 6, beat: 1.4 },
  { ratio: 5.13, gain: 0.2, decay: 3.4, beat: 2.3 },
  { ratio: 8.42, gain: 0.08, decay: 1.8, beat: 3.1 },
];
/** How long each sound file runs, in seconds. */
export const BOWL_SECONDS = 9;
export const bowlSoundFile = (id: BowlToneId) => `bowl-${id}.mp3`;

export const EVERY_MIN = 1;
export const EVERY_MAX = 10;
export const clampEvery = (n: unknown) => Math.min(EVERY_MAX, Math.max(EVERY_MIN, Math.round(Number(n) || EVERY_MIN)));

/** When the next strike falls, ringing every `everyMin` minutes from `startedAt` (ms): the first at the start. */
export function nextStrikeAt(startedAt: number, everyMin: number, now: number): number {
  const gap = clampEvery(everyMin) * 60_000;
  if (now <= startedAt) return startedAt;
  return startedAt + Math.ceil((now - startedAt) / gap) * gap;
}

/** How many strikes have fallen by `now` (the first at the start). */
export function strikesBy(startedAt: number, everyMin: number, now: number): number {
  if (now < startedAt) return 0;
  return Math.floor((now - startedAt) / (clampEvery(everyMin) * 60_000)) + 1;
}

/** One strike per person per this long, heard by the others on a coven altar. */
export const STRIKE_GAP_MS = 1500;

export const STRIKE_LABEL = 'Strike once';
export const EVERY_LABEL = 'Ring every few minutes';
export const strikeLine = (t: BowlTone) => `The singing bowl was struck (${toneLabel(t)}).`;
export const everyLine = (t: BowlTone, every: number) => `The singing bowl rang every ${clampEvery(every)} minute${clampEvery(every) === 1 ? '' : 's'} (${toneLabel(t)}).`;
