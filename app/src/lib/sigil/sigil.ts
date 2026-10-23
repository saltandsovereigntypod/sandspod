// A finished sigil, as it's saved: kept in the craft store (`eclectic.sigils`),
// on a Grimoire page (in an image element's metadata, with an SVG picture of
// it as the image's url so any reader can show it), and carved into a candle
// (Carving.sigil). The app and the website both read and write this shape.
// Pure.

import { RING, simplify, toPath, type Polyline } from './geometry.ts';
import { planetById, type PlanetId } from './kamea.ts';

export const SIGILS = 'eclectic.sigils';

export type SigilMethod = 'letters' | 'kamea' | 'freehand';

export type Sigil = {
  version: 1;
  method: SigilMethod;
  /** The statement of intent, as written. */
  intent: string;
  /** The letters left once repeats (and perhaps vowels) were struck out. */
  letters: string;
  /** The planet's square it was traced on (kamea method only). */
  planet: PlanetId | null;
  /** The mark itself: SVG path data in a 100 × 100 box. */
  d: string;
  /** Line weight, in the box's units. */
  weight: number;
  /** A circle drawn round it. */
  ring: boolean;
};

/** What a craft store entry holds. */
export type KeptSigil = { name: string; sigil: Sigil };

export const WEIGHTS = [
  { id: 'fine', label: 'Fine', value: 1.6 },
  { id: 'steady', label: 'Steady', value: 2.6 },
  { id: 'bold', label: 'Bold', value: 4 },
] as const;

export const DEFAULT_WEIGHT = 2.6;
export const MAX_PATH = 24000;

export const METHOD_LABELS: Record<SigilMethod, string> = {
  letters: 'The letter method',
  kamea: 'A planetary square',
  freehand: 'Drawn by hand',
};

/** Path data made only of moves, lines, arcs and numbers: safe to put in any SVG. */
export function cleanPath(d: unknown): string | null {
  if (typeof d !== 'string') return null;
  const path = d.trim();
  if (!path || path.length > MAX_PATH || !/^[MLAZmlaz0-9 .,\-]+$/.test(path) || !/^[Mm]/.test(path)) return null;
  return path;
}

const clamp = (n: unknown, lo: number, hi: number, fallback: number) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;

/** A sigil from saved data, or null if it isn't one. Unknown fields are left behind. */
export function readSigil(value: unknown): Sigil | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const d = cleanPath(v.d);
  if (!d) return null;
  const method: SigilMethod = v.method === 'kamea' || v.method === 'freehand' ? v.method : 'letters';
  return {
    version: 1,
    method,
    intent: typeof v.intent === 'string' ? v.intent.slice(0, 500) : '',
    letters: typeof v.letters === 'string' ? v.letters.replace(/[^A-Z]/g, '').slice(0, 26) : '',
    planet: planetById(typeof v.planet === 'string' ? v.planet : null)?.id ?? null,
    d,
    weight: clamp(v.weight, 0.8, 6, DEFAULT_WEIGHT),
    ring: v.ring === true,
  };
}

