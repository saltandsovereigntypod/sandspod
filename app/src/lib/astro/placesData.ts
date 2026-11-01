// The world-cities list for the birth-chart place search (about 1.4 MB), kept
// out of the app's bundle: scripts/build-core.mjs copies it to
// js/core/cities.json on the website, the app fetches it the first time the
// place search is opened and keeps a copy on the phone, so after that the
// search works offline. Without it, coordinates can still be typed in.

import { File, Paths } from 'expo-file-system';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { WEBSITE_ORIGIN } from '../altar/assetPaths';
import type { CityData } from './places';

export const CITIES_URL = `${WEBSITE_ORIGIN}/js/core/cities.json`;
const FILE_NAME = 'cities-v1.json';

/** A stored or fetched list, if it's sound. */
export function readCityData(raw: unknown): CityData | null {
  const v = raw as Partial<CityData> | null;
  return v && typeof v === 'object' && v.v === 1 ? (v as CityData) : null;
}

let data: CityData | null = null;
let pending: Promise<CityData | null> | null = null;

const file = () => (Platform.OS === 'web' ? null : new File(Paths.document, FILE_NAME));

async function readStored(): Promise<CityData | null> {
  try {
    const f = file();
    return f?.exists ? readCityData(JSON.parse(await f.text())) : null;
  } catch {
    return null;
  }
}

async function fetchCities(): Promise<CityData | null> {
  try {
    const r = await fetch(CITIES_URL);
    if (!r.ok) return null;
    const text = await r.text();
    const got = readCityData(JSON.parse(text));
    if (got) {
      try {
        const f = file();
        if (f) {
          if (!f.exists) f.create();
          f.write(text);
        }
      } catch {
        // Kept for this session only.
      }
    }
    return got;
  } catch {
    return null;
  }
}

/** The list: from memory, then the phone, then the website. Null when it can't be had (offline the first time). */
export function loadCityData(): Promise<CityData | null> {
  if (data) return Promise.resolve(data);
  if (!pending) {
    pending = (async () => {
      data = (await readStored()) ?? (await fetchCities());
      return data;
    })().finally(() => {
      pending = null;
    });
  }
  return pending;
}

/** The list for the place search, loading it once it's wanted. */
export function useCityData(wanted: boolean): { data: CityData | null; state: 'ready' | 'loading' | 'offline'; retry: () => void } {
  const [tries, setTries] = useState(0);
  const [failedAt, setFailedAt] = useState(-1);
  const [, setLoaded] = useState(0);
  useEffect(() => {
    if (!wanted || data) return;
    let live = true;
    void loadCityData().then((d) => {
      if (!live) return;
      if (d) setLoaded((n) => n + 1);
      else setFailedAt(tries);
    });
    return () => {
      live = false;
    };
  }, [wanted, tries]);
  return { data, state: data ? 'ready' : failedAt === tries ? 'offline' : 'loading', retry: () => setTries((t) => t + 1) };
}
