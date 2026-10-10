import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/Button';
import { FailedChanges } from '../../../components/grimoire/SaveStatus';
import { Field } from '../../../components/more/ui';
import { Icon } from '../../../components/Icon';
import { parseCalendarDate, shortDate } from '../../../lib/calendar';
import { useGrimoire } from '../../../lib/grimoire/store';
import { grimoireLibraryHref, grimoireShelves, useLibrary, type GrimoireShelf } from '../../../lib/library';
import { useMySettings } from '../../../lib/settings/store';
import { pageFacts, pageTypeLabel, tableOfContents } from '../../../lib/grimoire/structure';
import type { PageRow } from '../../../lib/grimoire/types';
import { useSession } from '../../../lib/session';
import { colors, fonts, radius, space, type } from '../../../theme';

export default function Grimoire() {
  const { session } = useSession();
  const { snapshot, status, refresh, sync, pendingCount } = useGrimoire();
  const [pulling, setPulling] = useState(false);

  if (!session) {
    return (
      <Shell>
        <Text accessibilityRole="header" style={type.title}>
          Grimoire
        </Text>
        <View style={styles.card}>
          <Text style={type.cardTitle}>Your Book of Shadows</Text>
          <Text style={type.body}>
            Sign in with your Salt &amp; Sovereignty account to open the book you keep on the website.
          </Text>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </View>
      </Shell>
    );
  }

  const book = snapshot?.books[0] ?? null;
  // Written pages (and ritual journals) still open here, but empty sections
  // stay out of the way: the book is My Practice and Traditional Information.
  const groups = (snapshot && book ? tableOfContents(snapshot, book.id) : []).filter((group) => group.pages.length > 0);

  return (
    <Shell
      refreshControl={
        <RefreshControl
          refreshing={pulling}
          tintColor={colors.gold}
          onRefresh={async () => {
            setPulling(true);
            await refresh();
            setPulling(false);
          }}
        />
      }
    >
      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <Text style={type.eyebrow}>Grimoire</Text>
          <Text accessibilityRole="header" style={type.title}>
            {book?.title ?? 'Book of Shadows'}
          </Text>
        </View>
      </View>

      <Button label="New entry" onPress={() => router.push('/grimoire/practice')} />

      <FailedChanges />

      {status === 'offline' && snapshot && (
        <Text style={[type.caption, styles.notice]}>Offline · showing the copy saved on this phone</Text>
      )}

      {sync === 'offline' && pendingCount > 0 && (
        <Text style={[type.caption, styles.notice]}>
          {pendingCount === 1 ? '1 change' : `${pendingCount} changes`} kept on this phone, saving when you're back online
        </Text>
      )}

      {!snapshot && (status === 'loading' || status === 'idle') && (
        <ActivityIndicator color={colors.gold} style={styles.loading} />
      )}

      {!snapshot && (status === 'offline' || status === 'error') && (
        <View style={styles.card}>
          <Text style={type.cardTitle}>Couldn't open your book</Text>
          <Text style={type.body}>Check your connection and try again.</Text>
          <Button label="Try again" variant="outline" onPress={refresh} />
        </View>
      )}

      <LibraryShelves />

      {groups.length > 0 && (
        <View style={styles.section}>
          <Text style={type.eyebrow}>Pages</Text>
          {groups.map((group) => (
            <View key={group.section?.id ?? 'loose'} style={styles.section}>
              {group.section && <Text style={type.caption}>{group.section.title}</Text>}
              <View style={styles.list}>
                {group.pages.map((page, i) => (
                  <PageRowView key={page.id} page={page} last={i === group.pages.length - 1} />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </Shell>
  );
}

/** My Practice and Traditional Information, as on the website's Book of Shadows. */
function LibraryShelves() {
  const { entries } = useLibrary();
  const { settings } = useMySettings();
  const [query, setQuery] = useState('');
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const shelves = useMemo(() => grimoireShelves(entries, settings, query), [entries, settings, query]);
  const searching = query.trim().length > 0;

  if (shelves.length === 0 && !searching) return null;

  const toggle = (set: Set<string>, update: (next: Set<string>) => void, key: string) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    update(next);
  };

  return (
    <View style={styles.shelves}>
      <Field label="Search your Grimoire" value={query} onChangeText={setQuery} placeholder="Rosemary, protection, moonstone…" />
      {searching && shelves.length === 0 && <Text style={type.caption}>Nothing in your library matches that search.</Text>}
      {shelves.map((shelf: GrimoireShelf) => {
        const shelfOpen = !closed.has(shelf.key);
        return (
          <View key={shelf.key} style={styles.section}>
            <Disclosure
              label={shelf.title}
              count={shelf.groups.reduce((sum, g) => sum + g.entries.length, 0)}
              open={shelfOpen}
              heading
              onPress={() => toggle(closed, setClosed, shelf.key)}
            />
            {shelfOpen &&
              shelf.groups.map((group) => {
                const key = `${shelf.key}:${group.type}`;
                // Type groups start closed (the Traditional shelf is long) but open while searching.
                const groupOpen = searching || opened.has(key);
                return (
                  <View key={key} style={styles.list}>
                    <Disclosure
                      label={group.label}
                      count={group.entries.length}
                      open={groupOpen}
                      onPress={() => toggle(opened, setOpened, key)}
                    />
                    {groupOpen &&
                      group.entries.map((entry) => (
                        <Pressable
                          key={entry.id}
                          accessibilityRole="button"
                          accessibilityLabel={`${entry.name}, ${entry.category}`}
                          onPress={() => router.push(grimoireLibraryHref(entry))}
                          style={({ pressed }) => [styles.shelfEntry, pressed && styles.pressed]}
                        >
                          <Text style={[styles.rowTitle, styles.grow]} numberOfLines={1}>
                            {entry.name}
                          </Text>
                          <Icon name="chevron" size={14} color={colors.tabInactive} />
                        </Pressable>
                      ))}
                  </View>
                );
              })}
          </View>
        );
      })}
    </View>
  );
}

function Disclosure({ label, count, open, heading, onPress }: { label: string; count: number; open: boolean; heading?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={`${label}, ${count} ${count === 1 ? 'entry' : 'entries'}`}
      onPress={onPress}
      style={({ pressed }) => [styles.disclosure, pressed && styles.pressed]}
    >
      <Text style={heading ? [type.eyebrow, styles.grow] : styles.groupTitle}>{label}</Text>
      <Text style={type.caption}>{count}</Text>
      <View style={open ? styles.chevronOpen : undefined}>
        <Icon name="chevron" size={14} color={colors.tabInactive} />
      </View>
    </Pressable>
  );
}

function PageRowView({ page, last }: { page: PageRow; last: boolean }) {
  const facts = pageFacts(page);
  const date = parseCalendarDate(facts.date);
  const detail = [pageTypeLabel(page), date ? shortDate(date) : null, facts.moonPhase]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${page.title}. ${detail}`}
      onPress={() => router.push({ pathname: '/grimoire/[pageId]', params: { pageId: page.id } })}
      style={({ pressed }) => [styles.row, !last && styles.rowRule, pressed && styles.pressed]}
    >
      <View style={styles.rowIcon}>
        <Icon name={page.page_type === 'ritual_journal' || page.page_type === 'ritual' ? 'rituals' : 'grimoire'} size={18} color={colors.gold} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {page.title || 'Untitled page'}
        </Text>
        <Text style={type.caption} numberOfLines={1}>
          {detail}
        </Text>
      </View>
      <Icon name="chevron" size={16} color={colors.tabInactive} />
    </Pressable>
  );
}

function Shell({ children, refreshControl }: { children: React.ReactNode; refreshControl?: React.ReactElement<React.ComponentProps<typeof RefreshControl>> }) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={refreshControl} alwaysBounceHorizontal={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  content: { paddingHorizontal: space.gutter, paddingTop: 16, paddingBottom: 32, gap: space.section },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  titleText: { flex: 1, gap: 4 },
  notice: { color: colors.gold },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { flexGrow: 1, flexBasis: 140 },
  emptySection: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderStyle: 'dashed',
  },
  loading: { marginTop: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    gap: 12,
  },
  section: { gap: 8 },
  shelves: { gap: space.section },
  grow: { flex: 1 },
  disclosure: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupTitle: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
  chevronOpen: { transform: [{ rotate: '90deg' }] },
  shelfEntry: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(244,236,216,0.14)',
  },
  list: { backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16 },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  rowRule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
  pressed: { opacity: 0.7 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.cream },
});
