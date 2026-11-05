import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Bars, goTo, Button, usePsychic } from '../../../../../components/psychic/shared';
import { Body, Card, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { PSYCHIC_KINDS, scoredRuns } from '../../../../../lib/craft/psychic/log';
import { bestSlice, byDay, byMeditation, byMoonPhase, byTimeOfDay, streaks, verdict, type Slice } from '../../../../../lib/craft/psychic/stats';
import { localDateKey } from '../../../../../lib/rituals/lifecycle';
import { colors, fonts } from '../../../../../theme';

const pct = (x: number) => `${Math.round(x * 100)}%`;

function SliceBars({ title, list }: { title: string; list: Slice[] }) {
  const best = bestSlice(list);
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>{title}</SectionLabel>
      {list.length === 0 ? (
        <Body muted>Nothing scored yet.</Body>
      ) : (
        <>
          <Bars items={list.map((s) => ({ label: s.label.replace(' Moon', '').replace('Waxing', 'Wax').replace('Waning', 'Wan').replace('Crescent', 'Cres').replace('Gibbous', 'Gib').replace('Quarter', 'Qtr').replace('First ', '1st ').replace('Last ', 'Lst '), value: s.rate }))} max={Math.max(0.5, ...list.map((s) => s.rate))} a11y={`${title}: ${list.map((s) => `${s.label} ${pct(s.rate)} of ${s.trials}`).join(', ')}`} />
          {list.map((s) => (
            <Text key={s.label} style={{ color: colors.cream, fontFamily: fonts.body, fontSize: 13 }}>
              {`${s.label}: ${s.hits} of ${s.trials} (${pct(s.rate)}), ${s.edge >= 0 ? '+' : ''}${(s.edge * 100).toFixed(0)} points against chance`}
            </Text>
          ))}
          <Body muted>{best ? `${best.label} is the highest here, but with this many slices some will always look good by luck.` : 'Too few trials in each slice to compare yet.'}</Body>
        </>
      )}
    </View>
  );
}

// Your results: hit rate against chance for each exercise, progress over time,
// streaks, best time of day and the moon phase. Plain, and honest about luck.
export default function Progress() {
  const { sessions } = usePsychic();
  const today = localDateKey(new Date());
  const all = useMemo(() => scoredRuns(sessions), [sessions]);
  const days = useMemo(() => byDay(all).slice(-14), [all]);
  const st = useMemo(() => streaks(sessions.map((s) => s.data.date), today), [sessions, today]);
  const time = useMemo(() => byTimeOfDay(all), [all]);
  const med = useMemo(() => byMeditation(all), [all]);
  const moon = useMemo(() => byMoonPhase(all), [all]);

  return (
    <RitualScreen back="Psychic development">
      <Title eyebrow="Psychic development">Your results</Title>
      <Body muted>Every score is set against what luck alone would give. We only say “above chance” when it is unlikely to be luck (p below 0.05) over at least 50 trials, and even then it cannot tell you why.</Body>

      {PSYCHIC_KINDS.filter((k) => k.scored).map((k) => {
        const v = verdict(scoredRuns(sessions, k.id as 'esp' | 'remote' | 'precog'));
        return (
          <Card key={k.id}>
            <SectionLabel>{k.label}</SectionLabel>
            <Body>{v.trials ? `${pct(v.rate)} hits (${v.hits} of ${v.trials}); chance gives ${pct(v.expected / v.trials)}` : 'No trials yet.'}</Body>
            <Body muted>{v.words}</Body>
          </Card>
        );
      })}

      <Card accent>
        <SectionLabel>Streaks</SectionLabel>
        <Body>{`${st.current} ${st.current === 1 ? 'day' : 'days'} running · longest ${st.longest}`}</Body>
        <Body muted>{`${sessions.length} ${sessions.length === 1 ? 'session' : 'sessions'} in all, of every kind.`}</Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Hit rate over time (last 14 days you practised)</SectionLabel>
        {days.length ? <Bars items={days.map((d) => ({ label: d.date.slice(8), value: d.rate }))} max={1} a11y="Hit rate by day" /> : <Body muted>Nothing scored yet.</Body>}
      </View>

      <SliceBars title="With and without meditation" list={med} />
      <Body muted>“With meditation” means a drop-in sound or guided drop-in was used for that session.</Body>
      <SliceBars title="By time of day" list={time} />
      <SliceBars title="By moon phase" list={moon} />
      <Notice>Slicing results by time or moon makes many small groups, and some will look good by chance. Treat these as things to watch over many weeks, not findings.</Notice>
      <Button label="Back to the exercises" variant="outline" onPress={goTo('/rituals/craft/psychic')} />
    </RitualScreen>
  );
}
