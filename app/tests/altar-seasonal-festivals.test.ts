// Seasonal things for festivals beyond the Wheel of the Year: the Greek
// festivals and the monthly days. Near only for the calendars you keep (the
// monthly days only the day before and on the day; a festival of several days
// while it runs), grouped by calendar in the drawer with their festivals
// named, found by festival and god, hidden until painted, set out on tonight's
// altar, and the food ones going over as offerings do.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, cabinetItemsFor, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { holdsOfferings, offeringFreshness, perishableItself } from '../src/lib/altar/offerings.ts';
import {
  festivalLine,
  festivalName,
  festivalsNear,
  festivalsOfHoliday,
  festivalWhen,
  nearWithThings,
  SEASONAL_OBJECTS,
  SEASONAL_TRADITIONS,
  seasonalCabinetItems,
  seasonalDescription,
  seasonalForHoliday,
  seasonalObject,
  seasonalSections,
} from '../src/lib/altar/seasonal.ts';
import { tonightAltar } from '../src/lib/altar/tonight.ts';
import { explainTonight } from '../src/lib/altar/reading/tonightExplained.ts';
import { holidaysToday, TRADITIONS } from '../src/lib/holidays.ts';

const HOUR = 3_600_000;
const pictures = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, `../assets/altar/objects/seasonal/${id}/${id}.png`]));
const ALL = pictures(SEASONAL_OBJECTS.map((o) => o.id));
const GREEK = ['eiresione', 'pyanepsia-beans', 'chous', 'amphiphon', 'hekates-deipnon', 'panathenaic-olive', 'kernos', 'kykeon', 'thyrsus', 'theatre-mask', 'thargelos', 'phiale', 'thymiaterion'];
const hellenic = { traditions: ['hellenic', 'hellenic_monthly'], custom: [] };
const keys = (near: { key: string }[]) => near.map((n) => n.key);

test('every festival a seasonal thing names is a real holiday in its calendar, and each calendar has a drawer section', () => {
  for (const o of SEASONAL_OBJECTS) {
    for (const f of o.festivals) {
      assert.ok(festivalName(f), `${o.id}: ${f.tradition}/${f.holiday}`);
      assert.ok(SEASONAL_TRADITIONS.some((t) => t.calendars.includes(f.tradition)), `${o.id}: ${f.tradition}`);
      // The turning seasons go by the date, not a calendar (seasonNow).
      if (f.tradition !== 'wheel' && f.tradition !== 'seasons') assert.ok(TRADITIONS.find((t) => t.id === f.tradition)?.holidays.some((h) => h.id === f.holiday), `${o.id}: ${f.holiday}`);
    }
  }
  for (const id of GREEK) {
    const o = seasonalObject(id);
    assert.ok(o, id);
    assert.ok(o!.description && o!.description.length > 40 && !o!.description.includes('!'), id);
    assert.ok((o!.deities ?? []).length > 0, id);
  }
  assert.equal(new Set(SEASONAL_OBJECTS.map((o) => o.id)).size, SEASONAL_OBJECTS.length);
  assert.equal(festivalLine(seasonalObject('thyrsus')!), 'Lenaia · City Dionysia');
  assert.equal(festivalLine(seasonalObject('phiale')!), 'Noumenia · Agathos Daimon');
  assert.equal(festivalLine(seasonalObject('apples')!), 'Mabon · Samhain');
});

