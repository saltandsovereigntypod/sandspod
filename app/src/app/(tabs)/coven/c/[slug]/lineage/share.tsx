import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Card, Chips, MenuList, Notice, Section, SwitchRow } from '../../../../../../components/more/ui';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { daughterLabel, KIND_LABELS, type CopyKind, type PushPreview } from '../../../../../../lib/covens/lineage';
import { fetchShareables, pushPreview, pushToDaughter, setShared } from '../../../../../../lib/covens/lineageApi';
import { errorMessage } from '../../../../../../lib/covens/model';
import { colors, type } from '../../../../../../theme';

type Shareable = { kind: CopyKind; id: string; title: string; detail?: string };
const ORDER: CopyKind[] = ['document', 'rank', 'program', 'book_section', 'book_page', 'ritual_library', 'calendar'];

// Share with your daughter covens: the head marks what daughters may copy in
// ("Shared with daughter covens"), and may push an update over a daughter's
// copy after seeing what will change.
export default function ShareWithDaughters() {
  const coven = useCoven();
  const info = coven.snapshot?.coven;
  const lineage = coven.lineage;
  const [items, setItems] = useState<Shareable[] | null>(null);
  const [preview, setPreview] = useState<{ item: Shareable; preview: PushPreview } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const covenId = info?.id;
  const daughters = useMemo(() => lineage?.daughters ?? [], [lineage]);

  const [version, setVersion] = useState(0);
  const load = useCallback(async () => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!covenId) return;
    let live = true;
    void fetchShareables(covenId).then((list) => live && setItems(list));
    return () => {
      live = false;
    };
  }, [covenId, version]);
  // What's shared, as the database last said, with this screen's changes on top.
  const [changed, setChanged] = useState<Record<string, boolean>>({});
  const shared = useMemo(() => {
    const on = new Set((lineage?.shared ?? []).map((s) => `${s.kind}:${s.item_id}`));
    for (const [key, value] of Object.entries(changed)) {
      if (value) on.add(key);
      else on.delete(key);
    }
    return on;
  }, [lineage, changed]);
  const [picked, setDaughter] = useState('');
  const daughter = picked || daughters[0]?.id || '';

  const toggle = async (item: Shareable, on: boolean) => {
    if (!covenId) return;
    const key = `${item.kind}:${item.id}`;
    setMessage(null);
    setChanged((prev) => ({ ...prev, [key]: on }));
    try {
      await setShared(covenId, item.kind, item.id, on);
      void coven.refreshLineage();
    } catch (error) {
      setMessage(errorMessage(error));
      setChanged((prev) => ({ ...prev, [key]: !on }));
    }
  };

  const showPush = async (item: Shareable) => {
    if (!daughter) return;
    setBusy(true);
    setMessage(null);
    try {
      setPreview({ item, preview: await pushPreview(daughter, item.kind, item.id) });
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };
  const push = async () => {
    if (!preview || !daughter) return;
    setBusy(true);
    try {
      await pushToDaughter(daughter, preview.item.kind, preview.item.id);
      const name = daughterLabel(daughters.find((d) => d.id === daughter)!);
      setMessage(`“${preview.item.title}” is updated in ${name}. Its head is told, and it’s in their lineage log.`);
      setPreview(null);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const groups = ORDER.map((kind) => ({ kind, list: (items ?? []).filter((i) => i.kind === kind) })).filter((g) => g.list.length);

  return (
    <CovenScreen title="Share with daughters" need="manage" onRefresh={load}>
      <Text style={type.body}>
        Mark what your daughter covens may copy in. They see it under “From your mother coven” and copy what they choose; nothing is copied by itself. Members’ own things are never shared: the records and minutes shelves and pages kept to some members don’t appear here.
      </Text>
      {daughters.length > 0 && (
        <Section label="Push an update to">
          <Chips label="Daughter coven" options={daughters.map((d) => ({ value: d.id, label: daughterLabel(d) }))} value={daughter} onChange={setDaughter} />
          <Text style={type.caption}>Pushing overwrites that coven’s copy with yours, after you see what will change.</Text>
        </Section>
      )}
      {preview && (
        <Card tone="gold">
          <Text style={type.eyebrow}>Push to {daughterLabel(daughters.find((d) => d.id === daughter) ?? { id: '', name: null, slug: null })}</Text>
          <Text style={type.cardTitle}>{preview.preview.title}</Text>
          {preview.preview.changes.map((c, i) => (
            <Text key={i} style={type.body}>
              · {c}
            </Text>
          ))}
          <Text style={type.caption}>Its head is told that you changed it.</Text>
          <View style={styles.row}>
            <Button label={busy ? 'Pushing…' : 'Push this update'} disabled={busy} onPress={() => void push()} />
            <Button label="Not now" variant="text" onPress={() => setPreview(null)} />
          </View>
        </Card>
      )}
      {!items && <ActivityIndicator color={colors.gold} />}
      {groups.map((g) => (
        <Section key={g.kind} label={KIND_LABELS[g.kind]}>
          <MenuList>
            {g.list.map((item, i) => {
              const on = shared.has(`${item.kind}:${item.id}`);
              return (
                <SwitchRow
                  key={item.id}
                  label={item.title}
                  detail={[item.detail, on ? 'Shared with daughter covens' : 'Not shared'].filter(Boolean).join(' · ')}
                  value={on}
                  onChange={(next) => void toggle(item, next)}
                  last={i === g.list.length - 1}
                  accessory={on && daughter ? <Button label="Push…" variant="text" disabled={busy} onPress={() => void showPush(item)} /> : undefined}
                />
              );
            })}
          </MenuList>
        </Section>
      ))}
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
