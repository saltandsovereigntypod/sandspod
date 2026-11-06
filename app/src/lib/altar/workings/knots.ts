// Knot workings on the altar: a witch's ladder (a cord knotted nine times,
// a feather, bead or charm in each knot, a line spoken with each) or a plain
// knotted cord, tied to bind a working in and untied, knot by knot, to let it
// go. Placed as the cabinet's own witch's ladder or red cord; the knots, what
// went into each, the chant and the tying and untying live in
// livingState.app.knots.
//
// History, honestly: knot magic is old and widespread (Olaus Magnus, 1555,
// tells of Finnish wind-sellers tying winds into three knots). The name
// "witch's ladder" comes from a cord of feathers found in a house in
// Wellington, Somerset, in 1878, now in the Pitt Rivers Museum, Oxford; what
// it was for is unknown. The nine-knot ladder and its chant are modern
// witchcraft. Pure.

import { builtInCabinet, objectFromForm } from '../cabinet.ts';
import { setAppState } from '../livingState.ts';
import type { SavedObject } from '../types.ts';
import { appPart, withAppPart } from './appState.ts';

export type KnotStyle = 'ladder' | 'cord';
export type KnotMode = 'bind' | 'release';

export const STYLES: { key: KnotStyle; label: string; line: string; cabinet: string }[] = [
  { key: 'ladder', label: 'Witch’s ladder', line: 'A cord of three strands, a feather, bead or charm knotted into each of nine knots.', cabinet: 'tools:witchs-ladder' },
  { key: 'cord', label: 'Knotted cord', line: 'A single cord, a knot for each part of the working.', cabinet: 'tools:red-cord' },
];

export const MODES: { key: KnotMode; label: string; line: string }[] = [
  { key: 'bind', label: 'Tie it in', line: 'Each knot holds the working fast: a wish, a protection, a promise to yourself.' },
  { key: 'release', label: 'Tie to untie', line: 'Tie what troubles you into the knots, then untie one a day to let it go, as old charms for illness did.' },
];

export const KNOT_COUNTS = [3, 5, 7, 9, 13] as const;
export const TRADITIONAL_KNOTS = 9;

/**
 * Where each knot goes along the cord (1 at one end, 9 at the other) in the
 * order they're commonly tied: the ends first, then the middle, then filling in.
 */
export function knotOrder(count: number): number[] {
  if (count === 9) return [1, 9, 5, 3, 7, 2, 8, 4, 6];
  // For other counts: the ends, then halving the gaps.
  const n = Math.max(1, Math.min(13, count));
  if (n === 1) return [1];
  const order = [1, n];
  const queue: [number, number][] = [[1, n]];
  while (order.length < n && queue.length) {
    const [a, b] = queue.shift()!;
    const mid = Math.floor((a + b) / 2);
    if (mid !== a && mid !== b && !order.includes(mid)) order.push(mid);
    if (mid - a > 1) queue.push([a, mid]);
    if (b - mid > 1) queue.push([mid, b]);
  }
  for (let i = 1; i <= n; i += 1) if (!order.includes(i)) order.push(i);
  return order;
}

/** A widely shared modern Wiccan knot chant (its author isn't known for certain). */
export const NINE_KNOT_CHANT = [
  'By knot of one, the spell’s begun.',
  'By knot of two, it cometh true.',
  'By knot of three, so mote it be.',
  'By knot of four, this power is stored.',
  'By knot of five, the spell’s alive.',
  'By knot of six, this spell I fix.',
  'By knot of seven, the stars of heaven.',
  'By knot of eight, the hand of fate.',
  'By knot of nine, what’s done is mine.',
];

/** The line for a knot: the chant for nine, a plain count otherwise. */
export function chantLine(knot: number, count: number, mode: KnotMode): string {
  if (count === 9 && mode === 'bind') return NINE_KNOT_CHANT[knot - 1] ?? '';
  return mode === 'release' ? `Knot ${knot} of ${count}: this I tie, and this I’ll loose.` : `Knot ${knot} of ${count}: held fast.`;
}

export const UNTIE_LINE = 'As this knot loosens, so it goes from me.';

export type Knot = { n: number; with: string; tiedAt: string; untiedAt?: string };

export type KnotState = {
  kind: 'knots';
  style: KnotStyle;
  mode: KnotMode;
  intent: string;
  count: number;
  knots: Knot[];
  madeAt: string;
  ended?: { how: KnotEnd; at: string };
};

export type KnotEnd = 'keep' | 'burn' | 'bury' | 'untied';
export const KNOT_ENDS: { key: KnotEnd; label: string; text: string }[] = [
  { key: 'keep', label: 'Keep it', text: 'A ladder for protection or a wish is often hung by the door or over the bed and kept until the wish comes.' },
  { key: 'untied', label: 'All untied', text: 'Every knot loosed: the working is let go. Shake the cord out and wash it, or burn it.' },
  { key: 'burn', label: 'Burn it', text: 'Natural cord and feathers only, outdoors in a fire safe, with metal charms taken off. Scatter the ash.' },
  { key: 'bury', label: 'Bury it', text: 'Cotton, wool, hemp and real feathers rot down; take off beads and metal first.' },
];

