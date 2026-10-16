// Which moon and ritual reminders to schedule, and when. Pure, so the times can
// be tested; the notifier hands the result to expo-notifications.

import { PRINCIPAL_NAMES, signAtSyzygy, upcomingPhases, type PrincipalPhase } from '../moon.ts';
import { planStart } from '../rituals/plans.ts';
import type { RitualPlan } from '../rituals/types.ts';
import { dateKey, devotionFor } from '../craft/solitary/devotion.ts';
import { sacredReminders, type SacredReminderSource } from '../patron/index.ts';

export type ReminderSettings = {
  version: 1;
  phases: Record<PrincipalPhase, boolean>;
  /** Local hour (0–23) for moon reminders. */
  phaseHour: number;
  /** Minutes past the hour (0, 15, 30 or 45). */
  phaseMinute: number;
  /** Also remind the evening before a chosen phase. */
  dayBefore: boolean;
  /** Earlier heads-ups, in days before the phase (3 or 7), at the same time of day. */
  daysAhead: number[];
  /** Also remind at the exact moment of the phase. */
  atExact: boolean;
  /** Your own words for each phase's reminder ("Charge the crystals"). */
  notes: Record<PrincipalPhase, string>;
  /** Remind before planned rituals. */
  rituals: boolean;
  /** How long before a planned ritual. */
  ritualLeadMinutes: number;
  /** Daily devotion (My practice → Solitary): a morning and an evening nudge. */
  devotionMorning: boolean;
  /** Minutes after midnight. */
  devotionMorningAt: number;
  devotionEvening: boolean;
  devotionEveningAt: number;
  /** The sacred days of your patron and dedicated deities (Settings → My deities). */
  sacredDays: boolean;
  /** Minutes after midnight. */
  sacredAt: number;
};

export const DEFAULT_SETTINGS: ReminderSettings = {
  version: 1,
  phases: { new: false, firstQuarter: false, full: false, lastQuarter: false },
  phaseHour: 19,
  phaseMinute: 0,
  dayBefore: false,
  daysAhead: [],
  atExact: false,
  notes: { new: '', firstQuarter: '', full: '', lastQuarter: '' },
  rituals: true,
  ritualLeadMinutes: 60,
  devotionMorning: false,
  devotionMorningAt: 7 * 60,
  devotionEvening: false,
  devotionEveningAt: 21 * 60,
  sacredDays: false,
  sacredAt: 9 * 60,
};

export const PHASE_ORDER: PrincipalPhase[] = ['new', 'firstQuarter', 'full', 'lastQuarter'];
export const LEAD_CHOICES = [15, 60, 180] as const;
export const HOUR_CHOICES = [7, 12, 17, 19, 21] as const;
export const MINUTE_CHOICES = [0, 15, 30, 45] as const;
export const DAYS_AHEAD_CHOICES = [3, 7] as const;
export const NOTE_MAX = 120;

/** Stored settings from any older or partial shape, with defaults filled in. */
export function normalizeSettings(raw: unknown): ReminderSettings {
  const value = raw && typeof raw === 'object' ? (raw as Partial<ReminderSettings>) : {};
  const phases = { ...DEFAULT_SETTINGS.phases };
  for (const phase of PHASE_ORDER) phases[phase] = value.phases?.[phase] === true;
  const hour = Number(value.phaseHour);
  const lead = Number(value.ritualLeadMinutes);
  const minute = Number(value.phaseMinute);
  const notes = { ...DEFAULT_SETTINGS.notes };
  for (const phase of PHASE_ORDER) {
    const note = value.notes?.[phase];
    notes[phase] = typeof note === 'string' ? note.slice(0, NOTE_MAX) : '';
  }
  const ahead = Array.isArray(value.daysAhead) ? value.daysAhead.map(Number) : [];
  return {
    version: 1,
    phases,
    phaseHour: Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : DEFAULT_SETTINGS.phaseHour,
    phaseMinute: (MINUTE_CHOICES as readonly number[]).includes(minute) ? minute : 0,
    dayBefore: value.dayBefore === true,
    daysAhead: DAYS_AHEAD_CHOICES.filter((days) => ahead.includes(days)),
    atExact: value.atExact === true,
    notes,
    rituals: value.rituals !== false,
    ritualLeadMinutes: Number.isFinite(lead) && lead >= 0 && lead <= 24 * 60 ? lead : DEFAULT_SETTINGS.ritualLeadMinutes,
    devotionMorning: value.devotionMorning === true,
    devotionMorningAt: minuteOfDay(value.devotionMorningAt, DEFAULT_SETTINGS.devotionMorningAt),
    devotionEvening: value.devotionEvening === true,
    devotionEveningAt: minuteOfDay(value.devotionEveningAt, DEFAULT_SETTINGS.devotionEveningAt),
    sacredDays: value.sacredDays === true,
    sacredAt: minuteOfDay(value.sacredAt, DEFAULT_SETTINGS.sacredAt),
  };
}

function minuteOfDay(raw: unknown, fallback: number): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n < 24 * 60 ? n : fallback;
}

export function anyReminders(settings: ReminderSettings): boolean {
  return settings.rituals || settings.devotionMorning || settings.devotionEvening || settings.sacredDays || PHASE_ORDER.some((p) => settings.phases[p]);
}

export type Reminder = {
  /** Stable per event, so rescheduling never duplicates. */
  key: string;
  kind: 'moon' | 'ritual' | 'devotion' | 'sacred';
  at: Date;
  title: string;
  body: string;
  /** Where a tap should open. */
  url: string;
};

