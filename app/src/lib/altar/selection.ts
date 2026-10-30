// Several things on the altar chosen at once (the altar's Select mode, and the
// website's Select pieces): choosing one of a group chooses the whole group;
// what's chosen moves together, keeping where each stands to the others and
// staying on the altar; and it can be deleted, grouped, layered, lit or
// snuffed in one step (one undo). Objects are addressed by their index in
// `objects`, as in editor.ts. Pure.

import { clampBox, displayBox, withCenter, boxHeightFraction, type Box } from './geometry.ts';
import { BASE_LAYER, stackOrder } from './layers.ts';
import { isCandle, lightCandle, snuffCandle } from './livingState.ts';
import { withoutCordsFor } from './cord.ts';
import type { AltarDocument } from './snapshot.ts';
import type { SavedObject } from './types.ts';

const isLocked = (object: SavedObject | undefined) => object?.locked === 'true';

/** The indices that are on the altar, once each, in altar order. */
export function cleanSelection(doc: AltarDocument, indices: number[]): number[] {
  return [...new Set(indices)].filter((i) => Number.isInteger(i) && !!doc.objects[i]).sort((a, b) => a - b);
}

/** The selection with every member of any group in it (choosing one of a group chooses the group). */
export function withGroups(doc: AltarDocument, indices: number[]): number[] {
  const chosen = cleanSelection(doc, indices);
  const groups = new Set(chosen.map((i) => doc.objects[i].groupId).filter((g): g is string => !!g));
  if (!groups.size) return chosen;
  return cleanSelection(doc, [...chosen, ...doc.objects.map((o, i) => (o.groupId && groups.has(o.groupId) ? i : -1))]);
}

/** A tap in Select mode: the object (with its group) joins the selection, or leaves it. */
export function toggleSelection(doc: AltarDocument, selection: number[], index: number): number[] {
  if (!doc.objects[index]) return cleanSelection(doc, selection);
  const these = withGroups(doc, [index]);
  const current = cleanSelection(doc, selection);
  return current.includes(index) ? current.filter((i) => !these.includes(i)) : cleanSelection(doc, [...current, ...these]);
}

export const selectAll = (doc: AltarDocument): number[] => doc.objects.map((_, i) => i);

/** The selection kept by id, so it survives changes that shift indices (another member's edit on a coven altar). */
export const idsOf = (doc: AltarDocument, indices: number[]): string[] =>
  cleanSelection(doc, indices).map((i) => String(doc.objects[i].altarObjectId || '')).filter(Boolean);

export const indicesOf = (doc: AltarDocument, ids: string[]): number[] =>
  cleanSelection(doc, ids.map((id) => doc.objects.findIndex((o) => o.altarObjectId === id)));

/** Where each box may go, as the stage allows it (geometry.clampBox's drag limits). */
function moveRange(box: Box, type: string | undefined): { x: [number, number]; y: [number, number] } {
  const w = box.size;
  const h = boxHeightFraction(box);
  if (type === 'cloth') return { x: [-w * 0.75 - box.cx, 1 - w * 0.25 - box.cx], y: [-h * 0.75 - box.cy, 1 - h * 0.25 - box.cy] };
  return { x: [w / 2 - box.cx, 1 - w / 2 - box.cx], y: [h / 2 - box.cy, 1 - h / 2 - box.cy] };
}

const clampTo = (value: number, [lo, hi]: [number, number]) => (lo > hi ? 0 : Math.max(lo, Math.min(hi, value)));

/**
 * How far these boxes can move together (dx of stage width, dy of stage
 * height) with every one of them still on the altar: the move is shortened,
 * never shared out unevenly, so they keep their places to one another.
 */
export function clampMove(boxes: { box: Box; type?: string }[], dx: number, dy: number): { dx: number; dy: number } {
  if (!boxes.length) return { dx: 0, dy: 0 };
  let x: [number, number] = [-Infinity, Infinity];
  let y: [number, number] = [-Infinity, Infinity];
  for (const { box, type } of boxes) {
    const r = moveRange(box, type);
    x = [Math.max(x[0], Math.min(0, r.x[0])), Math.min(x[1], Math.max(0, r.x[1]))];
    y = [Math.max(y[0], Math.min(0, r.y[0])), Math.min(y[1], Math.max(0, r.y[1]))];
  }
  return { dx: clampTo(dx, x), dy: clampTo(dy, y) };
}

