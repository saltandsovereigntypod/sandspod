import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, Chip, Chips, confirmAction, Expander, Field, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import {
  blankCorrespondence,
  COLOURS,
  CORRESPONDENCES,
  DAYS,
  ELEMENTS,
  entryById,
  PICK_TYPES,
  pickableEntries,
  PLANETS,
  searchPickable,
  SOURCES,
  traditionalSide,
  type MyCorrespondence,
} from '../../../../../../lib/craft/eclectic/correspondences';
import { addEntry, removeEntry, updateEntry, useCraft, type CraftEntry } from '../../../../../../lib/craft/store';
import { ritualsLibraryHref, typeSingular } from '../../../../../../lib/library';
import { type } from '../../../../../../theme';

/** A free field with quick picks underneath. */
function Picked({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <View style={ui.gapSmall}>
      <Field label={label} value={value} onChange={onChange} placeholder={placeholder} />
      <Chips>
        {options.map((o) => (
          <Chip key={o} label={o} selected={value === o} onPress={() => onChange(value === o ? '' : o)} a11yLabel={`${label}: ${o}`} />
        ))}
      </Chips>
    </View>
  );
}

export default function CorrespondenceForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { entries, ready } = useCraft<MyCorrespondence>(CORRESPONDENCES);
  const existing = id ? entries.find((e) => e.id === id) ?? null : null;

  if (id && !existing) {
    return (
      <RitualScreen back="My correspondences">
        <Title eyebrow="My correspondences">{ready ? 'Not found' : 'Edit'}</Title>
        <Body>{ready ? 'This entry may have been deleted on another device.' : 'Gathering your entry…'}</Body>
      </RitualScreen>
    );
  }
  // Keyed, so the form starts from the entry once it's arrived and typing is never overwritten.
  return <CorrespondenceEditor key={existing?.id ?? 'new'} existing={existing} />;
}

