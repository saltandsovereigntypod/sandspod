import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { ForageFirst, go, HEARTH, q, useDayContext } from '../../../../../../components/craft/hearth';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { herbName } from '../../../../../../lib/craft/green/garden';
import { DANGER_LABELS, forageByKey, forageSpan, USE_LABELS } from '../../../../../../lib/craft/hearth/forage';
import { starterRecipe } from '../../../../../../lib/craft/hearth/recipes';
import { ritualsLibraryHref } from '../../../../../../lib/library';
import { type } from '../../../../../../theme';

// One wild plant: when and where, how to know it, its look-alikes (the deadly
// first), how to take it with care, its safety, and its Library page.
export default function ForagePlantScreen() {
  const { key } = useLocalSearchParams<{ key?: string }>();
  const { hemisphere } = useDayContext();
  const plant = forageByKey(key);
  if (!plant) {
    return (
      <RitualScreen back="Foraging & garden">
        <Title>A wild plant</Title>
        <Body>This plant isn’t in the foraging notes.</Body>
      </RitualScreen>
    );
  }
  const library = (k: string) => () => router.push(ritualsLibraryHref({ id: `traditional:herb:${k}` }) as Href);

  return (
    <RitualScreen back="Foraging & garden">
      <Title eyebrow={plant.latin}>{plant.name}</Title>
      <Body>{`${plant.parts} · ${forageSpan(plant, hemisphere)} · ${USE_LABELS[plant.use]}`}</Body>
      <Body muted>{plant.when}</Body>

      <ForageFirst />

      <Card>
        <SectionLabel>Where it grows</SectionLabel>
        <Body>{plant.where}</Body>
        <SectionLabel>How to know it</SectionLabel>
        <Body>{plant.know}</Body>
        <Body muted>Never enough on its own: check it against a field guide for your region, every time.</Body>
      </Card>

      {plant.lookAlikes.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Look-alikes</SectionLabel>
          {plant.lookAlikes.map((l) => (
            <Card key={l.name} accent={l.danger === 'deadly'}>
              <Text style={type.eyebrow}>{DANGER_LABELS[l.danger]}</Text>
              <Text style={type.cardTitle}>{l.name}</Text>
              <Body>{l.tell}</Body>
              {!!l.library && <Button label={`${herbName(l.library) ?? l.name} in the Living Library`} variant="text" onPress={library(l.library)} />}
            </Card>
          ))}
        </View>
      )}

      <Card>
        <SectionLabel>Taking it with care</SectionLabel>
        <Body>{plant.care}</Body>
        <SectionLabel>Safety</SectionLabel>
        <Body>{plant.caution}</Body>
      </Card>

      <List>
        {!!plant.library && <Row icon="grimoire" title={`${herbName(plant.library)} in the Living Library`} detail="Its lore, correspondences and how it’s used" onPress={library(plant.library)} />}
        {(plant.recipes ?? []).map((id) => (
          <Row key={id} icon="rituals" title={`Recipe: ${starterRecipe(id)?.title}`} detail="Kitchen witchery" onPress={go(`${HEARTH}/recipes/recipe${q({ id })}`)} />
        ))}
        <Row icon="wheel" title="It grows on one of my places" detail="Note the patch, to know when to go back" onPress={go(`${HEARTH}/forage/patch-edit${q({ forage: plant.key })}`)} />
        <Row icon="grimoire" title="Log a harvest of it" detail="With the moon it was gathered under" onPress={go(`${HEARTH}/forage/harvest-edit${q({ forage: plant.key })}`)} />
        <Row icon="calendar" title="Note it on the land" detail="In bloom, in fruit, or first seen this year" last onPress={go(`${HEARTH}/land/note-edit${q({ herb: plant.library })}`)} />
      </List>
    </RitualScreen>
  );
}
