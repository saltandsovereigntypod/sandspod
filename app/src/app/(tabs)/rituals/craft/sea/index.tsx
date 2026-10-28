import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { shortDate } from '../../../../../lib/calendar';
import { CRAFT_TOOLS } from '../../../../../lib/craft/practices';
import { FINDS, findTitle, type ShoreFind } from '../../../../../lib/craft/sea/finds';
import { nextRange, RANGE_WORDS, rangeStage } from '../../../../../lib/craft/sea/tides';
import { useCraft } from '../../../../../lib/craft/store';
import { PRACTICES, PREMADE } from '../../../../../lib/rituals/premade';
import { type } from '../../../../../theme';

const ROUTES: Record<string, Href> = {
  Tides: '/rituals/craft/sea/tides' as Href,
  'Shore finds': '/rituals/craft/sea/finds' as Href,
};

// Sea: the tides and the shore.
export default function SeaPractice() {
  const about = PRACTICES.find((p) => p.id === 'sea')?.about;
  const { entries } = useCraft<ShoreFind>(FINDS);
  const now = useMemo(() => new Date(), []);
  const stage = rangeStage(now);
  const springs = nextRange(now, 'spring');
  const neaps = nextRange(now, 'neap');
  const words = RANGE_WORDS[stage.stage];
  const workings = PREMADE.filter((p) => p.practices.includes('sea')).length;

  const detail = (title: string, fallback: string) => {
    if (title === 'Shore finds' && entries.length) {
      return `${entries.length} logged · latest ${findTitle(entries[0].data).toLowerCase()}`;
    }
    if (title === 'Tides') return `${words.title} now · ${fallback}`;
    return fallback;
  };

  return (
    <RitualScreen back="Craft tools">
      <Title eyebrow="Craft tools">Sea</Title>
      {!!about && <Body muted>{about}</Body>}

      <Card accent>
        <Text style={type.eyebrow}>The sea this week</Text>
        <Text style={type.cardTitle}>{words.title}</Text>
        <Body>{words.body}</Body>
        <Body muted>
          {stage.stage === 'spring' ? 'These springs' : 'Next springs'} around {shortDate(springs.peak)}
          {springs.perigean ? ', with the moon close: king tides' : ''}. {stage.stage === 'neap' ? 'These neaps' : 'Next neaps'} around{' '}
          {shortDate(neaps.peak)}.
        </Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Tools</SectionLabel>
        <List>
          {CRAFT_TOOLS.sea.map((tool, i, all) => (
            <Row
              key={tool.title}
              icon={tool.title === 'Tides' ? 'calendar' : 'altar'}
              title={tool.title}
              detail={detail(tool.title, tool.detail)}
              last={i === all.length - 1}
              onPress={() => router.push(ROUTES[tool.title])}
            />
          ))}
        </List>
      </View>

      <List>
        <Row
          icon="wheel"
          title="Premade sea workings"
          detail={workings ? `${workings} rituals and spells · filter by Sea` : 'Rituals and spells for every practice'}
          last
          onPress={() => router.push({ pathname: '/rituals/premade', params: { practice: 'sea' } })}
        />
      </List>
    </RitualScreen>
  );
}
