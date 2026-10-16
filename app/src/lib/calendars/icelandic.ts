// The Old Icelandic calendar (misseristal, "the reckoning of the half-years"),
// still printed in the Almanak Háskóla Íslands and still how Iceland dates
// the first day of summer, bóndadagur and konudagur. The year has two
// seasons (misseri) and twelve months of 30 days, each beginning on a fixed
// weekday, plus four extra nights (aukanætur) in midsummer: 364 days, or 52
// weeks. Every five to seven years a leap week, sumarauki, is added in the
// same place so that the year keeps up with the sun.
//
// The rule, as the almanac applies it: summer begins on the Thursday falling
// 19–25 April (sumardagurinn fyrsti). Winter is exactly six months, 180 days,
// so it begins on the Saturday 180 days before the next first day of summer
// (fyrsti vetrardagur, usually 21–27 October, but 28 October before a leap
// year whose summer begins on 25 April, as in 2023). Summer is 184 days, or
// 191 with sumarauki; sumarauki falls in the years whose summer must
// stretch to meet that winter. Pure.

import { startOfDay } from '../calendar.ts';
import type { CalendarDate, CalendarDef, CalendarEvent, CalendarMark } from './types.ts';

const DAY_MS = 86_400_000;
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const daysApart = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);

type Month = { name: string; meaning: string; weekday: string };

const SUMMER: Month[] = [
  { name: 'Harpa', weekday: 'Thursday', meaning: 'The first month of summer. The name’s origin is uncertain; in later folklore Harpa is a maiden, and her first day was the young women’s day (yngismeyjadagur).' },
  { name: 'Skerpla', weekday: 'Saturday', meaning: 'The second month of summer, of uncertain name; the spring work of lambing and tending the home fields.' },
  { name: 'Sólmánuður', weekday: 'Monday', meaning: 'The sun month, around midsummer, when the sun barely sets.' },
  { name: 'Heyannir', weekday: 'Sunday', meaning: 'Hay-making month, the busiest of the year, when the hay for the winter was cut and dried.' },
  { name: 'Tvímánuður', weekday: 'Tuesday', meaning: '“Two month”, probably as two months of summer remain (or two months of hay-work have passed): the late harvest.' },
  { name: 'Haustmánuður', weekday: 'Thursday', meaning: 'Autumn month, the last of summer: sheep are gathered from the highlands (réttir).' },
];

const WINTER: Month[] = [
  { name: 'Gormánuður', weekday: 'Saturday', meaning: 'Slaughter month, the first of winter, named for the gor, the stomach contents of the animals slaughtered for the winter.' },
  { name: 'Ýlir', weekday: 'Monday', meaning: 'The second month of winter; its name is of uncertain origin, perhaps linked to Yule (jól).' },
  { name: 'Mörsugur', weekday: 'Wednesday', meaning: '“Fat-sucker”, the month of eating suet and rich food at midwinter; also called jólmánuður, Yule month.' },
  { name: 'Þorri', weekday: 'Friday', meaning: 'Named for Þorri, frost or winter itself, made a person in the old tales; the hardest month, kept today with the Þorrablót feast of traditional foods.' },
  { name: 'Góa', weekday: 'Sunday', meaning: 'Named for Góa, daughter of Þorri in the old tales; a late winter month, when the days lengthen.' },
  { name: 'Einmánuður', weekday: 'Tuesday', meaning: '“Single month” or “one month”, the last of winter, waiting for summer; its first day was the young men’s day (yngismannadagur).' },
];

/** Sumardagurinn fyrsti: the Thursday falling 19–25 April. */
export function firstDayOfSummer(year: number): Date {
  const first = new Date(year, 3, 19);
  return addDays(first, (4 - first.getDay() + 7) % 7);
}

/** Fyrsti vetrardagur in the autumn of `year`: 180 days before the next first day of summer. */
export function firstDayOfWinter(year: number): Date {
  return addDays(firstDayOfSummer(year + 1), -180);
}

