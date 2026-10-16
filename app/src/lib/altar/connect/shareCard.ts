// The share card: an altar drawn as one picture, the way the altar stage and
// the home-screen widget draw it (lib/altarWidget altarScene and sceneFrame),
// with the altar's name, the moon and the date beneath. This works out every
// position and size; components/altar/connect/AltarCard.tsx draws it with
// react-native-svg and the share sheet saves it as a PNG. Nothing leaves the
// phone unless you share it. Pure, so it can be tested.

import { DEFAULT_BACKGROUND } from '../cabinet.ts';
import { boxToPixels, displayBox, imageRatio } from '../geometry.ts';
import { stackOrder } from '../layers.ts';
import type { SavedObject } from '../types.ts';
import { altarScene, sceneFrame, STAGE_HEIGHT, type StageRect } from '../../altarWidget.ts';
import { moonState, type PhaseName } from '../../moon.ts';
import { fullDate } from '../../calendar.ts';

export type CardRect = { x: number; y: number; w: number; h: number };

export type CardItem = {
  key: string;
  /** Saved picture path (resolve with altarImageSource), or "" for a symbol. */
  path: string;
  symbol: string;
  /** The picture's area, in card points. */
  rect: CardRect;
  /** Rotation centre. */
  cx: number;
  cy: number;
  rotation: number;
  flipped: boolean;
  opacity: number;
  flame?: CardRect;
  halo?: CardRect;
};

export type CardPool = { x: number; y: number; r: number };

export type CardScene = {
  width: number;
  height: number;
  /** The altar part of the card (the words go beneath it). */
  sceneHeight: number;
  background: { path: string; rect: CardRect };
  pools: CardPool[];
  items: CardItem[];
};

export type ShareCard = CardScene & {
  name: string;
  /** "Waxing Gibbous · October 16, 2026" */
  line: string;
  moon: { name: PhaseName; illumination: number; waxing: boolean };
  /** Top of the words panel. */
  panelY: number;
};

export type SceneOptions = {
  width: number;
  height: number;
  /** Where the objects' middle sits, as a fraction of the height. */
  focus?: number;
  /** How far the altar may zoom in to fill the picture. */
  zoom?: number;
  now?: number;
};

const backgroundOf = (path: string | undefined | null) => path || DEFAULT_BACKGROUND;

/** The altar's objects and background laid out in a width × height picture. */
export function composeScene(objects: SavedObject[], background: string | undefined | null, options: SceneOptions): CardScene {
  const { width, height } = options;
  const bg = backgroundOf(background);
  const ratio = imageRatio(bg) ?? STAGE_HEIGHT;
  const scene = altarScene(objects, (p) => p);
  const symbols = stackOrder(objects)
    .map((i) => objects[i])
    .filter((o) => !o.imagePath && o.fallbackSymbol)
    .map((o, i) => {
      const px = boxToPixels(displayBox(o), 1);
      return { key: String(o.altarObjectId || `s${i}`), symbol: String(o.fallbackSymbol), box: { x: px.left, y: px.top, w: px.width, h: px.height } as StageRect, rotation: Number(o.rotation) || 0, flipped: o.flipped === 'true' };
    });
  const boxes = [...scene.map((s) => s.box), ...symbols.map((s) => s.box)];
  const { W, ox, oy } = sceneFrame(boxes, { w: width, h: height, focus: options.focus ?? 0.55, zoom: options.zoom ?? 1.6 }, ratio);
  const H = W * STAGE_HEIGHT;
  const drawnW = Math.max(W, H / ratio);
  const drawnH = drawnW * ratio;
  const toCard = (b: StageRect): CardRect => ({ x: b.x * W - ox, y: b.y * W - oy, w: b.w * W, h: b.h * W });

  const items: CardItem[] = scene.map((s) => {
    const box = toCard(s.box);
    const rect = { x: box.x + s.inset.x * box.w, y: box.y + s.inset.y * box.h, w: box.w * (1 - 2 * s.inset.x), h: box.h * (1 - 2 * s.inset.y) };
    const part = (r: StageRect | undefined) => (r ? { x: box.x + r.x * box.w, y: box.y + r.y * box.h, w: r.w * box.w, h: r.h * box.h } : undefined);
    return {
      key: s.key,
      path: s.image,
      symbol: '',
      rect,
      cx: box.x + box.w / 2,
      cy: box.y + box.h / 2,
      rotation: s.rotation,
      flipped: s.flipped,
      opacity: s.spent ? 0.45 : 1,
      ...(s.lit && s.flame ? { flame: part(s.flame), halo: part(s.halo) } : {}),
    };
  });
  for (const s of symbols) {
    const box = toCard(s.box);
    items.push({ key: s.key, path: '', symbol: s.symbol, rect: box, cx: box.x + box.w / 2, cy: box.y + box.h / 2, rotation: s.rotation, flipped: s.flipped, opacity: 1 });
  }
  return {
    width,
    height,
    sceneHeight: height,
    background: { path: bg, rect: { x: -ox - (drawnW - W) / 2, y: -oy - (drawnH - H) / 2, w: drawnW, h: drawnH } },
    pools: scene.filter((s) => s.lit && s.pool).map((s) => ({ x: s.pool!.x * W - ox, y: s.pool!.y * W - oy, r: s.pool!.r * W })),
    items,
  };
}

export const CARD = { width: 1080, height: 1350, scene: 1080 } as const;

/** The share card for an altar: the scene in a square, the words beneath. */
export function composeShareCard(input: { name: string; objects: SavedObject[]; background?: string | null; at: Date }, size: { width: number; height: number; scene: number } = CARD): ShareCard {
  const scene = composeScene(input.objects, input.background, { width: size.width, height: size.scene, focus: 0.55, zoom: 1.6 });
  const moon = moonState(input.at);
  return {
    ...scene,
    height: size.height,
    sceneHeight: size.scene,
    name: input.name.trim() || 'My altar',
    line: `${moon.name} · ${fullDate(input.at) ?? ''}`,
    moon: { name: moon.name, illumination: moon.illumination, waxing: moon.waxing },
    panelY: size.scene,
  };
}

/** A file name for the saved picture: "altar-hearth-2026-10-16.png". */
export function cardFileName(name: string, at: Date): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `altar-${slug || 'altar'}-${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}.png`;
}

/**
 * The lit part of the moon as an SVG path on a circle of radius r at (cx, cy):
 * the bright limb is a half circle, the terminator an ellipse.
 */
export function moonPath(cx: number, cy: number, r: number, illumination: number, waxing: boolean): string {
  const k = Math.max(0, Math.min(1, illumination));
  if (k <= 0.005) return '';
  const rx = Math.abs(1 - 2 * k) * r;
  const sweepLimb = waxing ? 1 : 0;
  const sweepTerm = k > 0.5 ? sweepLimb : 1 - sweepLimb;
  return `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${sweepLimb} ${cx} ${cy + r} A ${rx} ${r} 0 0 ${sweepTerm} ${cx} ${cy - r} Z`;
}
