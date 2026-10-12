// The altar's apothecary: spell jars, oils, herb mixes, incense, sachets,
// poppets and sprays made from ingredients, kept in "My Apothecary" and placed
// on the altar like anything else. The shapes match the website
// (altar/js/features/apothecary.js, js/apothecary-normalization.js) and its
// `apothecary_items` table, so a working made in one place opens in the
// other. Pure, so it can be tested.

import { objectFromForm } from './cabinet.ts';
import type { CabinetForm, CabinetItem, SavedObject } from './types.ts';

export type ApothecaryTypeId = 'spell-jar' | 'oil-tincture' | 'herb-mix' | 'incense' | 'sachet' | 'poppet' | 'spray';

export const APOTHECARY_TYPES: { id: ApothecaryTypeId; label: string; image: string }[] = [
  { id: 'spell-jar', label: 'Spell Jar', image: '../assets/altar/objects/apothecary/spell-jar-two/spell-jar-two.png' },
  { id: 'oil-tincture', label: 'Oil / Tincture', image: '../assets/altar/objects/apothecary/oil-tincture/oil-tincture.png' },
  { id: 'herb-mix', label: 'Herb Mix', image: '../assets/altar/objects/herbs/herb-mix/herb-mix.png' },
  { id: 'incense', label: 'Incense', image: '../assets/altar/objects/herbs/incense/incense.png' },
  { id: 'sachet', label: 'Sachet', image: '../assets/altar/objects/apothecary/sachet/sachet.png' },
  { id: 'poppet', label: 'Poppet', image: '../assets/altar/objects/apothecary/poppet/poppet.png' },
  { id: 'spray', label: 'Spray', image: '../assets/altar/objects/apothecary/spray/spray.png' },
];

export const apothecaryType = (id: string) => APOTHECARY_TYPES.find((t) => t.id === id) ?? APOTHECARY_TYPES[0];

/** The extra questions some kinds ask (renderApothecaryTypeFields), keyed as the website stores them in `details`. */
export type DetailField = { key: string; label: string; choices?: string[]; multiline?: boolean };
export const DETAIL_FIELDS: Partial<Record<ApothecaryTypeId, DetailField[]>> = {
  incense: [
    { key: 'incense_form', label: 'Form', choices: ['Loose incense', 'Cone', 'Stick', 'Charcoal blend', 'Other'] },
    { key: 'use_notes', label: 'How to use it', multiline: true },
  ],
  sachet: [
    { key: 'sachet_purpose', label: 'Purpose' },
    { key: 'kept_location', label: 'Where it’s kept' },
  ],
  poppet: [
    { key: 'poppet_focus', label: 'Who or what it represents', choices: ['Self', 'Someone else', 'Situation', 'Symbolic'] },
    { key: 'representation_notes', label: 'Notes on what it represents', multiline: true },
  ],
  spray: [
    { key: 'spray_use', label: 'Use', choices: ['Room spray', 'Floor wash', 'Altar mist', 'Object spray', 'Other'] },
    { key: 'use_notes', label: 'How to use it', multiline: true },
  ],
};

/** One thing that went into a working. Extra fields from the website are kept. */
export type Ingredient = {
  label: string;
  libraryName?: string;
  type?: string;
  entityId?: string;
  apothecaryItemId?: string;
  amount?: string;
  [key: string]: unknown;
};

export type ApothecaryLiving = {
  tending_enabled: boolean;
  tending_interval_days: number;
  expiration_enabled: boolean;
  expiration_days: number;
};

/** An item as the website holds it in memory (normalizeApothecaryItem). */
export type ApothecaryItem = {
  id: string;
  name: string;
  type: ApothecaryTypeId;
  typeLabel: string;
  imagePath: string;
  intention: string;
  notes: string;
  details: Record<string, string>;
  ingredients: Ingredient[];
  livingState: ApothecaryLiving;
  logToGrimoire: boolean;
  grimoireStatus: string;
  grimoireEntryId: string;
  entityId: string;
  instanceId: string;
  createdAt: string;
  updatedAt: string;
};

export const DEFAULT_LIVING: ApothecaryLiving = { tending_enabled: true, tending_interval_days: 30, expiration_enabled: false, expiration_days: 180 };

const text = (value: unknown) => (typeof value === 'string' ? value : value == null ? '' : String(value));
const days = (value: unknown, fallback: number) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 1 ? n : fallback;
};

