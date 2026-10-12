import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { MoonDisc } from '../../components/MoonDisc';
import { Screen } from '../../components/Screen';
import { useReminderTaps } from '../../lib/reminders/notifier';
import { PHASE_ORDER } from '../../lib/reminders/schedule';
import { useReminders } from '../../lib/reminders/store';
import { planSky, planWhen } from '../../lib/rituals/format';
import { currentStep } from '../../lib/rituals/lifecycle';
import { nextPlan } from '../../lib/rituals/plans';
import { useRituals } from '../../lib/rituals/store';
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
  const rituals = useRituals();
  const reminders = useReminders();
  useReminderTaps();
  const next = nextPlan(rituals.plans, new Date());
  const active = rituals.active;
  const step = active ? currentStep(active) : null;
  const moonReminders = PHASE_ORDER.some((p) => reminders.settings.phases[p]);

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
        label={moonReminders ? 'Moon reminders on' : 'Remind me of the moon'}
        accessibilityHint="Choose which moon phases to be reminded of"
        icon={<Icon name="bell" size={16} color={colors.gold} />}
        onPress={() => router.navigate('/rituals/reminders', { withAnchor: true })}
      />

      <View style={styles.working}>
        {active ? (
          <>
            <View style={styles.workingText}>
              <Text style={[type.eyebrow, styles.gold]}>{active.status === 'paused' ? 'Paused' : 'Under way'}</Text>
              <Text style={type.cardTitle}>{active.title || 'Your ritual'}</Text>
              <Text style={type.caption}>{step ? step.title : 'Finish and journal it when you are ready.'}</Text>
            </View>
            <Button label="Continue the ritual" onPress={() => router.navigate('/rituals/run')} />
          </>
        ) : next ? (
          <>
            <View style={styles.workingText}>
              <Text style={[type.eyebrow, styles.gold]}>Your next working</Text>
              <Text style={type.cardTitle}>{next.title}</Text>
              <Text style={type.caption}>{`${planWhen(next, now)} · ${planSky(next)}`}</Text>
            </View>
            <Button
              label="Open the plan"
              onPress={() => router.navigate({ pathname: '/rituals/plan/[id]', params: { id: next.id } })}
            />
          </>
        ) : (
          <>
            <View style={styles.workingText}>
              <Text style={[type.eyebrow, styles.gold]}>Your next working</Text>
              <Text style={type.cardTitle}>Nothing planned yet</Text>
              <Text style={type.caption}>Choose an intention and we'll find the right night.</Text>
            </View>
            <Button label="Plan a ritual" onPress={() => router.navigate('/rituals/planner')} />
          </>
        )}
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
