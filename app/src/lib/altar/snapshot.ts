// Reading and writing whole altars in the website's shapes
// (altar/js/core/storage.js: getSavedAltars, createAltarSnapshot, saveAltar).

import { newId } from './uid.ts';
import type { AltarData, SavedAltar, SavedAltarRow, SavedObject } from './types.ts';

/** localStorage keys the website uses for guests (state.js, storage.js). */
export const LOCAL_ALTARS_KEY = 'saltAndSovereigntySavedAltars';
export const WORKING_DRAFT_KEY = 'saltAndSovereigntyWorkingAltarDraft';
export const LOCAL_CUSTOM_CABINET_KEY = 'saltAndSovereigntyCustomCabinetItems';

/** getSavedAltars(): a cloud row becomes altar_data plus id, name and dates. */
export function altarFromRow(row: SavedAltarRow): SavedAltar {
  return {
    ...(row.altar_data || {}),
    id: row.id,
    name: row.name,
    savedAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

/** getLocalSavedAltars(): the stored value may be an array or one altar. */
export function parseLocalAltars(raw: string | null): SavedAltar[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return list.filter((a) => a && typeof a === 'object') as SavedAltar[];
  } catch {
    return [];
  }
}

/** The editable part of an altar: what createAltarSnapshot() captures. */
export type AltarDocument = {
  background: string;
  backgroundName: string;
  groups: NonNullable<AltarData['groups']>;
  activeGroupId: string | null;
  objects: SavedObject[];
  /** Any other top-level fields from the original altar_data, kept as-is. */
  extra: Record<string, unknown>;
};

const SNAPSHOT_KEYS = new Set(['name', 'savedAt', 'background', 'backgroundName', 'groups', 'activeGroupId', 'objects']);
/** Fields getSavedAltars() adds on top of altar_data; never written back into it. */
const ROW_KEYS = new Set(['id', 'updatedAt']);

export function documentFromAltar(altar: AltarData | null | undefined): AltarDocument {
  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(altar ?? {})) {
    if (!SNAPSHOT_KEYS.has(key) && !ROW_KEYS.has(key)) extra[key] = value;
  }
  return {
    background: typeof altar?.background === 'string' ? altar.background : '',
    backgroundName: typeof altar?.backgroundName === 'string' ? altar.backgroundName : '',
    groups: Array.isArray(altar?.groups) ? altar!.groups! : [],
    activeGroupId: altar?.activeGroupId ?? null,
    objects: Array.isArray(altar?.objects) ? altar!.objects!.filter((o) => o && typeof o === 'object') : [],
    extra,
  };
}

export function emptyDocument(): AltarDocument {
  return { background: '', backgroundName: '', groups: [], activeGroupId: null, objects: [], extra: {} };
}

/** createAltarSnapshot(name): the value written to altar_data. */
export function altarDataFromDocument(doc: AltarDocument, name: string, savedAt: string): AltarData {
  return {
    ...doc.extra,
    name,
    savedAt,
    background: doc.background,
    backgroundName: doc.backgroundName,
    groups: doc.groups,
    activeGroupId: doc.activeGroupId,
    objects: doc.objects,
  };
}

/** A new guest save, as saveAltar() unshifts it into localStorage. */
export function localSave(data: AltarData, id: string = newId()): SavedAltar {
  return { id, ...data, name: data.name || 'My Altar' };
}

/** The working draft the website keeps in localStorage between visits. */
export function draftFromDocument(doc: AltarDocument, savedAt: string): SavedAltar {
  return { ...altarDataFromDocument(doc, 'Working Altar', savedAt), id: 'working-draft', name: 'Working Altar' };
}

/** "3 items · 2 candles · 1 herb" (storage.js getSavedAltarSummary). */
export function altarSummary(altar: AltarData): string {
  const objects = Array.isArray(altar.objects) ? altar.objects : [];
  const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const candles = objects.filter((o) => o.type === 'candle').length;
  const herbs = objects.filter((o) => o.type === 'herb' || o.type === 'oil').length;
  const crystals = objects.filter((o) => o.type === 'crystal').length;
  const pieces = [count(objects.length, 'item')];
  if (candles) pieces.push(count(candles, 'candle'));
  if (herbs) pieces.push(count(herbs, 'herb'));
  if (crystals) pieces.push(count(crystals, 'crystal'));
  return pieces.join(' · ');
}

/** Newest first by last change, like the website's list (created_at desc). */
export function sortAltars(altars: SavedAltar[]): SavedAltar[] {
  const time = (a: SavedAltar) => Date.parse(a.updatedAt || a.savedAt || '') || 0;
  return [...altars].sort((a, b) => time(b) - time(a));
}
