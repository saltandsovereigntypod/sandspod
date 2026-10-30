// Cord cutting: a cord tied between two candles at a height down their wax.
// When either candle has burned down to it, the cord catches, burns through
// and parts, and the altar keeps it as cut. How far down a candle has burned
// comes from its life (livingState.candleLife), so the cord catches when the
// candle really would have reached it, even if the altar was closed.
//
// The cords are kept with the altar, beside its groups: `cords` in the saved
// altar's JSON (AltarDocument.extra), which the website keeps as it is.
// Pure, shared with the website (js/core/altar.js).

import { boxToPixels, displayBox, imageRatio, rotationOf } from './geometry.ts';
import { flameLayout, pictureBox } from './flame.ts';
import { candleLife, candleLifeForm, isCandle, isLit, readLivingState } from './livingState.ts';
import { candleShape, halfAt } from './wax.ts';
import type { AltarDocument } from './snapshot.ts';
import type { SavedObject } from './types.ts';
import { newId } from './uid.ts';
import { builtInCabinet, objectFromForm } from './cabinet.ts';

export const CORDS_KEY = 'cords';

/** How long the cord takes to burn through once it has caught. */
export const CORD_BURN_MS = 40_000;
/** How long the two ends take to fall, and the smoke to clear, once it parts (drawing only). */
export const CORD_FALL_MS = 1_400;
export const CORD_SMOKE_MS = 3_200;

export type CordStatus = 'tied' | 'burning' | 'cut';

export type Cord = {
  id: string;
  /** The two candles, by altarObjectId. */
  a: string;
  b: string;
  /** How far down the candles' wax it is tied: 0 at the top, 1 at the foot (a share of what can burn). */
  height: number;
  color: string;
  /** What the cord stands for, in your words (optional). */
  intention?: string;
  tiedAt: string;
  status: CordStatus;
  /** When it caught, and on which candle. */
  caughtAt?: string;
  caughtOn?: string;
  cutAt?: string;
  /** When it was written into the Grimoire. */
  recordedAt?: string;
  [key: string]: unknown;
};

export const CORD_HEIGHTS = [
  { value: 0.3, label: 'A third down' },
  { value: 0.5, label: 'Halfway' },
  { value: 0.7, label: 'Two thirds down' },
] as const;
export const DEFAULT_CORD_HEIGHT = 0.5;

export const CORD_COLORS = [
  { id: 'red', label: 'Red', stroke: 'rgb(168,36,40)', shade: 'rgb(96,16,20)' },
  { id: 'black', label: 'Black', stroke: 'rgb(44,40,40)', shade: 'rgb(10,8,8)' },
  { id: 'white', label: 'White', stroke: 'rgb(236,230,214)', shade: 'rgb(150,140,120)' },
  { id: 'natural', label: 'Natural twine', stroke: 'rgb(186,154,104)', shade: 'rgb(110,86,52)' },
] as const;

export const cordColor = (id: string) => CORD_COLORS.find((c) => c.id === id) ?? CORD_COLORS[0];

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const parse = (at: string | undefined) => {
  const t = Date.parse(String(at || ''));
  return Number.isFinite(t) ? t : null;
};
const iso = (ms: number) => new Date(ms).toISOString();

function readCord(raw: unknown): Cord | null {
  if (!raw || typeof raw !== 'object') return null;
  const c = raw as Record<string, unknown>;
  if (typeof c.id !== 'string' || typeof c.a !== 'string' || typeof c.b !== 'string' || !c.a || !c.b) return null;
  const height = Number(c.height);
  const status = c.status === 'burning' || c.status === 'cut' ? c.status : 'tied';
  return { ...(c as Cord), height: Number.isFinite(height) ? clamp01(height) : DEFAULT_CORD_HEIGHT, color: typeof c.color === 'string' && c.color ? c.color : 'red', status };
}

/** The cords on an altar. */
export function cordsOf(doc: Pick<AltarDocument, 'extra'>): Cord[] {
  const list = doc.extra?.[CORDS_KEY];
  return Array.isArray(list) ? list.map(readCord).filter((c): c is Cord => !!c) : [];
}

