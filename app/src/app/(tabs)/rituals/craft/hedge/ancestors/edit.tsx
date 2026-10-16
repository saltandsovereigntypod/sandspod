import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Field, Notice, RitualScreen, SectionLabel, Title, confirmAction, tell, ui } from '../../../../../../components/rituals/ui';
import { ANCESTORS, blankAncestor, formatPartial, normalizeAncestor, partialDate, type Ancestor, type PartialDate } from '../../../../../../lib/craft/hedge/ancestors';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../../lib/craft/store';
import { useSession } from '../../../../../../lib/session';

type Boxes = { day: string; month: string; year: string };
const boxesOf = (d: PartialDate): Boxes => ({ day: d.day ? String(d.day) : '', month: d.month ? String(d.month) : '', year: d.year ? String(d.year) : '' });

function DateBoxes({ label, value, onChange }: { label: string; value: Boxes; onChange: (b: Boxes) => void }) {
  const read = partialDate(value.day, value.month, value.year);
  const typed = value.day || value.month || value.year;
  const shown = formatPartial(read);
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>{label}</SectionLabel>
      <View style={styles.boxes}>
        <View style={styles.box}>
          <Field label="Day" value={value.day} onChange={(day) => onChange({ ...value, day })} keyboardType="numeric" placeholder="14" />
        </View>
        <View style={styles.box}>
          <Field label="Month" value={value.month} onChange={(month) => onChange({ ...value, month })} keyboardType="numeric" placeholder="5" />
        </View>
        <View style={styles.year}>
          <Field label="Year" value={value.year} onChange={(year) => onChange({ ...value, year })} keyboardType="numeric" placeholder="1932" />
        </View>
      </View>
      {!!typed && <Body muted>{shown ? `Kept as ${shown}` : 'That date doesn’t look right; check the day and month.'}</Body>}
    </View>
  );
}

export default function AncestorForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useSession();
  const { entries, ready } = useCraft<unknown>(ANCESTORS);
  const existing = id ? entries.find((e) => e.id === id) ?? null : null;
  const start = existing ? normalizeAncestor(existing.data) : blankAncestor();
  const [person, setPerson] = useState<Ancestor>(start);
  const [born, setBorn] = useState<Boxes>(boxesOf(start.born));
  const [died, setDied] = useState<Boxes>(boxesOf(start.died));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing) return;
    const a = normalizeAncestor(existing.data);
    setPerson(a);
    setBorn(boxesOf(a.born));
    setDied(boxesOf(a.died));
  }, [existing?.id]);

  const set = (patch: Partial<Ancestor>) => setPerson((p) => ({ ...p, ...patch }));

  const save = async () => {
    const data: Ancestor = {
      ...person,
      name: person.name.trim(),
      relation: person.relation.trim(),
      loved: person.loved.trim(),
      memory: person.memory.trim(),
      born: partialDate(born.day, born.month, born.year),
      died: partialDate(died.day, died.month, died.year),
    };
    if (!data.name) {
      tell('A name first', 'Write their name, or how you think of them: “Nan”, “the grandfather I never met”.');
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        await updateEntry(ANCESTORS, existing.id, data);
        router.back();
      } else {
        const entry = await addEntry(ANCESTORS, data);
        router.replace(`/rituals/craft/hedge/ancestors/${entry.id}` as Href);
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!(await confirmAction(`Remove ${person.name || 'this person'}?`, 'Their page and memories will be removed on every device.', 'Remove'))) return;
    await removeEntry(ANCESTORS, existing.id);
    router.replace('/rituals/craft/hedge/ancestors' as Href);
  };

  if (id && !existing) {
    return (
      <RitualScreen back="Ancestors">
        <Title>Ancestor</Title>
        <Body>{ready ? 'This page couldn’t be found. It may have been removed on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }

  return (
    <RitualScreen back={existing ? person.name || 'Ancestor' : 'Ancestors'}>
      <Title eyebrow={existing ? 'Edit' : 'Remember someone'}>{existing ? person.name || 'Ancestor' : 'Who are you remembering?'}</Title>

      <View style={ui.gap}>
        <Field label="Name" value={person.name} onChange={(name) => set({ name })} placeholder="As you knew them" />
        <Field label="Who they are to you" value={person.relation} onChange={(relation) => set({ relation })} placeholder="Grandmother, great-uncle, teacher, friend" />
      </View>

      <DateBoxes label="Born" value={born} onChange={setBorn} />
      <DateBoxes label="Died" value={died} onChange={setDied} />
      <Body muted>Put in as much as you know. A year alone is fine; a day and month bring their anniversary round each year.</Body>

      <View style={ui.gap}>
        <Field label="What they loved, and what you offer them" value={person.loved} onChange={(loved) => set({ loved })} placeholder="Strong tea, roses, a song, a nip of whisky" multiline />
        <Field label="A memory" value={person.memory} onChange={(memory) => set({ memory })} placeholder="Something you want to keep" multiline />
      </View>

      {!session && <Notice>Saved on this phone. Sign in to keep them with your account.</Notice>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : existing ? 'Save changes' : 'Remember them'} onPress={save} disabled={saving} />
        {existing && <Button label="Remove this person" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  boxes: { flexDirection: 'row', gap: 10 },
  box: { flex: 1 },
  year: { flex: 1.4 },
});
