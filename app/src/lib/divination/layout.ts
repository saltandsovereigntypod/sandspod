// Where each card, rune or stave lies on the table, for every spread: one
// shared, pure model so the app and the website lay a draw out the same way
// (and the same again when a kept reading is opened).
//
// Everything is measured in item widths: a tarot card is 1 wide and 1.72
// tall, a rune stone 1 by 1.18, an ogham stave 1 by 3.65. A slot is the
// centre of its item and a turn in degrees (clockwise, as CSS turns). `laid`
// moves it all so the top left of the whole is at 0, 0.

import { ORACLE_LAYOUTS } from './oracle/spreads.ts';

export type ItemKind = 'tarot' | 'runes' | 'ogham' | 'lenormand' | 'kipper' | 'oracle';
export type Dims = { w: number; h: number };

export const ITEM: Record<ItemKind, Dims> = {
  tarot: { w: 1, h: 1 / 0.58 },
  runes: { w: 1, h: 1.18 },
  ogham: { w: 1, h: 190 / 52 },
  // The Bruges Lenormand is a little squarer than a tarot card; the Kipper cards are drawn a little taller.
  lenormand: { w: 1, h: 1 / 0.68 },
  kipper: { w: 1, h: 1 / 0.62 },
  // Decks of your own are laid out as tarot cards are.
  oracle: { w: 1, h: 1 / 0.58 },
};

/** The space left between neighbours, in item widths. */
const GAP: Record<ItemKind, number> = { tarot: 0.2, runes: 0.3, ogham: 0.7, lenormand: 0.12, kipper: 0.12, oracle: 0.2 };

export type Slot = { x: number; y: number; rot?: number };

/** The shapes you can give a spread of your own. */
export type Shape = 'line' | 'cross' | 'arc' | 'circle' | 'grid';
export const SHAPES: { id: Shape; label: string }[] = [
  { id: 'line', label: 'A line' },
  { id: 'cross', label: 'A cross' },
  { id: 'arc', label: 'An arc' },
  { id: 'circle', label: 'A circle' },
  { id: 'grid', label: 'A grid' },
];

// ─── Geometry ────────────────────────────────────────────────────────────

/** Half the width and height of the box an item fills once turned. */
export function halfBox(d: Dims, rot = 0): { hw: number; hh: number } {
  const r = (rot * Math.PI) / 180;
  const c = Math.abs(Math.cos(r));
  const s = Math.abs(Math.sin(r));
  return { hw: (c * d.w + s * d.h) / 2, hh: (s * d.w + c * d.h) / 2 };
}

/** Whether two items' boxes come closer than `gap` (a little air between them). */
export function overlaps(d: Dims, a: Slot, b: Slot, gap = 0.04): boolean {
  const A = halfBox(d, a.rot);
  const B = halfBox(d, b.rot);
  return Math.abs(a.x - b.x) < A.hw + B.hw + gap && Math.abs(a.y - b.y) < A.hh + B.hh + gap;
}

const clash = (d: Dims, slots: Slot[], s: Slot) => slots.some((o) => overlaps(d, o, s));
const round = (n: number) => Math.round(n * 1000) / 1000;

// ─── Shapes ──────────────────────────────────────────────────────────────

const steps = (kind: ItemKind) => {
  const d = ITEM[kind];
  return { d, sx: d.w + GAP[kind], sy: d.h + GAP[kind] };
};

export function lineSlots(kind: ItemKind, n: number): Slot[] {
  const { sx } = steps(kind);
  return Array.from({ length: n }, (_, i) => ({ x: i * sx, y: 0 }));
}

export function gridSlots(kind: ItemKind, n: number): Slot[] {
  const { sx, sy } = steps(kind);
  const cols = n <= 3 ? n : n === 4 ? 2 : Math.ceil(Math.sqrt(n));
  return Array.from({ length: n }, (_, i) => ({ x: (i % cols) * sx, y: Math.floor(i / cols) * sy }));
}

/** The middle first, then left, right, above and below, and outward again for more. */
export function crossSlots(kind: ItemKind, n: number): Slot[] {
  const { sx, sy } = steps(kind);
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  return Array.from({ length: n }, (_, i) => {
    if (i === 0) return { x: 0, y: 0 };
    const [dx, dy] = dirs[(i - 1) % 4];
    const k = Math.floor((i - 1) / 4) + 1;
    return { x: dx * k * sx, y: dy * k * sy };
  });
}