/** The altar with these cords (none: the field is taken away). */
export function withCords(doc: AltarDocument, cords: Cord[]): AltarDocument {
  const { [CORDS_KEY]: _old, ...rest } = doc.extra ?? {};
  void _old;
  return { ...doc, extra: cords.length ? { ...rest, [CORDS_KEY]: cords } : rest };
}

const candleById = (doc: AltarDocument, id: string) => doc.objects.find((o) => o.altarObjectId === id && isCandle(o)) ?? null;

/** The cord a candle is tied into, if any. */
export function cordOfCandle(doc: AltarDocument, id: string): Cord | null {
  return id ? (cordsOf(doc).find((c) => c.a === id || c.b === id) ?? null) : null;
}

/** Candles that can take a cord: on the altar, not burned down, and not tied already. */
export function freeCandles(doc: AltarDocument, now: number = Date.now()): SavedObject[] {
  return doc.objects.filter((o) => isCandle(o) && !!o.altarObjectId && !candleLife(o, now).spent && !cordOfCandle(doc, String(o.altarObjectId)));
}

/** Tie a cord between two candles (by altarObjectId). Unchanged if they aren't both free candles. */
export function tieCord(
  doc: AltarDocument,
  a: string,
  b: string,
  options: { height?: number; color?: string; intention?: string; id?: string },
  now: string,
): AltarDocument {
  if (!a || !b || a === b || !candleById(doc, a) || !candleById(doc, b) || cordOfCandle(doc, a) || cordOfCandle(doc, b)) return doc;
  const cord: Cord = {
    id: options.id || `cord-${newId()}`,
    a,
    b,
    height: clamp01(options.height ?? DEFAULT_CORD_HEIGHT),
    color: options.color || 'red',
    tiedAt: now,
    status: 'tied',
    ...(options.intention?.trim() ? { intention: options.intention.trim() } : {}),
  };
  return withCords(doc, [...cordsOf(doc), cord]);
}

/**
 * Set out a pair of chime candles, white and black, side by side about
 * `center` (stage fractions), with a cord tied between them: one step.
 */
export function setOutCordPair(
  doc: AltarDocument,
  center: { cx: number; cy: number },
  options: { height?: number; color?: string; intention?: string },
  now: string,
  overrides: Record<string, string> = {},
): AltarDocument {
  const chimeOf = (id: string) => {
    const item = builtInCabinet.find((i) => i.id === id);
    const form = item?.forms.find((f) => f.form === 'chime-spell');
    return item && form ? { item, form } : null;
  };
  const white = chimeOf('candles:white-candle');
  const black = chimeOf('candles:black-candle');
  if (!white || !black) return doc;
  const cx = Math.max(0.2, Math.min(0.8, center.cx));
  const cy = Math.max(0.3, Math.min(0.75, center.cy));
  const a = objectFromForm(white.item, white.form, doc.objects, now, overrides, { cx: cx - 0.09, cy });
  const b = objectFromForm(black.item, black.form, [...doc.objects, a], now, overrides, { cx: cx + 0.09, cy });
  const placed = { ...doc, objects: [...doc.objects, a, b] };
  return tieCord(placed, String(a.altarObjectId), String(b.altarObjectId), options, now);
}

/** Change a cord (its height or colour while it's still tied; when it was recorded). */
export function updateCord(doc: AltarDocument, id: string, change: Partial<Cord>): AltarDocument {
  const cords = cordsOf(doc);
  if (!cords.some((c) => c.id === id)) return doc;
  return withCords(
    doc,
    cords.map((c) => (c.id === id ? { ...c, ...change, ...(change.height != null ? { height: clamp01(change.height) } : {}) } : c)),
  );
}

/** Untie a cord, or clear a cut one away. */
export function untieCord(doc: AltarDocument, id: string): AltarDocument {
  const cords = cordsOf(doc);
  const left = cords.filter((c) => c.id !== id);
  return left.length === cords.length ? doc : withCords(doc, left);
}

/** Cords tied to candles that have left the altar go with them. */
export function withoutCordsFor(doc: AltarDocument, ids: string[]): AltarDocument {
  if (!ids.length) return doc;
  const cords = cordsOf(doc);
  const left = cords.filter((c) => !ids.includes(c.a) && !ids.includes(c.b));
  return left.length === cords.length ? doc : withCords(doc, left);
}

