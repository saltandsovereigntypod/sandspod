// Shore finds: what the sea gave, where and when, and what it's for. Saved in
// the craft store as `sea.finds`. Pure, so it can be tested.

import { rangeOnDay, type TideRange } from './tides.ts';

export const FINDS = 'sea.finds';

export const FIND_KINDS = [
  { id: 'shell', label: 'Shell' },
  { id: 'seaglass', label: 'Sea glass' },
  { id: 'stone', label: 'Stone' },
  { id: 'hagstone', label: 'Hagstone' },
  { id: 'driftwood', label: 'Driftwood' },
  { id: 'seaweed', label: 'Seaweed' },
  { id: 'feather', label: 'Feather' },
  { id: 'other', label: 'Other' },
] as const;

export type FindKind = (typeof FIND_KINDS)[number]['id'];

export const TIDE_STATES = [
  { id: 'rising', label: 'Rising' },
  { id: 'high', label: 'High' },
  { id: 'falling', label: 'Falling' },
  { id: 'low', label: 'Low' },
] as const;

export type TideState = (typeof TIDE_STATES)[number]['id'];

export type ShoreFind = {
  kind: FindKind;
  /** A short name of its own, optional: "the little cowrie". */
  name?: string;
  colour: string;
  /** Beach or shore. */
  where: string;
  /** "YYYY-MM-DD". */
  date: string;
  tide?: TideState | null;
  range?: TideRange | null;
  /** What it's for. */
  purpose: string;
  notes: string;
};

export const kindLabel = (id: string) => FIND_KINDS.find((k) => k.id === id)?.label ?? 'Find';
export const tideLabel = (id: string | null | undefined) => TIDE_STATES.find((t) => t.id === id)?.label ?? null;

export function blankFind(today: Date): ShoreFind {
  const date = isoDay(today);
  return { kind: 'shell', colour: '', where: '', date, tide: null, range: suggestRange(date), purpose: '', notes: '' };
}

export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseDay(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getMonth() === Number(m[2]) - 1 ? d : null;
}

/** Springs or neaps on the day, from the moon; null in between or for a bad date. */
export function suggestRange(date: string): TideRange | null {
  const d = parseDay(date);
  return d ? rangeOnDay(d) : null;
}

/** One line for a list row: "Sea glass · cobalt · Whitby · 12 Oct". */
export function findTitle(f: ShoreFind): string {
  const named = f.name?.trim();
  if (named) return named;
  const colour = f.colour.trim();
  return colour ? `${colour[0].toUpperCase()}${colour.slice(1)} ${kindLabel(f.kind).toLowerCase()}` : kindLabel(f.kind);
}

export type FindFilter = { kind?: string | null; where?: string | null; query?: string };

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export function filterFinds<T extends { data: ShoreFind }>(list: T[], filter: FindFilter): T[] {
  const words = fold(filter.query ?? '').split(/\s+/).filter(Boolean);
  return list.filter(({ data: f }) => {
    if (filter.kind && f.kind !== filter.kind) return false;
    if (filter.where && fold(f.where.trim()) !== fold(filter.where.trim())) return false;
    if (!words.length) return true;
    const text = fold([f.name, kindLabel(f.kind), f.colour, f.where, f.purpose, f.notes].filter(Boolean).join(' '));
    return words.every((w) => text.includes(w));
  });
}

/** The beaches you've logged, most-used first, for quick picking and filtering. */
export function beaches(list: { data: ShoreFind }[]): string[] {
  const counts = new Map<string, { name: string; n: number }>();
  for (const { data } of list) {
    const name = data.where.trim();
    if (!name) continue;
    const key = fold(name);
    const have = counts.get(key);
    counts.set(key, { name: have?.name ?? name, n: (have?.n ?? 0) + 1 });
  }
  return [...counts.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)).map((c) => c.name);
}

/** Sort newest find first (by the day it was found, then when it was logged). */
export function byFound<T extends { createdAt: string; data: ShoreFind }>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.data.date === b.data.date ? (a.createdAt < b.createdAt ? 1 : -1) : a.data.date < b.data.date ? 1 : -1));
}

