// The Altar widget: one of your saved altars on the home screen, with its
// candles, the presences on it, its crystals and workings, and buttons to
// light the candles, tend offerings and cleanse crystals without opening the
// app. A tap changes the widget at once and leaves a note of what was done
// (an action); the next time the app opens it carries each action out on the
// real altar, which then saves and syncs as usual. Pure, so it can be tested.

import {
  careForCrystal,
  crystalDecisions,
  crystalIntention,
  crystalState,
  defaultCleansingOf,
  defaultCleansingSummary,
  defaultOfferingOf,
  defaultOfferingSummary,
  deityState,
  recordOffering,
} from './altar/devotion.ts';
import { DEFAULT_BACKGROUND } from './altar/cabinet.ts';
import { lightAll, snuffAll } from './altar/editor.ts';
import { flameLayout } from './altar/flame.ts';
import { boxToPixels, candleLightRadius, displayBox, IMAGE_INSET, imageRatio, rotationOf, STAGE_ASPECT } from './altar/geometry.ts';
import { stackOrder } from './altar/layers.ts';
import { incenseLife, isIncense } from './altar/incense.ts';
import { apothecaryStateOf, candleLife, dressingOverlays, isCandle, isLit, lightCandle, readLivingState, snuffCandle } from './altar/livingState.ts';
import { documentFromAltar, type AltarDocument } from './altar/snapshot.ts';
import type { SavedAltar, SavedObject } from './altar/types.ts';
import { burnDown } from './altar/wax.ts';

/** How many altars can be on the home screen at once (the widget's "Which altar" choices). */
export const ALTAR_WIDGET_SLOTS = 6;
const MAX_CANDLES = 8;
const MAX_PRESENCES = 4;
const MAX_CRYSTALS = 6;

export type WidgetCandle = {
  key: string;
  label: string;
  /** The candle's colour, for its flame and swatch. */
  color: string;
  /** file:// picture of the candle, or "". */
  image: string;
  lit: boolean;
  /** When it was lit (ISO), or "". */
  since: string;
};

export type WidgetPresence = {
  key: string;
  label: string;
  image: string;
  /** Last offering (ISO), or "". */
  lastOffering: string;
  /** What its Offer button offers ("Wine, rosemary"), or "" when not chosen yet. */
  offering: string;
};

export type WidgetCrystal = {
  key: string;
  label: string;
  image: string;
  lastCleansed: string;
  lastCharged: string;
  intention: string;
  /** How its Cleanse button cleanses ("Moonlight, Smoke"), or "" when not chosen yet. */
  cleansing: string;
};

/** A rectangle in stage widths (the stage is 1 wide and 9/16 tall). */
export type StageRect = { x: number; y: number; w: number; h: number };

/** One object on the altar, drawn where the app draws it. */
export type SceneItem = {
  key: string;
  /** file:// picture, or "" when it can't be shown. */
  image: string;
  /** The object's box (the website's 80px button), in stage widths. */
  box: StageRect;
  /** The picture's area inside the box, as fractions of the box. */
  inset: { x: number; y: number };
  rotation: number;
  flipped: boolean;
  candle: boolean;
  lit: boolean;
  /** A candle that has burned all the way down (drawn faded). */
  spent?: boolean;
  /** Drawn burned down: `image` is left empty and the candle is its pieces in `overlays`. */
  burned?: boolean;
  /** Flame and halo, as fractions of the box (only for candles). */
  flame?: StageRect;
  halo?: StageRect;
  /** The warm pool of light a lit candle casts, in stage widths (centre and radius). */
  pool?: { x: number; y: number; r: number };
  /** Herb and oil dressings drawn over a candle, as fractions of the box. */
  overlays: { image: string; rect: StageRect; opacity: number }[];
};

export type WidgetSize = 'small' | 'medium' | 'large';

/** How the altar fills one widget size: the stage W points wide, slid by (ox, oy). */
export type SceneFrame = {
  W: number;
  ox: number;
  oy: number;
  /** Where the background cut sits (stage points) and how tall it is; below it is the dark panel. */
  bgY: number;
  bgH: number;
  /** file:// cut of the background showing just what this widget size shows, or "". */
  background: string;
};

