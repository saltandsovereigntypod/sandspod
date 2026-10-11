import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MoonDisc } from '../../../../components/MoonDisc';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { journalDetail } from '../../../../lib/rituals/format';
import { journalInsights } from '../../../../lib/rituals/insights';
import { useRituals } from '../../../../lib/rituals/store';
import { colors, fonts, radius, type } from '../../../../theme';

// How lit each phase is, for the little moons beside the counts.
const LIGHT: Record<string, { illumination: number; waxing: boolean }> = {
  'New Moon': { illumination: 0, waxing: true },
  'Waxing Crescent': { illumination: 0.25, waxing: true },
  'First Quarter': { illumination: 0.5, waxing: true },
  'Waxing Gibbous': { illumination: 0.8, waxing: true },
  'Full Moon': { illumination: 1, waxing: true },
  'Waning Gibbous': { illumination: 0.8, waxing: false },
  'Last Quarter': { illumination: 0.5, waxing: false },
  'Waning Crescent': { illumination: 0.25, waxing: false },
};

const openEntry = (id: string) => router.push({ pathname: '/rituals/journal/[id]', params: { id } });

export default function JournalInsights() {
  const rituals = useRituals();
  const insights = useMemo(() => journalInsights(rituals.journal, new Date()), [rituals.journal]);
  const most = Math.max(1, ...insights.byPhase.map((p) => p.count));
  const last = insights.lastThisPhase;
  const lastWords = last ? last.entry.what_happened_during || last.entry.feelings_after || last.entry.notes || last.entry.intention : null;

  return (
    <RitualScreen back="Journal">
      <Title eyebrow={`${insights.total} ${insights.total === 1 ? 'ritual' : 'rituals'}`}>Your moon</Title>

      {insights.total < 3 ? (
        <Card>
          <Body>
            {insights.total === 0
              ? 'Journal a few rituals and the patterns in your practice will gather here: which moons you work under, what for, and what you did last time the moon looked like this.'
              : 'A few more rituals and the patterns in your practice will start to show here.'}
          </Body>
        </Card>
      ) : (
        insights.lines.length > 0 && (
          <Card accent>
            {insights.lines.map((line) => (
              <Text key={line} style={styles.line}>
                {line}
              </Text>
            ))}
          </Card>
        )
      )}

      {last && (
        <View style={ui.gapSmall}>
          <SectionLabel>{`Last ${last.phase}`}</SectionLabel>
          <List>
            <Row
              icon="grimoire"
              title={last.entry.title || 'Untitled Ritual'}
              detail={[journalDetail(last.entry), lastWords?.slice(0, 120)].filter(Boolean).join('\n')}
              last
              onPress={() => openEntry(last.entry.id)}
            />
          </List>
        </View>
      )}

      {insights.total > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>By phase</SectionLabel>
          <Card>
            {insights.byPhase.map(({ phase, count }) => (
              <View key={phase} style={styles.bar} accessible accessibilityLabel={`${phase}: ${count} ${count === 1 ? 'ritual' : 'rituals'}`}>
                <MoonDisc size={22} illumination={LIGHT[phase].illumination} waxing={LIGHT[phase].waxing} halo={false} />
                <Text style={styles.barLabel} numberOfLines={1}>
                  {phase}
                </Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${(count / most) * 100}%` }]} />
                </View>
                <Text style={styles.count}>{count}</Text>
              </View>
            ))}
            <Body muted>{`${insights.thisMoon} this moon · ${insights.lastMoon} last moon`}</Body>
          </Card>
        </View>
      )}

      {insights.watching.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Still watching for</SectionLabel>
          <List>
            {insights.watching.map((entry, i, all) => (
              <Row
                key={entry.id}
                icon="grimoire"
                title={entry.results ?? ''}
                detail={`${entry.title || 'Untitled Ritual'} · ${journalDetail(entry)}`}
                last={i === all.length - 1}
                onPress={() => openEntry(entry.id)}
              />
            ))}
          </List>
        </View>
      )}
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  line: { ...type.body, color: colors.cream },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 28 },
  barLabel: { width: 118, fontFamily: fonts.body, fontSize: 13, color: colors.parchment },
  track: { flex: 1, height: 8, borderRadius: radius.tile, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  fill: { height: 8, borderRadius: radius.tile, backgroundColor: colors.gold },
  count: { width: 24, textAlign: 'right', fontFamily: fonts.bodySemi, fontSize: 13, color: colors.cream },
});
