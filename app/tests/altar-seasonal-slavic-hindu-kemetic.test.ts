// Seasonal things for the Slavic, Hindu and Kemetic (Egyptian) years: the
// Slavic ones near for those who keep the Slavic calendar (holidays.ts); the
// Hindu and Kemetic ones from the traditional calendars (lib/calendars), near
// only for someone who shows that calendar in settings, the Kemetic days upon
// the year as one span. Grouped after the Christian & folk calendar, found by
// festival and god, hidden until painted, the food and flowers going over as
// offerings do.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cabinetItemsFor, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { holdsOfferings, perishableItself } from '../src/lib/altar/offerings.ts';
import {
  calendarFestivalsBetween,
  festivalLine,
  festivalsNear,
  festivalsOfHoliday,
  festivalWhen,
  nearWithThings,
  SEASONAL_TRADITIONS,
  seasonalCabinetItems,
  seasonalForHoliday,
  seasonalNear,
  seasonalObject,
  seasonalSections,
  type FestivalNear,
} from '../src/lib/altar/seasonal.ts';
import { SEASONAL_OBJECTS } from '../src/lib/altar/seasonal.ts';

const pictures = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, `../assets/altar/objects/seasonal/${id}/${id}.png`]));
const ALL = pictures(SEASONAL_OBJECTS.map((o) => o.id));
const SLAVIC = ['marzanna', 'kupala-wreath', 'dziady-supper', 'kutia', 'didukh', 'koliada-star', 'bread-and-salt'];
// The marigolds come at Ganesh Chaturthi first in the year, so after the modak.
const HINDU = ['bilva-leaves', 'holi-colours', 'modak', 'marigold-garland', 'kalash', 'diya-lamps', 'rangoli'];
const KEMETIC = ['hetep-table', 'blue-lotus', 'epagomenal-lamps', 'osiris-bed', 'sistrum'];
const slavic = { traditions: ['slavic'], custom: [] };
const shows = (calendars: string, more: Record<string, string> = {}) => ({ settings: { calendar_extra: calendars, ...more }, place: null });
const keys = (near: FestivalNear[]) => near.map((n) => n.key);
const ids = (section: { items: { id: string }[] } | undefined) => (section?.items ?? []).map((i) => i.id.replace('seasonal:', ''));

test('each Slavic, Hindu and Kemetic thing has its festivals, keywords and a line about it', () => {
  for (const [tradition, list] of [['slavic', SLAVIC], ['hindu', HINDU], ['kemetic', KEMETIC]] as const) {
    for (const id of list) {
      const o = seasonalObject(id);
      assert.ok(o, id);
      assert.equal(o!.festivals[0].tradition, tradition, id);
      assert.ok(o!.keywords.length >= 5, id);
      assert.ok(o!.description && o!.description.length > 40 && !o!.description.includes('!'), id);
      assert.ok(festivalLine(o!), id);
    }
  }
  assert.equal(festivalLine(seasonalObject('kutia')!), 'Koliada · Dziady');
  assert.equal(festivalLine(seasonalObject('marigold-garland')!), 'Diwali · Navaratri · Ganesh Chaturthi');
  assert.equal(festivalLine(seasonalObject('blue-lotus')!), 'Epagomenal Days · Wep Ronpet');
  assert.equal(festivalLine(seasonalObject('sistrum')!), 'Birthday of Isis · Birthday of Nephthys');
  // After the Christian & folk calendar, before the turning seasons, in this order.
  const order = SEASONAL_TRADITIONS.map((t) => t.id);
  assert.deepEqual(order.slice(order.indexOf('christian')), ['christian', 'slavic', 'hindu', 'kemetic', 'seasons']);
  assert.deepEqual(
    ['slavic', 'hindu', 'kemetic'].map((id) => SEASONAL_TRADITIONS.find((t) => t.id === id)!.title),
    ['Slavic festivals', 'Hindu festivals', 'Kemetic (Egyptian) festivals'],
  );
});

