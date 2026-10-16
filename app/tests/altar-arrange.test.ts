import assert from 'node:assert/strict';
import { test } from 'node:test';

import { mirrorPair, mirrorPartner, SNAP_RADIUS, snapToMeaning } from '../src/lib/altar/arrange.ts';
import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { displayBox, withCenter } from '../src/lib/altar/geometry.ts';
import { MEANING_SPOTS, standOn, SURFACES } from '../src/lib/altar/reading/layouts.ts';
import { SURFACES as TONIGHT_SURFACES } from '../src/lib/altar/tonight.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const now = new Date(Date.UTC(2026, 9, 1)).toISOString();
const item = (id: string) => builtInCabinet.find((i) => i.id === id)!;
const place = (id: string, cx: number, cy: number, others: SavedObject[] = []): SavedObject => {
  const it = item(id);
  return withCenter(objectFromForm(it, it.forms[0], others, now), cx, cy);
};

test('layouts stand things on the same tabletop tonight’s altar does', () => {
  assert.equal(SURFACES, TONIGHT_SURFACES);
});

test('dragged near the north, an object settles onto it', () => {
  const candle = place('candles:red-candle', 0.3, 0.3);
  const north = standOn(candle, MEANING_SPOTS[0], '');
  const near = snapToMeaning(candle, north.cx + SNAP_RADIUS / 2, north.cy, '');
  assert.ok(near);
  assert.equal(near!.role, 'North · Earth');
  assert.equal(near!.cx, north.cx);
  assert.equal(near!.cy, north.cy);
});

test('far from every spot, or a cloth, or locked: no snap', () => {
  const candle = place('candles:red-candle', 0.3, 0.3);
  assert.equal(snapToMeaning(candle, 0.05, 0.1, ''), null);
  const north = standOn(candle, MEANING_SPOTS[0], '');
  assert.equal(snapToMeaning({ ...candle, locked: 'true' }, north.cx, north.cy, ''), null);
  assert.equal(snapToMeaning({ ...candle, type: 'cloth' }, north.cx, north.cy, ''), null);
});

test('a pair of like candles mirrors across the middle, same size and height', () => {
  const left = place('candles:red-candle', 0.3, 0.6);
  const right = place('candles:red-candle', 0.62, 0.5, [left]);
  const other = place('crystals:amethyst', 0.7, 0.6, [left, right]);
  const objects = [left, right, other];
  assert.equal(mirrorPartner(objects, 0), 1);
  assert.equal(mirrorPartner(objects, 2), null, 'nothing like the amethyst');
  const result = mirrorPair(objects, 0)!;
  assert.equal(result.partner, 1);
  const a = displayBox(result.objects[0]);
  const b = displayBox(result.objects[1]);
  assert.ok(Math.abs(b.cx - (1 - a.cx)) < 1e-6);
  assert.ok(Math.abs(b.cy - a.cy) < 1e-6);
  assert.ok(Math.abs(b.size - a.size) < 1e-6);
  assert.equal(result.objects[1].flipped, 'true');
  assert.equal(result.objects[2], other, 'the rest stay as they are');
  assert.equal(mirrorPair([left, other], 0), null);
});
