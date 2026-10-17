// Spell jars built in layers: an intention, then ingredients one at a time
// (each with an optional spoken line), then a wax seal. The finished jar is an
// ordinary apothecary working (type "spell-jar"), so the website shows it as
// a spell jar and lists its ingredients; the layers, seal and renewals are the
// app's own and ride along inside livingState.app.jar.

import type { LibraryEntry } from '../../library/types.ts';
import { apothecaryObject, apothecaryType, DEFAULT_LIVING, type ApothecaryItem, type Ingredient } from '../apothecary.ts';
import { isCandle, isLit, readLivingState } from '../livingState.ts';
import { correspondenceOf, entryByName, objectUid, type ElementOrSpirit } from '../reading/correspondence.ts';
import type { SavedObject } from '../types.ts';
import { newId } from '../uid.ts';
import { appPart, withAppPart } from './appState.ts';
import { ingredientColor, waxColor } from './colors.ts';

export type LayerSource = 'library' | 'cabinet' | 'apothecary' | 'salt' | 'typed';

/** One layer of a jar, bottom first. */
export type JarLayer = {
  label: string;
  source: LayerSource;
  /** Living Library entry id, when it came from (or matched) the Library. */
  entryId?: string;
  type?: string;
  herb?: string;
  crystal?: string;
  apothecaryItemId?: string;
  element?: ElementOrSpirit | null;
  /** What it shows as in the jar. */
  color: string;
  /** The line spoken as it went in (optional). */
  spoken: string;
  amount?: string;
  addedAt: string;
};

export type JarSeal = {
  /** Candle colour name ("red"). */
  color: string;
  /** Wax dripped from a lit candle on the altar (its altarObjectId and label). */
  dripFromUid?: string;
  dripFromLabel?: string;
  sealedAt: string;
};

export type JarDraft = { name: string; intention: string; layers: JarLayer[]; seal: JarSeal | null };

export type JarRenewal = { at: string; note: string };

/** What livingState.app.jar holds. */
export type JarState = {
  kind: 'spell-jar';
  intention: string;
  layers: JarLayer[];
  seal: JarSeal | null;
  madeAt: string;
  renewals: JarRenewal[];
  lastRenewedAt: string;
};

export const JAR_LAYER_MAX = 13;
export const SPOKEN_MAX = 140;

/** Salts and the common jar fillers the Library doesn't hold as entries. */
export const JAR_SALTS: { label: string; note: string }[] = [
  { label: 'Sea salt', note: 'cleansing, protection' },
  { label: 'Black salt', note: 'protection, banishing' },
  { label: 'Pink salt', note: 'love, gentle cleansing' },
  { label: 'Epsom salt', note: 'rest, release' },
  { label: 'Sugar', note: 'sweetening, kindness' },
  { label: 'Honey', note: 'sweetening, attraction' },
  { label: 'Rice', note: 'abundance, plenty' },
  { label: 'Red brick dust', note: 'thresholds, protection' },
];

export function emptyJar(intention = ''): JarDraft {
  return { name: '', intention, layers: [], seal: null };
}

export type LayerInput = {
  label: string;
  source: LayerSource;
  spoken?: string;
  amount?: string;
  type?: string;
  herb?: string;
  crystal?: string;
  apothecaryItemId?: string;
};

/** A layer for something chosen or typed, coloured by what it is. */
export function jarLayer(input: LayerInput, now: string, entries?: LibraryEntry[] | null): JarLayer {
  const label = input.label.replace(/\s+/g, ' ').trim();
  const typeHint = input.crystal ? 'crystal' : input.herb ? 'herb' : undefined;
  const entry = input.source === 'salt' ? null : entryByName(input.herb || input.crystal || label, entries, typeHint);
  const { element } = correspondenceOf(entry);
  const layer: JarLayer = {
    label,
    source: input.source,
    color: ingredientColor(input.crystal || input.herb || label, element),
    spoken: (input.spoken ?? '').replace(/\s+/g, ' ').trim().slice(0, SPOKEN_MAX),
    addedAt: now,
  };
  if (entry) layer.entryId = entry.id;
  if (element) layer.element = element;
  if (input.type || entry?.type) layer.type = input.type || entry?.type;
  if (input.herb) layer.herb = input.herb;
  if (input.crystal) layer.crystal = input.crystal;
  if (input.apothecaryItemId) layer.apothecaryItemId = input.apothecaryItemId;
  if (input.amount?.trim()) layer.amount = input.amount.trim();
  return layer;
}

