import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { currentHour } from '../../../../../lib/astro/hours';
import { timeOfDay } from '../../../../../lib/calendar';
import { natalChart, natalOf, type ChartInput } from '../../../../../lib/craft/cosmic/chart';
import { CHART } from '../../../../../lib/craft/cosmic/collections';
import { HOUR_SUITS } from '../../../../../lib/craft/cosmic/hours';
import { CRAFT_TOOLS } from '../../../../../lib/craft/practices';
import { useCraft } from '../../../../../lib/craft/store';
import { usePlace } from '../../../../../lib/location';
import { PRACTICES } from '../../../../../lib/rituals/premade';
import { type } from '../../../../../theme';

const ROUTES = ['/rituals/craft/cosmic/chart', '/rituals/craft/cosmic/hours'];

// Cosmic & celestial practice: your chart, and the hours of the day.
export default function CosmicPractice() {
  const about = PRACTICES.find((p) => p.id === 'cosmic')?.about;
  const tools = CRAFT_TOOLS.cosmic;
  const { entries } = useCraft<ChartInput>(CHART);
  const chart = useMemo(() => (entries[0] ? natalChart(entries[0].data) : null), [entries]);
  const place = usePlace();
  const now = new Date();
  const hour = place ? currentHour(now, place) : null;

  const bigThree = chart
    ? [`Sun ${natalOf(chart, 'Sun').sign}`, `Moon ${natalOf(chart, 'Moon').sign}`, chart.ascendant ? `${chart.ascendant.sign} rising` : null]
        .filter(Boolean)
        .join(' · ')
    : null;
  const details = [bigThree, hour ? `${hour.planet} hour until ${timeOfDay(hour.end)}` : null];

  return (
    <RitualScreen back="Craft tools">
      <Title eyebrow="Craft tools">Cosmic & celestial</Title>
      {!!about && <Body muted>{about}</Body>}

      {hour && (
        <Card accent>
          <SectionLabel>This hour</SectionLabel>
          <Text style={type.cardTitle}>{`The hour of ${hour.planet}`}</Text>
          <Body muted>{`Until ${timeOfDay(hour.end)}. Good for ${HOUR_SUITS[hour.planet].short}.`}</Body>
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Tools</SectionLabel>
        <List>
          {tools.map((tool, i) => (
            <Row
              key={tool.title}
              icon={i === 0 ? 'wheel' : 'calendar'}
              title={tool.title}
              detail={details[i] ?? tool.detail}
              last={i === tools.length - 1}
              onPress={() => router.push(ROUTES[i] as Href)}
            />
          ))}
        </List>
      </View>

      <List>
        <Row icon="today" title="The sky today" detail="Planets, retrogrades and eclipses" onPress={() => router.push('/today/sky' as Href)} />
        <Row
          icon="rituals"
          title="Cosmic workings"
          detail="Premade rituals and spells; filter by Cosmic & celestial"
          last
          onPress={() => router.push({ pathname: '/rituals/premade', params: { practice: 'cosmic' } })}
        />
      </List>
    </RitualScreen>
  );
}
