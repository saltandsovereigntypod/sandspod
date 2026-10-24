// The Grimoire | Rituals switch at the top of the Practice tab's two halves.

import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAccessibleText } from '../lib/accessibility/store';
import { rememberPracticeSection, type PracticeSection } from '../lib/practiceSection';
import { colors, fonts, touch } from '../theme';

const SECTIONS: { key: PracticeSection; label: string; href: Href }[] = [
  { key: 'grimoire', label: 'Grimoire', href: '/grimoire' },
  { key: 'rituals', label: 'Rituals', href: '/rituals' },
];

export function PracticeSwitch({ current }: { current: PracticeSection }) {
  const t = useAccessibleText();
  return (
    <View accessibilityRole="tablist" accessibilityLabel="Practice" style={styles.bar}>
      {SECTIONS.map((s) => {
        const on = s.key === current;
        return (
          <Pressable
            key={s.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            aria-selected={on}
            accessibilityLabel={s.label}
            onPress={() => {
              if (on) return;
              rememberPracticeSection(s.key);
              router.navigate(s.href);
            }}
            style={({ pressed }) => [styles.option, on && styles.on, pressed && !on && styles.pressed]}
          >
            <Text style={[t(styles.label), on && t(styles.labelOn)]}>{s.label}</Text>
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
  label: { fontFamily: fonts.body, fontSize: 15, color: colors.cream },
  labelOn: { fontFamily: fonts.bodySemi, color: colors.forestInk },
});
