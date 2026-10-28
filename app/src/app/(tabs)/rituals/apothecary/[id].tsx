import { useLocalSearchParams } from 'expo-router';

import { Body, Card, RitualScreen, SectionLabel, Title } from '../../../../components/rituals/ui';
import { ItemDidItWork } from '../../../../components/rituals/ItemDidItWork';
import { useWorkshop } from '../../../../lib/altar/workshop';
import { fullDate } from '../../../../lib/calendar';
import { localDateKey } from '../../../../lib/rituals/lifecycle';

// One spell jar, sachet or other working from My Apothecary, and "Did it
// work?" for it. A look-back reminder opens here.
export default function ApothecaryItemPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { apothecary, status } = useWorkshop();
  const item = apothecary.find((a) => a.id === id) ?? null;

  if (!item) {
    return (
      <RitualScreen back="Back">
        <Title>Your working</Title>
        <Body>{status === 'loading' ? 'Opening…' : 'This working couldn’t be found. It may have been deleted on another device.'}</Body>
      </RitualScreen>
    );
  }

  const made = item.createdAt ? fullDate(localDateKey(new Date(item.createdAt))) : null;
  return (
    <RitualScreen back="Back">
      <Title eyebrow={[item.typeLabel, made ? `made ${made}` : null].filter(Boolean).join(' · ')}>{item.name}</Title>
      {!!item.intention && <Body>{`For ${item.intention}.`}</Body>}
      <ItemDidItWork item={item} />
      {item.ingredients.length > 0 && (
        <Card>
          <SectionLabel>What went into it</SectionLabel>
          <Body>{item.ingredients.map((i) => (i.amount ? `${i.label} (${i.amount})` : i.label)).join(', ')}</Body>
        </Card>
      )}
      {!!item.notes && (
        <Card>
          <SectionLabel>Notes</SectionLabel>
          <Body>{item.notes}</Body>
        </Card>
      )}
      <Body muted>To change the recipe or place it, open Apothecary on the altar.</Body>
    </RitualScreen>
  );
}
