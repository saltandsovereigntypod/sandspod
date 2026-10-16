import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ALTAR_ARTWORK } from '../src/lib/altar/artworkData.ts';
import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { duplicateObject, lightAll, nextBurnout, settleCandles } from '../src/lib/altar/editor.ts';
import {
  CANDLE_LIFE,
  candleLife,
  freshCandle,
  lightCandle,
  parseLivingState,
  setCandleLife,
  settleCandle,
  snuffCandle,
} from '../src/lib/altar/livingState.ts';
import { documentFromAltar } from '../src/lib/altar/snapshot.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const HOUR = 3_600_000;
const at = (h: number) => new Date(Date.UTC(2026, 9, 1, 20) + h * HOUR).toISOString();
const candleItem = builtInCabinet.find((i) => i.id === 'candles:purple-candle')!;
const place = (formId: string): SavedObject => {
  const form = candleItem.forms.find((f) => f.form === formId)!;
  return objectFromForm(candleItem, form, [], at(0));
};

test('every candle form in the cabinet has a burn time', () => {
  const forms = ['chime-spell', 'taper', 'tea-light', 'pillar', 'vigil', ...ALTAR_ARTWORK.candleStyleForms.map((f) => f.id)];
  for (const form of forms) assert.ok(CANDLE_LIFE[form] > 0, `${form} has a life`);
  for (const form of candleItem.forms) assert.ok(candleLife(objectFromForm(candleItem, form, [], at(0))).expectedMs > 0, form.label);
});

test('realistic lengths: a chime burns hours, a novena about a week', () => {
  assert.equal(candleLife(place('chime-spell')).expectedMs, 2 * HOUR);
  assert.equal(candleLife(place('novena')).expectedMs, 7 * 24 * HOUR);
  assert.equal(candleLife(place('birthday')).expectedMs, 10 * 60 * 1000);
});

test('the form is found from the picture when the object does not say', () => {
  assert.equal(candleLife({ type: 'candle', imagePath: '../assets/altar/objects/candles/chime/red-chime.png' }).form, 'chime-spell');
  assert.equal(candleLife({ type: 'candle', imagePath: '../assets/altar/objects/candles/red-candle.png' }).form, 'vigil');
  assert.equal(candleLife({ type: 'candle', imagePath: 'https://example.com/mine.png' }).expectedMs, 0, 'own candles have no limit');
});

test('a candle goes out on its own when its life runs out, at the moment it would have', () => {
  const lit = lightCandle(place('chime-spell'), at(0));
  assert.equal(candleLife(lit, Date.parse(at(1))).remainingMs, HOUR);
  assert.equal(settleCandle(lit, at(1)), lit, 'still burning after an hour');
  const out = settleCandle(lit, at(5));
  assert.equal(out.lit, 'false');
  const candle = parseLivingState(out)!.candle!;
  assert.equal(candle.totalBurnMs, 2 * HOUR);
  assert.equal(candle.status, 'spent');
  assert.equal(candle.spentAt, at(2));
  assert.equal(candle.burnHistory!.at(-1)!.endReason, 'candle_life_reached');
  assert.equal(candle.burnHistory!.at(-1)!.extinguishedAt, at(2));
  assert.ok(candleLife(out).spent);
  assert.equal(lightCandle(out, at(6)), out, 'a spent candle cannot be relit');
});

test('burns add up across lightings; snuffing late never counts past the candle life', () => {
  let c = lightCandle(place('chime-spell'), at(0));
  c = snuffCandle(c, at(1.5));
  assert.equal(candleLife(c).remainingMs, 0.5 * HOUR);
  c = lightCandle(c, at(10));
  c = snuffCandle(c, at(20));
  const candle = parseLivingState(c)!.candle!;
  assert.equal(candle.totalBurnMs, 2 * HOUR);
  assert.equal(candle.status, 'spent');
});