export type WidgetAltar = {
  id: string;
  name: string;
  /** The altar as the app shows it, back to front. */
  scene: SceneItem[];
  frames: Record<WidgetSize, SceneFrame>;
  /** file:// picture of the altar's background, or "". */
  background: string;
  candles: WidgetCandle[];
  /** Candles on the altar beyond those listed. */
  moreCandles: number;
  presences: WidgetPresence[];
  crystals: WidgetCrystal[];
  /** Apothecary workings whose tending date has come. */
  workingsDue: number;
  workings: number;
  items: number;
};

export type WidgetActionKind = 'light' | 'snuff' | 'offer' | 'cleanse';

export type WidgetAction = {
  id: string;
  altarId: string;
  kind: WidgetActionKind;
  /** One object's altarObjectId, or "" for every candle / presence / crystal. */
  key: string;
  at: string;
};

/** file:// pictures of the widget's own artwork (lib/altarWidgetSync). */
export type AltarWidgetArt = {
  flame: string;
  halo: string;
  pool: string;
  scrimTop: string;
  scrimBottom: string;
  panel: string;
  button: string;
  buttonGold: string;
  pill: string;
  pillGold?: string;
};

export type AltarWidgetProps = {
  /** In slot order: the first is "Altar 1" in the widget's settings. */
  altars: WidgetAltar[];
  /**
   * Left out until the pictures are ready (the widget then draws a plain scene).
   * Never null: the widget's storage can't hold an empty value, and a single one
   * stops the whole update being saved.
   */
  art?: AltarWidgetArt;
  actions: WidgetAction[];
};

const CANDLE_COLORS: Record<string, string> = {
  white: '#f4ecd8',
  black: '#3a3a3a',
  green: '#4f9a5b',
  purple: '#8a5cc2',
  red: '#c8433a',
  orange: '#e0843a',
  yellow: '#e8c547',
  blue: '#4a7bd0',
  brown: '#8a5a3a',
  pink: '#e48ab0',
  gold: '#e2c36d',
  silver: '#c9ccd1',
  grey: '#9a9a9a',
  gray: '#9a9a9a',
  indigo: '#5a52b5',
  rainbow: '#e2c36d',
  magenta: '#c93a9a',
};

export function candleColor(object: SavedObject): string {
  const named = String(object.color || '').toLowerCase();
  if (CANDLE_COLORS[named]) return CANDLE_COLORS[named];
  const fromLabel = Object.keys(CANDLE_COLORS).find((c) => String(object.label || '').toLowerCase().includes(c));
  return fromLabel ? CANDLE_COLORS[fromLabel] : '#e2c36d';
}

const objectKey = (object: SavedObject, index: number) => String(object.altarObjectId || object.instanceId || `i${index}`);
const label = (object: SavedObject, fallback: string) => String(object.label || '').trim() || fallback;
const isPresence = (object: SavedObject) => object.type === 'deity';
const isCrystal = (object: SavedObject) => object.type === 'crystal';
const isWorking = (object: SavedObject) => object.type === 'apothecary' || !!object.apothecaryItemId;

/** The stage's height in stage widths. */
export const STAGE_HEIGHT = 1 / STAGE_ASPECT;

/**
 * The widget sizes, in points (the largest iPhones; smaller phones show a little
 * less at the edges), and where the objects' middle sits in each, as a fraction of its height.
 */
export const WIDGET_VIEWS: Record<WidgetSize, { w: number; h: number; focus: number; zoom: number; area?: number }> = {
  small: { w: 170, h: 170, focus: 0.48, zoom: 2 },
  medium: { w: 364, h: 170, focus: 0.5, zoom: 2 },
  // The large widget keeps the altar in its top `area` points, zoomed out, with
  // the words and buttons below it on a dark panel instead of over the altar.
  large: { w: 364, h: 382, focus: 0.5, zoom: 1, area: 250 },
};
/**
 * Pixels a point for the pictures. A widget has very little memory (iOS stops
 * one that uses too much, leaving it blank), and every picture is held in full
 * while it's drawn, so they're kept small.
 */
