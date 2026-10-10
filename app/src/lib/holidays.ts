// Holidays from the calendars people follow: the Wheel of the Year (northern
// and southern), Celtic, Norse, Hellenic, Roman and Slavic, plus their own.
// Every date is worked out from the year (fixed dates, the Sun's position,
// old Icelandic weekday rules, or the Moon for the Attic calendar), so
// nothing needs updating as years pass.

import { startOfDay } from './calendar.ts';
import { nextPhase, sunReaches } from './moon.ts';

type Rule =
  | { kind: 'fixed'; month: number; day: number }
  | { kind: 'sun'; at: 0 | 90 | 180 | 270 }
  /** The first `weekday` (0 = Sunday) from day `from` of `month` (Icelandic seasons). */
  | { kind: 'weekday'; month: number; from: number; weekday: number }
  /** The first full moon falling in `month`. */
  | { kind: 'fullMoon'; month: number }
  /** A day of a month of the Athenian (Attic) lunar calendar. */
  | { kind: 'attic'; month: AtticMonth; day: number }
  /** Days of every Attic month: 1 (Noumenia), 2, or the last day. */
  | { kind: 'atticMonthly'; day: 1 | 2 | 'last' };

type HolidayDef = { id: string; name: string; meaning: string; rule: Rule; days?: number };

export type Tradition = { id: string; name: string; description: string; holidays: HolidayDef[] };

export type Holiday = {
  id: string;
  name: string;
  meaning: string;
  /** Local start day. */
  date: Date;
  /** How many days it runs (1 for a single day). */
  days: number;
  traditions: string[];
};

/** One of your own events: every year, or once when `year` is set. */
export type CustomHoliday = { id: string; name: string; month: number; day: number; meaning: string; year?: number | null };
/**
 * Whole calendars, your own events, and single holidays picked from any
 * calendar (`picked`, as "<tradition>/<holiday>" ids) for your own calendar.
 */
export type HolidayChoice = { traditions: string[]; custom: CustomHoliday[]; picked?: string[] };

/** The id used to pick a single holiday into your own calendar. */
export const pickId = (traditionId: string, holidayId: string) => `${traditionId}/${holidayId}`;

const ATTIC_MONTHS = [
  'Hekatombaion',
  'Metageitnion',
  'Boedromion',
  'Pyanepsion',
  'Maimakterion',
  'Poseideon',
  'Gamelion',
  'Anthesterion',
  'Elaphebolion',
  'Mounichion',
  'Thargelion',
  'Skirophorion',
] as const;
type AtticMonth = (typeof ATTIC_MONTHS)[number];

const SAMHAIN = 'The witches’ new year, when the veil between the worlds is thin: a time to honor the ancestors and the beloved dead, and to rest as the dark half of the year begins.';
const YULE = 'The winter solstice and longest night. The sun is reborn and the light begins to return: a time of candles, evergreens, hope and renewal.';
const IMBOLC = 'The first stirrings of spring as the ewes come into milk. A festival of Brigid, hearth fire and holy wells: cleansing, inspiration and new beginnings.';
const OSTARA = 'The spring equinox, when day and night stand in balance. A celebration of seeds, eggs and greening earth: growth, fertility and renewal.';
const BELTANE = 'The flowering height of spring. A fire festival of passion, fertility and union, of maypoles and bonfires, when life is at its most abundant.';
const LITHA = 'The summer solstice and longest day, the sun at the peak of its power: strength, abundance, celebration, and the turn toward the waning year.';
const LAMMAS = 'The first harvest, of grain and bread. Giving thanks for what has ripened and sharing the first loaf, in honor of Lugh and the generous land.';
const MABON = 'The autumn equinox and second harvest, when day and night are balanced again: gratitude, sharing the bounty, and preparing for the dark half of the year.';

