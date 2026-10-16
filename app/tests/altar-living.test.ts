// The altar that responds: flame readings, offerings that age, incense,
// moon charging and object stories.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import {
  burnToRead,
  readingsOf,
  readingSummary,
  readingText,
  recordReading,
  remnantOf,
  setRemnant,
} from '../src/lib/altar/ceromancy.ts';
import { recordOffering, offeringsOf } from '../src/lib/altar/devotion.ts';
import { nextBurnout, settleAltar, settleCandles } from '../src/lib/altar/editor.ts';
import {
  clearAsh,
  incenseFormOf,
  incenseLife,
  isIncense,
  lightIncense,
  putOutIncense,
  setIncenseForm,
  settleIncense,
} from '../src/lib/altar/incense.ts';
import { appHistoryOf, lightCandle, parseLivingState, setCandleLife, snuffCandle, settleCandle } from '../src/lib/altar/livingState.ts';
import { chargeUnderMoons, moonChargesOf, moonsBetween } from '../src/lib/altar/moonCharge.ts';
import {
  agingDeityOffering,
  agingLook,
  endOffering,
  freshness,
  kindFromWords,
  offeringFreshness,
  offeringOf,
  refreshOffering,
  setOffering,
} from '../src/lib/altar/offerings.ts';
import { storyLines, storySummary } from '../src/lib/altar/story.ts';
import { emptyDocument } from '../src/lib/altar/snapshot.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const T0 = Date.UTC(2026, 9, 1, 20);
const at = (ms: number) => new Date(T0 + ms).toISOString();

const place = (id: string, formId?: string, when = at(0)): SavedObject => {
  const item = builtInCabinet.find((i) => i.id === id);
  assert.ok(item, id);
  const form = formId ? item.forms.find((f) => f.form === formId) : item.forms[0];
  assert.ok(form, `${id} ${formId}`);
  return objectFromForm(item, form, [], when);
};

// ── Flame reading ────────────────────────────────────────────────────────

test('a snuffed candle asks how it burned, once per burn', () => {
  const candle = setCandleLife(place('candles:red-candle', 'taper'), 8 * HOUR, at(0));
  const snuffed = snuffCandle(lightCandle(candle, at(0)), at(2 * HOUR));
  const burn = burnToRead(snuffed, T0 + 2 * HOUR + MIN);
  assert.ok(burn);
  const read = recordReading(snuffed, { flame: 'tall-steady', smoke: ['white'], wax: ['clean'], notes: ' felt good ' }, at(3 * HOUR));
  const readings = readingsOf(read);
  assert.equal(readings.length, 1);
  assert.equal(readings[0].burnId, burn.eventId);
  assert.equal(readings[0].notes, 'felt good');
  assert.match(readings[0].text, /folk readers/);
  assert.equal(burnToRead(read, T0 + 3 * HOUR), null, 'read already');
  // The rest of the living state is kept.
  assert.equal(parseLivingState(read)?.candle?.burnHistory?.length, 1);
  // Long after, it no longer asks.
  assert.equal(burnToRead(snuffed, T0 + 10 * DAY), null);
});

test('a candle that burned out on its own can be read, and its remnant recorded', () => {
  const candle = place('candles:white-candle', 'chime-spell');
  const out = settleCandle(lightCandle(candle, at(0)), at(5 * HOUR));
  assert.ok(burnToRead(out, T0 + 5 * HOUR));
  const kept = setRemnant(out, 'bury', at(6 * HOUR));
  assert.equal(remnantOf(kept)?.choice, 'bury');
  assert.match(appHistoryOf(kept)[0].text, /buried/);
  // An unspent candle has no remnant to keep.
  assert.equal(setRemnant(candle, 'keep', at(1)), candle);
});

