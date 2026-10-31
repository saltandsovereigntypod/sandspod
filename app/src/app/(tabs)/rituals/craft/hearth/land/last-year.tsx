import { useMemo } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { go, HEARTH, q, useLand } from '../../../../../../components/craft/hearth';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import { kindsOf, moonOnDay, noteKindLabel, noteTitle, thisTimeLastYear } from '../../../../../../lib/craft/hearth/land';

// This time last year: what you noticed in the same fortnight either side of
// today in every earlier year, the most recent year first.
export default function LastYear() {
  const now = useMemo(() => new Date(), []);
  const { notes, names, ready } = useLand();
  const years = useMemo(() => thisTimeLastYear(notes, now), [notes, now]);

  return (
    <RitualScreen back="Land journal">
      <Title eyebrow="Land journal">This time last year</Title>
      <Body muted>What you noticed in the two weeks either side of today, in every year before this one.</Body>
      {years.length ? (
        years.map((y) => (
          <View key={y.year} style={ui.gapSmall}>
            <SectionLabel>{`${y.year} · ${y.yearsAgo === 1 ? 'a year ago' : `${y.yearsAgo} years ago`}`}</SectionLabel>
            <List>
              {y.notes.map((n, i) => (
                <Row
                  key={n.id}
                  icon="grimoire"
                  title={noteTitle(n.data)}
                  detail={[fullDate(n.data.on), names[n.data.placeId ?? ''], moonOnDay(n.data.on), kindsOf(n.data).map(noteKindLabel).join(', ')].filter(Boolean).join(' · ')}
                  last={i === y.notes.length - 1}
                  onPress={go(`${HEARTH}/land/note${q({ id: n.id })}`)}
                />
              ))}
            </List>
          </View>
        ))
      ) : (
        <Card>
          <Body>{ready ? 'Nothing yet from these weeks of an earlier year. Keep noting what the land does, and next year this page will show you.' : 'Opening…'}</Body>
        </Card>
      )}
      <Button label="Note what you see today" onPress={go(`${HEARTH}/land/note-edit`)} />
    </RitualScreen>
  );
}
