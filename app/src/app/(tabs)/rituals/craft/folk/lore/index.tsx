import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { filterLore, LORE, LORE_KINDS, loreCounts, loreKindLabel, lorePlaces, normalizeLore, type LoreKind } from '../../../../../../lib/craft/folk/lore';
import { useCraft } from '../../../../../../lib/craft/store';

export default function LocalLore() {
  const { entries, ready } = useCraft<unknown>(LORE);
  const [kind, setKind] = useState<LoreKind | null>(null);
  const [query, setQuery] = useState('');
  const all = useMemo(() => entries.map((e) => ({ ...e, data: normalizeLore(e.data) })), [entries]);
  const found = useMemo(() => filterLore(all, kind, query), [all, kind, query]);
  const counts = useMemo(() => loreCounts(all), [all]);
  const places = useMemo(() => lorePlaces(all).slice(0, 10), [all]);

  return (
    <RitualScreen back="Traditional & folk">
      <Title eyebrow={`${all.length} ${all.length === 1 ? 'entry' : 'entries'}`}>Local lore</Title>
      <Button label="Write down some lore" onPress={() => router.push('/rituals/craft/folk/lore/edit' as Href)} />

      {!ready ? (
        <Body muted>Opening…</Body>
      ) : all.length === 0 ? (
        <Card>
          <Body>A notebook for the lore of where you live: the holy well, the stone that turns at midnight, what the old man at the allotment says about elder, the name of the field. Write down who told you. Lore like this is lost one person at a time.</Body>
        </Card>
      ) : (
        <>
          <Field label="Search your lore" value={query} onChange={setQuery} placeholder="A place, a name, a word" />
          <Chips>
            <Chip label="All" selected={kind === null} onPress={() => setKind(null)} />
            {LORE_KINDS.filter((k) => counts[k.id] > 0).map((k) => (
              <Chip key={k.id} label={`${k.label} · ${counts[k.id]}`} a11yLabel={`${k.label}, ${counts[k.id]}`} selected={kind === k.id} onPress={() => setKind(kind === k.id ? null : k.id)} />
            ))}
          </Chips>
          {places.length > 1 && !query && (
            <View style={ui.gapSmall}>
              <SectionLabel>Your places</SectionLabel>
              <Chips>
                {places.map((p) => (
                  <Chip key={p.where} label={`${p.where} · ${p.count}`} a11yLabel={`${p.where}, ${p.count}. Show its lore`} onPress={() => setQuery(p.where)} />
                ))}
              </Chips>
            </View>
          )}
          {found.length === 0 ? (
            <Body muted>Nothing matches that.</Body>
          ) : (
            <List>
              {found.map((e, i) => (
                <Row
                  key={e.id}
                  icon="grimoire"
                  title={e.data.title || 'Untitled'}
                  detail={[loreKindLabel(e.data.kind), e.data.where, e.data.source ? `from ${e.data.source}` : null].filter(Boolean).join(' · ')}
                  last={i === found.length - 1}
                  onPress={() => router.push(`/rituals/craft/folk/lore/${e.id}` as Href)}
                />
              ))}
            </List>
          )}
        </>
      )}
    </RitualScreen>
  );
}
