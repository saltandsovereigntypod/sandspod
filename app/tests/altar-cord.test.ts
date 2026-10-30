import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import {
  CORD_BURN_MS,
  CORD_FALL_MS,
  cordAnchor,
  cordArt,
  cordMoving,
  cordEnds,
  cordLine,
  cordOfCandle,
  cordsOf,
  cordState,
  freeCandles,
  nextCordEvent,
  reachesAt,
  settleCords,
  tieCord,
  untieCord,
  updateCord,
} from '../src/lib/altar/cord.ts';
import { clearAltar, settleCandles, toggleLight, updateObjects } from '../src/lib/altar/editor.ts';
import { setImageRatioLookup } from '../src/lib/altar/geometry.ts';
import { candleShape } from '../src/lib/altar/wax.ts';
import { burnDown } from '../src/lib/altar/wax.ts';
import { altarDataFromDocument, documentFromAltar, emptyDocument, type AltarDocument } from '../src/lib/altar/snapshot.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const HOUR = 3_600_000;
const T0 = Date.UTC(2026, 9, 29, 20);
const at = (ms: number) => new Date(T0 + ms).toISOString();
const candleItem = builtInCabinet.find((i) => i.id === 'candles:purple-candle')!;
const chime = (id: string, left: number): SavedObject => {
  const form = candleItem.forms.find((f) => f.form === 'chime-spell')!;
  return { ...objectFromForm(candleItem, form, [], at(0)), altarObjectId: id, leftPercent: left, topPercent: 0.7 };
};
const pair = (): AltarDocument => ({ ...emptyDocument(), objects: [chime('a', 0.4), chime('b', 0.6)] });
const light = (d: AltarDocument, i: number, ms: number) => toggleLight(d, i, at(ms));

test('a cord ties two free candles once, and only candles', () => {
  const d = tieCord(pair(), 'a', 'b', { height: 0.5, color: 'black', intention: 'An old tie' }, at(0));
  const [cord] = cordsOf(d);
  assert.equal(cord.status, 'tied');
  assert.equal(cord.color, 'black');
  assert.equal(cord.intention, 'An old tie');
  assert.equal(cordOfCandle(d, 'b')?.id, cord.id);
  assert.equal(freeCandles(d, T0).length, 0);
  assert.equal(tieCord(d, 'a', 'b', {}, at(0)), d, 'already tied');
  assert.equal(tieCord(pair(), 'a', 'a', {}, at(0)).extra.cords, undefined, 'one candle is not a pair');
  assert.equal(tieCord(pair(), 'a', 'zz', {}, at(0)).extra.cords, undefined);
  assert.equal(untieCord(d, cord.id).extra.cords, undefined);
  assert.equal(cordsOf(updateCord(d, cord.id, { height: 0.7 }))[0].height, 0.7);
});

test('the cord catches when the wax reaches its height: halfway down a two-hour chime is an hour of burning', () => {
  let d = tieCord(pair(), 'a', 'b', { height: 0.5 }, at(0));
  assert.equal(reachesAt(d.objects[0], 0.5, T0), null, 'unlit: not on its way');
  d = light(d, 0, 0);
  assert.equal(reachesAt(d.objects[0], 0.5, T0), T0 + HOUR);
  assert.equal(nextCordEvent(d, new Date(T0)), T0 + HOUR);
  assert.equal(cordState(d, cordsOf(d)[0], T0 + HOUR - 1).status, 'tied');
  const burning = cordState(d, cordsOf(d)[0], T0 + HOUR + CORD_BURN_MS / 2);
  assert.equal(burning.status, 'burning');
  assert.equal(burning.caughtOn, 'a');
  assert.equal(burning.burned, 0.5);
  assert.equal(cordState(d, cordsOf(d)[0], T0 + HOUR + CORD_BURN_MS).status, 'cut');
});

