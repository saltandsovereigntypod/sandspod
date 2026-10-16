import assert from 'node:assert/strict';
import { test } from 'node:test';

import { julianDateOf, orthodoxEaster, SLAVIC_CALENDAR } from '../src/lib/calendars/slavic.ts';
import type { CalendarContext } from '../src/lib/calendars/types.ts';

const ctx = (slavicLanguage?: string): CalendarContext => ({ place: null, hemisphere: 'north', options: slavicLanguage ? { slavicLanguage } : {} });
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

test('Julian date is 13 days behind this century, 12 before 1 March 1900 and 14 from 1 March 2100', () => {
  // Old Style / New Style concordance (Wikipedia, “Old Style and New Style dates”).
  assert.deepEqual(julianDateOf(day(2026, 1, 7)), { year: 2025, month: 12, day: 25 });
  assert.deepEqual(julianDateOf(day(2026, 1, 13)), { year: 2025, month: 12, day: 31 });
  assert.deepEqual(julianDateOf(day(2026, 1, 14)), { year: 2026, month: 1, day: 1 });
  // Leap years differ: 29 Feb 2024 (both leap); Julian 29 Feb 2100 is Gregorian 14 Mar 2100.
  assert.deepEqual(julianDateOf(day(2024, 3, 13)), { year: 2024, month: 2, day: 29 });
  assert.deepEqual(julianDateOf(day(2100, 3, 14)), { year: 2100, month: 2, day: 29 });
  assert.deepEqual(julianDateOf(day(1900, 2, 28)), { year: 1900, month: 2, day: 16 });
  // The October Revolution: 25 Oct 1917 OS = 7 Nov 1917 NS.
  assert.deepEqual(julianDateOf(day(1917, 11, 7)), { year: 1917, month: 10, day: 25 });
});

test('Orthodox Easter by the Julian computus', () => {
  // Published dates: 2024-05-05, 2025-04-20 (shared with the West), 2026-04-12, 2027-05-02.
  assert.equal(ymd(orthodoxEaster(2024)), '2024-05-05');
  assert.equal(ymd(orthodoxEaster(2025)), '2025-04-20');
  assert.equal(ymd(orthodoxEaster(2026)), '2026-04-12');
  assert.equal(ymd(orthodoxEaster(2027)), '2027-05-02');
});

test('month names and meanings in each language', () => {
  const oct = day(2026, 10, 16);
  assert.equal(SLAVIC_CALENDAR.dateOf(oct, ctx()).short, 'Жовтень (Zhovten) 16 · 3 October Old Style');
  assert.equal(SLAVIC_CALENDAR.dateOf(oct, ctx('pl')).month?.name, 'Październik');
  assert.equal(SLAVIC_CALENDAR.dateOf(oct, ctx('cs')).month?.name, 'Říjen');
  assert.equal(SLAVIC_CALENDAR.dateOf(oct, ctx('hr')).month?.name, 'Listopad');
  assert.equal(SLAVIC_CALENDAR.dateOf(oct, ctx('be')).month?.name, 'Кастрычнік');
  assert.equal(SLAVIC_CALENDAR.dateOf(day(2026, 1, 5), ctx()).month?.name, 'Січень');
  assert.match(SLAVIC_CALENDAR.dateOf(day(2026, 1, 5), ctx()).month?.meaning ?? '', /cutting/);
  assert.equal(SLAVIC_CALENDAR.dateOf(day(2026, 1, 5), ctx('pl')).month?.name, 'Styczeń');
  assert.match(SLAVIC_CALENDAR.dateOf(day(2026, 1, 5), ctx('cs')).month?.meaning ?? '', /ice/);
  assert.equal(SLAVIC_CALENDAR.dateOf(day(2026, 11, 2), ctx('cs')).month?.name, 'Listopad');
  assert.equal(SLAVIC_CALENDAR.dateOf(day(2026, 11, 2), ctx('hr')).month?.name, 'Studeni');
  assert.match(SLAVIC_CALENDAR.dateOf(oct, ctx()).long, /Julian calendar \(Old Style\).*3 October 2026/);
  // Across the year boundary the Old Style year lags.
  assert.equal(SLAVIC_CALENDAR.dateOf(day(2026, 1, 10), ctx()).year?.label, '2025 Old Style');
});

