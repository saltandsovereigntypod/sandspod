// The Egyptian civil calendar, as modern Kemetic practitioners keep it:
// three seasons (Akhet, the flood; Peret, the growing; Shemu, the harvest)
// of four 30-day months, then five epagomenal days, the birthdays of
// Osiris, Horus, Set, Isis and Nephthys. The ancient civil year had no leap
// day, so it slipped against the seasons by a day every four years and went
// all the way round in about 1,460 years (the Sothic cycle). Modern groups
// pin the new year (Wep Ronpet) to something fixed instead; which one is
// the person's choice here:
//   'sirius': the heliacal rising of Sirius (Sopdet), its first dawn
//             appearance after weeks hidden in the Sun's glare, computed for
//             where the person is, or for Cairo when we don't know;
//   'coptic': 1 Thout of the Coptic calendar, Nayrouz, 11 September (12th
//             before a Gregorian leap year), the Egyptian calendar's living
//             descendant;
//   'aug1':   1 August, a fixed date some modern groups use.
// Each year then runs 12 × 30 days from Wep Ronpet, and the epagomenal days
// fill the gap to the next one: five, or six when the anchor moves a day
// (the Coptic leap day, a sighting a day later, a Gregorian leap year). Pure.

import { startOfDay } from '../calendar.ts';
import { dateToJulianDay, nextPhase, sunLongitude } from '../moon.ts';
import type { CalendarContext, CalendarDate, CalendarDef, CalendarEvent, CalendarMark, Place } from './types.ts';

const DAY_MS = 86_400_000;
const HOUR = 3_600_000;
const RAD = Math.PI / 180;
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const daysApart = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);

export const CAIRO: Place = { latitude: 30.04, longitude: 31.24 };

// ─── Sirius ──────────────────────────────────────────────────────────────

// Sirius at J2000 (Hipparcos): RA 06h 45m 08.917s, Dec −16° 42′ 58.02″,
// proper motion −546.01 mas/yr in RA·cos(Dec), −1223.07 mas/yr in Dec.
const SIRIUS_RA = 101.287155;
const SIRIUS_DEC = -16.716116;
const PM_RA = -546.01 / 3_600_000;
const PM_DEC = -1223.07 / 3_600_000;

/** Sirius's right ascension and declination (degrees) at `date`: proper motion, then precession (Meeus 21.3). */
export function siriusPosition(date: Date): { ra: number; dec: number } {
  const T = (dateToJulianDay(date) - 2451545.0) / 36525;
  const years = T * 100;
  const a0 = (SIRIUS_RA + (PM_RA * years) / Math.cos(SIRIUS_DEC * RAD)) * RAD;
  const d0 = (SIRIUS_DEC + PM_DEC * years) * RAD;
  const zeta = ((2306.2181 * T + 0.30188 * T * T + 0.017998 * T ** 3) / 3600) * RAD;
  const z = ((2306.2181 * T + 1.09468 * T * T + 0.018203 * T ** 3) / 3600) * RAD;
  const theta = ((2004.3109 * T - 0.42665 * T * T - 0.041833 * T ** 3) / 3600) * RAD;
  const A = Math.cos(d0) * Math.sin(a0 + zeta);
  const B = Math.cos(theta) * Math.cos(d0) * Math.cos(a0 + zeta) - Math.sin(theta) * Math.sin(d0);
  const C = Math.sin(theta) * Math.cos(d0) * Math.cos(a0 + zeta) + Math.cos(theta) * Math.sin(d0);
  return { ra: ((Math.atan2(A, B) + z) / RAD + 360) % 360, dec: Math.asin(C) / RAD };
}

function altitude(date: Date, place: Place, ra: number, dec: number): number {
  const jd = dateToJulianDay(date);
  const T = (jd - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  const H = (gmst + place.longitude - ra) * RAD;
  const phi = place.latitude * RAD;
  const d = dec * RAD;
  return Math.asin(Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H)) / RAD;
}

function sunAltitude(date: Date, place: Place): number {
  const T = (dateToJulianDay(date) - 2451545.0) / 36525;
  const eps = (23.439291 - 0.0130042 * T) * RAD;
  const l = sunLongitude(date) * RAD;
  const ra = (Math.atan2(Math.sin(l) * Math.cos(eps), Math.cos(l)) / RAD + 360) % 360;
  const dec = Math.asin(Math.sin(eps) * Math.sin(l)) / RAD;
  return altitude(date, place, ra, dec);
}

