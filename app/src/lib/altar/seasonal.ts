// Seasonal things for the altar, each kept for one or more of the eight
// sabbats: lanterns and a pomegranate at Samhain, the Yule log, Brigid's
// cross, eggs at Ostara, and the harvest's wheat, corn dolly, apples and
// gourds. Each has a painted picture (assets/altar/objects/seasonal/<id>/<id>.png,
// listed by scripts/build-altar-artwork.mjs); one without a picture isn't
// offered. In the week before a sabbat (and on the day) the cabinet shows
// that sabbat's things first, and tonight's altar can set one out. The ones
// that are food go over as offerings do (offerings.ts); the woven and straw
// ones keep. Pure, so it can be tested.

import { startOfDay } from '../calendar.ts';
import { holidaysBetween, type HolidayChoice } from '../holidays.ts';
import type { CabinetItem } from './types.ts';

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

export type SeasonalObject = {
  id: string;
  name: string;
  sabbats: SabbatId[];
  keywords: string[];
  /** Food that goes over as an offering does (an offering kind in offerings.ts); absent for things that keep. */
  food?: 'harvest';
};

/** In the order each sabbat's things are shown, the first of each set out on tonight's altar. */
export const SEASONAL_OBJECTS: SeasonalObject[] = [
  { id: 'pumpkin-lantern', name: 'Pumpkin Lantern', sabbats: ['samhain'], keywords: ['lantern', 'guiding the dead', 'protection', 'jack o’ lantern'] },
  { id: 'turnip-lantern', name: 'Turnip Lantern', sabbats: ['samhain'], keywords: ['lantern', 'the old ways', 'guiding the dead', 'protection'] },
  { id: 'pomegranate', name: 'Pomegranate', sabbats: ['samhain'], keywords: ['the dead', 'Persephone', 'the underworld', 'fruit'], food: 'harvest' },
  { id: 'yule-log', name: 'Yule Log', sabbats: ['yule'], keywords: ['the returning sun', 'hearth', 'luck', 'warmth'] },
  { id: 'evergreen-boughs', name: 'Evergreen Boughs', sabbats: ['yule'], keywords: ['everlasting life', 'hope', 'protection', 'pine', 'holly'] },
  { id: 'brigids-cross', name: 'Brigid’s Cross', sabbats: ['imbolc'], keywords: ['Brigid', 'hearth', 'protection', 'rushes', 'woven'] },
  { id: 'ostara-eggs', name: 'Ostara Eggs', sabbats: ['ostara'], keywords: ['new life', 'fertility', 'beginnings', 'painted eggs'] },
  { id: 'flower-crown', name: 'Flower Crown', sabbats: ['beltane'], keywords: ['love', 'fertility', 'blossom', 'May Queen', 'woven'] },
  { id: 'sun-wheel', name: 'Sun Wheel', sabbats: ['litha'], keywords: ['the sun', 'strength', 'the turning year', 'woven'] },
  { id: 'wheat-sheaf', name: 'Wheat Sheaf', sabbats: ['lammas', 'mabon'], keywords: ['first harvest', 'bread', 'plenty', 'grain', 'straw'] },
  { id: 'corn-dolly', name: 'Corn Dolly', sabbats: ['lammas', 'mabon'], keywords: ['the harvest spirit', 'abundance', 'gratitude', 'straw', 'woven'] },
  { id: 'apples', name: 'Apples', sabbats: ['mabon', 'samhain'], keywords: ['harvest', 'the Otherworld', 'love', 'fruit'], food: 'harvest' },
  { id: 'gourds', name: 'Gourds', sabbats: ['mabon', 'samhain'], keywords: ['harvest', 'abundance', 'squash', 'pumpkin'], food: 'harvest' },
];

/** What tonight's altar sets out for each sabbat, before the rest of its things. */
const TONIGHT_FIRST: Record<SabbatId, string> = {
  samhain: 'pumpkin-lantern',
  yule: 'yule-log',
  imbolc: 'brigids-cross',
  ostara: 'ostara-eggs',
  beltane: 'flower-crown',
  litha: 'sun-wheel',
  lammas: 'wheat-sheaf',
  mabon: 'apples',
};

