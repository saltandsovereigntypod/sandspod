import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { DayLine, HEARTH, HerbPicker, q, useLand, usePotted } from '../../../../../../components/craft/hearth';
import { Body, Chip, Chips, Field, RitualScreen, SectionLabel, Title, confirmAction, tell, ui } from '../../../../../../components/rituals/ui';
import { DayPicker } from '../../../../../../lib/craft/green/DayPicker';
import { asPlant, isGrowing, PLANTS } from '../../../../../../lib/craft/green/garden';
import { blankNote, FROST_MARKS, LAND_NOTES, NOTE_KINDS, noteHasContent, WATER_LEVELS, type LandNote } from '../../../../../../lib/craft/hearth/land';
import { addEntry, removeEntry, updateEntry, useCraft, type CraftEntry } from '../../../../../../lib/craft/store';
import { useSession } from '../../../../../../lib/session';

export default function NoteEdit() {
  const params = useLocalSearchParams<{ id?: string; place?: string; herb?: string }>();
  const { notes, ready } = useLand();
  const existing = params.id ? (notes.find((n) => n.id === params.id) ?? null) : null;
  if (params.id && !existing) {
    return (
      <RitualScreen back="Land journal">
        <Title>A note</Title>
        <Body>{ready ? 'This note couldn’t be found.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  return <Form key={existing?.id ?? 'new'} existing={existing} place={params.place ?? null} herb={params.herb ?? null} />;
}

function Form({ existing, place, herb }: { existing: CraftEntry<LandNote> | null; place: string | null; herb: string | null }) {
  const { session } = useSession();
  const { places } = useLand();
  const potted = usePotted();
  const garden = useCraft<unknown>(PLANTS).entries.map((e) => ({ id: e.id, plant: asPlant(e.data) })).filter((g) => isGrowing(g.plant));
  const [note, setNote] = useState<LandNote>(() => existing?.data ?? { ...blankNote(new Date(), place), herbs: herb ? [herb] : [] });
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<LandNote>) => setNote((n) => ({ ...n, ...patch }));
  const toggle = <T,>(list: T[], item: T, same: (a: T, b: T) => boolean = (a, b) => a === b) => (list.some((x) => same(x, item)) ? list.filter((x) => !same(x, item)) : [...list, item]);
  const showWater = note.kinds.includes('water') || ['water', 'shore'].includes(places.find((p) => p.id === note.placeId)?.data.kind ?? '');

  const save = async () => {
    const data: LandNote = { ...note, text: note.text.trim(), weather: note.weather.trim(), offering: note.offering.trim() };
    if (!noteHasContent(data)) {
      tell('Nothing to keep yet', 'Write what you noticed, or choose what kind of note it is.');
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        await updateEntry(LAND_NOTES, existing.id, data);
        router.back();
      } else {
        const entry = await addEntry(LAND_NOTES, data);
        router.replace(`${HEARTH}/land/note${q({ id: entry.id })}` as Href);
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!(await confirmAction('Delete this note?', 'It will be removed on every device.', 'Delete'))) return;
    await removeEntry(LAND_NOTES, existing.id);
    router.replace(`${HEARTH}/land` as Href);
  };

  return (
    <RitualScreen back="Land journal">
      <Title eyebrow={existing ? 'Edit' : 'Land journal'}>{existing ? 'Edit this note' : 'What do you see?'}</Title>

      <DayPicker label="The day" value={note.on} onChange={(on) => on && set({ on })} />
      <DayLine on={note.on} />

      <View style={ui.gapSmall}>
        <SectionLabel>Where</SectionLabel>
        <Chips>
          <Chip label="Out and about" selected={!note.placeId} onPress={() => set({ placeId: null })} />
          {places
            .filter((p) => !p.data.archived || p.id === note.placeId)
            .map((p) => (
              <Chip key={p.id} label={p.data.name} selected={note.placeId === p.id} onPress={() => set({ placeId: p.id })} />
            ))}
        </Chips>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>What kind of note?</SectionLabel>
        <Chips>
          {NOTE_KINDS.map((k) => (
            <Chip key={k.id} label={k.label} selected={note.kinds.includes(k.id)} hint={k.hint} onPress={() => set({ kinds: toggle(note.kinds, k.id) })} />
          ))}
        </Chips>
      </View>

      <View style={ui.gap}>
        <Field label="What you noticed" value={note.text} onChange={(text) => set({ text })} placeholder="The first blackbird singing at dawn; sloes thick on the blackthorn" multiline />
        <Field label="The weather" value={note.weather} onChange={(weather) => set({ weather })} placeholder="Still and cold, a hard white frost" />
      </View>

      {(note.kinds.includes('frost') || !!note.frost) && (
        <View style={ui.gapSmall}>
          <SectionLabel>Mark a frost</SectionLabel>
          <Chips>
            <Chip label="Just a frost" selected={!note.frost} onPress={() => set({ frost: null })} />
            {FROST_MARKS.map((f) => (
              <Chip key={f.id} label={f.label} selected={note.frost === f.id} onPress={() => set({ frost: f.id, kinds: note.kinds.includes('frost') ? note.kinds : [...note.kinds, 'frost'] })} />
            ))}
          </Chips>
          <Body muted>Marked frosts make your own frost dates, year by year: the gardener’s safe-to-sow day, from your own ground.</Body>
        </View>
      )}

      {showWater && (
        <View style={ui.gapSmall}>
          <SectionLabel>The water</SectionLabel>
          <Chips>
            {WATER_LEVELS.map((w) => (
              <Chip key={w.id} label={w.label} selected={note.water === w.id} onPress={() => set({ water: note.water === w.id ? null : w.id })} />
            ))}
          </Chips>
        </View>
      )}

      <HerbPicker label="Herbs and trees from the Living Library" value={note.herbs} onChange={(herbs) => set({ herbs })} />

      {garden.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>From My garden</SectionLabel>
          <Chips>
            {garden.map((g) => (
              <Chip key={g.id} label={g.plant.name} selected={note.plants.includes(g.id)} onPress={() => set({ plants: toggle(note.plants, g.id) })} />
            ))}
          </Chips>
        </View>
      )}

      {potted.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Potted plants on your altars</SectionLabel>
          <Chips>
            {potted.map((p) => (
              <Chip key={p.id} label={p.name} selected={note.potted.some((x) => x.id === p.id)} onPress={() => set({ potted: toggle(note.potted, p, (a, b) => a.id === b.id) })} />
            ))}
          </Chips>
        </View>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>An offering</SectionLabel>
        <Field label="What you gave, and to whom" value={note.offering} onChange={(offering) => set({ offering })} placeholder="Milk at the old thorn, for the good neighbours" />
        <Body muted>Give what won’t harm the place: no plastic, nothing that won’t rot.</Body>
      </View>

      {!session && <Body muted>Saved on this phone. Sign in to keep your land journal with your account.</Body>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : existing ? 'Save changes' : 'Keep this note'} onPress={save} disabled={saving} />
        {existing && <Button label="Delete this note" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
