// How a poppet looks, and how its picture is put together. A poppet's body
// (cloth, wax, clay, corn husk or a root), dyed or left as it is, with its
// eyes and the pins set into it, drawn as the approved style test was drawn
// (pictures in assets/altar/poppet): the body dyed by its own light and dark
// so the weave, folds and stitches keep their shading; a soft shadow under
// it; eyes with a small shadow of their own (stitched eyes barely lift off the
// cloth); and each pin as a glass head on a short stub of shank, the rest of
// it inside the body, with a pucker where it goes in and a contact shadow
// cast down and right by the candle above.
//
// poppetPlan() turns a look into drawing steps; the phone draws them with
// Skia (components/altar/PoppetFigure.native.tsx) and the web with a canvas
// (PoppetFigure.tsx), so both show the same picture. Pure.
//
// Meanings: candle-colour meanings are the cabinet's own (cabinetKeywords);
// the meanings of pin colours, eyes and the places on the body are modern
// folk and Pagan practice, gathered from the candle-colour lore, not old
// recorded tradition, and the copy says so.

import { KEYWORD_OVERRIDES, keywordLine } from '../cabinetKeywords.ts';

// ─── Bodies ──────────────────────────────────────────────────────────────

export type ArtBody = 'cloth' | 'wax' | 'clay' | 'husk' | 'root';
type Pt = [number, number];

export type PinZone = 'head' | 'heart' | 'belly' | 'leftHand' | 'rightHand' | 'leftFoot' | 'rightFoot';

/**
 * Each body's picture: its size, its median brightness (the dye is scaled
 * from it), where the head is (0–1 across and down the picture) and where
 * the places for pins are. Measured from the pictures when they were cut.
 */
export const BODY_ART: Record<ArtBody, { path: string; w: number; h: number; med: number; head: { x: number; y: number; w: number }; zones: Record<Exclude<PinZone, 'head'>, Pt>; dye: 'full' | 'subtle' }> = {
  cloth: { path: 'assets/altar/poppet/bodies/cloth.png', w: 716, h: 960, med: 0.674, head: { x: 0.493, y: 0.185, w: 0.478 }, dye: 'full', zones: { heart: [0.56, 0.45], belly: [0.493, 0.61], leftHand: [0.073, 0.446], rightHand: [0.926, 0.446], leftFoot: [0.326, 0.88], rightFoot: [0.681, 0.88] } },
  wax: { path: 'assets/altar/poppet/bodies/wax.png', w: 722, h: 960, med: 0.721, head: { x: 0.489, y: 0.163, w: 0.471 }, dye: 'full', zones: { heart: [0.555, 0.45], belly: [0.489, 0.61], leftHand: [0.073, 0.444], rightHand: [0.926, 0.444], leftFoot: [0.323, 0.88], rightFoot: [0.676, 0.88] } },
  clay: { path: 'assets/altar/poppet/bodies/clay.png', w: 701, h: 960, med: 0.479, head: { x: 0.497, y: 0.169, w: 0.475 }, dye: 'subtle', zones: { heart: [0.564, 0.45], belly: [0.497, 0.61], leftHand: [0.073, 0.452], rightHand: [0.926, 0.452], leftFoot: [0.324, 0.88], rightFoot: [0.681, 0.88] } },
  husk: { path: 'assets/altar/poppet/bodies/husk.png', w: 711, h: 960, med: 0.68, head: { x: 0.495, y: 0.157, w: 0.422 }, dye: 'subtle', zones: { heart: [0.554, 0.45], belly: [0.495, 0.61], leftHand: [0.073, 0.429], rightHand: [0.926, 0.429], leftFoot: [0.342, 0.88], rightFoot: [0.66, 0.88] } },
  root: { path: 'assets/altar/poppet/bodies/root.png', w: 698, h: 960, med: 0.563, head: { x: 0.504, y: 0.199, w: 0.506 }, dye: 'subtle', zones: { heart: [0.574, 0.45], belly: [0.504, 0.61], leftHand: [0.074, 0.449], rightHand: [0.921, 0.449], leftFoot: [0.324, 0.88], rightFoot: [0.69, 0.88] } },
};

