// The altar bell. Tapping a bell on the altar offers to ring it once, or
// three times to cleanse the space; ringing to cleanse is kept in that
// altar's own History ("Space cleansed with the bell"), and leaves the To
// tend list alone (what's there is what you put there). On a coven altar everyone there hears it, at most once every
// RING_GAP_MS from each person. The sound itself (assets/sounds/bell-chime.mp3)
// is synthesised: a few inharmonic partials, as a small bell has, nothing
// recorded. Shared with the website's altar (js/core/altar.js bell).

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

/** The line kept in the altar's History when you ring to cleanse it. */
export const CLEANSED_HISTORY = 'Space cleansed with the bell.';
/** What the toast says once the space is cleared. */
export const CLEANSED_LINE = 'The space is cleared.';

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
