import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { covenHref } from './CovenScreen';
import { askEndRitual, LeadSteps, LiveStepCard, StepList, useLiveRitual } from './LiveRitual';
import { Notice, Section } from '../more/ui';
import { chatPanelFrame, liveRitualFor } from '../../lib/covens/altarPanel';
import { useCoven } from '../../lib/covens/CovenContext';
import { colors, fonts, radius, type } from '../../theme';

// The rite under way, in a window over a coven altar, beside "Messages"
// (ChatPanel.tsx): the step in progress in full (whose it is, whose turn, the
// words, what it does on the altar, your part in it, finishing it), the
// leader's back and next, and every step with where it stands. It is the
// ritual page's own (LiveRitual.tsx), so what you can do here is what you can
// do there; "Open" goes to the whole ritual page.

/** The "Ritual" button and its window, while one of the coven's rites is under way. */
export function AltarRitual({ altarId, ritualId }: { altarId: string; ritualId?: string | null }) {
  const coven = useCoven();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const ritual = liveRitualFor(coven.rituals, altarId, ritualId);
  if (!ritual || !(coven.perms.member || coven.perms.site)) return null;
  return (
    <>
      {open && <RitualPanel ritualId={ritual.id} onClose={() => setOpen(false)} />}
      {!open && (
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Ritual: ${ritual.title} is under way. Show the step in progress`}
          style={({ pressed }) => [styles.fab, { bottom: 16 + 60 + Math.max(0, insets.bottom - 34) }, pressed && styles.pressed]}
        >
          <Text style={styles.fabIcon} accessibilityElementsHidden importantForAccessibility="no">
            ☾
          </Text>
          <Text style={styles.fabLabel}>Ritual</Text>
        </Pressable>
      )}
    </>
  );
}

function RitualPanel({ ritualId, onClose }: { ritualId: string; onClose: () => void }) {
  const coven = useCoven();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const frame = chatPanelFrame(width, height - insets.top);
  const live = useLiveRitual(ritualId);
  const { ritual, steps, current, at } = live;

  const openFull = () => {
    onClose();
    router.push(covenHref(coven.slug, `ritual/${ritualId}`));
  };

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, frame.side === 'right' ? styles.holderRight : styles.holderBottom]}>
      <View
        accessibilityLabel="Ritual"
        style={[
          styles.panel,
          frame.side === 'right'
            ? [styles.panelRight, { width: frame.width, marginTop: insets.top, paddingRight: insets.right }]
            : [styles.panelBottom, { height: Math.round(Math.max(frame.height, (height - insets.top) * 0.7)) }],
        ]}
      >
        <View style={styles.head}>
          <View style={styles.headText}>
            <Text accessibilityRole="header" style={styles.title} numberOfLines={1}>
              {ritual?.title ?? 'Ritual'}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {current ? `Step ${at + 1} of ${steps.length} · under way` : ritual?.status === 'live' ? 'Under way' : 'Not under way now'}
            </Text>
          </View>
          <HeadButton label="Open" accessibilityLabel="Open the whole ritual page" onPress={openFull} />
          <HeadButton label="Close" accessibilityLabel="Close the ritual and go back to the altar" onPress={onClose} strong />
        </View>
        <ScrollView style={styles.body} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
      </View>
    </View>
  );
}

function HeadButton({ label, accessibilityLabel, onPress, strong }: { label: string; accessibilityLabel: string; onPress: () => void; strong?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => [styles.headButton, strong && styles.headButtonStrong, pressed && styles.pressed]}
    >
      <Text style={[styles.headButtonText, strong && styles.headButtonTextStrong]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: radius.chip,
    backgroundColor: colors.night,
    borderWidth: 1,
    borderColor: colors.gold,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  fabIcon: { fontSize: 18, color: colors.gold },
  fabLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.cream },
  holderBottom: { justifyContent: 'flex-end' },
  holderRight: { alignItems: 'flex-end' },
  panel: {
    backgroundColor: colors.ground,
    borderColor: colors.goldLine,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
    elevation: 12,
  },
  panelBottom: { alignSelf: 'stretch', flexShrink: 1, maxHeight: '100%', borderTopWidth: 1, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  panelRight: { flex: 1, borderLeftWidth: 1, borderTopLeftRadius: radius.card, borderBottomLeftRadius: radius.card },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  headText: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.display, fontSize: 17, color: colors.cream },
  subtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  headButton: { minHeight: 36, paddingHorizontal: 10, justifyContent: 'center', borderRadius: radius.chip, borderWidth: 1, borderColor: colors.hairline },
  headButtonStrong: { borderColor: colors.gold },
  headButtonText: { fontFamily: fonts.body, fontSize: 13, color: colors.cream },
  headButtonTextStrong: { color: colors.gold },
  body: { flex: 1 },
  content: { padding: 12, gap: 12, paddingBottom: 32 },
  pressed: { opacity: 0.75 },
});