/**
 * A curve like a horseshoe, open at the top (or at the bottom when `depth` is
 * negative), each card leaning a little with the curve.
 */
export function arcSlots(kind: ItemKind, n: number, depth?: number, lean = 12): Slot[] {
  const { d } = steps(kind);
  if (n <= 2) return lineSlots(kind, n);
  const mid = (n - 1) / 2;
  const dip = depth ?? d.h * 1.6;
  const at = (sx: number) =>
    Array.from({ length: n }, (_, i) => {
      const t = (i - mid) / mid; // -1 to 1
      return { x: round((i - mid) * sx), y: round(dip * (1 - t * t)), rot: round(t * lean * Math.sign(dip)) };
    });
  // As close together as they'll go: the steep ends can tuck in under one another.
  for (let sx = d.w * 0.5; ; sx += 0.05) {
    const slots = at(sx);
    if (slots.every((s, i) => !slots.some((o, j) => j !== i && overlaps(d, o, s, GAP[kind] * 0.6)))) return slots;
  }
}

/**
 * Items round a circle, as close as they'll go without touching. The first
 * sits at `start` degrees (0 is the top, going clockwise), the rest follow
 * clockwise, or anticlockwise when `clockwise` is false; `centre` adds one
 * more in the middle, last.
 */
export function circleSlots(kind: ItemKind, n: number, { start = 0, clockwise = true, centre = false }: { start?: number; clockwise?: boolean; centre?: boolean } = {}): Slot[] {
  const { d } = steps(kind);
  if (n === 1 && !centre) return [{ x: 0, y: 0 }];
  const ring = (r: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = ((start + (clockwise ? 1 : -1) * (360 / n) * i) * Math.PI) / 180;
      return { x: round(r * Math.sin(a)), y: round(-r * Math.cos(a)) };
    });
  const middle: Slot[] = centre ? [{ x: 0, y: 0 }] : [];
  let r = d.w;
  for (;;) {
    const slots = ring(r);
    const all = [...slots, ...middle];
    if (all.every((s, i) => !all.some((o, j) => j !== i && overlaps(d, o, s, GAP[kind] * 0.6)))) return all;
    r += 0.05;
  }
}

export function shapeSlots(kind: ItemKind, shape: Shape, n: number): Slot[] {
  if (shape === 'cross') return crossSlots(kind, n);
  if (shape === 'arc') return arcSlots(kind, n);
  if (shape === 'circle') return circleSlots(kind, n);
  if (shape === 'grid') return gridSlots(kind, n);
  return lineSlots(kind, n);
}

// ─── The spreads' own layouts ────────────────────────────────────────────

type Built = { slots: Slot[]; crossings?: [number, number][] };

function celticCross(): Built {
  // Waite's layout: 3 above, 5 behind, 1 with 2 across it, 6 before, 4
  // beneath; the staff 7 to 10 from the bottom up, standing apart.
  const { h } = ITEM.tarot;
  const col = (c: number) => c * 1.42;
  const row = (r: number) => r * (h + 0.14);
  const staffX = col(3) + 0.25;
  const crossH = h * 3 + 0.28;
  const staffStep = h + 0.1;
  const top = (h * 4 + 0.3 - crossH) / 2;
  const at = (c: number, r: number, rot = 0): Slot => ({ x: col(c), y: top + row(r), rot });
  const staff = (k: number): Slot => ({ x: staffX, y: (3 - k) * staffStep, rot: 0 });
  return { slots: [at(1, 1), at(1, 1, 90), at(1, 0), at(1, 2), at(0, 1), at(2, 1), staff(0), staff(1), staff(2), staff(3)], crossings: [[0, 1]] };
}

function plus(kind: ItemKind): Slot[] {
  // Middle, left, right, above, below: the shape most five-place spreads take.
  return crossSlots(kind, 5);
}

/** Five-card cross: the present in the middle, past and future to either side, above and below. */
const fiveCross = (kind: ItemKind): Built => {
  const s = plus(kind);
  return { slots: [s[0], s[1], s[2], s[4], s[3]] }; // present, past, future, beneath, above
};

/** The Tree of Life: three pillars, the sephiroth in their places from the Crown down to the Kingdom. */
function treeOfLife(): Built {
  const p = 1.6; // between the pillars
  const m = 1.32; // one step down the tree
  // Facing the tree: Wisdom, Mercy and Victory on the right; Understanding, Severity and Splendour on the left.
  const at = (x: number, y: number): Slot => ({ x: x * p, y: y * m });
  return { slots: [at(0, 0), at(1, 1), at(-1, 1), at(1, 2.6), at(-1, 2.6), at(0, 3.6), at(1, 4.6), at(-1, 4.6), at(0, 6), at(0, 7.5)] };
}

