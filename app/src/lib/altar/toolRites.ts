// What the altar's other working tools do. The chalice is filled (wine,
// water, juice or mead), raised in a toast, poured out as a libation (into
// an offering bowl on the altar when there is one) and drunk, its level
// shown in the cup (offerings.ts keeps it, offeringArt.ts draws it). The
// besom sweeps the altar of its debris: incense burned to ash, burned cords,
// spent matches and the ash of burned petitions. Matches, a lighter and a
// candle snuffer, brought near a candle or incense, offer to light it or put
// it out (never on their own). Every one is kept in the altar's History.
// Pure, so it can be tested; shared with the website (js/core/altar.js
// toolRites).

import { displayBox, STAGE_ASPECT } from './geometry.ts';
import { cordsOf, cordState, untieCord } from './cord.ts';
import { incenseLife, isIncense } from './incense.ts';
import type { AltarDocument } from './snapshot.ts';
import { candleLife, isCandle, isLit, logAppEvent } from './livingState.ts';
import { holdsOfferings, offeringOf, setOffering, type OfferingKindId } from './offerings.ts';
import type { SavedObject } from './types.ts';

// ── The chalice ─────────────────────────────────────────────────────────

export const isChalice = (o: Pick<SavedObject, 'type' | 'tool'> | null | undefined) => !!o && o.type === 'tool' && /chalice/.test(String(o.tool || ''));

export const CHALICE_DRINKS: { id: string; label: string; kind: OfferingKindId }[] = [
  { id: 'wine', label: 'Wine', kind: 'drink' },
  { id: 'water', label: 'Water', kind: 'water' },
  { id: 'juice', label: 'Juice', kind: 'drink' },
  { id: 'mead', label: 'Mead', kind: 'drink' },
];

/** How full the cup is, 0 to 1. */
export function chaliceLevel(o: SavedObject): number {
  const c = offeringOf(o);
  if (!c || (c.kind !== 'drink' && c.kind !== 'water')) return 0;
  return c.fill ?? 1;
}
/** What's in it ("wine"), or ''. */
export const chaliceDrink = (o: SavedObject) => (chaliceLevel(o) > 0 ? offeringOf(o)?.label || 'wine' : '');

/** How much a libation pours out. */
export const LIBATION = 0.25;

export function fillChalice(o: SavedObject, drinkId: string, now: string): SavedObject {
  const drink = CHALICE_DRINKS.find((d) => d.id === drinkId) ?? CHALICE_DRINKS[0];
  const filled = setOffering(o, drink.kind, drink.id, now);
  return filled === o ? o : logAppEvent(filled, { kind: 'chalice', text: `Filled the chalice with ${drink.id}.` }, now);
}

export function raiseChalice(o: SavedObject, now: string): SavedObject {
  return logAppEvent(o, { kind: 'chalice', text: 'Raised the chalice in a toast.' }, now);
}

export function drinkChalice(o: SavedObject, now: string): SavedObject {
  const c = offeringOf(o);
  if (!c) return o;
  return logAppEvent(o, { kind: 'chalice', text: `Drank the ${c.label || 'wine'}.` }, now, { offering: null });
}

/** Lower the cup by `amount`; empty once nearly nothing is left. */
function pourFrom(o: SavedObject, amount: number, now: string, text: string): SavedObject {
  const c = offeringOf(o);
  if (!c) return o;
  const fill = Math.round(((c.fill ?? 1) - amount) * 100) / 100;
  return logAppEvent(o, { kind: 'chalice', text }, now, { offering: fill <= 0.02 ? null : { ...c, fill } });
}

