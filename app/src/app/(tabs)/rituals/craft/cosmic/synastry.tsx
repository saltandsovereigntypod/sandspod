import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ChartWheel } from '../../../../../components/astro/ChartWheel';
import { openTerm, TermChips, TermText } from '../../../../../components/astro/Explain';
import { AspectDetail } from '../../../../../components/astro/PointDetail';
import { useCharts } from '../../../../../components/astro/useCharts';
import { Body, Card, Chip, Chips, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { aspectDef, type AspectHit } from '../../../../../lib/astro/aspects';
import { synastry } from '../../../../../lib/astro/forecast';
import { termIdFor } from '../../../../../lib/astro/glossary';
import { ordinalHouse } from '../../../../../lib/astro/interpret/compose';
import { colors, fonts, radius, type } from '../../../../../theme';

// Two of the person's own charts side by side: the aspects between them, and
// where each person's planets fall in the other's houses. Only charts the
// person entered themselves (later, ones a coven member chooses to share).
export default function Synastry() {
  const { charts } = useCharts();
  const usable = charts.filter((c) => c.chart);
  const [aId, setA] = useState<string | null>(usable[0]?.saved.id ?? null);
  const [bId, setB] = useState<string | null>(usable[1]?.saved.id ?? null);
  const [picked, setPicked] = useState<AspectHit | null>(null);
  const a = usable.find((c) => c.saved.id === aId) ?? usable[0] ?? null;
  const b = usable.find((c) => c.saved.id === bId && c.saved.id !== a?.saved.id) ?? usable.find((c) => c.saved.id !== a?.saved.id) ?? null;
  const result = a?.chart && b?.chart ? synastry(a.chart, b.chart) : null;
  const { width } = useWindowDimensions();
  const size = Math.min(width - 40, 440);

  return (
    <RitualScreen back="Charts">
      <Title eyebrow="Charts">Synastry</Title>
      <TermText style={type.body} text="Synastry compares two charts: the aspects one person’s planets make to the other’s, and where each falls in the other’s houses. It describes dynamics, not destiny." />
      {usable.length < 2 ? (
        <Card>
          <Body>Add a second chart to compare. Only add someone’s chart with their blessing.</Body>
        </Card>
      ) : (
        <>
          <View style={ui.gapSmall}>
            <SectionLabel>First chart (inner wheel)</SectionLabel>
            <Chips>
              {usable.map((c) => (
                <Chip key={c.saved.id} label={c.saved.name} selected={a?.saved.id === c.saved.id} onPress={() => setA(c.saved.id)} />
              ))}
            </Chips>
            <SectionLabel>Second chart (outer ring)</SectionLabel>
            <Chips>
              {usable
                .filter((c) => c.saved.id !== a?.saved.id)
                .map((c) => (
                  <Chip key={c.saved.id} label={c.saved.name} selected={b?.saved.id === c.saved.id} onPress={() => setB(c.saved.id)} />
                ))}
            </Chips>
          </View>
          {a?.chart && b?.chart && result && (
            <>
              <View style={styles.centre}>
                <ChartWheel
                  chart={a.chart}
                  size={size}
                  outer={b.chart.positions.filter((p) => !['Descendant', 'IC', 'South Node', 'Part of Fortune', 'Lilith'].includes(p.point))}
                  outerLabel={b.saved.name}
                  aspects={result.aspects.map((h) => ({ ...h, a: h.b, b: h.a }))}
                  onTap={(t) => {
                    if (t.kind === 'sign') openTerm(termIdFor(t.sign));
                    else if (t.kind === 'house') openTerm(`house-${t.house}`);
                    else if (t.kind === 'point') openTerm(termIdFor(t.point));
                    else setPicked({ ...t.aspect, a: t.aspect.b, b: t.aspect.a });
                  }}
                />
              </View>
              <Body muted>{`${a.saved.name} inside, ${b.saved.name} in the outer ring. ${result.tally.soft} easy contacts, ${result.tally.hard} challenging, ${result.tally.blend} conjunctions.`}</Body>
              {picked && <AspectDetail aspect={picked} />}
              <SectionLabel>Contacts, closest first</SectionLabel>
              {result.aspects.slice(0, 25).map((h) => (
                <Pressable key={`${h.a}-${h.b}-${h.aspect}`} accessibilityRole="button" onPress={() => setPicked(h)} style={styles.row}>
                  <Text style={styles.glyph}>{aspectDef(h.aspect).symbol}</Text>
                  <View style={styles.flex}>
                    <Text style={styles.title}>{`${a.saved.name}’s ${h.a} ${h.aspect} ${b.saved.name}’s ${h.b}`}</Text>
                    <Text style={type.caption}>{`${h.orb.toFixed(1)}°`}</Text>
                  </View>
                </Pressable>
              ))}
              {result.aInB.length > 0 && (
                <Card>
                  <SectionLabel>{`${a.saved.name}’s planets in ${b.saved.name}’s houses`}</SectionLabel>
                  {result.aInB.map((o) => (
                    <TermText key={o.point} style={type.body} text={`${o.point} in the ${ordinalHouse(o.house)}`} />
                  ))}
                </Card>
              )}
              {result.bInA.length > 0 && (
                <Card>
                  <SectionLabel>{`${b.saved.name}’s planets in ${a.saved.name}’s houses`}</SectionLabel>
                  {result.bInA.map((o) => (
                    <TermText key={o.point} style={type.body} text={`${o.point} in the ${ordinalHouse(o.house)}`} />
                  ))}
                </Card>
              )}
            </>
          )}
        </>
      )}
      <TermChips ids={['synastry', 'aspects', 'house-7', 'venus', 'mars']} />
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center' },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surface, borderRadius: radius.tile },
  glyph: { width: 28, fontSize: 20, color: colors.gold, textAlign: 'center' },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.cream },
});
