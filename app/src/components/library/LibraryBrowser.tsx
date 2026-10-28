import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ResearchCard } from '../ResearchNote';
import { Chips, Field, MenuList, MenuRow, MoreScreen, Notice } from '../more/ui';
import { hasMyPractice, LIBRARY_TYPES, pathEntryIds, searchLibrary, typeLabel, useLibrary, type LibraryEntry } from '../../lib/library';
import { CLOSED_GUIDE_LIVE, SOURCING_NOTES } from '../../lib/library/closed';
import { entryVisible, myPath, pathName } from '../../lib/library/traditions';
import { useSession } from '../../lib/session';
import { useMySettings } from '../../lib/settings/store';
import { type } from '../../theme';

const MINE = '__mine';
const PATH = '__path';

/**
 * The Living Library: a search across every entry, with "Show" filters for
 * your path, your My Practice notes and each kind of entry. It lives in the
 * Grimoire (grimoire/library); More's old route sends you there.
 */
export function LibraryBrowser({
  back,
  backLabel,
  entryHref,
  sourcingHref,
  closedHref,
}: {
  back: Href;
  backLabel: string;
  entryHref: (entry: Pick<LibraryEntry, 'id'>) => Href;
  sourcingHref: Href;
  closedHref: Href;
}) {
  const { session } = useSession();
  const { entries, status } = useLibrary();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const { settings } = useMySettings();
  const path = useMemo(() => myPath(settings as Record<string, unknown> | null), [settings]);
  const visible = useMemo(() => entries.filter((entry) => entryVisible(entry, path)), [entries, path]);
  // Your traditions and what goes with them, as the Grimoire's My Path shelf shows.
  const onPath = useMemo(() => pathEntryIds(entries, settings), [entries, settings]);

  const hasMine = entries.some(hasMyPractice);
  const options = useMemo(
    () => [
      { value: 'all', label: 'All' },
      ...(onPath.size ? [{ value: PATH, label: path.traditions.length ? `My path (${path.traditions.map(pathName).join(', ')})` : 'My path' }] : []),
      ...(hasMine ? [{ value: MINE, label: 'My Practice' }] : []),
      ...LIBRARY_TYPES.map((value) => ({ value, label: typeLabel(value) })),
    ],
    [hasMine, path, onPath],
  );

  const results = searchLibrary(visible, query, {
    type: filter === 'all' || filter === MINE || filter === PATH ? null : filter,
    mine: filter === MINE,
  }).filter((entry) => filter !== PATH || onPath.has(entry.id));

  return (
    <MoreScreen title="Living Library" eyebrow="Grimoire · correspondences and lore" back={back} backLabel={backLabel}>
      <ResearchCard />
      <MenuList>
        <MenuRow
          label="Sourcing with care"
          detail={SOURCING_NOTES.length ? `${SOURCING_NOTES.length} plants, resins and stones to buy thoughtfully` : 'Plants, resins and stones to buy thoughtfully'}
          last={!CLOSED_GUIDE_LIVE}
          onPress={() => router.push(sourcingHref)}
        />
        {CLOSED_GUIDE_LIVE && (
          <MenuRow label="Closed & living traditions" detail="What the app doesn’t teach, and why" last onPress={() => router.push(closedHref)} />
        )}
      </MenuList>
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
              onPress={() => router.push(entryHref(entry))}
            />
          ))}
        </MenuList>
      )}
      {!session && <Text style={[type.caption, styles.center]}>Sign in to see your own My Practice notes from the website here.</Text>}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
