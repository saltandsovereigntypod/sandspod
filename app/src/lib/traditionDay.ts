// The day as your main calendar names it: the Athenian lunar date and its
// god, the Norse weekday gods and old Icelandic months, the Roman Kalends,
// Nones and Ides, the Irish day and month, the old Slavic months, or your
// place on the Wheel of the Year. Plus folk full moon names and the word each
// tradition uses for its holy days.

import { startOfDay } from './calendar.ts';
import { atticYear, holidaysBetween, nextHolidayAfterToday, type HolidayChoice } from './holidays.ts';
import { nextPhase, sunReaches } from './moon.ts';

export type TraditionDay = { line: string; detail?: string };

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const firstWeekday = (year: number, month: number, from: number, weekday: number) => {
  const first = new Date(year, month, from);
  return addDays(first, (weekday - first.getDay() + 7) % 7);
};

// ─── Hellenic ────────────────────────────────────────────────────────────

const GREEK_DAY = ['Helios', 'Selene', 'Ares', 'Hermes', 'Zeus', 'Aphrodite', 'Kronos'];
// Gods honored on days of every Attic month.
const ATTIC_DAY_GODS: Record<number, string> = {
  1: 'the household gods, on the Noumenia of the new month',
  2: 'the Agathos Daimon, the Good Spirit of the house',
  3: 'Athena',
  4: 'Herakles, Hermes, Aphrodite and Eros',
  6: 'Artemis',
  7: 'Apollo',
  8: 'Poseidon and Theseus',
};

export function atticDate(date: Date): { month: string; day: number; last: boolean } | null {
  const day = startOfDay(date).getTime();
  for (const year of [date.getFullYear(), date.getFullYear() - 1]) {
    const span = atticYear(year).find((m) => m.start.getTime() <= day && day < m.next.getTime());
    if (span) {
      return {
        month: span.name,
        day: Math.round((day - span.start.getTime()) / 86_400_000) + 1,
        last: addDays(new Date(day), 1).getTime() === span.next.getTime(),
      };
    }
  }
  return null;
}

function hellenic(date: Date): TraditionDay {
  const attic = atticDate(date);
  const weekday = `${GREEK_DAY[date.getDay()]}’s day`;
  if (!attic) return { line: weekday };
  const god = attic.last ? 'Hekate, on her Deipnon' : ATTIC_DAY_GODS[attic.day];
  return { line: `${attic.day} ${attic.month} · ${weekday}`, detail: god ? `Sacred to ${god}` : undefined };
}

// ─── Norse ───────────────────────────────────────────────────────────────

const NORSE_DAY = [
  'Sunna’s day (Sunnudagr)',
  'Máni’s day (Mánadagr)',
  'Týr’s day (Týsdagr)',
  'Odin’s day (Óðinsdagr)',
  'Thor’s day (Þórsdagr)',
  'Frigg’s day (Frjádagr)',
  'Washing day (Laugardagr)',
];

/**
 * The old Icelandic months. Winter begins on the Saturday from Oct 21 and
 * summer on the Thursday from Apr 19; Þorri begins on the Friday from Jan 19.
 * Months are 30 days; the summer leap week falls before Heyannir, so the
 * late-summer months are counted back from the first day of winter.
 */
export function icelandicMonth(date: Date): { name: string; gloss: string; half: 'winter' | 'summer' } {
  const day = startOfDay(date).getTime();
  const y = date.getFullYear();
  const winter = (year: number) => firstWeekday(year, 9, 21, 6);
  const summer = (year: number) => firstWeekday(year, 3, 19, 4);
  const thorri = (year: number) => firstWeekday(year, 0, 19, 5);
  const marks: [Date, string, string, 'winter' | 'summer'][] = [];
  for (const year of [y - 1, y]) {
    const w = winter(year);
    const t = thorri(year + 1);
    const s = summer(year + 1);
    const nextWinter = winter(year + 1);
    marks.push(
      [w, 'Gormánuður', 'the slaughter month', 'winter'],
      [addDays(w, 30), 'Ýlir', 'the Yule month', 'winter'],
      [addDays(w, 60), 'Mörsugur', 'the fat-sucking month of deep winter', 'winter'],
      [t, 'Þorri', 'the month of Þorri, frost and midwinter feasting', 'winter'],
      [addDays(t, 30), 'Góa', 'the month of Góa, late winter', 'winter'],
      [addDays(t, 60), 'Einmánuður', 'the lone month before summer', 'winter'],
      [s, 'Harpa', 'the first month of summer', 'summer'],
      [addDays(s, 30), 'Skerpla', 'the second month of summer', 'summer'],
      [addDays(s, 60), 'Sólmánuður', 'the sun month', 'summer'],
      [addDays(nextWinter, -90), 'Heyannir', 'the haymaking month', 'summer'],
      [addDays(nextWinter, -60), 'Tvímánuður', 'the two-month, of harvest', 'summer'],
      [addDays(nextWinter, -30), 'Haustmánuður', 'the autumn month', 'summer'],
    );
  }
  const current = marks.filter((m) => m[0].getTime() <= day).sort((a, b) => b[0].getTime() - a[0].getTime())[0];
  return { name: current[1], gloss: current[2], half: current[3] };
}

