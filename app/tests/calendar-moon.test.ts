// The moon's months (src/lib/calendars/moon.ts).
//
// Phase times are pinned to the US Naval Observatory's 2026 table
// (https://aa.usno.navy.mil/api/moon/phases/year?year=2026, times in UT):
//   new moons   Jan 18 19:52 · Sep 11 03:27 · Oct 10 15:50 · Nov 9 07:02 · Dec 9 00:52
//   full moons  May 1 17:23 · May 31 08:45 · Sep 26 16:49 · Oct 26 04:12
// Blue Moons: Sky & Telescope gives seasonal Blue Moons on 22 Aug 2021,
// 19 Aug 2024 and 20 May 2027 (https://skyandtelescope.org/astronomy-resources/what-is-a-blue-moon/);
// 31 Aug 2023 and 31 May 2026 are second full moons in a calendar month.
// Each test file runs in its own process, so the time zone set here holds.
process.env.TZ = 'UTC';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fullMoonName, isMonthlyBlueMoon, isSeasonalBlueMoon, lunationOf, MOON_CALENDAR } from '../src/lib/calendars/moon.ts';
import type { CalendarContext } from '../src/lib/calendars/types.ts';

const MINUTE = 60_000;
const ctx = (options: Record<string, string> = {}, hemisphere: 'north' | 'south' = 'north'): CalendarContext => ({ place: null, hemisphere, options });
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);
const near = (actual: Date, iso: string, minutes = 5) =>
  assert.ok(Math.abs(actual.getTime() - Date.parse(iso)) <= minutes * MINUTE, `${actual.toISOString()} vs ${iso}`);

test('lunations run from the new moon’s day (USNO 2026)', () => {
  const l = lunationOf(day(2026, 10, 16));
  near(l.newMoon, '2026-10-10T15:50:00Z');
  near(l.full, '2026-10-26T04:12:00Z');
  assert.equal(l.start.getTime(), new Date(2026, 9, 10).getTime());
  assert.equal(l.next.getTime(), new Date(2026, 10, 9).getTime());
  near(lunationOf(day(2026, 1, 20)).newMoon, '2026-01-18T19:52:00Z');
});

test('today, 16 Oct 2026: day 7 of the Hunter’s Moon, the tenth moon of the year', () => {
  const date = MOON_CALENDAR.dateOf(day(2026, 10, 16), ctx());
  assert.equal(date.short, 'Hunter’s Moon · day 7');
  assert.equal(date.day, 7);
  assert.equal(date.month?.index, 10);
  assert.equal(date.month?.days, 30);
  assert.match(date.long, /7th day of the Hunter’s Moon, the tenth moon of the year/);
  assert.match(date.year?.label ?? '', /from Jan 18, 2026/);
});

test('numbered names give “Moon 10 · day 7”', () => {
  const date = MOON_CALENDAR.dateOf(day(2026, 10, 16), ctx({ names: 'numbered' }));
  assert.equal(date.short, 'Moon 10 · day 7');
  assert.equal(date.month?.name, 'Tenth Moon');
  assert.match(date.long, /Tenth Moon, the Hunter’s Moon/);
});

test('marks: new moon on day 1, dark moon on the last day, full and quarters on their days', () => {
  assert.deepEqual(MOON_CALENDAR.dateOf(day(2026, 10, 10), ctx()).marks.map((m) => m.name), ['New Moon']);
  const last = MOON_CALENDAR.dateOf(day(2026, 10, 9), ctx());
  assert.equal(last.day, 29);
  assert.deepEqual(last.marks.map((m) => m.name), ['Dark Moon']);
  assert.deepEqual(MOON_CALENDAR.dateOf(day(2026, 10, 26), ctx()).marks.map((m) => m.name), ['Full Moon']);
  assert.deepEqual(MOON_CALENDAR.dateOf(day(2026, 10, 18), ctx()).marks.map((m) => m.name), ['First Quarter']);
  assert.deepEqual(MOON_CALENDAR.dateOf(day(2026, 11, 1), ctx()).marks.map((m) => m.name), ['Last Quarter']);
});

