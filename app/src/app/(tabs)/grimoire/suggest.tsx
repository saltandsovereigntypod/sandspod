import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Card, Chips, Field, MoreScreen, Notice } from '../../../components/more/ui';
import * as api from '../../../lib/covens/api';
import { errorMessage, type Coven } from '../../../lib/covens/model';
import { useGrimoire } from '../../../lib/grimoire/store';
import { pageBlocks } from '../../../lib/grimoire/structure';
import { STATUS_LABEL, submissionBlocks, type Submission } from '../../../lib/grimoire/submissions';
import { useSession } from '../../../lib/session';
import { colors, type } from '../../../theme';

type Shelf = { id: string; title: string; shelf: string | null; sort_order: number };

// Suggesting a page of your own grimoire to a coven's Book: a copy of the
// page goes to those who approve that part of the coven's book. If they take
// it in, it credits you; your own page is never changed.
export default function SuggestToCoven() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const { snapshot } = useGrimoire();
  const page = snapshot?.pages.find((p) => p.id === pageId) ?? null;
  const blocks = useMemo(() => (snapshot && page ? submissionBlocks(pageBlocks(snapshot, page.id)) : []), [snapshot, page]);
  const [covens, setCovens] = useState<Coven[] | null>(null);
  const [covenId, setCovenId] = useState('');
  const [sections, setSections] = useState<Shelf[] | null>(null);
  const [sectionId, setSectionId] = useState('');
  const [note, setNote] = useState('');
  const [earlier, setEarlier] = useState<Submission[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    void api.fetchMyCovens(userId).then((list) => {
      setCovens(list);
      if (list.length === 1) setCovenId(list[0].id);
    }).catch(() => setCovens([]));
    void api.fetchMySubmissions(userId).then((list) => setEarlier(list.filter((s) => s.source_page_id === pageId)));
  }, [userId, pageId]);

  useEffect(() => {
    if (!covenId) return;
    void api.fetchBookSections(covenId).then((r) => setSections(r.sections)).catch((e) => {
      setSections([]);
      setMessage(errorMessage(e));
    });
  }, [covenId]);

  const send = async () => {
    if (!page || !covenId) return;
    setBusy(true);
    setMessage(null);
    try {
      const saved = await api.submitPage({ covenId, sectionId: sectionId || null, title: page.title, pageType: page.page_type, blocks, note, sourcePageId: page.id });
      setEarlier((list) => [saved, ...list]);
      setNote('');
      setMessage(saved.status === 'approved' ? 'It’s in the coven’s book now, crediting you.' : 'Sent. Those who approve for that part of the coven’s book will look at it, and you’ll hear when they do.');
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  const covenName = (id: string) => covens?.find((c) => c.id === id)?.name ?? 'a coven';

  return (
    <MoreScreen title="Suggest to a coven" eyebrow={page?.title} back={'/grimoire' as Href} backLabel="Back to the page">
      {!page ? (
        <Text style={type.body}>This page couldn’t be found.</Text>
      ) : !covens ? (
        <ActivityIndicator color={colors.gold} />
      ) : !covens.length ? (
        <Text style={type.body}>You aren’t in a coven yet. Pages can be suggested to the covens you’re in.</Text>
      ) : (
        <>
          <Text style={type.body}>A copy of this page goes to those who approve pages in the coven’s book. If they take it in, it says you shared it. Your own page stays as it is, and private.</Text>
          {blocks.length === 0 && <Notice>This page has nothing written on it yet.</Notice>}
          <Chips
            label="Which coven"
            options={covens.map((c) => ({ value: c.id, label: c.name }))}
            value={covenId}
            onChange={(id) => {
              setSections(null);
              setSectionId('');
              setCovenId(id);
            }}
          />
          {covenId && !sections && <ActivityIndicator color={colors.gold} />}
          {covenId && sections && (
            <Chips label="Where in its book" options={[{ value: '', label: 'Anywhere they choose' }, ...sections.map((s) => ({ value: s.id, label: s.title }))]} value={sectionId} onChange={setSectionId} />
          )}
          <Field label="A note for them (optional)" value={note} onChangeText={setNote} maxLength={2000} multiline placeholder="Why it might belong in the coven’s book" />
          <View style={styles.row}>
            <Button label={busy ? 'Sending…' : 'Suggest it'} onPress={() => void send()} disabled={busy || !covenId || !blocks.length} />
          </View>
        </>
      )}
      {message && <Notice>{message}</Notice>}
      {earlier.length > 0 && (
        <Card>
          <Text style={type.eyebrow}>This page’s suggestions</Text>
          {earlier.map((s) => (
            <View key={s.id} style={styles.earlier}>
              <Text style={type.body}>
                {covenName(s.coven_id)} · {STATUS_LABEL[s.status]}
              </Text>
              {!!s.reviewer_note && <Text style={type.caption}>“{s.reviewer_note}”</Text>}
            </View>
          ))}
          <Button label="See them in the coven" variant="text" onPress={() => {
            const slug = covens?.find((c) => c.id === earlier[0].coven_id)?.slug;
            if (slug) router.push(`/coven/c/${slug}/book/review` as Href);
          }} />
        </Card>
      )}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  earlier: { gap: 2 },
});
