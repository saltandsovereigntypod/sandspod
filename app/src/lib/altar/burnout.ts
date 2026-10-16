// Candles on saved altars burn down even when no one has the altar open: these
// find the altars with a candle that has run out, and when the next one will.

import { nextBurnout, settleCandles } from './editor.ts';
import { candleLife } from './livingState.ts';
import { altarDataFromDocument, documentFromAltar } from './snapshot.ts';
import type { AltarDocument } from './snapshot.ts';
import type { SavedAltar } from './types.ts';

/** The saved altars that changed because a candle on them went out, with their settled documents. */
export function settleAltars(altars: SavedAltar[], now: string): { altar: SavedAltar; doc: AltarDocument }[] {
  const changed: { altar: SavedAltar; doc: AltarDocument }[] = [];
  for (const altar of altars) {
    const doc = documentFromAltar(altar);
    const settled = settleCandles(doc, now);
    if (settled !== doc) changed.push({ altar, doc: settled });
  }
  return changed;
}

/** When the next candle on any saved altar runs out, or null. */
export function nextAltarBurnout(altars: SavedAltar[], now: Date = new Date()): number | null {
  let soonest: number | null = null;
  for (const altar of altars) {
    const at = nextBurnout(documentFromAltar(altar), now);
    if (at != null && (soonest == null || at < soonest)) soonest = at;
  }
  return soonest;
}

/** The altars as they will be at `at`, with every candle that runs out by then gone out. */
export function altarsAt(altars: SavedAltar[], at: Date): SavedAltar[] {
  const changed = new Map(settleAltars(altars, at.toISOString()).map(({ altar, doc }) => [altar.id, { altar, doc }]));
  return altars.map((altar) => {
    const hit = changed.get(altar.id);
    return hit ? { ...altar, ...altarDataFromDocument(hit.doc, altar.name, altar.savedAt || at.toISOString()) } : altar;
  });
}

/** The moments candles on these altars run out, soonest first, within `days` (at most `limit`). */
export function burnoutTimes(altars: SavedAltar[], now: Date, days = 7, limit = 12): number[] {
  const until = now.getTime() + days * 86_400_000;
  const times = new Set<number>();
  for (const altar of altars) {
    for (const object of documentFromAltar(altar).objects) {
      if (object.type !== 'candle' || object.lit !== 'true') continue;
      const { burnoutAt } = candleLife(object, now);
      if (burnoutAt != null && burnoutAt > now.getTime() && burnoutAt <= until) times.add(burnoutAt);
    }
  }
  return [...times].sort((a, b) => a - b).slice(0, limit);
}
