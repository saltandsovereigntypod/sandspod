import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, Chips, goTo } from '../../../../../components/psychic/shared';
import { Body, Card, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { warmupMinutes, warmupOf, WARMUPS } from '../../../../../lib/craft/psychic/warmups';

// Warm-ups: short guided tune-ins, one line at a time, to take before an
// exercise. Choose one or several, in order; then go to an exercise.
export default function Warmup() {
  const [chosen, setChosen] = useState<string[]>(['grounding', 'opening']);
  const [run, setRun] = useState<{ ids: string[]; at: number; line: number } | null>(null);
  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : WARMUPS.map((w) => w.id).filter((x) => x === id || c.includes(x))));

  if (run) {
    const w = warmupOf(run.ids[run.at])!;
    const last = run.line >= w.lines.length - 1;
    const lastWarm = run.at >= run.ids.length - 1;
    return (
      <RitualScreen back="Psychic development">
        <Title eyebrow={`Warm-up ${run.at + 1} of ${run.ids.length}`}>{w.title}</Title>
        <Card accent>
          <Body>{w.lines[run.line]}</Body>
          <Body muted>{`${run.line + 1} of ${w.lines.length}. Take as long as you like on each line.`}</Body>
        </Card>
        {!last && <Button label="Next line" onPress={() => setRun({ ...run, line: run.line + 1 })} />}
        {last && !lastWarm && <Button label="Next warm-up" onPress={() => setRun({ ...run, at: run.at + 1, line: 0 })} />}
        {last && lastWarm && (
          <>
            <Notice>Ready. Choose an exercise.</Notice>
            <Button label="Card & colour guessing" onPress={() => router.replace('/rituals/craft/psychic/esp' as Href)} />
            <Button label="Remote viewing" variant="outline" onPress={() => router.replace('/rituals/craft/psychic/remote' as Href)} />
            <Button label="Tomorrow’s card" variant="outline" onPress={() => router.replace('/rituals/craft/psychic/precog' as Href)} />
          </>
        )}
        <Button label="Stop" variant="text" onPress={() => setRun(null)} />
      </RitualScreen>
    );
  }

  return (
    <RitualScreen back="Psychic development">
      <Title eyebrow="Psychic development">Warm-ups</Title>
      <Body muted>Short guided tune-ins to take before an exercise. Grounding and opening are a good pair. They are our own words, drawing on modern meditation and witchcraft practice; the third eye and the aura are ideas from spiritual traditions, not things that have been measured, and the scripts treat them as ways to focus attention.</Body>
      <View style={ui.gapSmall}>
        <SectionLabel>Choose, in this order</SectionLabel>
        <Chips multiple label="Choose, in this order">
          {WARMUPS.map((w) => (
            <Chip key={w.id} label={`${w.title} · ${w.minutes} min`} selected={chosen.includes(w.id)} onPress={() => toggle(w.id)} />
          ))}
        </Chips>
        {chosen.length > 0 && <Body muted>{`About ${warmupMinutes(chosen)} minutes.`}</Body>}
      </View>
      <Button label="Begin" disabled={!chosen.length} onPress={() => setRun({ ids: chosen, at: 0, line: 0 })} />
      <Card>
        <SectionLabel>Want a timer and bells?</SectionLabel>
        <Body muted>Meditation has a timer with gentle bells and a grounding script of its own.</Body>
        <Button label="Open Meditation" variant="outline" onPress={goTo('/rituals/craft/meditation')} />
      </Card>
    </RitualScreen>
  );
}
