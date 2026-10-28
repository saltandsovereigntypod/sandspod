import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Body, Card, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { INTENTIONS, intentionByKey } from '../../../../../lib/rituals/planner';
import { filterPremade, PREMADE, type Premade } from '../../../../../lib/rituals/premade';
import { type } from '../../../../../theme';

const recipeDetail = (p: Premade) =>
  [p.kind === 'spell' ? 'Spell' : 'Ritual', `${p.minutes} min`, intentionByKey(p.intention)?.label, `${p.ingredients.length} ${p.ingredients.length === 1 ? 'thing' : 'things'} to gather`]
    .filter(Boolean)
    .join(' · ');

// The premade workings tagged Kitchen & hearth, read as a recipe book.
export default function KitchenSpellBook() {
  const [intention, setIntention] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const book = useMemo(() => filterPremade(PREMADE, { practice: 'kitchen' }), []);
  const shown = useMemo(() => filterPremade(book, { intention, query }), [book, intention, query]);
  // Only offer the intentions the book has recipes for.
  const offered = useMemo(
    () => INTENTIONS.filter((i) => book.some((p) => p.intention === i.key || p.alsoFor?.includes(i.key as never))),
    [book],
  );
  const open = (p: Premade) => router.push({ pathname: '/rituals/premade/[id]', params: { id: p.id } });

  return (
    <RitualScreen back="Kitchen & hearth">
      <Title eyebrow="Kitchen & hearth">Kitchen spell book</Title>
      <Body muted>Recipes as workings: breads, broths, washes and blessings for the home, each with its ingredients, method and the words to say.</Body>

      <Card>
        <Field label="Search the book" value={query} onChange={setQuery} placeholder="Bread, salt, honey…" />
        <Text style={type.eyebrow}>For</Text>
        <Chips>
          <Chip label="Anything" selected={!intention} onPress={() => setIntention(null)} />
          {offered.map((i) => (
            <Chip key={i.key} label={i.label} selected={intention === i.key} onPress={() => setIntention(intention === i.key ? null : i.key)} />
          ))}
        </Chips>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>{`${shown.length} ${shown.length === 1 ? 'recipe' : 'recipes'}`}</SectionLabel>
        {shown.length ? (
          <List>
            {shown.map((p, i, all) => (
              <Row key={p.id} icon="grimoire" title={p.title} detail={recipeDetail(p)} last={i === all.length - 1} onPress={() => open(p)} />
            ))}
          </List>
        ) : (
          <Card>
            <Body>No recipe matches all of that yet. Try another intention.</Body>
          </Card>
        )}
      </View>

      <List>
        <Row icon="wheel" title="All premade workings" detail="From the Workings library, for every practice" last onPress={() => router.push('/rituals/premade')} />
      </List>
    </RitualScreen>
  );
}
