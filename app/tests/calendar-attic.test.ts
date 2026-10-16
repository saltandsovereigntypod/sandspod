import assert from 'node:assert/strict';
import { test } from 'node:test';

// Month starts hang on the hour of the new moon, so fix the zone (as calendar-moon does).
process.env.TZ = 'UTC';

const { ATTIC_CALENDAR, atticDay, olympiad, traditionalDay } = await import('../src/lib/calendars/attic.ts');
const { atticYear, holidaysBetween } = await import('../src/lib/holidays.ts');
type CalendarContext = import('../src/lib/calendars/types.ts').CalendarContext;

const ctx: CalendarContext = { place: null, hemisphere: 'north', options: {} };
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

test('months begin the day after the new moon; Hekatombaion follows the summer solstice', () => {
  // New moons (UT) from USNO, https://aa.usno.navy.mil/api/moon/phases/year?year=2026:
  // 18 Jan 19:52, 17 Feb 12:01, 19 Mar 01:23, 17 Apr 11:52, 16 May 20:01, 15 Jun 02:54,
  // 14 Jul 09:43 (the first after the solstice of 21 June), 12 Aug 17:37, 11 Sep 03:27,
  // 10 Oct 15:50, 9 Nov 07:02, 9 Dec 00:52.
  const starts = [...atticYear(2025), ...atticYear(2026)].map((s) => `${s.name} ${ymd(s.start)}`);
  assert.deepEqual(starts.slice(6), [
    'Poseideon II 2025-12-21',
    'Gamelion 2026-01-19',
    'Anthesterion 2026-02-18',
    'Elaphebolion 2026-03-20',
    'Mounichion 2026-04-18',
    'Thargelion 2026-05-17',
    'Skirophorion 2026-06-16',
    'Hekatombaion 2026-07-15',
    'Metageitnion 2026-08-13',
    'Boedromion 2026-09-12',
    'Pyanepsion 2026-10-11',
    'Maimakterion 2026-11-10',
    'Poseideon 2026-12-10',
    'Gamelion 2027-01-08',
    'Anthesterion 2027-02-07',
    'Elaphebolion 2027-03-09',
    'Mounichion 2027-04-07',
    'Thargelion 2027-05-07',
    'Skirophorion 2027-06-05',
  ]);
});

test('Poseideon II is added when thirteen new moons fall in the year', () => {
  // Hellenion's 2026 calendar also has a second Poseideon running into January 2026
  // (https://www.hellenion.org/wp-content/uploads/2025/11/HellenionCalendar2026.html).
  assert.equal(atticYear(2025).length, 13);
  assert.equal(atticYear(2025)[6].name, 'Poseideon II');
  assert.equal(atticYear(2026).length, 12);
  assert.ok(!atticYear(2026).some((s) => s.name === 'Poseideon II'));
  assert.equal(ATTIC_CALENDAR.dateOf(day(2026, 1, 1), ctx).short, 'Poseideon II 12');
  assert.match(ATTIC_CALENDAR.dateOf(day(2026, 1, 1), ctx).year?.label ?? '', /13 months/);
});

test('the same months as Hellenion’s 2026 calendar, at most a day earlier', () => {
  // Hellenion keeps the Deipnon the day after the dark moon and the Noumenia the day
  // after that; this calendar takes the Noumenia as the day after the new moon.
  const hellenion: [string, string][] = [
    ['Gamelion', '2026-01-20'], ['Anthesterion', '2026-02-19'], ['Elaphebolion', '2026-03-20'], ['Mounichion', '2026-04-19'],
    ['Thargelion', '2026-05-18'], ['Skirophorion', '2026-06-16'], ['Hekatombaion', '2026-07-16'], ['Metageitnion', '2026-08-14'],
    ['Boedromion', '2026-09-12'], ['Pyanepsion', '2026-10-12'], ['Maimakterion', '2026-11-11'], ['Poseideon', '2026-12-10'],
  ];
  for (const [name, date] of hellenion) {
    const [y, m, d] = date.split('-').map(Number);
    const ours = atticDay(day(y, m, d));
    assert.equal(ours.name, name, date);
    assert.ok(ours.day === 1 || ours.day === 2, `${date}: day ${ours.day}`);
  }
});

test('the day names: three decades, the last counted down', () => {
  assert.deepEqual(traditionalDay(1, 30), { greek: 'Noumenia', english: 'the new moon day' });
  assert.equal(traditionalDay(4, 30).greek, 'tetartē histamenou');
  assert.equal(traditionalDay(16, 30).greek, 'hektē epi deka');
  assert.equal(traditionalDay(20, 30).greek, 'eikas');
  assert.equal(traditionalDay(21, 30).greek, 'dekatē phthinontos');
  assert.equal(traditionalDay(29, 30).greek, 'deutera phthinontos');
  assert.equal(traditionalDay(30, 30).greek, 'henē kai nea');
  // A hollow month leaves out the “second of the waning” (Pritchett & Neugebauer).
  assert.equal(traditionalDay(28, 29).greek, 'tritē phthinontos');
  assert.equal(traditionalDay(29, 29).greek, 'henē kai nea');
});