/**
 * When a candle's burn reached `height` of its life: from its burns so far
 * (and the one going on now), or when the burn going on now will reach it.
 * Null when it hasn't and isn't burning towards it, or the candle has no
 * known life.
 */
export function reachesAt(candle: SavedObject, height: number, now: number = Date.now()): number | null {
  const life = candleLife(candle, now);
  if (!life.expectedMs) return null;
  const target = clamp01(height) * life.expectedMs;
  const state = readLivingState(candle, '').candle ?? {};
  let before = 0;
  for (const burn of state.burnHistory ?? []) {
    const ms = Math.max(0, Number(burn.durationMs) || 0);
    const start = parse(burn.litAt || burn.startedAt);
    if (before + ms >= target && ms > 0) return (start ?? parse(state.spentAt) ?? now) + Math.max(0, target - before);
    before += ms;
  }
  // Burns kept only as a total (older saves): it has got there, at some time before now.
  const total = Math.max(0, Number(state.totalBurnMs) || 0);
  if (total >= target && total > before) return parse(state.spentAt) ?? parse(state.lastLitAt) ?? now;
  if (life.spent) return parse(state.spentAt) ?? now;
  const started = isLit(candle) ? parse(state.currentBurnStartedAt) : null;
  if (started == null) return null;
  return started + Math.max(0, target - total);
}

/** The moment the cord catches (whichever candle gets there first), and on which. */
export function catchOf(doc: AltarDocument, cord: Cord, now: number = Date.now()): { at: number; on: string } | null {
  const ends = [cord.a, cord.b]
    .map((id) => {
      const candle = candleById(doc, id);
      const at = candle ? reachesAt(candle, cord.height, now) : null;
      return at == null ? null : { at, on: id };
    })
    .filter((e): e is { at: number; on: string } => !!e)
    .sort((x, y) => x.at - y.at);
  return ends[0] ?? null;
}

export type CordState = {
  status: CordStatus;
  /** While burning: how far it has burned through, 0–1. */
  burned: number;
  caughtAt: number | null;
  caughtOn: string;
  cutAt: number | null;
};

/** Where a cord is at `now`: what was kept, and what has happened since. */
export function cordState(doc: AltarDocument, cord: Cord, now: number = Date.now()): CordState {
  const kept = { caughtAt: parse(cord.caughtAt), cutAt: parse(cord.cutAt) };
  if (cord.status === 'cut') return { status: 'cut', burned: 1, caughtAt: kept.caughtAt, caughtOn: cord.caughtOn || '', cutAt: kept.cutAt ?? kept.caughtAt };
  const caught = kept.caughtAt != null ? { at: kept.caughtAt, on: cord.caughtOn || cord.a } : catchOf(doc, cord, now);
  // Once kept as caught, it's burning, even read a moment before (a clock that's a little behind).
  if (!caught || (caught.at > now && cord.status !== 'burning')) return { status: 'tied', burned: 0, caughtAt: null, caughtOn: '', cutAt: null };
  const cutAt = caught.at + CORD_BURN_MS;
  if (now >= cutAt) return { status: 'cut', burned: 1, caughtAt: caught.at, caughtOn: caught.on, cutAt };
  return { status: 'burning', burned: clamp01((now - caught.at) / CORD_BURN_MS), caughtAt: caught.at, caughtOn: caught.on, cutAt: null };
}

/** Keep what has happened to each cord by `now` (caught, cut). Unchanged docs come back as they were. */
export function settleCords(doc: AltarDocument, now: string): AltarDocument {
  const at = Date.parse(now);
  const cords = cordsOf(doc);
  if (!cords.length) return doc;
  let changed = false;
  const next = cords.map((cord) => {
    const state = cordState(doc, cord, at);
    if (state.status === cord.status) return cord;
    changed = true;
    const caught = state.caughtAt != null ? { caughtAt: iso(state.caughtAt), caughtOn: state.caughtOn } : {};
    return { ...cord, ...caught, status: state.status, ...(state.status === 'cut' && state.cutAt != null ? { cutAt: iso(state.cutAt) } : {}) };
  });
  return changed ? withCords(doc, next) : doc;
}

