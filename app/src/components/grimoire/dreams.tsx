// Pieces for the Grimoire's Dreams section: the screen shell (the Grimoire's
// own back bar and crumb), a dream's row with the moon of that night, and the
// optional morning reminder.

import type { Href } from 'expo-router';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fullDate } from '../../lib/calendar';
import { dreamMoonDisc, type DreamEntry } from '../../lib/craft/hedge/dreams';
import { DREAM_ROUTES } from '../../lib/grimoire/dreams';
import { remindersSupported } from '../../lib/reminders/notifier';
import { updateReminderSettings, useReminders } from '../../lib/reminders/store';
import { colors, fonts, space, touch, type } from '../../theme';
import { Icon } from '../Icon';
import { MoonDisc } from '../MoonDisc';
import { Body, Card, SectionLabel, Toggle } from '../rituals/ui';
import { TimeStepper } from '../rituals/TimeStepper';
import { useLeave } from './leave';

/** A Dreams screen: the Grimoire's back bar ("Grimoire · Dreams"), then one vertical scroll. */
export function DreamShell({ children, crumb = 'Grimoire · Dreams', back = '/grimoire', right }: { children: ReactNode; crumb?: string; back?: Href; right?: ReactNode }) {
  const leave = useLeave(back);
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={leave} style={styles.back}>
          <View style={styles.flip}>
            <Icon name="chevron" size={22} color={colors.cream} />
          </View>
        </Pressable>
        <Text style={[type.caption, styles.crumb]} numberOfLines={1}>
          {crumb}
        </Text>
        {right}
      </View>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} alwaysBounceHorizontal={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** The detail under a dream's title: the morning, the moon that night, lucid or recurring, a few symbols. */
export function dreamDetail(e: DreamEntry, withDate = true): string {
  const d = e.data;
  const marks = [d.lucid ? 'lucid' : null, d.recurring ? 'recurring' : null].filter(Boolean).join(', ');
  return [withDate ? fullDate(d.date)?.replace(/, \d{4}$/, '') : null, `${d.moonPhase} in ${d.moonSign}`, marks || null, d.symbols.slice(0, 3).join(' · ') || null]
    .filter(Boolean)
    .join(' · ');
}

/** One dream in a list, with the moon of its night drawn beside it. */
export function DreamRow({ entry, last }: { entry: DreamEntry; last: boolean }) {
  const disc = dreamMoonDisc(entry.data.date);
  const title = entry.data.title || 'Untitled dream';
  const detail = dreamDetail(entry);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${detail}`}
      onPress={() => router.push(DREAM_ROUTES.dream(entry.id) as Href)}
      style={({ pressed }) => [styles.row, !last && styles.rowRule, pressed && styles.pressed]}
    >
      <View style={styles.rowIcon} accessibilityElementsHidden importantForAccessibility="no">
        <MoonDisc size={34} illumination={disc.illumination} waxing={disc.waxing} halo={false} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={type.caption} numberOfLines={2}>
          {detail}
        </Text>
      </View>
      <Icon name="chevron" size={16} color={colors.tabInactive} />
    </Pressable>
  );
}

/** Rows in the Grimoire's list style. */
export function DreamList({ children }: { children: ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

/** The optional morning nudge, off until chosen; kept with the other reminders on this phone. */
export function DreamReminder() {
  const { settings, permission } = useReminders();
  if (!remindersSupported) return null;
  return (
    <Card>
      <SectionLabel>Remind me</SectionLabel>
      <Toggle
        label="Last night’s dream"
        detail="A gentle morning nudge: write down last night’s dream"
        value={settings.dreamMorning}
        onChange={(on) => void updateReminderSettings({ dreamMorning: on })}
      />
      {settings.dreamMorning && <TimeStepper minutes={settings.dreamMorningAt} onChange={(minutes) => void updateReminderSettings({ dreamMorningAt: minutes })} />}
      {permission === 'denied' && settings.dreamMorning && <Body muted>Notifications are off for this app. Turn them on in your phone’s Settings to hear this.</Body>}
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingBottom: 8, minHeight: touch },
  back: { width: touch, height: touch, alignItems: 'center', justifyContent: 'center' },
  flip: { transform: [{ scaleX: -1 }] },
  crumb: { flex: 1 },
  content: { paddingHorizontal: space.gutter, paddingTop: 4, paddingBottom: 40, gap: space.section },
  list: { backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16 },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  rowRule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
  pressed: { opacity: 0.7 },
  rowIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.cream },
});
