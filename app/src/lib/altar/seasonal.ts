// Seasonal things for the altar, each kept for one or more festivals of the
// calendars in holidays.ts: on the Wheel of the Year, lanterns and a
// pomegranate at Samhain, the Yule log, Brigid's cross, eggs at Ostara, and
// the harvest's wheat, corn dolly, apples and gourds; in the Greek year, the
// eiresione and the pot of beans at the Pyanepsia, the thyrsus and the mask at
// Dionysus's festivals, Hekate's supper at the month's end. Each has a painted
// picture (assets/altar/objects/seasonal/<id>/<id>.png, listed by
// scripts/build-altar-artwork.mjs); one without a picture isn't offered. In
// the week before a festival from a calendar you keep (and while it runs) the
// cabinet shows its things first, and tonight's altar can set one out; the
// monthly Greek days come only the day before and on the day. The ones that
// are food go over as offerings do (offerings.ts); the rest keep. Pure, so it
// can be tested.
//
// Another calendar's things (Roman, Slavic, Norse, …) need only a group in
// SEASONAL_TRADITIONS, entries in SEASONAL_OBJECTS naming its holidays, and
// their pictures.

import { startOfDay } from '../calendar.ts';
import { DEFAULT_TRADITIONS, holidaysBetween, TRADITIONS, type HolidayChoice } from '../holidays.ts';
import type { OfferingKindId } from './offerings.ts';
import type { CabinetItem, SavedObject } from './types.ts';

export type SabbatId = 'samhain' | 'yule' | 'imbolc' | 'ostara' | 'beltane' | 'litha' | 'lammas' | 'mabon';

export const SABBATS: { id: SabbatId; name: string }[] = [
  { id: 'samhain', name: 'Samhain' },
  { id: 'yule', name: 'Yule' },
  { id: 'imbolc', name: 'Imbolc' },
  { id: 'ostara', name: 'Ostara' },
  { id: 'beltane', name: 'Beltane' },
  { id: 'litha', name: 'Litha' },
  { id: 'lammas', name: 'Lammas' },
  { id: 'mabon', name: 'Mabon' },
];

export const sabbatName = (id: string) => SABBATS.find((s) => s.id === id)?.name ?? '';

/**
 * A festival a seasonal thing is kept for: a calendar from holidays.ts
 * (`'wheel'` for a sabbat, kept north or south of the equator) and the
 * holiday's id in it.
 */
export type FestivalRef = { tradition: string; holiday: string };

export type SeasonalObject = {
  id: string;
  name: string;
  festivals: FestivalRef[];
  keywords: string[];
  /** The gods it belongs to, so a search for one finds it. */
  deities?: string[];
  /** A line about it, for its tile and its panel. */
  description?: string;
  /** Food that goes over as an offering does (an offering kind in offerings.ts); absent for things that keep. */
  food?: OfferingKindId;
  /** A vessel that holds a poured or set-out offering, as a bowl or chalice does. */
  vessel?: boolean;
};

/**
 * The calendars whose festivals have seasonal things, in the drawer's order:
 * each a section of the drawer ("Wheel of the Year", "Greek festivals"),
 * the calendars in holidays.ts it covers, words it is searched by, and how
 * a calendar's holiday id names one of its festivals (by default the id
 * itself).
 */
export type SeasonalTradition = {
  id: string;
  title: string;
  calendars: string[];
  words: string[];
  festivalOf?: (holidayId: string) => string | null;
};

export const SEASONAL_TRADITIONS: SeasonalTradition[] = [
  // The Celtic year's Samhain, Lá Fhéile Bríde, Bealtaine and Lughnasadh are the sabbats under their older names.
  { id: 'wheel', title: 'Wheel of the Year', calendars: ['wheel', 'wheel_south', 'celtic'], words: ['sabbat', 'wheel of the year'], festivalOf: (id) => sabbatOfHoliday(id) },
  { id: 'hellenic', title: 'Greek festivals', calendars: ['hellenic', 'hellenic_monthly'], words: ['Greek', 'Hellenic', 'Athenian', 'festival'] },
];

const wheel = (...sabbats: SabbatId[]): FestivalRef[] => sabbats.map((holiday) => ({ tradition: 'wheel', holiday }));
const hellenic = (...holidays: string[]): FestivalRef[] => holidays.map((holiday) => ({ tradition: 'hellenic', holiday }));
const monthly = (...holidays: string[]): FestivalRef[] => holidays.map((holiday) => ({ tradition: 'hellenic_monthly', holiday }));

