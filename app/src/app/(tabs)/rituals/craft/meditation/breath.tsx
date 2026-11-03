import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Button } from '../../../../../components/Button';
import { Body, Chip, Chips, Field, RitualScreen, Title, ui } from '../../../../../components/rituals/ui';
import { BREATH_SHAPES, breathSquareSvg, breathWaveSvg, type BreathShape } from '../../../../../lib/meditation/focus';
import { BREATH_WORDS, breathAt, BREATHS, cleanBreath, type BreathId, type BreathPattern } from '../../../../../lib/meditation/timer';
import { colors, fonts } from '../../../../../theme';

const SIZE = 240;

// Breath pacing: a circle that grows as you breathe in and shrinks as you
// breathe out, a wave drawn by the breath, or a dot travelling a square path
// (one side for each part, for box breathing), for box breathing, 4-7-8 or
// your own count. No sound.
// Website: /practice/meditation/breath/.
export default function BreathPacing() {
  const [id, setId] = useState<BreathId>('box');
  const [custom, setCustom] = useState<BreathPattern>(BREATHS[2].pattern);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [shape, setShape] = useState<BreathShape>('circle');
  const [now, setNow] = useState(() => Date.now());
  const pattern = id === 'custom' ? custom : BREATHS.find((b) => b.id === id)!.pattern;

  useEffect(() => {
    if (startedAt === null) return;
    const t = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(t);
  }, [startedAt]);

  const b = startedAt === null ? null : breathAt(pattern, now - startedAt);
  const scale = b ? 0.35 + 0.65 * b.scale : 0.35;
  const field = (key: keyof BreathPattern, label: string) => (
    <Field label={label} value={String(custom[key])} keyboardType="numeric" onChange={(t) => setCustom(cleanBreath({ ...custom, [key]: t }))} />
  );

  return (
    <RitualScreen back="Meditation">
      <Title eyebrow="Meditation">Breath pacing</Title>
      <Chips>
        {BREATHS.map((x) => (
          <Chip key={x.id} label={x.label} selected={id === x.id} onPress={() => setId(x.id)} />
        ))}
      </Chips>
      <Body muted>{BREATHS.find((x) => x.id === id)!.line}</Body>
      {id === 'custom' && startedAt === null && (
        <View style={ui.gapSmall}>
          {field('inhale', 'Breathe in (seconds)')}
          {field('hold', 'Hold, full (seconds)')}
          {field('exhale', 'Breathe out (seconds)')}
          {field('rest', 'Hold, empty (seconds)')}
        </View>
      )}
      <Chips>
        {BREATH_SHAPES.map((x) => (
          <Chip key={x.value} label={x.label} selected={shape === x.value} onPress={() => setShape(x.value)} />
        ))}
      </Chips>
      <View style={styles.stage} accessibilityLiveRegion="polite">
        {shape === 'circle' ? (
          <View style={[styles.circle, { transform: [{ scale }] }]} />
        ) : (
          <View style={styles.shape}>
            <SvgXml xml={(shape === 'wave' ? breathWaveSvg : breathSquareSvg)(pattern, startedAt === null ? 0 : now - startedAt)} width={SIZE} height={SIZE} />
          </View>
        )}
        <Text style={styles.word}>{b ? BREATH_WORDS[b.stage] : 'Ready'}</Text>
        {b && <Text style={styles.count}>{b.left}</Text>}
      </View>
      {b && <Body muted>{`${b.cycle} ${b.cycle === 1 ? 'breath' : 'breaths'}`}</Body>}
      <Button label={startedAt === null ? 'Begin' : 'Stop'} onPress={() => setStartedAt(startedAt === null ? Date.now() : null)} />
      <Body muted>Breathe gently and never strain. If you feel light-headed, stop and breathe normally. Long holds aren’t for everyone; shorten them, or leave them out.</Body>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  stage: { height: SIZE + 40, alignItems: 'center', justifyContent: 'center' },
  circle: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: 'rgba(226,195,109,0.18)', borderWidth: 2, borderColor: colors.gold },
  shape: { position: 'absolute', opacity: 0.9 },
  word: { fontFamily: fonts.display, fontSize: 30, color: colors.cream },
  count: { fontFamily: fonts.body, fontSize: 18, color: colors.muted },
});
