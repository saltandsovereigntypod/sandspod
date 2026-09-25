import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, radius, touch } from '../theme';

type Variant = 'primary' | 'outline' | 'pill' | 'text';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

export function Button({ label, onPress, variant = 'primary', icon, disabled, style, accessibilityHint }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (pressed || disabled) && styles.dimmed,
        style,
      ]}
    >
      <View style={styles.row}>
        {icon}
        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touch,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primary: { backgroundColor: colors.gold, borderRadius: radius.button },
  outline: {
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(244,236,216,0.28)',
  },
  pill: {
    alignSelf: 'center',
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: 'rgba(226,195,109,0.5)',
  },
  text: {},
  dimmed: { opacity: 0.7 },
  label: { fontSize: 15 },
});

const labelStyles = StyleSheet.create({
  primary: { color: colors.forestInk, fontFamily: fonts.bodySemi },
  outline: { color: colors.cream, fontFamily: fonts.body },
  pill: { color: colors.gold, fontFamily: fonts.body, fontSize: 14 },
  text: { color: colors.gold, fontFamily: fonts.body },
});
