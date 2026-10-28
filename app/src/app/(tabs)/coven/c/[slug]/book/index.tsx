import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { useCovenBook } from '../../../../../../components/grimoire/covenBook';
import { CustomiseBar, HomePartFrame, PageList, SectionPicker, SmallButton, SortAndFilter, SortNote } from '../../../../../../components/grimoire/Home';
import { useMundaneMode } from '../../../../../../components/grimoire/presentation';
import { FailedChanges } from '../../../../../../components/grimoire/SaveStatus';
import { Field, MenuList, MenuRow, Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { errorMessage } from '../../../../../../lib/covens/model';
import { recordMoon, type RitualRecord } from '../../../../../../lib/covens/script';
import { confirmAction } from '../../../../../../lib/grimoire/confirm';
import { COVEN_SHELVES, covenParts, shelfOf, unsavedRecords, type CovenBookRow, type CovenSectionRow } from '../../../../../../lib/grimoire/coven';
import {
  arrangeHome,
  moveHomePart,
  parseLayout,
  renamePart,
  resetHome,
  sectionIdOf,
  setPartHidden,
  shownPages,
  type GrimoireLayout,
  type HomeItem,
} from '../../../../../../lib/grimoire/layout';
import type { Submission } from '../../../../../../lib/grimoire/submissions';
import type { PageRow } from '../../../../../../lib/grimoire/types';
import { colors, space, type } from '../../../../../../theme';

const openKey = (covenId: string) => `covenBook.open.${covenId}`;

// The coven's Book of Shadows, as rich as anyone's own grimoire: sections and
// pages written with the same editor, linked to each other and to the Living
// Library, with the coven's own shelves (Rites, Ritual records, Meeting
// minutes, Study material). Who may open, write in and approve each part is
// set per book, section and page. Those who approve for the whole book
// arrange its contents for everyone; what's open or closed is each person's own.
export default function CovenBook() {
  const { coven, grimoire, book, canPage, canSection, canBook, href } = useCovenBook();
  const { snapshot, status, refresh, actions } = grimoire;
  const { mundane } = useMundaneMode();
  const covenId = coven.snapshot?.coven.id ?? '';
  const [records, setRecords] = useState<RitualRecord[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [query, setQuery] = useState('');
  const [customising, setCustomising] = useState(false);
  const [localLayout, setLocalLayout] = useState<GrimoireLayout | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [filing, setFiling] = useState<PageRow | null>(null);
  const [newSection, setNewSection] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const { loadNames } = coven;

  const loadExtras = useCallback(async () => {
    if (!covenId) return;
    const [nextRecords, nextSubs] = await Promise.all([api.fetchRecords(covenId), api.fetchSubmissions(covenId)]);
    setRecords(nextRecords);
    setSubmissions(nextSubs);
    void loadNames([...nextRecords.flatMap((r) => [...r.attendees, r.led_by]), ...nextSubs.map((s) => s.submitted_by)]);
  }, [covenId, loadNames]);

  // Fresh each time the screen comes back into view.
  useFocusEffect(
    useCallback(() => {
      void loadExtras();
    }, [loadExtras]),
  );

  // What's open and closed is yours, kept on this phone.
  useEffect(() => {
    if (!covenId) return;
    AsyncStorage.getItem(openKey(covenId))
      .then((raw) => raw && setOpen(JSON.parse(raw) as Record<string, boolean>))
      .catch(() => {});
  }, [covenId]);
  const toggle = (item: HomeItem) => {
    const next = { ...open, [item.key]: !item.open };
    setOpen(next);
    AsyncStorage.setItem(openKey(covenId), JSON.stringify(next)).catch(() => {});
  };

  const savedLayout = useMemo(() => parseLayout((book as CovenBookRow | null)?.layout), [book]);
  const layout = localLayout ?? savedLayout;
  const arrange = canBook('approve');
  const saveLayout = (next: GrimoireLayout) => {
    if (!book) return;
    setLocalLayout(next);
    api.setBookLayout(book.id, { ...next }).catch((e) => setMessage(errorMessage(e)));
  };

  const sections = useMemo(() => (snapshot?.sections ?? []) as CovenSectionRow[], [snapshot]);
  const pages = useMemo(() => snapshot?.pages ?? [], [snapshot]);
  const known = new Set(sections.map((s) => s.id));
  const loose = pages.filter((p) => !p.section_id || !known.has(p.section_id));
  const parts = covenParts({ sections, loose: loose.length > 0 });
  const items = arrangeHome({ ...layout, open: { ...layout.open, ...open } }, parts, { withHidden: customising });
  const searching = query.trim().length > 0;
  const matches = (list: PageRow[]) => (searching ? list.filter((p) => p.title.toLowerCase().includes(query.trim().toLowerCase())) : list);

  const waiting = submissions.filter((s) => s.status === 'pending' && s.submitted_by !== coven.userId);
  const mine = submissions.filter((s) => s.submitted_by === coven.userId && s.status !== 'approved');
  const writeSomewhere = canBook('write') || sections.some((s) => canSection(s, 'write'));
  const unsavedRites = unsavedRecords(records, pages, 'rite');
  const unsavedMeetings = unsavedRecords(records, pages, 'meeting');

  const removeSection = async (section: CovenSectionRow) => {
    const count = pages.filter((p) => p.section_id === section.id).length;
    const ok = await confirmAction(`Delete “${section.title}”?`, count ? `Its ${count === 1 ? 'page stays' : `${count} pages stay`} in the book, without a section.` : 'This section has no pages.', 'Delete section');
    if (ok) actions.deleteSection(section.id);
  };

  const recordRows = (list: RitualRecord[]) =>
    list.slice(0, 40).map((r, i) => (
      <MenuRow
        key={r.ritual_id}
        label={r.title}
        detail={[r.held_at || r.ended_at ? new Date(r.held_at ?? r.ended_at!).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '', recordMoon(r), `${r.attendees.length} there`].filter(Boolean).join(' · ')}
        last={i === Math.min(list.length, 40) - 1}
        onPress={() => router.push(`${href('record')}?ritual=${r.ritual_id}` as Href)}
      />
    ));

  const render = (item: HomeItem, index: number) => {
    const sectionId = sectionIdOf(item.key);
    const section = sectionId ? (sections.find((s) => s.id === sectionId) ?? null) : null;
    const shelf = shelfOf(section);
    const list = shownPages(matches(section ? pages.filter((p) => p.section_id === section.id) : loose), layout);
    const extraRecords = shelf === 'records' ? unsavedRites : shelf === 'minutes' ? unsavedMeetings : [];
    const shownRecords = searching ? extraRecords.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase())) : extraRecords;
    if (searching && !list.length && !shownRecords.length) return null;
    const writeHere = canSection(section, 'write');
    const approveHere = canSection(section, 'approve');
    const note = shelf ? COVEN_SHELVES.find((s) => s.shelf === shelf)?.note : undefined;
    return (
      <HomePartFrame
        key={item.key}
        item={searching ? { ...item, open: true } : item}
        count={list.length + shownRecords.length}
        customising={customising}
        first={index === 0}
        last={index === items.length - 1}
        onToggle={() => toggle(item)}
        onMove={arrange ? (direction) => saveLayout(moveHomePart(layout, parts, item.key, direction)) : undefined}
        onHide={arrange ? (hidden) => saveLayout(setPartHidden(layout, item.key, hidden)) : undefined}
        onRename={section && writeHere ? (title) => actions.renameSection(section.id, title) : !section && arrange ? (title) => saveLayout(renamePart(layout, item.key, title, item.defaultTitle)) : undefined}
        extraControls={
          <>
            {approveHere && section && <SmallButton label="Who can open it" onPress={() => router.push(`${href('access')}?kind=section&id=${section.id}` as Href)} />}
            {writeHere && <SmallButton label="Add a page" onPress={() => router.push(`${href('new-page')}${section ? `?sectionId=${section.id}` : ''}` as Href)} />}
            {approveHere && section && !shelf && <SmallButton label="Delete section" tone="danger" onPress={() => void removeSection(section)} />}
          </>
        }
      >
        {!!note && !searching && <Text style={type.caption}>{note}</Text>}
        {(list.length > 0 || !shownRecords.length) && (
          <PageList
            pages={list}
            mundane={mundane}
            empty={writeHere ? 'No pages here yet.' : 'No pages here yet. You can suggest one.'}
            customising={customising}
            canMove={layout.sort === 'custom' && !layout.kind && writeHere}
            onMove={(page, direction) => actions.movePage(page.id, direction)}
            onFile={(page) => {
              if (canPage(page, 'write')) setFiling(page);
            }}
            detail={(page) => ((page as PageRow & { shared_by?: string | null }).shared_by ? `Shared by ${coven.nameOf((page as PageRow & { shared_by?: string | null }).shared_by)}` : null)}
          />
        )}
        {shownRecords.length > 0 && (
          <>
            <Text style={type.caption}>{shelf === 'minutes' ? 'Meetings kept by the coven, not yet written up here' : 'Rites kept by the coven, not yet written up here'}</Text>
            <MenuList>{recordRows(shownRecords)}</MenuList>
          </>
        )}
      </HomePartFrame>
    );
  };

  const shown = items.map(render).filter(Boolean);

  return (
    <CovenScreen
      title="Book of Shadows"
      onRefresh={async () => {
        await Promise.all([refresh(), loadExtras()]);
      }}
    >
      <Text style={type.body}>The coven’s shared grimoire, written with the same pages, templates and links as your own. Your own grimoire stays private.</Text>
      <View style={styles.actions}>
        {writeSomewhere && <Button label="New page" onPress={() => router.push(href('new-page') as Href)} style={styles.action} />}
        {!writeSomewhere && coven.standing.ok && <Button label="Suggest a page" onPress={() => router.push(href('suggest') as Href)} style={styles.action} />}
        {(waiting.length > 0 || mine.length > 0) && (
          <Button
            label={[waiting.length ? `Waiting for approval (${waiting.length})` : '', mine.length ? `Your suggestions (${mine.length})` : ''].filter(Boolean).join(' · ')}
            variant="outline"
            onPress={() => router.push(href('review') as Href)}
            style={styles.action}
          />
        )}
      </View>
      <FailedChanges />
      {message && <Notice>{message}</Notice>}
      {!snapshot && (status === 'loading' || status === 'idle') && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {!snapshot && (status === 'offline' || status === 'error') && <Notice>The coven’s book couldn’t be opened. Check your connection and pull to try again.</Notice>}

      {snapshot && (
        <View style={styles.home}>
          <Field label="Search the coven’s book" value={query} onChangeText={setQuery} placeholder="Opening prayer, Beltane, minutes…" />
          <CustomiseBar
            customising={customising}
            onToggle={() => setCustomising(!customising)}
            onReset={arrange ? () => saveLayout(resetHome(layout)) : undefined}
            note={arrange ? 'Move, hide and rename the parts of the coven’s book, for everyone.' : 'Only those who approve for the whole book arrange it. You can file and order pages where you write.'}
          />
          {customising && (
            <>
              <SortAndFilter layout={layout} pages={pages} onChange={(next) => (arrange ? saveLayout({ ...layout, ...next }) : setLocalLayout({ ...layout, ...next }))} />
              {canBook('approve') && <SmallButton label="Who can open the whole book" onPress={() => router.push(`${href('access')}?kind=book&id=${book?.id ?? ''}` as Href)} />}
              {canBook('write') && (
                <View style={styles.newSection}>
                  <View style={styles.grow}>
                    <Field label="A new section" value={newSection} onChangeText={setNewSection} placeholder="Hekate, Herbal lore, Initiation…" maxLength={120} />
                  </View>
                  <SmallButton
                    label="Add"
                    disabled={!newSection.trim()}
                    onPress={() => {
                      if (actions.createSection(newSection)) setNewSection('');
                    }}
                  />
                </View>
              )}
            </>
          )}
          {!customising && <SortNote layout={layout} onClear={() => (arrange ? saveLayout({ ...layout, sort: 'custom', kind: null }) : setLocalLayout({ ...layout, sort: 'custom', kind: null }))} />}
          {searching && !shown.length && <Text style={type.caption}>Nothing in the coven’s book matches that search.</Text>}
          {shown}
        </View>
      )}

      <SectionPicker
        page={filing}
        sections={sections.filter((s) => canSection(s, 'write')).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))}
        loose={canBook('write')}
        onClose={() => setFiling(null)}
        onChoose={(sectionId) => {
          if (filing) actions.filePage(filing.id, sectionId);
          setFiling(null);
        }}
      />
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { flexGrow: 1, flexBasis: 160 },
  loading: { marginTop: 20 },
  home: { gap: space.section },
  newSection: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  grow: { flex: 1 },
});
