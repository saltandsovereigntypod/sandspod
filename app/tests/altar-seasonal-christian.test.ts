// Seasonal things for the Christian and folk year: near only for those who
// keep the Christian calendar, grouped under "Christian & folk calendar" after
// the Roman festivals, found by festival and saint, hidden until painted, the
// food and flowers going over as offerings do, and gone from the drawer (and
// never near) for anyone who hides the Christian calendar in settings.
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
  seasonalNear,
  seasonalObject,
  seasonalSections,
  withoutHiddenCalendars,
  type FestivalNear,
} from '../src/lib/altar/seasonal.ts';
import { holidayChoice } from '../src/lib/holidays.ts';

const pictures = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, `../assets/altar/objects/seasonal/${id}/${id}.png`]));
const ALL = pictures(SEASONAL_OBJECTS.map((o) => o.id));
const CHRISTIAN = [
  'epiphany-chalk',
  'holy-water',
  'candlemas-candles',
  'easter-lilies',
  'red-eggs',
  'pentecost-peonies',
  'lammas-loaf',
  'herb-bundle',
  'michaelmas-daisies',
  'advent-wreath',
  'holly-and-ivy',
];
const christian = { traditions: ['christian'], custom: [] };
const keys = (near: FestivalNear[]) => near.map((n) => n.key);
const ids = (section: { items: { id: string }[] } | undefined) => (section?.items ?? []).map((i) => i.id.replace('seasonal:', ''));

test('each Christian and folk thing has its festivals, keywords and a line about it', () => {
  for (const id of CHRISTIAN) {
    const o = seasonalObject(id);
    assert.ok(o, id);
    assert.equal(o!.festivals[0].tradition, 'christian', id);
    assert.ok(o!.keywords.length >= 5, id);
    assert.ok(o!.description && o!.description.length > 40 && !o!.description.includes('!'), id);
    assert.ok(festivalLine(o!), id);
  }
  assert.equal(festivalLine(seasonalObject('holy-water')!), 'Epiphany · Easter');
  assert.equal(festivalLine(seasonalObject('lammas-loaf')!), 'Lammas (Loaf Mass) · Lammas');
  assert.equal(festivalLine(seasonalObject('advent-wreath')!), 'Advent Sunday');
  assert.equal(festivalLine(seasonalObject('herb-bundle')!), 'The Assumption of Mary');
  // After the Roman festivals, before the turning seasons.
  const order = SEASONAL_TRADITIONS.map((t) => t.id);
  assert.equal(order.indexOf('christian'), order.indexOf('roman') + 1);
  assert.ok(order.indexOf('seasons') > order.indexOf('christian'));
  assert.equal(SEASONAL_TRADITIONS.find((t) => t.id === 'christian')!.title, 'Christian & folk calendar');
});

test('hidden until painted; with a picture each joins "Christian & folk calendar", through the year, found by festival and saint', () => {
  assert.ok(builtInCabinet.filter((i) => i.category === 'seasonal').every((i) => !!i.forms[0]?.image));
  assert.deepEqual(seasonalCabinetItems(pictures(['advent-wreath'])).map((i) => i.id), ['seasonal:advent-wreath']);
  assert.ok(!seasonalSections(seasonalCabinetItems(pictures(['apples'])), []).some((s) => s.title === 'Christian & folk calendar'));
  const items = seasonalCabinetItems(ALL);
  const sections = seasonalSections(items, []);
  assert.deepEqual(sections.map((s) => s.title).slice(-6), ['Roman festivals', 'Christian & folk calendar', 'Slavic festivals', 'Hindu festivals', 'Kemetic (Egyptian) festivals', 'The turning seasons']);
  assert.deepEqual(ids(sections.find((s) => s.title === 'Christian & folk calendar')), CHRISTIAN);

  const found = (search: string) => cabinetItemsFor(items, 'seasonal', search).map((i) => i.id.replace('seasonal:', ''));
  assert.deepEqual(found('christian').sort(), [...CHRISTIAN].sort());
  assert.deepEqual(found('epiphany').sort(), ['epiphany-chalk', 'holy-water']);
  assert.deepEqual(found('candlemas').sort(), ['candlemas-candles', 'snowdrops']);
  assert.deepEqual(found('st michael'), ['michaelmas-daisies']);
  assert.deepEqual(found('our lady'), ['herb-bundle']);
  assert.deepEqual(found('pentecost'), ['pentecost-peonies']);
  assert.deepEqual(found('advent'), ['advent-wreath']);
  assert.ok(found('easter').includes('red-eggs') && found('easter').includes('easter-lilies'));
  assert.ok(found('loaf mass').includes('lammas-loaf'));
});