/** The next moment something happens to a cord (it catches, or burns through), or null. */
export function nextCordEvent(doc: AltarDocument, now: Date = new Date()): number | null {
  let soonest: number | null = null;
  for (const cord of cordsOf(doc)) {
    if (cord.status === 'cut') continue;
    const state = cordState(doc, cord, now.getTime());
    const at = state.status === 'burning' && state.caughtAt != null ? state.caughtAt + CORD_BURN_MS : state.status === 'tied' ? catchOf(doc, cord, now.getTime())?.at ?? null : null;
    if (at != null && at > now.getTime() && (soonest == null || at < soonest)) soonest = at;
  }
  return soonest;
}

/**
 * Where the cord wraps a candle, in pixels of a box `width` × `height` (the
 * candle's own box, unrotated): the middle of its wax, the height the cord is
 * tied at, and half the wax's width there. The candle's body stays put as it
 * burns (its top comes down to meet the cord), so this doesn't move.
 */
export function cordAnchor(candle: SavedObject, height: number, width: number, boxHeight: number): { x: number; y: number; half: number; foot: number } {
  const ratio = candle.imagePath ? imageRatio(String(candle.imagePath)) : null;
  const shape = candleShape(candleLifeForm(candle));
  if (!ratio || !shape || !(width > 0) || !(boxHeight > 0)) return { x: width / 2, y: boxHeight * (0.3 + 0.5 * clamp01(height)), half: width * 0.22, foot: boxHeight * 0.96 };
  const pic = pictureBox(ratio, boxHeight / width);
  const wick = flameLayout(String(candle.imagePath), ratio).centerX / 100;
  const flipped = candle.flipped === 'true';
  const x = (flipped ? 1 - wick : wick) * width;
  const y = shape.mode === 'cap' ? shape.capEnd + clamp01(height) * shape.maxDrop : shape.top + clamp01(height) * shape.maxDrop;
  const wickInPic = (wick - pic.left) / (pic.width || 1) - 0.5;
  const half = halfAt(shape, y, wickInPic) * pic.width * width * 1.06;
  return { x, y: (pic.top + y * pic.height) * boxHeight, half: Math.max(1.5, half), foot: (pic.top + shape.bottom * pic.height) * boxHeight };
}

/** The cord's two ends on a stage `stageWidth` wide, in pixels (left end first). Null when a candle is missing. */
export function cordEnds(doc: AltarDocument, cord: Cord, stageWidth: number): { left: CordEnd; right: CordEnd } | null {
  const ends = [cord.a, cord.b].map((id) => {
    const candle = candleById(doc, id);
    if (!candle) return null;
    const rect = boxToPixels(displayBox(candle), stageWidth);
    const anchor = cordAnchor(candle, cord.height, rect.width, rect.height);
    // Turned with the candle, about its centre.
    const angle = (rotationOf(candle) * Math.PI) / 180;
    const dx = anchor.x - rect.width / 2;
    const dy = anchor.y - rect.height / 2;
    return {
      id,
      x: rect.centerX + dx * Math.cos(angle) - dy * Math.sin(angle),
      y: rect.centerY + dx * Math.sin(angle) + dy * Math.cos(angle),
      half: anchor.half,
      foot: rect.top + anchor.foot,
    };
  });
  if (!ends[0] || !ends[1]) return null;
  const [p, q] = ends as CordEnd[];
  return p.x <= q.x ? { left: p, right: q } : { left: q, right: p };
}

/** One end of the cord: where it wraps its candle, half the wax's width there, and the candle's foot (pixels). */
export type CordEnd = { id: string; x: number; y: number; half: number; foot?: number };

/** About how far down it's tied, in words. */
export function heightWords(height: number): string {
  const near = CORD_HEIGHTS.reduce((best, h) => (Math.abs(h.value - height) < Math.abs(best.value - height) ? h : best), CORD_HEIGHTS[0] as (typeof CORD_HEIGHTS)[number]);
  return near.value === 0.5 ? 'halfway down' : near.label.toLowerCase();
}

