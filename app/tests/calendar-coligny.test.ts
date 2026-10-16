import assert from 'node:assert/strict';
import { test } from 'node:test';

// Month starts hang on the hour of the moon's phase, so fix the zone (as calendar-moon does).
process.env.TZ = 'UTC';

const { COLIGNY_CALENDAR, COLIGNY_MONTHS, colignyMonth } = await import('../src/lib/calendars/coligny.ts');
const { TRADITIONAL_CALENDARS } = await import('../src/lib/calendars/registry.ts');
const { sunLongitude } = await import('../src/lib/moon.ts');
type CalendarContext = import('../src/lib/calendars/types.ts').CalendarContext;

const ctx = (options: Record<string, string> = {}, hemisphere: 'north' | 'south' = 'north'): CalendarContext => ({ place: null, hemisphere, options });
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

/** The month starts (excluding TRINVX) between two dates. */
const starts = (from: Date, to: Date, c: CalendarContext) =>
  COLIGNY_CALENDAR.eventsBetween(from, to, c).filter((e) => e.id !== 'coligny-trinvx-samoni');

test('the calendar is in the registry', () => {
  assert.ok(TRADITIONAL_CALENDARS.includes(COLIGNY_CALENDAR));
  assert.equal(TRADITIONAL_CALENDARS.at(-1), COLIGNY_CALENDAR);
});

test('by default, months begin at the first quarter and Samonios after Beltane', () => {
  // First quarters (UT) from USNO, https://aa.usno.navy.mil/api/moon/phases/year?year=2026:
  // 23 May, 21 Jun, 21 Jul, 20 Aug, 18 Sep, 18 Oct, 17 Nov, 17 Dec. Beltane (the Sun at 45°)
  // falls on 5 May 2026, so the first first-quarter on or after it opens Samonios.
  const months = starts(new Date(2026, 4, 1), new Date(2026, 11, 31), ctx()).map((e) => `${e.name.replace(' begins', '')} ${ymd(e.date)}`);
  assert.deepEqual(months, [
    'Samonios 2026-05-23',
    'Dumannios 2026-06-21',
    'Riuros 2026-07-21',
    'Anagantios 2026-08-20',
    'Ogronnios 2026-09-18',
    'Cutios 2026-10-18',
    'Giamonios 2026-11-17',
    'Simivisonnios 2026-12-17',
  ]);
  const sam = colignyMonth(day(2026, 5, 23), ctx());
  assert.ok(sunLongitude(sam.start) >= 45 && sunLongitude(sam.start) < 90);
});

test('the bronze’s pattern holds for decades, in every reading and both hemispheres', () => {
  const readings: [Record<string, string>, 'north' | 'south'][] = [
    [{}, 'north'],
    [{}, 'south'],
    [{ colignySeason: 'summer' }, 'north'],
    [{ colignySeason: 'autumn' }, 'north'],
    [{ colignyPhase: 'new' }, 'north'],
    [{ colignyPhase: 'full', colignySeason: 'autumn' }, 'south'],
  ];
  for (const [options, hemisphere] of readings) {
    const c = ctx(options, hemisphere);
    const list = starts(new Date(2020, 0, 1), new Date(2039, 11, 31), c);
    let sinceSamonios = -1;
    let intercalary = 0;
    for (let i = 0; i < list.length; i++) {
      const name = list[i].name.replace(' begins', '');
      if (i > 0) {
        const gap = Math.round((list[i].date.getTime() - list[i - 1].date.getTime()) / 86_400_000);
        assert.ok(gap === 29 || gap === 30, `${name} ${ymd(list[i].date)}: ${gap} days`);
      }
      if (name === 'Quimonios' || name === 'Rantaranos') intercalary++;
      // Quimonios only ever comes straight before Samonios, Rantaranos before Giamonios.
      if (name === 'Quimonios') assert.equal(list[i + 1]?.name, 'Samonios begins');
      if (name === 'Rantaranos') assert.equal(list[i + 1]?.name, 'Giamonios begins');
      if (name === 'Samonios') {
        if (sinceSamonios >= 0) assert.ok(sinceSamonios === 12 || sinceSamonios === 13, `${JSON.stringify(options)} ${ymd(list[i].date)}: ${sinceSamonios}`);
        sinceSamonios = 0;
      }
      if (sinceSamonios >= 0) sinceSamonios++;
      // Named months in the bronze's order.
      const at = COLIGNY_MONTHS.findIndex((m) => m.name === name);
      const prev = list[i - 1] && COLIGNY_MONTHS.findIndex((m) => `${m.name} begins` === list[i - 1].name);
      if (at > 0 && prev !== undefined && prev >= 0) assert.equal(at, prev + 1, `${name} after ${list[i - 1].name}`);
    }
    // About 7 extra months in 19 years, as the moon and sun require (the Metonic ratio).
    assert.ok(intercalary >= 6 && intercalary <= 8, `${JSON.stringify(options)}: ${intercalary}`);
  }
});