/** In the order each festival's things are shown, the first of each set out on tonight's altar (unless TONIGHT_FIRST says otherwise). */
export const SEASONAL_OBJECTS: SeasonalObject[] = [
  { id: 'pumpkin-lantern', name: 'Pumpkin Lantern', festivals: wheel('samhain'), keywords: ['lantern', 'guiding the dead', 'protection', 'jack o’ lantern'] },
  { id: 'turnip-lantern', name: 'Turnip Lantern', festivals: wheel('samhain'), keywords: ['lantern', 'the old ways', 'guiding the dead', 'protection'] },
  { id: 'pomegranate', name: 'Pomegranate', festivals: wheel('samhain'), keywords: ['the dead', 'Persephone', 'the underworld', 'fruit'], food: 'harvest' },
  { id: 'yule-log', name: 'Yule Log', festivals: wheel('yule'), keywords: ['the returning sun', 'hearth', 'luck', 'warmth'] },
  { id: 'evergreen-boughs', name: 'Evergreen Boughs', festivals: wheel('yule'), keywords: ['everlasting life', 'hope', 'protection', 'pine', 'holly'] },
  { id: 'brigids-cross', name: 'Brigid’s Cross', festivals: wheel('imbolc'), keywords: ['Brigid', 'hearth', 'protection', 'rushes', 'woven'] },
  { id: 'ostara-eggs', name: 'Ostara Eggs', festivals: wheel('ostara'), keywords: ['new life', 'fertility', 'beginnings', 'painted eggs'] },
  { id: 'flower-crown', name: 'Flower Crown', festivals: wheel('beltane'), keywords: ['love', 'fertility', 'blossom', 'May Queen', 'woven'] },
  { id: 'sun-wheel', name: 'Sun Wheel', festivals: wheel('litha'), keywords: ['the sun', 'strength', 'the turning year', 'woven'] },
  { id: 'wheat-sheaf', name: 'Wheat Sheaf', festivals: wheel('lammas', 'mabon'), keywords: ['first harvest', 'bread', 'plenty', 'grain', 'straw'] },
  { id: 'corn-dolly', name: 'Corn Dolly', festivals: wheel('lammas', 'mabon'), keywords: ['the harvest spirit', 'abundance', 'gratitude', 'straw', 'woven'] },
  { id: 'apples', name: 'Apples', festivals: wheel('mabon', 'samhain'), keywords: ['harvest', 'the Otherworld', 'love', 'fruit'], food: 'harvest' },
  { id: 'gourds', name: 'Gourds', festivals: wheel('mabon', 'samhain'), keywords: ['harvest', 'abundance', 'squash', 'pumpkin'], food: 'harvest' },

  // The Greek year, from the Panathenaia in high summer.
  {
    id: 'panathenaic-olive', name: 'Olive Branch and Peplos', festivals: hellenic('panathenaia'), deities: ['Athena'],
    keywords: ['olive', 'peplos', 'weaving', 'Athens', 'procession'],
    description: 'Athena’s olive, her gift to Athens, with the new robe woven for her and carried to her in procession at the Panathenaia.',
  },
  {
    id: 'kernos', name: 'Kernos', festivals: hellenic('eleusinia'), deities: ['Demeter', 'Persephone'],
    keywords: ['grain', 'seeds', 'the Mysteries', 'Eleusis', 'first fruits'],
    description: 'A ring of small cups made as one, each holding a different grain, bean or seed, carried for Demeter and Persephone at the Mysteries.',
  },
  {
    id: 'kykeon', name: 'Kykeon', festivals: hellenic('eleusinia'), deities: ['Demeter'], food: 'drink',
    keywords: ['barley', 'pennyroyal', 'the Mysteries', 'Eleusis', 'fasting'],
    description: 'Barley and water with pennyroyal, the drink Demeter took to end her fast in her grief, and that the initiates drank at the Mysteries.',
  },
  {
    id: 'eiresione', name: 'Eiresione', festivals: hellenic('pyanepsia'), deities: ['Apollo'],
    keywords: ['olive', 'wool', 'figs', 'loaves', 'harvest', 'blessing', 'the door'],
    description: 'An olive branch wound with wool and hung with figs and little loaves, carried home at the Pyanepsia and hung by the door to keep the house for a year.',
  },
  {
    id: 'pyanepsia-beans', name: 'Pot of Beans', festivals: hellenic('pyanepsia'), deities: ['Apollo'], food: 'cooked',
    keywords: ['beans', 'pulses', 'harvest', 'homecoming', 'the pot'],
    description: 'Beans and pulses boiled together in one pot, as Theseus’s crew did with the last of their food on coming home, offered to Apollo at the Pyanepsia.',
  },
  {
    id: 'thyrsus', name: 'Thyrsus', festivals: hellenic('lenaia', 'dionysia'), deities: ['Dionysus'],
    keywords: ['ivy', 'pine cone', 'fennel', 'maenads', 'ecstasy'],
    description: 'A fennel staff tipped with a pine cone and wound with ivy, carried by Dionysus and the maenads who followed him.',
  },
  {
    id: 'theatre-mask', name: 'Theatre Mask', festivals: hellenic('lenaia', 'dionysia'), deities: ['Dionysus'],
    keywords: ['theatre', 'tragedy', 'comedy', 'drama', 'the actor'],
    description: 'An actor’s mask. Tragedy and comedy were born at Dionysus’s festivals, and every play was performed in his honour.',
  },
  {
    id: 'chous', name: 'Wine Jug of the Anthesteria', festivals: hellenic('anthesteria'), deities: ['Dionysus'],
    keywords: ['chous', 'Choes', 'new wine', 'the dead', 'libation', 'jug'],
    description: 'The little jug of the Anthesteria’s second day, when the new wine was opened and drunk, and the spirits of the dead walked until the festival’s close.',
  },
  {
    id: 'amphiphon', name: 'Moon Cake with Torches', festivals: hellenic('mounichia'), deities: ['Artemis'], food: 'bread',
    keywords: ['amphiphon', 'cake', 'torches', 'the full moon', 'light'],
    description: 'A round cake ringed with small lit torches, brought to Artemis at the Mounichia to shine like the full moon.',
  },
  {
    id: 'thargelos', name: 'Thargelos', festivals: hellenic('thargelia'), deities: ['Apollo', 'Artemis'], food: 'cooked',
    keywords: ['first fruits', 'porridge', 'harvest', 'purification', 'the pot'],
    description: 'The pot of the year’s first grain and fruits boiled together, offered to Apollo and Artemis on their birthdays at the Thargelia.',
  },
  // Every month: the Noumenia, the Agathos Daimon and Hekate’s Deipnon.
  {
    id: 'phiale', name: 'Phiale', festivals: monthly('noumenia', 'agathos_daimon'), deities: ['Agathos Daimon'], vessel: true,
    keywords: ['libation', 'wine', 'offering bowl', 'household gods', 'the Good Spirit'],
    description: 'A shallow bowl without handles for pouring libations of wine, water, milk or honey to the gods, as at the new month and to the Good Spirit of the house.',
  },
  {
    id: 'thymiaterion', name: 'Thymiaterion', festivals: monthly('noumenia'), deities: ['Hestia', 'Zeus', 'Apollo'],
    keywords: ['incense burner', 'frankincense', 'household gods', 'new month', 'the new moon'],
    description: 'An incense burner, lit with frankincense for the household gods at the Noumenia, the first day of the new month.',
  },
  {
    id: 'hekates-deipnon', name: 'Hekate’s Supper', festivals: monthly('deipnon'), deities: ['Hekate'], food: 'cooked',
    keywords: ['crossroads', 'the dead', 'cleansing', 'the dark moon', 'eggs', 'garlic'],
    description: 'Bread, eggs, garlic and cake for the month’s last night, traditionally left for Hekate at a crossroads and not eaten by the household.',
  },
];

