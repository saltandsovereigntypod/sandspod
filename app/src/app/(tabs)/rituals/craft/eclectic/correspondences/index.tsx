import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import {
  byName,
  correspondenceDetail,
  CORRESPONDENCES,
  ELEMENTS,
  filterCorrespondences,
  SOURCES,
  type MyCorrespondence,
} from '../../../../../../lib/craft/eclectic/correspondences';
import { useCraft } from '../../../../../../lib/craft/store';
import { type } from '../../../../../../theme';

// My correspondences: your own meanings for things, searchable.
export default function MyCorrespondences() {
  const { entries, ready } = useCraft<MyCorrespondence>(CORRESPONDENCES);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<string | null>(null);
  const [element, setElement] = useState<string | null>(null);

  const shown = useMemo(() => byName(filterCorrespondences(entries, { query, source, element })), [entries, query, source, element]);
  const sourcesUsed = SOURCES.filter((s) => entries.some((e) => e.data.source === s.id));
  const elementsUsed = ELEMENTS.filter((el) => entries.some((e) => e.data.element.toLowerCase().includes(el.toLowerCase())));
  const filtering = !!(query.trim() || source || element);

  return (
    <RitualScreen back="Eclectic">
      <Title eyebrow="Eclectic">My correspondences</Title>
      <Body muted>What things mean to you: from a tradition, a teacher, a hunch, or years of working with them. Beside the Library’s meanings, never beneath them.</Body>

      <Button label="Add a correspondence" onPress={() => router.push('/rituals/craft/eclectic/correspondences/edit' as Href)} />

      {ready && entries.length > 0 && (
        <Card>
          <Field label="Search your correspondences" value={query} onChange={setQuery} placeholder="Rosemary, Mars, protection…" />
          {elementsUsed.length > 1 && (
            <>
              <Text style={type.eyebrow}>Element</Text>
              <Chips>
                <Chip label="Any" selected={!element} onPress={() => setElement(null)} />
                {elementsUsed.map((el) => (
                  <Chip key={el} label={el} selected={element === el} onPress={() => setElement(element === el ? null : el)} />
                ))}
              </Chips>
            </>
          )}
          {sourcesUsed.length > 1 && (
            <>
              <Text style={type.eyebrow}>Where it came from</Text>
              <Chips>
                <Chip label="Anywhere" selected={!source} onPress={() => setSource(null)} />
                {sourcesUsed.map((s) => (
                  <Chip key={s.id} label={s.label} selected={source === s.id} onPress={() => setSource(source === s.id ? null : s.id)} />
                ))}
              </Chips>
            </>
          )}
        </Card>
      )}

      {!ready ? (
        <Body muted>Gathering your correspondences…</Body>
      ) : !entries.length ? (
        <Card>
          <Text style={type.cardTitle}>Your own book of meanings</Text>
          <Body>Start with one thing you reach for often, a herb, a stone, a colour, a goddess, and write what it means to you. Pick it from the Library to see the traditional view beside yours.</Body>
        </Card>
      ) : shown.length ? (
        <View style={ui.gapSmall}>
          <SectionLabel>{filtering ? `${shown.length} of ${entries.length}` : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}</SectionLabel>
          <List>
            {shown.map((e, i, all) => (
              <Row
                key={e.id}
                icon="grimoire"
                title={e.data.name || 'Untitled'}
                detail={correspondenceDetail(e.data) || null}
                last={i === all.length - 1}
                onPress={() => router.push({ pathname: '/rituals/craft/eclectic/correspondences/[id]', params: { id: e.id } } as Href)}
              />
            ))}
          </List>
        </View>
      ) : (
        <Body muted>Nothing matches. Clear a filter to see more.</Body>
      )}
    </RitualScreen>
  );
}