test('readings combine flame, smoke and wax in plain words', () => {
  assert.match(readingSummary({ flame: 'went-out', smoke: [], wax: [] }), /pause/);
  assert.match(readingSummary({ flame: 'flickering', smoke: ['black'], wax: ['remnant'] }), /cleared/);
  const text = readingText({ flame: 'low', smoke: ['toward'], wax: ['pooled-side'], notes: '' });
  assert.equal(text.split('\n\n').length, 4);
  assert.equal(readingSummary({ flame: '', smoke: [], wax: [] }), '');
});

// ── Offerings ────────────────────────────────────────────────────────────

test('freshness by kind: water goes in a day or two, flowers in a week, stones keep', () => {
  assert.equal(freshness('water', T0, T0 + 12 * HOUR).level, 'fresh');
  assert.equal(freshness('water', T0, T0 + 30 * HOUR).level, 'fading');
  assert.equal(freshness('water', T0, T0 + 2 * DAY).level, 'refresh');
  assert.equal(freshness('bread', T0, T0 + DAY).level, 'fresh');
  assert.equal(freshness('bread', T0, T0 + 3 * DAY).level, 'refresh');
  assert.equal(freshness('fruit', T0, T0 + 3 * DAY).level, 'fading');
  assert.equal(freshness('flowers', T0, T0 + 3 * DAY).level, 'fresh');
  assert.equal(freshness('flowers', T0, T0 + 7 * DAY).level, 'refresh');
  assert.equal(freshness('stones', T0, T0 + 300 * DAY).level, 'lasting');
  assert.equal(freshness('dried', T0, T0 + 300 * DAY).dueAt, null);
});

test('the stage look: water sinks, flowers droop, things that keep stay as they are', () => {
  const water = agingLook('water', freshness('water', T0, T0 + 2 * DAY));
  assert.ok(water.level < 1 && water.opacity < 1 && water.droop === 0);
  const flowers = agingLook('flowers', freshness('flowers', T0, T0 + 8 * DAY));
  assert.ok(flowers.droop > 0);
  assert.deepEqual(agingLook('coins', freshness('coins', T0, T0 + DAY)), { opacity: 1, droop: 0, level: 1 });
});

test('a bowl holds an offering: set out, refreshed, returned to nature, each logged', () => {
  const bowl = place('vessels:offering-bowl');
  assert.equal(offeringOf(bowl), null);
  const filled = setOffering(bowl, 'water', '', at(0));
  assert.equal(offeringFreshness(filled, T0 + 2 * DAY)?.level, 'refresh');
  const fresh = refreshOffering(filled, at(2 * DAY));
  assert.equal(offeringFreshness(fresh, T0 + 2 * DAY + HOUR)?.level, 'fresh');
  const done = endOffering(fresh, 'returned', at(3 * DAY));
  assert.equal(offeringOf(done), null);
  assert.deepEqual(
    appHistoryOf(done).map((e) => e.text),
    ['Set out water.', 'Refreshed the water.', 'Returned the water to nature.'],
  );
  // A candle is never an offering bowl.
  const candle = place('candles:red-candle', 'taper');
  assert.equal(setOffering(candle, 'water', '', at(0)), candle);
});

test('a fresh sprig wilts like cut flowers; one marked dried keeps', () => {
  const sprig = place('herbs:rose', 'sprig');
  assert.equal(offeringFreshness(sprig, T0 + 7 * DAY)?.level, 'refresh');
  const dried = setOffering(sprig, 'dried', '', at(0));
  assert.equal(offeringFreshness(dried, T0 + 70 * DAY)?.level, 'lasting');
  assert.equal(offeringOf(place('herbs:rose', 'loose')), null);
});

