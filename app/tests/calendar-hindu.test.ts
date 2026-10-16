import assert from 'node:assert/strict';
import { test } from 'node:test';

import { HINDU_CALENDAR, lahiriAyanamsa, tithiAt } from '../src/lib/calendars/hindu.ts';
import type { CalendarContext } from '../src/lib/calendars/types.ts';

// Published dates below are from Drik Panchang (drikpanchang.com) for New
// Delhi, cross-checked with other panchangs (dekhopanchang.com, Brut, GoodReturns)
// where noted. Tests run with ordinary local dates (y, m - 1, d).

const DELHI: CalendarContext = { place: { latitude: 28.6139, longitude: 77.209 }, hemisphere: 'north', options: {} };
const UJJAIN_DEFAULT: CalendarContext = { place: null, hemisphere: 'north', options: {} };
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function eventDates(id: string, from: Date, to: Date, ctx: CalendarContext) {
  return HINDU_CALENDAR.eventsBetween(from, to, ctx).filter((e) => e.id === id).map((e) => ymd(e.date));
}

test('Lahiri ayanamsa is about 24°12′ at the start of 2025', () => {
  // Swiss Ephemeris / Rashtriya Panchang: Lahiri ≈ 24°12′ on 2025-01-01.
  const a = lahiriAyanamsa(new Date('2025-01-01T00:00:00Z'));
  assert.ok(Math.abs(a - 24.2) < 0.03, `${a}`);
});

test('tithi follows the Moon–Sun elongation', () => {
  // New moon 2025-10-21 12:25 UTC: Amavasya just before, Pratipada just after.
  assert.equal(tithiAt(new Date('2025-10-21T11:00:00Z')), 30);
  assert.equal(tithiAt(new Date('2025-10-21T14:00:00Z')), 1);
  // Full moon 2025-11-05 13:19 UTC.
  assert.equal(tithiAt(new Date('2025-11-05T12:00:00Z')), 15);
  assert.equal(tithiAt(new Date('2025-11-05T15:00:00Z')), 16);
});

test('Ganesh Chaturthi, Navaratri and Diwali match the published 2025 and 2026 dates', () => {
  for (const ctx of [DELHI, UJJAIN_DEFAULT]) {
    const from = new Date(2025, 0, 1);
    const to = new Date(2026, 11, 31);
    // Ganesh Chaturthi: 27 Aug 2025 and 14 Sep 2026 (Drik Panchang; Brut, dekhopanchang for 2026).
    assert.deepEqual(eventDates('hindu-ganesh-chaturthi', from, to, ctx), ['2025-08-27', '2026-09-14']);
    // Sharad Navaratri Ghatasthapana: 22 Sep 2025 and 11 Oct 2026.
    assert.deepEqual(eventDates('hindu-navaratri', from, to, ctx), ['2025-09-22', '2026-10-11']);
    // Diwali Lakshmi Puja: 20 Oct 2025 and 8 Nov 2026 (Amavasya 11:27 8 Nov – 12:31 9 Nov 2026 IST).
    assert.deepEqual(eventDates('hindu-diwali', from, to, ctx), ['2025-10-20', '2026-11-08']);
  }
});

test('adhika months: Adhika Shravana 2023 and Adhika Jyeshtha 2026', () => {
  // 2023: Adhika Shravana 18 Jul – 16 Aug (amānta). 2026: Adhika Jyeshtha 17 May – 15 Jun.
  assert.equal(HINDU_CALENDAR.dateOf(day(2023, 7, 18), DELHI).month?.name, 'Adhika Shravana');
  assert.equal(HINDU_CALENDAR.dateOf(day(2023, 8, 16), DELHI).month?.name, 'Adhika Shravana');
  assert.equal(HINDU_CALENDAR.dateOf(day(2023, 8, 17), DELHI).month?.name, 'Shravana');
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 5, 16), DELHI).month?.name, 'Vaishakha');
  const first = HINDU_CALENDAR.dateOf(day(2026, 5, 17), DELHI);
  assert.equal(first.month?.name, 'Adhika Jyeshtha');
  assert.match(first.long, /adhika \(extra\) month/);
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 6, 15), DELHI).month?.name, 'Adhika Jyeshtha');
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 6, 16), DELHI).month?.name, 'Jyeshtha');
});

