// What the home and lock screen widgets show each day: tonight's moon, today's
// and the coming holidays, the coming moon phases and your next planned ritual
// with what it needs. The app works out a month of days at once and hands them
// to iOS, so the widgets stay right even when the app isn't opened. Every
// widget gets the same day; each shows its own part. Pure, so it can be tested.

import { holidaysBetween, holidaysToday, nextHolidayAfterToday, type HolidayChoice } from './holidays.ts';
import { moonSign, moonState, PRINCIPAL_NAMES, signAtSyzygy, upcomingPhases, type PhaseName } from './moon.ts';
import { nextPlan, planStart, planTemplate } from './rituals/plans.ts';
import type { Ingredient, RitualPlan, TemplateRow } from './rituals/types.ts';

export type WidgetPhase = {
  /** "Full Moon in Taurus" or "First Quarter". */
  name: string;
  symbol: string;
  /** "Mon, Oct 26". */
  date: string;
  /** "today", "tomorrow", "Friday", "in 12 days". */
  when: string;
};

export type WidgetHoliday = {
  name: string;
  date: string;
  when: string;
  /** Days until it starts (0 today). */
  days: number;
};

export type WidgetDayProps = {
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
  /** What today's holiday (or else the next one) is about. */
  holidayMeaning: string;
  /** The next holiday starting after today. */
  nextHoliday: WidgetHoliday | null;
  /** The coming principal phases, soonest first. */
  phases: WidgetPhase[];
  /** The coming holidays (after today), soonest first. */
  holidays: WidgetHoliday[];
  /** "Protection working · Tomorrow · 9:00 pm", or "". */
  ritual: string;
  ritualId: string;
  ritualTitle: string;
  /** "Tomorrow · 9:00 pm". */
  ritualWhen: string;
  /** When it begins (ISO), for a live countdown; "" when unknown. */
  ritualStart: string;
  ritualIntention: string;
  /** The moon on the ritual's night: "Waxing Gibbous in Pisces". */
  ritualMoon: string;
  /** What to gather. */
  ritualNeeds: string[];
  /** Preparation notes when nothing to gather is listed. */
  ritualPrep: string;
};

/** The original widget's props; kept as a name for the moon widget. */
export type MoonWidgetProps = WidgetDayProps;

export const WIDGET_DAYS = 30;
const LIST_LENGTH = 5;
const NEEDS_LENGTH = 10;

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
const SHORT_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

function shortDate(date: Date): string {
  return `${SHORT_DAY[date.getDay()]}, ${SHORT_MONTH[date.getMonth()]} ${date.getDate()}`;
}

function clock(date: Date): string {
  const h = date.getHours();
  return `${h % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

function phaseName(phase: keyof typeof PRINCIPAL_NAMES, date: Date): string {
  const name = PRINCIPAL_NAMES[phase];
  return phase === 'new' || phase === 'full' ? `${name} in ${signAtSyzygy(date, phase)}` : name;
}

function ritualDetails(plan: RitualPlan | null, day: Date, templates: TemplateRow[]) {
  const empty = { ritual: '', ritualId: '', ritualTitle: '', ritualWhen: '', ritualStart: '', ritualIntention: '', ritualMoon: '', ritualNeeds: [], ritualPrep: '' };
  if (!plan) return empty;
  const start = planStart(plan);
  const title = plan.title || 'Ritual';
  if (!start) return { ...empty, ritual: title, ritualId: plan.id, ritualTitle: title };
  const apart = daysApart(day, start);
  const dayWord =
    apart === 0 ? 'Today' : apart === 1 ? 'Tomorrow' : apart < 7 ? WEEKDAY[start.getDay()] : `${SHORT_MONTH[start.getMonth()]} ${start.getDate()}`;
  const when = `${dayWord} · ${clock(start)}`;
  const template = planTemplate(plan, templates);
  const ingredients: Ingredient[] = plan.ingredients.length
    ? plan.ingredients
    : ((template?.metadata?.ingredients as Ingredient[] | undefined) ?? plan.draft?.ingredients ?? []);
  const names = [...new Set(ingredients.map((i) => i?.name?.trim()).filter((n): n is string => !!n))];
  return {
    ritual: `${title} · ${when}`,
    ritualId: plan.id,
    ritualTitle: title,
    ritualWhen: when,
    ritualStart: start.toISOString(),
    ritualIntention: plan.intention ?? template?.intention ?? plan.draft?.intention ?? '',
    ritualMoon: `${moonState(start).name} in ${moonSign(start)}`,
    ritualNeeds: names.slice(0, NEEDS_LENGTH),
    ritualPrep: names.length ? '' : (template?.preparation ?? plan.draft?.preparation ?? '').trim(),
  };
}

/** The widgets' props for one day. */
export function widgetDay(day: Date, choice: HolidayChoice, plans: RitualPlan[], templates: TemplateRow[] = []): WidgetDayProps {
  const evening = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 21);
  const moon = moonState(evening);
  // The next principal phase after tonight's (so a full moon tonight points at the last quarter).
  const upcoming = upcomingPhases(evening, 2).find((p) => PRINCIPAL_NAMES[p.phase] !== moon.name || daysApart(day, p.date) > 1);
  const next = upcoming ? `${PRINCIPAL_NAMES[upcoming.phase]} ${whenWords(day, upcoming.date)}` : '';

  const midnight = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const phases = upcomingPhases(midnight, LIST_LENGTH).map((p) => ({
    name: phaseName(p.phase, p.date),
    symbol: SYMBOLS[PRINCIPAL_NAMES[p.phase]],
    date: shortDate(p.date),
    when: whenWords(day, p.date).replace(/^tonight$/, 'today'),
  }));

  const asWidget = (h: { name: string; date: Date }): WidgetHoliday => ({
    name: h.name,
    date: shortDate(h.date),
    when: whenWords(day, h.date).replace(/^tonight$/, 'today'),
    days: Math.max(0, daysApart(day, h.date)),
  });
  const tomorrow = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  const holidays = holidaysBetween(tomorrow, new Date(day.getFullYear() + 1, day.getMonth(), day.getDate()), choice)
    .filter((h) => h.date.getTime() >= tomorrow.getTime())
    .slice(0, LIST_LENGTH)
    .map(asWidget);

  const today = holidaysToday(day, choice);
  const coming = nextHolidayAfterToday(day, choice);
  const holiday = today.length
    ? today.map((h) => h.name).join(' · ')
    : coming
      ? `${coming.name} ${whenWords(day, coming.date).replace(/^tonight$/, 'today')}`
      : '';

  return {
    phase: moon.name,
    percent: Math.round(moon.illumination * 100),
    symbol: SYMBOLS[moon.name],
    sign: moonSign(evening),
    next,
    holiday,
    holidayToday: today.length > 0,
    holidayMeaning: (today[0] ?? coming)?.meaning ?? '',
    nextHoliday: coming ? asWidget(coming) : null,
    phases,
    holidays,
    ...ritualDetails(nextPlan(plans, day), day, templates),
  };
}

/** A month of widget days: now, then each following midnight. */
export function widgetTimeline(now: Date, choice: HolidayChoice, plans: RitualPlan[], templates: TemplateRow[] = [], days = WIDGET_DAYS) {
  return Array.from({ length: days }, (_, i) => {
    const date = i === 0 ? now : new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    return { date, props: widgetDay(date, choice, plans, templates) };
  });
}
