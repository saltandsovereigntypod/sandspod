import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { SpreadDiagram } from '../../../../../../components/divination/Spread';
import { Body, Card, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, confirmAction, ui } from '../../../../../../components/rituals/ui';
import { addEntry, removeEntry, updateEntry, useCraft, type CraftEntry } from '../../../../../../lib/craft/store';
import {
  blankCustomSpread,
  customSpread,
  customSpreadId,
  MAX_PLACES,
  normalizeCustomSpread,
  placeWord,
  SPREADS_COLLECTION,
  tidyCustomSpread,
  type CustomSpreadData,
} from '../../../../../../lib/divination/custom';
import { KINDS, type DrawKind } from '../../../../../../lib/divination/draw';
import { SHAPES } from '../../../../../../lib/divination/layout';
import { useSession } from '../../../../../../lib/session';

// Make a spread of your own: its name, what to draw, a shape, and a name for
// each place. Kept in `hedge.spreads`, so it's in the spread list here and on
// the website.
export default function SpreadForm() {
  const { id, kind } = useLocalSearchParams<{ id?: string; kind?: string }>();
  const { entries, ready } = useCraft<unknown>(SPREADS_COLLECTION);
  const existing = id ? entries.find((e) => e.id === id) ?? null : null;
  if (id && !existing) {
    return (
      <RitualScreen back="Draw">
        <Title>Your spread</Title>
        <Body>{ready ? 'This spread couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const startKind = (KINDS.find((k) => k.id === kind)?.id ?? 'tarot') as DrawKind;
  return <Form key={existing?.id ?? 'new'} existing={existing} startKind={startKind} />;
}

const backToDraw = (spread: string) => router.dismissTo({ pathname: '/rituals/craft/hedge/readings/draw', params: { spread } });

function Form({ existing, startKind }: { existing: CraftEntry<unknown> | null; startKind: DrawKind }) {
  const { session } = useSession();
  const [data, setData] = useState<CustomSpreadData>(() => (existing ? normalizeCustomSpread(existing.data) : blankCustomSpread(startKind)));
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<CustomSpreadData>) => setData((d) => ({ ...d, ...patch }));
  const setPlace = (i: number, patch: Partial<CustomSpreadData['positions'][number]>) => set({ positions: data.positions.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  const word = placeWord(data.kind);
  const preview = customSpread({ id: 'preview', data });

  const save = async () => {
    const tidy = tidyCustomSpread(data);
    setSaving(true);
    try {
      if (existing) {
        await updateEntry(SPREADS_COLLECTION, existing.id, tidy);
        backToDraw(customSpreadId(existing.id));
      } else {
        const entry = await addEntry(SPREADS_COLLECTION, tidy);
        backToDraw(customSpreadId(entry.id));
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!(await confirmAction('Delete this spread?', 'It will be removed on every device. Readings you drew with it are kept.', 'Delete'))) return;
    await removeEntry(SPREADS_COLLECTION, existing.id);
    router.dismissTo('/rituals/craft/hedge/readings/draw' as Href);
  };

  return (
    <RitualScreen back="Draw">
      <Title eyebrow={existing ? 'Change your spread' : 'Make your own spread'}>{data.name.trim() || 'Your spread'}</Title>

      <Field label="Its name" value={data.name} onChange={(v) => set({ name: v })} placeholder="Crossroads, Monday morning, The garden…" />
      <Field label="What it’s for (if you like)" value={data.detail} onChange={(v) => set({ detail: v })} placeholder="One line on when you’d use it" />

      <View style={ui.gapSmall}>
        <SectionLabel>What to draw</SectionLabel>
        <Chips>
          {KINDS.map((k) => (
            <Chip key={k.id} label={k.label} selected={data.kind === k.id} onPress={() => set({ kind: k.id })} />
          ))}
        </Chips>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Its shape</SectionLabel>
        <Chips>
          {SHAPES.map((s) => (
            <Chip key={s.id} label={s.label} selected={data.shape === s.id} onPress={() => set({ shape: s.id })} />
          ))}
        </Chips>
        <Card>
          <View style={{ alignItems: 'center', paddingVertical: 6 }}>
            <SpreadDiagram spread={preview} size={180} numbers />
          </View>
          <Body muted>The numbers are the order they’re laid down in, and match the places below.</Body>
        </Card>
      </View>

      <View style={ui.gap}>
        <SectionLabel>{`The places (${data.positions.length})`}</SectionLabel>
        {data.positions.map((p, i) => (
          <Card key={i}>
            <Field label={`${i + 1}. What this place means`} value={p.name} onChange={(v) => setPlace(i, { name: v })} placeholder={`${word} ${i + 1}`} />
            <Field label="A line on how to read it (if you like)" value={p.about} onChange={(v) => setPlace(i, { about: v })} placeholder="What it asks, or shows" />
            {data.positions.length > 1 && (
              <Button label="Take this place out" variant="text" onPress={() => set({ positions: data.positions.filter((_, j) => j !== i) })} />
            )}
          </Card>
        ))}
        {data.positions.length < MAX_PLACES ? (
          <Button label="Add a place" variant="outline" onPress={() => set({ positions: [...data.positions, { name: '', about: '' }] })} />
        ) : (
          <Body muted>{`${MAX_PLACES} places is the most a spread can hold here.`}</Body>
        )}
      </View>

      {!session && <Notice>Saved on this phone. Sign in to keep your spreads with your account, and on the website.</Notice>}
      <View style={ui.actions}>
        <Button label={saving ? 'Keeping it…' : 'Keep this spread'} onPress={save} disabled={saving} />
        {existing && <Button label="Delete this spread" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