export const TRADITIONS: Tradition[] = [
  {
    id: 'wheel',
    name: 'Wheel of the Year',
    description: 'The eight sabbats of the witches’ wheel, as kept in the Northern Hemisphere.',
    holidays: [
      { id: 'imbolc', name: 'Imbolc', meaning: IMBOLC, rule: { kind: 'fixed', month: 1, day: 1 } },
      { id: 'ostara', name: 'Ostara', meaning: OSTARA, rule: { kind: 'sun', at: 0 } },
      { id: 'beltane', name: 'Beltane', meaning: BELTANE, rule: { kind: 'fixed', month: 4, day: 1 } },
      { id: 'litha', name: 'Litha', meaning: LITHA, rule: { kind: 'sun', at: 90 } },
      { id: 'lammas', name: 'Lammas', meaning: LAMMAS, rule: { kind: 'fixed', month: 7, day: 1 } },
      { id: 'mabon', name: 'Mabon', meaning: MABON, rule: { kind: 'sun', at: 180 } },
      { id: 'samhain', name: 'Samhain', meaning: SAMHAIN, rule: { kind: 'fixed', month: 9, day: 31 } },
      { id: 'yule', name: 'Yule', meaning: YULE, rule: { kind: 'sun', at: 270 } },
    ],
  },
  {
    id: 'wheel_south',
    name: 'Wheel of the Year (Southern Hemisphere)',
    description: 'The same eight sabbats, turned to follow the seasons south of the equator.',
    holidays: [
      { id: 'lammas', name: 'Lammas', meaning: LAMMAS, rule: { kind: 'fixed', month: 1, day: 1 } },
      { id: 'mabon', name: 'Mabon', meaning: MABON, rule: { kind: 'sun', at: 0 } },
      { id: 'samhain', name: 'Samhain', meaning: SAMHAIN, rule: { kind: 'fixed', month: 3, day: 30 } },
      { id: 'yule', name: 'Yule', meaning: YULE, rule: { kind: 'sun', at: 90 } },
      { id: 'imbolc', name: 'Imbolc', meaning: IMBOLC, rule: { kind: 'fixed', month: 7, day: 1 } },
      { id: 'ostara', name: 'Ostara', meaning: OSTARA, rule: { kind: 'sun', at: 180 } },
      { id: 'beltane', name: 'Beltane', meaning: BELTANE, rule: { kind: 'fixed', month: 9, day: 31 } },
      { id: 'litha', name: 'Litha', meaning: LITHA, rule: { kind: 'sun', at: 270 } },
    ],
  },
  {
    id: 'celtic',
    name: 'Celtic fire festivals',
    description: 'The four Gaelic quarter days that divided the old Irish and Scottish year.',
    holidays: [
      {
        id: 'la_fheile_bride',
        name: 'Imbolc · Lá Fhéile Bríde',
        meaning: 'The start of spring in the Gaelic year and the feast of Brigid, goddess and saint of poetry, healing and smithcraft. Brigid’s crosses are woven and a cloth is left out overnight for her blessing.',
        rule: { kind: 'fixed', month: 1, day: 1 },
      },
      {
        id: 'bealtaine',
        name: 'Bealtaine',
        meaning: 'The start of summer. Fires were lit on the hills and cattle driven between them for protection before going out to summer pasture; in Wales it is Calan Mai.',
        rule: { kind: 'fixed', month: 4, day: 1 },
      },
      {
        id: 'lughnasadh',
        name: 'Lughnasadh',
        meaning: 'The harvest festival of the god Lugh, with games, hill-top gatherings, matchmaking and the first fruits of the harvest; in Wales, Gŵyl Awst.',
        rule: { kind: 'fixed', month: 7, day: 1 },
      },
      {
        id: 'samhain_gaelic',
        name: 'Samhain (Oíche Shamhna)',
        meaning: '“Summer’s end” and the start of the Gaelic year, kept from sunset on October 31. The Otherworld draws near: fires, guising and food set out for the dead; in Wales, Calan Gaeaf.',
        rule: { kind: 'fixed', month: 9, day: 31 },
      },
    ],
  },
  {
    id: 'norse',
    name: 'Norse & Heathen',
    description: 'Blóts and feasts of the old Norse year, dated by the Icelandic calendar and the sun.',
    holidays: [
      {
        id: 'thorrablot',
        name: 'Þorrablót',
        meaning: 'The midwinter feast at the start of the old Icelandic month of Þorri (Bóndadagur), honoring Þorri, the spirit of winter, with traditional foods and toasts.',
        rule: { kind: 'weekday', month: 0, from: 19, weekday: 5 },
      },
      {
        id: 'disablot',
        name: 'Dísablót',
        meaning: 'Offerings to the dísir, the ancestral mothers and guardian spirits of the family, in late winter, as at the Dísting held at Uppsala around the February full moon.',
        rule: { kind: 'fullMoon', month: 1 },
      },
      {
        id: 'sigrblot',
        name: 'Sigrblót · Sumardagurinn fyrsti',
        meaning: 'The first day of summer in the Icelandic year. The sagas tell of a blót at summer’s start “for victory”, for the season of voyages and undertakings ahead.',
        rule: { kind: 'weekday', month: 3, from: 19, weekday: 4 },
      },
      {
        id: 'midsummer',
        name: 'Midsummer (Miðsumar)',
        meaning: 'The height of the sun’s power: bonfires, feasting and gathering, the season when the old assemblies (things) met.',
        rule: { kind: 'sun', at: 90 },
      },
      {
        id: 'haustblot',
        name: 'Haustblót',
        meaning: 'An autumn harvest blót kept by many modern heathens at the equinox, giving thanks to the gods and the land for the year’s harvest.',
        rule: { kind: 'sun', at: 180 },
      },
      {
        id: 'vetrnaetur',
        name: 'Winter Nights (Vetrnætur)',
        meaning: 'The start of winter in the Icelandic year. The sagas tell of a blót “for a good year”, and it is a time to honor the álfar and dísir (Álfablót).',
        rule: { kind: 'weekday', month: 9, from: 21, weekday: 6 },
      },
      {
        id: 'jol',
        name: 'Yule (Jól)',
        meaning: 'The great midwinter feast, traditionally kept for twelve nights: drinking to the gods and the ancestors for a good year and peace, and welcoming back the sun.',
        rule: { kind: 'sun', at: 270 },
        days: 12,
      },
    ],
  },
  {
    id: 'hellenic',
    name: 'Hellenic festivals',
    description: 'Major festivals of the Athenian year, dated by the Attic lunar calendar, which begins at the first new moon after the summer solstice.',
    holidays: [
      { id: 'kronia', name: 'Kronia', meaning: 'Festival of Kronos, when masters and the enslaved feasted together in memory of the Golden Age.', rule: { kind: 'attic', month: 'Hekatombaion', day: 12 } },
      { id: 'panathenaia', name: 'Panathenaia', meaning: 'Athena’s birthday festival: a great procession brings her statue a newly woven robe (peplos), with games and sacrifice.', rule: { kind: 'attic', month: 'Hekatombaion', day: 28 } },
      { id: 'eleusinia', name: 'Eleusinian Mysteries', meaning: 'The Greater Mysteries of Demeter and Persephone at Eleusis, the most revered initiation of the ancient world, about loss, return and the promise of life after death.', rule: { kind: 'attic', month: 'Boedromion', day: 15 }, days: 9 },
      { id: 'pyanepsia', name: 'Pyanepsia', meaning: 'Apollo’s harvest festival: a pot of mixed beans, and the eiresione, an olive branch hung with wool and fruits, carried home for blessing.', rule: { kind: 'attic', month: 'Pyanepsion', day: 7 } },
      { id: 'thesmophoria', name: 'Thesmophoria', meaning: 'The women’s festival of Demeter Thesmophoros and Persephone, for the fertility of the fields and of families.', rule: { kind: 'attic', month: 'Pyanepsion', day: 11 }, days: 3 },
      { id: 'haloa', name: 'Haloa', meaning: 'A winter festival of Demeter, Kore and Dionysus at the threshing floor, kept by women with feasting and joking.', rule: { kind: 'attic', month: 'Poseideon', day: 26 } },
      { id: 'lenaia', name: 'Lenaia', meaning: 'The winter festival of Dionysus Lenaios, with dramatic contests of comedy and tragedy.', rule: { kind: 'attic', month: 'Gamelion', day: 12 } },
      { id: 'anthesteria', name: 'Anthesteria', meaning: 'Dionysus’s festival of flowers and the new wine. On its last day the spirits of the dead walk, and are sent away at its close.', rule: { kind: 'attic', month: 'Anthesterion', day: 11 }, days: 3 },
      { id: 'dionysia', name: 'City Dionysia', meaning: 'The Great Dionysia, Athens’ spring festival of Dionysus, where the great tragedies and comedies were first performed.', rule: { kind: 'attic', month: 'Elaphebolion', day: 10 }, days: 7 },
      { id: 'mounichia', name: 'Mounichia', meaning: 'Festival of Artemis Mounichia, with round cakes ringed by small torches (amphiphontes), shining like the full moon.', rule: { kind: 'attic', month: 'Mounichion', day: 16 } },
      { id: 'thargelia', name: 'Thargelia', meaning: 'Festival of Apollo and Artemis on their birthdays, with first fruits of the harvest and the purification of the city.', rule: { kind: 'attic', month: 'Thargelion', day: 6 }, days: 2 },
      { id: 'plynteria', name: 'Plynteria', meaning: 'Athena’s ancient statue is taken to be washed and her robes cleaned; a solemn day of cleansing and renewal.', rule: { kind: 'attic', month: 'Thargelion', day: 25 } },
      { id: 'skira', name: 'Skira', meaning: 'A midsummer women’s festival of Demeter and Persephone, ahead of the threshing.', rule: { kind: 'attic', month: 'Skirophorion', day: 12 } },
    ],
  },
  {
    id: 'hellenic_monthly',
    name: 'Hellenic monthly days',
    description: 'The sacred days of every Attic month: Noumenia, Agathos Daimon and Hekate’s Deipnon.',
    holidays: [
      { id: 'noumenia', name: 'Noumenia', meaning: 'The first day of the lunar month, with the first sliver of the new crescent: offerings to the household gods for a good month.', rule: { kind: 'atticMonthly', day: 1 } },
      { id: 'agathos_daimon', name: 'Agathos Daimon', meaning: 'The second day of the month, honoring the Good Spirit of the household with a libation of wine.', rule: { kind: 'atticMonthly', day: 2 } },
      { id: 'deipnon', name: 'Hekate’s Deipnon', meaning: 'Hekate’s supper on the last day of the month: cleansing the house and leaving food for Hekate at a crossroads.', rule: { kind: 'atticMonthly', day: 'last' } },
    ],
  },
  {
    id: 'roman',
    name: 'Roman',
    description: 'Festivals of the old Roman calendar, kept on their traditional dates.',
    holidays: [
      { id: 'parentalia', name: 'Parentalia', meaning: 'Nine days honoring the family’s ancestors, with offerings of flowers, bread and wine at their tombs.', rule: { kind: 'fixed', month: 1, day: 13 }, days: 9 },
      { id: 'lupercalia', name: 'Lupercalia', meaning: 'An ancient festival of purification and fertility, honoring Faunus and the she-wolf who nursed Romulus and Remus.', rule: { kind: 'fixed', month: 1, day: 15 } },
      { id: 'matronalia', name: 'Matronalia', meaning: 'Festival of Juno Lucina, goddess of childbirth; mothers and wives are honored and given gifts.', rule: { kind: 'fixed', month: 2, day: 1 } },
      { id: 'floralia', name: 'Floralia', meaning: 'Festival of Flora, goddess of flowers and springtime, with games, theatre and bright clothing.', rule: { kind: 'fixed', month: 3, day: 28 }, days: 6 },
      { id: 'lemuria', name: 'Lemuria', meaning: 'Rites to appease the restless dead (lemures), who are sent from the house at midnight with black beans.', rule: { kind: 'fixed', month: 4, day: 9 } },
      { id: 'vestalia', name: 'Vestalia', meaning: 'Festival of Vesta, goddess of the hearth, when her temple was opened to the women of Rome.', rule: { kind: 'fixed', month: 5, day: 9 } },
      { id: 'neptunalia', name: 'Neptunalia', meaning: 'Festival of Neptune in the summer heat, with shelters made of leafy branches.', rule: { kind: 'fixed', month: 6, day: 23 } },
      { id: 'saturnalia', name: 'Saturnalia', meaning: 'Festival of Saturn: feasting, candles and gift-giving, when ordinary rules were set aside and roles turned upside down.', rule: { kind: 'fixed', month: 11, day: 17 }, days: 7 },
      { id: 'sol_invictus', name: 'Dies Natalis Solis Invicti', meaning: 'The birthday of the Unconquered Sun, celebrating the sun’s return after the winter solstice.', rule: { kind: 'fixed', month: 11, day: 25 } },
    ],
  },
  {
    id: 'slavic',
    name: 'Slavic',
    description: 'Seasonal festivals of the Slavic folk year.',
    holidays: [
      { id: 'marzanna', name: 'Drowning of Marzanna', meaning: 'At the spring equinox an effigy of Marzanna (Morana), goddess of winter and death, is burned or drowned to send winter away and welcome spring.', rule: { kind: 'sun', at: 0 } },
      { id: 'kupala', name: 'Kupala Night', meaning: 'Midsummer night of fire and water: jumping over bonfires, floating flower wreaths on rivers, and searching for the magical fern flower.', rule: { kind: 'fixed', month: 5, day: 23 } },
      { id: 'dziady', name: 'Dziady', meaning: 'Forefathers’ Eve in autumn, when the spirits of the ancestors are welcomed home and fed.', rule: { kind: 'fixed', month: 10, day: 1 } },
      { id: 'koliada', name: 'Koliada', meaning: 'Midwinter festival of the newborn sun, with carols (koliadki) sung from house to house for blessings in the year ahead.', rule: { kind: 'sun', at: 270 } },
    ],
  },
];

