// The Living Library, as the website builds it (js/library.js and the library
// pages in grimoire/js/app.js): the shared Traditional Library, with each
// person's own My Practice notes laid over the matching entry.

import type { Settings } from '../settings/defaults.ts';
import { layerOrder, type Layer } from '../settings/defaults.ts';
import { TRADITIONAL_LIBRARY } from './traditionalData.ts';
import { entryTraditions, entryVisible, myPath, pathName, withoutHidden } from './traditions.ts';
import { hiddenTraditions } from '../holidays.ts';
import { looksLikeHtml, richTextToPlain } from './richText.ts';
import type { LibraryEntry, LibraryField, PageLayout, PracticeRow, TraditionalLibraryData, TraditionalRecord } from './types.ts';

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
  // The website adds this shelf in grimoire/js/ritual-living-library-bridge.js.
  'ritual_template',
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
  ritual_template: 'Templates',
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
  ritual_template: 'Ritual Template',
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
  TraditionalMeaning: 'Meaning',
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
  TraditionNotes: 'In the Traditions',
  TypicalBurnTime: 'Typical Burn Time',
  BurnStyle: 'Burn Style',
  TraditionalUse: 'Traditional Use',
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
  'Traditions',
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
  'Traditions',
  'PairsWith',
  'Substitutions',
  'BestWith',
  'BestFor',
  'Ingredients',
  'Intention',
  'Intentions',
  'CommonUses',
  'HowToUse',
  'TraditionNotes',
  'BurnStyle',
  'TypicalBurnTime',
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

/**
 * What the website shows for an object stored in a field, e.g. an apothecary
 * ingredient: its Library name (renderLibraryPlainValue).
 */
function objectName(value: Record<string, unknown>): string {
  const name = ['libraryName', 'label', 'name', 'herb', 'crystal', 'tool', 'vessel', 'deity', 'type']
    .map((key) => value[key])
    .find((item) => typeof item === 'string' && item.trim());
  return typeof name === 'string' ? name.trim() : '';
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/** One item of a list field; an ingredient's amount goes first ("1 pinch Rosemary"). */
function listItemText(value: unknown): string {
  if (!isObject(value)) return valueText(value);
  const amount = typeof value.amount === 'string' || typeof value.amount === 'number' ? String(value.amount).trim() : '';
  return `${amount ? `${amount} ` : ''}${objectName(value) || 'Ingredient'}`;
}

function valueText(value: unknown): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(listItemText).filter(Boolean).join(', ');
  if (typeof value === 'object') return objectName(value as Record<string, unknown>) || JSON.stringify(value);
  return String(value).trim();
}

/** A field's value as readable plain text (rich-text HTML read as lines). */
export const plainValue = (value: unknown) => richTextToPlain(valueText(value));

/** A page layout saved on the website (living_library_entries.layout), with anything malformed left out. */
export function normalizeLayout(raw: unknown): PageLayout | null {
  if (!isObject(raw)) return null;
  const strings = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);
  const perLayer = (value: unknown) => {
    const out: Partial<Record<Layer, string[]>> = {};
    if (!isObject(value)) return out;
    for (const layer of ['myPractice', 'traditional', 'community'] as const) {
      const keys = strings(value[layer]);
      if (keys.length) out[layer] = keys;
    }
    return out;
  };
  const customFields = (Array.isArray(raw.customFields) ? raw.customFields : [])
    .filter((field): field is { key: string; label?: unknown } => isObject(field) && typeof field.key === 'string')
    .map((field) => ({ key: field.key, label: typeof field.label === 'string' && field.label.trim() ? field.label : formatName(field.key) }));
  const layout: PageLayout = {
    sectionOrder: strings(raw.sectionOrder),
    hiddenFields: perLayer(raw.hiddenFields),
    fieldOrder: perLayer(raw.fieldOrder),
    customFields,
  };
  const empty =
    !Object.keys(layout.hiddenFields).length && !Object.keys(layout.fieldOrder).length && !layout.customFields.length;
  return empty ? null : layout;
}

/**
 * A layer's visible fields, in reading order, with list fields as chips. A
 * page layout from the website hides the fields it hides there and puts the
 * fields it has ordered first, in its order.
 */