/** What tonight's altar sets out first for a festival ("wheel/samhain"), when it isn't the first listed. */
const TONIGHT_FIRST: Record<string, string> = {
  'wheel/samhain': 'pumpkin-lantern',
  'wheel/yule': 'yule-log',
  'wheel/imbolc': 'brigids-cross',
  'wheel/ostara': 'ostara-eggs',
  'wheel/beltane': 'flower-crown',
  'wheel/litha': 'sun-wheel',
  'wheel/lammas': 'wheat-sheaf',
  'wheel/mabon': 'apples',
  'hellenic/noumenia': 'thymiaterion',
};

export const seasonalObject = (id: string) => SEASONAL_OBJECTS.find((o) => o.id === id) ?? null;

/** The offering kind a seasonal thing ages as (the food ones), or null for those that keep. */
export const seasonalFood = (id: string): string | null => seasonalObject(id)?.food ?? null;

/** Which seasonal thing a saved object is, by its id (its `form`), or null. */
export const seasonalIdOf = (object: { type?: string; form?: string }) => (object.type === 'seasonal' && seasonalObject(String(object.form || '')) ? String(object.form) : null);

/** A seasonal thing that holds an offering (the phiale), as a bowl or chalice does. */
export const seasonalHolds = (object: { type?: string; form?: string }) => !!seasonalObject(seasonalIdOf(object) ?? '')?.vessel;

