import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { journeyHref, journeyStyles, Paragraphs, stageHref } from '../../../../../components/journeys/parts';
import { Body, Card, Field, RitualScreen, SectionLabel, Title, tell, ui } from '../../../../../components/rituals/ui';
import { shortDate } from '../../../../../lib/calendar';
import { decide, journeyStatus, resumeJourney, type DecisionKind, type JourneyProgress } from '../../../../../lib/journeys/progress';
import { startJourney, useJourney } from '../../../../../lib/journeys/store';
import { blankAnswers } from '../../../../../lib/rituals/lifecycle';
import { saveJournal } from '../../../../../lib/rituals/store';
import { type } from '../../../../../theme';

const CHOICES: { kind: DecisionKind; title: string; body: string; action: string }[] = [
  {
    kind: 'continue',
    title: 'Continue to the dedication',
    body: 'This feels true, and you’d like to make the promise. The next stage prepares the rite.',
    action: 'Continue',
  },
  {
    kind: 'pause',
    title: 'Pause for now',
    body: 'Not yet, or not now. Life is full, or the answer isn’t clear. The journey waits exactly as it is, for as long as you like.',
    action: 'Pause',
  },
  {
    kind: 'stop',
    title: 'Set it down with grace',
    body: 'You’ve learned what you came to learn, and a dedication isn’t right. That is a good outcome, not a failure. Give thanks and close it kindly.',
    action: 'Set it down',
  },
  {
    kind: 'another',
    title: 'Choose another path or god',
    body: 'Something else has been calling. Everything here stays as it is; you can begin a different journey.',
    action: 'Look at other journeys',
  },
];

// Discernment: honest questions with room to write, then a choice, any of which is a good one.
export default function Discern() {
  const { journeyId } = useLocalSearchParams<{ journeyId: string }>();
  const { journey, progress, change } = useJourney(journeyId);
  // Typing starts from the saved answers and is kept here until saved.
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const answers = draft ?? progress?.answers ?? {};
  const setAnswer = (i: number, text: string) => setDraft({ ...answers, [String(i)]: text });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const at = journey ? journey.stages.findIndex((s) => s.kind === 'discernment') : -1;
  const stage = journey && at >= 0 ? journey.stages[at] : null;

  if (!journey || !stage) {
    return (
      <RitualScreen back="Journey">
        <Title>Not found</Title>
        <Body>This journey has no discernment stage.</Body>
      </RitualScreen>
    );
  }

  const questions = stage.questions ?? [];
  const going = progress && journeyStatus(progress) !== 'stopped' ? progress : null;
  const withAnswers = (p: JourneyProgress): JourneyProgress => ({ ...p, answers: { ...(p.answers ?? {}), ...answers } });

  const saveAnswers = () => change(withAnswers);

  const keepInJournal = async () => {
    const text = questions
      .map((q, i) => (answers[String(i)]?.trim() ? `${q}\n${answers[String(i)].trim()}` : ''))
      .filter(Boolean)
      .join('\n\n');
    if (!text) return;
    try {
      await saveAnswers();
      const entry = await saveJournal({
        session: null,
        answers: { ...blankAnswers(null, new Date()), title: `${journey.title}: discernment`, intention: 'Discerning whether to dedicate', notes: text },
      });
      router.push({ pathname: '/rituals/journal/[id]', params: { id: entry.id } });
    } catch (e) {
      tell("Couldn't save to your journal", e instanceof Error ? e.message : 'Your answers are kept here; please try again.');
    }
  };

  const choose = async (kind: DecisionKind) => {
    setBusy(true);
    try {
      await change((p) => decide(journey, withAnswers(p.paused ? resumeJourney(p, new Date()) : p), kind, new Date(), note));
      setNote('');
      if (kind === 'continue') router.replace(stageHref(journey.id, at + 1));
      else if (kind === 'another') router.replace('/rituals/journeys');
      else if (kind === 'pause') router.replace(journeyHref(journey.id));
      else {
        tell('Set down with grace', 'Thank you for listening honestly. Everything you learned is still yours. You can begin again any time.');
        router.replace(journeyHref(journey.id));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <RitualScreen back={stage.title}>
      <Title eyebrow={`${journey.title} · Discernment`}>{stage.title}</Title>
      <Paragraphs text={stage.intro} />
      <Body muted>There’s no wrong answer here, and nothing to prove. Write as much or as little as you like; only you see it.</Body>

      {!going && (
        <Card accent>
          <Body>Begin the journey to keep your answers and make your choice.</Body>
          <Button label="Begin this journey" onPress={() => startJourney(journey.id)} />
        </Card>
      )}

      {questions.length > 0 && (
        <View style={ui.gap}>
          <SectionLabel>Questions to sit with</SectionLabel>
          {questions.map((q, i) => (
            <View key={i} style={ui.gapSmall}>
              <Text style={journeyStyles.heading}>{q}</Text>
              <Field label={`Your answer to question ${i + 1}`} value={answers[String(i)] ?? ''} onChange={(text) => setAnswer(i, text)} multiline />
            </View>
          ))}
          {going && (
            <View style={ui.actions}>
              <Button label="Keep my answers" variant="outline" onPress={saveAnswers} />
              <Button label="Keep them in my journal too" variant="text" onPress={keepInJournal} />
            </View>
          )}
        </View>
      )}

      {going?.decision && (
        <Card>
          <SectionLabel>Your choice</SectionLabel>
          <Body>{`On ${shortDate(new Date(going.decision.at))} you chose: ${CHOICES.find((c) => c.kind === going.decision!.kind)?.title ?? going.decision.kind}.`}</Body>
          {!!going.decision.note && <Body muted>{going.decision.note}</Body>}
          <Body muted>You can choose again below if something has changed.</Body>
        </Card>
      )}

      {going && (
        <View style={ui.gap}>
          <SectionLabel>Your choice</SectionLabel>
          <Field label="A word about why (optional)" value={note} onChange={setNote} multiline />
          {CHOICES.map((c) => (
            <Card key={c.kind} accent={c.kind === 'continue'}>
              <Text style={type.cardTitle}>{c.title}</Text>
              <Body>{c.body}</Body>
              <Button label={c.action} variant={c.kind === 'continue' ? 'primary' : 'outline'} disabled={busy} onPress={() => choose(c.kind)} />
            </Card>
          ))}
        </View>
      )}
    </RitualScreen>
  );
}