export const seasonalObject = (id: string) => SEASONAL_OBJECTS.find((o) => o.id === id) ?? null;

/** The offering kind a seasonal thing ages as (the food ones), or null for those that keep. */
export const seasonalFood = (id: string): string | null => seasonalObject(id)?.food ?? null;

/** Which seasonal thing a saved object is, by its id (its `form`), or null. */
export const seasonalIdOf = (object: { type?: string; form?: string }) => (object.type === 'seasonal' && seasonalObject(String(object.form || '')) ? String(object.form) : null);

/**
 * The cabinet's Seasonal drawer: every seasonal thing that has a picture
 * (`images`, id → picture, from the artwork data), placed as `type: 'seasonal'`
 * with its id as its form.
 */
export function seasonalCabinetItems(images: Record<string, string>): CabinetItem[] {
  return SEASONAL_OBJECTS.filter((o) => !!images[o.id]).map((o) => ({
    id: `seasonal:${o.id}`,
    category: 'seasonal',
    name: o.name,
    keywords: [...o.keywords, ...o.sabbats.map(sabbatName)],
    sabbats: [...o.sabbats],
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
  // The Celtic year's "samhain_gaelic" is Samhain too.
  return SABBATS.find((s) => key === s.id || key.startsWith(`${s.id}_`))?.id ?? null;
}

export type SabbatNear = { id: SabbatId; name: string; date: Date; /** 0 on the day. */ inDays: number };

/** How many days before a sabbat its things come to the front of the cabinet. */
export const SABBAT_LEAD_DAYS = 7;

/**
 * The sabbat that is near: from a week before it through the day itself, on
 * the Wheel of the Year your calendars keep (the Southern Hemisphere's when
 * that's the one you chose; the Northern otherwise). Null between them.
 */
export function sabbatNear(now: Date, choice?: HolidayChoice | null): SabbatNear | null {
  const chosen = (choice?.traditions ?? []).filter((id) => id === 'wheel' || id === 'wheel_south');
  const traditions = chosen.length ? chosen : ['wheel'];
  const today = startOfDay(now);
  const until = new Date(today.getFullYear(), today.getMonth(), today.getDate() + SABBAT_LEAD_DAYS);
  for (const holiday of holidaysBetween(today, until, { traditions, custom: [] })) {
    const id = sabbatOfHoliday(holiday.id);
    if (!id) continue;
    const inDays = Math.max(0, Math.round((holiday.date.getTime() - today.getTime()) / 86_400_000));
    return { id, name: sabbatName(id), date: holiday.date, inDays };
  }
  return null;
}

export type SeasonalSection = { title: string; sabbat: SabbatId | null; items: CabinetItem[] };

const sabbatsOf = (item: CabinetItem): string[] => (Array.isArray(item.sabbats) ? item.sabbats : []);

/**
 * The Seasonal drawer in sections: "For Samhain" first when it is near, then
 * each sabbat round the wheel from the next one, and anything of your own at
 * the end. A thing kept at two sabbats is shown under the first.
 */
export function seasonalSections(items: CabinetItem[], near: SabbatNear | null): SeasonalSection[] {
  const start = near ? SABBATS.findIndex((s) => s.id === near.id) : 0;
  const order = [...SABBATS.slice(start), ...SABBATS.slice(0, start)];
  const used = new Set<string>();
  const sections: SeasonalSection[] = [];
  for (const sabbat of order) {
    const list = items.filter((item) => !used.has(item.id) && sabbatsOf(item).includes(sabbat.id));
    list.forEach((item) => used.add(item.id));
    if (list.length) sections.push({ title: near?.id === sabbat.id ? `For ${sabbat.name}` : sabbat.name, sabbat: sabbat.id, items: list });
  }
  const rest = items.filter((item) => !used.has(item.id));
  if (rest.length) sections.push({ title: 'Your own', sabbat: null, items: rest });
  return sections;
}

/** The seasonal things to set out on a sabbat night, the most fitting first. */
export function seasonalFor(sabbat: SabbatId): string[] {
  const all = SEASONAL_OBJECTS.filter((o) => o.sabbats.includes(sabbat)).map((o) => o.id);
  const first = TONIGHT_FIRST[sabbat];
  return [first, ...all.filter((id) => id !== first)];
}
