import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { useSitSound } from '../../../../../components/meditation/sitSound';
import { SoundForm, useLastMix } from '../../../../../components/meditation/SoundForm';
import { Body, Card, Chip, Chips, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { cleanListen, DEFAULT_LISTEN_MIX, LISTEN_KEY, LISTEN_NOTE, LISTEN_TIMERS, listenEnd, listenLogParams, listenPlan, listenState, stopAt, timerLabel } from '../../../../../lib/meditation/listen';
import { mixLine, mixOn } from '../../../../../lib/meditation/sound';
import { clockLabel, elapsedOf, pauseClock, resumeClock, startClock, type SitClock } from '../../../../../lib/meditation/timer';
import { colors, fonts } from '../../../../../theme';

// Listen (lib/meditation/listen.ts): the sit's sound layers on their own,
// binaural beats among them, with play, pause and stop, fades, and a stop
// timer. The last mix is kept on this device. Played by sitSound (which
// holds the silent switch open while it plays); it pauses when the app goes
// to the background, since there's no background audio. Website:
// /practice/meditation/listen/.
type Run = { clock: SitClock; minutes: number | null; endMs: number | null; stopping: boolean };

export default function Listen() {
  const [mix, setMix] = useLastMix(LISTEN_KEY, DEFAULT_LISTEN_MIX, cleanListen);
  const [minutes, setMinutes] = useState<number | null>(30);
  const [run, setRun] = useState<Run | null>(null);
  const [done, setDone] = useState<{ startedAt: number; ms: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const plan = useMemo(() => listenPlan(run?.minutes ?? minutes), [run?.minutes, minutes]);
  const clock = run?.clock ?? startClock(now);
  const elapsed = run ? elapsedOf(run.clock, now) : 0;
  const state = listenState(elapsed, run?.endMs ?? null);
  useSitSound(run && !state.done ? mix : null, plan, clock, run?.endMs ?? null);

  // Each half second: the clock, and the end (the timer ran out, or Stop's fade is over).
  const latest = useRef(run);
  useEffect(() => {
    latest.current = run;
  });
  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => {
      const t = Date.now();
      const r = latest.current;
      if (r && listenState(elapsedOf(r.clock, t), r.endMs).done) {
        setDone({ startedAt: r.clock.startedAt, ms: elapsedOf(r.clock, t) });
        setRun(null);
      }
      setNow(t);
    }, 500);
    return () => clearInterval(id);
  }, [run]);

  // No sound in the background without a native build: pause as the app leaves.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (next) => {
      const r = latest.current;
      if (next !== 'active' && r && r.clock.pausedAt === null) setRun({ ...r, clock: pauseClock(r.clock, Date.now()) });
    });
    return () => sub.remove();
  }, []);

  const paused = !!run && run.clock.pausedAt !== null;
  const play = () => {
    const t = Date.now();
    setNow(t);
    setDone(null);
    if (run) setRun({ ...run, clock: resumeClock(run.clock, t) });
    else setRun({ clock: startClock(t), minutes, endMs: listenEnd(minutes), stopping: false });
  };
  const pause = () => run && setRun({ ...run, clock: pauseClock(run.clock, Date.now()) });
  const stop = () => {
    if (!run) return;
    const t = Date.now();
    const c = resumeClock(run.clock, t);
    setRun({ ...run, clock: c, endMs: stopAt(elapsedOf(c, t), run.endMs), stopping: true });
  };
  const stopping = !!run?.stopping;
  const keep = () => done && router.push({ pathname: '/rituals/craft/meditation/log', params: listenLogParams(done.startedAt, done.ms) });

  return (
    <RitualScreen back="Meditation">
      <Title eyebrow="Meditation">Listen</Title>
      <Body muted>Binaural beats, noise, rain, fire, a drone, a drum or bowls, on their own: to rest, read, work or fall quiet to. The same layers you can play with a sit.</Body>

      <Card>
        <Body>Want a session that changes as it goes?</Body>
        <Button label="Binaural programs" variant="outline" onPress={() => router.push('/rituals/craft/meditation/programs')} />
      </Card>

      <Card>
        <Text style={styles.clock} accessibilityLabel={run ? (state.leftMs !== null ? `${clockLabel(state.leftMs)} left` : `${clockLabel(elapsed)} so far`) : 'Not playing'}>
          {run ? clockLabel(state.leftMs ?? elapsed) : timerLabel(minutes)}
        </Text>
        <Body muted>{run ? (paused ? 'Paused' : stopping ? 'Fading out' : mixLine(mix)) : mixOn(mix) ? mixLine(mix) : 'Choose at least one layer below.'}</Body>
        <View style={styles.actions}>
          {(!run || paused) && <Button label={paused ? 'Play on' : 'Play'} onPress={play} disabled={!mixOn(mix)} />}
          {run && !paused && !stopping && <Button label="Pause" variant="outline" onPress={pause} />}
          {run && !stopping && <Button label="Stop" variant="outline" onPress={stop} />}
        </View>
        {done && (
          <View style={ui.gapSmall}>
            <Body>{`You listened for ${clockLabel(done.ms)}.`}</Body>
            <Button label="Keep it in your log" variant="outline" onPress={keep} />
          </View>
        )}
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Stop after</SectionLabel>
        <Chips label="Stop after">
          {LISTEN_TIMERS.map((m) => (
            <Chip key={String(m)} label={timerLabel(m)} selected={minutes === m} onPress={() => setMinutes(m)} />
          ))}
        </Chips>
        <Body muted>It fades in as it begins and out as it ends. The binaural slow descent spans the time you choose, or 30 minutes if it plays until you stop it.{run ? ' A new time applies when you next press Play.' : ''}</Body>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Your mix</SectionLabel>
        <Card>
          <SoundForm mix={mix} onChange={setMix} />
        </Card>
        <Body muted>Kept on this device for next time, and you can use it for a sit too (Meditation → Sound → Use my last Listen mix). Binaural layers come with soft pink noise under them unless you choose another noise.</Body>
      </View>

      <Notice>{LISTEN_NOTE}</Notice>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  clock: { fontFamily: fonts.display, fontSize: 56, color: colors.cream, fontVariant: ['tabular-nums'], textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' },
});
