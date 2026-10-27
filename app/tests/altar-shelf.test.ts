// The tools the Living Library has no page for, and the Natural drawer: only
// those with a picture are offered, each says a few words of its own, lamps
// are set down glowing, and none of them goes over like food.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, cabinetCategories, cabinetItemsFor, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { offeringOf, perishableItself } from '../src/lib/altar/offerings.ts';
import { glowsWhenPlaced, NATURAL_OBJECTS, naturalItems, SHELF_TOOLS, shelfDescription, shelfToolItems } from '../src/lib/altar/shelf.ts';
import { altarDataFromDocument, documentFromAltar, emptyDocument } from '../src/lib/altar/snapshot.ts';

const pics = (dir: string, ids: string[]) => Object.fromEntries(ids.map((id) => [id, `../assets/altar/objects/${dir}/${id}/${id}.png`]));
const NOW = '2026-10-23T19:00:00.000Z';

test('every new tool and natural find has a name, a group and a description in a sentence or two', () => {
  assert.equal(SHELF_TOOLS.length, 21);
  assert.equal(NATURAL_OBJECTS.length, 13);
  for (const o of [...SHELF_TOOLS, ...NATURAL_OBJECTS]) {
    assert.ok(o.name && o.group && o.keywords.length, o.id);
    assert.match(o.description, /^[A-Z].*\.$/, o.id);
    assert.ok(!/!/.test(o.description), `${o.id}: no exclamation marks`);
    assert.ok(o.description.split(/\.\s/).length <= 2, `${o.id}: one or two sentences`);
  }
  assert.match(NATURAL_OBJECTS.find((o) => o.id === 'hag-stone')!.description, /protective seeing-stone/);
  // No id is used twice, nor clashes with the Library's own tools in the cabinet.
  const ids = SHELF_TOOLS.map((o) => `tools:${o.id}`);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(cabinetCategories.some((c) => c.id === 'natural'));
});

test('only those with a picture reach the cabinet, as tools or in the Natural drawer', () => {
  const tools = shelfToolItems(pics('tools', ['scrying-mirror', 'lantern']));
  assert.deepEqual(tools.map((i) => i.id), ['tools:scrying-mirror', 'tools:lantern']);
  assert.deepEqual(tools[0].forms, [{ label: 'Place', image: '../assets/altar/objects/tools/scrying-mirror/scrying-mirror.png', type: 'tool', tool: 'scrying-mirror', form: 'standard' }]);
  assert.ok(tools[0].description);
  const natural = naturalItems(pics('natural', ['hag-stone']));
  assert.deepEqual(natural[0].forms, [{ label: 'Place', image: '../assets/altar/objects/natural/hag-stone/hag-stone.png', type: 'natural', form: 'hag-stone' }]);
  assert.equal(cabinetItemsFor(natural, 'natural', 'protection').length, 1);
  assert.deepEqual(shelfToolItems({}), []);
  assert.deepEqual(naturalItems({}), []);
  // An unknown picture in the folder (not named here) isn't offered.
  assert.deepEqual(naturalItems(pics('natural', ['mystery'])), []);
  assert.ok(builtInCabinet.filter((i) => i.category === 'natural').every((i) => !!i.forms[0].image));
});

test('a lamp or lantern is set down glowing; the rest are not', () => {
  const items = shelfToolItems(pics('tools', ['lantern', 'scrying-mirror']));
  const lantern = items.find((i) => i.id === 'tools:lantern')!;
  const mirror = items.find((i) => i.id === 'tools:scrying-mirror')!;
  assert.equal(objectFromForm(lantern, lantern.forms[0], [], NOW).glowing, 'true');
  assert.equal(objectFromForm(mirror, mirror.forms[0], [], NOW).glowing, 'false');
  for (const id of ['oil-lamp', 'lantern', 'salt-lamp']) assert.ok(glowsWhenPlaced({ type: 'tool', tool: id }), id);
  assert.ok(!glowsWhenPlaced({ type: 'natural', form: 'feathers' }));
});

test('they keep: a tea leaf cup is not a drink, pressed flowers don’t wilt', () => {
  const cup = shelfToolItems(pics('tools', ['tea-leaf-cup']))[0];
  const flowers = naturalItems(pics('natural', ['pressed-flowers', 'eggshells']));
  for (const item of [cup, ...flowers]) {
    const object = objectFromForm(item, item.forms[0], [], NOW);
    assert.equal(perishableItself(object), null, item.name);
    assert.equal(offeringOf(object), null, item.name);
  }
});

test('placed, each says its few words, and keeps its shape through a save and a load', () => {
  const item = naturalItems(pics('natural', ['acorns']))[0];
  const object = objectFromForm(item, item.forms[0], [], NOW);
  const back = documentFromAltar(JSON.parse(JSON.stringify(altarDataFromDocument({ ...emptyDocument(), objects: [object] }, 'Autumn', NOW)))).objects[0];
  assert.equal(back.type, 'natural');
  assert.equal(back.form, 'acorns');
  assert.match(shelfDescription(back), /oak/);
  assert.equal(shelfDescription({ type: 'tool', tool: 'athame' }), '');
});
