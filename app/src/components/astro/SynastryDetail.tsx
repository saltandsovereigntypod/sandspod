// The full synastry between two charts: the bi-wheel, every contact closest
// first (tap one for what it means), and each person's planets in the other's
// houses. Shown as the Detail section of "How your charts meet", the one
// place two charts are compared (the old Synastry screen redirects there).

import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ChartWheel } from './ChartWheel';
import { openTerm, TermText } from './Explain';
import { AspectDetail } from './PointDetail';
import { Body, Card, SectionLabel } from '../rituals/ui';
import { aspectDef, type AspectHit } from '../../lib/astro/aspects';
import { synastry } from '../../lib/astro/forecast';
import { termIdFor } from '../../lib/astro/glossary';
import { ordinalHouse } from '../../lib/astro/interpret/compose';
import type { Chart } from '../../lib/astro/natal';
import { colors, fonts, radius, type } from '../../theme';

type Side = { chart: Chart; saved: { name: string } };

export function SynastryDetail({ a, b }: { a: Side; b: Side }) {
  const [picked, setPicked] = useState<AspectHit | null>(null);
  const result = synastry(a.chart, b.chart);
  const { width } = useWindowDimensions();
  const size = Math.min(width - 40, 440);
  return (
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
      {result.aspects.map((h) => (
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
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center' },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surface, borderRadius: radius.tile },
  glyph: { width: 28, fontSize: 20, color: colors.gold, textAlign: 'center' },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.cream },
});