/** The bowl or dish a libation is poured into, when one is on the altar: an offering bowl first. */
export function libationBowlIndex(objects: SavedObject[], chalice: number): number {
  const score = (o: SavedObject) => {
    const where = `${o.vessel ?? ''} ${o.imagePath ?? ''} ${o.tool ?? ''}`;
    if (/libation|offering-bowl|phiale/.test(where)) return 3;
    if (/bowl/.test(where) && !/singing/.test(where)) return 2;
    return 1;
  };
  let best = -1;
  let bestScore = 0;
  objects.forEach((o, i) => {
    if (i === chalice || isChalice(o) || isCandle(o) || !holdsOfferings(o)) return;
    const s = score(o);
    if (s > bestScore) {
      best = i;
      bestScore = s;
    }
  });
  return best;
}

/**
 * Pour a libation: some of the cup into the bowl (which then holds it as an
 * offering, so it ages and asks to be tended like any other), or onto the
 * earth when no bowl is there. Returns both changed, or null with an empty cup.
 */
export function pourLibation(chalice: SavedObject, bowl: SavedObject | null, now: string): { chalice: SavedObject; bowl: SavedObject | null; line: string } | null {
  const c = offeringOf(chalice);
  if (!c || chaliceLevel(chalice) <= 0) return null;
  const what = c.label || 'wine';
  if (!bowl) {
    const line = `Poured a libation of ${what}.`;
    return { chalice: pourFrom(chalice, LIBATION, now, line), bowl: null, line };
  }
  const line = `Poured a libation of ${what} into the bowl.`;
  const into = setOffering(bowl, c.kind, what, now);
  return { chalice: pourFrom(chalice, LIBATION, now, line), bowl: into, line };
}

// ── Lighting and snuffing by hand ───────────────────────────────────────

export const isFireTool = (o: Pick<SavedObject, 'type' | 'tool'> | null | undefined) => !!o && o.type === 'tool' && /match|lighter/.test(String(o.tool || ''));
export const isSnuffer = (o: Pick<SavedObject, 'type' | 'tool'> | null | undefined) => !!o && o.type === 'tool' && /snuffer/.test(String(o.tool || ''));
export const isLighter = (o: Pick<SavedObject, 'type' | 'tool'> | null | undefined) => !!o && o.type === 'tool' && /lighter/.test(String(o.tool || ''));

/** Something a match or lighter could light now. */
export const canLight = (o: SavedObject, now = Date.now()) =>
  (isCandle(o) && !isLit(o) && !candleLife(o, now).spent) || (isIncense(o) && !incenseLife(o, now).lit && !incenseLife(o, now).ash);
/** Something a snuffer could put out now. */
export const canSnuff = (o: SavedObject, now = Date.now()) => (isCandle(o) && isLit(o)) || (isIncense(o) && incenseLife(o, now).lit);

/** A box in stage-width units (y measured in widths too, so both axes match). */
export type Rect = { left: number; top: number; right: number; bottom: number };
export function rectOf(o: SavedObject): Rect {
  const b = displayBox(o);
  const w = b.size;
  const h = b.size * b.aspect;
  const cy = b.cy / STAGE_ASPECT;
  return { left: b.cx - w / 2, right: b.cx + w / 2, top: cy - h / 2, bottom: cy + h / 2 };
}

/** How close (stage widths) counts as near. */
export const NEAR = 0.03;
const gap = (a: Rect, b: Rect) => Math.hypot(Math.max(0, b.left - a.right, a.left - b.right), Math.max(0, b.top - a.bottom, a.top - b.bottom));

/**
 * The thing a tool held near could light (or put out), by their boxes: the
 * nearest one within NEAR of the tool, or -1.
 */
export function nearTarget(objects: SavedObject[], tool: number, mode: 'light' | 'snuff', now = Date.now(), near = NEAR): number {
  const t = objects[tool];
  if (!t) return -1;
  const tr = rectOf(t);
  const tc = { x: (tr.left + tr.right) / 2, y: (tr.top + tr.bottom) / 2 };
  let best = -1;
  let bestD = Infinity;
  objects.forEach((o, i) => {
    if (i === tool || !(mode === 'light' ? canLight(o, now) : canSnuff(o, now))) return;
    const r = rectOf(o);
    if (gap(tr, r) > near) return;
    const d = Math.hypot((r.left + r.right) / 2 - tc.x, (r.top + r.bottom) / 2 - tc.y);
    if (d < bestD) {
      best = i;
      bestD = d;
    }
  });
  return best;
}

