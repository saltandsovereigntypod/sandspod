// When a spell jar on an altar would like shaking: a sealed jar whose
// tending day (livingState.apothecary.nextTendingAt, moved on by "Shake to
// renew") has come. Small and pure (no Library), so To tend (tend/gather.ts)
// and the website's bundle can ask it cheaply.

import { parseLivingState } from '../livingState.ts';
import type { SavedObject } from '../types.ts';
import { appPart } from './appState.ts';

type JarLike = { layers?: unknown[]; seal?: { sealedAt?: string } | null; madeAt?: string; lastRenewedAt?: string };

/** The jar's tending day (ms), whether or not it has come, or null for anything but a sealed jar. */
export function jarTendingAt(object: SavedObject): number | null {
  const jar = appPart<JarLike>(object, 'jar');
  if (!jar || !Array.isArray(jar.layers) || !jar.seal) return null;
  const apothecary = (parseLivingState(object)?.apothecary ?? {}) as Record<string, unknown>;
  const next = Date.parse(String(apothecary.nextTendingAt ?? ''));
  if (Number.isFinite(next)) return next;
  // No tending day written: a month after it was made or last shaken.
  const from = Date.parse(jar.lastRenewedAt || jar.madeAt || jar.seal.sealedAt || '');
  return Number.isFinite(from) ? from + 30 * 86_400_000 : null;
}

/** A sealed jar due a shake now (its tending day has come). */
export function jarWantsShaking(object: SavedObject, now: Date): boolean {
  const at = jarTendingAt(object);
  return at != null && at <= now.getTime();
}
