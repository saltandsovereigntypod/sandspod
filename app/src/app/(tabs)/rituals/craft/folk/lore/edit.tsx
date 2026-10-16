import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, confirmAction, tell, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import { blankLore, LORE, LORE_KINDS, normalizeLore, type Lore } from '../../../../../../lib/craft/folk/lore';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../../lib/craft/store';
import { dateFromKey, localDateKey } from '../../../../../../lib/rituals/lifecycle';
import { useSession } from '../../../../../../lib/session';

export default function LoreForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useSession();
  const { entries, ready } = useCraft<unknown>(LORE);
  const existing = id ? entries.find((e) => e.id === id) ?? null : null;
  const [lore, setLore] = useState<Lore>(() => (existing ? normalizeLore(existing.data) : blankLore(new Date())));
  const [typedDate, setTypedDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) setLore(normalizeLore(existing.data));
  }, [existing?.id]);

  const set = (patch: Partial<Lore>) => setLore((l) => ({ ...l, ...patch }));
  const hint = LORE_KINDS.find((k) => k.id === lore.kind)?.hint;
  const today = localDateKey(new Date());

  const save = async () => {
    const data: Lore = { ...lore, title: lore.title.trim(), where: lore.where.trim(), lore: lore.lore.trim(), source: lore.source.trim() };
    if (!data.title && !data.lore) {
      tell('Nothing to keep yet', 'Give it a title, or write down the lore itself.');
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        await updateEntry(LORE, existing.id, data);
        router.back();
      } else {
        const entry = await addEntry(LORE, data);
        router.replace(`/rituals/craft/folk/lore/${entry.id}` as Href);
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!(await confirmAction('Delete this lore?', 'It will be removed on every device.', 'Delete'))) return;
    await removeEntry(LORE, existing.id);
    router.replace('/rituals/craft/folk/lore' as Href);
  };

  if (id && !existing) {
    return (
      <RitualScreen back="Local lore">
        <Title>Lore</Title>
        <Body>{ready ? 'This entry couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }

  return (
    <RitualScreen back={existing ? lore.title || 'Lore' : 'Local lore'}>
      <Title eyebrow={existing ? 'Edit' : 'Local lore'}>{existing ? lore.title || 'Lore' : 'Write it down'}</Title>

      <View style={ui.gapSmall}>
        <SectionLabel>What kind?</SectionLabel>
        <Chips>
          {LORE_KINDS.map((k) => (
            <Chip key={k.id} label={k.label} selected={lore.kind === k.id} onPress={() => set({ kind: k.id })} />
          ))}
        </Chips>
        {!!hint && <Body muted>{hint}</Body>}
      </View>

      <View style={ui.gap}>
        <Field label="Title" value={lore.title} onChange={(title) => set({ title })} placeholder="The Lady’s Well, the black dog of Pound Lane" />
        <Field label="Where" value={lore.where} onChange={(where) => set({ where })} placeholder="A place, parish or landmark" />
        <Field label="The lore" value={lore.lore} onChange={(v) => set({ lore: v })} placeholder="As it was told to you, in their words where you can" multiline />
        <Field label="Who told you, or where you found it" value={lore.source} onChange={(source) => set({ source })} placeholder="A neighbour, a grandparent, a parish history, a museum" />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>When you heard it</SectionLabel>
        <Chips>
          <Chip label="Today" selected={lore.heard === today} onPress={() => set({ heard: today })} />
          <Chip label="Not sure" selected={!lore.heard} onPress={() => set({ heard: '' })} />
          {!!lore.heard && lore.heard !== today && <Chip label={fullDate(lore.heard) ?? lore.heard} selected onPress={() => undefined} />}
        </Chips>
        <Field
          label="Or a date (YYYY-MM-DD)"
          value={typedDate}
          onChange={(v) => {
            setTypedDate(v);
            if (dateFromKey(v.trim())) set({ heard: v.trim() });
          }}
          placeholder="1998-08-01"
        />
      </View>

      <Notice>Some places are private land or fragile. Note access with the lore, and leave offerings that won’t harm the place: no plastic, coins in wells or ribbons that won’t rot.</Notice>
      {!session && <Body muted>Saved on this phone. Sign in to keep your lore with your account.</Body>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : existing ? 'Save changes' : 'Keep this lore'} onPress={save} disabled={saving} />
        {existing && <Button label="Delete this lore" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
