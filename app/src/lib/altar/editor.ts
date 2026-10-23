// Pure edits on an altar document, following the website's object actions
// (altar/js/features/objects.js, candles.js, object-actions.js). Every edit
// returns a new document; objects are addressed by their index in `objects`.

import { displayBox, objectSize, rotationOf, withCenter, withRotation, withSize } from './geometry.ts';
import { moveLayer, nextLayer, type LayerMove } from './layers.ts';
import { apothecaryObject, refreshPlaced, type ApothecaryItem } from './apothecary.ts';
import {
  candleLife,
  carveCandle,
  dressCandle,
  ensureLivingState,
  freshCandle,
  lightCandle,
  parseLivingState,
  setApothecaryState,
  setAppState,
  setCandleLife,
  settleCandle,
  snuffCandle,
  toggleLit,
  uncarveCandle,
  undressCandle,
  writeLivingState,
  type ApothecaryState,
} from './livingState.ts';
import { incenseLife, incenseStateOf, isIncense, settleIncense } from './incense.ts';
import { chargeUnderMoons } from './moonCharge.ts';
import type { AltarDocument } from './snapshot.ts';
import type { SavedObject } from './types.ts';
import { newId } from './uid.ts';
import type { SigilMark } from '../sigil/sigil.ts';

const isTrue = (value: unknown) => value === 'true';
export const isLocked = (object: SavedObject) => isTrue(object.locked);

const replace = (doc: AltarDocument, updates: Map<number, SavedObject>): AltarDocument =>
  updates.size ? { ...doc, objects: doc.objects.map((o, i) => updates.get(i) ?? o) } : doc;

/** Indices that move together with `index` (its group, or just itself). */
export function groupIndices(doc: AltarDocument, index: number): number[] {
  const groupId = doc.objects[index]?.groupId;
  if (!groupId) return [index];
  return doc.objects.map((o, i) => (o.groupId === groupId ? i : -1)).filter((i) => i !== -1);
}

/** Give every object an altarObjectId and livingState, as the website does on load. */
export function prepareDocument(doc: AltarDocument, now: string): AltarDocument {
  return { ...doc, objects: doc.objects.map((o) => ensureLivingState(o, now)) };
}

/**
 * Drag: put the object's centre at (cx, cy) and move the rest of its group by
 * the same amount. Locked objects stay put (group members that are locked too).
 */
export function moveObject(doc: AltarDocument, index: number, cx: number, cy: number): AltarDocument {
  const object = doc.objects[index];
  if (!object || isLocked(object)) return doc;
  const start = displayBox(object);
  const moved = withCenter(object, cx, cy);
  const end = displayBox(moved);
  const dx = end.cx - start.cx;
  const dy = end.cy - start.cy;
  const updates = new Map<number, SavedObject>([[index, moved]]);
  for (const i of groupIndices(doc, index)) {
    if (i === index || isLocked(doc.objects[i])) continue;
    const box = displayBox(doc.objects[i]);
    updates.set(i, withCenter(doc.objects[i], box.cx + dx, box.cy + dy));
  }
  return replace(doc, updates);
}

/** Resize by a factor about each object's centre; groups resize together (resizeObject). */
export function resizeObject(doc: AltarDocument, index: number, factor: number): AltarDocument {
  const object = doc.objects[index];
  if (!object || isLocked(object) || !Number.isFinite(factor) || factor <= 0) return doc;
  const updates = new Map<number, SavedObject>();
  for (const i of groupIndices(doc, index)) {
    const item = doc.objects[i];
    if (isLocked(item)) continue;
    updates.set(i, withSize(item, objectSize(item) * factor));
  }
  return replace(doc, updates);
}

/** Set an object's size to an absolute value (used by pinch, from the size at gesture start). */
export function setObjectSize(doc: AltarDocument, index: number, size: number): AltarDocument {
  const object = doc.objects[index];
  if (!object || isLocked(object)) return doc;
  const current = objectSize(object);
  return current > 0 ? resizeObject(doc, index, size / current) : doc;
}

export function rotateObject(doc: AltarDocument, index: number, degrees: number): AltarDocument {
  const object = doc.objects[index];
  if (!object || isLocked(object)) return doc;
  return replace(doc, new Map([[index, withRotation(object, rotationOf(object) + degrees)]]));
}

