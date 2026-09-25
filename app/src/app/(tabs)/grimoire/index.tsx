import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import { parseCalendarDate, shortDate } from '../../../lib/calendar';
import { useGrimoire } from '../../../lib/grimoire/store';
import { pageFacts, pageTypeLabel, tableOfContents } from '../../../lib/grimoire/structure';
import type { PageRow } from '../../../lib/grimoire/types';
import { useSession } from '../../../lib/session';
import { colors, fonts, radius, space, type } from '../../../theme';

export default function Grimoire() {
  const { session } = useSession();
  const { snapshot, status, refresh } = useGrimoire();
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
  const groups = snapshot && book ? tableOfContents(snapshot, book.id) : [];
  const pageCount = groups.reduce((sum, g) => sum + g.pages.length, 0);

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
          <Text style={type.eyebrow}>{book ? `${pageCount} ${pageCount === 1 ? 'page' : 'pages'}` : 'Book of Shadows'}</Text>
          <Text accessibilityRole="header" style={type.title}>
            {book?.title ?? 'Grimoire'}
          </Text>
        </View>
      </View>

      {status === 'offline' && snapshot && (
        <Text style={[type.caption, styles.notice]}>Offline · showing the copy saved on this phone</Text>
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
        </View>
      )}

      {snapshot && book && pageCount === 0 && (
        <View style={styles.card}>
          <Text style={type.body}>This book has no pages yet.</Text>
        </View>
      )}

      {groups.map((group) =>
        group.pages.length === 0 ? null : (
          <View key={group.section?.id ?? 'loose'} style={styles.section}>
            {group.section && <Text style={type.eyebrow}>{group.section.title}</Text>}
            <View style={styles.list}>
              {group.pages.map((page, i) => (
                <PageRowView key={page.id} page={page} last={i === group.pages.length - 1} />
              ))}
            </View>
          </View>
        ),
      )}
    </Shell>
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
});
