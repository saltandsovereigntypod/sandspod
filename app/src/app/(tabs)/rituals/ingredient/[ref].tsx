import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Card, Chip, Chips, RitualScreen, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { paramToRef } from '../../../../lib/rituals/format';
import { INTENTIONS, libraryItem, suggestIngredients } from '../../../../lib/rituals/planner';

// A short Library card for an ingredient. The full Living Library lives under
// More → Library; this keeps the ritual screens one tap from what they use.
export default function Ingredient() {
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const item = ref ? libraryItem(paramToRef(ref)) : null;

  if (!item) {
    return (
      <RitualScreen back="Back">
        <Title eyebrow="From the Living Library">Not found</Title>
        <Body>This entry isn't in the app's Library yet.</Body>
      </RitualScreen>
    );
  }

  const goodFor = INTENTIONS.filter((intention) => {
    const s = suggestIngredients(intention);
    return [...s.herb, ...s.crystal, ...s.candle].some((i) => i.ref === item.ref);
  });

  return (
    <RitualScreen back="Back">
      <Title eyebrow={`From the Living Library · ${item.type}`}>{item.name}</Title>
      <Body muted>{[item.planet, item.element].filter(Boolean).join(' · ')}</Body>
      <Body>{item.uses}</Body>

      {goodFor.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Plan a working with it</SectionLabel>
          <Chips>
            {goodFor.map((intention) => (
              <Chip
                key={intention.key}
                label={intention.label}
                a11yLabel={`Plan a ${intention.label.toLowerCase()} working`}
                onPress={() => router.push({ pathname: '/rituals/planner', params: { intention: intention.key } })}
              />
            ))}
          </Chips>
        </View>
      )}

      {!!item.tip && (
        <Card>
          <SectionLabel>A beginning</SectionLabel>
          <Body>{item.tip}</Body>
        </Card>
      )}
      {!!item.caution && (
        <Card>
          <SectionLabel>With care</SectionLabel>
          <Body>{item.caution}</Body>
        </Card>
      )}

      <Button
        label="Use in a spell"
        variant="outline"
        accessibilityHint="Opens the spell builder with this already chosen"
        onPress={() => router.push({ pathname: '/rituals/spell', params: { add: item.ref, ...(goodFor[0] ? { intention: goodFor[0].key } : {}) } })}
      />
    </RitualScreen>
  );
}