test('hidden until painted; with pictures each joins its section, through its year, found by festival and god', () => {
  assert.deepEqual(seasonalCabinetItems(pictures(['didukh'])).map((i) => i.id), ['seasonal:didukh']);
  for (const title of ['Slavic festivals', 'Hindu festivals', 'Kemetic (Egyptian) festivals']) {
    assert.ok(!seasonalSections(seasonalCabinetItems(pictures(['apples'])), []).some((s) => s.title === title), title);
  }
  const items = seasonalCabinetItems(ALL);
  const sections = seasonalSections(items, []);
  assert.deepEqual(sections.map((s) => s.title).slice(-5), ['Christian & folk calendar', 'Slavic festivals', 'Hindu festivals', 'Kemetic (Egyptian) festivals', 'The turning seasons']);
  assert.deepEqual(ids(sections.find((s) => s.title === 'Slavic festivals')), SLAVIC);
  assert.deepEqual(ids(sections.find((s) => s.title === 'Hindu festivals')), HINDU);
  assert.deepEqual(ids(sections.find((s) => s.title === 'Kemetic (Egyptian) festivals')), KEMETIC);

  const found = (search: string) => cabinetItemsFor(items, 'seasonal', search).map((i) => i.id.replace('seasonal:', '')).sort();
  assert.deepEqual(found('slavic'), [...SLAVIC].sort());
  assert.deepEqual(found('hindu'), [...HINDU].sort());
  assert.deepEqual(found('kemetic'), [...KEMETIC].sort());
  assert.deepEqual(found('diwali'), ['diya-lamps', 'marigold-garland', 'rangoli']);
  assert.deepEqual(found('kupala'), ['kupala-wreath']);
  assert.deepEqual(found('morana'), ['marzanna']);
  assert.ok(found('lakshmi').includes('diya-lamps'));
  assert.ok(found('osiris').includes('osiris-bed') && found('osiris').includes('epagomenal-lamps'));
  assert.ok(found('isis').includes('sistrum'));
  assert.ok(found('shiva').includes('bilva-leaves'));
  assert.ok(found('ganesha').includes('modak'));
});

test('a Slavic festival is near only when the Slavic calendar is kept', () => {
  const items = seasonalCabinetItems(ALL);
  const koliada = festivalsNear(new Date(2026, 11, 18, 12), slavic);
  assert.deepEqual(keys(koliada), ['slavic/koliada']);
  assert.equal(seasonalSections(items, koliada)[0].title, 'For Koliada');
  assert.deepEqual(ids(seasonalSections(items, koliada)[0]), ['kutia', 'didukh', 'koliada-star', 'bread-and-salt']);
  assert.ok(!festivalsNear(new Date(2026, 11, 18, 12), null).some((n) => n.key.startsWith('slavic/')));
  const dziady = festivalsNear(new Date(2026, 9, 28, 12), slavic);
  assert.deepEqual(keys(dziady), ['slavic/dziady']);
  assert.deepEqual(ids(seasonalSections(items, dziady)[0]), ['dziady-supper', 'kutia']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 5, 20, 12), slavic)), ['slavic/kupala']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 2, 16, 12), slavic)), ['slavic/marzanna']);
  // Tonight's altar on the holiday: the didukh first at Koliada.
  assert.deepEqual(festivalsOfHoliday('slavic-koliada-2026-11-21'), ['slavic/koliada']);
  assert.equal(seasonalForHoliday('slavic-koliada-2026-11-21')[0], 'didukh');
  assert.equal(seasonalForHoliday('slavic-dziady-2026-10-1')[0], 'dziady-supper');
});

