import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { useCovenBook } from '../../../../../../components/grimoire/covenBook';
import { Chips, Field, Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { errorMessage } from '../../../../../../lib/covens/model';
import { textBlocks } from '../../../../../../lib/grimoire/coven';
import { pageBlocks } from '../../../../../../lib/grimoire/structure';
import { blockMarkup, editableBlock, editedBlocks, submissionBlocks, type Submission, type SubmissionBlock } from '../../../../../../lib/grimoire/submissions';
import { type } from '../../../../../../theme';

// Suggesting something for the coven's book, for those who don't write in
// that part of it: changes to a page (?pageId), a new page (?sectionId), or
// your own suggestion again after it was sent back (?submissionId). It goes
// to those who approve that part of the book.
export default function SuggestToCovenBook() {
  const params = useLocalSearchParams<{ pageId?: string; sectionId?: string; submissionId?: string }>();
  const { coven, snapshot, canSection, href } = useCovenBook();
  const covenId = coven.snapshot?.coven.id ?? '';
  const [own, setOwn] = useState<Submission | null>(null);
  const page = snapshot?.pages.find((p) => p.id === (own?.page_id ?? params.pageId)) ?? null;
  const base: SubmissionBlock[] = useMemo(() => own?.blocks ?? (page && snapshot ? submissionBlocks(pageBlocks(snapshot, page.id)) : []), [own, page, snapshot]);
  // null until changed: the page's (or your suggestion's) own title.
  const [typed, setTitle] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [note, setNote] = useState('');
  const [sectionId, setSectionId] = useState<string>(params.sectionId ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const sections = (snapshot?.sections ?? []).filter((s) => canSection(s, 'view'));

  useEffect(() => {
    if (!params.submissionId || !covenId) return;
    void api.fetchSubmissions(covenId).then((list) => {
      const found = list.find((s) => s.id === params.submissionId) ?? null;
      setOwn(found);
      if (found) {
        setNote(found.note ?? '');
        setSectionId(found.section_id ?? '');
      }
    });
  }, [params.submissionId, covenId]);

  const changing = !!page;
  const title = typed ?? own?.title ?? page?.title ?? '';
  const fromBlocks = changing || !!own;

  const send = async (sendNow: boolean) => {
    if (!title.trim()) return setMessage('Give it a title.');
    const blocks = fromBlocks ? editedBlocks(base, edits) : textBlocks(body);
    if (!blocks.length) return setMessage('Write something for the page.');
    setBusy(true);
    setMessage(null);
    try {
      const saved = await api.submitPage({ covenId, sectionId: changing ? null : sectionId || null, pageId: page?.id ?? null, title, pageType: page?.page_type ?? own?.page_type ?? null, blocks, note, submissionId: own?.id ?? null, send: sendNow });
      if (saved.status === 'approved' && saved.published_page_id) router.replace(href(saved.published_page_id) as Href);
      else router.replace(href('review') as Href);
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  return (
    <CovenScreen title={changing ? 'Suggest changes' : 'Suggest a page'} need="standing">
      <Text style={type.body}>
        {changing ? `Your changes to “${page?.title}” go to those who approve it. The page stays as it is until they do.` : 'Your page goes to those who approve that part of the coven’s book.'}
      </Text>
      <Field label="Title" value={title} onChangeText={setTitle} maxLength={200} />
      {!changing && sections.length > 0 && (
        <Chips label="Where it goes" options={[{ value: '', label: 'No section' }, ...sections.map((s) => ({ value: s.id, label: s.title }))]} value={sectionId} onChange={setSectionId} />
      )}
      {fromBlocks ? (
        base.map((b, i) =>
          editableBlock(b) ? <Field key={i} label={b.block_type === 'heading' ? 'Heading' : 'Words'} value={edits[i] ?? blockMarkup(b)} onChangeText={(text) => setEdits((prev) => ({ ...prev, [i]: text }))} multiline /> : null,
        )
      ) : (
        <Field label="The page" value={body} onChangeText={setBody} multiline maxLength={40000} placeholder="Leave a blank line between paragraphs. A line in capitals becomes a heading." style={styles.body} />
      )}
      <Field label="A note for those who approve (optional)" value={note} onChangeText={setNote} maxLength={2000} multiline />
      <View style={styles.row}>
        <Button label={busy ? 'Sending…' : 'Send for approval'} onPress={() => void send(true)} disabled={busy || !coven.standing.ok} />
        <Button label="Keep as a draft" variant="outline" onPress={() => void send(false)} disabled={busy || !coven.standing.ok} />
      </View>
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  body: { minHeight: 220 },
});