test('a deity’s latest food or drink offering ages; finished ones don’t', () => {
  assert.equal(kindFromWords('a glass of red wine'), 'drink');
  assert.equal(kindFromWords('Honey cake'), 'sweets');
  assert.equal(kindFromWords('pomegranate seeds'), 'fruit');
  const deity = place('deities:hekate-statue');
  const offered = recordOffering(
    deity,
    { types: ['Food'], supports: [], customItems: 'bread', intention: '', message: '', status: 'Offered', customStatus: '', response: '', responseNotes: '', occurredAt: at(0) },
    at(0),
  );
  const aging = agingDeityOffering(offeringsOf(offered, at(0)), T0 + 3 * DAY);
  assert.equal(aging?.kind, 'bread');
  assert.equal(aging?.fresh.level, 'refresh');
  const coins = recordOffering(
    deity,
    { types: ['Coins'], supports: [], customItems: '', intention: '', message: '', status: 'Offered', customStatus: '', response: '', responseNotes: '', occurredAt: at(0) },
    at(0),
  );
  assert.equal(agingDeityOffering(offeringsOf(coins, at(0)), T0 + 30 * DAY), null);
});

// ── Incense ──────────────────────────────────────────────────────────────

test('incense forms: sticks, resins on charcoal, cones in a burner', () => {
  const stick = place('herbs:lavender', 'incense');
  assert.ok(isIncense(stick));
  assert.equal(incenseFormOf(stick), 'stick');
  assert.equal(incenseFormOf(place('herbs:frankincense', 'incense')), 'resin');
  assert.equal(incenseFormOf(place('tools:incense-burner')), 'cone');
  assert.equal(incenseFormOf(place('vessels:incense-bowl')), 'resin');
  assert.ok(!isIncense(place('herbs:lavender', 'sprig')));
  assert.equal(incenseLife(stick).burnMs, 40 * MIN);
  assert.equal(incenseLife(setIncenseForm(stick, 'cone', at(0))).burnMs, 20 * MIN);
});

test('incense burns down to ash on its own, even while the app is closed, until the ash is cleared', () => {
  const stick = place('herbs:sage', 'incense');
  const lit = lightIncense(stick, at(0));
  assert.equal(lit.lit, 'false', 'the object itself is never marked lit');
  assert.ok(incenseLife(lit, T0 + 10 * MIN).lit);
  assert.equal(settleIncense(lit, at(20 * MIN)), lit);
  const doc = { ...emptyDocument(), objects: [lit] };
  assert.equal(nextBurnout(doc, new Date(T0)), T0 + 40 * MIN);
  const settled = settleCandles(doc, at(3 * HOUR));
  const ash = settled.objects[0];
  const life = incenseLife(ash, T0 + 3 * HOUR);
  assert.ok(life.ash && !life.lit);
  assert.equal(life.burnedMs, 40 * MIN);
  assert.equal(lightIncense(ash, at(4 * HOUR)), ash, 'ash can’t be lit');
  const cleared = clearAsh(ash, at(4 * HOUR));
  assert.ok(!incenseLife(cleared).ash && incenseLife(cleared).adjustable);
});

test('incense put out early keeps what’s left', () => {
  const cone = setIncenseForm(place('herbs:rose', 'incense'), 'cone', at(0));
  const out = putOutIncense(lightIncense(cone, at(0)), at(5 * MIN));
  const life = incenseLife(out);
  assert.equal(life.remainingMs, 15 * MIN);
  assert.ok(!life.ash && !life.adjustable);
});

// ── Moon charging ────────────────────────────────────────────────────────

test('moonsBetween finds the real full moons', () => {
  const fulls = moonsBetween(new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 11, 31)), 'full');
  assert.ok(fulls.length >= 12 && fulls.length <= 13);
  // 2026-10-26 is a Full Moon.
  assert.ok(fulls.some((d) => d.toISOString().startsWith('2026-10-26')));
});

