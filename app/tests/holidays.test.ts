import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildToday } from '../src/lib/today.ts';
import { atticYear, holidayChoice, holidayDay, holidaysBetween, nextHoliday, parseCustomHolidays, TRADITIONS } from '../src/lib/holidays.ts';

const day = (y: number, m: number, d: number) => new Date(y, m, d).getTime();
const only = (...traditions: string[]) => ({ traditions, custom: [] });

test('every holiday in every calendar has a name and a meaning', () => {
  for (const tradition of TRADITIONS) {
    assert.ok(tradition.holidays.length > 0, tradition.id);
    for (const holiday of tradition.holidays) {
      assert.ok(holiday.name.trim() && holiday.meaning.length > 40, `${tradition.id}/${holiday.id}`);
    }
  }
  // And every calendar yields dates, year after year.
  for (const year of [2026, 2030, 2045]) {
    for (const tradition of TRADITIONS) {
      const list = holidaysBetween(new Date(year, 0, 1), new Date(year, 11, 31), only(tradition.id));
      assert.ok(list.length >= Math.min(tradition.holidays.length, 4) - 1, `${tradition.id} ${year}: ${list.length}`);
    }
  }
});

test('Wheel of the Year, north and south', () => {
  const north = holidaysBetween(new Date(2026, 0, 1), new Date(2026, 11, 31), only('wheel'));
  assert.deepEqual(north.map((h) => h.name), ['Imbolc', 'Ostara', 'Beltane', 'Litha', 'Lammas', 'Mabon', 'Samhain', 'Yule']);
  assert.equal(north[1].date.getDate(), 20); // the 2026 equinox
  const south = holidaysBetween(new Date(2026, 0, 1), new Date(2026, 11, 31), only('wheel_south'));
  assert.equal(south.find((h) => h.name === 'Samhain')!.date.getMonth(), 3);
  assert.equal(south.find((h) => h.name === 'Yule')!.date.getMonth(), 5);
  assert.equal(south.find((h) => h.name === 'Beltane')!.date.getMonth(), 9);
});

test('Norse dates follow the Icelandic weekday rules', () => {
  const list = holidaysBetween(new Date(2027, 0, 1), new Date(2027, 11, 31), only('norse'));
  const at = (name: string) => list.find((h) => h.name.startsWith(name))!.date;
  assert.equal(at('Þorrablót').getTime(), day(2027, 0, 22)); // Friday 19–25 January
  assert.equal(at('Þorrablót').getDay(), 5);
  assert.equal(at('Sigrblót').getDay(), 4); // Thursday 19–25 April
  assert.ok(at('Sigrblót').getDate() >= 19 && at('Sigrblót').getDate() <= 25);
  assert.equal(at('Winter Nights').getDay(), 6); // Saturday 21–27 October
  assert.ok(at('Winter Nights').getDate() >= 21 && at('Winter Nights').getDate() <= 27);
  assert.equal(at('Dísablót').getMonth(), 1);
  assert.equal(list.find((h) => h.name.startsWith('Yule'))!.days, 12);
});

test('the Attic calendar starts at the first new moon after the summer solstice', () => {
  for (const year of [2026, 2027, 2028, 2029]) {
    const months = atticYear(year);
    assert.ok(months.length === 12 || months.length === 13);
    assert.equal(months[0].name, 'Hekatombaion');
    assert.ok(months[0].start.getMonth() === 5 || months[0].start.getMonth() === 6);
    if (months.length === 13) assert.equal(months[6].name, 'Poseideon II');
    for (const month of months) {
      const length = Math.round((month.next.getTime() - month.start.getTime()) / 86_400_000);
      assert.ok(length === 29 || length === 30, `${year} ${month.name} ${length}`);
    }
  }
  // 2026–27: Pyanepsion begins Oct 11, so the Thesmophoria (11th) is Oct 21.
  const fall = holidaysBetween(new Date(2026, 9, 1), new Date(2026, 9, 31), only('hellenic'));
  assert.equal(fall.find((h) => h.name === 'Thesmophoria')!.date.getTime(), day(2026, 9, 21));
  // Hekate's Deipnon on the new moon (Oct 10, 2026), Noumenia the next day.
  const monthly = holidaysBetween(new Date(2026, 9, 9), new Date(2026, 9, 12), only('hellenic_monthly'));
  assert.deepEqual(
    monthly.map((h) => [h.name, h.date.getDate()]),
    [['Hekate’s Deipnon', 10], ['Noumenia', 11], ['Agathos Daimon', 12]],
  );
});