const SCALE = 2;
/** Most objects drawn on a widget; the rest (the smallest) are left out. */
const MAX_SCENE_ITEMS = 40;
export const HERB_OVERLAY = '../assets/altar/overlays/candle-herb-overlay.png';
export const OIL_OVERLAY = '../assets/altar/overlays/candle-oil-overlay.png';
/** Where the dressings lie on a candle, as fractions of its box. */
const HERB_RECT: StageRect = { x: -0.01, y: 0.08, w: 1, h: 0.8 };
const OIL_RECT: StageRect = { x: 0, y: 0.11, w: 0.94, h: 0.7 };

const backgroundOf = (altarBackground: string | undefined) => altarBackground || DEFAULT_BACKGROUND;

/** The objects the widget draws, back to front. */
function sceneObjects(objects: SavedObject[]): { object: SavedObject; index: number }[] {
  const ordered = stackOrder(objects).map((index) => ({ object: objects[index], index })).filter(({ object }) => !!object.imagePath);
  if (ordered.length <= MAX_SCENE_ITEMS) return ordered;
  const keep = new Set([...ordered].sort((a, b) => displayBox(b.object).size - displayBox(a.object).size).slice(0, MAX_SCENE_ITEMS).map((o) => o.index));
  return ordered.filter((o) => keep.has(o.index));
}

/**
 * How the altar fills a widget: the stage covers it, then zooms (up to `zoom`
 * times) until the arrangement fills most of it, slid so the objects sit at `focus`.
 */
export function sceneFrame(
  boxes: StageRect[],
  view: { w: number; h: number; focus: number; zoom: number },
  /** The background picture's height / width; pictures taller than 16:9 let the widget show more above and below the stage. */
  backgroundRatio: number = STAGE_HEIGHT,
): { W: number; ox: number; oy: number } {
  const minX = boxes.length ? Math.min(...boxes.map((b) => b.x)) : 0;
  const maxX = boxes.length ? Math.max(...boxes.map((b) => b.x + b.w)) : 1;
  const minY = boxes.length ? Math.min(...boxes.map((b) => b.y)) : 0;
  const maxY = boxes.length ? Math.max(...boxes.map((b) => b.y + b.h)) : STAGE_HEIGHT;
  const ratio = Math.max(STAGE_HEIGHT, backgroundRatio || STAGE_HEIGHT);
  // The smallest the altar can be while its background still covers the widget.
  const cover = Math.max(view.w, view.h / ratio);
  const fit = Math.min((view.w * 0.72) / Math.max(0.05, maxX - minX), (view.h * 0.55) / Math.max(0.03, maxY - minY));
  const W = Math.max(cover, Math.min(fit, cover * view.zoom));
  // The background reaches this far above and below the stage.
  const extra = (W * ratio - W * STAGE_HEIGHT) / 2;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  return {
    W,
    ox: clamp(((minX + maxX) / 2) * W - view.w / 2, 0, W - view.w),
    oy: clamp(((minY + maxY) / 2) * W - view.h * view.focus, -extra, W * STAGE_HEIGHT + extra - view.h),
  };
}

/** A picture the widget needs: a saved path, the width to make it, and for backgrounds the part to cut out (fractions of the image). */
/** `crop`: the part of the picture to keep (fractions); `alpha`: keep it see-through (a candle's piece, not a background). */
export type WidgetPicture = { id: string; path: string; width: number; crop?: StageRect; alpha?: boolean };

const backgroundId = (size: WidgetSize, path: string) => `bg-${size}:${path}`;

/**
 * How the altar fills one widget size, and the cut of its background that
 * shows (fractions of the picture) with where that cut sits.
 */
