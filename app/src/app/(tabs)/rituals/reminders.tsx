import { Linking, Platform, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Body, Card, Chip, Chips, Notice, RitualScreen, SectionLabel, Title, Toggle, tell, ui } from '../../../components/rituals/ui';
import { calendarMode, chooseCalendar, downloadSky, setSkyChoices, useCalendar } from '../../../lib/reminders/calendarStore';
import { PRINCIPAL_NAMES, nextPhase } from '../../../lib/moon';
import { clockTime, dayLabel } from '../../../lib/rituals/format';
import { remindersSupported } from '../../../lib/reminders/notifier';
import { HOUR_CHOICES, LEAD_CHOICES, PHASE_ORDER } from '../../../lib/reminders/schedule';
import { updateReminderSettings, useReminders } from '../../../lib/reminders/store';

const LEAD_LABELS: Record<number, string> = { 15: '15 minutes before', 60: 'An hour before', 180: 'Three hours before' };

// Moon reminder settings. Linked from the Rituals tab and Today; More can link
// here too (route: /rituals/reminders).
export default function Reminders() {
  const { settings, permission, scheduled, loaded } = useReminders();
  const calendar = useCalendar();
  const now = new Date();

  const setCalendarChoice = async (change: { phases?: boolean; sabbats?: boolean }) => {
    const result = await setSkyChoices(change, settings.phases);
    if (result === 'denied') tell('Calendar access is off', 'Allow calendar access in Settings to add events to your calendar.');
  };

  return (
    <RitualScreen back="Back">
      <Title eyebrow={Platform.OS === 'web' ? 'Kept in this browser' : 'Kept on this phone'}>Moon reminders</Title>
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
            <Toggle
              key={phase}
              label={PRINCIPAL_NAMES[phase]}
              detail={`Next: ${dayLabel(nextPhase(now, phase), now)}`}
              value={settings.phases[phase]}
              onChange={(on) => void updateReminderSettings({ phases: { ...settings.phases, [phase]: on } })}
            />
          ))}
          <Toggle
            label="Also the evening before"
            detail="Time to gather what you need"
            value={settings.dayBefore}
            onChange={(dayBefore) => void updateReminderSettings({ dayBefore })}
          />
        </Card>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Remind me at</SectionLabel>
        <Chips>
          {HOUR_CHOICES.map((hour) => (
            <Chip
              key={hour}
              label={clockTime(new Date(2000, 0, 1, hour))}
              selected={settings.phaseHour === hour}
              onPress={() => void updateReminderSettings({ phaseHour: hour })}
            />
          ))}
        </Chips>
      </View>

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
                detail="All-day events for the next six months"
                value={calendar.phases}
                onChange={(on) => void setCalendarChoice({ phases: on })}
              />
              <Toggle
                label="Sabbats"
                detail="The Wheel of the Year, for the next twelve months"
                value={calendar.sabbats}
                onChange={(on) => void setCalendarChoice({ sabbats: on })}
              />
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
            <Button
              label="Download sabbats and chosen moon phases (.ics)"
              variant="outline"
              onPress={() => {
                if (!downloadSky(settings.phases)) tell("Couldn't download", 'Your browser blocked the file. Please try again.');
              }}
            />
          ) : (
            <Body muted>Writing to your calendar needs the full app; this preview can only open Google Calendar from a plan.</Body>
          )}
        </Card>
      </View>

      {remindersSupported && loaded && permission === 'granted' && (
        <Notice>{scheduled ? `${scheduled} ${scheduled === 1 ? 'reminder is' : 'reminders are'} set for the next two months.` : 'No reminders are set right now.'}</Notice>
      )}
    </RitualScreen>
  );
}
