import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import { DREAMS, groupByMonth, normalizeDream, searchDreams, type DreamEntry } from '../../../../../../lib/craft/hedge/dreams';
import { useCraft } from '../../../../../../lib/craft/store';

function detail(e: DreamEntry): string {
  const d = e.data;
  const marks = [d.lucid ? 'lucid' : null, d.recurring ? 'recurring' : null].filter(Boolean).join(', ');
  return [fullDate(d.date)?.replace(/, \d{4}$/, ''), d.moonPhase, marks || null, d.symbols.slice(0, 3).join(' · ') || null].filter(Boolean).join(' · ');
}

export default function DreamJournal() {
  const { entries, ready } = useCraft<unknown>(DREAMS);
  const [query, setQuery] = useState('');
  const dreams = useMemo(() => entries.map((e) => ({ ...e, data: normalizeDream(e.data) })), [entries]);
  const found = useMemo(() => searchDreams(dreams, query), [dreams, query]);
  const groups = useMemo(() => groupByMonth(found), [found]);

  return (
    <RitualScreen back="Hedge">
      <Title eyebrow={`${dreams.length} ${dreams.length === 1 ? 'dream' : 'dreams'}`}>Dream journal</Title>
      <Button label="Write down a dream" onPress={() => router.push('/rituals/craft/hedge/dreams/edit' as Href)} />

      {!ready ? (
        <Body muted>Opening your journal…</Body>
      ) : dreams.length === 0 ? (
        <Card>
          <Body>Nothing written yet. The first dream you catch, write it here: the moon it came under is noted for you, and over the months your symbols and patterns begin to show.</Body>
        </Card>
      ) : (
        <>
          <Field label="Search your dreams" value={query} onChange={setQuery} placeholder="A word, a symbol, a feeling" />
          {dreams.length >= 3 && (
            <List>
              <Row icon="wheel" title="Symbols and moons" detail="What keeps returning, and the phases your dreams cluster in" last onPress={() => router.push('/rituals/craft/hedge/dreams/symbols' as Href)} />
            </List>
          )}
          {groups.length === 0 && <Body muted>No dreams match that.</Body>}
          {groups.map((g) => (
            <View key={g.month} style={ui.gapSmall}>
              <SectionLabel>{g.month}</SectionLabel>
              <List>
                {g.entries.map((e, i) => (
                  <Row
                    key={e.id}
                    icon="grimoire"
                    title={e.data.title || 'Untitled dream'}
                    detail={detail(e)}
                    last={i === g.entries.length - 1}
                    onPress={() => router.push(`/rituals/craft/hedge/dreams/${e.id}` as Href)}
                  />
                ))}
              </List>
            </View>
          ))}
        </>
      )}
      {dreams.length < 3 && (
        <List>
          <Row icon="wheel" title="Dream symbols" detail="Common associations, as starting points" last onPress={() => router.push('/rituals/craft/hedge/dreams/symbols' as Href)} />
        </List>
      )}
    </RitualScreen>
  );
}