// Sirius can first be glimpsed when it stands about 2° up while the Sun is
// still at least 7° below the horizon (an arcus visionis of about 9°; Sky &
// Telescope, after Schaefer). Real sightings vary by a day or two with the
// haze on the horizon and the watcher's eyes.
const STAR_ALTITUDE = 2;
const SUN_DEPRESSION = -7;

/** Whether Sirius can be seen rising before dawn on the morning of `day` at `place`. */
export function siriusVisibleAtDawn(day: Date, place: Place): boolean {
  // The place's own midnight (by longitude), so the search follows its morning.
  const midnight = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) - (place.longitude / 15) * HOUR;
  const { ra, dec } = siriusPosition(new Date(midnight));
  let prev = altitude(new Date(midnight), place, ra, dec);
  for (let t = midnight + 4 * 60_000; t <= midnight + 12 * HOUR; t += 4 * 60_000) {
    const alt = altitude(new Date(t), place, ra, dec);
    if (prev < STAR_ALTITUDE && alt >= STAR_ALTITUDE) return sunAltitude(new Date(t), place) <= SUN_DEPRESSION;
    prev = alt;
  }
  return false;
}

const risingCache = new Map<string, Date | null>();

/**
 * The heliacal rising of Sirius in `year` at `place`: the first morning it
 * is seen again after its season hidden in the Sun's light. Null where it
 * never disappears or never rises (the far north and far south).
 */
export function heliacalRisingOfSirius(year: number, place: Place): Date | null {
  const key = `${year}|${place.latitude.toFixed(1)}|${place.longitude.toFixed(1)}`;
  if (risingCache.has(key)) return risingCache.get(key)!;
  let result: Date | null = null;
  let hidden = false;
  for (let day = new Date(year, 4, 1); day.getMonth() < 9; day = addDays(day, 1)) {
    const seen = siriusVisibleAtDawn(day, place);
    if (!seen) hidden = true;
    else if (hidden) { result = day; break; }
  }
  risingCache.set(key, result);
  return result;
}

// ─── The year ────────────────────────────────────────────────────────────

export type NewYearChoice = 'sirius' | 'coptic' | 'aug1';

const isLeap = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

function choiceOf(ctx: CalendarContext): NewYearChoice {
  const value = ctx.options.kemeticNewYear;
  return value === 'coptic' || value === 'aug1' ? value : 'sirius';
}

/** Where Sirius is watched for: the person's place, or Cairo when unknown or where it never rises heliacally. */
function siriusPlace(year: number, ctx: CalendarContext): { place: Place; local: boolean } {
  if (ctx.place && heliacalRisingOfSirius(year, ctx.place)) return { place: ctx.place, local: true };
  return { place: CAIRO, local: false };
}

/** Wep Ronpet, the first day of the Kemetic year beginning in `year`. */
export function wepRonpet(year: number, ctx: CalendarContext): Date {
  switch (choiceOf(ctx)) {
    case 'coptic':
      // Valid 1900–2099, while the Julian–Gregorian gap is 13 days.
      return new Date(year, 8, isLeap(year + 1) ? 12 : 11);
    case 'aug1':
      return new Date(year, 7, 1);
    case 'sirius':
      return heliacalRisingOfSirius(year, siriusPlace(year, ctx).place) ?? new Date(year, 7, 3);
  }
}

type Month = { egyptian: string; greek: string; coptic: string; meaning: string };

const SEASONS = [
  { name: 'Akhet', meaning: 'the season of the flood' },
  { name: 'Peret', meaning: 'the season of emergence, of sowing and growing' },
  { name: 'Shemu', meaning: 'the season of harvest and low water' },
];

