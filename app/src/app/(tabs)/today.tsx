import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { MoonDisc } from '../../components/MoonDisc';
import { Screen } from '../../components/Screen';
import { buildToday, type HorizonItem } from '../../lib/today';
import { colors, fonts, radius, type } from '../../theme';

/** Re-render when the clock passes midnight so the date and moon stay current. */
function useToday(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const next = new Date(now);
    next.setHours(24, 0, 5, 0);
    const timer = setTimeout(() => setNow(new Date()), next.getTime() - now.getTime());
    return () => clearTimeout(timer);
  }, [now]);
  return now;
}

export default function Today() {
  const now = useToday();
  const today = useMemo(() => buildToday(now), [now]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[type.eyebrow, styles.date]}>{today.dateLine}</Text>
        <Text style={styles.ruler}>{today.rulerLine}</Text>
      </View>

      <View style={styles.moon} accessible accessibilityLabel={`${today.moon.name}. ${today.moonLine}`}>
        <MoonDisc size={136} illumination={today.moon.illumination} waxing={today.moon.waxing} />
        <Text accessibilityRole="header" style={styles.phase}>
          {today.moon.name}
        </Text>
        <Text style={[type.caption, styles.center]}>{today.moonLine}</Text>
      </View>
      <Button
        variant="pill"
        label="Remind me at moonrise"
        icon={<Icon name="bell" size={16} color={colors.gold} />}
        onPress={() => Alert.alert('Moon reminders', 'Reminders arrive in the next build of the app.')}
      />

      <View style={styles.working}>
        <View style={styles.workingText}>
          <Text style={[type.eyebrow, styles.gold]}>Your next working</Text>
          <Text style={type.cardTitle}>Nothing planned yet</Text>
          <Text style={type.caption}>Choose an intention and we'll find the right night.</Text>
        </View>
        <Button label="Plan a ritual" onPress={() => router.navigate('/rituals')} />
      </View>

      <View style={styles.horizon}>
        <Text style={type.eyebrow}>On the horizon</Text>
        <View style={styles.tiles}>
          {today.horizon.map((item) => (
            <HorizonTile key={item.title} item={item} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

function HorizonTile({ item }: { item: HorizonItem }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${item.title}, ${item.detail}`}>
      {item.kind === 'sabbat' ? (
        <Icon name={item.title === 'Samhain' ? 'samhain' : 'wheel'} size={26} color={colors.gold} />
      ) : (
        <MoonDisc size={26} illumination={item.kind === 'full' ? 1 : 0} waxing halo={false} />
      )}
      <View style={styles.tileText}>
        <Text style={styles.tileTitle}>{item.title}</Text>
        <Text style={type.caption}>{item.detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 4, marginTop: 8 },
  date: { letterSpacing: 2.5 },
  ruler: { fontFamily: fonts.displayItalic, fontSize: 17, color: colors.gold, textAlign: 'center' },
  moon: { alignItems: 'center', gap: 6 },
  phase: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, color: colors.cream, textAlign: 'center', marginTop: 4 },
  center: { textAlign: 'center' },
  gold: { color: colors.gold },
  working: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(226,195,109,0.24)',
    padding: 16,
    gap: 14,
  },
  workingText: { gap: 3 },
  horizon: { gap: 10 },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.tile,
    padding: 14,
  },
  tileText: { flexShrink: 1, gap: 2 },
  tileTitle: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
});
