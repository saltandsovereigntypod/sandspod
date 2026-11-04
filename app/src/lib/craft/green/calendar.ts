// The garden and foraging calendar: for any month, what to sow and plant and
// what to gather in the garden (season.ts, keyed to the Living Library's
// herbs), what to forage (hearth/forage.ts), and what of your own is in
// season: plants in your garden log, the patches you know of, potted plants
// on your altars, and herbs on your shelves you could gather fresh. Turned
// six months for the southern hemisphere, as the person's calendar
// settings say. Pure, so it can be tested.

import { hemisphereFrom } from '../../seasons.ts';
import { forageByKey, FORAGE_PLANTS, type ForagePlant, type Patch } from '../hearth/forage.ts';
import type { Plant } from './garden.ts';
import { northernMonth, SEASON_PLANTS, type Hemisphere, type SeasonPlant } from './season.ts';

export type YoursKind = 'sow' | 'gather' | 'forage' | 'restock';

export type YoursItem = { key: string; name: string; kind: YoursKind; detail: string; href: string };

export type CalendarMonth = {
  month: number;
  hemisphere: Hemisphere;
  sow: SeasonPlant[];
  harvest: SeasonPlant[];
  forage: ForagePlant[];
  yours: YoursItem[];
};

export type Mine = {
  garden?: { id: string; data: Plant }[];
  patches?: { id: string; data: Patch }[];
  shelves?: { id: string; item: { name: string; ref: string; shelf: string } }[];
  potted?: { id: string; name: string }[];
};

type SettingsLike = Record<string, unknown> | null | undefined;

/** North or south: the hemisphere chosen in Settings, else the saved place's latitude, else north. */
export const calendarHemisphere = (settings: SettingsLike, latitude: number | null | undefined): Hemisphere => hemisphereFrom(settings, latitude);

const norm = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z ]+/g, ' ').trim();

/** The garden plant a name or Library key stands for: by key first, then by its name in the words. */
export function seasonPlantFor(herb: string | null | undefined, name: string): SeasonPlant | null {
  if (herb) {
    const byKey = SEASON_PLANTS.find((p) => p.key === herb);
    if (byKey) return byKey;
  }
  const words = ` ${norm(name)} `;
  return SEASON_PLANTS.find((p) => words.includes(` ${norm(p.name)} `)) ?? null;
}

/** The herb key in a Living Library ref ("traditional/herb/rosemary" → "rosemary"). */
const herbOfRef = (ref: string) => /^traditional\/herb\/([\w-]+)$/.exec(ref)?.[1] ?? null;

/** Everything for one local month (1–12). */
export function gardenCalendar(month: number, hemisphere: Hemisphere, mine: Mine = {}): CalendarMonth {
  const m = northernMonth(month, hemisphere);
  const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name);
  const sow = SEASON_PLANTS.filter((p) => p.sow.includes(m)).sort(byName);
  const harvest = SEASON_PLANTS.filter((p) => p.harvest.includes(m)).sort(byName);
  const forage = FORAGE_PLANTS.filter((p) => p.months.includes(m)).sort(byName);
  const yours: YoursItem[] = [];

  for (const g of mine.garden ?? []) {
    if (g.data.goneOn) continue;
    const plant = seasonPlantFor(g.data.herb, g.data.name);
    if (!plant) continue;
    const where = g.data.place ? ` in ${g.data.place}` : '';
    if (plant.harvest.includes(m)) yours.push({ key: `garden:${g.id}:gather`, name: g.data.name || plant.name, kind: 'gather', detail: `Ready to gather${where}. ${plant.harvestWhat}.`, href: `/rituals/craft/green/plant/${g.id}` });
    else if (plant.sow.includes(m)) yours.push({ key: `garden:${g.id}:sow`, name: g.data.name || plant.name, kind: 'sow', detail: `A month to sow or plant more. ${plant.sowWhat}.`, href: `/rituals/craft/green/plant/${g.id}` });
  }
  for (const p of mine.patches ?? []) {
    const plant = forageByKey(p.data.forage);
    if (!plant?.months.includes(m)) continue;
    yours.push({ key: `patch:${p.id}`, name: p.data.name, kind: 'forage', detail: `Your patch${p.data.spot ? ` ${p.data.spot}` : ''}: ${plant.when}.`, href: `/rituals/craft/hearth/forage/harvest-edit?patch=${encodeURIComponent(p.id)}` });
  }
  for (const pot of mine.potted ?? []) {
    const plant = seasonPlantFor(null, pot.name);
    if (plant?.harvest.includes(m)) yours.push({ key: `potted:${pot.id}`, name: pot.name, kind: 'gather', detail: `On your altar, and ready to gather. ${plant.harvestWhat}.`, href: '/altar' });
  }
  for (const s of mine.shelves ?? []) {
    if (s.item.shelf !== 'herbs') continue;
    const herb = herbOfRef(s.item.ref);
    const garden = seasonPlantFor(herb, s.item.name);
    const wild = FORAGE_PLANTS.find((f) => (herb && f.library === herb) || norm(f.name) === norm(s.item.name));
    if (garden?.harvest.includes(m) || wild?.months.includes(m)) {
      yours.push({ key: `shelf:${s.id}`, name: s.item.name, kind: 'restock', detail: 'On your shelves, and in season now: gather it fresh to fill the jar again.', href: `/rituals/shelves/${s.id}` });
    }
  }
  const order: YoursKind[] = ['gather', 'forage', 'sow', 'restock'];
  yours.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || a.name.localeCompare(b.name));
  return { month, hemisphere, sow, harvest, forage, yours };
}

export type YearRow = { key: string; name: string; source: 'garden' | 'forage'; sow: boolean[]; gather: boolean[] };

/** The whole year, a row for each plant and twelve local months (index 0 is January). */
export function yearGrid(hemisphere: Hemisphere): YearRow[] {
  const months = (northern: number[]) => Array.from({ length: 12 }, (_, i) => northern.includes(northernMonth(i + 1, hemisphere)));
  const garden: YearRow[] = SEASON_PLANTS.map((p) => ({ key: `garden:${p.key}`, name: p.name, source: 'garden', sow: months(p.sow), gather: months(p.harvest) }));
  const wild: YearRow[] = FORAGE_PLANTS.map((p) => ({ key: `forage:${p.key}`, name: p.name, source: 'forage', sow: months([]), gather: months(p.months) }));
  return [...garden, ...wild].sort((a, b) => a.name.localeCompare(b.name));
}
