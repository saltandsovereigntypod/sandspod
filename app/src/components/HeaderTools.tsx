// The two small doors at the top right of every main tab's home: the Living
// Library and Settings. Each opens the one screen there is for it (the
// Grimoire's Living Library, More → Settings), wherever you are.

import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme';
import { MoreIcon, type MoreIconName } from './more/MoreIcon';

export const LIBRARY_HREF = '/grimoire/library';
export const SETTINGS_HREF = '/more/settings';

function Door({ icon, label, href }: { icon: MoreIconName; label: string; href: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      onPress={() => router.navigate(href as Href)}
      style={({ pressed }) => [styles.door, pressed && styles.pressed]}
    >
      <MoreIcon name={icon} size={20} color={colors.cream} />
    </Pressable>
  );
}

export function HeaderTools() {
  return (
    <View style={styles.tools}>
      <Door icon="library" label="Living Library" href={LIBRARY_HREF} />
      <Door icon="settings" label="Settings" href={SETTINGS_HREF} />
    </View>
  );
}

/** A tab's top row: what it already has there (a switch, a title), then the two doors on the right. */
export function HeaderRow({ children }: { children: ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.fill}>{children}</View>
      <HeaderTools />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fill: { flex: 1, minWidth: 0 },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  door: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
});
