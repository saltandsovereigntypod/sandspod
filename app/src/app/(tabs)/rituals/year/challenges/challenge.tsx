import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Field, List, RitualScreen, Row, SectionLabel, Title, confirmAction, ui } from '../../../../../components/rituals/ui';
import { fullDate } from '../../../../../lib/calendar';
import { removeEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';
import { dateFromKey, localDateKey } from '../../../../../lib/rituals/lifecycle';
import {
  CHALLENGES,
  challengeTitle,
  checkIn,
  TOOL_THEMES,
  withToolDays,
  dateOfDay,
  FINISH_QUESTIONS,
  normalizeChallenge,
  progressOf,
  promptOn,
  promptsFor,
  readyToFinish,
  themeById,
  uncheck,
} from '../../../../../lib/yearday/challenges';
import { colors, fonts, type } from '../../../../../theme';
import { useToolDays } from '../../../../../lib/yearday/useToolDays';

export default function ChallengePage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const raw = useCraft<unknown>(CHALLENGES);
  const entry = raw.entries.find((e) => e.id === id) ?? null;
  const saved = useMemo(() => (entry ? normalizeChallenge(entry.data) : null), [entry]);
  // A theme that is a tool counts that tool's own record of the day; only hand check-ins are saved here.
  const toolDays = useToolDays(saved?.theme);
  const c = useMemo(() => (saved ? withToolDays(saved, toolDays) : null), [saved, toolDays]);
  const now = useMemo(() => new Date(), []);
  const [pick, setPick] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [reflection, setReflection] = useState<string | null>(null);
  if (!entry || !c) {
    return (
      <RitualScreen back="Challenges">
        <Title>A challenge</Title>
        <Body>{raw.ready ? 'This page couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const theme = themeById(c.theme)!;
  const prompts = promptsFor(theme, c.length);
  const p = progressOf(c, now);
  const today = Math.min(Math.max(p.day, 1), c.length);
  const day = pick ?? today;
  const date = dateFromKey(dateOfDay(c, day))!;
  const existing = c.checkins[String(day)];
  const future = day > p.day;
  const save = (next: typeof c) => void updateEntry(CHALLENGES, entry.id, next);
  const base = saved!;
  const tool = TOOL_THEMES[c.theme];

  return (
    <RitualScreen back="Challenges">
      <Title eyebrow={`Day ${today} of ${c.length}`}>{challengeTitle(c)}</Title>
      <Body muted>{`${p.done} checked in · streak ${p.streak} · best ${p.best}`}</Body>

      <View style={styles.grid} accessibilityRole="tablist">
        {prompts.map((_, i) => {
          const n = i + 1;
          const done = !!c.checkins[String(n)];
          return (
            <Pressable
              key={n}
              accessibilityRole="tab"
              accessibilityState={{ selected: n === day }}
              accessibilityLabel={`Day ${n}${done ? ', checked in' : ''}`}
              onPress={() => {
                setPick(n);
                setNote(null);
              }}
              style={[styles.cell, done && styles.done, n === day && styles.current]}
            >
              <Text style={[styles.cellText, done && styles.doneText]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>

      <Card accent>
        <SectionLabel>{`Day ${day} · ${fullDate(localDateKey(date))}`}</SectionLabel>
        <Text style={type.cardTitle}>{promptOn(prompts[day - 1], date)}</Text>
        {future ? (
          <Body muted>This day hasn’t come yet.</Body>
        ) : existing?.from ? (
          <Body muted>{`Done: counted from ${existing.from} on this day.`}</Body>
        ) : tool ? (
          <>
            <Body muted>{`This day is counted when you keep ${tool.what}; nothing to write twice.`}</Body>
            <View style={ui.actions}>
              <Button label={tool.label} onPress={() => router.push((c.theme === 'moon' ? { pathname: tool.app, params: { date: localDateKey(date) } } : tool.app) as Href)} />
            </View>
            {!!existing && <Button label="Undo this check-in" variant="text" onPress={() => save(uncheck(base, day))} />}
          </>
        ) : (
          <>
            <Field label="Your check-in" value={note ?? existing?.note ?? ''} onChange={setNote} multiline placeholder="A line or two: what you did, what you noticed" />
            <View style={ui.actions}>
              <Button
                label={existing ? 'Update' : 'Check in'}
                onPress={() => {
                  save(checkIn(base, day, (note ?? existing?.note ?? '').trim(), localDateKey(new Date())));
                  setNote(null);
                }}
              />
              {!!existing && <Button label="Undo" variant="text" onPress={() => save(uncheck(base, day))} />}
            </View>
          </>
        )}
      </Card>

      {(readyToFinish(c, now) || c.finished) && (
        <Card>
          <SectionLabel>{c.finished ? 'Your reflection' : 'The finish'}</SectionLabel>
          {!c.finished && FINISH_QUESTIONS.map((q) => <Body key={q} muted>{q}</Body>)}
          <Field label="Reflection" value={reflection ?? c.reflection} onChange={setReflection} multiline />
          <Button
            label={c.finished ? 'Save' : 'Finish the challenge'}
            onPress={() => {
              save({ ...base, reflection: (reflection ?? c.reflection).trim(), finished: c.finished || localDateKey(new Date()) });
              setReflection(null);
            }}
          />
          {!!c.finished && <Body muted>{`Finished ${fullDate(c.finished)}.`}</Body>}
        </Card>
      )}

      <List>
        {theme.links.map((l, i) => (
          <Row key={l.app} icon="wheel" title={l.label} last={i === theme.links.length - 1} onPress={() => router.push(l.app as Href)} />
        ))}
      </List>
      <Button
        label="Delete this challenge"
        variant="text"
        onPress={async () => {
          if (!(await confirmAction('Delete this challenge?', 'Its check-ins will be deleted on every device.', 'Delete'))) return;
          await removeEntry(CHALLENGES, entry.id);
          router.replace('/rituals/year/challenges' as Href);
        }}
      />
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.hairline, alignItems: 'center', justifyContent: 'center' },
  done: { backgroundColor: colors.gold, borderColor: colors.gold },
  current: { borderColor: colors.gold, borderWidth: 2 },
  cellText: { fontFamily: fonts.bodySemi, color: colors.cream },
  doneText: { color: colors.forestInk },
});
