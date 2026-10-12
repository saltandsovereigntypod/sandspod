import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text } from 'react-native';

import { MUNDANE_MODE_KEY, mundaneFromStorage, pageFace, type PageFace } from '../../lib/grimoire/presentation';
import { useMySettings } from '../../lib/settings/store';
import { colors, fonts, touch } from '../../theme';

// The device's mundane-mode choice, shared by every Grimoire screen.
// undefined until read from storage; null when nothing was ever saved.
let stored: string | null | undefined;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function load() {
  loading ??= AsyncStorage.getItem(MUNDANE_MODE_KEY)
    .then((value) => {
      stored ??= value;
    })
    .catch(() => {
      stored ??= null;
    })
    .finally(notify);
  return loading;
}

function setMundane(value: boolean) {
  stored = value ? 'true' : 'false';
  notify();
  AsyncStorage.setItem(MUNDANE_MODE_KEY, stored).catch(() => {
    // Storage unavailable; the choice still holds until the app closes.
  });
}

/** Mundane mode for this device, defaulting from the "Mundane mode by default" setting. */
export function useMundaneMode() {
  const { settings } = useMySettings();
  const [, rerender] = useState(0);

  useEffect(() => {
    const listener = () => rerender((n) => n + 1);
    listeners.add(listener);
    void load();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const mundane = mundaneFromStorage(stored ?? null, !!settings?.default_mundane_mode);
  return { mundane, setMundane, settings };
}

export function MundaneToggle({ mundane, onChange }: { mundane: boolean; onChange: (value: boolean) => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: mundane }}
      accessibilityLabel="Mundane mode"
      accessibilityHint="Shows your book in plain, everyday language"
      onPress={() => onChange(!mundane)}
      style={styles.toggle}
    >
      <Text style={styles.toggleText}>Mundane</Text>
      <Switch
        value={mundane}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceRaised, true: colors.goldDeep }}
        thumbColor={mundane ? colors.gold : colors.parchment}
        importantForAccessibility="no"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

/** The page font from settings, for everything printed on a page. */
export const PageFaceContext = createContext<PageFace>(pageFace(null));

export function usePageFace(): PageFace {
  return useContext(PageFaceContext);
}

/** Body text style for a page font, sized from the classic face's values. */
export function faceText(face: PageFace, fontSize: number, lineHeight: number) {
  return { fontFamily: face.body, fontSize: Math.round(fontSize * face.scale), lineHeight: Math.round(lineHeight * face.scale * face.leading) };
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: touch },
  toggleText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
});
