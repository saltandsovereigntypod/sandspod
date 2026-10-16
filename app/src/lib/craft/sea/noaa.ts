// Fetching and keeping NOAA tide data on the phone: the station list (slimmed
// and kept for a month), the chosen station, the units, and each station's
// last predictions so the tides still show offline. Free and keyless.

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  NOAA_STATIONS,
  parsePredictions,
  predictionsUrl,
  slimStations,
  dayKey,
  type Station,
  type TideEvent,
  type Units,
} from './tides.ts';

const STATIONS_KEY = 'sea.noaaStations.v1';
const CHOSEN_KEY = 'sea.station';
const UNITS_KEY = 'sea.tideUnits';
const TIDES_KEY = 'sea.tideCache.v1';
const MONTH_MS = 30 * 86_400_000;
const FRESH_MS = 6 * 3_600_000;

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Kept in memory for this visit; the next fetch tries again.
  }
}

async function getJson(url: string, timeoutMs = 20_000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`NOAA answered ${res.status}.`);
    return await res.json();
  } catch (e) {
    if (e instanceof Error && /NOAA/.test(e.message)) throw e;
    throw new OfflineError();
  } finally {
    clearTimeout(timer);
  }
}

export class OfflineError extends Error {
  constructor() {
    super('Couldn’t reach NOAA. You may be offline.');
  }
}

let stationsMemo: Station[] | null = null;

/** Every NOAA tide-prediction station: from the phone when we have a recent copy, else fetched. */
export async function loadStations(): Promise<Station[]> {
  if (stationsMemo) return stationsMemo;
  const saved = await readJson<{ at: number; stations: Station[] }>(STATIONS_KEY);
  if (saved && Array.isArray(saved.stations) && Date.now() - saved.at < MONTH_MS) return (stationsMemo = saved.stations);
  try {
    const stations = slimStations(await getJson(NOAA_STATIONS, 45_000));
    await writeJson(STATIONS_KEY, { at: Date.now(), stations });
    return (stationsMemo = stations);
  } catch (e) {
    // An old list is better than none.
    if (saved && Array.isArray(saved.stations)) return (stationsMemo = saved.stations);
    throw e;
  }
}

export const loadChosenStation = () => readJson<Station>(CHOSEN_KEY);
export const saveChosenStation = (s: Station | null) =>
  s ? writeJson(CHOSEN_KEY, s) : AsyncStorage.removeItem(CHOSEN_KEY).catch(() => undefined);

export async function loadUnits(): Promise<Units> {
  return (await readJson<Units>(UNITS_KEY)) === 'metric' ? 'metric' : 'english';
}
export const saveUnits = (u: Units) => writeJson(UNITS_KEY, u);

type Cached = { station: string; units: Units; day: string; at: number; events: TideEvent[] };

export type TideResult = {
  events: TideEvent[];
  /** When NOAA sent them. */
  fetchedAt: Date;
  /** Served from the phone because NOAA couldn't be reached. */
  offline: boolean;
};

/**
 * Today and the next two days for a station. Uses the copy on the phone when
 * it's from today and less than six hours old; falls back to an older copy
 * when offline (the screen says so).
 */
export async function loadTides(station: Station, units: Units, now = new Date(), force = false): Promise<TideResult> {
  const today = dayKey(now);
  const cache = (await readJson<Cached[]>(TIDES_KEY)) ?? [];
  const hit = cache.find((c) => c.station === station.id && c.units === units);
  if (!force && hit && hit.day === today && Date.now() - hit.at < FRESH_MS) {
    return { events: hit.events, fetchedAt: new Date(hit.at), offline: false };
  }
  try {
    const events = parsePredictions(await getJson(predictionsUrl(station.id, units, now)));
    const entry: Cached = { station: station.id, units, day: today, at: Date.now(), events };
    await writeJson(TIDES_KEY, [entry, ...cache.filter((c) => !(c.station === station.id && c.units === units))].slice(0, 6));
    return { events, fetchedAt: new Date(entry.at), offline: false };
  } catch (e) {
    if (e instanceof OfflineError && hit) {
      // Keep only what hasn't passed yet.
      const events = hit.events.filter((ev) => ev.day >= today);
      if (events.length) return { events, fetchedAt: new Date(hit.at), offline: true };
    }
    throw e;
  }
}