test('the other readings: midsummer, Samhain, and the southern hemisphere', () => {
  // Midsummer: Samonios begins at the first quarter on or after the solstice (21 June 2026, 21:55 UT first quarter).
  assert.equal(ymd(colignyMonth(day(2026, 7, 1), ctx({ colignySeason: 'summer' })).yearStart), '2026-06-21');
  // Samhain: Samonios holds the cross-quarter (the Sun at 225°, 7 November 2026).
  const autumn = colignyMonth(day(2026, 11, 7), ctx({ colignySeason: 'autumn' }));
  assert.equal(autumn.info.name, 'Samonios');
  assert.equal(ymd(autumn.start), '2026-10-18');
  // New-moon months: Samonios from the new moon of 16 May 2026 (USNO 20:01 UT).
  assert.equal(ymd(colignyMonth(day(2026, 6, 1), ctx({ colignyPhase: 'new' })).start), '2026-05-16');
  // South: “summer” and “winter” swap, unless Gaul's seasons are kept.
  assert.equal(colignyMonth(day(2026, 11, 20), ctx({}, 'south')).info.name, 'Samonios');
  assert.equal(colignyMonth(day(2026, 11, 20), ctx({ colignyHemisphere: 'north' }, 'south')).info.name, 'Giamonios');
  assert.deepEqual(COLIGNY_CALENDAR.dateOf(day(2026, 10, 16), ctx({ colignyHemisphere: 'north' }, 'south')), COLIGNY_CALENDAR.dateOf(day(2026, 10, 16), ctx()));
});

test('days are counted in two halves around ATENOVX', () => {
  const d = COLIGNY_CALENDAR.dateOf(day(2026, 10, 16), ctx());
  assert.equal(d.short, 'Ogronnios 14 after ATENOVX · reconstructed');
  assert.equal(d.day, 29);
  assert.equal(d.month?.days, 30);
  assert.equal(d.year?.label, 'Gaulish year from Samonios 2026 (reconstructed)');
  assert.match(d.long, /Reconstructed: .*No ancient date fixes the calendar to ours\./);
  assert.equal(COLIGNY_CALENDAR.dateOf(day(2026, 10, 2), ctx()).short, 'Ogronnios 15 · reconstructed');
  const atenovx = COLIGNY_CALENDAR.dateOf(day(2026, 10, 3), ctx());
  assert.equal(atenovx.short, 'Ogronnios 1 after ATENOVX · reconstructed');
  assert.ok(atenovx.marks.some((m) => m.name === 'ATENOVX'));
});

test('TRINVX SAMONI around the 17th of Samonios, and an intercalary year', () => {
  // On the bronze, TRINVX SAMONI is written against the 2nd day after ATENOVX in Samonios.
  const events = COLIGNY_CALENDAR.eventsBetween(new Date(2026, 4, 1), new Date(2026, 5, 30), ctx());
  const trinvx = events.find((e) => e.id === 'coligny-trinvx-samoni')!;
  assert.equal(`${ymd(trinvx.date)}x${trinvx.days}`, '2026-06-07x3');
  assert.ok(COLIGNY_CALENDAR.dateOf(day(2026, 6, 8), ctx()).marks.some((m) => m.name.startsWith('TRINVX')));
  // 2025: the year after Samonios 2024 needed a thirteenth month, Quimonios, before Samonios.
  const q = COLIGNY_CALENDAR.dateOf(day(2025, 5, 10), ctx());
  assert.equal(q.month?.name, 'Quimonios');
  assert.equal(q.month?.index, -1);
  assert.equal(q.year?.label, 'Intercalary month before Samonios 2025 (reconstructed)');
  assert.match(q.long, /extra month/);
  // 2027/28: the extra month falls mid-year, Rantaranos before Giamonios.
  assert.equal(colignyMonth(day(2027, 11, 20), ctx()).info.name, 'Rantaranos');
  assert.equal(ymd(colignyMonth(day(2027, 12, 10), ctx()).start), '2027-12-06');
  assert.equal(colignyMonth(day(2027, 12, 10), ctx()).info.name, 'Giamonios');
});

test('honest about being a reconstruction', () => {
  assert.equal(COLIGNY_CALENDAR.confidence, 'reconstructed');
  assert.match(COLIGNY_CALENDAR.about, /No ancient date ties the cycle to ours/);
  assert.deepEqual(COLIGNY_CALENDAR.choices?.map((c) => [c.key, c.default]), [['colignyPhase', 'first-quarter'], ['colignySeason', 'beltane'], ['colignyHemisphere', 'local']]);
  const events = COLIGNY_CALENDAR.eventsBetween(new Date(2026, 0, 1), new Date(2026, 11, 31), ctx());
  assert.ok(events.every((e) => e.id.startsWith('coligny-') && /reconstruction/i.test(e.meaning)));
});
