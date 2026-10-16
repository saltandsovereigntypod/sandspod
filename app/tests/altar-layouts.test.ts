import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInBackgrounds, builtInCabinet, objectFromForm, placeableForms } from '../src/lib/altar/cabinet.ts';
import { displayBox } from '../src/lib/altar/geometry.ts';
import { applyMoves, isGod, isGoddess, LAYOUTS, layoutPlan, placementWisdom, surfaceFor } from '../src/lib/altar/reading/layouts.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const NOW = '2026-10-16T20:00:00.000Z';
const place = (itemId: string, form?: string): SavedObject => {
  const item = builtInCabinet.find((i) => i.id === itemId)!;
  const forms = placeableForms(item);
  return objectFromForm(item, forms.find((f) => f.form === form) ?? forms[0], [], NOW);
};

const altar = () => [
  place('crystals:smoky-quartz', 'point'), // Earth
  place('herbs:lavender', 'sprig'), // Air
  place('candles:red-candle', 'taper'), // Fire
  place('crystals:moonstone', 'tumbled'), // Water
  place('deities:selene-statue'),
  place('candles:white-candle', 'taper'),
  place('crystals:amethyst', 'cluster'),
];

test('surfaces come from the background', () => {
  assert.deepEqual(surfaceFor(''), [0.6, 0.88]);
  const gothic = builtInBackgrounds.find((b) => b.id === 'gothic')!;
  assert.deepEqual(surfaceFor(gothic.background), [0.56, 0.8]);
});

test('four directions: Earth north at the back, Fire south at the front, Air east, Water west', () => {
  const objects = altar();
  const plan = layoutPlan('directions', objects, '');
  const at = (role: string) => plan.moves.find((m) => m.role.startsWith(role))!;
  assert.ok(at('North').cy < at('South').cy, 'north is behind south');
  assert.ok(at('East').cx > 0.5 && at('West').cx < 0.5);
  assert.equal(objects[at('South').index].color, 'red');
  // Every move lands on the stage and on the tabletop band.
  for (const m of plan.moves) {
    assert.ok(m.cx > 0 && m.cx < 1 && m.cy > 0 && m.cy < 1, `${m.label} ${m.cx},${m.cy}`);
    const box = displayBox({ ...objects[m.index], leftPercent: m.leftPercent, topPercent: m.topPercent });
    assert.ok(Math.abs(box.cx - m.cx) < 1e-9 && Math.abs(box.cy - m.cy) < 1e-9, 'saved fields match the centre');
  }
});

test('triangle, pentacle and grid place the right number of things', () => {
  const objects = altar();
  const tri = layoutPlan('triangle', objects, '');
  assert.equal(tri.moves.filter((m) => /corner|Apex/.test(m.role)).length, 3);
  assert.ok(tri.moves.find((m) => m.role === 'Apex')!.cy < tri.moves.find((m) => m.role === 'Left corner')!.cy);
  const penta = layoutPlan('pentacle', objects, '');
  assert.equal(penta.moves.filter((m) => m.role !== 'Centre').length, 5);
  const top = penta.moves.find((m) => m.role.startsWith('Top'))!;
  assert.equal(objects[top.index].type, 'deity', 'Spirit at the top');
  const grid = layoutPlan('grid', objects, '');
  const centre = grid.moves.find((m) => m.role === 'Centre')!;
  assert.equal(objects[centre.index].form, 'point');
  assert.ok(grid.moves.filter((m) => m.role === 'Ring').every((m) => objects[m.index].type === 'crystal'));
});

test('God and Goddess: goddess left, god right, pairs mirrored', () => {
  const objects = [place('deities:apollo-statue'), place('deities:artemis-statue'), place('candles:gold-candle', 'taper'), place('candles:silver-candle', 'taper')];
  assert.ok(isGoddess(objects[1]) && isGod(objects[0]));
  const plan = layoutPlan('mirror', objects, '');
  const goddess = plan.moves.find((m) => m.role.startsWith('Goddess'))!;
  const god = plan.moves.find((m) => m.role.startsWith('God '))!;
  assert.equal(objects[goddess.index].deity, 'artemis');
  assert.ok(goddess.cx < 0.5 && god.cx > 0.5);
  const [l, r] = plan.moves.filter((m) => m.role.startsWith('Mirrored'));
  assert.ok(Math.abs(l.cx - 0.5 - (0.5 - r.cx)) < 0.02, 'mirrored about the centre');
});

test('locked things and cloths stay put; applying moves only moves', () => {
  const objects = altar();
  objects[2] = { ...objects[2], locked: 'true' };
  const plan = layoutPlan('directions', objects, '');
  assert.ok(!plan.moves.some((m) => m.index === 2));
  const moved = applyMoves(objects, plan.moves);
  assert.equal(moved[2], objects[2]);
  const m = plan.moves[0];
  assert.equal(moved[m.index].leftPercent, m.leftPercent);
  assert.equal(moved[m.index].label, objects[m.index].label);
  assert.equal(LAYOUTS.length, 5);
});

test('placement wisdom for each kind of thing', () => {
  assert.match(placementWisdom(place('candles:red-candle', 'taper')), /Fire things traditionally sit in the south/);
  assert.match(placementWisdom(place('tools:chalice')), /west/);
  assert.match(placementWisdom(place('deities:artemis-statue')), /left/);
  assert.match(placementWisdom(place('crystals:moonstone', 'tumbled')), /Water/);
});