test('the lunar year begins at the first new moon on or after the winter solstice', () => {
  // Solstice 21 Dec 2025; the 20 Dec 2025 new moon came just before it.
  const first = MOON_CALENDAR.dateOf(day(2026, 1, 18), ctx());
  assert.equal(first.month?.index, 1);
  assert.equal(first.day, 1);
  assert.equal(MOON_CALENDAR.dateOf(day(2026, 1, 17), ctx()).month?.index, 13);
  // 9 Dec 2026 is before the 21 Dec solstice: still the twelfth moon; the year turns on 7 Jan 2027.
  assert.equal(MOON_CALENDAR.dateOf(day(2026, 12, 25), ctx()).month?.index, 12);
  const next = MOON_CALENDAR.dateOf(day(2027, 1, 7), ctx());
  assert.equal(next.month?.index, 1);
  assert.match(next.year?.label ?? '', /from Jan 7, 2027/);
});

test('other year starts: after the spring equinox, after Samhain', () => {
  // Equinox 20 Mar 2026 → first new moon 17 Apr; Oct 10 is the seventh.
  assert.equal(MOON_CALENDAR.dateOf(day(2026, 10, 16), ctx({ yearStart: 'spring-equinox' })).month?.index, 7);
  // From 1 Nov 2025 → 20 Nov 2025; Oct 10 2026 is the twelfth, and 9 Nov 2026 begins the next year.
  assert.equal(MOON_CALENDAR.dateOf(day(2026, 10, 16), ctx({ yearStart: 'samhain' })).month?.index, 12);
  assert.equal(MOON_CALENDAR.dateOf(day(2026, 11, 9), ctx({ yearStart: 'samhain' })).month?.index, 1);
});

test('southern hemisphere: the year from the June solstice, names turned six months', () => {
  // Solstice 21 Jun 2026 → first new moon 14 Jul; Oct 10 is the fourth.
  const date = MOON_CALENDAR.dateOf(day(2026, 10, 16), ctx({}, 'south'));
  assert.equal(date.month?.index, 4);
  assert.equal(date.month?.name, 'Pink Moon');
  // The southern Harvest Moon is the full moon nearest the March equinox: 2 Apr 2026.
  assert.equal(fullMoonName(lunationOf(day(2026, 4, 2)).full, true).name, 'Harvest Moon');
  assert.equal(fullMoonName(lunationOf(day(2026, 7, 29)).full, true).name, 'Wolf Moon');
});

test('folk names through 2026 (north)', () => {
  const name = (y: number, m: number, d: number) => fullMoonName(lunationOf(day(y, m, d)).full, false).name;
  assert.equal(name(2026, 1, 3), 'Wolf Moon');
  assert.equal(name(2026, 2, 1), 'Snow Moon');
  assert.equal(name(2026, 3, 3), 'Worm Moon');
  assert.equal(name(2026, 6, 29), 'Strawberry Moon');
  assert.equal(name(2026, 8, 28), 'Sturgeon Moon');
  // The full moon nearest the 23 Sep equinox is 26 Sep: the Harvest Moon, then the Hunter's.
  assert.equal(name(2026, 9, 26), 'Harvest Moon');
  assert.equal(name(2026, 10, 26), 'Hunter’s Moon');
  assert.equal(name(2026, 11, 24), 'Beaver Moon');
  assert.equal(name(2026, 12, 24), 'Cold Moon');
  // 2025: the Harvest Moon fell on 7 Oct, so 7 Sep was the Corn Moon.
  assert.equal(name(2025, 9, 7), 'Corn Moon');
  assert.equal(name(2025, 10, 7), 'Harvest Moon');
});

