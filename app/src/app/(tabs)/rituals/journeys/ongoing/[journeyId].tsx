import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { everyWords, Paragraphs, practiceHref, riteHref, stageIndexOf } from '../../../../../components/journeys/parts';
import { Body, Card, confirmAction, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { fullDate, relativeDay, shortDate } from '../../../../../lib/calendar';
import { holyDaysBetween, journeyStatus, practiceState, rededicate, rededication } from '../../../../../lib/journeys/progress';
import { useCadence, useJourney } from '../../../../../lib/journeys/store';
import { type } from '../../../../../theme';

// The year after: the holy days coming round, the ongoing practices, and the yearly rededication.
export default function Ongoing() {
  const { journeyId } = useLocalSearchParams<{ journeyId: string }>();
  const { journey, progress, change } = useJourney(journeyId);
  const cadence = useCadence();
  const now = new Date();

  const holyDays = journey
    ? holyDaysBetween(journey, now, new Date(now.getTime() + 366 * 86_400_000), cadence.choice, cadence.hidden).slice(0, 12)
    : [];

  const at = journey ? stageIndexOf(journey, 'ongoing') : -1;
  const stage = journey && at >= 0 ? journey.stages[at] : null;
  if (!journey || !stage) {
    return (
      <RitualScreen back="Journey">
        <Title>Not found</Title>
        <Body>This journey isn’t here any more.</Body>
      </RitualScreen>
    );
  }

  const going = progress && journeyStatus(progress) !== 'stopped' ? progress : null;
  const re = going ? rededication(going, now) : null;
  const dedicationAt = stageIndexOf(journey, 'dedication');

  const markRededicated = async () => {
    const ok = await confirmAction('You’ve rededicated?', 'Today will be kept as your rededication, and the next comes round in a year.', 'Yes');
    if (ok) await change((p) => rededicate(p, new Date()));
  };

  return (
    <RitualScreen back={journey.title}>
      <Title eyebrow={`${journey.title} · The year after`}>{stage.title}</Title>
      <Paragraphs text={stage.intro} />

      <Card accent>
        <SectionLabel>Rededication</SectionLabel>
        {re ? (
          <>
            <Text style={type.cardTitle}>
              {re.due ? 'A year has turned: time to rededicate' : re.soon ? `Your rededication comes ${relativeDay(now, re.nextAt)}` : `Next rededication: ${fullDate(re.nextAt)}`}
            </Text>
            <Body muted>
              {`Dedicated on ${fullDate(going!.dedicatedAt!)}${re.count ? ` · rededicated ${re.count} ${re.count === 1 ? 'time' : 'times'}, last on ${fullDate(re.lastAt)}` : ''}.`}
            </Body>
            <Body>
              Many keep the anniversary by renewing the promise: the dedication rite again, or simple words at the shrine. If it no longer fits,
              letting it go with thanks is honest too.
            </Body>
            {dedicationAt >= 0 && journey.stages[dedicationAt].rite && (
              <Button label="Read the dedication rite again" variant={re.due ? 'primary' : 'outline'} onPress={() => router.push(riteHref(journey.id, dedicationAt))} />
            )}
            <Button label="I’ve rededicated" variant="outline" onPress={markRededicated} />
          </>
        ) : (
          <Body>After your dedication, a rededication comes round each year. You’ll see it here.</Body>
        )}
      </Card>

      {holyDays.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Holy days coming up</SectionLabel>
          <Card>
            {holyDays.map((h) => (
              <View key={h.id} accessible accessibilityLabel={`${h.name}, ${relativeDay(now, h.date)}. ${h.meaning}`}>
                <Text style={type.cardTitle}>{h.name}</Text>
                <Body muted>{`${relativeDay(now, h.date) === shortDate(h.date) ? shortDate(h.date) : `${relativeDay(now, h.date)} · ${shortDate(h.date)}`} · ${h.meaning}`}</Body>
              </View>
            ))}
          </Card>
        </View>
      )}

      {stage.practices.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Keeping it</SectionLabel>
          <List>
            {stage.practices.map((pr, i) => {
              const s = going ? practiceState(pr, journey, going, now, cadence) : null;
              return (
                <Row
                  key={pr.id}
                  icon="altar"
                  title={pr.title}
                  detail={`${s ? `${Math.min(s.count, s.times)} of ${s.times} · ` : ''}${s?.due ? 'good to do today' : everyWords(pr.every)}`}
                  last={i === stage.practices.length - 1}
                  onPress={() => router.push(practiceHref(journey.id, pr.id))}
                />
              );
            })}
          </List>
        </View>
      )}

      {stage.lessons.length > 0 && (
        <Body muted>{`There ${stage.lessons.length === 1 ? 'is a lesson' : `are ${stage.lessons.length} lessons`} for this year in the stage itself.`}</Body>
      )}
    </RitualScreen>
  );
}
