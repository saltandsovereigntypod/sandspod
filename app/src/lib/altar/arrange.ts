// Arranging with meaning: while an object is dragged near one of the altar's
// meaningful spots (the four directions and the centre, where reading/
// layouts.ts would stand things), it can settle onto it; and a pair of like
// things can be mirrored across the altar's middle. Pure: positions are the
// stage fractions editor.moveObject takes.

import { boxHeightFraction, displayBox, objectSize, rotationOf, STAGE_ASPECT, withCenter, withRotation, withSize } from './geometry.ts';
import { MEANING_SPOTS, standOn } from './reading/layouts.ts';
import type { SavedObject } from './types.ts';

/** How near (in stage widths) a dragged object's centre must come to a spot to settle on it. */
export const SNAP_RADIUS = 0.035;

export type Snap = {
  /** Where the object's visual centre goes. */
  cx: number;
  cy: number;
  /** The spot itself, where its feet stand, for the guide drawn on the stage. */
  footX: number;
  footY: number;
  /** "North · Earth", "Centre". */
  role: string;
};

/** Distance between two stage points, in stage widths (heights are shorter by the stage's aspect). */
const distance = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, (ay - by) / STAGE_ASPECT);

/**
 * The meaningful spot a dragged object is near enough to settle on, or null.
 * Cloths and locked things never snap.
 */
export function snapToMeaning(object: SavedObject, cx: number, cy: number, background?: string | null, radius = SNAP_RADIUS): Snap | null {
  if (!object || object.type === 'cloth' || object.locked === 'true') return null;
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  let best: Snap | null = null;
  let bestDistance = radius;
  for (const spot of MEANING_SPOTS) {
    const at = standOn(object, spot, background);
    const d = distance(cx, cy, at.cx, at.cy);
    if (d <= bestDistance) {
      bestDistance = d;
      best = { cx: at.cx, cy: at.cy, footX: at.footX, footY: at.footY, role: at.role };
    }
  }
  return best;
}

/** What makes two things a pair: the same picture, or the same kind and colour or name. */
function sameKind(a: SavedObject, b: SavedObject): boolean {
  if (!a || !b || a.type !== b.type) return false;
  if (a.imagePath && a.imagePath === b.imagePath) return true;
  const key = (o: SavedObject) => [o.type, o.form, o.color, o.herb, o.crystal, o.tool, o.vessel, o.deity].map((v) => String(v ?? '')).join('|');
  return key(a) === key(b) && key(a).replace(/\|/g, '') !== String(a.type ?? '');
}

/**
 * The other half of a pair for the object at `index`: another of the same
 * kind, the one nearest where its mirror image would stand. Null when the
 * object has no twin on the altar, or it is a cloth or locked.
 */
export function mirrorPartner(objects: SavedObject[], index: number): number | null {
  const object = objects[index];
  if (!object || object.type === 'cloth') return null;
  const box = displayBox(object);
  const target = { cx: 1 - box.cx, cy: box.cy };
  let best: number | null = null;
  let bestDistance = Infinity;
  objects.forEach((other, i) => {
    if (i === index || other.locked === 'true' || !sameKind(object, other)) return;
    const b = displayBox(other);
    const d = distance(b.cx, b.cy, target.cx, target.cy);
    if (d < bestDistance) {
      bestDistance = d;
      best = i;
    }
  });
  return best;
}

/**
 * Mirror the pair: the partner moves to the selected object's mirror image
 * across the altar's middle, at the same size and height, turned the other
 * way and facing the other way. Returns the new objects, or null when there is
 * no partner.
 */
export function mirrorPair(objects: SavedObject[], index: number): { objects: SavedObject[]; partner: number } | null {
  const partner = mirrorPartner(objects, index);
  if (partner == null) return null;
  const source = objects[index];
  const box = displayBox(source);
  let moved = withSize(objects[partner], objectSize(source));
  // Stand it on the same line: its feet where the source's feet are.
  const feet = box.cy + boxHeightFraction(box) / 2;
  const height = boxHeightFraction(displayBox(moved));
  moved = withCenter(moved, 1 - box.cx, feet - height / 2);
  moved = withRotation(moved, -rotationOf(source));
  moved = { ...moved, flipped: source.flipped === 'true' ? 'false' : 'true' };
  return { objects: objects.map((o, i) => (i === partner ? moved : o)), partner };
}

/** Whether an object sits on the altar's middle line, where mirroring would put its twin on top of it. */
export const onCentreLine = (object: SavedObject) => Math.abs(displayBox(object).cx - 0.5) < 0.02;
