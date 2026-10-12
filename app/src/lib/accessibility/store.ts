// Reading and saving accessibility preferences on this device, one set for
// guests and one per account, as the website keeps them in localStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useSession } from '../session';
import {
  ACCESSIBILITY_DEFAULTS,
  accessibleTextStyle,
  accessibilityScope,
  accessibilityStorageKey,
  accessibilityToSave,
  currentAccessibility,
  normalizeAccessibility,
  setCurrentAccessibility,
  type AccessibilityPrefs,
} from './prefs';

let scope: string | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function apply(prefs: AccessibilityPrefs) {
  setCurrentAccessibility(prefs);
  notify();
}

async function load(nextScope: string) {
  let prefs: AccessibilityPrefs = { ...ACCESSIBILITY_DEFAULTS };
  try {
    const raw = await AsyncStorage.getItem(accessibilityStorageKey(nextScope));
    prefs = normalizeAccessibility(raw ? JSON.parse(raw) : {});
  } catch {
    // Unreadable or missing: the defaults, as on the website.
  }
  if (scope !== nextScope) return;
  loadedScope = nextScope;
  apply(prefs);
}

let loadedScope: string | null = null;

/** Whether the guest's or account's preferences have been read, so the app can open with them applied. */
export function useAccessibilityLoaded(): boolean {
  useAccessibility();
  return loadedScope !== null && loadedScope === scope;
}

/** Switch to the guest's or this account's preferences when someone signs in or out. */
function useScope(userId: string | null) {
  useEffect(() => {
    const next = accessibilityScope(userId);
    if (next === scope) return;
    scope = next;
    loading = load(next);
  }, [userId]);
}

/** Change one preference (or several) and keep it on this device. */
export async function updateAccessibility(change: Partial<AccessibilityPrefs>) {
  await loading;
  const next = normalizeAccessibility({ ...currentAccessibility(), ...change });
  apply(next);
  try {
    await AsyncStorage.setItem(accessibilityStorageKey(scope ?? 'guest'), accessibilityToSave(next));
  } catch {
    // Storage unavailable: the change still applies until the app closes.
  }
}

export function resetAccessibility() {
  return updateAccessibility({ ...ACCESSIBILITY_DEFAULTS });
}

/** The current preferences; re-renders when they change. */
export function useAccessibility(): AccessibilityPrefs {
  const { session } = useSession();
  useScope(session?.user.id ?? null);
  const [, rerender] = useState(0);
  useEffect(() => {
    const listener = () => rerender((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return currentAccessibility();
}

/** Text styles with the preferences applied, for components with their own styles. */
export function useAccessibleText() {
  const prefs = useAccessibility();
  return useCallback(<T extends object>(style: T) => accessibleTextStyleCached(style, prefs), [prefs]);
}

// Styles are reused across renders, so each one is worked out once per set of preferences.
let cacheFor: AccessibilityPrefs | null = null;
let cache = new WeakMap<object, object>();
function accessibleTextStyleCached<T extends object>(style: T, prefs: AccessibilityPrefs): T {
  if (cacheFor !== prefs) {
    cacheFor = prefs;
    cache = new WeakMap();
  }
  const hit = cache.get(style);
  if (hit) return hit as T;
  const made = accessibleTextStyle(style, prefs);
  cache.set(style, made);
  return made;
}

/** Reduce motion from these preferences or from the phone's own setting. */
export function useReducedMotion(): boolean {
  const prefs = useAccessibility();
  const [system, setSystem] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => active && setSystem(on))
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystem);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return prefs.reduceMotion || system;
}
