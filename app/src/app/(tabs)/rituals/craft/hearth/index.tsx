import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { LandCard } from '../../../../../components/craft/LandCard';
import { go, HEARTH, q, useDayContext, useLand } from '../../../../../components/craft/hearth';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { forageInMonth } from '../../../../../lib/craft/hearth/forage';
import { thisTimeLastYear } from '../../../../../lib/craft/hearth/land';
import { allRecipes, festivalFoodsAhead, RECIPES } from '../../../../../lib/craft/hearth/recipes';
import { useCraft } from '../../../../../lib/craft/store';
import { type } from '../../../../../theme';

// Hearth & land: the land journal, foraging and the garden, and kitchen
// witchery, together. Practice → Craft keeps it as its own group; the
// website's twin is /practice/hearth/.
export default function HearthHome() {
  const now = useMemo(() => new Date(), []);
  const { choice, hemisphere } = useDayContext();
  const { notes, places } = useLand();
  const mine = useCraft<unknown>(RECIPES).entries;
  const feasts = useMemo(() => festivalFoodsAhead(now, choice, 21, allRecipes(mine)), [now, choice, mine]);
  const gather = forageInMonth(now.getMonth() + 1, hemisphere).map((p) => p.name);
  const lastYear = thisTimeLastYear(notes, now)[0];

  return (
    <RitualScreen back="Craft">
      <Title eyebrow="Craft">Hearth & land</Title>
      <Body muted>The places you know and what they do through the year, what grows there to gather, and what the kitchen makes of it.</Body>

      {(feasts.length > 0 || gather.length > 0) && (
        <Card accent>
          <SectionLabel>This season</SectionLabel>
          {feasts[0] && <Text style={type.cardTitle}>{`${feasts[0].name} ${feasts[0].inDays === 0 ? 'today' : feasts[0].inDays === 1 ? 'tomorrow' : `in ${feasts[0].inDays} days`}: ${feasts[0].recipes.map((r) => r.recipe.title).join(', ')}`}</Text>}
          {gather.length > 0 && <Body>{`In the hedgerow: ${gather.slice(0, 5).join(', ')}.`}</Body>}
          {lastYear && <Body muted>{`This time ${lastYear.yearsAgo === 1 ? 'last year' : `${lastYear.yearsAgo} years ago`} you noted ${lastYear.notes.length} ${lastYear.notes.length === 1 ? 'thing' : 'things'}.`}</Body>}
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>The land</SectionLabel>
        <List>
          <Row icon="wheel" title="Land journal" detail={places.length ? `${places.length} ${places.length === 1 ? 'place' : 'places'} · ${notes.length} ${notes.length === 1 ? 'note' : 'notes'}` : 'Your places and what they do through the year'} onPress={go(`${HEARTH}/land`)} />
          <Row icon="calendar" title="This time last year" detail="What you noticed in these weeks of earlier years" onPress={go(`${HEARTH}/land/last-year`)} />
          <Row icon="grimoire" title="Note what you see today" detail="Weather, frost, birdsong, blooms, water, an offering" last onPress={go(`${HEARTH}/land/note-edit`)} />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Foraging & garden</SectionLabel>
        <List>
          <Row icon="wheel" title="Foraging & garden" detail="What grows where, and what to gather this month" onPress={go(`${HEARTH}/forage`)} />
          <Row icon="grimoire" title="Harvests & store cupboard" detail="What you’ve gathered and kept" onPress={go(`${HEARTH}/forage/harvests`)} />
          <Row icon="calendar" title="Planting by the moon" detail="On Green · folk tradition, offered as a rhythm, not a rule" onPress={go('/rituals/craft/green/moon')} />
          <Row icon="grimoire" title="My garden" detail="On Green · your plants, sowings and harvests" last onPress={go('/rituals/craft/green/garden')} />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Kitchen witchery</SectionLabel>
        <List>
          <Row icon="rituals" title="Recipes with intent" detail="Festival foods, offerings and your own, kept in your Grimoire" onPress={go(`${HEARTH}/recipes`)} />
          <Row icon="grimoire" title="Write a recipe" detail="Your own, with its intent and correspondences" onPress={go(`${HEARTH}/recipes/edit`)} />
          <Row icon="grimoire" title="Pantry correspondences" detail="On Kitchen & hearth · salt, honey and the cupboard" onPress={go('/rituals/craft/kitchen/pantry')} />
          <Row icon="calendar" title="Find a good time to cook" detail="The spell timing advisor" last onPress={go(`/rituals/craft/cosmic/timing${q({ title: 'Kitchen witchery' })}`)} />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Elsewhere</SectionLabel>
        <List>
          <Row icon="altar" title="Offerings on the altar" detail="The cabinet’s Offerings drawer: bread, milk, honey and the rest" onPress={go('/altar')} />
          <Row icon="altar" title="Apothecary" detail="Jars, sachets and oils made from what you gather" onPress={go('/rituals/apothecary')} />
          <Row icon="today" title="Cycle & Moon" detail="The moon tonight, and your own cycle beside it" onPress={go('/rituals/cycle')} />
          <Row icon="wheel" title="Local lore" detail="On Traditional & folk · the stories and spirits of your places" last onPress={go('/rituals/craft/folk/lore')} />
        </List>
      </View>

      <LandCard />
    </RitualScreen>
  );
}
