import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/Button';
import { StaveGlyph } from '../../../components/divination/Faces';
import { KipperFace, LenormandArt } from '../../../components/divination/oracle/OracleFaces';
import { DreamList, DreamRow } from '../../../components/grimoire/dreams';
import { CustomiseBar, Disclosure, HomePartFrame, PageList, SectionPicker, SmallButton, SortAndFilter, SortNote } from '../../../components/grimoire/Home';
import { MundaneToggle, useMundaneMode } from '../../../components/grimoire/presentation';
import { FailedChanges } from '../../../components/grimoire/SaveStatus';
import { usePersonalLayout } from '../../../components/grimoire/useLayout';
import { Field } from '../../../components/more/ui';
import { Icon } from '../../../components/Icon';
import { DREAMS, normalizeDream, sortDreams, type DreamEntry } from '../../../lib/craft/hedge/dreams';
import { countOf, DIVINATION_TITLE, divinationGroups, divinationRoute, wordsLine, type DivinationEntry, type DivinationGroup } from '../../../lib/divination/library';
import { deckImages } from '../../../lib/divination/tarotAssets';
import { chosenDeck, type DeckId } from '../../../lib/divination/decks';
import { TarotArt } from '../../../components/divination/TarotArt';
import { useCraft } from '../../../lib/craft/store';
import { confirmAction } from '../../../lib/grimoire/confirm';
import { DREAM_ROUTES, DREAMS_SHELF, dreamSearchResults, dreamShelfLine } from '../../../lib/grimoire/dreams';
import {
  arrangeHome,
  moveHomePart,
  personalParts,
  renamePart,
  resetHome,
  sectionIdOf,
  sectionKey,
  setPartHidden,
  setPartOpen,
  shownPages,
  type HomeItem,
} from '../../../lib/grimoire/layout';
import { bookTitle } from '../../../lib/grimoire/presentation';
import { useGrimoire } from '../../../lib/grimoire/store';
import { grimoireLibraryHref, grimoireShelves, useLibrary, type GrimoireShelf, type ShelfGroup } from '../../../lib/library';
import { useMySettings } from '../../../lib/settings/store';
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

      <View style={styles.actions}>
        <Button label="New page" onPress={() => router.push('/grimoire/new-page')} style={styles.action} />
        <Button label="New entry" variant="outline" onPress={() => router.push('/grimoire/practice')} style={styles.action} />
      </View>

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

      <ArrangedHome mundane={mundane} />
    </Shell>
  );
}

/**
 * The Grimoire's home, as you arrange it (Customise): your own pages and
 * sections, My Practice, Dreams, My Path and Everything Else, each opening
 * and closing, in your order and under your names. Kept in your settings,
 * so the website's Book of Shadows opens the same.
 */