test('a Greek thing without a picture stays hidden; with one it joins the drawer, found by festival and god', () => {
  // None are painted yet in the artwork data the cabinet is built from, and only painted ones are offered.
  assert.ok(builtInCabinet.filter((i) => i.category === 'seasonal').every((i) => !!i.forms[0]?.image));
  assert.deepEqual(seasonalCabinetItems(pictures(['apples'])).map((i) => i.id), ['seasonal:apples']);
  const items = seasonalCabinetItems(pictures(['thyrsus', 'hekates-deipnon', 'kernos', 'apples']));
  assert.deepEqual(items.map((i) => i.id).sort(), ['seasonal:apples', 'seasonal:hekates-deipnon', 'seasonal:kernos', 'seasonal:thyrsus']);
  const thyrsus = items.find((i) => i.id === 'seasonal:thyrsus')!;
  assert.deepEqual(thyrsus.festivals, ['hellenic/lenaia', 'hellenic/dionysia']);
  assert.equal(thyrsus.description, 'Lenaia · City Dionysia');
  assert.deepEqual(thyrsus.forms, [{ label: 'Place', image: '../assets/altar/objects/seasonal/thyrsus/thyrsus.png', type: 'seasonal', form: 'thyrsus' }]);
  const found = (search: string) => cabinetItemsFor(items, 'seasonal', search).map((i) => i.id);
  assert.deepEqual(found('dionysus'), ['seasonal:thyrsus']);
  assert.deepEqual(found('dionysia'), ['seasonal:thyrsus']);
  assert.deepEqual(found('hekate'), ['seasonal:hekates-deipnon']);
  assert.deepEqual(found('persephone'), ['seasonal:kernos']);
  assert.deepEqual(found('eleusinian'), ['seasonal:kernos']);
  assert.equal(found('greek').length, 3);
  assert.deepEqual(found('sabbat'), ['seasonal:apples']);
  assert.equal(found('seasonal').length, 4);
});

test('a Greek festival is near from a week before, only when its calendar is kept', () => {
  // The Pyanepsia falls on 17 October 2026.
  const weekBefore = new Date(2026, 9, 10, 9);
  const near = festivalsNear(weekBefore, hellenic).find((n) => n.key === 'hellenic/pyanepsia');
  assert.equal(near?.name, 'Pyanepsia');
  assert.equal(near?.inDays, 7);
  assert.equal(festivalWhen(near!), 'Pyanepsia is in 7 days.');
  assert.ok(!keys(festivalsNear(new Date(2026, 9, 9, 9), hellenic)).includes('hellenic/pyanepsia'), 'eight days before');
  assert.equal(festivalWhen(festivalsNear(new Date(2026, 9, 17, 20), hellenic).find((n) => n.key === 'hellenic/pyanepsia')!), 'Pyanepsia is today.');
  assert.ok(!keys(festivalsNear(new Date(2026, 9, 18, 1), hellenic)).includes('hellenic/pyanepsia'), 'the day after');
  // Not kept: the default Wheel of the Year, or a calendar chosen without it.
  assert.ok(!keys(festivalsNear(weekBefore, null)).some((k) => k.startsWith('hellenic/')));
  assert.ok(!keys(festivalsNear(weekBefore, { traditions: ['wheel', 'norse'], custom: [] })).some((k) => k.startsWith('hellenic/')));
  // The yearly festivals without the monthly days, and the other way round.
  assert.deepEqual(keys(festivalsNear(weekBefore, { traditions: ['hellenic'], custom: [] })), ['hellenic/pyanepsia']);
  assert.ok(!keys(festivalsNear(weekBefore, { traditions: ['hellenic_monthly'], custom: [] })).includes('hellenic/pyanepsia'));
  // A single holiday picked into your own calendar counts, as it does on the calendar.
  const picked = { traditions: ['wheel', 'custom'], custom: [], picked: ['hellenic/pyanepsia'] };
  assert.ok(keys(festivalsNear(weekBefore, picked)).includes('hellenic/pyanepsia'));
  assert.ok(!keys(festivalsNear(weekBefore, picked)).includes('hellenic/deipnon'));
  // Kept alongside the Wheel, both are near, soonest first.
  const both = festivalsNear(new Date(2026, 9, 24, 9), { traditions: ['wheel', 'hellenic'], custom: [] });
  assert.deepEqual(keys(both), ['wheel/samhain']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 9, 12, 9), { traditions: ['wheel', 'hellenic'], custom: [] })), ['hellenic/pyanepsia']);
});

