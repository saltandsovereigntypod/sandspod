import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, touch } from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
  /** Spoken label when the visible one is a symbol. */
  accessibilityLabel?: string;
  symbol?: string;
  active?: boolean;
  disabled?: boolean;
  tone?: 'default' | 'danger';
};

/** A wrapping action chip (44pt tall). Rows of these wrap; nothing scrolls sideways. */
export function Chip({ label, onPress, accessibilityLabel, symbol, active, disabled, tone = 'default' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled, selected: !!active }}
      style={({ pressed }) => [styles.chip, active && styles.active, (pressed || disabled) && styles.dim]}
    >
      <View style={styles.row}>
        {symbol ? (
          <Text style={[styles.symbol, active && styles.activeText]} aria-hidden>
            {symbol}
          </Text>
        ) : null}
        <Text style={[styles.label, active && styles.activeText, tone === 'danger' && styles.danger]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.wrap}>{children}</View>;
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: touch,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.hairline,
    justifyContent: 'center',
  },
  active: { backgroundColor: colors.gold, borderColor: colors.gold },
  dim: { opacity: 0.55 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  symbol: { color: colors.gold, fontSize: 16 },
  label: { color: colors.cream, fontFamily: fonts.body, fontSize: 14 },
  activeText: { color: colors.forestInk, fontFamily: fonts.bodySemi },
  danger: { color: '#e8a58f' },
});
