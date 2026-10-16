// The forecast for Weather for working: fetched from Open-Meteo for the
// saved place, with the last good reply kept on the phone so it still shows
// offline. Only the rounded latitude and longitude are sent.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cacheFresh, forecastUrl, parseForecast, type CachedForecast } from './weather';

const KEY = 'craft.elemental.weather';

async function readCache(): Promise<CachedForecast | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CachedForecast) : null;
    return parsed && Array.isArray(parsed.days) ? parsed : null;
  } catch {
    return null;
  }
}

export type WeatherState = {
  forecast: CachedForecast | null;
  loading: boolean;
  /** Set when the last try failed; the cached forecast, if any, still shows. */
  problem: string | null;
  refresh: () => Promise<void>;
};

export function useWeather(place: { latitude: number; longitude: number } | null): WeatherState {
  const [forecast, setForecast] = useState<CachedForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const live = useRef(true);
  const lat = place?.latitude;
  const lon = place?.longitude;

  const fetchNow = useCallback(
    async (force: boolean) => {
      if (lat === undefined || lon === undefined) return;
      const cached = await readCache();
      if (cached && live.current) setForecast(cached);
      if (!force && cacheFresh(cached, lat, lon, new Date())) return;
      setLoading(true);
      setProblem(null);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12_000);
      try {
        const response = await fetch(forecastUrl(lat, lon), { signal: controller.signal });
        if (!response.ok) throw new Error(`The weather service answered ${response.status}`);
        const days = parseForecast(await response.json());
        const next: CachedForecast = { fetchedAt: new Date().toISOString(), latitude: lat, longitude: lon, days };
        if (live.current) setForecast(next);
        AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      } catch {
        if (live.current) {
          const samePlace = cached && Math.abs(cached.latitude - lat) < 0.011 && Math.abs(cached.longitude - lon) < 0.011;
          setProblem(
            samePlace
              ? 'Couldn’t reach the weather service, so this is the last forecast saved on your phone.'
              : 'Couldn’t reach the weather service. Check your connection and pull down to try again.',
          );
          if (!samePlace) setForecast(null);
        }
      } finally {
        clearTimeout(timer);
        if (live.current) setLoading(false);
      }
    },
    [lat, lon],
  );

  useEffect(() => {
    live.current = true;
    void fetchNow(false);
    return () => {
      live.current = false;
    };
  }, [fetchNow]);

  const refresh = useCallback(() => fetchNow(true), [fetchNow]);
  return { forecast, loading, problem, refresh };
}