test('Olympiads: 776 BCE is Ol. 1.1, 1 CE is Ol. 195.1, summer 2026 is Ol. 701.2', () => {
  // Hellenion 2026: “the 1st year of the 701st Olympiad until June and the 2nd year from June on”.
  assert.deepEqual(olympiad(-775), { olympiad: 1, year: 1 });
  assert.deepEqual(olympiad(1), { olympiad: 195, year: 1 });
  assert.deepEqual(olympiad(2025), { olympiad: 701, year: 1 });
  assert.deepEqual(olympiad(2026), { olympiad: 701, year: 2 });
  assert.equal(ATTIC_CALENDAR.dateOf(day(2026, 10, 16), ctx).year?.label, 'Attic year 2026/27 · Ol. 701.2');
  // Before Hekatombaion the year is still the old one.
  assert.equal(ATTIC_CALENDAR.dateOf(day(2026, 7, 14), ctx).year?.label, 'Attic year 2025/26 · Ol. 701.1 · 13 months');
});

test('the date, the month’s length, and the year boundary', () => {
  const oct = ATTIC_CALENDAR.dateOf(day(2026, 10, 16), ctx);
  assert.equal(oct.short, 'Pyanepsion 6');
  assert.equal(oct.month?.days, 30);
  assert.match(oct.long, /hektē histamenou/);
  assert.ok(oct.marks.some((m) => m.name === 'Artemis’s day'));
  // The last day of the year, Hekate's Deipnon, then the Noumenia of Hekatombaion.
  const last = ATTIC_CALENDAR.dateOf(day(2026, 7, 14), ctx);
  assert.equal(last.short, 'Skirophorion 29');
  assert.equal(last.month?.days, 29);
  assert.ok(last.marks.some((m) => m.name === 'Hekate’s Deipnon'));
  const first = ATTIC_CALENDAR.dateOf(day(2026, 7, 15), ctx);
  assert.equal(first.short, 'Hekatombaion 1');
  assert.ok(first.marks.some((m) => m.name === 'Noumenia'));
});

test('festival marks agree with the Hellenic holidays, which use the same months', () => {
  const holidays = holidaysBetween(new Date(2026, 6, 1), new Date(2026, 11, 31, 23, 59), { traditions: ['hellenic'], custom: [] });
  for (const h of holidays) {
    const date = ATTIC_CALENDAR.dateOf(new Date(h.date.getFullYear(), h.date.getMonth(), h.date.getDate(), 12), ctx);
    assert.ok(date.marks.some((m) => m.name === h.name), `${h.name} on ${ymd(h.date)}`);
  }
  // The Panathenaia on Hekatombaion 28.
  const pan = holidays.find((h) => h.name === 'Panathenaia')!;
  assert.equal(ATTIC_CALENDAR.dateOf(new Date(pan.date.getFullYear(), pan.date.getMonth(), pan.date.getDate(), 12), ctx).short, 'Hekatombaion 28');
});

test('monthly holy days 3, 4, 6, 7 and 8 are events; 1, 2 and the last are left to the holidays', () => {
  const events = ATTIC_CALENDAR.eventsBetween(new Date(2025, 11, 20), new Date(2026, 0, 31, 23, 59), ctx);
  assert.deepEqual(
    events.map((e) => `${e.id} ${ymd(e.date)}`),
    [
      'attic-athena 2025-12-23', 'attic-tetras 2025-12-24', 'attic-artemis 2025-12-26', 'attic-apollo 2025-12-27', 'attic-poseidon-theseus 2025-12-28',
      'attic-athena 2026-01-21', 'attic-tetras 2026-01-22', 'attic-artemis 2026-01-24', 'attic-apollo 2026-01-25', 'attic-poseidon-theseus 2026-01-26',
    ],
  );
  assert.match(events[0].meaning, /Poseideon II 3/);
  assert.ok(!events.some((e) => /noumenia|agathos|deipnon/.test(e.id)));
});

test('the calendar does not change with the hemisphere', () => {
  const south: CalendarContext = { place: { latitude: -37.8, longitude: 145 }, hemisphere: 'south', options: {} };
  assert.deepEqual(ATTIC_CALENDAR.dateOf(day(2026, 10, 16), south), ATTIC_CALENDAR.dateOf(day(2026, 10, 16), ctx));
});
