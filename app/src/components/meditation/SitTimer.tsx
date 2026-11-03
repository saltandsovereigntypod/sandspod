// The meditation timer's face and its bells, used on the Meditation screen,
// over the altar ("Meditate here") and in a sit together. Time is read from
// the clock (when it began, less any pauses), never counted in ticks, so it
// stays true when the phone sleeps. While the app is put away, the end bell
// waits as a local notification (reminders/notifier.ts setSitAlarm); coming
// back, a bell whose moment has only just come still rings, and older ones
// stay quiet. The bell is the altar bell's chime (altar/feel.ts ringBell),
// which sounds even with the silent switch on, as ringing is deliberate; it
// keeps to Candle sounds and Vibration in Accessibility.

import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform, StyleSheet, Text, View } from 'react-native';

import { useAccessibility } from '../../lib/accessibility/store';
import { ringBell } from '../../lib/altar/feel';
import { setSitAlarm } from '../../lib/reminders/notifier';
import { bellsDue, bellsOf, clockLabel, elapsedOf, endBellAt, PHASE_WORDS, pauseClock, resumeClock, sitStateAt, type SitClock, type SitPlan, type SitState } from '../../lib/meditation/timer';
import { colors, fonts } from '../../theme';
import { Button } from '../Button';

const GAP_MS = 2600;

/** Ring a bell (or only vibrate) `times` times, as the plan and Accessibility say. */
export function ringSitBell(times: number, plan: Pick<SitPlan, 'signal'>, prefs: { candleSounds: boolean; haptics: boolean }): () => void {
  if (plan.signal === 'bell') return ringBell(times, GAP_MS, prefs.candleSounds, prefs.haptics, () => {});
  if (!prefs.haptics || Platform.OS === 'web') return () => {};
  const timers = Array.from({ length: times }, (_, i) => setTimeout(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}), i * 900));
  return () => timers.forEach(clearTimeout);
}

type Props = {
  plan: SitPlan;
  clock: SitClock;
  onClock?: (clock: SitClock) => void;
  /** An open-ended sit: the elapsed time when it was ended; null while it goes on. */
  endedAtMs: number | null;
  onEnd: (endedAtMs: number) => void;
  /** Called once when it's finished (the sit itself, in ms). */
  onFinished: (sitMs: number) => void;
  /** Smaller, for over the altar. */
  compact?: boolean;
  /** No pause (a sit together keeps everyone's time). */
  shared?: boolean;
};

export function SitTimer({ plan, clock, onClock, endedAtMs, onEnd, onFinished, compact, shared }: Props) {
  const prefs = useAccessibility();
  const bells = useMemo(() => bellsOf(plan), [plan]);
  const [now, setNow] = useState(() => Date.now());
  const last = useRef<number | null>(null);
  const finished = useRef(false);
  const stops = useRef<(() => void)[]>([]);
  const latest = useRef({ prefs, plan, clock, onFinished });
  useEffect(() => {
    latest.current = { prefs, plan, clock, onFinished };
  });

  // Tick twice a second; bells and the end are worked out from the clock.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  useEffect(() => () => stops.current.forEach((s) => s()), []);

  const elapsed = elapsedOf(clock, now);
  const state = sitStateAt(plan, elapsed, endedAtMs);

  useEffect(() => {
    if (clock.pausedAt !== null) return;
    const from = last.current ?? -1;
    last.current = elapsed;
    if (elapsed < 0) return;
    for (const bell of bellsDue(bells, from, elapsed)) stops.current.push(ringSitBell(bell.times, plan, prefs));
    if (state.phase === 'done' && !finished.current) {
      finished.current = true;
      latest.current.onFinished(state.sitMs);
    }
  }, [elapsed, bells, plan, prefs, clock.pausedAt, state.phase, state.sitMs]);

  // Away from the app: the end bell as a notification; back again, it's taken off.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const { plan: p, clock: c } = latest.current;
      if (next === 'active') void setSitAlarm(null);
      else if (next === 'background') {
        const at = endBellAt(p, c, Date.now());
        if (at) void setSitAlarm({ at: new Date(at), title: 'The end of your sit', body: 'Take your time coming back.' });
      }
    });
    return () => {
      sub.remove();
      void setSitAlarm(null);
    };
  }, []);

  const end = () => {
    if (plan.endBell) stops.current.push(ringSitBell(3, plan, prefs));
    onEnd(elapsed);
  };
  const paused = clock.pausedAt !== null;

  return (
    <View style={[styles.face, compact && styles.compact]} accessibilityLiveRegion="polite">
      <Text style={styles.phase}>{elapsed < 0 ? 'Beginning soon' : paused ? 'Paused' : PHASE_WORDS[state.phase]}</Text>
      <Text style={[styles.clock, compact && styles.clockCompact]} accessibilityLabel={faceLabel(state, elapsed)}>
        {elapsed < 0 ? clockLabel(-elapsed) : state.phaseLeftMs === null ? clockLabel(state.sitMs) : clockLabel(state.phaseLeftMs)}
      </Text>
      {state.leftMs !== null && state.phase !== 'sit' && state.phase !== 'done' && elapsed >= 0 && <Text style={styles.caption}>{`${clockLabel(state.leftMs)} in all`}</Text>}
      {state.phaseLeftMs === null && <Text style={styles.caption}>Open-ended: end when you’re ready</Text>}
      {state.phase !== 'done' && elapsed >= 0 && (
        <View style={styles.actions}>
          {!shared && onClock && <Button label={paused ? 'Carry on' : 'Pause'} variant="outline" onPress={() => onClock(paused ? resumeClock(clock, Date.now()) : pauseClock(clock, Date.now()))} />}
          {state.phase === 'sit' && state.phaseLeftMs === null ? <Button label="End the sit" onPress={end} /> : <Button label="Stop here" variant="text" onPress={() => onEnd(elapsed)} />}
        </View>
      )}
    </View>
  );
}

function faceLabel(state: SitState, elapsed: number): string {
  if (elapsed < 0) return `Beginning in ${Math.ceil(-elapsed / 60000)} minutes`;
  if (state.phaseLeftMs === null) return `${Math.floor(state.sitMs / 60000)} minutes so far`;
  return `${PHASE_WORDS[state.phase]}, ${Math.ceil(state.phaseLeftMs / 60000)} minutes left`;
}

const styles = StyleSheet.create({
  face: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  compact: { paddingVertical: 10, gap: 6 },
  phase: { fontFamily: fonts.body, fontSize: 15, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.muted },
  clock: { fontFamily: fonts.display, fontSize: 72, color: colors.cream, fontVariant: ['tabular-nums'] },
  clockCompact: { fontSize: 48 },
  caption: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' },
});
