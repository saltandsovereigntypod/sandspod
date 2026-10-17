// The moon's own months. Each month is one lunation, from new moon to new
// moon; the months are counted through a lunar year that begins at the first
// new moon on or after the winter solstice (or the spring equinox, or
// Samhain, by choice), and named by their full moon. Pure.
//
// Day boundary: day 1 is the local calendar day on which the new moon falls
// (by the clock where the person is), and the month runs until the day before
// the next new moon's day. So a month is 29 or 30 days long. The first visible
// crescent (the old Babylonian, Hebrew and Islamic rule) comes a day or two
// later; we count from the astronomical new moon because it can be worked out
// exactly anywhere and needs no sky-watching.
//
// Blue Moon: the Maine Farmers' Almanac (1932–57 under H. P. Trefethen) gave
// each season three named full moons; when a season held four, the third was
// the Blue Moon, so the last moon before each solstice and equinox kept its
// usual name. The almanac's seasons were four equal quarters of the year, from
// the right ascension of the mean Sun, so its Blue Moons sometimes differ from
// the same rule on the true (astronomical) seasons that Sky & Telescope and
// most tables use today: 2027's is 20 Feb by the almanac, 20 May by the true
// seasons (obliquity.com/astro/blue-seasonal.html). James Hugh Pruett misread
// the almanac in Sky & Telescope (March 1946) as "the second full moon in a
// calendar month", now the popular meaning. All three are offered (choice
// 'blue'); the seasonal rule on the true seasons is the default.
//
// Folk names follow the Old Farmer's Almanac list by calendar month (Wolf,
// Snow, Worm, Pink, Flower, Strawberry, Buck, Sturgeon, Corn/Harvest,
// Hunter's, Beaver, Cold), which mixes Algonquian, Colonial American and
// European names. A month is named by its full moon. They belong to the
// northern seasons; south of the equator many turn them six months, a modern
// convention (EarthSky and Time and Date say the names don't really fit the
// south either way), so keeping the northern names is a choice. The
// Harvest Moon is the full moon nearest the autumn equinox: when it falls in
// October the September moon is the Corn Moon and the Hunter's Moon (the
// full moon after the Harvest Moon) moves to November, as Time and Date and
// EarthSky name it; the Old Farmer's Almanac keeps the Beaver Moon then, so
// sources differ for those Novembers. A thirteenth moon in a lunar year is not by itself a Blue Moon: the
// Blue Moon is the extra full moon by the chosen rule, which usually but not
// always falls in a thirteen-moon year.

import { dateToJulianDay, julianDayToDate, moonState, phaseJde, lunationNear, sunReaches, type PrincipalPhase } from '../moon.ts';
import type { CalendarContext, CalendarDate, CalendarDef, CalendarEvent, CalendarMark } from './types.ts';

const DAY_MS = 86_400_000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
/** Whole local days from a to b. */
const daysFrom = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);

const OFFSET: Record<PrincipalPhase, number> = { new: 0, firstQuarter: 0.25, full: 0.5, lastQuarter: 0.75 };
/** The instant of a principal phase of lunation k (k = 0 is the new moon of 6 Jan 2000). */
export const phaseOf = (k: number, phase: PrincipalPhase) => julianDayToDate(phaseJde(k + OFFSET[phase], phase));

export type Lunation = {
  /** Meeus lunation number. */
  k: number;
  /** Instants. */
  newMoon: Date;
  firstQuarter: Date;
  full: Date;
  lastQuarter: Date;
  /** Local start day (day 1) and the local start day of the next lunation. */
  start: Date;
  next: Date;
};

// Phase instants are cached by lunation; local days are worked out fresh each
// time, so a change of time zone is picked up at once.
const instants = new Map<number, [Date, Date, Date, Date, Date]>();
export function lunation(k: number): Lunation {
  let found = instants.get(k);
  if (!found) {
    found = [phaseOf(k, 'new'), phaseOf(k, 'firstQuarter'), phaseOf(k, 'full'), phaseOf(k, 'lastQuarter'), phaseOf(k + 1, 'new')];
    if (instants.size > 600) instants.clear();
    instants.set(k, found);
  }
  const [newMoon, firstQuarter, full, lastQuarter, nextNew] = found;
  return { k, newMoon, firstQuarter, full, lastQuarter, start: startOfDay(newMoon), next: startOfDay(nextNew) };
}

