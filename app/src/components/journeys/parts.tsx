// Pieces shared by the dedication journey screens: where each screen lives,
// the next-step card, a quiet progress bar, paragraphs, and a reflection
// prompt that can be kept in the ritual journal.

import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Body, Card, Field, tell, ui } from '../rituals/ui';
import { shortDate } from '../../lib/calendar';
import type { Journey, StageKind } from '../../lib/journeys';
import { nextStepLine, type NextStep } from '../../lib/journeys/progress';
import { blankAnswers } from '../../lib/rituals/lifecycle';
import { saveJournal } from '../../lib/rituals/store';
import { colors, fonts, radius, type } from '../../theme';

export const journeyHref = (id: string): Href => ({ pathname: '/rituals/journeys/[id]', params: { id } }) as Href;
export const stageHref = (journeyId: string, stage: number): Href =>
  ({ pathname: '/rituals/journeys/stage/[journeyId]/[stage]', params: { journeyId, stage: String(stage) } }) as Href;
export const lessonHref = (journeyId: string, lessonId: string): Href =>
  ({ pathname: '/rituals/journeys/lesson/[journeyId]/[lessonId]', params: { journeyId, lessonId } }) as Href;
export const practiceHref = (journeyId: string, practiceId: string): Href =>
  ({ pathname: '/rituals/journeys/practice/[journeyId]/[practiceId]', params: { journeyId, practiceId } }) as Href;
export const riteHref = (journeyId: string, stage: number): Href =>
  ({ pathname: '/rituals/journeys/rite/[journeyId]/[stage]', params: { journeyId, stage: String(stage) } }) as Href;
export const discernHref = (journeyId: string): Href => ({ pathname: '/rituals/journeys/discern/[journeyId]', params: { journeyId } }) as Href;
export const ongoingHref = (journeyId: string): Href => ({ pathname: '/rituals/journeys/ongoing/[journeyId]', params: { journeyId } }) as Href;

export const STAGE_WORDS: Record<StageKind, string> = {
  threshold: 'Threshold',
  study: 'Study',
  practice: 'Practice',
  discernment: 'Discernment',
  dedication: 'Dedication',
  ongoing: 'The year after',
};

/** "about 3 days", "about 2 weeks", "a year". */
export function lengthWords(days: number): string {
  if (days >= 360) return 'a year';
  if (days >= 14 && days % 7 === 0) return `about ${days / 7} weeks`;
  if (days === 1) return 'a day';
  return `about ${days} days`;
}

export const stageIndexOf = (journey: Journey, kind: StageKind) => journey.stages.findIndex((s) => s.kind === kind);

/** Where a next step leads. */
export function stepHref(journey: Journey, step: NextStep): Href | null {
  switch (step.kind) {
    case 'lesson':
      return lessonHref(journey.id, step.lesson.id);
    case 'practice':
      return practiceHref(journey.id, step.practice.id);
    case 'rite':
      return riteHref(journey.id, stageIndexOf(journey, step.stage.kind));
    case 'discern':
      return discernHref(journey.id);
    case 'rededicate':
      return ongoingHref(journey.id);
    case 'advance':
    case 'waiting':
      return stageHref(journey.id, stageIndexOf(journey, step.stage.kind));
    default:
      return journeyHref(journey.id);
  }
}

const STEP_ACTION: Record<NextStep['kind'], string> = {
  paused: 'Open the journey',
  stopped: 'Open the journey',
  lesson: 'Read it',
  practice: 'Do it today',
  rite: 'See the rite',
  discern: 'Sit with the questions',
  rededicate: 'Rededicate',
  advance: 'See what’s next',
  waiting: 'Open this stage',
};

