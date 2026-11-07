import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { FigureGlyph } from '../../../../components/divination/FigureGlyph';
import { ReadingBody } from '../../../../components/divination/ReadingBody';
import { Body, Card, Chip, Chips, Field, RitualScreen, SectionLabel, Title, tell, ui } from '../../../../components/rituals/ui';
import { addEntry } from '../../../../lib/craft/store';
import { READINGS } from '../../../../lib/craft/hedge/readings';
import { buildChart, castMothers, chartSummary, LINE_NAMES, motherFromMarks, POSITION_NAMES, readChart, TOPICS, type Chart, type Figure, type Topic } from '../../../../lib/divination/geomancy';
import { readingToKeep } from '../../../../lib/divination/keep';
import { localDateKey } from '../../../../lib/rituals/lifecycle';
import { colors, fonts } from '../../../../theme';

const BLANK = () => [0, 1, 2, 3].map(() => [0, 0, 0, 0]);

// Geomancy: four Mothers, made by chance or by marking dots yourself, build
// the shield chart; the Judge and Witnesses answer the question.
export default function Geomancy() {
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState<Topic>('general');
  const [mode, setMode] = useState<'cast' | 'mark'>('cast');
  const [marks, setMarks] = useState<number[][]>(BLANK);
  const [chart, setChart] = useState<Chart | null>(null);
  const [saving, setSaving] = useState(false);
  const date = useMemo(() => localDateKey(new Date()), []);
  const reading = useMemo(() => (chart ? readChart(chart, question, topic, date) : null), [chart, question, topic, date]);
  const ready = marks.every((m) => m.every((n) => n > 0));

  const mark = (m: number, l: number) => setMarks((x) => x.map((row, i) => (i === m ? row.map((n, j) => (j === l ? n + 1 : n)) : row)));
  const clear = () => {
    setMarks(BLANK());
    setChart(null);
  };
  const build = () => setChart(buildChart(marks.map((m) => motherFromMarks(m))));

  const keep = async () => {
    if (!chart || !reading) return;
    setSaving(true);
    try {
      const entry = await addEntry(READINGS, readingToKeep({ method: 'geomancy', question, drawn: chart.houses.map((f, i) => `${POSITION_NAMES[i]}: ${f.name}`), text: `${chartSummary(chart)}\n\n${reading.text}`, lookBackDays: 14 }));
      router.replace(`/rituals/divination/${entry.id}` as Href);
    } catch {
      tell('Could not keep it', 'Try again in a moment.');
    } finally {
      setSaving(false);
    }
  };

  const rows: { title: string; items: { f: Figure; label: string }[] }[] = chart
    ? [
        // Mothers and Daughters are laid right to left, as the shield is read.
        { title: 'Mothers', items: [3, 2, 1, 0].map((i) => ({ f: chart.houses[i], label: POSITION_NAMES[i].replace(' Mother', '') })) },
        { title: 'Daughters', items: [7, 6, 5, 4].map((i) => ({ f: chart.houses[i], label: POSITION_NAMES[i].replace(' Daughter', '') })) },
        { title: 'Nieces', items: [11, 10, 9, 8].map((i) => ({ f: chart.houses[i], label: POSITION_NAMES[i].replace(' Niece', '') })) },
        { title: 'Witnesses', items: [13, 12].map((i) => ({ f: chart.houses[i], label: POSITION_NAMES[i].replace(' Witness', '') })) },
        { title: 'Judge and Reconciler', items: [14, 15].map((i) => ({ f: chart.houses[i], label: POSITION_NAMES[i] })) },
      ]
    : [];

  return (
    <RitualScreen back="Readings">
      <Title eyebrow="Divination from the sand">Geomancy</Title>
      <Body muted>
        Four Mothers are made first, each of four lines of one dot or two. The Daughters, Nieces, Witnesses and Judge follow from them by addition, so the question is answered by the work and not by one card. Make the Mothers by chance, or mark dots yourself, as geomancers did in the sand, and let the number of dots in each line fall odd or even.
      </Body>
      <Field label="The question" value={question} onChange={setQuestion} placeholder="Hold it in mind as you make the marks" multiline />
      <View style={ui.gapSmall}>
        <SectionLabel>What is it about?</SectionLabel>
        <Chips label="What is it about?">
          {TOPICS.map((t) => (
            <Chip key={t.id} label={t.label} selected={topic === t.id} hint={t.about} onPress={() => setTopic(t.id)} />
          ))}
        </Chips>
      </View>
      <Chips>
        <Chip label="Cast for me" selected={mode === 'cast'} onPress={() => setMode('cast')} />
        <Chip label="Mark the dots" selected={mode === 'mark'} onPress={() => setMode('mark')} />
      </Chips>

      {mode === 'cast' ? (
        <Button label={chart ? 'Cast again' : 'Make the Mothers'} onPress={() => setChart(buildChart(castMothers()))} />
      ) : (
        <View style={ui.gapSmall}>
          <Body muted>Tap a line to make a dot in it, as many as you like without counting, and four lines for each Mother. Only odd or even matters.</Body>
          {marks.map((m, mi) => (
            <Card key={mi}>
              <SectionLabel>{`${['First', 'Second', 'Third', 'Fourth'][mi]} Mother`}</SectionLabel>
              {m.map((n, li) => (
                <Pressable key={li} accessibilityRole="button" accessibilityLabel={`${LINE_NAMES[li]} line of the ${['first', 'second', 'third', 'fourth'][mi]} Mother, ${n} dots. Tap to add a dot`} onPress={() => mark(mi, li)} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ width: 52, fontFamily: fonts.body, color: colors.cream, fontSize: 13 }}>{LINE_NAMES[li]}</Text>
                  <Text style={{ flex: 1, fontFamily: fonts.body, color: colors.gold, fontSize: 18, letterSpacing: 3 }} numberOfLines={1}>
                    {n ? '•'.repeat(Math.min(n, 30)) : 'tap to mark'}
                  </Text>
                </Pressable>
              ))}
            </Card>
          ))}
          <Chips>
            <Chip label="Clear the marks" onPress={clear} />
          </Chips>
          <Button label={ready ? 'Build the chart' : 'Mark every line first'} onPress={ready ? build : () => tell('Not quite yet', 'Each of the sixteen lines needs at least one dot.')} />
        </View>
      )}

      {chart && reading && (
        <View style={ui.gap}>
          <SectionLabel>The shield</SectionLabel>
          {rows.map((r) => (
            <View key={r.title} style={ui.gapSmall}>
              <Body muted>{r.title}</Body>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
                {r.items.map((it) => (
                  <FigureGlyph key={it.label} figure={it.f} label={it.label} />
                ))}
              </View>
            </View>
          ))}
          <ReadingBody sections={reading.sections} blocks={[]} blocksId="" />
          <Button label={saving ? 'Keeping it…' : 'Keep this reading'} onPress={keep} disabled={saving} />
        </View>
      )}
    </RitualScreen>
  );
}
