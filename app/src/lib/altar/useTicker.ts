// The altar's shared clock as a hook (./ticker.ts): the time, refreshed every
// `period` ms while `active`, from one interval shared by every subscriber and
// paused while the app is in the background.

import { useCallback, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { createTicker } from './ticker';

export const altarTicker = createTicker();
AppState.addEventListener('change', (s) => altarTicker.setAwake(s === 'active'));

export function useTicker(period: number, active = true): number {
  const subscribe = useCallback((l: () => void) => (active ? altarTicker.subscribe(period, l) : () => {}), [period, active]);
  const read = useCallback(() => altarTicker.now(period), [period]);
  return useSyncExternalStore(subscribe, read, read);
}
