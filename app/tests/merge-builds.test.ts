import assert from 'node:assert/strict';
import { test } from 'node:test';

import { addLayer, emptyJar, jarItem, jarLayer, jarObject, jarStateOf } from '../src/lib/altar/workings/spellJar.ts';
import { addFilling, emptySachet, filling, sachetObject, sachetStateOf } from '../src/lib/altar/workings/sachet.ts';
import { emptyPoppet, poppetObject, poppetStateOf } from '../src/lib/altar/workings/poppet.ts';
import { backfillBuilds, buildOf, builderFor } from '../src/lib/altar/workings/build.ts';
import { placeApothecary } from '../src/lib/altar/editor.ts';
import type { AltarDocument } from '../src/lib/altar/snapshot.ts';
import { activateGrid, gridOf, wandGridEntry, withGridEntry } from '../src/lib/altar/craftTools.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import { myStones, shelfIdOfStone, shelfWithStone, stonesIntoShelves } from '../src/lib/shelves/stones.ts';
import { cleanItem, newItem } from '../src/lib/shelves/model.ts';
import { PIN_CROWD, poppetPlan, spreadPins } from '../src/lib/altar/workings/poppetLook.ts';
import { makePin, pinDetail } from '../src/lib/altar/workings/poppet.ts';

const NOW = '2026-11-07T10:00:00.000Z';
const doc = (objects: AltarDocument['objects'] = []) => ({ objects }) as unknown as AltarDocument;

test('builders: the design is kept on the My Apothecary item and placing it again restores it', () => {
  const jar = addLayer({ ...emptyJar('Protection'), vessel: 'bottle' }, jarLayer({ label: 'Salt', source: 'salt' }, NOW));
  const item = jarItem(jar, NOW, 'j1');
  assert.equal(buildOf(item)?.kind, 'jar');
  const placed = placeApothecary(doc(), item, NOW).objects[0];
  const state = jarStateOf(placed)!;
  assert.equal(state.layers[0].label, 'Salt');
  assert.equal(state.vessel, 'bottle');
  assert.deepEqual(state.renewals, []);
});

test('builders: an item without a design places as before', () => {
  const item = { ...jarItem(emptyJar('x'), NOW, 'j2'), metadata: {} };
  const placed = placeApothecary(doc(), item, NOW).objects[0];
  assert.equal(jarStateOf(placed), null);
  assert.equal(placed.apothecaryItemId, 'j2');
});

test('builders: migration copies the design from the placed copy, once, without losing anything', () => {
  const s = addFilling(emptySachet('Luck'), filling('Basil', 'herb'));
  const { item: sItem, object: sObj } = sachetObject(s, [], NOW, undefined, 's1');
  const { item: pItem, object: pObj } = poppetObject({ ...emptyPoppet(), purpose: 'Rest' }, [], NOW, undefined, 'p1');
  const jarOld = { ...jarItem(emptyJar('a'), NOW, 'j3'), metadata: { lookBack: { when: 'moon' } } };
  const { object: jObj } = jarObject(addLayer(emptyJar('a'), jarLayer({ label: 'Rose', source: 'typed' }, NOW)), [], NOW, undefined, jarOld);
  const old = [sItem, pItem, jarOld].map((i) => {
    const metadata = { ...(i.metadata ?? {}) } as Record<string, unknown>;
    delete metadata.build;
    return { ...i, metadata };
  });
  const changed = backfillBuilds(old, [sObj, pObj, jObj]);
  assert.equal(changed.length, 3);
  const jar = changed.find((i) => i.id === 'j3')!;
  assert.deepEqual((jar.metadata as Record<string, unknown>).lookBack, { when: 'moon' });
  assert.equal(buildOf(jar)?.kind, 'jar');
  assert.equal(sachetStateOf(sObj)?.fillings[0].label, 'Basil');
  assert.equal(poppetStateOf(pObj)?.purpose, 'Rest');
  // Idempotent: done once, nothing changes again.
  assert.deepEqual(backfillBuilds(changed, [sObj, pObj, jObj]), []);
  assert.equal(builderFor('herb-mix'), null);
});

