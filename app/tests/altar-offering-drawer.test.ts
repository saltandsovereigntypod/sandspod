// The cabinet's Offerings drawer: food, flowers and keepsakes set straight on
// the altar, ageing from the moment they're placed, and vessels set down
// already filled, as "Set out an offering" would.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ALTAR_ARTWORK } from '../src/lib/altar/artworkData.ts';
import { altarOfferingsDue } from '../src/lib/altar/burnout.ts';
import { builtInCabinet, cabinetCategories, cabinetItemsFor, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { appHistoryOf } from '../src/lib/altar/livingState.ts';
import { offeringArt } from '../src/lib/altar/offeringArt.ts';
import { FILLED_VESSELS, offeringCabinetItems } from '../src/lib/altar/offeringDrawer.ts';
import {
  canHoldOffering,
  endOffering,
  holdsOfferings,
  isOfferingItself,
  leaveOffering,
  OFFERING_FOODS,
  offeringFoodOf,
  offeringFreshness,
  offeringOf,
  offeringsDue,
  refreshOffering,
  tendingNote,
} from '../src/lib/altar/offerings.ts';
import { altarDataFromDocument, emptyDocument } from '../src/lib/altar/snapshot.ts';
import type { CabinetItem, SavedObject } from '../src/lib/altar/types.ts';
import { buildSchedule, DEFAULT_SETTINGS } from '../src/lib/reminders/schedule.ts';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const T0 = Date.UTC(2026, 9, 1, 20);
const at = (ms: number) => new Date(T0 + ms).toISOString();

const drawer = () => builtInCabinet.filter((i) => i.category === 'offerings');
const item = (id: string): CabinetItem => {
  const found = builtInCabinet.find((i) => i.id === id);
  assert.ok(found, id);
  return found;
};
const place = (id: string, when = at(0)): SavedObject => objectFromForm(item(id), item(id).forms[0], [], when);

test('the Offerings drawer holds the six painted foods and the filled vessels', () => {
  assert.ok(cabinetCategories.some((c) => c.id === 'offerings' && c.label === 'Offerings'));
  const ids = drawer().map((i) => i.id);
  for (const id of ['offerings:bread', 'offerings:fruit', 'offerings:honey-cakes-and-sweets', 'offerings:a-cooked-meal', 'offerings:cut-flowers', 'offerings:honeycomb']) {
    assert.ok(ids.includes(id), id);
  }
  for (const id of ['offerings:bowl-of-water', 'offerings:chalice-of-wine', 'offerings:dish-of-milk', 'offerings:honey-dish', 'offerings:bowl-of-fruit', 'offerings:dish-of-bread']) {
    assert.ok(ids.includes(id), id);
  }
  // Every one has a picture already bundled, and a line for the drawer.
  for (const i of drawer()) {
    assert.equal(i.forms.length, 1);
    assert.match(i.forms[0].image, /^\.\.\/assets\/altar\/objects\/(offerings|vessels|tools)\//);
    assert.ok(i.description);
  }
  // The foods reuse the heaps drawn inside a vessel: no new pictures.
  assert.equal(item('offerings:bread').forms[0].image, ALTAR_ARTWORK.offeringFoods.bread.image);
  assert.equal(item('offerings:bowl-of-water').forms[0].image, '../assets/altar/objects/vessels/offering-bowl/offering-bowl.png');
  assert.equal(item('offerings:chalice-of-wine').forms[0].image, '../assets/altar/objects/tools/chalice/chalice.png');
  // Found by searching.
  assert.ok(cabinetItemsFor(builtInCabinet, 'offerings', 'libation').some((i) => i.id === 'offerings:bowl-of-water'));
});

test('pictures still to come join the drawer with the right kind once their folder is there', () => {
  const pic = (id: string) => ({ image: `../assets/altar/objects/offerings/${id}/${id}.png`, ratio: 0.66 });
  // Today: none of them.
  for (const id of ['harvest', 'grain', 'stones', 'coins']) assert.ok(!drawer().some((i) => i.forms[0].form === id), id);
  const foods = { ...ALTAR_ARTWORK.offeringFoods, harvest: pic('harvest'), grain: pic('grain'), stones: pic('stones'), coins: pic('coins') };
  const items = offeringCabinetItems(foods, ALTAR_ARTWORK.items);
  const kinds = Object.fromEntries(
    items.filter((i) => i.forms[0].type === 'offering').map((i) => [i.forms[0].form, offeringFoodOf({ type: 'offering', form: i.forms[0].form })?.kind]),
  );
  assert.equal(kinds.harvest, 'harvest');
  assert.equal(kinds.grain, 'dried');
  assert.equal(kinds.stones, 'stones');
  assert.equal(kinds.coins, 'coins');
  // A folder with no entry in OFFERING_FOODS isn't offered, and without the bowl's picture nor is its filled vessel.
  assert.ok(!offeringCabinetItems({ ...foods, mystery: pic('mystery') }, ALTAR_ARTWORK.items).some((i) => i.forms[0].form === 'mystery'));
  assert.ok(!offeringCabinetItems(foods, { ...ALTAR_ARTWORK.items, vessels: [] }).some((i) => i.name === 'Bowl of Water'));
  // A filled vessel of food needs its heap's picture.
  assert.ok(!offeringCabinetItems({}, ALTAR_ARTWORK.items).some((i) => i.name === 'Bowl of Fruit'));
  assert.ok(offeringCabinetItems({}, ALTAR_ARTWORK.items).some((i) => i.name === 'Bowl of Water'));
  assert.equal(OFFERING_FOODS.length, new Set(OFFERING_FOODS.map((f) => f.id)).size);
  assert.equal(FILLED_VESSELS.length, 6);
});

test('a placed food offering starts fresh as it is placed and ages from then', () => {
  const placedAt = T0 + 3 * DAY;
  const bread = place('offerings:bread', at(3 * DAY));
  assert.equal(bread.type, 'offering');
  assert.equal(bread.form, 'bread');
  assert.equal(bread.label, 'Bread');
  assert.ok(isOfferingItself(bread));
  assert.ok(canHoldOffering(bread));
  assert.ok(!holdsOfferings(bread));
  assert.deepEqual(offeringOf(bread), { kind: 'bread', label: 'bread', since: new Date(placedAt).toISOString() });
  assert.equal(offeringFreshness(bread, placedAt)!.stage.name, 'Fresh');
  assert.equal(offeringFreshness(bread, placedAt + DAY)!.stage.name, 'Fresh');
  assert.equal(offeringFreshness(bread, placedAt + 2 * DAY)!.stage.name, 'Drying at the edges');
  assert.equal(offeringFreshness(bread, placedAt + 3 * DAY)!.stage.name, 'Stale');
  assert.equal(offeringFreshness(bread, placedAt + 6 * DAY)!.stage.name, 'Hard and dry');
  // Drawn going over as the thing itself, not in a vessel.
  assert.equal(offeringArt(bread, 80, 80, placedAt), null);
  const old = offeringArt(bread, 80, 80, placedAt + 4 * DAY)!;
  assert.ok(old.tint && old.tint.sepia > 0);
  assert.equal(old.food, null);
  // Flowers bow and drop petals.
  const flowers = place('offerings:cut-flowers', at(0));
  const wilted = offeringArt(flowers, 80, 80, T0 + 8 * DAY, 2 / 3)!;
  assert.ok(wilted.bend && wilted.bend.rotate > 0);
  assert.ok(wilted.petals.length > 0);
  // Honeycomb ages as honey, whatever it's called.
  assert.equal(offeringOf({ ...place('offerings:honeycomb'), label: 'Comb from the hive' })?.kind, 'honey');
});

test('its tend chips: refresh, leave it be, return to nature or clear away', () => {
  const flowers = place('offerings:cut-flowers', at(0));
  const refreshed = refreshOffering(flowers, at(8 * DAY));
  assert.equal(offeringOf(refreshed)?.since, at(8 * DAY));
  assert.equal(offeringFreshness(refreshed, T0 + 8 * DAY)!.stage.name, 'Fresh');
  assert.match(appHistoryOf(refreshed).at(-1)!.text, /Refreshed the flowers/);
  const left = leaveOffering(flowers, at(7 * DAY));
  assert.ok(offeringOf(left)?.leftAt);
  assert.equal(offeringsDue([{ id: 'a', objects: [left] }], T0 + 8 * DAY).length, 0);
  const gone = endOffering(flowers, 'returned', at(7 * DAY));
  assert.equal(offeringOf(gone), null);
  assert.match(appHistoryOf(gone).at(-1)!.text, /Returned the flowers to nature/);
});

test('stones, coins and grain keep: an offering with nothing to refresh', () => {
  const foods = { stones: { image: '../assets/altar/objects/offerings/stones/stones.png', ratio: 1 } };
  const stonesItem = offeringCabinetItems(foods, ALTAR_ARTWORK.items).find((i) => i.forms[0].form === 'stones')!;
  const stones = objectFromForm(stonesItem, stonesItem.forms[0], [], at(0));
  assert.ok(isOfferingItself(stones));
  assert.equal(offeringOf(stones)?.kind, 'stones');
  assert.equal(offeringFreshness(stones, T0 + 300 * DAY)!.level, 'lasting');
  assert.equal(offeringArt(stones, 80, 80, T0 + 300 * DAY), null);
  assert.equal(offeringsDue([{ id: 'a', objects: [stones] }], T0 + 300 * DAY).length, 0);
});

test('a filled vessel is set down with its offering already set out', () => {
  const water = place('offerings:bowl-of-water', at(0));
  assert.equal(water.type, 'vessel');
  assert.equal(water.vessel, 'offering-bowl');
  assert.equal(water.label, 'Bowl of Water');
  assert.ok(holdsOfferings(water));
  assert.deepEqual(offeringOf(water), { kind: 'water', label: 'water', since: at(0) });
  assert.match(appHistoryOf(water).at(-1)!.text, /Set out water/);
  // Its water sinks as any bowl's does.
  assert.ok(offeringArt(water, 80, 120, T0)!.liquid);
  assert.ok(offeringArt(water, 80, 120, T0 + 2 * DAY)!.tide);
  const wine = place('offerings:chalice-of-wine', at(0));
  assert.equal(wine.type, 'tool');
  assert.equal(wine.tool, 'chalice');
  assert.equal(offeringOf(wine)?.kind, 'drink');
  assert.equal(offeringOf(place('offerings:dish-of-milk'))?.kind, 'milk');
  assert.equal(offeringOf(place('offerings:honey-dish'))?.kind, 'honey');
  // Food heaped in its bowl.
  assert.equal(offeringArt(place('offerings:bowl-of-fruit'), 80, 120, T0)!.food?.id, 'fruit');
  // Emptied, it's a vessel again, ready for "Set out an offering".
  const empty = endOffering(water, 'removed', at(DAY));
  assert.equal(offeringOf(empty), null);
  assert.ok(holdsOfferings(empty));
  // The vessel in the Vessels drawer is still set down empty.
  assert.equal(offeringOf(place('vessels:offering-bowl')), null);
});

test('offering reminders take in the drawer’s offerings', () => {
  const flowers = { ...place('offerings:cut-flowers', at(0)), altarObjectId: 'f1' };
  const milk = { ...place('offerings:dish-of-milk', at(0)), altarObjectId: 'm1' };
  const doc = { ...emptyDocument(), objects: [flowers, milk] };
  const altar = { ...altarDataFromDocument(doc, 'Hearth', at(0)), id: 'alt-1', name: 'Hearth' };
  const due = altarOfferingsDue([altar], new Date(T0));
  assert.deepEqual(due.map((d) => d.objectId), ['m1', 'f1']);
  assert.equal(tendingNote(due.slice(1)), 'The flowers on your Hearth altar are wilting.');
  const on = buildSchedule({ ...DEFAULT_SETTINGS, rituals: false, offerings: true, offeringsAt: 18 * 60 }, [], new Date(T0), 60, [], [], due);
  assert.equal(on.length, 2);
  assert.ok(on.every((r) => r.kind === 'offering' && r.url === '/altar/alt-1'));
});
