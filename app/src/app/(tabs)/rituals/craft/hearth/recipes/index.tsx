import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { go, HEARTH, q, useDayContext } from '../../../../../../components/craft/hearth';
import { Body, Card, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { herbName } from '../../../../../../lib/craft/green/garden';
import { allRecipes, festivalFoodsAhead, festivalName, filterRecipes, INTENT_CHOICES, intentLabel, ORIGIN_LABELS, RECIPES, type AnyRecipe } from '../../../../../../lib/craft/hearth/recipes';
import { useCraft } from '../../../../../../lib/craft/store';

const detail = (r: AnyRecipe) =>
  [ORIGIN_LABELS[r.recipe.origin], intentLabel(r.recipe.intent), r.recipe.festivals.slice(0, 2).map(festivalName).join(', '), r.recipe.time].filter(Boolean).join(' · ');

// Kitchen witchery: recipes cooked with an intent. Festival foods from your
// calendars first, then every recipe, yours and the starters, by intent.
export default function Recipes() {
  const params = useLocalSearchParams<{ festival?: string; herb?: string }>();
  const now = useMemo(() => new Date(), []);
  const { choice } = useDayContext();
  const mine = useCraft<unknown>(RECIPES).entries;
  const all = useMemo(() => allRecipes(mine), [mine]);
  const [intent, setIntent] = useState<string | null>(null);
  const [festival, setFestival] = useState<string | null>(params.festival ?? null);
  const [herb, setHerb] = useState<string | null>(params.herb ?? null);
  const [query, setQuery] = useState('');
  const shown = useMemo(() => filterRecipes(all, { intent, festival, herb, query }), [all, intent, festival, herb, query]);
  const feasts = useMemo(() => festivalFoodsAhead(now, choice, 45, all), [now, choice, all]);
  const offered = INTENT_CHOICES.filter((i) => all.some((r) => r.recipe.intent === i.key));

  return (
    <RitualScreen back="Hearth & land">
      <Title eyebrow="Hearth & land">Kitchen witchery</Title>
      <Body muted>Recipes cooked with an intent: festival foods, offerings, and your own. Each says honestly whether it’s traditional or modern, and links its ingredients to their correspondences.</Body>

      {feasts.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>For the festivals ahead</SectionLabel>
          <List>
            {feasts.map((f, i) => (
              <Row
                key={f.ref}
                icon="samhain"
                title={`${f.name} ${f.inDays === 0 ? 'today' : f.inDays === 1 ? 'tomorrow' : `in ${f.inDays} days`}`}
                detail={f.recipes.map((r) => r.recipe.title).join(' · ')}
                last={i === feasts.length - 1}
                onPress={() => setFestival(f.ref)}
              />
            ))}
          </List>
        </View>
      )}

      <Card>
        <Field label="Search recipes" value={query} onChange={setQuery} placeholder="Bread, honey, Samhain…" />
        <Chips>
          <Chip label="Any intent" selected={!intent} onPress={() => setIntent(null)} />
          {offered.map((i) => (
            <Chip key={i.key} label={i.label} selected={intent === i.key} onPress={() => setIntent(intent === i.key ? null : i.key)} />
          ))}
        </Chips>
        {(!!festival || !!herb) && (
          <Chips>
            {!!festival && <Chip label={`${festivalName(festival)} ✕`} selected onPress={() => setFestival(null)} />}
            {!!herb && <Chip label={`With ${herbName(herb) ?? herb} ✕`} selected onPress={() => setHerb(null)} />}
          </Chips>
        )}
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>{`${shown.length} ${shown.length === 1 ? 'recipe' : 'recipes'}`}</SectionLabel>
        {shown.length ? (
          <List>
            {shown.map((r, i) => (
              <Row key={r.id} icon={r.starter ? 'rituals' : 'grimoire'} title={r.recipe.title} detail={detail(r)} last={i === shown.length - 1} onPress={go(`${HEARTH}/recipes/recipe${q({ id: r.id })}`)} />
            ))}
          </List>
        ) : (
          <Card>
            <Body>No recipe matches all of that yet.</Body>
          </Card>
        )}
      </View>

      <Button label="Write your own recipe" onPress={go(`${HEARTH}/recipes/edit`)} />
      <List>
        <Row icon="rituals" title="Kitchen spell book" detail="On Kitchen & hearth · the premade kitchen workings" onPress={go('/rituals/craft/kitchen/spells')} />
        <Row icon="grimoire" title="Pantry correspondences" detail="Salt, honey, cinnamon and the rest" onPress={go('/rituals/craft/kitchen/pantry')} />
        <Row icon="altar" title="Simmer pot" detail="A pot for your home from what you have" last onPress={go('/rituals/craft/kitchen/simmer')} />
      </List>
    </RitualScreen>
  );
}