/** Two paths from where you stand: three cards up each fork. */
function twoPaths(): Built {
  const { h } = ITEM.tarot;
  const sy = h + 0.25;
  const sx = 0.8;
  const slots: Slot[] = [{ x: 0, y: 3 * sy }];
  for (const side of [-1, 1]) for (let k = 1; k <= 3; k++) slots.push({ x: side * k * sx, y: (3 - k) * sy });
  return { slots };
}

/** Into the dark and back: down three steps and up again. */
function descent(): Built {
  const { h } = ITEM.tarot;
  const fall = h * 0.62;
  return { slots: [0, 1, 2, 3, 4].map((i) => ({ x: i * 1.25, y: (2 - Math.abs(2 - i)) * fall })) };
}

/** You and them side by side, what's between you above. */
function relationship(): Built {
  const { h } = ITEM.tarot;
  return { slots: [{ x: -0.7, y: h * 0.7 }, { x: 0.7 + 1.2, y: h * 0.7 }, { x: 0.6, y: -h * 0.45 }] };
}

/** A gateway: two posts of two cards, a lintel card between their tops. */
function gateway(): Built {
  const { h } = ITEM.tarot;
  const sy = h + 0.2;
  return { slots: [{ x: 0, y: 1.4 * sy }, { x: 0, y: 0.4 * sy }, { x: 1.25, y: 0 }, { x: 2.5, y: 0.4 * sy }, { x: 2.5, y: 1.4 * sy }] };
}

/** The four elements at the quarters and spirit at the heart: earth above (north), air right, fire below, water left. */
function elemental(): Built {
  const s = plus('tarot');
  return { slots: [s[3], s[2], s[4], s[1], s[0]] };
}

/** The nine worlds as many modern heathens draw the tree: Asgard at the top, Hel at the roots. */
function nineWorlds(): Built {
  const { sx, sy } = steps('runes');
  const at = (c: number, r: number): Slot => ({ x: c * sx, y: r * sy });
  return { slots: [at(0, 0), at(-1, 0.8), at(1, 0.8), at(-1.3, 2), at(0, 2), at(1.3, 2), at(-1, 3.2), at(1, 3.2), at(0, 4)] };
}

/** Ogham staves for the four quarters and the centre: north and south lie across, west, centre and east stand. */
function fiveStaves(): Built {
  const { h } = ITEM.ogham;
  const sx = 1 + GAP.ogham;
  const off = h / 2 + 0.25 + 0.5;
  return { slots: [{ x: 0, y: -off, rot: 90 }, { x: sx, y: 0 }, { x: 0, y: off, rot: 90 }, { x: -sx, y: 0 }, { x: 0, y: 0 }] };
}

/** The houses round the wheel: the first just below the eastern horizon (on the left), turning anticlockwise. */
const wheel = (centre: boolean): Built => ({ slots: circleSlots('tarot', 12, { start: 255, clockwise: false, centre }) });

/** The months round a clock from the top, the year's theme in the middle. */
const yearAhead = (): Built => ({ slots: circleSlots('tarot', 12, { start: 0, clockwise: true, centre: true }) });

const BUILT: Record<string, () => Built> = {
  'celtic-cross': celticCross,
  'five-card-cross': () => fiveCross('tarot'),
  'five-rune-cross': () => fiveCross('runes'),
  'tree-of-life': treeOfLife,
  'two-paths': twoPaths,
  'shadow-work': descent,
  'you-them': relationship,
  samhain: gateway,
  elemental,
  'nine-worlds': nineWorlds,
  'five-staves': fiveStaves,
  horseshoe: () => ({ slots: arcSlots('tarot', 7) }),
  'new-moon': () => ({ slots: arcSlots('tarot', 5, ITEM.tarot.h * -0.9, 10) }),
  'full-moon': () => ({ slots: circleSlots('tarot', 4, { start: 0, centre: true }) }),
  'astro-wheel': () => wheel(false),
  'astro-wheel-centre': () => wheel(true),
  'year-ahead': yearAhead,
};

export const hasOwnLayout = (spreadId: string) => spreadId in BUILT || spreadId in ORACLE_LAYOUTS;

