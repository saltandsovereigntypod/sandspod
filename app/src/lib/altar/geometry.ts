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

/** An image's natural height / width, or null while it is unknown. */
export function imageRatio(path: string): number | null {
  return ratioLookup(path);
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
      // The website's rule is for the box's left/top edge (-¾ to stage − ¼ of
      // the box); cx/cy are its centre, so the same rule shifts by half a box.
      cx: clampLikeWebsite(box.cx, -w * 0.25, 1 + w * 0.25),
      cy: clampLikeWebsite(box.cy, -h * 0.25, 1 + h * 0.25),
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
  return clampBox(boxFromSaved(object), boundsType(object), 'load');
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

// Salt circles and salt rectangles: a line of salt (white, or black salt
// mixed with ash) laid around what's on the altar. They can grow past the
// altar's edges so the line frames all of it, are set down under everything
// else, and are hollow: only the line itself is touched, so a tap inside goes
// to whatever sits within it (hitTest here; altar/js/features/objects.js
// markSaltLine draws the same line as the website's touch area).

/** The tools that are salt borders. */
export const SALT_BORDER_TOOLS = ['salt-circle', 'black-salt-circle', 'salt-rectangle', 'black-salt-rectangle'] as const;

/** How wide a salt border may grow, as a fraction of the altar's width (twice the altar, so even a circle's line can frame it). */
export const SALT_BORDER_MAX_SIZE = 2;

export function isSaltBorder(object: Pick<SavedObject, 'type' | 'tool'>): boolean {
  return object.type === 'tool' && (SALT_BORDER_TOOLS as readonly string[]).includes(String(object.tool || ''));
}

/** How the stage holds an object when it moves: salt borders may hang off its edges as a cloth does. */
export function boundsType(object: Pick<SavedObject, 'type' | 'tool'>): string | undefined {
  return isSaltBorder(object) ? 'cloth' : object.type;
}

/** An object's size limits: its type's, but a salt border may span the whole altar. */
export function sizeLimitsOf(object: Pick<SavedObject, 'type' | 'tool'>): { min: number; max: number } {
  const limits = sizeLimits(object.type);
  return isSaltBorder(object) ? { min: limits.min, max: SALT_BORDER_MAX_SIZE } : limits;
}

/**
 * Where the salt lies in a border's picture, in fractions of the picture's
 * width and height: an ellipse (the painted circle, seen at a slant) whose
 * line runs `band` either side of its radius, or a rectangle whose line runs
 * `inset` in from each side (and `insetY` from the near and far edges), `band`
 * either side (fractions of the width). The rectangle is drawn in perspective,
 * as the altar table is: a flat rectangle `flat` (depth / width) deep is seen
 * with its far edge `taper` times as wide as its near edge, squeezed into a
 * picture `ratio` (height / width) tall; so its salt line is a trapezoid.
 */
export type SaltLine =
  | { kind: 'ellipse'; ratio: number; cx: number; cy: number; rx: number; ry: number; band: number }
  | { kind: 'rect'; ratio: number; flat: number; taper: number; inset: number; insetY: number; band: number };

const SALT_CIRCLE: SaltLine = { kind: 'ellipse', ratio: 1024 / 1536, cx: 0.507, cy: 0.613, rx: 0.335, ry: 0.162, band: 0.17 };
// Art script (make_salt.py): lines 0.03 of the width in (0.018 from the near and far edges), 0.0125 either side, a little more
// for the stray grains. Seen at the altar's angle: the picture is 0.32 (square) or 0.25 (altar-wide, the table top's own
// depth) as tall as wide, and its far edge 1 - 0.98 * that fraction of the near edge's width (0.755 for the table top).
const saltRect = (flat: number, ratio: number): SaltLine => ({ kind: 'rect', ratio, flat, taper: 1 - 0.98 * ratio, inset: 0.03, insetY: 0.018, band: 0.017 });

/** The salt line of a salt border, or null for anything else. */
export function saltLineOf(object: Pick<SavedObject, 'type' | 'tool' | 'form'>): SaltLine | null {
  if (!isSaltBorder(object)) return null;
  if (String(object.tool).endsWith('circle')) return SALT_CIRCLE;
  return object.form === 'altar' ? saltRect(9 / 16, 0.25) : saltRect(1, 0.32);
}

/**
 * Whether a point is on the salt line: (x, y) in px from the centre of the
 * picture as drawn `width` px wide, with `slack` px to spare either side so a
 * thin line is still easy to touch.
 */
export function onSaltLine(line: SaltLine, x: number, y: number, width: number, slack = 0): boolean {
  const height = width * line.ratio;
  if (line.kind === 'rect') {
    // Undo the perspective: back to the flat rectangle, then the distance to its line.
    const k = 1 / line.taper - 1;
    const scale = 1 - (1 - line.taper) * (1 - (y + height / 2) / height); // horizontal scale at this row
    if (scale <= 0) return false;
    const depth = line.flat * width;
    const fy = (depth * (1 / scale - 1)) / k - depth / 2; // flat distance from the middle (the near edge is at -depth / 2)
    const fx = x / scale;
    const hx = width / 2 - line.inset * width;
    const hy = depth / 2 - line.insetY * width;
    const ax = Math.abs(fx);
    const ay = Math.abs(fy);
    const sx = slack / scale;
    const sy = slack / (scale * (line.ratio / line.flat)); // the picture's depth is squeezed
    const reach = line.band * width;
    if (ax <= hx && ay <= hy) return Math.min(hx - ax, hy - ay) <= reach + Math.min(sx, sy);
    return Math.hypot(Math.max(ax - hx - sx, 0), Math.max(ay - hy - sy, 0)) <= reach;
  }
  const rx = line.rx * width;
  const ry = line.ry * height;
  const dx = x - (line.cx - 0.5) * width;
  const dy = y - (line.cy - 0.5) * height;
  const r = Math.hypot(dx / rx, dy / ry);
  if (r === 0) return false;
  // The ellipse's own radius in this direction, in px: how far off the line the point is, in px.
  const reach = Math.hypot(dx, dy) / r;
  return Math.abs(r - 1) * reach <= line.band * reach + slack;
}

/**
 * The salt line as an SVG path in a `1000` by `1000 * ratio` box, the line's
 * outer and inner edges together, to be filled even-odd (the website's touch
 * area for a salt border).
 */
export function saltLinePath(line: SaltLine): string {
  const w = 1000;
  const h = w * line.ratio;
  const f = (n: number) => String(Math.round(n * 10) / 10);
  if (line.kind === 'rect') {
    // The line's outer and inner edges, each a trapezoid: the far edge narrower, at the top.
    const depth = line.flat * w;
    const k = 1 / line.taper - 1;
    const corner = (fx: number, fy: number) => {
      const scale = 1 / (1 + (k * fy) / depth);
      return `${f(w / 2 + (fx - w / 2) * scale)} ${f(h * (1 - (1 - scale) / (1 - line.taper)))}`;
    };
    const trapezoid = (d: number) => {
      const ix = line.inset * w + d;
      const iy = line.insetY * w + d;
      return `M${corner(ix, depth - iy)}L${corner(w - ix, depth - iy)}L${corner(w - ix, iy)}L${corner(ix, iy)}Z`;
    };
    return trapezoid(-line.band * w) + trapezoid(line.band * w);
  }
  const ellipse = (k: number) => {
    const cx = line.cx * w;
    const cy = line.cy * h;
    const rx = line.rx * w * k;
    const ry = line.ry * h * k;
    return `M${f(cx - rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx + rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx - rx)} ${f(cy)}Z`;
  };
  return ellipse(1 + line.band) + ellipse(1 - line.band);
}

/** Move an object so its visual centre is at (cx, cy); nothing else changes. */
export function withCenter(object: SavedObject, cx: number, cy: number): SavedObject {
  const size = objectSize(object);
  const clamped = clampBox({ cx, cy, size, aspect: objectAspect(object) }, boundsType(object), 'drag');
  return { ...object, ...savedFromBox(clamped) };
}

/**
 * Resize an object about its visual centre. `scale` changes in proportion so
 * the website's own scale field stays consistent with the new size.
 */
export function withSize(object: SavedObject, nextSize: number): SavedObject {
  const { min, max } = sizeLimitsOf(object);
  const size = Math.max(min, Math.min(nextSize, max));
  const current = displayBox(object);
  const oldScale = num(object.scale) ?? (current.size * WEB_REFERENCE_WIDTH) / WEB_OBJECT_BOX;
  const scale = current.size > 0 ? oldScale * (size / current.size) : oldScale;
  const clamped = clampBox({ ...current, size }, boundsType(object), 'drag');
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
    if (Math.abs(localX) > halfW || Math.abs(localY) > halfH) continue;
    // A salt border is hollow: only its line is touched, and a tap inside goes to what's beneath.
    const line = saltLineOf(entry.object);
    if (line) {
      const contentW = rect.width * (1 - 2 * IMAGE_INSET.x);
      const contentH = rect.height - 2 * IMAGE_INSET.y * rect.width;
      const drawW = Math.min(contentW, contentH / line.ratio);
      const x = entry.object.flipped === 'true' ? -localX : localX;
      if (!onSaltLine(line, x, localY, drawW, Math.max(8, minTouch / 5))) continue;
    }
    return entry;
  }
  return null;
}
