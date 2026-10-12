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
  assert.ok([20, 21].includes(north[1].date.getDate())); // the 2026 equinox (Mar 21 in New Zealand)
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
  // (A day later where the new moon falls after local midnight, as in East Asia.)
  const thesmophoria = fall.find((h) => h.name === 'Thesmophoria')!.date.getTime();
  assert.ok(thesmophoria === day(2026, 9, 21) || thesmophoria === day(2026, 9, 22));
  // Hekate's Deipnon on the new moon (Oct 10, 2026), Noumenia the next day.
  const monthly = holidaysBetween(new Date(2026, 9, 9), new Date(2026, 9, 13), only('hellenic_monthly'));
  const deipnon = monthly.find((h) => h.name === 'Hekate’s Deipnon')!.date.getDate();
  assert.ok(deipnon === 10 || deipnon === 11);
  assert.deepEqual(
    monthly.slice(0, 3).map((h) => [h.name, h.date.getDate() - deipnon]),
    [['Hekate’s Deipnon', 0], ['Noumenia', 1], ['Agathos Daimon', 2]],
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

  // During Saturnalia: it shows today (with its day count); the horizon shows the next one.
  const today = buildToday(new Date(2026, 11, 19, 15), only('roman'));
  assert.deepEqual(today.holidaysToday.map((h) => h.name), ['Saturnalia']);
  assert.deepEqual(today.holidayWhen, ['Day 3 of 7']);
  assert.equal(today.horizon[0].kind, 'moon');
  assert.equal(today.horizon[1].kind, 'holiday');
  assert.equal(today.horizon[1].title, 'Dies Natalis Solis Invicti');

  // On an ordinary day nothing shows for today, but the horizon still has the next holiday.
  const ordinary = buildToday(new Date(2026, 9, 12, 12), only('wheel'));
  assert.deepEqual(ordinary.holidaysToday, []);
  assert.equal(ordinary.horizon[1].title, 'Samhain');
  // Exact at 04:13 UTC on Oct 26, so Oct 25 in the Americas.
  assert.match(ordinary.nextSyzygyLine, /^Full Moon in Taurus · Hunter’s Moon · Oct 2[56]$/);
  assert.match(ordinary.illuminationLine, /^\d+% illuminated$/);

  // On the day itself the holiday is today's, and the horizon moves on to the next.
  const samhain = buildToday(new Date(2026, 9, 31, 9), only('wheel'));
  assert.deepEqual(samhain.holidaysToday.map((h) => h.name), ['Samhain']);
  assert.deepEqual(samhain.holidayWhen, ['Today']);
  assert.equal(samhain.horizon[1].title, 'Yule');

  const none = buildToday(new Date(2026, 11, 19, 15), only());
  assert.deepEqual(none.holidaysToday, []);
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

test('prompts are worded for how often a holiday comes round', async () => {
  const { journalPrompt } = await import('../src/lib/dayInfo.ts');
  const at = (y: number, m: number, d: number) => new Date(y, m, d, 12);
  const noumenia = holidaysBetween(at(2026, 9, 9), at(2026, 9, 13), only('hellenic_monthly')).find((h) => h.name === 'Noumenia')!;
  assert.equal(noumenia.recurs, 'monthly');
  const monthly = journalPrompt(noumenia.date, 'Waxing Crescent', [noumenia]);
  assert.match(monthly, /this month/);
  assert.doesNotMatch(monthly, /year/);

  const samhain = holidaysBetween(at(2026, 9, 31), at(2026, 9, 31), only('wheel'))[0];
  assert.equal(samhain.recurs, 'yearly');
  assert.match(journalPrompt(samhain.date, 'Waning Gibbous', [samhain]), /this year/);

  const saturnalia = holidaysBetween(at(2026, 11, 19), at(2026, 11, 19), only('roman'))[0];
  assert.equal(journalPrompt(at(2026, 11, 19), 'Full Moon', [saturnalia]), 'It’s day 3 of Saturnalia. How will you keep it today?');

  // A yearly holiday speaks for the day over a monthly one on the same day.
  assert.match(journalPrompt(noumenia.date, 'Waxing Crescent', [noumenia, samhain]), /Samhain/);
});

test('your own events can repeat every week, month or year, or happen once', async () => {
  const events = [
    { id: 'w', name: 'Coven night', month: 9, day: 2, meaning: '', year: 2026, repeat: 'weekly' },
    { id: 'm', name: 'Full-month offering', month: 0, day: 31, meaning: '', repeat: 'monthly' },
    { id: 'o', name: 'Handfasting', month: 10, day: 7, meaning: '', year: 2026, repeat: 'once' },
    { id: 'y', name: 'Dedication', month: 2, day: 14, meaning: '' },
  ];
  const choice = holidayChoice({ calendar_traditions: 'custom', calendar_custom_holidays: JSON.stringify(events) });
  const list = holidaysBetween(new Date(2026, 9, 1), new Date(2026, 11, 31), choice);
  const coven = list.filter((h) => h.name === 'Coven night');
  assert.ok(coven.length >= 12 && coven.every((h) => h.date.getDay() === 5 && h.recurs === 'weekly')); // Fridays from Oct 2
  assert.equal(coven[0].date.getTime(), day(2026, 9, 2));
  const monthly = list.filter((h) => h.name === 'Full-month offering');
  assert.deepEqual(monthly.map((h) => h.date.getMonth()), [9, 11]); // no Nov 31
  assert.equal(list.filter((h) => h.name === 'Handfasting').length, 1);
  assert.equal(list.find((h) => h.name === 'Handfasting')!.recurs, 'once');
  // Older saved events: a year means once, no year means yearly.
  const legacy = holidayChoice({ calendar_traditions: 'custom', calendar_custom_holidays: JSON.stringify([{ name: 'Old', month: 1, day: 2, year: 2027 }]) });
  assert.equal(holidaysBetween(new Date(2027, 0, 1), new Date(2027, 11, 31), legacy)[0].recurs, 'once');
});

test('Christian calendar: Easter and the moveable feasts', async () => {
  const { easterSunday } = await import('../src/lib/holidays.ts');
  const { liturgicalSeason, traditionDay } = await import('../src/lib/traditionDay.ts');
  const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  assert.equal(ymd(easterSunday(2024)), '2024-3-31');
  assert.equal(ymd(easterSunday(2026)), '2026-4-5');
  assert.equal(ymd(easterSunday(2027)), '2027-3-28');
  assert.equal(ymd(easterSunday(2038)), '2038-4-25');

  const choice = { traditions: ['christian'], custom: [] };
  const names = (from: Date, to: Date) => holidaysBetween(from, to, choice).map((h) => h.name);
  assert.deepEqual(names(new Date(2026, 1, 18), new Date(2026, 1, 18)), ['Ash Wednesday']);
  assert.deepEqual(names(new Date(2026, 4, 24), new Date(2026, 4, 24)), ['Pentecost']);
  assert.deepEqual(names(new Date(2026, 10, 29), new Date(2026, 10, 29)), ['Advent Sunday']);
  assert.ok(TRADITIONS.some((t) => t.id === 'christian') && !holidayChoice({}).traditions.includes('christian'), 'listed, but off by default');

  assert.equal(liturgicalSeason(new Date(2026, 2, 1)), 'Lent');
  assert.equal(liturgicalSeason(new Date(2026, 3, 2)), 'Holy Week');
  assert.equal(liturgicalSeason(new Date(2026, 3, 20)), 'Eastertide');
  assert.equal(liturgicalSeason(new Date(2026, 6, 1)), 'Ordinary Time');
  assert.equal(liturgicalSeason(new Date(2026, 11, 5)), 'Advent');
  assert.equal(liturgicalSeason(new Date(2027, 0, 2)), 'Christmastide');
  assert.equal(traditionDay(new Date(2026, 11, 25), 'christian')?.line, 'Christmas · Christmastide');
});

test('a hidden calendar is gone everywhere', () => {
  const shown = holidayChoice({ calendar_traditions: 'wheel,christian,custom', calendar_picked_holidays: 'christian/easter,norse/yule' });
  assert.deepEqual(shown.traditions, ['wheel', 'christian', 'custom']);
  const hidden = holidayChoice({
    calendar_traditions: 'wheel,christian,custom',
    calendar_picked_holidays: 'christian/easter,norse/yule',
    calendar_hidden_traditions: 'christian',
  });
  assert.deepEqual(hidden.traditions, ['wheel', 'custom']);
  assert.deepEqual(hidden.picked, ['norse/yule']);
  assert.equal(holidaysBetween(new Date(2026, 11, 25), new Date(2026, 11, 25), hidden).filter((h) => h.name === 'Christmas').length, 0);
});
