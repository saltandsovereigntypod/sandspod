// Discreet notifications (Reminders → Quiet hours and pause, prefs.discreet):
// when on, every note the app puts on the phone says only the app's name and
// a neutral line, so nothing about the craft shows on a lock screen. The
// reminders keep their times and where a tap opens; only the words change.
// Cycle & Moon's own discreet wording (cycle/reminders.ts) stays as it is
// when this is off. The coven notes sent from the server use the same words
// (supabase/functions/coven-notify/discreet.ts; app/tests checks they match).
// Pure.

import type { Reminder, ReminderKind } from './schedule';

export const DISCREET_TITLE = 'Salt & Sovereignty';
export const DISCREET_BODY = 'You have a reminder.';
const TEND_BODY = 'Something to tend today.';
const DATE_BODY = 'A date you asked to hear about.';
const MANY_BODY = 'You have a few reminders today.';

const TEND = new Set<ReminderKind>(['watering', 'offering', 'altar', 'crystal', 'candle', 'tend', 'deipnon']);
const DATES = new Set<ReminderKind>(['moon', 'holiday', 'sacred', 'year', 'planning', 'devotion', 'cycle']);

/** The neutral line for a kind of reminder: a category, never its subject. */
export function discreetBody(kind: ReminderKind): string {
  if (kind === 'summary') return MANY_BODY;
  if (TEND.has(kind)) return TEND_BODY;
  if (DATES.has(kind)) return DATE_BODY;
  return DISCREET_BODY;
}

/** The reminders as the phone will show them: unchanged, or (discreet) with neutral words. */
export function discreetReminders(list: Reminder[], on: boolean): Reminder[] {
  return on ? list.map((r) => ({ ...r, title: DISCREET_TITLE, body: discreetBody(r.kind) })) : list;
}

/** A timer's bell (a ritual step, the end of a sit) as the phone will show it. */
export function discreetAlarm<T extends { title: string; body: string }>(alarm: T, on: boolean): T {
  return on ? { ...alarm, title: DISCREET_TITLE, body: 'Your timer has finished.' } : alarm;
}