function normalizeIngredients(value: unknown): Ingredient[] {
  const list = typeof value === 'string' ? safeParse(value) : value;
  if (!Array.isArray(list)) return [];
  return list
    .map((raw) => {
      if (typeof raw === 'string') return { label: raw };
      if (!raw || typeof raw !== 'object') return null;
      const r = raw as Record<string, unknown>;
      const label = text(r.label || r.name || r.libraryName).trim();
      return label ? ({ ...r, label, amount: text(r.amount) } as Ingredient) : null;
    })
    .filter((i): i is Ingredient => !!i);
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/** Any stored shape (a row from `apothecary_items`, or the website's in-memory item) as an item. */
export function normalizeApothecary(raw: Record<string, unknown>): ApothecaryItem {
  const type = apothecaryType(text(raw.type));
  const living = (raw.livingState ?? raw.living_state ?? {}) as Record<string, unknown>;
  const details = (raw.details && typeof raw.details === 'object' ? raw.details : {}) as Record<string, unknown>;
  return {
    id: text(raw.id),
    name: text(raw.name).trim() || type.label,
    type: type.id,
    typeLabel: text(raw.typeLabel ?? raw.type_label) || type.label,
    imagePath: text(raw.imagePath ?? raw.image_url) || type.image,
    intention: text(raw.intention),
    notes: text(raw.notes),
    details: Object.fromEntries(Object.entries(details).map(([k, v]) => [k, text(v)])),
    ingredients: normalizeIngredients(raw.ingredients),
    livingState: {
      tending_enabled: living.tending_enabled !== false,
      tending_interval_days: days(living.tending_interval_days, DEFAULT_LIVING.tending_interval_days),
      expiration_enabled: living.expiration_enabled === true,
      expiration_days: days(living.expiration_days, DEFAULT_LIVING.expiration_days),
    },
    logToGrimoire: (raw.logToGrimoire ?? raw.log_to_grimoire) === true,
    grimoireStatus: text(raw.grimoireStatus ?? raw.grimoire_status),
    grimoireEntryId: text(raw.grimoireEntryId ?? raw.grimoire_entry_id),
    entityId: text(raw.entityId ?? raw.entity_id),
    instanceId: text(raw.instanceId ?? raw.instance_id),
    createdAt: text(raw.createdAt ?? raw.created_at),
    updatedAt: text(raw.updatedAt ?? raw.updated_at),
  };
}

/** The `apothecary_items` row (mapApothecaryItemToRow). */
export function apothecaryRow(userId: string, item: ApothecaryItem, now: string) {
  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    type: item.type,
    type_label: item.typeLabel,
    image_url: item.imagePath,
    intention: item.intention,
    notes: item.notes,
    details: item.details,
    ingredients: item.ingredients,
    living_state: item.livingState,
    entity_id: item.entityId || null,
    instance_id: item.instanceId || null,
    grimoire_entry_id: item.grimoireEntryId || null,
    grimoire_status: item.grimoireStatus || null,
    log_to_grimoire: item.logToGrimoire,
    metadata: { source: 'altar-apothecary' },
    updated_at: now,
  };
}

/** Why an item can't be saved yet, or null. */
export function apothecaryProblem(item: Pick<ApothecaryItem, 'name' | 'ingredients'>): string | null {
  if (!item.name.trim()) return 'Give it a name first.';
  if (!item.ingredients.length) return 'Add at least one ingredient.';
  return null;
}

/** An ingredient from something on the altar (snapshotApothecaryIngredient). */
export function ingredientFromObject(object: SavedObject): Ingredient {
  return {
    label: object.label || 'Ingredient',
    libraryName: object.label || '',
    type: object.type || '',
    entityId: object.entityId || '',
    apothecaryItemId: object.apothecaryItemId || '',
    amount: '',
    herb: object.herb || '',
    form: object.form || '',
    color: object.color || '',
    crystal: object.crystal || '',
    imagePath: object.imagePath || '',
  };
}

/** The same thing twice (by type, Library entry, apothecary item and name). */
export const ingredientKey = (i: Ingredient) => [i.type ?? '', i.entityId ?? '', i.apothecaryItemId ?? '', i.label.toLowerCase()].join('|');

/** The My Practice keys the website writes for each detail (renderApothecaryDetailsForLibrary). */
const DETAIL_PRACTICE_KEYS: Record<string, string> = {
  incense_form: 'Incense Form',
  sachet_purpose: 'Sachet Purpose',
  kept_location: 'Kept Location',
  poppet_focus: 'Poppet Focus',
  representation_notes: 'Representation Notes',
  spray_use: 'Spray Use',
  use_notes: 'Use Notes',
};