/** A line about a seasonal thing, for its panel. */
export const seasonalDescription = (object: Pick<SavedObject, 'type' | 'form'>) => seasonalObject(seasonalIdOf(object) ?? '')?.description ?? '';

/** The drawer section (SEASONAL_TRADITIONS) a festival belongs to, or null. */
export const traditionOf = (ref: FestivalRef) => SEASONAL_TRADITIONS.find((t) => t.calendars.includes(ref.tradition)) ?? null;

/** A festival's key across calendars: "wheel/samhain", "hellenic/noumenia". */
export const festivalKey = (ref: FestivalRef) => `${traditionOf(ref)?.id ?? ref.tradition}/${ref.holiday}`;

/** A festival's name: "Samhain", "City Dionysia", "Hekate’s Deipnon". */
export function festivalName(ref: FestivalRef): string {
  if (ref.tradition === 'wheel') return sabbatName(ref.holiday);
  return TRADITIONS.find((t) => t.id === ref.tradition)?.holidays.find((h) => h.id === ref.holiday)?.name ?? '';
}

/** The sabbats a seasonal thing is kept for. */
export const sabbatsOf = (object: SeasonalObject): SabbatId[] => object.festivals.filter((f) => f.tradition === 'wheel').map((f) => f.holiday as SabbatId);

/** The festivals a seasonal thing is kept for, by name: "Lenaia · City Dionysia". */
export const festivalLine = (object: SeasonalObject) => object.festivals.map(festivalName).filter(Boolean).join(' · ');

/** Where a festival comes in its section, so each section reads through its calendar's year. */
function festivalOrder(key: string): number {
  const [group, holiday] = key.split('/');
  if (group === 'wheel') return SABBATS.findIndex((s) => s.id === holiday);
  const tradition = SEASONAL_TRADITIONS.find((t) => t.id === group);
  const all = TRADITIONS.filter((t) => tradition?.calendars.includes(t.id)).flatMap((t) => t.holidays.map((h) => h.id));
  return all.indexOf(holiday);
}

/**
 * The cabinet's Seasonal drawer: every seasonal thing that has a picture
 * (`images`, id → picture, from the artwork data), placed as `type: 'seasonal'`
 * with its id as its form. Found by its festivals' names, its gods and its
 * calendar ("sabbat", "Greek").
 */
export function seasonalCabinetItems(images: Record<string, string>): CabinetItem[] {
  return SEASONAL_OBJECTS.filter((o) => !!images[o.id]).map((o) => ({
    id: `seasonal:${o.id}`,
    category: 'seasonal',
    name: o.name,
    keywords: [
      ...new Set([...o.keywords, ...(o.deities ?? []), ...o.festivals.map(festivalName), ...o.festivals.flatMap((f) => traditionOf(f)?.words ?? [])]),
    ].filter(Boolean),
    sabbats: sabbatsOf(o),
    festivals: o.festivals.map(festivalKey),
    description: festivalLine(o),
    forms: [{ label: 'Place', image: images[o.id], type: 'seasonal', form: o.id }],
  }));
}

/** "wheel-samhain-2026-9-31" (or a bare "samhain") → "samhain": a holiday's own id, without its calendar or date. */
export function holidayKey(id: string): string {
  const bare = id.replace(/-\d+-\d+-\d+$/, '');
  const at = bare.indexOf('-');
  return at >= 0 ? bare.slice(at + 1) : bare;
}

