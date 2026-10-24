import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { Pill, Words, useReport } from '../../../../../components/covens/ui';
import { Card, Field, MenuList, MenuRow, Notice, Section } from '../../../../../components/more/ui';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { bookSections, errorMessage, relativeTime, type BookDraft, type BookPage } from '../../../../../lib/covens/model';
import { colors, type } from '../../../../../theme';

type Editing = { draftId: string | null; pageId: string | null; title: string; section: string; body: string };

const DRAFT_STATUS: Record<BookDraft['status'], string> = { draft: 'Draft', pending: 'Waiting for approval', declined: 'Sent back', published: 'Published' };

// The coven's Book of Shadows. Everyone in the coven reads it; those the
// leader allows write pages (new ones or changes to old ones), and pages go
// into the book once someone allowed to approve them says yes.
export default function CovenBook() {
  const coven = useCoven();
  const report = useReport(coven.userId);
  const covenId = coven.snapshot?.coven.id;
  const [pages, setPages] = useState<BookPage[] | null>(null);
  const [drafts, setDrafts] = useState<BookDraft[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { loadNames } = coven;
  const canWrite = coven.perms.writeBook && coven.standing.ok;
  const canApprove = (coven.perms.approveBook && coven.standing.ok) || coven.perms.site;

  const load = useCallback(async () => {
    if (!covenId) return;
    try {
      const [nextPages, nextDrafts] = await Promise.all([api.fetchBookPages(covenId), api.fetchBookDrafts(covenId).catch(() => [] as BookDraft[])]);
      setPages(nextPages);
      setDrafts(nextDrafts);
      void loadNames([...nextPages.map((p) => p.author_id), ...nextDrafts.map((d) => d.author_id)]);
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [covenId, loadNames]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (submit: boolean) => {
    if (!editing || !covenId) return;
    if (!editing.title.trim() || !editing.body.trim()) return setMessage('Give the page a title and some words.');
    setBusy(true);
    setMessage(null);
    try {
      await api.saveBookDraft(covenId, editing.draftId, editing.pageId, editing, submit);
      setEditing(null);
      setMessage(submit ? (canApprove ? 'Sent. You can approve it below.' : 'Sent for approval.') : 'Draft saved.');
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const review = async (draft: BookDraft, approve: boolean) => {
    setBusy(true);
    setMessage(null);
    try {
      await api.reviewBookDraft(draft.id, approve, notes[draft.id] ?? '');
      setMessage(approve ? 'The page is in the book.' : 'Sent back to its writer.');
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const mine = drafts.filter((d) => d.author_id === coven.userId && d.status !== 'published');
  const waiting = canApprove ? drafts.filter((d) => d.status === 'pending') : [];
  const page = pages?.find((p) => p.id === open) ?? null;

  if (editing) {
    return (
      <CovenScreen title={editing.pageId ? 'Change a page' : 'Write a page'} need="standing">
        <Field label="Title" value={editing.title} onChangeText={(title) => setEditing({ ...editing, title })} maxLength={140} />
        <Field label="Section (optional)" value={editing.section} onChangeText={(section) => setEditing({ ...editing, section })} maxLength={80} placeholder="Rites, Correspondences, Lore…" />
        <Field label="The page" value={editing.body} onChangeText={(body) => setEditing({ ...editing, body })} multiline maxLength={40000} style={styles.body} />
        <Text style={type.caption}>Pages go into the book once someone who approves pages says yes.</Text>
        <View style={styles.row}>
          <Button label={busy ? 'Sending…' : 'Send for approval'} onPress={() => void save(true)} disabled={busy} />
          <Button label="Save as a draft" variant="outline" onPress={() => void save(false)} disabled={busy} />
          <Button label="Cancel" variant="text" onPress={() => setEditing(null)} />
        </View>
        {message && <Notice>{message}</Notice>}
      </CovenScreen>
    );
  }

  if (page) {
    return (
      <CovenScreen title={page.title} onRefresh={load}>
        {!!page.section && <Pill label={page.section} />}
        <Words text={page.body} />
        <Text style={type.caption}>
          Written by {coven.nameOf(page.author_id)} · version {page.version} · {relativeTime(page.published_at)}
        </Text>
        <View style={styles.row}>
          {canWrite && <Button label="Suggest a change" variant="outline" onPress={() => setEditing({ draftId: null, pageId: page.id, title: page.title, section: page.section ?? '', body: page.body })} />}
          <Button label="Back to the book" variant="text" onPress={() => setOpen(null)} />
          {page.author_id && page.author_id !== coven.userId && (
            <Button label="Report" variant="text" onPress={() => report.open({ target_type: 'book_page', target_id: page.id, coven_id: page.coven_id, target_user_id: page.author_id, label: 'this page' })} />
          )}
        </View>
        {report.sheet}
      </CovenScreen>
    );
  }

  return (
    <CovenScreen title="Book of Shadows" onRefresh={load}>
      {canWrite && <Button label="Write a page" onPress={() => setEditing({ draftId: null, pageId: null, title: '', section: '', body: '' })} />}
      {message && <Notice>{message}</Notice>}
      {!pages && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {pages && !pages.length && <Text style={type.caption}>The coven’s book has no pages yet.</Text>}
      {pages &&
        bookSections(pages).map(({ section, pages: list }) => (
          <Section key={section} label={section}>
            <MenuList>
              {list.map((p, i) => (
                <MenuRow key={p.id} label={p.title} detail={`By ${coven.nameOf(p.author_id)}`} last={i === list.length - 1} onPress={() => setOpen(p.id)} />
              ))}
            </MenuList>
          </Section>
        ))}

      {waiting.length > 0 && (
        <Section label="Waiting for approval">
          {waiting.map((d) => (
            <Card key={d.id}>
              <Text style={type.cardTitle}>{d.title}</Text>
              <Text style={type.caption}>
                {d.page_id ? 'A change' : 'A new page'} by {coven.nameOf(d.author_id)}
                {d.section ? ` · ${d.section}` : ''}
              </Text>
              <Words text={d.body} />
              <Field label="Note to the writer (optional)" value={notes[d.id] ?? ''} onChangeText={(text) => setNotes((prev) => ({ ...prev, [d.id]: text }))} maxLength={1000} />
              <View style={styles.row}>
                <Button label="Approve" onPress={() => void review(d, true)} disabled={busy} />
                <Button label="Send back" variant="outline" onPress={() => void review(d, false)} disabled={busy} />
              </View>
            </Card>
          ))}
        </Section>
      )}

      {mine.length > 0 && (
        <Section label="Your drafts">
          <MenuList>
            {mine.map((d, i) => (
              <MenuRow
                key={d.id}
                label={d.title}
                detail={`${DRAFT_STATUS[d.status]}${d.reviewer_note ? ` · “${d.reviewer_note}”` : ''}`}
                last={i === mine.length - 1}
                onPress={canWrite ? () => setEditing({ draftId: d.id, pageId: d.page_id, title: d.title, section: d.section ?? '', body: d.body }) : undefined}
              />
            ))}
          </MenuList>
        </Section>
      )}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  body: { minHeight: 220 },
});
