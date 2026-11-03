// On Today: the meditation programmes under way and a Sabbat sit when a
// festival in your calendars is today (lib/meditation/programmes.ts), each
// opening Meditation → Programmes. Nothing shows when there's nothing on.

import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useCraft } from '../../lib/craft/store';
import { holidayChoice } from '../../lib/holidays';
import { normalizeSit, SITS } from '../../lib/meditation/log';
import { todayProgrammes, yearFestivals } from '../../lib/meditation/programmes';
import { localDateKey } from '../../lib/rituals/lifecycle';
import { colors, type } from '../../theme';
import { Card } from '../more/ui';

export function MeditationToday({ settings, now }: { settings: Record<string, unknown> | null | undefined; now: Date }) {
  const { entries } = useCraft<unknown>(SITS);
  const day = localDateKey(now);
  const rows = useMemo(() => {
    const at = new Date(`${day}T12:00:00`);
    const sits = entries.map((e) => ({ id: e.id, data: normalizeSit(e.data) }));
    const today = yearFestivals(at, holidayChoice(settings)).filter((f) => f.date === day);
    return todayProgrammes(sits, today, new Date());
  }, [entries, settings, day]);
  if (!rows.length) return null;
  return (
    <Card>
      <Text style={type.eyebrow}>Meditation</Text>
      {rows.map((r) => (
        <Pressable key={r.title} accessibilityRole="link" onPress={() => router.navigate('/rituals/craft/meditation/programmes' as Href)} style={styles.row}>
          <Text style={type.body}>{r.title}</Text>
          <Text style={[type.caption, r.done && styles.done]}>{r.line}</Text>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 6 },
  done: { color: colors.gold },
});
