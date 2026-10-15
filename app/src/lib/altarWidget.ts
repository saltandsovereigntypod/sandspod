// The Altar widget: one of your saved altars on the home screen, with its
// candles, the presences on it, its crystals and workings, and buttons to
// light the candles, tend offerings and cleanse crystals without opening the
// app. A tap changes the widget at once and leaves a note of what was done
// (an action); the next time the app opens it carries each action out on the
// real altar, which then saves and syncs as usual. Pure, so it can be tested.

import { careForCrystal, crystalDecisions, crystalIntention, crystalState, deityState, recordOffering } from './altar/devotion.ts';
import { DEFAULT_BACKGROUND } from './altar/cabinet.ts';
import { lightAll, snuffAll } from './altar/editor.ts';
import { flameLayout } from './altar/flame.ts';
import { boxToPixels, candleLightRadius, displayBox, IMAGE_INSET, imageRatio, rotationOf, STAGE_ASPECT } from './altar/geometry.ts';
import { stackOrder } from './altar/layers.ts';
import { apothecaryStateOf, dressingOverlays, isCandle, isLit, lightCandle, readLivingState, snuffCandle } from './altar/livingState.ts';
import { documentFromAltar, type AltarDocument } from './altar/snapshot.ts';
import type { SavedAltar, SavedObject } from './altar/types.ts';

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
};

export type WidgetCrystal = {
  key: string;
  label: string;
  image: string;
  lastCleansed: string;
  lastCharged: string;
  intention: string;
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
};

export type AltarWidgetProps = {
  /** In slot order: the first is "Altar 1" in the widget's settings. */
  altars: WidgetAltar[];
  /** Null until the pictures are ready; the widget then draws a plain scene. */
  art: AltarWidgetArt | null;
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
export const WIDGET_VIEWS: Record<WidgetSize, { w: number; h: number; focus: number }> = {
  small: { w: 170, h: 170, focus: 0.48 },
  medium: { w: 364, h: 170, focus: 0.5 },
  large: { w: 364, h: 382, focus: 0.36 },
};
/**
 * Pixels a point for the pictures. iOS refuses (leaving the widget blank) any
 * picture with more pixels than the widget itself, so this stays well under a
 * 3× screen's widget size, which keeps them inside the limit on smaller iPhones too.
 */
const SCALE = 2;
/** Most objects drawn on a widget; the rest (the smallest) are left out. */
const MAX_SCENE_ITEMS = 40;
export const HERB_OVERLAY = '../assets/altar/overlays/candle-herb-overlay.png';
export const OIL_OVERLAY = '../assets/altar/overlays/candle-oil-overlay.png';

const backgroundOf = (altarBackground: string | undefined) => altarBackground || DEFAULT_BACKGROUND;

/** The objects the widget draws, back to front. */
function sceneObjects(objects: SavedObject[]): { object: SavedObject; index: number }[] {
  const ordered = stackOrder(objects).map((index) => ({ object: objects[index], index })).filter(({ object }) => !!object.imagePath);
  if (ordered.length <= MAX_SCENE_ITEMS) return ordered;
  const keep = new Set([...ordered].sort((a, b) => displayBox(b.object).size - displayBox(a.object).size).slice(0, MAX_SCENE_ITEMS).map((o) => o.index));
  return ordered.filter((o) => keep.has(o.index));
}

/**
 * How the altar fills a widget: the stage covers it, then zooms (up to twice)
 * until the arrangement fills most of it, slid so the objects sit at `focus`.
 */
export function sceneFrame(boxes: StageRect[], view: { w: number; h: number; focus: number }): { W: number; ox: number; oy: number } {
  const minX = boxes.length ? Math.min(...boxes.map((b) => b.x)) : 0;
  const maxX = boxes.length ? Math.max(...boxes.map((b) => b.x + b.w)) : 1;
  const minY = boxes.length ? Math.min(...boxes.map((b) => b.y)) : 0;
  const maxY = boxes.length ? Math.max(...boxes.map((b) => b.y + b.h)) : STAGE_HEIGHT;
  const cover = Math.max(view.w, view.h * STAGE_ASPECT);
  const fit = Math.min((view.w * 0.72) / Math.max(0.05, maxX - minX), (view.h * 0.55) / Math.max(0.03, maxY - minY));
  const W = Math.max(cover, Math.min(fit, cover * 2));
  const clamp = (v: number, hi: number) => Math.max(0, Math.min(hi, v));
  return {
    W,
    ox: clamp(((minX + maxX) / 2) * W - view.w / 2, W - view.w),
    oy: clamp(((minY + maxY) / 2) * W - view.h * view.focus, W * STAGE_HEIGHT - view.h),
  };
}

/** A picture the widget needs: a saved path, the width to make it, and for backgrounds the part to cut out (fractions of the image). */
export type WidgetPicture = { id: string; path: string; width: number; crop?: StageRect };

const backgroundId = (size: WidgetSize, path: string) => `bg-${size}:${path}`;

/** The cut of the background (as the stage draws it, covering 16:9) that a widget size shows. */
function backgroundCrop(path: string, frame: { W: number; ox: number; oy: number }, view: { w: number; h: number }): StageRect {
  const ratio = imageRatio(path) ?? 1 / STAGE_ASPECT; // height / width
  const H = frame.W * STAGE_HEIGHT;
  // Drawn to cover W × H, centred.
  const scale = Math.max(frame.W, H / ratio);
  const drawnW = scale;
  const drawnH = scale * ratio;
  const left = (drawnW - frame.W) / 2 + frame.ox;
  const top = (drawnH - H) / 2 + frame.oy;
  return { x: left / drawnW, y: top / drawnH, w: view.w / drawnW, h: view.h / drawnH };
}

/** Every picture the widget needs for an altar, each made just big enough to stay sharp. */
export function altarPictures(altar: SavedAltar): WidgetPicture[] {
  const doc = documentFromAltar(altar);
  const objects = sceneObjects(doc.objects);
  const boxes = objects.map(({ object }) => boxRect(object));
  const background = backgroundOf(doc.background);
  const out: WidgetPicture[] = [];
  let widest = 0;
  for (const size of Object.keys(WIDGET_VIEWS) as WidgetSize[]) {
    const view = WIDGET_VIEWS[size];
    const frame = sceneFrame(boxes, view);
    widest = Math.max(widest, frame.W);
    out.push({ id: backgroundId(size, background), path: background, width: view.w * SCALE, crop: backgroundCrop(background, frame, view) });
  }
  const sizes = new Map<string, number>();
  for (const { object } of objects) {
    const path = String(object.imagePath);
    sizes.set(path, Math.max(sizes.get(path) ?? 0, displayBox(object).size * widest * SCALE));
    const overlays = dressingOverlays(object);
    if (overlays.herb) sizes.set(HERB_OVERLAY, Math.max(sizes.get(HERB_OVERLAY) ?? 0, displayBox(object).size * widest * SCALE));
    if (overlays.oil) sizes.set(OIL_OVERLAY, Math.max(sizes.get(OIL_OVERLAY) ?? 0, displayBox(object).size * widest * SCALE));
  }
  for (const [path, width] of sizes) out.push({ id: path, path, width: Math.min(360, Math.max(48, Math.ceil(width * 1.25))) });
  return out;
}

function boxRect(object: SavedObject): StageRect {
  const px = boxToPixels(displayBox(object), 1);
  return { x: px.left, y: px.top, w: px.width, h: px.height };
}

/** Where each object sits, as the app's altar stage draws it (AltarStage). */
export function altarScene(objects: SavedObject[], image: (path: string) => string): SceneItem[] {
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
      const dressed = dressingOverlays(object);
      if (dressed.herb) item.overlays.push({ image: image(HERB_OVERLAY), rect: { x: -0.01, y: 0.08, w: 1, h: 0.8 }, opacity: 1 });
      if (dressed.oil) item.overlays.push({ image: image(OIL_OVERLAY), rect: { x: 0, y: 0.11, w: 0.94, h: 0.7 }, opacity: 0.55 });
    }
    return item;
  });
}



