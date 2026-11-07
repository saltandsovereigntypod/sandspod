import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { addEntry, useCraft } from '../../../../../lib/craft/store';
import { localDateKey } from '../../../../../lib/rituals/lifecycle';
import { CHALLENGES, challengeTitle, LENGTHS, newChallenge, normalizeChallenge, progressOf, THEMES, type ChallengeLength, type ThemeId } from '../../../../../lib/yearday/challenges';

const open = (id: string) => router.push(`/rituals/year/challenges/challenge?id=${id}` as Href);

// Practice challenges: short runs of daily practice beside A Year and a Day.
export default function Challenges() {
  const raw = useCraft<unknown>(CHALLENGES);
  const now = useMemo(() => new Date(), []);
  const all = useMemo(
    () =>
      raw.entries
        .map((e) => ({ id: e.id, c: normalizeChallenge(e.data) }))
        .filter((x): x is { id: string; c: NonNullable<typeof x.c> } => !!x.c)
        .sort((a, b) => b.c.start.localeCompare(a.c.start)),
    [raw.entries],
  );
  const active = all.filter((x) => !x.c.finished && !progressOf(x.c, now).over);
  const past = all.filter((x) => !active.includes(x));
  const [theme, setTheme] = useState<ThemeId>('tarot');
  const [length, setLength] = useState<ChallengeLength>(13);
  const [busy, setBusy] = useState(false);
  const picked = THEMES.find((t) => t.id === theme)!;

  const begin = async () => {
    setBusy(true);
    try {
      const e = await addEntry(CHALLENGES, newChallenge(theme, length, localDateKey(new Date())));
      open(e.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <RitualScreen back="A Year and a Day">
      <Title eyebrow="Beside A Year and a Day">Practice challenges</Title>
      <Body muted>Seven, thirteen, twenty-one or thirty days of one small practice. Each day has its own prompt; check in with a line or two, keep a streak if you like, and write a reflection at the end. A missed day is just a missed day: carry on.</Body>

      {active.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Under way</SectionLabel>
          <List>
            {active.map((x, i) => {
              const p = progressOf(x.c, now);
              return (
                <Row
                  key={x.id}
                  icon="calendar"
                  title={challengeTitle(x.c)}
                  detail={`Day ${Math.max(1, p.day)} of ${x.c.length} · ${p.done} checked in${p.streak > 1 ? ` · ${p.streak}-day streak` : ''}${p.todayDone ? ' · done today' : ''}`}
                  last={i === active.length - 1}
                  onPress={() => open(x.id)}
                />
              );
            })}
          </List>
        </View>
      )}

      <Card accent>
        <SectionLabel>Begin a challenge</SectionLabel>
        <Chips label="Begin a challenge">
          {THEMES.map((t) => (
            <Chip key={t.id} label={t.title} selected={theme === t.id} onPress={() => setTheme(t.id)} />
          ))}
        </Chips>
        <Body>{picked.about}</Body>
        <Body muted>{`You’ll need: ${picked.need}`}</Body>
        <Chips>
          {LENGTHS.map((n) => (
            <Chip key={n} label={`${n} days`} selected={length === n} onPress={() => setLength(n)} />
          ))}
        </Chips>
        <Body muted>{`Day one: ${picked.prompts[0]}`}</Body>
        <Button label={busy ? 'Beginning…' : 'Begin today'} onPress={() => void begin()} disabled={busy} />
      </Card>

      {past.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Finished</SectionLabel>
          <List>
            {past.map((x, i) => {
              const p = progressOf(x.c, now);
              return <Row key={x.id} icon="grimoire" title={challengeTitle(x.c)} detail={`${p.done} of ${x.c.length} days · best streak ${p.best}${x.c.finished ? ' · reflected' : ''}`} last={i === past.length - 1} onPress={() => open(x.id)} />;
            })}
          </List>
        </View>
      )}
      <List>
        <Row icon="wheel" title="A Year and a Day" detail="Thirteen moons of study and practice" onPress={() => router.push('/rituals/year' as Href)} />
        <Row icon="altar" title="Solitary practice" detail="Daily devotion, and workings for practising alone" last onPress={() => router.push('/rituals/craft/solitary' as Href)} />
      </List>
    </RitualScreen>
  );
}
