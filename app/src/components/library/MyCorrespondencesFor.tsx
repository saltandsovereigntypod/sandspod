// Your own correspondences on a Living Library entry: what it means to you
// (from My correspondences, linked to this entry or named the same), and the
// pairings you've made with it. Kept in the craft collection
// `eclectic.correspondences`, so they follow you between devices.

import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Card, Section } from '../more/ui';
import { correspondenceDetail, CORRESPONDENCES, forLibraryEntry, pairNames, type MyCorrespondence } from '../../lib/craft/eclectic/correspondences';
import { useCraft } from '../../lib/craft/store';
import type { LibraryEntry } from '../../lib/library';
import { colors, type } from '../../theme';

const openOne = (id: string) => router.push({ pathname: '/rituals/craft/eclectic/correspondences/[id]', params: { id } } as Href);

export function MyCorrespondencesFor({ entry }: { entry: Pick<LibraryEntry, 'id' | 'name'> }) {
  const { entries } = useCraft<MyCorrespondence>(CORRESPONDENCES);
  const { about, pairedWith } = useMemo(() => forLibraryEntry(entries, entry), [entries, entry]);
  const pairs = [...new Set(about.flatMap((e) => pairNames(e.data)))];

  return (
    <Section label="Your correspondences">
      <Card tone={about.length || pairedWith.length ? 'gold' : undefined}>
        {about.map((e) => (
          <Pressable key={e.id} accessibilityRole="link" onPress={() => openOne(e.id)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
            <Text style={type.body}>{e.data.meaning.trim() || e.data.name}</Text>
            {!!correspondenceDetail({ ...e.data, meaning: '' }) && <Text style={type.caption}>{correspondenceDetail({ ...e.data, meaning: '' })}</Text>}
          </Pressable>
        ))}
        {pairs.length > 0 && <Text style={type.caption}>{`You pair it with: ${pairs.join(', ')}`}</Text>}
        {pairedWith.map((e) => (
          <Pressable key={e.id} accessibilityRole="link" onPress={() => openOne(e.id)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
            <Text style={type.caption}>{`Paired with ${e.data.name}${e.data.meaning.trim() ? `: ${e.data.meaning.trim()}` : ''}`}</Text>
          </Pressable>
        ))}
        {!about.length && !pairedWith.length && (
          <Text style={type.caption}>What does it mean to you? A memory, a person, what you pair it with. Yours sits beside the Library’s, and the correspondence finder uses it.</Text>
        )}
        <View style={styles.actions}>
          <Button
            label={about.length ? 'Add another note' : 'Add your own correspondence'}
            variant="outline"
            onPress={() => router.push({ pathname: '/rituals/craft/eclectic/correspondences/edit', params: { ref: entry.id, name: entry.name } } as Href)}
          />
        </View>
      </Card>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { gap: 2, paddingVertical: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.goldLine },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
});
