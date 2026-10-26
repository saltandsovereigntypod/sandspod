// Lenormand in pairs, under a draw: each card read with the next, the
// first as the subject and the second as what kind (lib/divination/oracle/pairs).

import { Text, View } from 'react-native';

import type { Draw, Spread } from '../../../lib/divination/draw';
import { pairsForSpread } from '../../../lib/divination/oracle/pairs';
import { colors, type } from '../../../theme';
import { Body, Card, SectionLabel, ui } from '../../rituals/ui';

export function PairsCard({ spread, draw }: { spread: Spread; draw: Draw }) {
  const pairs = pairsForSpread(spread.id, draw.items.map((i) => i.name));
  if (!pairs.length) return null;
  return (
    <Card>
      <SectionLabel>{spread.id === 'lenormand-grand-tableau' ? 'Beside the Man and the Woman' : 'Read in pairs'}</SectionLabel>
      <Body muted>The first card says what; the second says what kind.</Body>
      {pairs.map((p, i) => (
        <View key={`${p.title}-${i}`} style={ui.gapSmall}>
          <Text style={[type.cardTitle, { color: colors.cream }]}>{p.title}</Text>
          <Text style={[type.body, { color: colors.gold }]}>{p.gist}</Text>
          <Body>{p.text}</Body>
        </View>
      ))}
    </Card>
  );
}