test('Old Style feasts fall on their published New Style dates', () => {
  const events = SLAVIC_CALENDAR.eventsBetween(new Date(2026, 0, 1), new Date(2026, 11, 31), ctx());
  const on = (id: string) => events.filter((e) => e.id === id).map((e) => ymd(e.date));
  assert.deepEqual(on('slavic-sviatvechir'), ['2026-01-06']);
  assert.deepEqual(on('slavic-rizdvo'), ['2026-01-07']);
  assert.deepEqual(on('slavic-shchedryi-vechir'), ['2026-01-13']);
  assert.deepEqual(on('slavic-old-new-year'), ['2026-01-14']);
  assert.deepEqual(on('slavic-vodokhreshche'), ['2026-01-19']);
  assert.deepEqual(on('slavic-stritennia'), ['2026-02-15']);
  assert.deepEqual(on('slavic-yuri'), ['2026-05-06']);
  assert.deepEqual(on('slavic-kupala-old-style'), ['2026-07-06']);
  assert.equal(events.find((e) => e.id === 'slavic-kupala-old-style')?.days, 2);
  assert.deepEqual(on('slavic-illia'), ['2026-08-02']);
  assert.deepEqual(on('slavic-makovei'), ['2026-08-14']);
  assert.deepEqual(on('slavic-apple-spas'), ['2026-08-19']);
  assert.deepEqual(on('slavic-pokrova'), ['2026-10-14']);
  assert.deepEqual(on('slavic-andrii'), ['2026-12-12']);
  assert.deepEqual(on('slavic-mykolai'), ['2026-12-19']);
  // Movable: Pascha 12 Apr 2026, Radunytsia 21 Apr, Trinity 31 May.
  assert.deepEqual(on('slavic-pascha'), ['2026-04-12']);
  assert.deepEqual(on('slavic-radunytsia'), ['2026-04-21']);
  assert.deepEqual(on('slavic-zeleni-sviata'), ['2026-05-31']);
  for (const e of events) assert.match(e.id, /^slavic-/);
});

test('no duplicate of the New Style Kupala Night already in holidays', () => {
  const events = SLAVIC_CALENDAR.eventsBetween(new Date(2026, 5, 1), new Date(2026, 6, 31), ctx());
  assert.ok(!events.some((e) => ymd(e.date) === '2026-06-23'));
  const kupala = events.find((e) => e.id === 'slavic-kupala-old-style');
  assert.match(kupala?.meaning ?? '', /23 June/);
});

test('a range across the new year finds the Christmas Eve that began it', () => {
  const events = SLAVIC_CALENDAR.eventsBetween(new Date(2026, 11, 30), new Date(2027, 0, 20), ctx());
  assert.deepEqual(events.map((e) => `${e.id} ${ymd(e.date)}`), [
    'slavic-sviatvechir 2027-01-06',
    'slavic-rizdvo 2027-01-07',
    'slavic-shchedryi-vechir 2027-01-13',
    'slavic-old-new-year 2027-01-14',
    'slavic-vodokhreshche 2027-01-19',
  ]);
});

test('marks on the day, including the second night of Kupala', () => {
  assert.deepEqual(SLAVIC_CALENDAR.dateOf(day(2026, 1, 6), ctx()).marks.map((m) => m.name), ['Sviatvechir (Holy Evening)']);
  assert.deepEqual(SLAVIC_CALENDAR.dateOf(day(2026, 7, 7), ctx()).marks.map((m) => m.name), ['Ivan Kupala (Old Style)']);
  assert.deepEqual(SLAVIC_CALENDAR.dateOf(day(2026, 7, 8), ctx()).marks, []);
  assert.match(SLAVIC_CALENDAR.dateOf(day(2026, 8, 2), ctx()).marks[0].meaning, /Perun.*argued over/);
});
