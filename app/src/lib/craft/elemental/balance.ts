// Elements in your work: how much earth, air, fire and water runs through
// the things you actually use, read from the Living Library's Element field
// for each altar object and each Library ingredient on your rituals and
// templates. Pure, so it can be tested.

import { dayRuler } from '../../calendar.ts';
import { TRADITIONAL_LIBRARY } from '../../library/traditionalData.ts';

export type Element = 'Earth' | 'Air' | 'Fire' | 'Water';
export const ELEMENTS: Element[] = ['Earth', 'Air', 'Fire', 'Water'];

type Record_ = { DisplayName?: string; Element?: string };
const LIBRARY = TRADITIONAL_LIBRARY as unknown as Record<string, Record<string, Record_>>;

export type ElementSource = 'altar' | 'ritual' | 'template';

export type ElementUse = {
  /** Living Library id, "traditional:herb:basil". */
  id: string;
  name: string;
  element: Element | 'Spirit';
  source: ElementSource;
};

const keyOf = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[\s-]+/g, '_');

/** A Library entry by type and key (or display name), if it has an element. */
export function libraryElement(type: string, value: string): { id: string; name: string; element: Element | 'Spirit' } | null {
  const shelf = LIBRARY[type];
  if (!shelf || !value) return null;
  const key = keyOf(value);
  let found: [string, Record_] | undefined = shelf[key] ? [key, shelf[key]] : undefined;
  if (!found) found = Object.entries(shelf).find(([k, v]) => !k.startsWith('_') && v && keyOf(String(v.DisplayName ?? '')) === key);
  if (!found) return null;
  const [k, record] = found;
  const element = record?.Element;
  if (element !== 'Earth' && element !== 'Air' && element !== 'Fire' && element !== 'Water' && element !== 'Spirit') return null;
  return { id: `traditional:${type}:${k}`, name: String(record.DisplayName ?? k), element };
}

/** "traditional/herb/basil" or "traditional:herb:basil". */
export function elementOfRef(ref: string | null | undefined) {
  const parts = String(ref ?? '').split(/[/:]/);
  if (parts.length !== 3 || parts[0] !== 'traditional') return null;
  return libraryElement(parts[1], parts[2]);
}

/** The fields of an altar object (SavedObject) that name what it is. */
export type ObjectLike = {
  entityId?: string;
  herb?: string;
  crystal?: string;
  color?: string;
  tool?: string;
  vessel?: string;
  type?: string;
  [key: string]: unknown;
};

/** What an altar object stands for, as the Companion resolves it: an explicit Library ref, then its herb, stone, candle colour or tool. */
export function elementOfObject(object: ObjectLike | null | undefined) {
  if (!object || typeof object !== 'object') return null;
  const explicit = elementOfRef(typeof object.entityId === 'string' ? object.entityId : null);
  if (explicit) return explicit;
  const tries: [string, unknown][] = [
    ['herb', object.herb],
    ['crystal', object.crystal],
    ['candle', object.type === 'candle' || !object.type ? object.color : undefined],
    ['tool', object.tool],
    ['tool', object.vessel],
  ];
  for (const [type, value] of tries) {
    if (typeof value !== 'string' || !value.trim()) continue;
    const hit = libraryElement(type, value);
    if (hit) return hit;
  }
  return null;
}

export type WorkSources = {
  altars: { objects?: unknown }[];
  links: { entity_id?: string | null; link_type?: string; ritual_id?: string | null; template_id?: string | null }[];
  templates: { id: string; metadata?: Record<string, unknown> | null; status?: string }[];
  journal: { id: string; altar_snapshot?: Record<string, unknown> | null; metadata?: Record<string, unknown> | null }[];
};

const objectsOf = (holder: unknown): unknown[] => {
  const objects = (holder as { objects?: unknown } | null)?.objects;
  return Array.isArray(objects) ? objects : [];
};

const refsOf = (metadata: Record<string, unknown> | null | undefined): string[] => {
  const list = metadata?.ingredients;
  return Array.isArray(list) ? list.map((i) => (i && typeof i === 'object' ? String((i as { ref?: unknown }).ref ?? '') : '')).filter(Boolean) : [];
};

/** Every element-bearing thing you use, once per place you use it. */
export function gatherUses(sources: WorkSources): ElementUse[] {
  const uses: ElementUse[] = [];
  const push = (hit: ReturnType<typeof elementOfRef>, source: ElementSource) => {
    if (hit) uses.push({ ...hit, source });
  };

  for (const altar of sources.altars) for (const object of objectsOf(altar)) push(elementOfObject(object as ObjectLike), 'altar');

  // Signed in, the ritual links already hold each journal's and template's Library items.
  const linkedRituals = new Set<string>();
  const linkedTemplates = new Set<string>();
  for (const link of sources.links) {
    if (!link.entity_id) continue;
    if (link.ritual_id) linkedRituals.add(link.ritual_id);
    if (link.template_id) linkedTemplates.add(link.template_id);
    if (link.ritual_id && link.link_type === 'used_entity') push(elementOfRef(link.entity_id), 'ritual');
    else if (link.template_id && link.link_type === 'suggested_entity') push(elementOfRef(link.entity_id), 'template');
  }

  // On this device only (or before the links arrive): read the rows themselves.
  for (const t of sources.templates) {
    if (t.status === 'archived' || linkedTemplates.has(t.id)) continue;
    for (const ref of refsOf(t.metadata)) push(elementOfRef(ref), 'template');
  }
  for (const j of sources.journal) {
    if (linkedRituals.has(j.id)) continue;
    for (const ref of refsOf(j.metadata)) push(elementOfRef(ref), 'ritual');
    for (const object of objectsOf(j.altar_snapshot)) push(elementOfObject(object as ObjectLike), 'ritual');
  }
  return uses;
}