/** Add a layer on top. A blank one, or one past the jar's neck, changes nothing. */
export function addLayer(draft: JarDraft, layer: JarLayer): JarDraft {
  if (!layer.label || draft.layers.length >= JAR_LAYER_MAX || draft.seal) return draft;
  return { ...draft, layers: [...draft.layers, layer] };
}

/** Take a layer out (only before the jar is sealed). */
export function removeLayer(draft: JarDraft, index: number): JarDraft {
  if (draft.seal) return draft;
  return { ...draft, layers: draft.layers.filter((_, i) => i !== index) };
}

export type LayerBand = { color: string; label: string; /** fractions of the jar's inside height, from the bottom */ from: number; to: number };

/**
 * How the layers stack in the jar picture: bottom first, each band the same
 * thickness, filling the jar to its shoulder once it holds eight or more.
 */
export function layerBands(layers: Pick<JarLayer, 'color' | 'label'>[], full = 0.9): LayerBand[] {
  if (!layers.length) return [];
  const band = Math.min(full / 8, full / layers.length);
  return layers.map((layer, i) => ({ color: layer.color, label: layer.label, from: i * band, to: (i + 1) * band }));
}

/** The lit candles on the altar, which could drip their wax to seal it. */
export function dripCandles(objects: SavedObject[]): SavedObject[] {
  return objects.filter((o) => isCandle(o) && isLit(o));
}

/** Seal the jar with wax of a colour, or with wax dripped from a lit candle (its colour wins). */
export function sealJar(draft: JarDraft, color: string, now: string, dripFrom?: SavedObject | null): JarDraft {
  if (!draft.layers.length) return draft;
  const fromCandle = dripFrom && isCandle(dripFrom) && isLit(dripFrom) ? dripFrom : null;
  const seal: JarSeal = { color: (fromCandle?.color as string) || color || 'white', sealedAt: now };
  if (fromCandle) {
    seal.dripFromUid = objectUid(fromCandle);
    seal.dripFromLabel = String(fromCandle.label || 'a candle');
  }
  return { ...draft, seal };
}

export const unsealJar = (draft: JarDraft): JarDraft => ({ ...draft, seal: null });

/** Why it can't be finished yet, or null. */
export function jarProblem(draft: JarDraft): string | null {
  if (!draft.intention.trim()) return 'Choose what the jar is for first.';
  if (!draft.layers.length) return 'Add at least one layer.';
  if (!draft.seal) return 'Seal it with wax to finish.';
  return null;
}

/** "Sealed with red wax" / "Sealed with wax from Red Taper Candle". */
export function sealLine(seal: JarSeal | null): string {
  if (!seal) return 'Not sealed yet';
  return seal.dripFromLabel ? `Sealed with ${seal.color} wax dripped from ${seal.dripFromLabel}` : `Sealed with ${seal.color} wax`;
}

export const sealHex = (seal: JarSeal | null) => (seal ? waxColor(seal.color) : null);

const layerIngredient = (layer: JarLayer): Ingredient => {
  const ingredient: Ingredient = { label: layer.label, libraryName: layer.label, type: layer.type || (layer.source === 'salt' ? 'salt' : ''), amount: layer.amount || '' };
  if (layer.herb) ingredient.herb = layer.herb;
  if (layer.crystal) ingredient.crystal = layer.crystal;
  if (layer.apothecaryItemId) ingredient.apothecaryItemId = layer.apothecaryItemId;
  // Extra fields: the website keeps them and shows the label.
  if (layer.spoken) ingredient.spoken = layer.spoken;
  ingredient.layerColor = layer.color;
  return ingredient;
};

