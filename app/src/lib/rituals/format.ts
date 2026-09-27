// Words for dates and times on the Rituals screens.

import { daysBetween, dayRulerLabel, shortDate } from '../calendar';
import { moonState } from '../moon';
import { dateFromKey } from './lifecycle';
import { planStart } from './plans';
import type { JournalRow, RitualPlan } from './types';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function clockTime(date: Date): string {
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h < 12 ? 'am' : 'pm'}`;
}

/** "Tonight", "Tomorrow", or "Friday, Oct 2". */
export function dayLabel(date: Date, now = new Date()): string {
  const days = daysBetween(now, date);
  if (days === 0) return 'Tonight';
  if (days === 1) return 'Tomorrow';
  return `${WEEKDAYS[date.getDay()]}, ${shortDate(date)}`;
}

/** "Tonight · 9:00 pm" */
export function planWhen(plan: RitualPlan, now = new Date()): string {
  const start = planStart(plan);
  return start ? `${dayLabel(start, now)} · ${clockTime(start)}` : plan.date;
}

/** "Waxing Gibbous · Venus's day" for a plan's night. */
export function planSky(plan: RitualPlan): string {
  const start = planStart(plan);
  if (!start) return '';
  return `${moonState(start).name} · ${dayRulerLabel(start)}`;
}

export function journalDetail(entry: JournalRow): string {
  const date = dateFromKey(entry.ritual_date) ?? (entry.created_at ? new Date(entry.created_at) : null);
  const minutes = entry.duration_seconds && entry.duration_seconds >= 60 ? `${Math.round(entry.duration_seconds / 60)} min` : null;
  return [date ? shortDate(date) : null, entry.moon_phase, minutes].filter(Boolean).join(' · ');
}

export function minutesLabel(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  const minutes = Math.round(seconds / 60);
  return minutes >= 1 ? `${minutes} min` : `${seconds} sec`;
}

/** "traditional/herb/basil" ⇄ "herb.basil", safe as a route segment. */
export const refToParam = (ref: string) => ref.replace(/^traditional\//, '').replace('/', '.');
export const paramToRef = (param: string) => `traditional/${param.replace('.', '/')}`;
