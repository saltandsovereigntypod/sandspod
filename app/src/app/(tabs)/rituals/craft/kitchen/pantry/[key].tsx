import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, Chip, Chips, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { PANTRY_GROUPS, pantryItem, pantryLibraryId } from '../../../../../../lib/craft/kitchen/pantry';
import { ritualsLibraryHref } from '../../../../../../lib/library';
import { intentionByKey } from '../../../../../../lib/rituals/planner';
import { filterPremade, PREMADE } from '../../../../../../lib/rituals/premade';

export default function PantryItemView() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const item = pantryItem(key);
  const workings = useMemo(() => {
    if (!item) return [];
    const words = [item.name.split(/[ (&]/)[0], ...(item.aliases ?? []).slice(0, 2)];
    const seen = new Set<string>();
    return words
      .flatMap((w) => filterPremade(PREMADE, { practice: 'kitchen', query: w }))
      .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
      .slice(0, 4);
  }, [item]);

  if (!item) {
    return (
      <RitualScreen back="Pantry correspondences">
        <Title>Not found</Title>
        <Body>That isn’t on the pantry shelf any more.</Body>
      </RitualScreen>
    );
  }

  const libraryId = pantryLibraryId(item);
  const group = PANTRY_GROUPS.find((g) => g.key === item.group)?.label;

  return (
    <RitualScreen back="Pantry correspondences">
      <Title eyebrow={group}>{item.name}</Title>
      <Chips>
        <Chip label={`Element: ${item.element}`} />
        <Chip label={`Planet: ${item.planet}`} />
      </Chips>
      {!!item.also && <Body muted>{item.also}</Body>}
      <Body>{item.uses.map((u, i) => (i === 0 ? u[0].toUpperCase() + u.slice(1) : u)).join(', ')}.</Body>

      {libraryId ? (
        <Card accent>
          <SectionLabel>In the Living Library</SectionLabel>
          <Body>{`${item.name} has a full entry in the Library, with its meaning, how to use it, what it pairs with and its place in each tradition.`}</Body>
          <Button label={`Open ${item.name} in the Library`} onPress={() => router.push(ritualsLibraryHref({ id: libraryId }))} />
        </Card>
      ) : (
        <Card>
          <SectionLabel>Lore and meaning</SectionLabel>
          <Body>{item.about}</Body>
        </Card>
      )}

      <Card>
        <SectionLabel>In the kitchen</SectionLabel>
        <Body>{item.kitchen}</Body>
      </Card>

      <Card accent>
        <SectionLabel>Take care</SectionLabel>
        <Body>{item.safety}</Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Make a simmer pot for</SectionLabel>
        <Chips>
          {item.intentions.map((key) => (
            <Chip
              key={key}
              label={intentionByKey(key)?.label ?? key}
              hint="Opens the simmer pot"
              onPress={() => router.push({ pathname: '/rituals/craft/kitchen/simmer', params: { intention: key } } as unknown as Href)}
            />
          ))}
        </Chips>
      </View>

      {workings.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>In the kitchen spell book</SectionLabel>
          <List>
            {workings.map((p, i, all) => (
              <Row
                key={p.id}
                icon="wheel"
                title={p.title}
                detail={`${p.kind === 'spell' ? 'Spell' : 'Ritual'} · ${p.minutes} min`}
                last={i === all.length - 1}
                onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: p.id } })}
              />
            ))}
          </List>
        </View>
      )}

      <Body muted>Correspondences follow the common modern lists; traditions differ, and your own experience of a thing counts too.</Body>
    </RitualScreen>
  );
}
