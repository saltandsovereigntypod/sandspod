import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DEFAULT_FLAME, lowerFlame, pictureBox } from '../src/lib/altar/flame.ts';
import { boxAspect } from '../src/lib/altar/geometry.ts';
import { lightCandle, settleCandle, snuffCandle } from '../src/lib/altar/livingState.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import { burnDown, burnedDownLine, candleShape, currentMelt, meltLine, waxLook } from '../src/lib/altar/wax.ts';

const MIN = 60_000;
const HOUR = 60 * MIN;
const start = Date.UTC(2026, 9, 1, 19);
const at = (ms: number) => new Date(start + ms).toISOString();
const candle = (form: string): SavedObject => ({ type: 'candle', label: 'Pink Candle', form, color: 'pink', altarObjectId: `c-${form}` });

test('a new candle stands its full height; other things never burn down', () => {
  const fresh = burnDown(candle('taper'), start)!;
  assert.equal(fresh.mode, 'cap');
  assert.equal(fresh.drop, 0);
  assert.equal(fresh.waxTop, fresh.top);
  assert.equal(burnDown({ type: 'crystal' }, start), null);
  // Tea lights and floating candles have nothing to burn down.
  assert.equal(burnDown(candle('tea-light'), start), null);
  assert.equal(candleShape('floating'), null);
});

test('a chime visibly shortens over its two hours; a seven-day vigil only slowly', () => {
  const chime = lightCandle(candle('chime-spell'), at(0));
  const shape = candleShape('chime-spell')!;
  const hourIn = burnDown(chime, start + HOUR)!;
  assert.ok(Math.abs(hourIn.drop - shape.maxDrop / 2) < 0.005, `half its burn: ${hourIn.drop}`);
  assert.ok(hourIn.drop > 0.3, 'a third of its picture gone in an hour');
  const vigil = lightCandle(candle('vigil'), at(0));
  const vigilHour = burnDown(vigil, start + HOUR)!;
  assert.ok(vigilHour.drop > 0 && vigilHour.drop < 0.01, `a vigil barely moves in an hour: ${vigilHour.drop}`);
  assert.ok(burnDown(vigil, start + 84 * HOUR)!.drop > 0.3, 'half way through its week, half gone');
});

test('a spent candle is its low remnant; burns add up across nights', () => {
  const spent = settleCandle(lightCandle(candle('chime-spell'), at(0)), at(3 * HOUR));
  const remnant = burnDown(spent, start + 3 * HOUR)!;
  assert.equal(remnant.drop, candleShape('chime-spell')!.maxDrop);
  assert.ok(remnant.bottom - remnant.waxTop < 0.3, 'only a stub is left');
  let taper = candle('taper');
  taper = snuffCandle(lightCandle(taper, at(0)), at(2 * HOUR));
  taper = snuffCandle(lightCandle(taper, at(24 * HOUR)), at(26 * HOUR));
  assert.ok(Math.abs(burnDown(taper, start + 30 * HOUR)!.drop - candleShape('taper')!.maxDrop / 2) < 0.005);
});

test('figure and two-colour candles burn from the head; glass candles sink in their glass', () => {
  assert.equal(candleShape('figure-female')!.mode, 'crop');
  assert.equal(candleShape('double-action')!.mode, 'crop');
  const novena = lightCandle(candle('novena'), at(0));
  const sunk = burnDown(novena, start + 48 * HOUR)!;
  assert.equal(sunk.mode, 'glass');
  assert.ok(sunk.waxTop > sunk.top);
});

test('the top melts as soon as it is lit, and a short session still shows', () => {
  const unlit = candle('taper');
  assert.equal(currentMelt(unlit, start), 0);
  assert.equal(meltLine(unlit, start), '');
  const lit = lightCandle(unlit, at(0));
  assert.ok(currentMelt(lit, start) >= 0.15, 'a little the moment it is lit');
  const quarter = currentMelt(lit, start + 15 * MIN);
  assert.ok(quarter > 0.5 && quarter < 0.8, `about half after a quarter hour: ${quarter}`);
  assert.ok(currentMelt(lit, start + HOUR) > 0.9);
  assert.match(meltLine(lit, start + 15 * MIN), /pool/);
});

test('drips run while it burns: a taper and a pillar both, within minutes', () => {
  const taper = waxLook(lightCandle(candle('taper'), at(0)), start + 12 * MIN);
  assert.equal(taper.kind, 'drips');
  assert.ok(taper.drips >= 2, `${taper.drips} drips after twelve minutes`);
  assert.ok(taper.melt > 0.4);
  const pillar = waxLook(lightCandle(candle('pillar'), at(0)), start + 15 * MIN);
  assert.ok(pillar.drips >= 1, 'a pillar runs too');
  // Put out, the drips its burn left stay but the melt is gone.
  const out = waxLook(snuffCandle(lightCandle(candle('taper'), at(0)), at(HOUR)), start + 2 * HOUR);
  assert.equal(out.melt, 0);
});

test('what the close-up says of how far it has burned', () => {
  assert.equal(burnedDownLine(candle('taper'), start), 'Unburned, its full height.');
  const chime = lightCandle(candle('chime-spell'), at(0));
  assert.equal(burnedDownLine(chime, start + HOUR), 'About half of its wax has burned away.');
  const spent = settleCandle(chime, at(3 * HOUR));
  assert.match(burnedDownLine(spent, start + 3 * HOUR), /all the way down/);
  assert.equal(burnedDownLine({ type: 'crystal' }, start), '');
});

test('the picture sits inside its box, and the flame comes down with the top', () => {
  const ratio = 1024 / 333;
  const box = pictureBox(ratio, boxAspect(ratio));
  assert.ok(box.left >= 0 && box.left + box.width <= 1.0001);
  assert.ok(box.top >= 0 && box.top + box.height <= 1.0001);
  assert.ok(box.height > 0.9, 'a tall candle fills its box top to bottom');
  const lowered = lowerFlame(DEFAULT_FLAME, 12);
  assert.equal(lowered.flameTop, DEFAULT_FLAME.flameTop + 12);
  assert.equal(lowered.haloTop, DEFAULT_FLAME.haloTop + 12);
  assert.equal(lowered.smokeTop, DEFAULT_FLAME.smokeTop + 12);
  assert.equal(lowered.flameHeight, DEFAULT_FLAME.flameHeight);
  assert.equal(lowerFlame(DEFAULT_FLAME, 0), DEFAULT_FLAME);
});
