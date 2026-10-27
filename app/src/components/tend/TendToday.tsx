// "To tend today" on Today: how many things want tending, by kind, and the
// first few, opening the whole list (TendScreen). The website's Today has the
// same card (today/tend-today.js), from the same logic (lib/tend/model.ts).

import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KIND_MARK } from './TendScreen';
import { todaySummary } from '../../lib/tend/model';
import { useTendList } from '../../lib/tend/store';
import { colors, fonts, radius, type } from '../../theme';

export function TendToday() {
  const [now] = useState(() => new Date());
  const { list, ready } = useTendList(now);
  if (!ready) return null;
  const summary = todaySummary(list);
  if (!summary.count && !summary.ongoing) return null;
  const open = () => router.navigate('/today/tend');
  return (
    <View style={styles.card}>
      <Text style={[type.eyebrow, styles.gold]}>To tend today</Text>
      <Text style={type.body}>{summary.line}</Text>
      {summary.top.map((item) => (
        <Pressable key={item.key} onPress={open} accessibilityRole="link" accessibilityLabel={`${item.title}. ${item.source}`} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={styles.mark}>
            <Text style={styles.markText}>{KIND_MARK[item.kind]}</Text>
          </View>
          <View style={styles.text}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={type.caption} numberOfLines={1}>
              {item.source}
            </Text>
          </View>
        </Pressable>
      ))}
      <Pressable onPress={open} accessibilityRole="link" style={({ pressed }) => [styles.more, pressed && styles.pressed]}>
        <Text style={[type.caption, styles.gold]}>{summary.count > summary.top.length || summary.ongoing ? 'Open the whole list ›' : 'Open the list ›'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 16, gap: 6 },
  gold: { color: colors.gold },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 6, minHeight: 44 },
  pressed: { opacity: 0.7 },
  mark: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.goldLine, alignItems: 'center', justifyContent: 'center' },
  markText: { color: colors.gold, fontSize: 14 },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 20, color: colors.cream },
  more: { paddingVertical: 6, minHeight: 32 },
});
