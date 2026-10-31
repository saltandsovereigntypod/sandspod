// Which year a Year in review looks back over: the person's own new year.
// Chosen on the Year in review page (setting `year_review_start`), or, left
// to the calendar, the moon calendar's lunar year for someone who counts by
// the moon (its year begins at the first new moon on or after the winter
// solstice, the spring equinox, Samhain, or the new year of a calendar it
// follows: calendars/moon.ts), Samhain for someone who has set the moon
// calendar's year to begin there, and 1 January otherwise. Also when Today
// offers the look back: in the last three weeks of the year and the first
// month of the next. Pure; small, so Today can load it.

import { calendarChoices, hemisphereOf, primaryCalendar, calendarContext, type Place } from '../calendars/index.ts';
import { lunarYearOf, type YearStart } from '../calendars/moon.ts';
import { localDateKey } from '../rituals/lifecycle.ts';

type SettingsLike = Record<string, unknown> | null | undefined;

export const YEAR_START_KEY = 'year_review_start';

export type YearStartChoice = 'calendar' | 'january' | 'samhain' | 'moon';
export const YEAR_STARTS: { id: YearStartChoice; label: string; detail: string }[] = [
  { id: 'calendar', label: 'As my calendar counts it', detail: 'The moon’s year if you count by the moon; otherwise 1 January' },
  { id: 'january', label: '1 January', detail: 'The ordinary calendar year' },
  { id: 'samhain', label: 'Samhain', detail: '1 November (1 May in the south, on the turned Wheel), a modern pagan new year' },
  { id: 'moon', label: 'The moon’s new year', detail: 'As your moon calendar begins its year, under Settings → Calendars' },
];

const isChoice = (value: unknown): value is YearStartChoice => YEAR_STARTS.some((s) => s.id === value);

/** The choice as saved (or 'calendar'). */
export const yearStartChoice = (settings: SettingsLike): YearStartChoice => (isChoice(settings?.[YEAR_START_KEY]) ? (settings![YEAR_START_KEY] as YearStartChoice) : 'calendar');

/** The year start in effect: 'calendar' worked out from the calendar settings. */
export function resolvedStart(settings: SettingsLike): Exclude<YearStartChoice, 'calendar'> {
  const chosen = yearStartChoice(settings);
  if (chosen !== 'calendar') return chosen;
  if (primaryCalendar(settings) === 'moon') return 'moon';
  if (calendarChoices(settings, 'moon').yearStart === 'samhain') return 'samhain';
  return 'january';
}

export type YearSpan = {
  start: Date;
  /** The first day of the next year (exclusive). */
  end: Date;
  startKey: string;
  /** The last day of the year, "YYYY-MM-DD". */
  lastKey: string;
  kind: Exclude<YearStartChoice, 'calendar'>;
  /** "2026", "Samhain 2025 to Samhain 2026", "The moon’s year from 19 December 2025". */
  label: string;
  /** "1 November 2025 to 31 October 2026". */
  range: string;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayWords = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const dayOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

function span(start: Date, end: Date, kind: YearSpan['kind'], label: string): YearSpan {
  const last = addDays(end, -1);
  return { start, end, startKey: localDateKey(start), lastKey: localDateKey(last), kind, label, range: `${dayWords(start)} to ${dayWords(last)}` };
}

/** The year (by the person's own new year) that holds `at`. */
export function yearSpanAt(at: Date, settings: SettingsLike, place: Place | null = null): YearSpan {
  const kind = resolvedStart(settings);
  const day = dayOnly(at);
  if (kind === 'january') return span(new Date(day.getFullYear(), 0, 1), new Date(day.getFullYear() + 1, 0, 1), kind, String(day.getFullYear()));
  const south = hemisphereOf(settings, place) === 'south';
  if (kind === 'samhain') {
    const month = south ? 4 : 10;
    const y = day.getMonth() >= month ? day.getFullYear() : day.getFullYear() - 1;
    return span(new Date(y, month, 1), new Date(y + 1, month, 1), kind, `Samhain ${y} to Samhain ${y + 1}`);
  }
  const ctx = calendarContext(settings, place, 'moon');
  const start = (typeof ctx.options.yearStart === 'string' && ctx.options.yearStart ? ctx.options.yearStart : 'winter-solstice') as YearStart;
  const year = lunarYearOf(day, start, south, ctx);
  return span(year.start.start, year.next.start, kind, `The moon’s year from ${dayWords(year.start.start)}`);
}

/** The year before `span`. */
export const previousSpan = (s: YearSpan, settings: SettingsLike, place: Place | null = null) => yearSpanAt(addDays(s.start, -1), settings, place);
/** The year after `span`. */
export const nextSpan = (s: YearSpan, settings: SettingsLike, place: Place | null = null) => yearSpanAt(s.end, settings, place);

/** Days before the year's end when Today starts to offer the look back, and days after the new year it still does. */
export const TURN_BEFORE = 21;
export const TURN_AFTER = 30;

export type YearTurn = {
  /** 'ending': the year turns in `days` days (0 = its last day); 'begun': a new year began `days` days ago. */
  when: 'ending' | 'begun';
  days: number;
  /** The year to look back over. */
  span: YearSpan;
  line: string;
};

/** Whether Today should offer the look back now, and over which year. Null the rest of the year. */
export function yearTurn(now: Date, settings: SettingsLike, place: Place | null = null): YearTurn | null {
  const day = dayOnly(now);
  const current = yearSpanAt(day, settings, place);
  const toEnd = Math.round((current.end.getTime() - day.getTime()) / 86_400_000) - 1;
  if (toEnd >= 0 && toEnd < TURN_BEFORE) {
    const line = toEnd === 0 ? 'Your year ends today. A good day to look back over it.' : `Your year turns in ${toEnd + 1} ${toEnd + 1 === 1 ? 'day' : 'days'}. A good time to look back over it.`;
    return { when: 'ending', days: toEnd, span: current, line };
  }
  const since = Math.round((day.getTime() - current.start.getTime()) / 86_400_000);
  if (since >= 0 && since < TURN_AFTER) {
    const line = since === 0 ? 'A new year begins today. Look back over the one just gone.' : 'A new year has begun. Look back over the one just gone.';
    return { when: 'begun', days: since, span: previousSpan(current, settings, place), line };
  }
  return null;
}
