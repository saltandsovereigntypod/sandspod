// What the home and lock screen widget shows each day: tonight's moon, today's
// (or the next) holiday and your next planned ritual. The app works out a
// month of days at once and hands them to iOS, so the widget stays right
// even when the app isn't opened. Pure, so it can be tested.

import { holidaysToday, nextHolidayAfterToday, type HolidayChoice } from './holidays.ts';
import { moonSign, moonState, PRINCIPAL_NAMES, upcomingPhases, type PhaseName } from './moon.ts';
import { nextPlan, planStart } from './rituals/plans.ts';
import type { RitualPlan } from './rituals/types.ts';

export type MoonWidgetProps = {
  phase: string;
  /** How much of the moon is lit, 0–100. */
  percent: number;
  /** The SF Symbol for the phase. */
  symbol: string;
  sign: string;
  /** "Full Moon Friday" or "Full Moon tomorrow". */
  next: string;
  /** Today's holiday, or "Samhain in 3 days", or "". */
  holiday: string;
  holidayToday: boolean;
  /** "Protection working · Tomorrow · 9:00 pm", or "". */
  ritual: string;
};

export const WIDGET_DAYS = 30;

const SYMBOLS: Record<PhaseName, string> = {
  'New Moon': 'moonphase.new.moon',
  'Waxing Crescent': 'moonphase.waxing.crescent',
  'First Quarter': 'moonphase.first.quarter',
  'Waxing Gibbous': 'moonphase.waxing.gibbous',
  'Full Moon': 'moonphase.full.moon',
  'Waning Gibbous': 'moonphase.waning.gibbous',
  'Last Quarter': 'moonphase.last.quarter',
  'Waning Crescent': 'moonphase.waning.crescent',
};

const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function daysApart(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((b - a) / 86_400_000);
}

function whenWords(day: Date, date: Date): string {
  const apart = daysApart(day, date);
  if (apart <= 0) return 'tonight';
  if (apart === 1) return 'tomorrow';
  if (apart < 7) return WEEKDAY[date.getDay()];
  return `in ${apart} days`;
}

function planLabel(plan: RitualPlan, day: Date): string {
  const start = planStart(plan);
  if (!start) return plan.title;
  const apart = daysApart(day, start);
  const dayWord =
    apart === 0 ? 'Today' : apart === 1 ? 'Tomorrow' : apart < 7 ? WEEKDAY[start.getDay()] : start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const h = start.getHours();
  const time = `${h % 12 || 12}:${String(start.getMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
  return `${plan.title} · ${dayWord} · ${time}`;
}

/** The widget's props for one day. */
export function widgetDay(day: Date, choice: HolidayChoice, plans: RitualPlan[]): MoonWidgetProps {
  const evening = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 21);
  const moon = moonState(evening);
  // The next principal phase after tonight's (so a full moon tonight points at the last quarter).
  const upcoming = upcomingPhases(evening, 2).find((p) => PRINCIPAL_NAMES[p.phase] !== moon.name || daysApart(day, p.date) > 1);
  const next = upcoming ? `${PRINCIPAL_NAMES[upcoming.phase]} ${whenWords(day, upcoming.date)}` : '';

  const today = holidaysToday(day, choice);
  const coming = today.length ? null : nextHolidayAfterToday(day, choice);
  const holiday = today.length
    ? today.map((h) => h.name).join(' · ')
    : coming
      ? `${coming.name} ${whenWords(day, coming.date).replace(/^tonight$/, 'today')}`
      : '';

  const plan = nextPlan(plans, day);
  return {
    phase: moon.name,
    percent: Math.round(moon.illumination * 100),
    symbol: SYMBOLS[moon.name],
    sign: moonSign(evening),
    next,
    holiday,
    holidayToday: today.length > 0,
    ritual: plan ? planLabel(plan, day) : '',
  };
}

/** A month of widget days: now, then each following midnight. */
export function widgetTimeline(now: Date, choice: HolidayChoice, plans: RitualPlan[], days = WIDGET_DAYS) {
  return Array.from({ length: days }, (_, i) => {
    const date = i === 0 ? now : new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    return { date, props: widgetDay(date, choice, plans) };
  });
}