test('Blue Moons: seasonal by default, second-in-a-month by choice', () => {
  const full = (y: number, m: number, d: number) => lunationOf(day(y, m, d)).full;
  for (const [y, m, d] of [[2021, 8, 22], [2024, 8, 19], [2027, 5, 20]]) {
    assert.ok(isSeasonalBlueMoon(full(y, m, d)), `${y}-${m}-${d} seasonal`);
    assert.equal(fullMoonName(full(y, m, d), false).name, 'Blue Moon');
  }
  assert.equal(fullMoonName(full(2024, 8, 19), false).month, 'Sturgeon Moon');
  for (const [y, m, d] of [[2023, 8, 31], [2026, 5, 31]]) {
    assert.ok(isMonthlyBlueMoon(full(y, m, d)));
    assert.ok(!isSeasonalBlueMoon(full(y, m, d)));
    assert.equal(fullMoonName(full(y, m, d), false, 'monthly').name, 'Blue Moon');
  }
  // By the seasonal rule, 31 May 2026 is a second Flower Moon, and says it is a monthly Blue Moon.
  const may31 = MOON_CALENDAR.dateOf(day(2026, 5, 31), ctx());
  assert.equal(may31.month?.name, 'Flower Moon');
  assert.match(may31.month?.meaning ?? '', /many now call a Blue Moon/);
  assert.deepEqual(MOON_CALENDAR.dateOf(day(2024, 8, 19), ctx()).marks.map((m) => m.name), ['Full Moon', 'Blue Moon']);
  assert.equal(MOON_CALENDAR.dateOf(day(2026, 5, 31), ctx({ blue: 'monthly' })).month?.name, 'Blue Moon');
});

test('eventsBetween: each month’s first day and its full moon, with stable ids', () => {
  const events = MOON_CALENDAR.eventsBetween(new Date(2026, 9, 1), new Date(2026, 10, 30), ctx());
  assert.deepEqual(
    events.map((e) => [e.id, e.name]),
    [
      ['moon-new-2026-10-10', 'Hunter’s Moon begins'],
      ['moon-full-2026-10-26', 'Hunter’s Moon · full moon'],
      ['moon-new-2026-11-09', 'Beaver Moon begins'],
      ['moon-full-2026-11-24', 'Beaver Moon · full moon'],
    ],
  );
  for (const e of events) assert.equal(e.calendar, 'moon');
  const newYear = MOON_CALENDAR.eventsBetween(new Date(2027, 0, 1), new Date(2027, 0, 10), ctx());
  assert.equal(newYear[0].id, 'moon-new-2027-01-07');
  assert.match(newYear[0].name, /lunar new year/);
});

test('every day of 2024 (a leap year) and 2026 falls in exactly one 29- or 30-day month', () => {
  for (const year of [2024, 2026]) {
    let previous = MOON_CALENDAR.dateOf(new Date(year, 0, 1, 12), ctx());
    for (let i = 1; i < 366 + (year === 2024 ? 1 : 0); i++) {
      const date = MOON_CALENDAR.dateOf(new Date(year, 0, 1 + i, 12), ctx());
      assert.ok(date.month && (date.month.days === 29 || date.month.days === 30), `${year} day ${i}`);
      if (date.day === 1) assert.ok(previous.day === 29 || previous.day === 30);
      else assert.equal(date.day, (previous.day ?? 0) + 1);
      previous = date;
    }
  }
});

test('the day boundary is local: the 9 Dec 2026 00:52 UT new moon is 8 Dec in New York', () => {
  process.env.TZ = 'America/New_York';
  try {
    assert.equal(MOON_CALENDAR.dateOf(new Date(2026, 11, 8, 12), ctx()).day, 1);
    assert.equal(MOON_CALENDAR.dateOf(new Date(2026, 11, 9, 12), ctx()).day, 2);
  } finally {
    process.env.TZ = 'UTC';
  }
  assert.equal(MOON_CALENDAR.dateOf(new Date(2026, 11, 9, 12), ctx()).day, 1);
});
