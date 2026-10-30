// Cycle & Moon on Today: one small card, only when it has something to say
// (chosen in its settings, open on this phone, and following the moon or
// with a bleed in the last two months): the day, season and moon, one
// suggestion, and Log today. Everything else is in Practice → Rituals →
// Cycle & Moon. The website's Today has the same card (today/cycle-today.js).

import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { suggestionFor } from '../../lib/cycle/content';
import { dayKey, todayCardRelevant, todayView } from '../../lib/cycle/model';
import { useCycle } from '../../lib/cycle/store';
import { colors, radius, type } from '../../theme';
import { Button } from '../Button';
import { practiceHref } from './ui';

export function CycleToday() {
  const cycle = useCycle();
  const [now] = useState(() => new Date());
  if (cycle.phase !== 'open' || !cycle.data || !todayCardRelevant(cycle.data, now)) return null;
  const view = todayView(cycle.data, now);
  const suggestion = suggestionFor(view.season, view.quarter);
  const first = suggestion.links[0];
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="link" accessibilityHint="Opens Cycle & Moon" onPress={() => router.navigate('/rituals/cycle')}>
        <Text style={[type.eyebrow, styles.gold]}>Cycle &amp; Moon</Text>
        <Text style={type.cardTitle}>{view.line}</Text>
      </Pressable>
      {view.estimate && <Text style={type.caption}>{view.estimate.line}</Text>}
      <Text style={type.body}>{suggestion.line}</Text>
      <View style={styles.actions}>
        <Button label="Log today" variant="outline" onPress={() => router.navigate({ pathname: '/rituals/cycle/log', params: { date: dayKey(now) } })} />
        {first && <Button label={`${first.label} ›`} variant="text" onPress={() => router.navigate(practiceHref(first))} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 16, gap: 6 },
  gold: { color: colors.gold },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
});