/** Whether the summer beginning in `year` has the leap week, sumarauki. */
export function hasSumarauki(year: number): boolean {
  return daysApart(firstDayOfSummer(year), firstDayOfSummer(year + 1)) === 371;
}

type Place =
  | { kind: 'month'; season: 'summer' | 'winter'; month: Month; index: number; day: number; week: number }
  | { kind: 'extra'; which: 'aukanætur' | 'sumarauki'; day: number; of: number; week: number };

type Located = { place: Place; year: number; summer: Date; winter: Date; nextSummer: Date };

/** Where an ordinary day falls in the Icelandic year. Months are numbered from Harpa (1) to Einmánuður (12). */
export function icelandicDay(date: Date): Located {
  const day = startOfDay(date);
  let year = day.getFullYear();
  if (day.getTime() < firstDayOfSummer(year).getTime()) year -= 1;
  const summer = firstDayOfSummer(year);
  const nextSummer = firstDayOfSummer(year + 1);
  const winter = addDays(nextSummer, -180);
  const leap = daysApart(summer, nextSummer) === 371;
  const base = { year, summer, winter, nextSummer };
  if (day.getTime() >= winter.getTime()) {
    const offset = daysApart(winter, day);
    const i = Math.floor(offset / 30);
    return { ...base, place: { kind: 'month', season: 'winter', month: WINTER[i], index: 7 + i, day: (offset % 30) + 1, week: Math.floor(offset / 7) + 1 } };
  }
  const offset = daysApart(summer, day);
  const week = Math.floor(offset / 7) + 1;
  if (offset < 90) {
    const i = Math.floor(offset / 30);
    return { ...base, place: { kind: 'month', season: 'summer', month: SUMMER[i], index: 1 + i, day: (offset % 30) + 1, week } };
  }
  if (offset < 94) return { ...base, place: { kind: 'extra', which: 'aukanætur', day: offset - 89, of: 4, week } };
  if (leap && offset < 101) return { ...base, place: { kind: 'extra', which: 'sumarauki', day: offset - 93, of: 7, week } };
  const late = offset - (leap ? 101 : 94);
  const i = 3 + Math.floor(late / 30);
  return { ...base, place: { kind: 'month', season: 'summer', month: SUMMER[i], index: 1 + i, day: (late % 30) + 1, week } };
}

/** The first day of each month of the Icelandic year beginning in the summer of `year`. */
function monthStarts(year: number): { month: Month; date: Date }[] {
  const summer = firstDayOfSummer(year);
  const winter = firstDayOfWinter(year);
  const heyannir = addDays(winter, -90);
  return [
    ...SUMMER.slice(0, 3).map((month, i) => ({ month, date: addDays(summer, 30 * i) })),
    ...SUMMER.slice(3).map((month, i) => ({ month, date: addDays(heyannir, 30 * i) })),
    ...WINTER.map((month, i) => ({ month, date: addDays(winter, 30 * i) })),
  ];
}

