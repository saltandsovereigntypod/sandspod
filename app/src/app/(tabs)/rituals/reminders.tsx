import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, View } from 'react-native';

import { Button } from '../../../components/Button';
import { EventStyleSheet } from '../../../components/rituals/EventStyleSheet';
import { TimeStepper } from '../../../components/rituals/TimeStepper';
import { Body, Card, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, tell, ui } from '../../../components/rituals/ui';
import { calendarMode, chooseCalendar, downloadSky, setEventStyle, setSkyChoices, useCalendar } from '../../../lib/reminders/calendarStore';
import type { SkyKind } from '../../../lib/reminders/calendarEvent';
import { PRINCIPAL_NAMES, nextPhase, type PrincipalPhase } from '../../../lib/moon';
import { dayLabel } from '../../../lib/rituals/format';
import { remindersSupported } from '../../../lib/reminders/notifier';
import { DAYS_AHEAD_CHOICES, LEAD_CHOICES, NOTE_MAX, PHASE_ORDER } from '../../../lib/reminders/schedule';
import { updateReminderSettings, useReminders } from '../../../lib/reminders/store';

const NOTE_EXAMPLES: Record<PrincipalPhase, string> = {
  new: 'e.g. Write your intentions',
  firstQuarter: 'e.g. Check in on your intention',
  full: 'e.g. Charge your crystals in the moonlight',
  lastQuarter: 'e.g. Clear out what you’re done with',
};

/** A phase's own words, saved a moment after typing stops. */
function PhaseNote({ phase, value }: { phase: PrincipalPhase; value: string }) {
  const [text, setText] = useState(value);
  const notes = useReminders().settings.notes;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <Field
      label={`Your note for the ${PRINCIPAL_NAMES[phase]}`}
      value={text}
      placeholder={NOTE_EXAMPLES[phase]}
      onChange={(next) => {
        const clipped = next.slice(0, NOTE_MAX);
        setText(clipped);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void updateReminderSettings({ notes: { ...notes, [phase]: clipped } }), 700);
      }}
    />
  );
}

const LEAD_LABELS: Record<number, string> = { 15: '15 minutes before', 60: 'An hour before', 180: 'Three hours before' };

