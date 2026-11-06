// A moon or sabbat kit (lib/rituals/kits.ts): set the altar in one tap, the
// correspondences, a short ritual, a journal prompt and a reading. Shown on
// the moon and sabbat pages; Today links to tonight's.

import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Card, Section, Tags } from '../more/ui';
import { bathForKit } from '../../lib/craft/bath/bath';
import { kitTonight, type Kit } from '../../lib/rituals/kits';
import { colors, type } from '../../theme';

type Props = {
  kit: Kit;
  /** Opens a correspondence's Library entry, when the Library has one. */
  open?: (name: string) => (() => void) | undefined;
};

export function KitCard({ kit, open }: Props) {
  const bath = bathForKit(kit.ref);
  const groups: [string, string[]][] = [
    ['Herbs', kit.correspondences.herbs],
    ['Stones', kit.correspondences.crystals],
    ['Colours', kit.correspondences.colors],
  ];
  return (
    <Section label={kit.kind === 'moon' ? `The ${kit.title.toLowerCase()} kit` : `The ${kit.title} kit`}>
      <Card tone="gold">
        <Text style={type.caption}>Everything for the night in one place. Take what helps and leave the rest.</Text>

        <View style={styles.part}>
          <Text style={styles.label}>The altar</Text>
          <Button
            label="Set the altar for it"
            variant="outline"
            accessibilityHint="Opens a starter altar for the night from the cabinet; nothing is saved until you save it"
            onPress={() => router.push({ pathname: '/altar/[altarId]', params: { altarId: 'kit', kit: kit.ref } } as Href)}
          />
        </View>

        <View style={styles.part}>
          <Text style={styles.label}>Correspondences</Text>
          {groups
            .filter(([, items]) => items.length)
            .map(([label, items]) => (
              <View key={label} style={styles.group}>
                <Text style={type.caption}>{label}</Text>
                <Tags items={items} onPress={open} />
              </View>
            ))}
        </View>

        {kit.premade && (
          <View style={styles.part}>
            <Text style={styles.label}>A short ritual</Text>
            <Text style={type.body}>{kit.premade.title}</Text>
            <Text style={type.caption}>{`${kit.premade.summary} About ${kit.premade.minutes} minutes.`}</Text>
            <Button label="Open the ritual" variant="outline" onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: kit.premade!.id } } as Href)} />
          </View>
        )}

        {bath && (
          <View style={styles.part}>
            <Text style={styles.label}>A bath</Text>
            <Text style={type.body}>{bath.title}</Text>
            <Text style={type.caption}>{bath.intention}</Text>
            <Button label="Open the bath mix" variant="outline" onPress={() => router.push({ pathname: '/rituals/craft/bath/mix', params: { id: bath.id } } as Href)} />
          </View>
        )}

        <View style={styles.part}>
          <Text style={styles.label}>To write</Text>
          <Text style={type.body}>{kit.prompt}</Text>
          <Button label="Open your journal" variant="text" onPress={() => router.push('/rituals/journal' as Href)} />
        </View>

        <View style={styles.part}>
          <Text style={styles.label}>A reading</Text>
          <Button
            label={`Draw the ${kit.spread.label} spread`}
            variant="outline"
            onPress={() => router.push({ pathname: '/rituals/divination/draw', params: { spread: kit.spread.id } } as Href)}
          />
        </View>
      </Card>
    </Section>
  );
}

/** Today's line: tonight's kit, opening its moon or sabbat page. */
export function TonightsKit({ now, south }: { now: Date; south: boolean }) {
  const day = now.toDateString();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- once a day
  const kit = useMemo(() => kitTonight(now, { south }), [day, south]);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Tonight’s kit: ${kit.title}. Altar, correspondences, a ritual, a prompt and a reading.`}
      onPress={() => router.navigate({ pathname: '/today/holy/[ref]', params: { ref: kit.ref } } as Href)}
      style={({ pressed }) => [styles.line, pressed && { opacity: 0.7 }]}
    >
      <Text style={[type.caption, styles.center]}>
        {'Tonight’s kit: '}
        <Text style={styles.gold}>{kit.title}</Text>
        {' ›'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  part: { gap: 6, marginTop: 10 },
  group: { gap: 4 },
  label: { ...type.eyebrow, color: colors.gold },
  line: { paddingVertical: 6 },
  center: { textAlign: 'center' },
  gold: { color: colors.gold },
});