// Named first days. Those already in holidays.ts (the Norse calendar's
// Sigrblót / sumardagurinn fyrsti, Winter Nights and Þorrablót) are marks
// only, so they aren't listed twice.
const FIRST_DAYS: Record<string, { id: string; name: string; meaning: string; event: boolean }> = {
  Harpa: { id: 'sumardagurinn-fyrsti', name: 'Sumardagurinn fyrsti', meaning: 'The first day of summer and of Harpa, a public holiday in Iceland still: summer gifts, parades, and the old belief that if summer and winter “freeze together” the night before, the summer will be good.', event: false },
  Skerpla: { id: 'skerpla', name: 'First day of Skerpla', meaning: 'The second month of summer begins, on a Saturday.', event: true },
  Sólmánuður: { id: 'solmanudur', name: 'First day of Sólmánuður', meaning: 'The sun month begins, on a Monday, near midsummer.', event: true },
  Heyannir: { id: 'heyannir', name: 'First day of Heyannir', meaning: 'Hay-making month begins, on a Sunday after the extra nights of midsummer: the fourteenth week of summer, or the fifteenth in a year with sumarauki.', event: true },
  Tvímánuður: { id: 'tvimanudur', name: 'First day of Tvímánuður', meaning: 'Tvímánuður begins, on a Tuesday, in the late summer harvest.', event: true },
  Haustmánuður: { id: 'haustmanudur', name: 'First day of Haustmánuður', meaning: 'Autumn month, the last of summer, begins on a Thursday.', event: true },
  Gormánuður: { id: 'fyrsti-vetrardagur', name: 'Fyrsti vetrardagur', meaning: 'The first day of winter and of Gormánuður, a Saturday. The old Winter Nights (vetrnætur), with feasting and the blót for a good year.', event: false },
  Ýlir: { id: 'ylir', name: 'First day of Ýlir', meaning: 'The second month of winter begins, on a Monday.', event: true },
  Mörsugur: { id: 'morsugur', name: 'First day of Mörsugur', meaning: 'Mörsugur, the midwinter month, begins on a Wednesday, just before the solstice.', event: true },
  Þorri: { id: 'bondadagur', name: 'Bóndadagur', meaning: 'The first day of Þorri, “husband’s day”, a Friday. Folk custom told the man of the house to greet Þorri at dawn hopping round the house in one trouser leg; today husbands are given gifts, and the Þorrablót season of traditional food begins.', event: false },
  Góa: { id: 'konudagur', name: 'Konudagur', meaning: 'The first day of Góa, “wife’s day”, a Sunday: women were welcomed Góa in folk custom, and today wives are given flowers and treats.', event: true },
  Einmánuður: { id: 'einmanudur', name: 'First day of Einmánuður', meaning: 'The last month of winter begins, on a Tuesday; traditionally the young men’s day (yngismannadagur).', event: true },
};

