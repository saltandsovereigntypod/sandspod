// Cycle & Moon reminders: off unless chosen, and discreet unless the person
// asks for fuller words, since a phone's lock screen can be seen by anyone
// nearby. Only ever scheduled on the phone (reminders/plan.ts); never put in
// the website's calendar file. Pure.

import { nextPhase } from '../moon.ts';
import { addDays, dayKey, fromKey, nextBleedEstimate, SEASON_NAMES } from './model.ts';
import type { CycleData } from './types.ts';

export type CycleReminder = { key: string; at: Date; title: string; body: string; url: string };

export const CYCLE_URL = '/rituals/cycle';
export const DISCREET_TITLE = 'Cycle & Moon';
export const DISCREET_BODY = 'Cycle & Moon has a note for you.';

const atMinutes = (key: string, minutes: number) => {
  const d = fromKey(key)!;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(minutes / 60), minutes % 60);
};

/** What to schedule from `now` for `days` ahead. */
export function cycleReminders(data: CycleData, now: Date, days = 60): CycleReminder[] {
  const r = data.settings.reminders;
  if (!r.on) return [];
  const horizon = now.getTime() + days * 86_400_000;
  const out: CycleReminder[] = [];
  const note = (key: string, at: Date, full: string) => {
    if (at.getTime() <= now.getTime() || at.getTime() > horizon) return;
    out.push({ key: `cycle:${key}`, at, title: DISCREET_TITLE, body: r.full ? full : DISCREET_BODY, url: CYCLE_URL });
  };
  if (data.settings.mode === 'cycle') {
    const estimate = nextBleedEstimate(data, now);
    if (estimate && estimate.daysAway > r.ahead) {
      const day = addDays(dayKey(now), estimate.daysAway - r.ahead);
      note(`ahead:${day}`, atMinutes(day, r.at), `Your bleed may start in about ${r.ahead} ${r.ahead === 1 ? 'day' : 'days'}. Inner autumn: time to slow down.`);
    }
  } else {
    // Following the moon: the night before its dark (inner winter) and its full (inner summer).
    let from = now;
    for (let i = 0; i < 3; i++) {
      const newMoon = nextPhase(from, 'new');
      const full = nextPhase(from, 'full');
      const eveNew = addDays(dayKey(newMoon), -1);
      const eveFull = addDays(dayKey(full), -1);
      note(`moon-new:${dayKey(newMoon)}`, atMinutes(eveNew, r.at), `The new moon is tomorrow: your ${SEASON_NAMES.winter} begins. A night for rest.`);
      note(`moon-full:${dayKey(full)}`, atMinutes(eveFull, r.at), `The full moon is tomorrow: your ${SEASON_NAMES.summer}. A time to reach outward.`);
      from = new Date(Math.max(newMoon.getTime(), full.getTime()) + 3_600_000);
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}