const MONTHS: Month[] = [
  { egyptian: 'Djehuty', greek: 'Thoth', coptic: 'Thout', meaning: 'Thoth’s month, as the flood rises.' },
  { egyptian: 'Pa-en-Ipet', greek: 'Phaophi', coptic: 'Paopi', meaning: '“The one of Opet”, the month of Amun’s great festival at Thebes.' },
  { egyptian: 'Hut-Hor', greek: 'Athyr', coptic: 'Hathor', meaning: 'Hathor’s month, when the flood is at its height.' },
  { egyptian: 'Ka-her-ka', greek: 'Khoiak', coptic: 'Koiak', meaning: '“Ka upon ka”, the month of the Mysteries of Osiris, as the waters fall.' },
  { egyptian: 'Sef-bedet', greek: 'Tybi', coptic: 'Tobi', meaning: 'The first month of Peret, as the fields emerge and are sown.' },
  { egyptian: 'Rekeh-wer', greek: 'Mekhir', coptic: 'Meshir', meaning: '“The great burning”, perhaps of the fields being cleared.' },
  { egyptian: 'Rekeh-nedjes', greek: 'Phamenoth', coptic: 'Paremhat', meaning: '“The little burning”; later named for the deified king Amenhotep I.' },
  { egyptian: 'Renenutet', greek: 'Pharmuthi', coptic: 'Parmouti', meaning: 'The month of Renenutet, the cobra goddess of the harvest and nourishment.' },
  { egyptian: 'Khonsu', greek: 'Pachons', coptic: 'Pashons', meaning: 'The month of Khonsu, the moon god, as the harvest begins.' },
  { egyptian: 'Khenti-khety', greek: 'Payni', coptic: 'Paoni', meaning: 'Later called “the one of the Valley”, for the Beautiful Feast of the Valley at Thebes.' },
  { egyptian: 'Ipet-hemet', greek: 'Epiphi', coptic: 'Epip', meaning: 'The month of Ipet-hemet, in the heat of low water.' },
  { egyptian: 'Mesut-Ra', greek: 'Mesore', coptic: 'Mesori', meaning: '“The birth of Ra”, the last month, when the new year is awaited (in older lists, Wep-renpet).' },
];

const EPAGOMENAL = [
  { id: 'birth-osiris', name: 'Birthday of Osiris', meaning: 'The first day “upon the year” (heriu renpet), the birthday of Osiris, lord of the dead and of the rising flood.' },
  { id: 'birth-horus', name: 'Birthday of Horus', meaning: 'The second epagomenal day, the birthday of Horus the Elder (Heru-wer), the falcon of the sky.' },
  { id: 'birth-set', name: 'Birthday of Set', meaning: 'The third epagomenal day, the birthday of Set, god of storms and the desert. The ancient calendars counted it an unlucky day, best spent quietly.' },
  { id: 'birth-isis', name: 'Birthday of Isis', meaning: 'The fourth epagomenal day, the birthday of Isis, great of magic, wife of Osiris and mother of Horus.' },
  { id: 'birth-nephthys', name: 'Birthday of Nephthys', meaning: 'The fifth epagomenal day, the birthday of Nephthys, lady of the house, mourner and protector of the dead.' },
];

const SIXTH_DAY = { id: 'epagomenal-6', name: 'Sixth epagomenal day', meaning: 'An extra day before the new year, which the ancient civil year never had: the anchor of the new year moved a day (a Coptic or Gregorian leap year, or Sirius rising a day later).' };

type KemeticDay = {
  year: number;
  start: Date;
  length: number;
  /** 0-based day of the year. */
  offset: number;
};

function locate(date: Date, ctx: CalendarContext): KemeticDay {
  const day = startOfDay(date);
  let year = day.getFullYear();
  if (day.getTime() < wepRonpet(year, ctx).getTime()) year -= 1;
  const start = wepRonpet(year, ctx);
  return { year, start, length: daysApart(start, wepRonpet(year + 1, ctx)), offset: daysApart(start, day) };
}

/** The Kemetic month and day of an ordinary date. */
export function kemeticDay(date: Date, ctx: CalendarContext):
  | { kind: 'month'; month: number; day: number; season: number; year: number }
  | { kind: 'epagomenal'; day: number; of: number; year: number } {
  const k = locate(date, ctx);
  if (k.offset < 360) {
    const month = Math.floor(k.offset / 30);
    return { kind: 'month', month: month + 1, day: (k.offset % 30) + 1, season: Math.floor(month / 4), year: k.year };
  }
  return { kind: 'epagomenal', day: k.offset - 359, of: k.length - 360, year: k.year };
}

// ─── Festivals ───────────────────────────────────────────────────────────