function ArrangedHome({ mundane }: { mundane: boolean }) {
  const { snapshot, actions } = useGrimoire();
  const { entries } = useLibrary();
  const { settings } = useMySettings();
  const { layout, update } = usePersonalLayout();
  const [customising, setCustomising] = useState(false);
  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [filing, setFiling] = useState<PageRow | null>(null);
  const searching = query.trim().length > 0;

  const book = snapshot?.books[0] ?? null;
  const sections = useMemo(() => (snapshot && book ? snapshot.sections.filter((s) => s.book_id === book.id) : []), [snapshot, book]);
  const pages = useMemo(() => (snapshot && book ? snapshot.pages.filter((p) => p.book_id === book.id) : []), [snapshot, book]);
  const known = useMemo(() => new Set(sections.map((s) => s.id)), [sections]);

  // The shelves as they stand (for the parts), and as the search narrows them (for what shows).
  const allShelves = useMemo(() => grimoireShelves(entries, settings, ''), [entries, settings]);
  const shelves = useMemo(() => grimoireShelves(entries, settings, query), [entries, settings, query]);
  const { entries: dreamRows } = useCraft<unknown>(DREAMS);
  const dreams = useMemo(() => dreamRows.map((e) => ({ ...e, data: normalizeDream(e.data) })), [dreamRows]);
  const dreamMatches = useMemo(() => dreamSearchResults(dreams, query), [dreams, query]);
  // Tarot, runes and ogham are built into Traditional Information, so they follow its setting.
  const traditionalOn = !settings || settings.library_traditional_enabled !== false;
  const divination = useMemo(() => (traditionalOn ? divinationGroups(query) : []), [traditionalOn, query]);
  const dreamsOn = settings?.grimoire_show_dreams !== false;

  const builtIn = [
    ...allShelves.map((s) => ({ key: s.key, title: s.title })),
    ...(dreamsOn ? [{ key: DREAMS_SHELF.key, title: DREAMS_SHELF.title }] : []),
    ...(traditionalOn && !allShelves.some((s) => s.key === 'traditional') ? [{ key: 'traditional', title: 'Traditional Information' }] : []),
  ];
  const loose = pages.filter((p) => !p.section_id || !known.has(p.section_id));
  const parts = personalParts({ sections, loose: loose.length > 0, shelves: builtIn });
  const items = arrangeHome(layout, parts, { withHidden: customising });

  const pageMatches = (list: PageRow[]) => (searching ? list.filter((p) => (p.title || '').toLowerCase().includes(query.trim().toLowerCase())) : list);
  const pagesOf = (key: string) => {
    const id = sectionIdOf(key);
    return shownPages(pageMatches(id ? pages.filter((p) => p.section_id === id) : loose), layout);
  };
  const toggleOpened = (key: string) =>
    setOpened((set) => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const removeSection = async (sectionId: string, title: string) => {
    const count = pages.filter((p) => p.section_id === sectionId).length;
    const ok = await confirmAction(`Delete “${title}”?`, count ? `Its ${count === 1 ? 'page stays' : `${count} pages stay`} in your book, without a section.` : 'This section has no pages.', 'Delete section');
    if (ok) actions.deleteSection(sectionId);
  };

  const render = (item: HomeItem, index: number) => {
    const sectionId = sectionIdOf(item.key);
    const isPages = item.key === 'pages' || !!sectionId;
    const shelf = shelves.find((s) => s.key === item.key);
    const frame = {
      item,
      customising,
      first: index === 0,
      last: index === items.length - 1,
      onToggle: () => update(setPartOpen(layout, item.key, !item.open)),
      onMove: (direction: 'up' | 'down') => update(moveHomePart(layout, parts, item.key, direction)),
      onHide: (hidden: boolean) => update(setPartHidden(layout, item.key, hidden)),
      onRename: (title: string) => (sectionId ? actions.renameSection(sectionId, title) : update(renamePart(layout, item.key, title, item.defaultTitle))),
    };

    if (isPages) {
      const list = pagesOf(item.key);
      if (searching && !list.length) return null;
      return (
        <HomePartFrame
          key={item.key}
          {...frame}
          item={searching ? { ...item, open: true } : item}
          count={list.length}
          extraControls={
            sectionId ? (
              <>
                <SmallButton label="Add a page" onPress={() => router.push({ pathname: '/grimoire/new-page', params: { sectionId } })} />
                <SmallButton label="Delete section" tone="danger" onPress={() => void removeSection(sectionId, item.title)} />
              </>
            ) : null
          }
        >
          <PageList
            pages={list}
            mundane={mundane}
            empty={layout.kind ? 'No pages of that kind here.' : 'No pages here yet.'}
            canMove={layout.sort === 'custom' && !layout.kind}
            customising={customising}
            onMove={(page, direction) => actions.movePage(page.id, direction)}
            onFile={(page) => setFiling(page)}
          />
        </HomePartFrame>
      );
    }

    if (item.key === DREAMS_SHELF.key) {
      if (searching && !dreamMatches.length) return null;
      return (
        <HomePartFrame key={item.key} {...frame} item={searching ? { ...item, open: true } : item} count={searching ? dreamMatches.length : dreams.length}>
          <DreamsBody dreams={dreams} matches={dreamMatches} query={query} />
        </HomePartFrame>
      );
    }

    const holdsDivination = item.key === 'traditional' && divination.length > 0;
    if (!shelf && !holdsDivination) return null;
    const count = (groups: ShelfGroup[]) => groups.reduce((sum, g) => sum + g.entries.length, 0);
    const total = (shelf?.sections.reduce((sum, section) => sum + count(section.groups), 0) ?? 0) + (item.key === 'traditional' ? divination.reduce((sum, g) => sum + countOf(g), 0) : 0);
    return (
      <HomePartFrame key={item.key} {...frame} item={searching ? { ...item, open: true } : item} count={total}>
        {shelf && <ShelfBody shelf={shelf} searching={searching} opened={opened} onToggle={toggleOpened} />}
        {holdsDivination && <DivinationSection groups={divination} searching={searching} opened={opened} onToggle={toggleOpened} deck={chosenDeck(settings)} />}
      </HomePartFrame>
    );
  };

  const shown = items.map(render).filter(Boolean);

  return (
    <View style={styles.shelves}>
      <Field label="Search your Grimoire" value={query} onChangeText={setQuery} placeholder="Rosemary, protection, a dream of water…" />
      <CustomiseBar
        customising={customising}
        onToggle={() => setCustomising(!customising)}
        onReset={() => update(resetHome(layout))}
      />
      {customising && (
        <>
          <SortAndFilter layout={layout} pages={pages} onChange={(next) => update({ ...layout, ...next })} />
          <SmallButton label="New section" hint="Make a section of your own, for pages that belong together" onPress={() => router.push('/grimoire/sections')} />
        </>
      )}
      {!customising && <SortNote layout={layout} onClear={() => update({ ...layout, sort: 'custom', kind: null })} />}
      {searching && !shown.length && <Text style={type.caption}>Nothing in your Grimoire matches that search.</Text>}
      {shown}
      <SectionPicker
        page={filing}
        sections={[...sections].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))}
        onClose={() => setFiling(null)}
        onChoose={(sectionId) => {
          if (filing) actions.filePage(filing.id, sectionId);
          if (sectionId) update(setPartOpen(layout, sectionKey(sectionId), true));
          setFiling(null);
        }}
      />
    </View>
  );
}

