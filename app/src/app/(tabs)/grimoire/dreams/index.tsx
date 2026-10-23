import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { DreamList, DreamReminder, DreamRow, DreamShell } from '../../../../components/grimoire/dreams';
import { Field } from '../../../../components/more/ui';
import { Body, Card, List, Row } from '../../../../components/rituals/ui';
import { SupportLink } from '../../../../components/SupportLink';
import { DREAMS, groupByMonth, normalizeDream, searchDreams } from '../../../../lib/craft/hedge/dreams';
import { useCraft } from '../../../../lib/craft/store';
import { DREAM_ROUTES } from '../../../../lib/grimoire/dreams';
import { useSession } from '../../../../lib/session';
import { colors, type } from '../../../../theme';

// The dream journal, as a section of the Grimoire. The same dreams the Hedge
// practice and the website keep (craft_entries, `hedge.dreams`).
export default function Dreams() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { session } = useSession();
  const { entries, ready } = useCraft<unknown>(DREAMS);
  const [query, setQuery] = useState(typeof q === 'string' ? q : '');
  const dreams = useMemo(() => entries.map((e) => ({ ...e, data: normalizeDream(e.data) })), [entries]);
  const found = useMemo(() => searchDreams(dreams, query), [dreams, query]);
  const groups = useMemo(() => groupByMonth(found), [found]);

  return (
    <DreamShell crumb="Grimoire">
      <View style={styles.titleText}>
        <Text style={type.eyebrow}>{`${dreams.length} ${dreams.length === 1 ? 'dream' : 'dreams'}`}</Text>
        <Text accessibilityRole="header" style={type.title}>
          Dreams
        </Text>
      </View>
      <Button label="Write down a dream" onPress={() => router.push(DREAM_ROUTES.write as Href)} />

      {!ready && !dreams.length ? (
        <Body muted>Opening your dreams…</Body>
      ) : dreams.length === 0 ? (
        <Card>
          <Body>Nothing written yet. The first dream you catch, write it here: the moon it came under is noted for you, and over the months your symbols and patterns begin to show.</Body>
        </Card>
      ) : (
        <>
          <Field label="Search your dreams" value={query} onChangeText={setQuery} placeholder="A word, a symbol, a feeling, a moon" />
          {groups.length === 0 && <Text style={type.caption}>No dreams match that.</Text>}
          {groups.map((g) => (
            <View key={g.month} style={styles.section}>
              <Text style={type.caption}>{g.month}</Text>
              <DreamList>
                {g.entries.map((e, i) => (
                  <DreamRow key={e.id} entry={e} last={i === g.entries.length - 1} />
                ))}
              </DreamList>
            </View>
          ))}
        </>
      )}

      <List>
        <Row
          icon="wheel"
          title={dreams.length >= 3 ? 'Symbols and moons' : 'Dream symbols'}
          detail={dreams.length >= 3 ? 'What keeps returning, the phases your dreams cluster in, and common symbols' : 'Common associations, as starting points'}
          last
          onPress={() => router.push(DREAM_ROUTES.patterns as Href)}
        />
      </List>

      <DreamReminder />
      {!session && <Text style={[type.caption, styles.notice]}>Kept on this phone. Sign in to keep your dreams with your account and on the website.</Text>}
      <SupportLink />
    </DreamShell>
  );
}

const styles = StyleSheet.create({
  titleText: { gap: 4 },
  section: { gap: 8 },
  notice: { color: colors.gold },
});
