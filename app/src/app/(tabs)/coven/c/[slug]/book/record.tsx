import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Pill, Words } from '../../../../../../components/covens/ui';
import { useCovenBook } from '../../../../../../components/grimoire/covenBook';
import { Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { errorMessage } from '../../../../../../lib/covens/model';
import { recordBlocks, recordText, type RitualRecord } from '../../../../../../lib/covens/script';
import { GATHERING_SHELF, gatheringPage, recordPageBlocks, type CovenSectionRow } from '../../../../../../lib/grimoire/coven';
import { colors, type } from '../../../../../../theme';

// What a gathering left behind, kept by the database when it ended: who was
// there, the steps, how many took part, its leader's notes. Those who write
// on its shelf can keep it in the Book as a page (then it can be edited,
// linked and opened to chosen people like any other).
export default function CovenBookRecord() {
  const { ritual } = useLocalSearchParams<{ ritual: string }>();
  const { coven, snapshot, canSection, href, grimoire } = useCovenBook();
  const [record, setRecord] = useState<RitualRecord | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { loadNames } = coven;

  useEffect(() => {
    if (!ritual) return;
    void api.fetchRecord(String(ritual)).then((r) => {
      setRecord(r);
      if (r) void loadNames([...r.attendees, r.led_by]);
    });
  }, [ritual, loadNames]);

  if (record === undefined) return <CovenScreen title="Record"><ActivityIndicator color={colors.gold} /></CovenScreen>;
  if (!record) return <CovenScreen title="Record"><Text style={type.body}>That record isn’t here.</Text></CovenScreen>;

  const what = record.kind === 'meeting' ? 'minutes' : 'record';
  const shelf = (snapshot?.sections as CovenSectionRow[] | undefined)?.find((s) => s.shelf === GATHERING_SHELF[what]) ?? null;
  const kept = gatheringPage(snapshot?.pages ?? [], record.ritual_id, what);
  const canKeep = !!shelf && canSection(shelf, 'write');

  const keep = async () => {
    const covenId = coven.snapshot?.coven.id;
    if (!covenId) return;
    setBusy(true);
    setMessage(null);
    try {
      const title = `${record.title} · ${new Date(record.held_at ?? record.ended_at ?? Date.now()).toLocaleDateString()}`;
      const saved = await api.saveGathering(covenId, record.ritual_id, what, title, recordPageBlocks(recordBlocks(record, coven.nameOf)));
      await grimoire.refresh();
      if (saved.page_id) router.replace(href(saved.page_id) as Href);
      else setMessage('Sent to those who approve the Book’s pages.');
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  return (
    <CovenScreen title={record.title}>
      <Pill label={record.kind === 'meeting' ? 'Meeting' : 'Ritual record'} />
      <Words text={recordText(record, coven.nameOf)} />
      <View style={styles.row}>
        {kept ? (
          <Button label="Open its page in the Book" onPress={() => router.push(href(kept.id) as Href)} />
        ) : (
          canKeep && <Button label={busy ? 'Keeping…' : 'Keep it in the Book as a page'} onPress={() => void keep()} disabled={busy} />
        )}
        <Button label={record.kind === 'meeting' ? 'Open the meeting' : 'Open the ritual'} variant="outline" onPress={() => router.push(covenHref(coven.slug, `ritual/${record.ritual_id}`))} />
      </View>
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 } });
