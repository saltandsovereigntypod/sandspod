// The altar cabinet: the website's built-in catalogue (altar/js/features/
// cabinet.js and js/sanctuary-asset-catalog.js), custom cabinet items and
// backgrounds from Supabase, and turning a chosen form into a saved object.
// Image paths are kept exactly as the website writes them, so a save made in
// the app loads the same artwork on the website.

import { NEW_CLOTH_SIZE, NEW_OBJECT_SIZE, objectAspect, savedFromBox, type Box } from './geometry.ts';
import { nextLayer } from './layers.ts';
import { ensureLivingState } from './livingState.ts';
import type { AltarBackground, CabinetCategoryId, CabinetForm, CabinetItem, SavedObject } from './types.ts';

export const cabinetCategories: { id: CabinetCategoryId; label: string }[] = [
  { id: 'candles', label: 'Candles' },
  { id: 'herbs', label: 'Herbs' },
  { id: 'crystals', label: 'Crystals' },
  { id: 'tools', label: 'Tools' },
  { id: 'deities', label: 'Deities' },
  { id: 'vessels', label: 'Vessels' },
];

/** Built-in backgrounds (SanctuaryAssetCatalog.getBackgrounds). */
export const builtInBackgrounds: AltarBackground[] = [
  { id: 'forest-altar', name: 'Forest Altar', background: '/assets/altar/backgrounds/forest-scene.png' },
  { id: 'deity-shelf-altar', name: 'Deity Shelf Altar', background: '/assets/altar/backgrounds/shelf-deity-altar.png' },
];

/** What the stage shows when a save has no background (altar.css default). */
export const DEFAULT_BACKGROUND = '/assets/altar/backgrounds/forest-scene.png';

const candleForms = [
  { id: 'chime-spell', label: 'Chime / Spell Candle' },
  { id: 'taper', label: 'Taper Candle' },
  { id: 'tea-light', label: 'Tea Light' },
  { id: 'pillar', label: 'Pillar Candle' },
  { id: 'vigil', label: 'Vigil Candle' },
];

const candleColors = ['white', 'black', 'green', 'purple', 'red', 'orange', 'yellow', 'blue', 'brown', 'pink', 'gold', 'silver'];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const herbs: [string, string, string[], string?, string?][] = [
  ['basil', 'Basil', ['protection', 'prosperity', 'love', 'courage', 'cleansing']],
  ['bay', 'Bay', ['wishes', 'protection', 'victory', 'divination', 'success'], 'bay-leaf', 'bay'],
  ['cedar', 'Cedar', ['protection', 'purification', 'blessing', 'grounding', 'ancestors']],
  ['chamomile', 'Chamomile', ['calm', 'sleep', 'luck', 'money', 'healing']],
  ['cinnamon', 'Cinnamon', ['prosperity', 'passion', 'speed', 'success', 'protection']],
  ['lavender', 'Lavender', ['peace', 'sleep', 'love', 'healing', 'purification']],
  ['mugwort', 'Mugwort', ['dreams', 'divination', 'intuition', 'thresholds']],
  ['rosemary', 'Rosemary', ['protection', 'purification', 'remembrance', 'healing']],
  ['sage', 'Sage', ['cleansing', 'wisdom', 'protection', 'purification']],
];
const herbsWithImages = new Set(['basil', 'bay', 'cedar', 'chamomile', 'cinnamon', 'lavender', 'mugwort', 'rosemary']);

const single = (
  category: CabinetCategoryId,
  name: string,
  keywords: string[],
  form: Omit<CabinetForm, 'label'>,
): CabinetItem => ({
  id: `${category}:${slug(name)}`,
  category,
  name,
  keywords,
  forms: [{ label: 'Place', ...form }],
});

