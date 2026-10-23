// Dressing and anointing a candle: an oil and herbs, rubbed on toward you to
// draw something in or away from you to send it off. Each becomes an entry in
// the candle's livingState.candle.dressings, in the website's own shape
// ({ type, herb, form, label }), so the website shows the oil sheen and herb
// overlay; the direction and when are extra fields it keeps.
//
// Also: what a candle's dressings add up to, and how much of a carving is
// left as the candle burns down (the stage draws it).

import type { LibraryEntry } from '../../library/types.ts';
import { carvingMark, isCandle, readLivingState, writeLivingState, type Carving, type Dressing } from '../livingState.ts';
import {
  correspondenceOf,
  entryByName,
  listing,
  planetName,
  tally,
  type Correspondence,
  type ElementOrSpirit,
  type Planet,
} from '../reading/correspondence.ts';
import type { SavedObject } from '../types.ts';

export type Direction = 'draw' | 'banish';

export const DIRECTIONS: { id: Direction; label: string; how: string }[] = [
  { id: 'draw', label: 'Toward you, to draw', how: 'Rub from the ends toward the middle, or from the top down toward you, to draw it in.' },
  { id: 'banish', label: 'Away from you, to banish', how: 'Rub from the middle out to the ends, or away from you, to send it off.' },
];

/** A dressing as the website stores it, plus the app's direction and time. */
export type DressingEntry = Dressing & { direction?: Direction; dressedAt?: string };

const slugHerb = (name: string) =>
  name
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');

/**
 * The dressing entry for an oil ("Rose oil", or a herb's oil from the
 * cabinet) or a loose herb. `herb` is the Library herb key when there is one,
 * as the cabinet writes it ("st_johns_wort").
 */
export function dressingEntry(
  kind: 'oil' | 'herb',
  label: string,
  direction: Direction,
  now: string,
  entries?: LibraryEntry[] | null,
): DressingEntry {
  const clean = label.replace(/\s+/g, ' ').trim();
  const entry = entryByName(clean, entries, 'herb');
  const herb = entry?.id.startsWith('traditional:herb:') ? entry.id.split(':')[2] : entry ? slugHerb(entry.name) : '';
  const named = kind === 'oil' && !/\boil\b/i.test(clean) ? `${clean} oil` : clean;
  return {
    type: kind,
    herb,
    form: kind === 'oil' ? 'oil' : 'loose',
    label: named.charAt(0).toUpperCase() + named.slice(1),
    direction,
    dressedAt: now,
  };
}

const sameDressing = (a: Dressing, b: Dressing) =>
  a.type === b.type && a.form === b.form && (a.herb ? a.herb === b.herb : String(a.label).toLowerCase() === String(b.label).toLowerCase());

/** Dress a candle with these, skipping any it already has (as the website's dressCandle does). */
export function dressWith(candle: SavedObject, add: DressingEntry[], now: string): SavedObject {
  if (!isCandle(candle) || !add.length) return candle;
  const state = readLivingState(candle, now);
  const current = state.candle?.dressings ?? [];
  const fresh = add.filter((d, i) => d.label && !current.some((c) => sameDressing(c, d)) && !add.slice(0, i).some((p) => sameDressing(p, d)));
  if (!fresh.length) return candle;
  return writeLivingState(candle, { ...state, lastUsedAt: now, candle: { ...state.candle, dressings: [...current, ...fresh] } }, now);
}

export type DressingReading = {
  elements: { key: ElementOrSpirit; count: number }[];
  planets: { key: Planet; count: number }[];
  /** The uses they share most, lower case. */
  uses: string[];
  direction: Direction | 'mixed' | null;
  /** One or two sentences in the app's voice. */
  summary: string;
  parts: Correspondence[];
};

