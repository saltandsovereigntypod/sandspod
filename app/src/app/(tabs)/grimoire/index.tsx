import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/Button';
import { FailedChanges } from '../../../components/grimoire/SaveStatus';
import { Icon } from '../../../components/Icon';
import { parseCalendarDate, shortDate } from '../../../lib/calendar';
import { grimoireLibraryHref, libraryShelves, type LibraryShelf, type ShelfGroup } from '../../../lib/grimoire/libraryShelves';
import { useGrimoire } from '../../../lib/grimoire/store';
import { useLibrary } from '../../../lib/library';
import { useMySettings } from '../../../lib/settings/store';
import { pageFacts, pageTypeLabel, tableOfContents } from '../../../lib/grimoire/structure';
import type { PageRow } from '../../../lib/grimoire/types';
import { useSession } from '../../../lib/session';
import { colors, fonts, radius, space, type } from '../../../theme';

export default function Grimoire() {
  const { session } = useSession();
  const { snapshot, status, refresh, canEdit, sync, pendingCount } = useGrimoire();
  const [pulling, setPulling] = useState(false);
  const library = useLibrary();
  const { settings } = useMySettings();

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
  const groups = snapshot && book ? tableOfContents(snapshot, book.id) : [];
  const pageCount = groups.reduce((sum, g) => sum + g.pages.length, 0);
  const shelves = libraryShelves(library.entries, settings);

  return (
    <Shell
      refreshControl={
        <RefreshControl
          refreshing={pulling}
          tintColor={colors.gold}
          onRefresh={async () => {
            setPulling(true);
            await Promise.all([refresh(), library.refresh()]);
            setPulling(false);
          }}
        />
      }
    >
      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <Text style={type.eyebrow}>{book ? `${pageCount} ${pageCount === 1 ? 'page' : 'pages'}` : 'Book of Shadows'}</Text>
          <Text accessibilityRole="header" style={type.title}>
            {book?.title ?? 'Grimoire'}
          </Text>
        </View>
      </View>

      {canEdit && (
        <View style={styles.actions}>
          <Button
            label="New page"
            onPress={() => router.push('/grimoire/new-page')}
            style={styles.action}
          />
          <Button label="Sections" variant="outline" onPress={() => router.push('/grimoire/sections')} style={styles.action} />
        </View>
      )}

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

      {snapshot && !book && (
        <View style={styles.card}>
          <Text style={type.cardTitle}>Your book is waiting</Text>
          <Text style={type.body}>Pages you write, and rituals you finish at the altar, will appear here.</Text>
          <Button label="Write your first page" onPress={() => router.push('/grimoire/new-page')} />
        </View>
      )}

      {snapshot && book && pageCount === 0 && (
        <View style={styles.card}>
          <Text style={type.body}>This book has no pages yet.</Text>
        </View>
      )}

      {groups.map((group) =>
        group.pages.length === 0 && !(canEdit && group.section) ? null : (
          <View key={group.section?.id ?? 'loose'} style={styles.section}>
            {group.section && <Text style={type.eyebrow}>{group.section.title}</Text>}
            {group.pages.length > 0 ? (
              <View style={styles.list}>
                {group.pages.map((page, i) => (
                  <PageRowView key={page.id} page={page} last={i === group.pages.length - 1} />
                ))}
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Add a page to ${group.section?.title}`}
                onPress={() =>
                  router.push({ pathname: '/grimoire/new-page', params: { sectionId: group.section?.id ?? '' } })
                }
                style={({ pressed }) => [styles.emptySection, pressed && styles.pressed]}
              >
                <Text style={type.caption}>No pages yet · </Text>
                <Text style={[type.caption, styles.notice]}>Add one</Text>
              </Pressable>
            )}
          </View>
        ),
      )}

      {shelves.map((shelf) => (
        <ShelfView key={shelf.key} shelf={shelf} />
      ))}
    </Shell>
  );
}

// The Living Library shelves, as at the end of the book on the website. Closed
// at first: the Traditional shelf alone holds hundreds of entries.
function ShelfView({ shelf }: { shelf: LibraryShelf }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${shelf.title}, ${shelf.count} ${shelf.count === 1 ? 'entry' : 'entries'}`}
        onPress={() => setOpen(!open)}
        style={({ pressed }) => [styles.shelfHead, pressed && styles.pressed]}
      >
        <View style={styles.rowIcon}>
          <Icon name="grimoire" size={18} color={colors.gold} />
        </View>
        <View style={styles.rowText}>
          <Text style={type.eyebrow}>Living Library</Text>
          <Text style={styles.rowTitle}>{shelf.title}</Text>
          <Text style={type.caption}>{shelf.count === 1 ? '1 entry' : `${shelf.count} entries`}</Text>
        </View>
        <View style={open && styles.chevronOpen}>
          <Icon name="chevron" size={16} color={colors.tabInactive} />
        </View>
      </Pressable>
      {open && (
        <View style={styles.list}>
          {shelf.groups.map((group, i) => (
            <ShelfGroupView key={group.type} group={group} last={i === shelf.groups.length - 1} />
          ))}
        </View>
      )}
    </View>
  );
}

function ShelfGroupView({ group, last }: { group: ShelfGroup; last: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={!last && styles.rowRule}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${group.label}, ${group.entries.length}`}
        onPress={() => setOpen(!open)}
        style={({ pressed }) => [styles.groupHead, pressed && styles.pressed]}
      >
        <Text style={[styles.groupTitle, styles.rowText]}>{group.label}</Text>
        <Text style={type.caption}>{group.entries.length}</Text>
        <View style={open && styles.chevronOpen}>
          <Icon name="chevron" size={14} color={colors.tabInactive} />
        </View>
      </Pressable>
      {open &&
        group.entries.map((entry) => (
          <Pressable
            key={entry.id}
            accessibilityRole="button"
            onPress={() => router.push(grimoireLibraryHref(entry))}
            style={({ pressed }) => [styles.entry, pressed && styles.pressed]}
          >
            <Text style={[type.body, styles.rowText]} numberOfLines={1}>
              {entry.name}
            </Text>
            <Icon name="chevron" size={14} color={colors.tabInactive} />
          </Pressable>
        ))}
    </View>
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
  shelfHead: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.surface,
  },
  chevronOpen: { transform: [{ rotate: '90deg' }] },
  groupHead: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10 },
  groupTitle: { fontFamily: fonts.display, fontSize: 18, lineHeight: 22, color: colors.cream },
  entry: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 12 },
});