test('holidays shared by calendars appear once; custom ones are yours', () => {
  const both = holidaysBetween(new Date(2026, 9, 30), new Date(2026, 10, 2), only('wheel', 'celtic'));
  const samhain = both.filter((h) => h.name.startsWith('Samhain'));
  assert.equal(samhain.length, 1);
  assert.deepEqual(samhain[0].traditions, ['Wheel of the Year', 'Celtic fire festivals']);

  const choice = holidayChoice({
    calendar_traditions: 'custom,nonsense',
    calendar_custom_holidays: JSON.stringify([{ id: 'a', name: 'My dedication', month: 2, day: 14, meaning: 'The day I began.' }, { name: '' }]),
  });
  assert.deepEqual(choice.traditions, ['custom']);
  assert.equal(choice.custom.length, 1);
  const next = nextHoliday(new Date(2027, 0, 1), choice)!;
  assert.equal(next.name, 'My dedication');
  assert.equal(next.date.getTime(), day(2027, 2, 14));
  assert.deepEqual(next.traditions, ['Your calendar']);
  assert.deepEqual(parseCustomHolidays('not json'), []);
  assert.deepEqual(holidayChoice({}).traditions, ['wheel']);
  assert.deepEqual(holidayChoice({ calendar_traditions: '' }).traditions, []);
});

test('a running festival counts its days; Today shows the next moon phase and holiday', () => {
  const saturnalia = nextHoliday(new Date(2026, 11, 19), only('roman'))!;
  assert.equal(saturnalia.name, 'Saturnalia');
  assert.equal(holidayDay(saturnalia, new Date(2026, 11, 19, 15)), 3);

  const today = buildToday(new Date(2026, 11, 19, 15), only('roman'));
  assert.equal(today.holidayWhen, 'Day 3 of 7');
  assert.equal(today.horizon[0].kind, 'moon');
  assert.equal(today.horizon[1].kind, 'holiday');
  assert.equal(today.horizon[1].title, 'Saturnalia');

  const none = buildToday(new Date(2026, 11, 19, 15), only());
  assert.equal(none.holiday, null);
  assert.equal(none.horizon.length, 1);
});

test('your own calendar: one-time events and single holidays picked from any calendar', () => {
  const choice = holidayChoice({
    calendar_traditions: 'wheel,custom',
    calendar_custom_holidays: JSON.stringify([
      { id: 'a', name: 'Coven gathering', month: 10, day: 7, meaning: '', year: 2026 },
      { id: 'b', name: 'My dedication', month: 2, day: 14, meaning: 'The day I began.' },
    ]),
    calendar_picked_holidays: 'norse/thorrablot,hellenic/eleusinia,wheel/samhain,nonsense/x',
  });
  assert.deepEqual(choice.picked, ['norse/thorrablot', 'hellenic/eleusinia', 'wheel/samhain', 'nonsense/x']);

  const list = holidaysBetween(new Date(2026, 9, 1), new Date(2027, 9, 30), choice);
  const names = list.map((h) => h.name);
  // One-time events show only in their year; yearly ones every year.
  assert.equal(names.filter((n) => n === 'Coven gathering').length, 1);
  assert.equal(list.find((h) => h.name === 'Coven gathering')!.date.getTime(), day(2026, 10, 7));
  assert.ok(names.includes('My dedication'));
  // Picked holidays appear with the calendar they come from…
  const thorrablot = list.find((h) => h.name === 'Þorrablót')!;
  assert.deepEqual(thorrablot.traditions, ['Norse & Heathen']);
  assert.ok(list.some((h) => h.name === 'Eleusinian Mysteries' && h.days === 9));
  // …but only those: the rest of those calendars stays off.
  assert.ok(!names.includes('Winter Nights (Vetrnætur)'));
  assert.ok(!names.includes('Panathenaia'));
  // A pick from a calendar already on whole doesn't double up.
  assert.equal(names.filter((n) => n === 'Samhain').length, 1);
  const next2027 = holidaysBetween(new Date(2027, 10, 1), new Date(2027, 10, 30), choice);
  assert.ok(!next2027.some((h) => h.name === 'Coven gathering'));

  // Picks only count while your own calendar is on.
  const off = holidaysBetween(new Date(2027, 0, 1), new Date(2027, 1, 1), { ...choice, traditions: ['wheel'] });
  assert.ok(!off.some((h) => h.name === 'Þorrablót'));
});
