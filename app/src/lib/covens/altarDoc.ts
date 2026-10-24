// A coven altar as rows and as one document: the altar editor works on an
// AltarDocument, and the coven keeps the scene in coven_altars and each object
// in coven_altar_objects. Pure, so it can be tested (altarSync.ts does the
// talking to the database).

import type { AltarDocument } from '../altar/snapshot.ts';
import type { SavedObject } from '../altar/types.ts';
import { newId } from '../altar/uid.ts';

export type CovenAltar = {
  id: string;
  coven_id: string;
  name: string;
  is_main: boolean;
  edit_mode: 'members' | 'chosen' | 'keeper';
  locked: boolean;
  background: string;
  background_name: string;
  groups: AltarDocument['groups'];
  active_group_id: string | null;
  extra: Record<string, unknown>;
  archived_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AltarEditor = { id: string; altar_id: string; coven_id: string; user_id: string | null; rank_id: string | null; active: boolean };

export type AltarAccess = { can_edit: boolean; keeper: boolean; ritual_id: string | null; reason: string | null };

export const TEND_CHOICES = [
  { value: 'members', label: 'Everyone in the coven' },
  { value: 'chosen', label: 'People I choose' },
  { value: 'keeper', label: 'Only me' },
] as const;

/** Who tends an altar, in a few words. */
export function tendedBy(altar: Pick<CovenAltar, 'edit_mode' | 'locked' | 'is_main'>): string {
  if (altar.locked) return 'Locked by its keeper';
  if (altar.edit_mode === 'members') return 'Everyone tends it';
  if (altar.edit_mode === 'keeper') return 'Its keeper tends it';
  return altar.is_main ? 'Tended by those the coven’s head chooses' : 'Tended by those its keeper chooses';
}

/** The petition an altar was set up for, or ''. */
export const petitionOf = (altar: Pick<CovenAltar, 'extra'>) => (typeof altar.extra?.petition_id === 'string' ? altar.extra.petition_id : '');

export const sortAltars = (altars: CovenAltar[]) =>
  [...altars].sort((a, b) => Number(b.is_main) - Number(a.is_main) || (b.created_at > a.created_at ? 1 : b.created_at < a.created_at ? -1 : 0));


export type Scene = Pick<AltarDocument, 'background' | 'backgroundName' | 'groups' | 'activeGroupId' | 'extra'>;

export const sceneOf = (doc: Scene): Scene => ({
  background: doc.background,
  backgroundName: doc.backgroundName,
  groups: doc.groups,
  activeGroupId: doc.activeGroupId,
  extra: doc.extra,
});

export function sceneFromAltar(altar: CovenAltar): Scene {
  return {
    background: altar.background ?? '',
    backgroundName: altar.background_name ?? '',
    groups: Array.isArray(altar.groups) ? altar.groups : [],
    activeGroupId: altar.active_group_id ?? null,
    extra: altar.extra && typeof altar.extra === 'object' ? altar.extra : {},
  };
}

/** The key an object is kept under: its altarObjectId. */
export const keyOf = (object: SavedObject) => String(object.altarObjectId || '');

/** Rows in their order on the altar, as one document. */
export function documentFromRows(altar: CovenAltar, rows: { object_key: string; position: number; data: SavedObject }[]): AltarDocument {
  const objects = [...rows]
    .sort((a, b) => a.position - b.position)
    .map((row) => ({ ...row.data, altarObjectId: row.object_key }));
  return { ...sceneFromAltar(altar), objects };
}

/** Put one object in (in its place, or at the end), or take it out (null). Unchanged when it already matches. */
export function withObject(doc: AltarDocument, key: string, data: SavedObject | null): AltarDocument {
  const at = doc.objects.findIndex((o) => keyOf(o) === key);
  if (data == null) {
    if (at < 0) return doc;
    return { ...doc, objects: doc.objects.filter((_, i) => i !== at) };
  }
  const object = { ...data, altarObjectId: key };
  if (at >= 0) {
    if (JSON.stringify(doc.objects[at]) === JSON.stringify(object)) return doc;
    const objects = [...doc.objects];
    objects[at] = object;
    return { ...doc, objects };
  }
  return { ...doc, objects: [...doc.objects, object] };
}

export function withScene(doc: AltarDocument, scene: Scene): AltarDocument {
  return JSON.stringify(sceneOf(doc)) === JSON.stringify(scene) ? doc : { ...doc, ...scene };
}

export type Change = { kind: 'object'; key: string; data: SavedObject | null } | { kind: 'scene'; scene: Scene };

/**
 * What differs between the document and what's known to be saved: objects
 * added or changed, objects gone, and the scene. Objects without a key get one
 * (the editor gives every object an altarObjectId as it opens, so this is rare).
 */
export function diff(doc: AltarDocument, saved: Map<string, string>, savedScene: string): Change[] {
  const changes: Change[] = [];
  const seen = new Set<string>();
  for (const object of doc.objects) {
    const key = keyOf(object);
    if (!key) continue;
    seen.add(key);
    const json = JSON.stringify(object);
    if (saved.get(key) !== json) changes.push({ kind: 'object', key, data: object });
  }
  for (const key of saved.keys()) if (!seen.has(key)) changes.push({ kind: 'object', key, data: null });
  const scene = sceneOf(doc);
  if (JSON.stringify(scene) !== savedScene) changes.push({ kind: 'scene', scene });
  return changes;
}

/** Give any object without a key one, so it can be saved. */
export const keyed = (doc: AltarDocument): AltarDocument =>
  doc.objects.every(keyOf) ? doc : { ...doc, objects: doc.objects.map((o) => (keyOf(o) ? o : { ...o, altarObjectId: newId() })) };