test('the lunar year turns at Chaitra Shukla Pratipada (Ugadi / Gudi Padwa)', () => {
  // Ugadi 2025: 30 March; Vikram Samvat 2082 begins.
  const ugadi = HINDU_CALENDAR.dateOf(day(2025, 3, 30), DELHI);
  assert.equal(ugadi.short, 'Chaitra Shukla 1 · Pratipada');
  assert.equal(ugadi.year?.label, 'Vikram Samvat 2082 · Shaka 1947');
  assert.equal(HINDU_CALENDAR.dateOf(day(2025, 3, 29), DELHI).month?.name, 'Phalguna');
  // Ugadi 2026 is 19 March: Pratipada begins after sunrise and ends before the
  // next one (a kshaya tithi), so the 19th still carries Amavasya at sunrise
  // and says the Pratipada is skipped; the 20th is Chaitra Shukla Dwitiya.
  const skip = HINDU_CALENDAR.dateOf(day(2026, 3, 19), DELHI);
  assert.equal(skip.short, 'Phalguna Krishna 15 · Amavasya');
  assert.match(skip.long, /Pratipada tithi begins and ends before the next sunrise/);
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 3, 20), DELHI).short, 'Chaitra Shukla 2 · Dwitiya');
  // Across the Gregorian new year the samvat doesn't change.
  assert.equal(HINDU_CALENDAR.dateOf(day(2025, 12, 31), DELHI).year?.label, 'Vikram Samvat 2082 · Shaka 1947');
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 1, 1), DELHI).year?.label, 'Vikram Samvat 2082 · Shaka 1947');
});

test('pūrṇimānta gives the dark fortnight the next month’s name', () => {
  // 8 Nov 2026 (Diwali eve's day): Ashvin Krishna Chaturdashi amānta = Kartika Krishna Chaturdashi pūrṇimānta.
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 11, 8), DELHI).short, 'Ashvin Krishna 14 · Chaturdashi');
  const north = { ...DELHI, options: { hinduMonths: 'purnimanta' } };
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 11, 8), north).short, 'Kartika Krishna 14 · Chaturdashi');
  // The bright fortnight is named the same either way.
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 10, 16), north).short, 'Ashvin Shukla 6 · Shashthi');
  // The adhika month is the same span in both schemes (17 May – 15 Jun 2026),
  // set between the dark half (2–16 May) and bright half (16–29 Jun) of nija Jyeshtha.
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 5, 10), north).month?.name, 'Jyeshtha');
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 5, 25), north).month?.name, 'Adhika Jyeshtha');
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 6, 10), north).month?.name, 'Adhika Jyeshtha');
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 6, 20), north).month?.name, 'Jyeshtha');
});

