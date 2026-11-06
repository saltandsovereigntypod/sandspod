import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PROGRAMS, beatAt, compile } from '../src/lib/meditation/programs.ts';
import { CHUNK_MS, chirpChunk, earPath, knotAt, rampPath, rampVolume, type Phase } from '../src/lib/meditation/ramp.ts';

const prog = PROGRAMS.find((p) => p.stages.some((s) => s.beat.length > 1 && s.beat[0] !== s.beat[1]))!;
const c = compile(prog, 30);
const path = rampPath(c);
const RATE = 11025;

/** The frequency near sample `at` of x, from x[n+1] + x[n-1] = 2 cos(w) x[n]. */
function hzNear(x: Float32Array, at: number, w = 150): number {
  let num = 0;
  let den = 0;
  for (let n = at - w; n < at + w; n++) {
    num += x[n] * (x[n + 1] + x[n - 1]);
    den += 2 * x[n] * x[n];
  }
  return (Math.acos(num / den) * RATE) / (2 * Math.PI);
}

test('beat path follows the compiled ramp', () => {
  for (let ms = 1000; ms < c.totalMs - 1000; ms += 17_000) assert.ok(Math.abs(knotAt(path.beat, ms) - beatAt(c, ms)) < 0.2);
  const ear = earPath(path);
  for (let ms = 1000; ms < c.totalMs - 1000; ms += 53_000) {
    const d = knotAt(ear.right, ms) - knotAt(ear.left, ms);
    assert.ok(Math.abs(d - knotAt(path.beat, ms)) < 0.01);
  }
});

test('chirp chunks: frequency, phase and channels', () => {
  const start = Math.floor(c.segments[0].startMs / CHUNK_MS) * CHUNK_MS;
  let phase: Phase = { left: 0, right: 0 };
  const a = chirpChunk(path, start, CHUNK_MS, phase, false);
  const b = chirpChunk(path, start + CHUNK_MS, CHUNK_MS, a.phase, true);
  const n = Math.round((CHUNK_MS * RATE) / 1000);
  const t = start + CHUNK_MS;
  const tm = t + (1500 * 1000) / RATE;
  // Left ear is the carrier alone, right is carrier + beat, at the boundary.
  const hl = hzNear(b.pcm.channels[0], 1500);
  const hr = hzNear(b.pcm.channels[1], 1500);
  assert.ok(Math.abs(hl - knotAt(path.carrier, tm)) < 0.01, `left ${hl}`);
  assert.ok(Math.abs(hr - hl - knotAt(path.beat, tm)) < 0.01, `beat ${hr - hl}`);
  // No jump from the end of one chunk to the start of the next, for either ear.
  for (const ch of [0, 1]) {
    const hz = ch ? hr : hl;
    const step = 0.5 * ((2 * Math.PI * hz) / RATE);
    const edge = a.pcm.channels[ch][n - 1];
    const first = a.pcm.channels[ch][n] + b.pcm.channels[ch][0];
    assert.ok(Math.abs(first - edge) < step * 1.2, `jump ${Math.abs(first - edge)} vs ${step}`);
  }
  // The overlap tails sum to the wave itself (identical phase, linear fades).
  const tail = a.pcm.channels[0].length - n;
  for (let i = 0; i < tail; i++) {
    const sum = a.pcm.channels[0][n + i] + b.pcm.channels[0][i];
    const direct = chirpChunk(path, t, 100, a.phase, false).pcm.channels[0][i];
    assert.ok(Math.abs(sum - direct) < 1e-3);
  }
  phase = b.phase;
  assert.ok(Number.isFinite(phase.left));
});

test('ramp volume is silent before the start and loud in the middle', () => {
  assert.equal(rampVolume(c, 0), 0);
  assert.ok(rampVolume(c, c.totalMs / 2) > 0);
});