function sizeFrame(boxes: StageRect[], size: WidgetSize, background: string): SceneFrame & { crop: StageRect } {
  const view = WIDGET_VIEWS[size];
  const ratio = imageRatio(background) ?? STAGE_HEIGHT; // height / width
  const area = view.area ?? view.h;
  const { W, ox, oy } = sceneFrame(boxes, { ...view, h: area }, ratio);
  const H = W * STAGE_HEIGHT;
  // The background is drawn to cover the stage, centred.
  const drawnW = Math.max(W, H / ratio);
  const drawnH = drawnW * ratio;
  const left = (drawnW - W) / 2;
  const above = (drawnH - H) / 2;
  const top = Math.max(oy, -above);
  const bottom = Math.min(oy + view.h, H + above);
  const crop = {
    x: Math.max(0, Math.min(1, (ox + left) / drawnW)),
    y: Math.max(0, Math.min(1, (top + above) / drawnH)),
    w: Math.min(1, view.w / drawnW),
    h: Math.max(0.01, Math.min(1, (bottom - top) / drawnH)),
  };
  return { W, ox, oy, bgY: top, bgH: Math.max(1, bottom - top), background: '', crop };
}

/** Every picture the widget needs for an altar, each made just big enough to stay sharp. */
export function altarPictures(altar: SavedAltar, scale = SCALE, now: number = Date.now()): WidgetPicture[] {
  const doc = documentFromAltar(altar);
  const objects = sceneObjects(doc.objects);
  const boxes = objects.map(({ object }) => boxRect(object));
  const background = backgroundOf(doc.background);
  const out: WidgetPicture[] = [];
  let widest = 0;
  for (const size of Object.keys(WIDGET_VIEWS) as WidgetSize[]) {
    const frame = sizeFrame(boxes, size, background);
    widest = Math.max(widest, frame.W);
    out.push({ id: backgroundId(size, background), path: background, width: WIDGET_VIEWS[size].w * scale, crop: frame.crop });
  }
  const sizes = new Map<string, number>();
  for (const { object } of objects) {
    const path = String(object.imagePath);
    sizes.set(path, Math.max(sizes.get(path) ?? 0, displayBox(object).size * widest * scale));
    const overlays = dressingOverlays(object);
    if (overlays.herb) sizes.set(HERB_OVERLAY, Math.max(sizes.get(HERB_OVERLAY) ?? 0, displayBox(object).size * widest * scale));
    if (overlays.oil) sizes.set(OIL_OVERLAY, Math.max(sizes.get(OIL_OVERLAY) ?? 0, displayBox(object).size * widest * scale));
  }
  const widthOf = (path: string) => Math.min(150 * scale, Math.max(48, Math.ceil((sizes.get(path) ?? 0) * 1.25)));
  for (const path of sizes.keys()) out.push({ id: path, path, width: widthOf(path) });
  // The pieces of candles that have burned shorter, and of their dressings.
  for (const { object } of objects) {
    if (!isCandle(object)) continue;
    const px = boxToPixels(displayBox(object), 1);
    const burn = burnPieces(object, px.height / px.width, now);
    if (!burn) continue;
    for (const p of burn.pieces) out.push({ id: p.id, path: p.path, width: widthOf(p.path), crop: p.crop, alpha: true });
    for (const p of burn.dressings.values()) if (p) out.push({ id: p.id, path: p.path, width: widthOf(p.path), crop: p.crop, alpha: true });
  }
  return out;
}

function boxRect(object: SavedObject): StageRect {
  const px = boxToPixels(displayBox(object), 1);
  return { x: px.left, y: px.top, w: px.width, h: px.height };
}

// ── Burning down ──────────────────────────────────────────────────────────
// The widget can't cut a picture, so a candle that has burned shorter is sent
// as pieces of its picture, cut by the app: its top (rim and wick) set down on
// what is left of its body, as the stage draws it (CandlePicture). The wax is
// drawn in steps, so only a few pieces are made for each candle.

/** The steps the widget's candles burn down in, as a fraction of the picture's height. */
const BURN_STEP = 0.02;
/** The dressing pictures' height / width. */
const OVERLAY_RATIO = 1.5;

