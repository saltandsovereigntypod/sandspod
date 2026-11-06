import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, Easing, Platform, StyleSheet, Text, View } from 'react-native';

import { clockLabel, elapsedOf, pauseClock, resumeClock, startClock, type SitClock } from '../../lib/meditation/timer';
import { beatAt, breathAt, BREATH_CYCLE_MS, carrierLabel, cueNow, isDone, PROGRAM_NOTICE, PROGRAM_NOTICE_KEY, programEnd, programPlan, stageAt, type Compiled } from '../../lib/meditation/programs';
import { mixOn } from '../../lib/meditation/sound';
import { captionAt, type VoiceTimeline } from '../../lib/meditation/voice';
import { colors, fonts } from '../../theme';
import { Button } from '../Button';
import { Body, Card, Notice, ui } from '../rituals/ui';
import { useSitSound } from './sitSound';

/** The breathing pacer: a circle that swells over 4 seconds and settles over 6 (six breaths a minute). */
export function BreathCircle({ ms }: { ms: number }) {
  const b = breathAt(ms);
  const [scale] = useState(() => new Animated.Value(b.scale));
  useEffect(() => {
    const t = ((ms % BREATH_CYCLE_MS) + BREATH_CYCLE_MS) % BREATH_CYCLE_MS;
    const toIn = t < 4000;
    Animated.timing(scale, { toValue: toIn ? 1 : 0.55, duration: toIn ? 4000 - t : BREATH_CYCLE_MS - t, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }).start();
    // Only when the phase turns: the effect is keyed on it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b.phase]);
  return (
    <View style={styles.breath} accessible accessibilityLabel={`Breathing pacer: ${b.label.toLowerCase()}`}>
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
      <Text style={styles.breathText}>{b.label}</Text>
    </View>
  );
}

/** Has the first-play notice been read on this device? */
export function useNoticeSeen(): [boolean | null, () => void] {
  const [seen, setSeen] = useState<boolean | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(PROGRAM_NOTICE_KEY).then((v) => setSeen(v === '1')).catch(() => setSeen(false));
  }, []);
  return [seen, () => {
    setSeen(true);
    AsyncStorage.setItem(PROGRAM_NOTICE_KEY, '1').catch(() => {});
  }];
}

/** Plays a compiled program: clock, stage, beat, the current cue, the pacer, pause, skip to the return, and stop; with a recorded voice for its cues if given (and its words, unless `captions` is false). */
export function ProgramPlayer({ compiled, onFinish, voice, captions = true }: { compiled: Compiled; onFinish?: (playedMs: number) => void; voice?: VoiceTimeline | null; captions?: boolean }) {
  const [seen, markSeen] = useNoticeSeen();
  const [clock, setClock] = useState<SitClock | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [fading, setFading] = useState<number | null>(null);
  const plan = useMemo(() => programPlan(compiled), [compiled]);
  const live = !!clock && !isDone(compiled, elapsedOf(clock, now));
  // A stop fades by bringing the end forward: the run is replaced by one that ends in a few seconds.
  useSitSound(live && mixOn(compiled.mix) ? compiled.mix : null, plan, clock ?? startClock(now), programEnd(compiled), compiled, live ? voice : null);

  const latest = useRef(clock);
  useEffect(() => {
    latest.current = clock;
  });
  useEffect(() => {
    if (!clock) return;
    const id = setInterval(() => {
      const t = Date.now();
      const c = latest.current;
      if (c && isDone(compiled, elapsedOf(c, t))) {
        onFinish?.(elapsedOf(c, t));
        setClock(null);
      }
      setNow(t);
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!clock, compiled]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (next) => {
      const c = latest.current;
      if (next !== 'active' && c && c.pausedAt === null) setClock(pauseClock(c, Date.now()));
    });
    return () => sub.remove();
  }, []);

  const elapsed = clock ? elapsedOf(clock, now) : 0;
  const paused = !!clock && clock.pausedAt !== null;
  const seg = stageAt(compiled, elapsed);
  const said = clock && voice ? captionAt(voice, elapsed) : null;
  const cueText = !clock || (voice && !captions) ? null : (said?.text ?? cueNow(compiled, elapsed)?.text ?? null);
  const ret = compiled.segments.find((s) => s.id === 'return' || s.id === 'ground');
  const inReturn = !!ret && elapsed >= ret.startMs;

  const play = () => {
    const t = Date.now();
    setNow(t);
    setClock(clock ? resumeClock(clock, t) : startClock(t));
  };
  // Stop is never abrupt: a deep program is moved on to its return; one without a return fades out over 12 seconds.
  const stop = () => {
    if (!clock) return;
    const t = Date.now();
    const c = resumeClock(clock, t);
    if (ret && elapsedOf(c, t) < ret.startMs) {
      setClock({ ...c, startedAt: c.startedAt - (ret.startMs - elapsedOf(c, t)) });
      return;
    }
    const left = compiled.totalMs - elapsedOf(c, t);
    if (left > 12_000) setClock({ ...c, startedAt: c.startedAt - (left - 12_000) });
    setFading(t);
  };

  if (seen === false) {
    return (
      <Card>
        <Notice>{PROGRAM_NOTICE}</Notice>
        <Button label="I understand" onPress={markSeen} />
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.clock} accessibilityLabel={clock ? `${clockLabel(compiled.totalMs - elapsed)} left` : 'Not playing'}>
        {clockLabel(clock ? compiled.totalMs - elapsed : compiled.totalMs)}
      </Text>
      {clock ? (
        <Body muted>{`${seg.label} · ${beatAt(compiled, elapsed)} Hz on ${carrierLabel(seg.carrier)}${paused ? ' · paused' : ''}`}</Body>
      ) : (
        <Body muted>{`${compiled.segments.length} stages · ${carrierLabel(compiled.carrier)}`}</Body>
      )}
      {!!cueText && <Text style={styles.cue}>{cueText}</Text>}
      {clock && compiled.breath && <BreathCircle ms={elapsed} />}
      <View style={styles.actions}>
        {(!clock || paused) && <Button label={paused ? 'Play on' : 'Play'} onPress={play} disabled={seen === null} />}
        {clock && !paused && <Button label="Pause" variant="outline" onPress={() => setClock(pauseClock(clock, Date.now()))} />}
        {clock && !fading && <Button label={ret && !inReturn ? 'Skip to the return' : 'Stop'} variant="outline" onPress={stop} />}
      </View>
      {clock && ret && !inReturn && <Body muted>Ending early moves you on to the return rather than stopping dead.</Body>}
      {!clock && <View style={ui.gapSmall} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  clock: { fontFamily: fonts.display, fontSize: 56, color: colors.cream, fontVariant: ['tabular-nums'], textAlign: 'center' },
  cue: { fontFamily: fonts.body, fontSize: 18, lineHeight: 26, color: colors.cream, textAlign: 'center', paddingVertical: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' },
  breath: { alignItems: 'center', justifyContent: 'center', height: 190 },
  circle: { width: 150, height: 150, borderRadius: 75, backgroundColor: colors.gold, opacity: 0.35, position: 'absolute' },
  breathText: { fontFamily: fonts.body, fontSize: 15, color: colors.cream },
});
