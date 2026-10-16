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
// usual name. James Hugh Pruett misread this in Sky & Telescope (March 1946)
// as "the second full moon in a calendar month", which is now the popular
// meaning. Both are offered (choice 'blue'); the seasonal rule is the default.
//
// Folk names follow the Old Farmer's Almanac list (Wolf, Snow, Worm, Pink,
// Flower, Strawberry, Buck, Sturgeon, Corn/Harvest, Hunter's, Beaver, Cold),
// which mixes Algonquian, Colonial American and European names. They belong
// to the northern seasons; south of the equator they are turned six months.
// The Harvest Moon is the full moon nearest the autumn equinox: when that is
// the first moon of autumn, the late-summer moon is the Corn Moon and the
// Hunter's Moon follows the Harvest Moon (the Beaver Moon drops out that year),
// as the Old Farmer's Almanac does.

import { julianDayToDate, moonState, phaseJde, lunationNear, sunReaches, type PrincipalPhase } from '../moon.ts';
import type { CalendarContext, CalendarDate, CalendarDef, CalendarEvent, CalendarMark } from './types.ts';

const DAY_MS = 86_400_000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
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

const cache = new Map<number, Lunation>();
export function lunation(k: number): Lunation {
  let found = cache.get(k);
  if (!found) {
    const newMoon = phaseOf(k, 'new');
    found = {
      k,
      newMoon,
      firstQuarter: phaseOf(k, 'firstQuarter'),
      full: phaseOf(k, 'full'),
      lastQuarter: phaseOf(k, 'lastQuarter'),
      start: startOfDay(newMoon),
      next: startOfDay(phaseOf(k + 1, 'new')),
    };
    if (cache.size > 400) cache.clear();
    cache.set(k, found);
  }
  return found;
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
export type BlueRule = 'seasonal' | 'monthly';

const option = <T extends string>(ctx: CalendarContext, key: string, allowed: readonly T[], fallback: T): T => {
  const value = ctx.options[key];
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
};
const yearStartOf = (ctx: CalendarContext) => option<YearStart>(ctx, 'yearStart', ['winter-solstice', 'spring-equinox', 'samhain'], 'winter-solstice');
const nameStyleOf = (ctx: CalendarContext) => option<NameStyle>(ctx, 'names', ['folk', 'numbered'], 'folk');
const blueRuleOf = (ctx: CalendarContext) => option<BlueRule>(ctx, 'blue', ['seasonal', 'monthly'], 'seasonal');

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

type Season = 'winter' | 'spring' | 'summer' | 'autumn';
const SEASON_NAMES: Record<Season, [string, string, string]> = {
  winter: ['Wolf Moon', 'Snow Moon', 'Worm Moon'],
  spring: ['Pink Moon', 'Flower Moon', 'Strawberry Moon'],
  summer: ['Buck Moon', 'Sturgeon Moon', 'Corn Moon'],
  autumn: ['Hunter’s Moon', 'Beaver Moon', 'Cold Moon'],
};
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
  'Worm Moon': 'The ground softening and earthworms returning as winter ends.',
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
  'Blue Moon': 'An extra full moon: thirteen fell in the year instead of twelve.',
};

// Sun longitude where each season begins, north and south.
const SEASON_START: Record<'north' | 'south', Record<0 | 90 | 180 | 270, Season>> = {
  north: { 270: 'winter', 0: 'spring', 90: 'summer', 180: 'autumn' },
  south: { 90: 'winter', 180: 'spring', 270: 'summer', 0: 'autumn' },
};