type BurnPiece = { id: string; path: string; crop: StageRect; rect: StageRect };

/** A picture of height/width `ratio` fitted into `rect` (fractions of a box `aspect` tall per wide), centred. */
function fitted(ratio: number, rect: StageRect, aspect: number): StageRect {
  const w = Math.min(rect.w, (rect.h * aspect) / ratio);
  const h = (w * ratio) / aspect;
  return { x: rect.x + (rect.w - w) / 2, y: rect.y + (rect.h - h) / 2, w, h };
}

/** Rows `from`–`to` of a picture drawn at `at`, drawn with their top at `y`. */
function piece(path: string, at: StageRect, from: number, to: number, y: number): BurnPiece {
  return {
    id: `${path}#burn:${from.toFixed(3)}-${to.toFixed(3)}`,
    path,
    crop: { x: 0, y: from, w: 1, h: to - from },
    rect: { x: at.x, y, w: at.w, h: (to - from) * at.h },
  };
}

/**
 * A candle burned down at `now`, in a box `aspect` tall per wide: the pieces
 * of its picture, how far its flame comes down and the top of its wax (both
 * fractions of the box's height), and its dressings cut to the wax that's
 * left. Null when it stands its full height, or its wax sinks in glass.
 */
export function burnPieces(object: SavedObject, aspect: number, now: number): { pieces: BurnPiece[]; drop: number; dressings: Map<string, BurnPiece | null> } | null {
  const path = String(object.imagePath || '');
  const ratio = path ? imageRatio(path) : null;
  const burn = ratio ? burnDown(object, now) : null;
  if (!ratio || !burn || (burn.mode !== 'cap' && burn.mode !== 'crop')) return null;
  const drop = Math.round(burn.drop / BURN_STEP) * BURN_STEP;
  if (!(drop > 0)) return null;
  const inset = { x: IMAGE_INSET.x, y: IMAGE_INSET.y / aspect };
  const pic = fitted(ratio, { x: inset.x, y: inset.y, w: 1 - inset.x * 2, h: 1 - inset.y * 2 }, aspect);
  const pieces: BurnPiece[] = [];
  if (burn.mode === 'crop') {
    if (drop < 1) pieces.push(piece(path, pic, drop, 1, pic.y + drop * pic.h));
  } else {
    const below = burn.capEnd + drop;
    if (below < 1) pieces.push(piece(path, pic, below, 1, pic.y + below * pic.h));
    pieces.push(piece(path, pic, 0, burn.capEnd, pic.y + drop * pic.h));
  }
  if (!pieces.length) return null;
  // The dressing lies only on the wax that's there.
  const waxTop = pic.y + (burn.top + drop) * pic.h;
  const dressings = new Map<string, BurnPiece | null>();
  for (const [overlay, rect] of [[HERB_OVERLAY, HERB_RECT], [OIL_OVERLAY, OIL_RECT]] as const) {
    const at = fitted(OVERLAY_RATIO, rect, aspect);
    if (waxTop <= at.y) continue;
    const from = Math.round(((waxTop - at.y) / at.h) * 1000) / 1000;
    dressings.set(overlay, from >= 1 ? null : piece(overlay, at, from, 1, at.y + from * at.h));
  }
  return { pieces, drop: drop * pic.h, dressings };
}

/** The moments within `hours` a lit candle on these altars burns down another step, for the widget's timeline (at most `limit`). */
export function burnStepTimes(altars: SavedAltar[], now: Date, hours = 12, limit = 24): number[] {
  const lit = altars.flatMap((altar) => documentFromAltar(altar).objects.filter((o) => isCandle(o) && isLit(o)));
  if (!lit.length) return [];
  const level = (t: number) => lit.map((o) => Math.round((burnDown(o, t)?.drop ?? 0) / BURN_STEP)).join(',');
  const out: number[] = [];
  const start = now.getTime();
  let last = level(start);
  for (let t = start + 5 * 60_000; t <= start + hours * 3_600_000; t += 5 * 60_000) {
    const next = level(t);
    if (next !== last) out.push(t);
    last = next;
  }
  if (out.length <= limit) return out;
  return Array.from({ length: limit }, (_, i) => out[Math.floor((i * out.length) / limit)]);
}