/** A short name for a sigil: its intent, cut at a word. */
export function sigilName(sigil: Pick<Sigil, 'intent' | 'letters'>, max = 40): string {
  const intent = sigil.intent.replace(/\s+/g, ' ').trim();
  if (!intent) return sigil.letters ? `Sigil of ${sigil.letters}` : 'My sigil';
  if (intent.length <= max) return intent;
  const cut = intent.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 12 ? cut.lastIndexOf(' ') : cut.length).trim()}…`;
}

/** How it was made, one line each, for a Grimoire page's correspondence box. */
export function sigilDetails(sigil: Sigil, made: string): string {
  const planet = planetById(sigil.planet);
  return [
    `Method: ${METHOD_LABELS[sigil.method]}`,
    sigil.letters ? `Letters: ${[...sigil.letters].join(' ')}` : null,
    planet ? `Square: ${planet.name}, ${planet.size} × ${planet.size}` : null,
    planet ? `Day: ${planet.day}` : null,
    `Made: ${made}`,
  ]
    .filter(Boolean)
    .join('\n');
}

// ── Pictures ──────────────────────────────────────────────────────────────

export const INK = '#2a1c12';
export const PAPER = { light: '#f1e6c8', mid: '#e6d4a8', edge: '#c9ad78' };

function hash(text: string): number {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Foxing: a few faint brown spots on the paper, placed by the sigil itself so they stay put. */
export function foxing(seed: string, count = 6): { cx: number; cy: number; r: number; o: number }[] {
  let s = hash(seed) || 1;
  const next = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1000) / 1000;
  };
  return Array.from({ length: count }, () => ({ cx: 4 + next() * 92, cy: 4 + next() * 92, r: 0.8 + next() * 3.2, o: 0.05 + next() * 0.1 }));
}

const n = (v: number) => String(Math.round(v * 10) / 10);

/**
 * The sigil as an SVG picture: ink on aged paper (or the ink alone). Used for
 * the Grimoire's image, the website's previews and the app's.
 */
export function sigilSvg(sigil: Pick<Sigil, 'd' | 'weight' | 'ring'>, options: { paper?: boolean; ink?: string; size?: number; id?: string } = {}): string {
  const d = cleanPath(sigil.d) ?? '';
  const ink = /^#[0-9a-f]{3,8}$/i.test(options.ink ?? '') ? options.ink! : INK;
  const size = options.size ?? 600;
  const weight = clamp(sigil.weight, 0.8, 6, DEFAULT_WEIGHT);
  const paper = options.paper !== false;
  // Several pictures on one web page each need their own gradient name.
  const gid = /^[A-Za-z][\w-]*$/.test(options.id ?? '') ? options.id! : 'p';
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">`];
  if (paper) {
    parts.push(
      `<defs><radialGradient id="${gid}" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="${PAPER.light}"/><stop offset="0.7" stop-color="${PAPER.mid}"/><stop offset="1" stop-color="${PAPER.edge}"/></radialGradient></defs>`,
      `<rect width="100" height="100" fill="url(#${gid})"/>`,
      ...foxing(d).map((f) => `<circle cx="${n(f.cx)}" cy="${n(f.cy)}" r="${n(f.r)}" fill="#8a5a2b" fill-opacity="${Math.round(f.o * 100) / 100}"/>`),
    );
  }
  const stroke = `fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round"`;
  if (sigil.ring) parts.push(`<circle cx="${RING.cx}" cy="${RING.cy}" r="${RING.r}" ${stroke} stroke-width="${n(weight * 0.8)}" stroke-opacity="0.9"/>`);
  if (d) parts.push(`<path d="${d}" ${stroke} stroke-width="${n(weight)}" stroke-opacity="0.92"/>`);
  parts.push('</svg>');
  return parts.join('');
}

/** The picture as a data: URL, for an image element's url. */
export function sigilDataUrl(sigil: Pick<Sigil, 'd' | 'weight' | 'ring'>): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sigilSvg(sigil))}`;
}

// ── Drawing by hand ───────────────────────────────────────────────────────

export const MAX_STROKES = 80;

/**
 * Hand-drawn strokes (in a square canvas `size` across) as path data in the
 * sigil's box, smoothed a little. Dots become tiny strokes so they still show.
 */
export function freehandPath(strokes: Polyline[], size: number): string {
  if (!(size > 0)) return '';
  const s = 100 / size;
  const lines = strokes.slice(-MAX_STROKES).map((stroke) => {
    const scaled = stroke
      .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
      .map(([x, y]) => [Math.min(100, Math.max(0, x * s)), Math.min(100, Math.max(0, y * s))] as [number, number]);
    if (scaled.length === 1) return [scaled[0], [scaled[0][0] + 0.3, scaled[0][1]]] as Polyline;
    return simplify(scaled, 0.5);
  });
  return toPath(lines.filter((l) => l.length > 1));
}

// ── On a candle ───────────────────────────────────────────────────────────

/** What a candle carving keeps of a sigil: just the mark and its circle. */
export type SigilMark = { d: string; ring?: boolean };

export function markOf(sigil: Pick<Sigil, 'd' | 'ring'>): SigilMark | null {
  const d = cleanPath(sigil.d);
  return d ? (sigil.ring ? { d, ring: true } : { d }) : null;
}

export function readMark(value: unknown): SigilMark | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  return markOf({ d: v.d as string, ring: v.ring === true });
}
