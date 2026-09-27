// Coordinate mapping between the website's saved altar JSON and a stage of
// any size on the phone.
//
// How the website lays out an object (altar/js/core/storage.js, objects.js,
// altar.css):
//   - The stage is always 16:9 (`.altar-stage { aspect-ratio: 16 / 9 }`).
//   - Each object is a <button> 80px wide (`width: 80px; aspect-ratio: 1`)
//     holding an <img> at `width: 100%; height: 100%; object-fit: contain`.
//     The browser's default button padding (1px 6px) leaves a 68px-wide content
//     box, and because the image's height is a percentage of an auto height it
//     sizes from its natural ratio: a tall image makes the button taller than
//     80px (a 500x1536 candle gives 68 * 3.072 + 2 = 211px). Measured in
//     Chromium: candle 80x211, deity statue 80x104, sprig 80x138, key 80x80.
//     See boxAspect().
//   - It is positioned with style.left/top and
//     `transform: translate(-50%, -50%) rotate(r) scale(s) scaleX(flip)`, so
//     style.left/top is the object's visual centre and its visual size is
//     (80 * s) wide by (offsetHeight * s) tall.
//   - When saving it stores
//       leftPercent = (left + visualWidth / 2) / stageWidth
//       topPercent  = (top  + visualHeight / 2) / stageHeight
//       sizePercent = visualWidth / stageWidth
//     i.e. a point half a box right of and below the centre, not the centre.
//   - When loading it sets visualWidth = sizePercent * stageWidth and
//     left = leftPercent * stageWidth - visualWidth / 2 (top likewise with the
//     visual height), which undoes the offset, then clamps the object inside
//     the stage.
//
// Everything is proportional to the stage width, so the same numbers give the
// same picture at any size. The app works in "box" terms: centre as fractions
// of stage width / height, width as a fraction of stage width, and the box's
// height / width ratio.

import type { SavedObject } from './types.ts';

/** Stage width / height, fixed by the website's CSS. */
export const STAGE_ASPECT = 16 / 9;

/** The website's object box before scaling, in CSS px. */
export const WEB_OBJECT_BOX = 80;

/**
 * The stage width the website sizes new objects against
 * (placeObject: scale = clamp(stageWidth / 900, 0.75, 1.35)). Used only for
 * saves that predate sizePercent, and to translate the website's scale limits.
 */
export const WEB_REFERENCE_WIDTH = 900;

/** Default side of a newly placed object: the website's 80px at scale 1 on a 900px stage. */
export const NEW_OBJECT_SIZE = WEB_OBJECT_BOX / WEB_REFERENCE_WIDTH;
/** New cloths start at scale 3 on the website. */
export const NEW_CLOTH_SIZE = (WEB_OBJECT_BOX * 3) / WEB_REFERENCE_WIDTH;

/** The browser's default <button> padding around the image: 6px left/right, 1px top/bottom. */
const BUTTON_PAD_X = 6;
const BUTTON_PAD_Y = 1;

export type Box = {
  /** Visual centre x as a fraction of stage width. */
  cx: number;
  /** Visual centre y as a fraction of stage height. */
  cy: number;
  /** Visual width as a fraction of stage width. */
  size: number;
  /** Box height / width (1 for square boxes). */
  aspect: number;
};

/**
 * Height / width of the website's object box for an image whose natural
 * height / width is `imageRatio`: max(80, round(68 * ratio + 2)) / 80.
 */
export function boxAspect(imageRatio: number | null | undefined): number {
  if (!imageRatio || !Number.isFinite(imageRatio) || imageRatio <= 0) return 1;
  const contentWidth = WEB_OBJECT_BOX - BUTTON_PAD_X * 2;
  // offsetHeight, which the website's maths reads, is a whole number of pixels.
  return Math.max(WEB_OBJECT_BOX, Math.round(contentWidth * imageRatio + BUTTON_PAD_Y * 2)) / WEB_OBJECT_BOX;
}

/** The image's area inside the box (the button's content box), as fractions of the box. */
export const IMAGE_INSET = { x: BUTTON_PAD_X / WEB_OBJECT_BOX, y: BUTTON_PAD_Y / WEB_OBJECT_BOX } as const;

type RatioLookup = (imagePath: string) => number | null;
let ratioLookup: RatioLookup = () => null;

/**
 * Tell the geometry how to find an image's natural height / width. The app
 * registers the bundled artwork's sizes (and sizes of downloaded images);
 * unknown images count as square, like an image that hasn't loaded yet.
 */
export function setImageRatioLookup(lookup: RatioLookup) {
  ratioLookup = lookup;
}

/** Height / width of an object's box on the website. */
export function objectAspect(object: SavedObject): number {
  if (!object.imagePath) return 1;
  return boxAspect(ratioLookup(object.imagePath));
}

const num = (value: unknown): number | null => {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
};

/** Side as a fraction of stage width, with the website's fallback for old saves. */
export function objectSize(object: SavedObject): number {
  const size = num(object.sizePercent);
  if (size && size > 0) return size;
  const scale = num(object.scale) ?? 1;
  return (WEB_OBJECT_BOX * scale) / WEB_REFERENCE_WIDTH;
}

/** A box's height as a fraction of stage height. */
export function boxHeightFraction(box: Pick<Box, 'size' | 'aspect'>): number {
  return box.size * box.aspect * STAGE_ASPECT;
}

/** Read an object's visual box from its saved fields (before clamping). */
export function boxFromSaved(object: SavedObject, aspect: number = objectAspect(object)): Box {
  const size = objectSize(object);
  const left = num(object.leftPercent) ?? 0.5;
  const top = num(object.topPercent) ?? 0.5;
  const box = { size, aspect };
  return {
    cx: left - size / 2,
    cy: top - boxHeightFraction(box) / 2,
    size,
    aspect,
  };
}

