// Shared drawing helpers for sigils: polylines (lists of points), merging the
// strokes letters share, fitting a drawing into the sigil's box, and writing it
// as SVG path data. Every sigil lives in a 100 × 100 box. Pure.

export type Point = [number, number];
export type Polyline = Point[];

/** The sigil's own box is 0..100; the glyph sits inside this square so a circle can go round it. */
export const GLYPH_BOX = { min: 20, max: 80 } as const;
/** The circle drawn round a sigil: centred in the box. */
export const RING = { cx: 50, cy: 50, r: 44 } as const;

const round = (n: number, places = 1) => {
  const f = 10 ** places;
  const v = Math.round(n * f) / f;
  return Object.is(v, -0) ? 0 : v;
};
const fmt = (n: number) => String(round(n));

/** Points round a circle (angles in degrees, y down as on screen), from a0 to a1. */
export function arc(cx: number, cy: number, r: number, a0: number, a1: number, steps = 12): Polyline {
  const out: Polyline = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

export type Transform = { rotate?: number; mirror?: boolean; scale?: number; dx?: number; dy?: number };

/** Turn, mirror, scale and move points about the centre of a `size` box. */
export function transform(lines: Polyline[], t: Transform, size = 4): Polyline[] {
  const c = size / 2;
  const a = (((t.rotate ?? 0) % 360) * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const s = t.scale ?? 1;
  return lines.map((line) =>
    line.map(([x0, y0]) => {
      let x = x0 - c;
      const y = y0 - c;
      if (t.mirror) x = -x;
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      return [c + rx * s + (t.dx ?? 0), c + ry * s + (t.dy ?? 0)] as Point;
    }),
  );
}

const key = ([x, y]: Point) => `${round(x, 2)},${round(y, 2)}`;

/**
 * Break the drawing into straight pieces, drop any piece drawn twice (as
 * overlapping letters share strokes), and join what's left back into lines.
 */
export function mergeStrokes(lines: Polyline[]): Polyline[] {
  const seen = new Set<string>();
  const segments: [Point, Point][] = [];
  for (const line of lines) {
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1];
      const b = line[i];
      const ka = key(a);
      const kb = key(b);
      if (ka === kb) continue;
      const id = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
      if (seen.has(id)) continue;
      seen.add(id);
      segments.push([a, b]);
    }
  }
  // Chain pieces end to start, in the order they were drawn.
  const out: Polyline[] = [];
  for (const [a, b] of segments) {
    const last = out[out.length - 1];
    if (last && key(last[last.length - 1]) === key(a)) last.push(b);
    else out.push([a, b]);
  }
  return out;
}

export function bounds(lines: Polyline[]): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const line of lines)
    for (const [x, y] of line) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
}

/** Scale a drawing evenly to fill the glyph square, centred. */
export function fitToBox(lines: Polyline[], box: { min: number; max: number } = GLYPH_BOX): Polyline[] {
  const b = bounds(lines);
  if (!b) return [];
  const w = b.maxX - b.minX;
  const h = b.maxY - b.minY;
  const room = box.max - box.min;
  const s = Math.max(w, h) > 0 ? room / Math.max(w, h) : 1;
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  const mid = (box.min + box.max) / 2;
  return lines.map((line) => line.map(([x, y]) => [mid + (x - cx) * s, mid + (y - cy) * s] as Point));
}

/** SVG path data for polylines: "M x y L x y …", one decimal place. */
export function toPath(lines: Polyline[]): string {
  return lines
    .filter((line) => line.length > 1)
    .map((line) => line.map(([x, y], i) => `${i ? 'L' : 'M'}${fmt(x)} ${fmt(y)}`).join(' '))
    .join(' ');
}

/** A whole circle as path data (two half arcs), so it can share a path with lines. */
export function circlePath(cx: number, cy: number, r: number): string {
  return `M${fmt(cx - r)} ${fmt(cy)} A${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(cx + r)} ${fmt(cy)} A${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(cx - r)} ${fmt(cy)}`;
}

function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (!len) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
}

/** Fewer points for a hand-drawn line, keeping its shape (Ramer–Douglas–Peucker). */
export function simplify(line: Polyline, tolerance = 0.6): Polyline {
  if (line.length < 3) return line.slice();
  let index = 0;
  let max = 0;
  for (let i = 1; i < line.length - 1; i++) {
    const d = perpendicularDistance(line[i], line[0], line[line.length - 1]);
    if (d > max) {
      max = d;
      index = i;
    }
  }
  if (max <= tolerance) return [line[0], line[line.length - 1]];
  const left = simplify(line.slice(0, index + 1), tolerance);
  const right = simplify(line.slice(index), tolerance);
  return [...left.slice(0, -1), ...right];
}
