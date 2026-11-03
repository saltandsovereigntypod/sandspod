import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { SitGuide } from '../../../../../components/meditation/SitGuide';
import { SitTimer } from '../../../../../components/meditation/SitTimer';
import { useSteps } from '../../../../../components/meditation/steps';
import { Body, Chip, Chips, RitualScreen, Title, ui } from '../../../../../components/rituals/ui';
import { markTendForSit } from '../../../../../lib/meditation/afterSit';
import { cleanExtras, logParams } from '../../../../../lib/meditation/extras';
import { fromTimer, MOOD_WORDS } from '../../../../../lib/meditation/log';
import { scriptOf } from '../../../../../lib/meditation/scripts';
import { mixLine } from '../../../../../lib/meditation/sound';
import { cleanPlan, planLine, sitStateAt, startClock, type SitClock } from '../../../../../lib/meditation/timer';

// A sit, timed: a calm countdown, its bells, and with it, if chosen, written
// guidance a line at a time, something to rest your eyes on, sound layers
// and (walking) your steps. When it's done, how you feel now, and a way to
// note how it went. The plan comes in the route's params (timer.ts
// planParams), the rest as extras.ts says.
export default function SitScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const plan = useMemo(() => cleanPlan(params), [params]);
  const extras = useMemo(() => cleanExtras(params), [params]);
  const [clock, setClock] = useState<SitClock>(() => startClock(Date.now()));
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [done, setDone] = useState<{ at: string; minutes: number; marked: number; steps: number } | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const walking = extras.kind === 'walking';
  const steps = useSteps(walking && !done);
  const script = scriptOf(extras.script);

  const finish = (sitMs: number) => {
    if (done) return;
    const sat = fromTimer(clock.startedAt, sitMs, plan);
    setDone({ ...sat, marked: 0, steps: steps.steps });
    void markTendForSit(new Date()).then((marked) => marked && setDone((d) => (d ? { ...d, marked } : d)));
  };
  const onEnd = (ms: number) => {
    // An open-ended sit comes back (if it has time to); a set one stops where it is.
    if (plan.minutes === null) setEndedAt(ms);
    else finish(sitStateAt(plan, ms).sitMs);
  };

  return (
    <RitualScreen back="Meditation">
      <Title eyebrow="Meditation">{done ? 'Your sit' : (script?.title ?? 'Sit')}</Title>
      {!done ? (
        <>
          <Body muted>{[planLine(plan), extras.sound ? mixLine(extras.sound) : ''].filter(Boolean).join(' · ')}</Body>
          {!!extras.intention && <Body>{extras.intention}</Body>}
          <SitGuide plan={plan} clock={clock} endedAtMs={endedAt} script={extras.script} focus={extras.focus} sigilId={extras.sigil} />
          <SitTimer plan={plan} clock={clock} onClock={setClock} endedAtMs={endedAt} onEnd={onEnd} onFinished={finish} sound={extras.sound} compact={extras.focus !== 'none'} />
          {walking && <Body muted>{steps.available === false ? 'Step counting isn’t available here, so the walk is simply timed.' : `${steps.steps} ${steps.steps === 1 ? 'step' : 'steps'}`}</Body>}
          <Body muted>
            {extras.sound
              ? 'Let the screen dim if it likes. The sound stops if the app is put away, but the time keeps and the end bell finds you.'
              : 'Let the screen dim if it likes; the time keeps, and the end bell finds you if the app is put away.'}
          </Body>
        </>
      ) : (
        <View style={ui.gap}>
          <Body>{`${done.minutes} ${done.minutes === 1 ? 'minute' : 'minutes'}${done.steps ? `, ${done.steps} steps` : ''}. Take a breath or two before you get up.`}</Body>
          {done.marked > 0 && <Body muted>{`Marked done on your To tend list: ${done.marked === 1 ? 'one thing' : `${done.marked} things`} you asked to count your meditations.`}</Body>}
          <Body muted>How do you feel now?</Body>
          <Chips>
            {[1, 2, 3, 4, 5].map((n) => (
              <Chip key={n} label={String(n)} a11yLabel={`${n}, ${MOOD_WORDS[n]}`} selected={after === n} onPress={() => setAfter(after === n ? null : n)} />
            ))}
          </Chips>
          <Body muted>{after ? `${MOOD_WORDS[after]}${extras.before ? ` (before: ${MOOD_WORDS[extras.before]})` : ''}` : '1 low, 5 bright. Leave it if you’d rather not say.'}</Body>
          <Button label="Keep it in your log" onPress={() => router.replace({ pathname: '/rituals/craft/meditation/log', params: logParams(done, extras, { after, steps: done.steps }) })} />
          <Button label="Leave it unlogged" variant="text" onPress={() => router.back()} />
        </View>
      )}
    </RitualScreen>
  );
}
