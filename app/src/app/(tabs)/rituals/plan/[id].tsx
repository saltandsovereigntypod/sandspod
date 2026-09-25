import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Connections } from '../../../../components/rituals/Connections';
import { Body, Card, RitualScreen, SectionLabel, Title, confirmAction, tell, ui } from '../../../../components/rituals/ui';
import { useGrimoire } from '../../../../lib/grimoire/store';
import {
  calendarMode,
  downloadPlan,
  openPlanInGoogle,
  removePlanWithCalendar,
  savePlanWithCalendar,
  useCalendar,
} from '../../../../lib/reminders/calendarStore';
import { remindersSupported } from '../../../../lib/reminders/notifier';
import { useReminders } from '../../../../lib/reminders/store';
import { planSky, planWhen } from '../../../../lib/rituals/format';
import { planTemplate } from '../../../../lib/rituals/plans';
import { savePlan, saveTemplate, startRitual, useRituals } from '../../../../lib/rituals/store';
import { useSession } from '../../../../lib/session';

function leadWords(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? 'an hour' : `${hours} hours`;
}

export default function PlanView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const rituals = useRituals();
  const reminders = useReminders();
  const calendar = useCalendar();
  const grimoire = useGrimoire();
  const [busy, setBusy] = useState(false);
  const plan = rituals.plans.find((p) => p.id === id) ?? null;

  if (!plan) {
    return (
      <RitualScreen back="Rituals">
        <Title>Plan</Title>
        <Body>This plan isn't on this phone any more.</Body>
      </RitualScreen>
    );
  }

  const template = planTemplate(plan, rituals.templates);
  const steps = template?.ritual_template_steps?.length ?? plan.draft?.steps.length ?? 0;
  const calendarName = calendar.calendars.find((c) => c.id === plan.calendarId)?.title ?? 'your calendar';

  const run = async (work: () => Promise<void>, failure: string) => {
    setBusy(true);
    try {
      await work();
    } catch (e) {
      tell(failure, e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const begin = () =>
    run(async () => {
      if (template) await startRitual({ kind: 'template', template });
      else if (plan.draft) await startRitual({ kind: 'draft', draft: plan.draft });
      else await startRitual({ kind: 'free', title: plan.title, intention: plan.intention ?? '' });
      // Done, not deleted: its calendar event stays as a record of the night.
      await savePlan({ ...plan, doneAt: new Date().toISOString() });
      router.replace('/rituals/run');
    }, "Couldn't begin");

  const keepAsTemplate = () =>
    run(async () => {
      if (!plan.draft) return;
      const saved = await saveTemplate(plan.draft);
      await savePlanWithCalendar({ ...plan, templateId: saved.id, draft: null });
      void grimoire.refresh();
      tell('Saved', 'The spell is now a template in your account and your Book of Shadows.');
    }, "Couldn't save");

  const setCalendar = (on: boolean) =>
    run(async () => {
      const outcome = await savePlanWithCalendar({ ...plan, addToCalendar: on });
      if (outcome === 'denied') tell('Calendar access is off', 'Allow calendar access in Settings to add plans to your calendar.');
      if (outcome === 'failed') tell("Couldn't add it to your calendar", 'Please try again.');
    }, "Couldn't change the calendar");

  const remove = async () => {
    const note = plan.calendarEventId ? 'Its reminder and calendar event are removed too.' : 'Its reminder is cancelled too.';
    if (!(await confirmAction('Remove this plan?', note, 'Remove'))) return;
    await removePlanWithCalendar(plan);
    router.replace('/rituals');
  };

  return (
    <RitualScreen back="Rituals">
      <Title eyebrow={planWhen(plan)}>{plan.title}</Title>
      <Body muted>{planSky(plan)}</Body>
      {!!plan.intention && <Body>{plan.intention}</Body>}

      <View style={ui.actions}>
        <Button label={busy ? 'One moment…' : 'Begin now'} disabled={busy || !!rituals.active} onPress={begin} />
        {!!rituals.active && <Body muted>Finish the ritual that's under way first.</Body>}
      </View>

      <Card>
        <SectionLabel>The ritual</SectionLabel>
        <Body>
          {template
            ? `${template.title} · ${steps} ${steps === 1 ? 'step' : 'steps'}`
            : plan.draft
              ? `${plan.draft.title} · a spell with ${steps} steps, kept on this phone`
              : 'Not chosen yet. Begin as a working of your own, or change the plan to pick a template.'}
        </Body>
        {!!plan.draft && session && <Button label="Keep this spell as a template" variant="outline" disabled={busy} onPress={keepAsTemplate} />}
        {!!plan.draft && !session && <Body muted>Sign in to keep this spell as a template in your account.</Body>}
      </Card>

      <Connections
        templateId={template?.id}
        templateTitle={template?.title}
        altarId={template?.linked_altar_id}
        altars={rituals.altars}
        date={plan.date}
        ingredients={plan.ingredients}
      />

      <Card>
        <SectionLabel>Reminder</SectionLabel>
        <Body muted>
          {!remindersSupported
            ? 'Reminders ring in the phone app; browsers can’t send them at a set time.'
            : reminders.settings.rituals
              ? `We'll remind you ${leadWords(reminders.settings.ritualLeadMinutes)} before.`
              : 'Ritual reminders are off.'}
        </Body>
        <Button label="Reminder settings" variant="text" onPress={() => router.push('/rituals/reminders')} />
      </Card>

      <Card>
        <SectionLabel>Calendar</SectionLabel>
        {calendarMode === 'device' ? (
          plan.calendarEventId ? (
            <>
              <Body muted>{`In ${calendarName}. Changing this plan updates the event.`}</Body>
              <Button label="Take it out of my calendar" variant="text" disabled={busy} onPress={() => setCalendar(false)} />
            </>
          ) : (
            <Button label="Add to my calendar" variant="outline" disabled={busy} onPress={() => setCalendar(true)} />
          )
        ) : (
          <>
            <Body muted>
              {calendarMode === 'file'
                ? 'Download it for Apple Calendar or Outlook, or open it in Google Calendar.'
                : 'This preview of the app can’t reach your calendar, so it opens Google Calendar instead.'}
            </Body>
            {calendarMode === 'file' && (
              <Button
                label="Download for my calendar (.ics)"
                variant="outline"
                onPress={() => {
                  if (!downloadPlan(plan)) tell("Couldn't download", 'Try opening it in Google Calendar instead.');
                }}
              />
            )}
            <Button label="Add to Google Calendar" variant="outline" onPress={() => void openPlanInGoogle(plan)} />
          </>
        )}
      </Card>

      <View style={ui.actions}>
        <Button
          label="Change the night or time"
          variant="outline"
          onPress={() => router.push({ pathname: '/rituals/planner', params: { planId: plan.id } })}
        />
        <Button label="Remove plan" variant="text" onPress={remove} />
      </View>
    </RitualScreen>
  );
}