/** The lunation whose local days include `day`. */
export function lunationOf(day: Date): Lunation {
  const d = startOfDay(day).getTime();
  let k = lunationNear(day) + 1;
  while (lunation(k).start.getTime() > d) k -= 1;
  while (lunation(k).next.getTime() <= d) k += 1;
  return lunation(k);
}

/** The first lunation whose new moon is at or after `instant`. */
function firstLunationFrom(instant: Date): Lunation {
  let k = lunationNear(instant) - 1;
  while (lunation(k).newMoon.getTime() < instant.getTime()) k += 1;
  return lunation(k);
}

// ─── Choices ─────────────────────────────────────────────────────────────

export type YearStart = 'winter-solstice' | 'spring-equinox' | 'samhain';
export type NameStyle = 'folk' | 'numbered';
export type BlueRule = 'seasonal' | 'almanac' | 'monthly';
export type SouthNames = 'turned' | 'northern';

const option = <T extends string>(ctx: CalendarContext, key: string, allowed: readonly T[], fallback: T): T => {
  const value = ctx.options[key];
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
};
const yearStartOf = (ctx: CalendarContext) => option<YearStart>(ctx, 'yearStart', ['winter-solstice', 'spring-equinox', 'samhain'], 'winter-solstice');
const nameStyleOf = (ctx: CalendarContext) => option<NameStyle>(ctx, 'names', ['folk', 'numbered'], 'folk');
const blueRuleOf = (ctx: CalendarContext) => option<BlueRule>(ctx, 'blue', ['seasonal', 'almanac', 'monthly'], 'seasonal');
/** Whether the folk names are turned six months: only in the south, and only when chosen (the default there). */
const namesTurned = (ctx: CalendarContext) => ctx.hemisphere === 'south' && option<SouthNames>(ctx, 'southNames', ['turned', 'northern'], 'turned') === 'turned';

/** The moment the lunar year's starting point is reached in ordinary year `year`. */
function yearPoint(year: number, start: YearStart, south: boolean): Date {
  switch (start) {
    case 'spring-equinox':
      return sunReaches(year, south ? 180 : 0);
    case 'samhain':
      // 1 November in the north; 1 May (the turned Wheel's Samhain) in the south.
      return new Date(year, south ? 4 : 10, 1);
    default:
      return sunReaches(year, south ? 90 : 270);
  }
}

export type LunarYear = { start: Lunation; next: Lunation; months: Lunation[] };

/** The lunar year holding `day`: its first lunation, the next year's first, and its months. */
export function lunarYearOf(day: Date, start: YearStart, south: boolean): LunarYear {
  const here = lunationOf(day);
  let first: Lunation | null = null;
  let after: Lunation | null = null;
  for (let y = day.getFullYear() - 2; y <= day.getFullYear() + 1; y++) {
    const candidate = firstLunationFrom(yearPoint(y, start, south));
    if (candidate.k <= here.k) first = candidate;
    else if (!after) after = candidate;
  }
  // The window above always brackets `day`; these fallbacks are only for safety.
  first ??= here;
  after ??= lunation(first.k + 12);
  const months: Lunation[] = [];
  for (let k = first.k; k < after.k; k++) months.push(lunation(k));
  return { start: first, next: after, months };
}

// ─── Full moon names ─────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Wolf Moon',
  'Snow Moon',
  'Worm Moon',
  'Pink Moon',
  'Flower Moon',
  'Strawberry Moon',
  'Buck Moon',
  'Sturgeon Moon',
  'Corn Moon',
  'Hunter’s Moon',
  'Beaver Moon',
  'Cold Moon',
];
export const MOON_MEANINGS: Record<string, string> = {
  'Wolf Moon': 'Deep winter, when wolves were heard at night.',
  'Snow Moon': 'The month of the heaviest snows.',
  'Worm Moon': 'The thaw as winter ends: earthworms stirring in the softening ground, or, as Jonathan Carver heard it in the 1760s, beetle larvae coming out of the thawing bark.',
  'Pink Moon': 'The early spring flowers, such as creeping phlox.',
  'Flower Moon': 'Spring in full flower.',
  'Strawberry Moon': 'Wild strawberries ripening in early summer.',
  'Buck Moon': 'Deer growing their new antlers.',
  'Sturgeon Moon': 'Sturgeon most easily caught in the lakes of late summer.',
  'Corn Moon': 'The corn harvest of late summer.',
  'Harvest Moon': 'The full moon nearest the autumn equinox, rising early and bright for harvesting late into the evening.',
  'Hunter’s Moon': 'The moon after the Harvest Moon, lighting the fields for autumn hunting.',
  'Beaver Moon': 'Beavers building their winter lodges; the time to set traps before the freeze.',
  'Cold Moon': 'The long cold nights near the winter solstice.',
  };

