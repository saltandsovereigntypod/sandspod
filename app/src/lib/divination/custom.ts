// Spreads of your own: a name, what to draw, a shape (a line, a cross, an
// arc, a circle or a grid) and a name for each place. Kept as craft entries
// in `hedge.spreads`, synced like the reading log, so the app and the
// website both offer them. Pure, so it can be tested.

import type { DrawKind, Position, Spread } from './draw.ts';
import { SHAPES, type Shape } from './layout.ts';

export const SPREADS_COLLECTION = 'hedge.spreads';

/** The most places a spread of your own can have. */
export const MAX_PLACES = 13;

export type CustomSpreadData = {
  name: string;
  kind: DrawKind;
  /** One line on what it's for (may be blank). */
  detail: string;
  shape: Shape;
  positions: Position[];
};

export type CustomSpreadEntry = { id: string; data: CustomSpreadData };

const KINDS: DrawKind[] = ['tarot', 'runes', 'ogham', 'lenormand', 'kipper', 'oracle'];
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** What each place is called when you leave it blank: "Card 2", "Rune 2", "Stave 2". */
export const placeWord = (kind: DrawKind) => (kind === 'runes' ? 'Rune' : kind === 'ogham' ? 'Stave' : 'Card');

export function blankCustomSpread(kind: DrawKind = 'tarot'): CustomSpreadData {
  return { name: '', kind, detail: '', shape: 'line', positions: [{ name: '', about: '' }, { name: '', about: '' }, { name: '', about: '' }] };
}

/** Whatever was saved (on this device, the other one, or an older version), made whole. */
export function normalizeCustomSpread(raw: unknown): CustomSpreadData {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const kind = KINDS.includes(r.kind as DrawKind) ? (r.kind as DrawKind) : 'tarot';
  const shape = SHAPES.some((s) => s.id === r.shape) ? (r.shape as Shape) : 'line';
  const list = Array.isArray(r.positions) ? r.positions : [];
  const positions = list.slice(0, MAX_PLACES).map((p) => {
    const o = (p && typeof p === 'object' ? p : {}) as Record<string, unknown>;
    return { name: str(o.name, 80), about: str(o.about, 240) };
  });
  return { name: str(r.name, 80), kind, detail: str(r.detail, 240), shape, positions: positions.length ? positions : [{ name: '', about: '' }] };
}

/** Tidied for keeping: blank places get a number, a blank name gets one too. */
export function tidyCustomSpread(data: CustomSpreadData): CustomSpreadData {
  const d = normalizeCustomSpread(data);
  return {
    ...d,
    name: d.name || 'My spread',
    positions: d.positions.map((p, i) => ({ name: p.name || `${placeWord(d.kind)} ${i + 1}`, about: p.about })),
  };
}

export const customSpreadId = (entryId: string) => `custom-${entryId}`;
export const entryIdOfSpread = (spreadId: string) => (spreadId.startsWith('custom-') ? spreadId.slice('custom-'.length) : null);

/** A kept spread of your own, ready to draw. */
export function customSpread(entry: CustomSpreadEntry): Spread {
  const d = tidyCustomSpread(entry.data);
  const n = d.positions.length;
  return {
    id: customSpreadId(entry.id),
    kind: d.kind,
    label: d.name,
    detail: d.detail || `Your own spread of ${n === 1 ? 'one place' : `${n} places`}.`,
    positions: d.positions.map((p) => ({ name: p.name, about: p.about })),
    lookBackDays: n === 1 ? 7 : 30,
    group: 'yours',
    shape: d.shape,
  };
}

/** Your spreads, A to Z, from the collection's entries. */
export function customSpreads(entries: { id: string; data: unknown }[]): Spread[] {
  return entries.map((e) => customSpread({ id: e.id, data: normalizeCustomSpread(e.data) })).sort((a, b) => a.label.localeCompare(b.label));
}