/** The sabbat a holiday is (the Celtic year's Lughnasadh is Lammas, Bealtaine is Beltane), or null. */
export function sabbatOfHoliday(id: string): SabbatId | null {
  const key = holidayKey(id);
  if (key === 'lughnasadh' || key.startsWith('lughnasadh_')) return 'lammas';
  if (key === 'bealtaine') return 'beltane';
  if (key === 'la_fheile_bride') return 'imbolc';
  // The Celtic year's "samhain_gaelic" is Samhain too.
  return SABBATS.find((s) => key === s.id || key.startsWith(`${s.id}_`))?.id ?? null;
}

/**
 * The festivals (as "wheel/samhain" keys) a holiday from the calendars is,
 * among those that have seasonal things. `calendars` are the calendars it
 * came from (Holiday.traditionIds); without them, the one its id begins with.
 */
export function festivalsOfHoliday(id: string, calendars?: string[]): string[] {
  const bare = id.replace(/-\d+-\d+-\d+$/, '');
  const at = bare.indexOf('-');
  const from = calendars ?? (at >= 0 ? [bare.slice(0, at)] : null);
  const kept = new Set(SEASONAL_OBJECTS.flatMap((o) => o.festivals.map(festivalKey)));
  const out: string[] = [];
  for (const tradition of SEASONAL_TRADITIONS) {
    // A bare id ("samhain") may be from any calendar.
    if (from && !from.some((c) => tradition.calendars.includes(c))) continue;
    const festival = tradition.festivalOf ? tradition.festivalOf(id) : holidayKey(id);
    const key = `${tradition.id}/${festival}`;
    if (festival && kept.has(key) && !out.includes(key)) out.push(key);
  }
  return out;
}

export type FestivalNear = {
  /** "wheel/samhain", "hellenic/pyanepsia". */
  key: string;
  /** The drawer section it belongs to (SEASONAL_TRADITIONS). */
  tradition: string;
  name: string;
  /** The day it begins. */
  date: Date;
  /** How many days it runs. */
  days: number;
  /** 0 on the day, and on every day while it runs. */
  inDays: number;
  /** Which of its days today is (1-based), or 0 before it begins. */
  day: number;
};

/** How many days before a festival its things come to the front of the cabinet. */
export const SABBAT_LEAD_DAYS = 7;
/** The days that come every month (the Noumenia, Hekate's Deipnon) are near only the day before and on the day. */
export const MONTHLY_LEAD_DAYS = 1;

/**
 * The festivals that are near, soonest first: from a week before each
 * through its last day (the monthly days only from the day before), among
 * the calendars you keep (the Wheel of the Year, north or south, when none
 * has been chosen; single holidays picked into your own calendar count too).
 * Only festivals that have seasonal things.
 */
export function festivalsNear(now: Date, choice?: HolidayChoice | null): FestivalNear[] {
  const kept: HolidayChoice = choice ? { traditions: choice.traditions, custom: [], picked: choice.picked } : { traditions: DEFAULT_TRADITIONS, custom: [] };
  const today = startOfDay(now);
  const until = new Date(today.getFullYear(), today.getMonth(), today.getDate() + SABBAT_LEAD_DAYS);
  const out: FestivalNear[] = [];
  for (const holiday of holidaysBetween(today, until, kept)) {
    const inDays = Math.max(0, Math.round((holiday.date.getTime() - today.getTime()) / 86_400_000));
    if (holiday.recurs === 'monthly' && inDays > MONTHLY_LEAD_DAYS) continue;
    const offset = Math.round((today.getTime() - holiday.date.getTime()) / 86_400_000);
    for (const key of festivalsOfHoliday(holiday.id, holiday.traditionIds)) {
      // The same festival from two calendars (Lammas and Lughnasadh) once.
      if (out.some((n) => n.key === key)) continue;
      const [tradition, festival] = key.split('/');
      const ref = SEASONAL_OBJECTS.flatMap((o) => o.festivals).find((f) => festivalKey(f) === key);
      const name = tradition === 'wheel' ? sabbatName(festival) : ref ? festivalName(ref) : holiday.name;
      out.push({ key, tradition, name, date: holiday.date, days: holiday.days, inDays, day: offset >= 0 && offset < holiday.days ? offset + 1 : 0 });
    }
  }
  return out;
}

/**
 * When a near festival is, in a sentence: "Samhain is in 7 days.", and for
 * one of several days "Eleusinian Mysteries, in 6 days, for 9 days." and
 * "City Dionysia, day 3 of 7."
 */
