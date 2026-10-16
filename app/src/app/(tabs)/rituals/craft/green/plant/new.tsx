import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { DayPicker } from '../../../../../../lib/craft/green/DayPicker';
import { asPlant, herbName, matchHerbs, newPlant, PLANTS, type Plant } from '../../../../../../lib/craft/green/garden';
import { addEntry, updateEntry, useCraft } from '../../../../../../lib/craft/store';
import { localDateKey } from '../../../../../../lib/rituals/lifecycle';

export default function PlantForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { entries } = useCraft<unknown>(PLANTS);
  const existing = id ? entries.find((e) => e.id === id) ?? null : null;
  const plant = existing ? asPlant(existing.data) : null;

  const [name, setName] = useState('');
  const [herb, setHerb] = useState<string | null>(null);
  const [place, setPlace] = useState('');
  const [startedBy, setStartedBy] = useState<'sowed' | 'planted'>('planted');
  const [started, setStarted] = useState<string | null>(localDateKey(new Date()));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    // Only when the plant first arrives, so typing is never overwritten.
    if (!plant) return;
    setName(plant.name);
    setHerb(plant.herb ?? null);
    setPlace(plant.place);
    setNotes(plant.notes);
  }, [existing?.id]);

  const suggestions = herb ? [] : matchHerbs(name);

  const save = async () => {
    if (!name.trim()) {
      setProblem('Give the plant a name first.');
      return;
    }
    setSaving(true);
    setProblem(null);
    try {
      if (existing && plant) {
        const next: Plant = { ...plant, name: name.trim(), herb, place: place.trim(), notes: notes.trim() };
        await updateEntry(PLANTS, existing.id, next);
        router.back();
      } else {
        const entry = await addEntry(PLANTS, newPlant({ name, herb, place, started, startedBy, notes }, new Date()));
        router.replace({ pathname: '/rituals/craft/green/plant/[id]', params: { id: entry.id } } as unknown as Href);
      }
    } catch (e) {
      setProblem(`It couldn’t be saved${e instanceof Error ? ` (${e.message})` : ''}. Your words are still here.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RitualScreen back={plant ? plant.name : 'My garden'}>
      <Title eyebrow={plant ? 'Edit plant' : 'My garden'}>{plant ? 'About this plant' : 'Add a plant'}</Title>

      <View style={ui.gap}>
        <Field label="What is it?" value={name} onChange={setName} placeholder="Rosemary, the old rose, windowsill basil…" />
        {herb ? (
          <View style={ui.gapSmall}>
            <Body muted>Linked to its Living Library page</Body>
            <Chips>
              <Chip label={`${herbName(herb) ?? herb}  ✕`} a11yLabel={`Linked to ${herbName(herb) ?? herb}. Remove the link`} onPress={() => setHerb(null)} />
            </Chips>
          </View>
        ) : (
          suggestions.length > 0 && (
            <View style={ui.gapSmall}>
              <Body muted>Link it to the Living Library?</Body>
              <Chips>
                {suggestions.map((h) => (
                  <Chip key={h.key} label={h.name} a11yLabel={`Link to ${h.name}`} onPress={() => setHerb(h.key)} />
                ))}
              </Chips>
            </View>
          )
        )}
        <Field label="Where it grows" value={place} onChange={setPlace} placeholder="South bed, blue pot by the door…" />
      </View>

      {!existing && (
        <View style={ui.gap}>
          <SectionLabel>When it began</SectionLabel>
          <Chips>
            <Chip label="Sowed as seed" selected={startedBy === 'sowed'} onPress={() => setStartedBy('sowed')} />
            <Chip label="Planted" selected={startedBy === 'planted'} onPress={() => setStartedBy('planted')} />
          </Chips>
          <DayPicker label="On" value={started} onChange={setStarted} allowNone />
          <Body muted>The moon that day is recorded with it.</Body>
        </View>
      )}

      <Field label="Notes" value={notes} onChange={setNotes} placeholder="Where the seed came from, who gave you the cutting, what it’s for…" multiline />

      {!!problem && <Notice>{problem}</Notice>}
      <Button label={saving ? 'Saving…' : existing ? 'Save changes' : 'Add to my garden'} disabled={saving} onPress={save} />
    </RitualScreen>
  );
}
