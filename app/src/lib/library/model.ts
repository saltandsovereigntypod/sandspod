// The Living Library, as the website builds it (js/library.js and the library
// pages in grimoire/js/app.js): the shared Traditional Library, with each
// person's own My Practice notes laid over the matching entry.

import type { Settings } from '../settings/defaults.ts';
import { layerOrder, type Layer } from '../settings/defaults.ts';
import { TRADITIONAL_LIBRARY } from './traditionalData.ts';
import type { LibraryEntry, LibraryField, PracticeRow, TraditionalRecord } from './types.ts';

export const LIBRARY_TYPES = ['herb', 'crystal', 'candle', 'deity', 'tool', 'vessel'] as const;
export const PRACTICE_TYPES = [
  'herb',
  'crystal',
  'candle',
  'deity',
  'tool',
  'vessel',
  'apothecary',
  'ritual',
  'spell',
  'note',
  'section',
] as const;

const TYPE_LABELS: Record<string, string> = {
  herb: 'Herbs',
  crystal: 'Crystals',
  candle: 'Candles',
  deity: 'Deities',
  tool: 'Tools',
  vessel: 'Vessels',
  apothecary: 'Apothecary',
  ritual: 'Rituals',
  spell: 'Spells',
  note: 'Notes',
  section: 'Sections',
};

const SINGULAR: Record<string, string> = {
  herb: 'Herb',
  crystal: 'Crystal',
  candle: 'Candle',
  deity: 'Deity',
  tool: 'Tool',
  vessel: 'Vessel',
  apothecary: 'Apothecary',
  ritual: 'Ritual',
  spell: 'Spell',
  note: 'Note',
  section: 'Section',
};

