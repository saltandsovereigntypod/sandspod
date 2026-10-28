import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, Field, MoreScreen, Paragraphs } from '../../../../components/more/ui';
import { libraryHref, useLibrary } from '../../../../lib/library';
import { closedById, fold, sourcingNotes } from '../../../../lib/library/closed';
import { colors, fonts, type } from '../../../../theme';

// Sourcing with care: the plants, resins and stones whose buying raises real
// concerns (overharvesting, sacred status, labour, habitat) and what to do instead.
export default function SourcingScreen() {
  const { entries } = useLibrary();
  const [query, setQuery] = useState('');
  const notes = useMemo(() => sourcingNotes(), []);
  const q = fold(query);
  const shown = q ? notes.filter((n) => fold(n.name).includes(q)) : notes;

  return (
    <MoreScreen title="Sourcing with care" eyebrow="Living Library" back="/more/library" backLabel="Back to the Library">
      <Paragraphs
        items={[
          'Some of the most loved materials in the craft come at a cost to the land or to the people they belong to: wild plants harvested faster than they grow back, medicines that are sacred to a living people, stones dug by hand in unsafe mines.',
          'None of this is about guilt. It’s about buying well, growing your own where you can, and choosing something else when the real thing isn’t yours to take.',
        ]}
      />
      {notes.length > 0 && (
        <Field
          label="Search the notes"
          value={query}
          onChangeText={setQuery}
          placeholder="Sage, sandalwood, quartz…"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      )}
      <Text style={type.caption} accessibilityLiveRegion="polite">
        {notes.length === 0
          ? 'The sourcing notes are on their way.'
          : shown.length === 0
            ? 'No note matches that.'
            : `${shown.length} ${shown.length === 1 ? 'note' : 'notes'}`}
      </Text>
      {shown.map((note) => {
        const entry = note.ref ? entries.find((e) => e.traditionalRef === note.ref || e.id === note.ref) : undefined;
        const tradition = closedById(note.tradition);
        return (
          <Card key={note.ref ?? note.name}>
            <Text accessibilityRole="header" style={type.cardTitle}>
              {note.name}
            </Text>
            <View style={styles.part}>
              <Text style={styles.label}>Why care</Text>
              <Text style={type.body}>{note.concern}</Text>
            </View>
            <View style={styles.part}>
              <Text style={styles.label}>Instead</Text>
              <Text style={type.body}>{note.instead}</Text>
            </View>
            {(entry || tradition) && (
              <View style={styles.links}>
                {entry && <Button label="Open its Library page" variant="text" onPress={() => router.push(libraryHref(entry))} />}
                {tradition && (
                  <Button
                    label={`About ${tradition.name}`}
                    variant="text"
                    onPress={() => router.push({ pathname: '/more/library/closed/[id]', params: { id: tradition.id } })}
                  />
                )}
              </View>
            )}
          </Card>
        );
      })}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  part: { gap: 4 },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
  links: { gap: 4 },
});
