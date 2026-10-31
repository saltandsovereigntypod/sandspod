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
//   calendar_coven             JSON: the coven whose calendar you took for your
//                              own, and what you had before (see covens/moonCalendar.ts)
//
// An option can follow another calendar (the moon's year beginning as the
// Attic calendar's, `calendar_opt_moon_yearStart = 'attic'`): it is offered,
// and counts, only while that calendar is shown under Also show. The saved
// value is kept when it isn't, so showing the calendar again brings it back;
// meanwhile the choice reads as its default and Settings says why.
//
// (`calendar_primary` already names the main holiday tradition, see
// traditionDay.ts, so the counting choice has its own key.)

import type { Holiday } from '../holidays.ts';
import { pathName } from '../library/traditions.ts';
import { hemisphereFrom } from '../seasons.ts';
import { MOON_CALENDAR } from './moon.ts';
import { TRADITIONAL_CALENDARS } from './registry.ts';
import type { CalendarChoice, CalendarContext, CalendarDate, CalendarDef, CalendarEvent, CalendarId, CalendarMark, CalendarOption, Confidence, Place } from './types.ts';

export type { CalendarChoice, CalendarContext, CalendarDate, CalendarDef, CalendarEvent, CalendarId, CalendarMark, CalendarOption, Confidence, Place } from './types.ts';
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

/** Whether an option may be chosen now: it follows no calendar, or one shown beside the date. */
export function optionOffered(settings: SettingsLike, option: CalendarOption): boolean {
  return !option.follows || shownCalendars(settings).includes(option.follows);
}

/** One calendar's choices, each its saved value or its default (also when it follows a calendar no longer shown). */
export function calendarChoices(settings: SettingsLike, id: string): Record<string, string> {
  const def = calendarById(id);
  const out: Record<string, string> = {};
  for (const choice of def?.choices ?? []) {
    const saved = settings?.[optionKey(id, choice.key)];
    const option = typeof saved === 'string' ? choice.options.find((o) => o.value === saved) : undefined;
    out[choice.key] = option && optionOffered(settings, option) ? option.value : choice.default;
  }
  return out;
}

/** A choice as Settings shows it: the options open now, the one in force, and what to say about it. */
export type ChoiceView = {
  key: string;
  label: string;
  options: CalendarOption[];
  value: string;
  /** The note of the option in force. */
  note: string;
  /** How to get options that follow a calendar, when none is open now. */
  hint: string;
  /** Said when the saved option follows a calendar no longer shown, so its default is used for now. */
  fallback: string;
  /** Said when another choice makes this one count for nothing just now. */
  aside: string;
};

/** A calendar's choices for Settings (the app's and the website's), with options that follow calendars only while those are shown. */
export function choiceViews(settings: SettingsLike, id: string): ChoiceView[] {
  const def = calendarById(id);
  const values = calendarChoices(settings, id);
  return (def?.choices ?? []).map((choice: CalendarChoice) => {
    const value = values[choice.key];
    const options = choice.options.filter((o) => optionOffered(settings, o));
    const saved = settings?.[optionKey(id, choice.key)];
    const stale = typeof saved === 'string' && saved !== value ? choice.options.find((o) => o.value === saved && o.follows) : undefined;
    const inForce = choice.options.find((o) => o.value === value);
    const followed = stale?.follows ? calendarById(stale.follows) : undefined;
    const hasFollowers = choice.options.some((o) => o.follows);
    return {
      key: choice.key,
      label: choice.label,
      options,
      value,
      note: inForce?.note ?? '',
      hint: hasFollowers && !options.some((o) => o.follows) && choice.followHint ? choice.followHint : '',
      fallback: followed ? `You chose “${stale?.label}”, but the ${followed.name} isn’t shown under Also show now, so this is “${inForce?.label ?? ''}” for the moment. Show it again and your choice comes back.` : '',
      aside: id === 'moon' && choice.key === 'southNames' && !['folk', 'numbered'].includes(values.names) ? 'The months take another calendar’s names just now, so this applies only to the full moons’ folk names in their notes.' : '',
    };
  });
}

/**
 * North or south: the person's choice, else the place, else a southern Wheel
 * of the Year chosen on its own, else north.
 */
export function hemisphereOf(settings: SettingsLike, place: Place | null): 'north' | 'south' {
  return hemisphereFrom(settings, place?.latitude);
}

export function calendarContext(settings: SettingsLike, place: Place | null, id: string): CalendarContext {
  const options = calendarChoices(settings, id);
  const hemisphere = hemisphereOf(settings, place);
  // The calendars this one's choices follow, each with the person's own choices for it.
  const def = calendarById(id);
  const related: Partial<Record<CalendarId, CalendarContext>> = {};
  for (const choice of def?.choices ?? []) {
    const follows = choice.options.find((o) => o.value === options[choice.key])?.follows;
    if (follows && !related[follows]) related[follows] = { place, hemisphere, options: calendarChoices(settings, follows) };
  }
  return Object.keys(related).length ? { place, hemisphere, options, related } : { place, hemisphere, options };
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
    recurs: event.recurs ?? (event.calendar === 'moon' ? 'monthly' : 'yearly'),
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
 * first (by My path), then those of your covens' tradition (covenPaths, from
 * covens/covenTradition.ts), then the rest in registry order. When the moon
 * leads it is left out, as it is already shown.
 */
export function calendarsForSettings(settings: SettingsLike, path: string[], covenPaths: string[] = []): CalendarDef[] {
  const list = CALENDARS.filter((c) => !(primaryCalendar(settings) === 'moon' && c.id === 'moon'));
  const order = [...new Set([...path, ...covenPaths])];
  const onPath = (c: CalendarDef) => (c.path && order.includes(c.path) ? order.indexOf(c.path) : -1);
  return [...list.filter((c) => onPath(c) >= 0).sort((a, b) => onPath(a) - onPath(b)), ...list.filter((c) => onPath(c) < 0)];
}

/** "Roman", "Hellenic"…: the path a calendar belongs to, for a caption. */
export function calendarPathName(def: CalendarDef): string {
  return def.path ? pathName(def.path) : '';
}
