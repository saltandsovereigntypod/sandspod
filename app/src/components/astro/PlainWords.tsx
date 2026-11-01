import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { plainWords, type ChartTab, type PlainLink } from '../../lib/astro/interpret/plainWords';
import type { Chart } from '../../lib/astro/natal';
import type { ExplainLevel } from '../../lib/astro/prefs';
import { type } from '../../theme';
import { Card, Chip, Chips, SectionLabel, ui } from '../rituals/ui';
import { LevelSwitch, Paragraphs, TermText, useExplainLevel } from './Explain';

// "Your chart in plain words", at the top of a chart: the whole chart in
// everyday language and how it fits together (lib/astro/interpret/plainWords.ts),
// in five parts, each ending in links to the detailed readings. Starts at the
// global Simple · Detailed level, with its own switch; folds away so the tabs
// below are close at hand.
export function PlainWordsCard({ chart, onTab }: { chart: Chart; onTab: (tab: ChartTab) => void }) {
  const words = useMemo(() => plainWords(chart), [chart]);
  const [global] = useExplainLevel();
  const [own, setOwn] = useState<ExplainLevel | null>(null);
  const [open, setOpen] = useState(true);
  const level = own ?? global;

  const go = (l: PlainLink) => {
    if ('tab' in l) {
      setOpen(false);
      onTab(l.tab);
    } else if ('planet' in l) router.push({ pathname: '/rituals/craft/cosmic/planet', params: { planet: l.planet } } as unknown as Href);
    else if ('hours' in l) router.push({ pathname: '/rituals/craft/cosmic/hours', params: { planet: l.hours } } as unknown as Href);
    else router.push({ pathname: '/altar/[altarId]', params: { altarId: 'natal', planet: l.altar, from: 'chart' } } as unknown as Href);
  };

  return (
    <Card accent>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={[type.cardTitle, styles.flex]}>
          Your chart in plain words
        </Text>
        <Chip label={open ? 'Fold away' : 'Read it'} selected={open} onPress={() => setOpen(!open)} a11yLabel={open ? 'Fold away your chart in plain words' : 'Read your chart in plain words'} />
      </View>
      {open ? (
        <>
          <TermText style={type.caption} text={words.intro} />
          <LevelSwitch value={level} onChange={setOwn} label="How much to explain your chart in plain words" />
          {words.parts.map((p, i) => (
            <View key={p.id} style={[ui.gapSmall, styles.part]}>
              <SectionLabel>{`${i + 1}. ${p.title}`}</SectionLabel>
              <Paragraphs text={level === 'simple' ? p.simple : p.detailed} />
              <Chips>
                {p.links.map((l) => (
                  <Chip key={l.label} label={l.label} onPress={() => go(l)} />
                ))}
              </Chips>
            </View>
          ))}
        </>
      ) : (
        <Text style={type.caption}>The big picture, what runs the show, where your energy goes, your tensions and gifts, and how it all fits together.</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  part: { marginTop: 8 },
});