/** Where each object sits, as the app's altar stage draws it (AltarStage). */
export function altarScene(objects: SavedObject[], image: (path: string) => string, now?: number): SceneItem[] {
  return sceneObjects(objects).map(({ object, index }) => {
    const box = displayBox(object);
    const px = boxToPixels(box, 1);
    const candle = isCandle(object);
    const lit = candle && isLit(object);
    const item: SceneItem = {
      key: objectKey(object, index),
      image: image(String(object.imagePath)),
      box: { x: px.left, y: px.top, w: px.width, h: px.height },
      inset: { x: IMAGE_INSET.x, y: (IMAGE_INSET.y * px.width) / px.height },
      rotation: rotationOf(object),
      flipped: object.flipped === 'true',
      candle,
      // Burned-down candles, and incense burned down to ash, are drawn faded.
      ...((candle && !lit && candleLife(object).spent) || (isIncense(object) && incenseLife(object, Date.now()).ash) ? { spent: true } : {}),
      lit,
      overlays: [],
    };
    if (candle) {
      const flame = flameLayout(object.imagePath, imageRatio(String(object.imagePath)));
      item.flame = { x: (flame.centerX - 5) / 100, y: flame.flameTop / 100, w: 0.1, h: flame.flameHeight / 100 };
      item.halo = { x: (flame.centerX - 4) / 100, y: flame.haloTop / 100, w: 0.08, h: flame.haloHeight / 100 };
      // As LightPools: a little below the top of the (rotated) candle's bounds.
      const angle = (item.rotation * Math.PI) / 180;
      const boundsHeight = px.width * Math.abs(Math.sin(angle)) + px.height * Math.abs(Math.cos(angle));
      item.pool = { x: px.centerX, y: px.centerY - boundsHeight / 2 + boundsHeight * 0.1, r: candleLightRadius(box.size) };
      // Burned shorter (on the widget, given `now`): its pieces, with the flame on what's left.
      const burn = now != null ? burnPieces(object, px.height / px.width, now) : null;
      const parts = burn ? burn.pieces.map((p) => ({ image: image(p.id), rect: p.rect, opacity: item.spent ? 0.45 : 1 })) : [];
      const burned = !!burn && parts.every((p) => p.image);
      if (burned) {
        item.image = '';
        item.burned = true;
        item.overlays.push(...parts);
        item.flame.y += burn.drop;
        item.halo.y += burn.drop;
      }
      const dressed = dressingOverlays(object);
      const dressing = (overlay: string, rect: StageRect, opacity: number) => {
        const cut = burned ? burn.dressings.get(overlay) : undefined;
        if (cut === null) return; // burned away
        const cutImage = cut ? image(cut.id) : '';
        if (cut && cutImage) item.overlays.push({ image: cutImage, rect: cut.rect, opacity });
        else if (!cut) item.overlays.push({ image: image(overlay), rect, opacity });
      };
      if (dressed.herb) dressing(HERB_OVERLAY, HERB_RECT, 1);
      if (dressed.oil) dressing(OIL_OVERLAY, OIL_RECT, 0.55);
    }
    return item;
  });
}



