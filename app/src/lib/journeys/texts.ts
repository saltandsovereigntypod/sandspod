// The full text of each dedication journey, loaded when it's first opened
// rather than carried in the app: the journeys are about four megabytes, the
// biggest part of the app's code. scripts/build-journey-texts.mjs (run by
// scripts/build-core.mjs) writes each one to js/core/journeys/<id>.json on the
// website; the app fetches it once, keeps it on the phone, and from then on it
// works offline, quietly refreshing from the website when it can. Lists use
// the small catalog (./catalog.ts); ./index.ts keeps the whole registry for the
// tests and the build.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { WEBSITE_ORIGIN } from '../altar/assetPaths';
import { JOURNEY_CATALOG } from './catalog';
import type { Journey } from './types';

export const journeyTextUrl = (id: string) => `${WEBSITE_ORIGIN}/js/core/journeys/${encodeURIComponent(id)}.json`;
const storageKey = (id: string) => `journeys.text.v1.${id}`;

const known = new Set(JOURNEY_CATALOG.map((j) => j.id));
const loaded = new Map<string, Journey>();
const unavailable = new Set<string>();
const pending = new Map<string, Promise<Journey | null>>();
const refreshed = new Set<string>();

let version = 0;
const listeners = new Set<() => void>();
const changed = () => {
  version += 1;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getVersion = () => version;

/** A stored or fetched journey, if it's sound and the one asked for. */
export function readJourneyText(raw: unknown, id: string): Journey | null {
  const j = raw as Partial<Journey> | null;
  if (!j || typeof j !== 'object' || j.id !== id || typeof j.title !== 'string' || !Array.isArray(j.stages) || !Array.isArray(j.paths)) return null;
  return j as Journey;
}

async function fetchJourney(id: string): Promise<Journey | null> {
  try {
    const r = await fetch(journeyTextUrl(id));
    const j = r.ok ? readJourneyText(await r.json(), id) : null;
    if (j) AsyncStorage.setItem(storageKey(id), JSON.stringify(j)).catch(() => {});
    return j;
  } catch {
    return null;
  }
}

async function readStored(id: string): Promise<Journey | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(id));
    return raw ? readJourneyText(JSON.parse(raw), id) : null;
  } catch {
    return null;
  }
}

/** Once a session, look for a newer text on the website for a journey kept on the phone. */
function refresh(id: string) {
  if (refreshed.has(id)) return;
  refreshed.add(id);
  void fetchJourney(id).then((fresh) => {
    if (fresh && JSON.stringify(fresh) !== JSON.stringify(loaded.get(id))) {
      loaded.set(id, fresh);
      changed();
    }
  });
}

/** The journey if it's already loaded, without waiting. */
export const cachedJourney = (id: string | null | undefined): Journey | null => (id ? loaded.get(id) ?? null : null);

/** The journey: from memory, then the phone, then the website. Null if it can't be had (offline, or no such journey). */
export function loadJourney(id: string | null | undefined): Promise<Journey | null> {
  if (!id || !known.has(id)) return Promise.resolve(null);
  const have = loaded.get(id);
  if (have) return Promise.resolve(have);
  let p = pending.get(id);
  if (!p) {
    p = (async () => {
      const stored = await readStored(id);
      if (stored) refresh(id);
      const j = stored ?? (refreshed.add(id), await fetchJourney(id));
      if (j) {
        loaded.set(id, j);
        unavailable.delete(id);
      } else unavailable.add(id);
      changed();
      return j;
    })().finally(() => pending.delete(id));
    pending.set(id, p);
  }
  return p;
}

/** 'loading' while it's fetched; 'offline' when it couldn't be (not on the phone yet, no connection); 'missing' for no such journey. */
export type JourneyTextState = 'ready' | 'loading' | 'offline' | 'missing';

/** One journey's full text, loading it if need be. */
export function useJourneyText(id: string | null | undefined): { journey: Journey | null; state: JourneyTextState; retry: () => void } {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  useEffect(() => {
    void loadJourney(id);
  }, [id]);
  const journey = cachedJourney(id);
  const state: JourneyTextState = journey ? 'ready' : !id || !known.has(id) ? 'missing' : unavailable.has(id) && !pending.has(id) ? 'offline' : 'loading';
  return { journey, state, retry: () => void loadJourney(id) };
}

/** Several journeys (those under way): loads them, and returns a version that changes as each arrives. */
export function useJourneyTexts(ids: string[]): number {
  const v = useSyncExternalStore(subscribe, getVersion, getVersion);
  const key = ids.join(',');
  useEffect(() => {
    for (const id of key ? key.split(',') : []) void loadJourney(id);
  }, [key]);
  return v;
}
