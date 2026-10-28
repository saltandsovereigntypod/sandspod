import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { Body, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { CRAFT_TOOLS } from '../../../../lib/craft/practices';
import { CRAFT_TOOLS as CRAFT_TOOLS_TITLE, YOUR_CRAFTS } from '../../../../lib/names';
import { myPractices, PRACTICES, type Practice } from '../../../../lib/rituals/premade';
import { useMySettings } from '../../../../lib/settings/store';

// Craft tools: a page of tools for each kind of practice, yours first.
// (Dedication journeys are on the Rituals home, under Learn.)
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
      <Title eyebrow="Tools for your craft">{CRAFT_TOOLS_TITLE}</Title>
      {chosen.length ? (
        <View style={ui.gapSmall}>
          <SectionLabel>Your crafts</SectionLabel>
          <List>{chosen.map(row)}</List>
        </View>
      ) : (
        <Body muted>{`Choose your crafts in Settings → ${YOUR_CRAFTS} to put their tools first. Every practice’s tools are open to you either way.`}</Body>
      )}
      <View style={ui.gapSmall}>
        <SectionLabel>{chosen.length ? 'Other practices' : 'Practices'}</SectionLabel>
        <List>{others.map(row)}</List>
      </View>
      <List>
        <Row icon="grimoire" title="Choose your crafts" detail={`Settings → ${YOUR_CRAFTS}`} last onPress={() => router.push('/more/settings/practice')} />
      </List>
    </RitualScreen>
  );
}
