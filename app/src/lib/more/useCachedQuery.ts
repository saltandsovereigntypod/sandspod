// Fetch-with-offline-copy, the same pattern as the Grimoire store: show the
// copy saved on the device straight away, refresh from Supabase, and if the
// refresh fails keep the saved copy and say we're offline. Hooks reading the
// same key share one request at a time, and each fresh copy reaches all of
// them (so the home screen widgets follow what Today has just fetched).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

export type QueryStatus = 'idle' | 'loading' | 'ready' | 'offline' | 'error';

const inFlight = new Map<string, Promise<unknown>>();
const listeners = new Map<string, Set<(fresh: unknown) => void>>();

function fetchShared<T>(cacheKey: string, fetcher: () => Promise<T>): Promise<T> {
  const running = inFlight.get(cacheKey) as Promise<T> | undefined;
  if (running) return running;
  const request = fetcher()
    .then((fresh) => {
      AsyncStorage.setItem(cacheKey, JSON.stringify(fresh)).catch(() => {});
      for (const listener of listeners.get(cacheKey) ?? []) listener(fresh);
      return fresh;
    })
    .finally(() => inFlight.delete(cacheKey));
  inFlight.set(cacheKey, request);
  return request;
}

export function useCachedQuery<T>(cacheKey: string | null, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<QueryStatus>('idle');
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    if (!cacheKey) return;
    setStatus('loading');
    try {
      setData(await fetchShared(cacheKey, () => fetcherRef.current()));
      setStatus('ready');
    } catch {
      setStatus('offline');
    }
  }, [cacheKey]);

  // A fresh copy fetched by another hook on the same key.
  useEffect(() => {
    if (!cacheKey) return;
    const listener = (fresh: unknown) => setData(fresh as T);
    const set = listeners.get(cacheKey) ?? new Set();
    set.add(listener);
    listeners.set(cacheKey, set);
    return () => {
      set.delete(listener);
    };
  }, [cacheKey]);

  useEffect(() => {
    setData(null);
    setStatus('idle');
    if (!cacheKey) return;
    let active = true;
    AsyncStorage.getItem(cacheKey)
      .then((cached) => {
        if (active && cached) setData(JSON.parse(cached) as T);
      })
      .catch(() => {})
      .finally(() => {
        if (active) refresh();
      });
    return () => {
      active = false;
    };
  }, [cacheKey, refresh]);

  return { data, status, refresh, setData };
}