/** The website's built-in cabinet, in the same order. */
export const builtInCabinet: CabinetItem[] = [
  ...candleColors.map((color) => ({
    id: `candles:${color}-candle`,
    category: 'candles' as const,
    name: `${capitalize(color)} Candle`,
    keywords: [color, 'candle', 'fire'],
    forms: candleForms.map((form) => ({
      label: form.label,
      image:
        form.id === 'vigil'
          ? `../assets/altar/objects/candles/${color}-candle.${color === 'white' || color === 'black' ? 'PNG' : 'png'}`
          : '',
      type: 'candle',
      color,
      form: form.id,
    })),
  })),
  ...herbs.map(([id, name, keywords, folder = id, fileBase = folder]) => {
    const image = (form: string) => (herbsWithImages.has(id) ? `../assets/altar/objects/herbs/${folder}/${fileBase}-${form}.png` : '');
    return {
      id: `herbs:${slug(name)}`,
      category: 'herbs' as const,
      name,
      keywords,
      forms: [
        { label: 'Sprig', image: image('sprig'), type: 'herb', herb: id, form: 'sprig' },
        { label: 'Loose', image: image('loose'), type: 'herb', herb: id, form: 'loose' },
        { label: 'Oil', image: image('oil'), type: 'oil', herb: id, form: 'oil' },
        { label: 'Incense', image: '../assets/altar/objects/herbs/incense/incense.png', type: 'herb', herb: id, form: 'incense' },
      ],
    };
  }),
  ...(
    [
      ['amethyst', 'Amethyst', ['intuition', 'dreams', 'meditation', 'protection'], 'amethyst'],
      ['clear_quartz', 'Clear Quartz', ['amplification', 'clarity', 'healing', 'cleansing'], 'clear-quartz'],
    ] as const
  ).map(([id, name, keywords, folder]) => ({
    id: `crystals:${slug(name)}`,
    category: 'crystals' as const,
    name,
    keywords: [...keywords],
    forms: (['point', 'chips', 'cluster'] as const).map((form) => ({
      label: capitalize(form),
      image: `../assets/altar/objects/crystals/${folder}/${folder}-${form}.png`,
      type: 'crystal',
      crystal: id,
      form,
    })),
  })),
  single('tools', 'Key', ['thresholds', 'unlocking', 'Hekate'], {
    image: '../assets/altar/objects/tools/key/key.png',
    type: 'tool',
    tool: 'key',
    form: 'standard',
  }),
  single('tools', 'Athame', ['cutting', 'will', 'boundary'], {
    image: '../assets/altar/objects/tools/athame/athame.png',
    type: 'tool',
    tool: 'athame',
    form: 'standard',
  }),
  single('tools', 'Raven Skull', ['death', 'messages', 'mystery'], {
    image: '../assets/altar/objects/tools/raven-skull/raven-skull.png',
    type: 'tool',
    tool: 'raven-skull',
    form: 'standard',
  }),
  single('tools', 'Black Salt', ['protection', 'banishing', 'warding'], {
    image: '../assets/altar/objects/tools/black-salt/black-salt.png',
    type: 'tool',
    tool: 'black-salt',
    form: 'pile',
  }),
  single('tools', 'Salt Circle', ['protection', 'banishing', 'warding'], {
    image: '../assets/altar/objects/tools/salt-circle/2E77AAEA-4775-4EB3-9EEF-659AB1218A61.png',
    type: 'tool',
    tool: 'salt-circle',
    form: 'pile',
  }),
  single('deities', 'Hekate Statue', ['crossroads', 'torches', 'keys'], {
    image: '../assets/altar/objects/tools/deities/hekate/hekate-statue.png',
    type: 'deity',
    deity: 'hekate',
    form: 'statue',
  }),
  single('deities', 'Lilith Statue', [], {
    image: '../assets/altar/objects/tools/deities/lilith/lilith-statue.png',
    type: 'deity',
    deity: 'lilith',
    form: 'statue',
  }),
  single('vessels', 'Cauldron', ['transformation', 'fire', 'spellwork'], {
    image: '../assets/altar/objects/vessels/cauldron/cauldron.png',
    type: 'vessel',
    vessel: 'cauldron',
    form: 'standard',
  }),
  single('vessels', 'Spell Jar', ['container', 'spell', 'intention'], {
    image: '../assets/altar/objects/vessels/spell-jar/spell-jar.png',
    type: 'vessel',
    vessel: 'spell-jar',
    form: 'standard',
  }),
];

/** Label of an object placed from a form (cabinet.js renderCabinetTile). */
export function formObjectLabel(item: CabinetItem, form: CabinetForm): string {
  return item.forms.length > 1 ? `${item.name} ${form.label}` : item.name;
}

/** Key into custom_cabinet_image_overrides (custom-images.js getCabinetImageOverrideKey). */
export function overrideKey(item: CabinetItem, form: CabinetForm): string {
  const label = form.label === 'Place' ? item.name : `${item.name} ${form.label}`;
  return [form.type, form.herb, form.form, form.color, form.crystal, form.tool, form.vessel, form.deity, label]
    .map((value) => value || '')
    .join('|');
}

/** The image a form shows: the person's own override first, then the built-in art. */
export function formImage(item: CabinetItem, form: CabinetForm, overrides: Record<string, string> = {}): string {
  return overrides[overrideKey(item, form)] || form.image || '';
}

