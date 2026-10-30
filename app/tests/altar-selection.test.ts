import assert from 'node:assert/strict';
import { test } from 'node:test';

import { groupObjects, moveObject, removeObject, ungroup } from '../src/lib/altar/editor.ts';
import { displayBox } from '../src/lib/altar/geometry.ts';
import {
  clampMove,
  groupsIn,
  idsOf,
  indicesOf,
  layerTogether,
  lightTogether,
  lockTogether,
  moveTogether,
  removeObjects,
  selectAll,
  toggleSelection,
  withGroups,
} from '../src/lib/altar/selection.ts';
import { altarDataFromDocument, documentFromAltar, emptyDocument, type AltarDocument } from '../src/lib/altar/snapshot.ts';
import { isLit } from '../src/lib/altar/livingState.ts';
import { cordsOf, tieCord } from '../src/lib/altar/cord.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const NOW = '2026-10-29T20:00:00.000Z';
const thing = (id: string, left: number, top: number, extra: Partial<SavedObject> = {}): SavedObject => ({
  label: id,
  type: 'tool',
  altarObjectId: id,
  leftPercent: left,
  topPercent: top,
  sizePercent: 0.08,
  zIndex: '10',
  ...extra,
});
const doc = (...objects: SavedObject[]): AltarDocument => ({ ...emptyDocument(), objects });
const centre = (d: AltarDocument, i: number) => {
  const b = displayBox(d.objects[i]);
  return { x: b.cx, y: b.cy };
};
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test('choosing one of a group chooses the whole group, and a second tap lets the group go', () => {
  let d = doc(thing('a', 0.3, 0.5), thing('b', 0.5, 0.5), thing('c', 0.7, 0.5));
  d = groupObjects(d, [0, 2], 'Pair', NOW);
  assert.deepEqual(withGroups(d, [0]), [0, 2]);
  let sel = toggleSelection(d, [], 2);
  assert.deepEqual(sel, [0, 2]);
  sel = toggleSelection(d, sel, 1);
  assert.deepEqual(sel, [0, 1, 2]);
  sel = toggleSelection(d, sel, 0);
  assert.deepEqual(sel, [1]);
  assert.deepEqual(selectAll(d), [0, 1, 2]);
  assert.deepEqual(groupsIn(d, [0, 1]), [d.objects[0].groupId]);
});

test('a selection kept by id finds its objects again after the order changes', () => {
  const d = doc(thing('a', 0.3, 0.5), thing('b', 0.5, 0.5), thing('c', 0.7, 0.5));
  const ids = idsOf(d, [2, 0]);
  assert.deepEqual(ids, ['a', 'c']);
  const shuffled = { ...d, objects: [d.objects[2], d.objects[1], d.objects[0]] };
  assert.deepEqual(indicesOf(shuffled, ids), [0, 2]);
});

test('three things move together by the same amount, keeping their places to one another', () => {
  const d = doc(thing('a', 0.3, 0.5), thing('b', 0.45, 0.6), thing('c', 0.6, 0.4), thing('d', 0.8, 0.8));
  const before = [0, 1, 2, 3].map((i) => centre(d, i));
  const moved = moveTogether(d, [0, 1, 2], 0.1, -0.05);
  [0, 1, 2].forEach((i) => {
    close(centre(moved, i).x, before[i].x + 0.1);
    close(centre(moved, i).y, before[i].y - 0.05);
  });
  assert.equal(moved.objects[3], d.objects[3]);
});

test('moving together stops at the edge for all of them, so nothing is squashed against it', () => {
  const d = doc(thing('a', 0.85, 0.5), thing('b', 0.6, 0.5));
  const gap = centre(d, 0).x - centre(d, 1).x;
  const moved = moveTogether(d, [0, 1], 0.5, 0);
  const a = displayBox(moved.objects[0]);
  close(a.cx + a.size / 2, 1); // the leading one is at the edge
  close(centre(moved, 0).x - centre(moved, 1).x, gap); // and the gap is the same
  const limit = clampMove([{ box: displayBox(d.objects[0]) }], 1, 0);
  assert.ok(limit.dx > 0 && limit.dx < 0.2);
});

test('locked things stay put while the rest move', () => {
  const d = doc(thing('a', 0.3, 0.5), thing('b', 0.5, 0.5, { locked: 'true' }));
  const moved = moveTogether(d, [0, 1], 0.1, 0);
  close(centre(moved, 0).x, centre(d, 0).x + 0.1);
  assert.equal(moved.objects[1], d.objects[1]);
});

