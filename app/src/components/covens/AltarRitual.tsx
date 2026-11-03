import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MessagesPane } from './ChatPanel';
import { covenHref } from './CovenScreen';
import { askEndRitual, LeadSteps, LiveStepCard, StepList, useLiveRitual, type LiveRitual } from './LiveRitual';
import { useAltarDesk } from '../altar/altarDesk';
import { Notice, Section } from '../more/ui';
import { useAccessibility } from '../../lib/accessibility/store';
import { ringBell } from '../../lib/altar/feel';
import * as api from '../../lib/covens/api';
import { atAltarOf, deedFinish, sitStepOf } from '../../lib/covens/altarActions';
import { altarPanelHeight, badgeLabel, liveRitualFor } from '../../lib/covens/altarPanel';
import { gazesAtCandle, glowsForMe, opensPanel, panelBarLine, panelCue } from '../../lib/covens/ritualPanel';
import { useCoven } from '../../lib/covens/CovenContext';
import { useUnread } from '../../lib/covens/unread';
import { colors, fonts, radius, type } from '../../theme';

// One panel over a coven altar with two tabs: "Messages" (ChatPanel.tsx, the
// coven's chat) and, while a rite is under way, "Ritual" (the step in
// progress in full, the leader's back and next, and every step, from the
// ritual page's own LiveRitual.tsx, so what you can do here is what you can
// do there). It folds down to a slim bar; open, it takes at most about a
// third of the screen along the bottom, with no backdrop, so the altar above
// stays in view and can be tended.
//
// While a rite is under way everyone stays here: the Ritual tab is the home
// of the step. It opens by itself (a soft chime, a brief glow) when a step
// begins, when your turn comes, and when a step you move on is finished
// (lib/covens/ritualPanel.ts), in place of pop-ups over the altar. Folded,
// its bar says where things are ("Step 3 · Your turn: Call the East").
// What to tap glows on the altar for the person whose part it is, and doing
// it there counts (components/altar/altarDesk.ts).

type Tab = 'messages' | 'ritual';

// The altar screen's "the ritual is under way here" opens this panel.
const openers = new Set<() => void>();
export const openRitualPanel = () => openers.forEach((open) => open());