export function setRotation(doc: AltarDocument, index: number, degrees: number): AltarDocument {
  const object = doc.objects[index];
  if (!object || isLocked(object)) return doc;
  return replace(doc, new Map([[index, withRotation(object, degrees)]]));
}

const toggle = (key: 'flipped' | 'locked' | 'glowing', respectLock: boolean) => (doc: AltarDocument, index: number) => {
  const object = doc.objects[index];
  if (!object || (respectLock && isLocked(object))) return doc;
  return replace(doc, new Map([[index, { ...object, [key]: isTrue(object[key]) ? 'false' : 'true' }]]));
};

export const flipObject = toggle('flipped', true);
export const toggleLock = toggle('locked', false);
export const toggleGlow = toggle('glowing', false);

export function toggleLight(doc: AltarDocument, index: number, now: string): AltarDocument {
  const object = doc.objects[index];
  if (!object) return doc;
  const next = toggleLit(object, now);
  return next === object ? doc : replace(doc, new Map([[index, next]]));
}

/**
 * A ritual step's candle action (ritual-automation.js executeRitualStepActions):
 * light_all lights every unlit candle, extinguish_all snuffs every lit one,
 * recording the burn. Unknown actions change nothing.
 */
export function applyCandleAction(doc: AltarDocument, action: string, now: string): AltarDocument {
  const change = action === 'light_all' ? lightCandle : action === 'extinguish_all' ? snuffCandle : null;
  if (!change) return doc;
  const updates = new Map<number, SavedObject>();
  doc.objects.forEach((object, index) => {
    const next = change(object, now);
    if (next !== object) updates.set(index, next);
  });
  return replace(doc, updates);
}

export function dressObject(doc: AltarDocument, candleIndex: number, ingredientIndex: number, now: string): AltarDocument {
  const candle = doc.objects[candleIndex];
  const ingredient = doc.objects[ingredientIndex];
  if (!candle || !ingredient) return doc;
  const next = dressCandle(candle, ingredient, now);
  return next === candle ? doc : replace(doc, new Map([[candleIndex, next]]));
}

export function undressObject(doc: AltarDocument, index: number, now: string): AltarDocument {
  const object = doc.objects[index];
  if (!object) return doc;
  const next = undressCandle(object, now);
  return next === object ? doc : replace(doc, new Map([[index, next]]));
}

export function carveObject(doc: AltarDocument, index: number, text: string, now: string, sigil?: SigilMark | null): AltarDocument {
  const object = doc.objects[index];
  if (!object) return doc;
  const next = carveCandle(object, text, now, sigil);
  return next === object ? doc : replace(doc, new Map([[index, next]]));
}

export function uncarveObject(doc: AltarDocument, index: number, now: string, carving?: number): AltarDocument {
  const object = doc.objects[index];
  if (!object) return doc;
  const next = uncarveCandle(object, now, carving);
  return next === object ? doc : replace(doc, new Map([[index, next]]));
}

export function changeLayer(doc: AltarDocument, index: number, move: LayerMove): AltarDocument {
  const objects = moveLayer(doc.objects, index, move);
  return objects === doc.objects ? doc : { ...doc, objects };
}

export function addObject(doc: AltarDocument, object: SavedObject): AltarDocument {
  return { ...doc, objects: [...doc.objects, object] };
}

export function removeObject(doc: AltarDocument, index: number): AltarDocument {
  if (!doc.objects[index]) return doc;
  return { ...doc, objects: doc.objects.filter((_, i) => i !== index) };
}

/**
 * duplicateObject(): a copy offset down-right, on top, with its own id. A
 * candle's copy is a fresh, unlit candle. The website offsets by 24px; we use the same
 * share of a 900px stage.
 */
export function duplicateObject(doc: AltarDocument, index: number, now: string): AltarDocument {
  const object = doc.objects[index];
  if (!object) return doc;
  const box = displayBox(object);
  const offset = 24 / 900;
  let copy: SavedObject = { ...object, altarObjectId: newId(), zIndex: String(nextLayer(doc.objects)) };
  if (copy.type === 'candle') {
    // A copy is a new candle: unlit, with its full life and none of the burns. Its dressings and carvings come along.
    const before = parseLivingState(object)?.candle;
    const fresh = freshCandle(copy, now);
    const state = parseLivingState(fresh);
    if (state?.candle) {
      const { replacesInstanceId: _replaces, ...candle } = state.candle;
      void _replaces;
      copy = writeLivingState(
        { ...fresh, altarObjectId: copy.altarObjectId, instanceId: object.instanceId || '' },
        { ...state, candle: { ...candle, dressings: before?.dressings ?? [], carvings: before?.carvings ?? [] } },
        now,
      );
    }
  }
  if (isIncense(copy) && incenseLife(copy).lit) {
    // A copy of burning incense is a fresh, unlit one of the same kind.
    const incense = { ...incenseStateOf(copy), litAt: '', status: 'unlit' as const, burnedMs: 0, burns: [] };
    copy = setAppState(copy, { incense }, now, false);
  }
  copy = withCenter({ ...copy, locked: object.locked }, box.cx + offset, box.cy + offset * (16 / 9));
  return addObject(doc, copy);
}

