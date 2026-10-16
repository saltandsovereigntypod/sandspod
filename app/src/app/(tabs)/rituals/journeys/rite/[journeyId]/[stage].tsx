import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { ongoingHref, Paragraphs, STAGE_WORDS } from '../../../../../../components/journeys/parts';
import { Body, Card, confirmAction, RitualScreen, SectionLabel, Title, tell, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import { enterOngoing, journeyStatus, riteBegun, riteDone, riteDraft } from '../../../../../../lib/journeys/progress';
import { startJourney, useJourney } from '../../../../../../lib/journeys/store';
import { startRitual, useRituals } from '../../../../../../lib/rituals/store';
import { colors, fonts, radius, type } from '../../../../../../theme';

// A stage's rite, to read through first and then begin as a guided ritual.
export default function RiteView() {
  const { journeyId, stage: raw } = useLocalSearchParams<{ journeyId: string; stage: string }>();
  const { journey, progress, change } = useJourney(journeyId);
  const rituals = useRituals();
  const [busy, setBusy] = useState(false);
  const stage = journey?.stages[Number(raw)];
  const rite = stage?.rite;

  if (!journey || !stage || !rite) {
    return (
      <RitualScreen back="Journey">
        <Title>Not found</Title>
        <Body>This rite isn’t here any more.</Body>
      </RitualScreen>
    );
  }

  const going = progress && journeyStatus(progress) !== 'stopped' ? progress : null;
  const sessionId = going?.riteSessions?.[stage.kind];
  const doneAt = going?.ritesDoneAt?.[stage.kind] ?? (stage.kind === 'dedication' ? going?.dedicatedAt : undefined);
  const underWay = !!rituals.active && rituals.active.id === sessionId;
  const otherRunning = !!rituals.active && !underWay;
  const isDedication = stage.kind === 'dedication';

  const begin = async () => {
    setBusy(true);
    try {
      const session = await startRitual({ kind: 'draft', draft: riteDraft(rite, journey) });
      await change((p) => riteBegun(p, stage.kind, session.id));
      router.push('/rituals/run');
    } catch (e) {
      tell("Couldn't begin", e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const markDone = async () => {
    const ok = await confirmAction(
      isDedication ? 'You’ve made your dedication?' : 'You’ve done this rite?',
      isDedication ? 'Today will be kept as the day of your dedication, and a year from now you’ll be invited to rededicate.' : 'It will be marked done for this stage.',
      'Yes, I’ve done it',
    );
    if (ok) await change((p) => riteDone(p, stage.kind, new Date()));
  };

  return (
    <RitualScreen back={stage.title}>
      <Title eyebrow={`${journey.title} · ${STAGE_WORDS[stage.kind]} · about ${rite.minutes} min`}>{rite.title}</Title>
      <Body>{rite.summary}</Body>

      {doneAt ? (
        <Card accent>
          <SectionLabel>{isDedication ? 'Dedicated' : 'Done'}</SectionLabel>
          <Body>
            {isDedication
              ? `You made your dedication on ${fullDate(doneAt)}. What comes now is the keeping of it: the holy days, the small daily things, and a rededication each year.`
              : `You did this rite on ${fullDate(doneAt)}.`}
          </Body>
          {isDedication && (
            <Button
              label="On to the year after"
              onPress={async () => {
                await change((p) => enterOngoing(journey, p, new Date()));
                router.replace(ongoingHref(journey.id));
              }}
            />
          )}
        </Card>
      ) : (
        <View style={ui.actions}>
          {underWay ? (
            <Button label="Continue the rite" onPress={() => router.push('/rituals/run')} />
          ) : (
            <Button label={busy ? 'Beginning…' : 'Begin the rite'} disabled={busy || otherRunning} onPress={begin} />
          )}
          {otherRunning && <Body muted>Finish the ritual that’s under way before beginning this one.</Body>}
          {going ? (
            <Button label="I’ve done it" variant="outline" accessibilityHint="Mark the rite done, if you did it in your own way" onPress={markDone} />
          ) : (
            <>
              <Body muted>Begin the journey to keep a record of this rite.</Body>
              <Button label="Begin this journey" variant="outline" onPress={() => startJourney(journey.id)} />
            </>
          )}
          {sessionId && !underWay && <Body muted>When you finish the guided rite, it’s marked done here by itself.</Body>}
        </View>
      )}

      {!!rite.safety && (
        <Card accent>
          <SectionLabel>Take care</SectionLabel>
          <Body>{rite.safety}</Body>
        </Card>
      )}

      <Card>
        <SectionLabel>You’ll need</SectionLabel>
        {rite.ingredients.length ? (
          rite.ingredients.map((item, i) => <Text key={i} style={styles.item}>{`• ${item.name}${item.optional ? ' (optional)' : ''}`}</Text>)
        ) : (
          <Body>Nothing but yourself.</Body>
        )}
        {!!rite.preparation && <Paragraphs text={rite.preparation} />}
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Steps</SectionLabel>
        {rite.steps.map((step, i) => (
          <View key={`${step.title}-${i}`} style={styles.step} accessible accessibilityLabel={`Step ${i + 1}: ${step.title}. ${step.instructions}${step.spoken ? ` Spoken: ${step.spoken}` : ''}`}>
            <Text style={styles.number}>{i + 1}</Text>
            <View style={styles.stepText}>
              <Text style={type.cardTitle}>{step.title}</Text>
              <Body>{step.instructions}</Body>
              {!!step.spoken && <Text style={styles.spoken}>{step.spoken}</Text>}
              {!!step.minutes && <Body muted>{`${step.minutes} min`}</Body>}
            </View>
          </View>
        ))}
      </View>

      <Card>
        <SectionLabel>Closing</SectionLabel>
        <Paragraphs text={rite.closing} />
      </Card>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  item: { ...type.body, color: colors.cream },
  step: { flexDirection: 'row', gap: 14, backgroundColor: colors.surface, borderRadius: radius.tile, padding: 14 },
  number: { fontFamily: fonts.display, fontSize: 26, color: colors.gold, width: 24, textAlign: 'center' },
  stepText: { flex: 1, gap: 6 },
  spoken: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 25, color: colors.parchment },
});
