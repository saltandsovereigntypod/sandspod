// Your own cabinet items, as the website makes them
// (altar/js/features/custom-cabinet-items.js): the same categories, the same
// preset forms, the same `custom_cabinet_items` row and the same guest shape,
// so an item made in the app works at the website's altar and the other way
// round. Pure, so it can be tested.

import type { CabinetForm, CabinetItem } from './types.ts';

export type CustomCategory = 'candles' | 'herbs' | 'crystals' | 'tools' | 'deities' | 'vessels';

export const CUSTOM_CATEGORIES: { id: CustomCategory; label: string; hint: string }[] = [
  { id: 'candles', label: 'Candle', hint: 'Candles of any colour or shape' },
  { id: 'herbs', label: 'Herb', hint: 'Herbs, resins, incense blends, flowers' },
  { id: 'crystals', label: 'Crystal', hint: 'Stones, crystals, shells, bones' },
  { id: 'tools', label: 'Tool or trinket', hint: 'Tools, charms, keys, cards, trinkets' },
  { id: 'deities', label: 'Deity', hint: 'Statues, images and representations' },
  { id: 'vessels', label: 'Vessel', hint: 'Bowls, jars, bottles, chalices' },
];

/** The website's CUSTOM_FORM_PRESETS (js/sanctuary-asset-catalog.js). */
export const FORM_PRESETS: Record<CustomCategory, string[]> = {
  candles: ['Chime / Spell Candle', 'Taper Candle', 'Tea Light', 'Pillar Candle', 'Vigil Candle'],
  herbs: ['Loose', 'Fresh Sprig', 'Bundle', 'Powder'],
  crystals: ['Tumbled Stone', 'Point', 'Cluster', 'Chips'],
  tools: ['Place'],
  deities: ['Place'],
  vessels: ['Place'],
};

/** The altar object type a category places (custom-cabinet-items.js getItemType). */
export const ITEM_TYPE: Record<CustomCategory, string> = {
  candles: 'candle',
  herbs: 'herb',
  crystals: 'crystal',
  tools: 'tool',
  deities: 'deity',
  vessels: 'vessel',
};

export const isCustomCategory = (value: string): value is CustomCategory => value in FORM_PRESETS;

/** "Fresh Sprig" → "fresh-sprig", as the website names a form. */
export const formId = (label: string) => label.toLowerCase().replaceAll(' ', '-');

export type ChosenForm = { label: string; image: string; storagePath?: string };

/** The forms an item is saved with: only the chosen presets that have a picture, in preset order. */
export function customForms(category: CustomCategory, chosen: ChosenForm[], entityId: string): CabinetForm[] {
  return FORM_PRESETS[category]
    .map((label) => chosen.find((c) => c.label === label))
    .filter((c): c is ChosenForm => !!c && !!c.image)
    .map((c) => ({
      label: c.label,
      image: c.image,
      type: ITEM_TYPE[category],
      form: formId(c.label),
      custom: true,
      entityId,
      ...(c.storagePath ? { storagePath: c.storagePath } : {}),
    }));
}

/** "rose, love,  , self-love" → ["rose", "love", "self-love"]. */
export function parseKeywords(text: string): string[] {
  return text
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean);
}

export type CustomItemInput = {
  category: CustomCategory;
  name: string;
  keywords: string[];
  entityId: string;
  forms: CabinetForm[];
  libraryMode: 'existing' | 'new';
};

/** Why an item can't be saved yet, in the website's words, or null. */
export function customItemProblem(input: Pick<CustomItemInput, 'name' | 'entityId' | 'forms'>): string | null {
  if (!input.name.trim()) return 'Add a name first.';
  if (!input.entityId) return 'Choose a Living Library entry or create a new one.';
  if (!input.forms.length) return 'Choose at least one form and add a picture.';
  return null;
}

/** The `custom_cabinet_items` row the website writes (saveCustomCabinetItem). */
export function customItemRow(userId: string, input: CustomItemInput, now: string) {
  const first = input.forms[0];
  return {
    user_id: userId,
    category: input.category,
    name: input.name.trim(),
    icon: '✦',
    keywords: input.keywords,
    entity_id: input.entityId,
    image_url: first?.image ?? '',
    item_type: ITEM_TYPE[input.category],
    form_label: first?.form || 'standard',
    forms: input.forms,
    storage_paths: input.forms.map((f) => (f as CabinetForm & { storagePath?: string }).storagePath).filter(Boolean),
    metadata: { libraryMode: input.libraryMode, multiForm: input.forms.length > 1 },
    updated_at: now,
  };
}

/** The guest copy kept on the device (localStorage "saltAndSovereigntyCustomCabinetItems" on the website). */
export function customItemLocal(id: string, input: CustomItemInput, createdAt: string) {
  return {
    id,
    category: input.category,
    name: input.name.trim(),
    icon: '✦',
    keywords: input.keywords,
    entityId: input.entityId,
    customCabinetItemId: id,
    forms: input.forms,
    createdAt,
  };
}

/** My Practice for a new Library entry made with an item (createEntity in the website). */
export function customItemPractice(category: CustomCategory, notes: string): Record<string, unknown> {
  return {
    ...(notes.trim() ? { Notes: notes.trim() } : {}),
    CreatedFrom: 'Custom Cabinet Item',
    CabinetCategory: category,
  };
}

/** Storage path for an uploaded picture: `${userId}/custom-cabinet-items/${id}.${ext}`. */
export function uploadPath(userId: string, id: string, mimeType: string): string {
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  return `${userId}/custom-cabinet-items/${id}.${ext}`;
}

/** The storage path behind a public URL, so a replaced or deleted picture can be removed. */
export function storagePathFromUrl(url: string): string | null {
  const marker = '/storage/v1/object/public/user-assets/';
  const at = url.indexOf(marker);
  return at < 0 ? null : decodeURIComponent(url.slice(at + marker.length).split('?')[0]);
}

/** Which presets an existing item already has a picture for. */
export function chosenFromItem(item: CabinetItem): ChosenForm[] {
  return item.forms
    .filter((form) => form.image)
    .map((form) => ({
      label: form.label,
      image: form.image,
      storagePath: (form as CabinetForm & { storagePath?: string }).storagePath ?? storagePathFromUrl(form.image) ?? undefined,
    }));
}
