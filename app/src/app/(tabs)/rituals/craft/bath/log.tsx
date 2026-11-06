import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { useMarkBathTended } from '../../../../../components/craft/BathParts';
import { Body, Chip, Chips, confirmAction, Field, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { BATH_HOME, BATH_LOG, BATH_OWN, FEELINGS, normalizeLog, normalizeMix, type BathLog } from '../../../../../lib/craft/bath/bath';
import { BATH_MIXES, mixById } from '../../../../../lib/craft/bath/mixes';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';
import { dayKey } from '../../../../../lib/tend/model';

// Logging a bath: which mix, how it felt, what you noticed. It lands in the one
// Journal as a "Bath" entry.
export default function BathLogScreen() {
  const params = useLocalSearchParams<{ id?: string; mix?: string }>();
  const { entries, ready } = useCraft<unknown>(BATH_LOG);
  const existing = params.id ? (entries.find((e) => e.id === params.id) ?? null) : null;
  if (params.id && !existing) {
    return (
      <RitualScreen back="Bath & body">
        <Title>A bath</Title>
        <Body>{ready ? 'This entry couldn’t be found.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  return <Form key={existing?.id ?? params.mix ?? 'new'} id={existing?.id ?? null} start={existing ? normalizeLog(existing.data) : null} mixParam={params.mix} />;
}

function Form({ id, start, mixParam }: { id: string | null; start: BathLog | null; mixParam?: string }) {
  const own = useCraft<unknown>(BATH_OWN).entries;
  const markTended = useMarkBathTended();
  const choices = [...own.map((e) => normalizeMix(e.data, e.id)).filter((m) => !!m), ...BATH_MIXES] as { id: string; title: string }[];
  const [mixId, setMixId] = useState(start?.mixId ?? mixParam ?? '');
  const [free, setFree] = useState(start && !start.mixId ? start.title : '');
  const [felt, setFelt] = useState<string[]>(start?.felt ?? []);
  const [noticed, setNoticed] = useState(start?.noticed ?? '');
  const [saving, setSaving] = useState(false);
  const title = choices.find((m) => m.id === mixId)?.title ?? (free.trim() || 'A bath');
  const toggle = (f: string) => setFelt((x) => (x.includes(f) ? x.filter((y) => y !== f) : [...x, f]));

  const save = async () => {
    setSaving(true);
    try {
      const now = new Date();
      const data: BathLog = { mixId, title, at: start?.at || now.toISOString(), date: start?.date || dayKey(now), felt, noticed: noticed.trim() };
      if (id) await updateEntry(BATH_LOG, id, data);
      else {
        await addEntry(BATH_LOG, data);
        if (mixId) await markTended(mixId, [], noticed.trim().slice(0, 200));
      }
      router.replace('/rituals/journal' as Href);
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!id || !(await confirmAction('Delete this entry?', 'It will be removed from your Journal on every device.', 'Delete'))) return;
    await removeEntry(BATH_LOG, id);
    router.replace(BATH_HOME as Href);
  };

  return (
    <RitualScreen back="Bath & body">
      <Title eyebrow="Journal">{id ? 'Your bath' : 'Log a bath'}</Title>
      <View style={ui.gapSmall}>
        <SectionLabel>Which mix</SectionLabel>
        <Chips>
          <Chip label="Something of my own" selected={!mixId} onPress={() => setMixId('')} />
          {choices.map((m) => (
            <Chip key={m.id} label={m.title} selected={mixId === m.id} onPress={() => setMixId(m.id)} />
          ))}
        </Chips>
        {!mixId && <Field label="What you called it" value={free} onChange={setFree} placeholder="A salt soak after the funeral" />}
        {!!mixId && !!mixById(mixId) && <Button label="Read the mix" variant="text" onPress={() => router.push(`${BATH_HOME}/mix?id=${encodeURIComponent(mixId)}` as Href)} />}
      </View>
      <View style={ui.gapSmall}>
        <SectionLabel>How it felt</SectionLabel>
        <Chips>
          {FEELINGS.map((f) => (
            <Chip key={f} label={f} selected={felt.includes(f)} onPress={() => toggle(f)} />
          ))}
        </Chips>
      </View>
      <Field label="What you noticed" value={noticed} onChange={setNoticed} multiline placeholder="The scent, a thought that came, a dream afterwards, what you let go of" />
      <Body muted>It is kept in your Journal as a Bath, beside your rituals, dreams and readings. If the mix has a rhythm in To tend, it is marked done.</Body>
      <Button label={id ? 'Save changes' : 'Keep it in my Journal'} onPress={() => void save()} disabled={saving} />
      {!!id && <Button label="Delete this entry" variant="text" onPress={() => void remove()} />}
    </RitualScreen>
  );
}
