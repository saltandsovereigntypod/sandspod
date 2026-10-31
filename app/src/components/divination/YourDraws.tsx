// A card's, rune's or stave's own history in your readings, on its page:
// how often it has come, and links to the last reading and to Your patterns
// (lib/divination/patterns.ts). Nothing shows until it has come at least once.

import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fullDate } from '../../lib/calendar';
import { normalizeReading, READINGS } from '../../lib/craft/hedge/readings';
import { useCraft } from '../../lib/craft/store';
import { cardHistory, cardHistoryLine } from '../../lib/divination/patterns';
import { colors, radius, type } from '../../theme';

export function YourDraws({ name }: { name: string }) {
  const { entries } = useCraft<unknown>(READINGS);
  const history = useMemo(() => cardHistory(entries.map((e) => ({ ...e, data: normalizeReading(e.data) })), name), [entries, name]);
  const line = cardHistoryLine(history);
  if (!line) return null;
  const last = history.last;
  return (
    <View style={styles.card}>
      <Text style={[type.eyebrow, styles.gold]}>In your readings</Text>
      <Text style={type.body}>{line}</Text>
      {last && (
        <Pressable accessibilityRole="link" onPress={() => router.push(`/rituals/divination/${last.id}` as Href)}>
          <Text style={[type.caption, styles.gold]}>{`Last on ${fullDate(last.date) ?? last.date} ›`}</Text>
        </Pressable>
      )}
      <Pressable accessibilityRole="link" accessibilityHint="The cards you draw most, by suit, moon and day" onPress={() => router.push('/rituals/divination/patterns' as Href)}>
        <Text style={[type.caption, styles.gold]}>Your patterns ›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 16, gap: 6 },
  gold: { color: colors.gold },
});
