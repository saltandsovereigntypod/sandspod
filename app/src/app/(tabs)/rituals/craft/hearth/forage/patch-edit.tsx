import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { go, HEARTH, HerbPicker, q, useLand } from '../../../../../../components/craft/hearth';
import { Body, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, confirmAction, tell, ui } from '../../../../../../components/rituals/ui';
import { herbName } from '../../../../../../lib/craft/green/garden';
import { blankPatch, FORAGE_PLANTS, forageByKey, LAND_GROWING, matchForage, normalizePatch, PATCH_KINDS, type Patch } from '../../../../../../lib/craft/hearth/forage';
import { addEntry, removeEntry, updateEntry, useCraft, type CraftEntry } from '../../../../../../lib/craft/store';

export default function PatchEdit() {
  const params = useLocalSearchParams<{ id?: string; place?: string; forage?: string }>();
  const { entries, ready } = useCraft<unknown>(LAND_GROWING);
  const existing = params.id ? (entries.find((e) => e.id === params.id) ?? null) : null;
  if (params.id && !existing) {
    return (
      <RitualScreen back="Foraging & garden">
        <Title>What grows where</Title>
        <Body>{ready ? 'This couldn’t be found.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const start = (): Patch => {
    const f = forageByKey(params.forage);
    return { ...blankPatch(params.place ?? null), ...(f ? { name: f.name, forage: f.key, herb: f.library } : {}) };
  };
  return <Form key={existing?.id ?? 'new'} existing={existing} start={start} />;
}

function Form({ existing, start }: { existing: CraftEntry<unknown> | null; start: () => Patch }) {
  const { places } = useLand();
  const [patch, setPatch] = useState<Patch>(() => (existing ? normalizePatch(existing.data) : start()));
  const [saving, setSaving] = useState(false);
  const set = (p: Partial<Patch>) => setPatch((x) => ({ ...x, ...p }));
  const forage = forageByKey(patch.forage);

  const save = async () => {
    const name = patch.name.trim() || (patch.herb ? (herbName(patch.herb) ?? '') : '');
    if (!name) {
      tell('Name it first', 'What grows there? Choose a wild plant below, or type its name.');
      return;
    }
    const data: Patch = { ...patch, name, forage: patch.forage ?? matchForage(name, patch.herb)?.key ?? null };
    setSaving(true);
    try {
      if (existing) await updateEntry(LAND_GROWING, existing.id, data);
      else await addEntry(LAND_GROWING, data);
      router.back();
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!existing || !(await confirmAction('Delete this?', 'It will be removed on every device.', 'Delete'))) return;
    await removeEntry(LAND_GROWING, existing.id);
    router.back();
  };

  return (
    <RitualScreen back="Foraging & garden">
      <Title eyebrow="What grows where">{existing ? patch.name : 'Something that grows'}</Title>
      <View style={ui.gapSmall}>
        <SectionLabel>A wild plant from the foraging notes</SectionLabel>
        <Chips>
          {FORAGE_PLANTS.map((f) => (
            <Chip key={f.key} label={f.name} selected={patch.forage === f.key} onPress={() => set(patch.forage === f.key ? { forage: null } : { forage: f.key, name: patch.name || f.name, herb: f.library ?? patch.herb })} />
          ))}
        </Chips>
      </View>
      <Field label="What it is" value={patch.name} onChange={(name) => set({ name })} placeholder="Elder by the gate, mint by the back door" />
      <HerbPicker label="Its Living Library entry (optional)" value={patch.herb ? [patch.herb] : []} onChange={(keys) => set({ herb: keys[keys.length - 1] ?? null })} single />
      <View style={ui.gapSmall}>
        <SectionLabel>Where</SectionLabel>
        <Chips>
          {places.map((p) => (
            <Chip key={p.id} label={p.data.name} selected={patch.placeId === p.id} onPress={() => set({ placeId: patch.placeId === p.id ? null : p.id })} />
          ))}
        </Chips>
        {!places.length && <Body muted>Add your places in the land journal to file what grows by place.</Body>}
        <Field label="Exactly where" value={patch.spot} onChange={(spot) => set({ spot })} placeholder="North edge, by the stile" />
      </View>
      <Chips>
        {PATCH_KINDS.map((k) => (
          <Chip key={k.id} label={k.label} selected={patch.kind === k.id} onPress={() => set({ kind: k.id })} />
        ))}
      </Chips>
      <Field label="Notes" value={patch.note} onChange={(note) => set({ note })} placeholder="Heavy with fruit most years; the owner is happy for us to pick" multiline />
      {forage && (
        <List>
          <Row icon="wheel" title={`Foraging notes: ${forage.name}`} detail="When, look-alikes and care" last onPress={go(`${HEARTH}/forage/plant${q({ key: forage.key })}`)} />
        </List>
      )}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : existing ? 'Save changes' : 'Keep it'} onPress={save} disabled={saving} />
        {existing && <Button label="Log a harvest from it" variant="outline" onPress={go(`${HEARTH}/forage/harvest-edit${q({ patch: existing.id })}`)} />}
        {existing && <Button label="Delete" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
