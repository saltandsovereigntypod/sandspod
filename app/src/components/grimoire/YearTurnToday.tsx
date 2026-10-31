// Your year in review on Today: one small card around your year's turn (the
// last three weeks of the year and the first month of the next, by your own
// new year: lib/grimoire/yearSpan.ts), opening the look back over that year.
// The rest of the year it stays away. The website's Today has the same card.

import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { yearTurn } from '../../lib/grimoire/yearSpan';
import { usePlace } from '../../lib/location';
import { colors, radius, type } from '../../theme';

export function YearTurnToday({ now, settings }: { now: Date; settings: Record<string, unknown> | null }) {
  const place = usePlace();
  const day = now.toDateString();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- once a day, and when the settings change
  const turn = useMemo(() => yearTurn(now, settings, place), [day, settings, place]);
  if (!turn) return null;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${turn.line} Opens your year in review.`}
      onPress={() => router.navigate({ pathname: '/grimoire/year', params: { start: turn.span.startKey } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={[type.eyebrow, styles.gold]}>Your year in review</Text>
        <Text style={type.body}>{turn.line}</Text>
        <Text style={[type.caption, styles.gold]}>{`${turn.span.label} ›`}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.goldLine, padding: 16 },
  pressed: { opacity: 0.75 },
  text: { gap: 4 },
  gold: { color: colors.gold },
});
