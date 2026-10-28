// What the home and lock screen widgets show each day: tonight's moon, today's
// and the coming holidays, the coming moon phases and your next planned ritual
// with what it needs. The app works out a month of days at once and hands them
// to iOS, so the widgets stay right even when the app isn't opened. Every
// widget gets the same day; each shows its own part. With your covens and the
// To tend list (lib/widgetMore) the next working may be a coven's rite, the
// holidays include your covens', and Coming Up gathers rites, meeting actions
// and what wants tending. Pure, so it can be tested.

import { holidaysBetween, holidaysToday, nextHolidayAfterToday, type HolidayChoice } from './holidays.ts';
import { moonSign, moonState, PRINCIPAL_NAMES, signAtSyzygy, upcomingPhases, type PhaseName } from './moon.ts';
import { nextPlan, planStart, planTemplate } from './rituals/plans.ts';
import type { Ingredient, RitualPlan, TemplateRow } from './rituals/types.ts';
import { cardWords, comingUp, covenHolidaysAhead, moonObservance, notAlreadyYours, nextRiteOn, riteDetails, type WidgetComing, type WidgetMore } from './widgetMore.ts';
import { dayAndTime, dayStart, daysApart, shortDate, whenWords } from './widgetWords.ts';
import { nextWorkingFirst } from './covens/today.ts';

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
  /** The coven that keeps it, when it isn't in your own calendars. */
  from?: string;
};

export type WidgetDayProps = {
  /**
   * The day in the calendar that leads Today when it isn't the ordinary date
   * ("Hunter’s Moon · day 7" when counting by the moon), else "". Widgets
   * built before it existed simply don't show it.
   */
  calendarLine?: string;
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
  // Added after the first widgets (optional, so older layouts simply don't show them):
  /** Your own plan, or your coven's rite or meeting. */
  ritualKind?: 'plan' | 'rite' | 'meeting';
  /** For a coven's: "Moon Circle · You’re going". */
  ritualFrom?: string;
  /** What a tap opens. */
  ritualUrl?: string;
  /** Coming Up, merged and soonest first: what wants tending, coven rites and meetings, meeting actions, holidays. */
  comingUp?: WidgetComing[];
  /** The next moon day your path keeps: "Hekate’s Deipnon tonight", "Noumenia tomorrow". */
  observance?: string;
  observanceMeaning?: string;
  /** The card you drew today: "The Star, reversed". */
  card?: string;
};

export type { WidgetComing, WidgetMore };

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

function phaseName(phase: keyof typeof PRINCIPAL_NAMES, date: Date): string {
  const name = PRINCIPAL_NAMES[phase];
  return phase === 'new' || phase === 'full' ? `${name} in ${signAtSyzygy(date, phase)}` : name;
}

function ritualDetails(plan: RitualPlan | null, day: Date, templates: TemplateRow[]) {
  const empty = { ritual: '', ritualId: '', ritualTitle: '', ritualWhen: '', ritualStart: '', ritualIntention: '', ritualMoon: '', ritualNeeds: [], ritualPrep: '', ritualUrl: 'saltandsovereignty://rituals/planner' };
  if (!plan) return empty;
  const start = planStart(plan);
  const title = plan.title || 'Ritual';
  const url = `saltandsovereignty://rituals/plan/${plan.id}`;
  if (!start) return { ...empty, ritual: title, ritualId: plan.id, ritualTitle: title, ritualKind: 'plan' as const, ritualUrl: url };
  const when = dayAndTime(day, start);
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
    ritualKind: 'plan' as const,
    ritualUrl: url,
  };
}

/** Your next working: your own plan, or your coven's rite or meeting when it comes first (as on Today). */
function nextWorking(day: Date, plans: RitualPlan[], templates: TemplateRow[], more: WidgetMore) {
  const plan = nextPlan(plans, day);
  const rite = more.coven ? nextRiteOn(more.coven, day) : null;
  if (rite && more.coven && nextWorkingFirst(plan ? planStart(plan) : null, rite) === 'rite') return riteDetails(rite, more.coven, day);
  return ritualDetails(plan, day, templates);
}

