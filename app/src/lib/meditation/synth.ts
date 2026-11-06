// The meditation sounds that depend on what you choose, made as you begin:
// a drone in your key, a frame drum at your tempo (and its callback at the
// end of the sit), singing-bowl tones, and binaural tones at your carrier
// and beat. Each loop is made of whole cycles of every tone in it (or whole
// beats of the drum), so it meets itself without a seam. Plain numbers out
// (Float32Array per channel), so the app writes them as a WAV file for
// expo-audio (wavBytes) and the browser hands them to Web Audio as they are.
// The noise beds (pink, brown, rain, wind, fire) are files made once by
// scripts/sounds/meditation_beds.py. Seeded, so the same choice makes the
// same sound. Pure.

import { DEFAULT_FORK_DECAY, forkEnvelope, forkGain } from './forks.ts';

export const SYNTH_RATE = 22050;
/** Tonal loops are this long: long enough that the loop isn't heard as one. */
const LOOP_SECONDS = 8;

/** A small seeded random number source (mulberry32). */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A frequency moved to the nearest one that fits whole cycles into the loop. */
export const fitHz = (hz: number, seconds = LOOP_SECONDS) => Math.max(1, Math.round(hz * seconds)) / seconds;

export type Pcm = { rate: number; channels: Float32Array[]; loop: boolean };

function normalise(channels: Float32Array[], peak: number) {
  let max = 0;
  for (const c of channels) for (let i = 0; i < c.length; i++) max = Math.max(max, Math.abs(c[i]));
  if (max > 0) for (const c of channels) for (let i = 0; i < c.length; i++) c[i] = (c[i] / max) * peak;
}

/** A drone: the root, its fifth and octave, each a slowly beating pair, swelling gently. */
export function droneSamples(rootHz: number, rate = SYNTH_RATE): Pcm {
  const n = LOOP_SECONDS * rate;
  const out = new Float32Array(n);
  const voices: [number, number][] = [
    [rootHz, 1],
    [rootHz * 1.5, 0.45],
    [rootHz * 2, 0.35],
    [rootHz * 3, 0.08],
  ];
  const parts = voices.flatMap(([hz, amp]) => [
    [fitHz(hz), amp],
    [fitHz(hz) + 1 / LOOP_SECONDS, amp * 0.7],
  ]);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    let v = 0;
    for (const [hz, amp] of parts) v += amp * Math.sin(2 * Math.PI * hz * t);
    // A slow swell, one breath per loop.
    out[i] = v * (0.8 + 0.2 * Math.sin((2 * Math.PI * t) / LOOP_SECONDS));
  }
  normalise([out], 0.6);
  return { rate, channels: [out], loop: true };
}

/** Binaural tones: the carrier in the left ear, carrier + beat in the right. */
export function binauralSamples(carrierHz: number, beatHz: number, rate = SYNTH_RATE): Pcm {
  const n = LOOP_SECONDS * rate;
  const left = new Float32Array(n);
  const right = new Float32Array(n);
  const l = fitHz(carrierHz);
  const r = l + fitHz(beatHz);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    left[i] = 0.5 * Math.sin(2 * Math.PI * l * t);
    right[i] = 0.5 * Math.sin(2 * Math.PI * r * t);
  }
  return { rate, channels: [left, right], loop: true };
}

/** One stroke of a frame drum: a low thump that drops in pitch, and the skin's brief rattle. */
function stroke(out: Float32Array, at: number, rate: number, gain: number, low: boolean, rand: () => number) {
  const n = out.length;
  const len = Math.floor(rate * 0.45);
  const f0 = low ? 95 : 120;
  let phase = 0;
  for (let i = 0; i < len; i++) {
    const t = i / rate;
    const hz = f0 * (0.62 + 0.38 * Math.exp(-t * 18));
    phase += (2 * Math.PI * hz) / rate;
    const body = Math.sin(phase) * Math.exp(-t * (low ? 7 : 9));
    const skin = (rand() * 2 - 1) * Math.exp(-t * 90) * 0.35;
    out[(at + i) % n] += gain * (body + skin);
  }
}

/** The moments (seconds) of the drum's beats over one loop: a steady pulse, every fourth a little stronger. */
export function drumLoopBeats(tempo: number): { seconds: number; beats: { at: number; strong: boolean }[] } {
  const count = Math.max(4, Math.round((LOOP_SECONDS * tempo) / 4) * 4);
  const seconds = count / tempo;
  return { seconds, beats: Array.from({ length: count }, (_, i) => ({ at: i / tempo, strong: i % 4 === 0 })) };
}

/** A frame drum's steady trance rhythm at `tempo` beats a second, looped. Strokes vary a little, as a hand's do. */
export function drumSamples(tempo: number, rate = SYNTH_RATE): Pcm {
  const { seconds, beats } = drumLoopBeats(tempo);
  const out = new Float32Array(Math.round(seconds * rate));
  const rand = seeded(Math.round(tempo * 100));
  for (const b of beats) {
    const wobble = Math.round((rand() - 0.5) * 0.008 * rate);
    stroke(out, Math.max(0, Math.round(b.at * rate) + wobble), rate, (b.strong ? 1 : 0.62) * (0.9 + rand() * 0.2), b.strong, rand);
  }
  normalise([out], 0.7);
  return { rate, channels: [out], loop: true };
}

