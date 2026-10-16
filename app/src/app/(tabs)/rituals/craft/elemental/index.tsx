import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { dayElement, ELEMENT_GUIDES } from '../../../../../lib/craft/elemental/balance';
import { CRAFT_TOOLS } from '../../../../../lib/craft/practices';
import { PRACTICES } from '../../../../../lib/rituals/premade';
import { type } from '../../../../../theme';

const ROUTES = ['/rituals/craft/elemental/balance', '/rituals/craft/elemental/weather'];

// Elemental practice: the balance of the four in your own work, and the weather ahead.
export default function ElementalPractice() {
  const about = PRACTICES.find((p) => p.id === 'elemental')?.about;
  const tools = CRAFT_TOOLS.elemental;
  const today = useMemo(() => dayElement(new Date()), []);
  const guide = ELEMENT_GUIDES[today.element];

  return (
    <RitualScreen back="My practice">
      <Title eyebrow="My practice">Elemental</Title>
      {!!about && <Body muted>{about}</Body>}

      <Card accent>
        <SectionLabel>{`Today · ${today.planet === 'Sun' || today.planet === 'Moon' ? `the ${today.planet}’s` : `${today.planet}’s`} day`}</SectionLabel>
        <Text style={type.cardTitle}>{`A ${today.element.toLowerCase()} day`}</Text>
        <Body muted>{guide.qualities}</Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Tools</SectionLabel>
        <List>
          {tools.map((tool, i) => (
            <Row
              key={tool.title}
              icon={i === 0 ? 'wheel' : 'calendar'}
              title={tool.title}
              detail={tool.detail}
              last={i === tools.length - 1}
              onPress={() => router.push(ROUTES[i] as Href)}
            />
          ))}
        </List>
      </View>

      <List>
        <Row icon="rituals" title="Elemental workings" detail="Premade rituals and spells; filter by Elemental" last onPress={() => router.push('/rituals/premade' as Href)} />
      </List>
    </RitualScreen>
  );
}