test('Ekadashi and Sankashti in the second half of 2025 match Drik Panchang (Smarta)', () => {
  const from = new Date(2025, 5, 1);
  const to = new Date(2025, 11, 31);
  const ekadashi = [
    ...eventDates('hindu-ekadashi-shukla', from, to, DELHI),
    ...eventDates('hindu-ekadashi-krishna', from, to, DELHI),
  ].sort();
  // Nirjala 6 Jun, Yogini 21 Jun (a kshaya Ekadashi, kept the day it begins),
  // Devshayani 6 Jul, Kamika 21 Jul, Shravana Putrada 5 Aug, Aja 19 Aug,
  // Parsva 3 Sep, Indira 17 Sep, Papankusha 3 Oct, Rama 17 Oct, Utpanna 15 Nov,
  // Mokshada 1 Dec, Saphala 15 Dec, Pausha Putrada 30 Dec.
  // Devutthana falls on 2 Nov here: the Vaishnava date. Drik's Smarta date is
  // 1 Nov (by the Dashami-viddha rules this simple sunrise rule doesn't model).
  assert.deepEqual(ekadashi, [
    '2025-06-06', '2025-06-21', '2025-07-06', '2025-07-21', '2025-08-05', '2025-08-19', '2025-09-03',
    '2025-09-17', '2025-10-03', '2025-10-17', '2025-11-02', '2025-11-15', '2025-12-01', '2025-12-15', '2025-12-30',
  ]);
  // Sankashti Chaturthi (at moonrise): 14 Jun, 14 Jul, 12 Aug, 10 Sep,
  // 10 Oct (Karwa Chauth, Chaturthi slips between two moonrises), 8 Nov, 7 Dec.
  assert.deepEqual(eventDates('hindu-sankashti-chaturthi', from, to, DELHI), [
    '2025-06-14', '2025-07-14', '2025-08-12', '2025-09-10', '2025-10-10', '2025-11-08', '2025-12-07',
  ]);
  // Karwa Chauth 2026: 29 Oct.
  assert.deepEqual(eventDates('hindu-sankashti-chaturthi', new Date(2026, 9, 1), new Date(2026, 9, 31), DELHI), ['2026-10-29']);
});

test('the day is named by local sunrise, so places can differ', () => {
  // On 8 Nov 2026, Amavasya begins 11:27 IST (05:57 UTC): after sunrise in
  // Delhi but before sunrise in New York (UTC−5).
  const ny = { place: { latitude: 40.71, longitude: -74.0 }, hemisphere: 'north' as const, options: {} };
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 11, 8), DELHI).day, 14);
  assert.equal(HINDU_CALENDAR.dateOf(day(2026, 11, 8), ny).day, 15);
  assert.match(HINDU_CALENDAR.dateOf(day(2026, 11, 8), ny).short, /Amavasya/);
  // Southern hemisphere works the same way (Sydney).
  const sydney = { place: { latitude: -33.87, longitude: 151.21 }, hemisphere: 'south' as const, options: {} };
  assert.match(HINDU_CALENDAR.dateOf(day(2026, 11, 8), sydney).short, /^Ashvin Krishna 14/);
  // Default place is Ujjain, and it says so.
  assert.match(HINDU_CALENDAR.dateOf(day(2026, 11, 8), UJJAIN_DEFAULT).long, /sunrise in Ujjain/);
  // A far-north place in polar night still gives an answer.
  const tromso = { place: { latitude: 69.65, longitude: 18.96 }, hemisphere: 'north' as const, options: {} };
  assert.ok(HINDU_CALENDAR.dateOf(day(2026, 12, 21), tromso).short.length > 0);
});

test('Pradosh is marked only when asked for', () => {
  const from = new Date(2026, 9, 1);
  const to = new Date(2026, 9, 31);
  assert.equal(eventDates('hindu-pradosh-shukla', from, to, DELHI).length, 0);
  const shown = { ...DELHI, options: { hinduPradosh: 'show' } };
  const pradosh = [...eventDates('hindu-pradosh-shukla', from, to, shown), ...eventDates('hindu-pradosh-krishna', from, to, shown)];
  assert.ok(pradosh.length >= 2 && pradosh.length <= 3, pradosh.join());
});

test('every date says to confirm festivals locally', () => {
  const d = HINDU_CALENDAR.dateOf(day(2026, 10, 16), DELHI);
  assert.equal(d.calendar, 'hindu');
  assert.match(d.long, /confirm with a local panchang/);
  for (const e of HINDU_CALENDAR.eventsBetween(new Date(2026, 8, 1), new Date(2026, 10, 30), DELHI)) {
    assert.match(e.meaning, /local panchang or temple/);
    assert.match(e.id, /^hindu-/);
  }
});