/** The poppet body (as saved: lib/altar/workings/poppet BODIES) to its picture, or null (paper has none). */
export const artBodyOf = (body: string | undefined): ArtBody | null => (body === 'corn' ? 'husk' : body && body in BODY_ART ? (body as ArtBody) : null);

/** Each material's short folk history, for the builder. */
export const MATERIAL_HISTORY: Record<string, string> = {
  cloth:
    'The word poppet is old English for a small doll. Cloth figures sewn round and stuffed with herbs are the commonest poppet today, mostly a twentieth-century folk and Pagan form; older records more often speak of wax or clay images.',
  wax: 'The oldest recorded kind. Greek and Roman binding rites used small figures of wax, lead or clay, and wax “pictures” turn up again and again in English and Scottish witch-trial records of the 1500s and 1600s. Beeswax softens in warm hands and takes a colour.',
  clay: 'Earth and clay figures are among the oldest image magic of all, from Egyptian figures written with the names of enemies to Greek curse figures. Air-drying clay, or a little earth from a place that matters; it goes back to the ground easily.',
  corn: 'Straw and corn figures belong to harvest across Europe, like the corn dolly made from the last sheaf and kept through winter. Corn-husk dolls are also a living craft of the Haudenosaunee and other Indigenous nations, with their own stories; here it is simply a folded, tied harvest figure.',
  root: 'In European lore the forked mandrake root looked like a person and was dressed and kept as a luck figure (the German Alraun). Mandrake was scarce in Britain, so white bryony root was sold in its place. Both are poisonous: handle them with gloves, or use a root with a body’s shape such as ginger.',
  paper: 'A figure cut from paper or card and filled with nothing but words. The simplest poppet, and the easiest to unmake.',
};

// ─── Colours ─────────────────────────────────────────────────────────────

type RGB = [number, number, number];

/**
 * Dye colours for the body, named as the cabinet's candle colours so each
 * carries the same meaning. Muted, as cloth and wax take them.
 */
export const BODY_COLOURS: { key: string; label: string; rgb: RGB }[] = [
  { key: 'white', label: 'White', rgb: [236, 232, 220] },
  { key: 'red', label: 'Red', rgb: [112, 24, 30] },
  { key: 'pink', label: 'Pink', rgb: [196, 128, 138] },
  { key: 'orange', label: 'Orange', rgb: [186, 102, 46] },
  { key: 'yellow', label: 'Yellow', rgb: [204, 164, 62] },
  { key: 'gold', label: 'Gold', rgb: [178, 140, 62] },
  { key: 'green', label: 'Green', rgb: [100, 122, 88] },
  { key: 'blue', label: 'Blue', rgb: [62, 86, 122] },
  { key: 'indigo', label: 'Indigo', rgb: [54, 54, 98] },
  { key: 'purple', label: 'Purple', rgb: [90, 58, 106] },
  { key: 'magenta', label: 'Magenta', rgb: [150, 42, 98] },
  { key: 'brown', label: 'Brown', rgb: [110, 76, 50] },
  { key: 'grey', label: 'Grey', rgb: [132, 130, 126] },
  { key: 'silver', label: 'Silver', rgb: [182, 184, 188] },
  { key: 'black', label: 'Black', rgb: [46, 42, 42] },
];

/** What a colour means, from the cabinet's candle of that colour ("Passion · Courage · Vitality"). */
export const colourMeaning = (key: string | undefined, max = 3) => (key ? keywordLine(KEYWORD_OVERRIDES[`candles:${key}-candle`], max) : '');