test('the monthly days are near only the day before and on the day', () => {
  // Hekate’s Deipnon on 10 October 2026, the Noumenia on the 11th, the Agathos Daimon on the 12th.
  assert.deepEqual(keys(festivalsNear(new Date(2026, 9, 8, 12), hellenic)), []);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 9, 9, 12), hellenic)), ['hellenic/deipnon']);
  const deipnon = festivalsNear(new Date(2026, 9, 10, 12), hellenic);
  assert.deepEqual(keys(deipnon), ['hellenic/deipnon', 'hellenic/noumenia', 'hellenic/pyanepsia']);
  assert.equal(festivalWhen(deipnon[0]), 'Hekate’s Deipnon is today.');
  assert.equal(festivalWhen(deipnon[1]), 'Noumenia is tomorrow.');
  assert.deepEqual(keys(festivalsNear(new Date(2026, 9, 12, 12), hellenic)), ['hellenic/agathos_daimon', 'hellenic/pyanepsia']);
  assert.ok(!keys(festivalsNear(new Date(2026, 9, 13, 12), hellenic)).includes('hellenic/agathos_daimon'));
});

test('a festival of several days is near all the while it runs', () => {
  // The Eleusinian Mysteries run nine days from 26 September 2026.
  const before = festivalsNear(new Date(2026, 8, 20, 12), hellenic).find((n) => n.key === 'hellenic/eleusinia')!;
  assert.equal(festivalWhen(before), 'Eleusinian Mysteries, in 6 days, for 9 days.');
  const during = festivalsNear(new Date(2026, 9, 1, 12), hellenic).find((n) => n.key === 'hellenic/eleusinia')!;
  assert.equal(during.inDays, 0);
  assert.equal(during.day, 6);
  assert.equal(festivalWhen(during), 'Eleusinian Mysteries, day 6 of 9.');
  assert.ok(keys(festivalsNear(new Date(2026, 9, 4, 22), hellenic)).includes('hellenic/eleusinia'), 'its last day');
  assert.ok(!keys(festivalsNear(new Date(2026, 9, 5, 1), hellenic)).includes('hellenic/eleusinia'), 'the day after');
  // The City Dionysia, seven days from 18 March 2027.
  const dionysia = festivalsNear(new Date(2027, 2, 20, 12), hellenic).find((n) => n.key === 'hellenic/dionysia')!;
  assert.equal(festivalWhen(dionysia), 'City Dionysia, day 3 of 7.');
  assert.equal(festivalWhen({ ...dionysia, inDays: 1, day: 0 }), 'City Dionysia, from tomorrow, for 7 days.');
  assert.equal(festivalWhen({ ...dionysia, inDays: 0, day: 1 }), 'City Dionysia, day 1 of 7.');
});

test('the drawer: what is near first, then each calendar’s things, each named for its festivals', () => {
  const items = seasonalCabinetItems(ALL);
  const near = festivalsNear(new Date(2026, 9, 10, 12), hellenic);
  const sections = seasonalSections(items, near);
  assert.deepEqual(sections.map((s) => s.title), ['For Hekate’s Deipnon', 'For Noumenia', 'For Pyanepsia', 'Wheel of the Year', 'Greek festivals', 'Norse & Heathen', 'Celtic festivals', 'Roman festivals', 'The turning seasons']);
  assert.deepEqual(sections[0].items.map((i) => i.id), ['seasonal:hekates-deipnon']);
  // The phiale is kept at the Noumenia and the Agathos Daimon; tonight it's under the Noumenia, once.
  assert.deepEqual(sections[1].items.map((i) => i.id), ['seasonal:phiale', 'seasonal:thymiaterion']);
  assert.deepEqual(sections[2].items.map((i) => i.id), ['seasonal:eiresione', 'seasonal:pyanepsia-beans']);
  assert.equal(sections[2].near?.key, 'hellenic/pyanepsia');
  assert.equal(sections[3].near, null);
  // The Greek things through the Attic year, from the Panathenaia in high summer.
  const greek = sections[4].items.map((i) => i.id.replace('seasonal:', ''));
  assert.deepEqual(greek, ['panathenaic-olive', 'kernos', 'kykeon', 'thyrsus', 'theatre-mask', 'chous', 'amphiphon', 'thargelos']);
  const ids = sections.flatMap((s) => s.items.map((i) => i.id));
  assert.equal(new Set(ids).size, items.length);
  // A festival near with nothing painted for it doesn't bring the drawer forward.
  assert.equal(nearWithThings(near, seasonalCabinetItems(pictures(['apples']))).length, 0);
  assert.deepEqual(keys(nearWithThings(near, seasonalCabinetItems(pictures(['apples', 'eiresione'])))), ['hellenic/pyanepsia']);
  assert.deepEqual(seasonalSections(seasonalCabinetItems(pictures(['apples'])), near).map((s) => s.title), ['Wheel of the Year']);
});