export function layerFields(
  data: Record<string, unknown> | null,
  layer: Layer,
  settings?: Pick<Settings, string> | null,
  layout?: PageLayout | null,
): LibraryField[] {
  if (!data) return [];
  // Hidden calendars (Settings → Calendar → Hide) are taken out of Traditional notes too.
  if (layer === 'traditional') data = withoutHidden(data as TraditionalRecord, hiddenTraditions(settings as Record<string, unknown> | null));
  const keys = Object.keys(data);
  const pageOrder = (layout?.fieldOrder[layer] ?? []).filter((key) => keys.includes(key));
  const hidden = new Set(layout?.hiddenFields[layer] ?? []);
  const ordered = [
    ...pageOrder,
    ...[...FIELD_ORDER.filter((key) => keys.includes(key)), ...keys.filter((key) => !FIELD_ORDER.includes(key))].filter(
      (key) => !pageOrder.includes(key),
    ),
  ];
  const customLabels = new Map(layer === 'myPractice' ? (layout?.customFields ?? []).map((field) => [field.key, field.label]) : []);
  const fields: LibraryField[] = [];
  for (const key of ordered) {
    if (HIDDEN_FIELDS.has(key) || hidden.has(key)) continue;
    if (settings && settings[`library_${layer}_${fieldCategory(key)}`] === false) continue;
    const raw = data[key];
    const text = valueText(raw);
    if (!text) continue;
    let chips: string[] | null = null;
    let chipNames: string[] | null = null;
    if (Array.isArray(raw)) {
      const items = raw.filter((item) => listItemText(item));
      chips = items.map(listItemText);
      // An ingredient chip opens the entry it names, without its amount.
      chipNames = items.map((item) => (isObject(item) ? objectName(item) || listItemText(item) : listItemText(item)));
    } else if (CHIP_FIELDS.has(key) && !looksLikeHtml(text)) {
      chips = splitList(text);
    }
    fields.push({ key, label: customLabels.get(key) ?? fieldLabel(key), text, chips, chipNames: chipNames ?? chips });
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
    layout: null,
  };
}

let traditionalCache: LibraryEntry[] | null = null;

/**
 * The entries a Traditional Library holds (the website's js/traditional-library.js,
 * or the app's copy of it), sorted by name. Pure, so the website can build its
 * Library from its own data file.
 */