// ─── The cast: runes thrown onto a cloth ─────────────────────────────────

export type Ring = 'centre' | 'middle' | 'edge';
export const RINGS: Ring[] = ['centre', 'middle', 'edge'];
export type Fall = { ring: Ring; up: boolean };

/** A small repeatable generator, so the same cast lies the same way every time it's opened. */
function seededFrom(text: string) {
  let a = 2166136261;
  for (let i = 0; i < text.length; i++) a = Math.imul(a ^ text.charCodeAt(i), 16777619);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Where cast runes lie: each in its ring of the cloth, scattered round it
 * (repeatably, from the runes' names), never on top of one another. Returns
 * the slots in the draw's order and the outer edge of each ring.
 */
export function castSlots(names: string[], falls: Fall[]): { slots: Slot[]; rings: number[] } {
  const d = ITEM.runes;
  const random = seededFrom(names.join('|'));
  const slots: (Slot | null)[] = names.map(() => null);
  const placed: Slot[] = [];
  const rings: number[] = [];
  let inner = 0;
  for (const ring of RINGS) {
    const here = falls.map((f, i) => (f.ring === ring ? i : -1)).filter((i) => i >= 0);
    const turn = random() * 360;
    const tilts = here.map(() => Math.round((random() - 0.5) * 40));
    let r = ring === 'centre' ? (here.length <= 1 ? 0 : 0.75) : inner + 0.62;
    for (;;) {
      const mine = here.map((_, k) => {
        if (r === 0) return { x: 0, y: 0, rot: tilts[k] };
        const a = ((turn + (360 / here.length) * k + (random() - 0.5) * 8) * Math.PI) / 180;
        return { x: round(r * Math.sin(a)), y: round(-r * Math.cos(a)), rot: tilts[k] };
      });
      const ok = mine.every((s, k) => !clash(d, placed, s) && !mine.some((o, j) => j !== k && overlaps(d, o, s, 0.12)));
      if (ok) {
        here.forEach((i, k) => (slots[i] = mine[k]));
        placed.push(...mine);
        break;
      }
      r = r === 0 ? 0.75 : r + 0.08;
    }
    // The ring reaches past its stones, and the next starts beyond it.
    const reach = here.length ? r + 0.66 : 0;
    rings.push(round(Math.max(reach, inner + 1.1)));
    inner = rings[rings.length - 1];
  }
  return { slots: slots.map((s) => s ?? { x: 0, y: 0 }), rings };
}

// ─── Laid out ────────────────────────────────────────────────────────────

export type LaidSlot = {
  /** The item's unturned box, from the top left of the whole. */
  left: number;
  top: number;
  /** Its centre. */
  cx: number;
  cy: number;
  rot: number;
};

export type Laid = {
  width: number;
  height: number;
  item: Dims;
  slots: LaidSlot[];
  /** Pairs of places meant to lie across one another (the Celtic Cross). */
  crossings: [number, number][];
  /** For a cast: the cloth's middle and the outer edge of each ring. */
  cloth: { cx: number; cy: number; rings: number[] } | null;
};

/** Move slots so the whole sits from 0, 0, with `margin` all round. */
export function laid(kind: ItemKind, slots: Slot[], crossings: [number, number][] = [], cloth: { rings: number[] } | null = null, margin = 0.08): Laid {
  const d = ITEM[kind];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of slots) {
    const { hw, hh } = halfBox(d, s.rot);
    minX = Math.min(minX, s.x - hw);
    maxX = Math.max(maxX, s.x + hw);
    minY = Math.min(minY, s.y - hh);
    maxY = Math.max(maxY, s.y + hh);
  }
  if (cloth) {
    const r = cloth.rings[cloth.rings.length - 1] ?? 0;
    minX = Math.min(minX, -r);
    maxX = Math.max(maxX, r);
    minY = Math.min(minY, -r);
    maxY = Math.max(maxY, r);
  }
  if (!slots.length) [minX, minY, maxX, maxY] = [0, 0, d.w, d.h];
  const ox = margin - minX;
  const oy = margin - minY;
  return {
    width: round(maxX - minX + margin * 2),
    height: round(maxY - minY + margin * 2),
    item: d,
    slots: slots.map((s) => ({ cx: round(s.x + ox), cy: round(s.y + oy), left: round(s.x + ox - d.w / 2), top: round(s.y + oy - d.h / 2), rot: s.rot ?? 0 })),
    crossings,
    cloth: cloth ? { cx: round(ox), cy: round(oy), rings: cloth.rings } : null,
  };
}

/** What a spread needs to be laid out. */
export type Layable = { id: string; kind: ItemKind; positions: unknown[]; shape?: Shape; cast?: boolean };

/**
 * A spread laid out: its own layout when it has one, the cast as the runes
 * fell (`names` and `falls` from the draw), or its shape (a line when it has none).
 */
export function layoutOf(spread: Layable, cast?: { names: string[]; falls: Fall[] }): Laid {
  const n = spread.positions.length;
  if (spread.cast) {
    const names = cast?.names ?? Array.from({ length: n }, (_, i) => `rune ${i}`);
    const falls = cast?.falls ?? SAMPLE_FALLS.slice(0, n);
    const { slots, rings } = castSlots(names, falls);
    return laid(spread.kind, slots, [], { rings });
  }
  const built = BUILT[spread.id]?.() ?? ORACLE_LAYOUTS[spread.id]?.(ITEM[spread.kind], GAP[spread.kind]);
  if (built && built.slots.length === n) return laid(spread.kind, built.slots, built.crossings ?? []);
  return laid(spread.kind, shapeSlots(spread.kind, spread.shape ?? 'line', n));
}

/** How a cast might fall, for the little picture of it before you cast. */
const SAMPLE_FALLS: Fall[] = [
  { ring: 'centre', up: true },
  { ring: 'middle', up: true },
  { ring: 'middle', up: false },
  { ring: 'edge', up: true },
  { ring: 'centre', up: false },
  { ring: 'middle', up: true },
  { ring: 'edge', up: false },
  { ring: 'edge', up: true },
  { ring: 'middle', up: true },
];

/** Whether a layout is just a short row, best shown with each place's name beneath it. */
export function isSimpleRow(l: Laid): boolean {
  return l.slots.length <= 3 && !l.cloth && l.slots.every((s) => s.rot === 0 && Math.abs(s.cy - l.slots[0].cy) < 0.001);
}

// ─── Small pictures of a spread, for choosing one ────────────────────────

export type Diagram = {
  /** Width over height of the picture. */
  aspect: number;
  /** Each place, as fractions of the picture: centre, size and turn. */
  rects: { cx: number; cy: number; w: number; h: number; rot: number }[];
  /** For a cast: the cloth's rings, as fractions of the picture's width. */
  rings: { cx: number; cy: number; r: number[] } | null;
};

export function diagramOf(l: Laid): Diagram {
  const { width: W, height: H } = l;
  return {
    aspect: round(W / H),
    rects: l.slots.map((s) => ({ cx: round(s.cx / W), cy: round(s.cy / H), w: round(l.item.w / W), h: round(l.item.h / H), rot: s.rot })),
    rings: l.cloth ? { cx: round(l.cloth.cx / W), cy: round(l.cloth.cy / H), r: l.cloth.rings.map((r) => round(r / W)) } : null,
  };
}

/** A diagram as SVG markup (for the website), drawn in a box `size` across at its widest. */
export function diagramSvg(dg: Diagram, size = 64, { numbers = false }: { numbers?: boolean } = {}): string {
  const w = dg.aspect >= 1 ? size : Math.round(size * dg.aspect);
  const h = dg.aspect >= 1 ? Math.round(size / dg.aspect) : size;
  const rings = dg.rings
    ? dg.rings.r.map((r) => `<circle cx="${round(dg.rings!.cx * w)}" cy="${round(dg.rings!.cy * h)}" r="${round(r * w)}" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="0.8"/>`).join('')
    : '';
  const rects = dg.rects
    .map((r, i) => {
      const cx = round(r.cx * w);
      const cy = round(r.cy * h);
      const rw = round(r.w * w);
      const rh = round(r.h * h);
      const rect = `<rect x="${round(cx - rw / 2)}" y="${round(cy - rh / 2)}" width="${rw}" height="${rh}" rx="${round(Math.min(rw, rh) * 0.2)}" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="0.8"${
        r.rot ? ` transform="rotate(${r.rot} ${cx} ${cy})"` : ''
      }/>`;
      const label = numbers ? `<text x="${cx}" y="${round(cy + 3)}" font-size="${Math.max(7, Math.min(10, rw * 0.7))}" text-anchor="middle" fill="currentColor">${i + 1}</text>` : '';
      return rect + label;
    })
    .join('');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${rings}${rects}</svg>`;
}
