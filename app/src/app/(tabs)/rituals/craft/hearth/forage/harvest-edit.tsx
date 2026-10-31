import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { DayLine, ForageFirst, go, HEARTH, HerbPicker, q, useLand } from '../../../../../../components/craft/hearth';
import { Body, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, Toggle, confirmAction, tell, ui } from '../../../../../../components/rituals/ui';
import { DayPicker } from '../../../../../../lib/craft/green/DayPicker';
import { herbName } from '../../../../../../lib/craft/green/garden';
import { blankHarvest, forageByKey, HARVEST_USES, LAND_GROWING, LAND_HARVESTS, matchForage, normalizeHarvest, normalizePatch, type Harvest } from '../../../../../../lib/craft/hearth/forage';
import { addEntry, removeEntry, updateEntry, useCraft, type CraftEntry } from '../../../../../../lib/craft/store';
import { localDateKey } from '../../../../../../lib/rituals/lifecycle';

export default function HarvestEdit() {
  const params = useLocalSearchParams<{ id?: string; forage?: string; patch?: string; herb?: string }>();
  const { entries, ready } = useCraft<unknown>(LAND_HARVESTS);
  const patches = useCraft<unknown>(LAND_GROWING).entries;
  const existing = params.id ? (entries.find((e) => e.id === params.id) ?? null) : null;
  if (params.id && !existing) {
    return (
      <RitualScreen back="Harvests">
        <Title>A harvest</Title>
        <Body>{ready ? 'This harvest couldn’t be found.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const start = (): Harvest => {
    const patchEntry = patches.find((p) => p.id === params.patch);
    const patch = patchEntry ? normalizePatch(patchEntry.data) : null;
    const f = forageByKey(params.forage ?? patch?.forage);
    const herb = params.herb ?? patch?.herb ?? f?.library ?? null;
    return blankHarvest(new Date(), {
      name: patch?.name ?? f?.name ?? (herb ? (herbName(herb) ?? '') : ''),
      herb,
      forage: f?.key ?? null,
      placeId: patch?.placeId ?? null,
      patchId: patchEntry?.id ?? null,
      part: f?.parts ?? '',
    });
  };
  return <Form key={existing?.id ?? 'new'} existing={existing} start={start} />;
}

function Form({ existing, start }: { existing: CraftEntry<unknown> | null; start: () => Harvest }) {
  const { places } = useLand();
  const [h, setH] = useState<Harvest>(() => (existing ? normalizeHarvest(existing.data) : start()));
  const [saving, setSaving] = useState(false);
  const set = (p: Partial<Harvest>) => setH((x) => ({ ...x, ...p }));
  const forage = forageByKey(h.forage) ?? matchForage(h.name, h.herb);

  const save = async () => {
    const name = h.name.trim();
    if (!name) {
      tell('Name it first', 'What did you gather?');
      return;
    }
    const data: Harvest = { ...h, name, forage: h.forage ?? forage?.key ?? null, storedOn: h.kept && !h.storedOn ? localDateKey(new Date()) : h.storedOn };
    setSaving(true);
    try {
      if (existing) await updateEntry(LAND_HARVESTS, existing.id, data);
      else await addEntry(LAND_HARVESTS, data);
      router.back();
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!existing || !(await confirmAction('Delete this harvest?', 'It will be removed on every device.', 'Delete'))) return;
    await removeEntry(LAND_HARVESTS, existing.id);
    router.back();
  };

  return (
    <RitualScreen back="Harvests">
      <Title eyebrow="Harvests">{existing ? h.name : 'Log a harvest'}</Title>
      {!existing && forage && <ForageFirst />}
      <DayPicker label="Gathered on" value={h.on} onChange={(on) => on && set({ on })} />
      <DayLine on={h.on} />
      <Field label="What you gathered" value={h.name} onChange={(name) => set({ name })} placeholder="Elderflowers, rose hips, rosemary from the pot" />
      <HerbPicker label="Its Living Library entry (optional)" value={h.herb ? [h.herb] : []} onChange={(keys) => set({ herb: keys[keys.length - 1] ?? null })} single />
      <Field label="The part" value={h.part} onChange={(part) => set({ part })} placeholder="Flowers, berries, leaves" />
      <Field label="How much" value={h.amount} onChange={(amount) => set({ amount })} placeholder="A basket, 40 g, three bundles" />
      <View style={ui.gapSmall}>
        <SectionLabel>Where from</SectionLabel>
        <Chips>
          <Chip label="Not one of my places" selected={!h.placeId} onPress={() => set({ placeId: null })} />
          {places.map((p) => (
            <Chip key={p.id} label={p.data.name} selected={h.placeId === p.id} onPress={() => set({ placeId: p.id })} />
          ))}
        </Chips>
      </View>
      <View style={ui.gapSmall}>
        <SectionLabel>For</SectionLabel>
        <Chips>
          {HARVEST_USES.map((u) => (
            <Chip key={u.id} label={u.label} selected={h.use === u.id} onPress={() => set({ use: u.id, kept: u.id === 'drying' || u.id === 'apothecary' ? true : h.kept })} />
          ))}
        </Chips>
      </View>
      <Toggle label="Still in the store cupboard" detail="Dried, jarred or kept to use later" value={h.kept} onChange={(kept) => set({ kept })} />
      <Field label="Notes" value={h.note} onChange={(note) => set({ note })} placeholder="Dried on the rack for a week; smelled of honey" multiline />
      {forage && (
        <List>
          <Row icon="wheel" title={`Foraging notes: ${forage.name}`} detail="Look-alikes and safety" last onPress={go(`${HEARTH}/forage/plant${q({ key: forage.key })}`)} />
        </List>
      )}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : existing ? 'Save changes' : 'Keep this harvest'} onPress={save} disabled={saving} />
        {existing && <Button label="Delete" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