const WEP_RONPET = 'Wep Ronpet, “the opening of the year”: the new year, once awaited with the rising of Sirius and the Nile flood. A time of purification, new beginnings, and wishing one another a good year.';

function yearEvents(year: number, ctx: CalendarContext): CalendarEvent[] {
  const start = wepRonpet(year, ctx);
  const length = daysApart(start, wepRonpet(year + 1, ctx));
  const at = (month: number, day: number) => addDays(start, (month - 1) * 30 + day - 1);
  const ev = (id: string, name: string, meaning: string, date: Date, days = 1): CalendarEvent => ({ calendar: 'kemetic', id: `kemetic-${id}`, name, meaning, date, days });
  const out: CalendarEvent[] = [
    ev('wep-ronpet', 'Wep Ronpet', WEP_RONPET, start),
    ev('wag', 'Wag festival', 'A festival of the dead on I Akhet 18, linked to Osiris: offerings at the tombs, and little paper boats set facing west. Its eve was the 17th; in some periods it followed the moon instead.', at(1, 18)),
    ev('thoth', 'Feast of Thoth', 'The great festival of Thoth on I Akhet 19, kept with the Wag in the Medinet Habu calendar. Plutarch tells that on this day people ate honey and figs, saying “sweet is truth”.', at(1, 19)),
    ev('opet', 'Opet festival', 'Amun, Mut and Khonsu travel in their barques from Karnak to Luxor temple, renewing the king’s divine power. Under Thutmose III it began on II Akhet 15 and lasted 11 days (given here); by Ramesses III it ran over three weeks.', at(2, 15), 11),
    ev('khoiak', 'Mysteries of Osiris (Khoiak)', 'The Khoiak festival, IV Akhet 12–30: figures of Osiris are made of earth and grain and buried so that they sprout, the god is mourned and renewed, and on the last day the djed pillar is raised.', at(4, 12), 19),
  ];
  // The Beautiful Feast of the Valley began at the new moon of II Shemu.
  // The Egyptian lunar month began on the morning the old crescent could no
  // longer be seen, close to the astronomical new moon, so this is approximate.
  const shemu2 = at(10, 1);
  const newMoon = startOfDay(nextPhase(addDays(shemu2, -1), 'new'));
  if (newMoon.getTime() < at(11, 1).getTime()) {
    out.push(ev('valley', 'Beautiful Feast of the Valley', 'At the new moon of II Shemu, Amun crossed the Nile from Karnak to visit the temples of the west bank at Thebes, and families feasted with their dead at the tombs, through the night with flowers and music. Lunar, so the day here is approximate.', newMoon));
  }
  for (let i = 0; i < length - 360; i++) {
    const e = EPAGOMENAL[i] ?? SIXTH_DAY;
    out.push(ev(e.id, e.name, e.meaning, addDays(start, 360 + i)));
  }
  return out;
}

