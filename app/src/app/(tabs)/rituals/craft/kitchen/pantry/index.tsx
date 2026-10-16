import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Body, Card, Chip, Chips, Expander, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { filterPantry, LIBRARY_KITCHEN_HERBS, libraryHerbName, PANTRY, PANTRY_GROUPS, type PantryGroup, type PantryItem } from '../../../../../../lib/craft/kitchen/pantry';
import { ritualsLibraryHref } from '../../../../../../lib/library';
import { INTENTIONS } from '../../../../../../lib/rituals/planner';
import { type } from '../../../../../../theme';

const ELEMENTS = ['Earth', 'Water', 'Fire', 'Air'];

const detailOf = (p: PantryItem) => [`${p.element} · ${p.planet}`, p.uses.slice(0, 3).join(', '), p.library ? 'in the Library' : null].filter(Boolean).join(' · ');

export default function Pantry() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<PantryGroup | null>(null);
  const [element, setElement] = useState<string | null>(null);
  const [intention, setIntention] = useState<string | null>(null);
  const shown = useMemo(() => filterPantry(PANTRY, { query, group, element, intention }), [query, group, element, intention]);
  const filtering = !!(query.trim() || group || element || intention);

  const open = (p: PantryItem) => router.push({ pathname: '/rituals/craft/kitchen/pantry/[key]', params: { key: p.key } });

  return (
    <RitualScreen back="Kitchen & hearth">
      <Title eyebrow="Kitchen & hearth">Pantry correspondences</Title>
      <Body muted>
        The everyday cupboard as the old kitchen read it: each thing’s element and planet, what it’s used for, a way to cook or clean with it, and
        what to take care with.
      </Body>

      <Card>
        <Field label="Search the pantry" value={query} onChange={setQuery} placeholder="Honey, protection, Venus…" />
        <Text style={type.eyebrow}>Shelf</Text>
        <Chips>
          <Chip label="All" selected={!group} onPress={() => setGroup(null)} />
          {PANTRY_GROUPS.map((g) => (
            <Chip key={g.key} label={g.label} selected={group === g.key} onPress={() => setGroup(group === g.key ? null : g.key)} />
          ))}
        </Chips>
        <Text style={type.eyebrow}>Element</Text>
        <Chips>
          <Chip label="Any" selected={!element} onPress={() => setElement(null)} />
          {ELEMENTS.map((e) => (
            <Chip key={e} label={e} selected={element === e} onPress={() => setElement(element === e ? null : e)} />
          ))}
        </Chips>
        <Expander title="Good for…" initiallyOpen={!!intention}>
          <Chips>
            <Chip label="Anything" selected={!intention} onPress={() => setIntention(null)} />
            {INTENTIONS.map((i) => (
              <Chip key={i.key} label={i.label} selected={intention === i.key} onPress={() => setIntention(intention === i.key ? null : i.key)} />
            ))}
          </Chips>
        </Expander>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>{filtering ? `${shown.length} ${shown.length === 1 ? 'item' : 'items'}` : `All ${PANTRY.length} items`}</SectionLabel>
        {shown.length ? (
          <List>
            {shown.map((p, i, all) => (
              <Row key={p.key} icon="grimoire" title={p.name} detail={detailOf(p)} last={i === all.length - 1} onPress={() => open(p)} />
            ))}
          </List>
        ) : (
          <Card>
            <Body>Nothing on the shelf matches all of that. Try fewer filters.</Body>
          </Card>
        )}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Kitchen herbs in the Living Library</SectionLabel>
        <Body muted>These have full entries of their own, with their lore across traditions.</Body>
        <List>
          {LIBRARY_KITCHEN_HERBS.map((key, i, all) => (
            <Row
              key={key}
              icon="grimoire"
              title={libraryHerbName(key)}
              detail="Open in the Library"
              last={i === all.length - 1}
              onPress={() => router.push(ritualsLibraryHref({ id: `traditional:herb:${key}` }))}
            />
          ))}
        </List>
      </View>
    </RitualScreen>
  );
}