test('a Hindu festival is near only when the Hindu calendar is shown, by its own dates', () => {
  const items = seasonalCabinetItems(ALL);
  const hindu = shows('hindu');
  // Diwali 2026 is 8 November (Drik Panchang, New Delhi).
  const diwali = festivalsNear(new Date(2026, 10, 3, 12), null, hindu);
  assert.deepEqual(keys(diwali), ['hindu/diwali']);
  assert.equal(diwali[0].name, 'Diwali');
  assert.equal(festivalWhen(diwali[0]), 'Diwali is in 5 days.');
  assert.equal(seasonalSections(items, diwali)[0].title, 'For Diwali');
  assert.deepEqual(ids(seasonalSections(items, diwali)[0]), ['diya-lamps', 'rangoli', 'marigold-garland']);
  // Not when the calendar isn't shown, whatever holidays are kept, nor for another calendar shown.
  assert.deepEqual(keys(festivalsNear(new Date(2026, 10, 3, 12), null)), []);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 10, 3, 12), { traditions: ['wheel', 'slavic'], custom: [] }, shows('kemetic,roman'))), []);
  assert.deepEqual(calendarFestivalsBetween(new Date(2026, 10, 1), new Date(2026, 10, 10), shows('')), []);
  assert.deepEqual(calendarFestivalsBetween(new Date(2026, 10, 1), new Date(2026, 10, 10), null), []);
  // Navaratri runs nine nights from 11 October: near while it runs.
  const navaratri = festivalsNear(new Date(2026, 9, 14, 12), null, hindu);
  assert.deepEqual(keys(navaratri), ['hindu/navaratri']);
  assert.equal(festivalWhen(navaratri[0]), 'Navaratri, day 4 of 9.');
  assert.deepEqual(ids(seasonalSections(items, navaratri)[0]), ['kalash', 'marigold-garland']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 9, 20, 12), null, hindu)), []);
  // Holi (4 March 2026) but not Holika Dahan, which has nothing of its own; Maha Shivaratri; Ganesh Chaturthi.
  assert.deepEqual(keys(festivalsNear(new Date(2026, 1, 28, 12), null, hindu)), ['hindu/holi']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 1, 10, 12), null, hindu)), ['hindu/maha-shivaratri']);
  assert.deepEqual(ids(seasonalSections(items, festivalsNear(new Date(2026, 8, 10, 12), null, hindu))[0]), ['modak', 'marigold-garland']);
  // With the Slavic Dziady today too, soonest first; and the season after.
  const both = seasonalNear(new Date(2026, 10, 1, 12), slavic, hindu);
  assert.deepEqual(keys(both), ['slavic/dziady', 'hindu/diwali', 'seasons/autumn']);
  // Without its pictures, Diwali doesn't bring the drawer forward.
  assert.deepEqual(nearWithThings(diwali, seasonalCabinetItems(pictures(['apples']))), []);
  assert.deepEqual(keys(nearWithThings(diwali, items)), ['hindu/diwali']);
  assert.deepEqual(festivalsOfHoliday('hindu-diwali'), ['hindu/diwali']);
  assert.deepEqual(festivalsOfHoliday('hindu-diwali', ['calendar:hindu']), ['hindu/diwali']);
  assert.deepEqual(festivalsOfHoliday('hindu-holika-dahan'), []);
});

