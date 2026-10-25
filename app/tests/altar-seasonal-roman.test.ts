// Seasonal things for the Roman year: near only for those who keep the Roman
// calendar, grouped under "Roman festivals" after the Celtic festivals, found
// by festival and god, hidden until painted, and the food and flowers going
// over as offerings do.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, cabinetItemsFor, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { holdsOfferings, perishableItself } from '../src/lib/altar/offerings.ts';
import {
  festivalLine,
  festivalsNear,
  festivalsOfHoliday,
  festivalWhen,
  nearWithThings,
  SEASONAL_OBJECTS,
  SEASONAL_TRADITIONS,
  seasonalCabinetItems,
  seasonalForHoliday,
  seasonalObject,
  seasonalSections,
  type FestivalNear,
} from '../src/lib/altar/seasonal.ts';

const pictures = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, `../assets/altar/objects/seasonal/${id}/${id}.png`]));
const ALL = pictures(SEASONAL_OBJECTS.map((o) => o.id));
const ROMAN = [
  'parentalia-tile',
  'februa',
  'mola-salsa',
  'matronalia-garland',
  'floralia-flowers',
  'lemuria-beans',
  'neptunalia-boughs',
  'saturnalia-cerei',
  'pileus',
  'sigillaria',
  'lucerna',
  'radiate-crown',
];
const roman = { traditions: ['roman'], custom: [] };
const keys = (near: FestivalNear[]) => near.map((n) => n.key);
const ids = (section: { items: { id: string }[] } | undefined) => (section?.items ?? []).map((i) => i.id.replace('seasonal:', ''));

test('each Roman thing has its festivals, keywords and a line about it', () => {
  for (const id of ROMAN) {
    const o = seasonalObject(id);
    assert.ok(o, id);
    assert.ok(o!.festivals.every((f) => f.tradition === 'roman'), id);
    assert.ok(o!.keywords.length >= 5, id);
    assert.ok(o!.description && o!.description.length > 40 && !o!.description.includes('!'), id);
    assert.ok(festivalLine(o!), id);
  }
  assert.equal(festivalLine(seasonalObject('mola-salsa')!), 'Lupercalia · Vestalia');
  assert.equal(festivalLine(seasonalObject('radiate-crown')!), 'Dies Natalis Solis Invicti');
  assert.equal(festivalLine(seasonalObject('pileus')!), 'Saturnalia');
  // After the Celtic festivals, before the turning seasons.
  const order = SEASONAL_TRADITIONS.map((t) => t.id);
  assert.equal(order.indexOf('roman'), order.indexOf('celtic') + 1);
  assert.ok(order.indexOf('seasons') > order.indexOf('roman'));
});

test('hidden until painted; with a picture each joins "Roman festivals", through the year, found by festival, god and calendar', () => {
  assert.ok(builtInCabinet.filter((i) => i.category === 'seasonal').every((i) => !!i.forms[0]?.image));
  assert.deepEqual(seasonalCabinetItems(pictures(['pileus'])).map((i) => i.id), ['seasonal:pileus']);
  assert.ok(!seasonalSections(seasonalCabinetItems(pictures(['apples'])), []).some((s) => s.title === 'Roman festivals'));
  const items = seasonalCabinetItems(ALL);
  const sections = seasonalSections(items, []);
  assert.deepEqual(sections.map((s) => s.title).slice(-7), ['Celtic festivals', 'Roman festivals', 'Christian & folk calendar', 'Slavic festivals', 'Hindu festivals', 'Kemetic (Egyptian) festivals', 'The turning seasons']);
  assert.deepEqual(ids(sections.find((s) => s.title === 'Roman festivals')), ROMAN);

  const found = (search: string) => cabinetItemsFor(items, 'seasonal', search).map((i) => i.id.replace('seasonal:', ''));
  assert.deepEqual(found('roman').sort(), [...ROMAN].sort());
  assert.deepEqual(found('saturn').sort(), ['lucerna', 'pileus', 'saturnalia-cerei', 'sigillaria']);
  assert.deepEqual(found('vesta'), ['mola-salsa']);
  assert.deepEqual(found('lares'), ['lucerna']);
  assert.deepEqual(found('flora'), ['floralia-flowers']);
  assert.deepEqual(found('juno'), ['matronalia-garland']);
  assert.deepEqual(found('neptune'), ['neptunalia-boughs']);
  assert.deepEqual(found('sol invictus'), ['radiate-crown']);
  assert.deepEqual(found('lemuria'), ['lemuria-beans']);
  assert.deepEqual(found('lupercalia').sort(), ['februa', 'mola-salsa']);
  assert.ok(found('parentalia').includes('parentalia-tile'));
});