/** The saved fields for a box, exactly as the website's getStagePositionPercent computes them. */
export function savedFromBox(box: Box): Pick<SavedObject, 'leftPercent' | 'topPercent' | 'sizePercent'> {
  return {
    leftPercent: box.cx + box.size / 2,
    topPercent: box.cy + boxHeightFraction(box) / 2,
    sizePercent: box.size,
  };
}

const clampLikeWebsite = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

/**
 * Keep an object on the stage the way the website does: ordinary objects stay
 * fully inside (keepObjectInsideStage); cloths may hang three quarters off any
 * edge (the pointermove rule for cloths) and are never clamped on load.
 */
export function clampBox(box: Box, type: string | undefined, mode: 'load' | 'drag' = 'drag'): Box {
  const w = box.size;
  const h = boxHeightFraction(box);
  if (type === 'cloth') {
    if (mode === 'load') return box;
    return {
      ...box,
      cx: clampLikeWebsite(box.cx, -w * 0.75, 1 - w * 0.25),
      cy: clampLikeWebsite(box.cy, -h * 0.75, 1 - h * 0.25),
    };
  }
  return {
    ...box,
    cx: clampLikeWebsite(box.cx, w / 2, 1 - w / 2),
    cy: clampLikeWebsite(box.cy, h / 2, 1 - h / 2),
  };
}

/** Where an object is drawn on screen, after the website's load-time clamp. */
export function displayBox(object: SavedObject): Box {
  return clampBox(boxFromSaved(object), object.type, 'load');
}

export type PixelRect = { left: number; top: number; width: number; height: number; centerX: number; centerY: number };

/** Convert a box to pixels on a stage `stageWidth` wide (height from the 16:9 aspect). */
export function boxToPixels(box: Box, stageWidth: number): PixelRect {
  const stageHeight = stageWidth / STAGE_ASPECT;
  const width = box.size * stageWidth;
  const height = width * box.aspect;
  const centerX = box.cx * stageWidth;
  const centerY = box.cy * stageHeight;
  return { left: centerX - width / 2, top: centerY - height / 2, width, height, centerX, centerY };
}

/** Size limits, translated from the website's scale limits in resizeObject. */
export function sizeLimits(type: string | undefined): { min: number; max: number } {
  const toSize = (scale: number) => (WEB_OBJECT_BOX * scale) / WEB_REFERENCE_WIDTH;
  const maxScale = type === 'cloth' ? 18 : 3;
  const minScale = type === 'candle' ? 0.18 : 0.35;
  return { min: toSize(minScale), max: toSize(maxScale) };
}

/** Move an object so its visual centre is at (cx, cy); nothing else changes. */
export function withCenter(object: SavedObject, cx: number, cy: number): SavedObject {
  const size = objectSize(object);
  const clamped = clampBox({ cx, cy, size, aspect: objectAspect(object) }, object.type, 'drag');
  return { ...object, ...savedFromBox(clamped) };
}

/**
 * Resize an object about its visual centre. `scale` changes in proportion so
 * the website's own scale field stays consistent with the new size.
 */
export function withSize(object: SavedObject, nextSize: number): SavedObject {
  const { min, max } = sizeLimits(object.type);
  const size = Math.max(min, Math.min(nextSize, max));
  const current = displayBox(object);
  const oldScale = num(object.scale) ?? (current.size * WEB_REFERENCE_WIDTH) / WEB_OBJECT_BOX;
  const scale = current.size > 0 ? oldScale * (size / current.size) : oldScale;
  const clamped = clampBox({ ...current, size }, object.type, 'drag');
  return { ...object, ...savedFromBox(clamped), scale: String(scale) };
}

export function rotationOf(object: SavedObject): number {
  return num(object.rotation) ?? 0;
}

export function withRotation(object: SavedObject, degrees: number): SavedObject {
  // Keep whole-ish numbers tidy; the website stores the running total as-is.
  const rounded = Math.round(degrees * 100) / 100;
  return { ...object, rotation: String(rounded) };
}

/** Radius of a lit candle's light pool, as a fraction of stage width (candles.js renderLighting). */
export function candleLightRadius(size: number): number {
  const scaleAtReference = (size * WEB_REFERENCE_WIDTH) / WEB_OBJECT_BOX;
  return Math.max(110, 170 * scaleAtReference) / WEB_REFERENCE_WIDTH;
}

/**
 * Find the topmost object under a point on the stage (pixels from the stage's
 * top-left). Objects are the website's boxes, rotated about their
 * centre. `minTouch` enlarges tiny objects' hit areas so they stay tappable.
 * `ordered` must be bottom-to-top (see layers.ts).
 */
export function hitTest<T extends { object: SavedObject }>(
  ordered: T[],
  x: number,
  y: number,
  stageWidth: number,
  minTouch = 0,
): T | null {
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    const entry = ordered[i];
    const rect = boxToPixels(displayBox(entry.object), stageWidth);
    const halfW = Math.max(rect.width, minTouch) / 2;
    const halfH = Math.max(rect.height, minTouch) / 2;
    const angle = (-rotationOf(entry.object) * Math.PI) / 180;
    const dx = x - rect.centerX;
    const dy = y - rect.centerY;
    const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const localY = dx * Math.sin(angle) + dy * Math.cos(angle);
    if (Math.abs(localX) <= halfW && Math.abs(localY) <= halfH) return entry;
  }
  return null;
}