/** What can go into a ladder's knots, traditionally and now. */
export const KNOT_CHARMS = ['A black feather', 'A white feather', 'A red bead', 'A sprig of rowan', 'A bay leaf', 'A shell', 'A bell', 'A key', 'A strand of my hair', 'Nothing but the knot'];

export type KnotDraft = { style: KnotStyle; mode: KnotMode; intent: string; count: number; with: string[] };
export const emptyKnots = (style: KnotStyle = 'ladder'): KnotDraft => ({ style, mode: 'bind', intent: '', count: style === 'ladder' ? 9 : 3, with: [] });

export function knotsProblem(d: KnotDraft): string | null {
  if (!d.intent.trim()) return 'Say what the knots hold first.';
  return null;
}


/** The cord placed, with no knots tied yet (they're tied one by one on the altar). */
export function knotObject(d: KnotDraft, existing: SavedObject[], now: string, center?: { cx: number; cy: number }): SavedObject {
  const style = STYLES.find((s) => s.key === d.style) ?? STYLES[0];
  const item = builtInCabinet.find((i) => i.id === style.cabinet) ?? null;
  const form = item?.forms.find((f) => !!f.image);
  if (!item || !form) throw new Error('No artwork for the cord.');
  const label = `${style.label}: ${d.intent.trim()}`.slice(0, 60);
  const placed = { ...objectFromForm(item, form, existing, now, {}, center ?? { cx: 0.5, cy: 0.55 }), label };
  const state: KnotState = { kind: 'knots', style: d.style, mode: d.mode, intent: d.intent.trim().slice(0, 120), count: Math.max(1, Math.min(13, d.count)), knots: [], madeAt: now };
  // What goes into each knot is kept as a plan until it's tied.
  return setAppState(placed, { knots: { ...state, plan: d.with.slice(0, 13) } }, now, false);
}

export function knotStateOf(object: SavedObject): (KnotState & { plan: string[] }) | null {
  const s = appPart<KnotState & { plan?: string[] }>(object, 'knots');
  if (!s || s.kind !== 'knots') return null;
  return { ...s, count: Math.max(1, Math.min(13, Number(s.count) || 9)), knots: Array.isArray(s.knots) ? s.knots : [], plan: Array.isArray(s.plan) ? s.plan : [], mode: s.mode === 'release' ? 'release' : 'bind', style: s.style === 'cord' ? 'cord' : 'ladder' };
}

/** How many are tied and still tied. */
export const tiedCount = (s: Pick<KnotState, 'knots'>) => s.knots.filter((k) => !k.untiedAt).length;

/** The next knot to tie: its number in the tying order and where it sits, or null when all are tied. */
export function nextKnot(s: Pick<KnotState, 'knots' | 'count'>): { n: number; place: number } | null {
  const n = s.knots.length + 1;
  if (n > s.count) return null;
  return { n, place: knotOrder(s.count)[n - 1] };
}

/** Tie the next knot, with what goes into it. */
export function tieKnot(object: SavedObject, now: string, withWhat?: string): SavedObject {
  const s = knotStateOf(object);
  if (!s || s.ended) return object;
  const next = nextKnot(s);
  if (!next) return object;
  const knot: Knot = { n: next.n, with: (withWhat ?? s.plan[next.n - 1] ?? '').trim().slice(0, 60), tiedAt: now };
  return withAppPart(object, 'knots', { ...s, knots: [...s.knots, knot] }, now);
}

/** Untie the last knot still tied (they come undone in reverse). */
export function untieKnot(object: SavedObject, now: string): SavedObject {
  const s = knotStateOf(object);
  if (!s || s.ended) return object;
  const idx = [...s.knots].map((k, i) => (k.untiedAt ? -1 : i)).filter((i) => i >= 0).pop();
  if (idx === undefined) return object;
  const knots = s.knots.map((k, i) => (i === idx ? { ...k, untiedAt: now } : k));
  const all = knots.every((k) => k.untiedAt) && knots.length === s.count;
  return withAppPart(object, 'knots', { ...s, knots, ...(all && s.mode === 'release' ? { ended: { how: 'untied', at: now } } : {}) }, now);
}

export function endKnots(object: SavedObject, how: KnotEnd, now: string): SavedObject {
  const s = knotStateOf(object);
  if (!s) return object;
  return withAppPart(object, 'knots', { ...s, ended: { how, at: now } }, now);
}

/** "5 of 9 knots tied", "Untying: 3 left", "Untied on 4 March". */
export function knotsLine(s: Pick<KnotState, 'knots' | 'count' | 'mode' | 'ended'>): string {
  if (s.ended) return `${KNOT_ENDS.find((e) => e.key === s.ended!.how)?.label ?? 'Ended'} on ${new Date(s.ended.at).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}.`;
  const tied = tiedCount(s);
  const untied = s.knots.filter((k) => k.untiedAt).length;
  if (untied) return `Untying: ${tied} knot${tied === 1 ? '' : 's'} left.`;
  if (s.knots.length < s.count) return `${s.knots.length} of ${s.count} knots tied.`;
  return s.mode === 'release' ? `All ${s.count} tied. Untie one a day to let it go.` : `All ${s.count} knots tied and holding.`;
}

/** Untied today already? (One a day, when releasing.) */
export const untiedToday = (s: Pick<KnotState, 'knots'>, now: Date) => s.knots.some((k) => k.untiedAt && new Date(k.untiedAt).toDateString() === now.toDateString());