test('calendar holidays name their festivals, and tonight’s altar sets one out', () => {
  assert.deepEqual(festivalsOfHoliday('hellenic-pyanepsia-2026-9-17'), ['hellenic/pyanepsia']);
  assert.deepEqual(festivalsOfHoliday('hellenic_monthly-deipnon-2026-9-10'), ['hellenic/deipnon']);
  assert.deepEqual(festivalsOfHoliday('wheel_south-beltane-2026-9-31'), ['wheel/beltane']);
  assert.deepEqual(festivalsOfHoliday('hellenic-thesmophoria-2026-9-21'), []);
  assert.deepEqual(festivalsOfHoliday('roman-saturnalia-2026-11-17'), ['roman/saturnalia']);
  assert.deepEqual(festivalsOfHoliday('slavic-kupala-2026-5-23'), []);
  assert.deepEqual(seasonalForHoliday('hellenic-pyanepsia-2026-9-17'), ['eiresione', 'pyanepsia-beans']);
  assert.equal(seasonalForHoliday('hellenic_monthly-noumenia-2026-9-11')[0], 'thymiaterion');
  assert.equal(seasonalForHoliday('hellenic_monthly-agathos_daimon-2026-9-12')[0], 'phiale');
  // No Greek picture is painted yet, so the Pyanepsia's altar has none; the day's holidays are passed through all the same.
  const night = new Date(2026, 9, 17, 20);
  const holidays = holidaysToday(night, hellenic);
  assert.ok(holidays.some((h) => h.id.startsWith('hellenic-pyanepsia')));
  const painted = builtInCabinet.some((i) => i.id === 'seasonal:eiresione');
  const altar = tonightAltar(night, holidays, 'x');
  const seasonal = altar.doc.objects.find((o) => o.type === 'seasonal');
  if (painted) {
    assert.equal(seasonal?.form, 'eiresione');
    assert.ok(explainTonight(altar, night).some((p) => p.why.endsWith('kept at Pyanepsia.')));
  } else assert.equal(seasonal, undefined);
});

test('the food ones go over as offerings do; the phiale holds a libation; the rest keep', () => {
  const items = seasonalCabinetItems(ALL);
  const placed = (id: string, when = '2026-10-17T18:00:00.000Z') => {
    const item = items.find((i) => i.id === `seasonal:${id}`)!;
    return objectFromForm(item, item.forms[0], [], when);
  };
  assert.equal(perishableItself(placed('pyanepsia-beans')), 'cooked');
  assert.equal(perishableItself(placed('hekates-deipnon')), 'cooked');
  assert.equal(perishableItself(placed('thargelos')), 'cooked');
  assert.equal(perishableItself(placed('amphiphon')), 'bread');
  assert.equal(perishableItself(placed('kykeon')), 'drink');
  for (const id of ['eiresione', 'chous', 'panathenaic-olive', 'kernos', 'thyrsus', 'theatre-mask', 'phiale', 'thymiaterion']) {
    assert.equal(perishableItself(placed(id)), null, id);
  }
  assert.ok(holdsOfferings(placed('phiale')));
  assert.ok(!holdsOfferings(placed('chous')));
  assert.ok(!holdsOfferings(placed('apples')));
  const beans = placed('pyanepsia-beans');
  const t0 = Date.parse('2026-10-17T18:00:00.000Z');
  assert.equal(offeringFreshness(beans, t0 + 2 * HOUR)?.stage.name, 'Fresh');
  assert.equal(offeringFreshness(beans, t0 + 50 * HOUR)?.stage.name, 'Spoiled');
  // Its panel says what it is.
  assert.match(seasonalDescription(placed('hekates-deipnon')), /crossroads/);
  assert.equal(seasonalDescription({ type: 'tool', form: 'phiale' }), '');
});
