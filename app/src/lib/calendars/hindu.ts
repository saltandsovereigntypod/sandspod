// The Hindu lunar calendar (pañcāṅga): the tithi (lunar day), the paksha
// (fortnight) and the lunar month, the way a panchang counts them.
//
// - A tithi is the time the Moon takes to gain 12° on the Sun, so there are
//   30 in a lunar month. Elongation is a difference of two longitudes, so it
//   is the same in the tropical and sidereal zodiacs.
// - The day is named by the tithi in force at local sunrise (udaya tithi).
//   Some tithis never touch a sunrise (kshaya) and some touch two (vriddhi).
// - Lunar months are named from the sidereal (nirayana) sign the Sun is in
//   when the month begins: a new moon with the Sun in Mīna (sidereal Pisces)
//   opens Chaitra. A month with no solar ingress (sankranti) inside it is an
//   adhika (extra) month and takes the name of the month after it. Sidereal
//   longitudes use the Lahiri (Chitrapaksha) ayanamsa, the one the Indian
//   national calendar uses.
//
// - A month with two sankrantis (a kshaya, "lost", month) is not modelled: the
//   last was in 1983 and the next is not expected until the 2120s.
//
// Observances use the rules panchangs commonly give, which are not all
// "tithi at sunrise": Sankashti at moonrise, Pradosh at dusk, Vinayaka and
// Ganesh Chaturthi at midday, Diwali (Lakshmi Puja) in the evening, Maha
// Shivaratri at midnight (nishita), Holika Dahan in the evening with the
// Bhadra rule. Many communities and temples use other rules, so every date
// carries that note. Pure; no React.

import { dateToJulianDay, moonLongitude, sunLongitude } from '../moon.ts';
import { moonTimes, sunTimes } from '../astro/rise.ts';
import type { CalendarContext, CalendarDate, CalendarDef, CalendarEvent, CalendarMark, Place } from './types.ts';

const DAY_MS = 86_400_000;
const HOUR = 3_600_000;
const norm = (deg: number) => ((deg % 360) + 360) % 360;
const signed = (deg: number) => norm(deg + 180) - 180;

/** Ujjain, the old prime meridian of Indian astronomy, used when no place is known. */
export const UJJAIN: Place = { latitude: 23.1765, longitude: 75.7885 };

export const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami',
  'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi',
] as const;

/** Amānta month names from Chaitra, with the nakshatra its full moon sits near. */
export const HINDU_MONTHS: { name: string; meaning: string }[] = [
  { name: 'Chaitra', meaning: 'named for Chitra (Spica), the star its full moon sits near; the lunar year begins here' },
  { name: 'Vaishakha', meaning: 'named for the nakshatra Vishakha, near its full moon' },
  { name: 'Jyeshtha', meaning: 'named for Jyeshtha (Antares), “the eldest”, near its full moon' },
  { name: 'Ashadha', meaning: 'named for the nakshatras Purva and Uttara Ashadha, near its full moon; the rains begin' },
  { name: 'Shravana', meaning: 'named for Shravana, “hearing”, near its full moon; the heart of the monsoon' },
  { name: 'Bhadrapada', meaning: 'named for the nakshatras Purva and Uttara Bhadrapada, near its full moon' },
  { name: 'Ashvin', meaning: 'named for Ashvini, the nakshatra of the Ashvins, the divine twin horsemen, near its full moon' },
  { name: 'Kartika', meaning: 'named for Krittika (the Pleiades), near its full moon; a month of lamps' },
  { name: 'Margashirsha', meaning: 'named for Mrigashira, “the deer’s head”, near its full moon' },
  { name: 'Pausha', meaning: 'named for Pushya, “nourishing”, near its full moon' },
  { name: 'Magha', meaning: 'named for the nakshatra Magha, near its full moon' },
  { name: 'Phalguna', meaning: 'named for the nakshatras Purva and Uttara Phalguni, near its full moon, when Holi is kept; the last month of the lunar year' },
];

// ─── Astronomy ───────────────────────────────────────────────────────────

