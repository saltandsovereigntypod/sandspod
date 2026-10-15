// Which altar sits in each of the Altar widget's places ("Altar 1" to "Altar 6"
// in the widget's settings). Kept on this device: widgets belong to the phone.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { ALTAR_WIDGET_SLOTS, chooseSlot } from './altarWidget';

const KEY = 'altar.widgetSlots';
let slots: (string | null)[] = Array(ALTAR_WIDGET_SLOTS).fill(null);
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load() {
  if (loaded) return;
  loaded = true;
  AsyncStorage.getItem(KEY)
    .then((raw) => {
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) {
        slots = Array.from({ length: ALTAR_WIDGET_SLOTS }, (_, i) => (typeof parsed[i] === 'string' ? parsed[i] : null));
        emit();
      }
    })
    .catch(() => {});
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAltarWidgetSlots(): (string | null)[] {
  return useSyncExternalStore(subscribe, () => slots);
}

/** Put an altar in a place (1-based), or take it off the home screen with 0. */
export function setAltarWidgetSlot(altarId: string, slot: number) {
  slots = chooseSlot(slots, altarId, slot);
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify(slots)).catch(() => {});
}