export const DEFAULT_TRADITIONS = ['wheel'];

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

// ─── The Attic (Athenian) lunar calendar ─────────────────────────────────

type AtticMonthSpan = { name: string; start: Date; next: Date };

const atticCache = new Map<number, AtticMonthSpan[]>();

/**
 * The months of the Attic year that begins in summer of `year`. Each month
 * starts at the Noumenia, the day after the new moon; a year has 12 months,
 * or 13 with a second Poseideon when 13 new moons fall before the next one.
 */
export function atticYear(year: number): AtticMonthSpan[] {
  const cached = atticCache.get(year);
  if (cached) return cached;
  const firstNew = (y: number) => nextPhase(sunReaches(y, 90), 'new');
  const end = firstNew(year + 1);
  const starts: Date[] = [];
  for (let moon = firstNew(year); moon.getTime() <= end.getTime() + 60_000; ) {
    starts.push(addDays(startOfDay(moon), 1));
    moon = nextPhase(new Date(moon.getTime() + 86_400_000), 'new');
  }
  const months = starts.length - 1;
  const names: string[] = [...ATTIC_MONTHS];
  if (months === 13) names.splice(6, 0, 'Poseideon II');
  const spans = names.slice(0, months).map((name, i) => ({ name, start: starts[i], next: starts[i + 1] }));
  atticCache.set(year, spans);
  return spans;
}