/**
 * When the mean Sun reaches `longitude` in `year`: the Sun's mean longitude
 * (Meeus 25.2) stands for the right ascension of the mean Sun, which the Maine
 * Farmers' Almanac used for its four equal seasons.
 */
export function meanSunReaches(year: number, longitude: 0 | 90 | 180 | 270): Date {
  const guess = sunReaches(year, longitude);
  let T = (dateToJulianDay(guess) - 2451545.0) / 36525;
  for (let i = 0; i < 3; i++) {
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const behind = ((((longitude - L0) % 360) + 540) % 360) - 180;
    T += behind / 36000.76983;
  }
  return julianDayToDate(2451545.0 + T * 36525);
}

/** The solstices and equinoxes around `date`, in order: true, or the mean Sun's. */
function cardinalPoints(date: Date, mean = false): { at: Date; longitude: 0 | 90 | 180 | 270 }[] {
  const out: { at: Date; longitude: 0 | 90 | 180 | 270 }[] = [];
  for (let y = date.getFullYear() - 1; y <= date.getFullYear() + 1; y++) {
    for (const longitude of [0, 90, 180, 270] as const) out.push({ at: (mean ? meanSunReaches : sunReaches)(y, longitude), longitude });
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** Full moons from `from` (inclusive) to `to` (exclusive). */
function fullMoonsBetween(from: Date, to: Date): Date[] {
  const out: Date[] = [];
  for (let k = lunationNear(from) - 1; ; k++) {
    const full = lunation(k).full;
    if (full.getTime() >= to.getTime()) return out;
    if (full.getTime() >= from.getTime()) out.push(full);
  }
}

/** The full moon nearest the autumn equinox of the year around `date`. */
function isHarvestMoon(full: Date, south: boolean): boolean {
  const equinoxLongitude = south ? 0 : 180;
  for (const y of [full.getFullYear() - 1, full.getFullYear(), full.getFullYear() + 1]) {
    const equinox = sunReaches(y, equinoxLongitude);
    if (Math.abs(equinox.getTime() - full.getTime()) > 20 * DAY_MS) continue;
    const k = lunationNear(equinox);
    let nearest = lunation(k).full;
    for (const j of [k - 1, k + 1, k + 2]) {
      const candidate = lunation(j).full;
      if (Math.abs(candidate.getTime() - equinox.getTime()) < Math.abs(nearest.getTime() - equinox.getTime())) nearest = candidate;
    }
    return nearest.getTime() === full.getTime();
  }
  return false;
}

/** The full moon one lunation before `full`. */
function previousFull(full: Date): Date {
  for (let k = lunationNear(full) - 1; k <= lunationNear(full) + 2; k++) {
    if (lunation(k).full.getTime() === full.getTime()) return lunation(k - 1).full;
  }
  return new Date(full.getTime() - 29.53 * DAY_MS);
}

/**
 * Whether a full moon is the third of four in its season: the Maine Farmers'
 * Almanac's rule, on the true seasons (default) or, with `mean`, on the
 * almanac's own equal seasons of the mean Sun.
 */
export function isSeasonalBlueMoon(full: Date, mean = false): boolean {
  const points = cardinalPoints(full, mean);
  const i = points.findIndex((p, n) => p.at.getTime() <= full.getTime() && full.getTime() < points[n + 1].at.getTime());
  const moons = fullMoonsBetween(points[i].at, points[i + 1].at);
  return moons.length === 4 && moons[2].getTime() === full.getTime();
}

/** Whether a full moon is the second in its calendar month (the popular Blue Moon). */
export function isMonthlyBlueMoon(full: Date): boolean {
  const prior = previousFull(full);
  return prior.getFullYear() === full.getFullYear() && prior.getMonth() === full.getMonth();
}

/** The month's folk name (Old Farmer's Almanac), turned six months in the south, with the Harvest Moon rule. */
export function monthName(full: Date, south: boolean): string {
  const prior = previousFull(full);
  const turned = (full.getMonth() + (south ? 6 : 0)) % 12;
  // A second full moon in a month repeats its month's name (its first is the Harvest Moon, perhaps).
  const base = isMonthlyBlueMoon(full) ? monthName(prior, south) : null;
  if (base) return base === 'Harvest Moon' ? 'Hunter’s Moon' : base;
  // Harvest: the moon nearest the autumn equinox, in the (turned) ninth or tenth month.
  if ((turned === 8 || turned === 9) && isHarvestMoon(full, south)) return 'Harvest Moon';
  // When the Harvest Moon came in the tenth month, the Hunter's Moon follows in the eleventh.
  if (turned === 10 && isHarvestMoon(prior, south)) return 'Hunter’s Moon';
  return MONTH_NAMES[turned];
}

export type FullMoonName = { name: string; /** The month's own name, even for a Blue Moon. */ month: string; blue: boolean };

/** A full moon's folk name: its month's name, or the Blue Moon by the chosen rule. */
export function fullMoonName(full: Date, south: boolean, rule: BlueRule = 'seasonal'): FullMoonName {
  const month = monthName(full, south);
  const blue = rule === 'monthly' ? isMonthlyBlueMoon(full) : isSeasonalBlueMoon(full, rule === 'almanac');
  return { name: blue ? 'Blue Moon' : month, month, blue };
}

// ─── Words ───────────────────────────────────────────────────────────────

const ORDINAL_WORDS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth'];
const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')}`;
const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

const MARK_MEANINGS: Record<string, string> = {
  'New Moon': 'The first day of the moon’s month: the moon between us and the Sun, unseen. A time for beginnings and intentions.',
  'First Quarter': 'Half lit and growing: a time to act on what you began.',
  'Full Moon': 'The moon full and opposite the Sun: the height of the month.',
  'Last Quarter': 'Half lit and shrinking: a time to release and clear away.',
  'Dark Moon': 'The last day of the moon’s month, before the new moon: the old moon hidden in the Sun’s glare. A time for rest and endings.',
};

type Month = {
  lunation: Lunation;
  year: LunarYear;
  /** 1–13 within the lunar year. */
  number: number;
  /** The name shown: folk or numbered, per the choice. */
  name: string;
  numbered: string;
  full: FullMoonName;
};

const numberedName = (n: number) => `${ORDINAL_WORDS[n - 1] ?? ordinal(n)} Moon`;
const ordinalWord = (n: number) => ORDINAL_WORDS[n - 1]?.toLowerCase() ?? ordinal(n);

function monthOf(l: Lunation, ctx: CalendarContext): Month {
  const south = ctx.hemisphere === 'south';
  const year = lunarYearOf(l.start, yearStartOf(ctx), south);
  const number = l.k - year.start.k + 1;
  const full = fullMoonName(l.full, namesTurned(ctx), blueRuleOf(ctx));
  const numbered = numberedName(number);
  return { lunation: l, year, number, name: nameStyleOf(ctx) === 'numbered' ? numbered : full.name, numbered, full };
}

/** What a full moon means, with a word on the Blue Moon. */
function fullMeaning(m: Month, ctx: CalendarContext): string {
  const own = MOON_MEANINGS[m.full.month] ?? '';
  if (!m.full.blue) {
    return isMonthlyBlueMoon(m.lunation.full) ? `${own} The second full moon this month, which many now call a Blue Moon.` : own;
  }
  const rule = blueRuleOf(ctx);
  const why =
    rule === 'monthly'
      ? 'A Blue Moon: the second full moon in one calendar month.'
      : rule === 'almanac'
        ? 'A Blue Moon: the third of four full moons in this season, by the Maine Farmers’ Almanac’s rule and its equal seasons.'
        : 'A Blue Moon: the third of four full moons between a solstice and an equinox, by the Maine Farmers’ Almanac’s rule.';
  return `${why} By its month it is also the ${m.full.month}.`;
}

function marksOn(day: Date, m: Month, ctx: CalendarContext): CalendarMark[] {
  const l = m.lunation;
  const marks: CalendarMark[] = [];
  const add = (name: string, meaning = MARK_MEANINGS[name]) => marks.push({ name, meaning });
  if (sameDay(day, l.newMoon)) add('New Moon');
  if (sameDay(day, l.firstQuarter)) add('First Quarter');
  if (sameDay(day, l.full)) {
    add('Full Moon');
    if (m.full.blue) add('Blue Moon', fullMeaning(m, ctx));
  }
  if (sameDay(day, l.lastQuarter)) add('Last Quarter');
  if (sameDay(addDays(day, 1), l.next)) add('Dark Moon');
  return marks;
}

function phaseWords(at: Date): string {
  const phase = moonState(at).name.toLowerCase();
  if (phase === 'new moon' || phase === 'full moon') return `the ${phase}`;
  if (phase === 'first quarter' || phase === 'last quarter') return `the moon at its ${phase}`;
  return `the moon ${phase}`;
}

function yearLabel(year: LunarYear): string {
  const first = year.start.start;
  const last = addDays(year.next.start, -1);
  const span = first.getFullYear() === last.getFullYear() ? String(first.getFullYear()) : `${first.getFullYear()}–${String(last.getFullYear()).slice(-2)}`;
  return `Lunar year ${span} · ${year.months.length} moons, from ${SHORT_MONTH[first.getMonth()]} ${first.getDate()}, ${first.getFullYear()}`;
}

function dateOf(day: Date, ctx: CalendarContext): CalendarDate {
  const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12);
  const m = monthOf(lunationOf(at), ctx);
  const dayNumber = daysFrom(m.lunation.start, at) + 1;
  const folkStyle = nameStyleOf(ctx) === 'folk';
  const short = folkStyle ? `${m.name} · day ${dayNumber}` : `Moon ${m.number} · day ${dayNumber}`;
  const which = folkStyle ? `the ${ordinalWord(m.number)} moon of the year` : `the ${m.full.name}`;
  return {
    calendar: 'moon',
    short,
    long: `The ${ordinal(dayNumber)} day of the ${m.name}, ${which}: ${phaseWords(at)}.`,
    month: { name: m.name, index: m.number, days: daysFrom(m.lunation.start, m.lunation.next), meaning: fullMeaning(m, ctx) },
    day: dayNumber,
    year: { label: yearLabel(m.year) },
    marks: marksOn(at, m, ctx),
  };
}

function eventsBetween(from: Date, to: Date, ctx: CalendarContext): CalendarEvent[] {
  const first = startOfDay(from).getTime();
  const last = startOfDay(to).getTime();
  const out: CalendarEvent[] = [];
  const folkStyle = nameStyleOf(ctx) === 'folk';
  for (let l = lunationOf(from); l.start.getTime() <= last; l = lunation(l.k + 1)) {
    const m = monthOf(l, ctx);
    const newYear = m.number === 1;
    out.push({
      calendar: 'moon',
      id: `moon-new-${dayKey(l.start)}`,
      name: newYear ? `${m.name} begins · the lunar new year` : `${m.name} begins`,
      meaning: `New moon: day 1 of the ${folkStyle ? `${ordinalWord(m.number)} moon of the year` : `${ordinalWord(m.number)} moon, the ${m.full.name}`}.${newYear ? ' The first new moon of the lunar year.' : ''}`,
      date: l.start,
      days: 1,
    });
    out.push({
      calendar: 'moon',
      id: `moon-full-${dayKey(startOfDay(l.full))}`,
      name: folkStyle ? `${m.full.name} · full moon` : `Full moon of the ${m.numbered}`,
      meaning: folkStyle ? fullMeaning(m, ctx) : `The ${m.full.name}. ${fullMeaning(m, ctx)}`,
      date: startOfDay(l.full),
      days: 1,
    });
  }
  return out.filter((e) => e.date.getTime() >= first && e.date.getTime() <= last).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const MOON_CALENDAR: CalendarDef = {
  id: 'moon',
  name: 'The moon’s months',
  confidence: 'modern',
  about:
    'Counting months by the moon is one of the oldest ways of keeping time, used across the ancient world and still kept in the Hebrew, Islamic, Chinese and Hindu calendars. This calendar is a modern arrangement drawing on that: the new and full moons are exact astronomy, but the way the months are gathered into a year and named is convention. Each month runs from one new moon to the next, and day 1 is the day the new moon falls where you are; many older calendars began instead at the first thin crescent, a day or two later. By default the year begins at the first new moon on or after the winter solstice, with the spring equinox or Samhain as other choices. Each month is named for its full moon. The folk names (Wolf, Snow, Worm and the rest) go by the calendar month the full moon falls in and come from the Old Farmer’s Almanac, a 20th-century gathering of Algonquian, Colonial American and European names; the Harvest Moon is the full moon nearest the autumn equinox, and sources differ on whether the moon after an October Harvest Moon is the Hunter’s or the Beaver Moon. The names follow the northern seasons: south of the equator many turn them six months, a modern convention, and you can keep the northern names instead. A Blue Moon is, by the old Maine Farmers’ Almanac rule, the third full moon of a season that has four; the almanac counted four equal seasons, so its dates sometimes differ from the same rule on the true seasons. The popular “second full moon in a month” comes from a 1946 misreading of it. All three are offered.',
  choices: [
    {
      key: 'names',
      label: 'Name the months',
      default: 'folk',
      options: [
        { value: 'folk', label: 'Folk full moon names', note: 'Wolf, Snow, Worm, Pink… from the Old Farmer’s Almanac.' },
        { value: 'numbered', label: 'First Moon, Second Moon…', note: 'Simply counted from the start of the year.' },
      ],
    },
    {
      key: 'southNames',
      label: 'South of the equator, the folk names',
      default: 'turned',
      options: [
        { value: 'turned', label: 'Turned six months', note: 'So the Harvest Moon falls near the March equinox and the Cold Moon in June. A modern convention.' },
        { value: 'northern', label: 'Kept as in the north', note: 'The names stay with their calendar months, as almanacs print them.' },
      ],
    },
    {
      key: 'yearStart',
      label: 'The year begins',
      default: 'winter-solstice',
      options: [
        { value: 'winter-solstice', label: 'After the winter solstice', note: 'The first new moon on or after midwinter. A modern convention.' },
        { value: 'spring-equinox', label: 'After the spring equinox', note: 'As the Babylonian and Hebrew years began in spring. A modern convention here.' },
        { value: 'samhain', label: 'After Samhain', note: 'The first new moon from 1 November (1 May in the south). A modern Pagan convention.' },
      ],
    },
    {
      key: 'blue',
      label: 'A Blue Moon is',
      default: 'seasonal',
      options: [
        { value: 'seasonal', label: 'The third of four in a season', note: 'The Maine Farmers’ Almanac’s rule on the true seasons, as Sky & Telescope gives it today.' },
        { value: 'almanac', label: 'The same, on the almanac’s equal seasons', note: 'As the Maine Farmers’ Almanac itself reckoned, from the mean Sun; now and then a different full moon.' },
        { value: 'monthly', label: 'The second in a month', note: 'The popular modern meaning, from a 1946 misreading.' },
      ],
    },
  ],
  sources: [
    'Jean Meeus, Astronomical Algorithms (2nd ed., 1998), ch. 49, for the moon’s phases',
    'https://aa.usno.navy.mil/data/MoonPhases',
    'https://skyandtelescope.org/astronomy-resources/what-is-a-blue-moon/',
    'https://www.almanac.com/full-moon-names',
    'https://www.timeanddate.com/astronomy/moon/beaver.html',
    'https://obliquity.com/astro/blue-seasonal.html (seasonal Blue Moons on the true and the almanac’s seasons)',
    'https://earthsky.org/astronomy-essentials/full-moon-names/ (on the names in the southern hemisphere)',
    'https://earthsky.org/astronomy-essentials/everything-you-need-to-know-hunters-moon/',
  ],
  dateOf,
  eventsBetween,
};