/**
 * Lahiri (Chitrapaksha) ayanamsa in degrees: 23°51′25.5″ at J2000 (the
 * Indian Astronomical Ephemeris value), carried forward by general precession
 * in longitude (Lieske 1977). Good to about 0.01° over this century.
 */
export function lahiriAyanamsa(date: Date): number {
  const T = (dateToJulianDay(date) - 2451545.0) / 36525;
  return 23.857083 + 1.396971 * T + 0.0003086 * T * T;
}

/** The Sun's sidereal (nirayana) sign, 0 = Mesha (Aries) … 11 = Mīna (Pisces). */
export function siderealSunSign(date: Date): number {
  return Math.floor(norm(sunLongitude(date) - lahiriAyanamsa(date)) / 30) % 12;
}

/** How far the Moon is ahead of the Sun, 0–360°. */
export function elongation(date: Date): number {
  return norm(moonLongitude(date) - sunLongitude(date));
}

/** Tithi in force at an instant: 1–15 Shukla (15 = Purnima), 16–30 Krishna (30 = Amavasya). */
export function tithiAt(date: Date): number {
  return Math.min(30, Math.floor(elongation(date) / 12) + 1);
}

// Mean rate of elongation, degrees per millisecond.
const RATE = 360 / (29.530588861 * DAY_MS);

/** The instant elongation reaches `target` nearest to `guess`. */
function solveElongation(guess: number, target: number): number {
  let t = guess;
  for (let i = 0; i < 12; i += 1) {
    const delta = signed(elongation(new Date(t)) - target);
    if (Math.abs(delta) < 1e-6) break;
    t -= delta / RATE;
  }
  return t;
}

/** The new moon (elongation 0) at or before `date`. */
function newMoonBefore(date: Date): number {
  const t = solveElongation(date.getTime() - elongation(date) / RATE, 0);
  return t > date.getTime() ? solveElongation(t - 29.53 * DAY_MS, 0) : t;
}

type LunarMonth = { index: number; adhika: boolean; start: number; end: number };
const monthCache = new Map<number, LunarMonth>();

/** The amānta lunar month (new moon to new moon) containing `date`. */
export function lunarMonthAt(date: Date): LunarMonth {
  const start = newMoonBefore(date);
  const key = Math.round(start / HOUR);
  const cached = monthCache.get(key);
  if (cached) return cached;
  const end = solveElongation(start + 29.53 * DAY_MS, 0);
  const startSign = siderealSunSign(new Date(start));
  const endSign = siderealSunSign(new Date(end));
  const month = { index: (startSign + 1) % 12, adhika: startSign === endSign, start, end };
  if (monthCache.size > 400) monthCache.clear();
  monthCache.set(key, month);
  return month;
}

// ─── The civil day ───────────────────────────────────────────────────────

type DayParts = { sunrise: Date; sunset: Date; place: Place; placeName: string };

function placeFor(ctx: CalendarContext): { place: Place; placeName: string } {
  if (ctx.options.hinduSunrise !== 'ujjain' && ctx.place) return { place: ctx.place, placeName: 'where you are' };
  return { place: UJJAIN, placeName: 'Ujjain' };
}

const partsCache = new Map<string, DayParts>();

