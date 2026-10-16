import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CAIRO, heliacalRisingOfSirius, KEMETIC_CALENDAR, kemeticDay, wepRonpet } from '../src/lib/calendars/kemetic.ts';
import type { CalendarContext, Place } from '../src/lib/calendars/types.ts';

const ctx = (kemeticNewYear?: string, place: Place | null = null): CalendarContext => ({
  place,
  hemisphere: place && place.latitude < 0 ? 'south' : 'north',
  options: kemeticNewYear ? { kemeticNewYear } : {},
});
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

const ASWAN: Place = { latitude: 24.09, longitude: 32.9 };
const LONDON: Place = { latitude: 51.5, longitude: -0.12 };
const SYDNEY: Place = { latitude: -33.87, longitude: 151.21 };
const LONGYEARBYEN: Place = { latitude: 78.2, longitude: 15.6 };

test('Coptic anchor: Nayrouz on 11 September, 12 September before a Gregorian leap year', () => {
  // https://en.wikipedia.org/wiki/Coptic_calendar: 1 Thout = 11 Sep (12 Sep in the year before a leap year), 1900–2099.
  assert.equal(ymd(wepRonpet(2023, ctx('coptic'))), '2023-09-12');
  assert.equal(ymd(wepRonpet(2025, ctx('coptic'))), '2025-09-11');
  assert.equal(ymd(wepRonpet(2026, ctx('coptic'))), '2026-09-11');
  assert.equal(ymd(wepRonpet(2027, ctx('coptic'))), '2027-09-12');
  // 16 October 2026 is 6 Paopi in the Coptic calendar; Coptic Christmas, 29 Koiak, is 7 January 2026.
  assert.equal(KEMETIC_CALENDAR.dateOf(day(2026, 10, 16), ctx('coptic')).short, 'II Akhet 6 · Phaophi');
  assert.deepEqual(kemeticDay(day(2026, 1, 7), ctx('coptic')), { kind: 'month', month: 4, day: 29, season: 0, year: 2025 });
});

test('the epagomenal days: five, or six when the next new year moves a day', () => {
  const epag = (from: Date, to: Date, choice: string) =>
    KEMETIC_CALENDAR.eventsBetween(from, to, ctx(choice)).filter((e) => e.id.startsWith('kemetic-birth') || e.id === 'kemetic-epagomenal-6').map((e) => `${e.id.replace('kemetic-', '')} ${ymd(e.date)}`);
  // Coptic 1742 (2025/26): five days, 6–10 September 2026.
  assert.deepEqual(epag(new Date(2026, 8, 1), new Date(2026, 8, 30), 'coptic'), [
    'birth-osiris 2026-09-06', 'birth-horus 2026-09-07', 'birth-set 2026-09-08', 'birth-isis 2026-09-09', 'birth-nephthys 2026-09-10',
  ]);
  // Coptic leap year 1743 (2026/27): a sixth day, 11 September 2027, before Nayrouz on the 12th.
  assert.deepEqual(epag(new Date(2027, 8, 1), new Date(2027, 8, 30), 'coptic').slice(-2), ['birth-nephthys 2027-09-10', 'epagomenal-6 2027-09-11']);
  // 1 August: the year holding 29 February 2028 has six.
  assert.equal(epag(new Date(2028, 6, 1), new Date(2028, 6, 31), 'aug1').length, 6);
  assert.equal(epag(new Date(2026, 6, 1), new Date(2026, 6, 31), 'aug1').length, 5);
  const e = KEMETIC_CALENDAR.dateOf(day(2026, 9, 8), ctx('coptic'));
  assert.equal(e.short, 'Birthday of Set · day 3 upon the year');
  assert.equal(e.month, undefined);
});

test('Sirius rises heliacally at Cairo on about 3 August today', () => {
  // Sky & Telescope, “A real scorcher: Sirius at heliacal rising”: for Cairo, the morning of
  // 3 August (2 August under exceptional skies). Real sightings vary by a day or two.
  for (const year of [2024, 2025, 2026, 2027]) {
    const d = heliacalRisingOfSirius(year, CAIRO)!;
    assert.equal(d.getMonth(), 7, ymd(d));
    assert.ok(d.getDate() >= 2 && d.getDate() <= 5, ymd(d));
  }
  // Further south it is seen earlier, further north later (Wikipedia, “Sothic cycle”).
  assert.ok(heliacalRisingOfSirius(2026, ASWAN)!.getTime() < heliacalRisingOfSirius(2026, CAIRO)!.getTime());
  assert.ok(heliacalRisingOfSirius(2026, LONDON)!.getTime() > heliacalRisingOfSirius(2026, CAIRO)!.getTime());
  // In the southern hemisphere it reappears in midwinter, in June.
  assert.equal(heliacalRisingOfSirius(2026, SYDNEY)!.getMonth(), 5);
  // Where Sirius never rises there is no heliacal rising.
  assert.equal(heliacalRisingOfSirius(2026, LONGYEARBYEN), null);
});

