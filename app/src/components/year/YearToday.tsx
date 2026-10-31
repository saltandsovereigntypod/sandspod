// A Year and a Day on Today: "Moon 3 of 13 · Ground and boundary" and the
// next thing in the moon, only while a year is under way. The website's Today
// has the same card (today/year-today.js), from the same logic
// (lib/yearday/progress.ts todayLine). Showing it also keeps the year's
// reminders scheduled (lib/yearday/store.ts).
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dayKey, todayLine } from '../../lib/yearday';
import { useYear } from '../../lib/yearday/store';
import { colors, radius, type } from '../../theme';
import { Icon } from '../Icon';
import { ProgressBar } from './parts';
import { yearFraction } from '../../lib/yearday/progress';

export function YearToday() {
  const [now] = useState(() => new Date());
  const { progress, ready } = useYear();
  if (!ready || !progress) return null;
  const today = dayKey(now);
  const line = todayLine(progress, today);
  if (!line) return null;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${line.label}: ${line.line}${line.detail ? `. ${line.detail}` : ''}`}
      onPress={() => router.navigate(line.href as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={[type.eyebrow, styles.gold]}>{line.label}</Text>
        <Text style={type.body}>{line.line}</Text>
        {!!line.detail && <Text style={type.caption}>{line.detail}</Text>}
        {line.position.phase === 'moon' && <ProgressBar value={yearFraction(progress, today)} label="How far through the year" />}
      </View>
      <Icon name="chevron" size={16} color={colors.gold} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { flex: 1, gap: 6 },
  gold: { color: colors.gold },
  pressed: { opacity: 0.7 },
});
