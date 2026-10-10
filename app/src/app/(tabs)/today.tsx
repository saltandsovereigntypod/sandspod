import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { MoonDisc } from '../../components/MoonDisc';
import { Screen } from '../../components/Screen';
import { useReminderTaps } from '../../lib/reminders/notifier';
import { PHASE_ORDER } from '../../lib/reminders/schedule';
import { setHolidaySelection, syncSkyCalendar } from '../../lib/reminders/calendarStore';
import { useReminders } from '../../lib/reminders/store';
import { planSky, planWhen } from '../../lib/rituals/format';
import { currentStep } from '../../lib/rituals/lifecycle';
import { nextPlan } from '../../lib/rituals/plans';
import { useRituals } from '../../lib/rituals/store';
import { holidayChoice } from '../../lib/holidays';
import { useMySettings } from '../../lib/settings/store';
import { buildToday, type HorizonItem, type TodayModel } from '../../lib/today';
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
  const { settings } = useMySettings();
  const choiceKey = `${settings?.calendar_traditions ?? ''}|${settings?.calendar_custom_holidays ?? ''}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- choiceKey stands in for the two settings it reads
  const today = useMemo(() => buildToday(now, holidayChoice(settings)), [now, choiceKey]);
  const show = (settings?.today_show as string) || 'both';

  const side = show === 'both' && settings?.today_layout === 'side';
  const rituals = useRituals();
  const reminders = useReminders();
  useReminderTaps();
  // Keep phone-calendar holidays in step with the calendars chosen in Settings.
  useEffect(() => {
    if (settings && setHolidaySelection(holidayChoice(settings))) void syncSkyCalendar(reminders.settings.phases);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the calendar choice changes
  }, [choiceKey, settings !== null]);
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

      <View style={side ? styles.sideBySide : styles.stacked}>
        {show !== 'holiday' && (
          <View style={side ? styles.half : undefined}>
            <MoonPanel today={today} compact={side} />
            <Button
              variant="pill"
              label={moonReminders ? (side ? 'Reminders on' : 'Moon reminders on') : side ? 'Remind me' : 'Remind me of the moon'}
              accessibilityHint="Choose which moon phases to be reminded of"
              icon={<Icon name="bell" size={16} color={colors.gold} />}
              onPress={() => router.navigate('/rituals/reminders')}
            />
          </View>
        )}
        {show !== 'moon' && (
          <View style={side ? styles.half : undefined}>
            <HolidayPanel today={today} compact={side} />
          </View>
        )}
      </View>

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

function MoonPanel({ today, compact }: { today: TodayModel; compact: boolean }) {
  return (
    <View style={styles.moon} accessible accessibilityLabel={`${today.moon.name}. ${today.signLine}. ${today.moonLine}`}>
      <MoonDisc size={compact ? 96 : 136} illumination={today.moon.illumination} waxing={today.moon.waxing} />
      <Text accessibilityRole="header" style={[styles.phase, compact && styles.phaseCompact]}>
        {today.moon.name}
      </Text>
      <Text style={[styles.sign, compact && styles.signCompact, styles.center]}>{today.signLine}</Text>
      <Text style={[type.caption, styles.center]}>{today.moonLine}</Text>
    </View>
  );
}

function HolidayPanel({ today, compact }: { today: TodayModel; compact: boolean }) {
  const holiday = today.holiday;
  const open = () => router.navigate('/more/settings/calendar');
  if (!holiday) {
    return (
      <Pressable accessibilityRole="button" onPress={open} style={styles.holiday}>
        <Text style={[type.eyebrow, styles.gold]}>Holidays</Text>
        <Text style={type.cardTitle}>Choose your calendars</Text>
        <Text style={type.caption}>Pick the Wheel of the Year, Celtic, Norse, Hellenic, Roman, Slavic or your own holidays.</Text>
      </Pressable>
    );
  }
  const happening = today.holidayWhen === 'Today' || today.holidayWhen.startsWith('Day ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${happening ? 'Today' : 'Next holiday'}: ${holiday.name}, ${today.holidayWhen}. ${holiday.meaning}`}
      accessibilityHint="Opens your calendars and the holidays ahead"
      onPress={open}
      style={({ pressed }) => [styles.holiday, happening && styles.holidayNow, pressed && styles.pressed]}
    >
      <Text style={[type.eyebrow, styles.gold]}>{happening ? today.holidayWhen : `Next holiday · ${today.holidayWhen}`}</Text>
      <Text style={[styles.holidayName, compact && styles.holidayNameCompact]}>{holiday.name}</Text>
      <Text style={type.caption}>{holiday.traditions.join(' · ')}</Text>
      <Text style={styles.meaning} numberOfLines={compact ? 7 : undefined}>
        {holiday.meaning}
      </Text>
    </Pressable>
  );
}

const PHASE_DISC: Record<string, { illumination: number; waxing: boolean }> = {
  new: { illumination: 0, waxing: true },
  firstQuarter: { illumination: 0.5, waxing: true },
  full: { illumination: 1, waxing: true },
  lastQuarter: { illumination: 0.5, waxing: false },
};

function HorizonTile({ item }: { item: HorizonItem }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${item.title}, ${item.detail}`}>
      {item.kind === 'holiday' ? (
        <Icon name={item.title.startsWith('Samhain') ? 'samhain' : 'wheel'} size={26} color={colors.gold} />
      ) : (
        <MoonDisc size={26} {...PHASE_DISC[item.phase]} halo={false} />
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
  sign: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 24, color: colors.gold },
  signCompact: { fontSize: 16, lineHeight: 20 },
  phaseCompact: { fontSize: 26, lineHeight: 30 },
  stacked: { gap: 18 },
  sideBySide: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  half: { flex: 1, gap: 12 },
  holiday: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    gap: 6,
  },
  holidayNow: { borderColor: 'rgba(226,195,109,0.5)' },
  holidayName: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32, color: colors.cream },
  holidayNameCompact: { fontSize: 22, lineHeight: 26 },
  meaning: { ...type.body, color: colors.parchment },
  pressed: { opacity: 0.75 },
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
