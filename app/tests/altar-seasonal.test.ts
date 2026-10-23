// Seasonal things: tagged with their sabbats, first in the cabinet in the week
// before a sabbat, one set out on tonight's altar on a sabbat night, and the
// food ones going over as offerings do.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, cabinetCategoriesFor, cabinetItemsFor, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { offeringFreshness, offeringOf, perishableItself } from '../src/lib/altar/offerings.ts';
import {
  holidayKey,
  sabbatNear,
  sabbatOfHoliday,
  SEASONAL_OBJECTS,
  seasonalCabinetItems,
  seasonalFor,
  seasonalSections,
} from '../src/lib/altar/seasonal.ts';
import { altarDataFromDocument, documentFromAltar, emptyDocument } from '../src/lib/altar/snapshot.ts';
import { tonightAltar } from '../src/lib/altar/tonight.ts';
import { explainTonight } from '../src/lib/altar/reading/tonightExplained.ts';
import { holidaysToday } from '../src/lib/holidays.ts';
import type { CabinetItem } from '../src/lib/altar/types.ts';

const DAY = 86_400_000;
const pictures = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, `../assets/altar/objects/seasonal/${id}/${id}.png`]));
const ALL = pictures(SEASONAL_OBJECTS.map((o) => o.id));

test('every seasonal thing is tagged with its sabbats, and only those with a picture are offered', () => {
  for (const o of SEASONAL_OBJECTS) assert.ok(o.sabbats.length >= 1, o.id);
  const tags = (id: string) => SEASONAL_OBJECTS.find((o) => o.id === id)?.sabbats;
  assert.deepEqual(tags('pumpkin-lantern'), ['samhain']);
  assert.deepEqual(tags('yule-log'), ['yule']);
  assert.deepEqual(tags('brigids-cross'), ['imbolc']);
  assert.ok(tags('apples')?.includes('mabon'));
  const items = seasonalCabinetItems(pictures(['apples', 'yule-log']));
  assert.deepEqual(items.map((i) => i.id), ['seasonal:yule-log', 'seasonal:apples']);
  assert.deepEqual(items[1].forms, [{ label: 'Place', image: '../assets/altar/objects/seasonal/apples/apples.png', type: 'seasonal', form: 'apples' }]);
  // Found by the sabbat's name, and by "seasonal".
  assert.equal(cabinetItemsFor(items, 'seasonal', 'mabon').length, 1);
  assert.equal(cabinetItemsFor(items, 'seasonal', 'seasonal').length, 2);
  // The cabinet offers only the ones painted so far.
  assert.ok(builtInCabinet.filter((i) => i.category === 'seasonal').every((i) => !!i.forms[0]?.image));
  assert.deepEqual(seasonalCabinetItems({}), []);
});

test('a sabbat is near from a week before it through the day itself', () => {
  const wheel = { traditions: ['wheel'], custom: [] };
  assert.equal(sabbatNear(new Date(2026, 9, 23, 12), wheel), null, 'eight days before Samhain');
  const weekBefore = sabbatNear(new Date(2026, 9, 24, 9), wheel);
  assert.equal(weekBefore?.id, 'samhain');
  assert.equal(weekBefore?.name, 'Samhain');
  assert.equal(weekBefore?.inDays, 7);
  assert.equal(sabbatNear(new Date(2026, 9, 31, 23), wheel)?.inDays, 0);
  assert.equal(sabbatNear(new Date(2026, 10, 1, 1), wheel), null, 'the day after');
  // No calendar chosen: the Northern wheel.
  assert.equal(sabbatNear(new Date(2026, 9, 28), null)?.id, 'samhain');
  // South of the equator, the end of October is Beltane.
  assert.equal(sabbatNear(new Date(2026, 9, 28), { traditions: ['wheel_south'], custom: [] })?.id, 'beltane');
  // Yule follows the solstice.
  const yule = sabbatNear(new Date(2026, 11, 18), wheel);
  assert.equal(yule?.id, 'yule');
  assert.ok(yule!.inDays >= 2 && yule!.inDays <= 4);
});

test('holiday ids from the calendars name their sabbat', () => {
  assert.equal(holidayKey('wheel-samhain-2026-9-31'), 'samhain');
  assert.equal(holidayKey('wheel_south-beltane-2026-9-31'), 'beltane');
  assert.equal(holidayKey('samhain'), 'samhain');
  assert.equal(sabbatOfHoliday('celtic-samhain_gaelic-2026-9-31'), 'samhain');
  assert.equal(sabbatOfHoliday('celtic-lughnasadh-2026-7-1'), 'lammas');
  assert.equal(sabbatOfHoliday('celtic-bealtaine-2026-4-1'), 'beltane');
  assert.equal(sabbatOfHoliday('roman-saturnalia-2026-11-17'), null);
});