/** A Living Library shelf's sections and groups, as on the website's Book of Shadows. */
function ShelfBody({ shelf, searching, opened, onToggle }: { shelf: GrimoireShelf; searching: boolean; opened: Set<string>; onToggle: (key: string) => void }) {
  const count = (groups: ShelfGroup[]) => groups.reduce((sum, g) => sum + g.entries.length, 0);
  return (
    <>
      {shelf.sections.map((section) => {
        const sectionKeyName = `${shelf.key}:${section.key}`;
        // A tradition or piece starts closed and opens on its own; untitled sections are just their groups.
        const sectionOpen = !section.title || searching || opened.has(sectionKeyName);
        return (
          <View key={sectionKeyName} style={section.title ? styles.pathSection : styles.section}>
            {!!section.title && <Disclosure label={section.title} note={section.note} count={count(section.groups)} open={sectionOpen} onPress={() => onToggle(sectionKeyName)} />}
            {sectionOpen &&
              section.groups.map((group) => {
                // Each group has its own key (shelf, section and type), so opening one never opens another.
                const key = `${shelf.key}:${group.key}`;
                const groupOpen = searching || opened.has(key);
                return (
                  <View key={key} style={[styles.list, section.title ? styles.nested : undefined]}>
                    <Disclosure label={group.label} count={group.entries.length} open={groupOpen} onPress={() => onToggle(key)} />
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
    </>
  );
}

/**
 * Traditional Information → Divination: Tarot, Runes and Ogham as sibling
 * drop-downs, each card or stave a row with its picture or letter and its
 * three words, opening its page. Searching opens the ones that match.
 */
function DivinationSection({ groups, searching, opened, onToggle, deck }: { groups: DivinationGroup[]; searching: boolean; opened: Set<string>; onToggle: (key: string) => void; deck: DeckId }) {
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
                    <DivinationRow key={entry.id} entry={entry} deck={deck} />
                  ))}
                </View>
              ))}
          </View>
        );
      })}
    </View>
  );
}

function DivinationRow({ entry, deck }: { entry: DivinationEntry; deck: DeckId }) {
  // The card in your chosen deck (Settings → Divination).
  const art = entry.cardId ? deckImages[deck][entry.cardId] : undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.name}: ${entry.words.join(', ')}`}
      onPress={() => router.push(divinationRoute(entry) as Href)}
      style={({ pressed }) => [styles.shelfEntry, styles.divinationEntry, pressed && styles.pressed]}
    >
      {art ? (
        <TarotArt place={art} style={styles.thumb} />
      ) : entry.kind === 'lenormand' ? (
        <LenormandArt id={entry.id} style={styles.thumb} />
      ) : entry.kind === 'kipper' ? (
        <View style={styles.thumb}>
          <KipperFace name={entry.name} width={26} />
        </View>
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
  return (
    <View style={styles.section}>
      <Disclosure label={DREAMS_SHELF.title} count={dreams.length} open={open} heading onPress={() => setOpen(!open)} />
      {open && <DreamsBody dreams={dreams} matches={[]} query="" />}
    </View>
  );
}

/**
 * Dreams, a built-in section of the Grimoire: the dream journal the Hedge
 * practice keeps. Searching the Grimoire shows the dreams that match.
 */
function DreamsBody({ dreams, matches, query }: { dreams: DreamEntry[]; matches: DreamEntry[]; query: string }) {
  const searching = query.trim().length > 0;
  const shown = searching ? matches : sortDreams(dreams).slice(0, 3);
  return (
    <>
      {!searching && <Text style={type.caption}>{dreamShelfLine(dreams)}</Text>}
      {shown.length > 0 && (
        <DreamList>
          {shown.map((entry, i) => (
            <DreamRow key={entry.id} entry={entry} last={i === shown.length - 1} />
          ))}
        </DreamList>
      )}
      <View style={styles.dreamActions}>
        {!searching && <Button label="Write down a dream" variant="outline" onPress={() => router.push(DREAM_ROUTES.write as Href)} style={styles.action} />}
        <Button
          label={searching ? 'All dreams that match' : dreams.length ? 'All dreams' : 'Open Dreams'}
          variant="outline"
          onPress={() => router.push((searching ? `${DREAM_ROUTES.journal}?q=${encodeURIComponent(query.trim())}` : DREAM_ROUTES.journal) as Href)}
          style={styles.action}
        />
      </View>
    </>
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
  dreamActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  groupTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
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
  pressed: { opacity: 0.7 },
  rowTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.cream },
});