test('the Sirius year follows the person’s place, or Cairo', () => {
  const cairo = wepRonpet(2026, ctx('sirius'));
  assert.equal(ymd(cairo), ymd(heliacalRisingOfSirius(2026, CAIRO)!));
  assert.equal(ymd(wepRonpet(2026, ctx())), ymd(cairo)); // Sirius is the default
  assert.match(KEMETIC_CALENDAR.dateOf(day(2026, 10, 16), ctx()).year?.label ?? '', /from Sirius’s rising at Cairo$/);
  assert.match(KEMETIC_CALENDAR.dateOf(day(2026, 10, 16), ctx('sirius', ASWAN)).year?.label ?? '', /from Sirius’s rising here$/);
  // Where it never rises, Cairo stands in.
  assert.equal(ymd(wepRonpet(2026, ctx('sirius', LONGYEARBYEN))), ymd(cairo));
  assert.match(KEMETIC_CALENDAR.dateOf(day(2026, 10, 16), ctx('sirius', LONGYEARBYEN)).year?.label ?? '', /at Cairo$/);
  // Southern hemisphere: the year turns in June.
  const sydney = KEMETIC_CALENDAR.dateOf(day(2026, 6, 30), ctx('sirius', SYDNEY));
  assert.match(sydney.short, /^I Akhet \d+ · Thoth$/);
});

test('across Wep Ronpet: the last epagomenal day, then I Akhet 1', () => {
  const start = wepRonpet(2026, ctx('aug1'));
  assert.equal(ymd(start), '2026-08-01');
  assert.equal(KEMETIC_CALENDAR.dateOf(day(2026, 7, 31), ctx('aug1')).short, 'Birthday of Nephthys · day 5 upon the year');
  const first = KEMETIC_CALENDAR.dateOf(day(2026, 8, 1), ctx('aug1'));
  assert.equal(first.short, 'I Akhet 1 · Thoth');
  assert.ok(first.marks.some((m) => m.name === 'Wep Ronpet'));
  assert.equal(first.year?.label, 'Kemetic year 2026/27, from 1 August');
  // A Gregorian new year falls within IV Akhet / I Peret.
  assert.equal(KEMETIC_CALENDAR.dateOf(day(2027, 1, 1), ctx('aug1')).short, 'II Peret 4 · Mekhir');
  assert.equal(KEMETIC_CALENDAR.dateOf(day(2026, 12, 31), ctx('aug1')).year?.label, 'Kemetic year 2026/27, from 1 August');
});

test('festivals on their civil-calendar days', () => {
  // Wag on I Akhet 18 and Thoth on I Akhet 19 (Medinet Habu; Plutarch, On Isis and Osiris 68);
  // Opet from II Akhet 15 (Thutmose III, 11 days); Khoiak IV Akhet 12–30 (Dendera).
  const events = KEMETIC_CALENDAR.eventsBetween(new Date(2026, 8, 1), new Date(2027, 0, 31), ctx('coptic'));
  const on = (id: string) => events.filter((e) => e.id === `kemetic-${id}`).map((e) => `${ymd(e.date)}x${e.days}`);
  assert.deepEqual(on('wep-ronpet'), ['2026-09-11x1']);
  assert.deepEqual(on('wag'), ['2026-09-28x1']);
  assert.deepEqual(on('thoth'), ['2026-09-29x1']);
  assert.deepEqual(on('opet'), ['2026-10-25x11']);
  assert.deepEqual(on('khoiak'), ['2026-12-21x19']); // 12 Koiak, as the Coptic calendar has it
  assert.ok(events.every((e) => e.id.startsWith('kemetic-')));
  // The Feast of the Valley at the new moon of II Shemu (approximate).
  const valley = KEMETIC_CALENDAR.eventsBetween(new Date(2026, 4, 1), new Date(2026, 6, 31), ctx('coptic')).find((e) => e.id === 'kemetic-valley')!;
  const ii_shemu = kemeticDay(valley.date, ctx('coptic'));
  assert.deepEqual(ii_shemu.kind === 'month' && [ii_shemu.month, ii_shemu.season], [10, 2]);
});

test('the calendar is honest about being a modern alignment', () => {
  assert.equal(KEMETIC_CALENDAR.confidence, 'reconstructed');
  assert.deepEqual(KEMETIC_CALENDAR.choices?.[0].options.map((o) => o.value), ['sirius', 'coptic', 'aug1']);
  assert.match(KEMETIC_CALENDAR.about, /no leap day/);
});
