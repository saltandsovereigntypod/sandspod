// The pill-shaped switch between the parts of a screen or tab: Grimoire |
// Rituals | Craft at the top of Practice (PracticeSwitch), Today | Sky & Lore on
// Today, My covens | Find a coven on Coven. A tablist of tabs, so screen
// readers hear which is chosen; labels grow with the reader's text size.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAccessibleText } from '../lib/accessibility/store';
import { colors, fonts, touch } from '../theme';

export type SegmentOption<K extends string> = { key: K; label: string };

export function SegmentedSwitch<K extends string>({
  label,
  options,
  value,
  onChange,
}: {
  /** What the switch is for, read before its tabs ("Practice", "Today"). */
  label: string;
  options: readonly SegmentOption<K>[];
  value: K;
  /** Called with the tab tapped; not called for the one already chosen. */
  onChange: (key: K) => void;
}) {
  const t = useAccessibleText();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={styles.bar}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            aria-selected={on}
            accessibilityLabel={o.label}
            onPress={() => {
              if (!on) onChange(o.key);
            }}
            style={({ pressed }) => [styles.option, on && styles.on, pressed && !on && styles.pressed]}
          >
            <Text style={[t(styles.label), on && t(styles.labelOn)]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '100%',
    gap: 4,
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.surface,
    marginBottom: 6,
  },
  option: { minHeight: touch - 8, paddingHorizontal: 20, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  on: { backgroundColor: colors.gold },
  pressed: { opacity: 0.7 },
  label: { fontFamily: fonts.body, fontSize: 15, color: colors.cream, textAlign: 'center' },
  labelOn: { fontFamily: fonts.bodySemi, color: colors.forestInk },
});
