import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { PlanForm, useLastPlan } from '../../../../../components/meditation/PlanForm';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { useCraft } from '../../../../../lib/craft/store';
import { kindLabel, normalizeSit, sitLine, SITS } from '../../../../../lib/meditation/log';
import { minutesWords, sitStats } from '../../../../../lib/meditation/patterns';
import { planLine, planParams } from '../../../../../lib/meditation/timer';

// Meditation (Craft → Meditation): choose a sit and begin, breath pacing,
// log a sit, your sits, and their patterns. Sits are craft entries
// (meditation.sits). Website: /practice/meditation/ (practice/meditation/).
const MEDITATION = '/rituals/craft/meditation';

export default function MeditationHome() {
  const [plan, setPlan] = useLastPlan();
  const { entries, ready } = useCraft<unknown>(SITS);
  const sits = useMemo(() => entries.map((e) => ({ id: e.id, data: normalizeSit(e.data) })).sort((a, b) => b.data.at.localeCompare(a.data.at)), [entries]);
  const stats = useMemo(() => sitStats(sits, new Date()), [sits]);
  const go = (href: string) => () => router.push(href as Href);

  return (
    <RitualScreen back="Craft">
      <Title eyebrow="Craft">Meditation</Title>
      <Body muted>A timer with gentle bells, breath pacing, and a log of your sits: how settled you felt and what came up. Private to you, and kept with your account when you’re signed in.</Body>

      {sits.length > 0 && (
        <Card>
          <Body>{[stats.streak.current > 1 ? `${stats.streak.current} days in a row` : null, `${minutesWords(stats.minutes.week)} this week`, `${minutesWords(stats.minutes.month)} this month`].filter(Boolean).join(' · ')}</Body>
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Sit</SectionLabel>
        <Card>
          <PlanForm plan={plan} onChange={setPlan} />
          <Body muted>{planLine(plan)}</Body>
          <Button label="Begin" onPress={() => router.push({ pathname: '/rituals/craft/meditation/sit', params: planParams(plan) })} />
        </Card>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>More ways in</SectionLabel>
        <List>
          <Row icon="wheel" title="Breath pacing" detail="A circle to breathe with: box breathing, 4-7-8 or your own count" onPress={go(`${MEDITATION}/breath`)} />
          <Row icon="rituals" title="Log a sit" detail="One you sat without the timer" onPress={go(`${MEDITATION}/log`)} />
          <Row icon="altar" title="Meditate at your altar" detail="Open an altar, then Workings → Meditate here" onPress={go('/altar')} />
          <Row icon="today" title="Sit together" detail="With your coven or friends: everyone’s timer starts at once" onPress={go('/rituals/together?sit=1')} />
          <Row icon="calendar" title="A daily reminder to sit" detail="In Reminders, under your practice" last onPress={go('/rituals/reminders')} />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Your sits</SectionLabel>
        {!ready ? (
          <Body muted>Opening…</Body>
        ) : sits.length === 0 ? (
          <Body muted>None yet. When you finish a sit, you can note how it went here.</Body>
        ) : (
          <List>
            {sits.slice(0, 30).map((s, i) => (
              <Row key={s.id} icon="today" title={kindLabel(s.data)} detail={`${sitLine(s.data)}${s.data.settled ? ` · settled ${s.data.settled} of 5` : ''}`} last={i === Math.min(sits.length, 30) - 1} onPress={go(`${MEDITATION}/log?id=${s.id}`)} />
            ))}
          </List>
        )}
        {sits.length > 0 && (
          <List>
            <Row icon="wheel" title="Your patterns" detail="Streaks, minutes, the kinds you come back to, and the moon, weekday and time of day" last onPress={go(`${MEDITATION}/patterns`)} />
          </List>
        )}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Elsewhere</SectionLabel>
        <List>
          <Row icon="today" title="To tend" detail="Turn on “Count my meditations” on a thing of your own, and each sit marks it done" onPress={go('/today/tend')} />
          <Row icon="grimoire" title="Your Grimoire" detail="Sits you keep there are under Meditation" onPress={go('/grimoire')} />
          <Row icon="wheel" title="Cycle & Moon" detail="The moon tonight" last onPress={go('/rituals/cycle')} />
        </List>
      </View>
    </RitualScreen>
  );
}