test('a crystal on the altar through a Full Moon is charged under it, once per lunation', () => {
  const crystal = place('crystals:amethyst', undefined, '2026-10-20T12:00:00.000Z');
  const before = chargeUnderMoons(crystal, '2026-10-25T12:00:00.000Z');
  assert.equal(before, crystal, 'no full moon yet');
  const charged = chargeUnderMoons(crystal, '2026-10-27T12:00:00.000Z');
  const charges = moonChargesOf(charged);
  assert.equal(charges.length, 1);
  assert.match(charges[0].moon, /^Full Moon in (Taurus|Aries)$/);
  const state = parseLivingState(charged)!.crystal as Record<string, unknown>;
  const entry = (state.chargingHistory as Record<string, unknown>[])[0];
  for (const key of ['id', 'occurredAt', 'purpose', 'methods', 'supports', 'intentionHandling', 'intention', 'notes']) assert.ok(key in entry, key);
  assert.equal(state.lastChargedAt, entry.occurredAt);
  assert.equal(chargeUnderMoons(charged, '2026-10-28T12:00:00.000Z'), charged, 'once per lunation');
  // New moons only when asked.
  const later = chargeUnderMoons(charged, '2026-11-12T12:00:00.000Z');
  assert.equal(later, charged);
  assert.equal(moonChargesOf(chargeUnderMoons(charged, '2026-11-12T12:00:00.000Z', { newMoon: true })).length, 2);
});

test('moon water charges; an empty bowl and a candle don’t; long absences catch up at most three moons', () => {
  const bowl = place('vessels:offering-bowl', undefined, '2026-01-01T00:00:00.000Z');
  assert.equal(chargeUnderMoons(bowl, '2026-10-27T12:00:00.000Z'), bowl);
  const water = setOffering(bowl, 'water', 'moon water', '2026-01-01T00:00:00.000Z');
  assert.equal(moonChargesOf(chargeUnderMoons(water, '2026-10-27T12:00:00.000Z')).length, 3);
  const candle = place('candles:red-candle', 'taper', '2026-01-01T00:00:00.000Z');
  assert.equal(chargeUnderMoons(candle, '2026-10-27T12:00:00.000Z'), candle);
});

test('settleAltar burns things down and charges crystals; a settled altar settles to itself', () => {
  const crystal = place('crystals:amethyst', undefined, '2026-10-20T12:00:00.000Z');
  const doc = { ...emptyDocument(), objects: [crystal] };
  const settled = settleAltar(doc, '2026-10-27T12:00:00.000Z');
  assert.notEqual(settled, doc);
  assert.equal(settleAltar(settled, '2026-10-27T13:00:00.000Z'), settled);
});

// ── Stories ──────────────────────────────────────────────────────────────

test('an object’s story: newest first, in sentences, with its days and moons', () => {
  const crystal = place('crystals:amethyst', undefined, '2026-10-20T12:00:00.000Z');
  const charged = chargeUnderMoons(crystal, '2026-10-27T12:00:00.000Z');
  const lines = storyLines(charged);
  assert.equal(lines[lines.length - 1].text, 'Came to this altar.');
  assert.match(lines[0].text, /Charged under the Full Moon/);
  assert.equal(storySummary(charged, new Date('2026-10-30T12:00:00.000Z')), 'On this altar 10 days, through 1 Full Moon.');

  const candle = lightCandle(place('candles:red-candle', 'taper'), at(HOUR));
  const burned = recordReading(snuffCandle(candle, at(3 * HOUR)), { flame: 'dancing', smoke: [], wax: [], notes: '' }, at(4 * HOUR));
  const story = storyLines(burned).map((l) => l.text);
  assert.match(story[0], /^You read the flame/);
  assert.equal(story[1], 'Burned for 2 hours.');
});

test('a copy of burning incense is fresh and unlit', async () => {
  const { duplicateObject } = await import('../src/lib/altar/editor.ts');
  const lit = lightIncense(place('herbs:sage', 'incense'), at(0));
  const doc = duplicateObject({ ...emptyDocument(), objects: [lit] }, 0, at(MIN));
  assert.ok(incenseLife(doc.objects[0], T0 + MIN).lit);
  assert.ok(!incenseLife(doc.objects[1], T0 + MIN).lit);
});
