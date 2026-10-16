// Guest work stays on the device under the website's localStorage key names,
// so a guest backup from the browser restores here and the other way round.
// The practice tools keep one key per collection ("craft.<collection>"), so
// those are found by listing the keys.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { CRAFT_PREFIX, GUEST_KEYS, type GuestStorage } from './format';

/** A synchronous, read-only view of the guest keys and the practice tools' entries, for the pure planners. */
export async function readGuestStorage(): Promise<GuestStorage> {
  let craftKeys: string[] = [];
  try {
    craftKeys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(CRAFT_PREFIX));
  } catch {
    craftKeys = [];
  }
  const entries = await AsyncStorage.multiGet([...Object.values(GUEST_KEYS), ...craftKeys]);
  const values = new Map(entries);
  return { getItem: (key: string) => values.get(key) ?? null, keys: () => [...values.keys()].filter((key) => values.get(key) != null) };
}

export async function writeGuestStorage(writes: [string, string][]): Promise<void> {
  if (writes.length) await AsyncStorage.multiSet(writes);
}
