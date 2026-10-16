import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import {
  discernHref,
  everyWords,
  lengthWords,
  lessonHref,
  ongoingHref,
  Paragraphs,
  practiceHref,
  ProgressBar,
  riteHref,
  STAGE_WORDS,
} from '../../../../../../components/journeys/parts';
import { Body, Card, confirmAction, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { relativeDay } from '../../../../../../lib/calendar';
import {
  advanceStage,
  goToStage,
  journeyStatus,
  practiceState,
  stageCompletion,
  stageIndex,
  stagePace,
} from '../../../../../../lib/journeys/progress';
import { startJourney, useCadence, useJourney } from '../../../../../../lib/journeys/store';

export default function StageView() {
  const { journeyId, stage: raw } = useLocalSearchParams<{ journeyId: string; stage: string }>();
  const { journey, progress, change } = useJourney(journeyId);
  const cadence = useCadence();
  const now = new Date();
  const index = Number(raw);
  const stage = journey?.stages[index];

  if (!journey || !stage) {
    return (
      <RitualScreen back="Journey">
        <Title>Not found</Title>
        <Body>This stage isn’t here any more.</Body>
      </RitualScreen>
    );
  }

  const going = progress && journeyStatus(progress) !== 'stopped' ? progress : null;
  const current = going ? stageIndex(journey, going) === index : false;
  const completion = going ? stageCompletion(journey, going, index) : null;
  const pace = going && current ? stagePace(journey, going, now) : null;
  const next = journey.stages[index + 1] ?? null;

  const moveOn = async () => {
    if (!completion?.complete) {
      const ok = await confirmAction(
        `Move on to ${next?.title ?? 'the next stage'}?`,
        'You don’t have to finish everything first. What you’ve done stays, and you can come back to this stage any time.',
        'Move on',
      );
      if (!ok) return;
    }
    await change((p) => advanceStage(journey, p, new Date()));
    if (next) router.replace({ pathname: '/rituals/journeys/stage/[journeyId]/[stage]', params: { journeyId: journey.id, stage: String(index + 1) } });
  };

  const makeCurrent = async () => {
    const ok = await confirmAction(
      `Make “${stage.title}” your stage now?`,
      'Nothing you’ve done is lost. The days for this stage start from today.',
      'Make it my stage',
    );
    if (ok) await change((p) => goToStage(journey, p, index, new Date()));
  };

  return (
    <RitualScreen back={journey.title}>
      <Title eyebrow={`Stage ${index + 1} of ${journey.stages.length} · ${STAGE_WORDS[stage.kind]} · ${lengthWords(stage.days)}`}>{stage.title}</Title>
      <Paragraphs text={stage.intro} />

      {pace && stage.kind !== 'ongoing' && (
        <Body muted>{pace.over ? `Day ${pace.day}. No hurry: the length was only a suggestion.` : `Day ${pace.day} of ${lengthWords(pace.suggested)}`}</Body>
      )}
      {completion && <ProgressBar fraction={completion.fraction} label={`${stage.title}: progress`} />}

      {!going && (
        <Card accent>
          <Body>You can read everything here. Begin the journey to keep your place, tick off practices and mark lessons read.</Body>
          <Button label="Begin this journey" onPress={() => startJourney(journey.id)} />
        </Card>
      )}

      {stage.lessons.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>{`Lessons${completion ? ` · ${completion.lessonsRead} of ${completion.lessonsTotal} read` : ''}`}</SectionLabel>
          <List>
            {stage.lessons.map((l, i) => {
              const read = going?.lessonsRead[l.id];
              return (
                <Row
                  key={l.id}
                  icon="grimoire"
                  title={l.title}
                  detail={`${read ? 'Read · ' : ''}about ${l.minutes} min · ${l.summary}`}
                  label={`${l.title}. ${read ? 'Read.' : 'Not read yet.'} About ${l.minutes} minutes. ${l.summary}`}
                  last={i === stage.lessons.length - 1}
                  onPress={() => router.push(lessonHref(journey.id, l.id))}
                />
              );
            })}
          </List>
        </View>
      )}

      {stage.practices.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Practices</SectionLabel>
          <List>
            {stage.practices.map((pr, i) => {
              const s = going ? practiceState(pr, journey, going, now, cadence) : null;
              const when = s?.done
                ? 'done'
                : s?.due
                  ? 'good to do today'
                  : s?.nextAt
                    ? `next ${s.nextName ? `${s.nextName}, ` : ''}${relativeDay(now, s.nextAt)}`
                    : everyWords(pr.every);
              return (
                <Row
                  key={pr.id}
                  icon="altar"
                  title={pr.title}
                  detail={`${s ? `${Math.min(s.count, s.times)} of ${s.times}` : pr.times === 1 ? 'Once' : `${pr.times} times`} · ${when}`}
                  last={i === stage.practices.length - 1}
                  onPress={() => router.push(practiceHref(journey.id, pr.id))}
                />
              );
            })}
          </List>
        </View>
      )}

      {(stage.rite || stage.kind === 'discernment' || stage.kind === 'ongoing') && (
        <List>
          {stage.rite && (
            <Row
              icon="rituals"
              title={stage.rite.title}
              detail={`${completion?.riteDone ? 'Done · ' : ''}${stage.rite.summary}`}
              last={stage.kind !== 'discernment' && stage.kind !== 'ongoing'}
              onPress={() => router.push(riteHref(journey.id, index))}
            />
          )}
          {stage.kind === 'discernment' && (
            <Row
              icon="grimoire"
              title="Discern"
              detail={going?.decision ? 'Your choice is made' : 'The honest questions, and your choice'}
              last
              onPress={() => router.push(discernHref(journey.id))}
            />
          )}
          {stage.kind === 'ongoing' && (
            <Row icon="calendar" title="Holy days and rededication" detail="What’s coming up, and your yearly renewal" last onPress={() => router.push(ongoingHref(journey.id))} />
          )}
        </List>
      )}

      {going && current && next && stage.kind !== 'discernment' && (
        <View style={ui.actions}>
          {completion?.complete ? (
            <Card accent>
              <Body>{`Everything in this stage is done. When you’re ready: ${next.title}.`}</Body>
              <Button label={`Move on to ${next.title}`} onPress={moveOn} />
            </Card>
          ) : (
            <Button label={`Move on to ${next.title} when you’re ready`} variant="outline" onPress={moveOn} />
          )}
        </View>
      )}

      {going && !current && <Button label="Make this my current stage" variant="text" onPress={makeCurrent} />}
    </RitualScreen>
  );
}