/** Forms that have an image and so can be placed (partitionCabinetForms). */
export function placeableForms(item: CabinetItem, overrides: Record<string, string> = {}): CabinetForm[] {
  if (item.customCabinetItemId) return item.forms.filter((form) => !!form.image);
  return item.forms.filter((form) => !!formImage(item, form, overrides));
}

// ---------- custom cabinet items (custom_cabinet_items) ----------

export type CustomCabinetRow = {
  id: string;
  category: string;
  name: string;
  keywords?: unknown;
  entity_id?: string | null;
  image_url?: string | null;
  item_type?: string | null;
  form_label?: string | null;
  forms?: unknown;
};

/** custom-cabinet-items.js normalizeCustomForms + loadCustomCabinetItems. */
export function customItemFromRow(row: CustomCabinetRow): CabinetItem {
  const forms: CabinetForm[] =
    Array.isArray(row.forms) && row.forms.length
      ? (row.forms as CabinetForm[]).map((form) => ({ ...form, label: String(form.label || 'Place'), image: String(form.image || '') }))
      : [
          {
            label: 'Place',
            image: row.image_url || '',
            type: row.item_type || '',
            form: row.form_label || 'standard',
            custom: true,
            entityId: row.entity_id || '',
          },
        ];
  return {
    id: `custom:${row.id}`,
    category: row.category,
    name: row.name,
    keywords: Array.isArray(row.keywords) ? (row.keywords as unknown[]).map(String) : [],
    entityId: row.entity_id || '',
    customCabinetItemId: row.id,
    forms,
  };
}

/** Guest custom items live in localStorage as the already-normalised cache. */
export function customItemFromLocal(value: unknown): CabinetItem | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (!v.name || !v.category) return null;
  return {
    id: `custom:${String(v.id ?? v.customCabinetItemId ?? v.name)}`,
    category: String(v.category),
    name: String(v.name),
    keywords: Array.isArray(v.keywords) ? v.keywords.map(String) : [],
    entityId: String(v.entityId ?? ''),
    customCabinetItemId: String(v.customCabinetItemId ?? v.id ?? ''),
    forms: Array.isArray(v.forms) ? (v.forms as CabinetForm[]).map((f) => ({ ...f, label: String(f.label || 'Place'), image: String(f.image || '') })) : [],
  };
}

export type CustomBackgroundRow = { id: string; name: string; image_url: string };

export function customBackgroundFromRow(row: CustomBackgroundRow): AltarBackground {
  return { id: row.id, name: row.name, background: row.image_url, custom: true };
}

/** Items in one category matching a search, custom items first (renderCabinetItems). */
export function cabinetItemsFor(items: CabinetItem[], category: string, search: string): CabinetItem[] {
  const needle = search.trim().toLowerCase();
  return items.filter((item) => {
    if (item.category !== category) return false;
    if (!needle) return true;
    return [item.name, item.category, ...item.keywords].join(' ').toLowerCase().includes(needle);
  });
}

// ---------- placing ----------

/**
 * A new saved object for a cabinet form, as the website's placeObject()
 * creates it, centred on `center` (fractions of the stage) and on top of
 * everything already there.
 */
export function objectFromForm(
  item: CabinetItem,
  form: CabinetForm,
  existing: SavedObject[],
  now: string,
  overrides: Record<string, string> = {},
  center: { cx: number; cy: number } = { cx: 0.5, cy: 0.5 },
): SavedObject {
  const type = form.type || '';
  const size = type === 'cloth' ? NEW_CLOTH_SIZE : NEW_OBJECT_SIZE;
  const imagePath = formImage(item, form, overrides);
  const box: Box = { cx: center.cx, cy: center.cy, size, aspect: objectAspect({ imagePath }) };
  const object: SavedObject = {
    imagePath,
    fallbackSymbol: '',
    label: formObjectLabel(item, form),
    type,
    entityId: form.entityId || item.entityId || '',
    instanceId: '',
    herb: form.herb || '',
    form: form.form || '',
    color: form.color || '',
    crystal: form.crystal || '',
    tool: form.tool || '',
    vessel: form.vessel || '',
    deity: form.deity || '',
    apothecaryItemId: '',
    apothecaryType: '',
    apothecaryIngredients: '[]',
    apothecaryIntention: '',
    apothecaryNotes: '',
    apothecaryLogToGrimoire: 'false',
    apothecaryGrimoireStatus: '',
    scale: type === 'cloth' ? '3' : '1',
    rotation: '0',
    flipped: 'false',
    locked: 'false',
    glowing: 'false',
    lit: 'false',
    livingState: '',
    plaqueText: '',
    altarObjectId: '',
    groupId: '',
    ...savedFromBox(box),
    zIndex: String(nextLayer(existing)),
  };
  return ensureLivingState(object, now);
}
