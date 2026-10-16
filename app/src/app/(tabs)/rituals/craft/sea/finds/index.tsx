import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, Chip, Chips, Expander, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import {
  beaches,
  byFound,
  COLLECTING,
  filterFinds,
  FIND_KINDS,
  FINDS,
  findTitle,
  kindLabel,
  SEA_GLASS_RARITY,
  tideLabel,
  type ShoreFind,
} from '../../../../../../lib/craft/sea/finds';
import { useCraft } from '../../../../../../lib/craft/store';
import { type } from '../../../../../../theme';

const edit = (id?: string) => router.push((id ? { pathname: '/rituals/craft/sea/finds/edit', params: { id } } : '/rituals/craft/sea/finds/edit') as Href);

function findDetail(f: ShoreFind): string {
  const tide = [tideLabel(f.tide), f.range === 'spring' ? 'springs' : f.range === 'neap' ? 'neaps' : null].filter(Boolean).join(' ');
  return [kindLabel(f.kind), f.where.trim(), fullDate(f.date)?.replace(/, \d{4}$/, ''), tide && `${tide} tide`].filter(Boolean).join(' · ');
}

// Shore finds: what the tide gave, and what it's for.
export default function ShoreFinds() {
  const { entries, ready } = useCraft<ShoreFind>(FINDS);
  const [kind, setKind] = useState<string | null>(null);
  const [where, setWhere] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const places = useMemo(() => beaches(entries), [entries]);
  const kindsUsed = useMemo(() => FIND_KINDS.filter((k) => entries.some((e) => e.data.kind === k.id)), [entries]);
  const shown = useMemo(() => byFound(filterFinds(entries, { kind, where, query })), [entries, kind, where, query]);
  const filtering = !!(kind || where || query.trim());

  return (
    <RitualScreen back="Sea">
      <Title eyebrow="Sea">Shore finds</Title>
      <Body muted>Shells, sea glass, hagstones and driftwood: where the tide left them, and what you’ll ask of them.</Body>

      <Button label="Log a find" onPress={() => edit()} />

      {ready && entries.length > 0 && (
        <Card>
          <Field label="Search your finds" value={query} onChange={setQuery} placeholder="Cobalt, cowrie, protection…" />
          {kindsUsed.length > 1 && (
            <>
              <Text style={type.eyebrow}>Kind</Text>
              <Chips>
                <Chip label="All" selected={!kind} onPress={() => setKind(null)} />
                {kindsUsed.map((k) => (
                  <Chip key={k.id} label={k.label} selected={kind === k.id} onPress={() => setKind(kind === k.id ? null : k.id)} />
                ))}
              </Chips>
            </>
          )}
          {places.length > 1 && (
            <>
              <Text style={type.eyebrow}>Shore</Text>
              <Chips>
                <Chip label="Anywhere" selected={!where} onPress={() => setWhere(null)} />
                {places.slice(0, 12).map((p) => (
                  <Chip key={p} label={p} selected={where === p} onPress={() => setWhere(where === p ? null : p)} />
                ))}
              </Chips>
            </>
          )}
        </Card>
      )}

      {!ready ? (
        <Body muted>Gathering your finds…</Body>
      ) : !entries.length ? (
        <Card>
          <Text style={type.cardTitle}>Nothing logged yet</Text>
          <Body>Next time you walk the strandline, note what you bring home: the beach, the tide, and why it called to you.</Body>
        </Card>
      ) : shown.length ? (
        <View style={ui.gapSmall}>
          <SectionLabel>{filtering ? `${shown.length} of ${entries.length}` : `${entries.length} ${entries.length === 1 ? 'find' : 'finds'}`}</SectionLabel>
          <List>
            {shown.map((e, i, all) => (
              <Row key={e.id} icon="altar" title={findTitle(e.data)} detail={findDetail(e.data)} last={i === all.length - 1} onPress={() => edit(e.id)} />
            ))}
          </List>
        </View>
      ) : (
        <Body muted>No finds match. Clear a filter to see more.</Body>
      )}

      <Expander title="Collecting kindly and legally">
        {COLLECTING.map((c) => (
          <View key={c.title} style={ui.gapSmall}>
            <Text style={type.cardTitle}>{c.title}</Text>
            <Body>{c.body}</Body>
          </View>
        ))}
      </Expander>

      <Expander title="Sea glass by rarity">
        {SEA_GLASS_RARITY.map((r) => (
          <View key={r.level} style={ui.gapSmall}>
            <Text style={type.eyebrow}>{r.level}</Text>
            <Body>{r.colours}</Body>
            <Body muted>{r.note}</Body>
          </View>
        ))}
        <Body muted>Rarity varies by shore: a beach below an old glassworks can be thick with colours that are rare elsewhere.</Body>
      </Expander>
    </RitualScreen>
  );
}
