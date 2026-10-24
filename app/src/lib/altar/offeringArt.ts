// How an offering's age is drawn on the altar: the picture browning and
// dulling (a CSS filter on the web, the same colour matrix on the phone), a
// flower bowing its head and dropping a petal or two, liquid sinking in a
// bowl, dish, chalice or cauldron until only a tide line and a stain are
// left, food or flowers heaped in a vessel (a painted heap, clipped to its
// rim) going over in the same way, and a stick of incense burning down to a
// little ash; and a potted plant drooping and dulling for want of water
// (pottedPlants.ts), more gently than any offering.
// The app (AltarStage) and the website (living-art.js) both draw from this,
// in the object's box (the website's 80px button). Pure, so it can be tested.

import { ALTAR_ARTWORK } from './artworkData.ts';
import { pictureBox } from './flame.ts';
import { incenseFormOf, incenseLife, isIncense } from './incense.ts';
import { isPottedPlant, thirstLook } from './pottedPlants.ts';
import { agingLook, isOfferingItself, offeringFreshness, offeringOf, type OfferingKindId, type OfferingLook } from './offerings.ts';
import type { SavedObject } from './types.ts';

export type Ellipse = { cx: number; cy: number; rx: number; ry: number };

export type OfferingTint = OfferingLook['tint'];

export type OfferingArt = {
  /** The picture's colour (only when the object is the offering itself), or null. */
  tint: OfferingTint | null;
  /** Bowed and sagging from its foot (degrees; scale), or null. */
  bend: { rotate: number; scaleX: number; scaleY: number } | null;
  /** The surface of what's in the vessel, in box pixels. */
  liquid: (Ellipse & { color: string; deep: string; opacity: number; sheen: number }) | null;
  /** The line it was poured to, and the stain left when it's gone. */
  tide: (Ellipse & { color: string; opacity: number; stroke: number }) | null;
  stain: (Ellipse & { color: string; opacity: number }) | null;
  /** Fallen petals at its foot, in box pixels. */
  petals: (Ellipse & { rotate: number; color: string })[];
  /** Food or flowers heaped in the vessel, or null. */
  food: FoodInVessel | null;
};

/**
 * A heap of food or flowers in a vessel: its picture's place in the box (in
 * box pixels, already settled and sunk as it goes over), its colour, and the
 * outline it's clipped to (everything above the rim, and the mouth itself),
 * so the front of the rim hides its foot as it would a real heap.
 */
export type FoodInVessel = {
  id: FoodHeapId;
  image: string;
  left: number;
  top: number;
  width: number;
  height: number;
  tint: OfferingTint | null;
  /** The clip outline as an SVG path, in box pixels. */
  clip: string;
  /** The same outline's parts: the mouth (an ellipse) and the top of the clip. */
  mouth: Ellipse;
  clipTop: number;
};

// ── The vessels ──────────────────────────────────────────────────────────
// Where liquid sits in each built-in vessel's picture (fractions of the
// picture): its surface when full and when nearly gone. A chalice or a
// cauldron is seen from the side, so liquid sinking in it is soon hidden by
// the rim. Pictures of your own have no known shape and show no liquid.

type Mouth = { match: RegExp; ratio: number; full: Ellipse; empty: Ellipse; hiddenBelow: number };

