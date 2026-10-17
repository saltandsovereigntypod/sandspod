// A quiet line at the foot of heavier pages (journeys, rites, ancestors,
// dreams) pointing to More → Support.

import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAccessibleText } from '../lib/accessibility/store';
import { colors, fonts, touch } from '../theme';

export const SUPPORT_HREF = '/more/support' as Href;

export function SupportLink({ label = 'If this stirs up something heavy, support is here.' }: { label?: string }) {
  const t = useAccessibleText();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityHint="Opens crisis and support lines"
      onPress={() => router.push(SUPPORT_HREF)}
      hitSlop={4}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <Text style={t(styles.text)}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { minHeight: touch, justifyContent: 'center', alignSelf: 'center', paddingHorizontal: 8 },
  pressed: { opacity: 0.6 },
  text: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(202,191,157,0.4)',
  },
});