/** Pin heads: bright glass, each with what a pin of that colour is set in for. */
export const PIN_COLOURS: { key: string; label: string; rgb: RGB; meaning: string }[] = [
  { key: 'red', label: 'Red', rgb: [210, 30, 36], meaning: 'Vitality, strength and courage' },
  { key: 'white', label: 'White', rgb: [238, 236, 228], meaning: 'Healing, peace and cleansing' },
  { key: 'green', label: 'Green', rgb: [44, 132, 64], meaning: 'Growth, recovery and good luck' },
  { key: 'black', label: 'Black', rgb: [26, 24, 26], meaning: 'Banishing illness or harm, drawing out what hurts' },
  { key: 'blue', label: 'Blue', rgb: [44, 84, 172], meaning: 'Calm, rest and easing pain' },
  { key: 'yellow', label: 'Yellow', rgb: [232, 190, 44], meaning: 'Clarity, focus and good news' },
  { key: 'pink', label: 'Pink', rgb: [230, 122, 160], meaning: 'Self-love, gentleness and mending the heart' },
  { key: 'purple', label: 'Purple', rgb: [112, 52, 152], meaning: 'Intuition and spiritual strength' },
  { key: 'orange', label: 'Orange', rgb: [232, 122, 32], meaning: 'Confidence and energy to begin' },
  { key: 'gold', label: 'Gold', rgb: [212, 172, 62], meaning: 'Success and recognition' },
  { key: 'silver', label: 'Silver', rgb: [192, 194, 200], meaning: 'Dreams, reflection and intuition' },
];

export const pinColour = (key: string | undefined) => PIN_COLOURS.find((c) => c.key === key) ?? PIN_COLOURS[1];

// ─── Eyes ────────────────────────────────────────────────────────────────

export type EyeKind = 'none' | 'button' | 'cross' | 'bead' | 'stone' | 'seam';

/** The eyes, with what each is taken to mean (mostly modern practice). Size is a share of the head's width. */
export const EYES: { key: EyeKind; label: string; meaning: string; path: string; w: number; h: number; size: number; sewn: boolean }[] = [
  { key: 'button', label: 'Buttons', meaning: 'Open eyes sewn on: awake and watching over the work. The commonest poppet eye today.', path: 'assets/altar/poppet/eyes/button.png', w: 219, h: 220, size: 0.22, sewn: false },
  { key: 'cross', label: 'Cross-stitch', meaning: 'An X stitched in thread: in modern practice, eyes closed to harm, or turned away from what hurts.', path: 'assets/altar/poppet/eyes/cross.png', w: 220, h: 219, size: 0.2, sewn: true },
  { key: 'bead', label: 'Glass beads', meaning: 'Glass catches the light. Glass eyes echo the old charms against the evil eye: watchful and protecting.', path: 'assets/altar/poppet/eyes/bead.png', w: 217, h: 220, size: 0.17, sewn: false },
  { key: 'stone', label: 'Small stones', meaning: 'Pebbles from a place that matters, for steadiness and grounding: eyes that stay.', path: 'assets/altar/poppet/eyes/stone.png', w: 218, h: 220, size: 0.19, sewn: false },
  { key: 'seam', label: 'Closed seams', meaning: 'Sleeping eyes, for rest, healing and quiet: the figure rests while it works.', path: 'assets/altar/poppet/eyes/seam.png', w: 220, h: 90, size: 0.25, sewn: true },
  { key: 'none', label: 'No face', meaning: 'Left without a face, as many folk figures are: it stands for someone without becoming a portrait of them.', path: '', w: 0, h: 0, size: 0, sewn: false },
];

export const eyeOf = (key: string | undefined) => EYES.find((e) => e.key === key) ?? null;

// ─── What fills it, what links it, how it's sealed ───────────────────────

export const STUFFINGS: { key: string; label: string; note: string }[] = [
  { key: 'herbs', label: 'Dried herbs', note: 'Herbs chosen for the purpose, crumbled in.' },
  { key: 'wool', label: 'Wool', note: 'Natural wool: warm, and it rots down if buried.' },
  { key: 'cotton', label: 'Cotton', note: 'Cotton wadding or scraps of old cotton.' },
  { key: 'straw', label: 'Straw or hay', note: 'As harvest figures are filled.' },
  { key: 'moss', label: 'Moss', note: 'Dried moss, gathered with care.' },
  { key: 'grain', label: 'Rice or grain', note: 'For plenty and nourishment; it weighs the figure down.' },
];