/** What the widget shows for one altar. `image` turns a saved picture path into a file the widget can read. */
export function widgetAltar(altar: SavedAltar, image: (path: string) => string, now: Date): WidgetAltar {
  const doc = documentFromAltar(altar);
  const scene = altarScene(doc.objects, image, now.getTime());
  const iso = now.toISOString();
  const keyed = doc.objects.map((object, index) => ({ object, key: objectKey(object, index) }));
  // Burned-down candles stay in the picture but can't be lit, so they aren't counted or offered.
  const candles = keyed.filter(({ object }) => isCandle(object) && (isLit(object) || !candleLife(object).spent));
  const picture = (object: SavedObject) => (object.imagePath ? image(String(object.imagePath)) : '');
  const workings = doc.objects.filter(isWorking);
  return {
    id: altar.id,
    name: altar.name || 'My altar',
    background: image(backgroundOf(doc.background)),
    scene,
    frames: Object.fromEntries(
      (Object.keys(WIDGET_VIEWS) as WidgetSize[]).map((size) => [
        size,
        (({ crop: _crop, ...frame }) => ({ ...frame, background: image(backgroundId(size, backgroundOf(doc.background))) }))(
          sizeFrame(scene.map((item) => item.box), size, backgroundOf(doc.background)),
        ),
      ]),
    ) as Record<WidgetSize, SceneFrame>,
    candles: candles.slice(0, MAX_CANDLES).map(({ object, key }) => ({
      key,
      label: label(object, 'Candle'),
      color: candleColor(object),
      image: picture(object),
      lit: isLit(object),
      since: isLit(object) ? String(readLivingState(object, iso).candle?.currentBurnStartedAt || '') : '',
    })),
    moreCandles: Math.max(0, candles.length - MAX_CANDLES),
    presences: keyed
      .filter(({ object }) => isPresence(object))
      .slice(0, MAX_PRESENCES)
      .map(({ object, key }) => ({
        key,
        label: label(object, 'Presence'),
        image: picture(object),
        lastOffering: String(deityState(object, iso).lastOfferingAt || ''),
        offering: defaultOfferingSummary(defaultOfferingOf(object, iso)),
      })),
    crystals: keyed
      .filter(({ object }) => isCrystal(object))
      .slice(0, MAX_CRYSTALS)
      .map(({ object, key }) => {
        const state = crystalState(object, iso);
        return {
          key,
          label: label(object, 'Crystal'),
          image: picture(object),
          lastCleansed: String(state.lastCleansedAt || ''),
          lastCharged: String(state.lastChargedAt || ''),
          intention: crystalIntention(object, iso),
          cleansing: defaultCleansingSummary(defaultCleansingOf(object, iso)),
        };
      }),
    workingsDue: workings.filter((o) => {
      const next = Date.parse(apothecaryStateOf(o).nextTendingAt);
      return Number.isFinite(next) && next <= now.getTime();
    }).length,
    workings: workings.length,
    items: doc.objects.length,
  };
}

/**
 * Which altars fill the widget's places: the ones you put there, in order,
 * then the rest by most recently saved, so a new widget always shows something.
 */
export function slotAltars(altars: SavedAltar[], chosen: (string | null)[]): SavedAltar[] {
  const byId = new Map(altars.map((a) => [a.id, a]));
  const slots: (SavedAltar | null)[] = Array.from({ length: ALTAR_WIDGET_SLOTS }, (_, i) => byId.get(chosen[i] ?? '') ?? null);
  const used = new Set(slots.filter(Boolean).map((a) => a!.id));
  const rest = [...altars]
    .filter((a) => !used.has(a.id))
    .sort((a, b) => String(b.updatedAt || b.savedAt || '').localeCompare(String(a.updatedAt || a.savedAt || '')));
  return slots.map((a) => a ?? rest.shift() ?? null).filter((a): a is SavedAltar => !!a);
}

/**
 * What a tap on the widget shows straight away, before the app carries it out
 * on the real altar (the iPhone widget does the same inside the widget).
 */
export function previewWidgetAction(altars: WidgetAltar[], action: WidgetAction): WidgetAltar[] {
  const hit = (k: string) => !action.key || k === action.key;
  return altars.map((a) => {
    if (a.id !== action.altarId) return a;
    if (action.kind === 'light' || action.kind === 'snuff') {
      const on = action.kind === 'light';
      return {
        ...a,
        candles: a.candles.map((c) => (hit(c.key) && c.lit !== on ? { ...c, lit: on, since: on ? action.at : '' } : c)),
        scene: (a.scene ?? []).map((s) => (s.candle && !s.spent && hit(s.key) ? { ...s, lit: on } : s)),
      };
    }
    if (action.kind === 'offer') return { ...a, presences: a.presences.map((p) => (hit(p.key) ? { ...p, lastOffering: action.at } : p)) };
    return { ...a, crystals: a.crystals.map((c) => (hit(c.key) ? { ...c, lastCleansed: action.at } : c)) };
  });
}

