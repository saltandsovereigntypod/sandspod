// A land-journal place's rough location, kept only on this phone: never in
// the place's craft entry, never synced or sent anywhere. The website keeps
// its own in the browser's localStorage under the same key.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { cleanWhere } from './land';

export const LAND_WHERE_KEY = 'land.where';

let cache: Record<string, string> | null = null;
const listeners = new Set<() => void>();

async function load(): Promise<Record<string, string>> {
  if (cache) return cache;
  try {
    const parsed = JSON.parse((await AsyncStorage.getItem(LAND_WHERE_KEY)) ?? '{}');
    cache = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, string>) : {};
  } catch {
    cache = {};
  }
  return cache;
}

export async function setPlaceWhere(placeId: string, text: string) {
  const all = { ...(await load()) };
  const clean = cleanWhere(text);
  if (clean) all[placeId] = clean;
  else delete all[placeId];
  cache = all;
  listeners.forEach((l) => l());
  try {
    await AsyncStorage.setItem(LAND_WHERE_KEY, JSON.stringify(all));
  } catch {
    // Kept in memory until the next try.
  }
}

/** The rough location of a place on this phone, live. */
export function usePlaceWhere(placeId: string | null | undefined): string {
  const [where, setWhere] = useState(() => (placeId && cache?.[placeId]) || '');
  useEffect(() => {
    let alive = true;
    const update = () => alive && setWhere((placeId && cache?.[placeId]) || '');
    listeners.add(update);
    void load().then(update);
    return () => {
      alive = false;
      listeners.delete(update);
    };
  }, [placeId]);
  return where;
}