/**
 * The callback, at the end of the sit: the steady beat gives way to three
 * slow rounds of seven strong strokes, a short run of quick drumming, and
 * three rounds of seven again, to call you back. (A change of rhythm to call
 * a journeyer back is a modern drumming practice; this pattern is our own.)
 * The moments (seconds) of its strokes, and how long it is.
 */
export function callbackBeats(tempo: number): { seconds: number; beats: { at: number; strong: boolean }[] } {
  const beats: { at: number; strong: boolean }[] = [];
  let t = 0;
  const sevens = () => {
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < 7; i++) beats.push({ at: t + i * 0.5, strong: true });
      t += 7 * 0.5 + 1.5;
    }
  };
  sevens();
  const quick = Math.min(9, Math.max(tempo * 1.6, 6));
  const run = 20;
  for (let i = 0; i < run * quick; i++) beats.push({ at: t + i / quick, strong: i % 4 === 0 });
  t += run + 1;
  sevens();
  return { seconds: t + 1.5, beats };
}

export function callbackSamples(tempo: number, rate = SYNTH_RATE): Pcm {
  const { seconds, beats } = callbackBeats(tempo);
  const out = new Float32Array(Math.round(seconds * rate) + Math.floor(rate * 0.5));
  const rand = seeded(7 + Math.round(tempo * 100));
  for (const b of beats) stroke(out, Math.round(b.at * rate), rate, b.strong ? 1 : 0.6, b.strong, rand);
  normalise([out], 0.75);
  return { rate, channels: [out], loop: false };
}

/** A singing bowl struck once: a few inharmonic partials, each a slowly beating pair, ringing out over about seven seconds. */
export function bowlSamples(hz: number, rate = SYNTH_RATE): Pcm {
  const seconds = 7;
  const n = seconds * rate;
  const out = new Float32Array(n);
  const parts: [number, number, number][] = [
    [1, 1, 0.55],
    [2.71, 0.45, 0.9],
    [5.15, 0.22, 1.6],
    [8.43, 0.08, 2.6],
  ];
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const attack = Math.min(1, t / 0.01);
    let v = 0;
    for (const [ratio, amp, decay] of parts) {
      const f = hz * ratio;
      v += amp * Math.exp(-t * decay) * (Math.sin(2 * Math.PI * f * t) + 0.6 * Math.sin(2 * Math.PI * (f + 1.3 * ratio) * t));
    }
    // Faded to nothing by the end.
    out[i] = v * attack * Math.min(1, (seconds - t) / 0.6);
  }
  normalise([out], 0.7);
  return { rate, channels: [out], loop: false };
}

/**
 * A tuning fork (or two struck together) once: a near-pure sine with a faint
 * inharmonic clang at the strike, then a long exponential decay and a slight
 * shimmer (forks.ts forkEnvelope). Very high forks are played gently.
 */
export function forkSamples(hzs: number[], decaySeconds = DEFAULT_FORK_DECAY, rate = SYNTH_RATE): Pcm {
  const env = forkEnvelope(decaySeconds);
  const n = Math.round(env.seconds * rate);
  const out = new Float32Array(n);
  hzs.forEach((hz, k) => {
    const gain = forkGain(hz);
    const clang = hz * env.clangRatio < rate * 0.45;
    const phase = k * 1.9;
    for (let i = 0; i < n; i++) {
      const t = i / rate;
      const attack = Math.min(1, t / env.attack);
      const shimmer = 1 + env.shimmerDepth * Math.sin(2 * Math.PI * env.shimmerHz * t + phase);
      let v = Math.exp(-t / env.tau) * shimmer * Math.sin(2 * Math.PI * hz * t);
      if (clang) v += env.clangGain * Math.exp(-t / env.clangTau) * Math.sin(2 * Math.PI * hz * env.clangRatio * t);
      out[i] += (v * attack * gain) / hzs.length;
    }
  });
  const tail = Math.min(n, Math.round(rate * 0.5));
  for (let i = 0; i < tail; i++) out[n - 1 - i] *= i / tail;
  normalise([out], 0.7 * Math.max(...hzs.map(forkGain)));
  return { rate, channels: [out], loop: false };
}

/** The samples as a 16-bit PCM WAV file. */
export function wavBytes(pcm: Pcm): Uint8Array {
  const channels = pcm.channels.length;
  const frames = pcm.channels[0].length;
  const dataBytes = frames * channels * 2;
  const buf = new ArrayBuffer(44 + dataBytes);
  const v = new DataView(buf);
  const str = (at: number, s: string) => [...s].forEach((ch, i) => v.setUint8(at + i, ch.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + dataBytes, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, channels, true);
  v.setUint32(24, pcm.rate, true);
  v.setUint32(28, pcm.rate * channels * 2, true);
  v.setUint16(32, channels * 2, true);
  v.setUint16(34, 16, true);
  str(36, 'data');
  v.setUint32(40, dataBytes, true);
  let at = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      const s = Math.max(-1, Math.min(1, pcm.channels[c][i]));
      v.setInt16(at, Math.round(s * 32767), true);
      at += 2;
    }
  }
  return new Uint8Array(buf);
}