/** Today's next step, with a way to go to it. */
export function StepCard({ journey, step }: { journey: Journey; step: NextStep }) {
  const href = stepHref(journey, step);
  const detail =
    step.kind === 'lesson'
      ? `${step.lesson.summary}${step.lesson.minutes ? ` · about ${step.lesson.minutes} min` : ''}`
      : step.kind === 'practice'
        ? `${step.state.count} of ${step.state.times} done${step.practice.every ? ` · ${everyWords(step.practice.every)}` : ''}`
        : step.kind === 'rite'
          ? `${step.rite.summary} · about ${step.rite.minutes} min`
          : step.kind === 'waiting'
            ? 'Nothing is asked of you today. Rest is part of it.'
            : step.kind === 'paused'
              ? `Paused since ${shortDate(step.since)}. It waits for you, as long as you like.`
              : null;
  return (
    <Card accent>
      <Text style={[type.eyebrow, ui.gold]}>Today</Text>
      <Text style={type.cardTitle}>{nextStepLine(step)}</Text>
      {!!detail && <Body muted>{detail}</Body>}
      {href && <Button label={STEP_ACTION[step.kind]} onPress={() => router.push(href)} />}
    </Card>
  );
}

export function everyWords(every: string | undefined): string {
  switch (every) {
    case 'day':
      return 'once a day';
    case 'week':
      return 'once a week';
    case 'month':
      return 'once a month';
    case 'esbat':
      return 'at the full moon';
    case 'sabbat':
      return 'at the sabbats';
    case 'holy-day':
      return 'on the holy days';
    default:
      return 'when you choose';
  }
}

export function ProgressBar({ fraction, label }: { fraction: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, fraction)) * 100);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

/** Paragraphs separated by blank lines. */
export function Paragraphs({ text }: { text: string }) {
  const parts = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <View style={ui.gap}>
      {parts.map((p, i) => (
        <Text key={i} style={styles.reading}>
          {p}
        </Text>
      ))}
    </View>
  );
}

/**
 * A question to sit with. "Write in my journal" opens a space to write;
 * saving keeps it in the ritual journal, titled for the journey.
 */
export function JournalPrompt({ prompt, title, intention }: { prompt: string; title: string; intention?: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const save = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const answers = { ...blankAnswers(null, new Date()), title, intention: intention ?? prompt, notes: `${prompt}\n\n${text.trim()}` };
      const entry = await saveJournal({ session: null, answers });
      setSaved(entry.id);
      setText('');
      setOpen(false);
    } catch (e) {
      tell("Couldn't save to your journal", e instanceof Error ? e.message : 'Your words are still here; please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.prompt}>
      <Text style={styles.question}>{prompt}</Text>
      {open ? (
        <>
          <Field label="Your reflection" value={text} onChange={setText} placeholder="Whatever comes. No one else reads this." multiline />
          <View style={ui.actions}>
            <Button label={saving ? 'Saving…' : 'Save to my journal'} disabled={saving || !text.trim()} onPress={save} />
            <Button label="Not now" variant="text" onPress={() => setOpen(false)} />
          </View>
        </>
      ) : saved ? (
        <Button
          label="Kept in your journal · open it"
          variant="text"
          onPress={() => router.push({ pathname: '/rituals/journal/[id]', params: { id: saved } })}
        />
      ) : (
        <Button label="Write in my journal" variant="text" accessibilityHint={`Opens a space to write about: ${prompt}`} onPress={() => setOpen(true)} />
      )}
    </View>
  );
}

export const journeyStyles = StyleSheet.create({
  reading: { fontFamily: fonts.body, fontSize: 17, lineHeight: 27, color: colors.cream },
  heading: { fontFamily: fonts.display, fontSize: 25, lineHeight: 29, color: colors.cream },
  link: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.gold, textDecorationLine: 'underline' },
  bullet: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchment },
});

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: radius.chip, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  fill: { height: 6, borderRadius: radius.chip, backgroundColor: colors.gold },
  reading: journeyStyles.reading,
  prompt: { gap: 6, paddingVertical: 4 },
  question: { fontFamily: fonts.displayItalic, fontSize: 20, lineHeight: 26, color: colors.parchment },
});
