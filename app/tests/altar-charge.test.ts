import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CHARGE_FADE_DAYS,
  chargeLevel,
  chargeLine,
  chargeOf,
  chargeStrength,
  lastChargedAt,
  momentFor,
  recordCharge,
  recordCleanse,
} from '../src/lib/altar/charge.ts';
import { careForCrystal } from '../src/lib/altar/devotion.ts';
import { appHistoryOf, appStateOf, parseLivingState } from '../src/lib/altar/livingState.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const DAY = 86_400_000;
const start = Date.UTC(2026, 9, 1, 20);
const iso = (days: number) => new Date(start + days * DAY).toISOString();
const crystal = (): SavedObject => ({ type: 'crystal', label: 'Amethyst', altarObjectId: 'c1' });
const charged = () =>
  careForCrystal(crystal(), 'charge', { decision: 'General energetic charge', purpose: 'General recharge', methods: ['Moonlight'], supports: [], occurredAt: iso(0) }, iso(0));

test('a charge holds strong, settles, then fades over about a moon', () => {
  assert.equal(chargeStrength(start, start), 1);
  assert.ok(chargeStrength(start, start + 5 * DAY) > 0.9, 'still strong after five days');
  assert.ok(chargeStrength(start, start + 20 * DAY) < 0.6);
  assert.equal(chargeStrength(start, start + CHARGE_FADE_DAYS * DAY), 0);
  assert.equal(chargeStrength(start, start + 40 * DAY), 0);
  assert.equal(chargeStrength(NaN, start), 0);
  // Never goes up as time passes.
  let last = 1;
  for (let d = 0; d <= 30; d++) {
    const s = chargeStrength(start, start + d * DAY);
    assert.ok(s <= last);
    last = s;
  }
});

test('levels and the panel words', () => {
  assert.equal(chargeLevel(0), 'strong');
  assert.equal(chargeLevel(15), 'settling');
  assert.equal(chargeLevel(28), 'faded');
  const object = charged();
  assert.equal(chargeLine(chargeOf(object, start + DAY)!), 'Charge: strong');
  assert.equal(chargeLine(chargeOf(object, start + 14 * DAY)!), 'Charge: settling');
  assert.equal(chargeLine(chargeOf(object, start + 30 * DAY)!), 'Charge: faded — wants recharging');
});

test('never charged: no charge at all', () => {
  assert.equal(chargeOf(crystal(), start), null);
  assert.ok(Number.isNaN(lastChargedAt({ type: 'tool' })));
});

test('a charge the app records for anything else lives in livingState.app and is the newest', () => {
  const tool = recordCharge({ type: 'apothecary', label: 'Jar', altarObjectId: 'j1' }, 'Moon charge', iso(3));
  assert.equal(lastChargedAt(tool), Date.parse(iso(3)));
  assert.deepEqual(appStateOf(tool).charge, { at: iso(3), how: 'Moon charge' });
  assert.equal(appHistoryOf(tool)[0].kind, 'charge');
  // The crystal's own charge and a later app charge: the later one counts.
  const both = recordCharge(charged(), 'Sun charge', iso(9));
  assert.equal(chargeOf(both, start + 10 * DAY)!.days, 1);
  // Other living state is kept.
  assert.ok(parseLivingState(both)!.crystal);
  const cleansed = recordCleanse(tool, 'Smoke', iso(4));
  assert.equal(appHistoryOf(cleansed).length, 2);
  assert.equal(lastChargedAt(cleansed), Date.parse(iso(3)), 'a cleansing is not a charge');
});

test('each method has its moment', () => {
  assert.equal(momentFor(['Smoke']), 'smoke');
  assert.equal(momentFor(['Herbs']), 'smoke');
  assert.equal(momentFor(['Salt']), 'salt');
  assert.equal(momentFor(['Earth']), 'salt');
  assert.equal(momentFor(['Moonlight']), 'moon');
  assert.equal(momentFor(['Selenite']), 'moon');
  assert.equal(momentFor(['Sunlight']), 'sun');
  assert.equal(momentFor(['Sound']), 'sound');
  assert.equal(momentFor(['Smoke charge']), 'smoke');
  assert.equal(momentFor(['Visualization', 'Salt']), 'salt', 'the first method with a moment');
  assert.equal(momentFor([]), 'moon');
});