/** What a candle's dressings add up to: their elements, planets and shared uses. */
export function dressingCorrespondences(dressings: Dressing[], entries?: LibraryEntry[] | null): DressingReading {
  const parts = dressings.map((d) => {
    const name = d.herb ? String(d.herb) : String(d.label || '');
    return correspondenceOf(entryByName(name, entries, 'herb') ?? entryByName(String(d.label || ''), entries), String(d.label || ''));
  });
  const elements = tally(parts.map((p) => p.element));
  const planets = tally(parts.map((p) => p.planet));
  const useCounts = tally(parts.flatMap((p) => p.uses.slice(0, 6)));
  const shared = useCounts.filter((u) => u.count > 1).map((u) => u.key);
  const uses = (shared.length ? shared : useCounts.map((u) => u.key)).slice(0, 3);
  const directions = new Set(dressings.map((d) => (d as DressingEntry).direction).filter(Boolean));
  const direction = directions.size === 0 ? null : directions.size > 1 ? 'mixed' : ([...directions][0] as Direction);

  const bits: string[] = [];
  if (!dressings.length) {
    bits.push('Not dressed yet.');
  } else {
    const lead = planets[0] ? planetName(planets[0].key) : elements[0] ? elements[0].key.toLowerCase() : '';
    if (uses.length) bits.push(`Together they lean toward ${listing(uses)}${lead ? `, with ${lead} at the heart of it` : ''}.`);
    else if (lead) bits.push(`They carry ${lead}.`);
    if (direction === 'draw') bits.push('Dressed toward you: this candle is drawing in.');
    if (direction === 'banish') bits.push('Dressed away from you: this candle is sending off.');
    if (direction === 'mixed') bits.push('Dressed both ways: one hand drawing, one sending. Fine if that’s the working, worth a thought if not.');
  }
  return { elements, planets, uses, direction, summary: bits.join(' '), parts };
}

export type CarvingRemains = {
  /** How much of the carving is left, 0–1. */
  remaining: number;
  /** The letters still readable (top ones melt first). */
  visibleText: string;
  /** Each letter, top to bottom, with how clearly it still shows (0 gone, 1 crisp). */
  glyphs: { char: string; opacity: number }[];
  /** Where the melt line is, as a fraction down the carving (0 top, 1 bottom). */
  meltLine: number;
};

/**
 * A carving that burns away: words are carved down the candle and the flame
 * takes the top first. Given the carving and how far the candle has burned
 * (0 new, 1 spent), what's left. The carving sits in the upper `band` of the
 * candle (default: the top 70%), so it starts melting at once and is gone just
 * before the candle is.
 */
export function carvingRemaining(text: string, progress: number, band = 0.7): CarvingRemains {
  const chars = [...String(text ?? '')];
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const span = Math.max(0.05, Math.min(1, band));
  const meltLine = Math.min(1, p / span);
  const n = chars.length;
  if (!n) return { remaining: 1 - meltLine, visibleText: '', glyphs: [], meltLine };
  const glyphs = chars.map((char, i) => {
    // Each letter owns a slice of the carving; it fades as the melt line crosses it.
    const top = i / n;
    const bottom = (i + 1) / n;
    const opacity = meltLine <= top ? 1 : meltLine >= bottom ? 0 : 1 - (meltLine - top) / (bottom - top);
    return { char, opacity: Math.round(opacity * 100) / 100 };
  });
  return {
    remaining: 1 - meltLine,
    visibleText: glyphs
      .filter((g) => g.opacity > 0)
      .map((g) => g.char)
      .join('')
      .trim(),
    glyphs,
    meltLine,
  };
}

/** How a carving looks as the candle burns, in a sentence: a word melts letter by letter; a sigil from the top down. */
export function carvingLine(carving: Carving, progress: number): string {
  if (carvingMark(carving)) {
    const melt = carvingRemaining('x', progress).meltLine;
    const name = `The sigil for “${carving.text}”`;
    return melt <= 0 ? `${name} is carved into the wax.` : melt < 1 ? `${name} is melting away from the top.` : `${name} has melted away into the wax.`;
  }
  const left = carvingRemaining(carving.text, progress).visibleText;
  return left === carving.text.trim()
    ? `“${carving.text}” is carved down the wax.`
    : left
      ? `“${carving.text}” is melting away from the top; “${left}” is left.`
      : `“${carving.text}” has melted away into the wax.`;
}
