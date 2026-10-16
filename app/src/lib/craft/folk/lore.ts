// Local lore: a notebook of the places, spirits, stories, customs and sayings
// of where you live, with who told you. Pure, so it can be tested.

import { dateFromKey, localDateKey } from '../../rituals/lifecycle.ts';

export const LORE = 'folk.lore';

export type LoreKind = 'place' | 'spirit' | 'story' | 'custom' | 'saying' | 'nature' | 'other';

export const LORE_KINDS: { id: LoreKind; label: string; hint: string }[] = [
  { id: 'place', label: 'Place', hint: 'A well, stone, hill, crossroads or old tree' },
  { id: 'spirit', label: 'Spirit or being', hint: 'Fairies, boggarts, black dogs, the house spirit' },
  { id: 'story', label: 'Story', hint: 'A tale told about here' },
  { id: 'custom', label: 'Custom', hint: 'Something people here do, or did' },
  { id: 'saying', label: 'Saying', hint: 'A rhyme, proverb or turn of phrase' },
  { id: 'nature', label: 'Plant or creature lore', hint: 'What’s said of a plant, bird or beast' },
  { id: 'other', label: 'Other', hint: '' },
];

export const loreKindLabel = (id: string) => LORE_KINDS.find((k) => k.id === id)?.label ?? 'Lore';

export type Lore = {
  kind: LoreKind;
  title: string;
  /** Where it belongs: a place name, parish, or "my grandmother’s farm". */
  where: string;
  lore: string;
  /** Who told you, or the book or archive it came from. */
  source: string;
  /** When you heard it, "YYYY-MM-DD", or blank. */
  heard: string;
};

export type LoreEntry = { id: string; createdAt: string; data: Lore };

export const blankLore = (now: Date): Lore => ({ kind: 'place', title: '', where: '', lore: '', source: '', heard: localDateKey(now) });

const KIND_IDS = LORE_KINDS.map((k) => k.id);

export function normalizeLore(raw: unknown): Lore {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Lore>;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  return {
    kind: KIND_IDS.includes(r.kind as LoreKind) ? (r.kind as LoreKind) : 'other',
    title: str(r.title),
    where: str(r.where),
    lore: str(r.lore),
    source: str(r.source),
    heard: dateFromKey(str(r.heard)) ? str(r.heard) : '',
  };
}

/** Entries of one kind (or all), matching every word of the search, newest written first. */
export function filterLore<T extends LoreEntry>(list: T[], kind: LoreKind | null, query: string): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return list
    .filter((e) => {
      if (kind && e.data.kind !== kind) return false;
      if (!words.length) return true;
      const hay = [e.data.title, e.data.where, e.data.lore, e.data.source, loreKindLabel(e.data.kind)].join(' ').toLowerCase();
      return words.every((w) => hay.includes(w));
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** How many entries of each kind, for the filter chips. */
export function loreCounts(list: LoreEntry[]): Record<LoreKind, number> {
  const out = Object.fromEntries(KIND_IDS.map((k) => [k, 0])) as Record<LoreKind, number>;
  for (const e of list) out[e.data.kind] = (out[e.data.kind] ?? 0) + 1;
  return out;
}

/** The places you have lore for, most entries first, for a "your places" view. */
export function lorePlaces(list: LoreEntry[]): { where: string; count: number }[] {
  const counts = new Map<string, { where: string; count: number }>();
  for (const e of list) {
    const where = e.data.where.trim();
    if (!where) continue;
    const key = where.toLowerCase();
    const have = counts.get(key);
    counts.set(key, { where: have?.where ?? where, count: (have?.count ?? 0) + 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.where.localeCompare(b.where));
}