/** The kind of link only. Nothing of the person is kept here: no picture, no hair, no name beyond what you write. */
export const TAGLOCKS: { key: string; label: string; note: string }[] = [
  { key: 'name', label: 'Name on paper', note: 'A name written on a slip of paper, folded inside.' },
  { key: 'photo', label: 'A photo', note: 'A printed photograph, folded inside. Kept with you, not in the app.' },
  { key: 'hair', label: 'Hair or nail', note: 'A strand of your own hair, or theirs given freely.' },
  { key: 'cloth', label: 'Cloth', note: 'A scrap of clothing, given freely, sewn in or wrapped round.' },
  { key: 'none', label: 'None', note: 'Named aloud only.' },
];

export const SEALS: { key: string; label: string; note: string }[] = [
  { key: 'stitch', label: 'A last stitch', note: 'The final stitch, knotted three times, closes it.' },
  { key: 'breath', label: 'Breath', note: 'Breathe on it, into the head, to wake it.' },
  { key: 'word', label: 'A word', note: 'Say its name and its purpose aloud as you close it.' },
];

// ─── Pins ────────────────────────────────────────────────────────────────

export const ZONES: { key: PinZone | 'free'; label: string; meaning: string }[] = [
  { key: 'head', label: 'Head', meaning: 'Thoughts, clarity, headaches and sleep' },
  { key: 'heart', label: 'Heart', meaning: 'Love, grief, courage, the heart itself' },
  { key: 'belly', label: 'Belly', meaning: 'Digestion, gut feeling and nourishment' },
  { key: 'leftHand', label: 'Left hand', meaning: 'Receiving, making and work' },
  { key: 'rightHand', label: 'Right hand', meaning: 'Giving, making and work' },
  { key: 'leftFoot', label: 'Left foot', meaning: 'The path ahead and standing firm' },
  { key: 'rightFoot', label: 'Right foot', meaning: 'The path ahead and standing firm' },
  { key: 'free', label: 'Anywhere', meaning: 'Wherever it needs to go' },
];

/** Where a zone's pin goes on this body (0–1 across and down the picture). */
export function zonePoint(body: ArtBody, zone: PinZone): Pt {
  const art = BODY_ART[body];
  if (zone === 'head') return [art.head.x + art.head.w * 0.12, art.head.y + ((art.head.w * art.w) / art.h) * 0.3];
  return art.zones[zone];
}

/** A tap on the body: the nearest zone when it's close, otherwise a free place. */
export function snapPin(body: ArtBody, x: number, y: number, reach = 0.11): { zone: PinZone | 'free'; x: number; y: number } {
  const cx = Math.min(1, Math.max(0, x));
  const cy = Math.min(1, Math.max(0, y));
  let best: { zone: PinZone; d: number; p: Pt } | null = null;
  for (const z of ZONES) {
    if (z.key === 'free') continue;
    const p = zonePoint(body, z.key);
    const d = Math.hypot(p[0] - cx, (p[1] - cy) * (BODY_ART[body].h / BODY_ART[body].w));
    if (!best || d < best.d) best = { zone: z.key, d, p };
  }
  return best && best.d <= reach ? { zone: best.zone, x: best.p[0], y: best.p[1] } : { zone: 'free', x: round3(cx), y: round3(cy) };
}

const round3 = (n: number) => Math.round(n * 1000) / 1000;

// ─── The picture ─────────────────────────────────────────────────────────

/** The pin's three pictures share a width; the head sits on the stub. */
export const PIN_ART = { head: { path: 'assets/altar/poppet/pin/head.png', h: 92 }, glint: { path: 'assets/altar/poppet/pin/glint.png', h: 92 }, stub: { path: 'assets/altar/poppet/pin/stub.png', h: 115 }, w: 96 };

export type PartKey = 'body' | 'eye' | 'pinHead' | 'pinGlint' | 'pinStub';

/** One drawing step, in picture units. Rotation (degrees) is about (ox, oy); a shadow is moved by (dx, dy) after it. */
export type DrawStep =
  | { kind: 'shadow'; part: PartKey; x: number; y: number; w: number; h: number; rot: number; ox: number; oy: number; dx: number; dy: number; blur: number; opacity: number }
  | { kind: 'image'; part: PartKey; x: number; y: number; w: number; h: number; rot: number; ox: number; oy: number; matrix: number[] | null; opacity: number }
  | { kind: 'pucker'; cx: number; cy: number; rx: number; ry: number; blur: number; opacity: number };

