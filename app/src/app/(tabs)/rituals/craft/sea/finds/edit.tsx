import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, Chip, Chips, confirmAction, Field, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import {
  beaches,
  blankFind,
  COLOUR_HINTS,
  FIND_KINDS,
  FIND_USES,
  FINDS,
  isoDay,
  parseDay,
  suggestRange,
  TIDE_STATES,
  type FindKind,
  type ShoreFind,
} from '../../../../../../lib/craft/sea/finds';
import { addEntry, removeEntry, updateEntry, useCraft, type CraftEntry } from '../../../../../../lib/craft/store';
import { type } from '../../../../../../theme';

const RANGES = [
  { id: 'spring', label: 'Spring tide' },
  { id: 'neap', label: 'Neap tide' },
] as const;

export default function FindForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { entries, ready } = useCraft<ShoreFind>(FINDS);
  const existing = id ? entries.find((e) => e.id === id) ?? null : null;

  if (id && !existing) {
    return (
      <RitualScreen back="Shore finds">
        <Title eyebrow="Shore finds">{ready ? 'Not found' : 'Edit find'}</Title>
        <Body>{ready ? 'This find may have been deleted on another device.' : 'Gathering your find…'}</Body>
      </RitualScreen>
    );
  }
  // Keyed, so the form starts from the entry once it's arrived and typing is never overwritten.
  return <FindEditor key={existing?.id ?? 'new'} existing={existing} entries={entries} />;
}

function FindEditor({ existing, entries }: { existing: CraftEntry<ShoreFind> | null; entries: CraftEntry<ShoreFind>[] }) {
  const today = useMemo(() => new Date(), []);
  const [find, setFind] = useState<ShoreFind>(() => (existing ? { ...blankFind(today), ...existing.data } : blankFind(today)));
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const set = (patch: Partial<ShoreFind>) => setFind((f) => ({ ...f, ...patch }));
  const setDate = (date: string) => {
    // Re-suggest springs or neaps when the day changes and the old value was the moon's suggestion.
    setFind((f) => ({ ...f, date, range: f.range === suggestRange(f.date) ? suggestRange(date) : f.range }));
  };

  const places = useMemo(() => beaches(entries), [entries]);
  const suggested = suggestRange(find.date);
  const recentDays = Array.from({ length: 5 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - i));
  const hints = COLOUR_HINTS[find.kind] ?? [];

  const save = async () => {
    if (!parseDay(find.date)) {
      setProblem('Write the date as year-month-day, like 2026-10-16.');
      return;
    }
    setSaving(true);
    setProblem(null);
    const data: ShoreFind = {
      ...find,
      name: find.name?.trim() || undefined,
      colour: find.colour.trim(),
      where: find.where.trim(),
      purpose: find.purpose.trim(),
      notes: find.notes.trim(),
    };
    try {
      if (existing) await updateEntry(FINDS, existing.id, data);
      else await addEntry(FINDS, data);
      router.back();
    } catch {
      setProblem('Your find couldn’t be saved. It’s still here, so you can try again.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!(await confirmAction('Delete this find?', 'It will be deleted from your shore finds on every device. This can’t be undone.', 'Delete'))) return;
    await removeEntry(FINDS, existing.id);
    router.back();
  };

  return (
    <RitualScreen back="Shore finds">
      <Title eyebrow="Shore finds">{existing ? 'Edit find' : 'Log a find'}</Title>

      <View style={ui.gap}>
        <SectionLabel>What it is</SectionLabel>
        <Chips>
          {FIND_KINDS.map((k) => (
            <Chip key={k.id} label={k.label} selected={find.kind === k.id} onPress={() => set({ kind: k.id as FindKind })} />
          ))}
        </Chips>
        <Body muted>{FIND_USES[find.kind]}</Body>
        <Field label="A name of its own (optional)" value={find.name ?? ''} onChange={(name) => set({ name })} placeholder="The little cowrie" />
        <Field label="Colour" value={find.colour} onChange={(colour) => set({ colour })} placeholder={hints.slice(0, 3).join(', ') || 'Its colour'} />
        {hints.length > 0 && (
          <Chips>
            {hints.map((h) => (
              <Chip key={h} label={h} selected={find.colour === h} onPress={() => set({ colour: find.colour === h ? '' : h })} />
            ))}
          </Chips>
        )}
      </View>

      <View style={ui.gap}>
        <SectionLabel>Where and when</SectionLabel>
        <Field label="Beach or shore" value={find.where} onChange={(where) => set({ where })} placeholder="Where the tide left it" />
        {places.length > 0 && (
          <Chips>
            {places.slice(0, 8).map((p) => (
              <Chip key={p} label={p} selected={find.where === p} onPress={() => set({ where: p })} />
            ))}
          </Chips>
        )}
        <Chips>
          {recentDays.map((d, i) => {
            const key = isoDay(d);
            return (
              <Chip
                key={key}
                label={i === 0 ? 'Today' : i === 1 ? 'Yesterday' : fullDate(d)?.replace(/, \d{4}$/, '') ?? key}
                selected={find.date === key}
                onPress={() => setDate(key)}
              />
            );
          })}
        </Chips>
        <Field label="Date found (year-month-day)" value={find.date} onChange={setDate} placeholder="2026-10-16" />

        <Text style={type.eyebrow}>The tide (optional)</Text>
        <Chips>
          {TIDE_STATES.map((t) => (
            <Chip key={t.id} label={t.label} selected={find.tide === t.id} onPress={() => set({ tide: find.tide === t.id ? null : t.id })} />
          ))}
        </Chips>
        <Chips>
          {RANGES.map((r) => (
            <Chip
              key={r.id}
              label={r.label}
              selected={find.range === r.id}
              onPress={() => set({ range: find.range === r.id ? null : r.id })}
              hint={suggested === r.id ? 'Suggested from the moon on that day' : undefined}
            />
          ))}
        </Chips>
        <Body muted>
          {suggested
            ? `By the moon, ${fullDate(find.date) ?? 'that day'} fell in the ${suggested === 'spring' ? 'springs' : 'neaps'}.`
            : parseDay(find.date)
              ? 'By the moon, that day fell between springs and neaps.'
              : 'Add the date and the moon will suggest springs or neaps.'}
        </Body>
      </View>

      <View style={ui.gap}>
        <SectionLabel>What it’s for</SectionLabel>
        <Field label="What it’s for" value={find.purpose} onChange={(purpose) => set({ purpose })} placeholder="Protection by the door, a gift for the sea altar…" />
        <Field label="Notes" value={find.notes} onChange={(notes) => set({ notes })} placeholder="The weather, who you were with, how it felt in your hand" multiline />
      </View>

      <Card>
        <Body muted>Only take what’s no longer alive and what the beach allows. Leave occupied shells, and photograph anything you aren’t sure of.</Body>
      </Card>

      {!!problem && <Notice>{problem}</Notice>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : existing ? 'Save changes' : 'Save find'} disabled={saving} onPress={save} />
        {existing && <Button label="Delete this find" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