/** What an ingredient is in the Living Library (getApothecaryIngredientLibraryType / …Name). */
export function ingredientLibraryRef(i: Ingredient): { libraryType: string; libraryName: string } {
  const str = (value: unknown) => (typeof value === 'string' ? value : '');
  const unslug = (value: unknown) => str(value).replaceAll('-', ' ');
  if (str(i.herb)) return { libraryType: 'herb', libraryName: unslug(i.herb) };
  if (str(i.crystal)) return { libraryType: 'crystal', libraryName: unslug(i.crystal) };
  if (str(i.color)) return { libraryType: 'candle', libraryName: `${str(i.color)} candle` };
  if (str(i.tool)) return { libraryType: 'tool', libraryName: unslug(i.tool) };
  if (str(i.vessel)) return { libraryType: 'vessel', libraryName: unslug(i.vessel) };
  if (str(i.deity)) return { libraryType: 'deity', libraryName: unslug(i.deity) };
  return { libraryType: str(i.type) || 'note', libraryName: i.label || 'Ingredient' };
}

/**
 * My Practice for the item's Living Library entry, in the website's shape
 * (createOrUpdateApothecaryLibraryEntity): the entry's other My Practice is
 * kept, ingredients are stored as objects, and details use its labels.
 */
export function apothecaryPractice(item: ApothecaryItem, existing?: Record<string, unknown> | null): Record<string, unknown> {
  const details: Record<string, string> = {};
  for (const [key, value] of Object.entries(item.details)) {
    if (value) details[DETAIL_PRACTICE_KEYS[key] ?? key] = value;
  }
  return {
    ...(existing ?? {}),
    Subtype: item.typeLabel || item.type || 'Apothecary Item',
    Intention: item.intention || '',
    Ingredients: item.ingredients.map((i) => ({ ...i, entityId: i.entityId || '', ...ingredientLibraryRef(i), amount: i.amount || '' })),
    Notes: item.notes || '',
    ...details,
    GrimoireStatus: item.logToGrimoire ? 'Linked to Living Library' : '',
    CreatedFrom: 'Altar Apothecary',
  };
}

const addDays = (iso: string, n: number) => new Date(Date.parse(iso) + n * 86_400_000).toISOString();

/**
 * The altar object for an item (placeApothecaryItem): type "apothecary", the
 * recipe carried on the object, and its tending and review dates started.
 */
export function apothecaryObject(
  item: ApothecaryItem,
  existing: SavedObject[],
  now: string,
  center: { cx: number; cy: number } = { cx: 0.5, cy: 0.6 },
): SavedObject {
  const cabinetItem: CabinetItem = { id: `apothecary:${item.id}`, category: 'apothecary', name: item.name, keywords: [], forms: [] };
  const form: CabinetForm = { label: item.name, image: item.imagePath, type: 'apothecary', form: item.type, entityId: item.entityId };
  const base = objectFromForm(cabinetItem, form, existing, now, {}, center);
  const apothecary = {
    activationState: '',
    remainingAmount: '',
    status: 'active',
    nextTendingAt: item.livingState.tending_enabled ? addDays(now, item.livingState.tending_interval_days) : '',
    reviewAt: item.livingState.expiration_enabled ? addDays(now, item.livingState.expiration_days) : '',
  };
  const livingState = JSON.stringify({ version: 1, createdAt: now, updatedAt: now, lastUsedAt: '', apothecary });
  return {
    ...base,
    label: item.name,
    apothecaryItemId: item.id,
    apothecaryType: item.typeLabel,
    apothecaryIngredients: JSON.stringify(item.ingredients),
    apothecaryIntention: item.intention,
    apothecaryNotes: item.notes,
    apothecaryLogToGrimoire: String(item.logToGrimoire),
    apothecaryGrimoireStatus: item.grimoireStatus,
    livingState,
  };
}

/** Keep placed copies in step after the recipe changes (syncPlacedApothecaryObjects). */
export function refreshPlaced(object: SavedObject, item: ApothecaryItem): SavedObject {
  if (object.apothecaryItemId !== item.id) return object;
  return {
    ...object,
    label: item.name,
    imagePath: item.imagePath,
    apothecaryType: item.typeLabel,
    apothecaryIngredients: JSON.stringify(item.ingredients),
    apothecaryIntention: item.intention,
    apothecaryNotes: item.notes,
  };
}
