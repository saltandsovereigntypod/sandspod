import assert from 'node:assert/strict';
import { test } from 'node:test';

// Month starts hang on the hour of the new moon, so fix the zone (as calendar-moon does).
process.env.TZ = 'UTC';

const { MOON_CALENDAR, lunarYearOf, lunationOf } = await import('../src/lib/calendars/moon.ts');
const { atticYear } = await import('../src/lib/holidays.ts');
const { colignyMonth } = await import('../src/lib/calendars/coligny.ts');
const { lunarMonthAt } = await import('../src/lib/calendars/hindu.ts');
const { calendarChoices, calendarContext, choiceViews, todayLines, leadLine } = await import('../src/lib/calendars/index.ts');
type CalendarContext = import('../src/lib/calendars/types.ts').CalendarContext;

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const ctx = (options: Record<string, string> = {}, hemisphere: 'north' | 'south' = 'north'): CalendarContext => ({ place: null, hemisphere, options });

test('the year begins as the Attic calendar: the new moon before Hekatombaion 1, in 2026 and 2027', () => {
  for (const year of [2026, 2027]) {
    const hekatombaion = atticYear(year)[0];
    assert.equal(hekatombaion.name, 'Hekatombaion');
    const lunar = lunarYearOf(day(year, 9, 1), 'attic', false);
    // The moon's day 1 is the new moon's day; the Attic Noumenia is the day after.
    assert.equal(ymd(addDays(lunar.start.start, 1)), ymd(hekatombaion.start), `${year}`);
    assert.equal(lunar.months.length, atticYear(year).length, `${year}: as many moons as Attic months`);
  }
  // Hekatombaion 2026 begins 15 July (new moon 14 July 09:43 UT); 2027's on 4 July (new moon 3 July).
  assert.equal(ymd(lunarYearOf(day(2026, 9, 1), 'attic', false).start.start), '2026-07-14');
  assert.equal(ymd(atticYear(2027)[0].start), '2027-07-05');
  assert.equal(ymd(lunarYearOf(day(2027, 9, 1), 'attic', false).start.start), '2027-07-04');
});

test('the Attic months line up with the Attic calendar, Poseideon II and all', () => {
  const options = { names: 'attic', yearStart: 'attic' };
  for (const span of [...atticYear(2025), ...atticYear(2026)]) {
    // The day before the Noumenia is the moon's day 1 of the same month; the Noumenia its day 2.
    const before = MOON_CALENDAR.dateOf(addDays(span.start, -1), ctx(options));
    assert.equal(before.month?.name, span.name, ymd(span.start));
    assert.equal(before.day, 1);
    assert.equal(MOON_CALENDAR.dateOf(span.start, ctx(options)).day, 2);
  }
  const first = MOON_CALENDAR.dateOf(day(2026, 7, 14), ctx(options));
  assert.equal(first.short, 'Hekatombaion · day 1');
  assert.equal(first.month?.index, 1);
  // 2025–26 had thirteen months.
  assert.match(MOON_CALENDAR.dateOf(day(2026, 1, 1), ctx(options)).year?.label ?? '', /13 moons/);
  assert.equal(MOON_CALENDAR.dateOf(day(2026, 1, 1), ctx(options)).month?.name, 'Poseideon II');
});

test('Attic names with the winter-solstice year: numbered from midwinter, named as Athens', () => {
  const date = MOON_CALENDAR.dateOf(day(2026, 8, 1), ctx({ names: 'attic' }));
  assert.equal(date.month?.name, 'Hekatombaion');
  assert.notEqual(date.month?.index, 1);
});

test('the Coligny months and year follow the Coligny calendar’s own choices', () => {
  for (const coligny of [{} as Record<string, string>, { colignyPhase: 'new' }, { colignyPhase: 'full', colignySeason: 'autumn' }]) {
    const c = ctx({ names: 'coligny', yearStart: 'coligny' });
    c.related = { coligny: ctx(coligny) };
    for (let d = day(2026, 1, 15); d.getTime() < day(2027, 12, 31).getTime(); d = addDays(d, 29)) {
      const l = lunationOf(d);
      const fullDay = new Date(l.full.getFullYear(), l.full.getMonth(), l.full.getDate(), 12);
      const own = colignyMonth(fullDay, ctx(coligny));
      const date = MOON_CALENDAR.dateOf(d, c);
      assert.equal(date.month?.name, own.info.name, `${JSON.stringify(coligny)} ${ymd(d)}`);
      if (own.info.name === 'Samonios') assert.equal(date.month?.index, 1, `${JSON.stringify(coligny)} ${ymd(d)} begins the year`);
    }
  }
});