export function setBackground(doc: AltarDocument, background: string, backgroundName: string): AltarDocument {
  return { ...doc, background, backgroundName };
}

// ---------------------------------------------------------------- apothecary

/** Place a working from My Apothecary, in the middle of the altar's surface. */
export function placeApothecary(doc: AltarDocument, item: ApothecaryItem, now: string): AltarDocument {
  return addObject(doc, apothecaryObject(item, doc.objects, now));
}

/**
 * A working made from things on the altar takes their place: they're taken
 * off and the finished working is set where they stood (as the website does).
 */
export function replaceWithApothecary(doc: AltarDocument, indices: number[], item: ApothecaryItem, now: string): AltarDocument {
  const used = indices.filter((i) => doc.objects[i]);
  if (!used.length) return placeApothecary(doc, item, now);
  const boxes = used.map((i) => displayBox(doc.objects[i]));
  const center = { cx: boxes.reduce((s, b) => s + b.cx, 0) / boxes.length, cy: boxes.reduce((s, b) => s + b.cy, 0) / boxes.length };
  const remaining = doc.objects.filter((_, i) => !used.includes(i));
  return { ...doc, objects: [...remaining, apothecaryObject(item, remaining, now, center)] };
}

/** After a recipe changes, every placed copy shows the new name, picture and recipe. */
export function refreshApothecary(doc: AltarDocument, item: ApothecaryItem): AltarDocument {
  const updates = new Map<number, SavedObject>();
  doc.objects.forEach((object, i) => {
    const next = refreshPlaced(object, item);
    if (next !== object) updates.set(i, next);
  });
  return replace(doc, updates);
}

/** A deleted working leaves the altar too. */
export function removeApothecary(doc: AltarDocument, itemId: string): AltarDocument {
  const objects = doc.objects.filter((o) => o.apothecaryItemId !== itemId);
  return objects.length === doc.objects.length ? doc : { ...doc, objects };
}

/** Tend a placed working: activation, what's left, and its tending and review dates. */
export function tendApothecary(doc: AltarDocument, index: number, change: Partial<ApothecaryState>, now: string): AltarDocument {
  const object = doc.objects[index];
  if (!object) return doc;
  return replace(doc, new Map([[index, setApothecaryState(object, change, now)]]));
}

/** Light every candle on the altar (events.js light-all). */
export function lightAll(doc: AltarDocument, now: string): AltarDocument {
  const objects = doc.objects.map((o) => lightCandle(o, now));
  return objects.every((o, i) => o === doc.objects[i]) ? doc : { ...doc, objects };
}

/** Snuff every candle, recording each burn (events.js extinguish-all). */
export function snuffAll(doc: AltarDocument, now: string): AltarDocument {
  const objects = doc.objects.map((o) => snuffCandle(o, now));
  return objects.every((o, i) => o === doc.objects[i]) ? doc : { ...doc, objects };
}

/**
 * Candles whose life has run out go out, at the moment they would have, and
 * incense whose time is up burns down to ash. Unchanged docs come back as they were.
 */
export function settleCandles(doc: AltarDocument, now: string): AltarDocument {
  const objects = doc.objects.map((o) => settleIncense(settleCandle(o, now), now));
  return objects.every((o, i) => o === doc.objects[i]) ? doc : { ...doc, objects };
}

/**
 * Everything that happens to an altar while no one's looking: candles and
 * incense burn down, and crystals and moon water sitting there through a Full
 * Moon (and, if chosen, a New Moon) are charged under it, once per lunation.
 */
export function settleAltar(doc: AltarDocument, now: string, options: { newMoon?: boolean } = {}): AltarDocument {
  const burned = settleCandles(doc, now);
  const objects = burned.objects.map((o) => chargeUnderMoons(o, now, options));
  return objects.every((o, i) => o === burned.objects[i]) ? burned : { ...burned, objects };
}

