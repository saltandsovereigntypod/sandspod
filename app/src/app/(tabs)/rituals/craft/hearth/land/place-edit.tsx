import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { HEARTH, q, useLand } from '../../../../../../components/craft/hearth';
import { Body, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, confirmAction, tell, ui } from '../../../../../../components/rituals/ui';
import { blankPlace, LAND_PLACES, PLACE_KINDS, type LandPlace } from '../../../../../../lib/craft/hearth/land';
import { setPlaceWhere, usePlaceWhere } from '../../../../../../lib/craft/hearth/landWhere';
import { addEntry, removeEntry, updateEntry, type CraftEntry } from '../../../../../../lib/craft/store';
import { dateFromKey } from '../../../../../../lib/rituals/lifecycle';
import { useSession } from '../../../../../../lib/session';

export default function PlaceEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { places, ready } = useLand();
  const existing = id ? (places.find((p) => p.id === id) ?? null) : null;
  if (id && !existing) {
    return (
      <RitualScreen back="Land journal">
        <Title>A place</Title>
        <Body>{ready ? 'This place couldn’t be found.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  return <Form key={existing?.id ?? 'new'} existing={existing} />;
}

function Form({ existing }: { existing: CraftEntry<LandPlace> | null }) {
  const { session } = useSession();
  const savedWhere = usePlaceWhere(existing?.id);
  const [place, setPlace] = useState<LandPlace>(() => existing?.data ?? blankPlace());
  const [where, setWhere] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<LandPlace>) => setPlace((p) => ({ ...p, ...patch }));
  const hint = PLACE_KINDS.find((k) => k.id === place.kind)?.hint;

  const save = async () => {
    const data: LandPlace = { ...place, name: place.name.trim(), since: dateFromKey(place.since.trim()) ? place.since.trim() : '' };
    if (!data.name) {
      tell('Name it first', 'Give the place a name you’ll know it by: “the back garden”, “Hob’s Wood”.');
      return;
    }
    setSaving(true);
    try {
      const placeId = existing ? existing.id : (await addEntry(LAND_PLACES, data)).id;
      if (existing) await updateEntry(LAND_PLACES, existing.id, data);
      if (where !== null) await setPlaceWhere(placeId, where);
      if (existing) router.back();
      else router.replace(`${HEARTH}/land/place${q({ id: placeId })}` as Href);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!(await confirmAction('Delete this place?', 'Its notes stay in your journal, without a place. It will be removed on every device.', 'Delete'))) return;
    await removeEntry(LAND_PLACES, existing.id);
    await setPlaceWhere(existing.id, '');
    router.replace(`${HEARTH}/land` as Href);
  };

  return (
    <RitualScreen back={existing ? place.name || 'A place' : 'Land journal'}>
      <Title eyebrow={existing ? 'Edit' : 'Land journal'}>{existing ? place.name || 'A place' : 'Add a place'}</Title>

      <View style={ui.gapSmall}>
        <SectionLabel>What kind of place?</SectionLabel>
        <Chips>
          {PLACE_KINDS.map((k) => (
            <Chip key={k.id} label={k.label} selected={place.kind === k.id} onPress={() => set({ kind: k.id })} />
          ))}
        </Chips>
        {!!hint && <Body muted>{hint}</Body>}
      </View>

      <View style={ui.gap}>
        <Field label="Name" value={place.name} onChange={(name) => set({ name })} placeholder="The back garden, Hob’s Wood, the north shore" />
        <Field label="What it’s like" value={place.about} onChange={(about) => set({ about })} placeholder="How you come to it, what grows, the feel of it" multiline />
        <Field label="The spirit of the place" value={place.spirit} onChange={(spirit) => set({ spirit })} placeholder="What you sense there, a name, how you greet it" multiline />
        <Field label="What you give here" value={place.offerings} onChange={(offerings) => set({ offerings })} placeholder="Water, bread, a song, picking up litter" multiline />
        <Field label="Access and care" value={place.access} onChange={(access) => set({ access })} placeholder="Whose land it is, permission, what’s fragile" multiline />
        <Field label="Known since (YYYY-MM-DD, optional)" value={place.since} onChange={(since) => set({ since })} placeholder="2019-04-01" />
        <Field
          label="Rough location (optional, kept only on this phone)"
          value={where ?? savedWhere}
          onChange={(v) => setWhere(v.slice(0, 80))}
          placeholder="Near the old mill, or 51.5, -0.1"
        />
        <Body muted>The rough location is never saved to your account or sent anywhere. A nearby landmark is plenty.</Body>
        {existing && <Toggle label="Resting" detail="You don’t go there now; it stays in your journal, last in the list." value={place.archived} onChange={(archived) => set({ archived })} />}
      </View>

      <Notice>Some places are private land, sacred to others, or fragile. Note what you know of whose they are; the card “Whose land are you on?” on the place’s page is a start.</Notice>
      {!session && <Body muted>Saved on this phone. Sign in to keep your places with your account.</Body>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : existing ? 'Save changes' : 'Add this place'} onPress={save} disabled={saving} />
        {existing && <Button label="Delete this place" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