// ─── Working out dates ───────────────────────────────────────────────────

function occurrences(rule: Rule, year: number): Date[] {
  switch (rule.kind) {
    case 'fixed':
      return [new Date(year, rule.month, rule.day)];
    case 'sun':
      return [startOfDay(sunReaches(year, rule.at))];
    case 'weekday': {
      const first = new Date(year, rule.month, rule.from);
      return [addDays(first, (rule.weekday - first.getDay() + 7) % 7)];
    }
    case 'fullMoon': {
      const full = startOfDay(nextPhase(new Date(year, rule.month, 1), 'full'));
      return full.getMonth() === rule.month ? [full] : [];
    }
    case 'attic': {
      // Each Attic year is visited once, as `year` steps through the range.
      const month = atticYear(year).find((span) => span.name === rule.month);
      if (!month) return [];
      const date = addDays(month.start, rule.day - 1);
      return date.getTime() < month.next.getTime() ? [date] : [];
    }
    case 'atticMonthly':
      return [...atticYear(year - 1), ...atticYear(year)]
        .map((span) => (rule.day === 'last' ? addDays(span.next, -1) : addDays(span.start, rule.day - 1)))
        .filter((date) => date.getFullYear() === year);
  }
}

/** Reads the choice saved in settings (comma-separated traditions, custom holidays as JSON). */
export function holidayChoice(settings: Record<string, unknown> | null | undefined): HolidayChoice {
  const raw = settings?.calendar_traditions;
  const traditions =
    typeof raw === 'string'
      ? raw
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id === 'custom' || TRADITIONS.some((t) => t.id === id))
      : DEFAULT_TRADITIONS;
  const picked =
    typeof settings?.calendar_picked_holidays === 'string'
      ? settings.calendar_picked_holidays.split(',').map((id) => id.trim()).filter(Boolean)
      : [];
  return { traditions, custom: parseCustomHolidays(settings?.calendar_custom_holidays), picked };
}

