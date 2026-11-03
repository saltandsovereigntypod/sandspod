import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { SitTimer } from '../../../../../components/meditation/SitTimer';
import { Body, RitualScreen, Title, ui } from '../../../../../components/rituals/ui';
import { markTendForSit } from '../../../../../lib/meditation/afterSit';
import { fromTimer } from '../../../../../lib/meditation/log';
import { cleanPlan, planLine, sitStateAt, startClock, type SitClock } from '../../../../../lib/meditation/timer';

// A sit, timed: a calm countdown, its bells, and when it's done, a way to
// note how it went. The plan comes in the route's params (timer.ts planParams).
export default function SitScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const plan = useMemo(() => cleanPlan(params), [params]);
  const [clock, setClock] = useState<SitClock>(() => startClock(Date.now()));
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [done, setDone] = useState<{ at: string; minutes: number; marked: number } | null>(null);

  const finish = (sitMs: number) => {
    if (done) return;
    const sat = fromTimer(clock.startedAt, sitMs, plan);
    setDone({ ...sat, marked: 0 });
    void markTendForSit(new Date()).then((marked) => marked && setDone((d) => (d ? { ...d, marked } : d)));
  };
  const onEnd = (ms: number) => {
    // An open-ended sit comes back (if it has time to); a set one stops where it is.
    if (plan.minutes === null) setEndedAt(ms);
    else finish(sitStateAt(plan, ms).sitMs);
  };

  return (
    <RitualScreen back="Meditation">
      <Title eyebrow="Meditation">{done ? 'Your sit' : 'Sit'}</Title>
      {!done ? (
        <>
          <Body muted>{planLine(plan)}</Body>
          <SitTimer plan={plan} clock={clock} onClock={setClock} endedAtMs={endedAt} onEnd={onEnd} onFinished={finish} />
          <Body muted>Let the screen dim if it likes; the time keeps, and the end bell finds you if the app is put away.</Body>
        </>
      ) : (
        <View style={ui.gap}>
          <Body>{`${done.minutes} ${done.minutes === 1 ? 'minute' : 'minutes'}. Take a breath or two before you get up.`}</Body>
          {done.marked > 0 && <Body muted>{`Marked done on your To tend list: ${done.marked === 1 ? 'one thing' : `${done.marked} things`} you asked to count your meditations.`}</Body>}
          <Button label="Keep it in your log" onPress={() => router.replace({ pathname: '/rituals/craft/meditation/log', params: { at: done.at, minutes: String(done.minutes), timed: '1' } })} />
          <Button label="Leave it unlogged" variant="text" onPress={() => router.back()} />
        </View>
      )}
    </RitualScreen>
  );
}