function norse(date: Date): TraditionDay {
  const month = icelandicMonth(date);
  return { line: NORSE_DAY[date.getDay()], detail: `${month.name}, ${month.gloss} · the ${month.half} half of the year` };
}

// ─── Roman ───────────────────────────────────────────────────────────────

const LATIN_DAY = ['dies Solis', 'dies Lunae', 'dies Martis', 'dies Mercurii', 'dies Iovis', 'dies Veneris', 'dies Saturni'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const roman = (n: number) =>
  [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ].reduce((out, [value, letters]) => {
    while (n >= (value as number)) {
      out += letters;
      n -= value as number;
    }
    return out;
  }, '');

/** The Roman way of naming the date, counting (inclusively) toward the Kalends, Nones or Ides. */
export function romanDate(date: Date): string {
  const d = date.getDate();
  const m = date.getMonth();
  const late = [2, 4, 6, 9].includes(m); // March, May, July, October
  const nones = late ? 7 : 5;
  const ides = late ? 15 : 13;
  const month = MONTHS[m];
  const nextMonth = MONTHS[(m + 1) % 12];
  if (d === 1) return `the Kalends of ${month}`;
  if (d === nones) return `the Nones of ${month}`;
  if (d === ides) return `the Ides of ${month}`;
  const [count, mark, of] =
    d < nones
      ? [nones - d + 1, 'Nones', month]
      : d < ides
        ? [ides - d + 1, 'Ides', month]
        : [new Date(date.getFullYear(), m + 1, 0).getDate() - d + 2, 'Kalends', nextMonth];
  if (count === 2) return `the day before the ${mark} of ${of}`;
  return `${count} days before the ${mark} of ${of} (a.d. ${roman(count)})`;
}

function romanDay(date: Date): TraditionDay {
  return { line: `${LATIN_DAY[date.getDay()]} · ${romanDate(date)}` };
}

// ─── Celtic (Irish) ──────────────────────────────────────────────────────

const IRISH_DAY = ['Dé Domhnaigh', 'Dé Luain', 'Dé Máirt', 'Dé Céadaoin', 'Déardaoin', 'Dé hAoine', 'Dé Sathairn'];
const IRISH_MONTH = ['Eanáir', 'Feabhra', 'Márta', 'Aibreán', 'Bealtaine', 'Meitheamh', 'Iúil', 'Lúnasa', 'Meán Fómhair', 'Deireadh Fómhair', 'Samhain', 'Nollaig'];

function celtic(date: Date): TraditionDay {
  // The Gaelic seasons begin on the quarter days.
  const m = date.getMonth();
  const season =
    m >= 10 || m === 0 ? 'Geimhreadh, winter' : m <= 3 ? 'Earrach, spring' : m <= 6 ? 'Samhradh, summer' : 'Fómhar, autumn';
  return { line: `${IRISH_DAY[date.getDay()]} · ${date.getDate()} ${IRISH_MONTH[m]}`, detail: `${season} in the Gaelic year` };
}

// ─── Slavic ──────────────────────────────────────────────────────────────

const SLAVIC_MONTH: [string, string][] = [
  ['Sichen', 'the cutting month, when trees were felled'],
  ['Liutyi', 'the fierce month'],
  ['Berezen', 'the birch month'],
  ['Kviten', 'the blossoming month'],
  ['Traven', 'the grass month'],
  ['Cherven', 'the red month'],
  ['Lypen', 'the linden month'],
  ['Serpen', 'the sickle month'],
  ['Veresen', 'the heather month'],
  ['Zhovten', 'the yellowing month'],
  ['Lystopad', 'the month of falling leaves'],
  ['Hruden', 'the month of frozen earth'],
];

function slavic(date: Date): TraditionDay {
  const [name, gloss] = SLAVIC_MONTH[date.getMonth()];
  return { line: `${name}, ${gloss}`, detail: 'Old Slavic month names, as kept in Ukrainian' };
}

// ─── Wheel of the Year ───────────────────────────────────────────────────

const WHEEL_SEASON: Record<string, string> = {
  Yule: 'the descent into the dark',
  Imbolc: 'the deep of winter, light slowly returning',
  Ostara: 'the quickening of spring',
  Beltane: 'spring greening toward summer',
  Litha: 'the fullness of summer coming on',
  Lammas: 'high summer, ripening toward harvest',
  Mabon: 'the harvest',
  Samhain: 'the final harvest and the turn toward the dark',
};

function wheel(date: Date, south: boolean): TraditionDay | null {
  const choice: HolidayChoice = { traditions: [south ? 'wheel_south' : 'wheel'], custom: [] };
  const next = nextHolidayAfterToday(date, choice);
  const today = holidaysBetween(date, startOfDay(date), choice)[0];
  if (!next) return null;
  if (today) return { line: `${today.name} on the Wheel of the Year` };
  const previous = holidaysBetween(addDays(date, -100), addDays(date, -1), choice).at(-1);
  return {
    line: previous ? `Between ${previous.name} and ${next.name}` : `Toward ${next.name}`,
    detail: WHEEL_SEASON[next.name] ? `On the Wheel: ${WHEEL_SEASON[next.name]}` : undefined,
  };
}

// ─── Main calendar ───────────────────────────────────────────────────────

/** The calendar that names the day: the one chosen, else the first whole calendar on. */
export function primaryTradition(settings: Record<string, unknown> | null | undefined, choice: HolidayChoice): string {
  const chosen = typeof settings?.calendar_primary === 'string' ? settings.calendar_primary : '';
  if (chosen && choice.traditions.includes(chosen)) return chosen;
  return choice.traditions.find((id) => id !== 'custom' && id !== 'hellenic_monthly') ?? (choice.traditions.includes('hellenic_monthly') ? 'hellenic' : 'wheel');
}

export function traditionDay(date: Date, tradition: string): TraditionDay | null {
  switch (tradition) {
    case 'hellenic':
    case 'hellenic_monthly':
      return hellenic(date);
    case 'norse':
      return norse(date);
    case 'roman':
      return romanDay(date);
    case 'celtic':
      return celtic(date);
    case 'slavic':
      return slavic(date);
    case 'wheel':
      return wheel(date, false);
    case 'wheel_south':
      return wheel(date, true);
    default:
      return null;
  }
}

/** The word a tradition uses for its holy days. */
export const HOLIDAY_TERM: Record<string, string> = {
  wheel: 'Sabbat',
  wheel_south: 'Sabbat',
  celtic: 'Fire festival',
  norse: 'Blót & feast',
  hellenic: 'Festival',
  hellenic_monthly: 'Sacred day',
  roman: 'Feriae',
  slavic: 'Festival',
  custom: 'Your holy day',
};

// ─── Folk full moon names ────────────────────────────────────────────────

const FOLK_MOONS = ['Wolf', 'Snow', 'Worm', 'Pink', 'Flower', 'Strawberry', 'Buck', 'Sturgeon', 'Corn', 'Hunter’s', 'Beaver', 'Cold'];

/**
 * The folk (Old English and North American) name for a full moon. The
 * Harvest Moon is the full moon nearest the September equinox and the
 * Hunter's Moon the one after it. These are northern names.
 */
export function fullMoonName(full: Date): string {
  const year = full.getFullYear();
  const equinox = sunReaches(year, 180).getTime();
  const before = nextPhase(new Date(equinox - 20 * 86_400_000), 'full');
  const after = nextPhase(new Date(before.getTime() + 86_400_000), 'full');
  const harvest = Math.abs(before.getTime() - equinox) <= Math.abs(after.getTime() - equinox) ? before : after;
  const sameDay = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) < 86_400_000;
  if (sameDay(full, harvest)) return 'Harvest Moon';
  const hunters = nextPhase(new Date(harvest.getTime() + 86_400_000), 'full');
  if (sameDay(full, hunters)) return 'Hunter’s Moon';
  // A second full moon in one calendar month is a Blue Moon.
  const previous = nextPhase(new Date(full.getTime() - 32 * 86_400_000), 'full');
  if (!sameDay(previous, full) && previous.getMonth() === full.getMonth() && previous.getFullYear() === full.getFullYear()) return 'Blue Moon';
  const name = FOLK_MOONS[full.getMonth()];
  // September and October names give way to Harvest and Hunter's.
  if (name === 'Hunter’s') return 'Blood Moon';
  return `${name} Moon`;
}

/** Folk moon names belong to the northern seasons; leave them out for the southern wheel. */
export const usesFolkMoonNames = (tradition: string) => tradition !== 'wheel_south' && tradition !== 'hellenic' && tradition !== 'hellenic_monthly';
