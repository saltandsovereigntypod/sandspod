import { router, type Href } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { correspondences, entryIntro, findByName, useLibrary, type LibraryEntry } from '../../lib/library';
import { layerFields, visibleLayers } from '../../lib/library/model';
import { LAYER_LABELS, type Layer } from '../../lib/settings/defaults';
import { useMySettings } from '../../lib/settings/store';
import { colors, fonts, radius, type } from '../../theme';
import { Card, MoreScreen, Paragraphs, Section, Tags } from '../more/ui';

type Props = {
  entryId: string;
  /** Where Back goes when there is no history. */
  back: Href;
  backLabel: string;
  /** The page for another entry, in the same tab (paired entries link here). */
  hrefFor: (entry: LibraryEntry) => Href;
};

/** A Living Library entry. Shown from More → Library and from the Book of Shadows. */
export function LibraryEntryScreen({ entryId, back, backLabel, hrefFor }: Props) {
  const { entries, getEntry } = useLibrary();
  const { settings } = useMySettings();
  const entry = getEntry(entryId);

  if (!entry) {
    return (
      <MoreScreen title="Living Library" back={back} backLabel={backLabel}>
        <Text style={type.body}>This entry couldn't be found.</Text>
      </MoreScreen>
    );
  }

  const facts = settings?.library_traditional_correspondences === false ? [] : correspondences(entry);
  const layers = visibleLayers(settings).map((layer) => ({ layer, data: layerData(entry, layer) }));
  const shown = layers.filter(({ layer, data }) => layerFields(data, layer, settings).length > 0);

  const openByName = (name: string) => {
    const target = findByName(entries, name);
    return target && target.id !== entry.id ? () => router.push(hrefFor(target)) : undefined;
  };

  return (
    <MoreScreen title={entry.name} eyebrow={entry.category} back={back} backLabel={backLabel}>
      {!!entry.image && /^https?:\/\//.test(entry.image) && (
        <Image source={{ uri: entry.image }} style={styles.image} accessibilityIgnoresInvertColors accessible={false} />
      )}
      <Text style={styles.intro}>{entryIntro(entry)}</Text>
      {facts.length > 0 && (
        <View style={styles.facts}>
          {facts.map((fact) => (
            <View key={fact.label} style={styles.fact} accessible accessibilityLabel={`${fact.label}: ${fact.value}`}>
              <Text style={type.eyebrow}>{fact.label}</Text>
              <Text style={styles.factValue}>{fact.value}</Text>
            </View>
          ))}
        </View>
      )}

      {shown.length === 0 && (
        <Card>
          <Text style={type.body}>Nothing to show here with your current Living Library settings.</Text>
        </Card>
      )}

      {shown.map(({ layer, data }) => (
        <Section key={layer} label={LAYER_LABELS[layer]}>
          <Card tone={layer === 'myPractice' ? 'gold' : undefined}>
            {layerFields(data, layer, settings)
              .filter((field) => !(layer === 'traditional' && ['Element', 'Planet', 'Chakra', 'Pantheon'].includes(field.key)))
              .map((field) => (
                <View key={field.key} style={styles.field}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  {field.chips ? (
                    <Tags items={field.chips} onPress={openByName} />
                  ) : (
                    <Paragraphs items={field.text.split('\n').filter(Boolean)} />
                  )}
                </View>
              ))}
          </Card>
        </Section>
      ))}

      {entry.tags.length > 0 && (
        <Section label="Tags">
          <Tags items={entry.tags} />
        </Section>
      )}
    </MoreScreen>
  );
}

function layerData(entry: LibraryEntry, layer: Layer): Record<string, unknown> | null {
  if (layer === 'traditional') return entry.traditional;
  if (layer === 'myPractice') return entry.myPractice;
  return entry.community;
}

const styles = StyleSheet.create({
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.card, backgroundColor: colors.surface },
  intro: { fontFamily: fonts.displayItalic, fontSize: 21, lineHeight: 27, color: colors.parchment },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fact: {
    minWidth: 120,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  factValue: { fontFamily: fonts.display, fontSize: 20, color: colors.cream },
  field: { gap: 8 },
  fieldLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
});
