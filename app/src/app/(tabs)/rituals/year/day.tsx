import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { journeyHref, riteHref } from '../../../../components/journeys/parts';
import { dayWords, lessonHref, LinkChips, moonHref } from '../../../../components/year/parts';
import { Body, Card, confirmAction, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import {
  config,
  dayKey,
  DEDICATION_STAGE,
  dedicate,
  linkLabel,
  MOONS,
  moonView,
  newYear,
  readKey,
  REFLECTION_MAX,
  THE_DAY,
  trackById,
  undedicate,
  yearSchedule,
} from '../../../../lib/yearday';
import { useYear } from '../../../../lib/yearday/store';

// The day of dedication, a year and a day after the start: the rite (the
// track's dedication journey's rite, or a ready-made self-dedication), the
// lessons on dedication, and marking it kept.
export default function YearDay() {
  const { progress, change } = useYear();
  const now = new Date();
  const p = progress ?? newYear('eclectic', dayKey(now), now);
  const track = trackById(p.track);
  const s = yearSchedule(p.startDate);
  const last = moonView(config(p), MOONS.length)!;
  const [note, setNote] = useState('');
  const journeyLink = { kind: 'journey' as const, id: track.journey };

  return (
    <RitualScreen back="A Year and a Day">
      <Title eyebrow={progress ? dayWords(s.day) : 'A year and a day'}>{THE_DAY.title}</Title>
      <Body>{THE_DAY.intro}</Body>
      <Body muted>{THE_DAY.wait}</Body>

      <View style={ui.gapSmall}>
        <SectionLabel>The rite</SectionLabel>
        <Card accent>
          <Body>{`Your ${track.name} dedication journey holds a full rite of self-dedication, with its discernment before it. Begin it at the altar’s Ritual Companion, or keep the ready-made one.`}</Body>
          <Button label="Open the dedication rite" onPress={() => router.push(riteHref(track.journey, DEDICATION_STAGE))} />
          <Button label={linkLabel(journeyLink)} variant="outline" onPress={() => router.push(journeyHref(track.journey))} />
          <LinkChips links={[{ kind: 'premade', id: track.dedication }, { kind: 'page', id: 'journal' }]} />
        </Card>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Read before</SectionLabel>
        <List>
          {last.readings.map((r, i) => (
            <Row
              key={r.id}
              icon="grimoire"
              title={r.title}
              detail={`${r.minutes} min${p.done[readKey(r.id)] ? ' · Read' : ''}`}
              last={i === last.readings.length - 1}
              onPress={() => router.push(lessonHref(r.id, MOONS.length))}
            />
          ))}
        </List>
      </View>

      {progress &&
        (progress.dedicatedAt ? (
          <Card>
            <Body>{`Dedicated on ${dayWords(dayKey(new Date(progress.dedicatedAt)))}.`}</Body>
            {!!progress.dedicationNote && <Body muted>{progress.dedicationNote}</Body>}
            <Body muted>{THE_DAY.after}</Body>
            <Button
              label="Undo"
              variant="text"
              onPress={async () => {
                if (await confirmAction('Unmark your dedication?', 'Your year will show as not yet dedicated.', 'Unmark')) await change(undedicate);
              }}
            />
          </Card>
        ) : (
          <View style={ui.gapSmall}>
            <SectionLabel>Once you have kept it</SectionLabel>
            <Field label="A line about the day (optional, private)" value={note} onChange={(t) => setNote(t.slice(0, REFLECTION_MAX))} multiline />
            <Button label="I have made my dedication" onPress={() => change((x) => dedicate(x, new Date(), note))} />
          </View>
        ))}

      <List>
        <Row icon="calendar" title={`Moon ${MOONS.length}: ${MOONS[MOONS.length - 1].title}`} detail="Preparing your words, token and day" last onPress={() => router.push(moonHref(MOONS.length))} />
      </List>
    </RitualScreen>
  );
}