test('a custom length can be set before first lighting only', () => {
  const c = setCandleLife(place('taper'), 30 * 60 * 1000, at(0));
  assert.equal(candleLife(c).expectedMs, 30 * 60 * 1000);
  const lit = lightCandle(c, at(0));
  assert.equal(setCandleLife(lit, HOUR, at(0)), lit);
});

test('a fresh candle replaces a spent one with full life, in the same place', () => {
  const spent = settleCandle(lightCandle(place('chime-spell'), at(0)), at(3));
  const fresh = freshCandle(spent, at(4));
  assert.notEqual(fresh.altarObjectId, spent.altarObjectId);
  assert.equal(fresh.x, spent.x);
  const life = candleLife(fresh);
  assert.ok(!life.spent);
  assert.equal(life.remainingMs, 2 * HOUR);
  assert.equal(parseLivingState(fresh)!.candle!.replacesInstanceId, spent.altarObjectId);
});

test('altar-wide: lighting all skips spent candles, settling snuffs only burned-out ones, next burnout is the soonest', () => {
  const spent = settleCandle(lightCandle(place('chime-spell'), at(0)), at(3));
  const doc = documentFromAltar({ objects: [spent, place('taper'), place('tea-light')] });
  const lit = lightAll(doc, at(4));
  assert.equal(lit.objects[0].lit, 'false');
  assert.equal(lit.objects[1].lit, 'true');
  assert.equal(nextBurnout(lit), Date.parse(at(8)), 'the tea light, 4 hours on');
  const later = settleCandles(lit, at(9));
  assert.equal(later.objects[1].lit, 'true', 'the taper still burns');
  assert.equal(later.objects[2].lit, 'false', 'the tea light went out');
  assert.equal(settleCandles(later, at(9)), later, 'nothing more to settle');
});

test('a copied candle is a new, unlit candle with its full life', () => {
  const half = snuffCandle(lightCandle(place('chime-spell'), at(0)), at(1));
  const doc = duplicateObject(documentFromAltar({ objects: [half] }), 0, at(2));
  const copy = doc.objects[1];
  assert.equal(copy.lit, 'false');
  assert.equal(candleLife(copy).remainingMs, 2 * HOUR);
});

test('lifecycle saves from the website read correctly (litAt/extinguishedAt history)', () => {
  const object: SavedObject = {
    type: 'candle',
    form: 'taper',
    lit: 'false',
    livingState: JSON.stringify({
      version: 2,
      candle: {
        version: 2,
        form: 'taper',
        expectedBurnMs: 8 * HOUR,
        totalBurnMs: 8 * HOUR,
        spentAt: at(8),
        status: 'spent',
        burnHistory: [{ eventId: 'x', litAt: at(0), extinguishedAt: at(8), durationMs: 8 * HOUR, endReason: 'candle_life_reached' }],
      },
    }),
  };
  assert.ok(candleLife(object).spent);
  assert.equal(lightCandle(object, at(9)), object);
});

test('the widget learns when candles on saved altars go out', async () => {
  const { altarsAt, burnoutTimes, settleAltars } = await import('../src/lib/altar/burnout.ts');
  const { altarDataFromDocument } = await import('../src/lib/altar/snapshot.ts');
  const doc = documentFromAltar({ objects: [lightCandle(place('chime-spell'), at(0)), lightCandle(place('taper'), at(0))] });
  const altar = { id: 'a1', name: 'Test', ...altarDataFromDocument(doc, 'Test', at(0)) };
  assert.deepEqual(burnoutTimes([altar], new Date(at(1))), [Date.parse(at(2)), Date.parse(at(8))]);
  const later = altarsAt([altar], new Date(at(3)));
  const objects = documentFromAltar(later[0]).objects;
  assert.equal(objects[0].lit, 'false');
  assert.equal(objects[1].lit, 'true');
  assert.equal(settleAltars([altar], at(1)).length, 0);
  assert.equal(settleAltars([altar], at(3)).length, 1);
});
