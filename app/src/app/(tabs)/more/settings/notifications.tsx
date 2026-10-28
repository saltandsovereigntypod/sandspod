import { router, useLocalSearchParams, usePathname, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { HolidayCalendarSection, HolidaysSection } from '../../../../components/reminders/HolidaySections';
import { CovensSection, PlanningSection, PracticeSection, QuietSection } from '../../../../components/reminders/MoreSections';
import { MoreScreen } from '../../../../components/more/ui';
import { tabOf } from '../../../../lib/settings/links';
import { TendingSection } from '../../../../components/reminders/TendingSection';
import { EventStyleSheet } from '../../../../components/rituals/EventStyleSheet';
import { TimeStepper, clockLabel } from '../../../../components/rituals/TimeStepper';
import { Body, Card, Chip, Chips, Field, List, Notice, Row, SectionLabel, Toggle, tell, ui } from '../../../../components/rituals/ui';
import { calendarMode, chooseCalendar, downloadSky, setEventStyle, setSkyChoices, useCalendar } from '../../../../lib/reminders/calendarStore';
import type { SkyKind } from '../../../../lib/reminders/calendarEvent';
import { holidayGroups } from '../../../../lib/reminders/holidays';
import { PRINCIPAL_NAMES, nextPhase, type PrincipalPhase } from '../../../../lib/moon';
import { dayLabel } from '../../../../lib/rituals/format';
import { remindersSupported } from '../../../../lib/reminders/notifier';
import { summaries } from '../../../../lib/reminders/prefs';
import { DAYS_AHEAD_CHOICES, LEAD_CHOICES, NOTE_MAX, PHASE_ORDER, type ReminderSettings } from '../../../../lib/reminders/schedule';
import { updateReminderSettings, useReminders } from '../../../../lib/reminders/store';
import { useReminderPrefs } from '../../../../lib/reminders/usePrefs';
import { useSession } from '../../../../lib/session';

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

const TITLES: Record<string, string> = {
  moon: 'Moon and rituals',
  holidays: 'Holidays',
  tending: 'Tending',
  planning: 'Ritual planning',
  covens: 'Covens',
  practice: 'Daily practice',
  quiet: 'Quiet hours and pause',
  calendar: 'Your calendar',
};

/** Moon phases, planned rituals and look-back days (kept on this phone). */
function MoonSection({ settings, loaded }: { settings: ReminderSettings; loaded: boolean }) {
  const now = new Date();
  const anyPhase = PHASE_ORDER.some((phase) => settings.phases[phase]);
  const toggleAhead = (days: number) =>
    void updateReminderSettings({
      daysAhead: settings.daysAhead.includes(days) ? settings.daysAhead.filter((d) => d !== days) : [...settings.daysAhead, days],
    });
  return (
    <>
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
              <Chip label="The day before" selected={settings.dayBefore} onPress={() => void updateReminderSettings({ dayBefore: !settings.dayBefore })} />
              {DAYS_AHEAD_CHOICES.map((days) => (
                <Chip key={days} label={days === 7 ? 'A week before' : `${days} days before`} selected={settings.daysAhead.includes(days)} onPress={() => toggleAhead(days)} />
              ))}
              <Chip label="At the exact moment" selected={settings.atExact} onPress={() => void updateReminderSettings({ atExact: !settings.atExact })} />
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
          <Toggle label="Remind me before a planned ritual" value={settings.rituals} onChange={(rituals) => void updateReminderSettings({ rituals })} />
          {settings.rituals && (
            <Chips>
              {LEAD_CHOICES.map((minutes) => (
                <Chip key={minutes} label={LEAD_LABELS[minutes]} selected={settings.ritualLeadMinutes === minutes} onPress={() => void updateReminderSettings({ ritualLeadMinutes: minutes })} />
              ))}
            </Chips>
          )}
          <Toggle
            label="Ask “Did it work?” on look-back days"
            detail="On the day you chose to look back on a ritual, a spell, or a spell jar, sachet or anything else you made, at the time set for moon reminders"
            value={settings.lookBacks}
            onChange={(lookBacks) => void updateReminderSettings({ lookBacks })}
          />
        </Card>
      </View>
      <Body muted>Kept on this phone.</Body>
    </>
  );
}

/** Moon phases, holidays, eclipses and retrogrades in the phone's own calendar. */
function CalendarSection({ settings }: { settings: ReminderSettings }) {
  const calendar = useCalendar();
  const [styling, setStyling] = useState<SkyKind | null>(null);
  const setCalendarChoice = async (change: { phases?: boolean; sabbats?: boolean; astro?: boolean }) => {
    const result = await setSkyChoices(change, settings.phases);
    if (result === 'denied') tell('Calendar access is off', 'Allow calendar access in Settings to add events to your calendar.');
  };
  return (
    <>
      <Card>
        <Body muted>Optional. Planned rituals can be added one by one from their plan.</Body>
        {calendarMode === 'device' ? (
          <>
            <Toggle label="Moon phases you chose" detail="For the next six months" value={calendar.phases} onChange={(on) => void setCalendarChoice({ phases: on })} />
            {calendar.phases && <Chip label="Event settings ›" onPress={() => setStyling('moon')} a11yLabel="Moon phase event settings" />}
            <Toggle
              label="Holidays"
              detail="From your calendars in Settings → Calendars & holidays, for the next twelve months"
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
            {calendar.astro && <Chip label="Event settings ›" onPress={() => setStyling('astro')} a11yLabel="Eclipse and retrograde event settings" />}
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
    </>
  );
}

function moonSummary(settings: ReminderSettings): string {
  const phases = PHASE_ORDER.filter((p) => settings.phases[p]);
  const parts = [phases.length ? `${phases.length === 4 ? 'Every phase' : phases.map((p) => PRINCIPAL_NAMES[p]).join(', ')} at ${clockLabel(settings.phaseHour * 60 + settings.phaseMinute)}` : '', settings.rituals ? 'before planned rituals' : ''].filter(Boolean);
  return parts.length ? `${parts[0][0].toUpperCase()}${parts.join(' · ').slice(1)}` : 'Off';
}

function practiceSummary(s: ReminderSettings): string {
  const parts = [s.devotionMorning && `Morning devotion at ${clockLabel(s.devotionMorningAt)}`, s.devotionEvening && `evening at ${clockLabel(s.devotionEveningAt)}`, s.dreamMorning && `dreams at ${clockLabel(s.dreamMorningAt)}`].filter(
    (x): x is string => !!x,
  );
  return parts.length ? `${parts[0][0].toUpperCase()}${parts.join(' · ').slice(1)}` : 'Off';
}

// Settings → Notifications & reminders, by kind: one screen with a line on
// each, and a page for each (the same route with ?section=…, so the phone's
// back gesture works). The one home for every notification choice, coven
// ones included. Today and Rituals open their own copy of it (today/reminders,
// rituals/reminders) so Back stays in that tab; /more/reminders leads here.
export default function Notifications() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const pathname = usePathname();
  const { settings, permission, scheduled, loaded, sources, covens } = useReminders();
  const { prefs, update, settings: appSettings, ready } = useReminderPrefs();
  const { session } = useSession();
  const tab = tabOf(pathname);
  const home = (tab ? `/${tab}` : '/more/settings') as Href;
  const open = (next: string) => router.push({ pathname: pathname as never, params: { section: next } } as Href);
  const save = (next: typeof prefs) => void update(next);

  const notices = (
    <>
      {!remindersSupported && (
        <Card accent>
          <Body>
            {Platform.OS === 'web'
              ? 'Reminders arrive in the Salt & Sovereignty phone app. Browsers can’t send them at a set time, so your choices are saved here but nothing will ring in this tab. The website’s Reminders page can put them in your own calendar instead.'
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
    </>
  );

  if (section) {
    const holidayGroup = section.startsWith('holidays:') ? section.slice('holidays:'.length) : null;
    const groupName = holidayGroup ? (holidayGroups(appSettings).find((g) => g.id === holidayGroup)?.name ?? 'A calendar') : null;
    return (
      <MoreScreen title={groupName ?? TITLES[section] ?? 'Notifications & reminders'} eyebrow="Notifications & reminders" back={home}>
        {notices}
        {!ready && section !== 'moon' && section !== 'practice' && section !== 'calendar' ? (
          <Body muted>Reading your settings…</Body>
        ) : holidayGroup ? (
          <HolidayCalendarSection prefs={prefs} update={save} settings={appSettings} open={open} group={holidayGroup} />
        ) : section === 'holidays' ? (
          <HolidaysSection prefs={prefs} update={save} settings={appSettings} open={open} />
        ) : section === 'tending' ? (
          <TendingSection prefs={prefs} update={save} sources={sources} />
        ) : section === 'planning' ? (
          <PlanningSection prefs={prefs} update={save} covens={covens} signedIn={!!session} />
        ) : section === 'covens' ? (
          <CovensSection prefs={prefs} update={save} userId={session?.user.id ?? null} />
        ) : section === 'quiet' ? (
          <QuietSection prefs={prefs} update={save} />
        ) : section === 'practice' ? (
          <PracticeSection settings={settings} change={(c) => void updateReminderSettings(c)} />
        ) : section === 'calendar' ? (
          <CalendarSection settings={settings} />
        ) : (
          <MoonSection settings={settings} loaded={loaded} />
        )}
      </MoreScreen>
    );
  }

  const lines = summaries(prefs, appSettings);
  return (
    <MoreScreen title="Notifications & reminders" eyebrow="Settings" back={home}>
      <Body muted>Choose what you’d like to hear about, and when. Each kind has its own page.</Body>
      {notices}
      <List>
        <Row icon="bell" title="Moon and rituals" detail={moonSummary(settings)} onPress={() => open('moon')} />
        <Row icon="wheel" title="Holidays" detail={ready ? lines.holidays : '…'} onPress={() => open('holidays')} />
        <Row icon="altar" title="Tending" detail={ready ? `${lines.tending === 'Off' ? 'Off' : lines.tending} · plants, altars, offerings, crystals, candles` : '…'} onPress={() => open('tending')} />
        <Row icon="calendar" title="Ritual planning" detail={ready ? lines.planning : '…'} onPress={() => open('planning')} />
        <Row icon="today" title="Daily practice" detail={practiceSummary(settings)} onPress={() => open('practice')} />
        <Row icon="coven" title="Covens" detail={session ? 'Chat, conversations, gatherings and applications, per coven' : 'Sign in to hear from your covens'} onPress={() => open('covens')} />
        <Row icon="more" title="Quiet hours and pause" detail={ready ? lines.quiet : '…'} onPress={() => open('quiet')} />
        <Row icon="calendar" title="Your calendar" detail="Moon phases, holidays and eclipses in your phone’s calendar" onPress={() => open('calendar')} last />
      </List>
      {remindersSupported && loaded && permission === 'granted' && (
        <Notice>
          {scheduled
            ? `${scheduled} ${scheduled === 1 ? 'reminder is' : 'reminders are'} set. The soonest are always kept; more are added each time you open the app.`
            : 'No reminders are set right now.'}
        </Notice>
      )}
    </MoreScreen>
  );
}
