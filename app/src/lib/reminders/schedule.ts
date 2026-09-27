// Which moon and ritual reminders to schedule, and when. Pure, so the times can
// be tested; the notifier hands the result to expo-notifications.

import { PRINCIPAL_NAMES, signAtSyzygy, upcomingPhases, type PrincipalPhase } from '../moon.ts';
import { planStart } from '../rituals/plans.ts';
import type { RitualPlan } from '../rituals/types.ts';

export type ReminderSettings = {
  version: 1;
  phases: Record<PrincipalPhase, boolean>;
  /** Local hour (0–23) for moon reminders. */
  phaseHour: number;
  /** Also remind the evening before a chosen phase. */
  dayBefore: boolean;
  /** Remind before planned rituals. */
  rituals: boolean;
  /** How long before a planned ritual. */
  ritualLeadMinutes: number;
};

export const DEFAULT_SETTINGS: ReminderSettings = {
  version: 1,
  phases: { new: false, firstQuarter: false, full: false, lastQuarter: false },
  phaseHour: 19,
  dayBefore: false,
  rituals: true,
  ritualLeadMinutes: 60,
};

export const PHASE_ORDER: PrincipalPhase[] = ['new', 'firstQuarter', 'full', 'lastQuarter'];
export const LEAD_CHOICES = [15, 60, 180] as const;
export const HOUR_CHOICES = [7, 12, 17, 19, 21] as const;

/** Stored settings from any older or partial shape, with defaults filled in. */
export function normalizeSettings(raw: unknown): ReminderSettings {
  const value = raw && typeof raw === 'object' ? (raw as Partial<ReminderSettings>) : {};
  const phases = { ...DEFAULT_SETTINGS.phases };
  for (const phase of PHASE_ORDER) phases[phase] = value.phases?.[phase] === true;
  const hour = Number(value.phaseHour);
  const lead = Number(value.ritualLeadMinutes);
  return {
    version: 1,
    phases,
    phaseHour: Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : DEFAULT_SETTINGS.phaseHour,
    dayBefore: value.dayBefore === true,
    rituals: value.rituals !== false,
    ritualLeadMinutes: Number.isFinite(lead) && lead >= 0 && lead <= 24 * 60 ? lead : DEFAULT_SETTINGS.ritualLeadMinutes,
  };
}

export function anyReminders(settings: ReminderSettings): boolean {
  return settings.rituals || PHASE_ORDER.some((p) => settings.phases[p]);
}

export type Reminder = {
  /** Stable per event, so rescheduling never duplicates. */
  key: string;
  kind: 'moon' | 'ritual';
  at: Date;
  title: string;
  body: string;
  /** Where a tap should open. */
  url: string;
};

// iOS keeps at most 64 pending local notifications per app; leave headroom.
export const MAX_REMINDERS = 60;
export const HORIZON_DAYS = 60;

function atHour(day: Date, hour: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0, 0);
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
export function buildSchedule(settings: ReminderSettings, plans: RitualPlan[], now: Date, horizonDays = HORIZON_DAYS): Reminder[] {
  const horizon = now.getTime() + horizonDays * 86_400_000;
  const reminders: Reminder[] = [];

  if (PHASE_ORDER.some((p) => settings.phases[p])) {
    // Four principal phases a lunation; ask for enough to cover the horizon.
    const count = Math.ceil(horizonDays / 7) + 4;
    for (const event of upcomingPhases(now, count)) {
      if (!settings.phases[event.phase]) continue;
      const title = phaseTitle(event.phase, event.date);
      const day = atHour(event.date, settings.phaseHour);
      const key = `${event.phase}:${event.date.toISOString().slice(0, 10)}`;
      const exact = `Exact at ${clockTime(event.date)}.`;
      reminders.push({
        key: `moon:${key}`,
        kind: 'moon',
        at: day,
        title: `${title} ${event.date.getTime() < day.getTime() ? 'today' : 'tonight'}`,
        body: `${exact} A good time to plan or begin a working.`,
        url: '/today',
      });
      if (settings.dayBefore) {
        const before = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, settings.phaseHour);
        reminders.push({
          key: `moon-eve:${key}`,
          kind: 'moon',
          at: before,
          title: `${title} tomorrow`,
          body: `${exact} Gather what you need tonight.`,
          url: '/rituals/planner',
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

  return reminders
    .filter((r) => r.at.getTime() > now.getTime() && r.at.getTime() <= horizon)
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, MAX_REMINDERS);
}
