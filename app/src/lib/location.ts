// Where the person is, for sunrise, sunset, moonrise and planetary hours.
// Kept only on this device (never synced) and rounded to about a kilometre.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import type { Place } from './astro/rise';

export type SavedPlace = Place & { source: 'device' | 'manual'; label?: string };

const KEY = 'sky.place';
let state: SavedPlace | null = null;
let loaded = false;
const listeners = new Set<() => void>();

const round = (n: number) => Math.round(n * 100) / 100;

function set(next: SavedPlace | null) {
  state = next;
  listeners.forEach((l) => l());
  (next ? AsyncStorage.setItem(KEY, JSON.stringify(next)) : AsyncStorage.removeItem(KEY)).catch(() => {});
}

async function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      state = JSON.parse(raw) as SavedPlace;
      listeners.forEach((l) => l());
    }
  } catch {
    // Nothing saved.
  }
}

export function validPlace(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
}

export function setManualPlace(latitude: number, longitude: number, label?: string): boolean {
  if (!validPlace(latitude, longitude)) return false;
  set({ latitude: round(latitude), longitude: round(longitude), source: 'manual', label });
  return true;
}

export function clearPlace() {
  set(null);
}

export type DeviceLocationResult = 'ok' | 'denied' | 'unavailable';

/**
 * Asks for the phone's location once. The location module arrives with the
 * next app build, so in builds without it this reports 'unavailable'.
 */
export async function askDeviceLocation(): Promise<DeviceLocationResult> {
  let Location: typeof import('expo-location');
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- loaded only when asked, so older builds keep working
    Location = require('expo-location');
    if (!(await Location.hasServicesEnabledAsync().catch(() => true))) return 'unavailable';
  } catch {
    return 'unavailable';
  }
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') return 'denied';
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: 6 * 3_600_000 })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
    set({ latitude: round(position.coords.latitude), longitude: round(position.coords.longitude), source: 'device' });
    return 'ok';
  } catch {
    return 'unavailable';
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The saved place outside React (for reminders), once read from the device. */
export async function readPlace(): Promise<SavedPlace | null> {
  await load();
  return state;
}

export function usePlace(): SavedPlace | null {
  useEffect(() => {
    void load();
  }, []);
  return useSyncExternalStore(subscribe, () => state, () => state);
}
