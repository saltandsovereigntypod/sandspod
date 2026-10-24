// Seasonal things for the Norse and Heathen year, the Celtic year and the
// turning seasons: near only for the calendars you keep (the Celtic things at
// the matching sabbats too), the season's thing by the date for everyone, north
// or south of the equator, after any festival that's near; grouped in the
// drawer, found by festival and god, hidden until painted, and the flowers and
// berries going over as offerings do.
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
  sabbatNear,
  SEASONAL_OBJECTS,
  seasonalCabinetItems,
  seasonalForHoliday,
  seasonalNear,
  seasonalObject,
  seasonalSections,
  seasonNow,
  type FestivalNear,
} from '../src/lib/altar/seasonal.ts';

const pictures = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, `../assets/altar/objects/seasonal/${id}/${id}.png`]));
const ALL = pictures(SEASONAL_OBJECTS.map((o) => o.id));
const NORSE = ['drinking-horn', 'hlautbolli', 'midsummer-birch', 'odins-sheaf', 'yule-goat'];
const CELTIC = ['brideog', 'may-bush', 'bilberries'];
const SEASONS = ['snowdrops', 'blossom-branch', 'summer-wildflowers', 'autumn-leaves'];
const norse = { traditions: ['norse'], custom: [] };
const celtic = { traditions: ['celtic'], custom: [] };
const south = { traditions: ['wheel_south'], custom: [] };
const keys = (near: FestivalNear[]) => near.map((n) => n.key);
const ids = (section: { items: { id: string }[] } | undefined) => (section?.items ?? []).map((i) => i.id.replace('seasonal:', ''));

test('each new thing has its festivals, keywords and a line about it', () => {
  for (const id of [...NORSE, ...CELTIC, ...SEASONS]) {
    const o = seasonalObject(id);
    assert.ok(o, id);
    assert.ok(o!.keywords.length >= 5, id);
    assert.ok(o!.description && o!.description.length > 40 && !o!.description.includes('!'), id);
    assert.ok(festivalLine(o!), id);
  }
  assert.equal(festivalLine(seasonalObject('drinking-horn')!), 'Þorrablót · Dísablót · Sigrblót · Sumardagurinn fyrsti · Haustblót · Winter Nights (Vetrnætur) · Yule (Jól)');
  assert.equal(festivalLine(seasonalObject('may-bush')!), 'Bealtaine · Beltane');
  assert.equal(festivalLine(seasonalObject('brideog')!), 'Imbolc · Lá Fhéile Bríde');
  assert.equal(festivalLine(seasonalObject('snowdrops')!), 'Late winter');
  // The Wheel's own things stay with the Wheel: no second Brigid's cross or Samhain lantern.
  assert.deepEqual(seasonalObject('brigids-cross')!.festivals, [{ tradition: 'wheel', holiday: 'imbolc' }]);
});

test('hidden until painted; with a picture each joins its own section, found by festival, god and calendar', () => {
  assert.ok(builtInCabinet.filter((i) => i.category === 'seasonal').every((i) => !!i.forms[0]?.image));
  assert.deepEqual(seasonalCabinetItems(pictures(['apples'])).map((i) => i.id), ['seasonal:apples']);
  const items = seasonalCabinetItems(ALL);
  const sections = seasonalSections(items, []);
  const titled = (title: string) => sections.find((s) => s.title === title);
  assert.deepEqual(ids(titled('Norse & Heathen')), ['drinking-horn', 'hlautbolli', 'midsummer-birch', 'odins-sheaf', 'yule-goat']);
  assert.deepEqual(ids(titled('Celtic festivals')), ['brideog', 'may-bush', 'bilberries']);
  assert.deepEqual(ids(titled('The turning seasons')), ['snowdrops', 'blossom-branch', 'summer-wildflowers', 'autumn-leaves']);
  assert.ok(!ids(titled('Wheel of the Year')).some((id) => CELTIC.includes(id)));
  assert.equal(new Set(sections.flatMap((s) => s.items.map((i) => i.id))).size, items.length);

  const found = (search: string) => cabinetItemsFor(items, 'seasonal', search).map((i) => i.id.replace('seasonal:', ''));
  assert.deepEqual(found('odin').sort(), ['drinking-horn', 'odins-sheaf']);
  assert.deepEqual(found('dísir'), ['hlautbolli']);
  assert.deepEqual(found('disir'), ['hlautbolli']);
  assert.deepEqual(found('heathen').sort(), [...NORSE].sort());
  assert.deepEqual(found('norse').sort(), [...NORSE].sort());
  assert.ok(found('blót').includes('hlautbolli'));
  assert.ok(found('brigid').includes('brideog') && found('brigid').includes('brigids-cross'));
  assert.deepEqual(found('lugh'), ['bilberries']);
  assert.deepEqual(found('irish').sort(), [...CELTIC].sort());
  assert.deepEqual(found('celtic').sort(), [...CELTIC].sort());
  assert.ok(found('bealtaine').includes('may-bush'));
  assert.ok(found('beltane').includes('may-bush'));
  assert.ok(found('jól').includes('yule-goat'));
  assert.deepEqual(found('late winter'), ['snowdrops']);
  assert.ok(found('autumn').includes('autumn-leaves'));
  assert.ok(found('turning seasons').length === 4);
});

