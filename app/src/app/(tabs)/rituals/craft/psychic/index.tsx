import { View } from 'react-native';

import { goTo, ResultsLine, usePsychic } from '../../../../../components/psychic/shared';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { PSYCHIC_TOOLS } from '../../../../../lib/craft/practices';
import { promptFor } from '../../../../../lib/craft/psychic/prompts';
import { localDateKey } from '../../../../../lib/rituals/lifecycle';
import { CRAFT } from '../../../../../lib/names';

// Psychic development: warm-ups and four exercises with an honest record. Its
// own section of My practice. Nothing here claims to prove or disprove anything;
// results are set against chance.
export default function PsychicHub() {
  const { sessions } = usePsychic();
  const today = localDateKey(new Date());
  const doneToday = sessions.some((s) => s.data.date === today);

  return (
    <RitualScreen back="My practice">
      <Title eyebrow={CRAFT}>Psychic development</Title>
      <Body muted>Practice at intuition and extra-sensory perception, kept honestly: every guess is scored against what chance alone would give, and every session goes into your Journal. Whether these abilities exist is unsettled; the exercises are about attention, and about learning what your own record shows.</Body>

      <Card accent>
        <SectionLabel>{doneToday ? 'Today' : 'A prompt for today'}</SectionLabel>
        <Body>{promptFor(today).text}</Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Exercises</SectionLabel>
        <List>
          {PSYCHIC_TOOLS.map((t, i) => (
            <Row key={t.href} icon="wheel" title={t.title} detail={t.detail} last={i === PSYCHIC_TOOLS.length - 1} onPress={goTo(t.href)} />
          ))}
        </List>
      </View>

      <Card>
        <SectionLabel>Where you stand</SectionLabel>
        <ResultsLine sessions={sessions} />
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Elsewhere</SectionLabel>
        <List>
          <Row icon="wheel" title="Divination" detail="Draw the card of the day that Tomorrow’s card is checked against" onPress={goTo('/rituals/divination')} />
          <Row icon="wheel" title="Meditation" detail="A timer with gentle bells, for longer tune-ins" onPress={goTo('/rituals/craft/meditation')} />
          <Row icon="grimoire" title="Journal" detail="Every session, under Psychic development" last onPress={goTo('/rituals/journal')} />
        </List>
      </View>
    </RitualScreen>
  );
}