// iOS keeps at most 64 pending local notifications per app; leave headroom.
export const MAX_REMINDERS = 60;
export const HORIZON_DAYS = 60;
/** Daily devotions are kept two weeks ahead (topped up whenever the app opens), so they never crowd out the moon. */
export const DEVOTION_DAYS = 14;

function atTime(day: Date, hour: number, minute: number, daysEarlier = 0): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() - daysEarlier, hour, minute, 0, 0);
}

function clockTime(date: Date): string {
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const suffix = h < 12 ? 'am' : 'pm';
  return `${h % 12 || 12}:${m} ${suffix}`;
}

function phaseTitle(phase: PrincipalPhase, date: Date): string {
  const name = PRINCIPAL_NAMES[phase];
  return phase === 'new' || phase === 'full' ? `${name} in ${signAtSyzygy(date, phase)}` : name;
}

function leadText(minutes: number): string {
  if (minutes <= 0) return 'now';
  if (minutes < 60) return `in ${minutes} minutes`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? 'in an hour' : `in ${hours} hours`;
}

/** Every reminder due after `now` within the horizon, soonest first, capped. */
export function buildSchedule(settings: ReminderSettings, plans: RitualPlan[], now: Date, horizonDays = HORIZON_DAYS, sacred: SacredReminderSource[] = []): Reminder[] {
  const horizon = now.getTime() + horizonDays * 86_400_000;
  const reminders: Reminder[] = [];

  if (PHASE_ORDER.some((p) => settings.phases[p])) {
    // Four principal phases a lunation; ask for enough to cover the horizon.
    const count = Math.ceil(horizonDays / 7) + 4;
    for (const event of upcomingPhases(now, count)) {
      if (!settings.phases[event.phase]) continue;
      const title = phaseTitle(event.phase, event.date);
      const { phaseHour: hour, phaseMinute: minute } = settings;
      const day = atTime(event.date, hour, minute);
      const key = `${event.phase}:${event.date.toISOString().slice(0, 10)}`;
      const exact = `Exact at ${clockTime(event.date)}.`;
      const note = settings.notes[event.phase].trim();
      const body = (fallback: string) => `${exact} ${note || fallback}`;
      reminders.push({
        key: `moon:${key}`,
        kind: 'moon',
        at: day,
        title: `${title} ${event.date.getTime() < day.getTime() ? 'today' : 'tonight'}`,
        body: body('A good time to plan or begin a working.'),
        url: '/today',
      });
      if (settings.dayBefore) {
        reminders.push({
          key: `moon-eve:${key}`,
          kind: 'moon',
          at: atTime(event.date, hour, minute, 1),
          title: `${title} tomorrow`,
          body: body('Gather what you need tonight.'),
          url: '/rituals/planner',
        });
      }
      for (const days of settings.daysAhead) {
        reminders.push({
          key: `moon-ahead${days}:${key}`,
          kind: 'moon',
          at: atTime(event.date, hour, minute, days),
          title: `${title} ${days === 7 ? 'in a week' : `in ${days} days`}`,
          body: body('Time to plan your working.'),
          url: '/rituals/planner',
        });
      }
      if (settings.atExact) {
        reminders.push({
          key: `moon-exact:${key}`,
          kind: 'moon',
          at: event.date,
          title: `${title} now`,
          body: note || 'The moon is exact.',
          url: '/today',
        });
      }
    }
  }

  if (settings.rituals) {
    for (const plan of plans) {
      if (plan.doneAt) continue;
      const start = planStart(plan);
      if (!start) continue;
      const at = new Date(start.getTime() - settings.ritualLeadMinutes * 60_000);
      reminders.push({
        key: `ritual:${plan.id}:${plan.date}:${plan.time}`,
        kind: 'ritual',
        at,
        title: plan.title || 'Your ritual',
        body: `Your working begins ${leadText(settings.ritualLeadMinutes)}, at ${clockTime(start)}.`,
        url: `/rituals/plan/${plan.id}`,
      });
    }
  }

  for (const [on, at, which] of [
    [settings.devotionMorning, settings.devotionMorningAt, 'morning'],
    [settings.devotionEvening, settings.devotionEveningAt, 'evening'],
  ] as const) {
    if (!on) continue;
    for (let d = 0; d <= Math.min(DEVOTION_DAYS, horizonDays); d++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, Math.floor(at / 60), at % 60, 0, 0);
      const key = dateKey(day);
      const prompt = devotionFor(key)[which];
      reminders.push({
        key: `devotion-${which}:${key}`,
        kind: 'devotion',
        at: day,
        title: which === 'morning' ? 'Morning devotion' : 'Evening devotion',
        body: prompt.title,
        url: '/rituals/craft/solitary/devotion',
      });
    }
  }

  // Your deities' sacred days (Settings → My deities), as far ahead as the devotions.
  if (settings.sacredDays && sacred.length) {
    for (const r of sacredReminders(sacred, now, Math.min(DEVOTION_DAYS, horizonDays) + 1)) {
      const at = new Date(r.date.getFullYear(), r.date.getMonth(), r.date.getDate(), Math.floor(settings.sacredAt / 60), settings.sacredAt % 60, 0, 0);
      reminders.push({ key: `sacred-${r.key}:${dateKey(at)}`, kind: 'sacred', at, title: r.title, body: r.body, url: `/today/library/traditional:deity:${r.key}` });
    }
  }

  return reminders
    .filter((r) => r.at.getTime() > now.getTime() && r.at.getTime() <= horizon)
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, MAX_REMINDERS);
}
