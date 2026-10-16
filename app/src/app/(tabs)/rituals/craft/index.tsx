import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { Body, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { CRAFT_TOOLS } from '../../../../lib/craft/practices';
import { JOURNEYS_LIVE } from '../../../../lib/journeys';
import { myPractices, PRACTICES, type Practice } from '../../../../lib/rituals/premade';
import { useMySettings } from '../../../../lib/settings/store';

// My practice: a page of tools for each kind of practice, yours first.
export default function CraftHub() {
  const { settings } = useMySettings();
  const mine = myPractices(settings);
  const chosen = PRACTICES.filter((p) => mine.includes(p.id));
  const others = PRACTICES.filter((p) => !mine.includes(p.id));

  const row = (p: Practice, i: number, all: Practice[]) => (
    <Row
      key={p.id}
      icon="wheel"
      title={p.name}
      detail={CRAFT_TOOLS[p.id].map((t) => t.title).join(' · ')}
      last={i === all.length - 1}
      onPress={() => router.push(`/rituals/craft/${p.id}` as Href)}
    />
  );

  return (
    <RitualScreen back="Rituals">
      <Title eyebrow="Tools for your craft">My practice</Title>
      {chosen.length ? (
        <View style={ui.gapSmall}>
          <SectionLabel>Your practice</SectionLabel>
          <List>{chosen.map(row)}</List>
        </View>
      ) : (
        <Body muted>Choose your practice in Settings → My practice to put its tools first. Every practice’s tools are open to you either way.</Body>
      )}
      <View style={ui.gapSmall}>
        <SectionLabel>{chosen.length ? 'Other practices' : 'Practices'}</SectionLabel>
        <List>{others.map(row)}</List>
      </View>
      <List>
        {JOURNEYS_LIVE && (
          <Row
            icon="wheel"
            title="Dedication journeys"
            detail="A guided path to dedicating yourself to a tradition or a god"
            onPress={() => router.push('/rituals/journeys')}
          />
        )}
        <Row icon="grimoire" title="Choose my practice" detail="Settings → My practice" last onPress={() => router.push('/more/settings/practice')} />
      </List>
    </RitualScreen>
  );
}
