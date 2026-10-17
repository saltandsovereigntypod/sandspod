import { router, useLocalSearchParams, type Href } from 'expo-router';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, RitualScreen, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import { LORE, loreKindLabel, normalizeLore } from '../../../../../../lib/craft/folk/lore';
import { useCraft } from '../../../../../../lib/craft/store';

export default function LorePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, ready } = useCraft<unknown>(LORE);
  const raw = entries.find((e) => e.id === id) ?? null;

  if (!raw) {
    return (
      <RitualScreen back="Local lore">
        <Title>Lore</Title>
        <Body>{ready ? 'This entry couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }

  const lore = normalizeLore(raw.data);
  const heard = fullDate(lore.heard);

  return (
    <RitualScreen back="Local lore">
      <Title eyebrow={[loreKindLabel(lore.kind), lore.where].filter(Boolean).join(' · ')}>{lore.title || 'Untitled'}</Title>
      {!!lore.lore && <Body>{lore.lore}</Body>}
      {(!!lore.source || !!heard) && (
        <View style={ui.gapSmall}>
          <SectionLabel>Heard from</SectionLabel>
          <Body muted>{[lore.source, heard].filter(Boolean).join(' · ')}</Body>
        </View>
      )}
      <Button label="Edit" variant="outline" onPress={() => router.push(`/rituals/craft/folk/lore/edit?id=${raw.id}` as Href)} />
    </RitualScreen>
  );
}
