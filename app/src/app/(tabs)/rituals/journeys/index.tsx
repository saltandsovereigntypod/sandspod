import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { journeyHref } from '../../../../components/journeys/parts';
import { Body, Card, Expander, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { deityGroups, journeyById, JOURNEYS, pathsMineFirst, searchJourneys, type Journey } from '../../../../lib/journeys';
import { journeyStatus, nextStep, nextStepLine } from '../../../../lib/journeys/progress';
import { useCadence, useJourneyProgress } from '../../../../lib/journeys/store';
import { myPath, pathName } from '../../../../lib/library/traditions';
import { useMySettings } from '../../../../lib/settings/store';

// Dedication journeys: yours in progress, then every path and deity, My path first.
export default function JourneysHome() {
  const { settings } = useMySettings();
  const { entries } = useJourneyProgress();
  const cadence = useCadence();
  const [query, setQuery] = useState('');
  const now = new Date();
  const mine = myPath(settings).traditions;

  const going = useMemo(() => {
    const seen = new Set<string>();
    return entries.filter((e) => {
      if (seen.has(e.data.journeyId) || journeyStatus(e.data) === 'stopped' || !journeyById(e.data.journeyId)) return false;
      seen.add(e.data.journeyId);
      return true;
    });
  }, [entries]);

  const found = useMemo(() => (query.trim() ? searchJourneys(query) : JOURNEYS), [query]);
  const paths = pathsMineFirst(mine, found);
  const groups = deityGroups(mine, found);
  const startedIds = new Set(going.map((e) => e.data.journeyId));

  const row = (j: Journey, i: number, all: Journey[]) => (
    <Row
      key={j.id}
      icon={j.kind === 'path' ? 'wheel' : 'altar'}
      title={j.title}
      detail={startedIds.has(j.id) ? `Under way · ${j.summary}` : j.summary}
      last={i === all.length - 1}
      onPress={() => router.push(journeyHref(j.id))}
    />
  );

  return (
    <RitualScreen back="Rituals">
      <Title eyebrow="Study · practice · discernment · rite">Dedication journeys</Title>
      <Body>
        A dedication is a promise you make yourself, to a path or to a god, after a season of learning and practice. It isn’t an
        initiation: in most traditions initiation is given by a coven, lineage or teacher, and nothing here stands in for that.
      </Body>
      <Body muted>Go at your own pace. Pause whenever you need; a journey waits for you, and nothing is ever failed.</Body>

      {going.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Your journeys</SectionLabel>
          <List>
            {going.map((e, i) => {
              const j = journeyById(e.data.journeyId)!;
              return (
                <Row
                  key={e.id}
                  icon="calendar"
                  title={j.title}
                  detail={nextStepLine(nextStep(j, e.data, now, cadence))}
                  last={i === going.length - 1}
                  onPress={() => router.push(journeyHref(j.id))}
                />
              );
            })}
          </List>
        </View>
      )}

      <List>
        <Row
          title="A Year and a Day"
          detail="Practising alone? Thirteen moons of lessons and practice, ending in your path’s dedication rite"
          icon="calendar"
          onPress={() => router.push('/rituals/year')}
        />
        <Row
          title="Patron deities"
          detail="What a patron is, how to know if one is calling you, and how to answer"
          icon="grimoire"
          last
          onPress={() => router.push('/rituals/journeys/patron')}
        />
      </List>

      <Field label="Search journeys" value={query} onChange={setQuery} placeholder="A path or a god: Norse, Hekate, hearth…" />

      {paths.length === 0 && groups.length === 0 && (
        <Card>
          <Body>No journey matches that yet. More are being written.</Body>
        </Card>
      )}

      {paths.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Paths</SectionLabel>
          <List>{paths.map(row)}</List>
        </View>
      )}

      {groups.length > 0 && (
        <View style={ui.gap}>
          <SectionLabel>Deities</SectionLabel>
          {groups.map((g, gi) =>
            mine.includes(g.path) || query.trim() || gi === 0 ? (
              <View key={g.path} style={ui.gapSmall}>
                <SectionLabel>{`${pathName(g.path)}${mine.includes(g.path) ? ' · your path' : ''}`}</SectionLabel>
                <List>{g.journeys.map(row)}</List>
              </View>
            ) : (
              <Expander key={g.path} title={`${pathName(g.path)} (${g.journeys.length})`}>
                <List>{g.journeys.map(row)}</List>
              </Expander>
            ),
          )}
        </View>
      )}

      {!mine.length && (
        <Body muted>Choose your path in Settings → Living Library → My path to put its journeys first.</Body>
      )}
    </RitualScreen>
  );
}
