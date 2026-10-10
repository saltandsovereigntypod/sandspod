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

test('the Moon’s own sign, from its position (Meeus ch. 47)', async () => {
  const { moonLongitude, moonSign, nextMoonIngress, nextPhase, signAtSyzygy } = await import('../src/lib/moon.ts');
  // Meeus example 47.a: 1992 April 12, 0h → 133.1627°.
  const example = new Date((2448724.5 - 2440587.5) * 86_400_000);
  assert.ok(Math.abs(moonLongitude(example) - 133.1627) < 0.02);
  // At new and full moon its sign agrees with the Sun-based shortcut.
  for (const from of [new Date('2026-01-01T00:00:00Z'), new Date('2026-07-01T00:00:00Z'), new Date('2031-03-01T00:00:00Z')]) {
    for (const phase of ['new', 'full'] as const) {
      const at = nextPhase(from, phase);
      assert.equal(moonSign(at), signAtSyzygy(at, phase));
    }
  }
  // It moves on to the next sign within a few days, and stays there.
  const now = new Date('2026-10-11T01:19:00Z');
  assert.equal(moonSign(now), 'Libra');
  const ingress = nextMoonIngress(now);
  assert.equal(ingress.sign, 'Scorpio');
  assert.ok(ingress.date.getTime() > now.getTime() && ingress.date.getTime() - now.getTime() < 3 * 86_400_000);
  assert.equal(moonSign(new Date(ingress.date.getTime() + 60_000)), 'Scorpio');
  assert.equal(moonSign(new Date(ingress.date.getTime() - 60_000)), 'Libra');
});

test('solstices and equinoxes come from the Sun’s position, every year', async () => {
  const { sunReaches } = await import('../src/lib/moon.ts');
  // Published times (UTC); within 15 minutes.
  const near = (date: Date, iso: string) => assert.ok(Math.abs(date.getTime() - Date.parse(iso)) < 15 * 60_000, `${date.toISOString()} vs ${iso}`);
  near(sunReaches(2026, 0), '2026-03-20T14:46:00Z');
  near(sunReaches(2026, 90), '2026-06-21T08:24:00Z');
  near(sunReaches(2026, 180), '2026-09-23T00:05:00Z');
  near(sunReaches(2026, 270), '2026-12-21T20:50:00Z');
  near(sunReaches(2027, 0), '2027-03-20T20:24:00Z');
  near(sunReaches(2030, 90), '2030-06-21T07:31:00Z');
});
