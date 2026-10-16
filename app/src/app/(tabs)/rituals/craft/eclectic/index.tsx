import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Body, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { CORRESPONDENCES, sampler, type MyCorrespondence } from '../../../../../lib/craft/eclectic/correspondences';
import { CRAFT_TOOLS } from '../../../../../lib/craft/practices';
import { useCraft } from '../../../../../lib/craft/store';
import { PRACTICES, PREMADE } from '../../../../../lib/rituals/premade';

// Eclectic: your own correspondences, and a little from every path.
export default function EclecticPractice() {
  const about = PRACTICES.find((p) => p.id === 'eclectic')?.about;
  const { entries } = useCraft<MyCorrespondence>(CORRESPONDENCES);
  const today = useMemo(() => new Date(), []);
  const picks = useMemo(() => sampler(today), [today]);
  const workings = useMemo(() => PREMADE.filter((p) => p.practices.includes('eclectic')), []);

  return (
    <RitualScreen back="My practice">
      <Title eyebrow="My practice">Eclectic</Title>
      {!!about && <Body muted>{about}</Body>}

      <View style={ui.gapSmall}>
        <SectionLabel>Tools</SectionLabel>
        <List>
          {CRAFT_TOOLS.eclectic.map((tool, i, all) => (
            <Row
              key={tool.title}
              icon="grimoire"
              title={tool.title}
              detail={entries.length ? `${entries.length} of your own · ${tool.detail.toLowerCase()}` : tool.detail}
              last={i === all.length - 1}
              onPress={() => router.push('/rituals/craft/eclectic/correspondences' as Href)}
            />
          ))}
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>From every path</SectionLabel>
        <Body muted>One tool from each practice, changing day by day. Borrow freely; the whole kit is yours.</Body>
        <List>
          {picks.map((p, i, all) => (
            <Row
              key={p.practice}
              icon="wheel"
              title={p.tool.title}
              detail={`${p.practiceName} · ${p.tool.detail}`}
              last={i === all.length - 1}
              onPress={() => router.push(`/rituals/craft/${p.practice}` as Href)}
            />
          ))}
        </List>
      </View>

      {workings.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Eclectic workings</SectionLabel>
          <List>
            {workings.map((p, i, all) => (
              <Row
                key={p.id}
                icon="rituals"
                title={p.title}
                detail={`${p.kind === 'spell' ? 'Spell' : 'Ritual'} · ${p.minutes} min`}
                last={i === all.length - 1}
                onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: p.id } })}
              />
            ))}
          </List>
        </View>
      )}

      <List>
        <Row
          icon="wheel"
          title="All premade workings"
          detail="Rituals and spells from every practice · filter by Eclectic"
          last
          onPress={() => router.push('/rituals/premade')}
        />
      </List>
    </RitualScreen>
  );
}
