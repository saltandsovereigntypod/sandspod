// Casting the circle and calling the quarters on an altar. An athame or a
// wand (any tool whose kind names one: the selenite athame, a crystal wand)
// offers "Cast the circle": you trace round the altar with it, a thin line
// of light following its tip in the colour you chose, and a sunwise
// (clockwise, deosil) path of at least CLOSE_DEGREES closes into a glowing
// ring. Tracing it back anticlockwise (widdershins) unwinds it; "Cast it for
// me" draws a perfect circle. The four quarters are lit at the altar's edges
// (the back is north, as layouts.ts has it: east to the right, south at the
// front, west to the left), called East, South, West, North (or in an order
// a coven ritual chooses, North first, say) and released in reverse of that
// order. Both are kept with the altar itself (`circle` and `quarters` in
// its data, beside its cords), so a coven altar shows them to everyone there.
// This is modern practice, mostly from Wicca and the ceremonial magic it drew
// on; see the help topic. Pure, so it can be tested; shared with the website
// (js/core/altar.js circle).

import type { SavedObject } from './types.ts';

export type Pt = { x: number; y: number };

/** Athames and wands, by the kind of tool they are. */
export const isCircleTool = (o: Pick<SavedObject, 'type' | 'tool'> | null | undefined) => !!o && o.type === 'tool' && /athame|wand/.test(String(o.tool || ''));

/** How far round a sunwise trace must go to close the circle. */
export const CLOSE_DEGREES = 300;
/** A trace smaller than this (a fraction of the stage's width) is a wobble, not a circle. */
export const MIN_RADIUS = 0.06;

export const CIRCLE_COLORS = [
  { id: 'gold', label: 'Gold', color: '#f0c96a' },
  { id: 'silver', label: 'Silver', color: '#dfe7f2' },
  { id: 'blue', label: 'Blue', color: '#7cb6ff' },
  { id: 'violet', label: 'Violet', color: '#b98cff' },
  { id: 'white', label: 'White', color: '#fffaf0' },
  { id: 'red', label: 'Red', color: '#ff7b67' },
] as const;
export const DEFAULT_CIRCLE_COLOR: string = CIRCLE_COLORS[0].color;

const HEX = /^#[0-9a-f]{6}$/i;
/** A colour as `#rrggbb`, or the fallback. Accepts `rrggbb` and `#rgb`. */
export function cleanColor(raw: unknown, fallback: string = DEFAULT_CIRCLE_COLOR): string {
  let s = String(raw ?? '').trim();
  if (!s) return fallback;
  if (!s.startsWith('#')) s = `#${s}`;
  if (/^#[0-9a-f]{3}$/i.test(s)) s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  return HEX.test(s) ? s.toLowerCase() : fallback;
}

/** The colour's name when it's one of the presets, else "your own colour". */
export const colorName = (color: string) => CIRCLE_COLORS.find((c) => c.color === cleanColor(color, ''))?.label.toLowerCase() ?? 'your own colour';

// ── Reading a trace ─────────────────────────────────────────────────────

export type Direction = 'deosil' | 'widdershins';
export type TraceReading = {
  /** Which way it went round its centre, or null when it hardly went round. */
  direction: Direction | null;
  /** How far round, in degrees (always positive). */
  degrees: number;
  /** Far enough round to close (or unwind) the circle. */
  closes: boolean;
  centre: Pt;
  /** Mean distance from the centre, in the trace's units. */
  radius: number;
};

/**
 * How far a traced path goes round its centre, from the angles between
 * neighbouring points. Points are in screen units with y downwards (equal
 * scale on both axes), so going clockwise on the screen counts up.
 * `minRadius` (same units) leaves out a scribble in one spot.
 */
export function readTrace(points: Pt[], minRadius = 0): TraceReading {
  const n = points.length;
  const empty: TraceReading = { direction: null, degrees: 0, closes: false, centre: { x: 0, y: 0 }, radius: 0 };
  if (n < 3) return empty;
  // The middle of what was drawn (the box around it, so a slow stretch doesn't pull it over).
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const centre = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  let radius = 0;
  for (const p of points) radius += Math.hypot(p.x - centre.x, p.y - centre.y);
  radius /= n;
  if (!(radius > 0) || radius < minRadius) return { ...empty, centre, radius };
  let turn = 0;
  let prev = Math.atan2(points[0].y - centre.y, points[0].x - centre.x);
  for (let i = 1; i < n; i++) {
    const p = points[i];
    // Points right on the centre say nothing about the way round.
    if (Math.hypot(p.x - centre.x, p.y - centre.y) < radius * 0.15) continue;
    const a = Math.atan2(p.y - centre.y, p.x - centre.x);
    let d = a - prev;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d <= -Math.PI) d += 2 * Math.PI;
    turn += d;
    prev = a;
  }
  const degrees = Math.abs((turn * 180) / Math.PI);
  const direction: Direction | null = degrees < 45 ? null : turn > 0 ? 'deosil' : 'widdershins';
  return { direction, degrees: Math.round(degrees), closes: degrees >= CLOSE_DEGREES, centre, radius };
}

