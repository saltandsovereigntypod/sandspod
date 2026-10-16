import assert from 'node:assert/strict';
import { test } from 'node:test';

import { setRemnant } from '../src/lib/altar/ceromancy.ts';
import { lightCandle, snuffCandle, settleCandle } from '../src/lib/altar/livingState.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import { burnProgress, nightCandle, nightsLit, waxLook } from '../src/lib/altar/wax.ts';

const HOUR = 3_600_000;
const start = Date.UTC(2026, 9, 1, 19);
const at = (h: number) => new Date(start + h * HOUR).toISOString();
const ms = (h: number) => start + h * HOUR;
const candle = (form: string): SavedObject => ({ type: 'candle', label: 'Red Candle', form, altarObjectId: `c-${form}` });

/** Burn for `hours` each evening, `nights` times. */
function burn(object: SavedObject, hours: number, nights: number, from = 0): SavedObject {
  let c = object;
  for (let n = 0; n < nights; n++) {
    const lit = from + n * 24;
    c = snuffCandle(lightCandle(c, at(lit)), at(lit + hours));
  }
  return c;
}

test('an unburned candle melts evenly, nothing to draw', () => {
  const look = waxLook(candle('pillar'), ms(0));
  assert.equal(look.kind, 'even');
  assert.equal(look.line, '');
  assert.equal(waxLook({ type: 'crystal' }).kind, 'even');
});

test('a pillar burned in short sessions tunnels, more with each', () => {
  const once = waxLook(burn(candle('pillar'), 0.5, 1), ms(30));
  assert.equal(once.kind, 'tunnel');
  const four = waxLook(burn(candle('pillar'), 0.5, 4), ms(200));
  assert.equal(four.kind, 'tunnel');
  assert.ok(four.amount > once.amount);
  assert.match(four.line, /tunnelled/);
});

test('long burns pool out to the edge', () => {
  const look = waxLook(burn(candle('pillar'), 4, 3), ms(200));
  assert.equal(look.kind, 'pool');
  assert.ok(look.amount > 0.5);
});

test('tapers drip as they burn down', () => {
  const look = waxLook(burn(candle('taper'), 3, 2), ms(100));
  assert.equal(look.kind, 'drips');
  assert.ok(look.drips >= 4, `${look.drips} drips`);
  assert.ok(Math.abs(burnProgress(burn(candle('taper'), 3, 2), ms(100)) - 0.75) < 0.01);
});

test('at burn-out a remnant is left, gone once buried or thrown away', () => {
  const spent = settleCandle(lightCandle(candle('chime-spell'), at(0)), at(5));
  const look = waxLook(spent, ms(5));
  assert.equal(look.kind, 'remnant');
  assert.equal(look.amount, 1);
  assert.equal(look.progress, 1);
  assert.equal(waxLook(setRemnant(spent, 'keep', at(6)), ms(6)).amount, 1);
  const buried = waxLook(setRemnant(spent, 'bury', at(6)), ms(6));
  assert.equal(buried.amount, 0);
  assert.match(buried.line, /buried/);
});

test('a seven-knob candle counts down a knob a night', () => {
  // A knob is an hour of its seven.
  const three = burn(candle('seven-knob'), 1, 3);
  const night = nightCandle(three, ms(80))!;
  assert.equal(night.kind, 'knobs');
  assert.equal(night.left, 4);
  assert.equal(night.nights, 3);
  assert.equal(night.line, '4 of 7 knobs left · lit on 3 nights');
});

test('a novena counts days of wax, and nights lit', () => {
  const novena = burn(candle('novena'), 24, 2);
  const night = nightCandle(novena, ms(60))!;
  assert.equal(night.kind, 'days');
  assert.equal(night.total, 7);
  assert.equal(night.left, 5);
  assert.equal(night.nights, 2);
  assert.equal(nightsLit(lightCandle(novena, at(72)), ms(73)), 3, 'tonight counts while it burns');
  assert.equal(nightCandle(candle('taper')), null);
});