function dayParts(day: Date, ctx: CalendarContext): DayParts {
  const { place, placeName } = placeFor(ctx);
  const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}@${place.latitude},${place.longitude}`;
  const cached = partsCache.get(key);
  if (cached) return cached;
  const parts = computeDayParts(day, place, placeName);
  if (partsCache.size > 2000) partsCache.clear();
  partsCache.set(key, parts);
  return parts;
}

function computeDayParts(day: Date, place: Place, placeName: string): DayParts {
  const times = sunTimes(day, place);
  // Near the poles, when the Sun doesn't rise or set, fall back to 6am and 6pm local solar time.
  const solarMidnight = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) - (place.longitude / 15) * HOUR;
  return {
    sunrise: times.rise ?? new Date(solarMidnight + 6 * HOUR),
    sunset: times.set ?? new Date(solarMidnight + 18 * HOUR),
    place,
    placeName,
  };
}

const midday = (p: DayParts) => new Date((p.sunrise.getTime() + p.sunset.getTime()) / 2);
// Pradosh kaal runs about 1½ hours (some say 2h24m) from sunset; its middle stands for it.
const dusk = (p: DayParts) => new Date(p.sunset.getTime() + 45 * 60_000);
// Diwali's Lakshmi Puja is done in pradosh, the first part of the night.
const evening = (p: DayParts) => new Date(p.sunset.getTime() + HOUR);

export type Tithi = { number: number; paksha: 'Shukla' | 'Krishna'; inPaksha: number; name: string };

export function describeTithi(n: number): Tithi {
  const paksha = n <= 15 ? 'Shukla' : 'Krishna';
  const inPaksha = n <= 15 ? n : n - 15;
  const name = n === 15 ? 'Purnima' : n === 30 ? 'Amavasya' : TITHI_NAMES[inPaksha - 1];
  return { number: n, paksha, inPaksha, name };
}

/** Month name for the scheme: pūrṇimānta months begin after the full moon, a fortnight earlier. */
function monthName(month: LunarMonth, tithi: number, scheme: string): { index: number; name: string; adhika: boolean } {
  let index = month.index;
  let adhika = month.adhika;
  if (scheme === 'purnimanta' && tithi > 15 && !month.adhika) {
    // The dark fortnight belongs to the next month. An adhika month is the
    // same new-moon-to-new-moon span in both schemes (it sits between the
    // dark and bright halves of the nija month), so it is left as it is.
    index = lunarMonthAt(new Date(month.end + HOUR)).index;
    adhika = false;
  }
  return { index, name: `${adhika ? 'Adhika ' : ''}${HINDU_MONTHS[index].name}`, adhika };
}

const ORDINAL = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;

const CONFIRM = 'Confirm the day with a local panchang or temple: communities use different rules and their own sunrise.';

const MEANINGS = {
  ekadashi: `The eleventh lunar day, sacred to Vishnu, kept by many with a fast from grains and beans, prayer and a quiet mind. Vaishnava calendars sometimes keep it a day later (when the tenth tithi touches the pre-dawn). ${CONFIRM}`,
  purnima: `The full-moon day: a day for vows (vrat), offerings, the Satyanarayana puja in many homes, and many festivals. ${CONFIRM}`,
  amavasya: `The new-moon day, when offerings (tarpan) are made for the ancestors and new beginnings are often avoided. ${CONFIRM}`,
  vinayaka: `Vinayaka Chaturthi, the fourth day of the bright fortnight, kept for Ganesha with worship at midday. ${CONFIRM}`,
  sankashti: `Sankashti Chaturthi, the fourth day of the dark fortnight: a fast for Ganesha, “remover of obstacles”, broken after seeing the moon rise. ${CONFIRM}`,
  pradosh: `Pradosh, the thirteenth lunar day, when Shiva is worshipped at dusk. ${CONFIRM}`,
};

type Observance = { id: string; mark: CalendarMark };

/** The tithi skipped between this sunrise and the next (a kshaya tithi), if any. */
function skippedAfter(day: Date, ctx: CalendarContext, sunriseTithi: number): number | null {
  const next = tithiAt(dayParts(addDays(day, 1), ctx).sunrise);
  return (next - sunriseTithi + 30) % 30 === 2 ? (sunriseTithi % 30) + 1 : null;
}

/** Tithi at moonrise on `day`, or null when the Moon doesn't rise that day. */
function moonriseTithi(day: Date, place: Place): number | null {
  const rise = moonTimes(day, place).rise;
  return rise ? tithiAt(rise) : null;
}

function observancesOn(day: Date, ctx: CalendarContext, parts: DayParts, sunriseTithi: number): Observance[] {
  const found: Observance[] = [];
  // A tithi that touches no sunrise is kept on the day it begins.
  const skipped = skippedAfter(day, ctx, sunriseTithi);
  const held = (n: number) => sunriseTithi === n || skipped === n;
  if (held(11) || held(26)) {
    const paksha = held(11) ? 'Shukla' : 'Krishna';
    found.push({ id: `hindu-ekadashi-${paksha.toLowerCase()}`, mark: { name: `${paksha} Ekadashi`, meaning: MEANINGS.ekadashi } });
  }
  if (held(15)) found.push({ id: 'hindu-purnima', mark: { name: 'Purnima', meaning: MEANINGS.purnima } });
  if (held(30)) found.push({ id: 'hindu-amavasya', mark: { name: 'Amavasya', meaning: MEANINGS.amavasya } });
  if (tithiAt(midday(parts)) === 4) found.push({ id: 'hindu-vinayaka-chaturthi', mark: { name: 'Vinayaka Chaturthi', meaning: MEANINGS.vinayaka } });
  // Sankashti is kept on the day the dark fourth holds at moonrise; when it
  // slips between two moonrises, on the day it holds at sunrise.
  const rising = moonriseTithi(day, parts.place);
  if (rising === 19) found.push({ id: 'hindu-sankashti-chaturthi', mark: { name: 'Sankashti Chaturthi', meaning: MEANINGS.sankashti } });
  else if (rising !== null && rising > 19 && rising < 23 && sunriseTithi === 19) {
    const before = moonriseTithi(addDays(day, -1), parts.place);
    if (before !== null && before < 19 && before > 15) found.push({ id: 'hindu-sankashti-chaturthi', mark: { name: 'Sankashti Chaturthi', meaning: MEANINGS.sankashti } });
  }
  if (ctx.options.hinduPradosh === 'show') {
    const dusky = tithiAt(dusk(parts));
    if (dusky === 13 || dusky === 28) found.push({ id: `hindu-pradosh-${dusky === 13 ? 'shukla' : 'krishna'}`, mark: { name: 'Pradosh', meaning: MEANINGS.pradosh } });
  }
  return found;
}

// ─── Festivals ───────────────────────────────────────────────────────────
// Only those whose published dates the tests reproduce (Drik Panchang, New
// Delhi, 2025–2027). Each is looked for in the right (non-adhika) amānta
// month at the moment its own rule names, and returns that month's start so
// it is found once a year.

type Festival = { id: string; name: string; meaning: string; days: number; on: (day: Date, ctx: CalendarContext, parts: DayParts) => number | null };

/** The amānta month start when `at` falls in tithi `tithi` of non-adhika month `index`. */
function inMonth(at: Date, index: number, tithi: number): number | null {
  const month = lunarMonthAt(at);
  return !month.adhika && month.index === index && tithiAt(at) === tithi ? month.start : null;
}

/** Midnight: halfway from this sunset to the next sunrise (the middle of nishita kaal). */
const nightMiddle = (day: Date, ctx: CalendarContext, p: DayParts) => new Date((p.sunset.getTime() + dayParts(addDays(day, 1), ctx).sunrise.getTime()) / 2);

/**
 * The evening Holika is burned, for the Phalguna Purnima near `day`, or null
 * when `day` is not the first evening (sunset to midnight) the Purnima touches.
 * The first half of Purnima is Bhadra (Vishti karana), when the fire is not
 * lit. When Bhadra runs past that midnight and the Purnima still holds for
 * 3½ of the 4 prahars of the next day, the fire moves to the next evening
 * (the rule that gives Drik Panchang's 7 Mar 2023 and 3 Mar 2026); otherwise
 * it stays on the first evening, after Bhadra or in its tail.
 */
function holikaDahan(day: Date, ctx: CalendarContext, p: DayParts): { date: Date; start: number } | null {
  const sunset = p.sunset.getTime();
  const tithi = tithiAt(p.sunset);
  if (tithi < 14 || tithi > 15) return null;
  const pStart = solveElongation(sunset, 168);
  const pEnd = solveElongation(sunset, 180);
  const midnight = nightMiddle(day, ctx, p).getTime();
  // The first evening it touches: it holds between sunset and midnight, and didn't at yesterday's sunset.
  if (pStart > midnight || pEnd < sunset) return null;
  const start = inMonth(new Date(Math.max(pStart, sunset) + 60_000), 11, 15);
  if (start === null) return null;
  const bhadraEnd = solveElongation(sunset, 174);
  if (bhadraEnd > midnight) {
    const next = dayParts(addDays(day, 1), ctx);
    const dayLength = next.sunset.getTime() - next.sunrise.getTime();
    if (pEnd > next.sunrise.getTime() && pEnd - next.sunrise.getTime() >= (7 / 8) * dayLength) return { date: addDays(day, 1), start };
  }
  return { date: day, start };
}

const FESTIVALS: Festival[] = [
  {
    id: 'hindu-maha-shivaratri',
    name: 'Maha Shivaratri',
    meaning: `The great night of Shiva, on the fourteenth of the dark fortnight of Magha (amānta), which is Phalguna in the pūrṇimānta reckoning: kept on the night the Chaturdashi holds at midnight (nishita), with fasting, a night-long vigil and offerings of water, milk and bilva leaves to the linga. ${CONFIRM}`,
    days: 1,
    on: (day, ctx, p) => inMonth(nightMiddle(day, ctx, p), 10, 29),
  },
  {
    id: 'hindu-ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    meaning: `The birthday of Ganesha, Bhadrapada Shukla Chaturthi, kept on the day the fourth tithi holds at midday. Images of Ganesha are welcomed into homes and pandals for up to ten days, then immersed in water. ${CONFIRM}`,
    days: 1,
    on: (_day, _ctx, p) => inMonth(midday(p), 5, 4),
  },
  {
    id: 'hindu-navaratri',
    name: 'Sharad Navaratri begins',
    meaning: `Ghatasthapana: Ashvin Shukla Pratipada opens the nine nights of the Goddess (Durga and her nine forms), ending in Vijayadashami. When the Pratipada begins after one sunrise and ends before the next, Ghatasthapana is done on the day it begins. The number of days can shift when a tithi is skipped or doubled. ${CONFIRM}`,
    days: 9,
    on: (day, ctx, p) => {
      const n = tithiAt(p.sunrise);
      if (n === 1) return inMonth(p.sunrise, 6, 1);
      // A kshaya Pratipada (touching no sunrise) is kept on the day it begins.
      if (skippedAfter(day, ctx, n) !== 1) return null;
      const month = lunarMonthAt(dayParts(addDays(day, 1), ctx).sunrise);
      return !month.adhika && month.index === 6 ? month.start : null;
    },
  },
  {
    id: 'hindu-diwali',
    name: 'Diwali (Lakshmi Puja)',
    meaning: `The festival of lamps on the new moon of Kartika (pūrṇimānta) — Ashvin in the amānta reckoning — kept on the evening the Amavasya holds after sunset, with lamps, Lakshmi Puja and sweets. Some regional panchangs keep it on the next day in years when the Amavasya only just touches dusk, and the day can differ between India and the Americas. ${CONFIRM}`,
    days: 1,
    on: (_day, _ctx, p) => inMonth(evening(p), 6, 30),
  },
];

/** Holika Dahan and Holi (Rangwali Holi, Dhulandi) the day after; see holikaDahan. */
const HOLIKA = {
  id: 'hindu-holika-dahan',
  name: 'Holika Dahan',
  meaning: `The bonfire on the evening of Phalguna Purnima, for Prahlad saved and the demoness Holika burned: lit after sunset while the Purnima holds, avoiding Bhadra, the first half of the tithi. The rules for when Bhadra runs late are applied differently by different panchangs (in 2026 some kept it on 2 March, others on 3 March). ${CONFIRM}`,
};
const HOLI = {
  id: 'hindu-holi',
  name: 'Holi',
  meaning: `Rangwali Holi (Dhulandi), the festival of colours, on the morning after Holika Dahan: coloured powder and water, gujiya and friends forgiven. Some regions keep their own day: Dol Purnima in Bengal and Odisha falls on the full moon itself, and Rang Panchami in Maharashtra five days later. ${CONFIRM}`,
};

// ─── Helpers ─────────────────────────────────────────────────────────────

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const atMidday = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);

function samvat(day: Date, month: LunarMonth): { vikram: number; shaka: number } {
  // The lunar year begins with Chaitra Shukla Pratipada (amānta Chaitra), in March or April.
  const y = day.getFullYear();
  // Margashirsha (8) can run into early January, so it counts as the old year too.
  const startYear = month.index >= 8 && day.getMonth() < 6 ? y - 1 : y;
  return { vikram: startYear + 57, shaka: startYear - 78 };
}

// ─── The calendar ────────────────────────────────────────────────────────

export const HINDU_CALENDAR: CalendarDef = {
  id: 'hindu',
  name: 'Hindu lunar calendar (panchang)',
  path: 'hindu',
  confidence: 'historical',
  about:
    'The lunisolar calendar of the panchang, a living tradition kept by hundreds of millions, computed here from the Sun and Moon as modern panchangs do (the drik method). Each lunar day (tithi) is the time the Moon takes to move 12° further from the Sun, so a month has 30 tithis in two fortnights: Shukla (bright, waxing) and Krishna (dark, waning). A day takes the name of the tithi in force at local sunrise, so the same moment can fall on different days in different towns, and now and then a tithi is skipped or spans two sunrises. Months are named Chaitra to Phalguna by the sidereal (nirayana) sign the Sun is in when the month begins, with the Lahiri ayanamsa; about every 32½ months a month passes with no solar ingress and becomes an extra (adhika) month, named for the month after it. South and west India count months from new moon to new moon (amānta); north India from full moon to full moon (pūrṇimānta), so the dark fortnight carries the next month’s name. Tamil Nadu, Kerala, Bengal, Odisha, Assam and Punjab name their months by the Sun instead, though their festivals still follow the tithis. The year shown is Vikram Samvat from Chaitra; in Gujarat it begins after Diwali. Festival dates follow the rules Drik Panchang gives and match its New Delhi dates for 2023–2028, but traditional (Vākya and other) panchangs, temples and regions can differ by a day, and places far from India often keep a different day: always confirm with a local panchang or temple.',
  choices: [
    {
      key: 'hinduMonths',
      label: 'How months run',
      options: [
        { value: 'amanta', label: 'New moon to new moon (amānta)', note: 'Common in south and west India: Maharashtra, Gujarat, Karnataka, Andhra Pradesh, Telangana.' },
        { value: 'purnimanta', label: 'Full moon to full moon (pūrṇimānta)', note: 'Common in north India. The dark fortnight takes the next month’s name; festivals fall on the same days.' },
      ],
      default: 'amanta',
    },
    {
      key: 'hinduSunrise',
      label: 'Whose sunrise names the day',
      options: [
        { value: 'here', label: 'Where I am', note: 'Uses your place if the app knows it, otherwise Ujjain.' },
        { value: 'ujjain', label: 'Ujjain', note: 'The traditional meridian of Indian astronomy.' },
      ],
      default: 'here',
    },
    {
      key: 'hinduPradosh',
      label: 'Mark Pradosh',
      options: [
        { value: 'hide', label: 'No' },
        { value: 'show', label: 'Yes', note: 'The thirteenth tithi at dusk, twice a month, kept for Shiva.' },
      ],
      default: 'hide',
    },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Hindu_calendar',
    'https://en.wikipedia.org/wiki/Tithi',
    'https://en.wikipedia.org/wiki/Adhik_Maas',
    'https://en.wikipedia.org/wiki/Ayanamsa',
    'https://www.drikpanchang.com/ (festival dates checked for New Delhi and Houston, 2023–2028)',
    'https://www.drikpanchang.com/festivals/holi/festivals-holika-dahan-timings.html (Holika Dahan and the Bhadra rules)',
    'https://www.drikpanchang.com/festivals/maha-shivaratri/maha-shivaratri-date-time.html',
    'https://www.drikpanchang.com/navratri/shardiya-navratri-ghatasthapana.html',
    'https://en.wikipedia.org/wiki/Karana_(pancanga) (Vishti, or Bhadra)',
    'Indian Calendar Reform Committee report (1955), Lahiri ayanamsa',
    'E. M. Reingold and N. Dershowitz, Calendrical Calculations, ch. “The Modern Hindu Calendars”',
  ],

  dateOf(day: Date, ctx: CalendarContext): CalendarDate {
    const noon = atMidday(day);
    const parts = dayParts(noon, ctx);
    const n = tithiAt(parts.sunrise);
    const tithi = describeTithi(n);
    const lunar = lunarMonthAt(parts.sunrise);
    const scheme = ctx.options.hinduMonths === 'purnimanta' ? 'purnimanta' : 'amanta';
    const named = monthName(lunar, n, scheme);
    const year = samvat(noon, lunar);
    const marks = observancesOn(noon, ctx, parts, n).map((o) => o.mark);

    const nextParts = dayParts(addDays(noon, 1), ctx);
    const nextTithi = tithiAt(nextParts.sunrise);
    const skipped = (nextTithi - n + 30) % 30 === 2 ? describeTithi((n % 30) + 1).name : null;
    const prevParts = dayParts(addDays(noon, -1), ctx);
    const repeated = tithiAt(prevParts.sunrise) === n;

    const pakshaWord = tithi.paksha === 'Shukla' ? 'bright' : 'dark';
    const dayLabel = n === 15 || n === 30 ? tithi.name : `${tithi.paksha} ${tithi.name}`;
    const adhikaNote = named.adhika ? ' This is an adhika (extra) month, added so the lunar year keeps pace with the Sun; many keep it for devotion and avoid weddings and new undertakings.' : '';
    const kshayaNote = skipped ? ` The ${skipped} tithi begins and ends before the next sunrise, so no day carries its name (a kshaya tithi).` : '';
    const vriddhiNote = repeated ? ' The same tithi held at yesterday’s sunrise too (a vriddhi tithi).' : '';
    const schemeWord = scheme === 'amanta' ? 'amānta' : 'pūrṇimānta';

    return {
      calendar: 'hindu',
      short: `${named.name} ${tithi.paksha} ${tithi.inPaksha} · ${tithi.name}`,
      long:
        `${dayLabel}, the ${ORDINAL(tithi.inPaksha)} lunar day of the ${pakshaWord} fortnight (${tithi.paksha} paksha) of ${named.name} (${schemeWord}), Vikram Samvat ${year.vikram}. ` +
        `The day takes the tithi in force at sunrise ${parts.placeName === 'Ujjain' ? 'in Ujjain' : parts.placeName}.${adhikaNote}${kshayaNote}${vriddhiNote} Festival dates vary by tradition: confirm with a local panchang.`,
      month: { name: named.name, index: named.index, meaning: HINDU_MONTHS[named.index].meaning },
      day: tithi.inPaksha,
      year: { label: `Vikram Samvat ${year.vikram} · Shaka ${year.shaka}` },
      marks,
    };
  },

  eventsBetween(from: Date, to: Date, ctx: CalendarContext): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const first = startOfDay(from).getTime();
    const last = startOfDay(to).getTime();
    const seen = new Set<string>();
    const once = (id: string, start: number) => {
      const key = `${id}-${Math.round(start / HOUR)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    };
    for (let d = startOfDay(from); d.getTime() <= last; d = addDays(d, 1)) {
      const noon = atMidday(d);
      const parts = dayParts(noon, ctx);
      const n = tithiAt(parts.sunrise);
      for (const o of observancesOn(noon, ctx, parts, n)) {
        events.push({ calendar: 'hindu', id: o.id, name: o.mark.name, meaning: o.mark.meaning, date: d, days: 1 });
      }
      for (const f of FESTIVALS) {
        const start = f.on(noon, ctx, parts);
        if (start === null || !once(f.id, start)) continue;
        events.push({ calendar: 'hindu', id: f.id, name: f.name, meaning: f.meaning, date: d, days: f.days });
      }
    }
    // Holika Dahan can move to the evening after the Purnima's first, so look from two days before.
    for (let d = addDays(startOfDay(from), -2); d.getTime() <= last; d = addDays(d, 1)) {
      const noon = atMidday(d);
      const holika = holikaDahan(noon, ctx, dayParts(noon, ctx));
      if (!holika || !once(HOLIKA.id, holika.start)) continue;
      const fire = startOfDay(holika.date);
      for (const [e, date] of [[HOLIKA, fire], [HOLI, addDays(fire, 1)]] as const) {
        if (date.getTime() >= first && date.getTime() <= last) events.push({ calendar: 'hindu', id: e.id, name: e.name, meaning: e.meaning, date, days: 1 });
      }
    }
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  },
};