/** Move an altar into a place (1-based), or take it off the home screen with 0. */
export function chooseSlot(chosen: (string | null)[], altarId: string, slot: number): (string | null)[] {
  const next = Array.from({ length: ALTAR_WIDGET_SLOTS }, (_, i) => (chosen[i] === altarId ? null : chosen[i] ?? null));
  if (slot >= 1 && slot <= ALTAR_WIDGET_SLOTS) next[slot - 1] = altarId;
  return next;
}

function changeObjects(doc: AltarDocument, key: string, pick: (o: SavedObject) => boolean, change: (o: SavedObject) => SavedObject): AltarDocument {
  let changed = false;
  const objects = doc.objects.map((object, index) => {
    if (!pick(object) || (key && objectKey(object, index) !== key)) return object;
    const next = change(object);
    if (next !== object) changed = true;
    return next;
  });
  return changed ? { ...doc, objects } : doc;
}

/** Carry out one widget action on an altar's document. */
export function applyWidgetAction(doc: AltarDocument, action: WidgetAction, now: string): AltarDocument {
  const at = action.at || now;
  switch (action.kind) {
    case 'light':
      return action.key ? changeObjects(doc, action.key, isCandle, (o) => lightCandle(o, at)) : lightAll(doc, at);
    case 'snuff':
      return action.key ? changeObjects(doc, action.key, isCandle, (o) => snuffCandle(o, at)) : snuffAll(doc, at);
    case 'offer':
      // The offering you chose for this presence in the app, or a simple devotional act.
      return changeObjects(doc, action.key, isPresence, (o) => {
        const chosen = defaultOfferingOf(o, now);
        return recordOffering(
          o,
          {
            types: chosen?.types.length ? chosen.types : chosen ? [] : ['Devotional act'],
            supports: chosen?.supports ?? [],
            customItems: chosen?.customItems ?? '',
            intention: chosen?.intention ?? '',
            message: chosen?.message || 'Offered from the home screen.',
            status: 'Offered',
            customStatus: '',
            response: '',
            responseNotes: '',
            occurredAt: at,
          },
          now,
        );
      });
    case 'cleanse':
      // The cleansing you chose for this crystal in the app, or a routine cleansing by intention.
      return changeObjects(doc, action.key, isCrystal, (o) => {
        const chosen = defaultCleansingOf(o, now);
        return careForCrystal(
          o,
          'cleanse',
          {
            decision: crystalDecisions('cleanse', !!crystalIntention(o, now))[0],
            purpose: chosen?.purpose ?? 'Routine care',
            methods: chosen?.methods ?? ['Intention'],
            supports: chosen?.supports ?? [],
            notes: chosen?.notes || 'Cleansed from the home screen.',
            occurredAt: at,
          },
          now,
        );
      });
    default:
      return doc;
  }
}

/** The altars the actions change, each with its new document, in the order the actions were taken. */
export function applyWidgetActions(altars: SavedAltar[], actions: WidgetAction[], now: string): { altar: SavedAltar; doc: AltarDocument }[] {
  const docs = new Map<string, { altar: SavedAltar; doc: AltarDocument }>();
  for (const action of [...actions].sort((a, b) => a.at.localeCompare(b.at))) {
    const altar = altars.find((a) => a.id === action.altarId);
    if (!altar) continue;
    const current = docs.get(altar.id) ?? { altar, doc: documentFromAltar(altar) };
    docs.set(altar.id, { altar, doc: applyWidgetAction(current.doc, action, now) });
  }
  return [...docs.values()].filter(({ altar, doc }) => doc !== documentFromAltar(altar) && JSON.stringify(doc.objects) !== JSON.stringify(documentFromAltar(altar).objects));
}
