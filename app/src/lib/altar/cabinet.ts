// The altar cabinet: the website's built-in catalogue (altar/js/features/
// cabinet.js and js/sanctuary-asset-catalog.js), custom cabinet items and
// backgrounds from Supabase, and turning a chosen form into a saved object.
// Image paths are kept exactly as the website writes them, so a save made in
// the app loads the same artwork on the website.

import { NEW_CLOTH_SIZE, NEW_OBJECT_SIZE, objectAspect, savedFromBox, type Box } from './geometry.ts';
import { nextLayer } from './layers.ts';
import { ensureLivingState } from './livingState.ts';
import type { AltarBackground, CabinetCategoryId, CabinetForm, CabinetItem, SavedObject } from './types.ts';
import { ALTAR_ARTWORK } from './artworkData.ts';
import { offeringCabinetItems } from './offeringDrawer.ts';
import { offeringKind, setOffering, type OfferingKindId } from './offerings.ts';
import { pottedCabinetItems } from './pottedPlants.ts';
import { seasonalCabinetItems } from './seasonal.ts';
import { glowsWhenPlaced, naturalItems, shelfToolItems } from './shelf.ts';

export const cabinetCategories: { id: CabinetCategoryId; label: string }[] = [
  { id: 'candles', label: 'Candles' },
  { id: 'herbs', label: 'Herbs' },
  { id: 'crystals', label: 'Crystals' },
  { id: 'tools', label: 'Tools' },
  { id: 'deities', label: 'Deities' },
  { id: 'vessels', label: 'Vessels' },
  { id: 'natural', label: 'Natural' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'plants', label: 'Plants' },
  { id: 'offerings', label: 'Offerings' },
];

/**
 * The drawers in order: the Seasonal drawer comes first while a festival is
 * near (seasonal.ts festivalsNear), so its things are the first thing you see.
 */
export function cabinetCategoriesFor(festivalIsNear: boolean): { id: CabinetCategoryId; label: string }[] {
  if (!festivalIsNear) return cabinetCategories;
  return [...cabinetCategories.filter((c) => c.id === 'seasonal'), ...cabinetCategories.filter((c) => c.id !== 'seasonal')];
}

/** Built-in backgrounds (SanctuaryAssetCatalog.getBackgrounds). */
export const builtInBackgrounds: AltarBackground[] = [
  { id: 'forest-altar', name: 'Forest Altar', background: '/assets/altar/backgrounds/forest-scene.png' },
  { id: 'deity-shelf-altar', name: 'Deity Shelf Altar', background: '/assets/altar/backgrounds/shelf-deity-altar.png' },
  // The painted backgrounds (scripts/build-altar-artwork.mjs), as the website lists them.
  ...ALTAR_ARTWORK.backgrounds.map((b) => ({ id: b.id, name: b.name, background: b.assetPath })),
];

/** What the stage shows when a save has no background (altar.css default). */
export const DEFAULT_BACKGROUND = '/assets/altar/backgrounds/forest-scene.png';

/**
 * The background Settings → Default altar background names, matched as the
 * website's applyDefaultAltarBackgroundSetting does: by name (any case) or by
 * asset path. Null when nothing is chosen or it's no longer available.
 */
export function defaultAltarBackground(saved: unknown, custom: AltarBackground[] = []): AltarBackground | null {
  const wanted = typeof saved === 'string' ? saved.trim() : '';
  if (!wanted) return null;
  return (
    [...builtInBackgrounds, ...custom].find((bg) => bg.name.toLowerCase() === wanted.toLowerCase() || bg.background === wanted) ?? null
  );
}

/** SanctuaryAssetCatalog.getForms('candle'), aliases included. */
const candleForms = [
  { id: 'chime-spell', label: 'Chime / Spell Candle', aliases: ['chime', 'spell candle'] },
  { id: 'taper', label: 'Taper Candle', aliases: ['taper'] },
  { id: 'tea-light', label: 'Tea Light', aliases: ['tealight', 'tea light'] },
  { id: 'pillar', label: 'Pillar Candle', aliases: ['pillar'] },
  { id: 'vigil', label: 'Vigil Candle', aliases: ['seven day', 'vigil'] },
];