export function entriesFromData(data: TraditionalLibraryData): LibraryEntry[] {
  const entries: LibraryEntry[] = [];
  for (const [type, collection] of Object.entries(data)) {
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
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

/** Every Traditional Library entry, available offline and without an account. */
export function traditionalEntries(): LibraryEntry[] {
  if (traditionalCache) return traditionalCache;
  traditionalCache = entriesFromData(TRADITIONAL_LIBRARY);
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
const latest = (a: string | null | undefined, b: string | null | undefined) =>
  !a ? b || null : !b ? a : Date.parse(b) > Date.parse(a) ? b : a;

export function buildLibrary(practice: PracticeRow[] = []): LibraryEntry[] {
  return libraryFrom(traditionalEntries(), practice);
}

/** buildLibrary over a given set of Traditional entries (see entriesFromData). */
export function libraryFrom(traditional: LibraryEntry[], practice: PracticeRow[] = []): LibraryEntry[] {
  const entries = traditional.map((entry) => ({ ...entry, practiceEntityIds: [] as string[] }));
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
    const layout = normalizeLayout(row.layout);
    const matchKey = `${row.type}|${normalizeName(row.name)}`;
    const target = byTypeAndName.get(matchKey) ?? standalone.get(matchKey);
    if (target) {
      target.practiceEntityIds.push(row.entity_id);
      if (!target.myPractice && myPractice) target.practiceSourceId = row.entity_id;
      target.myPractice = target.myPractice ?? myPractice;
      target.community = target.community ?? community;
      target.image = target.image ?? (row.image || null);
      target.layout = target.layout ?? layout;
      target.updatedAt = latest(target.updatedAt, row.updated_at);
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
      practiceSourceId: myPractice ? row.entity_id : null,
      layout,
      updatedAt: row.updated_at || null,
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
  const uses = plainValue(entry.traditional?.Uses || entry.traditional?.Domains || entry.traditional?.Purpose);
  if (uses) return `Traditionally associated with ${uses.toLowerCase()}.`;
  if (hasContent(entry.myPractice)) return `${entry.name} is part of My Practice.`;
  return `${entry.name} is part of the Living Library.`;
}

/** Quick correspondences for the top of a page (element, planet, …). */
export function correspondences(entry: LibraryEntry): { label: string; value: string }[] {
  const source = { ...(entry.traditional ?? {}), ...(entry.myPractice ?? {}) } as Record<string, unknown>;
  return ['Element', 'Planet', 'Chakra', 'Pantheon']
    .map((key) => ({ label: key, value: plainValue(source[key]) }))
    .filter((item) => item.value);
}

export const hasMyPractice = (entry: LibraryEntry) => hasContent(entry.myPractice);

export type ShelfGroup = { key: string; type: string; label: string; entries: LibraryEntry[] };
/** A part of a shelf: one tradition of your path, one piece from another tradition, or the rest. */
export type ShelfSection = { key: string; title: string; note?: string; groups: ShelfGroup[] };
export type GrimoireShelf = { key: 'myPractice' | 'myPath' | 'traditional'; title: string; sections: ShelfSection[] };

// The fields of a deity that name what goes with them, and the types they name.
const COMPANION_FIELDS: [string, string][] = [
  ['Herbs', 'herb'],
  ['SacredPlants', 'herb'],
  ['Crystals', 'crystal'],
  ['CandleColors', 'candle'],
];

/** The herbs, crystals and candles a deity's entry names (Herbs, Sacred Plants, Crystals, Candle Colors). */
export function companionsOf(deity: LibraryEntry, entries: LibraryEntry[]): LibraryEntry[] {
  const found = new Map<string, LibraryEntry>();
  for (const [field, type] of COMPANION_FIELDS) {
    const raw = deity.traditional?.[field];
    for (const name of typeof raw === 'string' ? splitList(raw) : []) {
      const entry = findByName(entries, name.replace(/\(.*?\)/g, '').trim(), type);
      if (entry) found.set(entry.id, entry);
    }
  }
  return [...found.values()];
}

const groupByType = (entries: LibraryEntry[], types: readonly string[], keyPrefix: string): ShelfGroup[] =>
  types
    .map((type) => ({
      key: `${keyPrefix}:${type}`,
      type,
      label: typeLabel(type),
      entries: entries.filter((entry) => entry.type === type).sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((g) => g.entries.length > 0);

/**
 * The Living Library shelves beside your written pages:
 * - My Practice: entries you've added your own notes to.
 * - My Path: a section for each tradition you keep, holding its deities and
 *   everything that goes with them (entries tagged with the tradition, and the
 *   herbs, crystals and candles its deities name), then a section for each
 *   deity you work with from outside your path, with only what goes with them.
 * - Everything else (Traditional Information), by type.
 * Every section and group has its own key, so each opens and closes on its own.
 */
export function grimoireShelves(entries: LibraryEntry[], settings?: Settings | null, query = ''): GrimoireShelf[] {
  const matches = new Set(searchLibrary(entries, query).map((entry) => entry.id));
  const path = myPath(settings as Record<string, unknown> | null);
  const shelves: GrimoireShelf[] = [];

  if (!settings || settings.library_myPractice_enabled !== false) {
    const mine = entries.filter((entry) => hasMyPractice(entry) && matches.has(entry.id));
    shelves.push({ key: 'myPractice', title: 'My Practice', sections: [{ key: 'all', title: '', groups: groupByType(mine, PRACTICE_TYPES, 'myPractice') }] });
  }

  if (!settings || settings.library_traditional_enabled !== false) {
    const traditional = entries.filter((entry) => hasContent(entry.traditional) && entryVisible(entry, path));
    const shown = new Set<string>();
    const sections: ShelfSection[] = [];

    for (const tradition of path.traditions) {
      const deities = traditional.filter((e) => e.type === 'deity' && entryTraditions(e.traditional, e.type).includes(tradition));
      const tagged = traditional.filter((e) => e.type !== 'deity' && entryTraditions(e.traditional, e.type).includes(tradition));
      const companions = deities.flatMap((d) => companionsOf(d, traditional));
      const all = [...new Map([...deities, ...tagged, ...companions].map((e) => [e.id, e])).values()];
      all.forEach((e) => shown.add(e.id));
      const visible = all.filter((e) => matches.has(e.id));
      if (visible.length) sections.push({ key: `path:${tradition}`, title: pathName(tradition), groups: groupByType(visible, LIBRARY_TYPES, `myPath:${tradition}`) });
    }

    // Deities you've written your own notes for, from traditions outside your path.
    const pieces = entries.filter(
      (e) =>
        e.type === 'deity' &&
        hasMyPractice(e) &&
        e.traditional &&
        !entryTraditions(e.traditional, e.type).some((t) => path.traditions.includes(t) || path.hidden.includes(t)),
    );
    for (const deity of pieces) {
      const all = [deity, ...companionsOf(deity, traditional)];
      all.forEach((e) => shown.add(e.id));
      const visible = all.filter((e) => matches.has(e.id));
      const from = entryTraditions(deity.traditional, deity.type).map(pathName).join(', ');
      if (visible.length) {
        sections.push({
          key: `piece:${deity.id}`,
          title: deity.name,
          note: from ? `From ${from}, outside your path` : 'Outside your path',
          groups: groupByType(visible, LIBRARY_TYPES, `piece:${deity.id}`),
        });
      }
    }
    if (sections.length) shelves.push({ key: 'myPath', title: 'My Path', sections });

    const rest = traditional.filter((e) => !shown.has(e.id) && matches.has(e.id));
    shelves.push({
      key: 'traditional',
      title: sections.length ? 'Everything Else' : 'Traditional Information',
      sections: [{ key: 'all', title: '', groups: groupByType(rest, LIBRARY_TYPES, 'traditional') }],
    });
  }

  return shelves.filter((shelf) => shelf.sections.some((section) => section.groups.length > 0));
}

/** Every entry the My Path shelf shows (for the Library list's "My path" filter). */
export function pathEntryIds(entries: LibraryEntry[], settings?: Settings | null): Set<string> {
  const shelf = grimoireShelves(entries, settings).find((s) => s.key === 'myPath');
  return new Set(shelf ? shelf.sections.flatMap((section) => section.groups.flatMap((g) => g.entries.map((e) => e.id))) : []);
}
