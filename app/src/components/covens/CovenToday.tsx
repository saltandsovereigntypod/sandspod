// "Your covens" on Today (and atop the Coven tab): your turn in a ritual
// under way, rituals happening now, your covens' holidays, rites coming up,
// your next initiation or training task, and work waiting for you to sign
// off. What to show is lib/covens/today.ts, shared with the website.

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { covenHref } from './CovenScreen';
import { programHref } from './programs';
import * as api from '../../lib/covens/api';
import { covenHolidaysSoon, covenTodayItems, type CovenTodayItem } from '../../lib/covens/today';
import { useCachedQuery } from '../../lib/more/useCachedQuery';
import { useSession } from '../../lib/session';
import { colors, fonts, radius, type } from '../../theme';

const ICON: Record<CovenTodayItem['kind'], string> = { turn: '✦', live: '☾', holiday: '❋', rite: '☽', task: '✧', review: '✓' };

function open(item: CovenTodayItem) {
  if (item.target.ritual) return router.push(covenHref(item.covenSlug, `ritual/${item.target.ritual}`));
  if (item.target.program) return router.push(programHref(item.covenSlug, item.target.program));
  if (item.target.programs) return router.push(covenHref(item.covenSlug, 'programs'));
  router.push(covenHref(item.covenSlug));
}

/** Your covens' rows for Today (cached; shared by this card and "Your next working"). */
export function useCovenToday() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const { data } = useCachedQuery(userId ? `coven-today-${userId}` : null, () => api.fetchCovenToday(userId!));
  return userId ? data ?? null : null;
}

export function CovenToday({ showEmpty = false }: { showEmpty?: boolean }) {
  const data = useCovenToday();
  if (!data) return null;
  const now = new Date();
  const items = covenTodayItems(data, now);
  const soon = items.length < 3 ? covenHolidaysSoon(data.covens, now) : [];
  if (!items.length && !soon.length && !showEmpty) return null;
  const many = data.covens.length > 1;
  return (
    <View style={styles.card} accessibilityLabel="Your covens">
      <Text style={type.eyebrow}>Your covens</Text>
      {!items.length && !soon.length && <Text style={type.caption}>Nothing from your covens today.</Text>}
      {items.map((item, i) => (
        <Pressable
          key={`${item.kind}-${i}`}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}. ${item.detail}${many ? `. ${item.covenName}` : ''}`}
          onPress={() => open(item)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <View style={[styles.icon, item.kind === 'turn' && styles.iconOn]}>
            <Text style={[styles.iconText, item.kind === 'turn' && styles.iconTextOn]}>{ICON[item.kind]}</Text>
          </View>
          <View style={styles.text}>
            <Text style={styles.title}>{item.title}</Text>
            {!!item.detail && <Text style={type.caption}>{item.detail}</Text>}
            {many && item.kind !== 'review' && <Text style={type.caption}>{item.covenName}</Text>}
          </View>
        </Pressable>
      ))}
      {soon.map(({ coven, holiday }) => (
        <Pressable key={`${coven.id}-${holiday.id}-${holiday.date.toISOString()}`} accessibilityRole="button" onPress={() => router.push(covenHref(coven.slug))} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>❋</Text>
          </View>
          <View style={styles.text}>
            <Text style={styles.title}>{holiday.name}</Text>
            <Text style={type.caption}>
              {holiday.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · {coven.name}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 16, gap: 4 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 8, minHeight: 44 },
  pressed: { opacity: 0.7 },
  icon: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(226,195,109,0.5)', alignItems: 'center', justifyContent: 'center' },
  iconOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  iconText: { color: colors.gold, fontSize: 13 },
  iconTextOn: { color: colors.forestInk },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
});
