// Crystal care: when a stone may charge (selenite touching, the moon by
// night, the sun by day), a charge renewing an intention or a general charge,
// and crystal wear (strain with time and blows, cleansing, stages, the setting).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { chargingOf, finishCharging, startCharging } from '../src/lib/altar/craftTools.ts';
import {
  awaitingChoice,
  breakLine,
  chargeGate,
  chooseForBroken,
  isNight,
  moonChargeStrength,
  nextTurn,
  seleniteFor,
  seleniteUnder,
  setStoneIntention,
  somethingCameAtMe,
  stageOf,
  strainOf,
  takeBlow,
  wearLine,
  wearLook,
  wearModeOf,
  wearOf,
  HEAVILY_USED,
} from '../src/lib/altar/crystalCare.ts';
import { careForCrystal, crystalHistory, crystalState } from '../src/lib/altar/devotion.ts';
import { layerOf } from '../src/lib/altar/layers.ts';
import { ensureLivingState } from '../src/lib/altar/livingState.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const DAY = 86_400_000;
const NOW = '2026-06-21T12:00:00.000Z';
const T = Date.parse(NOW);
const iso = (ms: number) => new Date(ms).toISOString();
const LONDON = { latitude: 51.5, longitude: -0.12 };

const stone = (id: string, x = 0.5, y = 0.5, crystal = 'clear-quartz', label = 'Clear Quartz', placed = NOW): SavedObject =>
  ensureLivingState({ type: 'crystal', crystal, label, altarObjectId: id, leftPercent: x, topPercent: y, sizePercent: 0.06 }, placed);
const selenite = (x: number, y: number): SavedObject => ({ type: 'crystal', crystal: 'selenite', label: 'Selenite Cluster', altarObjectId: 'sel', leftPercent: x, topPercent: y, sizePercent: 0.1 });

test('day and night follow your sunset and sunrise, or the clock without a place', () => {
  assert.equal(isNight(new Date('2026-06-21T12:00:00Z'), LONDON), false, 'midday in London');
  assert.equal(isNight(new Date('2026-06-21T23:30:00Z'), LONDON), true, 'half past midnight BST');
  const turn = nextTurn(new Date('2026-06-21T12:00:00Z'), LONDON, true);
  // London's midsummer sunset is about 21:21 BST (20:21 UTC).
  assert.ok(Math.abs(turn.getTime() - Date.parse('2026-06-21T20:21:00Z')) < 15 * 60_000, turn.toISOString());
  const local = (h: number) => { const d = new Date(2026, 5, 21, h, 0, 0); return d; };
  assert.equal(isNight(local(19), null), true);
  assert.equal(isNight(local(5), null), true);
  assert.equal(isNight(local(12), null), false);
  assert.equal(nextTurn(local(12), null, true).getHours(), 18);
  assert.equal(nextTurn(local(20), null, false).getHours(), 6);
});

test('the moon charges only at night, more strongly near full; the sun only by day, with a word for fading stones', () => {
  const q = stone('q');
  const day = chargeGate(q, 'moon', [q], new Date('2026-06-21T12:00:00Z'), LONDON);
  assert.equal(day.ok, false);
  assert.match(day.line, /Moonlight returns at sunset/);
  const night = chargeGate(q, 'moon', [q], new Date('2026-06-21T23:30:00Z'), LONDON);
  assert.equal(night.ok, true);
  assert.ok(night.strength! >= 0.5 && night.strength! <= 1);
  assert.match(night.line, /% lit/);
  assert.equal(moonChargeStrength(1), 1);
  assert.equal(moonChargeStrength(0), 0.5);
  assert.equal(chargeGate(q, 'sun', [q], new Date('2026-06-21T23:30:00Z'), LONDON).ok, false);
  assert.match(chargeGate(q, 'sun', [q], new Date('2026-06-21T23:30:00Z'), LONDON).line, /Daylight returns at sunrise/);
  assert.equal(chargeGate(q, 'sun', [q], new Date('2026-06-21T12:00:00Z'), LONDON).warn, undefined);
  const amethyst = stone('a', 0.5, 0.5, 'amethyst', 'Amethyst Point');
  assert.ok(chargeGate(amethyst, 'sun', [amethyst], new Date('2026-06-21T12:00:00Z'), LONDON).warn);
});

