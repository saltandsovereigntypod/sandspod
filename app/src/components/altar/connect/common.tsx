// Shared parts for the altar's connected sheets and panel sections: the altar
// they open on, a text field, a section heading and a quiet row.

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import type { SavedObject } from '../../../lib/altar/types';
import { colors, fonts, radius, touch, type } from '../../../theme';

/** The altar a sheet or overlay works on. */
export type AltarRef = {
  /** The saved altar's id (null for an unsaved altar: some things then wait for a save). */
  id: string | null;
  name: string;
  objects: SavedObject[];
  /** altar_data.background, for pictures of it. */
  background?: string;
};

export const nowIso = () => new Date().toISOString();

export function Field({ label, style, ...rest }: TextInputProps & { label: string }) {
  return (
    <TextInput
      placeholderTextColor={colors.tabInactive}
      accessibilityLabel={label}
      {...rest}
      style={[styles.input, rest.multiline && styles.multiline, style]}
    />
  );
}

export function Eyebrow({ children }: { children: string }) {
  return <Text style={type.eyebrow}>{children}</Text>;
}

/** A panel section in the object panel's style: eyebrow, then its rows. */
export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={type.eyebrow} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

/** A tappable row with a title and a detail line (44pt or taller). */
export function Row({ title, detail, onPress, selected, accessibilityLabel, right }: { title: string; detail?: string; onPress: () => void; selected?: boolean; accessibilityLabel?: string; right?: ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (detail ? `${title}, ${detail}` : title)}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {detail ? <Text style={type.caption}>{detail}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}

export const connectStyles = StyleSheet.create({
  card: { borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surfaceRaised, padding: 14, gap: 8 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchment },
  value: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
  quote: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 25, color: colors.cream },
  problem: { fontFamily: fonts.body, fontSize: 14, color: '#e8a58f' },
  gap: { gap: 10 },
  center: { alignItems: 'center' },
});

const styles = StyleSheet.create({
  section: { gap: 8 },
  input: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ground,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  multiline: { minHeight: 88, paddingTop: 12, textAlignVertical: 'top' },
  row: {
    minHeight: touch + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceRaised,
  },
  rowSelected: { borderColor: colors.gold },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
});