export type PoppetPicture = { body: ArtBody; eye: EyeKind; width: number; height: number; steps: DrawStep[] };

/** Shadows are this colour (a warm near-black). */
export const SHADOW_RGB: RGB = [20, 12, 6];
export const PUCKER_RGB: RGB = [30, 18, 8];
const PAD = 60;

/**
 * The 4×5 colour matrix (row-major, as Skia's ColorMatrix takes it, no
 * offsets) that dyes a picture `rgb`: each pixel's brightness against the
 * picture's median drives the dye, so shading is kept. `strength` mixes
 * with the picture's own colour (1 = fully dyed).
 */
export function dyeMatrix(rgb: RGB, med: number, strength = 1): number[] {
  const s = Math.min(1, Math.max(0, strength));
  const row = (c: number, i: number) => {
    const k = (s * (c / 255)) / Math.max(0.05, med);
    const r = [k * 0.299, k * 0.587, k * 0.114, 0, 0];
    r[i] += 1 - s;
    return r;
  };
  return [...row(rgb[0], 0), ...row(rgb[1], 1), ...row(rgb[2], 2), 0, 0, 0, 1, 0];
}

/** A pin head's colour: the white glass head darkened and coloured by its own shading. */
export const pinMatrix = (rgb: RGB) => dyeMatrix(rgb, 235 / 255 / 1.15, 1);

/** A pin's tilt, the same each time for the same place (between −14° and 14°). */
export function pinAngle(x: number, y: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return Math.round(((h - Math.floor(h)) * 28 - 14) * 10) / 10;
}

export type LookInput = { body?: string; colour?: string; eyes?: string };
export type PinInput = { x: number; y: number; colour: string };

/** How much a body takes its colour: cloth and wax fully, clay, husk and root only a little. */
export const dyeStrength = (body: ArtBody) => (BODY_ART[body].dye === 'full' ? 1 : 0.28);

/** The picture of a poppet with this look and these pins, as drawing steps, or null for a body with no picture (paper). */
export function poppetPlan(look: LookInput, pins: PinInput[] = []): PoppetPicture | null {
  const body = artBodyOf(look.body ?? 'cloth');
  if (!body) return null;
  const art = BODY_ART[body];
  const bw = art.w;
  const bh = art.h;
  const width = bw + PAD * 2;
  const height = bh + PAD * 2;
  const steps: DrawStep[] = [];
  const colour = BODY_COLOURS.find((c) => c.key === look.colour);
  const matrix = colour ? dyeMatrix(colour.rgb, art.med, dyeStrength(body)) : null;
  steps.push({ kind: 'shadow', part: 'body', x: PAD, y: PAD, w: bw, h: bh, rot: 0, ox: 0, oy: 0, dx: 14, dy: 18, blur: 16, opacity: 0.45 });
  steps.push({ kind: 'image', part: 'body', x: PAD, y: PAD, w: bw, h: bh, rot: 0, ox: 0, oy: 0, matrix, opacity: 1 });

  const headW = art.head.w * bw;
  const hx = PAD + art.head.x * bw;
  const hy = PAD + art.head.y * bh;
  const eye = eyeOf(look.eyes ?? 'button') ?? EYES[0];
  if (eye.key !== 'none') {
    const w = headW * eye.size;
    const h = (w * eye.h) / eye.w;
    for (const side of [-1, 1]) {
      const x = hx + side * headW * 0.2 - w / 2;
      const y = hy - headW * 0.06 - h / 2;
      steps.push(
        eye.sewn
          ? { kind: 'shadow', part: 'eye', x, y, w, h, rot: 0, ox: 0, oy: 0, dx: 2, dy: 3, blur: 2, opacity: 0.45 }
          : { kind: 'shadow', part: 'eye', x, y, w, h, rot: 0, ox: 0, oy: 0, dx: 5, dy: 7, blur: 4, opacity: 0.6 },
      );
      steps.push({ kind: 'image', part: 'eye', x, y, w, h, rot: 0, ox: 0, oy: 0, matrix: null, opacity: eye.sewn ? 0.95 : 1 });
    }
  }

  // Pins: a little larger than the style test's, so they read and can be tapped on a phone.
  const size = headW * 0.14;
  const k = size / PIN_ART.w;
  const headH = PIN_ART.head.h * k;
  const stubH = PIN_ART.stub.h * k;
  for (const pin of pins.slice(0, MAX_PINS)) {
    const ox = PAD + clamp01(pin.x) * bw;
    const oy = PAD + clamp01(pin.y) * bh;
    const rot = pinAngle(pin.x, pin.y);
    const x = ox - size / 2;
    const stubY = oy - stubH * 0.9;
    const headY = stubY - headH + k * 2;
    const r = Math.max(3, size * 0.18);
    const pinMx = pinMatrix(pinColour(pin.colour).rgb);
    steps.push({ kind: 'pucker', cx: ox, cy: oy, rx: r * 1.6, ry: r * 0.7, blur: r * 0.6, opacity: 0.43 });
    for (const [part, y, h] of [['pinStub', stubY, stubH], ['pinHead', headY, headH]] as const) {
      steps.push({ kind: 'shadow', part, x, y, w: size, h, rot, ox, oy, dx: size * 0.35, dy: size * 0.45, blur: size * 0.18, opacity: 0.55 });
    }
    steps.push({ kind: 'image', part: 'pinStub', x, y: stubY, w: size, h: stubH, rot, ox, oy, matrix: null, opacity: 1 });
    steps.push({ kind: 'image', part: 'pinHead', x, y: headY, w: size, h: headH, rot, ox, oy, matrix: pinMx, opacity: 1 });
    steps.push({ kind: 'image', part: 'pinGlint', x, y: headY, w: size, h: headH, rot, ox, oy, matrix: null, opacity: 1 });
  }
  return { body, eye: eye.key, width, height, steps };
}