export function parseCustomHolidays(raw: unknown): CustomHoliday[] {
  try {
    const list = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(list)) return [];
    return list
      .filter((item) => item && typeof item.name === 'string' && item.name.trim())
      .map((item) => ({
        id: String(item.id || item.name),
        name: String(item.name).trim(),
        month: Math.min(11, Math.max(0, Number(item.month) || 0)),
        day: Math.min(31, Math.max(1, Number(item.day) || 1)),
        meaning: String(item.meaning || '').trim(),
        year: Number.isInteger(item.year) ? item.year : null,
      }));
  } catch {
    return [];
  }
}

/**
 * Holidays from the chosen calendars that are running on or start after
 * `from`'s day, up to `to`, in date order. A holiday kept by several chosen
 * calendars (Samhain in the Wheel and the Celtic year) appears once.
 */
export function holidaysBetween(from: Date, to: Date, choice: HolidayChoice): Holiday[] {
  const today = startOfDay(from).getTime();
  const out = new Map<string, Holiday>();
  const add = (def: { name: string; meaning: string; days?: number }, id: string, date: Date, tradition: string) => {
    const days = def.days ?? 1;
    if (addDays(date, days - 1).getTime() < today || date.getTime() > to.getTime()) return;
    const key = `${def.name.split(' ')[0].toLowerCase()}|${date.getTime()}`;
    const existing = out.get(key);
    if (existing) {
      if (!existing.traditions.includes(tradition)) existing.traditions.push(tradition);
      return;
    }
    out.set(key, { id: `${id}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`, name: def.name, meaning: def.meaning, date, days, traditions: [tradition] });
  };

  for (let year = from.getFullYear() - 1; year <= to.getFullYear() + 1; year++) {
    for (const tradition of TRADITIONS) {
      if (!choice.traditions.includes(tradition.id)) continue;
      for (const def of tradition.holidays) {
        for (const date of occurrences(def.rule, year)) add(def, `${tradition.id}-${def.id}`, date, tradition.name);
      }
    }
    if (choice.traditions.includes('custom')) {
      for (const custom of choice.custom) {
        if (custom.year && custom.year !== year) continue;
        add(custom, `custom-${custom.id}`, new Date(year, custom.month, custom.day), 'Your calendar');
      }
      // Single holidays picked from calendars that aren't chosen whole.
      for (const id of choice.picked ?? []) {
        const [traditionId, holidayId] = id.split('/');
        if (choice.traditions.includes(traditionId)) continue;
        const tradition = TRADITIONS.find((t) => t.id === traditionId);
        const def = tradition?.holidays.find((h) => h.id === holidayId);
        if (!tradition || !def) continue;
        for (const date of occurrences(def.rule, year)) add(def, `${traditionId}-${def.id}`, date, tradition.name);
      }
    }
  }
  return [...out.values()].sort((a, b) => a.date.getTime() - b.date.getTime() || a.name.localeCompare(b.name));
}

/** The holiday running today, or else the next one (looking up to 13 months ahead). */
export function nextHoliday(from: Date, choice: HolidayChoice): Holiday | null {
  return holidaysBetween(from, addDays(from, 400), choice)[0] ?? null;
}

/** Which day of a running holiday `now` falls on (1-based), or 0 if it hasn't started. */
export function holidayDay(holiday: Holiday, now: Date): number {
  const offset = Math.round((startOfDay(now).getTime() - holiday.date.getTime()) / 86_400_000);
  return offset >= 0 && offset < holiday.days ? offset + 1 : 0;
}
