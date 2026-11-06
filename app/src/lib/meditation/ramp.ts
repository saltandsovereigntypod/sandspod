// Continuous binaural ramps for the programs. The old way played 8-second loops
// on a 0.5 Hz lattice and crossfaded the two nearest, so for a moment two beats
// sounded at once. Here the beat is one smooth line: the stage plan becomes
// "knots" (a frequency at a moment, straight lines between). The web follows
// them with two oscillators (webSound.ts); the app renders phase-continuous
// chirp chunks (chirpChunk) whose phase carries from one to the next. The left
// ear is the carrier alone; the right is the carrier plus the beat. Pure.

import { carrierHz, gainAt, programPlan, type Compiled } from './programs.ts';
import { masterAt } from './sound.ts';
import type { Pcm } from './synth.ts';

export type Knot = { ms: number; hz: number };
export type RampPath = { carrier: Knot[]; beat: Knot[] };
/** The same path as each ear's frequency (left = carrier, right = carrier + beat) on shared moments. */
export type EarPath = { left: Knot[]; right: Knot[] };

/** A carrier change glides over this long, centred on the stage boundary. */
export const GLIDE_MS = 20_000;
/** A jump between one stage's last beat and the next one's first is eased over this long. */
const STEP_MS = 3_000;
/** Native chunk length, and the short identical-phase overlap that hides the player's start latency. */
export const CHUNK_MS = 25_000;
export const OVERLAP_MS = 40;
export const RAMP_RATE = 11025;
const AMP = 0.5;

/** The frequency path of a compiled program: beats ramp across each stage, the carrier glides between stages. */
export function rampPath(c: Compiled): RampPath {
  const beat: Knot[] = [];
  const carrier: Knot[] = [];
  const segs = c.segments;
  segs.forEach((s, i) => {
    const len = s.endMs - s.startMs;
    const pts = s.beat.length === 1 ? [s.beat[0], s.beat[0]] : s.beat;
    const last = beat[beat.length - 1];
    pts.forEach((hz, k) => {
      const ms = s.startMs + (len * k) / (pts.length - 1);
      if (k === 0 && last && last.hz !== hz) {
        // A jump between stages: hold the old beat at the boundary, then ease to the new.
        beat.push({ ms, hz: last.hz }, { ms: ms + Math.min(STEP_MS, len / 2), hz });
      } else beat.push({ ms, hz });
    });
    const cz = carrierHz(s.carrier);
    const next = segs[i + 1];
    if (i === 0) carrier.push({ ms: s.startMs, hz: cz });
    if (!next) carrier.push({ ms: s.endMs, hz: cz });
    else if (carrierHz(next.carrier) !== cz) {
      const h = Math.min(GLIDE_MS / 2, len / 2, (next.endMs - next.startMs) / 2);
      carrier.push({ ms: s.endMs - h, hz: cz }, { ms: s.endMs + h, hz: carrierHz(next.carrier) });
    }
  });
  return { carrier, beat };
}

/** The frequency at `ms`: a cursor that is cheap while time only moves forwards. */
export function evaluator(knots: Knot[]): (ms: number) => number {
  let i = 0;
  return (ms) => {
    if (ms < knots[i].ms) i = 0;
    while (i < knots.length - 1 && knots[i + 1].ms <= ms) i++;
    const a = knots[i];
    const b = knots[i + 1];
    if (!b || ms <= a.ms) return a.hz;
    return a.hz + ((b.hz - a.hz) * (ms - a.ms)) / (b.ms - a.ms);
  };
}
export const knotAt = (knots: Knot[], ms: number) => evaluator(knots)(ms);

/** Each ear's path, on every moment either line bends. */
export function earPath(p: RampPath): EarPath {
  const times = [...new Set([...p.carrier, ...p.beat].map((k) => k.ms))].sort((a, b) => a - b);
  const c = evaluator(p.carrier);
  const b = evaluator(p.beat);
  return { left: times.map((ms) => ({ ms, hz: c(ms) })), right: times.map((ms) => ({ ms, hz: c(ms) + b(ms) })) };
}

/** How loud the ramp is at `ms` (as the loops were: 0.3 x master x the program's gain and volume). */
export function rampVolume(c: Compiled, ms: number): number {
  const master = masterAt(programPlan(c), ms);
  return Math.round(0.3 * master * gainAt(c, ms) * c.volume * 1000) / 1000;
}

export type Phase = { left: number; right: number };
const TAU = 2 * Math.PI;

/**
 * One chunk of the ramp, stereo, from `startMs`: `ms` long plus a short tail
 * (OVERLAP_MS) of the same continuing wave. Each ear's phase starts where
 * `phase` says and the returned `phase` is where it stands after the `ms`
 * (not the tail), ready for the next chunk. A chunk that follows another
 * fades in over the overlap, and every chunk fades its tail out, so two
 * chunks sounding together there add up to the one wave.
 */
export function chirpChunk(path: RampPath, startMs: number, ms: number, phase: Phase, follows: boolean, rate = RAMP_RATE): { pcm: Pcm; phase: Phase } {
  const main = Math.round((ms * rate) / 1000);
  const tail = Math.round((OVERLAP_MS * rate) / 1000);
  const n = main + tail;
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const car = evaluator(path.carrier);
  const bt = evaluator(path.beat);
  let pl = phase.left;
  let pr = phase.right;
  let end: Phase = phase;
  for (let i = 0; i < n; i++) {
    if (i === main) end = { left: pl, right: pr };
    const t = startMs + (i * 1000) / rate;
    const c = car(t);
    const b = bt(t);
    let g = AMP;
    if (follows && i < tail) g *= i / tail;
    if (i >= main) g *= 1 - (i - main) / tail;
    L[i] = g * Math.sin(pl);
    R[i] = g * Math.sin(pr);
    pl = (pl + (TAU * c) / rate) % TAU;
    pr = (pr + (TAU * (c + b)) / rate) % TAU;
  }
  return { pcm: { rate, channels: [L, R], loop: false }, phase: end };
}