test('dragging one member of a group moves the group as one, kept whole on the altar', () => {
  let d = doc(thing('a', 0.3, 0.5), thing('b', 0.5, 0.5), thing('c', 0.7, 0.5));
  d = groupObjects(d, [0, 1], 'Pair', NOW);
  const gap = centre(d, 1).x - centre(d, 0).x;
  const target = centre(d, 0);
  const moved = moveObject(d, 0, target.x - 0.9, target.y);
  close(centre(moved, 1).x - centre(moved, 0).x, gap);
  const a = displayBox(moved.objects[0]);
  close(a.cx - a.size / 2, 0);
  assert.equal(moved.objects[2], d.objects[2]);
});

test('deleting several is one step, and tidies their group and cords', () => {
  let d = doc(
    thing('a', 0.2, 0.5),
    thing('b', 0.4, 0.5),
    thing('c', 0.6, 0.5),
    thing('k1', 0.3, 0.7, { type: 'candle' }),
    thing('k2', 0.5, 0.7, { type: 'candle' }),
  );
  d = groupObjects(d, [0, 1], 'Pair', NOW);
  d = tieCord(d, 'k1', 'k2', {}, NOW);
  assert.equal(cordsOf(d).length, 1);
  const after = removeObjects(d, [1, 3]);
  assert.deepEqual(after.objects.map((o) => o.altarObjectId), ['a', 'c', 'k2']);
  // A group of one is no group.
  assert.equal(after.objects[0].groupId, undefined);
  assert.equal(after.groups.length, 0);
  assert.equal(after.activeGroupId, null);
  assert.equal(cordsOf(after).length, 0);
  // removeObject is the same tidy-up for one.
  const one = removeObject(d, 0);
  assert.equal(one.groups.length, 0);
});

test('a group of three that loses one keeps the other two together', () => {
  let d = doc(thing('a', 0.2, 0.5), thing('b', 0.4, 0.5), thing('c', 0.6, 0.5));
  d = groupObjects(d, [0, 1, 2], 'Trio', NOW);
  const after = removeObjects(d, [1]);
  assert.equal(after.groups.length, 1);
  assert.deepEqual(after.groups[0].objectIds, ['a', 'c']);
  assert.ok(after.objects.every((o) => o.groupId === after.groups[0].id));
});

test('groups are kept in the saved altar and read back, old saves without groups too', () => {
  let d = doc(thing('a', 0.2, 0.5), thing('b', 0.4, 0.5));
  d = groupObjects(d, [0, 1], 'Shrine', NOW);
  const saved = JSON.parse(JSON.stringify(altarDataFromDocument(d, 'Mine', NOW)));
  const back = documentFromAltar(saved);
  assert.equal(back.groups.length, 1);
  assert.equal(back.groups[0].name, 'Shrine');
  assert.equal(back.activeGroupId, back.groups[0].id);
  assert.deepEqual(withGroups(back, [1]), [0, 1]);
  // A website save from before groups were named still groups by groupId.
  const old = documentFromAltar({ objects: [thing('x', 0.2, 0.5, { groupId: 'g1' }), thing('y', 0.4, 0.5, { groupId: 'g1' })], groups: [{ id: 'g1', objectIds: ['x', 'y'] }] });
  assert.deepEqual(withGroups(old, [0]), [0, 1]);
  assert.deepEqual(ungroup(old, 'g1').objects.map((o) => o.groupId), [undefined, undefined]);
  // And a save with no groups at all.
  assert.deepEqual(documentFromAltar({ objects: [thing('z', 0.5, 0.5)] }).groups, []);
});

test('layering several brings them to the front (or back) in their own order', () => {
  const d = doc(thing('a', 0.2, 0.5, { zIndex: '10' }), thing('b', 0.4, 0.5, { zIndex: '11' }), thing('c', 0.6, 0.5, { zIndex: '12' }));
  const front = layerTogether(d, [0, 1], 'front');
  assert.deepEqual(front.objects.map((o) => o.zIndex), ['11', '12', '10']);
  const back = layerTogether(d, [2], 'back');
  assert.deepEqual(back.objects.map((o) => o.zIndex), ['11', '12', '10']);
});

test('light and snuff the chosen candles; lock the chosen things', () => {
  const d = doc(thing('k', 0.3, 0.5, { type: 'candle', form: 'taper' }), thing('a', 0.5, 0.5));
  const lit = lightTogether(d, [0, 1], true, NOW);
  assert.ok(isLit(lit.objects[0]));
  assert.equal(lit.objects[1], d.objects[1]);
  assert.ok(!isLit(lightTogether(lit, [0], false, '2026-10-29T21:00:00.000Z').objects[0]));
  const locked = lockTogether(d, [0, 1], true);
  assert.deepEqual(locked.objects.map((o) => o.locked), ['true', 'true']);
  assert.equal(lockTogether(locked, [0, 1], true), locked);
});
