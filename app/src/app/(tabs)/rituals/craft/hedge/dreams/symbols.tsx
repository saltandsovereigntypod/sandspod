import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Body, Card, Chip, Chips, Expander, RitualScreen, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { shortDate } from '../../../../../../lib/calendar';
import { DREAM_SYMBOL_INTRO, DREAM_SYMBOLS } from '../../../../../../lib/craft/hedge/dreamSymbols';
import { DREAMS, dreamStats, normalizeDream, phaseClusterNote, phaseCounts, symbolCounts } from '../../../../../../lib/craft/hedge/dreams';
import { useCraft } from '../../../../../../lib/craft/store';
import { dateFromKey } from '../../../../../../lib/rituals/lifecycle';
import { colors, fonts, type } from '../../../../../../theme';

export default function DreamSymbols() {
  const { entries } = useCraft<unknown>(DREAMS);
  const dreams = useMemo(() => entries.map((e) => ({ ...e, data: normalizeDream(e.data) })), [entries]);
  const symbols = useMemo(() => symbolCounts(dreams).slice(0, 15), [dreams]);
  const phases = useMemo(() => phaseCounts(dreams), [dreams]);
  const stats = dreamStats(dreams);
  const note = phaseClusterNote(dreams);
  const most = Math.max(1, ...phases.map((p) => p.count));

  return (
    <RitualScreen back="Dream journal">
      <Title eyebrow="Your dreams">Symbols and moons</Title>

      {stats.total > 0 && (
        <Card>
          <Body>
            {[
              `${stats.total} ${stats.total === 1 ? 'dream' : 'dreams'}`,
              stats.lucid ? `${stats.lucid} lucid` : null,
              stats.recurring ? `${stats.recurring} recurring` : null,
              stats.vividness ? `vividness ${stats.vividness} on average` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Body>
        </Card>
      )}

      {symbols.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>What keeps returning</SectionLabel>
          <Chips>
            {symbols.map((s) => {
              const last = dateFromKey(s.last);
              return (
                <Chip
                  key={s.symbol}
                  label={`${s.symbol} · ${s.count}`}
                  a11yLabel={`${s.symbol}, in ${s.count} ${s.count === 1 ? 'dream' : 'dreams'}${last ? `, last on ${shortDate(last)}` : ''}`}
                />
              );
            })}
          </Chips>
        </View>
      )}

      {stats.total > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>The moons you dream under</SectionLabel>
          <Card>
            {phases.map((p) => (
              <View key={p.phase} style={styles.bar} accessible accessibilityLabel={`${p.phase}: ${p.count}`}>
                <Text style={styles.barLabel}>{p.phase}</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${(p.count / most) * 100}%` }]} />
                </View>
                <Text style={styles.count}>{p.count}</Text>
              </View>
            ))}
          </Card>
          {note ? (
            <Body muted>{`${note} The crescents and gibbous moons last about a week each and the four main phases only a day or so, so that’s taken into account.`}</Body>
          ) : (
            <Body muted>After a few more dreams you’ll see whether they gather around a phase.</Body>
          )}
        </View>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Common symbols</SectionLabel>
        <Body muted>{DREAM_SYMBOL_INTRO}</Body>
        {DREAM_SYMBOLS.map((s) => (
          <Expander key={s.symbol} title={s.symbol[0].toUpperCase() + s.symbol.slice(1)}>
            <Body>{s.notes}</Body>
            <Body muted>{`Ask yourself: ${s.ask}`}</Body>
            {s.also.length > 0 && <Body muted>{`Also: ${s.also.join(', ')}`}</Body>}
          </Expander>
        ))}
        <Body muted>Your own associations matter most.</Body>
      </View>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 124, fontFamily: fonts.body, fontSize: 13, color: colors.parchment },
  track: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.gold },
  count: { ...type.caption, width: 24, textAlign: 'right' },
});
