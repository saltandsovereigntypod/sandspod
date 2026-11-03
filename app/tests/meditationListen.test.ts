import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cleanListen, cleanTimer, DEFAULT_LISTEN_MIX, listenEnd, listenLogParams, listenPlan, listenState, stopAt } from '../src/lib/meditation/listen.ts';
import { normalizeSit } from '../src/lib/meditation/log.ts';
import { binauralAt, cleanMix, frameAt, masterAt } from '../src/lib/meditation/sound.ts';

const MIN = 60_000;

test('the slow descent spans the stop timer, or 30 minutes when open-ended', () => {
  const mix = cleanMix({ levels: { binaural: 0.5 }, binaural: 'descent' });
  assert.deepEqual(binauralAt(mix, listenPlan(90), 0), [{ beat: 10, weight: 1 }]);
  // At the end of the timer it has reached theta; halfway through 30 minutes it's still on the way.
  assert.equal(binauralAt(mix, listenPlan(90), 90 * MIN).at(-1)!.beat, 5);
  assert.notEqual(binauralAt(mix, listenPlan(90), 30 * MIN).at(-1)!.beat, 5);
  assert.equal(binauralAt(mix, listenPlan(null), 30 * MIN).at(-1)!.beat, 5);
});

test('a listen fades in, plays on, and fades out to the timer or after Stop', () => {
  const mix = cleanMix({ levels: { rain: 0.8 } });
  const plan = listenPlan(15);
  const end = listenEnd(15)!;
  assert.equal(end, 15 * MIN);
  assert.equal(masterAt(plan, 0, end), 0);
  assert.equal(masterAt(plan, 5 * MIN, end), 1);
  assert.equal(frameAt(mix, plan, end, end).length, 0);
  assert.deepEqual(listenState(end - 1000, end), { done: false, leftMs: 1000 });
  assert.equal(listenState(end, end).done, true);
  // Stop fades out from now, never later than the timer.
  assert.equal(stopAt(2 * MIN, end), 2 * MIN + 12_000);
  assert.equal(stopAt(end - 1000, end), end);
  assert.equal(stopAt(2 * MIN, null), 2 * MIN + 12_000);
  assert.ok(masterAt(listenPlan(null), 2 * MIN + 6000, stopAt(2 * MIN, null)) < 1);
  // Open-ended plays on until stopped.
  assert.deepEqual(listenState(5 * 60 * MIN, null), { done: false, leftMs: null });
});

test('the Listen mix and timer are cleaned, and a kept listen is a Listening sit', () => {
  assert.deepEqual(cleanListen(null), DEFAULT_LISTEN_MIX);
  assert.equal(cleanListen({ levels: { fire: 0.5 } }).levels.fire, 0.5);
  assert.equal(cleanTimer('45'), 45);
  assert.equal(cleanTimer(''), null);
  assert.equal(cleanTimer(17), null);
  const p = listenLogParams(Date.UTC(2026, 10, 3, 20), 31 * MIN);
  assert.equal(p.kind, 'listening');
  assert.equal(p.minutes, '31');
  assert.equal(normalizeSit({ ...p, minutes: 31 }).kind, 'listening');
});