test('a Christian feast is near only when the Christian calendar is kept', () => {
  const items = seasonalCabinetItems(ALL);
  const christmas = new Date(2026, 11, 20, 12);
  const near = festivalsNear(christmas, christian);
  assert.deepEqual(keys(near), ['christian/christmas']);
  assert.equal(festivalWhen(near[0]), 'Christmas is in 5 days.');
  assert.deepEqual(ids(seasonalSections(items, near)[0]), ['holly-and-ivy']);
  assert.equal(seasonalSections(items, near)[0].title, 'For Christmas');
  // Not on the Wheel of the Year alone (the default), nor in the Roman year.
  assert.ok(!festivalsNear(christmas, null).some((n) => n.key.startsWith('christian/')));
  assert.ok(!festivalsNear(christmas, { traditions: ['roman'], custom: [] }).some((n) => n.key.startsWith('christian/')));
  // Epiphany: the chalk, then the blessed water. Easter 2026 is 5 April.
  const epiphany = seasonalSections(items, festivalsNear(new Date(2027, 0, 3, 12), christian));
  assert.equal(epiphany[0].title, 'For Epiphany');
  assert.deepEqual(ids(epiphany[0]), ['epiphany-chalk', 'holy-water']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 3, 3, 12), christian)), ['christian/easter']);
  assert.deepEqual(ids(seasonalSections(items, festivalsNear(new Date(2026, 3, 3, 12), christian))[0]), ['holy-water', 'easter-lilies', 'red-eggs']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 4, 22), christian)), ['christian/pentecost']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 7, 12), christian)), ['christian/assumption']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 8, 25), christian)), ['christian/michaelmas']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 10, 25), christian)), ['christian/advent']);
  assert.deepEqual(keys(festivalsNear(new Date(2027, 0, 30), christian)), ['christian/candlemas']);
  // Lammas: the Christian year's alone, or one festival with the Wheel's when both are kept.
  const lammas = new Date(2026, 6, 30, 12);
  const alone = festivalsNear(lammas, christian);
  assert.deepEqual(keys(alone), ['christian/lammas']);
  assert.equal(alone[0].name, 'Lammas (Loaf Mass)');
  assert.deepEqual(ids(seasonalSections(items, alone)[0]), ['lammas-loaf']);
  const both = festivalsNear(lammas, { traditions: ['wheel', 'christian'], custom: [] });
  assert.equal(both.length, 1);
  assert.deepEqual([...both[0].keys].sort(), ['christian/lammas', 'wheel/lammas']);
  assert.equal(both[0].name, 'Lammas');
  assert.ok(ids(seasonalSections(items, both)[0]).includes('lammas-loaf'));
  // On the Wheel alone the loaf still comes at Lammas.
  assert.ok(ids(seasonalSections(items, festivalsNear(lammas, null))[0]).includes('lammas-loaf'));
  // Without its picture, Christmas doesn't bring the drawer forward.
  assert.deepEqual(nearWithThings(near, seasonalCabinetItems(pictures(['apples']))), []);
  assert.deepEqual(keys(nearWithThings(near, items)), ['christian/christmas']);
  // Tonight's altar on the holiday sets out the most fitting first.
  assert.deepEqual(festivalsOfHoliday('christian-christmas-2026-11-25'), ['christian/christmas']);
  assert.equal(seasonalForHoliday('christian-epiphany-2027-0-6')[0], 'epiphany-chalk');
  assert.equal(seasonalForHoliday('christian-easter-2026-3-5')[0], 'easter-lilies');
  assert.equal(seasonalForHoliday('wheel-lammas-2026-7-1')[0], 'wheat-sheaf');
  assert.deepEqual(festivalsOfHoliday('christian-st_lucy-2026-11-13'), []);
});

