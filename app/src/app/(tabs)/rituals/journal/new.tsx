import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Card, Chip, Chips, Expander, Field, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { fullDate } from '../../../../lib/calendar';
import { moonState, type PhaseName } from '../../../../lib/moon';
import { answersFromJournal, blankAnswers, dateFromKey, formatClock, localDateKey, sessionElapsed } from '../../../../lib/rituals/lifecycle';
import { findSession, saveJournal, useRituals } from '../../../../lib/rituals/store';
import type { JournalAnswers, RitualSession } from '../../../../lib/rituals/types';
import { useSession } from '../../../../lib/session';

const PHASES: PhaseName[] = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];

export default function JournalForm() {
  const { sessionId, id } = useLocalSearchParams<{ sessionId?: string; id?: string }>();
  const { session: account } = useSession();
  const rituals = useRituals();
  const existing = id ? rituals.journal.find((j) => j.id === id) ?? null : null;

  const [ritual, setRitual] = useState<RitualSession | null>(null);
  const [answers, setAnswers] = useState<JournalAnswers>(() => (existing ? answersFromJournal(existing) : blankAnswers(null, new Date())));
  const [ready, setReady] = useState(!sessionId);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let live = true;
    findSession(sessionId).then((found) => {
      if (!live) return;
      setRitual(found);
      if (found) setAnswers(blankAnswers(found, new Date()));
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, [sessionId]);

  useEffect(() => {
    // Only when the entry first arrives, so typing is never overwritten.
    if (existing && !sessionId) setAnswers(answersFromJournal(existing));
  }, [existing?.id]);

  const set = (patch: Partial<JournalAnswers>) => setAnswers((a) => ({ ...a, ...patch }));
  const handRecorded = !ritual && !existing?.session_id;
  const now = new Date();

  const save = async () => {
    if (!answers.title.trim() && !ritual) {
      setProblem('Name your ritual first.');
      return;
    }
    setSaving(true);
    setProblem(null);
    try {
      const entry = await saveJournal({ session: ritual, answers, existingId: existing?.id ?? null });
      router.replace({ pathname: '/rituals/journal/[id]', params: { id: entry.id } });
    } catch (e) {
      setProblem(
        `Your journal couldn't be saved${e instanceof Error ? ` (${e.message})` : ''}. Your reflection is still here so you can try again.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const recentDays = Array.from({ length: 7 }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
  const steps = ritual?.session_steps ?? [];
  const done = steps.filter((s) => s.status === 'completed').length;
  const skipped = steps.filter((s) => s.status === 'skipped').length;

  return (
    <RitualScreen back={ritual ? 'Rituals' : existing ? existing.title : 'Rituals'}>
      <Title eyebrow={ritual ? 'Ritual complete' : existing ? 'Edit journal entry' : 'Record a ritual'}>Record what remains</Title>

      {!ready ? (
        <Body>Gathering the ritual…</Body>
      ) : (
        <>
          {ritual && (
            <Card>
              <SectionLabel>The facts are already held</SectionLabel>
              <Body>
                {[
                  fullDate(ritual.started_at),
                  ritual.context_snapshot?.dayOfWeek as string,
                  ritual.context_snapshot?.timeOfDay as string,
                  formatClock(sessionElapsed(ritual, now)),
                  steps.length ? `${done} of ${steps.length} steps${skipped ? `, ${skipped} skipped` : ''}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Body>
            </Card>
          )}

          <View style={ui.gap}>
            <SectionLabel>The threshold</SectionLabel>
            <Field label="Ritual name" value={answers.title} onChange={(title) => set({ title })} placeholder="Untitled Ritual" />
            <Field
              label="Intention"
              value={answers.intention}
              onChange={(intention) => set({ intention })}
              placeholder="What were you tending, honoring, releasing, or inviting?"
              multiline
            />
            {handRecorded && (
              <View style={ui.gapSmall}>
                <Body muted>When was it?</Body>
                <Chips>
                  {recentDays.map((day, i) => {
                    const key = localDateKey(day);
                    return (
                      <Chip
                        key={key}
                        label={i === 0 ? 'Today' : i === 1 ? 'Yesterday' : fullDate(day)?.replace(/, \d{4}$/, '') ?? key}
                        selected={answers.ritual_date === key}
                        onPress={() => set({ ritual_date: key, moon_phase: moonState(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 21)).name })}
                      />
                    );
                  })}
                  {!recentDays.some((d) => localDateKey(d) === answers.ritual_date) && dateFromKey(answers.ritual_date) && (
                    <Chip label={fullDate(answers.ritual_date) ?? answers.ritual_date} selected onPress={() => undefined} />
                  )}
                </Chips>
                <Field
                  label="About how many minutes?"
                  value={answers.manual_minutes}
                  onChange={(manual_minutes) => set({ manual_minutes })}
                  placeholder="Optional"
                  keyboardType="numeric"
                />
              </View>
            )}
            <View style={ui.gapSmall}>
              <Body muted>Moon phase</Body>
              <Chips>
                {PHASES.map((phase) => (
                  <Chip key={phase} label={phase} selected={answers.moon_phase === phase} onPress={() => set({ moon_phase: answers.moon_phase === phase ? '' : phase })} />
                ))}
              </Chips>
            </View>
          </View>

          <Expander title="Before and during" initiallyOpen>
            <Field label="How did you feel before beginning?" value={answers.feelings_before} onChange={(v) => set({ feelings_before: v })} multiline />
            <Field label="What happened during the ritual?" value={answers.what_happened_during} onChange={(v) => set({ what_happened_during: v })} multiline />
            <Field label="What did you feel while it was happening?" value={answers.feelings_during} onChange={(v) => set({ feelings_during: v })} multiline />
            <Field
              label="What stood out?"
              value={answers.signs_and_symbols}
              onChange={(v) => set({ signs_and_symbols: v })}
              placeholder="Signs, sensations, messages, symbols, unexpected moments…"
              multiline
            />
          </Expander>

          <Expander title="After the flame">
            <Field label="What happened afterward?" value={answers.what_happened_after} onChange={(v) => set({ what_happened_after: v })} multiline />
            <Field label="How do you feel now?" value={answers.feelings_after} onChange={(v) => set({ feelings_after: v })} multiline />
            <Field label="Dreams, synchronicities, or follow-up signs" value={answers.dreams_and_follow_up} onChange={(v) => set({ dreams_and_follow_up: v })} multiline />
            <Field label="Results or changes you are watching for" value={answers.results} onChange={(v) => set({ results: v })} multiline />
            <Field label="What would you change next time?" value={answers.changes_for_next_time} onChange={(v) => set({ changes_for_next_time: v })} multiline />
            <Field label="Private notes" value={answers.notes} onChange={(v) => set({ notes: v })} multiline />
          </Expander>

          {!!problem && <Notice>{problem}</Notice>}
          {!account && <Body muted>Saved on this phone. Sign in to keep your journal with your account.</Body>}
          <View style={ui.actions}>
            <Button label={saving ? 'Preserving this ritual…' : 'Save to my journal'} disabled={saving} onPress={save} />
            {ritual && <Button label="Finish without journaling" variant="text" onPress={() => router.replace('/rituals')} />}
          </View>
        </>
      )}
    </RitualScreen>
  );
}
