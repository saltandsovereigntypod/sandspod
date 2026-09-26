import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Card, Chip, Chips, RitualScreen, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { LibraryEntryScreen } from '../../../../components/library/LibraryEntryScreen';
import { useLibrary, type LibraryEntry } from '../../../../lib/library';
import { paramToRef, refToParam } from '../../../../lib/rituals/format';
import { entryForIngredient, ingredientFromEntry } from '../../../../lib/rituals/ingredients';
import { INTENTIONS, libraryItem, suggestIngredients } from '../../../../lib/rituals/planner';

// A short Library card for an ingredient. The full Living Library lives under
// More → Library; this keeps the ritual screens one tap from what they use.
// Paired entries open here too, so they stay in the Rituals tab.
const ingredientHref = (entry: LibraryEntry) =>
  ({ pathname: '/rituals/ingredient/[ref]', params: { ref: refToParam(ingredientFromEntry(entry).ref) } }) as const;

export default function Ingredient() {
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const { entries } = useLibrary();
  const item = ref ? libraryItem(paramToRef(ref)) : null;
  // Oils, tools, deities, your own entries: the full Living Library page.
  const entry = !item && ref ? entryForIngredient(entries, paramToRef(ref)) : null;

  if (entry) {
    return <LibraryEntryScreen entryId={entry.id} back="/rituals" backLabel="Back" hrefFor={ingredientHref} />;
  }

  if (!item) {
    return (
      <RitualScreen back="Back">
        <Title>Library</Title>
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
      <Title eyebrow={`Library · ${item.type}`}>{item.name}</Title>
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

      <Button label="Build a spell" variant="outline" onPress={() => router.push('/rituals/spell')} />
    </RitualScreen>
  );
}