test('a hidden Christian calendar never comes near, and its things leave the drawer', () => {
  const settings = { calendar_traditions: 'wheel,christian,custom', calendar_hidden_traditions: 'christian', calendar_picked_holidays: 'christian/christmas' };
  const choice = holidayChoice(settings);
  for (const day of [new Date(2026, 11, 20, 12), new Date(2027, 0, 3, 12), new Date(2026, 3, 3, 12), new Date(2026, 10, 25), new Date(2026, 6, 30, 12)]) {
    assert.ok(!seasonalNear(day, choice).some((n) => n.keys.some((k) => k.startsWith('christian/'))), String(day));
  }
  const items = withoutHiddenCalendars(seasonalCabinetItems(ALL), ['christian']);
  assert.ok(!items.some((i) => (i.festivals ?? []).some((k) => k.startsWith('christian/'))));
  assert.ok(!seasonalSections(items, []).some((s) => s.title === 'Christian & folk calendar'));
  assert.deepEqual(cabinetItemsFor(items, 'seasonal', 'christian'), []);
  assert.deepEqual(cabinetItemsFor(items, 'seasonal', 'epiphany'), []);
  // The Lammas loaf stays, as the Wheel's alone.
  const loaf = items.find((i) => i.id === 'seasonal:lammas-loaf')!;
  assert.deepEqual(loaf.festivals, ['wheel/lammas']);
  assert.equal(loaf.description, 'Lammas');
  assert.equal(loaf.forms[0].image, ALL['lammas-loaf']);
  assert.deepEqual(ids(seasonalSections(items, []).find((s) => s.title === 'Wheel of the Year')).slice(-1), ['lammas-loaf']);
  // Everything else, and your own things, untouched; nothing hidden, nothing changed.
  const own = { id: 'custom:1', category: 'seasonal', name: 'My wreath', keywords: [], customCabinetItemId: '1', forms: [{ label: 'Place', image: 'x.png' }] };
  assert.ok(withoutHiddenCalendars([own], ['christian']).includes(own));
  assert.equal(items.length, seasonalCabinetItems(ALL).length - CHRISTIAN.length + 1);
  const all = seasonalCabinetItems(ALL);
  assert.equal(withoutHiddenCalendars(all, []), all);
});

test('the loaf and red eggs go over, the flowers and greenery wilt, the rest keep', () => {
  const items = seasonalCabinetItems(ALL);
  const placed = (id: string) => {
    const item = items.find((i) => i.id === `seasonal:${id}`)!;
    return objectFromForm(item, item.forms[0], [], '2026-12-20T18:00:00.000Z');
  };
  assert.equal(perishableItself(placed('lammas-loaf')), 'bread');
  assert.equal(perishableItself(placed('red-eggs')), 'cooked');
  for (const id of ['easter-lilies', 'pentecost-peonies', 'michaelmas-daisies', 'holly-and-ivy']) assert.equal(perishableItself(placed(id)), 'flowers', id);
  for (const id of ['epiphany-chalk', 'holy-water', 'candlemas-candles', 'herb-bundle', 'advent-wreath']) assert.equal(perishableItself(placed(id)), null, id);
  for (const id of CHRISTIAN) assert.ok(!holdsOfferings(placed(id)), id);
});
