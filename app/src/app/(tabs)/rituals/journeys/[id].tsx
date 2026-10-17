import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import {
  journeyStyles,
  lengthWords,
  ongoingHref,
  Paragraphs,
  ProgressBar,
  STAGE_WORDS,
  stageHref,
  StepCard,
} from '../../../../components/journeys/parts';
import { Body, Card, confirmAction, Expander, List, RitualScreen, Row, SectionLabel, Title, tell, ui } from '../../../../components/rituals/ui';
import { shortDate } from '../../../../lib/calendar';
import {
  currentStage,
  holyDaysBetween,
  journeyStatus,
  nextStep,
  pauseJourney,
  resumeJourney,
  stageCompletion,
  stagePace,
  suggestedDays,
} from '../../../../lib/journeys/progress';
import { startJourney, useCadence, useJourney } from '../../../../lib/journeys/store';
import { ritualsLibraryHref } from '../../../../lib/library';
import { pathName } from '../../../../lib/library/traditions';
import { type } from '../../../../theme';

export default function JourneyOverview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { journey, progress, change } = useJourney(id);
  const cadence = useCadence();
  const [busy, setBusy] = useState(false);
  const now = new Date();

  const seenDays = new Set<string>();
  const holyDays = journey
    ? holyDaysBetween(journey, now, new Date(now.getTime() + 380 * 86_400_000), cadence.choice, cadence.hidden).filter((h) => {
        if (seenDays.has(h.name)) return false;
        seenDays.add(h.name);
        return true;
      })
    : [];

  if (!journey) {
    return (
      <RitualScreen back="Dedication journeys">
        <Title>Not found</Title>
        <Body>This journey isn’t here any more.</Body>
      </RitualScreen>
    );
  }

  const status = progress ? journeyStatus(progress) : null;
  const going = progress && status !== 'stopped' ? progress : null;
  const here = going ? currentStage(journey, going) : null;
  const pace = going ? stagePace(journey, going, now) : null;
  const step = going ? nextStep(journey, going, now, cadence) : null;
  const total = suggestedDays(journey);

  const begin = async () => {
    setBusy(true);
    try {
      await startJourney(journey.id);
    } catch (e) {
      tell("Couldn't begin", e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const pause = async () => {
    const ok = await confirmAction('Pause this journey?', 'It will wait for you, just as it is. Pick it up again whenever you like.', 'Pause');
    if (ok) await change((p) => pauseJourney(p, new Date()));
  };

  return (
    <RitualScreen back="Dedication journeys">
      <Title eyebrow={`${journey.kind === 'path' ? 'Path' : 'Deity'} · ${journey.paths.map(pathName).join(' · ')}`}>{journey.title}</Title>
      <Body>{journey.summary}</Body>

      {going && step && here && pace ? (
        <>
          <StepCard journey={journey} step={step} />
          <Card>
            <SectionLabel>{`Stage ${here.index + 1} of ${journey.stages.length} · ${STAGE_WORDS[here.stage.kind]}`}</SectionLabel>
            <Text style={type.cardTitle}>{here.stage.title}</Text>
            {status !== 'paused' && here.stage.kind !== 'ongoing' && (
              <Body muted>
                {pace.over
                  ? `Day ${pace.day}. The suggestion was ${lengthWords(pace.suggested)}; take all the time it needs.`
                  : `Day ${pace.day} of ${lengthWords(pace.suggested)}`}
              </Body>
            )}
            <ProgressBar fraction={stageCompletion(journey, going, here.index).fraction} label={`${here.stage.title}: progress`} />
            <Button label="Open this stage" variant="outline" onPress={() => router.push(stageHref(journey.id, here.index))} />
            {going.dedicatedAt && (
              <Button label="Holy days and rededication" variant="outline" onPress={() => router.push(ongoingHref(journey.id))} />
            )}
            {status === 'paused' ? (
              <Button label="Pick it up again" onPress={() => change((p) => resumeJourney(p, new Date()))} />
            ) : (
              <Button label="Pause for now" variant="text" onPress={pause} />
            )}
          </Card>
        </>
      ) : (
        <Card accent>
          <SectionLabel>{status === 'stopped' ? 'Set down with grace' : 'Before you begin'}</SectionLabel>
          {status === 'stopped' && progress?.decision ? (
            <Body>{`You set this journey down on ${shortDate(new Date(progress.decision.at))}. That was a real choice, and a good one to have made honestly. You can begin again any time.`}</Body>
          ) : (
            <Paragraphs text={journey.welcome} />
          )}
          <Body muted>{`Six stages, about ${total} days in all, then a year of keeping it. Pause whenever you need.`}</Body>
          <Button label={busy ? 'Beginning…' : status === 'stopped' ? 'Begin again' : 'Begin this journey'} disabled={busy} onPress={begin} />
        </Card>
      )}

      <View style={ui.gap}>
        <SectionLabel>About</SectionLabel>
        <Paragraphs text={journey.about} />
        {journey.deityRef && (
          <Button
            label="Open in the Living Library"
            variant="text"
            onPress={() => router.push(ritualsLibraryHref({ id: journey.deityRef!.replace(/\//g, ':') }))}
          />
        )}
      </View>

      {journey.notes.length > 0 && (
        <Card accent>
          <SectionLabel>Things to know first</SectionLabel>
          {journey.notes.map((note, i) => (
            <Text key={i} style={journeyStyles.bullet}>{`• ${note}`}</Text>
          ))}
        </Card>
      )}

      {holyDays.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Holy days</SectionLabel>
          <Card>
            {holyDays.map((h) => (
              <View key={h.id} accessible accessibilityLabel={`${h.name}, ${shortDate(h.date)}. ${h.meaning}`}>
                <Text style={type.cardTitle}>{h.name}</Text>
                <Body muted>{`${shortDate(h.date)}${h.days > 1 ? ` · ${h.days} days` : ''} · ${h.meaning}`}</Body>
              </View>
            ))}
          </Card>
        </View>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>The six stages</SectionLabel>
        <List>
          {journey.stages.map((s, i) => {
            const done = going ? going.stageDoneAt[s.kind] : null;
            const current = here?.index === i;
            const state = current ? ' · you are here' : done ? ' · done' : '';
            return (
              <Row
                key={s.kind}
                icon={current ? 'calendar' : 'rituals'}
                title={`${i + 1}. ${s.title}`}
                detail={`${STAGE_WORDS[s.kind]} · ${lengthWords(s.days)}${state}`}
                last={i === journey.stages.length - 1}
                onPress={() => router.push(stageHref(journey.id, i))}
              />
            );
          })}
        </List>
      </View>

      {journey.sources.length > 0 && (
        <Expander title="Sources">
          {journey.sources.map((s, i) => (
            <Text key={i} style={journeyStyles.bullet}>{`• ${s}`}</Text>
          ))}
        </Expander>
      )}
    </RitualScreen>
  );
}
