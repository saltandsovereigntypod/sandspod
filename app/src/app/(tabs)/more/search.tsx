import { router, type Href } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { MenuList, MenuRow, MoreScreen, Section } from '../../../components/more/ui';
import { useGrimoire } from '../../../lib/grimoire/store';
import { DREAMS, normalizeDream } from '../../../lib/craft/hedge/dreams';
import { normalizeReading, READINGS } from '../../../lib/craft/hedge/readings';
import { useCraft } from '../../../lib/craft/store';
import { libraryHref, useLibrary } from '../../../lib/library';
import { useRituals } from '../../../lib/rituals/store';
import { searchEverything, type SearchHit, type SearchKind } from '../../../lib/search';
import { colors, fonts, radius, touch, type } from '../../../theme';

const GROUPS: { kind: SearchKind; label: string }[] = [
  { kind: 'library', label: 'Living Library' },
  { kind: 'page', label: 'Your Grimoire' },
  { kind: 'journal', label: 'Ritual journal' },
  { kind: 'template', label: 'Ritual templates' },
  { kind: 'reading', label: 'Divination readings' },
  { kind: 'dream', label: 'Dreams' },
];

// Results open inside the More tab, so Back comes straight back to the search.
function hrefFor(hit: SearchHit): Href {
  switch (hit.kind) {
    case 'library':
      return libraryHref({ id: hit.id });
    case 'page':
      return { pathname: '/more/page/[pageId]', params: { pageId: hit.id } };
    case 'journal':
      return { pathname: '/more/journal/[id]', params: { id: hit.id } };
    case 'reading':
      return { pathname: '/more/reading/[id]', params: { id: hit.id } };
    case 'dream':
      return { pathname: '/more/dream/[id]', params: { id: hit.id } };
    default:
      return { pathname: '/more/templates/[id]', params: { id: hit.id } };
  }
}

/** One search across the Living Library, grimoire pages, ritual journal and templates, readings and dreams. */
export default function Search() {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const { entries } = useLibrary();
  const { snapshot } = useGrimoire();
  const { journal, templates } = useRituals();
  const { entries: readingRows } = useCraft<unknown>(READINGS);
  const { entries: dreamRows } = useCraft<unknown>(DREAMS);
  const readings = useMemo(() => readingRows.map((e) => ({ ...e, data: normalizeReading(e.data) })), [readingRows]);
  const dreams = useMemo(() => dreamRows.map((e) => ({ ...e, data: normalizeDream(e.data) })), [dreamRows]);

  const hits = useMemo(
    () =>
      searchEverything(
        { library: entries, pages: snapshot?.pages ?? [], blocks: snapshot?.blocks ?? [], journal, templates, readings, dreams },
        deferred,
      ),
    [entries, snapshot, journal, templates, readings, dreams, deferred],
  );
  const total = GROUPS.reduce((sum, g) => sum + hits[g.kind].length, 0);
  const searching = deferred.trim().length >= 2;

  return (
    <MoreScreen title="Search" eyebrow="Your practice" back="/more" backLabel="Back to More">
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Rosemary, protection, full moon…"
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="Search your practice"
        autoFocus
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
        style={styles.input}
      />
      {!searching && (
        <Text style={type.caption}>Finds herbs, crystals and deities in the Living Library, and anything you’ve written in your Grimoire, journal, templates, readings or dreams.</Text>
      )}
      {searching && total === 0 && <Text style={type.body}>{`Nothing found for “${deferred.trim()}”.`}</Text>}
      {GROUPS.filter((g) => hits[g.kind].length > 0).map((group) => (
        <Section key={group.kind} label={group.label}>
          <MenuList>
            {hits[group.kind].map((hit, i, all) => (
              <MenuRow
                key={hit.id}
                label={hit.title}
                detail={hit.detail}
                last={i === all.length - 1}
                onPress={() => router.push(hrefFor(hit))}
              />
            ))}
          </MenuList>
        </Section>
      ))}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
  },
});
