// Where a lit candle's flame (and the smoke when it is put out) sits in the
// object's box. The website draws them at fixed spots made for the vigil
// candles (altar.css .is-lit::before/::after, .is-extinguishing::after); the
// other forms have their wick elsewhere in the picture (a tea light's is down
// in its cup), so for those the same flame is moved onto the wick
// (ALTAR_ARTWORK.candleWicks, found by scripts/find-candle-wicks.py).
// js/altar-flame.js does the same on the website.

import { ALTAR_ARTWORK } from './artworkData.ts';
import { boxAspect, IMAGE_INSET } from './geometry.ts';

/** Percentages of the box: x of the flame's centre and widths of its width, tops and heights of its height. */
export type FlameLayout = {
  centerX: number;
  flameTop: number;
  flameHeight: number;
  haloTop: number;
  haloHeight: number;
  smokeTop: number;
  smokeHeight: number;
};

/** The website's fixed flame (altar.css). */
export const DEFAULT_FLAME: FlameLayout = {
  centerX: 50,
  flameTop: -5,
  flameHeight: 18,
  haloTop: -3,
  haloHeight: 10,
  smokeTop: -10,
  smokeHeight: 22,
};

/** The candle form a picture belongs to: "candles/<form>/<colour>-<form>.png". */
export function candleFormOf(imagePath: string | undefined | null): string | null {
  const match = /candles\/([a-z-]+)\/[^/]+$/i.exec(String(imagePath ?? ''));
  return match ? match[1].toLowerCase() : null;
}

/** Where a point of the picture lands in the box, in box widths (the picture is contained in the content box). */
function inBox(point: [number, number], imageRatio: number, aspect: number): { x: number; y: number } {
  const contentWidth = 1 - IMAGE_INSET.x * 2;
  const contentHeight = aspect - IMAGE_INSET.y * 2;
  const width = Math.min(contentWidth, contentHeight / imageRatio);
  const height = width * imageRatio;
  return {
    x: IMAGE_INSET.x + (contentWidth - width) / 2 + point[0] * width,
    y: IMAGE_INSET.y + (contentHeight - height) / 2 + point[1] * height,
  };
}

/**
 * Where the picture sits in its box (contained in the content box), as
 * fractions: left and width of the box's width, top and height of its height.
 */
export function pictureBox(imageRatio: number, aspect: number = boxAspect(imageRatio)): { left: number; top: number; width: number; height: number } {
  const origin = inBox([0, 0], imageRatio, aspect);
  const corner = inBox([1, 1], imageRatio, aspect);
  return { left: origin.x, top: origin.y / aspect, width: corner.x - origin.x, height: (corner.y - origin.y) / aspect };
}

/** The flame, glow and smoke moved down by `percent` of the box's height, onto a candle that has burned shorter. */
export function lowerFlame(layout: FlameLayout, percent: number): FlameLayout {
  if (!(percent > 0)) return layout;
  return { ...layout, flameTop: layout.flameTop + percent, haloTop: layout.haloTop + percent, smokeTop: layout.smokeTop + percent };
}

// The vigil candle the website's flame was drawn for (red-candle.png, 500 × 1536),
// and its wick tip, so the flame keeps the same size and the same place on a wick.
const VIGIL_RATIO = 1536 / 500;
const VIGIL_ASPECT = boxAspect(VIGIL_RATIO);
const VIGIL_WICK = inBox([0.508, 0.0534], VIGIL_RATIO, VIGIL_ASPECT);
const unit = (percent: number) => (percent / 100) * VIGIL_ASPECT;
/** How far below the wick tip the flame's box ends, in box widths. */
const BASE_BELOW_WICK = unit(DEFAULT_FLAME.flameTop + DEFAULT_FLAME.flameHeight) - VIGIL_WICK.y;

/**
 * The flame, glow and smoke for a candle picture. Pictures without a known
 * wick (the vigil candles, people's own photos) keep the website's spots.
 */
export function flameLayout(
  imagePath: string | undefined | null,
  imageRatio: number | null | undefined,
  wicks: Record<string, [number, number]> = ALTAR_ARTWORK.candleWicks,
): FlameLayout {
  const form = candleFormOf(imagePath);
  const wick = form ? wicks[form] : undefined;
  if (!wick || !imageRatio || !Number.isFinite(imageRatio) || imageRatio <= 0) return DEFAULT_FLAME;
  const aspect = boxAspect(imageRatio);
  const tip = inBox(wick, imageRatio, aspect);
  const base = tip.y + BASE_BELOW_WICK;
  const pct = (widths: number) => (widths / aspect) * 100;
  const flameHeight = unit(DEFAULT_FLAME.flameHeight);
  return {
    centerX: tip.x * 100,
    flameTop: pct(base - flameHeight),
    flameHeight: pct(flameHeight),
    haloTop: pct(base - unit(DEFAULT_FLAME.flameTop + DEFAULT_FLAME.flameHeight - DEFAULT_FLAME.haloTop)),
    haloHeight: pct(unit(DEFAULT_FLAME.haloHeight)),
    smokeTop: pct(base - unit(DEFAULT_FLAME.flameTop + DEFAULT_FLAME.flameHeight - DEFAULT_FLAME.smokeTop)),
    smokeHeight: pct(unit(DEFAULT_FLAME.smokeHeight)),
  };
}