/** What the candle's panel says of its cord. */
export function cordLine(doc: AltarDocument, cord: Cord, labelOf: (id: string) => string, now: number = Date.now()): string {
  const state = cordState(doc, cord, now);
  if (state.status === 'cut') {
    const when = state.cutAt != null ? new Date(state.cutAt).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';
    return `Cut${when ? ` ${when}` : ''}. The flame of ${labelOf(state.caughtOn || cord.a)} reached the cord and it burned through.`;
  }
  if (state.status === 'burning') return `The flame of ${labelOf(state.caughtOn)} has reached the cord. It’s burning through.`;
  const lit = [cord.a, cord.b].some((id) => {
    const c = candleById(doc, id);
    return !!c && isLit(c);
  });
  const caught = catchOf(doc, cord, now);
  const soon = lit && caught ? ` At this rate it reaches the cord in about ${aboutTime(caught.at - now)}.` : '';
  return `Tied ${heightWords(cord.height)} between ${labelOf(cord.a)} and ${labelOf(cord.b)}. The cord burns when the candles reach it.${soon}`;
}

function aboutTime(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.round(minutes / 6) / 10;
  if (hours < 48) return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hour${hours === 1 ? '' : 's'}`;
  return `${Math.round(hours / 24)} days`;
}

// ── Drawing ─────────────────────────────────────────────────────────────
// The cord as paths on the stage (pixels), drawn the same way in the app
// (CordLayer.tsx) and on the website (altar-cords.js): twice round each
// candle at its height, sagging a little between them; once caught, burning
// from the candle that reached it towards the middle, an ember at the burning
// point and a thread of smoke; then parted at the middle, both ends falling
// to hang from their candles.

type Pt = { x: number; y: number };
const quad = (s: Pt, c: Pt, e: Pt, t: number): Pt => ({
  x: (1 - t) * (1 - t) * s.x + 2 * (1 - t) * t * c.x + t * t * e.x,
  y: (1 - t) * (1 - t) * s.y + 2 * (1 - t) * t * c.y + t * t * e.y,
});
const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const r1 = (n: number) => Math.round(n * 10) / 10;

/** The part of a quadratic curve between t0 and t1, as a path. */
function subCurve(s: Pt, c: Pt, e: Pt, t0: number, t1: number): string {
  // Split at t1, then the first part again at t0 / t1 (de Casteljau).
  const c1 = lerp(s, c, t1);
  const p1 = quad(s, c, e, t1);
  const u = t1 > 0 ? t0 / t1 : 0;
  const p0 = quad(s, c1, p1, u);
  const cp = lerp(c1, p1, u);
  return `M${r1(p0.x)} ${r1(p0.y)}Q${r1(cp.x)} ${r1(cp.y)} ${r1(p1.x)} ${r1(p1.y)}`;
}

export type CordArt = {
  /** Stroke width of the cord, in pixels. */
  width: number;
  /** The wraps round each candle (front arcs), the left candle's first. */
  wraps: { d: string; charred: boolean }[];
  /** The cord between them, whole or what's left unburned (none once cut). */
  span: string;
  /** What has burned, charred. */
  charred: string;
  ember: { x: number; y: number; r: number } | null;
  /** Once parted: the two ends, hanging from their candles. */
  pieces: string[];
  /** The ends' burned tips once parted. */
  tips: Pt[];
  smoke: { x: number; y: number; r: number; opacity: number }[];
};

/**
 * The cord drawn at `now` for its state: `ends` from cordEnds, `still` for
 * Reduce Motion (no drifting smoke; the ends shown hanging at once).
 */
export function cordArt(ends: { left: CordEnd; right: CordEnd }, state: CordState, now: number, stageWidth: number, still = false): CordArt {
  const { left: L, right: R } = ends;
  const width = Math.max(1.4, Math.min(4, stageWidth * 0.0032));
  const wrap = (p: CordEnd, lift: number) =>
    `M${r1(p.x - p.half)} ${r1(p.y - lift)}Q${r1(p.x)} ${r1(p.y - lift + p.half * 0.5)} ${r1(p.x + p.half)} ${r1(p.y - lift)}`;
  const S = { x: L.x + L.half * 0.9, y: L.y };
  const E = { x: R.x - R.half * 0.9, y: R.y };
  const dist = Math.hypot(E.x - S.x, E.y - S.y);
  const C = { x: (S.x + E.x) / 2, y: (S.y + E.y) / 2 + dist * 0.07 + width };
  const fromLeft = state.caughtOn ? state.caughtOn === L.id : true;
  const art: CordArt = { width, wraps: [], span: '', charred: '', ember: null, pieces: [], tips: [], smoke: [] };
  const burnedSide = state.status === 'tied' ? null : fromLeft ? 'left' : 'right';
  for (const [p, side] of [[L, 'left'], [R, 'right']] as const) {
    const charred = burnedSide === side || state.status === 'cut';
    art.wraps.push({ d: wrap(p, 0), charred }, { d: wrap(p, width * 1.7), charred });
  }
  if (state.status === 'tied') {
    art.span = subCurve(S, C, E, 0, 1);
    return art;
  }
  const M = quad(S, C, E, 0.5);
  if (state.status === 'burning') {
    const te = fromLeft ? 0.5 * state.burned : 1 - 0.5 * state.burned;
    const ember = quad(S, C, E, te);
    art.charred = fromLeft ? subCurve(S, C, E, 0, te) : subCurve(S, C, E, te, 1);
    art.span = fromLeft ? subCurve(S, C, E, te, 1) : subCurve(S, C, E, 0, te);
    art.ember = { x: ember.x, y: ember.y, r: width * 1.6 };
    const t = now / 1000;
    for (let k = 0; k < (still ? 1 : 3); k++) {
      const phase = still ? 0.35 : (t * 0.7 + k / 3) % 1;
      art.smoke.push({ x: ember.x + Math.sin((t + k) * 2.1) * width * 2 * phase, y: ember.y - phase * width * 14, r: width * (1.4 + phase * 3), opacity: 0.45 * (1 - phase) });
    }
    return art;
  }
  // Parted at the middle: each end falls, hangs down its candle to the altar, and the rest lies on it.
  const since = state.cutAt != null ? Math.max(0, now - state.cutAt) : Infinity;
  const fall = still ? 1 : Math.min(1, since / CORD_FALL_MS);
  const ease = 1 - (1 - fall) * (1 - fall);
  const half = dist / 2;
  const hang = (from: Pt, end: CordEnd, dir: 1 | -1) => {
    const drop = Math.max(width * 2, Math.min(half, (end.foot ?? from.y + half) - from.y));
    const rest = Math.max(0, half - drop);
    // Where it was the moment it parted (along the cord), and where it comes to lie.
    const hang0 = quad(S, C, E, dir === 1 ? 0.25 : 0.75);
    const hangAt = { x: from.x + dir * width * 1.5, y: from.y + drop };
    const lieAt = { x: hangAt.x + dir * rest * 0.85, y: hangAt.y + width * 0.6 };
    const h = lerp(hang0, hangAt, ease);
    const z = lerp(M, lieAt, ease);
    const ctrl = lerp({ x: (from.x + h.x) / 2, y: (from.y + h.y) / 2 }, { x: from.x + dir * width * 2.5, y: from.y + drop * 0.55 }, ease);
    return { d: `M${r1(from.x)} ${r1(from.y)}Q${r1(ctrl.x)} ${r1(ctrl.y)} ${r1(h.x)} ${r1(h.y)}L${r1(z.x)} ${r1(z.y)}`, end: z };
  };
  const a = hang(S, L, 1);
  const b = hang(E, R, -1);
  art.pieces = [a.d, b.d];
  art.tips = [a.end, b.end];
  if (since < CORD_SMOKE_MS) {
    const p = since / CORD_SMOKE_MS;
    for (let k = 0; k < (still ? 1 : 4); k++) {
      const q = Math.min(1, p + k * 0.08);
      art.smoke.push({ x: M.x + (k - 1.5) * width * 1.5 * q, y: M.y - q * width * 18, r: width * (2 + q * 5), opacity: 0.5 * (1 - q) });
    }
  }
  return art;
}

/** Whether the cord needs drawing again soon (it's burning, or has just parted). */
export function cordMoving(state: CordState, now: number): boolean {
  return state.status === 'burning' || (state.status === 'cut' && state.cutAt != null && now - state.cutAt < CORD_SMOKE_MS);
}
