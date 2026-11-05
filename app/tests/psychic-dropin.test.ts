import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cleanSettings, countdownLabel, DEFAULT_SETTINGS, dropDone, guidedAt, meditationUse, mixFor, revealAt, revealLabel, scaleMix } from '../src/lib/craft/psychic/dropin.ts';
import { newSession, normalizeSession, scoredRuns } from '../src/lib/craft/psychic/log.ts';
import { byMeditation } from '../src/lib/craft/psychic/stats.ts';

test('reveal timer: idle, running, ready, manual', () => {
  assert.equal(revealAt(null, 60).phase, 'idle');
  const mid = revealAt(15_000, 60);
  assert.equal(mid.phase, 'running');
  assert.equal(mid.leftMs, 45_000);
  assert.equal(mid.fraction, 0.25);
  assert.equal(revealAt(60_000, 60).phase, 'ready');
  assert.equal(revealAt(90_000, 60).leftMs, 0);
  const manual = revealAt(0, null);
  assert.equal(manual.phase, 'ready');
  assert.equal(manual.leftMs, null);
  assert.equal(countdownLabel(45_001), '0:46');
  assert.equal(revealLabel(90), '1 min 30s');
  assert.equal(revealLabel(null), 'Manual');
});

test('settings: defaults, cleaning, round trip', () => {
  assert.deepEqual(cleanSettings(undefined), DEFAULT_SETTINGS);
  assert.deepEqual(cleanSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS))), DEFAULT_SETTINGS);
  const s = cleanSettings({ sound: 'nope', revealSec: 99999, volume: 7, dropMinutes: 4, warmups: ['grounding', 'x'], guided: 'yes' });
  assert.equal(s.sound, 'descent');
  assert.equal(s.revealSec, 3600);
  assert.equal(s.volume, 1);
  assert.equal(s.dropMinutes, 10);
  assert.deepEqual(s.warmups, ['grounding']);
  assert.equal(s.guided, true);
  assert.equal(cleanSettings({ revealSec: null }).revealSec, null);
  assert.equal(cleanSettings({ dropMinutes: null }).dropMinutes, null);
});

test('mix and volume', () => {
  assert.equal(mixFor({ ...DEFAULT_SETTINGS, sound: 'none' }), null);
  assert.equal(mixFor({ ...DEFAULT_SETTINGS, sound: 'listen' }), null);
  const m = mixFor(DEFAULT_SETTINGS)!;
  assert.ok(m.levels.binaural! > 0);
  assert.equal(scaleMix(m, 0.5).levels.binaural, m.levels.binaural! * 0.5);
});

test('guided drop-in spreads the lines across the length', () => {
  const first = guidedAt(['grounding'], 0, 5)!;
  assert.equal(first.index, 0);
  assert.equal(first.finished, false);
  const late = guidedAt(['grounding'], 5 * 60_000, 5)!;
  assert.equal(late.finished, true);
  assert.equal(guidedAt([], 0, 5), null);
  assert.equal(guidedAt(['grounding'], 10 * 60_000, null)!.finished, true);
  assert.equal(dropDone(1, null), false);
  assert.equal(dropDone(180_000, 3), true);
});

test('sessions record meditation and the stats split by it', () => {
  assert.equal(meditationUse(DEFAULT_SETTINGS, false, false, 0), undefined);
  const use = meditationUse(DEFAULT_SETTINGS, true, true, 61_234)!;
  assert.deepEqual(use, { sound: true, preset: 'descent', guided: true, dropMs: 61_234 });
  const a = newSession({ kind: 'esp', trials: 10, hits: 4, chance: 0.2, summary: 'a', meditation: use });
  const b = newSession({ kind: 'esp', trials: 10, hits: 2, chance: 0.2, summary: 'b' });
  assert.deepEqual(normalizeSession(JSON.parse(JSON.stringify(a))).meditation, use);
  assert.equal(normalizeSession(b).meditation, undefined);
  assert.equal(normalizeSession({ ...b, meditation: { sound: false, guided: false } }).meditation, undefined);
  const split = byMeditation(scoredRuns([a, b].map((data, i) => ({ id: String(i), data }))));
  assert.deepEqual(split.map((s) => [s.label, s.hits, s.trials]), [['With meditation', 4, 10], ['Without', 2, 10]]);
});
