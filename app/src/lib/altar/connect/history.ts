// An altar's history: the log lines the altar already writes to the craft
// collection `altar.history` ({ altarId, text, at }), and now snapshots of how
// the altar looked ({ altarId, kind: 'snapshot', at, day, objects… }), taken
// at most once a day and only when something changed, so you can look back at
// "this altar a month ago". Pure, so it can be tested.

import { localDateKey } from '../../rituals/lifecycle.ts';
import type { SavedObject } from '../types.ts';

export const HISTORY = 'altar.history';

/** A log line, as the altar screen writes it. */
export type HistoryLine = { altarId: string; text: string; at: string; kind?: undefined };

/** What a snapshot keeps of each object: enough to draw it, nothing more. */
export type SnapshotObject = Pick<
  SavedObject,
  'imagePath' | 'fallbackSymbol' | 'label' | 'type' | 'color' | 'form' | 'leftPercent' | 'topPercent' | 'sizePercent' | 'scale' | 'rotation' | 'flipped' | 'lit' | 'zIndex' | 'altarObjectId'
>;

export type HistorySnapshot = {
  altarId: string;
  kind: 'snapshot';
  at: string;
  /** Local day it was taken, YYYY-MM-DD. */
  day: string;
  name: string;
  background: string;
  objects: SnapshotObject[];
  /** "12 things · 3 candles lit". */
  summary: string;
  /** Changes when what's drawn changes; equal signatures look the same. */
  signature: string;
};

export type HistoryData = HistoryLine | HistorySnapshot;
export type HistoryEntry = { id: string; createdAt: string; data: HistoryData };

const KEEP: (keyof SnapshotObject)[] = ['imagePath', 'fallbackSymbol', 'label', 'type', 'color', 'form', 'leftPercent', 'topPercent', 'sizePercent', 'scale', 'rotation', 'flipped', 'lit', 'zIndex', 'altarObjectId'];

export const isSnapshot = (data: unknown): data is HistorySnapshot => !!data && typeof data === 'object' && (data as HistorySnapshot).kind === 'snapshot' && Array.isArray((data as HistorySnapshot).objects);
const isLine = (data: unknown): data is HistoryLine => !!data && typeof data === 'object' && typeof (data as HistoryLine).text === 'string' && !(data as HistorySnapshot).kind;

export function snapshotObject(object: SavedObject): SnapshotObject {
  const out: SnapshotObject = {};
  for (const key of KEEP) if (object[key] !== undefined && object[key] !== '') (out as Record<string, unknown>)[key] = object[key];
  return out;
}