test('a Norse festival is near only when the Norse calendar is kept', () => {
  // Yule (Jól) begins on the solstice, 21 December 2026, and runs twelve nights.
  const yule = new Date(2026, 11, 18, 12);
  assert.deepEqual(keys(festivalsNear(yule, norse)), ['norse/jol']);
  assert.equal(festivalsNear(yule, norse)[0].name, 'Yule (Jól)');
  assert.ok(!festivalsNear(yule, null).some((n) => n.keys.includes('norse/jol')), 'the Wheel of the Year alone');
  // Kept with the Wheel, the one Yule brings both calendars' things.
  const both = festivalsNear(yule, { traditions: ['wheel', 'norse'], custom: [] });
  assert.deepEqual(both.map((n) => n.keys), [['wheel/yule', 'norse/jol']]);
  const items = seasonalCabinetItems(ALL);
  const first = seasonalSections(items, both)[0];
  assert.equal(first.title, 'For Yule');
  assert.deepEqual(ids(first), ['yule-log', 'evergreen-boughs', 'drinking-horn', 'yule-goat']);
  // Still Yule on its twelfth night.
  assert.equal(festivalWhen(festivalsNear(new Date(2027, 0, 1, 12), norse)[0]), 'Yule (Jól), day 12 of 12.');
  // The autumn blót: Haustblót at the equinox (23 September 2026), Winter Nights on 24 October.
  assert.deepEqual(ids(seasonalSections(items, festivalsNear(new Date(2026, 8, 20), norse))[0]), ['drinking-horn', 'hlautbolli', 'odins-sheaf']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 9, 24), norse)), ['norse/vetrnaetur']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 5, 18), norse)), ['norse/midsummer']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 5, 18), { traditions: ['hellenic'], custom: [] })), []);
  // Tonight's altar on the holiday sets out the most fitting first.
  assert.deepEqual(festivalsOfHoliday('norse-jol-2026-11-21'), ['norse/jol']);
  assert.equal(seasonalForHoliday('norse-jol-2026-11-21')[0], 'yule-goat');
  assert.equal(seasonalForHoliday('norse-haustblot-2026-8-23')[0], 'odins-sheaf');
  assert.equal(seasonalForHoliday('norse-disablot-2027-1-20')[0], 'drinking-horn');
});

test('a Celtic festival is near in the Celtic year, and at its sabbat on the Wheel', () => {
  const items = seasonalCabinetItems(ALL);
  const beforeMay = new Date(2026, 3, 28, 12);
  // The Celtic year alone: named as it names it, with the Wheel's Beltane things too.
  const celt = festivalsNear(beforeMay, celtic);
  assert.equal(celt[0].name, 'Bealtaine');
  assert.deepEqual(celt[0].keys, ['celtic/bealtaine', 'wheel/beltane']);
  assert.deepEqual(ids(seasonalSections(items, celt)[0]), ['flower-crown', 'may-bush']);
  assert.equal(seasonalSections(items, celt)[0].title, 'For Bealtaine');
  assert.equal(sabbatNear(beforeMay, celtic)?.id, 'beltane');
  // The Wheel of the Year alone (the default): the May bush comes at Beltane.
  const wheel = festivalsNear(beforeMay, null);
  assert.deepEqual(keys(wheel), ['wheel/beltane']);
  assert.deepEqual(ids(seasonalSections(items, wheel)[0]), ['flower-crown', 'may-bush']);
  // Both: one festival, named as the Wheel names it.
  const both = festivalsNear(beforeMay, { traditions: ['wheel', 'celtic'], custom: [] });
  assert.equal(both.length, 1);
  assert.equal(both[0].name, 'Beltane');
  // Neither: not near.
  assert.deepEqual(keys(festivalsNear(beforeMay, norse)), []);
  // Lughnasadh and Lammas (1 August), and Imbolc, which the Celtic year shares with the Wheel (1 February).
  assert.ok(ids(seasonalSections(items, festivalsNear(new Date(2026, 6, 28), celtic))[0]).includes('bilberries'));
  assert.ok(ids(seasonalSections(items, festivalsNear(new Date(2026, 6, 28), null))[0]).includes('bilberries'));
  const imbolc = festivalsNear(new Date(2027, 0, 30), { traditions: ['wheel', 'celtic'], custom: [] });
  assert.deepEqual(imbolc[0].keys, ['wheel/imbolc', 'celtic/la_fheile_bride']);
  assert.deepEqual(ids(seasonalSections(items, imbolc)[0]), ['brigids-cross', 'brideog']);
  assert.deepEqual(festivalsNear(new Date(2027, 0, 30), celtic)[0].name, 'Imbolc · Lá Fhéile Bríde');
  // South of the equator Imbolc is on 1 August.
  assert.ok(ids(seasonalSections(items, festivalsNear(new Date(2026, 6, 28), south))[0]).includes('brideog'));
  assert.deepEqual(festivalsOfHoliday('celtic-bealtaine-2026-4-1'), ['wheel/beltane', 'celtic/bealtaine']);
  assert.deepEqual(seasonalForHoliday('celtic-bealtaine-2026-4-1'), ['flower-crown', 'may-bush']);
});

