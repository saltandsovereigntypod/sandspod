// Food and flowers set out in a vessel: a painted heap drawn in its mouth,
// clipped to its rim, going over as the things themselves do.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { foodHeapOf, offeringArt, vesselMouth } from '../src/lib/altar/offeringArt.ts';
import { setOffering, type OfferingKindId } from '../src/lib/altar/offerings.ts';
import { altarDataFromDocument, documentFromAltar, emptyDocument } from '../src/lib/altar/snapshot.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const T0 = Date.UTC(2026, 9, 1, 20);
const at = (ms: number) => new Date(T0 + ms).toISOString();

const FOODS = Object.fromEntries(
  ['fruit', 'bread', 'sweets', 'meal', 'flowers', 'honeycomb'].map((id) => [id, { image: `../assets/altar/objects/offerings/${id}/${id}.png`, ratio: 0.6 }]),
);

const vessel = (id: string): SavedObject => {
  const item = builtInCabinet.find((i) => i.id === id)!;
  return objectFromForm(item, item.forms[0], [], at(0));
};
const holding = (id: string, kind: OfferingKindId, label = '') => setOffering(vessel(id), kind, label, at(0));
const art = (object: SavedObject, after: number, foods = FOODS) => offeringArt(object, 100, 100, T0 + after, null, foods);

test('each food and flower offering has its heap; drink and things that keep have none', () => {
  assert.equal(foodHeapOf('fruit', ''), 'fruit');
  assert.equal(foodHeapOf('harvest', 'apples'), 'fruit');
  assert.equal(foodHeapOf('bread', ''), 'bread');
  assert.equal(foodHeapOf('sweets', ''), 'sweets');
  assert.equal(foodHeapOf('cooked', 'stew'), 'meal');
  assert.equal(foodHeapOf('flowers', 'roses'), 'flowers');
  // Honey is poured, unless it's in the comb.
  assert.equal(foodHeapOf('honey', 'a little honey'), null);
  assert.equal(foodHeapOf('honey', 'honey in the comb'), 'honeycomb');
  for (const kind of ['water', 'drink', 'milk', 'dried', 'stones', 'coins'] as OfferingKindId[]) assert.equal(foodHeapOf(kind, ''), null, kind);
});

test('the heap sits in the vessel’s mouth, its foot hidden by the front of the rim', () => {
  for (const id of ['vessels:offering-bowl', 'vessels:bowl', 'vessels:dish', 'tools:chalice', 'vessels:cauldron']) {
    if (!builtInCabinet.some((i) => i.id === id)) continue;
    const bowl = holding(id, 'bread');
    const food = art(bowl, 0)?.food;
    assert.ok(food, id);
    assert.equal(food.id, 'bread');
    assert.equal(food.image, FOODS.bread.image);
    const { cx, cy, rx, ry } = food.mouth;
    // Across the mouth, not past its sides; standing up out of it.
    assert.ok(food.left >= cx - rx - 0.1 && food.left + food.width <= cx + rx + 0.1, id);
    assert.ok(Math.abs(food.left + food.width / 2 - cx) < 0.2, id);
    assert.ok(food.top < cy && food.top + food.height > cy && food.top + food.height <= cy + ry, id);
    // Clipped: everything above the rim's middle, and the mouth itself down to its front edge.
    assert.match(food.clip, /^M[\d.]+ [\d.-]+ L[\d.]+ [\d.-]+ L[\d.]+ [\d.]+ A[\d.]+ [\d.]+ 0 0 1 [\d.]+ [\d.]+ Z$/);
    assert.ok(food.clipTop <= food.top);
    // Fresh: its own colours.
    assert.equal(food.tint, null);
  }
  // A picture of your own as the vessel has no known mouth: nothing is drawn.
  assert.equal(art({ ...holding('vessels:offering-bowl', 'fruit'), imagePath: 'https://example.com/my-bowl.png' }, 0), null);
});

test('without the painted heap yet, nothing is drawn (as before)', () => {
  assert.equal(art(holding('vessels:offering-bowl', 'bread'), DAY, {}), null);
  // Honey poured is still a liquid.
  const honey = art(holding('vessels:offering-bowl', 'honey', 'honey'), 0, {});
  assert.ok(honey?.liquid);
  assert.equal(honey?.food, null);
});

test('it goes over as the thing itself does: bread dries, fruit browns, a meal spoils and sinks, flowers wilt and drop petals', () => {
  const bowl = 'vessels:offering-bowl';
  const fresh = (kind: OfferingKindId) => art(holding(bowl, kind), 0)!.food!;
  const later = (kind: OfferingKindId, ms: number) => art(holding(bowl, kind), ms)!;

  const bread = later('bread', 5 * DAY);
  assert.ok(bread.food!.tint && bread.food!.tint.sepia > 0.2, 'stale bread browns a little');
  assert.ok(bread.food!.height < fresh('bread').height, 'and shrinks as it dries');

  const fruit = later('fruit', 7 * DAY);
  assert.ok(fruit.food!.tint!.sepia >= 0.5 && fruit.food!.tint!.brightness < 0.75, 'fruit browns and darkens');
  assert.ok(fruit.food!.height < fresh('fruit').height, 'and slumps');

  const meal = later('cooked', 2 * DAY);
  assert.ok(meal.food!.tint!.sepia > 0.3, 'a spoiled meal');
  assert.ok(meal.food!.top + meal.food!.height > fresh('cooked').top + fresh('cooked').height, 'sinks into the bowl');

  const flowers = later('flowers', 9 * DAY);
  assert.ok(flowers.food!.height < fresh('flowers').height, 'flowers droop');
  assert.equal(flowers.petals.length, 2, 'and drop their petals beside the bowl');
  assert.equal(later('flowers', DAY).petals.length, 0);

  // The colour change matches the thing itself set on the altar (the same look).
  assert.deepEqual(fruit.food!.tint, { sepia: 0.55, saturate: 0.7, brightness: 0.7 });
});

test('the vessel’s mouths are the ones the liquids use', () => {
  assert.ok(vesselMouth(vessel('vessels:offering-bowl')));
  const water = art(holding('vessels:offering-bowl', 'water'), 0);
  const fruit = art(holding('vessels:offering-bowl', 'fruit'), 0);
  assert.ok(water?.liquid && fruit?.food);
  // The heap spans the same mouth the water's surface fills when full.
  assert.ok(Math.abs(fruit!.food!.mouth.rx - water!.liquid!.rx) < 0.2);
});

test('what a vessel holds keeps its saved shape through a save and a load', () => {
  const bowl = holding('vessels:offering-bowl', 'honey', 'honey in the comb');
  const doc = { ...emptyDocument(), objects: [bowl] };
  const back = documentFromAltar(JSON.parse(JSON.stringify(altarDataFromDocument(doc, 'Offerings', at(0))))).objects[0];
  const state = JSON.parse(String(back.livingState));
  assert.deepEqual(state.app.offering, { kind: 'honey', label: 'honey in the comb', since: at(0) });
  assert.equal(art(back, 0)?.food?.id, 'honeycomb');
});
