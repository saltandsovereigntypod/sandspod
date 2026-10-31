import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { go, HEARTH, q } from '../../../../../../components/craft/hearth';
import { Body, Card, Chip, Chips, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import {
  ALLERGENS,
  festivalName,
  findRecipePage,
  ingredientLink,
  intentLabel,
  KITCHEN_SAFETY,
  normalizeRecipe,
  OFFERING_NAMES,
  ORIGIN_LABELS,
  RECIPE_SECTION,
  RECIPES,
  recipeBlocks,
  recipeElements,
  recipeRef,
  SEASONAL_NAMES,
  starterRecipe,
} from '../../../../../../lib/craft/hearth/recipes';
import { useCraft } from '../../../../../../lib/craft/store';
import { useGrimoire } from '../../../../../../lib/grimoire/store';
import { hasHolyPage } from '../../../../../../lib/holy';
import { ritualsLibraryHref } from '../../../../../../lib/library';
import { useSession } from '../../../../../../lib/session';
import { type } from '../../../../../../theme';

// One recipe: what it's for, its festivals, the altar's seasonal things and
// offerings it goes with, its ingredients and their correspondences, the
// method and words, allergies and safety, where it comes from, and a page
// for it in your Grimoire.
export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useSession();
  const grimoire = useGrimoire();
  const { entries, ready } = useCraft<unknown>(RECIPES);
  const starter = starterRecipe(id);
  const own = entries.find((e) => e.id === id) ?? null;
  const recipe = useMemo(() => (starter ? starter : own ? normalizeRecipe(own.data) : null), [starter, own]);
  if (!recipe || !id) {
    return (
      <RitualScreen back="Kitchen witchery">
        <Title>A recipe</Title>
        <Body>{ready ? 'This recipe couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const kept = grimoire.snapshot ? findRecipePage(grimoire.snapshot.pages, id) : null;
  const keep = () => {
    if (kept) return router.push({ pathname: '/grimoire/[pageId]', params: { pageId: kept.id } });
    const pageId = grimoire.actions.saveHolyPage({ ref: recipeRef(id), title: recipe.title, sectionTitle: RECIPE_SECTION, blocks: recipeBlocks(recipe) });
    if (pageId) router.push({ pathname: '/grimoire/[pageId]', params: { pageId } });
  };
  const elements = recipeElements(recipe);
  const intent = intentLabel(recipe.intent);

  return (
    <RitualScreen back="Kitchen witchery">
      <Title eyebrow={ORIGIN_LABELS[recipe.origin]}>{recipe.title}</Title>
      <Body muted>{[intent ? `For ${intent.toLowerCase()}` : '', recipe.serves, recipe.time].filter(Boolean).join(' · ')}</Body>
      {elements.length > 0 && <Body muted>{`Leans to ${elements.map((e) => e.element.toLowerCase()).join(', ')}`}</Body>}

      {(recipe.festivals.length > 0 || recipe.seasonal.length > 0 || !!recipe.offering) && (
        <View style={ui.gapSmall}>
          {recipe.festivals.length > 0 && (
            <>
              <SectionLabel>For the festivals</SectionLabel>
              <Chips>
                {recipe.festivals.map((ref) => (
                  <Chip key={ref} label={festivalName(ref)} onPress={hasHolyPage(ref) ? () => router.push({ pathname: '/today/holy/[ref]', params: { ref } }) : undefined} />
                ))}
              </Chips>
            </>
          )}
          {(recipe.seasonal.length > 0 || !!recipe.offering) && (
            <>
              <SectionLabel>On the altar with it</SectionLabel>
              <Chips>
                {recipe.seasonal.map((s) => (
                  <Chip key={s} label={SEASONAL_NAMES[s]} a11yLabel={`${SEASONAL_NAMES[s]}, in the cabinet’s Seasonal drawer`} onPress={go('/altar')} />
                ))}
                {!!recipe.offering && <Chip label={`Offer it: ${OFFERING_NAMES[recipe.offering]}`} a11yLabel={`${OFFERING_NAMES[recipe.offering]}, in the cabinet’s Offerings drawer`} onPress={go('/altar')} />}
              </Chips>
              <Body muted>In the altar’s cabinet: the Seasonal drawer and the Offerings drawer.</Body>
            </>
          )}
        </View>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Ingredients</SectionLabel>
        <List>
          {recipe.ingredients.map((ing, i) => {
            const link = ingredientLink(ing);
            const last = i === recipe.ingredients.length - 1;
            if (!link) return <Row key={i} icon="grimoire" title={ing.text} last={last} onPress={() => undefined} label={ing.text} />;
            return (
              <Row
                key={i}
                icon="wheel"
                title={ing.text}
                detail={[link.name, link.element, link.planet, link.uses].filter(Boolean).join(' · ')}
                last={last}
                onPress={() => router.push((link.kind === 'herb' ? ritualsLibraryHref({ id: `traditional:herb:${link.key}` }) : `/rituals/craft/kitchen/pantry/${link.key}`) as Href)}
              />
            );
          })}
        </List>
      </View>

      <Card>
        <SectionLabel>Method</SectionLabel>
        {recipe.method.map((step, i) => (
          <Text key={i} style={type.body}>{`${i + 1}. ${step}`}</Text>
        ))}
      </Card>

      {!!recipe.words && (
        <Card accent>
          <SectionLabel>Words to say</SectionLabel>
          <Text style={[type.body, { fontStyle: 'italic' }]}>{recipe.words}</Text>
        </Card>
      )}

      <Card>
        <SectionLabel>Allergies and safety</SectionLabel>
        {recipe.allergens.length ? (
          recipe.allergens.map((a) => {
            const x = ALLERGENS.find((y) => y.id === a)!;
            return <Body key={a}>{`${x.label}: ${x.note}`}</Body>;
          })
        ) : (
          <Body>No common allergens listed. Check every ingredient you use.</Body>
        )}
        {!!recipe.safety && <Body>{recipe.safety}</Body>}
        {recipe.ingredients.map(ingredientLink).filter((l) => l?.warning).map((l) => (
          <Body key={l!.key} muted>{`${l!.name}: ${l!.warning}`}</Body>
        ))}
        <Body muted>{KITCHEN_SAFETY}</Body>
      </Card>

      {!!recipe.about && (
        <Card>
          <SectionLabel>Where it comes from</SectionLabel>
          <Body>{recipe.about}</Body>
        </Card>
      )}
      {!!recipe.notes && (
        <Card>
          <SectionLabel>Notes</SectionLabel>
          <Body>{recipe.notes}</Body>
        </Card>
      )}

      <View style={ui.actions}>
        {session ? (
          <Button label={kept ? 'Open it in my Grimoire' : 'Keep it in my Grimoire'} onPress={keep} disabled={!kept && !grimoire.canEdit} />
        ) : (
          <Body muted>Sign in to keep recipes in your Grimoire, under Kitchen witchery.</Body>
        )}
        <Button label="Find a good time to cook it" variant="outline" onPress={go(`/rituals/craft/cosmic/timing${q({ intent: recipe.intent, title: recipe.title })}`)} />
        {own ? (
          <Button label="Edit this recipe" variant="text" onPress={go(`${HEARTH}/recipes/edit${q({ id: own.id })}`)} />
        ) : (
          <Button label="Make my own version" variant="text" onPress={go(`${HEARTH}/recipes/edit${q({ from: id })}`)} />
        )}
      </View>
    </RitualScreen>
  );
}
