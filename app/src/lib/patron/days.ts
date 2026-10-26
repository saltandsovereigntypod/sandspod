// When a deity's sacred days fall: today, and the next few. Pure.

import { startOfDay } from '../calendar.ts';
import { holidaysBetween } from '../holidays.ts';
import { nextPhase } from '../moon.ts';
import { atticDate } from '../traditionDay.ts';
import { lunarDates } from './lunisolar.ts';
import type { DeityDevotion, SacredDay, SacredRule } from './types.ts';

const DAY = 86_400_000;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export type SacredOn = { day: SacredDay; date: Date; inDays: number };

/** The days in [from, from + days) a rule falls on. */
export function ruleDates(rule: SacredRule, from: Date, days: number): Date[] {
  const start = startOfDay(from);
  const end = addDays(start, days);
  const out: Date[] = [];
  switch (rule.kind) {
    case 'weekday':
    case 'attic':
    case 'fixed':
      for (let d = start; d < end; d = addDays(d, 1)) {
        if (rule.kind === 'weekday' && d.getDay() === rule.day) out.push(d);
        if (rule.kind === 'fixed' && d.getMonth() + 1 === rule.month && d.getDate() === rule.day) out.push(d);
        if (rule.kind === 'attic') {
          const a = atticDate(d);
          if (a && (!rule.month || a.month === rule.month) && (rule.day === 'last' ? a.last : a.day === rule.day)) out.push(d);
        }
      }
      return out;
    case 'moon': {
      // The dark moon is the day of the conjunction; the new moon, as kept, is the first crescent the evening after.
      const phase = rule.phase === 'full' ? 'full' : 'new';
      const shift = rule.phase === 'new' ? 1 : 0;
      let cursor = new Date(start.getTime() - 2 * DAY);
      for (let i = 0; i < 4; i++) {
        const at = nextPhase(cursor, phase);
        const d = addDays(startOfDay(at), shift);
        if (d >= start && d < end && !out.some((x) => sameDay(x, d))) out.push(d);
        cursor = new Date(at.getTime() + DAY);
        if (cursor >= end) break;
      }
      return out;
    }
    case 'lunisolar':
      return lunarDates(rule.month, rule.day, start, end);
    case 'holiday': {
      const prefix = `${rule.tradition}-${rule.id}-`;
      return holidaysBetween(start, addDays(end, -1), { traditions: [rule.tradition], custom: [], picked: [] })
        .filter((h) => h.id.startsWith(prefix))
        .map((h) => startOfDay(h.date))
        .filter((d) => d >= start && d < end);
    }
  }
}

/** A deity's sacred days from `from` over the next `days`, soonest first. */
export function upcomingSacred(devotion: DeityDevotion, from: Date, days = 45): SacredOn[] {
  const start = startOfDay(from);
  const out: SacredOn[] = [];
  for (const day of devotion.sacred) {
    for (const date of ruleDates(day.rule, start, days)) {
      out.push({ day, date, inDays: Math.round((date.getTime() - start.getTime()) / DAY) });
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** A devotion for the day, turning daily so they all come round. */
export function devotionOfDay(devotion: DeityDevotion, date: Date): string | null {
  if (!devotion.devotions.length) return null;
  const n = Math.floor(startOfDay(date).getTime() / DAY);
  return devotion.devotions[((n % devotion.devotions.length) + devotion.devotions.length) % devotion.devotions.length];
}