// ── Debris and the besom ────────────────────────────────────────────────

export const isBesom = (o: Pick<SavedObject, 'type' | 'tool'> | null | undefined) => !!o && o.type === 'tool' && /besom|broom/.test(String(o.tool || ''));

/** A spent match or a little ash left on the altar, kept with the altar (`debris`), at stage fractions. */
export type Debris = { id: string; kind: 'match' | 'ash'; x: number; y: number; at: string };
export const DEBRIS_MAX = 16;
type Extra = Record<string, unknown>;

export function debrisOf(extra: Extra | null | undefined): Debris[] {
  const list = extra?.debris;
  if (!Array.isArray(list)) return [];
  return list
    .filter((d): d is Debris => !!d && typeof d === 'object' && (d.kind === 'match' || d.kind === 'ash') && Number.isFinite(d.x) && Number.isFinite(d.y))
    .map((d) => ({ id: String(d.id || `${d.kind}-${d.x}-${d.y}`), kind: d.kind, x: d.x, y: d.y, at: String(d.at || '') }));
}

const withDebris = (extra: Extra, list: Debris[]): Extra => {
  if (list.length) return { ...extra, debris: list.slice(-DEBRIS_MAX) };
  const { debris: _gone, ...rest } = extra;
  void _gone;
  return rest;
};

/** Leave a spent match or ash beside something (its foot, a little to one side). */
export function dropDebris(extra: Extra, kind: Debris['kind'], near: SavedObject | null, now: string, seed = Date.parse(now) || 0): Extra {
  const b = near ? displayBox(near) : { cx: 0.5, cy: 0.7, size: 0.1, aspect: 1 };
  const side = seed % 2 ? 1 : -1;
  const x = Math.min(0.97, Math.max(0.03, b.cx + side * (b.size * 0.55 + 0.02 + ((seed >> 3) % 5) * 0.005)));
  const y = Math.min(0.97, Math.max(0.03, b.cy + (b.size * b.aspect * STAGE_ASPECT) / 2 - 0.02));
  return withDebris(extra, [...debrisOf(extra), { id: `${kind}-${seed.toString(36)}`, kind, x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000, at: now }]);
}

export type SweepResult = { extra: Extra; ash: number[]; matches: number; ashes: number; cords: string[] };

/**
 * What a sweep along `path` (stage fractions) clears: loose debris within
 * `reach` (stage widths) of it, incense ash whose box it passes, and burned
 * cords it passes near. `everything` sweeps the whole altar.
 */
export function sweepAlong(
  objects: SavedObject[],
  extra: Extra,
  path: { x: number; y: number }[],
  burnedCords: { id: string; x: number; y: number }[] = [],
  everything = false,
  reach = 0.06,
  now = Date.now(),
): SweepResult {
  const pts = path.map((p) => ({ x: p.x, y: p.y / STAGE_ASPECT }));
  const touches = (x: number, y: number) => everything || pts.some((p) => Math.hypot(p.x - x, p.y - y / STAGE_ASPECT) <= reach);
  const touchesRect = (r: Rect) => everything || pts.some((p) => p.x >= r.left - reach && p.x <= r.right + reach && p.y >= r.top - reach && p.y <= r.bottom + reach);
  const debris = debrisOf(extra);
  const kept = debris.filter((d) => !touches(d.x, d.y));
  const gone = debris.filter((d) => !kept.includes(d));
  const ash: number[] = [];
  objects.forEach((o, i) => {
    if (isIncense(o) && incenseLife(o, now).ash && touchesRect(rectOf(o))) ash.push(i);
  });
  const cords = burnedCords.filter((c) => touches(c.x, c.y)).map((c) => c.id);
  return {
    extra: gone.length ? withDebris(extra, kept) : extra,
    ash,
    matches: gone.filter((d) => d.kind === 'match').length,
    ashes: gone.filter((d) => d.kind === 'ash').length,
    cords,
  };
}

