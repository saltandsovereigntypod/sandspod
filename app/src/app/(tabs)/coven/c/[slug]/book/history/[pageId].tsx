import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../../components/Button';
import { CovenScreen } from '../../../../../../../components/covens/CovenScreen';
import { BlockView, ink } from '../../../../../../../components/grimoire/BlockView';
import { useCovenBook } from '../../../../../../../components/grimoire/covenBook';
import { MenuList, MenuRow, Notice } from '../../../../../../../components/more/ui';
import * as api from '../../../../../../../lib/covens/api';
import { errorMessage, relativeTime } from '../../../../../../../lib/covens/model';
import { confirmAction } from '../../../../../../../lib/grimoire/confirm';
import { historyRows, versionBlockRows, type PageVersion } from '../../../../../../../lib/grimoire/history';
import { colors, fonts, type } from '../../../../../../../theme';

// A page's history: a version for each save, who and when, newest first.
// Those who write in the page can look at any version and put it back (the
// page as it is now stays in the history too).
export default function CovenBookHistory() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const { coven, snapshot, canPage, grimoire } = useCovenBook();
  const page = snapshot?.pages.find((p) => p.id === pageId) ?? null;
  const [versions, setVersions] = useState<PageVersion[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { loadNames } = coven;

  const load = useCallback(async () => {
    if (!pageId) return;
    try {
      const list = await api.fetchVersions(String(pageId));
      setVersions(list);
      void loadNames(list.map((v) => v.saved_by));
    } catch (e) {
      setMessage(errorMessage(e));
      setVersions([]);
    }
  }, [pageId, loadNames]);

  // Fresh each time the screen comes back into view.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const restore = async (v: PageVersion) => {
    const ok = await confirmAction('Put this version back?', 'The page becomes this version. The page as it is now stays in its history.', 'Put it back');
    if (!ok) return;
    setBusy(true);
    setMessage(null);
    try {
      await api.restoreVersion(v.id);
      await Promise.all([grimoire.refresh(), load()]);
      setOpen(null);
      setMessage('The page is back as it was.');
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  const rows = historyRows(versions ?? []);
  const shown = rows.find((r) => r.version.id === open)?.version ?? null;

  return (
    <CovenScreen title="History" onRefresh={load}>
      {page && <Text style={type.cardTitle}>{page.title}</Text>}
      {!page || !canPage(page, 'write') ? (
        <Text style={type.body}>Only those who write in this page see its history.</Text>
      ) : versions === null ? (
        <ActivityIndicator color={colors.gold} />
      ) : shown ? (
        <>
          <Text style={type.caption}>
            {coven.nameOf(shown.saved_by)} · {new Date(shown.saved_at).toLocaleString()}
          </Text>
          <View style={styles.paper}>
            <Text style={styles.title}>{shown.title}</Text>
            {versionBlockRows(shown).map((block) => (
              <BlockView key={block.id} block={block} pages={snapshot?.pages ?? []} />
            ))}
          </View>
          <View style={styles.row}>
            {shown.id !== rows[0]?.version.id && <Button label={busy ? 'Putting it back…' : 'Put this version back'} onPress={() => void restore(shown)} disabled={busy} />}
            <Button label="Back to the history" variant="text" onPress={() => setOpen(null)} />
          </View>
        </>
      ) : rows.length ? (
        <MenuList>
          {rows.map(({ version, line }, i) => (
            <MenuRow key={version.id} label={`${coven.nameOf(version.saved_by)} · ${relativeTime(version.saved_at)}`} detail={i === 0 ? `${line} · as it is now` : line} last={i === rows.length - 1} onPress={() => setOpen(version.id)} />
          ))}
        </MenuList>
      ) : (
        <Text style={type.caption}>No versions are kept yet. One is kept each time the page is saved.</Text>
      )}
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  paper: { backgroundColor: ink.paper, borderRadius: 20, padding: 18, gap: 12 },
  title: { fontFamily: fonts.displayBold, fontSize: 26, color: ink.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