// Candle colours, extra candle forms, and the herbs, crystals, deities, tools and
// vessels with pictures: generated from assets/altar/objects (scripts/build-altar-artwork.mjs),
// the same list the website's cabinet reads (js/altar-artwork.js).
const candleColors = ALTAR_ARTWORK.candleColors;
const allCandleForms = [...candleForms, ...ALTAR_ARTWORK.candleStyleForms.map(({ id, label, aliases }) => ({ id, label, aliases }))];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Candle artwork by form: the vigil candles, and each other form painted in every colour.
const candleFormFiles: Record<string, string> = { 'chime-spell': 'chime', taper: 'taper', 'tea-light': 'tea-light', pillar: 'pillar' };
const styleIds = new Set(ALTAR_ARTWORK.candleStyleForms.map((form) => form.id));
function candleFormImage(color: string, formId: string): string {
  if (formId === 'vigil') return `../assets/altar/objects/candles/${color}-candle.${color === 'white' || color === 'black' ? 'PNG' : 'png'}`;
  const file = candleFormFiles[formId] ?? (styleIds.has(formId) ? formId : '');
  return file ? `../assets/altar/objects/candles/${file}/${color}-${file}.png` : '';
}

const fromArtwork = (list: (typeof ALTAR_ARTWORK.items)[keyof typeof ALTAR_ARTWORK.items]): CabinetItem[] =>
  list.map((item) => ({ ...item, id: `${item.category}:${slug(item.name)}`, keywords: [...item.keywords], forms: item.forms.map((f) => ({ ...f })) }));

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
    forms: allCandleForms.map((form) => ({
      label: form.label,
      image: candleFormImage(color, form.id),
      type: 'candle',
      color,
      form: form.id,
      aliases: [...form.aliases],
    })),
  })),
  ...fromArtwork(ALTAR_ARTWORK.items.herbs),
  ...fromArtwork(ALTAR_ARTWORK.items.crystals),
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
  single('tools', 'Graveyard Dirt', ['ancestors', 'protection', 'binding'], {
    image: '../assets/altar/objects/tools/grave-dirt/grave-dirt.png',
    type: 'tool',
    tool: 'grave-dirt',
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
  ...fromArtwork(ALTAR_ARTWORK.items.deities),
  ...fromArtwork(ALTAR_ARTWORK.items.tools),
  // Tools the Library has no page for, those that have a picture (shelf.ts).
  ...shelfToolItems(ALTAR_ARTWORK.shelfTools ?? {}),
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
  ...fromArtwork(ALTAR_ARTWORK.items.vessels),
  // Seasonal things for the festivals, those that have a picture (seasonal.ts).
  ...seasonalCabinetItems(ALTAR_ARTWORK.seasonal ?? {}),
  // Natural finds: feathers, a hag stone, shells, acorns (shelf.ts).
  ...naturalItems(ALTAR_ARTWORK.natural ?? {}),
  // Pots for your real houseplants and windowsill herbs, those that have a picture (pottedPlants.ts).
  ...pottedCabinetItems(),
  // Food, flowers and keepsakes to set straight on the altar, and vessels already filled (offeringDrawer.ts).
  ...offeringCabinetItems(),
];

/** Label of an object placed from a form (cabinet.js renderCabinetTile). */
/**
 * How an object's name is shown in the app. Saved labels stay exactly as the
 * website writes them ("Red Candle Vigil Candle"); on screen the doubled word
 * is dropped ("Red Vigil Candle", "Red Tea Light").
 */
export function shortLabel(label: string | null | undefined, fallback = 'Object'): string {
  const name = (label ?? '').trim();
  if (!name) return fallback;
  const doubled = /^(.+?) Candle (.+)$/.exec(name);
  return doubled ? `${doubled[1]} ${doubled[2]}` : name;
}

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

/**
 * Words a cabinet item is found by beyond its name and keywords: its forms'
 * labels, types, ids and aliases ("seven day", "tealight") and the plural
 * category words (cabinet.js cabinetSearchAliases).
 */
/** The deity drawer's pantheon groups, in order. */
export const PANTHEON_GROUPS: string[] = ALTAR_ARTWORK.pantheonGroups;

/** Which pantheon group a deity statue belongs to (people's own statues are "Your own"). */
export function deityPantheon(item: CabinetItem): string {
  if (item.customCabinetItemId) return 'Your own';
  const key = item.forms.find((form) => form.deity)?.deity ?? '';
  return ALTAR_ARTWORK.deityPantheons[key] ?? 'Other';
}

export function cabinetSearchAliases(item: CabinetItem): string[] {
  const formWords = item.forms.flatMap((form) => [form.label, form.type, form.form, ...(form.aliases ?? [])]);
  const variants =
    item.category === 'candles'
      ? ['candle', 'candles']
      : item.category === 'herbs'
        ? ['herb', 'herbs']
        : item.category === 'crystals'
          ? ['crystal', 'crystals']
          : item.category === 'seasonal'
            ? ['seasonal', 'festival', 'holiday']
          : item.category === 'natural'
            ? ['natural', 'nature', 'found']
          : item.category === 'plants'
            ? ['plant', 'plants', 'houseplant', 'pot', 'potted']
          : item.category === 'offerings'
            ? ['offering', 'offerings', 'food', 'libation']
          : item.name === 'Spell Jar'
            ? ['jar', 'spell jar', 'spell jars']
            : [];
  // What it's traditionally for, from the Living Library, so a search by meaning finds it.
  const m = ALTAR_ARTWORK.meanings;
  const meaningWords = item.forms.flatMap((form) => [
    ...(form.herb ? m.herb[String(form.herb).replaceAll('_', '-')] ?? [] : []),
    ...(form.crystal ? m.crystal[String(form.crystal).replaceAll('_', '-')] ?? [] : []),
    ...(form.deity ? m.deity[String(form.deity).replaceAll('_', '-')] ?? [] : []),
    ...(form.tool ? m.tool[String(form.tool).replaceAll('_', '-')] ?? [] : []),
    ...(form.vessel ? m.vessel[String(form.vessel).replaceAll('_', '-')] ?? [] : []),
    ...(form.color ? m.candle[String(form.color).replaceAll('_', '-')] ?? [] : []),
  ]);
  const described = item.description ? [item.description] : [];
  return [...new Set([...item.keywords, ...formWords, ...variants, ...meaningWords, ...described].filter((word): word is string => !!word))];
}

/** Items in one category matching a search, custom items first (renderCabinetItems). */
export function cabinetItemsFor(items: CabinetItem[], category: string, search: string): CabinetItem[] {
  const needle = search.trim().toLowerCase();
  return items
    .filter((item) => {
      if (item.category !== category) return false;
      if (!needle) return true;
      return [item.name, item.category, ...cabinetSearchAliases(item)].join(' ').toLowerCase().includes(needle);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
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
    // A lamp or lantern is set down glowing, as if lit (the Glow it can be turned off with).
    glowing: glowsWhenPlaced({ type, tool: form.tool, form: form.form }) ? 'true' : 'false',
    lit: 'false',
    livingState: '',
    plaqueText: '',
    altarObjectId: '',
    groupId: '',
    ...savedFromBox(box),
    zIndex: String(nextLayer(existing)),
  };
  const placed = ensureLivingState(object, now);
  // A filled vessel from the Offerings drawer is set down with its offering already set out.
  return form.offering && offeringKind(form.offering) ? setOffering(placed, form.offering as OfferingKindId, form.offeringLabel || '', now) : placed;
}

/** How far apart things set down one after another sit (stage fractions; the stage is 16:9, so this is a short diagonal step). */
export const PLACE_NUDGE = { x: 0.035, y: 0.06 };

/**
 * Where the next thing from the cabinet is set down: the middle of what's in
 * view, unless something already sits there, then a small step aside (rings
 * outward, right and down first), so things placed one after another don't
 * stack exactly on top of each other. `taken` are the visual centres of what's
 * on the altar (displayBox in the app, the objects' positions on the website,
 * which uses this through js/core/altar.js).
 */
export function nudgedCenter(center: { cx: number; cy: number }, taken: { cx: number; cy: number }[]): { cx: number; cy: number } {
  const near = (cx: number, cy: number) => taken.some((t) => Math.abs(t.cx - cx) < PLACE_NUDGE.x / 2 && Math.abs(t.cy - cy) < PLACE_NUDGE.y / 2);
  const inside = (cx: number, cy: number) => cx >= 0.06 && cx <= 0.94 && cy >= 0.08 && cy <= 0.92;
  for (let ring = 0; ring <= 6; ring += 1) {
    const steps: [number, number][] =
      ring === 0
        ? [[0, 0]]
        : [[ring, ring], [-ring, ring], [ring, -ring], [-ring, -ring], [ring, 0], [0, ring], [-ring, 0], [0, -ring]];
    for (const [dx, dy] of steps) {
      const cx = center.cx + dx * PLACE_NUDGE.x;
      const cy = center.cy + dy * PLACE_NUDGE.y;
      if (inside(cx, cy) && !near(cx, cy)) return { cx, cy };
    }
  }
  return center;
}

/** How many of a thing are on the altar, by the label it's placed with ("on the altar ×2" in the cabinet). */
export function countOnAltar(objects: { label?: string }[], label: string): number {
  return objects.reduce((n, o) => n + (o.label === label ? 1 : 0), 0);
}
