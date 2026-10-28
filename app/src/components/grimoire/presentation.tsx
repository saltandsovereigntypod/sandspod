import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text } from 'react-native';

import { MUNDANE_MODE_KEY, pageFace, type PageFace } from '../../lib/grimoire/presentation';
import { migrateMundane } from '../../lib/grimoire/mundaneSetting';
import { patchMySettings, useMySettings } from '../../lib/settings/store';
import { colors, fonts, touch } from '../../theme';

// Mundane mode: one choice, kept with your settings (`default_mundane_mode`,
// synced) and changed by the switch in the Grimoire's header. What older
// versions kept on this phone alone (MUNDANE_MODE_KEY) is carried into the
// setting once and then cleared (lib/grimoire/mundaneSetting.ts).
// undefined until the phone's old copy is read; null when there is none.
let stored: string | null | undefined;
let loading: Promise<void> | null = null;
let migrated = false;
// What the switch was just set to, shown until the saved setting catches up.
let chosen: boolean | null = null;
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

/** Mundane mode, from your settings, and the header switch that changes it. */
export function useMundaneMode() {
  const { settings, status } = useMySettings();
  const [, rerender] = useState(0);

  useEffect(() => {
    const listener = () => rerender((n) => n + 1);
    listeners.add(listener);
    void load();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setting = !!settings?.default_mundane_mode;
  // Once settings are read (from the account, when signed in), move the phone's old choice into them.
  useEffect(() => {
    if (migrated || stored === undefined || status !== 'ready' || !settings) return;
    migrated = true;
    const step = migrateMundane(stored, setting);
    const done = () => {
      if (step.clear) AsyncStorage.removeItem(MUNDANE_MODE_KEY).catch(() => {});
      stored = null;
      notify();
    };
    if (!step.save) return done();
    chosen = step.value;
    patchMySettings({ default_mundane_mode: step.value })
      .then(done)
      // Not saved (offline): keep the phone's copy, and try again next time.
      .catch(() => {
        migrated = false;
        chosen = null;
        notify();
      });
  }, [status, settings, setting]);

  // Once the saved setting matches what the switch was set to, it speaks for itself again.
  useEffect(() => {
    if (chosen === setting) chosen = null;
  }, [setting]);
  const mundane = chosen ?? migrateMundane(stored ?? null, setting).value;

  const setMundane = useCallback(
    (value: boolean) => {
      chosen = value;
      notify();
      patchMySettings({ default_mundane_mode: value }).catch(() => {
        // Not saved: show what is saved.
        chosen = null;
        notify();
      });
    },
    [],
  );

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
