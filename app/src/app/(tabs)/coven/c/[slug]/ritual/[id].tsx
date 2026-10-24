import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { CovenAltarView, Pill, Pills, Spoken, Words } from '../../../../../../components/covens/ui';
import { Card, Chips, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import {
  altarActionButton,
  altarActionNote,
  errorMessage,
  occasionLabel,
  orderSteps,
  riteTime,
  rsvpSummary,
  stepAssignee,
  stepIsMine,
  type Rsvp,
} from '../../../../../../lib/covens/model';
import { syncCovenReminders } from '../../../../../../lib/covens/reminders';
import { colors, radius, type } from '../../../../../../theme';

const ANSWERS = [
  { value: 'going', label: 'Going' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'not_going', label: 'Can’t make it' },
] as const;

// One rite: when it is and who's coming, its steps and who each belongs to,
// and, while it's under way, the step in progress. When the step is yours
// you do your part (and anything it asks of the shared altar) and finish it;
// those who lead rituals start it, step back or ahead, and end it.
export default function RitualScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const coven = useCoven();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const ritual = coven.rituals.find((r) => r.id === id);
  const steps = orderSteps(coven.steps, id);
  const live = ritual?.status === 'live';
  const current = steps.find((s) => s.id === ritual?.current_step_id);
  const membership = coven.snapshot?.membership ?? null;
  const mine = stepIsMine(current, membership, coven.userId) && coven.standing.ok;
  const canLead = (coven.perms.lead && coven.standing.ok) || coven.perms.site;
  const { loadMarks, loadAltar, track } = coven;

  useEffect(() => {
    if (!live || !id) return;
    void loadMarks(id);
    void loadAltar().catch(() => {});
    track('ritual');
    return () => track('coven');
  }, [live, id, loadMarks, loadAltar, track]);

  const act = async (work: () => Promise<unknown>, after?: () => Promise<unknown>) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      await coven.refreshRituals();
      await after?.();
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  if (!ritual) {
    return (
      <CovenScreen title="Ritual" onRefresh={coven.refreshRituals}>
        <Text style={type.body}>{coven.rituals.length ? 'This ritual couldn’t be found. It may have been removed.' : 'Loading…'}</Text>
      </CovenScreen>
    );
  }

  const answers = rsvpSummary(coven.rsvps, ritual.id, coven.userId);
  const answer = async (response: Rsvp['response']) => {
    const next = response === answers.mine ? null : response;
    await act(
      () => api.rsvp(ritual.id, next),
      async () => {
        if (next === 'going' || next === 'maybe') {
          const set = await syncCovenReminders(coven.userId, { ask: true });
          setMessage(set ? 'We’ll remind you the day before and an hour before.' : 'Saved. Turn on notifications to get reminders.');
        } else void syncCovenReminders(coven.userId);
      },
    );
  };

  const doneOnAltar = !!current && coven.marks.some((m) => m.step_id === current.id && m.user_id === coven.userId);
  const sharedAction = current?.altar_action === 'light_candle' || current?.altar_action === 'place_item';
  const showAltarButton = !!current?.altar_action && mine && !(sharedAction && doneOnAltar);
  const at = current ? steps.indexOf(current) : -1;
  const confirmEnd = () =>
    Alert.alert('End the ritual now?', 'Steps not yet reached are left undone.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'End it', style: 'destructive', onPress: () => void act(() => api.goToStep(ritual.id, null)) },
    ]);

  return (
    <CovenScreen title={ritual.title} onRefresh={coven.refreshRituals}>
      <Pills>
        <Pill label={live ? 'Under way' : ritual.status === 'scheduled' ? 'On the calendar' : ritual.status === 'done' ? 'Done' : ritual.status === 'cancelled' ? 'Cancelled' : 'Draft'} tone={live ? 'gold' : undefined} />
        {!!occasionLabel(ritual) && <Pill label={occasionLabel(ritual)} />}
      </Pills>
      {!!ritual.scheduled_for && <Text style={type.caption}>{riteTime(ritual.scheduled_for)}</Text>}
      {!!ritual.intention && <Text style={type.body}>Intention: {ritual.intention}</Text>}
      <Words text={ritual.description} />

      {ritual.status === 'scheduled' && (
        <Section label="Will you be there?">
          {coven.perms.member && coven.standing.ok && <Chips label="Your answer" options={ANSWERS} value={(answers.mine ?? '') as Rsvp['response']} onChange={(v) => void answer(v)} />}
          <Text style={type.caption}>
            {[`${answers.going.length} going`, answers.maybe.length ? `${answers.maybe.length} maybe` : '', answers.notGoing.length ? `${answers.notGoing.length} can’t make it` : ''].filter(Boolean).join(' · ')}
          </Text>
          {answers.going.length > 0 && <Text style={type.caption}>Going: {answers.going.map((r) => coven.nameOf(r.user_id)).join(', ')}</Text>}
        </Section>
      )}

      {live && current && (
        <Card tone="gold">
          <Text style={type.eyebrow}>
            Step {at + 1} of {steps.length}
            {mine ? ' · Your turn' : ` · ${stepAssignee(current, coven.snapshot?.ranks ?? [], coven.nameOf).label}`}
          </Text>
          <Text style={type.cardTitle}>{current.title}</Text>
          <Words text={current.instructions} />
          {!!current.spoken_text && <Spoken text={current.spoken_text} />}
          {!!current.duration_minutes && <Text style={type.caption}>About {current.duration_minutes} min</Text>}
          {!!current.altar_action && <Text style={type.caption}>{altarActionNote(current)}</Text>}
          {showAltarButton && <Button label={altarActionButton(current)} onPress={() => void act(() => api.performStepAction(current.id), () => Promise.all([loadMarks(ritual.id), loadAltar()]))} disabled={busy} />}
          {sharedAction && doneOnAltar && <Text style={type.caption}>You’ve done this on the altar.</Text>}
          {(mine || canLead) && (
            <Button
              label={`${mine ? 'I’ve finished this step' : 'Finish this step'}${at === steps.length - 1 ? ' and close the ritual' : ''}`}
              variant={showAltarButton ? 'outline' : 'primary'}
              onPress={() => void act(() => api.finishStep(current.id))}
              disabled={busy}
            />
          )}
          {!mine && !canLead && <Text style={type.caption}>Follow along; the ritual moves on when this step is finished.</Text>}
        </Card>
      )}
      {live && !current && <Notice>The ritual is under way.</Notice>}

      {live && coven.altar && (current?.altar_action || coven.altar.length > 0) && (
        <Section label="The shared altar">
          <CovenAltarView items={coven.altar} background={coven.snapshot?.coven.altar_background ?? null} />
        </Section>
      )}

      {canLead && (live || ritual.status === 'scheduled' || ritual.status === 'draft') && (
        <View style={styles.lead}>
          {!live && <Button label="Start the ritual" onPress={() => void act(() => api.startRitual(ritual.id))} disabled={busy || !steps.length} />}
          {live && at > 0 && <Button label="Back a step" variant="outline" onPress={() => void act(() => api.goToStep(ritual.id, steps[at - 1].id))} disabled={busy} />}
          {live && at >= 0 && at < steps.length - 1 && <Button label="Skip to the next step" variant="outline" onPress={() => void act(() => api.goToStep(ritual.id, steps[at + 1].id))} disabled={busy} />}
          {live && <Button label="End the ritual" variant="text" onPress={confirmEnd} disabled={busy} />}
        </View>
      )}
      {message && <Notice>{message}</Notice>}

      <Section label="Steps">
        {!steps.length && <Text style={type.caption}>This ritual has no steps yet.</Text>}
        {steps.map((step, index) => {
          const who = stepAssignee(step, coven.snapshot?.ranks ?? [], coven.nameOf);
          const yours = stepIsMine(step, membership, coven.userId);
          const now = step.id === current?.id;
          return (
            <View key={step.id} style={[styles.step, now && styles.stepNow]} accessibilityLabel={`Step ${index + 1}: ${step.title}. ${who.label}.${step.completed_at ? ' Done.' : ''}${now ? ' In progress.' : ''}`}>
              <Text style={type.body}>
                {index + 1}. {step.title}
                {step.completed_at ? ' ✓' : ''}
              </Text>
              <Text style={type.caption}>
                {who.label}
                {yours && who.kind !== 'everyone' ? ' · yours' : ''}
                {step.altar_action ? ` · ${altarActionButton(step).toLowerCase()}` : ''}
              </Text>
            </View>
          );
        })}
      </Section>
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  lead: { gap: 10 },
  step: { gap: 2, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  stepNow: { borderColor: colors.gold },
});