test('the Seasonal drawer comes first near a sabbat, with its things "For Samhain" at the top', () => {
  assert.notEqual(cabinetCategoriesFor(false)[0].id, 'seasonal');
  assert.equal(cabinetCategoriesFor(true)[0].id, 'seasonal');
  assert.equal(cabinetCategoriesFor(true).length, cabinetCategoriesFor(false).length);
  const items = seasonalCabinetItems(ALL);
  const near = sabbatNear(new Date(2026, 9, 27), null);
  const sections = seasonalSections(items, near);
  assert.equal(sections[0].title, 'For Samhain');
  assert.deepEqual(sections[0].items.map((i) => i.id), ['seasonal:pumpkin-lantern', 'seasonal:turnip-lantern', 'seasonal:pomegranate', 'seasonal:apples', 'seasonal:gourds']);
  // Then round the wheel from Samhain; each thing once.
  assert.deepEqual(sections.map((s) => s.title), ['For Samhain', 'Yule', 'Imbolc', 'Ostara', 'Beltane', 'Litha', 'Lammas']);
  const ids = sections.flatMap((s) => s.items.map((i) => i.id));
  assert.equal(new Set(ids).size, items.length);
  // Between sabbats, no "For".
  assert.equal(seasonalSections(items, null)[0].title, 'Samhain');
  // Anything without a sabbat (your own) comes last.
  const own: CabinetItem = { id: 'custom:x', category: 'seasonal', name: 'Mine', keywords: [], forms: [] };
  assert.equal(seasonalSections([...items, own], null).at(-1)?.title, 'Your own');
});

test('tonight’s altar on a sabbat night sets out one of its seasonal things, the most fitting with a picture', () => {
  assert.equal(seasonalFor('samhain')[0], 'pumpkin-lantern');
  assert.equal(seasonalFor('mabon')[0], 'apples');
  const night = new Date(2026, 9, 31, 20);
  const holidays = holidaysToday(night, { traditions: ['wheel'], custom: [] });
  // The calendars' own ids now bring the holiday's altar (they carry the calendar and date).
  assert.equal(tonightAltar(night, holidays, 'x').reason, 'Samhain');
  const without = tonightAltar(night, holidays, 'x');
  assert.ok(!without.doc.objects.some((o) => o.type === 'seasonal'), 'no pictures yet, nothing seasonal');
  // Once the pictures are there (the turnip lantern only, say), it stands in front of the centrepiece.
  const added = seasonalCabinetItems(pictures(['turnip-lantern']));
  builtInCabinet.push(...added);
  try {
    const altar = tonightAltar(night, holidays, 'x');
    const lantern = altar.doc.objects.find((o) => o.type === 'seasonal');
    assert.equal(lantern?.form, 'turnip-lantern');
    assert.ok(altar.labels.includes('Turnip Lantern'));
    assert.ok(explainTonight(altar, night).some((p) => p.why === 'Turnip Lantern: one of the things kept at Samhain.'));
    // Not on an ordinary night.
    assert.ok(!tonightAltar(new Date(2026, 9, 13, 20), [], 'x').doc.objects.some((o) => o.type === 'seasonal'));
  } finally {
    builtInCabinet.splice(builtInCabinet.length - added.length, added.length);
  }
});

test('apples, gourds and a pomegranate go over slowly; the woven and straw things keep', () => {
  const items = seasonalCabinetItems(ALL);
  const placed = (id: string, when = '2026-10-01T18:00:00.000Z') => {
    const item = items.find((i) => i.id === `seasonal:${id}`)!;
    return objectFromForm(item, item.forms[0], [], when);
  };
  for (const id of ['apples', 'gourds', 'pomegranate']) assert.equal(perishableItself(placed(id)), 'harvest', id);
  for (const id of ['pumpkin-lantern', 'corn-dolly', 'wheat-sheaf', 'brigids-cross', 'flower-crown', 'ostara-eggs', 'sun-wheel']) {
    assert.equal(perishableItself(placed(id)), null, id);
    assert.equal(offeringOf(placed(id)), null, id);
  }
  const apples = placed('apples');
  const t0 = Date.parse('2026-10-01T18:00:00.000Z');
  assert.equal(offeringFreshness(apples, t0 + 3 * DAY)?.stage.name, 'Fresh');
  assert.equal(offeringFreshness(apples, t0 + 10 * DAY)?.stage.name, 'Softening');
  assert.equal(offeringFreshness(apples, t0 + 15 * DAY)?.level, 'refresh');
  assert.equal(offeringFreshness(apples, t0 + 31 * DAY)?.stage.name, 'Going over');
});

test('a seasonal thing keeps its shape through a save and a load', () => {
  const item = seasonalCabinetItems(ALL).find((i) => i.id === 'seasonal:brigids-cross')!;
  const object = objectFromForm(item, item.forms[0], [], '2026-02-01T10:00:00.000Z');
  const doc = { ...emptyDocument(), objects: [object] };
  const back = documentFromAltar(JSON.parse(JSON.stringify(altarDataFromDocument(doc, 'Imbolc', '2026-02-01T10:00:00.000Z')))).objects[0];
  assert.equal(back.type, 'seasonal');
  assert.equal(back.form, 'brigids-cross');
  assert.equal(back.label, 'Brigid’s Cross');
  assert.equal(back.imagePath, '../assets/altar/objects/seasonal/brigids-cross/brigids-cross.png');
});
