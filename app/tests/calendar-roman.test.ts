import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TRADITIONS } from '../src/lib/holidays.ts';
import { reckon, ROMAN_CALENDAR, romanAbbreviation } from '../src/lib/calendars/roman.ts';
import type { CalendarContext } from '../src/lib/calendars/types.ts';

const ctx: CalendarContext = { place: null, hemisphere: 'north', options: {} };
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);
const abbr = (y: number, m: number, d: number) => romanAbbreviation(day(y, m, d));

test('Kalends, Nones and Ides fall on the 1st, 5th/7th and 13th/15th', () => {
  // Nones on the 7th and Ides on the 15th in March, May, July, October (Macrobius, Sat. 1.15).
  assert.equal(abbr(2026, 3, 1), 'Kal. Mart.');
  assert.equal(abbr(2026, 3, 7), 'Non. Mart.');
  assert.equal(abbr(2026, 3, 15), 'Id. Mart.'); // the Ides of March
  assert.equal(abbr(2026, 10, 15), 'Id. Oct.'); // the October Horse
  assert.equal(abbr(2026, 1, 5), 'Non. Ian.');
  assert.equal(abbr(2026, 1, 13), 'Id. Ian.');
  assert.equal(abbr(2026, 8, 13), 'Id. Aug.'); // Diana's day
  assert.equal(abbr(2026, 12, 5), 'Non. Dec.'); // Faunus on the Nones of December (Horace, Odes 3.18)
});

test('days are counted down inclusively to the next fixed point', () => {
  // Dates as the Fasti and ancient writers give them (Scullard; Thayer's Calendarium):
  assert.equal(abbr(2026, 10, 16), 'a.d. XVII Kal. Nov.');
  assert.equal(abbr(2026, 12, 17), 'a.d. XVI Kal. Ian.'); // Saturnalia (Macrobius 1.10.2)
  assert.equal(abbr(2026, 4, 21), 'a.d. XI Kal. Mai.'); // Parilia
  assert.equal(abbr(2026, 2, 15), 'a.d. XV Kal. Mart.'); // Lupercalia
  assert.equal(abbr(2026, 3, 17), 'a.d. XVI Kal. Apr.'); // Liberalia
  assert.equal(abbr(2026, 2, 23), 'a.d. VII Kal. Mart.'); // Terminalia
  assert.equal(abbr(2026, 1, 2), 'a.d. IV Non. Ian.');
  assert.equal(abbr(2026, 3, 2), 'a.d. VI Non. Mart.');
  assert.equal(abbr(2026, 3, 14), 'prid. Id. Mart.');
  assert.equal(abbr(2026, 1, 4), 'prid. Non. Ian.');
  assert.equal(abbr(2026, 1, 14), 'a.d. XIX Kal. Feb.');
  assert.equal(abbr(2026, 12, 14), 'a.d. XIX Kal. Ian.');
  // Across the year boundary: 31 December is the day before the January Kalends.
  assert.equal(abbr(2026, 12, 31), 'prid. Kal. Ian.');
  assert.equal(abbr(2027, 1, 1), 'Kal. Ian.');
  // 30-day months count from the 30th.
  assert.equal(abbr(2026, 4, 30), 'prid. Kal. Mai.');
  assert.equal(abbr(2026, 4, 14), 'a.d. XVIII Kal. Mai.');
});

test('leap-year February: the sixth day before the March Kalends is said twice', () => {
  // Censorinus, De Die Natali 20: the added day follows the Terminalia, so in a leap
  // year a.d. VI–pridie fall on the 25th–29th (Wikipedia, “Julian calendar”).
  assert.equal(abbr(2024, 2, 14), 'a.d. XVI Kal. Mart.'); // unchanged before the leap day
  assert.equal(abbr(2023, 2, 14), 'a.d. XVI Kal. Mart.');
  assert.equal(abbr(2024, 2, 23), 'a.d. VII Kal. Mart.');
  assert.equal(abbr(2024, 2, 24), 'a.d. bis VI Kal. Mart.');
  assert.equal(abbr(2024, 2, 25), 'a.d. VI Kal. Mart.');
  assert.equal(abbr(2024, 2, 28), 'a.d. III Kal. Mart.');
  assert.equal(abbr(2024, 2, 29), 'prid. Kal. Mart.');
  // Common years.
  assert.equal(abbr(2023, 2, 24), 'a.d. VI Kal. Mart.');
  assert.equal(abbr(2023, 2, 28), 'prid. Kal. Mart.');
  // Century rules: 1900 was not a leap year, 2000 was.
  assert.equal(abbr(1900, 2, 28), 'prid. Kal. Mart.');
  assert.equal(abbr(2000, 2, 24), 'a.d. bis VI Kal. Mart.');
  assert.equal(reckon(day(2024, 2, 24)).kind, 'before');
  assert.match(ROMAN_CALENDAR.dateOf(day(2024, 2, 24), ctx).long, /^Ante diem bis VI Kalendas Martias: .*leap day/);
});

test('the date reads in Latin and English, with the year from the founding of Rome', () => {
  const date = ROMAN_CALENDAR.dateOf(day(2026, 10, 16), ctx);
  assert.equal(date.short, 'a.d. XVII Kal. Nov.');
  assert.match(date.long, /^Ante diem XVII Kalendas Novembres: the 17th day before the Kalends of November/);
  assert.equal(date.year?.label, '2779 AUC'); // 753 BCE = 1 AUC, so 1 CE = 754 AUC
  assert.equal(date.month?.name, 'October');
  assert.equal(ROMAN_CALENDAR.dateOf(day(2026, 3, 15), ctx).short, 'Ides of March');
  assert.equal(ROMAN_CALENDAR.dateOf(day(2026, 3, 1), ctx).short, 'Kalends of March');
  assert.match(ROMAN_CALENDAR.dateOf(day(2026, 3, 14), ctx).long, /^Pridie Idus Martias: the day before the Ides of March/);
});

