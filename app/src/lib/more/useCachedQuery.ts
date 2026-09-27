// Fetch-with-offline-copy, the same pattern as the Grimoire store: show the
// copy saved on the device straight away, refresh from Supabase, and if the
// refresh fails keep the saved copy and say we're offline.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

export type QueryStatus = 'idle' | 'loading' | 'ready' | 'offline' | 'error';

export function useCachedQuery<T>(cacheKey: string | null, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<QueryStatus>('idle');
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    if (!cacheKey) return;
    setStatus('loading');
    try {
      const fresh = await fetcherRef.current();
      setData(fresh);
      setStatus('ready');
      AsyncStorage.setItem(cacheKey, JSON.stringify(fresh)).catch(() => {});
    } catch {
      setStatus('offline');
    }
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
