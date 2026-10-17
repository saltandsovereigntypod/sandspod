// The deities someone keeps, in Settings → My practice → My deities: each
// from the Living Library or named in their own words, with how close the
// relationship is (exploring, dedicated, patron) and since when. Stored as
// JSON in the `my_deities` setting, so it syncs with the rest of settings. Pure.

export const MY_DEITIES_KEY = 'my_deities';

export type DeityLevel = 'exploring' | 'dedicated' | 'patron';

export const LEVELS: { value: DeityLevel; label: string; note: string }[] = [
  { value: 'exploring', label: 'Exploring', note: 'Getting to know them: reading, small offerings, listening.' },
  { value: 'dedicated', label: 'Dedicated', note: 'You’ve made a dedication and keep a regular practice with them.' },
  { value: 'patron', label: 'Patron', note: 'Your patron or matron: the deity at the heart of your practice.' },
];

export type MyDeity = {
  /** Living Library deity key (e.g. "hekate"), or null for one named in your own words. */
  key: string | null;
  name: string;
  level: DeityLevel;
  /** When it began, YYYY-MM-DD. */
  since: string;
  /** Your own note. */
  note?: string;
};

type SettingsLike = Record<string, unknown> | null | undefined;

const isLevel = (v: unknown): v is DeityLevel => v === 'exploring' || v === 'dedicated' || v === 'patron';
const LEVEL_ORDER: Record<DeityLevel, number> = { patron: 0, dedicated: 1, exploring: 2 };

/** The deities kept, closest first, then by name. Bad or missing data reads as none. */
export function myDeities(settings: SettingsLike): MyDeity[] {
  const raw = settings?.[MY_DEITIES_KEY];
  let list: unknown;
  try {
    list = typeof raw === 'string' && raw ? JSON.parse(raw) : [];
  } catch {
    list = [];
  }
  if (!Array.isArray(list)) return [];
  const out: MyDeity[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const d = item as Record<string, unknown>;
    const name = typeof d.name === 'string' ? d.name.trim() : '';
    if (!name) continue;
    out.push({
      key: typeof d.key === 'string' && d.key ? d.key : null,
      name,
      level: isLevel(d.level) ? d.level : 'exploring',
      since: typeof d.since === 'string' ? d.since : '',
      ...(typeof d.note === 'string' && d.note ? { note: d.note } : {}),
    });
  }
  return out.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || a.name.localeCompare(b.name));
}

/** The settings value for a list of deities. */
export const deitiesValue = (list: MyDeity[]) => JSON.stringify(list);

const same = (a: MyDeity, key: string | null, name: string) => (key ? a.key === key : !a.key && a.name.toLowerCase() === name.trim().toLowerCase());

/** Add a deity, or update it if it's already kept. */
export function withDeity(list: MyDeity[], deity: MyDeity): MyDeity[] {
  const rest = list.filter((d) => !same(d, deity.key, deity.name));
  return [...rest, deity];
}

export const withoutDeity = (list: MyDeity[], deity: Pick<MyDeity, 'key' | 'name'>) => list.filter((d) => !same(d, deity.key, deity.name));

export const findDeity = (list: MyDeity[], key: string | null, name = '') => list.find((d) => same(d, key, name)) ?? null;

/** The patrons (there may be more than one), else nobody. */
export const patrons = (list: MyDeity[]) => list.filter((d) => d.level === 'patron');

export const levelLabel = (level: DeityLevel) => LEVELS.find((l) => l.value === level)?.label ?? 'Exploring';
