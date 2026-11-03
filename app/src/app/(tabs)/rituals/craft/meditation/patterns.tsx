import { useMemo } from 'react';
import { View } from 'react-native';

import { Body, Card, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { useCraft } from '../../../../../lib/craft/store';
import { normalizeSit, SITS } from '../../../../../lib/meditation/log';
import { MIN_FOR_PATTERN, minutesWords, sitStats, type Group } from '../../../../../lib/meditation/patterns';

function Groups({ label, groups }: { label: string; groups: Group[] }) {
  const shown = groups.filter((g) => g.sits > 0);
  if (!shown.length) return null;
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>{label}</SectionLabel>
      <Card>
        {shown.map((g) => (
          <Body key={g.key}>{`${g.label}: ${g.sits} ${g.sits === 1 ? 'sit' : 'sits'}, ${minutesWords(g.minutes)}${g.settled !== null ? ` · settled ${g.settled} of 5` : ''}`}</Body>
        ))}
      </Card>
    </View>
  );
}

// What your meditation log says: streaks, minutes, the kinds you come back
// to, and how settled you've felt by moon, weekday and time of day.
// Website: /practice/meditation/patterns/.
export default function MeditationPatterns() {
  const { entries, ready } = useCraft<unknown>(SITS);
  const stats = useMemo(() => sitStats(entries.map((e) => ({ id: e.id, data: normalizeSit(e.data) })), new Date()), [entries]);
  return (
    <RitualScreen back="Meditation">
      <Title eyebrow="Meditation">Your patterns</Title>
      {!ready ? (
        <Body muted>Opening…</Body>
      ) : stats.sits === 0 ? (
        <Body muted>Once you’ve logged a few sits, what they have in common gathers here.</Body>
      ) : (
        <>
          <Card>
            <Body>{`${stats.streak.current} ${stats.streak.current === 1 ? 'day' : 'days'} in a row now · longest ${stats.streak.longest}`}</Body>
            <Body>{`This week ${minutesWords(stats.minutes.week)} · this month ${minutesWords(stats.minutes.month)} · this year ${minutesWords(stats.minutes.year)}`}</Body>
            <Body muted>{`${stats.sits} ${stats.sits === 1 ? 'sit' : 'sits'} on ${stats.streak.days} ${stats.streak.days === 1 ? 'day' : 'days'}, ${minutesWords(stats.minutes.all)} in all.`}</Body>
          </Card>
          {stats.lines.length > 0 && (
            <Card accent>
              {stats.lines.map((l) => (
                <Body key={l}>{l}</Body>
              ))}
            </Card>
          )}
          <View style={ui.gapSmall}>
            <SectionLabel>The kinds you come back to</SectionLabel>
            <Card>
              {stats.kinds.slice(0, 6).map((k) => (
                <Body key={k.label}>{`${k.label}: ${k.sits} ${k.sits === 1 ? 'sit' : 'sits'}, ${minutesWords(k.minutes)}`}</Body>
              ))}
            </Card>
          </View>
          <Groups label="Time of day" groups={stats.byTime} />
          <Groups label="Day of the week" groups={stats.byWeekday} />
          <Groups label="The moon’s phase" groups={stats.byPhase} />
          <Body muted>{`These are patterns in your own log, not rules. A comparison is only drawn once a group has ${MIN_FOR_PATTERN} sits that say how settled you felt.`}</Body>
        </>
      )}
    </RitualScreen>
  );
}