test('marks: dies atri, the Allia and the open mundus', () => {
  const names = (y: number, m: number, d: number) => ROMAN_CALENDAR.dateOf(day(y, m, d), ctx).marks.map((x) => x.name);
  assert.ok(names(2026, 1, 2).includes('Dies ater')); // day after the Kalends (Gellius 5.17)
  assert.ok(names(2026, 3, 8).includes('Dies ater')); // day after the March Nones
  assert.ok(names(2026, 1, 14).includes('Dies ater')); // day after the Ides
  assert.ok(!names(2026, 1, 3).includes('Dies ater'));
  assert.ok(names(2026, 7, 18).includes('Dies Alliensis'));
  for (const [m, d] of [[8, 24], [10, 5], [11, 8]]) assert.ok(names(2026, m, d).includes('Mundus patet')); // Macrobius 1.16.18
  assert.ok(names(2026, 4, 1).includes('Kalends'));
  assert.ok(names(2026, 4, 1).includes('Veneralia'));
});

test('festivals fall on their Fasti dates, and late-February ones move in a leap year', () => {
  const events = ROMAN_CALENDAR.eventsBetween(new Date(2026, 0, 1), new Date(2026, 11, 31, 23, 59), ctx);
  const on = (id: string) => events.filter((e) => e.id === `roman-${id}`).map((e) => `${ymd(e.date)}x${e.days}`);
  // Dates: Scullard, Festivals and Ceremonies of the Roman Republic; Wikipedia, “Roman festivals”.
  assert.deepEqual(on('agonalia'), ['2026-01-09x1']);
  assert.deepEqual(on('carmentalia'), ['2026-01-11x1']);
  assert.deepEqual(on('caristia'), ['2026-02-22x1']);
  assert.deepEqual(on('regifugium'), ['2026-02-24x1']);
  assert.deepEqual(on('equirria'), ['2026-02-27x1']);
  assert.deepEqual(on('quinquatrus'), ['2026-03-19x5']);
  assert.deepEqual(on('veneralia'), ['2026-04-01x1']);
  assert.deepEqual(on('megalesia'), ['2026-04-04x7']);
  assert.deepEqual(on('cerialia'), ['2026-04-12x8']); // Ludi Ceriales 12–19 April
  assert.deepEqual(on('vinalia'), ['2026-04-23x1']);
  assert.deepEqual(on('mercuralia'), ['2026-05-15x1']);
  assert.deepEqual(on('fors-fortuna'), ['2026-06-24x1']);
  assert.deepEqual(on('ludi-apollinares'), ['2026-07-06x8']);
  assert.deepEqual(on('diana'), ['2026-08-13x1']);
  assert.deepEqual(on('vinalia-rustica'), ['2026-08-19x1']);
  assert.deepEqual(on('ludi-plebeii'), ['2026-11-04x14']);
  assert.deepEqual(on('divalia'), ['2026-12-21x1']);
  // In a leap year the bissextile day comes first, so a.d. VI and a.d. III Kal. Mart. move.
  const leap = ROMAN_CALENDAR.eventsBetween(new Date(2024, 1, 1), new Date(2024, 1, 29, 23, 59), ctx);
  const leapOn = (id: string) => leap.filter((e) => e.id === `roman-${id}`).map((e) => ymd(e.date));
  assert.deepEqual(leapOn('terminalia'), ['2024-02-23']);
  assert.deepEqual(leapOn('regifugium'), ['2024-02-25']);
  assert.deepEqual(leapOn('equirria'), ['2024-02-28']);
});

test('across the new year, and multi-day festivals already under way', () => {
  const events = ROMAN_CALENDAR.eventsBetween(new Date(2026, 11, 20), new Date(2027, 0, 12, 23, 59), ctx);
  assert.deepEqual(
    events.map((e) => `${e.id} ${ymd(e.date)}`),
    ['roman-divalia 2026-12-21', 'roman-larentalia 2026-12-23', 'roman-compitalia 2027-01-03', 'roman-agonalia 2027-01-09', 'roman-carmentalia 2027-01-11'],
  );
  // The Ludi Romani (4–19 September) show when asked about the 10th.
  const mid = ROMAN_CALENDAR.eventsBetween(new Date(2026, 8, 10), new Date(2026, 8, 10, 23, 59), ctx);
  assert.deepEqual(mid.map((e) => `${e.id} ${ymd(e.date)}x${e.days}`), ['roman-ludi-romani 2026-09-04x16']);
});

test('no festival repeats one already in the Roman holidays', () => {
  const roman = TRADITIONS.find((c) => c.id === 'roman')!;
  const holidayWords = new Set(roman.holidays.map((h) => h.name.split(' ')[0].toLowerCase()));
  const events = ROMAN_CALENDAR.eventsBetween(new Date(2026, 0, 1), new Date(2026, 11, 31, 23, 59), ctx);
  for (const e of events) assert.ok(!holidayWords.has(e.name.split(' ')[0].toLowerCase()), e.name);
  assert.equal(new Set(events.map((e) => e.id)).size, events.length);
  assert.ok(events.every((e) => e.id.startsWith('roman-')));
});

test('the calendar is the same in both hemispheres', () => {
  const south: CalendarContext = { place: { latitude: -33.9, longitude: 151.2 }, hemisphere: 'south', options: {} };
  assert.deepEqual(ROMAN_CALENDAR.dateOf(day(2026, 6, 24), south), ROMAN_CALENDAR.dateOf(day(2026, 6, 24), ctx));
});