test('a Roman festival is near only when the Roman calendar is kept', () => {
  const items = seasonalCabinetItems(ALL);
  // The Saturnalia runs from 17 December for seven days; the Unconquered Sun's birthday is the 25th.
  const saturnalia = new Date(2026, 11, 18, 12);
  const near = festivalsNear(saturnalia, roman);
  assert.deepEqual(keys(near), ['roman/saturnalia', 'roman/sol_invictus']);
  assert.equal(festivalWhen(near[0]), 'Saturnalia, day 2 of 7.');
  assert.equal(festivalWhen(near[1]), 'Dies Natalis Solis Invicti is in 7 days.');
  const sections = seasonalSections(items, near);
  assert.deepEqual(sections.slice(0, 2).map((s) => s.title), ['For Saturnalia', 'For Dies Natalis Solis Invicti']);
  assert.deepEqual(ids(sections[0]), ['saturnalia-cerei', 'pileus', 'sigillaria', 'lucerna']);
  assert.deepEqual(ids(sections[1]), ['radiate-crown']);
  // Not on the Wheel of the Year alone (the default), nor in the Greek year.
  assert.ok(!festivalsNear(saturnalia, null).some((n) => n.key.startsWith('roman/')));
  assert.deepEqual(keys(festivalsNear(new Date(2027, 1, 14), { traditions: ['hellenic'], custom: [] })).filter((k) => k.startsWith('roman/')), []);
  // Kept with the Wheel: Yule and the Saturnalia, each its own.
  const both = festivalsNear(saturnalia, { traditions: ['wheel', 'roman'], custom: [] });
  assert.ok(keys(both).includes('wheel/yule') && keys(both).includes('roman/saturnalia'));
  // February: the Parentalia from the 13th for nine days, the Lupercalia on the 15th, the Matronalia on 1 March.
  assert.deepEqual(keys(festivalsNear(new Date(2027, 1, 14, 12), roman)), ['roman/parentalia', 'roman/lupercalia']);
  assert.deepEqual(keys(festivalsNear(new Date(2027, 1, 23, 12), roman)), ['roman/matronalia']);
  const lupercalia = seasonalSections(items, festivalsNear(new Date(2027, 1, 15, 12), roman));
  assert.deepEqual(ids(lupercalia[1]), ['februa', 'mola-salsa']);
  assert.deepEqual(keys(festivalsNear(new Date(2027, 4, 5), roman)), ['roman/lemuria']);
  assert.deepEqual(keys(festivalsNear(new Date(2027, 5, 9), roman)), ['roman/vestalia']);
  assert.deepEqual(keys(festivalsNear(new Date(2027, 6, 20), roman)), ['roman/neptunalia']);
  assert.deepEqual(keys(festivalsNear(new Date(2027, 3, 30), roman)), ['roman/floralia']);
  // Without its picture, the Saturnalia doesn't bring the drawer forward.
  assert.deepEqual(nearWithThings(near, seasonalCabinetItems(pictures(['apples']))), []);
  assert.deepEqual(keys(nearWithThings(near, items)), ['roman/saturnalia', 'roman/sol_invictus']);
  // Tonight's altar on the holiday sets out the most fitting first.
  assert.deepEqual(festivalsOfHoliday('roman-saturnalia-2026-11-17'), ['roman/saturnalia']);
  assert.equal(seasonalForHoliday('roman-saturnalia-2026-11-17')[0], 'saturnalia-cerei');
  assert.equal(seasonalForHoliday('roman-lupercalia-2027-1-15')[0], 'februa');
  assert.deepEqual(seasonalForHoliday('roman-vestalia-2027-5-9'), ['mola-salsa']);
});

test('the Parentalia offering and mola salsa go stale, the flowers and boughs wilt, the rest keep', () => {
  const items = seasonalCabinetItems(ALL);
  const placed = (id: string) => {
    const item = items.find((i) => i.id === `seasonal:${id}`)!;
    return objectFromForm(item, item.forms[0], [], '2026-12-17T18:00:00.000Z');
  };
  for (const id of ['parentalia-tile', 'mola-salsa']) assert.equal(perishableItself(placed(id)), 'bread', id);
  for (const id of ['floralia-flowers', 'matronalia-garland', 'neptunalia-boughs']) assert.equal(perishableItself(placed(id)), 'flowers', id);
  for (const id of ['lemuria-beans', 'februa', 'saturnalia-cerei', 'pileus', 'sigillaria', 'lucerna', 'radiate-crown']) assert.equal(perishableItself(placed(id)), null, id);
  for (const id of ROMAN) assert.ok(!holdsOfferings(placed(id)), id);
});
