import assert from 'node:assert/strict';
import { test } from 'node:test';

import { firstDayOfSummer, firstDayOfWinter, hasSumarauki, ICELANDIC_CALENDAR, icelandicDay } from '../src/lib/calendars/icelandic.ts';
import type { CalendarContext } from '../src/lib/calendars/types.ts';

const ctx: CalendarContext = { place: null, hemisphere: 'north', options: {} };
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);
const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

test('sumardagurinn fyrsti is the first Thursday after 18 April', () => {
  // Vísindavefurinn, https://www.visindavefur.is/svar.php?id=65157 (from the almanac's rule).
  assert.equal(ymd(firstDayOfSummer(2023)), '2023-04-20');
  assert.equal(ymd(firstDayOfSummer(2024)), '2024-04-25');
  assert.equal(ymd(firstDayOfSummer(2025)), '2025-04-24');
  assert.equal(ymd(firstDayOfSummer(2026)), '2026-04-23');
  assert.equal(ymd(firstDayOfSummer(2029)), '2029-04-19');
  for (let y = 1900; y <= 2100; y++) {
    const d = firstDayOfSummer(y);
    assert.equal(d.getDay(), 4);
    assert.ok(d.getMonth() === 3 && d.getDate() >= 19 && d.getDate() <= 25, ymd(d));
  }
});

test('fyrsti vetrardagur, the first day of winter, on its published dates', () => {
  // is.wikipedia.org/wiki/Fyrsti_vetrardagur: “21.–27. október, nema í rímspillisárum, þá
  // 28. október”, and its table for 2025–2037.
  const published: Record<number, string> = {
    2025: '10-25', 2026: '10-24', 2027: '10-23', 2028: '10-21', 2029: '10-27', 2030: '10-26', 2031: '10-25',
    2032: '10-23', 2033: '10-22', 2034: '10-21', 2035: '10-27', 2036: '10-25', 2037: '10-24',
  };
  for (const [year, date] of Object.entries(published)) assert.equal(ymd(firstDayOfWinter(Number(year))), `${year}-${date}`);
  // 2023 was a rímspillisár: summer 2024 began on 25 April in a leap year.
  assert.equal(ymd(firstDayOfWinter(2023)), '2023-10-28');
  for (let y = 1900; y <= 2100; y++) {
    const d = firstDayOfWinter(y);
    assert.equal(d.getDay(), 6);
    assert.ok(d.getMonth() === 9 && d.getDate() >= 21 && d.getDate() <= 28, ymd(d));
  }
});

test('sumarauki: the leap week falls in 2023 and 2029, and follows the almanac’s rule', () => {
  // Vísindavefurinn, https://www.visindavefur.is/svar.php?id=69821: “Sumarauka var síðast skotið
  // inn árið 2023 og verður næst gert árið 2029”, and the rule: years ending on a Monday, or
  // on a Sunday when a leap year follows.
  assert.equal(hasSumarauki(2023), true);
  for (const y of [2024, 2025, 2026, 2027, 2028]) assert.equal(hasSumarauki(y), false, String(y));
  assert.equal(hasSumarauki(2029), true);
  for (let y = 1800; y <= 2400; y++) {
    const dow = new Date(y, 11, 31).getDay();
    assert.equal(hasSumarauki(y), dow === 1 || (dow === 0 && isLeap(y + 1)), String(y));
  }
});

test('Þorri and Góa: bóndadagur and konudagur', () => {
  // Bóndadagur is the Friday of the 13th week of winter, 19–25 January, or 26 January after
  // a rímspillisár; konudagur the Sunday of the 18th week, 18–25 February (almanak.hi.is;
  // islensktalmanak.is/dagar/konudagur).
  const firstOf = (month: string, from: Date, to: Date) => {
    for (let d = from; d <= to; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 12)) {
      const p = icelandicDay(d).place;
      if (p.kind === 'month' && p.month.name === month && p.day === 1) return d;
    }
    return null;
  };
  assert.equal(ymd(firstOf('Þorri', day(2024, 1, 15), day(2024, 1, 31))!), '2024-01-26');
  assert.equal(ymd(firstOf('Þorri', day(2025, 1, 15), day(2025, 1, 31))!), '2025-01-24');
  assert.equal(ymd(firstOf('Þorri', day(2026, 1, 15), day(2026, 1, 31))!), '2026-01-23');
  assert.equal(ymd(firstOf('Þorri', day(2027, 1, 15), day(2027, 1, 31))!), '2027-01-22');
  assert.equal(ymd(firstOf('Góa', day(2024, 2, 15), day(2024, 2, 29))!), '2024-02-25');
  assert.equal(ymd(firstOf('Góa', day(2026, 2, 15), day(2026, 2, 28))!), '2026-02-22');
  const thorri = ICELANDIC_CALENDAR.dateOf(day(2026, 1, 23), ctx);
  assert.equal(thorri.short, 'Þorri 1 · week 13 of winter');
  assert.ok(thorri.marks.some((m) => m.name === 'Bóndadagur'));
  assert.ok(ICELANDIC_CALENDAR.dateOf(day(2026, 2, 22), ctx).marks.some((m) => m.name === 'Konudagur'));
  assert.ok(ICELANDIC_CALENDAR.dateOf(day(2026, 2, 21), ctx).marks.some((m) => m.name === 'Þorraþræll'));
});

