import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { LandCard } from '../../../../../components/craft/LandCard';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { relativeDay } from '../../../../../lib/calendar';
import { customsAhead } from '../../../../../lib/craft/folk/calendar';
import { LORE } from '../../../../../lib/craft/folk/lore';
import { BY_MONTH, monthName, seasonalMonth } from '../../../../../lib/craft/folk/weather';
import { CRAFT_TOOLS } from '../../../../../lib/craft/practices';
import { useCraft } from '../../../../../lib/craft/store';
import { usePlace } from '../../../../../lib/location';
import { PRACTICES } from '../../../../../lib/rituals/premade';
import { type } from '../../../../../theme';

const ROUTES = ['/rituals/craft/folk/calendar', '/rituals/craft/folk/lore', '/rituals/craft/folk/weather'];

// Traditional & folk practice: the old customs of the year, your own local lore, and weather sayings.
export default function FolkPractice() {
  const about = PRACTICES.find((p) => p.id === 'folk')?.about;
  const tools = CRAFT_TOOLS.folk;
  const place = usePlace();
  const now = useMemo(() => new Date(), []);
  const ahead = useMemo(() => customsAhead(now, 30), [now]);
  const lore = useCraft<unknown>(LORE).entries;
  const next = ahead[0];
  const month = seasonalMonth(now.getMonth(), place?.latitude);
  const saying = BY_MONTH[month][now.getDate() % BY_MONTH[month].length];

  const details = [
    next ? `Next: ${next.custom.name}, ${next.inDays === 0 ? 'now' : relativeDay(now, next.date)}` : null,
    lore.length ? `${lore.length} ${lore.length === 1 ? 'entry' : 'entries'}` : null,
    `${monthName(now.getMonth())}’s sayings`,
  ];

  return (
    <RitualScreen back="Craft tools">
      <Title eyebrow="Craft tools">Traditional & folk</Title>
      {!!about && <Body muted>{about}</Body>}

      {next && (
        <Card accent>
          <SectionLabel>{next.inDays === 0 ? 'In the old calendar now' : `In the old calendar ${relativeDay(now, next.date)}`}</SectionLabel>
          <Text style={type.cardTitle}>{next.custom.name}</Text>
          <Body muted>{next.custom.region}</Body>
          <Body>{next.custom.keep}</Body>
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Tools</SectionLabel>
        <List>
          {tools.map((tool, i) => (
            <Row
              key={tool.title}
              icon={i === 0 ? 'calendar' : i === 1 ? 'grimoire' : 'wheel'}
              title={tool.title}
              detail={details[i] ?? tool.detail}
              last={i === tools.length - 1}
              onPress={() => router.push(ROUTES[i] as Href)}
            />
          ))}
        </List>
      </View>

      {saying && (
        <Card>
          <SectionLabel>An old saying</SectionLabel>
          <Text style={type.cardTitle}>{saying.saying}</Text>
        </Card>
      )}

      <LandCard />

      <List>
        <Row icon="rituals" title="Folk workings" detail="Premade rituals and spells; filter by Traditional & folk" last onPress={() => router.push({ pathname: '/rituals/premade', params: { practice: 'folk' } })} />
      </List>
    </RitualScreen>
  );
}