/** The soonest moment a lit candle (or burning incense) on the altar runs out, or null. */
export function nextBurnout(doc: AltarDocument, now: Date = new Date()): number | null {
  let soonest: number | null = null;
  for (const object of doc.objects) {
    let at: number | null = null;
    if (object.type === 'candle' && object.lit === 'true') at = candleLife(object, now).burnoutAt;
    else if (isIncense(object)) at = incenseLife(object, now.getTime()).endsAt;
    if (at != null && (soonest == null || at < soonest)) soonest = at;
  }
  return soonest;
}

export function freshCandleAt(doc: AltarDocument, index: number, now: string): AltarDocument {
  const object = doc.objects[index];
  if (!object) return doc;
  const next = freshCandle(object, now);
  return next === object ? doc : replace(doc, new Map([[index, next]]));
}

export function setCandleLifeAt(doc: AltarDocument, index: number, ms: number, now: string): AltarDocument {
  const object = doc.objects[index];
  if (!object) return doc;
  const next = setCandleLife(object, ms, now);
  return next === object ? doc : replace(doc, new Map([[index, next]]));
}

/** Take everything off the altar, groups too (events.js clear-altar). */
export function clearAltar(doc: AltarDocument): AltarDocument {
  return { ...doc, objects: [], groups: [], activeGroupId: null };
}

/** Rename an object on this altar (object-actions.js Edit). */
export function renameObject(doc: AltarDocument, index: number, label: string): AltarDocument {
  const object = doc.objects[index];
  const name = label.trim();
  if (!object || !name || name === object.label) return doc;
  return replace(doc, new Map([[index, { ...object, label: name }]]));
}

/**
 * Group objects so they move together (groups.js createGroupFromSelection):
 * the group lists its members' altarObjectIds, and each member carries the
 * group's id. Objects already in another group move to this one.
 */
export function groupObjects(doc: AltarDocument, indices: number[], name: string, now: string): AltarDocument {
  const members = [...new Set(indices)].filter((i) => doc.objects[i]);
  if (members.length < 2) return doc;
  const id = `group-${newId()}`;
  const objects = doc.objects.map((o, i) => (members.includes(i) ? { ...ensureLivingState(o, now), groupId: id } : o));
  const objectIds = members.map((i) => objects[i].altarObjectId as string);
  const groups = doc.groups
    .map((g) => ({ ...g, objectIds: (Array.isArray(g.objectIds) ? (g.objectIds as string[]) : []).filter((oid) => !objectIds.includes(oid)) }))
    .filter((g) => g.objectIds.length > 1);
  // A group left with one member is no group at all.
  const live = new Set([id, ...groups.map((g) => g.id)]);
  const cleaned = objects.map((o) => {
    if (!o.groupId || live.has(o.groupId)) return o;
    const { groupId: _, ...rest } = o;
    return rest as SavedObject;
  });
  return { ...doc, objects: cleaned, groups: [...groups, { id, name: name.trim() || 'Ritual Working', createdAt: now, objectIds }], activeGroupId: id };
}

/** Undo a group: its objects stay where they are, free to move alone (ungroupCurrentItems). */
export function ungroup(doc: AltarDocument, groupId: string): AltarDocument {
  if (!groupId) return doc;
  const objects = doc.objects.map((o) => {
    if (o.groupId !== groupId) return o;
    const { groupId: _, ...rest } = o;
    return rest as SavedObject;
  });
  const groups = doc.groups.filter((g) => g.id !== groupId);
  return { ...doc, objects, groups, activeGroupId: groups[0]?.id ?? null };
}

/** The name of the group an object belongs to. */
export const groupName = (doc: AltarDocument, object: SavedObject | null | undefined) =>
  String((object?.groupId && doc.groups.find((g) => g.id === object.groupId)?.name) || '');

/** Apply a change to some objects (crystal care across several crystals, an offering on one deity). */
export function updateObjects(doc: AltarDocument, indices: number[], change: (object: SavedObject) => SavedObject): AltarDocument {
  const updates = new Map<number, SavedObject>();
  for (const i of indices) {
    const object = doc.objects[i];
    if (!object) continue;
    const next = change(object);
    if (next !== object) updates.set(i, next);
  }
  return replace(doc, updates);
}
