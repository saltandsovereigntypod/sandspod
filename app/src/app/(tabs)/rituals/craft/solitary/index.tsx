import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { CRAFT_TOOLS } from '../../../../../lib/craft/practices';
import { dateKey, daysByDate, devotionFor, eveningFirst, type DevotionDay } from '../../../../../lib/craft/solitary/devotion';
import { useCraft } from '../../../../../lib/craft/store';
import { PRACTICES } from '../../../../../lib/rituals/premade';

const ROUTES: Record<string, Href> = {
  'Daily devotion': '/rituals/craft/solitary/devotion' as Href,
};

// Solitary: practice kept alone, day by day.
export default function SolitaryPractice() {
  const about = PRACTICES.find((p) => p.id === 'solitary');
  const tools = CRAFT_TOOLS.solitary;
  const now = useMemo(() => new Date(), []);
  const key = dateKey(now);
  const today = useMemo(() => devotionFor(key), [key]);
  const { entries } = useCraft<DevotionDay>('solitary.devotions');
  const kept = useMemo(() => daysByDate(entries).get(key), [entries, key]);
  const evening = eveningFirst(now);
  const prompt = evening ? today.evening : today.morning;
  const state = [kept?.morning ? 'Morning kept' : null, kept?.evening ? 'Evening kept' : null].filter(Boolean).join(' · ');

  return (
    <RitualScreen back="Craft tools">
      <Title eyebrow="Craft tools">{about?.name ?? 'Solitary'}</Title>
      {!!about && <Body muted>{about.about}</Body>}

      <Card accent>
        <SectionLabel>{evening ? 'This evening' : 'This morning'}</SectionLabel>
        <Body>{prompt.title}</Body>
        <Body muted>{state || 'Waiting for you, whenever you’re ready.'}</Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Tools</SectionLabel>
        <List>
          {tools.map((tool, i) => (
            <Row
              key={tool.title}
              icon="altar"
              title={tool.title}
              detail={tool.detail}
              last={i === tools.length - 1}
              onPress={() => ROUTES[tool.title] && router.push(ROUTES[tool.title])}
            />
          ))}
        </List>
      </View>

      <List>
        <Row
          icon="wheel"
          title="Premade workings"
          detail="Every ritual and spell, filter by Solitary"
          last
          onPress={() => router.push({ pathname: '/rituals/premade', params: { practice: 'solitary' } })}
        />
      </List>
    </RitualScreen>
  );
}