test('selenite charges only when it is on the altar and the stone touches it', () => {
  const q = stone('q', 0.3, 0.5);
  const none = chargeGate(q, 'selenite', [q], new Date(T), null);
  assert.equal(none.ok, false);
  assert.equal(none.offerSelenite, true);
  const far = selenite(0.8, 0.5);
  const apart = chargeGate(q, 'selenite', [q, far], new Date(T), null);
  assert.equal(apart.ok, false);
  assert.ok(!apart.offerSelenite);
  const near = selenite(0.33, 0.55);
  assert.equal(seleniteFor(q, [q, near]).touching.length, 1);
  assert.equal(chargeGate(q, 'selenite', [q, near], new Date(T), null).ok, true);
  // A piece from the cabinet is set down under the stone, touching it.
  const placed = seleniteUnder(q, [q], NOW)!;
  assert.equal(placed.crystal, 'selenite');
  assert.equal(chargeGate(q, 'selenite', [q, placed], new Date(T), null).ok, true);
  assert.equal(placed.zIndex, String(layerOf(q) - 1), 'under the stone');
});

test('a charge renews the stone’s intention, or is a general charge', () => {
  const plain = finishCharging(startCharging(stone('q'), 'moon', NOW, 0.9), iso(T + 3 * 3_600_000));
  assert.equal(chargingOf(plain), null);
  const rec = (crystalState(plain, NOW).chargingHistory as Record<string, unknown>[]).at(-1)!;
  assert.equal(rec.purpose, 'general-recharge');
  assert.deepEqual(rec.methods, ['moonlight']);
  assert.match(String(rec.notes), /general charge/);
  assert.match(String(rec.notes), /80% lit/);

  const held = setStoneIntention(stone('r'), 'Calm at work', NOW);
  const renewed = finishCharging(startCharging(held, 'selenite', NOW), iso(T + DAY));
  const rec2 = (crystalState(renewed, NOW).chargingHistory as Record<string, unknown>[]).at(-1)!;
  assert.equal(rec2.purpose, 'strengthen-current-intention');
  assert.deepEqual(rec2.methods, ['selenite']);
  assert.equal(rec2.intention, 'Calm at work');
  assert.match(String(rec2.notes), /renewing its intention: Calm at work/);
  assert.ok(crystalHistory(renewed, NOW).some((h) => h.label === 'Intention'));
});