test('a third down catches sooner, two thirds later; the first candle to get there catches it', () => {
  let d = tieCord(pair(), 'a', 'b', { height: 0.3 }, at(0));
  d = light(light(d, 0, 0), 1, 10 * 60_000);
  assert.deepEqual({ ...cordState(d, cordsOf(d)[0], T0 + 0.6 * HOUR + 1) }.status, 'burning');
  let e = tieCord(pair(), 'a', 'b', { height: 0.7 }, at(0));
  e = light(light(e, 1, 0), 0, 30 * 60_000);
  const caught = cordState(e, cordsOf(e)[0], T0 + 2 * HOUR);
  assert.equal(caught.caughtOn, 'b');
  assert.equal(caught.caughtAt, T0 + 1.4 * HOUR);
});

test('snuffed short of the cord, it waits; burned past it in sessions, it caught when the total got there', () => {
  let d = tieCord(pair(), 'a', 'b', { height: 0.5 }, at(0));
  d = light(d, 0, 0);
  d = light(d, 0, 40 * 60_000); // snuffed after 40 minutes
  assert.equal(cordState(d, cordsOf(d)[0], T0 + 5 * HOUR).status, 'tied');
  assert.equal(nextCordEvent(d, new Date(T0 + 5 * HOUR)), null);
  d = light(d, 0, 6 * HOUR); // 20 more minutes reach it
  assert.equal(nextCordEvent(d, new Date(T0 + 6 * HOUR)), T0 + 6 * HOUR + 20 * 60_000);
  d = light(d, 0, 7 * HOUR); // snuffed at 7h: it got there in that burn
  assert.equal(reachesAt(d.objects[0], 0.5, T0 + 8 * HOUR), T0 + 6 * HOUR + 20 * 60_000);
});

test('settling keeps what happened, even while the altar was closed, and saves with the altar', () => {
  let d = tieCord(pair(), 'a', 'b', { height: 0.5 }, at(0));
  d = light(d, 0, 0);
  const caught = settleCords(d, at(HOUR + 1000));
  assert.equal(cordsOf(caught)[0].status, 'burning');
  assert.equal(cordsOf(caught)[0].caughtAt, at(HOUR));
  assert.equal(nextCordEvent(caught, new Date(T0 + HOUR + 1000)), T0 + HOUR + CORD_BURN_MS);
  // Days later: the candle burned out and the cord is cut, at the moment it would have parted.
  const later = settleCandles(d, at(30 * HOUR));
  const cord = cordsOf(later)[0];
  assert.equal(cord.status, 'cut');
  assert.equal(cord.cutAt, at(HOUR + CORD_BURN_MS));
  assert.equal(settleCords(later, at(40 * HOUR)), later, 'nothing more happens to a cut cord');
  // Kept in the saved altar's JSON, beside the groups, and read back.
  const back = documentFromAltar(JSON.parse(JSON.stringify(altarDataFromDocument(later, 'Cord', at(30 * HOUR)))));
  assert.deepEqual(cordsOf(back), cordsOf(later));
  assert.match(cordLine(back, cordsOf(back)[0], (id) => id.toUpperCase()), /^Cut .*The flame of A reached the cord/);
  assert.equal(clearAltar(back).extra.cords, undefined);
});

test('a candle burned out before the cord was tied counts as reached', () => {
  let d = pair();
  d = light(d, 0, 0);
  d = settleCandles(d, at(3 * HOUR)); // the chime burned all the way down
  d = { ...d, extra: { cords: [{ id: 'c1', a: 'a', b: 'b', height: 0.5, color: 'red', tiedAt: at(4 * HOUR), status: 'tied' }] } };
  assert.equal(cordState(d, cordsOf(d)[0], T0 + 4 * HOUR).status, 'cut');
});

