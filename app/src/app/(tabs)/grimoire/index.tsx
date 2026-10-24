import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/Button';
import { StaveGlyph } from '../../../components/divination/Faces';
import { DreamList, DreamRow } from '../../../components/grimoire/dreams';
import { MundaneToggle, useMundaneMode } from '../../../components/grimoire/presentation';
import { FailedChanges } from '../../../components/grimoire/SaveStatus';
import { Field } from '../../../components/more/ui';
import { Icon } from '../../../components/Icon';
import { parseCalendarDate, shortDate } from '../../../lib/calendar';
import { DREAMS, normalizeDream, sortDreams, type DreamEntry } from '../../../lib/craft/hedge/dreams';
import { countOf, DIVINATION_TITLE, divinationGroups, divinationRoute, wordsLine, type DivinationEntry, type DivinationGroup } from '../../../lib/divination/library';
import { tarotImages } from '../../../lib/divination/tarotAssets';
import { TarotArt } from '../../../components/divination/TarotArt';
import { useCraft } from '../../../lib/craft/store';
import { DREAM_ROUTES, DREAMS_SHELF, dreamSearchResults, dreamShelfLine, withDreamsShelf } from '../../../lib/grimoire/dreams';
import { bookTitle, displayPageTitle, mundaneWords } from '../../../lib/grimoire/presentation';
import { useGrimoire } from '../../../lib/grimoire/store';
import { grimoireLibraryHref, grimoireShelves, useLibrary, type GrimoireShelf, type ShelfGroup } from '../../../lib/library';
import { useMySettings } from '../../../lib/settings/store';
import { pageFacts, pageTypeLabel, tableOfContents } from '../../../lib/grimoire/structure';
import type { PageRow } from '../../../lib/grimoire/types';
import { PracticeSwitch } from '../../../components/PracticeSwitch';
import { useSession } from '../../../lib/session';
import { colors, fonts, radius, space, type } from '../../../theme';