test('the Kemetic days upon the year come as one span, then Wep Ronpet, only when the calendar is shown', () => {
  const items = seasonalCabinetItems(ALL);
  const kemetic = shows('kemetic');
  // By the rising of Sirius at Cairo, 2026's days upon the year are 30 July to 3 August, and Wep Ronpet 4 August.
  const span = calendarFestivalsBetween(new Date(2026, 6, 30), new Date(2026, 6, 30), kemetic);
  assert.equal(span.length, 1);
  assert.equal(span[0].id, 'kemetic-epagomenal');
  assert.equal(span[0].days, 5);
  assert.equal(span[0].date.getTime(), new Date(2026, 6, 30).getTime());
  assert.deepEqual(span[0].parts, ['kemetic-birth-osiris', 'kemetic-birth-horus', 'kemetic-birth-set', 'kemetic-birth-isis', 'kemetic-birth-nephthys']);

  // On the Wheel of the Year (the default), with Lammas after them.
  const before = festivalsNear(new Date(2026, 6, 25, 12), null, kemetic);
  assert.deepEqual(keys(before), ['kemetic/epagomenal', 'wheel/lammas']);
  assert.equal(festivalWhen(before[0]), 'Epagomenal Days, in 5 days, for 5 days.');
  assert.deepEqual([...before[0].keys].sort(), ['kemetic/birth-isis', 'kemetic/birth-nephthys', 'kemetic/birth-osiris', 'kemetic/epagomenal']);
  const drawer = seasonalSections(items, before);
  assert.equal(drawer[0].title, 'For Epagomenal Days');
  assert.deepEqual(ids(drawer[0]), ['blue-lotus', 'epagomenal-lamps', 'osiris-bed', 'sistrum']);
  // A week before, not eight days; on the last of the five days still, with the new year after.
  assert.deepEqual(keys(festivalsNear(new Date(2026, 6, 22, 12), null, kemetic)), []);
  const running = festivalsNear(new Date(2026, 7, 3, 12), null, kemetic);
  assert.deepEqual(keys(running), ['kemetic/epagomenal', 'kemetic/wep-ronpet']);
  assert.equal(festivalWhen(running[0]), 'Epagomenal Days, day 5 of 5.');
  const sections = seasonalSections(items, running);
  assert.deepEqual(sections.slice(0, 2).map((s) => s.title), ['For Epagomenal Days', 'For Wep Ronpet']);
  assert.deepEqual(ids(sections[1]), ['hetep-table']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 7, 5, 12), null, kemetic)), []);
  // Not when the calendar isn't shown.
  assert.deepEqual(keys(festivalsNear(new Date(2026, 6, 25, 12), null)), ['wheel/lammas']);
  assert.deepEqual(keys(festivalsNear(new Date(2026, 6, 25, 12), null, shows('hindu'))), ['wheel/lammas']);
  // The year as you begin it: at the Coptic Nayrouz (11 September 2026) the days are 6–10 September.
  const coptic = festivalsNear(new Date(2026, 8, 4, 12), null, shows('kemetic', { calendar_opt_kemetic_kemeticNewYear: 'coptic' }));
  assert.deepEqual(keys(coptic), ['kemetic/epagomenal', 'kemetic/wep-ronpet']);
  assert.equal(coptic[0].date.getTime(), new Date(2026, 8, 6).getTime());
  // From 1 August, a leap day in the year gives six days upon it, still one span.
  const six = calendarFestivalsBetween(new Date(2028, 6, 28), new Date(2028, 6, 28), shows('kemetic', { calendar_opt_kemetic_kemeticNewYear: 'aug1' }));
  assert.equal(six.length, 1);
  assert.equal(six[0].days, 6);
  assert.equal(six[0].parts.at(-1), 'kemetic-epagomenal-6');
  // Without its pictures, the span doesn't bring the drawer forward.
  assert.deepEqual(nearWithThings(before, seasonalCabinetItems(pictures(['apples']))), []);
  assert.deepEqual(festivalsOfHoliday('kemetic-birth-osiris'), ['kemetic/birth-osiris']);
  assert.deepEqual(festivalsOfHoliday('kemetic-birth-set'), []);
});

test('the food goes over, the flowers and leaves wilt, the rest keep', () => {
  const items = seasonalCabinetItems(ALL);
  const placed = (id: string) => {
    const item = items.find((i) => i.id === `seasonal:${id}`)!;
    return objectFromForm(item, item.forms[0], [], '2026-11-08T18:00:00.000Z');
  };
  for (const id of ['dziady-supper', 'kutia']) assert.equal(perishableItself(placed(id)), 'cooked', id);
  for (const id of ['bread-and-salt', 'hetep-table']) assert.equal(perishableItself(placed(id)), 'bread', id);
  assert.equal(perishableItself(placed('modak')), 'sweets');
  for (const id of ['kupala-wreath', 'marigold-garland', 'bilva-leaves', 'blue-lotus']) assert.equal(perishableItself(placed(id)), 'flowers', id);
  for (const id of ['marzanna', 'didukh', 'koliada-star', 'diya-lamps', 'rangoli', 'holi-colours', 'kalash', 'osiris-bed', 'epagomenal-lamps', 'sistrum']) {
    assert.equal(perishableItself(placed(id)), null, id);
  }
  for (const id of [...SLAVIC, ...HINDU, ...KEMETIC]) assert.ok(!holdsOfferings(placed(id)), id);
});
