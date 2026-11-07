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
