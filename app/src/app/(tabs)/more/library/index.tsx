import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Chips, Field, MenuList, MenuRow, MoreScreen, Notice } from '../../../../components/more/ui';
import { hasMyPractice, LIBRARY_TYPES, searchLibrary, typeLabel, useLibrary } from '../../../../lib/library';
import { useSession } from '../../../../lib/session';
import { type } from '../../../../theme';

const MINE = '__mine';

export default function LibraryIndex() {
  const { session } = useSession();
  const { entries, status } = useLibrary();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const hasMine = entries.some(hasMyPractice);
  const options = useMemo(
    () => [
      { value: 'all', label: 'All' },
      ...(hasMine ? [{ value: MINE, label: 'My Practice' }] : []),
      ...LIBRARY_TYPES.map((value) => ({ value, label: typeLabel(value) })),
    ],
    [hasMine],
  );

  const results = searchLibrary(entries, query, {
    type: filter === 'all' || filter === MINE ? null : filter,
    mine: filter === MINE,
  });

  return (
    <MoreScreen title="Living Library" eyebrow="Correspondences and lore" back="/more" backLabel="Back to More">
      <Field
        label="Search the Library"
        value={query}
        onChangeText={setQuery}
        placeholder="Rosemary, protection, Venus…"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      <Chips label="Show" options={options} value={filter} onChange={setFilter} />
      {session && status === 'offline' && <Notice>Offline · your My Practice notes may be out of date</Notice>}
      <Text style={type.caption} accessibilityLiveRegion="polite">
        {results.length === 0 ? 'Nothing in the Library matches that yet.' : `${results.length} ${results.length === 1 ? 'entry' : 'entries'}`}
      </Text>
      {results.length > 0 && (
        <MenuList>
          {results.map((entry, index) => (
            <MenuRow
              key={entry.id}
              label={entry.name}
              detail={[entry.category, hasMyPractice(entry) ? 'My Practice' : null].filter(Boolean).join(' · ')}
              last={index === results.length - 1}
              onPress={() => router.push({ pathname: '/more/library/[entryId]', params: { entryId: entry.id } })}
            />
          ))}
        </MenuList>
      )}
      {!session && (
        <Text style={[type.caption, styles.center]}>Sign in to see your own My Practice notes from the website here.</Text>
      )}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
