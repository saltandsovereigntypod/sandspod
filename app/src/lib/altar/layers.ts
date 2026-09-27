// Layer order, matching how the browser stacks the website's altar objects:
// higher CSS z-index is on top, and equal z-index falls back to document order
// (later in the saved `objects` array is on top).

import type { SavedObject } from './types.ts';

/** The website starts its layer counter at 10 (state.js `highestLayer`). */
export const BASE_LAYER = 10;
/** sendBackward never goes below 5 on the website. */
export const MIN_LAYER = 5;

export function layerOf(object: SavedObject): number {
  const n = Number(object.zIndex);
  return Number.isFinite(n) && String(object.zIndex ?? '').trim() !== '' ? n : BASE_LAYER;
}

/** Indices of `objects` from bottom to top. */
export function stackOrder(objects: SavedObject[]): number[] {
  return objects
    .map((object, index) => ({ index, layer: layerOf(object) }))
    .sort((a, b) => a.layer - b.layer || a.index - b.index)
    .map((entry) => entry.index);
}

/** The next layer a newly placed object gets (website: ++highestLayer). */
export function nextLayer(objects: SavedObject[]): number {
  return objects.reduce((highest, object) => Math.max(highest, layerOf(object)), BASE_LAYER) + 1;
}

export type LayerMove = 'front' | 'forward' | 'backward' | 'back';

/**
 * Move one object in the stack. Returns a new array in the same order with
 * zIndex values rewritten so the stack is unambiguous (BASE_LAYER + position),
 * which the website then reads back identically. Array order is kept, because
 * it doubles as the tie-breaker and other website code relies on it.
 */
export function moveLayer(objects: SavedObject[], index: number, move: LayerMove): SavedObject[] {
  const order = stackOrder(objects);
  const from = order.indexOf(index);
  if (from === -1) return objects;
  let to = from;
  if (move === 'front') to = order.length - 1;
  if (move === 'back') to = 0;
  if (move === 'forward') to = Math.min(order.length - 1, from + 1);
  if (move === 'backward') to = Math.max(0, from - 1);
  if (to === from) return objects;

  const next = [...order];
  next.splice(from, 1);
  next.splice(to, 0, index);

  const result = [...objects];
  next.forEach((objectIndex, position) => {
    const zIndex = String(BASE_LAYER + position);
    if (result[objectIndex].zIndex !== zIndex) result[objectIndex] = { ...result[objectIndex], zIndex };
  });
  return result;
}