const MOUTHS: Mouth[] = [
  { match: /\/vessels\/offering-bowl\//, ratio: 1024 / 1536, full: { cx: 0.5, cy: 0.355, rx: 0.31, ry: 0.115 }, empty: { cx: 0.5, cy: 0.42, rx: 0.15, ry: 0.05 }, hiddenBelow: 0 },
  { match: /\/vessels\/bowl\//, ratio: 1024 / 1536, full: { cx: 0.5, cy: 0.335, rx: 0.3, ry: 0.13 }, empty: { cx: 0.5, cy: 0.42, rx: 0.16, ry: 0.065 }, hiddenBelow: 0 },
  { match: /\/vessels\/dish\//, ratio: 1024 / 1536, full: { cx: 0.5, cy: 0.42, rx: 0.29, ry: 0.18 }, empty: { cx: 0.5, cy: 0.45, rx: 0.22, ry: 0.13 }, hiddenBelow: 0 },
  { match: /\/tools\/chalice\//, ratio: 1536 / 1024, full: { cx: 0.5, cy: 0.152, rx: 0.29, ry: 0.033 }, empty: { cx: 0.5, cy: 0.166, rx: 0.2, ry: 0.022 }, hiddenBelow: 0.35 },
  { match: /\/seasonal\/phiale\//, ratio: 1024 / 1536, full: { cx: 0.5, cy: 0.524, rx: 0.316, ry: 0.216 }, empty: { cx: 0.5, cy: 0.53, rx: 0.2, ry: 0.13 }, hiddenBelow: 0 },
  { match: /\/seasonal\/drinking-horn\//, ratio: 1024 / 1536, full: { cx: 0.713, cy: 0.259, rx: 0.112, ry: 0.078 }, empty: { cx: 0.72, cy: 0.285, rx: 0.07, ry: 0.048 }, hiddenBelow: 0 },
  { match: /\/vessels\/cauldron\//, ratio: 1200 / 1080, full: { cx: 0.5, cy: 0.43, rx: 0.34, ry: 0.045 }, empty: { cx: 0.5, cy: 0.44, rx: 0.26, ry: 0.03 }, hiddenBelow: 0.4 },
];

export const vesselMouth = (object: SavedObject): Mouth | null => {
  const path = String(object.imagePath || '');
  return MOUTHS.find((m) => m.match.test(path)) ?? null;
};

// ── Liquids ──────────────────────────────────────────────────────────────

type Liquid = { color: string; deep: string; opacity: number; stain: string; stainOpacity: number };

const WATER: Liquid = { color: 'rgb(170,188,194)', deep: 'rgb(64,86,98)', opacity: 0.5, stain: 'rgb(232,228,214)', stainOpacity: 0.3 };
const RED_WINE: Liquid = { color: 'rgb(112,24,38)', deep: 'rgb(48,6,14)', opacity: 0.9, stain: 'rgb(96,30,40)', stainOpacity: 0.45 };
const AMBER: Liquid = { color: 'rgb(198,142,60)', deep: 'rgb(118,68,20)', opacity: 0.8, stain: 'rgb(150,100,44)', stainOpacity: 0.35 };
const COFFEE: Liquid = { color: 'rgb(78,48,28)', deep: 'rgb(36,20,10)', opacity: 0.95, stain: 'rgb(90,60,36)', stainOpacity: 0.45 };
const TEA: Liquid = { color: 'rgb(152,94,40)', deep: 'rgb(82,44,14)', opacity: 0.85, stain: 'rgb(130,86,46)', stainOpacity: 0.4 };
const MILK: Liquid = { color: 'rgb(240,235,220)', deep: 'rgb(214,206,186)', opacity: 0.96, stain: 'rgb(226,216,184)', stainOpacity: 0.5 };
const SOUR_MILK: Liquid = { ...MILK, color: 'rgb(228,218,184)', deep: 'rgb(196,182,140)' };
const HONEY: Liquid = { color: 'rgb(208,144,46)', deep: 'rgb(140,80,14)', opacity: 0.94, stain: 'rgb(160,104,36)', stainOpacity: 0.5 };
const OLD_HONEY: Liquid = { ...HONEY, color: 'rgb(178,128,62)', deep: 'rgb(120,74,24)' };

const has = (text: string, words: string[]) => words.some((w) => new RegExp(`\\b${w}\\b`).test(text));

/** What colour the drink in the vessel is, from its kind and what you called it. Null for things that aren't poured. */
export function liquidOf(kind: OfferingKindId, label: string, stage: number): Liquid | null {
  const words = label.toLowerCase();
  if (kind === 'water') return WATER;
  if (kind === 'milk') return stage >= 2 ? SOUR_MILK : MILK;
  if (kind === 'honey') return stage >= 2 ? OLD_HONEY : HONEY;
  if (kind !== 'drink') return null;
  if (has(words, ['coffee'])) return COFFEE;
  if (has(words, ['tea'])) return TEA;
  if (has(words, ['white', 'mead', 'beer', 'ale', 'cider', 'whiskey', 'whisky', 'rum', 'juice', 'brandy', 'gold'])) return AMBER;
  // Red wine is the libation most often poured.
  return RED_WINE;
}

// ── Food and flowers in a vessel ─────────────────────────────────────────
// Painted heaps without a bowl (assets/altar/objects/offerings/<id>/<id>.png),
// listed in the artwork data with their shape; one without a picture shows
// nothing, as before.

export type FoodHeapId = 'fruit' | 'bread' | 'sweets' | 'meal' | 'flowers' | 'honeycomb';
type FoodPictures = Record<string, { image: string; ratio: number | null }>;

/** Which heap to draw for what's set out, or null (water, wine, honey poured as it is, things that keep). */
export function foodHeapOf(kind: OfferingKindId, label: string): FoodHeapId | null {
  if (kind === 'fruit' || kind === 'harvest') return 'fruit';
  if (kind === 'bread') return 'bread';
  if (kind === 'sweets') return 'sweets';
  if (kind === 'cooked') return 'meal';
  if (kind === 'flowers') return 'flowers';
  // Honey is poured unless it's in the comb.
  if (kind === 'honey' && /comb/i.test(label)) return 'honeycomb';
  return null;
}

/** How wide the heap is across the vessel's mouth, and how far below the rim's middle line its foot rests. */
const HEAP_FILL = 0.9;
const HEAP_FOOT = 0.45;

function foodInVessel(
  id: FoodHeapId,
  picture: { image: string; ratio: number | null },
  mouth: Ellipse,
  look: OfferingLook,
): FoodInVessel | null {
  const ratio = picture.ratio && picture.ratio > 0 ? picture.ratio : 0.75;
  const width = mouth.rx * 2 * HEAP_FILL;
  // Fruit softens and slumps, bread shrinks, flowers droop; a meal sinks a little as it spoils.
  const height = width * ratio * look.sag * (look.droop > 0 ? 1 - look.droop / 140 : 1);
  const sink = (1 - Math.max(0, Math.min(1, look.level))) * mouth.ry * 0.9;
  const foot = mouth.cy + mouth.ry * HEAP_FOOT + sink;
  const top = foot - height;
  const clipTop = Math.min(top, mouth.cy) - 1;
  const { cx, cy, rx, ry } = mouth;
  const { sepia, saturate, brightness } = look.tint;
  const clip = `M${r1(cx - rx)} ${r1(clipTop)} L${r1(cx + rx)} ${r1(clipTop)} L${r1(cx + rx)} ${r1(cy)} A${r1(rx)} ${r1(ry)} 0 0 1 ${r1(cx - rx)} ${r1(cy)} Z`;
  return {
    id,
    image: picture.image,
    left: r1(cx - width / 2),
    top: r1(top),
    width: r1(width),
    height: r1(height),
    tint: sepia > 0.01 || saturate < 0.99 || brightness < 0.99 ? look.tint : null,
    clip,
    mouth,
    clipTop: r1(clipTop),
  };
}

// ── Petals ───────────────────────────────────────────────────────────────

function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** A dried petal's colour, from what the flower is. */
export function petalColor(name: string): string {
  const words = name.toLowerCase();
  if (has(words, ['rose', 'roses', 'carnation', 'carnations', 'peony'])) return 'rgb(150,86,92)';
  if (has(words, ['lavender', 'violet', 'violets', 'lilac'])) return 'rgb(124,106,146)';
  if (has(words, ['marigold', 'marigolds', 'calendula', 'saffron'])) return 'rgb(190,124,48)';
  if (has(words, ['lily', 'lilies', 'jasmine', 'chamomile', 'daisy', 'daisies', 'elder', 'hawthorn', 'yarrow'])) return 'rgb(200,188,158)';
  return 'rgb(168,142,104)';
}

/** A petal or two fallen at the foot of a flower (or of the vessel holding them). */
function fallenPetals(
  object: SavedObject,
  contents: { label: string } | null,
  count: number,
  pic: { left: number; top: number; width: number; height: number },
  height: number,
): OfferingArt['petals'] {
  const random = seeded(String(object.altarObjectId || object.label || 'petal'));
  const color = petalColor(`${contents?.label || ''} ${object.label || ''} ${object.herb || ''}`);
  const size = Math.max(1.6, pic.width * 0.075);
  const out: OfferingArt['petals'] = [];
  for (let i = 0; i < count; i++) {
    const side = i === 0 ? 1 : -1;
    out.push({
      cx: r1(pic.left + pic.width * (0.5 + side * (0.12 + random() * 0.16))),
      cy: r1(Math.min(height - size * 0.4, pic.top + pic.height * (0.95 + random() * 0.03))),
      rx: r1(size * (0.9 + random() * 0.3)),
      ry: r1(size * (0.5 + random() * 0.15)),
      rotate: Math.round(-40 + random() * 80),
      color,
    });
  }
  return out;
}

// ── The art ──────────────────────────────────────────────────────────────

const r1 = (n: number) => Math.round(n * 10) / 10;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The picture's place in the box (the website's button content box, image contained), in box pixels. */
function pictureRect(ratio: number, width: number, height: number) {
  const box = pictureBox(ratio, height / width);
  return { left: box.left * width, top: box.top * height, width: box.width * width, height: box.height * height };
}

const inPicture = (e: Ellipse, pic: { left: number; top: number; width: number; height: number }): Ellipse => ({
  cx: r1(pic.left + e.cx * pic.width),
  cy: r1(pic.top + e.cy * pic.height),
  rx: r1(e.rx * pic.width),
  ry: r1(e.ry * pic.height),
});

/**
 * What to draw for an offering going over, in a box `width` × `height`
 * pixels, or null when nothing shows (not an offering, fresh, or keeps).
 * `ratio` is the picture's height / width when known.
 */
export function offeringArt(
  object: SavedObject,
  width: number,
  height: number,
  now: number,
  ratio?: number | null,
  foods: FoodPictures = ALTAR_ARTWORK.offeringFoods ?? {},
): OfferingArt | null {
  if (!(width > 0) || !(height > 0)) return null;
  // A pot that would like water sags a little and dulls; it perks up when watered.
  if (isPottedPlant(object)) {
    const thirst = thirstLook(object, now);
    if (!thirst) return null;
    const { sepia, saturate, brightness } = thirst.tint;
    const tint = sepia > 0.01 || saturate < 0.99 || brightness < 0.99 ? thirst.tint : null;
    return { tint, bend: { rotate: 0, scaleX: thirst.widen, scaleY: thirst.sag }, liquid: null, tide: null, stain: null, petals: [], food: null };
  }
  const fresh = offeringFreshness(object, now);
  if (!fresh || fresh.level === 'lasting') return null;
  const look = agingLook(fresh.kind, fresh);
  const contents = offeringOf(object);
  const art: OfferingArt = { tint: null, bend: null, liquid: null, tide: null, stain: null, petals: [], food: null };

  if (isOfferingItself(object)) {
    const { sepia, saturate, brightness } = look.tint;
    if (sepia > 0.01 || saturate < 0.99 || brightness < 0.99) art.tint = look.tint;
    if (look.droop > 0 || look.sag < 1) {
      // A flower bows and shortens; fruit and bread settle a little wider.
      const wilts = look.droop > 0;
      art.bend = { rotate: look.droop, scaleX: wilts ? 1 : r1((2 - look.sag) * 100) / 100, scaleY: look.sag };
    }
    if (look.petals > 0) {
      const pic = ratio && ratio > 0 ? pictureRect(ratio, width, height) : { left: 0, top: 0, width, height };
      art.petals = fallenPetals(object, contents, look.petals, pic, height);
    }
    return art.tint || art.bend || art.petals.length ? art : null;
  }

  const mouth = vesselMouth(object);
  if (!mouth || !contents) return null;
  const pic = pictureRect(mouth.ratio, width, height);

  // Food or flowers heaped in it: they go over as the things themselves do, and flowers drop petals beside it.
  const heap = foodHeapOf(contents.kind, contents.label);
  const heapPicture = heap ? foods[heap] : null;
  if (heap && heapPicture?.image) {
    art.food = foodInVessel(heap, heapPicture, inPicture(mouth.full, pic), look);
    if (look.petals > 0) art.petals = fallenPetals(object, contents, look.petals, pic, height);
    return art.food ? art : null;
  }

  // A vessel of drink: the liquid sinks, leaving a tide line and, at the last, a stain.
  const liquid = liquidOf(contents.kind, contents.label, look.stage);
  if (!liquid) return null;
  const level = Math.max(0, Math.min(1, look.level));
  const surface: Ellipse = {
    cx: lerp(mouth.empty.cx, mouth.full.cx, level),
    cy: lerp(mouth.empty.cy, mouth.full.cy, level),
    rx: lerp(mouth.empty.rx, mouth.full.rx, level),
    ry: lerp(mouth.empty.ry, mouth.full.ry, level),
  };
  // Seen from the side, liquid low in a chalice or cauldron is behind the rim.
  const seen = mouth.hiddenBelow > 0 ? Math.max(0, Math.min(1, (level - mouth.hiddenBelow * 0.5) / (mouth.hiddenBelow * 0.5))) : 1;
  if (level > 0.02 && seen > 0.02) {
    art.liquid = {
      ...inPicture(surface, pic),
      color: liquid.color,
      deep: liquid.deep,
      opacity: Math.round(liquid.opacity * seen * 100) / 100,
      // The shine on a fresh surface dulls as it turns, thickens or gathers dust.
      sheen: Math.round(Math.max(0, 0.22 - 0.06 * look.stage) * 100) / 100,
    };
  }
  if (look.ring) {
    const gone = 1 - level;
    art.tide = { ...inPicture(mouth.full, pic), color: liquid.stain, opacity: Math.round(Math.min(0.5, 0.12 + 0.4 * gone) * liquid.stainOpacity * 2 * 100) / 100, stroke: r1(Math.max(0.6, pic.width * 0.006)) };
  }
  if (level <= 0.02) art.stain = { ...inPicture(mouth.empty, pic), color: liquid.stain, opacity: liquid.stainOpacity };
  return art;
}

// ── Colour ───────────────────────────────────────────────────────────────

/** The tint as a CSS filter (the web and the website). */
export const tintFilter = (tint: OfferingTint) => `sepia(${tint.sepia}) saturate(${tint.saturate}) brightness(${tint.brightness})`;

type M3 = number[][];
const mul = (a: M3, b: M3): M3 => a.map((row) => [0, 1, 2].map((j) => row[0] * b[0][j] + row[1] * b[1][j] + row[2] * b[2][j]));

/**
 * The same tint as a 4 × 5 colour matrix (the phone's picture), composed as
 * the browser applies the filters: sepia, then saturate, then brightness.
 */
export function tintMatrix(tint: OfferingTint): number[] {
  const a = 1 - Math.max(0, Math.min(1, tint.sepia));
  const sepia: M3 = [
    [0.393 + 0.607 * a, 0.769 - 0.769 * a, 0.189 - 0.189 * a],
    [0.349 - 0.349 * a, 0.686 + 0.314 * a, 0.168 - 0.168 * a],
    [0.272 - 0.272 * a, 0.534 - 0.534 * a, 0.131 + 0.869 * a],
  ];
  const s = Math.max(0, tint.saturate);
  const saturate: M3 = [
    [0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s],
    [0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s],
    [0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s],
  ];
  const b = Math.max(0, tint.brightness);
  const brightness: M3 = [
    [b, 0, 0],
    [0, b, 0],
    [0, 0, b],
  ];
  const m = mul(brightness, mul(saturate, sepia));
  const round = (n: number) => Math.round(n * 10000) / 10000;
  return [...m[0].map(round), 0, 0, ...m[1].map(round), 0, 0, ...m[2].map(round), 0, 0, 0, 0, 0, 1, 0];
}

// ── Incense burning down ─────────────────────────────────────────────────
// The built-in stick (herbs/incense/incense.png): its coated part runs from
// its tip to about two-thirds of the way down, where the bare stick begins.

const STICK = { match: /\/herbs\/incense\/incense\.png$/i, ratio: 1536 / 500, top: 0.01, coatEnd: 0.655, x0: 0.405, slope: 0.16 };

export type IncenseStickArt = {
  /** How much of the picture's top is burned away, in box pixels from the picture's top. */
  cutPx: number;
  /** The picture's place in the box. */
  pic: { left: number; top: number; width: number; height: number };
  /** The burning tip (or the end of the burned part), in box pixels, and its slant in degrees. */
  tip: { x: number; y: number; width: number; slant: number };
  /** Ash fallen at its foot, in box pixels (null before any has fallen). */
  pile: Ellipse | null;
  /** Where the smoke rises from, as fractions of the box. */
  origin: { x: number; y: number };
};

/** A stick of incense, shorter as it burns, with ash at its foot; null for other incense (or a picture of your own). */
export function incenseStickArt(object: SavedObject, width: number, height: number, now: number): IncenseStickArt | null {
  if (!isIncense(object) || incenseFormOf(object) !== 'stick' || !STICK.match.test(String(object.imagePath || ''))) return null;
  if (!(width > 0) || !(height > 0)) return null;
  const life = incenseLife(object, now);
  const burned = life.ash ? 1 : life.burnMs > 0 ? Math.min(1, life.burnedMs / life.burnMs) : 0;
  const pic = pictureRect(STICK.ratio, width, height);
  const y = STICK.top + burned * (STICK.coatEnd - STICK.top);
  const x = STICK.x0 + STICK.slope * y;
  const tip = { x: r1(pic.left + x * pic.width), y: r1(pic.top + y * pic.height), width: r1(Math.max(1, pic.width * 0.08)), slant: r1((Math.atan2(STICK.slope * pic.width, pic.height) * 180) / Math.PI) };
  const footX = pic.left + (STICK.x0 + STICK.slope * 0.99) * pic.width;
  const pile =
    burned > 0.04
      ? { cx: r1(footX), cy: r1(pic.top + pic.height * 0.985), rx: r1(Math.max(1.2, pic.width * (0.06 + 0.16 * burned))), ry: r1(Math.max(0.6, pic.width * (0.025 + 0.035 * burned))) }
      : null;
  return { cutPx: r1(y * pic.height), pic, tip, pile, origin: { x: tip.x / width, y: Math.max(0, (tip.y - pic.width * 0.02) / height) } };
}
