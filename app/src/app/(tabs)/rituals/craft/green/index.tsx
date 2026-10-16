import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { LandCard } from '../../../../../components/craft/LandCard';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { gardenNight, eveningOf, QUARTERS } from '../../../../../lib/craft/green/moonGarden';
import { PLANTS, asPlant, isGrowing } from '../../../../../lib/craft/green/garden';
import { CRAFT_TOOLS } from '../../../../../lib/craft/practices';
import { useCraft } from '../../../../../lib/craft/store';
import { PRACTICES } from '../../../../../lib/rituals/premade';
import { type } from '../../../../../theme';

const ROUTES = ['/rituals/craft/green/moon', '/rituals/craft/green/season', '/rituals/craft/green/garden'];

// Green practice: the garden by the moon, what's in season, and your own plants.
export default function GreenPractice() {
  const about = PRACTICES.find((p) => p.id === 'green')?.about;
  const tools = CRAFT_TOOLS.green;
  const night = useMemo(() => gardenNight(eveningOf(new Date())), []);
  const { entries } = useCraft<unknown>(PLANTS);
  const growing = entries.filter((e) => isGrowing(asPlant(e.data))).length;

  const details = [
    `${QUARTERS[night.quarter].short} · ${night.phase}`,
    null,
    growing ? `${growing} ${growing === 1 ? 'plant' : 'plants'} growing` : null,
  ];

  return (
    <RitualScreen back="My practice">
      <Title eyebrow="My practice">Green</Title>
      {!!about && <Body muted>{about}</Body>}

      <Card accent>
        <SectionLabel>Tonight in the garden</SectionLabel>
        <Text style={type.cardTitle}>{QUARTERS[night.quarter].headline}</Text>
        <Body muted>{`${night.phase}, moon in ${night.sign}`}</Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Tools</SectionLabel>
        <List>
          {tools.map((tool, i) => (
            <Row
              key={tool.title}
              icon={i === 0 ? 'calendar' : i === 1 ? 'wheel' : 'grimoire'}
              title={tool.title}
              detail={details[i] ?? tool.detail}
              last={i === tools.length - 1}
              onPress={() => router.push(ROUTES[i] as Href)}
            />
          ))}
        </List>
      </View>

      <LandCard />

      <List>
        <Row icon="rituals" title="Green workings" detail="Premade rituals and spells; filter by Green" last onPress={() => router.push({ pathname: '/rituals/premade', params: { practice: 'green' } })} />
      </List>
    </RitualScreen>
  );
}
