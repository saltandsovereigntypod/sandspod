// The app's SaltSyncStatus: one shared copy of how saving is going for the
// signed-in account, fed by the stores' real save calls. See status.ts.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { useSession } from '../session';
import {
  beginSave,
  cloudStatus,
  emptySync,
  endSave,
  isOfflineMessage,
  lastSyncKey,
  reportSource,
  type CloudStatus,
  type SourceState,
  type SyncModel,
} from './status';

let model: SyncModel = emptySync();
const listeners = new Set<() => void>();

function set(next: SyncModel) {
  if (next === model) return;
  const success = next.lastSuccess !== model.lastSuccess ? next.lastSuccess : null;
  model = next;
  if (success && next.userId) AsyncStorage.setItem(lastSyncKey(next.userId), success).catch(() => {});
  listeners.forEach((listener) => listener());
}

/** Starts a fresh status for whoever is signed in, with their last sync time on this device. */
function bind(userId: string | null) {
  if (model.userId === userId) return;
  set(emptySync(userId));
  if (!userId) return;
  AsyncStorage.getItem(lastSyncKey(userId))
    .then((stored) => {
      if (stored && model.userId === userId && (!model.lastSuccess || stored > model.lastSuccess)) {
        model = { ...model, lastSuccess: stored };
        listeners.forEach((listener) => listener());
      }
    })
    .catch(() => {});
}

/** A save queue (the altar, the grimoire) says how it's doing. */
export function reportSync(source: string, userId: string | null, state: SourceState) {
  if (!userId) return;
  bind(userId);
  set(reportSource(model, source, state, new Date().toISOString()));
}

/** Runs a one-off save to the account, showing it as saving until it ends. Guests pass null. */
export async function trackSave<T>(userId: string | null, save: () => Promise<T>): Promise<T> {
  if (!userId) return save();
  bind(userId);
  set(beginSave(model));
  try {
    const result = await save();
    if (model.userId === userId) set(endSave(model, 'ok', new Date().toISOString()));
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (model.userId === userId) set(endSave(model, isOfflineMessage(message) ? 'offline' : 'unavailable', new Date().toISOString()));
    throw error;
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** The signed-in account's sync status and last successful sync time. */
export function useCloudSync(): { status: CloudStatus; lastSuccess: string | null } {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  useEffect(() => bind(userId), [userId]);
  const snap = useSyncExternalStore(subscribe, () => model, () => model);
  const mine = snap.userId === userId ? snap : emptySync(userId);
  return { status: cloudStatus(mine), lastSuccess: mine.lastSuccess };
}
