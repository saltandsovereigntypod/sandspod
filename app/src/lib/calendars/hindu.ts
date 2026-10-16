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
// Observances use the rules panchangs commonly give, which are not all
// "tithi at sunrise": Sankashti at moonrise, Pradosh at dusk, Vinayaka and
// Ganesh Chaturthi at midday, Diwali (Lakshmi Puja) in the evening. Many
// communities and temples use other rules, so every date carries that note.
// Pure; no React.

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
  { name: 'Ashadha', meaning: 'named for the nakshatra Purva Ashadha, near its full moon; the rains begin' },
  { name: 'Shravana', meaning: 'named for Shravana, “hearing”, near its full moon; the heart of the monsoon' },
  { name: 'Bhadrapada', meaning: 'named for the nakshatra Purva Bhadrapada, near its full moon' },
  { name: 'Ashvin', meaning: 'named for Ashvini, the horse-headed twins, near its full moon' },
  { name: 'Kartika', meaning: 'named for Krittika (the Pleiades), near its full moon; a month of lamps' },
  { name: 'Margashirsha', meaning: 'named for Mrigashira, “the deer’s head”, near its full moon' },
  { name: 'Pausha', meaning: 'named for Pushya, “nourishing”, near its full moon' },
  { name: 'Magha', meaning: 'named for the nakshatra Magha, near its full moon' },
  { name: 'Phalguna', meaning: 'named for Purva Phalguni, near its full moon; the year ends with Holi' },
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
  if (scheme === 'purnimanta' && tithi > 15) {
    // The dark fortnight belongs to the next month. After an adhika month's
    // dark half, the nija month follows; after the adhika's bright half,
    // its own dark half still counts as adhika.
    const next = lunarMonthAt(new Date(month.end + HOUR));
    index = next.index;
    adhika = next.adhika;
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
// Only three, and only because the tests reproduce the published 2025 and
// 2026 dates (Drik Panchang, New Delhi; and Ujjain). Each is looked for in the
// right (non-adhika) amānta month at the moment its own rule names.

type Festival = { id: string; name: string; meaning: string; month: number; tithi: number; at: (p: DayParts) => Date; days: number };

const FESTIVALS: Festival[] = [
  {
    id: 'hindu-ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    meaning: `The birthday of Ganesha, Bhadrapada Shukla Chaturthi, kept on the day the fourth tithi holds at midday. Images of Ganesha are welcomed into homes and pandals for up to ten days, then immersed in water. ${CONFIRM}`,
    month: 5,
    tithi: 4,
    at: midday,
    days: 1,
  },
  {
    id: 'hindu-navaratri',
    name: 'Sharad Navaratri begins',
    meaning: `Ghatasthapana: Ashvin Shukla Pratipada opens the nine nights of the Goddess (Durga and her nine forms), ending in Vijayadashami. The number of days can shift when a tithi is skipped or doubled. ${CONFIRM}`,
    month: 6,
    tithi: 1,
    at: (p) => p.sunrise,
    days: 9,
  },
  {
    id: 'hindu-diwali',
    name: 'Diwali (Lakshmi Puja)',
    meaning: `The festival of lamps on the new moon of Kartika (pūrṇimānta) — Ashvin in the amānta reckoning — kept on the evening the Amavasya holds after sunset, with lamps, Lakshmi Puja and sweets. Some regional panchangs keep it on the next day in years when the Amavasya only just touches dusk. ${CONFIRM}`,
    month: 6,
    tithi: 30,
    at: evening,
    days: 1,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const atMidday = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);

function samvat(day: Date, month: LunarMonth): { vikram: number; shaka: number } {
  // The lunar year begins with Chaitra Shukla Pratipada (amānta Chaitra), in March or April.
  const y = day.getFullYear();
  const startYear = month.index >= 9 && day.getMonth() < 6 ? y - 1 : y;
  return { vikram: startYear + 57, shaka: startYear - 78 };
}

// ─── The calendar ────────────────────────────────────────────────────────

export const HINDU_CALENDAR: CalendarDef = {
  id: 'hindu',
  name: 'Hindu lunar calendar (panchang)',
  path: 'hindu',
  confidence: 'historical',
  about:
    'The lunisolar calendar of the panchang, a living tradition kept by hundreds of millions. Each lunar day (tithi) is the time the Moon takes to move 12° further from the Sun, so a month has 30 tithis in two fortnights: Shukla (bright, waxing) and Krishna (dark, waning). A day takes the name of the tithi in force at local sunrise, so the same moment can fall on different days in different towns, and now and then a tithi is skipped or spans two sunrises. Months are named Chaitra to Phalguna by the sidereal (nirayana) sign the Sun is in, with the Lahiri ayanamsa; about every 32½ months a month passes with no solar ingress and becomes an extra (adhika) month. South and west India count months from new moon to new moon (amānta); north India from full moon to full moon (pūrṇimānta), so the dark fortnight carries the next month’s name. Ekadashi, Purnima, Amavasya and the Chaturthis are marked with the rules panchangs commonly use. Festival dates differ between traditions and regions: always confirm them with a local panchang or temple.',
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
    'https://www.drikpanchang.com/',
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
    const last = startOfDay(to).getTime();
    const seen = new Set<string>();
    for (let d = startOfDay(from); d.getTime() <= last; d = addDays(d, 1)) {
      const noon = atMidday(d);
      const parts = dayParts(noon, ctx);
      const n = tithiAt(parts.sunrise);
      for (const o of observancesOn(noon, ctx, parts, n)) {
        events.push({ calendar: 'hindu', id: o.id, name: o.mark.name, meaning: o.mark.meaning, date: d, days: 1 });
      }
      for (const f of FESTIVALS) {
        const at = f.at(parts);
        const month = lunarMonthAt(at);
        if (month.adhika || month.index !== f.month) continue;
        const key = `${f.id}-${Math.round(month.start / HOUR)}`;
        if (seen.has(key)) continue;
        const here = tithiAt(at);
        // Navaratri opens on the first day of the bright fortnight even when Pratipada is skipped.
        const hit = f.tithi === 1 ? here >= 1 && here <= 2 : here === f.tithi;
        if (!hit) continue;
        seen.add(key);
        events.push({ calendar: 'hindu', id: f.id, name: f.name, meaning: f.meaning, date: d, days: f.days });
      }
    }
    return events;
  },
};
