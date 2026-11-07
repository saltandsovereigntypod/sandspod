import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { HEARTH, q, useLand } from '../../../../../../components/craft/hearth';
import { Body, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, confirmAction, tell, ui } from '../../../../../../components/rituals/ui';
import { blankSpirit, LAND_SPIRITS, normalizeSpirit, SPIRIT_KINDS, type PlaceSpirit } from '../../../../../../lib/craft/hearth/spirits';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../../lib/craft/store';
import { dateFromKey } from '../../../../../../lib/rituals/lifecycle';
import { useSession } from '../../../../../../lib/session';

export default function SpiritEdit() {
  const { id, place } = useLocalSearchParams<{ id?: string; place?: string }>();
  const raw = useCraft<unknown>(LAND_SPIRITS);
  const existing = id ? (raw.entries.find((e) => e.id === id) ?? null) : null;
  if (id && !existing) {
    return (
      <RitualScreen back="Spirits of place">
        <Title>A spirit of place</Title>
        <Body>{raw.ready ? 'This page couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  return <Form key={existing?.id ?? 'new'} id={existing?.id ?? null} start={existing ? normalizeSpirit(existing.data) : blankSpirit(place ?? null)} />;
}

function Form({ id, start }: { id: string | null; start: PlaceSpirit }) {
  const { session } = useSession();
  const { places } = useLand();
  const [s, setS] = useState<PlaceSpirit>(start);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<PlaceSpirit>) => setS((x) => ({ ...x, ...patch }));
  const hint = SPIRIT_KINDS.find((k) => k.id === s.kind)?.hint;

  const save = async () => {
    const data: PlaceSpirit = { ...s, name: s.name.trim(), since: dateFromKey(s.since.trim()) ? s.since.trim() : '' };
    if (!data.name) return tell('Name it first', 'What you call it, or a few words: “the thorn at the gate”, “the house”.');
    setSaving(true);
    try {
      if (id) {
        await updateEntry(LAND_SPIRITS, id, data);
        router.back();
      } else {
        const e = await addEntry(LAND_SPIRITS, data);
        router.replace(`${HEARTH}/land/spirit${q({ id: e.id })}` as Href);
      }
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!id || !(await confirmAction('Delete this spirit?', 'Its visits will be deleted on every device. Notes in the land journal stay.', 'Delete'))) return;
    await removeEntry(LAND_SPIRITS, id);
    router.replace(`${HEARTH}/land/spirits` as Href);
  };

  return (
    <RitualScreen back={id ? s.name || 'A spirit of place' : 'Spirits of place'}>
      <Title eyebrow={id ? 'Edit' : 'Spirits of place'}>{id ? s.name || 'A spirit of place' : 'Add a spirit of place'}</Title>
      <View style={ui.gapSmall}>
        <SectionLabel>What kind of presence?</SectionLabel>
        <Chips label="What kind of presence?">
          {SPIRIT_KINDS.map((k) => (
            <Chip key={k.id} label={k.label} selected={s.kind === k.id} onPress={() => set({ kind: k.id })} />
          ))}
        </Chips>
        {!!hint && <Body muted>{hint}</Body>}
      </View>
      <View style={ui.gapSmall}>
        <SectionLabel>Where</SectionLabel>
        {places.length ? (
          <Chips label="Where">
            {places.map((p) => (
              <Chip key={p.id} label={p.data.name} selected={s.placeId === p.id} onPress={() => set({ placeId: s.placeId === p.id ? null : p.id })} />
            ))}
          </Chips>
        ) : (
          <Body muted>Add places in the land journal to link them.</Body>
        )}
      </View>
      <View style={ui.gap}>
        <Field label="What you call it" value={s.name} onChange={(name) => set({ name })} placeholder="The thorn at the gate, the house, the one in the well" />
        <Field label="Where in the place" value={s.spot} onChange={(spot) => set({ spot })} placeholder="The field corner, under the stairs, the spring’s lip" />
        <Field label="How it shows itself" value={s.sensed} onChange={(sensed) => set({ sensed })} placeholder="A coolness, a watchfulness, birds going quiet, a scent of earth" multiline />
        <Field label="How you greet it" value={s.greeting} onChange={(greeting) => set({ greeting })} placeholder="A nod and its name, a hand on the bark, a few words" multiline />
        <Field label="What seems welcome" value={s.likes} onChange={(likes) => set({ likes })} placeholder="Clean water, song, litter picked up" multiline />
        <Field label="What to avoid there" value={s.avoid} onChange={(avoid) => set({ avoid })} placeholder="Cutting the thorn, loud voices, taking stones" multiline />
        <Field label="Known since (YYYY-MM-DD, optional)" value={s.since} onChange={(since) => set({ since })} placeholder="2024-04-30" />
        {!!id && <Toggle label="Resting" detail="You don’t visit now; it stays here, last in the list." value={s.resting} onChange={(resting) => set({ resting })} />}
      </View>
      <Notice>Write what you notice, not what you hope. A place’s spirit is learned slowly, over seasons.</Notice>
      {!session && <Body muted>Saved on this phone. Sign in to keep it with your account.</Body>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : id ? 'Save changes' : 'Add'} onPress={save} disabled={saving} />
        {!!id && <Button label="Delete" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