/** The finished jar as a My Apothecary item (the website's apothecary_items shape). */
export function jarItem(draft: JarDraft, now: string, id: string = newId()): ApothecaryItem {
  const type = apothecaryType('spell-jar');
  const spoken = draft.layers.filter((l) => l.spoken).map((l) => `${l.label}: “${l.spoken}”`);
  return {
    id,
    name: draft.name.trim() || `${draft.intention.trim() || 'Intention'} jar`,
    type: 'spell-jar',
    typeLabel: type.label,
    imagePath: type.image,
    intention: draft.intention.trim(),
    notes: [sealLine(draft.seal), ...spoken].join('\n'),
    details: {},
    ingredients: draft.layers.map(layerIngredient),
    livingState: { ...DEFAULT_LIVING },
    logToGrimoire: false,
    grimoireStatus: '',
    grimoireEntryId: '',
    entityId: '',
    instanceId: '',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * The jar ready to place: an apothecary object (what the website renders as a
 * spell jar) with the layers in livingState.app.jar and its activation noted.
 */
export function jarObject(
  draft: JarDraft,
  existing: SavedObject[],
  now: string,
  center?: { cx: number; cy: number },
  /** An id for the new item, or the item as My Apothecary saved it (its id, instance and Library entry are kept). */
  idOrItem?: string | ApothecaryItem,
): { item: ApothecaryItem; object: SavedObject } {
  const item = typeof idOrItem === 'object' ? idOrItem : jarItem(draft, now, idOrItem);
  const base = apothecaryObject(item, existing, now, center);
  const state = readLivingState(base, now);
  const jar: JarState = {
    kind: 'spell-jar',
    intention: item.intention,
    layers: draft.layers,
    seal: draft.seal,
    madeAt: now,
    renewals: [],
    lastRenewedAt: '',
  };
  const object = withAppPart(base, 'jar', jar, now, {
    apothecary: { ...(state.apothecary as object), activationState: sealLine(draft.seal) },
  });
  return { item, object };
}

/** A placed jar's layers and renewals, or null for anything else. */
export function jarStateOf(object: SavedObject): JarState | null {
  const jar = appPart<JarState>(object, 'jar');
  if (!jar || !Array.isArray(jar.layers)) return null;
  return { ...jar, renewals: Array.isArray(jar.renewals) ? jar.renewals : [], seal: jar.seal ?? null };
}

/** The jar after a shake to renew it: the renewal logged, the newest first in mind. */
export function renewedJar(jar: JarState, now: string, note = ''): JarState {
  const renewal = { at: now, note: note.replace(/\s+/g, ' ').trim().slice(0, SPOKEN_MAX) };
  return { ...jar, renewals: [...jar.renewals, renewal], lastRenewedAt: now };
}

/**
 * Shake to renew: logs the renewal in livingState.app.jar and moves the
 * working's next tending on (the website's apothecary.nextTendingAt), so the
 * website sees it as tended too.
 */
export function shakeToRenew(object: SavedObject, now: string, note = '', intervalDays = DEFAULT_LIVING.tending_interval_days): SavedObject {
  const jar = jarStateOf(object);
  if (!jar) return object;
  const state = readLivingState(object, now);
  const nextTendingAt = new Date(Date.parse(now) + intervalDays * 86_400_000).toISOString();
  return withAppPart(object, 'jar', renewedJar(jar, now, note), now, {
    apothecary: { ...(state.apothecary as object), nextTendingAt },
  });
}

/** Whole days since it was made or last shaken. */
export function daysSinceRenewal(jar: JarState, now: Date | number = Date.now()): number {
  const from = Date.parse(jar.lastRenewedAt || jar.madeAt);
  if (!Number.isFinite(from)) return 0;
  return Math.max(0, Math.floor((Number(now) - from) / 86_400_000));
}