function hash(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** Positions rounded so a nudge of a pixel isn't a change worth keeping. */
export function sceneSignature(objects: SavedObject[], background: string): string {
  const r = (v: unknown) => (typeof v === 'number' ? Math.round(v * 200) : String(v ?? ''));
  const parts = objects.map((o) => [o.imagePath, o.fallbackSymbol, o.label, r(o.leftPercent), r(o.topPercent), r(o.sizePercent), o.rotation, o.flipped, o.lit].join('|'));
  return hash(`${background}#${parts.join(';')}`);
}

export function snapshotSummary(objects: SavedObject[]): string {
  const n = objects.length;
  const lit = objects.filter((o) => o.type === 'candle' && o.lit === 'true').length;
  const parts = [n === 0 ? 'Bare' : `${n} ${n === 1 ? 'thing' : 'things'}`];
  if (lit) parts.push(`${lit} ${lit === 1 ? 'candle' : 'candles'} lit`);
  return parts.join(' · ');
}

export function snapshotsFor(entries: HistoryEntry[], altarId: string): (HistoryEntry & { data: HistorySnapshot })[] {
  return entries
    .filter((e): e is HistoryEntry & { data: HistorySnapshot } => isSnapshot(e.data) && e.data.altarId === altarId)
    .sort((a, b) => (a.data.at < b.data.at ? 1 : -1));
}

/**
 * Today's snapshot to add for this altar, or null: one a day at most, and
 * only when it looks different from the last one kept.
 */
export function snapshotDue(
  entries: HistoryEntry[],
  altar: { id: string; name: string; background: string; objects: SavedObject[] },
  now: Date,
): HistorySnapshot | null {
  if (!altar.id) return null;
  const day = localDateKey(now);
  const signature = sceneSignature(altar.objects, altar.background);
  const latest = snapshotsFor(entries, altar.id)[0];
  if (latest && (latest.data.day === day || latest.data.signature === signature)) return null;
  // An empty altar that was never kept isn't worth a first snapshot.
  if (!latest && altar.objects.length === 0) return null;
  return {
    altarId: altar.id,
    kind: 'snapshot',
    at: now.toISOString(),
    day,
    name: altar.name,
    background: altar.background,
    objects: altar.objects.map(snapshotObject),
    summary: snapshotSummary(altar.objects),
    signature,
  };
}

export type LookBack = 'week' | 'month' | 'season' | 'year';

export const LOOK_BACKS: { id: LookBack; label: string; days: number; within: number }[] = [
  { id: 'week', label: 'A week ago', days: 7, within: 3 },
  { id: 'month', label: 'A month ago', days: 30, within: 10 },
  { id: 'season', label: 'A season ago', days: 91, within: 21 },
  { id: 'year', label: 'A year ago', days: 365, within: 45 },
];

const DAY = 86_400_000;

/**
 * The snapshot nearest to `days` ago, within the look-back's leeway; when two
 * are equally near, the older (it's closer to the moment asked about).
 */
export function lookBack(entries: HistoryEntry[], altarId: string, which: LookBack, now: Date): (HistoryEntry & { data: HistorySnapshot }) | null {
  const spec = LOOK_BACKS.find((l) => l.id === which)!;
  const target = now.getTime() - spec.days * DAY;
  let best: (HistoryEntry & { data: HistorySnapshot }) | null = null;
  let distance = Infinity;
  for (const e of snapshotsFor(entries, altarId)) {
    const at = Date.parse(e.data.at);
    if (!Number.isFinite(at) || at > now.getTime() - DAY / 2) continue;
    const d = Math.abs(at - target);
    if (d <= spec.within * DAY && d <= distance) {
      best = e;
      distance = d;
    }
  }
  return best;
}

/** Which look-backs have a snapshot to show. */
export function availableLookBacks(entries: HistoryEntry[], altarId: string, now: Date): { id: LookBack; label: string; entry: HistoryEntry & { data: HistorySnapshot } }[] {
  return LOOK_BACKS.map((l) => ({ id: l.id, label: l.label, entry: lookBack(entries, altarId, l.id, now) }))
    .filter((x): x is { id: LookBack; label: string; entry: HistoryEntry & { data: HistorySnapshot } } => !!x.entry);
}

export type TimelineItem =
  | { kind: 'line'; id: string; at: string; text: string }
  | { kind: 'snapshot'; id: string; at: string; text: string; snapshot: HistorySnapshot };

/** Everything this altar remembers, newest first. */
export function timeline(entries: HistoryEntry[], altarId: string, limit = 200): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const e of entries) {
    const d = e.data;
    if (!d || (d as { altarId?: string }).altarId !== altarId) continue;
    if (isSnapshot(d)) items.push({ kind: 'snapshot', id: e.id, at: d.at, text: d.summary, snapshot: d });
    else if (isLine(d) && Number.isFinite(Date.parse(d.at))) items.push({ kind: 'line', id: e.id, at: d.at, text: d.text });
  }
  return items.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0)).slice(0, limit);
}

/**
 * Old snapshots to let go, so the history stays light: every day for the
 * last 45 days, then one a week for a year, then one a month.
 */
export function snapshotsToPrune(entries: HistoryEntry[], altarId: string, now: Date): string[] {
  const keep = new Set<string>();
  const drop: string[] = [];
  for (const e of snapshotsFor(entries, altarId)) {
    const at = Date.parse(e.data.at);
    const age = (now.getTime() - at) / DAY;
    const bucket = age <= 45 ? `d${e.data.day}` : age <= 365 ? `w${Math.floor(at / (7 * DAY))}` : `m${e.data.day.slice(0, 7)}`;
    // Newest first, so the first in each bucket is the one kept.
    if (keep.has(bucket)) drop.push(e.id);
    else keep.add(bucket);
  }
  return drop;
}

/** A snapshot's objects as saved objects, for drawing (composeScene). */
export const snapshotObjects = (snapshot: HistorySnapshot): SavedObject[] => snapshot.objects.map((o) => ({ ...o }));
