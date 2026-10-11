import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, touch } from '../../theme';

const STEP = 15;
const DAY = 24 * 60;

/** "7:15 pm" for minutes after midnight. */
export function clockLabel(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

/** A time of day, moved in quarter hours. No native picker needed. */
export function TimeStepper({ minutes, onChange }: { minutes: number; onChange: (minutes: number) => void }) {
  const move = (by: number) => onChange((((minutes + by) % DAY) + DAY) % DAY);
  return (
    <View style={styles.row}>
      <Step label="−1 h" a11y="An hour earlier" onPress={() => move(-60)} />
      <Step label="−15" a11y="15 minutes earlier" onPress={() => move(-STEP)} />
      <Text style={styles.time} accessibilityLabel={`Time: ${clockLabel(minutes)}`}>
        {clockLabel(minutes)}
      </Text>
      <Step label="+15" a11y="15 minutes later" onPress={() => move(STEP)} />
      <Step label="+1 h" a11y="An hour later" onPress={() => move(60)} />
    </View>
  );
}

function Step({ label, a11y, onPress }: { label: string; a11y: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      style={({ pressed }) => [styles.step, pressed && { opacity: 0.6 }]}
    >
      <Text style={styles.stepText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  time: { flex: 1, textAlign: 'center', fontFamily: fonts.display, fontSize: 24, color: colors.cream },
  step: {
    minWidth: touch,
    minHeight: touch,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  stepText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
});
