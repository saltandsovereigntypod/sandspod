import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Body, Card, RitualScreen, Title, confirmAction, tell, ui } from '../../../components/rituals/ui';
import {
  completeStep,
  currentStep,
  formatClock,
  pauseSession,
  resumeSession,
  sessionElapsed,
  skipStep,
  stepElapsed,
  timedStepDue,
} from '../../../lib/rituals/lifecycle';
import { finishActive, updateActive, useRituals } from '../../../lib/rituals/store';
import { colors, fonts, radius, type } from '../../../theme';

function useClock(running: boolean): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [running]);
  return now;
}

export default function RunRitual() {
  const rituals = useRituals();
  const session = rituals.active;
  const now = useClock(session?.status === 'active');
  const [finishing, setFinishing] = useState(false);

  // Timed steps move on by themselves, as at the website's altar.
  useEffect(() => {
    if (session && timedStepDue(session, now)) void updateActive((s) => completeStep(s, new Date()));
  }, [session, now]);

  if (!session) {
    return (
      <RitualScreen back="Rituals">
        <Title>No ritual under way</Title>
        <Body>Begin one from a template, a spell, or a working of your own.</Body>
        <Button label="Begin a ritual" onPress={() => router.replace('/rituals/templates')} />
      </RitualScreen>
    );
  }

  const steps = session.session_steps;
  const step = currentStep(session);
  const index = step ? steps.findIndex((s) => s.id === step.id) : steps.length;
  const paused = session.status === 'paused';
  const elapsed = step ? stepElapsed(step, session, now) : 0;
  const duration = Number(step?.duration_seconds || 0);
  const stepClock = duration > 0 ? formatClock(Math.max(0, duration - elapsed)) : formatClock(elapsed);
  const last = !!step && index === steps.length - 1;

  const finish = async (status: 'completed' | 'abandoned') => {
    if (status === 'abandoned') {
      const ok = await confirmAction('End without saving?', 'The ritual is closed and nothing is added to your journal.', 'End it');
      if (!ok) return;
    }
    setFinishing(true);
    try {
      const done = await finishActive(status);
      if (status === 'completed' && done) router.replace({ pathname: '/rituals/journal/new', params: { sessionId: done.id } });
      else router.replace('/rituals');
    } catch (e) {
      // Saved on the phone already; it is sent to the account on the next refresh.
      tell('Saved on this phone', e instanceof Error ? `${e.message}. It will sync when you're back online.` : 'It will sync when you are back online.');
      router.replace('/rituals');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <RitualScreen back="Rituals">
      <View style={styles.head}>
        <Text style={type.eyebrow}>{paused ? 'Paused' : 'Under way'}</Text>
        <Text accessibilityRole="header" style={type.title}>
          {session.title || 'Your ritual'}
        </Text>
        <Text style={type.caption} accessibilityLabel={`Ritual time ${formatClock(sessionElapsed(session, now))}`}>
          {formatClock(sessionElapsed(session, now))}
        </Text>
      </View>

      {steps.length > 0 && step ? (
        <Card accent>
          <Text style={[type.eyebrow, ui.gold]}>{`Step ${index + 1} of ${steps.length}`}</Text>
          <Text accessibilityRole="header" style={type.cardTitle}>
            {step.title}
          </Text>
          {!!step.instructions && <Body>{step.instructions}</Body>}
          {!!step.spoken_text && (
            <View style={styles.words} accessible accessibilityLabel={`Words to speak: ${step.spoken_text}`}>
              <Text style={styles.wordsText}>{step.spoken_text}</Text>
            </View>
          )}
          <Text
            style={styles.clock}
            accessibilityLabel={duration > 0 ? `${stepClock} left on this step` : `${stepClock} on this step`}
          >
            {stepClock}
          </Text>
          {duration > 0 && step.completion_mode === 'timed' && <Body muted>Moves on by itself when the timer ends.</Body>}
          <View style={ui.actions}>
            <Button
              label={last ? 'Complete the last step' : 'Complete step'}
              disabled={paused}
              onPress={() => void updateActive((s) => completeStep(s, new Date()))}
            />
            <Button label="Skip this step" variant="outline" disabled={paused} onPress={() => void updateActive((s) => skipStep(s, new Date()))} />
          </View>
        </Card>
      ) : (
        <Card accent>
          <Text style={type.cardTitle}>{steps.length ? 'Every step is done' : 'Take the time you need'}</Text>
          <Body>{steps.length ? 'Close the circle and write down what happened while it is fresh.' : 'When the working is done, finish and journal it.'}</Body>
          <Button label={finishing ? 'Finishing…' : 'Finish and journal'} disabled={finishing} onPress={() => finish('completed')} />
        </Card>
      )}

      {steps.length > 0 && (
        <View style={styles.progress} accessibilityLabel={`${steps.filter((s) => s.status === 'completed').length} of ${steps.length} steps done`}>
          {steps.map((s) => (
            <View key={s.id} style={styles.progressRow}>
              <View
                style={[
                  styles.dot,
                  s.status === 'completed' && styles.dotDone,
                  s.status === 'active' && styles.dotNow,
                  s.status === 'skipped' && styles.dotSkipped,
                ]}
              />
              <Text style={[type.caption, s.status === 'active' && styles.nowText]} numberOfLines={1}>
                {s.title}
                {s.status === 'skipped' ? ' · skipped' : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={ui.actions}>
        <Button
          label={paused ? 'Resume' : 'Pause'}
          variant="outline"
          onPress={() => void updateActive((s) => (s.status === 'paused' ? resumeSession(s, new Date()) : pauseSession(s, new Date())))}
        />
        {step && <Button label="Finish now and journal" variant="outline" disabled={finishing} onPress={() => finish('completed')} />}
        <Button label="End without saving" variant="text" disabled={finishing} onPress={() => finish('abandoned')} />
      </View>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  head: { gap: 4 },
  words: { backgroundColor: colors.night, borderRadius: radius.tile, padding: 16, borderLeftWidth: 2, borderLeftColor: colors.gold },
  wordsText: { fontFamily: fonts.displayItalic, fontSize: 21, lineHeight: 28, color: colors.cream },
  clock: { fontFamily: fonts.display, fontSize: 40, color: colors.cream, textAlign: 'center' },
  progress: { gap: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: colors.muted },
  dotDone: { backgroundColor: colors.fern, borderColor: colors.fern },
  dotNow: { backgroundColor: colors.gold, borderColor: colors.gold },
  dotSkipped: { borderStyle: 'dashed' },
  nowText: { color: colors.cream },
});