test('wand grid: kept as a crystal.grids entry, and an old one migrates once without losing the lines', () => {
  const stone = (id: string, x: number, y: number) => ({ type: 'crystal', label: `Stone ${id}`, form: 'tumbled', altarObjectId: id, x, y }) as unknown as SavedObject;
  const objects = [stone('a', 0.3, 0.3), stone('b', 0.7, 0.3), stone('c', 0.5, 0.7), stone('m', 0.5, 0.45), stone('d', 0.2, 0.6)];
  const extra = activateGrid({}, objects, NOW);
  const lit = gridOf(extra)!;
  assert.equal(lit.entryId, undefined);
  const entry = wandGridEntry(lit, objects, 'altar1', NOW)!;
  assert.equal(entry.status, 'active');
  assert.equal(entry.altarId, 'altar1');
  assert.equal(entry.points.length + (entry.centre ? 1 : 0), 5);
  const linked = withGridEntry(extra, 'g1');
  assert.deepEqual(gridOf(linked)!.ids, lit.ids);
  assert.equal(gridOf(linked)!.entryId, 'g1');
});

test('poppet pins: two in the same place are drawn apart so every head shows; the saved pins are untouched', () => {
  const a = makePin({ x: 0.5, y: 0.4, zone: 'heart' }, 'red', 'Courage', NOW);
  const b = makePin({ x: 0.5, y: 0.4, zone: 'heart' }, 'green', '', NOW);
  const c = makePin({ x: 0.505, y: 0.401, zone: 'heart' }, 'white', '', NOW);
  const far = makePin({ x: 0.2, y: 0.8, zone: 'free' }, 'red', '', NOW);
  const drawn = spreadPins([a, b, c, far], 1.6);
  assert.equal(drawn[0], a);
  assert.equal(drawn[3], far);
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) assert.ok(Math.hypot(drawn[i].x - drawn[j].x, (drawn[i].y - drawn[j].y) * 1.6) >= PIN_CROWD * 0.99, `${i},${j}`);
  assert.equal(b.x, 0.5);
  // The picture draws one head per pin, at distinct places.
  const plan = poppetPlan({ body: 'cloth' }, [a, b, c])!;
  const heads = plan.steps.filter((s) => s.kind === 'image' && s.part === 'pinHead').map((s) => (s as { x: number }).x);
  assert.equal(heads.length, 3);
  const d = pinDetail(a);
  assert.match(d.place, /^Heart/);
  assert.equal(d.note, 'Courage');
  assert.ok(d.set.startsWith('Set '));
});

test('my stones: folded into My Shelves once, care logs kept, old ids still link', () => {
  const care = [{ id: 'c1', kind: 'cleansed' as const, at: NOW, method: 'Smoke' }];
  const old = [
    { id: 'st1', data: { name: 'Amethyst', key: 'amethyst', form: 'point', intentions: ['Sleep'], care } },
    { id: 'st2', data: { name: 'Selenite', form: 'raw', intentions: [], care: [] } },
    { id: 'st3', data: { name: 'Gone' }, deletedAt: NOW },
  ];
  const shelves = [{ id: 'sh1', createdAt: NOW, item: newItem({ name: 'selenite', shelf: 'crystals', notes: 'From the market' }) }];
  const { add, update } = stonesIntoShelves(old, shelves);
  assert.equal(add.length, 1);
  assert.equal(add[0].stone?.stoneId, 'st1');
  assert.deepEqual(add[0].stone?.care, care);
  assert.equal(update.length, 1);
  assert.equal(update[0].id, 'sh1');
  assert.equal(update[0].item.notes, 'From the market');
  assert.equal(update[0].item.stone?.stoneId, 'st2');
  // Saved and read back (cleanItem keeps the stone), then nothing more to do.
  const after = [{ id: 'sh1', createdAt: NOW, item: cleanItem(JSON.parse(JSON.stringify(update[0].item))) }, { id: 'sh2', createdAt: NOW, item: cleanItem(JSON.parse(JSON.stringify(add[0]))) }];
  const again = stonesIntoShelves(old, after);
  assert.deepEqual(again, { add: [], update: [] });
  const stones = myStones(after);
  assert.deepEqual(stones.map((s) => s.id).sort(), ['st1', 'st2']);
  assert.equal(stones.find((s) => s.id === 'st1')!.data.intentions[0], 'Sleep');
  assert.equal(shelfIdOfStone(after, 'st1'), 'sh2');
  assert.equal(shelfIdOfStone(after, 'sh1'), 'sh1');
  // A care entry written later lands on the same shelf thing, keeping its old id.
  const st = stones.find((s) => s.id === 'st1')!;
  const next = shelfWithStone({ ...st.data, care: [...st.data.care, { id: 'c2', kind: 'charged', at: NOW }] }, 'st1', after[1].item);
  assert.equal(next.stone?.care.length, 2);
  assert.equal(next.stone?.stoneId, 'st1');
});
