// The ritual under way, over the altar: the step showing now (its words to
// speak and its timer), Next / Back / Pause / Finish, and what the step does
// to the altar. A step's own candle actions are carried out by themselves
// (onEffect, auto); what its words suggest (incense, an offering, a named
// candle) is offered as a tap. Finishing closes the session and opens the
// ritual journal, as the Rituals tab does.

import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { firstStepActionsDue, markStepActionsStarted } from '../../../lib/rituals/automation';
import { completeStep, currentStep, formatClock, pauseSession, resumeSession, sessionElapsed, skipStep, timedStepDue, withAltarSnapshot } from '../../../lib/rituals/lifecycle';
import { finishActive, updateActive, useRituals } from '../../../lib/rituals/store';
import type { RitualSession } from '../../../lib/rituals/types';
import { addEntry } from '../../../lib/craft/store';
import {
  linkSessionToAltar,
  planRitualOnAltar,
  ritualHistoryText,
  stepBack,
  stepProgress,
  transitionEffects,
  type AltarEffect,
  type PlanOptions,
} from '../../../lib/altar/connect/ritual';
import { HISTORY } from '../../../lib/altar/connect/history';
import { useAccessibleText } from '../../../lib/accessibility/store';
import { confirmAction, tell } from '../../rituals/ui';
import { colors, fonts, radius, touch, type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { nowIso, type AltarRef } from './common';

type Props = {
  altar: AltarRef;
  /** Carry out an effect on the altar (applyAltarEffect), or open the offering sheet for kind 'offering'. */
  onEffect: (effect: AltarEffect) => void;
  /** The closing words, when the ritual came from a template or draft (sessions don't keep them). */
  closing?: string | null;
  intentionKey?: string | null;
  /** 'all' (the website's way) or 'matching' (the colours the step or intention names). */
  candleScope?: PlanOptions['candleScope'];
  /** The altar as it stands now, for the session's altar_snapshot (lib/altar/snapshot ritualAltarSnapshot). */
  snapshot?: () => Record<string, unknown> | null;
  /** After the ritual is closed. Default: the journal form for a completed ritual. */
  onFinished?: (session: RitualSession, status: 'completed' | 'abandoned') => void;
};

function useClock(running: boolean): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [running]);
  return now;
}

