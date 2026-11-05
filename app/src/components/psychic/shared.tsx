import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';

import { addEntry, useCraft } from '../../lib/craft/store';
import { newSession, normalizeSession, PSYCHIC_SESSIONS, scoredRuns, type PsychicSession, type SessionEntry } from '../../lib/craft/psychic/log';
import { verdict } from '../../lib/craft/psychic/stats';
import { colors, fonts } from '../../theme';
import { Body, Card, Chip, Chips, Notice, SectionLabel } from '../rituals/ui';
import { Button } from '../Button';

/** Every psychic session kept so far, newest first, and a way to keep one. */
export function usePsychic() {
  const { entries, ready } = useCraft<PsychicSession>(PSYCHIC_SESSIONS);
  const sessions = useMemo<SessionEntry[]>(
    () => entries.map((e) => ({ id: e.id, createdAt: e.createdAt, data: normalizeSession(e.data) })).sort((a, b) => b.data.at.localeCompare(a.data.at)),
    [entries],
  );
  return { sessions, ready, keep: (input: Parameters<typeof newSession>[0]) => addEntry(PSYCHIC_SESSIONS, newSession(input)) };
}

/** The honest line on a set of sessions (one exercise or all). */
export function ResultsLine({ sessions, kind }: { sessions: SessionEntry[]; kind?: 'esp' | 'remote' | 'precog' }) {
  const v = useMemo(() => verdict(scoredRuns(sessions, kind)), [sessions, kind]);
  return <Body muted>{v.words}</Body>;
}

export const goTo = (href: string) => () => router.push(href as Href);

/** The five classic symbols, drawn simply. */
export function EspSymbol({ id, size = 96, colour = colors.cream }: { id: string; size?: number; colour?: string }) {
  const sw = 4;
  const p = { stroke: colour, strokeWidth: sw, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel={id}>
      {id === 'circle' && <Circle cx="50" cy="50" r="34" {...p} />}
      {id === 'cross' && (
        <>
          <Line x1="50" y1="14" x2="50" y2="86" {...p} />
          <Line x1="14" y1="50" x2="86" y2="50" {...p} />
        </>
      )}
      {id === 'waves' && (
        <>
          <Path d="M12 32 q12.5 -16 25 0 t25 0 t25 0" {...p} />
          <Path d="M12 52 q12.5 -16 25 0 t25 0 t25 0" {...p} />
          <Path d="M12 72 q12.5 -16 25 0 t25 0 t25 0" {...p} />
        </>
      )}
      {id === 'square' && <Rect x="18" y="18" width="64" height="64" {...p} />}
      {id === 'star' && <Polygon points="50,12 61,38 89,40 67,58 74,86 50,71 26,86 33,58 11,40 39,38" {...p} />}
    </Svg>
  );
}

/** A suit as a simple emblem: wands (a staff), cups (a cup), swords (a blade), pentacles (a ringed star). */
export function SuitMark({ id, size = 96, colour = colors.cream }: { id: string; size?: number; colour?: string }) {
  const p = { stroke: colour, strokeWidth: 4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel={id}>
      {id === 'wands' && (
        <>
          <Line x1="50" y1="88" x2="50" y2="18" {...p} />
          <Path d="M50 30 q-18 -6 -22 -18 M50 40 q18 -6 22 -18" {...p} />
        </>
      )}
      {id === 'cups' && (
        <>
          <Path d="M24 28 h52 q0 34 -26 40 q-26 -6 -26 -40z" {...p} />
          <Line x1="50" y1="68" x2="50" y2="84" {...p} />
          <Line x1="34" y1="86" x2="66" y2="86" {...p} />
        </>
      )}
      {id === 'swords' && (
        <>
          <Line x1="50" y1="10" x2="50" y2="72" {...p} />
          <Line x1="32" y1="62" x2="68" y2="62" {...p} />
          <Line x1="50" y1="72" x2="50" y2="90" {...p} />
        </>
      )}
      {id === 'pentacles' && (
        <>
          <Circle cx="50" cy="52" r="36" {...p} />
          <Polygon points="50,24 59,46 82,47 64,61 70,82 50,69 30,82 36,61 18,47 41,46" {...p} />
        </>
      )}
    </Svg>
  );
}

/** A simple row of bars, one per entry, each tall by its value out of `max`. */
export function Bars({ items, max = 1, height = 90, a11y }: { items: { label: string; value: number; note?: string }[]; max?: number; height?: number; a11y: string }) {
  return (
    <View accessible accessibilityLabel={a11y} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: height + 20 }}>
      {items.map((it) => (
        <View key={it.label} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
          <View style={{ width: '70%', maxWidth: 28, height: Math.max(3, Math.round((Math.min(it.value, max) / max) * height)), backgroundColor: colors.gold, borderRadius: 3, opacity: it.value > 0 ? 1 : 0.3 }} />
          <Text style={{ color: colors.cream, fontFamily: fonts.body, fontSize: 10 }} numberOfLines={1}>
            {it.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export { Button, Card, Chip, Chips, Notice, SectionLabel };
