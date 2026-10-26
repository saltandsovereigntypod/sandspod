// Reminders → Ritual planning, Quiet hours & pause, and Daily practice.

import { View } from 'react-native';

import { Body, Card, Chip, Chips, SectionLabel, Toggle, ui } from '../rituals/ui';
import { TimeRow } from './parts';
import { covenPlanning, dayKey } from '../../lib/reminders/plan';
import { BUNDLE_CHOICES, isPaused, PLAN_DAY_CHOICES, timeLabel, withChange, type ReminderPrefs } from '../../lib/reminders/prefs';
import type { CovenSource } from '../../lib/reminders/plan';
import type { ReminderSettings } from '../../lib/reminders/schedule';

type Props = { prefs: ReminderPrefs; update: (next: ReminderPrefs) => void };

const daysWord = (d: number) => (d === 7 ? 'A week' : d === 14 ? 'Two weeks' : d === 21 ? 'Three weeks' : d === 30 ? 'A month' : `${d} days`);

export function PlanningSection({ prefs, update, covens, signedIn }: Props & { covens: CovenSource[]; signedIn: boolean }) {
  const p = prefs.planning;
  const set = (path: string, value: unknown) => update(withChange(prefs, `planning.${path}`, value));
  return (
    <>
      <View style={ui.gapSmall}>
        <SectionLabel>Your holidays</SectionLabel>
        <Card>
          <Toggle
            label="Remind me to plan a ritual"
            detail="Before each yearly holiday you’ve chosen under Holidays, unless you’ve already planned one for it"
            value={p.holidays}
            onChange={(on) => set('holidays', on)}
          />
          {p.holidays && (
            <Chips>
              {PLAN_DAY_CHOICES.map((d) => (
                <Chip key={d} label={`${daysWord(d)} before`} selected={p.days === d} onPress={() => set('days', d)} />
              ))}
            </Chips>
          )}
          <TimeRow label="At" minutes={p.at} onChange={(at) => set('at', at)} />
        </Card>
      </View>
      <View style={ui.gapSmall}>
        <SectionLabel>Your covens</SectionLabel>
        <Card>
          <Toggle
            label="For my covens’ holidays and rites"
            detail="On for covens you lead (as head of the coven, or in a position that leads or schedules rites), and earlier; for others, only if you turn it on"
            value={p.covens}
            onChange={(on) => set('covens', on)}
          />
          {p.covens && (
            <>
              <Body muted>For covens you lead</Body>
              <Chips>
                {PLAN_DAY_CHOICES.map((d) => (
                  <Chip key={d} label={`${daysWord(d)} before`} selected={p.leaderDays === d} onPress={() => set('leaderDays', d)} />
                ))}
              </Chips>
              {covens.map((coven) => {
                const own = covenPlanning(prefs, coven);
                return (
                  <View key={coven.id} style={ui.gapSmall}>
                    <Toggle
                      label={coven.name}
                      detail={`${coven.leader ? 'You lead it' : 'A member'} · ${own.on ? `${daysWord(own.days).toLowerCase()} ahead` : 'off'}`}
                      value={own.on}
                      onChange={(on) => set('perCoven', { ...p.perCoven, [coven.id]: { ...p.perCoven[coven.id], on } })}
                    />
                    {own.on && (
                      <Chips>
                        {PLAN_DAY_CHOICES.map((d) => (
                          <Chip key={d} label={daysWord(d)} selected={own.days === d} onPress={() => set('perCoven', { ...p.perCoven, [coven.id]: { ...p.perCoven[coven.id], on: true, days: d } })} />
                        ))}
                      </Chips>
                    )}
                  </View>
                );
              })}
              {!covens.length && <Body muted>{signedIn ? 'Your covens will be listed here once they’ve loaded.' : 'Sign in to hear about your covens.'}</Body>}
              <Body muted>Rites you’ve said you’ll come to are always reminded the day before and an hour before.</Body>
            </>
          )}
        </Card>
      </View>
    </>
  );
}

const PAUSES: { label: string; days: number | null }[] = [
  { label: 'Until I turn them back on', days: null },
  { label: 'A day', days: 1 },
  { label: 'Three days', days: 3 },
  { label: 'A week', days: 7 },
  { label: 'Two weeks', days: 14 },
  { label: 'A month', days: 30 },
];