/** The ritual overlay. Renders nothing while no ritual is under way. */
export function AltarRitualOverlay({ altar, onEffect, closing, intentionKey, candleScope = 'all', snapshot, onFinished }: Props) {
  const { active: session } = useRituals();
  const now = useClock(session?.status === 'active');
  const t = useAccessibleText();
  const [collapsed, setCollapsed] = useState(false);
  const [closingOpen, setClosingOpen] = useState(false);
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState(false);
  const effectRef = useRef(onEffect);
  useEffect(() => {
    effectRef.current = onEffect;
  }, [onEffect]);

  const plan = useMemo(
    () => (session ? planRitualOnAltar(session.session_steps, altar.objects, { candleScope, intentionKey, intention: session.intention, closing: closing ?? '' }) : null),
    [session, altar.objects, candleScope, intentionKey, closing],
  );
  const planRef = useRef(plan);
  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

  // Automatic effects (a step's own candle actions) are simply carried out.
  const run = useCallback((effects: AltarEffect[]) => {
    for (const e of effects) effectRef.current(e);
  }, []);
  // Offered ones are tapped, and then leave the list.
  const tap = (e: AltarEffect) => {
    effectRef.current(e);
    setDone((d) => new Set(d).add(e.id));
  };

  // A ritual begun from this altar belongs to it: link it (so its journal entry
  // links the altar), keep the altar as it stood, then run the first step's candle actions once.
  useEffect(() => {
    if (!session || !plan) return;
    const link = !!altar.id && !session.linked_altar_id;
    const needsSnapshot = !!snapshot && !Object.keys(session.altar_snapshot ?? {}).length;
    const first = firstStepActionsDue(session);
    if (!link && !needsSnapshot && !first) return;
    const shot = needsSnapshot ? snapshot!() : null;
    void updateActive((s) => {
      const at = new Date();
      let next = link && altar.id ? linkSessionToAltar(s, altar.id, at) : s;
      if (shot) next = withAltarSnapshot(next, shot, at);
      return first ? markStepActionsStarted(next, first, at) : next;
    });
    if (first) run((plan.steps.find((p) => p.stepId === first.id)?.start ?? []).filter((e) => e.auto));
  }, [session, plan, altar.id, snapshot, run]);

  const next = useCallback(async () => {
    const result = await updateActive((s) => completeStep(s, new Date()));
    if (result && planRef.current) run(transitionEffects(planRef.current, result.before, result.after).filter((e) => e.auto));
  }, [run]);

  // Timed steps move on by themselves, as on the Rituals tab.
  useEffect(() => {
    if (session && timedStepDue(session, now)) void next();
  }, [session, now, next]);

  if (!session || !plan) return null;

  const step = currentStep(session);
  const progress = stepProgress(session, now);
  const paused = session.status === 'paused';
  const stepPlan = step ? plan.steps.find((p) => p.stepId === step.id) ?? null : null;
  const offered = [...(stepPlan?.start ?? []), ...(stepPlan?.end ?? [])].filter((e) => !e.auto && !done.has(e.id));
  const automatic = [...(stepPlan?.start ?? []), ...(stepPlan?.end ?? [])].filter((e) => e.auto);
  const clock = progress.remaining != null ? formatClock(progress.remaining) : formatClock(progress.elapsed);
  const allDone = !step;
  const showClosing = closingOpen || allDone;
  const canBack = session.session_steps.some((s) => s.status === 'completed' || s.status === 'skipped');

  const finish = async (status: 'completed' | 'abandoned') => {
    if (status === 'abandoned' && !(await confirmAction('End without saving?', 'The ritual is closed and nothing is added to your journal.', 'End it'))) return;
    setBusy(true);
    try {
      const finished = await finishActive(status, snapshot?.() ?? null);
      if (!finished) return;
      if (altar.id) void addEntry(HISTORY, { altarId: altar.id, text: ritualHistoryText(finished.title, status), at: nowIso() });
      if (onFinished) onFinished(finished, status);
      else if (status === 'completed') router.push({ pathname: '/rituals/journal/new', params: { sessionId: finished.id } });
    } catch (e) {
      tell('Saved on this phone', e instanceof Error ? `${e.message}. It will sync when you’re back online.` : 'It will sync when you’re back online.');
    } finally {
      setBusy(false);
      setClosingOpen(false);
    }
  };

  if (collapsed) {
    return (
      <View style={styles.dock} pointerEvents="box-none">
        <Pressable
          onPress={() => setCollapsed(false)}
          accessibilityRole="button"
          accessibilityLabel={`${session.title || 'Ritual'} under way. ${step ? `Step ${progress.index + 1} of ${progress.count}, ${step.title}` : 'Every step is done'}. Show the ritual`}
          style={({ pressed }) => [styles.bar, pressed && { opacity: 0.8 }]}
        >
          <Text style={[t(styles.barText)]} numberOfLines={1}>
            {step ? `Step ${progress.index + 1} of ${progress.count} · ${step.title}` : 'Close the circle'}
          </Text>
          <Text style={t(styles.barClock)}>{paused ? 'Paused' : clock}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.dock} pointerEvents="box-none">
      <View style={styles.card} accessibilityViewIsModal={false}>
        <View style={styles.head}>
          <View style={styles.headText}>
            <Text style={type.eyebrow}>{paused ? 'Paused' : step ? `Step ${progress.index + 1} of ${progress.count}` : session.session_steps.length ? 'Every step is done' : 'Under way'}</Text>
            <Text style={type.cardTitle} accessibilityRole="header" accessibilityLiveRegion="polite" numberOfLines={2}>
              {showClosing ? 'Closing' : step?.title ?? (session.title || 'Your ritual')}
            </Text>
          </View>
          <Pressable onPress={() => setCollapsed(true)} accessibilityRole="button" accessibilityLabel="Make the ritual smaller, to see the altar" style={styles.iconButton}>
            <Text style={t(styles.iconText)}>▾</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
        {showClosing ? (
          <View style={styles.body}>
            {plan.closing.text ? <Text style={styles.text}>{plan.closing.text}</Text> : <Text style={styles.text}>Thank what you called in, and say the working is done.</Text>}
            {plan.closing.effects.filter((e) => !done.has(e.id)).length > 0 && (
              <ChipRow>
                {plan.closing.effects
                  .filter((e) => !done.has(e.id))
                  .map((e) => (
                    <Chip key={e.id} label={e.label} symbol={e.kind === 'snuff' ? '◌' : '≋'} accessibilityLabel={`${e.label}. ${e.reason}`} onPress={() => tap(e)} />
                  ))}
              </ChipRow>
            )}
            <Text style={type.caption}>{`Ritual time ${formatClock(sessionElapsed(session, now))}`}</Text>
          </View>
        ) : step ? (
          <View style={styles.body}>
            {!!step.instructions && <Text style={styles.text}>{step.instructions}</Text>}
            {!!step.spoken_text && (
              <View style={styles.words} accessible accessibilityLabel={`Words to speak: ${step.spoken_text}`}>
                <Text style={styles.wordsText}>{step.spoken_text}</Text>
              </View>
            )}
            <Text style={t(styles.clock)} accessibilityLabel={progress.remaining != null ? `${clock} left on this step` : `${clock} on this step`}>
              {clock}
            </Text>
            {automatic.length > 0 && (
              <Text style={type.caption}>{automatic.map((e) => `${e.moment === 'start' ? 'As it begins' : 'As it ends'}: ${e.label.toLowerCase()}.`).join(' ')}</Text>
            )}
            {offered.length > 0 && (
              <ChipRow>
                {offered.map((e) => (
                  <Chip key={e.id} label={e.label} symbol={e.kind === 'offering' ? '❦' : e.kind === 'light_incense' ? '≋' : '🜂'} accessibilityLabel={`${e.label}. ${e.reason}`} onPress={() => tap(e)} />
                ))}
              </ChipRow>
            )}
          </View>
        ) : null}
        </ScrollView>

        <View style={styles.controls}>
          {!showClosing && (
            <>
              <Control label="Back" disabled={paused || !canBack} onPress={() => void updateActive((s) => stepBack(s, new Date()))} hint="Go back to the step before" />
              <Control
                label={paused ? 'Resume' : 'Pause'}
                onPress={() => void updateActive((s) => (s.status === 'paused' ? resumeSession(s, new Date()) : pauseSession(s, new Date())))}
              />
              <Control label="Skip" disabled={paused} onPress={() => void updateActive((s) => skipStep(s, new Date()))} hint="Move on without this step’s candle actions" />
              <Control label={progress.index === progress.count - 1 ? 'Done' : 'Next'} primary disabled={paused} onPress={() => void next()} />
            </>
          )}
          {showClosing ? (
            <>
              {!allDone && <Control label="Back to the steps" onPress={() => setClosingOpen(false)} />}
              <Control label="End without saving" onPress={() => void finish('abandoned')} disabled={busy} />
              <Control label={busy ? 'Finishing…' : 'Finish and journal'} primary disabled={busy} onPress={() => void finish('completed')} />
            </>
          ) : (
            <Control label="Finish" onPress={() => setClosingOpen(true)} hint="Close the ritual and write in your journal" />
          )}
        </View>
      </View>
    </View>
  );
}