export type Balance = {
  counts: Record<Element, number>;
  spirit: number;
  /** Earth, air, fire and water only. */
  total: number;
  /** Each element's share of the four, 0–1. */
  share: Record<Element, number>;
  /** The names used most for each element, most used first. */
  top: Record<Element, string[]>;
};

export function balanceOf(uses: ElementUse[]): Balance {
  const counts: Record<Element, number> = { Earth: 0, Air: 0, Fire: 0, Water: 0 };
  const names: Record<Element, Map<string, number>> = { Earth: new Map(), Air: new Map(), Fire: new Map(), Water: new Map() };
  let spirit = 0;
  for (const u of uses) {
    if (u.element === 'Spirit') {
      spirit += 1;
      continue;
    }
    counts[u.element] += 1;
    names[u.element].set(u.name, (names[u.element].get(u.name) ?? 0) + 1);
  }
  const total = ELEMENTS.reduce((n, e) => n + counts[e], 0);
  const share = Object.fromEntries(ELEMENTS.map((e) => [e, total ? counts[e] / total : 0])) as Record<Element, number>;
  const top = Object.fromEntries(
    ELEMENTS.map((e) => [e, [...names[e].entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 4).map(([n]) => n)]),
  ) as Record<Element, string[]>;
  return { counts, spirit, total, share, top };
}

/** The least-used element; ties go to the first in earth, air, fire, water. Null with nothing to read. */
export function leastUsed(balance: Balance): Element | null {
  if (!balance.total) return null;
  return ELEMENTS.reduce((low, e) => (balance.counts[e] < balance.counts[low] ? e : low), ELEMENTS[0]);
}

/** Close enough to even that no element needs a nudge. */
export function isBalanced(balance: Balance): boolean {
  if (balance.total < 8) return false;
  return ELEMENTS.every((e) => balance.share[e] >= 0.18);
}

export type ElementGuide = {
  element: Element;
  qualities: string;
  /** A gentle suggestion, when it's the least used. */
  invite: string;
  /** A small way to bring it in this week. */
  small: string;
  /** A premade working tagged elemental. */
  premadeId: string;
  /** Library entries that carry it, for a first step. */
  examples: { id: string; name: string }[];
};

export const ELEMENT_GUIDES: Record<Element, ElementGuide> = {
  Earth: {
    element: 'Earth',
    qualities: 'Body, ground, patience, home and what lasts',
    invite: 'Earth has been quiet in your work. It is the element of slow, steady things: rooting, holding, keeping.',
    small: 'Put a stone or a dish of salt on your altar, or work with your hands in soil this week.',
    premadeId: 'green-earth-stone-soil-grounding',
    examples: [
      { id: 'traditional:herb:patchouli', name: 'Patchouli' },
      { id: 'traditional:crystal:smoky_quartz', name: 'Smoky quartz' },
      { id: 'traditional:candle:green', name: 'Green candle' },
    ],
  },
  Air: {
    element: 'Air',
    qualities: 'Breath, mind, words, beginnings and movement',
    invite: 'Air has been light in your work. It is the element of breath and speech: clearing the head, sending word, starting.',
    small: 'Speak your intention aloud, burn a little incense, or open a window and let the wind in.',
    premadeId: 'green-air-feather-wind-knot',
    examples: [
      { id: 'traditional:herb:lavender', name: 'Lavender' },
      { id: 'traditional:crystal:amethyst', name: 'Amethyst' },
      { id: 'traditional:tool:bell', name: 'Bell' },
    ],
  },
  Fire: {
    element: 'Fire',
    qualities: 'Will, courage, change, passion and protection',
    invite: 'Fire has been low in your work. It is the element of will and change: the spark that turns a wish into a step.',
    small: 'Light one candle with intention, or add a warming spice such as cinnamon or ginger.',
    premadeId: 'green-fire-candle-scrying',
    examples: [
      { id: 'traditional:herb:cinnamon', name: 'Cinnamon' },
      { id: 'traditional:crystal:carnelian', name: 'Carnelian' },
      { id: 'traditional:candle:red', name: 'Red candle' },
    ],
  },
  Water: {
    element: 'Water',
    qualities: 'Feeling, dreams, intuition, healing and flow',
    invite: 'Water has been scarce in your work. It is the element of feeling and dreams: softening, cleansing, listening inward.',
    small: 'Set a bowl of water on your altar, take a ritual bath, or collect rain the next time it falls.',
    premadeId: 'green-water-rainwater-wash',
    examples: [
      { id: 'traditional:herb:rose', name: 'Rose' },
      { id: 'traditional:crystal:moonstone', name: 'Moonstone' },
      { id: 'traditional:tool:chalice', name: 'Chalice' },
    ],
  },
};

/** For a balanced practice, or to tend all four together. */
export const ALL_FOUR_PREMADE = 'green-four-elements-balancing-rite';

// By the old temperaments: the Sun and Mars hot and dry (fire), the Moon and
// Venus cold and moist (water), Jupiter warm and moist (air), Saturn cold and
// dry (earth), and Mercury, who takes on what he touches, with air.
const PLANET_ELEMENT: Record<string, Element> = {
  Sun: 'Fire',
  Moon: 'Water',
  Mars: 'Fire',
  Mercury: 'Air',
  Jupiter: 'Air',
  Venus: 'Water',
  Saturn: 'Earth',
};

export function planetElement(planet: string): Element | null {
  return PLANET_ELEMENT[planet] ?? null;
}

/** Today's element by the weekday's planet. */
export function dayElement(date: Date): { planet: string; element: Element } {
  const { planet } = dayRuler(date);
  return { planet, element: PLANET_ELEMENT[planet] ?? 'Earth' };
}
