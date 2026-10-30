import { router } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { PATTERN_INFO, PATTERN_NOTE } from '../../../../lib/cycle/content';
import { HISTORY_NOTE, historyReading } from '../../../../lib/cycle/history';
import { cycleLength, dayMonth, lengthLabel, PATTERN_NAMES } from '../../../../lib/cycle/model';
import { useCycle } from '../../../../lib/cycle/store';
import { type } from '../../../../theme';

// "What am I?": what the bleeds logged say, read plainly: the average cycle
// and how much it moves, how long bleeds last, where each began in the
// lunar month, and the moon pattern they lean to, with how sure that is.
// The website's twin is /rituals/cycle/?view=history.
export default function CycleHistory() {
  const cycle = useCycle();
  const data = cycle.data;
  const r = useMemo(() => (data ? historyReading(data) : null), [data]);
  if (cycle.phase !== 'open' || !data || !r) {
    return (
      <RitualScreen back="Cycle & Moon">
        <Title>What am I?</Title>
        <Body>Open Cycle &amp; Moon first.</Body>
        <Button label="Open Cycle & Moon" onPress={() => router.replace('/rituals/cycle')} />
      </RitualScreen>
    );
  }
  const used = cycleLength(data);
  return (
    <RitualScreen back="Cycle & Moon">
      <Title eyebrow="Cycle & Moon · your history">What am I?</Title>
      <Card accent>
        <Text style={[type.eyebrow, ui.gold]}>Your moon pattern</Text>
        {r.type ? (
          <>
            <Text style={type.cardTitle}>{r.type.headline}</Text>
            <Body>{r.type.explain}</Body>
            {r.shift && <Body>{r.shift}</Body>}
          </>
        ) : (
          <Body>Add your past periods and this will show which moon pattern your bleeds lean to.</Body>
        )}
        <Button label="Add past periods" variant="outline" onPress={() => router.push('/rituals/cycle/past')} />
      </Card>

      <Card>
        <Text style={[type.eyebrow, ui.gold]}>Your rhythm</Text>
        {r.lines.map((line) => (
          <Body key={line}>{line}</Body>
        ))}
        {r.spread != null && <Body muted>{`It moves by about ${r.spread} ${r.spread === 1 ? 'day' : 'days'} either side of the average (the standard deviation).`}</Body>}
        <Body muted>{`Cycle length used for your days and estimates: ${lengthLabel(used)}. Change it in Settings.`}</Body>
      </Card>

      {r.moons.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Each bleed and the moon</SectionLabel>
          <List>
            {r.moons.slice(0, 12).map((m, i, all) => (
              <Row
                key={m.bleed.id}
                icon="today"
                title={`${dayMonth(m.bleed.start)} ${m.bleed.start.slice(0, 4)}`}
                detail={`${m.phase} · lunar day ${m.lunarDay} · ${PATTERN_NAMES[m.pattern]}`}
                last={i === all.length - 1}
                onPress={() => router.push({ pathname: '/rituals/cycle/log', params: { date: m.bleed.start } })}
              />
            ))}
          </List>
        </View>
      )}

      <SectionLabel>The four patterns</SectionLabel>
      {(['white', 'pink', 'red', 'purple'] as const).map((p) => (
        <Card key={p}>
          <Text style={type.cardTitle}>{PATTERN_INFO[p].name}</Text>
          <Text style={[type.caption, ui.gold]}>{PATTERN_INFO[p].when}</Text>
          <Body>{PATTERN_INFO[p].line}</Body>
        </Card>
      ))}
      <Body muted>{HISTORY_NOTE}</Body>
      <Body muted>{PATTERN_NOTE}</Body>
    </RitualScreen>
  );
}