/** Extra lines worked out by the app for each day (lib/calendars). */
export type WidgetCalendar = { lead?: (day: Date) => string };

/** The widgets' props for one day. */
export function widgetDay(day: Date, choice: HolidayChoice, plans: RitualPlan[], templates: TemplateRow[] = [], calendar: WidgetCalendar = {}, more: WidgetMore = {}): WidgetDayProps {
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

  const asWidget = (h: { name: string; date: Date; from?: string }): WidgetHoliday => ({
    name: h.name,
    date: shortDate(h.date),
    when: whenWords(day, h.date).replace(/^tonight$/, 'today'),
    days: Math.max(0, daysApart(day, h.date)),
    ...(h.from ? { from: h.from } : {}),
  });
  const tomorrow = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  const yours = holidaysBetween(tomorrow, new Date(day.getFullYear() + 1, day.getMonth(), day.getDate()), choice).filter((h) => h.date.getTime() >= tomorrow.getTime());

  // Your covens' holidays, beside your own (one of each).
  const covenDays = more.covenHolidays ?? covenHolidaysAhead(more.coven, day, 366);
  const covenAhead = notAlreadyYours(
    covenDays.filter((h) => h.date.getTime() >= tomorrow.getTime()),
    yours,
  ).map((h) => ({ name: h.name, meaning: h.meaning, date: h.date, from: h.covenName }));
  const ahead = [...yours.map((h) => ({ name: h.name, meaning: h.meaning, date: h.date, from: undefined as string | undefined })), ...covenAhead].sort((a, b) => a.date.getTime() - b.date.getTime());
  const holidays = ahead.slice(0, LIST_LENGTH).map(asWidget);

  const ownToday = holidaysToday(day, choice);
  const today = [
    ...ownToday.map((h) => ({ name: h.name, meaning: h.meaning })),
    ...notAlreadyYours(covenDays.filter((h) => h.date.getTime() === dayStart(day).getTime()), ownToday.map((h) => ({ name: h.name, date: dayStart(day) }))),
  ];
  const ownComing = nextHolidayAfterToday(day, choice);
  const coming = ownComing && (!covenAhead[0] || ownComing.date.getTime() <= covenAhead[0].date.getTime()) ? ownComing : (covenAhead[0] ?? ownComing);
  const holiday = today.length
    ? today.map((h) => h.name).join(' · ')
    : coming
      ? `${coming.name} ${whenWords(day, coming.date).replace(/^tonight$/, 'today')}`
      : '';

  let calendarLine = '';
  try {
    calendarLine = calendar.lead?.(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12)) ?? '';
  } catch {
    // A calendar that can't say leaves the line out.
  }

  return {
    calendarLine,
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
    ...nextWorking(day, plans, templates, more),
    comingUp: comingUp(day, ahead, more),
    ...moonObservance(day, more.settings, today.map((h) => h.name)),
    card: daysApart(more.now ?? day, day) === 0 ? cardWords(more.card) : '',
  };
}

/** A month of widget days: now, then each following midnight. */
export function widgetTimeline(now: Date, choice: HolidayChoice, plans: RitualPlan[], templates: TemplateRow[] = [], days = WIDGET_DAYS, calendar: WidgetCalendar = {}, more: WidgetMore = {}) {
  // Your covens' holidays, once for the whole month (and the year beyond each day).
  const prepared: WidgetMore = { ...more, now, covenHolidays: more.covenHolidays ?? covenHolidaysAhead(more.coven, now, days + 366) };
  return Array.from({ length: days }, (_, i) => {
    const date = i === 0 ? now : new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    return { date, props: widgetDay(date, choice, plans, templates, calendar, prepared) };
  });
}
