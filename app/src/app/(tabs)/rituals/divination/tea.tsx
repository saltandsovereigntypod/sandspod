import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { ReadingBody } from '../../../../components/divination/ReadingBody';
import { Body, Card, Chip, Chips, Field, RitualScreen, SectionLabel, Title, tell, ui } from '../../../../components/rituals/ui';
import { addEntry } from '../../../../lib/craft/store';
import { READINGS } from '../../../../lib/craft/hedge/readings';
import { readingToKeep } from '../../../../lib/divination/keep';
import { DEPTHS, placeWords, readCup, SIDES, TEA_SYMBOLS, teaSymbolById, type Depth, type Seen, type Side } from '../../../../lib/divination/tea';
import { findSymbols } from '../../../../lib/symbolReading';
import { localDateKey } from '../../../../lib/rituals/lifecycle';

// Read a cup of tea leaves or coffee grounds: pick the shapes you can see,
// say where in the cup each lies, and get a whole reading, kept in your readings.
export default function TeaReading() {
  const [question, setQuestion] = useState('');
  const [cup, setCup] = useState<'tea' | 'coffee'>('tea');
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState<Depth>('middle');
  const [side, setSide] = useState<Side>('between');
  const [seen, setSeen] = useState<Seen[]>([]);
  const [shown, setShown] = useState(false);
  const [saving, setSaving] = useState(false);

  const date = useMemo(() => localDateKey(new Date()), []);
  const found = useMemo(() => findSymbols(TEA_SYMBOLS, query).slice(0, query.trim() ? 24 : 30), [query]);
  const reading = useMemo(() => (shown ? readCup({ question, seen, date, cup }) : null), [shown, question, seen, date, cup]);

  const add = (id: string) => {
    setSeen((s) => (s.some((x) => x.id === id && x.depth === depth && x.side === side) ? s : [...s, { id, depth, side }]));
    setShown(false);
  };
  const remove = (i: number) => {
    setSeen((s) => s.filter((_, k) => k !== i));
    setShown(false);
  };

  const keep = async () => {
    if (!reading) return;
    setSaving(true);
    try {
      const entry = await addEntry(READINGS, readingToKeep({ method: 'tea', question, drawn: seen.map((s) => `${teaSymbolById(s.id)?.name ?? s.id} (${placeWords(s.depth, s.side)})`), text: reading.text, lookBackDays: 14 }));
      router.replace(`/rituals/divination/${entry.id}` as Href);
    } catch {
      tell('Could not keep it', 'Try again in a moment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RitualScreen back="Readings">
      <Title eyebrow="Tasseography">Read the cup</Title>
      <Body muted>
        Swirl the cup, tip out what is left and set it on its saucer. Hold it with the handle toward you, and pick each shape you can see and where it lies. Near the rim is soon, the bottom is later; the handle side is you and home.
      </Body>
      <Field label="The question" value={question} onChange={setQuestion} placeholder="What you asked as you drank" multiline />
      <Chips>
        <Chip label="Tea leaves" selected={cup === 'tea'} onPress={() => setCup('tea')} />
        <Chip label="Coffee grounds" selected={cup === 'coffee'} onPress={() => setCup('coffee')} />
      </Chips>

      <View style={ui.gapSmall}>
        <SectionLabel>Where does the next shape lie?</SectionLabel>
        <Chips>
          {DEPTHS.map((d) => (
            <Chip key={d.id} label={d.label} selected={depth === d.id} hint={d.detail} onPress={() => setDepth(d.id)} />
          ))}
        </Chips>
        <Chips>
          {SIDES.map((s) => (
            <Chip key={s.id} label={s.label} selected={side === s.id} hint={s.detail} onPress={() => setSide(s.id)} />
          ))}
        </Chips>
        <Body muted>{`${DEPTHS.find((d) => d.id === depth)!.detail}. ${SIDES.find((s) => s.id === side)!.detail}.`}</Body>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Shapes</SectionLabel>
        <Field label="Search shapes" value={query} onChange={setQuery} placeholder="anchor, bird, ring, a letter…" />
        <Chips>
          {found.map((s) => (
            <Chip key={s.id} label={s.name} a11yLabel={`Add ${s.name}, ${placeWords(depth, side)}`} onPress={() => add(s.id)} />
          ))}
        </Chips>
        {!found.length && <Body muted>No shape by that name. Try another word, or pick the nearest.</Body>}
      </View>

      {seen.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>What you saw</SectionLabel>
          <Chips>
            {seen.map((s, i) => (
              <Chip key={`${s.id}${i}`} selected label={`${teaSymbolById(s.id)?.name}: ${placeWords(s.depth, s.side)}`} a11yLabel={`Remove ${teaSymbolById(s.id)?.name}`} onPress={() => remove(i)} />
            ))}
          </Chips>
          <Body muted>Tap one to take it out.</Body>
        </View>
      )}

      <Button label={seen.length ? 'Read the cup' : 'Read the cup (nothing picked yet)'} onPress={() => setShown(true)} />

      {reading && (
        <View style={ui.gap}>
          <ReadingBody
            sections={reading.sections}
            blocksId="symbols"
            blocks={reading.symbols.map((s) => ({ title: `${s.symbol.name} · ${s.place}`, paragraphs: s.paragraphs }))}
          />
          <Card accent>
            <Body>Keep this in your readings, with a day to come back and write what happened.</Body>
          </Card>
          <Button label={saving ? 'Keeping it…' : 'Keep this reading'} onPress={keep} disabled={saving} />
        </View>
      )}
    </RitualScreen>
  );
}
