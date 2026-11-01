import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { ResearchFooter } from '../ResearchNote';
import { Card, MoreScreen, RichText, Section, Tags } from '../more/ui';
import { JOURNEY_CATALOG } from '../../lib/journeys/catalog';
import { journeyForDeityRefIn } from '../../lib/journeys/lookup';
import { correspondences, entryIntro, findByName, useLibrary, type LibraryEntry } from '../../lib/library';
import { sourcingForEntry } from '../../lib/library/closed';
import { layerFields, visibleLayers } from '../../lib/library/model';
import { ritualRecord } from '../../lib/library/records';
import type { LibraryField } from '../../lib/library/types';
import { LAYER_LABELS, type Layer } from '../../lib/settings/defaults';
import { useSession } from '../../lib/session';
import { useMySettings } from '../../lib/settings/store';
import { colors, fonts, radius, type, fitLines } from '../../theme';
import { ConnectedTo, LibraryJourney, RelationshipManager } from './LibraryConnections';
import { DeityYours } from './DeityYours';
import { HerbHearth } from '../craft/hearth';

/** A herb or tree's Traditional Library key ("elder"), from its own id or the entry it was made from. */
const herbKeyOf = (entry: LibraryEntry): string | null => {
  const ref = entry.traditionalRef?.split('/') ?? [];
  const key = ref[1] === 'herb' ? ref[2] : entry.id.startsWith('traditional:herb:') ? entry.id.split(':')[2] : null;
  return key && !key.includes('.') ? key : null;
};

/** The spell builder with this Library entry chosen, for the kinds a spell can use. */
function spellHref(entry: LibraryEntry): Href | null {
  const ref = entry.traditionalRef ?? '';
  const [, kind, key] = /^traditional\/(herb|crystal|candle|deity)\/(.+)$/.exec(ref) ?? [];
  if (!kind || !key) return null;
  return { pathname: '/rituals/spell', params: kind === 'deity' ? { deity: key } : { add: ref } } as Href;
}
import { DeityJournalLink } from '../journals/screens';

type Props = {
  entryId: string;
  back: Href;
  backLabel: string;
  /** Where another entry opens when a pairing chip is tapped. */
  hrefFor: (entry: LibraryEntry) => Href;
  /** Where Add / Edit My Practice opens. */
  editHref: (entry: LibraryEntry) => Href;
};

