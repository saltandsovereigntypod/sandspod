import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { everyWords, journeyStyles, JourneyWaiting, Paragraphs, ProgressBar } from '../../../../../../components/journeys/parts';
import { Body, Card, confirmAction, Field, List, RitualScreen, Row, SectionLabel, Title, Toggle, tell, ui } from '../../../../../../components/rituals/ui';
import { relativeDay, shortDate } from '../../../../../../lib/calendar';
import { findPractice } from '../../../../../../lib/journeys/lookup';
import { journeyStatus, logPractice, practiceState, unlogPractice } from '../../../../../../lib/journeys/progress';
import { startJourney, useCadence, useJourney } from '../../../../../../lib/journeys/store';
import { blankAnswers } from '../../../../../../lib/rituals/lifecycle';
import { premadeById } from '../../../../../../lib/rituals/premade';
import { saveJournal } from '../../../../../../lib/rituals/store';
import { type } from '../../../../../../theme';

// A practice: what to do, a tick for each time with an optional note, and how many times are left.
export default function PracticeView() {
  const { journeyId, practiceId } = useLocalSearchParams<{ journeyId: string; practiceId: string }>();
  const { journey, progress, change, textState, retry } = useJourney(journeyId);
  const cadence = useCadence();
  const [note, setNote] = useState('');
  const [toJournal, setToJournal] = useState(false);
  const [saving, setSaving] = useState(false);
  const found = findPractice(journey, practiceId);
  const now = new Date();

  if (!journey && textState !== 'missing') return <JourneyWaiting state={textState} retry={retry} back="Journey" />;
  if (!journey || !found) {
    return (
      <RitualScreen back="Journey">
        <Title>Not found</Title>
        <Body>This practice isn’t here any more.</Body>
      </RitualScreen>
    );
  }

  const { practice, stage } = found;
  const going = progress && journeyStatus(progress) !== 'stopped' ? progress : null;
  const state = going ? practiceState(practice, journey, going, now, cadence) : null;
  const log = [...(going?.practiceLog[practice.id] ?? [])].sort((a, b) => (a.at < b.at ? 1 : -1));
  const premade = premadeById(practice.premade);

  const record = async () => {
    setSaving(true);
    try {
      await change((p) => logPractice(p, practice.id, new Date(), note));
      if (toJournal && note.trim()) {
        const answers = {
          ...blankAnswers(null, new Date()),
          title: `${journey.title}: ${practice.title}`,
          intention: practice.title,
          notes: practice.prompt ? `${practice.prompt}\n\n${note.trim()}` : note.trim(),
        };
        await saveJournal({ session: null, answers }).catch(() => tell('Kept here, not in the journal', 'Your note is saved with the practice; the journal couldn’t be reached.'));
      }
      setNote('');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (at: string) => {
    const ok = await confirmAction('Remove this time?', 'It will no longer count toward the practice.', 'Remove');
    if (ok) await change((p) => unlogPractice(p, practice.id, at));
  };

  return (
    <RitualScreen back={stage.title}>
      <Title eyebrow={`${journey.title} · ${practice.times === 1 ? 'once' : `${practice.times} times`} · ${everyWords(practice.every)}`}>{practice.title}</Title>
      <Paragraphs text={practice.instructions} />

      {premade && (
        <List>
          <Row
            icon="rituals"
            title={premade.title}
            detail="A guided working for this practice"
            last
            onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: premade.id } })}
          />
        </List>
      )}

      {state ? (
        <Card accent>
          <SectionLabel>{`${Math.min(state.count, state.times)} of ${state.times} done`}</SectionLabel>
          <ProgressBar fraction={state.count / state.times} label={`${practice.title}: ${state.count} of ${state.times} done`} />
          <Body muted>
            {state.done
              ? 'Done. You can keep going if it’s become part of you.'
              : state.due
                ? 'Good to do today.'
                : state.nextAt
                  ? `Next comes round ${state.nextName ? `with ${state.nextName} ` : ''}${relativeDay(now, state.nextAt)}. You can still mark it any time.`
                  : 'Whenever you choose.'}
          </Body>
          {!!practice.prompt && <Text style={journeyStyles.heading}>{practice.prompt}</Text>}
          <Field label="A note (optional)" value={note} onChange={setNote} placeholder="What you noticed, felt or did" multiline />
          {!!note.trim() && <Toggle label="Also keep it in my journal" value={toJournal} onChange={setToJournal} />}
          <Button label={saving ? 'Saving…' : 'I did this'} disabled={saving} onPress={record} />
        </Card>
      ) : (
        <Card accent>
          <Body>Begin the journey to tick off each time you do this practice.</Body>
          <Button label="Begin this journey" onPress={() => startJourney(journey.id)} />
        </Card>
      )}

      {log.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Times you’ve done it</SectionLabel>
          <Card>
            {log.map((e) => (
              <View key={e.at} style={ui.gapSmall}>
                <Text style={type.cardTitle}>{shortDate(new Date(e.at))}</Text>
                {!!e.note && <Body>{e.note}</Body>}
                <Button label="Remove" variant="text" accessibilityHint="Stops this time counting" onPress={() => remove(e.at)} />
              </View>
            ))}
          </Card>
        </View>
      )}
    </RitualScreen>
  );
}
