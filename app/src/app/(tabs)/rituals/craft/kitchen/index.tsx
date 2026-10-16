import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { TIDE_GUIDES, homeTide } from '../../../../../lib/craft/kitchen/moonhome';
import { CRAFT_TOOLS } from '../../../../../lib/craft/practices';
import { PRACTICES } from '../../../../../lib/rituals/premade';
import type { IconName } from '../../../../../components/Icon';

const ROUTES: Record<string, { href: Href; icon: IconName }> = {
  'Pantry correspondences': { href: '/rituals/craft/kitchen/pantry' as Href, icon: 'grimoire' },
  'Simmer pot': { href: '/rituals/craft/kitchen/simmer' as Href, icon: 'altar' },
  'Home by the moon': { href: '/rituals/craft/kitchen/moon' as Href, icon: 'calendar' },
  'Kitchen spell book': { href: '/rituals/craft/kitchen/spells' as Href, icon: 'rituals' },
};

// Kitchen & hearth: the cupboard, the stove and the house as the working space.
export default function KitchenPractice() {
  const about = PRACTICES.find((p) => p.id === 'kitchen');
  const tools = CRAFT_TOOLS.kitchen;
  const guide = useMemo(() => TIDE_GUIDES[homeTide(new Date())], []);

  return (
    <RitualScreen back="My practice">
      <Title eyebrow="My practice">{about?.name ?? 'Kitchen & hearth'}</Title>
      {!!about && <Body muted>{about.about}</Body>}

      <Card accent>
        <SectionLabel>{`In the house tonight · ${guide.label}`}</SectionLabel>
        <Body>{guide.summary}</Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Tools</SectionLabel>
        <List>
          {tools.map((tool, i) => {
            const route = ROUTES[tool.title];
            return (
              <Row
                key={tool.title}
                icon={route?.icon ?? 'rituals'}
                title={tool.title}
                detail={tool.detail}
                last={i === tools.length - 1}
                onPress={() => route && router.push(route.href)}
              />
            );
          })}
        </List>
      </View>

      <List>
        <Row
          icon="wheel"
          title="Premade workings"
          detail="Every ritual and spell, filter by Kitchen & hearth"
          last
          onPress={() => router.push('/rituals/premade')}
        />
      </List>
    </RitualScreen>
  );
}