/** Points round a perfect circle, sunwise from the top (north): "Cast it for me". */
export function perfectCircle(centre: Pt, radius: number, steps = 48, sunwise = true): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = -Math.PI / 2 + (sunwise ? 1 : -1) * (i / steps) * 2 * Math.PI;
    out.push({ x: centre.x + Math.cos(t) * radius, y: centre.y + Math.sin(t) * radius });
  }
  return out;
}

// ── The circle, kept with the altar ─────────────────────────────────────

/** Where the ring sits: its centre as fractions of the stage (x of width, y of height), its radius a fraction of the width. */
export type CircleState = { color: string; cx: number; cy: number; r: number; castAt: string; by?: string; auto?: boolean };

type Extra = Record<string, unknown>;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function circleOf(extra: Extra | null | undefined): CircleState | null {
  const c = extra?.circle as Partial<CircleState> | null | undefined;
  if (!c || typeof c !== 'object' || !c.castAt) return null;
  const n = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
  return {
    color: cleanColor(c.color),
    cx: clamp(n(c.cx, 0.5), 0, 1),
    cy: clamp(n(c.cy, 0.5), 0, 1),
    r: clamp(n(c.r, 0.3), MIN_RADIUS, 0.6),
    castAt: String(c.castAt),
    ...(c.by ? { by: String(c.by) } : {}),
    ...(c.auto ? { auto: true } : {}),
  };
}

/** The ring a whole-altar "Cast it for me" draws, as stage fractions. */
export const DEFAULT_RING = { cx: 0.5, cy: 0.52, r: 0.24 };

export function castCircle(extra: Extra, ring: { cx: number; cy: number; r: number }, color: string, now: string, by?: string, auto = false): Extra {
  const circle: CircleState = {
    color: cleanColor(color),
    cx: clamp(ring.cx, 0, 1),
    cy: clamp(ring.cy, 0, 1),
    r: clamp(ring.r, MIN_RADIUS, 0.6),
    castAt: now,
    ...(by ? { by } : {}),
    ...(auto ? { auto: true } : {}),
  };
  return { ...extra, circle };
}

export function releaseCircle(extra: Extra): Extra {
  if (!('circle' in extra)) return extra;
  const { circle: _gone, ...rest } = extra;
  void _gone;
  return rest;
}

export const CAST_LABEL = 'Cast the circle';
export const RELEASE_LABEL = 'Release the circle';
export const CAST_FOR_ME_LABEL = 'Cast it for me';
export const CIRCLE_CAST_STATUS = 'Circle cast';
export const castLine = (color: string) => `The circle was cast in ${colorName(color)} light.`;
export const RELEASED_LINE = 'The circle was released.';

/** What to say about a trace that didn't close or unwind. */
export function traceHint(reading: TraceReading, releasing: boolean): string {
  if (!reading.direction) return releasing ? 'Trace the ring anticlockwise, all the way round, to unwind it.' : 'Trace all the way round the altar, sunwise (clockwise), to close the circle.';
  if (releasing) {
    if (reading.direction === 'deosil') return 'That went sunwise. To release the circle, trace it back anticlockwise.';
    return `Round ${reading.degrees}° of ${CLOSE_DEGREES}°. Keep going anticlockwise to unwind it.`;
  }
  if (reading.direction === 'widdershins') return 'That went anticlockwise. A circle is cast sunwise (clockwise).';
  return `Round ${reading.degrees}° of ${CLOSE_DEGREES}°. Keep going sunwise until it meets where you began.`;
}

