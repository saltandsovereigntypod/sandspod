import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, ui } from '../../../../../components/rituals/ui';
import { addEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';
import { BED_CHOICES, CARRIER_CHOICES, cleanCustom, customMinutes, CUSTOM_COLLECTION, DEFAULT_CUSTOM, type CustomCue, type CustomProgram } from '../../../../../lib/meditation/programs';

// Build your own binaural program: where the beat starts, what it holds, how
// long each part lasts, the carrier, a bed and timed cues. Kept per person in
// the craft store (collection "binaural-programs"), so it syncs with the
// account. A hold under 8 Hz always keeps a return of at least three minutes.
const STARTS = [14, 12, 10, 8];
const HOLDS = [10, 8, 6, 5, 4, 3, 2];
const DESCENDS = [3, 5, 8, 12, 20];
const HOLD_MINS = [5, 10, 15, 20, 30, 45, 60];
const RETURNS = [2, 3, 4, 6, 8];
const CARRIER_PICKS = ['om', 'weighted', 'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'sf528', 'root', 'heart', 'crown'];
const STRIKES: { id: string; label: string }[] = [
  { id: '', label: 'No strike' },
  { id: 'bell', label: 'Bell' },
  { id: 'fork:136.1', label: 'OM fork' },
  { id: 'fork:4096', label: '4096 fork' },
];

export default function BuildProgram() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { entries } = useCraft<CustomProgram>(CUSTOM_COLLECTION);
  const existing = id ? entries.find((e) => e.id === id) : null;
  const [s, setS] = useState<CustomProgram>(DEFAULT_CUSTOM);
  const [loaded, setLoaded] = useState(false);
  // Opened before the entries finished loading: fill the form once, as they arrive.
  if (existing && !loaded) {
    setS(cleanCustom(existing.data));
    setLoaded(true);
  }
  const set = (patch: Partial<CustomProgram>) => setS((x) => ({ ...x, ...patch }));
  const clean = cleanCustom(s);
  const deep = s.hold < 8;
  const setCue = (i: number, patch: Partial<CustomCue>) => set({ cues: s.cues.map((c, j) => (j === i ? { ...c, ...patch } : c)) });

  const save = async () => {
    const data = cleanCustom({ ...s, cues: s.cues });
    if (existing) await updateEntry(CUSTOM_COLLECTION, existing.id, data);
    else {
      const e = await addEntry(CUSTOM_COLLECTION, data);
      router.replace({ pathname: '/rituals/craft/meditation/program', params: { id: `custom:${e.id}` } } as Href);
      return;
    }
    router.back();
  };

  return (
    <RitualScreen back="Programs">
      <Title eyebrow="Binaural programs">{existing ? 'Edit your program' : 'Build your own'}</Title>
      <Body muted>Choose where the beat starts, what it settles at, how long each part lasts, and add a few cues if you like. Kept on your account.</Body>
      <Field label="Name" value={s.title} onChange={(title) => set({ title })} />

      <View style={ui.gapSmall}>
        <SectionLabel>Start at (Hz)</SectionLabel>
        <Chips label="Start at (Hz)">{STARTS.map((v) => <Chip key={v} label={`${v} Hz`} selected={s.start === v} onPress={() => set({ start: v })} />)}</Chips>
        <SectionLabel>Settle and hold at (Hz)</SectionLabel>
        <Chips label="Settle and hold at (Hz)">{HOLDS.map((v) => <Chip key={v} label={`${v} Hz`} selected={s.hold === v} onPress={() => set({ hold: v })} />)}</Chips>
        <SectionLabel>Settling takes</SectionLabel>
        <Chips label="Settling takes">{DESCENDS.map((v) => <Chip key={v} label={`${v} min`} selected={s.descendMin === v} onPress={() => set({ descendMin: v })} />)}</Chips>
        <SectionLabel>Hold for</SectionLabel>
        <Chips label="Hold for">{HOLD_MINS.map((v) => <Chip key={v} label={`${v} min`} selected={s.holdMin === v} onPress={() => set({ holdMin: v })} />)}</Chips>
        <SectionLabel>Return takes</SectionLabel>
        <Chips label="Return takes">{RETURNS.map((v) => <Chip key={v} label={`${v} min`} selected={clean.returnMin === v} onPress={() => set({ returnMin: v })} />)}</Chips>
        {deep && <Notice>Under 8 Hz the program always ends by bringing you back up through alpha to low beta, for at least three minutes.</Notice>}
        <Body muted>{`In all ${customMinutes(clean)} minutes.`}</Body>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Carrier tone</SectionLabel>
        <Chips label="Carrier tone">
          {CARRIER_CHOICES.filter((c) => CARRIER_PICKS.includes(c.id)).map((c) => (
            <Chip key={c.id} label={c.label} selected={s.carrier === c.id} onPress={() => set({ carrier: c.id })} />
          ))}
        </Chips>
        <SectionLabel>Bed</SectionLabel>
        <Chips label="Bed">{BED_CHOICES.map((b) => <Chip key={b.id} label={b.label} selected={s.bed === b.id} onPress={() => set({ bed: b.id })} />)}</Chips>
        <Toggle label="Breathing pacer" detail="Six breaths a minute, on screen." value={s.breath} onChange={(breath) => set({ breath })} />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Cues</SectionLabel>
        <Body muted>A line of text on screen at a minute you choose, and a strike if you want one.</Body>
        {s.cues.map((q, i) => (
          <View key={i} style={ui.gapSmall}>
            <Field label={`Cue ${i + 1} at minute`} value={String(q.atMin)} keyboardType="decimal-pad" onChange={(v) => setCue(i, { atMin: Number(v) || 0 })} />
            <Field label="Words" value={q.text} onChange={(text) => setCue(i, { text })} />
            <Chips>{STRIKES.map((k) => <Chip key={k.id} label={k.label} selected={(q.strike ?? '') === k.id} onPress={() => setCue(i, { strike: k.id || undefined })} />)}</Chips>
            <Button label="Remove cue" variant="text" onPress={() => set({ cues: s.cues.filter((_, j) => j !== i) })} />
          </View>
        ))}
        {s.cues.length < 24 && <Button label="Add a cue" variant="outline" onPress={() => set({ cues: [...s.cues, { atMin: 1, text: '' }] })} />}
      </View>

      <Button label={existing ? 'Save changes' : 'Save and open'} onPress={() => void save()} />
    </RitualScreen>
  );
}
