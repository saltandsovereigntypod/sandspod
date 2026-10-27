// The draw not yet kept, on this device only (see drawDraft.ts). Never
// synced, and not under "craft." so backups and sign-in leave it alone.
// Nothing breaks without it.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { DRAW_DRAFT_KEY, parseDraft, type DrawDraft } from './drawDraft';

export async function loadDrawDraft(): Promise<DrawDraft | null> {
  try {
    return parseDraft(await AsyncStorage.getItem(DRAW_DRAFT_KEY));
  } catch {
    return null;
  }
}

export function saveDrawDraft(text: string) {
  AsyncStorage.setItem(DRAW_DRAFT_KEY, text).catch(() => {});
}

export function clearDrawDraft(): Promise<void> {
  return AsyncStorage.removeItem(DRAW_DRAFT_KEY).catch(() => {});
}