function Control({ label, onPress, disabled, primary, hint }: { label: string; onPress: () => void; disabled?: boolean; primary?: boolean; hint?: string }) {
  const t = useAccessibleText();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.control, primary && styles.controlPrimary, (pressed || disabled) && { opacity: 0.5 }]}
    >
      <Text style={[t(styles.controlText), primary && styles.controlTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10, alignItems: 'center' },
  card: {
    width: '100%',
    maxWidth: 560,
    maxHeight: 420,
    backgroundColor: 'rgba(7,10,8,0.9)',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.goldLine,
    padding: 14,
    gap: 10,
  },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  headText: { flex: 1, gap: 2 },
  iconButton: { minWidth: touch, minHeight: touch, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: colors.gold, fontSize: 20 },
  scroll: { flexGrow: 0, flexShrink: 1 },
  body: { gap: 8 },
  text: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchment },
  words: { backgroundColor: colors.night, borderRadius: radius.tile, padding: 12, borderLeftWidth: 2, borderLeftColor: colors.gold },
  wordsText: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 25, color: colors.cream },
  clock: { fontFamily: fonts.display, fontSize: 30, color: colors.cream, textAlign: 'center' },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  control: { minHeight: touch, minWidth: touch, paddingHorizontal: 14, borderRadius: radius.button, borderWidth: 1, borderColor: 'rgba(244,236,216,0.28)', alignItems: 'center', justifyContent: 'center' },
  controlPrimary: { backgroundColor: colors.gold, borderColor: colors.gold },
  controlText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
  controlTextPrimary: { color: colors.forestInk },
  bar: {
    width: '100%',
    maxWidth: 560,
    minHeight: touch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: radius.chip,
    backgroundColor: 'rgba(7,10,8,0.9)',
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  barText: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 14, color: colors.cream },
  barClock: { fontFamily: fonts.body, fontSize: 14, color: colors.gold },
});