export function QuietSection({ prefs, update }: Props) {
  const now = new Date();
  const paused = isPaused(prefs, now);
  const until = (days: number | null) => {
    if (days == null) return '';
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
    return dayKey(d);
  };
  return (
    <>
      <View style={ui.gapSmall}>
        <SectionLabel>Pause</SectionLabel>
        <Card>
          <Toggle
            label="Pause all reminders"
            detail={paused ? (prefs.pausedUntil ? `Back on the morning of ${new Date(`${prefs.pausedUntil}T00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}` : 'Until you turn them back on') : 'Nothing rings while paused; your choices are kept'}
            value={paused}
            onChange={(on) => update(withChange(withChange(prefs, 'paused', on), 'pausedUntil', on ? until(7) : ''))}
          />
          {paused && (
            <Chips>
              {PAUSES.map((p) => (
                <Chip key={p.label} label={p.label} selected={prefs.pausedUntil === until(p.days)} onPress={() => update(withChange(prefs, 'pausedUntil', until(p.days)))} />
              ))}
            </Chips>
          )}
        </Card>
      </View>
      <View style={ui.gapSmall}>
        <SectionLabel>Quiet hours</SectionLabel>
        <Card>
          <Toggle
            label="Keep quiet at night"
            detail={`Reminders that would ring between ${timeLabel(prefs.quiet.start)} and ${timeLabel(prefs.quiet.end)} come when quiet hours end; one about a set time (a ritual, a rite, a candle burning down) comes just before they begin`}
            value={prefs.quiet.on}
            onChange={(on) => update(withChange(prefs, 'quiet.on', on))}
          />
          {prefs.quiet.on && (
            <>
              <TimeRow label="From" minutes={prefs.quiet.start} onChange={(m) => update(withChange(prefs, 'quiet.start', m))} />
              <TimeRow label="Until" minutes={prefs.quiet.end} onChange={(m) => update(withChange(prefs, 'quiet.end', m))} />
            </>
          )}
        </Card>
      </View>
      <View style={ui.gapSmall}>
        <SectionLabel>A busy day</SectionLabel>
        <Card>
          <Toggle
            label="Gather a busy day into one note"
            detail="Holidays, planning and tending on the same day come together in the morning, instead of one after another. The moon, your rituals, rites and daily practice still come on their own."
            value={prefs.bundle.on}
            onChange={(on) => update(withChange(prefs, 'bundle.on', on))}
          />
          {prefs.bundle.on && (
            <Chips>
              {BUNDLE_CHOICES.map((n) => (
                <Chip key={n} label={`More than ${n}`} selected={prefs.bundle.max === n} onPress={() => update(withChange(prefs, 'bundle.max', n))} />
              ))}
            </Chips>
          )}
        </Card>
      </View>
    </>
  );
}

export function PracticeSection({ settings, change }: { settings: ReminderSettings; change: (c: Partial<ReminderSettings>) => void }) {
  return (
    <Card>
      <Toggle label="Morning devotion" detail="A short prompt to begin the day, from Daily devotion" value={settings.devotionMorning} onChange={(devotionMorning) => change({ devotionMorning })} />
      {settings.devotionMorning && <TimeRow minutes={settings.devotionMorningAt} onChange={(devotionMorningAt) => change({ devotionMorningAt })} />}
      <Toggle label="Evening devotion" detail="A short prompt to close the day" value={settings.devotionEvening} onChange={(devotionEvening) => change({ devotionEvening })} />
      {settings.devotionEvening && <TimeRow minutes={settings.devotionEveningAt} onChange={(devotionEveningAt) => change({ devotionEveningAt })} />}
      <Toggle label="Last night’s dream" detail="A gentle morning nudge to write it down, for Dreams in your Grimoire" value={settings.dreamMorning} onChange={(dreamMorning) => change({ dreamMorning })} />
      {settings.dreamMorning && <TimeRow minutes={settings.dreamMorningAt} onChange={(dreamMorningAt) => change({ dreamMorningAt })} />}
      <Body muted>Kept on this phone.</Body>
    </Card>
  );
}
