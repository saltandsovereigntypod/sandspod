import { router } from 'expo-router';
import { Text } from 'react-native';

import { Body, Card, List, RitualScreen, Row, Title } from '../../../../../../components/rituals/ui';
import { FORAGE_FIRST, FORAGE_RULES } from '../../../../../../lib/craft/hearth/forage';
import { KITCHEN_SAFETY } from '../../../../../../lib/craft/hearth/recipes';
import { type } from '../../../../../../theme';

// Safety, law and taking with care: the whole list, for foraging and the kitchen.
export default function ForageSafety() {
  return (
    <RitualScreen back="Foraging & garden">
      <Title eyebrow="Foraging & garden">Safety, law and care</Title>
      <Card accent>
        <Text style={type.cardTitle}>{FORAGE_FIRST}</Text>
      </Card>
      {FORAGE_RULES.map((r) => (
        <Card key={r.title}>
          <Text style={type.cardTitle}>{r.title}</Text>
          <Body>{r.text}</Body>
        </Card>
      ))}
      <Card>
        <Text style={type.cardTitle}>In the kitchen</Text>
        <Body>{KITCHEN_SAFETY}</Body>
      </Card>
      <List>
        <Row icon="grimoire" title="Sourcing with care" detail="In the Living Library · plants and resins that need care to buy" onPress={() => router.push('/grimoire/library/sourcing')} />
        <Row icon="more" title="Support" detail="Crisis lines and help, if something is heavy" last onPress={() => router.push('/more/support')} />
      </List>
    </RitualScreen>
  );
}