// ── The quarters ────────────────────────────────────────────────────────

export type QuarterId = 'east' | 'south' | 'west' | 'north';
export type Quarter = { id: QuarterId; name: string; element: string; color: string; edge: 'right' | 'bottom' | 'left' | 'top' };

/** In calling order. The colours are the common modern ones; change them to your own. */
export const QUARTERS: Quarter[] = [
  { id: 'east', name: 'East', element: 'Air', color: '#f2cf4a', edge: 'right' },
  { id: 'south', name: 'South', element: 'Fire', color: '#e5533c', edge: 'bottom' },
  { id: 'west', name: 'West', element: 'Water', color: '#4f8fe0', edge: 'left' },
  { id: 'north', name: 'North', element: 'Earth', color: '#4c9b58', edge: 'top' },
];
export const CALL_ORDER: QuarterId[] = QUARTERS.map((q) => q.id);
export const quarterOf = (id: string) => QUARTERS.find((q) => q.id === id) ?? null;
const isQuarter = (v: unknown): v is QuarterId => typeof v === 'string' && CALL_ORDER.includes(v as QuarterId);

/**
 * A calling order: all four, each once (North, East, South, West, say), or
 * null when it isn't one. A coven ritual keeps its own (builder.ts
 * RitualPlan.quarter_order); the usual is East, South, West, North.
 */
export function cleanQuarterOrder(raw: unknown): QuarterId[] | null {
  if (!Array.isArray(raw) || raw.length !== 4) return null;
  const list = raw.filter(isQuarter);
  return new Set(list).size === 4 ? [...list] : null;
}
/** The order, or the usual one. */
export const quarterOrderOr = (raw: unknown): QuarterId[] => cleanQuarterOrder(raw) ?? [...CALL_ORDER];
export const isUsualOrder = (order: readonly string[]) => order.join() === CALL_ORDER.join();
/** Release goes in reverse of the calling order. */
export const releaseOrderOf = (order: readonly QuarterId[]): QuarterId[] => [...order].reverse();
/** Sunwise from a starting quarter: North first is North, East, South, West. */
export function orderStartingWith(start: QuarterId): QuarterId[] {
  const i = Math.max(0, CALL_ORDER.indexOf(start));
  return [...CALL_ORDER.slice(i), ...CALL_ORDER.slice(0, i)];
}
/** "East, South, West, North". */
export const orderLine = (order: readonly QuarterId[]) => order.map((id) => quarterOf(id)!.name).join(', ');

/** `open` is in the order they were called; `colors` your own colour for any of them; `order` the calling order they were called in (release goes in reverse of it). */
export type QuartersState = { open: QuarterId[]; colors: Partial<Record<QuarterId, string>>; order: QuarterId[] };

export function quartersOf(extra: Extra | null | undefined): QuartersState {
  const q = extra?.quarters as { open?: unknown; colors?: unknown; order?: unknown } | null | undefined;
  const open = Array.isArray(q?.open) ? [...new Set(q.open.filter(isQuarter))] : [];
  const colors: Partial<Record<QuarterId, string>> = {};
  if (q?.colors && typeof q.colors === 'object') {
    for (const [k, v] of Object.entries(q.colors as Record<string, unknown>)) if (isQuarter(k) && cleanColor(v, '')) colors[k] = cleanColor(v);
  }
  return { open, colors, order: quarterOrderOr(q?.order) };
}

export const quarterColor = (state: QuartersState, id: QuarterId) => state.colors[id] ?? quarterOf(id)!.color;

const withQuarters = (extra: Extra, state: QuartersState): Extra => {
  if (!state.open.length && !Object.keys(state.colors).length) {
    const { quarters: _gone, ...rest } = extra;
    void _gone;
    return rest;
  }
  // The order is kept while any quarter is open (and only when it isn't the usual one).
  const order = state.open.length && !isUsualOrder(state.order) ? { order: state.order } : {};
  return { ...extra, quarters: { open: state.open, colors: state.colors, ...order } };
};

