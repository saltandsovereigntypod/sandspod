// The crystal care recorded on an altar (devotion careForCrystal) in the words
// a stone's own log in Crystal takes. Kept apart from ritualStart.ts, which
// pulls in the premade book, so the website's altar bundle stays small. Pure.

import { humanize } from '../devotion.ts';
import { readLivingState } from '../livingState.ts';
import type { SavedObject } from '../types.ts';

export type AltarCare = { kind: 'cleansed' | 'charged'; at: string; methods: string[]; intention?: string };

type CareRecord = { occurredAt?: string; methods?: unknown; intention?: string };

/**
 * The most recent cleansing or charge recorded on this crystal on the altar
 * (devotion careForCrystal), in the words the stone's own log takes. Null when
 * there isn't one.
 */
export function lastAltarCareOf(object: SavedObject | null | undefined): AltarCare | null {
  if (!object) return null;
  const crystal = (readLivingState(object, '').crystal ?? {}) as { cleansingHistory?: unknown; chargingHistory?: unknown };
  const last = (list: unknown): CareRecord | null => {
    const records = (Array.isArray(list) ? list : []).filter((r): r is CareRecord => !!r && typeof r === 'object' && !!(r as CareRecord).occurredAt);
    return records.reduce<CareRecord | null>((best, r) => (!best || String(r.occurredAt) > String(best.occurredAt) ? r : best), null);
  };
  const cleansed = last(crystal.cleansingHistory);
  const charged = last(crystal.chargingHistory);
  const pick = cleansed && (!charged || String(cleansed.occurredAt) >= String(charged.occurredAt)) ? { kind: 'cleansed' as const, r: cleansed } : charged ? { kind: 'charged' as const, r: charged } : null;
  if (!pick) return null;
  const methods = (Array.isArray(pick.r.methods) ? pick.r.methods : []).map((m) => humanize(m)).filter(Boolean);
  return { kind: pick.kind, at: String(pick.r.occurredAt), methods, ...(pick.r.intention ? { intention: String(pick.r.intention) } : {}) };
}