function eventsBetween(from: Date, to: Date, ctx: CalendarContext): CalendarEvent[] {
  const start = startOfDay(from).getTime();
  const end = to.getTime();
  const out: CalendarEvent[] = [];
  for (let year = from.getFullYear() - 1; year <= to.getFullYear(); year++) {
    for (const e of yearEvents(year, ctx)) {
      if (addDays(e.date, e.days - 1).getTime() < start || e.date.getTime() > end) continue;
      out.push(e);
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime() || a.name.localeCompare(b.name));
}

const ORD = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
const ROMAN = ['I', 'II', 'III', 'IV'];

function dateOf(date: Date, ctx: CalendarContext): CalendarDate {
  const day = startOfDay(date);
  const k = kemeticDay(day, ctx);
  const choice = choiceOf(ctx);
  const anchor =
    choice === 'coptic' ? 'from Nayrouz' : choice === 'aug1' ? 'from 1 August' : siriusPlace(k.year, ctx).local ? 'from Sirius’s rising here' : 'from Sirius’s rising at Cairo';
  const year = { label: `Kemetic year ${k.year}/${String((k.year + 1) % 100).padStart(2, '0')}, ${anchor}` };
  const marks: CalendarMark[] = eventsBetween(day, new Date(day.getTime() + DAY_MS - 1), ctx)
    .filter((e) => e.id !== 'kemetic-wep-ronpet' || e.date.getTime() === day.getTime())
    .map((e) => ({ name: e.name, meaning: e.meaning }));
  if (k.kind === 'epagomenal') {
    const e = EPAGOMENAL[k.day - 1] ?? SIXTH_DAY;
    return {
      calendar: 'kemetic',
      short: `${e.name} · day ${k.day} upon the year`,
      long: `The ${ORD(k.day)} of the ${k.of} days “upon the year” (the epagomenal days) at the close of the year: ${e.meaning[0].toLowerCase()}${e.meaning.slice(1)}`,
      day: k.day,
      year,
      marks,
    };
  }
  const month = MONTHS[k.month - 1];
  const season = SEASONS[k.season];
  const inSeason = ROMAN[(k.month - 1) % 4];
  return {
    calendar: 'kemetic',
    short: `${inSeason} ${season.name} ${k.day} · ${month.greek}`,
    long: `The ${ORD(k.day)} day of ${month.greek} (${month.egyptian}; Coptic ${month.coptic}), the ${['first', 'second', 'third', 'fourth'][(k.month - 1) % 4]} month of ${season.name}, ${season.meaning}. ${month.meaning}`,
    month: { name: month.greek, index: k.month, days: 30, meaning: `${month.egyptian}; Coptic ${month.coptic}. ${month.meaning}` },
    day: k.day,
    year,
    marks,
  };
}

export const KEMETIC_CALENDAR: CalendarDef = {
  id: 'kemetic',
  name: 'Kemetic (Egyptian) calendar',
  path: 'egyptian',
  confidence: 'historical',
  about:
    'The civil calendar of ancient Egypt: three seasons, Akhet (the flood), Peret (growing) and Shemu (harvest), each of four 30-day months, then five days “upon the year”, the birthdays of Osiris, Horus, Set, Isis and Nephthys. The calendar itself is well known; how to line it up with ours is a modern choice. The ancient year was always 365 days with no leap day, so it slid a quarter-day a year against the seasons and the rising of Sirius, coming back into line only every 1,460 years or so; festivals were also kept by a separate lunar calendar. Modern Kemetic groups fix the new year instead: many watch for the heliacal rising of Sirius, its first dawn appearance (around 3 August at Cairo today, earlier further south); some follow the Coptic Church’s Nayrouz on 11 or 12 September; some simply use 1 August. When the new year moves, the closing days stretch to five or six to meet it. The Sirius date is calculated for where you are (or Cairo if your place isn’t known) and may differ by a day or two from what an observer sees. Festival dates come from temple calendars (Medinet Habu, Dendera) and changed over Egypt’s three thousand years; lunar feasts are approximate.',
  choices: [
    {
      key: 'kemeticNewYear',
      label: 'When the year begins',
      default: 'sirius',
      options: [
        { value: 'sirius', label: 'The rising of Sirius', note: 'The morning Sirius first appears before dawn, worked out for your place (Cairo if unknown). Around 3 August in Egypt.' },
        { value: 'coptic', label: 'Nayrouz (Coptic new year)', note: '11 September, or 12 September before a leap year, as the Coptic Church keeps it.' },
        { value: 'aug1', label: '1 August', note: 'A fixed date some modern groups use.' },
      ],
    },
  ],
  sources: [
    'R. A. Parker, The Calendars of Ancient Egypt (1950)',
    'S. Schott, Altägyptische Festdaten (1950); the Medinet Habu festival calendar',
    'J. P. Allen, Middle Egyptian (3rd ed.), on the calendar',
    'https://en.wikipedia.org/wiki/Egyptian_calendar',
    'https://en.wikipedia.org/wiki/Coptic_calendar',
    'https://en.wikipedia.org/wiki/Opet_Festival',
    'https://en.wikipedia.org/wiki/Beautiful_Festival_of_the_Valley',
    'https://skyandtelescope.org/observing/a-real-scorcher-sirius-at-heliacal-rising/',
    'https://anefest.spbu.ru/en/articles/ancient-minor-asia/164-wag-festival-egypt.html',
    'https://ancientegyptonline.co.uk/festivalcalendar/',
  ],
  dateOf: (day, ctx) => dateOf(day, ctx),
  eventsBetween: (from, to, ctx) => eventsBetween(from, to, ctx),
};