/** The next to call, in the order (the one they're being called in, else the usual East, South, West, North), or null when all four are open. */
export const nextToCall = (state: QuartersState, order?: readonly QuarterId[] | null): QuarterId | null => {
  const use = state.open.length ? state.order : (order ?? state.order);
  return use.find((id) => !state.open.includes(id)) ?? null;
};
/** The one to release next: the open one latest in the calling order (release goes in reverse of it), or null. */
export const nextToRelease = (state: QuartersState): QuarterId | null => releaseOrderOf(state.order).find((id) => state.open.includes(id)) ?? null;

export type QuarterResult = { extra: Extra; ok: boolean; line: string };

/**
 * Call a quarter: any one may be called (the order is a guide); calling an
 * open one does nothing. The first call keeps the calling order in force (a
 * coven ritual's own, or the usual), so release follows it in reverse.
 */
export function callQuarter(extra: Extra, id: QuarterId, order?: readonly QuarterId[] | null): QuarterResult {
  const state = quartersOf(extra);
  const q = quarterOf(id)!;
  if (state.open.includes(id)) return { extra, ok: false, line: `The ${q.name} is already open.` };
  const kept = state.open.length ? state.order : quarterOrderOr(order ?? state.order);
  return { extra: withQuarters(extra, { ...state, order: kept, open: [...state.open, id] }), ok: true, line: `Called the ${q.name}, the quarter of ${q.element}.` };
}

/** Release a quarter: only in reverse of the calling order. */
export function releaseQuarter(extra: Extra, id: QuarterId): QuarterResult {
  const state = quartersOf(extra);
  const q = quarterOf(id)!;
  if (!state.open.includes(id)) return { extra, ok: false, line: `The ${q.name} isn’t open.` };
  const next = nextToRelease(state)!;
  if (next !== id) return { extra, ok: false, line: `Release them in reverse of calling: the ${quarterOf(next)!.name} first.` };
  return { extra: withQuarters(extra, { ...state, open: state.open.filter((x) => x !== id) }), ok: true, line: `Thanked and released the ${q.name}.` };
}

export function setQuarterColor(extra: Extra, id: QuarterId, color: string | null): Extra {
  const state = quartersOf(extra);
  const colors = { ...state.colors };
  if (color && cleanColor(color, '') && cleanColor(color) !== quarterOf(id)!.color) colors[id] = cleanColor(color);
  else delete colors[id];
  return withQuarters(extra, { ...state, colors });
}

/**
 * Which quarter's edge a point is near (stage fractions, x of width and y of
 * height), or null in the middle. `band` is how far in from an edge counts.
 */
export function quarterAt(x: number, y: number, band = 0.2): QuarterId | null {
  const d = { right: 1 - x, bottom: 1 - y, left: x, top: y };
  const [edge, dist] = Object.entries(d).sort((a, b) => a[1] - b[1])[0];
  if (dist > band) return null;
  return QUARTERS.find((q) => q.edge === edge)!.id;
}

/** Where each quarter's marker sits on the stage (fractions). */
export const QUARTER_SPOT: Record<QuarterId, Pt> = { east: { x: 0.94, y: 0.5 }, south: { x: 0.5, y: 0.9 }, west: { x: 0.06, y: 0.5 }, north: { x: 0.5, y: 0.1 } };

/**
 * The quarter whose marker a tap lands on (stage fractions; `aspect` is the
 * stage's width over its height), or null. `reach` is a fraction of the
 * stage's width, generous enough for a fingertip.
 */
export function quarterSpotAt(x: number, y: number, aspect: number, reach = 0.07): QuarterId | null {
  let best: QuarterId | null = null;
  let bestD = reach;
  for (const q of QUARTERS) {
    const spot = QUARTER_SPOT[q.id];
    const d = Math.hypot(x - spot.x, (y - spot.y) / aspect);
    if (d <= bestD) {
      best = q.id;
      bestD = d;
    }
  }
  return best;
}

/** What's still open, for the circle panel; null when nothing is. */
export function circleReminder(extra: Extra | null | undefined): string | null {
  const circle = circleOf(extra);
  const { open, order } = quartersOf(extra);
  if (!circle && !open.length) return null;
  const parts: string[] = [];
  if (open.length) parts.push(`release the ${releaseOrderOf(order).filter((id) => open.includes(id)).map((id) => quarterOf(id)!.name).join(', ')}`);
  if (circle) parts.push('release the circle');
  return `Before you end, ${parts.join(', then ')}.`;
}