function CorrespondenceEditor({ existing }: { existing: CraftEntry<MyCorrespondence> | null }) {
  const [c, setC] = useState<MyCorrespondence>(() => (existing ? { ...blankCorrespondence(), ...existing.data } : blankCorrespondence()));
  const [shelf, setShelf] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const all = useMemo(() => pickableEntries(), []);
  const library = useMemo(() => entryById(c.ref, all), [c.ref, all]);
  const results = useMemo(() => (search.trim() || shelf ? searchPickable(all, search, shelf, 12) : []), [all, search, shelf]);
  const set = (patch: Partial<MyCorrespondence>) => setC((x) => ({ ...x, ...patch }));

  const pick = (ref: string) => {
    const entry = entryById(ref, all);
    if (!entry) return;
    // Take the Library's name unless you've already named it yourself.
    setC((x) => ({ ...x, ref, name: !x.name.trim() || x.name === library?.name ? entry.name : x.name }));
    setSearch('');
    setShelf(null);
  };

  const save = async () => {
    if (!c.name.trim()) {
      setProblem('Name the thing first, or pick it from the Library.');
      return;
    }
    setSaving(true);
    setProblem(null);
    const data: MyCorrespondence = {
      ...c,
      name: c.name.trim(),
      meaning: c.meaning.trim(),
      element: c.element.trim(),
      planet: c.planet.trim(),
      day: c.day.trim(),
      colour: c.colour.trim(),
      sourceNote: c.sourceNote.trim(),
    };
    try {
      if (existing) {
        await updateEntry(CORRESPONDENCES, existing.id, data);
        router.back();
      } else {
        const made = await addEntry(CORRESPONDENCES, data);
        router.replace({ pathname: '/rituals/craft/eclectic/correspondences/[id]', params: { id: made.id } });
      }
    } catch {
      setProblem('This couldn’t be saved. Your words are still here, so you can try again.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!(await confirmAction(`Delete ${existing.data.name || 'this entry'}?`, 'It will be deleted from your correspondences on every device. This can’t be undone.', 'Delete'))) return;
    await removeEntry(CORRESPONDENCES, existing.id);
    router.dismissTo('/rituals/craft/eclectic/correspondences');
  };

  const theirs = library ? traditionalSide(library) : [];

  return (
    <RitualScreen back={existing ? existing.data.name || 'My correspondences' : 'My correspondences'}>
      <Title eyebrow="My correspondences">{existing ? 'Edit' : 'A new correspondence'}</Title>

      <View style={ui.gap}>
        <SectionLabel>The thing</SectionLabel>
        <Field label="Name" value={c.name} onChange={(name) => set({ name })} placeholder="Rosemary, a robin’s feather, the colour teal…" />
        {library ? (
          <Card>
            <Text style={type.eyebrow}>From the Library · {typeSingular(library.type)}</Text>
            <Text style={type.cardTitle}>{library.name}</Text>
            {theirs.length > 0 && <Body muted>Traditionally: {theirs.filter((p) => p.label !== 'Meaning').map((p) => `${p.label.toLowerCase()} ${p.value}`).join('; ')}.</Body>}
            {theirs.find((p) => p.label === 'Meaning') && <Body muted>{theirs.find((p) => p.label === 'Meaning')!.value}</Body>}
            <View style={ui.actions}>
              <Button label="Open in the Library" variant="outline" onPress={() => router.push(ritualsLibraryHref(library))} />
              <Button label="Unlink from the Library" variant="text" onPress={() => set({ ref: null })} />
            </View>
          </Card>
        ) : (
          <Expander title="Pick it from the Library" initiallyOpen={!existing}>
            <Body muted>Link a herb, crystal, candle, deity or tool to see its traditional correspondences beside yours.</Body>
            <Chips>
              {PICK_TYPES.map((t) => (
                <Chip key={t.id} label={t.label} selected={shelf === t.id} onPress={() => setShelf(shelf === t.id ? null : t.id)} />
              ))}
            </Chips>
            <Field label="Search the Library" value={search} onChange={setSearch} placeholder="Basil, amethyst, Brigid…" />
            {results.length > 0 ? (
              <List>
                {results.map((e, i, list) => (
                  <Row
                    key={e.id}
                    icon="grimoire"
                    title={e.name}
                    detail={[typeSingular(e.type), traditionalSide(e).filter((p) => p.label === 'Element' || p.label === 'Planet' || p.label === 'Pantheon').map((p) => p.value).join(' · ')].filter(Boolean).join(' · ')}
                    last={i === list.length - 1}
                    onPress={() => pick(e.id)}
                  />
                ))}
              </List>
            ) : (
              (search.trim() || shelf) && <Body muted>Nothing in the Library by that name. Keep your own name for it; that’s just as good.</Body>
            )}
          </Expander>
        )}
      </View>

      <View style={ui.gap}>
        <SectionLabel>What it means to you</SectionLabel>
        <Field
          label="Meaning"
          value={c.meaning}
          onChange={(meaning) => set({ meaning })}
          placeholder="What it does in your work, what it calls up, when you reach for it"
          multiline
        />
      </View>

      <Expander title="Element, planet, day and colour" initiallyOpen={!!(c.element || c.planet || c.day || c.colour)}>
        <Body muted>All optional, and all yours: write your own or tap a suggestion.</Body>
        <Picked label="Element" value={c.element} onChange={(element) => set({ element })} options={ELEMENTS} />
        <Picked label="Planet" value={c.planet} onChange={(planet) => set({ planet })} options={PLANETS} />
        <Picked label="Day" value={c.day} onChange={(day) => set({ day })} options={DAYS} />
        <Picked label="Colour" value={c.colour} onChange={(colour) => set({ colour })} options={COLOURS} />
      </Expander>

      <View style={ui.gap}>
        <SectionLabel>Where it came from</SectionLabel>
        <Chips>
          {SOURCES.map((s) => (
            <Chip key={s.id} label={s.label} selected={c.source === s.id} onPress={() => set({ source: c.source === s.id ? null : s.id })} />
          ))}
        </Chips>
        <Field
          label={c.source === 'tradition' ? 'Which tradition?' : c.source === 'teacher' ? 'Which teacher or book?' : c.source === 'experience' ? 'What happened?' : 'A note on its source'}
          value={c.sourceNote}
          onChange={(sourceNote) => set({ sourceNote })}
          placeholder="Optional"
        />
      </View>

      {!!problem && <Notice>{problem}</Notice>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : existing ? 'Save changes' : 'Save'} disabled={saving} onPress={save} />
        {existing && <Button label="Delete" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
