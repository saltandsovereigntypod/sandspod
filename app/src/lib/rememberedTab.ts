// The tab last used at the top of a screen (Today, Coven), kept in memory and
// on the device so the screen reopens it. Nothing breaks without it: if the
// device's storage fails, the screen opens its first tab.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const memory = new Map<string, string | null>();

function read(key: string): Promise<string | null> {
  try {
    return AsyncStorage.getItem(key).catch(() => null);
  } catch {
    return Promise.resolve(null);
  }
}

function write(key: string, value: string) {
  try {
    AsyncStorage.setItem(key, value).catch(() => {});
  } catch {
    // The tab is still remembered while the app stays open.
  }
}

const reading = new Map<string, Promise<void>>();

/** Start reading a remembered tab early (when its screen's module loads), so the screen opens on it without a jump. */
export function preloadRememberedTab(key: string): Promise<void> {
  if (!reading.has(key)) {
    reading.set(
      key,
      read(key).then((stored) => {
        if (!memory.has(key)) memory.set(key, stored);
      }),
    );
  }
  return reading.get(key)!;
}

/**
 * The tab remembered under `key` (null until it has been read, or if none
 * was), and a function to remember a new one.
 */
export function useRememberedTab<K extends string>(key: string, parse: (value: unknown) => K | null): [K | null, (tab: K) => void] {
  const [value, setValue] = useState<K | null>(() => parse(memory.get(key) ?? null));
  useEffect(() => {
    let live = true;
    // Read already, or as soon as it has been (preloadRememberedTab is shared).
    void preloadRememberedTab(key).then(() => {
      if (!live) return;
      setValue((now) => now ?? parse(memory.get(key)));
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- parse is a fixed function per key
  }, [key]);
  const remember = useCallback(
    (tab: K) => {
      setValue(tab);
      if (memory.get(key) === tab) return;
      memory.set(key, tab);
      write(key, tab);
    },
    [key],
  );
  return [value, remember];
}
