// The painted furniture each shelf tab is drawn on (assets/altar/shelves/),
// measured once: each plank's front edge (where things stand) and the inner
// sides of the uprights, as fractions of the painting. layoutShelf() sets a
// shelf's things out on those planks, wrapping from plank to plank and
// shrinking them a little to fit before starting another cabinet. Pure, so it
// can be tested; the website reaches it through js/core/shelves.js.

import { VESSELS, vesselForShelf, type VesselKind } from '../altar/vesselLabel.ts';

export type ShelfArtKey = 'crystal' | 'herb' | 'oil' | 'candle' | 'book' | 'wall';

export type ShelfArt = {
  key: ShelfArtKey;
  name: string;
  /** The painting, as the website writes art paths. */
  image: string;
  width: number;
  height: number;
  /** Each plank's front edge, top to bottom, as a fraction of the height. */
  planks: number[];
  /** The top of the opening above the first plank. */
  top: number;
  /** The inner sides of the uprights, as fractions of the width. */
  left: number;
  right: number;
  /** The part of the painting shown (the furniture and a little wall), as fractions of the width. */
  crop: [number, number];
};

const DIR = '../assets/altar/shelves/';
const art = (key: ShelfArtKey, name: string, planks: number[], top: number, left: number, right: number, crop: [number, number] = [0.13, 0.87]): ShelfArt => ({
  key,
  name,
  image: `${DIR}${key}-shelf.png`,
  width: 1680,
  height: 944,
  planks,
  top,
  left,
  right,
  crop,
});

/** Measured from the paintings (1680 × 944): front edges where the lit plank top meets its face. */
export const SHELF_ART: Record<ShelfArtKey, ShelfArt> = {
  crystal: art('crystal', 'Carved crystal shelves', [0.3633, 0.59, 0.8125, 0.985], 0.15, 0.2054, 0.7917),
  herb: art('herb', 'Apothecary cupboard', [0.3782, 0.5975, 0.8178, 0.985], 0.16, 0.2143, 0.7917),
  oil: art('oil', 'Bottle rack', [0.3771, 0.6112, 0.8369, 0.985], 0.16, 0.2018, 0.794),
  candle: art('candle', 'Candle shelf', [0.3655, 0.5911, 0.8136, 0.985], 0.15, 0.2054, 0.7935),
  book: art('book', 'Bookcase', [0.3655, 0.5911, 0.8136, 0.985], 0.15, 0.2054, 0.7923),
  wall: art('wall', 'Wall shelf', [0.3655, 0.59, 0.8125], 0.2, 0.175, 0.815, [0.11, 0.89]),
};

/** The furniture a shelf is painted as. */
export function shelfArtFor(shelf: string): ShelfArt {
  switch (shelf) {
    case 'crystals':
      return SHELF_ART.crystal;
    case 'herbs':
    case 'jars':
      return SHELF_ART.herb;
    case 'oils':
      return SHELF_ART.oil;
    case 'candles':
      return SHELF_ART.candle;
    case 'books':
    case 'decks':
      return SHELF_ART.book;
    default:
      return SHELF_ART.wall;
  }
}

/** A thing to stand on a plank: its height / width, and how tall it is against the room above the plank (0–1). */
export type ShelfThing = { ratio: number; size: number };

// Own pictures are shown contained in a box of this shape, standing on its floor.
const ART_BOX: Record<string, ShelfThing> = {
  crystals: { ratio: 0.85, size: 0.64 },
  candles: { ratio: 1.25, size: 0.74 },
  statues: { ratio: 1.3, size: 0.86 },
  tools: { ratio: 1.1, size: 0.72 },
  jars: { ratio: 1.3, size: 0.7 },
  other: { ratio: 1, size: 0.68 },
};
const VESSEL_SIZE: Record<VesselKind, number> = { jar: 0.74, dropper: 0.72, bottle: 0.76, deck: 0.62, book: 0.88 };