test('every month begins on its own weekday, every year', () => {
  const weekdays: Record<string, number> = {
    Harpa: 4, Skerpla: 6, Sólmánuður: 1, Heyannir: 0, Tvímánuður: 2, Haustmánuður: 4,
    Gormánuður: 6, Ýlir: 1, Mörsugur: 3, Þorri: 5, Góa: 0, Einmánuður: 2,
  };
  const seen = new Set<string>();
  for (let d = day(2020, 4, 1); d.getFullYear() < 2031; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 12)) {
    const p = icelandicDay(d).place;
    if (p.kind !== 'month' || p.day !== 1) continue;
    assert.equal(d.getDay(), weekdays[p.month.name], `${p.month.name} ${ymd(d)}`);
    seen.add(p.month.name);
  }
  assert.equal(seen.size, 12);
});

test('the four extra nights, and the leap week after them in 2023', () => {
  // Summer 2026 (from 23 April): three months of 30 days, aukanætur 22–25 July, Heyannir from Sunday 26 July.
  const aukanaetur2026 = ICELANDIC_CALENDAR.eventsBetween(new Date(2026, 6, 1), new Date(2026, 7, 31), ctx).filter((e) => e.id === 'icelandic-aukanaetur');
  assert.deepEqual(aukanaetur2026.map((e) => `${ymd(e.date)}x${e.days}`), ['2026-07-22x4']);
  assert.equal(ICELANDIC_CALENDAR.dateOf(day(2026, 7, 26), ctx).short, 'Heyannir 1 · week 14 of summer');
  // 2023: aukanætur 19–22 July, sumarauki 23–29 July, Heyannir from Sunday 30 July.
  const y2023 = ICELANDIC_CALENDAR.eventsBetween(new Date(2023, 6, 1), new Date(2023, 7, 15), ctx);
  assert.deepEqual(
    y2023.map((e) => `${e.id} ${ymd(e.date)}x${e.days}`),
    ['icelandic-aukanaetur 2023-07-19x4', 'icelandic-sumarauki 2023-07-23x7', 'icelandic-heyannir 2023-07-30x1'],
  );
  assert.equal(ICELANDIC_CALENDAR.dateOf(day(2023, 7, 23), ctx).short, 'Sumarauki 1 · week 14 of summer');
  assert.equal(ICELANDIC_CALENDAR.dateOf(day(2023, 7, 30), ctx).short, 'Heyannir 1 · week 15 of summer');
  assert.match(ICELANDIC_CALENDAR.dateOf(day(2023, 7, 30), ctx).year?.label ?? '', /with sumarauki/);
});

test('across the turn of the year and of the seasons', () => {
  // Last day of winter and first of summer 2026.
  const last = ICELANDIC_CALENDAR.dateOf(day(2026, 4, 22), ctx);
  assert.equal(last.short, 'Einmánuður 30 · week 26 of winter');
  assert.ok(last.marks.some((m) => m.name === 'Síðasti vetrardagur'));
  assert.equal(last.year?.label, 'Icelandic year 2025/26');
  const first = ICELANDIC_CALENDAR.dateOf(day(2026, 4, 23), ctx);
  assert.equal(first.short, 'Harpa 1 · week 1 of summer');
  assert.equal(first.year?.label, 'Icelandic year 2026/27');
  // New Year's Day sits in Mörsugur.
  assert.equal(ICELANDIC_CALENDAR.dateOf(day(2027, 1, 1), ctx).month?.name, 'Mörsugur');
  // The rímspillir winter: Gormánuður from 28 October 2023.
  assert.equal(ICELANDIC_CALENDAR.dateOf(day(2023, 10, 28), ctx).short, 'Gormánuður 1 · week 1 of winter');
  // That summer had sumarauki, 191 days: 27 weeks and a Thursday and Friday.
  assert.equal(ICELANDIC_CALENDAR.dateOf(day(2023, 10, 27), ctx).short, 'Haustmánuður 30 · week 28 of summer');
  assert.equal(ICELANDIC_CALENDAR.dateOf(day(2026, 10, 23), ctx).short, 'Haustmánuður 30 · week 27 of summer');
});

test('events: month starts, without the days already in the Norse holidays', () => {
  const events = ICELANDIC_CALENDAR.eventsBetween(new Date(2026, 0, 1), new Date(2026, 11, 31), ctx);
  const ids = events.map((e) => `${e.id} ${ymd(e.date)}`);
  assert.ok(ids.includes('icelandic-konudagur 2026-02-22'));
  assert.ok(ids.includes('icelandic-einmanudur 2026-03-24'));
  assert.ok(ids.includes('icelandic-skerpla 2026-05-23'));
  assert.ok(ids.includes('icelandic-ylir 2026-11-23'));
  assert.ok(ids.includes('icelandic-morsugur 2026-12-23'));
  // Sumardagurinn fyrsti, fyrsti vetrardagur and bóndadagur are holidays.ts's (Norse) already.
  assert.ok(!events.some((e) => ['icelandic-sumardagurinn-fyrsti', 'icelandic-fyrsti-vetrardagur', 'icelandic-bondadagur'].includes(e.id)));
  assert.ok(events.every((e) => e.id.startsWith('icelandic-')));
});

test('the Icelandic months stay Icelandic in the southern hemisphere', () => {
  const south: CalendarContext = { place: { latitude: -41.3, longitude: 174.8 }, hemisphere: 'south', options: {} };
  assert.deepEqual(ICELANDIC_CALENDAR.dateOf(day(2026, 10, 16), south), ICELANDIC_CALENDAR.dateOf(day(2026, 10, 16), ctx));
});
