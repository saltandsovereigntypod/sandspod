// What a sit shows besides its clock: the written guidance, one line at a
// time (scripts.ts lineAt), and something to rest your eyes on (focus.ts),
// which can fill the screen. Drawn from the sit's own clock, so it keeps
// pace with the timer.

import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { useCraft } from '../../lib/craft/store';
import { candleSvg, mandalaSvg, moonSvg, sigilFocusSvg, type FocusId } from '../../lib/meditation/focus';
import { lineAt, scriptOf, type ScriptId } from '../../lib/meditation/scripts';
import { elapsedOf, sitStateAt, type SitClock, type SitPlan } from '../../lib/meditation/timer';
import { readSigil, SIGILS } from '../../lib/sigil/sigil';
import { colors, fonts } from '../../theme';
import { Button } from '../Button';

/** The time now, every `ms`. */
export function useNow(ms: number, on = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms, on]);
  return now;
}

/** Your saved sigils, as picked for a focus. */
export function useSigils(): { id: string; name: string; d: string; ring: boolean; weight: number }[] {
  const { entries } = useCraft<{ name?: string; sigil?: unknown }>(SIGILS);
  return entries.flatMap((e) => {
    const s = readSigil(e.data?.sigil);
    return s ? [{ id: e.id, name: e.data?.name || s.intent || 'A sigil', d: s.d, ring: s.ring, weight: s.weight }] : [];
  });
}

export function focusXml(focus: FocusId, ms: number, sigil: { d: string; ring: boolean; weight: number } | null): string | null {
  if (focus === 'candle') return candleSvg(ms);
  if (focus === 'moon') return moonSvg(new Date());
  if (focus === 'mandala') return mandalaSvg(ms);
  if (focus === 'sigil' && sigil) return sigilFocusSvg(sigil, ms);
  return null;
}

type Props = { plan: SitPlan; clock: SitClock; endedAtMs: number | null; script: ScriptId | null; focus: FocusId; sigilId: string };

export function SitGuide({ plan, clock, endedAtMs, script, focus, sigilId }: Props) {
  const sigils = useSigils();
  const [full, setFull] = useState(false);
  const moving = focus === 'candle' || focus === 'mandala' || focus === 'sigil';
  const now = useNow(moving ? 100 : 500);
  const { width, height } = useWindowDimensions();
  const elapsed = elapsedOf(clock, now);
  const state = sitStateAt(plan, elapsed, endedAtMs);
  const s = scriptOf(script);
  const at = s && state.phase === 'sit' ? lineAt(s, state.sitMs, plan.minutes === null ? null : plan.minutes * 60_000) : null;
  const sigil = sigils.find((x) => x.id === sigilId) ?? sigils[0] ?? null;
  const xml = focusXml(focus, elapsed, sigil);
  const line = at && s ? <Text style={[styles.line, { opacity: at.opacity }]}>{s.lines[at.index]}</Text> : null;
  const size = Math.min(width - 32, 320);

  return (
    <View style={styles.wrap}>
      {xml && (
        <>
          <SvgXml xml={xml} width={size} height={size} />
          <Button label="Fill the screen" variant="text" onPress={() => setFull(true)} />
        </>
      )}
      {focus === 'sigil' && !sigil && <Text style={styles.note}>You haven’t saved a sigil yet. Make one in Craft → Sigils.</Text>}
      {s && <View style={styles.lineBox} accessibilityLiveRegion="polite">{line ?? <Text style={styles.note}>{state.phase === 'settle' ? 'The guidance begins with the sit.' : ''}</Text>}</View>}
      <Modal visible={full} animationType="fade" onRequestClose={() => setFull(false)} supportedOrientations={['portrait', 'landscape']}>
        <Pressable style={styles.full} onPress={() => setFull(false)} accessibilityLabel="Close the full screen view" accessibilityRole="button">
          {xml && <SvgXml xml={xml} width={Math.min(width, height) * 0.9} height={Math.min(width, height) * 0.9} />}
          {line && <View style={styles.fullLine}>{line}</View>}
          <Text style={styles.note}>Tap to close</Text>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  lineBox: { minHeight: 96, justifyContent: 'center', paddingHorizontal: 8 },
  line: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32, color: colors.cream, textAlign: 'center' },
  note: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: 'center' },
  full: { flex: 1, backgroundColor: '#07060a', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 },
  fullLine: { maxWidth: 560 },
});