// Moon reminder settings. Linked from the Rituals tab and Today; More can link
// here too (route: /rituals/reminders).
export default function Reminders() {
  const { settings, permission, scheduled, loaded } = useReminders();
  const calendar = useCalendar();
  const now = new Date();
  const [styling, setStyling] = useState<SkyKind | null>(null);
  const anyPhase = PHASE_ORDER.some((phase) => settings.phases[phase]);
  const toggleAhead = (days: number) =>
    void updateReminderSettings({
      daysAhead: settings.daysAhead.includes(days) ? settings.daysAhead.filter((d) => d !== days) : [...settings.daysAhead, days],
    });

  const setCalendarChoice = async (change: { phases?: boolean; sabbats?: boolean; astro?: boolean }) => {
    const result = await setSkyChoices(change, settings.phases);
    if (result === 'denied') tell('Calendar access is off', 'Allow calendar access in Settings to add events to your calendar.');
  };

  return (
    <RitualScreen back="Back">
      <Title eyebrow="Kept on this phone">Moon reminders</Title>
      <Body muted>No account needed. Choose the phases you want to hear about, and we'll remind you before planned rituals.</Body>

      {!remindersSupported && (
        <Card accent>
          <Body>
            {Platform.OS === 'web'
              ? 'Reminders arrive in the Salt & Sovereignty phone app. Browsers can’t send them at a set time, so your choices are saved here but nothing will ring in this tab.'
              : 'Reminders aren’t available on this device.'}
          </Body>
        </Card>
      )}

      {remindersSupported && permission === 'denied' && (
        <Card accent>
          <Body>Notifications are turned off for this app. Turn them on in Settings to receive reminders.</Body>
          <Button label="Open Settings" variant="outline" onPress={() => Linking.openSettings()} />
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Moon phases</SectionLabel>
        <Card>
          {PHASE_ORDER.map((phase) => (
            <View key={phase} style={ui.gapSmall}>
              <Toggle
                label={PRINCIPAL_NAMES[phase]}
                detail={`Next: ${dayLabel(nextPhase(now, phase), now)}`}
                value={settings.phases[phase]}
                onChange={(on) => void updateReminderSettings({ phases: { ...settings.phases, [phase]: on } })}
              />
              {settings.phases[phase] && loaded && <PhaseNote phase={phase} value={settings.notes[phase]} />}
            </View>
          ))}
        </Card>
      </View>

      {anyPhase && (
        <>
          <View style={ui.gapSmall}>
            <SectionLabel>Also remind me</SectionLabel>
            <Body muted>You’ll always hear on the day itself. Add earlier heads-ups if you’d like time to prepare.</Body>
            <Chips>
              <Chip
                label="The day before"
                selected={settings.dayBefore}
                onPress={() => void updateReminderSettings({ dayBefore: !settings.dayBefore })}
              />
              {DAYS_AHEAD_CHOICES.map((days) => (
                <Chip
                  key={days}
                  label={days === 7 ? 'A week before' : `${days} days before`}
                  selected={settings.daysAhead.includes(days)}
                  onPress={() => toggleAhead(days)}
                />
              ))}
              <Chip
                label="At the exact moment"
                selected={settings.atExact}
                onPress={() => void updateReminderSettings({ atExact: !settings.atExact })}
              />
            </Chips>
          </View>

          <View style={ui.gapSmall}>
            <SectionLabel>At</SectionLabel>
            <TimeStepper
              minutes={settings.phaseHour * 60 + settings.phaseMinute}
              onChange={(minutes) => void updateReminderSettings({ phaseHour: Math.floor(minutes / 60), phaseMinute: minutes % 60 })}
            />
            <Body muted>Every reminder but the exact-moment one arrives at this time.</Body>
          </View>
        </>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Planned rituals</SectionLabel>
        <Card>
          <Toggle
            label="Remind me before a planned ritual"
            value={settings.rituals}
            onChange={(rituals) => void updateReminderSettings({ rituals })}
          />
          {settings.rituals && (
            <Chips>
              {LEAD_CHOICES.map((minutes) => (
                <Chip
                  key={minutes}
                  label={LEAD_LABELS[minutes]}
                  selected={settings.ritualLeadMinutes === minutes}
                  onPress={() => void updateReminderSettings({ ritualLeadMinutes: minutes })}
                />
              ))}
            </Chips>
          )}
          <Toggle
            label="Ask “Did it work?” on look-back days"
            detail="On the day you chose to look back on a ritual or spell, at the time set for moon reminders"
            value={settings.lookBacks}
            onChange={(lookBacks) => void updateReminderSettings({ lookBacks })}
          />
        </Card>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Altar offerings</SectionLabel>
        <Card>
          <Toggle
            label="Remind me when an offering wants tending"
            detail="Water drying, flowers wilting, bread going stale"
            value={settings.offerings}
            onChange={(offerings) => void updateReminderSettings({ offerings })}
          />
          {settings.offerings && (
            <>
              <TimeStepper minutes={settings.offeringsAt} onChange={(offeringsAt) => void updateReminderSettings({ offeringsAt })} />
              <Body muted>One gentle note on a day something on your altars goes over, at this time. Offerings you’ve chosen to leave as they are won’t ask.</Body>
            </>
          )}
        </Card>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Your calendar</SectionLabel>
        <Card>
          <Body muted>Optional. Planned rituals can be added one by one from their plan.</Body>
          {calendarMode === 'device' ? (
            <>
              <Toggle
                label="Moon phases you chose above"
                detail="For the next six months"
                value={calendar.phases}
                onChange={(on) => void setCalendarChoice({ phases: on })}
              />
              {calendar.phases && <Chip label="Event settings ›" onPress={() => setStyling('moon')} a11yLabel="Moon phase event settings" />}
              <Toggle
                label="Holidays"
                detail="From your calendars in Settings → Calendar & holidays, for the next twelve months"
                value={calendar.sabbats}
                onChange={(on) => void setCalendarChoice({ sabbats: on })}
              />
              {calendar.sabbats && <Chip label="Event settings ›" onPress={() => setStyling('holiday')} a11yLabel="Holiday event settings" />}
              <Toggle
                label="Eclipses & retrogrades"
                detail="Eclipses, and when Mercury through Saturn turn retrograde or direct"
                value={calendar.astro}
                onChange={(on) => void setCalendarChoice({ astro: on })}
              />
              {calendar.astro && (
                <Chip label="Event settings ›" onPress={() => setStyling('astro')} a11yLabel="Eclipse and retrograde event settings" />
              )}
              {calendar.access === 'granted' && calendar.calendars.length > 1 && (
                <View style={ui.gapSmall}>
                  <Body muted>Add events to</Body>
                  <Chips>
                    {calendar.calendars.map((c) => (
                      <Chip key={c.id} label={c.title} selected={calendar.calendarId === c.id} onPress={() => void chooseCalendar(c.id)} />
                    ))}
                  </Chips>
                </View>
              )}
            </>
          ) : calendarMode === 'file' ? (
            <>
              <Chips>
                <Chip label="Moon event settings ›" onPress={() => setStyling('moon')} />
                <Chip label="Holiday event settings ›" onPress={() => setStyling('holiday')} />
                <Chip label="Eclipse & retrograde event settings ›" onPress={() => setStyling('astro')} />
              </Chips>
              <Button
                label="Download holidays, eclipses and moon phases (.ics)"
                variant="outline"
                onPress={() => {
                  if (!downloadSky(settings.phases)) tell("Couldn't download", 'Your browser blocked the file. Please try again.');
                }}
              />
            </>
          ) : (
            <Body muted>Writing to your calendar needs the full app; this preview can only open Google Calendar from a plan.</Body>
          )}
        </Card>
      </View>

      {remindersSupported && loaded && permission === 'granted' && (
        <Notice>{scheduled ? `${scheduled} ${scheduled === 1 ? 'reminder is' : 'reminders are'} set for the next two months.` : 'No reminders are set right now.'}</Notice>
      )}

      <EventStyleSheet
        kind={styling}
        style={styling ? calendar.styles[styling] : null}
        phases={settings.phases}
        onClose={() => setStyling(null)}
        onSave={(kind, style) => {
          setStyling(null);
          void setEventStyle(kind, style, settings.phases);
        }}
      />
    </RitualScreen>
  );
}
