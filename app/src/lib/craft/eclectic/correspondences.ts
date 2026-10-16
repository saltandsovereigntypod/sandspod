// My correspondences: your own meanings for things, beside the Library's
// traditional ones. Saved in the craft store as `eclectic.correspondences`.
// Pure, so it can be tested.

import { CRAFT_TOOLS, type CraftTool } from '../practices.ts';
import { plainValue, traditionalEntries } from '../../library/model.ts';
import type { LibraryEntry } from '../../library/types.ts';
import { PRACTICES } from '../../rituals/premade/index.ts';
import type { PracticeId } from '../../rituals/premade/types.ts';

export const CORRESPONDENCES = 'eclectic.correspondences';

export const SOURCES = [
  { id: 'tradition', label: 'A tradition' },
  { id: 'intuition', label: 'Intuition' },
  { id: 'teacher', label: 'A teacher' },
  { id: 'experience', label: 'Experience' },
] as const;

export type SourceId = (typeof SOURCES)[number]['id'];

export type MyCorrespondence = {
  /** What it is, in your words (or the Library entry's name). */
  name: string;
  /** A Library entry, `traditional:<type>:<key>`, when you picked one. */
  ref?: string | null;
  /** What it means to you. */
  meaning: string;
  element: string;
  planet: string;
  day: string;
  colour: string;
  source: SourceId | null;
  /** Which tradition, teacher or experience. */
  sourceNote: string;
};

export const sourceLabel = (id: string | null | undefined) => SOURCES.find((s) => s.id === id)?.label ?? null;

export function blankCorrespondence(): MyCorrespondence {
  return { name: '', ref: null, meaning: '', element: '', planet: '', day: '', colour: '', source: null, sourceNote: '' };
}

