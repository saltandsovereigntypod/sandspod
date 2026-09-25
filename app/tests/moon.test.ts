import assert from 'node:assert/strict';
import { test } from 'node:test';

import { moonState, nextPhase, signAtSyzygy, upcomingPhases } from '../src/lib/moon.ts';

const MINUTE = 60_000;

function assertNear(actual: Date, expectedIso: string, toleranceMinutes = 5) {
  const diff = Math.abs(actual.getTime() - new Date(expectedIso).getTime()) / MINUTE;
  assert.ok(diff <= toleranceMinutes, `${actual.toISOString()} is ${diff.toFixed(1)} min from ${expectedIso}`);
}

// Reference times (UTC) from published almanac tables.
test('new moon of the April 2024 total solar eclipse', () => {
  assertNear(nextPhase(new Date('2024-04-01T00:00:00Z'), 'new'), '2024-04-08T18:21:00Z');
});

test('full moon of January 2025', () => {
  assertNear(nextPhase(new Date('2025-01-01T00:00:00Z'), 'full'), '2025-01-13T22:27:00Z');
});

test('full moon of September 2026 falls in Aries', () => {
  const full = nextPhase(new Date('2026-09-20T00:00:00Z'), 'full');
  assertNear(full, '2026-09-26T16:49:00Z');
  assert.equal(signAtSyzygy(full, 'full'), 'Aries');
});

test('upcoming phases come in order and never repeat', () => {
  const events = upcomingPhases(new Date('2026-09-25T20:00:00Z'), 8);
  assert.deepEqual(
    events.map((e) => e.phase),
    ['full', 'lastQuarter', 'new', 'firstQuarter', 'full', 'lastQuarter', 'new', 'firstQuarter'],
  );
  for (let i = 1; i < events.length; i += 1) {
    assert.ok(events[i].date > events[i - 1].date);
  }
});

test('the evening before a full moon is a bright waxing gibbous', () => {
  const state = moonState(new Date('2026-09-25T20:00:00Z'));
  assert.equal(state.name, 'Waxing Gibbous');
  assert.equal(state.waxing, true);
  assert.ok(state.illumination > 0.95 && state.illumination < 1);
});

test('within hours of a principal phase the moon takes its name', () => {
  assert.equal(moonState(new Date('2026-09-26T12:00:00Z')).name, 'Full Moon');
  assert.equal(moonState(new Date('2024-04-08T20:00:00Z')).name, 'New Moon');
});

test('a week after new moon is waxing, a week after full is waning', () => {
  assert.equal(moonState(new Date('2024-04-12T00:00:00Z')).name, 'Waxing Crescent');
  const waning = moonState(new Date('2025-01-17T00:00:00Z'));
  assert.equal(waning.name, 'Waning Gibbous');
  assert.equal(waning.waxing, false);
});
