// Every calendar the app can count days by, and what the person chose in
// Settings → Calendar & holidays. The moon's months can lead (instead of the
// ordinary date); any calendar can be shown beside it. Every date the app
// stores stays an ordinary date. Pure, so it can be tested.
//
// Settings keys (all strings, synced with the rest of the settings row):
//   calendar_count_by          'standard' (default) | 'moon': what leads on Today
//   calendar_extra             comma-separated calendar ids shown beside it
//   calendar_hemisphere        'auto' (default: from the place) | 'north' | 'south'
//   calendar_opt_<id>_<key>    one choice of one calendar, e.g. calendar_opt_moon_yearStart
//
// (`calendar_primary` already names the main holiday tradition, see
// traditionDay.ts, so the counting choice has its own key.)

import type { Holiday } from '../holidays.ts';
import { pathName } from '../library/traditions.ts';
import { MOON_CALENDAR } from './moon.ts';
import { TRADITIONAL_CALENDARS } from './registry.ts';
import type { CalendarContext, CalendarDate, CalendarDef, CalendarEvent, CalendarId, CalendarMark, Confidence, Place } from './types.ts';

export type { CalendarContext, CalendarDate, CalendarDef, CalendarEvent, CalendarId, CalendarMark, Confidence, Place } from './types.ts';
export { MOON_CALENDAR } from './moon.ts';

type SettingsLike = Record<string, unknown> | null | undefined;

/** The moon first, then the traditional calendars that exist (see registry.ts). */
export const CALENDARS: CalendarDef[] = [MOON_CALENDAR, ...TRADITIONAL_CALENDARS.filter((c) => c.id !== 'moon')];

export const calendarById = (id: string): CalendarDef | undefined => CALENDARS.find((c) => c.id === id);

export type PrimaryCalendar = 'standard' | 'moon';

export const COUNT_KEY = 'calendar_count_by';
export const EXTRA_KEY = 'calendar_extra';
export const HEMISPHERE_KEY = 'calendar_hemisphere';
export const optionKey = (id: string, key: string) => `calendar_opt_${id}_${key}`;

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  historical: 'Historical',
  reconstructed: 'Reconstructed',
  modern: 'Modern',
};

/** What Today leads with: the ordinary date, or the moon's own date. */
export function primaryCalendar(settings: SettingsLike): PrimaryCalendar {
  return settings?.[COUNT_KEY] === 'moon' ? 'moon' : 'standard';
}

/** The calendars shown beside the lead one, in registry order; unknown ids and the lead are left out. */
export function shownCalendars(settings: SettingsLike): CalendarId[] {
  const raw = settings?.[EXTRA_KEY];
  const ids = new Set(typeof raw === 'string' ? raw.split(',').map((id) => id.trim()).filter(Boolean) : []);
  const lead = primaryCalendar(settings);
  return CALENDARS.filter((c) => ids.has(c.id) && !(lead === 'moon' && c.id === 'moon')).map((c) => c.id);
}

/** The settings value for `calendar_extra` with `id` turned on or off. */
export function withShown(settings: SettingsLike, id: CalendarId, on: boolean): string {
  const raw = settings?.[EXTRA_KEY];
  const ids = typeof raw === 'string' ? raw.split(',').map((x) => x.trim()).filter(Boolean) : [];
  const next = on ? [...new Set([...ids, id])] : ids.filter((x) => x !== id);
  return next.join(',');
}

/** One calendar's choices, each its saved value or its default. */
export function calendarChoices(settings: SettingsLike, id: string): Record<string, string> {
  const def = calendarById(id);
  const out: Record<string, string> = {};
  for (const choice of def?.choices ?? []) {
    const saved = settings?.[optionKey(id, choice.key)];
    out[choice.key] = typeof saved === 'string' && choice.options.some((o) => o.value === saved) ? saved : choice.default;
  }
  return out;
}

/**
 * North or south: the person's choice, else the place, else a southern Wheel
 * of the Year chosen on its own, else north.
 */
export function hemisphereOf(settings: SettingsLike, place: Place | null): 'north' | 'south' {
  const chosen = settings?.[HEMISPHERE_KEY];
  if (chosen === 'north' || chosen === 'south') return chosen;
  if (place && Number.isFinite(place.latitude)) return place.latitude < 0 ? 'south' : 'north';
  const traditions = typeof settings?.calendar_traditions === 'string' ? settings.calendar_traditions.split(',').map((t) => t.trim()) : [];
  return traditions.includes('wheel_south') && !traditions.includes('wheel') ? 'south' : 'north';
}

export function calendarContext(settings: SettingsLike, place: Place | null, id: string): CalendarContext {
  return { place, hemisphere: hemisphereOf(settings, place), options: calendarChoices(settings, id) };
}

export type CalendarLine = {
  id: CalendarId;
  name: string;
  confidence: Confidence;
  /** True for the moon's date when it leads Today. */
  lead: boolean;
  short: string;
  long: string;
  marks: CalendarMark[];
  date: CalendarDate;
};