/** One Living Library entry: its My Practice, Traditional and Community layers. */
export function LibraryEntryView({ entryId, back, backLabel, hrefFor, editHref }: Props) {
  const { session } = useSession();
  const { entries, relations, getEntry } = useLibrary();
  const { settings } = useMySettings();
  const [managing, setManaging] = useState(false);
  const entry = getEntry(entryId);

  if (!entry) {
    return (
      <MoreScreen title="Living Library" back={back} backLabel={backLabel}>
        <Text style={type.body}>This entry couldn't be found.</Text>
      </MoreScreen>
    );
  }

  const facts = settings?.library_traditional_correspondences === false ? [] : correspondences(entry);
  const shown = visibleLayers(settings)
    .map((layer) => ({ layer, fields: layerFields(layerData(entry, layer), layer, settings, entry.layout) }))
    .filter(({ fields }) => fields.length > 0);
  // A deity with a dedication journey links to it.
  const journey = entry.type === 'deity' ? journeyForDeityRefIn(JOURNEY_CATALOG, entry.traditionalRef ?? entry.id) : null;
  // Rituals and ritual templates read as a record of the working, as on the website.
  const record = entry.myPractice ? ritualRecord(entry.type, entry.myPractice) : null;
  // Plants, resins and stones whose sourcing raises real concerns.
  const sourcing = sourcingForEntry(entry);
  // Herbs, stones, candle colours and deities open the spell builder with them chosen.
  const spellLink = spellHref(entry);

  const openByName = (name: string) => {
    const target = findByName(entries, name);
    return target && target.id !== entry.id ? () => router.push(hrefFor(target)) : undefined;
  };
  // A chip opens the entry it names (an ingredient's, without its amount).
  const openChip = (field: LibraryField) => (chip: string) => {
    const index = field.chips?.indexOf(chip) ?? -1;
    return openByName(field.chipNames?.[index] ?? chip);
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

      {!!sourcing && (
        <Section label="Sourcing with care">
          <Card tone="gold">
            <Text style={type.body}>{sourcing.concern}</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Instead</Text>
              <Text style={type.body}>{sourcing.instead}</Text>
            </View>
            <Button
              label="All sourcing notes"
              variant="text"
              accessibilityHint="Opens Sourcing with care: every plant and stone that needs care"
              onPress={() => router.push('/more/library/sourcing' as Href)}
            />
          </Card>
        </Section>
      )}

      {entry.type === 'deity' && <DeityYours entry={entry} />}
      {entry.type === 'deity' && <DeityJournalLink deityKey={entry.id.split(':').pop() ?? ''} name={entry.name} />}

      {!!journey && (
        <Button
          label="Begin a dedication journey"
          variant="outline"
          accessibilityHint={`Opens ${journey.title}: study, practice and a rite of self-dedication`}
          onPress={() => router.push({ pathname: '/rituals/journeys/[id]', params: { id: journey.id } } as Href)}
        />
      )}

      {!!spellLink && (
        <Button
          label="Use in a spell"
          variant="outline"
          accessibilityHint={`Opens the spell builder with ${entry.name} already chosen`}
          onPress={() => router.push(spellLink)}
        />
      )}

      {!!session && (
        <Button
          label={entry.myPractice ? 'Edit My Practice' : 'Add to My Practice'}
          variant={entry.myPractice ? 'outline' : 'primary'}
          onPress={() => router.push(editHref(entry))}
        />
      )}

      {record && (
        <>
          {record.facts.length > 0 && (
            <View style={styles.facts}>
              {record.facts.map((fact) => (
                <View key={fact.label} style={styles.fact} accessible accessibilityLabel={`${fact.label}: ${fact.value}`}>
                  <Text style={type.eyebrow}>{fact.label}</Text>
                  <Text style={styles.recordFact}>{fact.value}</Text>
                </View>
              ))}
            </View>
          )}
          {record.sections.map((section) => (
            <Section key={section.title} label={section.title}>
              <Card tone="gold">
                {section.chips ? <Tags items={section.chips} onPress={openByName} /> : <RichText text={section.text} />}
              </Card>
            </Section>
          ))}
        </>
      )}

      {!record && shown.length === 0 && (
        <Card>
          <Text style={type.body}>Nothing to show here with your current Living Library settings.</Text>
        </Card>
      )}

      {!record &&
        shown.map(({ layer, fields }) => (
          <Section key={layer} label={LAYER_LABELS[layer]}>
            <Card tone={layer === 'myPractice' ? 'gold' : undefined}>
              {fields
                .filter((field) => !(layer === 'traditional' && ['Element', 'Planet', 'Chakra', 'Pantheon'].includes(field.key)))
                .map((field) => (
                  <View key={field.key} style={styles.field}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    {field.chips ? <Tags items={field.chips} onPress={openChip(field)} /> : <RichText text={field.text} />}
                  </View>
                ))}
            </Card>
          </Section>
        ))}

      <ConnectedTo
        entry={entry}
        entries={entries}
        relations={relations}
        hrefFor={hrefFor}
        onManage={session ? () => setManaging(true) : undefined}
      />

      <LibraryJourney entry={entry} entries={entries} relations={relations} hrefFor={hrefFor} />

      {entry.type === 'herb' && !!herbKeyOf(entry) && <HerbHearth herb={herbKeyOf(entry)!} />}

      {entry.tags.length > 0 && (
        <Section label="Tags">
          <Tags items={entry.tags} />
        </Section>
      )}

      <ResearchFooter page={entry.name} kind={entry.category || 'Living Library'} />

      {!!session && (
        <RelationshipManager
          visible={managing}
          entry={entry}
          entries={entries}
          relations={relations}
          userId={session.user.id}
          onClose={() => setManaging(false)}
        />
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
  intro: fitLines({ fontFamily: fonts.displayItalic, fontSize: 21, lineHeight: 27, color: colors.parchment }),
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
  recordFact: { fontFamily: fonts.display, fontSize: 18, lineHeight: 22, color: colors.cream },
  field: { gap: 8 },
  fieldLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
});
