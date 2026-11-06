import assert from 'node:assert/strict';
import { test } from 'node:test';

import { forkClearCare, isTuningFork } from '../src/lib/altar/fork.ts';
import { beatHz, CHAKRA, CLEARING_HZ, COSMIC, FORK_SETS, forkEnvelope, forkForPlanet, forkGain, forkKey, forkLine, parseForkKey, SOLFEGGIO } from '../src/lib/meditation/forks.ts';
import { bowlStrikes, cleanMix, mixLine, samplesFor } from '../src/lib/meditation/sound.ts';
import { forkSamples } from '../src/lib/meditation/synth.ts';
import { DEFAULT_PLAN } from '../src/lib/meditation/timer.ts';

test('frequency tables', () => {
  assert.deepEqual(SOLFEGGIO.map((f) => f.hz[0]), [174, 285, 396, 417, 528, 639, 741, 852, 963]);
  assert.equal(COSMIC.length, 9);
  assert.equal(COSMIC[0].hz[0], 136.1);
  assert.equal(CHAKRA.length, 7);
  assert.ok(FORK_SETS.every((s) => s.forks.every((f) => f.line && f.hz.length >= 1 && f.hz.length <= 2)));
  assert.equal(forkForPlanet('Venus')?.hz[0], 221.23);
  assert.equal(forkForPlanet('Rahu'), null);
});

test('pairs beat at the difference', () => {
  assert.equal(beatHz([128, 136.1]), 8.1);
  assert.equal(beatHz([136.1]), 0);
  assert.match(forkLine(FORK_SETS.find((s) => s.id === 'pairs')!.forks[0]), /8/);
});

test('decay envelope', () => {
  const e = forkEnvelope(30);
  assert.equal(e.clangRatio, 6.25);
  assert.ok(Math.abs(Math.exp(-e.seconds / e.tau) - 0.001) < 1e-9);
  assert.equal(forkEnvelope(5).seconds, 20);
  assert.equal(forkEnvelope(500).seconds, 60);
  assert.ok(e.clangTau * 3 <= 0.16);
});

test('the clearing fork is played gently', () => {
  assert.ok(forkGain(CLEARING_HZ) < forkGain(528));
});

test('fork keys round-trip and make sound', () => {
  const key = forkKey([128, 136.1], 20);
  assert.equal(key, 'fork:128+136.1:20');
  assert.deepEqual(parseForkKey(key), { hz: [128, 136.1], decay: 20 });
  assert.equal(parseForkKey('fork:abc'), null);
  const a = samplesFor(key)!.channels[0];
  assert.equal(a.length, 20 * 22050);
  const peakAt = (s: number) => Math.max(...Array.from(a.slice(s * 22050, s * 22050 + 2000), Math.abs));
  assert.ok(peakAt(0) > peakAt(10) && peakAt(10) > peakAt(18));
  assert.equal(forkSamples([4096], 20).channels[0].length, 20 * 22050);
});

test('forks as a layer', () => {
  const mix = cleanMix({ levels: { forks: 0.5 }, forkSet: 'solfeggio', forkEvery: 30 });
  assert.equal(mix.forkSet, 'solfeggio');
  assert.equal(cleanMix({ forkSet: 'nope' }).forkSet, 'cosmic');
  const strikes = bowlStrikes(mix, { ...DEFAULT_PLAN, minutes: 5 });
  assert.equal(strikes[0].key, 'fork:174:30');
  assert.equal(strikes[1].key, 'fork:285:30');
  assert.match(mixLine(mix), /Tuning forks \(Solfeggio\)/);
});

test('altar fork', () => {
  assert.ok(isTuningFork({ type: 'tool', tool: 'tuning-fork' }));
  assert.ok(!isTuningFork({ type: 'tool', tool: 'bell' }));
  assert.deepEqual(forkClearCare(false, 'x').methods, ['Sound', 'Tuning fork (4096 Hz)']);
});