export default function Grimoire() {
  const { session } = useSession();
  const { snapshot, status, refresh, sync, pendingCount } = useGrimoire();
  const [pulling, setPulling] = useState(false);
  const { mundane, setMundane } = useMundaneMode();

  if (!session) {
    return (
      <Shell>
        <PracticeSwitch current="grimoire" />
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
        <GuestDreams />
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
      <PracticeSwitch current="grimoire" />
      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <Text style={type.eyebrow}>Grimoire</Text>
          <Text accessibilityRole="header" style={type.title}>
            {bookTitle(book?.title, mundane)}
          </Text>
        </View>
        <MundaneToggle mundane={mundane} onChange={setMundane} />
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
                  <PageRowView key={page.id} page={page} mundane={mundane} last={i === group.pages.length - 1} />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </Shell>
  );
}

/** My Practice, Dreams and Traditional Information, as on the website's Book of Shadows. */
function LibraryShelves() {
  const { entries } = useLibrary();
  const { settings } = useMySettings();
  const [query, setQuery] = useState('');
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const shelves = useMemo(() => grimoireShelves(entries, settings, query), [entries, settings, query]);
  const searching = query.trim().length > 0;
  const { entries: dreamRows } = useCraft<unknown>(DREAMS);
  const dreams = useMemo(() => dreamRows.map((e) => ({ ...e, data: normalizeDream(e.data) })), [dreamRows]);
  const dreamMatches = useMemo(() => dreamSearchResults(dreams, query), [dreams, query]);
  // Tarot, runes and ogham are built into Traditional Information, so they follow its setting.
  const traditionalOn = !settings || settings.library_traditional_enabled !== false;
  const divination = useMemo(() => (traditionalOn ? divinationGroups(query) : []), [traditionalOn, query]);
  // Dreams is a built-in shelf like My Practice, placed just after it, unless it's switched off.
  const shelfItems: { key: string; shelf: GrimoireShelf | null }[] = shelves.map((shelf) => ({ key: shelf.key, shelf }));
  // A search can match only the Divination pages; Traditional Information still shows to hold them.
  if (divination.length && !shelves.some((s) => s.key === 'traditional')) {
    shelfItems.push({ key: 'traditional', shelf: { key: 'traditional', title: 'Traditional Information', sections: [] } });
  }
  const items = settings?.grimoire_show_dreams === false ? shelfItems : withDreamsShelf(shelfItems, { key: DREAMS_SHELF.key, shelf: null });

  const toggle = (set: Set<string>, update: (next: Set<string>) => void, key: string) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    update(next);
  };

  return (
    <View style={styles.shelves}>
      <Field label="Search your Grimoire" value={query} onChangeText={setQuery} placeholder="Rosemary, protection, a dream of water…" />
      {searching && shelves.length === 0 && dreamMatches.length === 0 && divination.length === 0 && <Text style={type.caption}>Nothing in your Grimoire matches that search.</Text>}
      {items.map(({ key, shelf }) => {
        if (!shelf) {
          return (
            <DreamsShelf
              key={key}
              dreams={dreams}
              matches={dreamMatches}
              query={query}
              open={!closed.has(key)}
              onToggle={() => toggle(closed, setClosed, key)}
            />
          );
        }
        const shelfOpen = !closed.has(shelf.key);
        const count = (groups: ShelfGroup[]) => groups.reduce((sum, g) => sum + g.entries.length, 0);
        return (
          <View key={shelf.key} style={styles.section}>
            <Disclosure
              label={shelf.title}
              count={shelf.sections.reduce((sum, section) => sum + count(section.groups), 0) + (shelf.key === 'traditional' ? divination.reduce((sum, g) => sum + countOf(g), 0) : 0)}
              open={shelfOpen}
              heading
              onPress={() => toggle(closed, setClosed, shelf.key)}
            />
            {shelfOpen &&
              shelf.sections.map((section) => {
                const sectionKey = `${shelf.key}:${section.key}`;
                // A tradition or piece starts closed and opens on its own; untitled sections are just their groups.
                const sectionOpen = !section.title || searching || opened.has(sectionKey);
                return (
                  <View key={sectionKey} style={section.title ? styles.pathSection : styles.section}>
                    {!!section.title && (
                      <Disclosure
                        label={section.title}
                        note={section.note}
                        count={count(section.groups)}
                        open={sectionOpen}
                        onPress={() => toggle(opened, setOpened, sectionKey)}
                      />
                    )}
                    {sectionOpen &&
                      section.groups.map((group) => {
                        // Each group has its own key (shelf, section and type), so opening one never opens another.
                        const key = `${shelf.key}:${group.key}`;
                        const groupOpen = searching || opened.has(key);
                        return (
                          <View key={key} style={[styles.list, section.title ? styles.nested : undefined]}>
                            <Disclosure label={group.label} count={group.entries.length} open={groupOpen} onPress={() => toggle(opened, setOpened, key)} />
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
            {shelfOpen && shelf.key === 'traditional' && divination.length > 0 && (
              <DivinationSection groups={divination} searching={searching} opened={opened} onToggle={(key) => toggle(opened, setOpened, key)} />
            )}
          </View>
        );
      })}
    </View>
  );
}

/**
 * Traditional Information → Divination: Tarot, Runes and Ogham as sibling
 * drop-downs, each card or stave a row with its picture or letter and its
 * three words, opening its page. Searching opens the ones that match.
 */
function DivinationSection({ groups, searching, opened, onToggle }: { groups: DivinationGroup[]; searching: boolean; opened: Set<string>; onToggle: (key: string) => void }) {
  return (
    <View style={styles.pathSection}>
      <Text style={styles.groupTitle}>{DIVINATION_TITLE}</Text>
      {groups.map((group) => {
        const key = `traditional:divination:${group.kind}`;
        const open = searching || opened.has(key);
        return (
          <View key={key} style={styles.list}>
            <Disclosure label={group.label} note={open && !searching ? group.note : undefined} count={countOf(group)} open={open} onPress={() => onToggle(key)} />
            {open &&
              group.subgroups.map((sub) => (
                <View key={sub.key}>
                  {group.subgroups.length > 1 && <Text style={[type.caption, styles.subgroup]}>{sub.label}</Text>}
                  {sub.entries.map((entry) => (
                    <DivinationRow key={entry.id} entry={entry} />
                  ))}
                </View>
              ))}
          </View>
        );
      })}
    </View>
  );
}

function DivinationRow({ entry }: { entry: DivinationEntry }) {
  const art = entry.cardId ? tarotImages[entry.cardId] : undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.name}: ${entry.words.join(', ')}`}
      onPress={() => router.push(divinationRoute(entry) as Href)}
      style={({ pressed }) => [styles.shelfEntry, styles.divinationEntry, pressed && styles.pressed]}
    >
      {art ? (
        <TarotArt place={art} style={styles.thumb} />
      ) : (
        <StaveGlyph glyph={entry.glyph ?? ''} kind={entry.kind === 'ogham' ? 'ogham' : 'runes'} size={26} />
      )}
      <View style={styles.grow}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {entry.name}
        </Text>
        <Text style={type.caption} numberOfLines={1}>
          {wordsLine(entry.words)}
        </Text>
      </View>
      <Icon name="chevron" size={14} color={colors.tabInactive} />
    </Pressable>
  );
}

/** Dreams need no account (they're kept on this phone until you sign in), so guests have them here too. */
function GuestDreams() {
  const { settings } = useMySettings();
  const { entries } = useCraft<unknown>(DREAMS);
  const dreams = useMemo(() => entries.map((e) => ({ ...e, data: normalizeDream(e.data) })), [entries]);
  const [open, setOpen] = useState(true);
  if (settings?.grimoire_show_dreams === false) return null;
  return <DreamsShelf dreams={dreams} matches={[]} query="" open={open} onToggle={() => setOpen(!open)} />;
}

/**
 * Dreams, a built-in section of the Grimoire: the dream journal the Hedge
 * practice keeps. Searching the Grimoire shows the dreams that match.
 */
function DreamsShelf({
  dreams,
  matches,
  query,
  open,
  onToggle,
}: {
  dreams: DreamEntry[];
  matches: DreamEntry[];
  query: string;
  open: boolean;
  onToggle: () => void;
}) {
  const searching = query.trim().length > 0;
  if (searching && matches.length === 0) return null;
  const shown = searching ? matches : sortDreams(dreams).slice(0, 3);
  return (
    <View style={styles.section}>
      <Disclosure label={DREAMS_SHELF.title} count={searching ? matches.length : dreams.length} open={open || searching} heading onPress={onToggle} />
      {(open || searching) && (
        <>
          {!searching && <Text style={type.caption}>{dreamShelfLine(dreams)}</Text>}
          {shown.length > 0 && (
            <DreamList>
              {shown.map((entry, i) => (
                <DreamRow key={entry.id} entry={entry} last={i === shown.length - 1} />
              ))}
            </DreamList>
          )}
          <View style={styles.section}>
            {!searching && <Button label="Write down a dream" variant="outline" onPress={() => router.push(DREAM_ROUTES.write as Href)} />}
            <Button
              label={searching ? 'All dreams that match' : dreams.length ? 'All dreams and patterns' : 'Open Dreams'}
              variant="outline"
              onPress={() => router.push((searching ? `${DREAM_ROUTES.journal}?q=${encodeURIComponent(query.trim())}` : DREAM_ROUTES.journal) as Href)}
            />
          </View>
        </>
      )}
    </View>
  );
}

function Disclosure({ label, note, count, open, heading, onPress }: { label: string; note?: string; count: number; open: boolean; heading?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={`${label}, ${count} ${count === 1 ? 'entry' : 'entries'}`}
      onPress={onPress}
      style={({ pressed }) => [styles.disclosure, pressed && styles.pressed]}
    >
      <View style={styles.disclosureText}>
        <Text style={heading ? type.eyebrow : styles.groupTitle}>{label}</Text>
        {!!note && <Text style={type.caption}>{note}</Text>}
      </View>
      <Text style={type.caption}>{count}</Text>
      <View style={open ? styles.chevronOpen : undefined}>
        <Icon name="chevron" size={14} color={colors.tabInactive} />
      </View>
    </Pressable>
  );
}

function PageRowView({ page, mundane, last }: { page: PageRow; mundane: boolean; last: boolean }) {
  const facts = pageFacts(page);
  const date = parseCalendarDate(facts.date);
  const label = mundane ? mundaneWords(pageTypeLabel(page)) : pageTypeLabel(page);
  // A mundane title is already the date, so the detail line leaves it out.
  const detail = [label, date && !mundane ? shortDate(date) : null, facts.moonPhase]
    .filter(Boolean)
    .join(' · ');
  const title = displayPageTitle(page, mundane);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${detail}`}
      onPress={() => router.push({ pathname: '/grimoire/[pageId]', params: { pageId: page.id } })}
      style={({ pressed }) => [styles.row, !last && styles.rowRule, pressed && styles.pressed]}
    >
      <View style={styles.rowIcon}>
        <Icon name={['ritual_journal', 'ritual', 'spell'].includes(page.page_type ?? '') ? 'rituals' : 'grimoire'} size={18} color={colors.gold} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {title}
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
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={refreshControl}
        alwaysBounceHorizontal={false}
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
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
  disclosureText: { flex: 1, gap: 2 },
  disclosure: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
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
  pathSection: { gap: 8, borderLeftWidth: 2, borderLeftColor: colors.goldLine, paddingLeft: 10 },
  nested: { marginLeft: 4 },
  subgroup: { paddingTop: 10, paddingBottom: 4, color: colors.gold },
  divinationEntry: { minHeight: 56, paddingVertical: 6 },
  thumb: { width: 26, height: 45, borderRadius: 3, backgroundColor: colors.cream },
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
