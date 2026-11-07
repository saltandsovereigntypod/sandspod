import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { HEARTH, q } from '../../../../../../components/craft/hearth';
import { Body, Chip, Chips, Field, RitualScreen, SectionLabel, Title, confirmAction, tell, ui } from '../../../../../../components/rituals/ui';
import { ANIMALS, blankFamiliar, careSuggestions, FAMILIAR_KINDS, FAMILIARS, normalizeFamiliar, WORK_KINDS, type Familiar } from '../../../../../../lib/craft/hearth/familiars';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../../lib/craft/store';
import { dateFromKey } from '../../../../../../lib/rituals/lifecycle';
import { useSession } from '../../../../../../lib/session';

export default function FamiliarEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const raw = useCraft<unknown>(FAMILIARS);
  const existing = id ? (raw.entries.find((e) => e.id === id) ?? null) : null;
  if (id && !existing) {
    return (
      <RitualScreen back="Familiars">
        <Title>A familiar</Title>
        <Body>{raw.ready ? 'This page couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  return <Form key={existing?.id ?? 'new'} id={existing?.id ?? null} start={existing ? normalizeFamiliar(existing.data) : blankFamiliar()} />;
}

const okDate = (s: string) => (dateFromKey(s.trim()) ? s.trim() : '');

function Form({ id, start }: { id: string | null; start: Familiar }) {
  const { session } = useSession();
  const [f, setF] = useState<Familiar>(start);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<Familiar>) => setF((x) => ({ ...x, ...patch }));
  const setCare = (i: number, patch: Partial<Familiar['care'][number]>) => set({ care: f.care.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const suggestions = careSuggestions(f.animal).filter((s) => !f.care.some((c) => c.what === s.what));

  const save = async () => {
    const data = normalizeFamiliar({ ...f, born: okDate(f.born), came: okDate(f.came), died: okDate(f.died) });
    if (!f.name.trim()) return tell('A name first', 'Their name, or what you call them.');
    setSaving(true);
    try {
      if (id) {
        await updateEntry(FAMILIARS, id, data);
        router.back();
      } else {
        const e = await addEntry(FAMILIARS, data);
        router.replace(`${HEARTH}/familiars/familiar${q({ id: e.id })}` as Href);
      }
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!id || !(await confirmAction(`Delete ${f.name || 'this familiar'}?`, 'Their page and notes will be deleted on every device. To keep them in memory instead, choose Remembered.', 'Delete'))) return;
    await removeEntry(FAMILIARS, id);
    router.replace(`${HEARTH}/familiars` as Href);
  };

  return (
    <RitualScreen back={id ? f.name || 'A familiar' : 'Familiars'}>
      <Title eyebrow={id ? 'Edit' : 'Familiars'}>{id ? f.name || 'A familiar' : 'Add a familiar'}</Title>
      <Chips>
        {FAMILIAR_KINDS.map((k) => (
          <Chip key={k.id} label={k.label} hint={k.hint} selected={f.kind === k.id} onPress={() => set({ kind: k.id })} />
        ))}
      </Chips>
      <View style={ui.gap}>
        <Field label="Name" value={f.name} onChange={(name) => set({ name })} placeholder="What you call them" />
        {f.kind !== 'spirit' && (
          <View style={ui.gapSmall}>
            <SectionLabel>Animal</SectionLabel>
            <Chips label="Animal">
              {ANIMALS.map((a) => (
                <Chip key={a.id} label={a.label} selected={f.animal === a.id} onPress={() => set({ animal: a.id })} />
              ))}
            </Chips>
          </View>
        )}
        <Field label={f.kind === 'spirit' ? 'Their form' : 'Breed or kind'} value={f.form} onChange={(form) => set({ form })} placeholder={f.kind === 'spirit' ? 'A grey hare, a raven, a shape of light' : 'Tabby, collie cross, African grey'} />
        {f.kind !== 'spirit' && <Field label="Born (YYYY-MM-DD, optional)" value={f.born} onChange={(born) => set({ born })} placeholder="2019-05-01" />}
        <Field label={f.kind === 'spirit' ? 'First met (YYYY-MM-DD)' : 'Came to you (YYYY-MM-DD)'} value={f.came} onChange={(came) => set({ came })} placeholder="2020-09-12" />
        {f.kind === 'remembered' && <Field label="Died (YYYY-MM-DD)" value={f.died} onChange={(died) => set({ died })} placeholder="2025-02-03" />}
        <Field label="About them" value={f.about} onChange={(about) => set({ about })} multiline placeholder="Their ways, what they love, how they came to you" />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>The work they join</SectionLabel>
        <Chips multiple label="The work they join">
          {WORK_KINDS.map((w) => (
            <Chip key={w.id} label={w.label} selected={f.work.includes(w.id)} onPress={() => set({ work: f.work.includes(w.id) ? f.work.filter((x) => x !== w.id) : [...f.work, w.id] })} />
          ))}
        </Chips>
      </View>

      {f.kind === 'living' && (
        <>
          <View style={ui.gapSmall}>
            <SectionLabel>Care days</SectionLabel>
            {f.care.map((c, i) => (
              <View key={i} style={ui.gapSmall}>
                <Field label="What" value={c.what} onChange={(what) => setCare(i, { what })} />
                <Field label="Every how many days" value={String(c.every)} onChange={(v) => setCare(i, { every: Number(v.replace(/\D/g, '')) || 1 })} keyboardType="numeric" />
                <Button label="Remove" variant="text" onPress={() => set({ care: f.care.filter((_, j) => j !== i) })} />
              </View>
            ))}
            {suggestions.length > 0 && (
              <Chips>
                {suggestions.map((s) => (
                  <Chip key={s.what} label={`+ ${s.what}`} onPress={() => set({ care: [...f.care, { ...s, last: '' }] })} />
                ))}
              </Chips>
            )}
            <Button label="Add a care day of your own" variant="outline" onPress={() => set({ care: [...f.care, { what: 'Care', every: 7, last: '' }] })} />
          </View>
          <Field label="Herbs, oils, incense and stones used around them" value={f.around} onChange={(around) => set({ around })} multiline placeholder={'Lavender oil\nFrankincense\nRosemary'} />
          <Body muted>One to a line. Their page checks these against the blending lab’s pet-safety notes.</Body>
        </>
      )}

      {f.kind === 'remembered' && (
        <View style={ui.gap}>
          <SectionLabel>Their memorial</SectionLabel>
          <Field label="Words for them" value={f.memorial.words} onChange={(words) => set({ memorial: { ...f.memorial, words } })} multiline placeholder="What they were to you" />
          <Field label="Where they rest" value={f.memorial.resting} onChange={(resting) => set({ memorial: { ...f.memorial, resting } })} placeholder="Under the apple tree, their ashes on the shelf" />
          <Field label="What you keep of them" value={f.memorial.keepsake} onChange={(keepsake) => set({ memorial: { ...f.memorial, keepsake } })} placeholder="Their collar, a whisker in a locket, a paw print" />
        </View>
      )}

      {!session && <Body muted>Saved on this phone. Sign in to keep them with your account.</Body>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : id ? 'Save changes' : 'Add'} onPress={save} disabled={saving} />
        {!!id && <Button label="Delete" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
