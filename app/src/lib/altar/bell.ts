// The altar bell. Tapping a bell on the altar offers to ring it once, or
// three times to cleanse the space; ringing to cleanse marks your own
// Cleansing thing on the To tend list (lib/tend) as done today, "Sound /
// bells". On a coven altar everyone there hears it, at most once every
// RING_GAP_MS from each person. The sound itself (assets/sounds/bell-chime.mp3)
// is synthesised: a few inharmonic partials, as a small bell has, nothing
// recorded. Shared with the website's altar (js/core/altar.js bell).

import { dueOf, normalizeRecord, OWN_TYPES, recordDone, type TendRecord } from '../tend/model.ts';

/** A bell placed from the cabinet's Tools. */
export const isBell = (o: { type?: string; tool?: string } | null | undefined) => !!o && o.type === 'tool' && o.tool === 'bell';

/** Three rings to cleanse the space, this far apart. */
export const CLEANSE_RINGS = 3;
export const CLEANSE_GAP_MS = 1600;
/** One ring per person per this long, heard by the others on a coven altar. */
export const RING_GAP_MS = 1500;

export type RingKind = 'ring' | 'cleanse';
/** What a coven altar sends the others when you ring. */
export type RingWire = { from: string; kind: RingKind; key?: string };

export const RING_LABEL = 'Ring the bell';
export const CLEANSE_LABEL = 'Ring to cleanse the space';
export const SOUND_OFF_LINE = 'Candle sounds are off in Accessibility, so the bell rings silently here.';

/** The Cleansing how-chip for bells ("Sound / bells"). */
export const BELL_HOW = OWN_TYPES.find((t) => t.value === 'cleansing')?.hows.find((h) => /bell/i.test(h)) ?? 'Sound / bells';

/**
 * Which of your own Cleansing things ringing to cleanse marks done: the one
 * most overdue, else the first. Null when there's none (and nothing is asked).
 */
export function cleansingToMark(records: TendRecord[], now: Date): TendRecord | null {
  const mine = records.filter((r) => r.kind === 'own' && !r.ended && r.own?.type === 'cleansing');
  let best: { record: TendRecord; at: number } | null = null;
  for (const record of mine) {
    const due = dueOf({ kind: 'own', dueAt: null, tendedAt: null }, record, now);
    if (due.state !== 'due' || due.at == null) continue;
    if (!best || due.at < best.at) best = { record, at: due.at };
  }
  return best?.record ?? mine[0] ?? null;
}

/**
 * For the website, from the stored To tend entries as they come (the newest
 * copy of each wins, as lib/tend/store.ts reads them): which entry to update,
 * and the record marked done now with bells. Null when there's no Cleansing.
 */
export function cleanseFromEntries(entries: { id: string; data: unknown; updatedAt?: string }[], now: Date): { id: string; record: TendRecord; title: string } | null {
  const list: { id: string; record: TendRecord }[] = [];
  for (const e of [...entries].sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')))) {
    const record = normalizeRecord(e.data);
    if (record && !list.some((x) => x.record.key === record.key)) list.push({ id: e.id, record });
  }
  const target = cleansingToMark(list.map((x) => x.record), now);
  const entry = target && list.find((x) => x.record === target);
  return entry ? { id: entry.id, record: recordDone(entry.record, now, [BELL_HOW]), title: entry.record.title || 'Cleansing' } : null;
}

/** What the toast says once the space is cleared. */
export const cleansedLine = (marked: string | null) => (marked ? `The space is cleared. “${marked}” is marked done.` : 'The space is cleared.');

/**
 * One ring per person per RING_GAP_MS. Returns whether this ring goes ahead,
 * and keeps it in `last` (person → when they last rang) when it does.
 */
export function ringAllowed(last: Map<string, number>, who: string, now: number, gap = RING_GAP_MS): boolean {
  const before = last.get(who);
  if (before != null && now - before < gap && now >= before) return false;
  last.set(who, now);
  return true;
}

/** A ring from someone else, read off the channel; null when it isn't one. */
export function readRing(raw: unknown, me: string): RingWire | null {
  const r = raw as Partial<RingWire> | null;
  if (!r || typeof r.from !== 'string' || !r.from || r.from === me) return null;
  if (r.kind !== 'ring' && r.kind !== 'cleanse') return null;
  return { from: r.from, kind: r.kind, key: typeof r.key === 'string' ? r.key : undefined };
}