export const MAX_PINS = 13;
const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.5);

/** Where a point on the body (0–1 of the body picture) lands in the whole picture (0–1), for tapping and markers. */
export function bodyToPicture(body: ArtBody, x: number, y: number): Pt {
  const art = BODY_ART[body];
  return [(PAD + x * art.w) / (art.w + PAD * 2), (PAD + y * art.h) / (art.h + PAD * 2)];
}

export function pictureToBody(body: ArtBody, x: number, y: number): Pt {
  const art = BODY_ART[body];
  return [(x * (art.w + PAD * 2) - PAD) / art.w, (y * (art.h + PAD * 2) - PAD) / art.h];
}

/** The picture's path for a part, as altarPicture takes it. */
export function partPath(plan: Pick<PoppetPicture, 'body' | 'eye'>, part: PartKey): string {
  if (part === 'body') return BODY_ART[plan.body].path;
  if (part === 'eye') return eyeOf(plan.eye)?.path ?? '';
  return part === 'pinHead' ? PIN_ART.head.path : part === 'pinGlint' ? PIN_ART.glint.path : PIN_ART.stub.path;
}

/** "Red cloth poppet with button eyes": the look in a few words. */
export function lookWords(look: LookInput & { stuffing?: string; taglock?: string; seal?: string }): string {
  const body = artBodyOf(look.body);
  const material = body === 'husk' ? 'corn husk' : (look.body ?? 'cloth');
  const colour = BODY_COLOURS.find((c) => c.key === look.colour)?.label.toLowerCase();
  const eye = eyeOf(look.eyes);
  const parts = [`${colour ? `${colour} ` : ''}${material} poppet`];
  if (eye) parts.push(eye.key === 'none' ? 'with no face' : `with ${eye.label.toLowerCase()} for eyes`);
  const stuff = STUFFINGS.find((s) => s.key === look.stuffing);
  if (stuff) parts.push(`filled with ${stuff.label.toLowerCase()}`);
  const tag = TAGLOCKS.find((t) => t.key === look.taglock && t.key !== 'none');
  if (tag) parts.push(`linked by ${tag.label.toLowerCase()}`);
  const seal = SEALS.find((s) => s.key === look.seal);
  if (seal) parts.push(`sealed with ${seal.label.toLowerCase().replace(/^an? /, 'a ')}`);
  const s = parts.join(', ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
