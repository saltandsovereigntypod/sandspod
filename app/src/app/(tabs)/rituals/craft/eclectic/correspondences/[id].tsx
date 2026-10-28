import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, confirmAction, List, RitualScreen, Row, Title, ui } from '../../../../../../components/rituals/ui';
import {
  agreement,
  CORRESPONDENCES,
  entryById,
  mySide,
  sourceLabel,
  traditionalSide,
  type MyCorrespondence,
  type Pair,
} from '../../../../../../lib/craft/eclectic/correspondences';
import { removeEntry, useCraft } from '../../../../../../lib/craft/store';
import { ritualsLibraryHref, typeSingular } from '../../../../../../lib/library';
import { colors, type } from '../../../../../../theme';

function Pairs({ pairs }: { pairs: Pair[] }) {
  return (
    <View style={ui.gap}>
      {pairs.map((p) => (
        <View key={p.label} style={styles.pair} accessible accessibilityLabel={`${p.label}: ${p.value}`}>
          <Text style={type.eyebrow}>{p.label}</Text>
          <Body>{p.value}</Body>
        </View>
      ))}
    </View>
  );
}

// One of your correspondences, with the Library's beside it.
export default function Correspondence() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, ready } = useCraft<MyCorrespondence>(CORRESPONDENCES);
  const entry = entries.find((e) => e.id === id) ?? null;
  const library = useMemo(() => entryById(entry?.data.ref), [entry?.data.ref]);

  if (!entry) {
    return (
      <RitualScreen back="My correspondences">
        <Title eyebrow="My correspondences">{ready ? 'Not found' : '…'}</Title>
        {ready && <Body>This entry may have been deleted on another device.</Body>}
      </RitualScreen>
    );
  }

  const c = entry.data;
  const mine = mySide(c);
  const theirs = library ? traditionalSide(library) : [];
  const matches = library ? agreement(c, library) : [];
  const source = sourceLabel(c.source);

  const remove = async () => {
    if (!(await confirmAction(`Delete ${c.name || 'this entry'}?`, 'It will be deleted from your correspondences on every device. This can’t be undone.', 'Delete'))) return;
    await removeEntry(CORRESPONDENCES, entry.id);
    router.back();
  };

  return (
    <RitualScreen back="My correspondences">
      <Title eyebrow={library ? typeSingular(library.type) : 'My correspondence'}>{c.name || 'Untitled'}</Title>

      <Card accent>
        <Text style={type.cardTitle}>To me</Text>
        {mine.length ? <Pairs pairs={mine} /> : <Body muted>Nothing written yet.</Body>}
        {(source || c.sourceNote.trim()) && (
          <Body muted>From {[source?.toLowerCase(), c.sourceNote.trim()].filter(Boolean).join(': ')}</Body>
        )}
      </Card>

      {library && (
        <Card>
          <Text style={type.cardTitle}>In the Library</Text>
          {theirs.length ? <Pairs pairs={theirs} /> : <Body muted>The Library lists no correspondences for this entry.</Body>}
          {matches.map((m) => (
            <Body key={m.label} muted>
              {m.same ? `Your ${m.label.toLowerCase()} agrees with tradition.` : `Your ${m.label.toLowerCase()} (${m.mine}) is your own; tradition gives ${m.theirs}.`}
            </Body>
          ))}
        </Card>
      )}

      {library && (
        <List>
          <Row icon="grimoire" title={`${library.name} in the Library`} detail="Lore, uses, pairings and safety" last onPress={() => router.push(ritualsLibraryHref(library))} />
        </List>
      )}

      <View style={ui.actions}>
        <Button
          label="Edit"
          variant="outline"
          onPress={() => router.push({ pathname: '/rituals/craft/eclectic/correspondences/edit', params: { id: entry.id } } as Href)}
        />
        <Button label="Delete" variant="text" onPress={remove} />
      </View>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  pair: { gap: 2, borderLeftWidth: 2, borderLeftColor: colors.goldLine, paddingLeft: 10 },
});