function eventsBetween(from: Date, to: Date): CalendarEvent[] {
  const start = startOfDay(from).getTime();
  const end = to.getTime();
  const out: CalendarEvent[] = [];
  const add = (id: string, name: string, meaning: string, date: Date, days: number) => {
    if (addDays(date, days - 1).getTime() < start || date.getTime() > end) return;
    out.push({ calendar: 'icelandic', id: `icelandic-${id}`, name, meaning, date, days });
  };
  for (let year = from.getFullYear() - 1; year <= to.getFullYear(); year++) {
    for (const { month, date } of monthStarts(year)) {
      const first = FIRST_DAYS[month.name];
      if (first.event) add(first.id, first.name, first.meaning, date, 1);
    }
    const summer = firstDayOfSummer(year);
    add('aukanaetur', 'Aukanætur', 'The four extra nights of midsummer, between Sólmánuður and Heyannir, that make the year 52 whole weeks.', addDays(summer, 90), 4);
    if (hasSumarauki(year)) {
      add('sumarauki', 'Sumarauki', 'The “summer increase”: a leap week added this year before Heyannir, so the calendar keeps pace with the sun.', addDays(summer, 94), 7);
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function marksOf(at: Located, day: Date): CalendarMark[] {
  const marks: CalendarMark[] = [];
  const p = at.place;
  if (p.kind === 'month' && p.day === 1) {
    const first = FIRST_DAYS[p.month.name];
    marks.push({ name: first.name, meaning: first.meaning });
  }
  if (p.kind === 'extra' && p.day === 1) {
    marks.push(
      p.which === 'aukanætur'
        ? { name: 'Aukanætur', meaning: 'The first of the four extra nights of midsummer, between Sólmánuður and Heyannir.' }
        : { name: 'Sumarauki', meaning: 'The leap week, the “summer increase”, begins: added in some years so the calendar keeps pace with the sun.' },
    );
  }
  if (p.kind === 'month' && p.day === 30 && p.month.name === 'Þorri') marks.push({ name: 'Þorraþræll', meaning: 'The last day of Þorri, “Þorri’s thrall”, a Saturday, before Góa comes in.' });
  if (p.kind === 'month' && p.day === 30 && p.month.name === 'Góa') marks.push({ name: 'Góuþræll', meaning: 'The last day of Góa, “Góa’s thrall”, a Monday, before Einmánuður.' });
  if (daysApart(day, at.winter) === 1) marks.push({ name: 'Last day of summer', meaning: 'Tomorrow winter begins.' });
  if (daysApart(day, at.nextSummer) === 1) marks.push({ name: 'Síðasti vetrardagur', meaning: 'The last day of winter; tomorrow is the first day of summer.' });
  return marks;
}

function dateOf(date: Date): CalendarDate {
  const day = startOfDay(date);
  const at = icelandicDay(day);
  const p = at.place;
  const year = { label: `Icelandic year ${at.year}/${String((at.year + 1) % 100).padStart(2, '0')}${hasSumarauki(at.year) ? ' · with sumarauki' : ''}` };
  const marks = marksOf(at, day);
  if (p.kind === 'extra') {
    const what = p.which === 'aukanætur' ? 'the four extra nights of midsummer (aukanætur)' : 'the leap week, sumarauki';
    return {
      calendar: 'icelandic',
      short: `${p.which === 'aukanætur' ? 'Aukanætur' : 'Sumarauki'} ${p.day} · week ${p.week} of summer`,
      long: `Night ${p.day} of ${p.of} of ${what}, between Sólmánuður and Heyannir, in the ${p.week}th week of summer.`,
      year,
      marks,
    };
  }
  const season = p.season === 'summer' ? 'summer' : 'winter';
  const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
  return {
    calendar: 'icelandic',
    short: `${p.month.name} ${p.day} · week ${p.week} of ${season}`,
    long: `The ${ord(p.day)} day of ${p.month.name}, in the ${ord(p.week)} week of ${season}. ${p.month.meaning}`,
    month: { name: p.month.name, index: p.index, days: 30, meaning: p.month.meaning },
    day: p.day,
    year,
    marks,
  };
}

export const ICELANDIC_CALENDAR: CalendarDef = {
  id: 'icelandic',
  name: 'Old Icelandic calendar (misseristal)',
  path: 'norse',
  confidence: 'historical',
  about:
    'The calendar of medieval Iceland, still printed in the Icelandic almanac and still used to date the first day of summer, bóndadagur and konudagur. The year has two seasons, summer and winter, of six months each. Every month has 30 days and begins on its own weekday, and four extra nights (aukanætur) in midsummer make the year exactly 52 weeks, so dates are often given as “the 10th week of summer”. Because 364 days is a little short of the sun’s year, a leap week, sumarauki, is added every five to seven years. Summer begins on the Thursday between 19 and 25 April; winter begins on a Saturday, normally 21–27 October. The rules for sumarauki have changed over the centuries (they were first set out around 955 and adjusted after Iceland took up the Gregorian calendar in 1700); the modern almanac rule is used here. The months are Icelandic and are kept by the Icelandic calendar wherever you live, so summer and winter here are the North’s.',
  sources: [
    'Almanak Háskóla Íslands (University of Iceland Almanac), https://almanak.hi.is/',
    'Þorsteinn Sæmundsson, “Íslenska misseristalið”, in the Almanak Háskóla Íslands',
    'Árni Björnsson, Saga daganna (1993)',
    'https://is.wikipedia.org/wiki/Heyannir',
    'https://en.wikipedia.org/wiki/Icelandic_calendar',
    'https://icelandmonitor.mbl.is/news/news/2015/10/21/do_you_know_your_old_icelandic_months/',
  ],
  dateOf: (day) => dateOf(day),
  eventsBetween: (from, to) => eventsBetween(from, to),
};
