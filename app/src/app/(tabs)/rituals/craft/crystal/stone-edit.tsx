import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { careByKey, careBadges, findCare, STONE_CARE } from '../../../../../lib/craft/crystal/care';
import { STONES } from '../../../../../lib/craft/crystal/collections';
import { isDateKey, normaliseStone, STONE_FORMS, type Stone, type StoneForm } from '../../../../../lib/craft/crystal/stones';
import { addEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';

const tidy = (s: string) => s.toLowerCase().replace(/[’'`]/g, '').trim();
const POPULAR = ['amethyst', 'clear_quartz', 'rose_quartz', 'black_tourmaline', 'citrine', 'selenite', 'carnelian', 'moonstone', 'labradorite', 'smoky_quartz', 'obsidian', 'tiger_eye'];

// Add or edit a stone: pick it from the Library's crystals or name your own.
export default function StoneEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { entries, ready } = useCraft<Stone>(STONES);
  const existing = id ? entries.find((e) => e.id === id) ?? null : null;

  const [name, setName] = useState('');
  const [key, setKey] = useState<string | null>(null);
  const [form, setForm] = useState<StoneForm>('tumbled');
  const [source, setSource] = useState('');
  const [acquired, setAcquired] = useState('');
  const [notes, setNotes] = useState('');
  const [intentions, setIntentions] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const filled = useRef(false);

  useEffect(() => {
    // Only when the stone first arrives, so typing is never overwritten.
    if (!ready || filled.current || !existing) return;
    filled.current = true;
    const s = normaliseStone(existing.data);
    setName(s.name);
    setKey(s.key ?? null);
    setForm(s.form);
    setSource(s.source ?? '');
    setAcquired(s.acquired ?? '');
    setNotes(s.notes ?? '');
    setIntentions(s.intentions.join('\n'));
  }, [ready, existing]);

  const picked = careByKey(key);
  const matches = useMemo(() => {
    const q = tidy(name);
    if (!q) return POPULAR.map((k) => careByKey(k)!).filter(Boolean);
    return STONE_CARE.filter((c) => [c.name, ...(c.aliases ?? [])].some((n) => tidy(n).includes(q))).slice(0, 12);
  }, [name]);
  const guessed = !picked ? findCare(null, name) : null;
  const care = picked ?? guessed;

  const typeName = (text: string) => {
    setName(text);
    // A typed name that no longer matches the picked stone unpicks it.
    if (picked && tidy(text) !== tidy(picked.name)) setKey(null);
  };

  const save = async () => {
    setProblem(null);
    if (!name.trim()) return setProblem('Name your stone first.');
    if (acquired.trim() && !isDateKey(acquired.trim())) return setProblem('Enter the date as year-month-day, for example 2025-10-31, or leave it blank.');
    const before = existing ? normaliseStone(existing.data) : null;
    const data: Stone = {
      key: key ?? guessed?.key ?? null,
      name: name.trim(),
      form,
      source: source.trim(),
      acquired: acquired.trim(),
      notes: notes.trim(),
      intentions: intentions
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean),
      care: before?.care ?? [],
    };
    setSaving(true);
    try {
      if (existing) {
        await updateEntry(STONES, existing.id, data);
        router.back();
      } else {
        const entry = await addEntry(STONES, data);
        router.replace({ pathname: '/rituals/craft/crystal/stone', params: { id: entry.id } } as Href);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <RitualScreen back={existing ? 'Stone' : 'My stones'}>
      <Title eyebrow="My stones">{existing ? 'Edit stone' : 'Add a stone'}</Title>

      <Card>
        <SectionLabel>Which stone</SectionLabel>
        <Field label="Name" value={name} onChange={typeName} placeholder="Search the Library, or type your own" />
        <Chips>
          {matches.map((c) => (
            <Chip
              key={c.key}
              label={c.name}
              selected={key === c.key}
              onPress={() => {
                setKey(c.key);
                setName(c.name);
              }}
              a11yLabel={`${c.name}${c.library ? ', in the Library' : ''}`}
            />
          ))}
        </Chips>
        {care ? (
          <View style={ui.gapSmall}>
            <Body muted>{`${picked ? '' : 'Looks like '}${care.name}: ${careBadges(care).join(' · ')}`}</Body>
            {care.handling === 'toxic' && <Notice>{care.note}</Notice>}
          </View>
        ) : (
          !!name.trim() && <Body muted>A stone of your own. Stone care has no notes for it, so check before using water, salt or sun.</Body>
        )}
      </Card>

      <Card>
        <SectionLabel>Form</SectionLabel>
        <Chips>
          {STONE_FORMS.map((f) => (
            <Chip key={f.key} label={f.label} selected={form === f.key} onPress={() => setForm(f.key)} />
          ))}
        </Chips>
      </Card>

      <Card>
        <SectionLabel>Its story</SectionLabel>
        <Field label="Where it came from" value={source} onChange={setSource} placeholder="A shop, a gift, a beach, a friend" />
        <Field label="Date acquired (year-month-day)" value={acquired} onChange={setAcquired} placeholder="e.g. 2025-10-31" />
        <Field label="Intentions it’s working on (one per line)" value={intentions} onChange={setIntentions} multiline placeholder="e.g. Calm sleep" />
        <Field label="Notes" value={notes} onChange={setNotes} multiline placeholder="How it feels, where it lives, what it’s paired with" />
      </Card>

      {!!problem && <Notice>{problem}</Notice>}
      <Button label={saving ? 'Saving…' : 'Save stone'} onPress={() => void save()} disabled={saving} />
    </RitualScreen>
  );
}
