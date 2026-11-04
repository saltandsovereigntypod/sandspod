// Whether the altar is open full screen, or in Ritual mode, so the tab bar can step aside.

import { useSyncExternalStore } from 'react';

function flag() {
  let value = false;
  const listeners = new Set<() => void>();
  const set = (next: boolean) => {
    if (next === value) return;
    value = next;
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  };
  return { set, subscribe, get: () => value };
}

const fullScreen = flag();
const ritualMode = flag();

export const setAltarFullScreen = fullScreen.set;

export function useAltarFullScreen(): boolean {
  return useSyncExternalStore(fullScreen.subscribe, fullScreen.get);
}

/** The personal or a coven altar is in Ritual mode: the phone's bottom bar tucks away until it ends. */
export const setAltarRitualMode = ritualMode.set;

export function useAltarRitualMode(): boolean {
  return useSyncExternalStore(ritualMode.subscribe, ritualMode.get);
}
