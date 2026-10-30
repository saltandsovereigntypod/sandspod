import { router } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { ComfortCard } from '../../../../components/cycle/parts';
import { Body, Card, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { dayKey, dayMonth, notePatterns, SEASON_NAMES, todayView } from '../../../../lib/cycle/model';
import { useCycle } from '../../../../lib/cycle/store';
import { comfortNow, HERB_SAFETY, INSIGHT_NOTE, insightProgress, redFlags, SEASON_COMFORT, SYMPTOM_NOT_MEDICAL, symptomInsights, symptomLine } from '../../../../lib/cycle/symptoms';
import { type } from '../../../../theme';

// Symptoms and insights: what the symptom notes show over the cycles and
// the moon's month (only once there's enough), gentle words when something
// is worth a doctor's eye, and folk, herbal and ritual comfort for what's
// been logged, each with its safety note. The website's twin is
// /rituals/cycle/?view=insights.
export default function CycleInsights() {
  const cycle = useCycle();
  const data = cycle.data;
  const now = new Date();
  const today = dayKey(now);
  const found = useMemo(() => (data ? { insights: symptomInsights(data), notes: notePatterns(data), flags: redFlags(data, new Date()) } : null), [data]);
  if (cycle.phase !== 'open' || !data || !found) {
    return (
      <RitualScreen back="Cycle & Moon">
        <Title>Symptoms and insights</Title>
        <Body>Open Cycle &amp; Moon first.</Body>
        <Button label="Open Cycle & Moon" onPress={() => router.replace('/rituals/cycle')} />
      </RitualScreen>
    );
  }
  const season = todayView(data, now).season;
  const comfort = comfortNow(data, today, season);
  const recent = data.notes.filter((n) => symptomLine(n)).slice(-7).reverse();
  return (
    <RitualScreen back="Cycle & Moon">
      <Title eyebrow="Cycle & Moon">Symptoms and insights</Title>
      <Button label="Log today’s symptoms" onPress={() => router.push({ pathname: '/rituals/cycle/log', params: { date: today } })} />

      {found.flags.length > 0 && (
        <Card accent>
          <Text style={[type.eyebrow, ui.gold]}>Worth a word with a doctor</Text>
          {found.flags.map((f) => (
            <Body key={f}>{f}</Body>
          ))}
        </Card>
      )}

      <SectionLabel>What your notes show</SectionLabel>
      <Card>
        {found.insights.length || found.notes.length ? (
          <>
            {found.insights.map((i) => (
              <View key={i.text} style={ui.gapSmall}>
                <Body>{i.text}</Body>
                <Text style={type.caption}>{`From ${i.basis}.`}</Text>
              </View>
            ))}
            {found.notes.map((line) => (
              <Body key={line}>{line}</Body>
            ))}
          </>
        ) : null}
        {!found.insights.length && <Body muted>{insightProgress(data)}</Body>}
        <Text style={type.caption}>{INSIGHT_NOTE}</Text>
      </Card>

      <SectionLabel>Comfort, the old ways</SectionLabel>
      <Body muted>
        {comfort.from === 'recent'
          ? 'For what you’ve logged in the last few days:'
          : comfort.from === 'season'
            ? `For what your ${SEASON_NAMES[season]} usually brings:`
            : 'Log a symptom and comfort for it will show here.'}
      </Body>
      {comfort.comforts.map((c) => (
        <ComfortCard key={c.title} comfort={c} />
      ))}
      <Card>
        <Body>{SEASON_COMFORT[season]}</Body>
      </Card>
      <Notice>{HERB_SAFETY}</Notice>

      {recent.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Recent days</SectionLabel>
          <List>
            {recent.map((n, i) => (
              <Row key={n.date} icon="grimoire" title={dayMonth(n.date)} detail={symptomLine(n)} last={i === recent.length - 1} onPress={() => router.push({ pathname: '/rituals/cycle/log', params: { date: n.date } })} />
            ))}
          </List>
        </View>
      )}
      <Notice>{SYMPTOM_NOT_MEDICAL}</Notice>
    </RitualScreen>
  );
}