export const ELEMENTS = ['Earth', 'Air', 'Fire', 'Water', 'Spirit'];
export const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const COLOURS = ['White', 'Black', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Silver', 'Gold', 'Brown'];

/** The Library shelves you can pick a thing from. */
export const PICK_TYPES = [
  { id: 'herb', label: 'Herbs' },
  { id: 'crystal', label: 'Crystals' },
  { id: 'candle', label: 'Candles' },
  { id: 'deity', label: 'Deities' },
  { id: 'tool', label: 'Tools' },
] as const;

const pickTypeIds = new Set<string>(PICK_TYPES.map((t) => t.id));

/** Library entries that can be picked: the five shelves, without guide pages. */
export function pickableEntries(all: LibraryEntry[] = traditionalEntries()): LibraryEntry[] {
  return all.filter((e) => pickTypeIds.has(e.type) && !e.id.split(':').pop()!.startsWith('_'));
}

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ');

/** Library entries for the picker, names starting with the search first. */
export function searchPickable(entries: LibraryEntry[], query: string, type: string | null, limit = 24): LibraryEntry[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  const scoped = entries.filter((e) => !type || e.type === type);
  if (!words.length) return scoped.slice(0, limit);
  const phrase = words.join(' ');
  return scoped
    .map((e) => ({ e, name: fold(e.name).trim(), text: fold(`${e.name} ${e.tags.join(' ')}`) }))
    .filter((x) => words.every((w) => x.text.includes(w)))
    .sort((a, b) => Number(!a.name.startsWith(phrase)) - Number(!b.name.startsWith(phrase)) || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((x) => x.e);
}

export function entryById(id: string | null | undefined, all: LibraryEntry[] = traditionalEntries()): LibraryEntry | null {
  return id ? all.find((e) => e.id === id) ?? null : null;
}

// The traditional fields worth setting beside your own, by shelf.
const TRADITIONAL_FIELDS: Record<string, [string, string][]> = {
  herb: [
    ['Element', 'Element'],
    ['Planet', 'Planet'],
    ['Uses', 'Uses'],
    ['TraditionalMeaning', 'Meaning'],
  ],
  crystal: [
    ['Element', 'Element'],
    ['Planet', 'Planet'],
    ['Chakra', 'Chakra'],
    ['Uses', 'Uses'],
    ['TraditionalMeaning', 'Meaning'],
  ],
  candle: [
    ['Element', 'Element'],
    ['Planet', 'Planet'],
    ['Uses', 'Uses'],
    ['BestFor', 'Best for'],
    ['TraditionalMeaning', 'Meaning'],
  ],
  deity: [
    ['Pantheon', 'Pantheon'],
    ['Domains', 'Domains'],
    ['CandleColors', 'Colours'],
    ['SacredSymbols', 'Symbols'],
    ['TraditionalMeaning', 'Meaning'],
  ],
  tool: [
    ['Element', 'Element'],
    ['Purpose', 'Purpose'],
    ['UsedFor', 'Used for'],
  ],
};

export type Pair = { label: string; value: string };

/** The Library's traditional correspondences for an entry, in a stable order. */
export function traditionalSide(entry: LibraryEntry): Pair[] {
  const fields = TRADITIONAL_FIELDS[entry.type] ?? [
    ['Element', 'Element'],
    ['Planet', 'Planet'],
  ];
  const record = (entry.traditional ?? {}) as Record<string, unknown>;
  return fields.map(([key, label]) => ({ label, value: plainValue(record[key]) })).filter((p) => p.value);
}

/** Your own side, only the parts you filled in. */
export function mySide(c: MyCorrespondence): Pair[] {
  return (
    [
      ['Meaning', c.meaning],
      ['Element', c.element],
      ['Planet', c.planet],
      ['Day', c.day],
      ['Colour', c.colour],
    ] as [string, string][]
  )
    .map(([label, value]) => ({ label, value: (value ?? '').trim() }))
    .filter((p) => p.value);
}

/** Where your element and planet meet the Library's, and where you've gone your own way. */
export function agreement(c: MyCorrespondence, entry: LibraryEntry): { label: string; mine: string; theirs: string; same: boolean }[] {
  const record = (entry.traditional ?? {}) as Record<string, unknown>;
  const out: { label: string; mine: string; theirs: string; same: boolean }[] = [];
  for (const [label, mine, key] of [
    ['Element', c.element, 'Element'],
    ['Planet', c.planet, 'Planet'],
  ] as const) {
    const theirs = plainValue(record[key]);
    if (!mine.trim() || !theirs) continue;
    const words = new Set(fold(theirs).split(/\s+/).filter(Boolean));
    const same = fold(mine).split(/\s+/).filter(Boolean).some((w) => words.has(w));
    out.push({ label, mine: mine.trim(), theirs, same });
  }
  return out;
}

export type CorrespondenceFilter = { query?: string; source?: string | null; element?: string | null };

export function filterCorrespondences<T extends { data: MyCorrespondence }>(list: T[], filter: CorrespondenceFilter): T[] {
  const words = fold(filter.query ?? '').split(/\s+/).filter(Boolean);
  return list.filter(({ data: c }) => {
    if (filter.source && c.source !== filter.source) return false;
    if (filter.element && !fold(c.element).includes(fold(filter.element))) return false;
    if (!words.length) return true;
    const text = fold([c.name, c.meaning, c.element, c.planet, c.day, c.colour, sourceLabel(c.source), c.sourceNote].filter(Boolean).join(' '));
    return words.every((w) => text.includes(w));
  });
}

/** A to Z by name. */
export const byName = <T extends { data: MyCorrespondence }>(list: T[]) =>
  [...list].sort((a, b) => a.data.name.localeCompare(b.data.name, undefined, { sensitivity: 'base' }));

/** One line under a name: "Fire · Mars · Tuesday · Intuition". */
export function correspondenceDetail(c: MyCorrespondence): string {
  const tags = [c.element, c.planet, c.day, c.colour].map((s) => s.trim()).filter(Boolean);
  const meaning = c.meaning.trim();
  return [meaning.length > 60 ? `${meaning.slice(0, 57).trimEnd()}…` : meaning, tags.join(' · ')].filter(Boolean).join(' — ');
}

// ---------------------------------------------------------------------------
// From every path

export type SamplerItem = { practice: PracticeId; practiceName: string; tool: CraftTool };

const dayOfYear = (d: Date) => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 86_400_000);

/** One tool from each other practice, turning daily so the whole kit comes round. */
export function sampler(today: Date): SamplerItem[] {
  const n = dayOfYear(today);
  return PRACTICES.filter((p) => p.id !== 'eclectic').map((p) => {
    const tools = CRAFT_TOOLS[p.id];
    return { practice: p.id, practiceName: p.name, tool: tools[n % tools.length] };
  });
}
