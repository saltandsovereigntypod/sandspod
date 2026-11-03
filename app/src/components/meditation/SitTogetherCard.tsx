// A sit together, on the ritual together's page: everyone's timer starts at
// the shared moment (meditation/together.ts), counts the same, and rings its
// bells for each person where they are. When it's done, each may log it.

import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text } from 'react-native';

import { markTendForSit } from '../../lib/meditation/afterSit';
import { fromTimer } from '../../lib/meditation/log';
import { mixLine, sharedMix } from '../../lib/meditation/sound';
import { clockLabel, planLine, sitStateAt } from '../../lib/meditation/timer';
import { sharedClock, sitTogetherOf, startLine } from '../../lib/meditation/together';
import type { LiveRitual } from '../../lib/together/live';
import { type } from '../../theme';
import { Button } from '../Button';
import { Card } from '../more/ui';
import { SitTimer } from './SitTimer';

export function SitTogetherCard({ live }: { live: LiveRitual }) {
  const sit = useMemo(() => sitTogetherOf(live), [live]);
  const [now, setNow] = useState(() => Date.now());
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [done, setDone] = useState<{ at: string; minutes: number } | null>(null);
  const marked = useRef(false);
  const waiting = !!sit?.startAt && sit.startAt > now;
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [waiting]);
  if (!sit) return null;
  const { plan, startAt } = sit;
  const sound = sharedMix(sit.sound);

  const finish = (sitMs: number) => {
    if (done || startAt === null) return;
    setDone(fromTimer(startAt, sitMs, plan));
    if (!marked.current) {
      marked.current = true;
      void markTendForSit(new Date());
    }
  };

  return (
    <Card tone="gold">
      <Text style={type.eyebrow}>Sit together</Text>
      <Text style={type.body}>{[planLine(plan), sound ? mixLine(sound) : ''].filter(Boolean).join(' · ')}</Text>
      <Text style={type.caption}>{startLine(startAt, now)}</Text>
      {done ? (
        <>
          <Text style={type.body}>{`${done.minutes} ${done.minutes === 1 ? 'minute' : 'minutes'}, sat together.`}</Text>
          <Button label="Keep it in your log" onPress={() => router.push({ pathname: '/rituals/craft/meditation/log', params: { at: done.at, minutes: String(done.minutes), timed: '1', together: live.id } })} />
        </>
      ) : startAt === null ? null : waiting ? (
        <Text style={type.cardTitle}>{`Beginning in ${clockLabel(startAt - now)}`}</Text>
      ) : (
        <SitTimer shared sound={sound} plan={plan} clock={sharedClock(startAt)} endedAtMs={endedAt} onEnd={(ms) => (plan.minutes === null ? setEndedAt(ms) : finish(sitStateAt(plan, ms).sitMs))} onFinished={finish} />
      )}
    </Card>
  );
}
