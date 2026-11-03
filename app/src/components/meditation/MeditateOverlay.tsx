// "Meditate here": a sit at your own altar, the altar left in view behind a
// small panel at the foot of the screen. Choose a length, and a candle to
// light as you begin if you like; the timer and its bells are the Meditation
// screen's own (SitTimer). When it's done, the sit can be logged, kept as
// sat at this altar.

import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { markTendForSit } from '../../lib/meditation/afterSit';
import { fromTimer } from '../../lib/meditation/log';
import { planParams, sitStateAt, startClock, type SitClock } from '../../lib/meditation/timer';
import { colors, fonts, radius } from '../../theme';
import { Button } from '../Button';
import { Chip, Chips } from '../rituals/ui';
import { PlanForm, useLastPlan } from './PlanForm';
import { SitTimer } from './SitTimer';

type Props = {
  visible: boolean;
  /** The candles on the altar that could be lit: their place in the altar and a name. */
  candles: { index: number; label: string }[];
  altarId: string | null;
  onLight: (index: number) => void;
  onClose: () => void;
};

export function MeditateOverlay({ visible, candles, altarId, onLight, onClose }: Props) {
  const [plan, setPlan] = useLastPlan();
  const [candle, setCandle] = useState<number | null>(null);
  const [clock, setClock] = useState<SitClock | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [done, setDone] = useState<{ at: string; minutes: number } | null>(null);
  if (!visible) return null;

  const close = () => {
    setClock(null);
    setEndedAt(null);
    setDone(null);
    onClose();
  };
  const finish = (sitMs: number) => {
    if (!clock || done) return;
    setDone(fromTimer(clock.startedAt, sitMs, plan));
    void markTendForSit(new Date());
  };
  const begin = () => {
    if (candle !== null) onLight(candle);
    setClock(startClock(Date.now()));
  };

  return (
    <View style={styles.panel} accessibilityViewIsModal>
      <Text style={styles.eyebrow}>Meditate here</Text>
      {done ? (
        <View style={styles.gap}>
          <Text style={styles.body}>{`${done.minutes} ${done.minutes === 1 ? 'minute' : 'minutes'} at your altar. Take a breath or two before you move.`}</Text>
          <Button
            label="Keep it in your log"
            onPress={() => {
              close();
              router.push({ pathname: '/rituals/craft/meditation/log', params: { at: done.at, minutes: String(done.minutes), timed: '1', kind: candle !== null ? 'candle' : 'devotional', ...(altarId ? { altar: altarId } : {}) } });
            }}
          />
          <Button label="Back to the altar" variant="text" onPress={close} />
        </View>
      ) : clock ? (
        <SitTimer
          compact
          plan={plan}
          clock={clock}
          onClock={setClock}
          endedAtMs={endedAt}
          onEnd={(ms) => (plan.minutes === null ? setEndedAt(ms) : finish(sitStateAt(plan, ms).sitMs))}
          onFinished={finish}
        />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.gap}>
          <PlanForm plan={plan} onChange={setPlan} brief />
          {candles.length > 0 && (
            <>
              <Text style={styles.body}>Light a candle as you begin</Text>
              <Chips>
                <Chip label="None" selected={candle === null} onPress={() => setCandle(null)} />
                {candles.map((c) => (
                  <Chip key={c.index} label={c.label} selected={candle === c.index} onPress={() => setCandle(c.index)} />
                ))}
              </Chips>
            </>
          )}
          <Button label="Begin" onPress={begin} />
          <Button label="More choices" variant="text" onPress={() => router.push({ pathname: '/rituals/craft/meditation', params: planParams(plan) })} />
          <Button label="Not now" variant="text" onPress={close} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    maxHeight: '62%',
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: 'rgba(12,21,16,0.86)',
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  scroll: { flexGrow: 0 },
  gap: { gap: 10 },
  eyebrow: { fontFamily: fonts.body, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold, textAlign: 'center' },
  body: { fontFamily: fonts.body, fontSize: 16, color: colors.cream },
});