// Opening a live ritual from elsewhere takes you to its altar, once.
const taken = new Set<string>();
export function takeToAltarOnce(ritualId: string): boolean {
  if (taken.has(ritualId)) return false;
  taken.add(ritualId);
  return true;
}

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
  const prefs = useAccessibility();
  const [glow] = useState(() => new Animated.Value(0));
  // Already here: opening the ritual page later doesn't send you back.
  useEffect(() => {
    if (ritual?.id) taken.add(ritual.id);
  }, [ritual?.id]);
  useEffect(() => {
    const opener = () => {
      setChosen('ritual');
      setOpen(true);
    };
    openers.add(opener);
    return () => {
      openers.delete(opener);
    };
  }, []);

  // Opening by itself: a new step, your turn, a finished step you move on.
  const flow = live.live ? live.flow : null;
  const cue = panelCue(live.current?.id, flow);
  const lastCue = useRef('');
  const soundRef = useRef(prefs);
  useEffect(() => {
    soundRef.current = prefs;
  });
  useEffect(() => {
    const before = lastCue.current;
    lastCue.current = cue;
    if (!opensPanel(before, cue)) return;
    setChosen('ritual');
    setOpen(true);
    ringBell(1, 0, soundRef.current.candleSounds, soundRef.current.haptics, () => {});
    glow.setValue(1);
    Animated.timing(glow, { toValue: 0, duration: 1800, useNativeDriver: false }).start();
  }, [cue, glow]);

  // The step's deed waits on the altar, and its target glows, for the person whose part it is.
  const desk = useAltarDesk();
  const current = live.current;
  const builder = current ? live.builderSteps.find((s) => s.key === current.id) : undefined;
  const deed = atAltarOf(builder);
  const sit = sitStepOf(builder);
  const glowing = !!flow && !!current && glowsForMe({ kind: flow.kind, mine: live.mine, myTurn: flow.myTurn, hasOrder: (current.turn_order ?? []).length > 0, iDone: flow.iDone, complete: flow.progress.complete });
  const armKey = current && deed && glowing && coven.standing.ok ? `${current.id}:${current.turn_at ?? 0}:${deed.deed}` : '';
  const gaze = !!sit && gazesAtCandle(sit.id) && !!flow && !flow.progress.complete;
  const { markDone, userId } = coven;
  const stepRef = useRef(current);
  useEffect(() => {
    stepRef.current = current;
  });
  const deedKind = deed?.deed ?? null;
  useEffect(() => {
    if (!desk) return;
    if (!armKey || !deedKind) {
      desk.arm(null);
      desk.glow(gaze ? 'gaze' : null);
      return;
    }
    desk.arm({
      kind: deedKind,
      key: armKey,
      onDone: () => {
        const step = stepRef.current;
        if (!step) return;
        const finish = deedFinish(step, userId);
        if (finish.done) markDone(step.id);
        if (finish.passTurn) void api.nextTurn(step.id).catch(() => undefined);
      },
    });
    desk.glow(deedKind);
    // The desk is made afresh each render; what matters is the deed, whose turn, and the glow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armKey, gaze, deedKind, markDone, userId]);
  const deskRef = useRef(desk);
  useEffect(() => {
    deskRef.current = desk;
  });
  useEffect(
    () => () => {
      deskRef.current?.arm(null);
      deskRef.current?.glow(null);
    },
    [],
  );

  if (!(coven.perms.member || coven.perms.site)) return null;
  const tab: Tab = chosen === 'messages' || !ritual ? 'messages' : 'ritual';
  const barLine =
    flow && current ? panelBarLine({ index: live.at, title: current.title, mine: live.mine, myTurn: flow.myTurn, kind: flow.kind, iDone: flow.iDone, complete: flow.progress.complete, isEnder: flow.isEnder }) : '';
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
      <KeyboardAvoidingView pointerEvents="box-none" behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[StyleSheet.absoluteFill, styles.holder]}>
        {open ? (
          <Animated.View
            accessibilityLabel={tab === 'ritual' ? 'Ritual' : 'Messages'}
            style={[
              styles.panel,
              {
                height: altarPanelHeight(height - insets.top),
                borderColor: glow.interpolate({ inputRange: [0, 1], outputRange: [colors.goldLine, colors.gold] }),
                borderTopWidth: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }),
              },
            ]}
          >
            <View style={styles.bar}>
              {tabs}
              <Pressable onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Fold the panel down" hitSlop={6} style={({ pressed }) => [styles.fold, pressed && styles.pressed]}>
                <Text style={styles.foldText}>Hide</Text>
              </Pressable>
            </View>
            {chatShown && <MessagesPane visible={tab === 'messages'} onClose={() => setOpen(false)} />}
            {tab === 'ritual' && !!ritual && <RitualPane live={live} ritualId={ritual.id} />}
          </Animated.View>
        ) : (
          <View style={[styles.slimRow, { marginBottom: 12 + Math.max(0, insets.bottom - 34) }]} pointerEvents="box-none">
            {!!barLine && (
              <Pressable onPress={() => pick('ritual')} accessibilityRole="button" accessibilityLabel={`${barLine}. Open the ritual`} style={({ pressed }) => [styles.slim, styles.slimLine, pressed && styles.pressed]}>
                <Text style={styles.slimText} numberOfLines={1}>
                  {barLine}
                </Text>
              </Pressable>
            )}
            <View style={styles.slim}>{tabs}</View>
          </View>
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
        {/* While it's under way everyone stays at the altar; afterwards the whole ritual page opens. */}
        {!live.live && (
          <Pressable onPress={() => router.push(covenHref(coven.slug, `ritual/${ritualId}`))} accessibilityRole="button" accessibilityLabel="Open the whole ritual page" hitSlop={6} style={({ pressed }) => [styles.fold, pressed && styles.pressed]}>
            <Text style={styles.foldText}>Open</Text>
          </Pressable>
        )}
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
  slimRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginHorizontal: 12 },
  slimLine: { flexShrink: 1, minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, borderColor: colors.gold },
  slimText: { fontFamily: fonts.body, fontSize: 13, color: colors.cream },
  slim: { padding: 4, borderRadius: radius.chip, backgroundColor: colors.night, borderWidth: 1, borderColor: colors.goldLine, elevation: 6, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
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