/** How a thing on a shelf stands: its container's shape, or its own picture's box. */
export function shelfThing(item: { shelf: string; name: string }): ShelfThing & { vessel: VesselKind | null } {
  const vessel = vesselForShelf(item.shelf, item.name);
  if (vessel) return { vessel, ratio: VESSELS[vessel].ratio, size: VESSEL_SIZE[vessel] };
  return { vessel: null, ...(ART_BOX[item.shelf] ?? ART_BOX.other) };
}

/** Where one thing stands: its index in the list, plank, centre x and base y, and size, as fractions of the whole painting. */
export type Placement = { index: number; plank: number; x: number; y: number; w: number; h: number };

// A few things stand a little larger; a full shelf shrinks to 60% before another cabinet starts.
const SCALES = [1.25, 1.1, 1, 0.9, 0.8, 0.7, 0.6];

/** Things from `start` set out on one cabinet at scale `s`: as many as fit, each plank's row centred. */
function fill(a: ShelfArt, things: ShelfThing[], start: number, s: number): Placement[] {
  const W = a.width;
  const H = a.height;
  const left = a.left * W;
  const right = a.right * W;
  const inner = right - left;
  const out: Placement[] = [];
  let i = start;
  a.planks.forEach((edge, p) => {
    const room = (edge - (p === 0 ? a.top : a.planks[p - 1])) * H;
    const gap = room * 0.07 * s;
    const pad = room * 0.08;
    const row: Placement[] = [];
    let x = left + pad;
    while (i < things.length) {
      const t = things[i];
      let h = room * Math.min(Math.max(t.size, 0.1), 0.95) * s;
      let w = h / (t.ratio > 0 ? t.ratio : 1);
      if (w > inner - pad * 2) {
        w = inner - pad * 2;
        h = w * t.ratio;
      }
      if (row.length && x + w > right - pad) break;
      row.push({ index: i, plank: p, x: x + w / 2, y: edge * H, w, h });
      x += w + gap;
      i += 1;
    }
    // Centre the row between the uprights.
    const used = x - gap - (left + pad);
    const shift = row.length ? (inner - pad * 2 - used) / 2 : 0;
    for (const r of row) out.push({ ...r, x: (r.x + shift) / W, y: r.y / H, w: r.w / W, h: r.h / H });
  });
  return out;
}

/**
 * The things set out on their furniture: one cabinet if they fit (from a little larger, shrinking
 * them down to 60% first), else as many cabinets of the same furniture as
 * they need, each filled plank by plank. Placements are fractions of the
 * painting; index is the thing's place in `things`.
 */
export function layoutShelf(a: ShelfArt, things: ShelfThing[]): Placement[][] {
  if (!things.length) return [[]];
  for (const s of SCALES) {
    const one = fill(a, things, 0, s);
    if (one.length === things.length) return [one];
  }
  const s = SCALES[SCALES.length - 1];
  const cabinets: Placement[][] = [];
  let start = 0;
  while (start < things.length) {
    const next = fill(a, things, start, s);
    if (!next.length) break;
    cabinets.push(next);
    start = next[next.length - 1].index + 1;
  }
  return cabinets;
}

/** A placement in pixels on the painting drawn `viewWidth` wide (its crop filling the width): left/top of the thing's box. */
export function toView(a: ShelfArt, p: Placement, viewWidth: number) {
  const span = a.crop[1] - a.crop[0];
  const k = viewWidth / (span * a.width);
  const w = p.w * a.width * k;
  const h = p.h * a.height * k;
  return { left: (p.x - a.crop[0]) * a.width * k - w / 2, top: p.y * a.height * k - h, width: w, height: h };
}

/** The height of the painting drawn `viewWidth` wide, and how far left it is moved so its crop fills the width. */
export function viewOf(a: ShelfArt, viewWidth: number) {
  const span = a.crop[1] - a.crop[0];
  const imageWidth = viewWidth / span;
  return { imageWidth, height: (imageWidth * a.height) / a.width, offset: -a.crop[0] * imageWidth };
}
