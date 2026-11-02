import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MessagesPane } from './ChatPanel';
import { covenHref } from './CovenScreen';
import { askEndRitual, LeadSteps, LiveStepCard, StepList, StepPopups, useLiveRitual, type LiveRitual } from './LiveRitual';
import { Notice, Section } from '../more/ui';
import { altarPanelHeight, badgeLabel, liveRitualFor } from '../../lib/covens/altarPanel';
import { useCoven } from '../../lib/covens/CovenContext';
import { useUnread } from '../../lib/covens/unread';
import { colors, fonts, radius, type } from '../../theme';

// One panel over a coven altar with two tabs: "Messages" (ChatPanel.tsx, the
// coven's chat) and, while a rite is under way, "Ritual" (the step in
// progress in full, the leader's back and next, and every step, from the
// ritual page's own LiveRitual.tsx, so what you can do here is what you can
// do there). It folds down to a slim bar; open, it takes at most about a
// third of the screen along the bottom, with no backdrop, so the altar above
// stays in view and can be tended. The rite's pop-ups (StepPopups) sit at
// the top.

type Tab = 'messages' | 'ritual';

/** The panel and the rite's pop-ups, for a coven altar's overlay. */
export function AltarPanel({ altarId, ritualId }: { altarId: string; ritualId?: string | null }) {
  const coven = useCoven();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const ritual = liveRitualFor(coven.rituals, altarId, ritualId);
  const live = useLiveRitual(ritual?.id);
  const unread = useUnread(coven.snapshot?.coven.id ?? null);
  const [chosen, setChosen] = useState<Tab | null>(null);
  const [open, setOpen] = useState(false);
  // Once Messages has been shown it stays mounted (hidden), so its report sheet is never torn down mid-close.
  const [chatShown, setChatShown] = useState(false);
  if (!(coven.perms.member || coven.perms.site)) return null;
  const tab: Tab = chosen === 'messages' || !ritual ? 'messages' : 'ritual';
  const pick = (next: Tab) => {
    if (open && next === tab) return setOpen(false);
    setChosen(next);
    setOpen(true);
    if (next === 'messages') setChatShown(true);
  };
  const tabs = (
    <View style={styles.tabs} accessibilityRole="tablist">
      <TabButton label={unread > 0 ? `Messages ${badgeLabel(unread)}` : 'Messages'} active={open && tab === 'messages'} onPress={() => pick('messages')} />
      {!!ritual && <TabButton label="Ritual" active={open && tab === 'ritual'} onPress={() => pick('ritual')} gold />}
    </View>
  );

  return (
    <>
      {!!ritual && <StepPopups live={live} />}
      <KeyboardAvoidingView pointerEvents="box-none" behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[StyleSheet.absoluteFill, styles.holder]}>
        {open ? (
          <View accessibilityLabel={tab === 'ritual' ? 'Ritual' : 'Messages'} style={[styles.panel, { height: altarPanelHeight(height - insets.top) }]}>
            <View style={styles.bar}>
              {tabs}
              <Pressable onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Fold the panel down" hitSlop={6} style={({ pressed }) => [styles.fold, pressed && styles.pressed]}>
                <Text style={styles.foldText}>Hide</Text>
              </Pressable>
            </View>
            {chatShown && <MessagesPane visible={tab === 'messages'} onClose={() => setOpen(false)} />}
            {tab === 'ritual' && !!ritual && <RitualPane live={live} ritualId={ritual.id} />}
          </View>
        ) : (
          <View style={[styles.slim, { marginBottom: 12 + Math.max(0, insets.bottom - 34) }]}>{tabs}</View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

function TabButton({ label, active, onPress, gold }: { label: string; active: boolean; onPress: () => void; gold?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [styles.tab, active && styles.tabActive, gold && !active && styles.tabGold, pressed && styles.pressed]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function RitualPane({ live, ritualId }: { live: LiveRitual; ritualId: string }) {
  const coven = useCoven();
  const { ritual, steps, current, at } = live;
  return (
    <ScrollView style={styles.body} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.row}>
        <View style={styles.grow}>
          <Text accessibilityRole="header" style={styles.title} numberOfLines={1}>
            {ritual?.title ?? 'Ritual'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {current ? `Step ${at + 1} of ${steps.length} · under way` : ritual?.status === 'live' ? 'Under way' : 'Not under way now'}
          </Text>
        </View>
        <Pressable onPress={() => router.push(covenHref(coven.slug, `ritual/${ritualId}`))} accessibilityRole="button" accessibilityLabel="Open the whole ritual page" hitSlop={6} style={({ pressed }) => [styles.fold, pressed && styles.pressed]}>
          <Text style={styles.foldText}>Open</Text>
        </Pressable>
      </View>
      {!ritual && <Text style={type.caption}>Loading…</Text>}
      {!!ritual && !current && <Notice>{ritual.status === 'live' ? 'The ritual is under way.' : 'The ritual has ended.'}</Notice>}
      {!!ritual && current && <LiveStepCard live={live} atAltar />}
      {!!live.message && <Notice>{live.message}</Notice>}
      <LeadSteps live={live} onEnd={() => askEndRitual(live)} />
      {!!ritual && (
        <Section label="Steps">
          <StepList live={live} />
        </Section>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  holder: { justifyContent: 'flex-end' },
  panel: {
    alignSelf: 'stretch',
    flexShrink: 1,
    maxHeight: '100%',
    backgroundColor: colors.ground,
    borderColor: colors.goldLine,
    borderTopWidth: 1,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
    elevation: 12,
  },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  slim: { alignSelf: 'flex-end', marginRight: 12, padding: 4, borderRadius: radius.chip, backgroundColor: colors.night, borderWidth: 1, borderColor: colors.goldLine, elevation: 6, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  tabs: { flexDirection: 'row', gap: 4, flexShrink: 1 },
  tab: { minHeight: 40, paddingHorizontal: 14, justifyContent: 'center', borderRadius: radius.chip, borderWidth: 1, borderColor: 'transparent' },
  tabActive: { backgroundColor: colors.surface, borderColor: colors.gold },
  tabGold: { borderColor: colors.gold },
  tabText: { fontFamily: fonts.body, fontSize: 14, color: colors.cream },
  tabTextActive: { color: colors.gold },
  fold: { marginLeft: 'auto', minHeight: 36, paddingHorizontal: 10, justifyContent: 'center', borderRadius: radius.chip, borderWidth: 1, borderColor: colors.hairline },
  foldText: { fontFamily: fonts.body, fontSize: 13, color: colors.cream },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.display, fontSize: 17, color: colors.cream },
  subtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  body: { flex: 1 },
  content: { padding: 12, gap: 12, paddingBottom: 32 },
  pressed: { opacity: 0.75 },
});