test('the season goes by the date, six months later south of the equator', () => {
  const at = (m: number, d: number, choice: typeof south | null = null, y = 2027) => seasonNow(new Date(y, m, d, 12), choice)?.key ?? null;
  // North: late winter from mid-January to mid-March, then spring, summer and autumn; early winter has none.
  assert.equal(at(0, 14), null);
  assert.equal(at(0, 15), 'seasons/late_winter');
  assert.equal(at(2, 15), 'seasons/late_winter');
  assert.equal(at(2, 16), 'seasons/spring');
  assert.equal(at(4, 31), 'seasons/spring');
  assert.equal(at(5, 1), 'seasons/summer');
  assert.equal(at(7, 31), 'seasons/summer');
  assert.equal(at(8, 1), 'seasons/autumn');
  assert.equal(at(10, 30), 'seasons/autumn');
  assert.equal(at(11, 1), null);
  // South, for those who keep the Wheel of the Year south of the equator.
  assert.equal(at(6, 14, south), null);
  assert.equal(at(6, 15, south), 'seasons/late_winter');
  assert.equal(at(8, 20, south), 'seasons/spring');
  assert.equal(at(11, 25, south, 2026), 'seasons/summer');
  assert.equal(at(1, 28, south), 'seasons/summer');
  assert.equal(at(2, 1, south), 'seasons/autumn');
  assert.equal(at(5, 10, south), null);
  // Picking a southern sabbat into your own calendar counts too.
  assert.equal(seasonNow(new Date(2027, 0, 20), { traditions: ['custom'], custom: [], picked: ['wheel_south/samhain'] })?.key, 'seasons/summer');
  // In words.
  assert.equal(festivalWhen(seasonNow(new Date(2027, 1, 1))!), 'Late winter, until mid-March.');
  assert.equal(festivalWhen(seasonNow(new Date(2026, 9, 24))!), 'Autumn, until the end of November.');
  assert.equal(festivalWhen(seasonNow(new Date(2027, 0, 20), south)!), 'Summer, until the end of February.');
});

test('the season’s thing comes first, but never before a festival that’s near, and doesn’t open the drawer by itself', () => {
  const items = seasonalCabinetItems(ALL);
  // A week before Samhain, in autumn.
  const samhain = seasonalNear(new Date(2026, 9, 27), null);
  assert.deepEqual(keys(samhain), ['wheel/samhain', 'seasons/autumn']);
  const sections = seasonalSections(items, samhain);
  assert.deepEqual(sections.slice(0, 3).map((s) => s.title), ['For Samhain', 'This season', 'Wheel of the Year']);
  assert.deepEqual(ids(sections[1]), ['autumn-leaves']);
  assert.equal(festivalWhen(sections[1].near!), 'Autumn, until the end of November.');
  // Between festivals, the season first.
  const quiet = seasonalNear(new Date(2026, 9, 10), null);
  assert.deepEqual(keys(quiet), ['seasons/autumn']);
  assert.equal(seasonalSections(items, quiet)[0].title, 'This season');
  // Whatever calendar is kept.
  assert.deepEqual(keys(seasonalNear(new Date(2026, 9, 10), { traditions: ['hellenic'], custom: [] })).at(-1), 'seasons/autumn');
  // Hidden until painted: with no picture of autumn leaves, no "This season".
  assert.ok(!seasonalSections(seasonalCabinetItems(pictures(['apples'])), quiet).some((s) => s.title === 'This season'));
  // Always some season, so it never brings the drawer forward by itself.
  assert.deepEqual(nearWithThings(quiet, items), []);
  assert.deepEqual(keys(nearWithThings(samhain, items)), ['wheel/samhain']);
  // festivalsNear itself is festivals only.
  assert.deepEqual(keys(festivalsNear(new Date(2026, 9, 10), null)), []);
});

test('flowers, cut branches and berries go over; the horn holds a drink; the rest keep', () => {
  const items = seasonalCabinetItems(ALL);
  const placed = (id: string) => {
    const item = items.find((i) => i.id === `seasonal:${id}`)!;
    return objectFromForm(item, item.forms[0], [], '2026-10-17T18:00:00.000Z');
  };
  for (const id of ['may-bush', 'midsummer-birch', 'snowdrops', 'blossom-branch', 'summer-wildflowers']) assert.equal(perishableItself(placed(id)), 'flowers', id);
  assert.equal(perishableItself(placed('bilberries')), 'fruit');
  for (const id of ['drinking-horn', 'hlautbolli', 'odins-sheaf', 'yule-goat', 'brideog', 'autumn-leaves']) assert.equal(perishableItself(placed(id)), null, id);
  assert.ok(holdsOfferings(placed('drinking-horn')));
  assert.ok(!holdsOfferings(placed('hlautbolli')));
  assert.ok(!holdsOfferings(placed('yule-goat')));
});