/** Burned-through cords, at the middle between their candles (stage fractions), for the besom. */
export function burnedCordSpots(doc: AltarDocument, now = Date.now()): { id: string; x: number; y: number }[] {
  const out: { id: string; x: number; y: number }[] = [];
  for (const c of cordsOf(doc)) {
    if (cordState(doc, c, now).status !== 'cut') continue;
    const a = doc.objects.find((o) => o.altarObjectId === c.a);
    const b = doc.objects.find((o) => o.altarObjectId === c.b);
    if (!a || !b) continue;
    const ba = displayBox(a);
    const bb = displayBox(b);
    out.push({ id: c.id, x: (ba.cx + bb.cx) / 2, y: (ba.cy + bb.cy) / 2 });
  }
  return out;
}

/** Clear what a sweep found from the altar: its debris, the ash (the incense made ready again by `clearAsh`) and the burned cords. */
export function applySweep(doc: AltarDocument, r: SweepResult, clearAsh: (o: SavedObject) => SavedObject): AltarDocument {
  let next: AltarDocument = r.extra === doc.extra ? doc : { ...doc, extra: r.extra };
  if (r.ash.length) next = { ...next, objects: next.objects.map((o, i) => (r.ash.includes(i) ? clearAsh(o) : o)) };
  for (const id of r.cords) next = untieCord(next, id);
  return next;
}

const count = (n: number, one: string, many: string) => (n === 1 ? `a ${one}` : `${n === 2 ? 'two' : n === 3 ? 'three' : n} ${many}`);

/** The History line for a sweep, or null when nothing was cleared. */
export function sweepLine(r: Pick<SweepResult, 'ash' | 'matches' | 'ashes' | 'cords'>): string | null {
  const parts: string[] = [];
  if (r.ash.length) parts.push(r.ash.length === 1 ? 'the incense ash' : `the ash of ${count(r.ash.length, 'incense', 'incenses')}`);
  if (r.ashes) parts.push(r.ashes === 1 ? 'the ash of a burned petition' : `the ash of ${count(r.ashes, 'petition', 'petitions')}`);
  if (r.matches) parts.push(count(r.matches, 'spent match', 'spent matches'));
  if (r.cords.length) parts.push(r.cords.length === 1 ? 'a burned cord' : count(r.cords.length, 'burned cord', 'burned cords'));
  if (!parts.length) return null;
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
  return `Swept the altar: cleared away ${list}.`;
}

/** Anything at all to sweep. */
export const hasDebris = (objects: SavedObject[], extra: Extra, burnedCords: number, now = Date.now()) =>
  debrisOf(extra).length > 0 || burnedCords > 0 || objects.some((o) => isIncense(o) && incenseLife(o, now).ash);

// ── Heard on a coven altar ──────────────────────────────────────────────

/** A sound or moment from someone else at a coven altar (the "rite" broadcast). */
export type RiteWire = { from: string; kind: 'bowl' | 'strike' | 'click' | 'toast' | 'pour' | 'sweep'; key?: string; tone?: string };
const RITE_KINDS = ['bowl', 'strike', 'click', 'toast', 'pour', 'sweep'];

export function readRite(raw: unknown, me: string): RiteWire | null {
  const r = raw as Partial<RiteWire> | null;
  if (!r || typeof r.from !== 'string' || !r.from || r.from === me) return null;
  if (!RITE_KINDS.includes(String(r.kind))) return null;
  return { from: r.from, kind: r.kind as RiteWire['kind'], ...(typeof r.key === 'string' ? { key: r.key } : {}), ...(typeof r.tone === 'string' ? { tone: r.tone } : {}) };
}
