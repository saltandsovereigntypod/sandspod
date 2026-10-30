import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { TermText } from '../../../../../components/astro/Explain';
import { useCharts } from '../../../../../components/astro/useCharts';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { todayLine } from '../../../../../lib/astro/craftLinks';
import { currentHour } from '../../../../../lib/astro/hours';
import { bigThreeLine } from '../../../../../lib/astro/natal';
import { timeOfDay } from '../../../../../lib/calendar';
import { HOUR_SUITS } from '../../../../../lib/craft/cosmic/hours';
import { CRAFT_TOOLS } from '../../../../../lib/craft/practices';
import { usePlace } from '../../../../../lib/location';
import { PRACTICES } from '../../../../../lib/rituals/premade';
import { type } from '../../../../../theme';

const ROUTES = ['/rituals/craft/cosmic/chart', '/rituals/craft/cosmic/hours', '/rituals/craft/cosmic/course'];

// Cosmic & celestial practice: your charts, the planetary days and hours, and learning astrology.
export default function CosmicPractice() {
  const about = PRACTICES.find((p) => p.id === 'cosmic')?.about;
  const tools = CRAFT_TOOLS.cosmic;
  const { mine, charts } = useCharts();
  const chart = mine?.chart ?? null;
  const place = usePlace();
  const now = useMemo(() => new Date(), []);
  const hour = place ? currentHour(now, place) : null;
  const line = useMemo(() => (chart ? todayLine(chart, now) : null), [chart, now]);
  const details = [chart ? bigThreeLine(chart) : null, hour ? `${hour.planet} hour until ${timeOfDay(hour.end)}` : null, null];

  return (
    <RitualScreen back="Craft tools">
      <Title eyebrow="Craft tools">Cosmic & celestial</Title>
      {!!about && <Body muted>{about}</Body>}

      {hour && (
        <Card accent>
          <SectionLabel>This hour</SectionLabel>
          <TermText style={type.cardTitle} text={`The hour of ${hour.planet}`} />
          <Body muted>{`Until ${timeOfDay(hour.end)}. Good for ${HOUR_SUITS[hour.planet].short}.`}</Body>
        </Card>
      )}
      {line && (
        <Card>
          <SectionLabel>The sky on your chart today</SectionLabel>
          <TermText style={type.body} text={line.line} />
          <Text style={type.caption} onPress={() => router.push({ pathname: '/rituals/craft/cosmic/chart', params: { tab: 'transits' } } as unknown as Href)}>
            All your transits ›
          </Text>
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Tools</SectionLabel>
        <List>
          {tools.map((tool, i) => (
            <Row key={tool.title} icon={i === 1 ? 'calendar' : 'wheel'} title={tool.title} detail={details[i] ?? tool.detail} onPress={() => router.push(ROUTES[i] as Href)} />
          ))}
          <Row icon="wheel" title="Astrology glossary" detail="Every term explained, simply or in depth" onPress={() => router.push('/rituals/craft/cosmic/learn' as Href)} />
          <Row
            icon="wheel"
            title="All charts"
            detail={charts.length ? `${charts.length} kept, privately · synastry` : 'Yours and others’, kept privately'}
            last
            onPress={() => router.push('/rituals/craft/cosmic/charts' as Href)}
          />
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