test('strain builds with time, faster on guard; stages; cleansing clears most; the setting scales it', () => {
  assert.equal(wearModeOf(undefined), 'gentle');
  assert.equal(wearModeOf('realistic'), 'realistic');
  assert.deepEqual(['whole', 'dull', 'clouded', 'cracked', 'broken'].map((s, i) => stageOf([0, 0.3, 0.6, 0.8, 1][i])), ['whole', 'dull', 'clouded', 'cracked', 'broken']);
  const q = stone('q');
  assert.equal(strainOf(q, 'off', T + 400 * DAY), null, 'off disables');
  const gentle = strainOf(q, 'gentle', T + 90 * DAY)!;
  const realistic = strainOf(q, 'realistic', T + 21 * DAY)!;
  assert.ok(Math.abs(gentle - 0.5) < 0.01, `gentle at three months ${gentle}`);
  assert.ok(Math.abs(realistic - 0.5) < 0.01, `realistic at three weeks ${realistic}`);
  assert.ok(strainOf(q, 'realistic', T + 30 * DAY)! > strainOf(q, 'gentle', T + 30 * DAY)!);
  // Time alone never breaks it.
  assert.equal(strainOf(q, 'realistic', T + 999 * DAY), 0.9);
  assert.equal(wearOf(q, 'realistic', T + 999 * DAY)!.stage, 'cracked');
  // Doing protective work, or held in an open spell, it wears faster.
  const guard = setStoneIntention(q, 'Protection for the house', NOW);
  assert.ok(strainOf(guard, 'gentle', T + 30 * DAY)! > strainOf(q, 'gentle', T + 30 * DAY)! * 2);
  const ctx = { spells: [{ objectUid: 'q', title: 'Nine nights', startedAt: NOW }] };
  assert.ok(strainOf(q, 'gentle', T + 30 * DAY, ctx)! > strainOf(q, 'gentle', T + 30 * DAY)!);
  // The card says so once it's heavily used.
  assert.equal(wearLine(wearOf(q, 'realistic', T + 25 * DAY)), HEAVILY_USED);
  assert.equal(wearLook(wearOf(q, 'gentle', T + DAY)), null);
  assert.equal(wearLook(wearOf(q, 'realistic', T + 35 * DAY))!.crack, 1);
  // A cleanse clears the time's strain, and all but a fifth of a blow.
  const hit = takeBlow(q, 0.5, 'gentle', iso(T + 10 * DAY));
  const before = strainOf(hit, 'gentle', T + 60 * DAY)!;
  const clean = careForCrystal(hit, 'cleanse', { decision: 'General energetic cleansing', purpose: 'Routine care', methods: ['Smoke'], supports: [], occurredAt: iso(T + 60 * DAY) }, iso(T + 60 * DAY));
  const after = strainOf(clean, 'gentle', T + 60 * DAY)!;
  assert.ok(before > 0.8, `before ${before}`);
  assert.ok(Math.abs(after - 0.1) < 0.01, `after ${after}`);
});

test('something came at me: stones on guard take a blow scaled by the setting, the most worn may break, and nothing goes without your choice', () => {
  const guard = setStoneIntention(stone('g', 0.3, 0.5, 'black-tourmaline', 'Black Tourmaline', iso(T - 40 * DAY)), 'Warding the door', iso(T - 40 * DAY));
  const calm = stone('c', 0.7, 0.5, 'rose-quartz', 'Rose Quartz');
  const off = somethingCameAtMe([guard, calm], 'off', NOW);
  assert.equal(off.hit.length, 0);
  assert.match(off.line, /Logged/);
  const gentle = somethingCameAtMe([guard, calm], 'gentle', NOW);
  assert.deepEqual(gentle.hit, ['Black Tourmaline']);
  assert.equal(gentle.objects[1], calm, 'the rose quartz is not on guard');
  assert.equal(gentle.broke.length, 0);
  const realistic = somethingCameAtMe([guard, calm], 'realistic', NOW);
  assert.deepEqual(realistic.broke, ['g'], 'worn by weeks of warding, it breaks');
  const broken = realistic.objects[0];
  assert.equal(wearOf(broken, 'realistic', T)!.stage, 'broken');
  assert.ok(awaitingChoice(broken));
  assert.equal(realistic.objects.length, 2, 'still on the altar');
  const kept = chooseForBroken(broken, 'keep', NOW);
  assert.ok(!awaitingChoice(kept));
  assert.equal(wearLook(wearOf(kept, 'realistic', T))!.crack, 2);
  const chips = chooseForBroken(broken, 'chips', NOW);
  assert.match(String(chips.label), /Chips$/);
  assert.equal(breakLine('Rose Quartz Tumbled'), 'Your rose quartz has cracked. Many say a stone breaks when it has given all it can.');
  assert.equal(wearOf(chips, 'realistic', T)!.stage, 'whole');
  const labels = crystalHistory(chips, NOW).map((h) => h.label);
  assert.ok(labels.includes('Came at') && labels.includes('Broke') && labels.includes('After breaking') && labels.includes('Cleansed'));
});
