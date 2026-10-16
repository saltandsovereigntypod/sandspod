// Whether the altar is open full screen, so the tab bar can step aside.

import { useSyncExternalStore } from 'react';

let fullScreen = false;
const listeners = new Set<() => void>();

export function setAltarFullScreen(next: boolean) {
  if (next === fullScreen) return;
  fullScreen = next;
  listeners.forEach((l) => l());
}

export function useAltarFullScreen(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => fullScreen,
  );
}
