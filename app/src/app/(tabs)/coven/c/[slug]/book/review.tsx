import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { BlockView, ink } from '../../../../../../components/grimoire/BlockView';
import { useCovenBook } from '../../../../../../components/grimoire/covenBook';
import { Card, Chips, Field, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { errorMessage, relativeTime } from '../../../../../../lib/covens/model';
import { confirmAction } from '../../../../../../lib/grimoire/confirm';
import { versionBlockRows } from '../../../../../../lib/grimoire/history';
import { blockMarkup, canEditSubmission, editableBlock, editedBlocks, STATUS_LABEL, submissionLine, type ReviewDecision, type Submission } from '../../../../../../lib/grimoire/submissions';
import { colors, fonts, type } from '../../../../../../theme';

// Suggestions for the coven's book: those waiting for you to approve (new
// pages, pages shared from someone's own grimoire, changes to pages), which
// you can edit before approving, send back with a note, or decline; and
// your own, with where each stands.
export default function CovenBookReview() {
  const { coven, snapshot, sectionOf, canPage, canSection, href, grimoire } = useCovenBook();
  const [list, setList] = useState<Submission[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const covenId = coven.snapshot?.coven.id;
  const { loadNames } = coven;

  const load = useCallback(async () => {
    if (!covenId) return;
    const next = await api.fetchSubmissions(covenId);
    setList(next);
    void loadNames(next.flatMap((s) => [s.submitted_by, s.reviewer_id]));
  }, [covenId, loadNames]);

  // Fresh each time the screen comes back into view.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const approves = (s: Submission) => (s.page_id ? canPage(snapshot?.pages.find((p) => p.id === s.page_id) ?? null, 'approve') : canSection(sectionOf(s.section_id), 'approve'));
  const waiting = (list ?? []).filter((s) => s.status === 'pending' && s.submitted_by !== coven.userId && approves(s));
  const mine = (list ?? []).filter((s) => s.submitted_by === coven.userId);

  return (
    <CovenScreen title="Suggestions" onRefresh={load}>
      {message && <Notice>{message}</Notice>}
      {!list && <ActivityIndicator color={colors.gold} />}
      {list && (
        <>
          <Section label="Waiting for your approval">
            {waiting.length ? (
              waiting.map((s) => (
                <ReviewCard
                  key={s.id}
                  submission={s}
                  onDone={async (text) => {
                    setMessage(text);
                    await Promise.all([load(), grimoire.refresh()]);
                  }}
                />
              ))
            ) : (
              <Text style={type.caption}>Nothing is waiting for you.</Text>
            )}
          </Section>
          <Section label="Your suggestions">
            {mine.length ? (
              mine.map((s) => (
                <Card key={s.id}>
                  <Text style={type.cardTitle}>{s.title}</Text>
                  <Text style={type.caption}>
                    {STATUS_LABEL[s.status]} · {relativeTime(s.submitted_at ?? s.updated_at)}
                    {s.section_id && sectionOf(s.section_id) ? ` · for ${sectionOf(s.section_id)!.title}` : ''}
                  </Text>
                  {!!s.reviewer_note && (
                    <Text style={type.body}>
                      {coven.nameOf(s.reviewer_id)} said: {s.reviewer_note}
                    </Text>
                  )}
                  <View style={styles.row}>
                    {s.status === 'approved' && s.published_page_id && <Button label="Open the page" variant="outline" onPress={() => router.push(href(s.published_page_id!) as Href)} />}
                    {canEditSubmission(s, coven.userId) && <Button label="Change and send again" variant="outline" onPress={() => router.push(`${href('suggest')}?submissionId=${s.id}` as Href)} />}
                    {s.status !== 'approved' && (
                      <Button
                        label="Take it back"
                        variant="text"
                        onPress={async () => {
                          if (!(await confirmAction('Take this suggestion back?', 'It’s removed, and no one is asked to approve it.', 'Take it back'))) return;
                          try {
                            await api.removeSubmission(s.id);
                            await load();
                          } catch (e) {
                            setMessage(errorMessage(e));
                          }
                        }}
                      />
                    )}
                  </View>
                </Card>
              ))
            ) : (
              <Text style={type.caption}>You haven’t suggested anything. Any page of your own grimoire can be suggested to the coven from its page.</Text>
            )}
          </Section>
        </>
      )}
    </CovenScreen>
  );
}

function ReviewCard({ submission: s, onDone }: { submission: Submission; onDone: (message: string) => Promise<void> }) {
  const { coven, snapshot, sectionOf, canSection } = useCovenBook();
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(s.title);
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [sectionId, setSectionId] = useState<string>(s.section_id ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = s.page_id ? (snapshot?.pages.find((p) => p.id === s.page_id) ?? null) : null;
  const sections = (snapshot?.sections ?? []).filter((x) => canSection(x, 'approve'));
  const blocks = editing ? editedBlocks(s.blocks, edits) : s.blocks;

  const decide = async (decision: ReviewDecision) => {
    if (decision === 'return' && !note.trim()) return setError('Say what to change, so they know.');
    setBusy(true);
    setError(null);
    // Approving can carry the approver's own title, place and words.
    const changes = decision !== 'approve' ? {} : { ...(editing ? { title, blocks } : {}), ...(!s.page_id && sectionId !== (s.section_id ?? '') ? { sectionId: sectionId || null } : {}) };
    try {
      await api.reviewSubmission(s.id, decision, note, changes);
      await onDone(decision === 'approve' ? 'It’s in the book, crediting whoever shared it.' : decision === 'return' ? 'Sent back with your note.' : 'Declined.');
    } catch (e) {
      setError(errorMessage(e));
    }
    setBusy(false);
  };

  return (
    <Card>
      <Text style={type.eyebrow}>{submissionLine(s, coven.nameOf, current ? `“${current.title}”` : sectionOf(s.section_id)?.title)}</Text>
      {editing ? <Field label="Title" value={title} onChangeText={setTitle} maxLength={200} /> : <Text style={type.cardTitle}>{s.title}</Text>}
      {!!s.note && <Text style={type.body}>Their note: {s.note}</Text>}
      {!s.page_id && sections.length > 0 && (
        <Chips label="Where it goes" options={[...(canSection(null, 'approve') ? [{ value: '', label: 'No section' }] : []), ...sections.map((x) => ({ value: x.id, label: x.title }))]} value={sectionId} onChange={setSectionId} />
      )}
      {editing ? (
        s.blocks.map((b, i) =>
          editableBlock(b) ? <Field key={i} label={b.block_type === 'heading' ? 'Heading' : 'Words'} value={edits[i] ?? blockMarkup(b)} onChangeText={(text) => setEdits((prev) => ({ ...prev, [i]: text }))} multiline /> : null,
        )
      ) : (
        <View style={styles.paper}>
          {versionBlockRows({ page_id: s.id, blocks }).map((block) => (
            <BlockView key={block.id} block={block} pages={snapshot?.pages ?? []} />
          ))}
        </View>
      )}
      <Field label="Note to them (optional when approving)" value={note} onChangeText={setNote} maxLength={2000} multiline />
      <View style={styles.row}>
        <Button label={busy ? 'Approving…' : editing ? 'Approve as edited' : 'Approve'} onPress={() => void decide('approve')} disabled={busy} />
        <Button label={editing ? 'Stop editing' : 'Edit first'} variant="outline" onPress={() => setEditing(!editing)} disabled={busy} />
        <Button label="Send back" variant="outline" onPress={() => void decide('return')} disabled={busy} />
        <Button label="Decline" variant="text" onPress={() => void decide('decline')} disabled={busy} />
      </View>
      {error && <Notice>{error}</Notice>}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  paper: { backgroundColor: ink.paper, borderRadius: 16, padding: 14, gap: 10 },
  title: { fontFamily: fonts.displayBold, fontSize: 22, color: ink.text },
});