/** Move the chosen objects together by (dx, dy); locked ones stay where they are. */
export function moveTogether(doc: AltarDocument, indices: number[], dx: number, dy: number): AltarDocument {
  const moving = cleanSelection(doc, indices).filter((i) => !isLocked(doc.objects[i]));
  if (!moving.length || (!dx && !dy)) return doc;
  const boxes = moving.map((i) => ({ box: displayBox(doc.objects[i]), type: doc.objects[i].type }));
  const move = clampMove(boxes, dx, dy);
  if (!move.dx && !move.dy) return doc;
  const updates = new Map<number, SavedObject>();
  moving.forEach((i, k) => {
    const box = boxes[k].box;
    // Already inside, so withCenter's own clamp leaves it where it's put.
    const placed = clampBox({ ...box, cx: box.cx + move.dx, cy: box.cy + move.dy }, doc.objects[i].type, 'drag');
    updates.set(i, withCenter(doc.objects[i], placed.cx, placed.cy));
  });
  return { ...doc, objects: doc.objects.map((o, i) => updates.get(i) ?? o) };
}

/**
 * Take the chosen objects off the altar in one step. A group left with fewer
 * than two members is no group at all, and a cord tied to a candle that's
 * gone is untied.
 */
export function removeObjects(doc: AltarDocument, indices: number[]): AltarDocument {
  const gone = new Set(cleanSelection(doc, indices));
  if (!gone.size) return doc;
  const goneIds = [...gone].map((i) => String(doc.objects[i].altarObjectId || '')).filter(Boolean);
  let objects = doc.objects.filter((_, i) => !gone.has(i));
  const counts = new Map<string, number>();
  for (const o of objects) if (o.groupId) counts.set(o.groupId, (counts.get(o.groupId) ?? 0) + 1);
  const live = new Set([...counts].filter(([, n]) => n > 1).map(([id]) => id));
  objects = objects.map((o) => {
    if (!o.groupId || live.has(o.groupId)) return o;
    const { groupId: _, ...rest } = o;
    return rest as SavedObject;
  });
  const groups = doc.groups
    .filter((g) => live.has(g.id))
    .map((g) => ({ ...g, objectIds: (Array.isArray(g.objectIds) ? (g.objectIds as string[]) : []).filter((id) => !goneIds.includes(id)) }));
  const activeGroupId = doc.activeGroupId && live.has(doc.activeGroupId) ? doc.activeGroupId : (groups[0]?.id ?? null);
  return withoutCordsFor({ ...doc, objects, groups, activeGroupId }, goneIds);
}

/** The groups the chosen objects belong to. */
export function groupsIn(doc: AltarDocument, indices: number[]): string[] {
  return [...new Set(cleanSelection(doc, indices).map((i) => doc.objects[i].groupId).filter((g): g is string => !!g))];
}

/** Bring the chosen objects to the front (or send them to the back), keeping their order among themselves. */
export function layerTogether(doc: AltarDocument, indices: number[], to: 'front' | 'back'): AltarDocument {
  const chosen = new Set(cleanSelection(doc, indices));
  if (!chosen.size) return doc;
  const order = stackOrder(doc.objects);
  const rest = order.filter((i) => !chosen.has(i));
  const picked = order.filter((i) => chosen.has(i));
  const next = to === 'front' ? [...rest, ...picked] : [...picked, ...rest];
  const layer = new Map(next.map((index, position) => [index, String(BASE_LAYER + position)]));
  const objects = doc.objects.map((o, i) => (o.zIndex === layer.get(i) ? o : { ...o, zIndex: layer.get(i) }));
  return objects.every((o, i) => o === doc.objects[i]) ? doc : { ...doc, objects };
}

/** Light (or snuff) the chosen candles; anything else chosen is left as it is. */
export function lightTogether(doc: AltarDocument, indices: number[], light: boolean, now: string): AltarDocument {
  const chosen = new Set(cleanSelection(doc, indices));
  const objects = doc.objects.map((o, i) => (chosen.has(i) && isCandle(o) ? (light ? lightCandle(o, now) : snuffCandle(o, now)) : o));
  return objects.every((o, i) => o === doc.objects[i]) ? doc : { ...doc, objects };
}

/** Lock (or unlock) the chosen objects in place. */
export function lockTogether(doc: AltarDocument, indices: number[], lock: boolean): AltarDocument {
  const chosen = new Set(cleanSelection(doc, indices));
  const value = lock ? 'true' : 'false';
  const objects = doc.objects.map((o, i) => (chosen.has(i) && (o.locked ?? 'false') !== value ? { ...o, locked: value } : o));
  return objects.every((o, i) => o === doc.objects[i]) ? doc : { ...doc, objects };
}

/** A few words for what's chosen ("3 things", "2 candles and a bowl" is more than it needs). */
export function selectionWords(count: number): string {
  return count === 1 ? '1 thing' : `${count} things`;
}
