// Pure edits on an altar document, following the website's object actions
// (altar/js/features/objects.js, candles.js, object-actions.js). Every edit
// returns a new document; objects are addressed by their index in `objects`.

import { displayBox, objectSize, rotationOf, withCenter, withRotation, withSize } from './geometry.ts';
import { moveLayer, nextLayer, type LayerMove } from './layers.ts';
import { dressCandle, ensureLivingState, toggleLit, undressCandle } from './livingState.ts';
import type { AltarDocument } from './snapshot.ts';
import type { SavedObject } from './types.ts';
import { newId } from './uid.ts';

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
 * duplicateObject(): a copy offset down-right, on top, with its own id. A lit
 * copy starts its own burn now. The website offsets by 24px; we use the same
 * share of a 900px stage.
 */
export function duplicateObject(doc: AltarDocument, index: number, now: string): AltarDocument {
  const object = doc.objects[index];
  if (!object) return doc;
  const box = displayBox(object);
  const offset = 24 / 900;
  let copy: SavedObject = { ...object, altarObjectId: newId(), zIndex: String(nextLayer(doc.objects)) };
  if (copy.livingState && copy.lit === 'true') {
    try {
      const state = JSON.parse(copy.livingState);
      if (state?.candle?.currentBurnStartedAt) {
        state.candle.currentBurnStartedAt = now;
        state.candle.lastLitAt = now;
        copy.livingState = JSON.stringify(state);
      }
    } catch {
      // Unreadable state stays as it was.
    }
  }
  copy = withCenter({ ...copy, locked: object.locked }, box.cx + offset, box.cy + offset * (16 / 9));
  return addObject(doc, copy);
}

export function setBackground(doc: AltarDocument, background: string, backgroundName: string): AltarDocument {
  return { ...doc, background, backgroundName };
}