test('the Hindu months and Chaitra new year', () => {
  const options = { names: 'hindu', yearStart: 'hindu' };
  // Chaitra 2026 begins at the new moon of 19 March 2026 (Ugadi / Gudi Padwa 19 March, Drik Panchang).
  const lunar = lunarYearOf(day(2026, 6, 1), 'hindu', false);
  assert.equal(ymd(lunar.start.start), '2026-03-19');
  // 2026 has an Adhika Jyeshtha (17 May – 15 June), so thirteen moons.
  assert.equal(lunar.months.length, 13);
  assert.equal(MOON_CALENDAR.dateOf(day(2026, 3, 20), ctx(options)).short, 'Chaitra · day 2');
  assert.equal(MOON_CALENDAR.dateOf(day(2026, 5, 25), ctx(options)).month?.name, 'Adhika Jyeshtha');
  for (let d = day(2026, 1, 10); d.getTime() < day(2027, 12, 31).getTime(); d = addDays(d, 29)) {
    const l = lunationOf(d);
    const m = lunarMonthAt(l.full);
    assert.ok(MOON_CALENDAR.dateOf(d, ctx(options)).month?.name.endsWith(['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashvin', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'][m.index]));
  }
});

test('a followed calendar counts only while it is shown, and falls back with a word', () => {
  const settings: Record<string, unknown> = { calendar_count_by: 'moon', calendar_extra: 'attic', calendar_opt_moon_yearStart: 'attic', calendar_opt_moon_names: 'attic' };
  assert.deepEqual(calendarChoices(settings, 'moon'), { names: 'attic', southNames: 'turned', yearStart: 'attic', blue: 'seasonal' });
  const views = choiceViews(settings, 'moon');
  const yearStart = views.find((v) => v.key === 'yearStart')!;
  assert.deepEqual(yearStart.options.map((o) => o.value), ['winter-solstice', 'spring-equinox', 'samhain', 'attic']);
  assert.equal(yearStart.hint, '');
  assert.equal(yearStart.fallback, '');
  assert.match(views.find((v) => v.key === 'southNames')!.aside, /another calendar’s names/);
  assert.equal(leadLine(day(2026, 7, 20), settings, null), 'Hekatombaion · day 7');

  // Attic turned off: the saved choice stays, but the defaults count, and Settings says so.
  const off = { ...settings, calendar_extra: '' };
  assert.deepEqual(calendarChoices(off, 'moon'), { names: 'folk', southNames: 'turned', yearStart: 'winter-solstice', blue: 'seasonal' });
  const offViews = choiceViews(off, 'moon');
  const offYear = offViews.find((v) => v.key === 'yearStart')!;
  assert.deepEqual(offYear.options.map((o) => o.value), ['winter-solstice', 'spring-equinox', 'samhain']);
  assert.match(offYear.hint, /Also show/);
  assert.match(offYear.fallback, /Attic \(Athenian\) calendar isn’t shown/);
  assert.equal(leadLine(day(2026, 7, 20), off, null), 'Buck Moon · day 7');
  assert.equal(todayLines(day(2026, 7, 20), off, null)[0].short, 'Buck Moon · day 7');
});

test('old settings read as before', () => {
  const settings = { calendar_count_by: 'moon', calendar_opt_moon_yearStart: 'samhain', calendar_opt_moon_names: 'numbered' };
  assert.deepEqual(calendarChoices(settings, 'moon'), { names: 'numbered', southNames: 'turned', yearStart: 'samhain', blue: 'seasonal' });
  assert.equal(calendarContext(settings, null, 'moon').related, undefined);
  for (const view of choiceViews(settings, 'moon')) assert.equal(view.fallback, '');
});

test('the followed calendar’s own choices reach the moon', () => {
  const settings = { calendar_count_by: 'moon', calendar_extra: 'coligny', calendar_opt_moon_names: 'coligny', calendar_opt_coligny_colignyPhase: 'new' };
  assert.deepEqual(calendarContext(settings, null, 'moon').related?.coligny?.options.colignyPhase, 'new');
});