/** What the widget shows for one altar. `image` turns a saved picture path into a file the widget can read. */
export function widgetAltar(altar: SavedAltar, image: (path: string) => string, now: Date): WidgetAltar {
  const doc = documentFromAltar(altar);
  const scene = altarScene(doc.objects, image);
  const iso = now.toISOString();
  const keyed = doc.objects.map((object, index) => ({ object, key: objectKey(object, index) }));
  const candles = keyed.filter(({ object }) => isCandle(object));
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
        { ...sceneFrame(scene.map((item) => item.box), WIDGET_VIEWS[size]), background: image(backgroundId(size, backgroundOf(doc.background))) },
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
      .map(({ object, key }) => ({ key, label: label(object, 'Presence'), image: picture(object), lastOffering: String(deityState(object, iso).lastOfferingAt || '') })),
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
      return changeObjects(doc, action.key, isPresence, (o) =>
        recordOffering(
          o,
          {
            types: ['Devotional act'],
            supports: [],
            customItems: '',
            intention: '',
            message: 'Offerings tended from the home screen.',
            status: 'Offered',
            customStatus: '',
            response: '',
            responseNotes: '',
            occurredAt: at,
          },
          now,
        ),
      );
    case 'cleanse':
      return changeObjects(doc, action.key, isCrystal, (o) =>
        careForCrystal(
          o,
          'cleanse',
          {
            decision: crystalDecisions('cleanse', !!crystalIntention(o, now))[0],
            purpose: 'Routine care',
            methods: ['Intention'],
            supports: [],
            notes: 'Cleansed from the home screen.',
            occurredAt: at,
          },
          now,
        ),
      );
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
