import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { CheckRow, Field, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage, RANK_POWERS, type Rank } from '../../../../../../lib/covens/model';
import { type } from '../../../../../../theme';

type Flag = 'is_default' | 'open_to_applications' | (typeof RANK_POWERS)[number]['key'];

export default function ManagePosition() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const coven = useCoven();
  const rank = coven.snapshot?.ranks.find((r) => r.id === id) ?? null;
  const ready = !!coven.snapshot && (id === 'new' || !!rank);
  return (
    <CovenScreen title={rank ? rank.name : 'Add a position'} need="manage">
      {ready ? <PositionForm key={rank?.id ?? 'new'} rank={rank} /> : <Text style={type.caption}>This position couldn’t be found.</Text>}
    </CovenScreen>
  );
}

function PositionForm({ rank }: { rank: Rank | null }) {
  const coven = useCoven();
  const [name, setName] = useState(rank?.name ?? '');
  const [level, setLevel] = useState(String(rank?.level ?? 1));
  const [description, setDescription] = useState(rank?.description ?? '');
  const [requirements, setRequirements] = useState(rank?.requirements ?? '');
  const [flags, setFlags] = useState<Record<Flag, boolean>>(() => {
    const out = { is_default: !!rank?.is_default, open_to_applications: !!rank?.open_to_applications } as Record<Flag, boolean>;
    // Starting altars and chat are on for a position unless the head turns them off.
    for (const p of RANK_POWERS) out[p.key] = rank?.[p.key] ?? (p.key === 'can_start_altars' || p.key === 'can_chat');
    return out;
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const flag = (key: Flag) => ({ value: flags[key], onChange: (v: boolean) => setFlags((prev) => ({ ...prev, [key]: v })) });

  const save = async () => {
    const n = Number(level);
    if (!name.trim()) return setMessage('Give the position a name.');
    if (!Number.isInteger(n) || n < 1 || n > 99) return setMessage('Seniority is a number from 1 to 99.');
    setBusy(true);
    setMessage(null);
    try {
      await api.saveRank({ ...(rank ? { id: rank.id } : {}), coven_id: coven.snapshot!.coven.id, name: name.trim(), level: n, description: description.trim() || null, requirements: requirements.trim() || null, ...flags });
      await coven.refresh();
      if (router.canGoBack()) router.back();
      else setMessage('Saved.');
    } catch (error) {
      setMessage(errorMessage(error));
      setBusy(false);
    }
  };

  const remove = () =>
    Alert.alert('Delete this position?', 'Anyone who holds it becomes a member without a position until you give them another.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteRank(rank!.id);
            await coven.refresh();
            if (router.canGoBack()) router.back();
          } catch (error) {
            setMessage(errorMessage(error));
          }
        },
      },
    ]);

  return (
    <>
      <Field label="Name" value={name} onChangeText={setName} maxLength={60} />
      <Field label="Seniority (1 is newest; higher is more senior)" value={level} onChangeText={(text) => setLevel(text.replace(/[^0-9]/g, ''))} keyboardType="number-pad" maxLength={2} />
      <Field label="What this position is" value={description} onChangeText={setDescription} multiline maxLength={1000} />
      <Field label="What it asks of someone (shown to those who apply for it)" value={requirements} onChangeText={setRequirements} multiline maxLength={2000} />
      <CheckRow label="New members begin here" {...flag('is_default')} />
      <CheckRow label="Members can apply to rise to it" {...flag('open_to_applications')} />
      <Section label="Powers">
        {RANK_POWERS.map((p) => (
          <CheckRow key={p.key} label={p.label} {...flag(p.key)} />
        ))}
      </Section>
      <View style={styles.row}>
        <Button label={busy ? 'Saving…' : rank ? 'Save' : 'Add'} onPress={save} disabled={busy} />
        {rank && <Button label="Delete" variant="text" onPress={remove} />}
      </View>
      {message && <Notice>{message}</Notice>}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
