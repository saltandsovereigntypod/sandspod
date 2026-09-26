// Guest work stays on the device under the website's localStorage key names,
// so a guest backup from the browser restores here and the other way round.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { GUEST_KEYS } from './format';

/** A synchronous, read-only view of the guest keys, for the pure planners. */
export async function readGuestStorage(): Promise<Pick<Storage, 'getItem'>> {
  const entries = await AsyncStorage.multiGet(Object.values(GUEST_KEYS));
  const values = new Map(entries);
  return { getItem: (key: string) => values.get(key) ?? null };
}

export async function writeGuestStorage(writes: [string, string][]): Promise<void> {
  if (writes.length) await AsyncStorage.multiSet(writes);
}