export function festivalWhen(near: Pick<FestivalNear, 'name' | 'inDays' | 'days' | 'day'>): string {
  const when = near.inDays === 0 ? 'today' : near.inDays === 1 ? 'tomorrow' : `in ${near.inDays} days`;
  if (near.days <= 1) return `${near.name} is ${when}.`;
  if (near.day >= 1) return `${near.name}, day ${near.day} of ${near.days}.`;
  return `${near.name}, ${near.inDays === 1 ? 'from tomorrow' : when}, for ${near.days} days.`;
}

export type SabbatNear = { id: SabbatId; name: string; date: Date; /** 0 on the day. */ inDays: number };

/** The sabbat that is near (festivalsNear's first from the Wheel of the Year), or null between them. */
export function sabbatNear(now: Date, choice?: HolidayChoice | null): SabbatNear | null {
  const near = festivalsNear(now, choice).find((n) => n.tradition === 'wheel');
  return near ? { id: near.key.split('/')[1] as SabbatId, name: near.name, date: near.date, inDays: near.inDays } : null;
}

export type SeasonalSection = {
  title: string;
  /** The calendar section it is (SEASONAL_TRADITIONS), or null for a near festival's or your own. */
  tradition: string | null;
  /** The festival that is near, for a "For Samhain" section. */
  near: FestivalNear | null;
  items: CabinetItem[];
};

const festivalsOf = (item: CabinetItem): string[] => (Array.isArray(item.festivals) ? item.festivals : Array.isArray(item.sabbats) ? item.sabbats.map((s) => `wheel/${s}`) : []);

/**
 * The Seasonal drawer in sections: a "For Samhain" for each festival that is
 * near, soonest first; then each calendar's things ("Wheel of the Year",
 * "Greek festivals"), through its year; and anything of your own at the end.
 * Each thing is shown once, under the first section it belongs to.
 */
export function seasonalSections(items: CabinetItem[], near: FestivalNear[] | null = []): SeasonalSection[] {
  const used = new Set<string>();
  const sections: SeasonalSection[] = [];
  for (const festival of near ?? []) {
    const list = items.filter((item) => !used.has(item.id) && festivalsOf(item).includes(festival.key));
    list.forEach((item) => used.add(item.id));
    if (list.length) sections.push({ title: `For ${festival.name}`, tradition: null, near: festival, items: list });
  }
  for (const tradition of SEASONAL_TRADITIONS) {
    const first = (item: CabinetItem) => Math.min(...festivalsOf(item).filter((k) => k.startsWith(`${tradition.id}/`)).map(festivalOrder));
    const list = items
      .filter((item) => !used.has(item.id) && festivalsOf(item).some((k) => k.startsWith(`${tradition.id}/`)))
      .map((item, index) => ({ item, index, order: first(item) }))
      .sort((a, b) => a.order - b.order || a.index - b.index)
      .map(({ item }) => item);
    list.forEach((item) => used.add(item.id));
    if (list.length) sections.push({ title: tradition.title, tradition: tradition.id, near: null, items: list });
  }
  const rest = items.filter((item) => !used.has(item.id));
  if (rest.length) sections.push({ title: 'Your own', tradition: null, near: null, items: rest });
  return sections;
}

/** The near festivals that have something in the drawer (`items`), so the drawer is worth opening on. */
export const nearWithThings = (near: FestivalNear[] | null, items: CabinetItem[]) =>
  (near ?? []).filter((n) => items.some((item) => item.category === 'seasonal' && festivalsOf(item).includes(n.key)));

/** The seasonal things to set out for a festival ("wheel/samhain"), the most fitting first. */
export function seasonalForFestival(key: string): string[] {
  const all = SEASONAL_OBJECTS.filter((o) => o.festivals.some((f) => festivalKey(f) === key)).map((o) => o.id);
  const first = TONIGHT_FIRST[key];
  return first && all.includes(first) ? [first, ...all.filter((id) => id !== first)] : all;
}

/** The seasonal things to set out on a sabbat night, the most fitting first. */
export const seasonalFor = (sabbat: SabbatId): string[] => seasonalForFestival(`wheel/${sabbat}`);

/** The seasonal things for a holiday from the calendars ("hellenic-pyanepsia-2026-9-25"), the most fitting first. */
export const seasonalForHoliday = (id: string): string[] => [...new Set(festivalsOfHoliday(id).flatMap(seasonalForFestival))];