export const formatName = (name = '') =>
  String(name)
    .replaceAll('_', ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

const titleCase = (value: string) => value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

export const typeLabel = (type: string) => TYPE_LABELS[type] ?? formatName(type);
export const typeSingular = (type: string) => SINGULAR[type] ?? formatName(type);

export const normalizeName = (value: unknown) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const FIELD_LABELS: Record<string, string> = {
  PairsWith: 'Pairs Well With',
  TraditionalWarnings: 'Warnings',
  TraditionalMeaning: 'Traditional Meaning',
  SacredSymbols: 'Sacred Symbols',
  SacredAnimals: 'Sacred Animals',
  SacredPlants: 'Sacred Plants',
  CandleColors: 'Candle Colors',
  AlternativeColors: 'Alternative Colors',
  TraditionallyMadeFrom: 'Traditionally Made From',
  TraditionallyUsedFor: 'Traditionally Used For',
  CommonMaterials: 'Common Materials',
  CommonUses: 'Common Uses',
  BestFor: 'Best For',
  BestWith: 'Best With',
  UsedFor: 'Used For',
  HowToUse: 'How to Use',
  PairingNotes: 'Pairing Notes',
  SubstitutionNotes: 'Substitution Notes',
  SafetyAndRespect: 'Safety and Respect',
  BeginnerTip: 'Beginner Tip',
  CleansingNotes: 'Cleansing Notes',
  OfferingNotes: 'Offering Notes',
  DevotionalApproach: 'Devotional Approach',
  CulturalContext: 'Cultural Context',
  AltarIdeas: 'Altar Ideas',
  GrimoireStatus: 'Grimoire Status',
  CandleDressings: 'Candle Dressings',
};

export const fieldLabel = (key: string) => FIELD_LABELS[key] ?? formatName(key);

/** Which Living Library setting governs a field (website: libraryFieldCategory). */
export function fieldCategory(key: string): string {
  const categories: Record<string, string> = {
    Meaning: 'meanings',
    Meanings: 'meanings',
    Uses: 'uses',
    Domains: 'uses',
    Purpose: 'uses',
    Element: 'correspondences',
    Planet: 'correspondences',
    Chakra: 'correspondences',
    Pantheon: 'correspondences',
    Ingredients: 'ingredients',
    Intention: 'intentions',
    Intentions: 'intentions',
    PairsWith: 'pairings',
    BestWith: 'pairings',
    Substitutions: 'substitutions',
    TraditionalWarnings: 'warnings',
    Warnings: 'warnings',
    GrimoireStatus: 'grimoire',
    CandleDressings: 'dressings',
    Groups: 'groups',
    Notes: 'notes',
    Sources: 'sources',
    Source: 'sources',
  };
  return categories[key] || 'notes';
}

const CHIP_FIELDS = new Set([
  'Uses',
  'Domains',
  'PairsWith',
  'Substitutions',
  'BestFor',
  'BestWith',
  'Cleansing',
  'Offerings',
  'Herbs',
  'Crystals',
  'CandleColors',
  'AlternativeColors',
  'SacredSymbols',
  'SacredAnimals',
  'SacredPlants',
  'Ingredients',
]);

/** Reading order on the page; anything else follows in the order it's stored. */
const FIELD_ORDER = [
  'Overview',
  'TraditionalMeaning',
  'Meaning',
  'Meanings',
  'Uses',
  'Domains',
  'Purpose',
  'Element',
  'Planet',
  'Chakra',
  'Pantheon',
  'PairsWith',
  'Substitutions',
  'BestWith',
  'BestFor',
  'Ingredients',
  'Intention',
  'Intentions',
  'CommonUses',
  'HowToUse',
  'SacredSymbols',
  'SacredAnimals',
  'SacredPlants',
  'Offerings',
  'TraditionallyMadeFrom',
  'TraditionallyUsedFor',
  'CommonMaterials',
  'Cleansing',
  'TraditionalWarnings',
  'Warnings',
  'SafetyAndRespect',
  'Sources',
  'Source',
  'Notes',
];

const HIDDEN_FIELDS = new Set(['tags', 'DisplayName', 'Category']);

export function splitList(value: string): string[] {
  return String(value || '')
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function valueText(value: unknown): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(valueText).filter(Boolean).join(', ');
  if (typeof value === 'object') return '';
  return String(value).trim();
}

/** A layer's visible fields, in reading order, with list fields as chips. */
export function layerFields(
  data: Record<string, unknown> | null,
  layer: Layer,
  settings?: Pick<Settings, string> | null,
): LibraryField[] {
  if (!data) return [];
  const keys = Object.keys(data);
  const ordered = [...FIELD_ORDER.filter((key) => keys.includes(key)), ...keys.filter((key) => !FIELD_ORDER.includes(key))];
  const fields: LibraryField[] = [];
  for (const key of ordered) {
    if (HIDDEN_FIELDS.has(key)) continue;
    if (settings && settings[`library_${layer}_${fieldCategory(key)}`] === false) continue;
    const raw = data[key];
    const text = valueText(raw);
    if (!text) continue;
    const chips = Array.isArray(raw)
      ? raw.map(valueText).filter(Boolean)
      : CHIP_FIELDS.has(key) && !/<\/?[a-z][\s\S]*>/i.test(text)
        ? splitList(text)
        : null;
    fields.push({ key, label: fieldLabel(key), text, chips });
  }
  return fields;
}

/** Which layers a page shows, and in what order (Settings → Living Library). */
export function visibleLayers(settings?: Settings | null): Layer[] {
  const order: Layer[] = settings ? layerOrder(settings) : ['myPractice', 'traditional', 'community'];
  return order.filter((layer) => !settings || settings[`library_${layer}_enabled`] !== false);
}

function isRecord(value: unknown): value is TraditionalRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function traditionalEntry(type: string, key: string, record: TraditionalRecord): LibraryEntry {
  const tags = Array.isArray(record.tags) ? (record.tags as string[]) : [];
  return {
    id: `traditional:${type}:${key}`,
    // Entries without a DisplayName (most tools and vessels) are named by key.
    name: record.DisplayName ? formatName(String(record.DisplayName)) : titleCase(formatName(key)),
    type,
    category: String(record.Category || typeSingular(type)),
    traditionalRef: `traditional/${type}/${key.split('.')[0]}`,
    traditional: record,
    myPractice: null,
    community: null,
    image: null,
    tags,
    practiceEntityIds: [],
  };
}

let traditionalCache: LibraryEntry[] | null = null;

/** Every Traditional Library entry, available offline and without an account. */
export function traditionalEntries(): LibraryEntry[] {
  if (traditionalCache) return traditionalCache;
  const entries: LibraryEntry[] = [];
  for (const [type, collection] of Object.entries(TRADITIONAL_LIBRARY)) {
    for (const [key, value] of Object.entries(collection)) {
      if (!isRecord(value)) continue;
      const looksLikeEntry = 'DisplayName' in value || 'tags' in value || 'Overview' in value || 'Purpose' in value;
      if (looksLikeEntry) {
        entries.push(traditionalEntry(type, key, value as TraditionalRecord));
        continue;
      }
      // A nested collection, e.g. candle.styles.tea_light.
      for (const [childKey, child] of Object.entries(value)) {
        if (isRecord(child)) entries.push(traditionalEntry(type, `${key}.${childKey}`, child as TraditionalRecord));
      }
    }
  }
  traditionalCache = entries.sort((a, b) => a.name.localeCompare(b.name));
  return traditionalCache;
}

const hasContent = (value: Record<string, unknown> | null | undefined) =>
  !!value &&
  Object.values(value).some((item) => (Array.isArray(item) ? item.length > 0 : String(item ?? '').trim() !== ''));

/**
 * Lays each person's `living_library_entries` rows over the Traditional
 * Library. A row joins the traditional entry of the same type and name (as
 * the website's canonical matching does); others become their own entries.
 */
export function buildLibrary(practice: PracticeRow[] = []): LibraryEntry[] {
  const entries = traditionalEntries().map((entry) => ({ ...entry, practiceEntityIds: [] as string[] }));
  const byTypeAndName = new Map<string, LibraryEntry>();
  for (const entry of entries) {
    byTypeAndName.set(`${entry.type}|${normalizeName(entry.name)}`, entry);
    const key = entry.id.split(':')[2];
    if (key && !key.includes('.')) byTypeAndName.set(`${entry.type}|${normalizeName(key)}`, entry);
  }
  const standalone = new Map<string, LibraryEntry>();

  for (const row of practice) {
    if (!row?.entity_id || !row.type) continue;
    const myPractice = hasContent(row.my_practice) ? row.my_practice : null;
    const community = hasContent(row.community) ? row.community : null;
    const matchKey = `${row.type}|${normalizeName(row.name)}`;
    const target = byTypeAndName.get(matchKey) ?? standalone.get(matchKey);
    if (target) {
      target.practiceEntityIds.push(row.entity_id);
      target.myPractice = target.myPractice ?? myPractice;
      target.community = target.community ?? community;
      target.image = target.image ?? (row.image || null);
      continue;
    }
    // Only entries that carry the person's own writing get a page of their own.
    if (!myPractice && !community) continue;
    const entry: LibraryEntry = {
      id: `practice:${row.entity_id}`,
      name: formatName(row.name || 'Untitled'),
      type: row.type,
      category: typeSingular(row.type),
      traditionalRef: null,
      traditional: null,
      myPractice,
      community,
      image: row.image || null,
      tags: [],
      practiceEntityIds: [row.entity_id],
    };
    standalone.set(matchKey, entry);
  }
  return [...entries, ...standalone.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Rows from the website's guest Library (localStorage "saltAndSovereigntyLibrary"). */
export function guestPracticeRows(stored: unknown): PracticeRow[] {
  const entities = (stored as { entities?: Record<string, Record<string, unknown>> })?.entities;
  if (!entities || typeof entities !== 'object') return [];
  return Object.values(entities)
    .filter((entity) => entity && typeof entity === 'object')
    .map((entity) => ({
      entity_id: String(entity.id ?? ''),
      name: String(entity.name ?? ''),
      type: String(entity.type ?? ''),
      image: typeof entity.image === 'string' && !entity.image.startsWith('data:') ? entity.image : null,
      my_practice: (entity.myPractice as Record<string, unknown>) ?? null,
      community: (entity.community as Record<string, unknown>) ?? null,
      updated_at: (entity.updatedAt as string) ?? null,
    }));
}

function searchText(entry: LibraryEntry): string {
  return [
    entry.name,
    entry.type,
    entry.category,
    ...entry.tags,
    JSON.stringify(entry.traditional ?? {}),
    JSON.stringify(entry.myPractice ?? {}),
    JSON.stringify(entry.community ?? {}),
  ]
    .join(' ')
    .toLowerCase();
}

export type SearchOptions = { type?: string | null; limit?: number; mine?: boolean };

/**
 * Finds entries whose name, tags, uses or notes mention every word of the
 * query. Name matches come first, then tag and use matches, then the rest.
 */
export function searchLibrary(entries: LibraryEntry[], query: string, options: SearchOptions = {}): LibraryEntry[] {
  const words = normalizeName(query).split(' ').filter(Boolean);
  const scoped = entries.filter(
    (entry) =>
      (!options.type || entry.type === options.type) && (!options.mine || hasContent(entry.myPractice)),
  );
  if (!words.length) return options.limit ? scoped.slice(0, options.limit) : scoped;

  const scored: { entry: LibraryEntry; score: number }[] = [];
  for (const entry of scoped) {
    const name = normalizeName(entry.name);
    const text = searchText(entry);
    if (!words.every((word) => text.includes(word))) continue;
    const phrase = words.join(' ');
    let score = 4;
    if (name === phrase) score = 0;
    else if (name.startsWith(phrase)) score = 1;
    else if (words.every((word) => name.includes(word))) score = 2;
    else if (
      words.every((word) =>
        [...entry.tags, valueText(entry.traditional?.Uses), valueText(entry.traditional?.Domains)]
          .join(' ')
          .toLowerCase()
          .includes(word),
      )
    )
      score = 3;
    scored.push({ entry, score });
  }
  scored.sort((a, b) => a.score - b.score || a.entry.name.localeCompare(b.entry.name));
  const results = scored.map((item) => item.entry);
  return options.limit ? results.slice(0, options.limit) : results;
}

/** Finds the entry a name refers to (a "Pairs Well With" chip, an ingredient). */
export function findByName(entries: LibraryEntry[], name: string, type?: string): LibraryEntry | null {
  const wanted = normalizeName(name);
  if (!wanted) return null;
  const pool = type ? entries.filter((entry) => entry.type === type) : entries;
  return (
    pool.find((entry) => normalizeName(entry.name) === wanted) ??
    pool.find((entry) => normalizeName(entry.id.split(':')[2] ?? '') === wanted) ??
    // "rosemary" ↔ "Rosemary Oil", "white" ↔ "White Candle"
    pool.find((entry) => normalizeName(entry.name).split(' ').includes(wanted)) ??
    null
  );
}

/** A one-line introduction, like the website's library page lede. */
export function entryIntro(entry: LibraryEntry): string {
  const uses = valueText(entry.traditional?.Uses || entry.traditional?.Domains || entry.traditional?.Purpose);
  if (uses) return `Traditionally associated with ${uses.toLowerCase()}.`;
  if (hasContent(entry.myPractice)) return `${entry.name} is part of My Practice.`;
  return `${entry.name} is part of the Living Library.`;
}

/** Quick correspondences for the top of a page (element, planet, …). */
export function correspondences(entry: LibraryEntry): { label: string; value: string }[] {
  const source = { ...(entry.traditional ?? {}), ...(entry.myPractice ?? {}) } as Record<string, unknown>;
  return ['Element', 'Planet', 'Chakra', 'Pantheon']
    .map((key) => ({ label: key, value: valueText(source[key]) }))
    .filter((item) => item.value);
}

export const hasMyPractice = (entry: LibraryEntry) => hasContent(entry.myPractice);