test('the panel line says how far down it is and when the flame will reach it', () => {
  let d = tieCord(pair(), 'a', 'b', { height: 0.5 }, at(0));
  assert.match(cordLine(d, cordsOf(d)[0], (id) => id, T0), /^Tied halfway down between a and b\. The cord burns when the candles reach it\.$/);
  d = light(d, 0, 0);
  assert.match(cordLine(d, cordsOf(d)[0], (id) => id, T0 + 30 * 60_000), /reaches the cord in about 30 minutes/);
  assert.match(cordLine(d, cordsOf(d)[0], (id) => id, T0 + HOUR + 1000), /has reached the cord/);
});

test('where the cord sits on a candle: on its wax, where the flame comes down to at that height', () => {
  const candle = chime('a', 0.4);
  setImageRatioLookup(() => 2);
  try {
    const shape = candleShape('chime-spell')!;
    const top = cordAnchor(candle, 0, 100, 200);
    const mid = cordAnchor(candle, 0.5, 100, 200);
    const low = cordAnchor(candle, 1, 100, 200);
    assert.ok(top.y < mid.y && mid.y < low.y);
    assert.ok(mid.half > 0 && mid.half < 50);
    // The wax top comes down to the cord just as the burn reaches its height.
    const halfway = burnDown(candle, T0)!;
    assert.ok(Math.abs(shape.capEnd + 0.5 * shape.maxDrop - (halfway.capEnd + 0.5 * halfway.maxDrop)) < 1e-9);
    const d = tieCord(pair(), 'a', 'b', {}, at(0));
    const ends = cordEnds(d, cordsOf(d)[0], 1000)!;
    assert.ok(ends.left.x < ends.right.x);
    assert.equal(ends.left.id, 'a');
    const moved = updateObjects(d, [0], (o) => ({ ...o, leftPercent: 0.9 }));
    assert.equal(cordEnds(moved, cordsOf(moved)[0], 1000)!.left.id, 'b', 'the cord follows its candles');
  } finally {
    setImageRatioLookup(() => null);
  }
});

test('the drawing: whole when tied, an ember travelling from the candle that caught it, two hanging ends once cut', () => {
  const ends = { left: { id: 'a', x: 100, y: 200, half: 10 }, right: { id: 'b', x: 300, y: 200, half: 10 } };
  const tied = cordArt(ends, { status: 'tied', burned: 0, caughtAt: null, caughtOn: '', cutAt: null }, T0, 800);
  assert.ok(tied.span.startsWith('M109 200Q'));
  assert.equal(tied.wraps.length, 4);
  assert.ok(tied.wraps.every((w) => !w.charred));
  assert.equal(tied.ember, null);
  const fromRight = cordArt(ends, { status: 'burning', burned: 0.5, caughtAt: T0, caughtOn: 'b', cutAt: null }, T0 + 20_000, 800);
  assert.ok(fromRight.ember && fromRight.ember.x > 200 && fromRight.ember.x < 291, 'a quarter of the way in from the right');
  assert.deepEqual(fromRight.wraps.map((w) => w.charred), [false, false, true, true]);
  assert.ok(fromRight.charred.endsWith('291 200'));
  assert.ok(fromRight.smoke.length > 0);
  const justCut = cordArt(ends, { status: 'cut', burned: 1, caughtAt: T0, caughtOn: 'b', cutAt: T0 + CORD_BURN_MS }, T0 + CORD_BURN_MS, 800);
  const hanging = cordArt(ends, { status: 'cut', burned: 1, caughtAt: T0, caughtOn: 'b', cutAt: T0 + CORD_BURN_MS }, T0 + CORD_BURN_MS + CORD_FALL_MS, 800);
  assert.equal(hanging.span, '');
  assert.equal(hanging.pieces.length, 2);
  assert.ok(hanging.tips[0].y > justCut.tips[0].y, 'the ends fall');
  assert.ok(cordMoving({ status: 'cut', burned: 1, caughtAt: T0, caughtOn: 'b', cutAt: T0 }, T0 + 1000));
  assert.ok(!cordMoving({ status: 'cut', burned: 1, caughtAt: T0, caughtOn: 'b', cutAt: T0 }, T0 + 60_000));
});