export const COLOUR_HINTS: Partial<Record<FindKind, string[]>> = {
  seaglass: ['White', 'Brown', 'Kelly green', 'Seafoam', 'Amber', 'Aqua', 'Cobalt', 'Lavender', 'Red'],
  shell: ['White', 'Cream', 'Pink', 'Purple', 'Banded', 'Black'],
  stone: ['Grey', 'White', 'Black', 'Red', 'Green', 'Banded'],
  hagstone: ['Grey', 'White', 'Black', 'Chalk'],
  driftwood: ['Silver', 'Bleached', 'Dark'],
  seaweed: ['Green', 'Brown', 'Red'],
  feather: ['White', 'Grey', 'Black', 'Barred'],
};

/** What a find has long been used for, as a starting point for "what it's for". */
export const FIND_USES: Record<FindKind, string> = {
  shell: 'Shells hold water and so the sea itself: offerings to sea deities, love and beauty work, a bowl for salt or charms. Spirals for growth, cowries for prosperity and fertility, scallops for journeys.',
  seaglass: 'Glass made by the sea’s patience. Healing old hurts, softening sharp edges, colour magic by its hue.',
  stone: 'A piece of the shore to carry home: grounding, protection, a worry stone, a marker for a working.',
  hagstone: 'A stone with a hole worn right through by water or boring shellfish. Long hung by doors, beds and boats for protection, and looked through to see the hidden.',
  driftwood: 'Wood the sea has carried and let go. Wands, altar pieces, wishing sticks, journeys and surrender.',
  seaweed: 'Dried bladderwrack and kelp are kept for money and safe travel, and laid in floor washes and sea-witch bottles.',
  feather: 'Messages, air and the crossing between sea and sky.',
  other: 'Whatever the tide brought: note what it is and why it called to you.',
};

/** Sea glass by how often it turns up, commonest first. */
export const SEA_GLASS_RARITY: { level: string; colours: string; note: string }[] = [
  { level: 'Common', colours: 'White (clear), brown, kelly green', note: 'Bottles, jars and windows in their millions.' },
  {
    level: 'Less common',
    colours: 'Seafoam, forest green, golden amber, lime, jade, olive',
    note: 'Older soda, beer and wine bottles, and pale bottle glass of the 1800s and early 1900s.',
  },
  {
    level: 'Rare',
    colours: 'Cobalt and cornflower blue, aqua, citron, lavender, soft pink, grey',
    note: 'Medicine and poison bottles, old insulators and tableware. Lavender is clear glass made with manganese that the sun has turned violet.',
  },
  {
    level: 'Rarest',
    colours: 'Red, orange, yellow, turquoise, teal, true black',
    note: 'Lamps, lenses, art and tableware glass. Orange and red are the rarest of all. “Black” glass is usually very dark olive or amber: hold it to the light.',
  },
];

/** How to collect kindly and within the law. */
export const COLLECTING: { title: string; body: string }[] = [
  {
    title: 'Never take anything alive',
    body: 'Leave crabs, starfish, urchins, anemones and living sand dollars (brown or purple and fuzzy, not white) where they are. Return anything you turn over the way you found it.',
  },
  {
    title: 'Leave occupied shells',
    body: 'Look inside before you pocket a shell. A hermit crab or the animal that made it may still be at home; if in doubt, put it back in the water.',
  },
  {
    title: 'Check the rules for the beach',
    body: 'Many national and state parks, marine reserves and protected beaches forbid taking anything, shells and stones included. Some islands and shores fine people for taking sand, shells or pebbles, and in parts of Britain removing beach pebbles and sand can be an offence. Read the signs or ask a ranger.',
  },
  {
    title: 'Feathers and the law',
    body: 'In the US it’s illegal to keep the feathers of almost all native wild birds, gulls and pelicans included, even ones found on the sand. Other countries have their own rules. When unsure, take a photograph instead.',
  },
  {
    title: 'Seaweed and driftwood',
    body: 'Gather seaweed that has already washed up, not plants still growing on the rocks. Take only a handful, and leave driftwood that’s sheltering wildlife or holding a dune together.',
  },
  {
    title: 'Take a little, leave the rest',
    body: 'A few treasures, not a bag of them. Leave sea glass with sharp edges and a glassy shine to tumble a few more years. Pick up a piece of litter as thanks.',
  },
  {
    title: 'Not all that glows is amber',
    body: 'On some Baltic and North Sea beaches, lumps of white phosphorus from old munitions look like amber and can catch fire as they dry. Never pocket a “stone” you aren’t sure of, and report anything that looks like ordnance.',
  },
];