/** The solstices and equinoxes around `date`, in order. */
function cardinalPoints(date: Date): { at: Date; longitude: 0 | 90 | 180 | 270 }[] {
  const out: { at: Date; longitude: 0 | 90 | 180 | 270 }[] = [];
  for (let y = date.getFullYear() - 1; y <= date.getFullYear() + 1; y++) {
    for (const longitude of [0, 90, 180, 270] as const) out.push({ at: sunReaches(y, longitude), longitude });
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

/** Folk name of a full moon by the Maine Farmers' Almanac's seasonal rule. */
function seasonalName(full: Date, south: boolean): string {
  const points = cardinalPoints(full);
  const i = points.findIndex((p, n) => p.at.getTime() <= full.getTime() && full.getTime() < points[n + 1].at.getTime());
  const season = SEASON_START[south ? 'south' : 'north'][points[i].longitude];
  const moons = fullMoonsBetween(points[i].at, points[i + 1].at);
  const position = moons.findIndex((m) => m.getTime() === full.getTime());
  let names = [...SEASON_NAMES[season]];
  if (season === 'summer' && isHarvestMoon(moons[moons.length - 1], south)) names = ['Buck Moon', 'Sturgeon Moon', 'Harvest Moon'];
  if (season === 'autumn' && isHarvestMoon(moons[0], south)) names = ['Harvest Moon', 'Hunter’s Moon', 'Cold Moon'];
  if (moons.length === 4) {
    if (position === 2) return 'Blue Moon';
    return names[position === 3 ? 2 : position];
  }
  return names[Math.min(position, 2)];
}

/** The full moon one lunation before `full`. */
function previousFull(full: Date): Date {
  for (let k = lunationNear(full) - 1; k <= lunationNear(full) + 2; k++) {
    if (lunation(k).full.getTime() === full.getTime()) return lunation(k - 1).full;
  }
  return new Date(full.getTime() - 29.53 * DAY_MS);
}

/** Folk name by calendar month, with the second full moon in a month a Blue Moon. */
function monthlyName(full: Date, south: boolean): string {
  const prior = previousFull(full);
  if (prior.getFullYear() === full.getFullYear() && prior.getMonth() === full.getMonth()) return 'Blue Moon';
  const turned = (full.getMonth() + (south ? 6 : 0)) % 12;
  // Harvest: the moon nearest the autumn equinox, in the (turned) ninth or tenth month.
  if ((turned === 8 || turned === 9) && isHarvestMoon(full, south)) return 'Harvest Moon';
  // When the Harvest Moon came in the tenth month, the Hunter's Moon follows in the eleventh.
  if (turned === 10 && isHarvestMoon(prior, south)) return 'Hunter’s Moon';
  return MONTH_NAMES[turned];
}

export function fullMoonName(full: Date, south: boolean, rule: BlueRule = 'seasonal'): string {
  return rule === 'monthly' ? monthlyName(full, south) : seasonalName(full, south);
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

type MoonInfo = { lunation: Lunation; year: LunarYear; number: number; day: number; name: string; numbered: string; folk: string };

function info(day: Date, ctx: CalendarContext): MoonInfo {
  const south = ctx.hemisphere === 'south';
  const year = lunarYearOf(day, yearStartOf(ctx), south);
  const here = lunationOf(day);
  const number = here.k - year.start.k + 1;
  const folk = fullMoonName(here.full, south, blueRuleOf(ctx));
  const numbered = `${ORDINAL_WORDS[number - 1] ?? `${ordinal(number)}`} Moon`;
  return { lunation: here, year, number, day: daysFrom(here.start, day) + 1, name: nameStyleOf(ctx) === 'numbered' ? numbered : folk, numbered, folk };
}

function marksOn(day: Date, l: Lunation): CalendarMark[] {
  const marks: CalendarMark[] = [];
  const add = (name: string) => marks.push({ name, meaning: MARK_MEANINGS[name] });
  if (sameDay(day, l.newMoon)) add('New Moon');
  if (sameDay(day, l.firstQuarter)) add('First Quarter');
  if (sameDay(day, l.full)) add('Full Moon');
  if (sameDay(day, l.lastQuarter)) add('Last Quarter');
  if (sameDay(addDays(day, 1), l.next)) add('Dark Moon');
  return marks;
}

function dateOf(day: Date, ctx: CalendarContext): CalendarDate {
  const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12);
  const m = info(at, ctx);
  const days = daysFrom(m.lunation.start, m.lunation.next);
  const phase = moonState(at).name.toLowerCase();
  const folkStyle = nameStyleOf(ctx) === 'folk';
  const short = folkStyle ? `${m.name} · day ${m.day}` : `Moon ${m.number} · day ${m.day}`;
  const of = `${ordinal(m.day)} day of the ${m.name}`;
  const which = folkStyle ? `, the ${ORDINAL_WORDS[m.number - 1]?.toLowerCase() ?? ordinal(m.number)} moon of the year` : `, the ${m.folk}`;
  const phaseWords = phase === 'new moon' || phase === 'full moon' ? `the ${phase}` : phase === 'first quarter' || phase === 'last quarter' ? `the moon at its ${phase}` : `the moon ${phase}`;
  const startYear = m.year.start.start;
  const endYear = addDays(m.year.next.start, -1);
  const label = startYear.getFullYear() === endYear.getFullYear() ? String(startYear.getFullYear()) : `${startYear.getFullYear()}–${String(endYear.getFullYear()).slice(-2)}`;
  return {
    calendar: 'moon',
    short,
    long: `The ${of}${which}: ${phaseWords}.`,
    month: { name: m.name, index: m.number, days, meaning: MOON_MEANINGS[m.folk] },
    day: m.day,
    year: { label: `Lunar year ${label} · ${m.year.months.length} moons, from ${SHORT_MONTH[startYear.getMonth()]} ${startYear.getDate()}, ${startYear.getFullYear()}` },
    marks: marksOn(at, m.lunation),
  };
}

function eventsBetween(from: Date, to: Date, ctx: CalendarContext): CalendarEvent[] {
  const first = startOfDay(from).getTime();
  const last = startOfDay(to).getTime();
  const out: CalendarEvent[] = [];
  const south = ctx.hemisphere === 'south';
  const numberedStyle = nameStyleOf(ctx) === 'numbered';
  let l = lunationOf(from);
  if (l.start.getTime() < first && startOfDay(l.full).getTime() < first) l = lunation(l.k + 1);
  for (; l.start.getTime() <= last; l = lunation(l.k + 1)) {
    const year = lunarYearOf(l.start, yearStartOf(ctx), south);
    const number = l.k - year.start.k + 1;
    const folk = fullMoonName(l.full, south, blueRuleOf(ctx));
    const numbered = `${ORDINAL_WORDS[number - 1] ?? ordinal(number)} Moon`;
    const name = numberedStyle ? numbered : folk;
    if (l.start.getTime() >= first) {
      out.push({
        calendar: 'moon',
        id: `moon-new-${dayKey(l.start)}`,
        name: number === 1 ? `${name} begins · the lunar new year` : `${name} begins`,
        meaning: `New moon: day 1 of the ${numberedStyle ? `${ORDINAL_WORDS[number - 1]?.toLowerCase()} moon` : `${ORDINAL_WORDS[number - 1]?.toLowerCase()} moon of the year, the ${folk}`}.${number === 1 ? ' The first new moon of the lunar year.' : ''}`,
        date: l.start,
        days: 1,
      });
    }
    const fullDay = startOfDay(l.full);
    if (fullDay.getTime() >= first && fullDay.getTime() <= last) {
      out.push({
        calendar: 'moon',
        id: `moon-full-${dayKey(fullDay)}`,
        name: numberedStyle ? `Full moon of the ${numbered}` : `The ${folk} is full`,
        meaning: MOON_MEANINGS[folk] ?? 'The full moon.',
        date: fullDay,
        days: 1,
      });
    }
  }
  return out.filter((e) => e.date.getTime() >= first && e.date.getTime() <= last);
}

export const MOON_CALENDAR: CalendarDef = {
  id: 'moon',
  name: 'The moon’s months',
  confidence: 'historical',
  about:
    'Counting months by the moon is one of the oldest ways of keeping time, used across the ancient world and still kept in the Hebrew, Islamic, Chinese and Hindu calendars. Here each month runs from one new moon to the next, and day 1 is the day the new moon falls where you are; many older calendars began instead at the first thin crescent, a day or two later. The way the months are gathered into a year is a modern convention: by default the year begins at the first new moon on or after the winter solstice, with the first new moon after the spring equinox, or after Samhain, as other choices. The folk names (Wolf, Snow, Worm and the rest) come from the Old Farmer’s Almanac’s mix of Algonquian, Colonial American and European names; they follow the northern seasons, so they are turned six months south of the equator. A Blue Moon is, by the old Maine Farmers’ Almanac rule, the third full moon of a season that has four; the popular “second full moon in a month” comes from a 1946 misreading of it.',
  choices: [
    {
      key: 'names',
      label: 'Name the months',
      default: 'folk',
      options: [
        { value: 'folk', label: 'Folk full moon names', note: 'Wolf, Snow, Worm, Pink…, turned for the southern hemisphere.' },
        { value: 'numbered', label: 'First Moon, Second Moon…', note: 'Simply counted from the start of the year.' },
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
        { value: 'seasonal', label: 'The third of four in a season', note: 'The Maine Farmers’ Almanac’s original rule.' },
        { value: 'monthly', label: 'The second in a month', note: 'The popular modern meaning; the other moons are named by month.' },
      ],
    },
  ],
  sources: [
    'Jean Meeus, Astronomical Algorithms (2nd ed., 1998), ch. 49, for the moon’s phases',
    'https://aa.usno.navy.mil/data/MoonPhases',
    'https://skyandtelescope.org/astronomy-resources/what-is-a-blue-moon/',
    'https://www.almanac.com/full-moon-names',
  ],
  dateOf,
  eventsBetween,
};