/** A calendar's date for `day`, or null if the calendar can't say (it never throws). */
export function lineFor(def: CalendarDef, day: Date, settings: SettingsLike, place: Place | null, lead = false): CalendarLine | null {
  try {
    const date = def.dateOf(day, calendarContext(settings, place, def.id));
    return { id: def.id, name: def.name, confidence: def.confidence, lead, short: date.short, long: date.long, marks: date.marks, date };
  } catch {
    return null;
  }
}

/** The lines to show on Today: the moon's date first when it leads, then each calendar shown beside it. */
export function todayLines(now: Date, settings: SettingsLike, place: Place | null): CalendarLine[] {
  const lines: CalendarLine[] = [];
  if (primaryCalendar(settings) === 'moon') {
    const moon = lineFor(MOON_CALENDAR, now, settings, place, true);
    if (moon) lines.push(moon);
  }
  for (const id of shownCalendars(settings)) {
    const def = calendarById(id);
    const line = def && lineFor(def, now, settings, place);
    if (line) lines.push(line);
  }
  return lines;
}

/** The lead line alone (the moon's short date), or '' when the ordinary date leads. For widgets. */
export function leadLine(day: Date, settings: SettingsLike, place: Place | null): string {
  return primaryCalendar(settings) === 'moon' ? (lineFor(MOON_CALENDAR, day, settings, place, true)?.short ?? '') : '';
}

/** Observances from the lead and shown calendars, between two days inclusive, in date order. */
export function calendarEventsBetween(from: Date, to: Date, settings: SettingsLike, place: Place | null): CalendarEvent[] {
  const ids = new Set<string>(shownCalendars(settings));
  if (primaryCalendar(settings) === 'moon') ids.add('moon');
  const out: CalendarEvent[] = [];
  for (const def of CALENDARS) {
    if (!ids.has(def.id)) continue;
    try {
      out.push(...def.eventsBetween(from, to, calendarContext(settings, place, def.id)));
    } catch {
      // One calendar failing shouldn't hide the others.
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime() || a.name.localeCompare(b.name));
}

/** The tradition id a calendar's events carry when shown as holidays ('calendar:roman'). */
export const calendarTraditionId = (id: CalendarId) => `calendar:${id}`;

/** A calendar observance in the shape of a holiday, for the holiday lists. */
export function eventAsHoliday(event: CalendarEvent): Holiday {
  const def = calendarById(event.calendar);
  return {
    id: event.id,
    name: event.name,
    meaning: event.meaning,
    date: event.date,
    days: Math.max(1, event.days),
    traditions: [def?.name ?? event.calendar],
    traditionIds: [calendarTraditionId(event.calendar)],
    recurs: event.calendar === 'moon' ? 'monthly' : 'yearly',
  };
}

const sameStart = (a: Holiday, b: Holiday) => a.date.getTime() === b.date.getTime() && a.name.split(' ')[0].toLowerCase() === b.name.split(' ')[0].toLowerCase();

/**
 * The holidays with the calendars' observances merged in, in date order. An
 * observance that is already a holiday that day (by its first word, as
 * holidays.ts merges its own) only adds the calendar's name to it.
 */
export function mergeCalendarEvents(holidays: Holiday[], events: CalendarEvent[]): Holiday[] {
  const out = holidays.map((h) => ({ ...h, traditions: [...h.traditions], traditionIds: [...h.traditionIds] }));
  for (const event of events) {
    const holiday = eventAsHoliday(event);
    const existing = out.find((h) => sameStart(h, holiday));
    if (existing) {
      if (!existing.traditions.includes(holiday.traditions[0])) existing.traditions.push(holiday.traditions[0]);
      if (!existing.traditionIds.includes(holiday.traditionIds[0])) existing.traditionIds.push(holiday.traditionIds[0]);
      continue;
    }
    out.push(holiday);
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime() || a.name.localeCompare(b.name));
}

/** A key that changes whenever any calendar setting does, for memo and effect dependencies. */
export function calendarSettingsKey(settings: SettingsLike): string {
  if (!settings) return '';
  return Object.keys(settings)
    .filter((key) => key === COUNT_KEY || key === EXTRA_KEY || key === HEMISPHERE_KEY || key === 'calendar_traditions' || key.startsWith('calendar_opt_'))
    .sort()
    .map((key) => `${key}=${String(settings[key])}`)
    .join('|');
}

/**
 * The calendars for the "Also show" list: those of the person's own path
 * first (by My path), then the rest in registry order. When the moon leads it
 * is left out, as it is already shown.
 */
export function calendarsForSettings(settings: SettingsLike, path: string[]): CalendarDef[] {
  const list = CALENDARS.filter((c) => !(primaryCalendar(settings) === 'moon' && c.id === 'moon'));
  const onPath = (c: CalendarDef) => (c.path && path.includes(c.path) ? path.indexOf(c.path) : -1);
  return [...list.filter((c) => onPath(c) >= 0).sort((a, b) => onPath(a) - onPath(b)), ...list.filter((c) => onPath(c) < 0)];
}

/** "Roman", "Hellenic"…: the path a calendar belongs to, for a caption. */
export function calendarPathName(def: CalendarDef): string {
  return def.path ? pathName(def.path) : '';
}
