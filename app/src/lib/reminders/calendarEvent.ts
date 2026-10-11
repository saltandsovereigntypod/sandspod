// Calendar events for planned rituals, chosen moon phases and sabbats, and the
// two ways to hand them to a calendar without device access: an .ics file and
// a Google Calendar link. Pure, so the output can be tested.

import { eclipseLabel, eclipsesBetween } from '../astro/eclipses.ts';
import { eclipseMeaning, RETROGRADE_MEANING } from '../astro/meanings.ts';
import { nextStation } from '../astro/planets.ts';
import { startOfDay } from '../calendar.ts';
import { DEFAULT_TRADITIONS, holidaysBetween, type HolidayChoice } from '../holidays.ts';
import { moonState, PRINCIPAL_NAMES, signAtSyzygy, upcomingPhases, type PrincipalPhase } from '../moon.ts';
import { minutesToSeconds } from '../rituals/lifecycle.ts';
import { planStart } from '../rituals/plans.ts';
import type { Ingredient, RitualPlan, TemplateRow } from '../rituals/types.ts';

export type CalendarEventSpec = {
  /** Stable per plan or sky event, so adding again updates rather than duplicates. */
  key: string;
  title: string;
  start: Date;
  /** Exclusive. For all-day events, the start of the next day. */
  end: Date;
  allDay: boolean;
  notes: string;
  /** The exact moment of a sky event (phase, eclipse, station), when it has one. */
  exact?: Date;
  /** Calendar alerts, in minutes from the start (negative is before). */
  alarms?: number[];
};

// ---------------------------------------------------------------- event settings

/** The three kinds of sky event someone can add to their calendar. */
export type SkyKind = 'moon' | 'holiday' | 'astro';
export const SKY_KINDS: SkyKind[] = ['moon', 'holiday', 'astro'];

/** How every event of one kind goes into the calendar. */
export type EventStyle = {
  /** All day, at the exact moment (moon and sky events), or at a set time of day. */
  timing: 'allDay' | 'exact' | 'time';
  /** Time of day for 'time', in minutes after midnight. */
  minutes: number;
  /** Length of a timed event, in minutes. */
  duration: number;
  /** One alert, in minutes from the start (all-day events start at midnight), or none. */
  alert: number | null;
  /** Include what the event means in its notes. */
  details: boolean;
};

export const DEFAULT_STYLE: EventStyle = { timing: 'allDay', minutes: 19 * 60, duration: 60, alert: null, details: true };
export const DURATION_CHOICES = [30, 60, 120] as const;

/** The alerts that make sense for a timing, with how they read. */
export function alertChoices(timing: EventStyle['timing']): { offset: number; label: string }[] {
  return timing === 'allDay'
    ? [
        { offset: 9 * 60, label: 'Morning of, 9 am' },
        { offset: -15 * 60, label: 'Day before, 9 am' },
        { offset: -5 * 60, label: 'Day before, 7 pm' },
      ]
    : [
        { offset: 0, label: 'At the time' },
        { offset: -15, label: '15 minutes before' },
        { offset: -60, label: 'An hour before' },
        { offset: -1440, label: 'A day before' },
      ];
}

/** Stored settings from any shape, with defaults filled in. */
export function normalizeStyle(raw: unknown): EventStyle {
  const value = raw && typeof raw === 'object' ? (raw as Partial<EventStyle>) : {};
  const timing = value.timing === 'exact' || value.timing === 'time' ? value.timing : 'allDay';
  const minutes = Number(value.minutes);
  const duration = Number(value.duration);
  const alert = value.alert == null ? null : Number(value.alert);
  return {
    timing,
    minutes: Number.isInteger(minutes) && minutes >= 0 && minutes < 1440 ? minutes : DEFAULT_STYLE.minutes,
    duration: (DURATION_CHOICES as readonly number[]).includes(duration) ? duration : DEFAULT_STYLE.duration,
    alert: alert != null && alertChoices(timing).some((choice) => choice.offset === alert) ? alert : null,
    details: value.details !== false,
  };
}

export const skyKindOf = (key: string): SkyKind | null =>
  key.startsWith('moon-') ? 'moon' : key.startsWith('holiday-') ? 'holiday' : key.startsWith('astro-') ? 'astro' : null;

const FOOTER = 'From the Salt & Sovereignty app.';

/** One sky event laid out the way its kind is set to go into the calendar. */
export function styleEvent(spec: CalendarEventSpec, style: EventStyle): CalendarEventSpec {
  const notes = style.details ? spec.notes : FOOTER;
  const alarms = style.alert == null ? undefined : [style.alert];
  const timed = (start: Date): CalendarEventSpec => ({
    ...spec,
    start,
    end: new Date(start.getTime() + style.duration * 60_000),
    allDay: false,
    notes,
    alarms,
  });
  if (style.timing === 'exact' && spec.exact) return timed(spec.exact);
  if (style.timing === 'time' || style.timing === 'exact') {
    const day = spec.start;
    return timed(new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(style.minutes / 60), style.minutes % 60));
  }
  return { ...spec, notes, alarms };
}

const DEFAULT_MINUTES = 60;

function clock(date: Date): string {
  const h = date.getHours();
  return `${h % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

function joinNames(items: { name: string }[]): string {
  return items.map((i) => i.name).join(', ');
}

/** How long a planned ritual takes: its template's timers, or an hour. */
function planMinutes(plan: RitualPlan, template: TemplateRow | null): number {
  const seconds =
    template?.estimated_duration_seconds ??
    plan.draft?.steps.reduce((sum, s) => sum + (minutesToSeconds(s.minutes) ?? 0), 0) ??
    0;
  const minutes = Math.round(seconds / 60);
  // Timers only cover part of a ritual; leave room to open and close.
  return Math.max(DEFAULT_MINUTES, minutes + 20);
}

function moonNote(at: Date): string {
  const moon = moonState(at);
  const syzygy = moon.name === 'Full Moon' ? 'full' : moon.name === 'New Moon' ? 'new' : null;
  return syzygy ? `${moon.name} in ${signAtSyzygy(at, syzygy)}` : moon.name;
}

/** The event for a planned ritual: name, time, the moon that night and what to bring. */
export function planEvent(plan: RitualPlan, template: TemplateRow | null = null): CalendarEventSpec | null {
  const start = planStart(plan);
  if (!start) return null;
  const end = new Date(start.getTime() + planMinutes(plan, template) * 60_000);
  const ingredients: Ingredient[] = plan.ingredients.length
    ? plan.ingredients
    : ((template?.metadata?.ingredients as Ingredient[] | undefined) ?? plan.draft?.ingredients ?? []);

  const lines = [
    `Moon: ${moonNote(start)}`,
    plan.intention ? `Intention: ${plan.intention}` : null,
    template ? `Ritual: ${template.title}` : plan.draft ? `Spell: ${plan.draft.title}` : null,
    ingredients.length ? `Bring: ${joinNames(ingredients)}` : template?.preparation ? `Preparation: ${template.preparation}` : null,
    'Planned in the Salt & Sovereignty app.',
  ].filter(Boolean);

  return { key: `plan-${plan.id}`, title: plan.title || 'Ritual', start, end, allDay: false, notes: lines.join('\n') };
}

function allDay(date: Date): { start: Date; end: Date } {
  const start = startOfDay(date);
  return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1) };
}

/** All-day events for the chosen moon phases over the coming months. */
export function moonEvents(phases: Record<PrincipalPhase, boolean>, from: Date, days = 180): CalendarEventSpec[] {
  if (!Object.values(phases).some(Boolean)) return [];
  const until = from.getTime() + days * 86_400_000;
  return upcomingPhases(from, Math.ceil(days / 7) + 4)
    .filter((e) => phases[e.phase] && e.date.getTime() <= until)
    .map((e) => {
      const name = PRINCIPAL_NAMES[e.phase];
      const title = e.phase === 'new' || e.phase === 'full' ? `${name} in ${signAtSyzygy(e.date, e.phase)}` : name;
      return {
        key: `moon-${e.phase}-${e.date.toISOString().slice(0, 10)}`,
        title,
        ...allDay(e.date),
        allDay: true,
        exact: e.date,
        notes: `Exact at ${clock(e.date)}.\nFrom the Salt & Sovereignty app.`,
      };
    });
}

const isoDay = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const slugName = (name: string) =>
  name
    .replace(/æ/gi, 'ae')
    .replace(/þ/gi, 'th')
    .replace(/ð/gi, 'd')
    .replace(/ø/gi, 'o')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * All-day events for the holidays of the chosen calendars in the coming
 * months, with their meanings. Keys end in the date, so a holiday that is no
 * longer chosen can be told apart from one that has simply passed.
 */
export function holidayEvents(from: Date, days = 365, choice: HolidayChoice = { traditions: DEFAULT_TRADITIONS, custom: [] }): CalendarEventSpec[] {
  const until = new Date(from.getTime() + days * 86_400_000);
  return holidaysBetween(from, until, choice)
    .filter((holiday) => holiday.date.getTime() >= startOfDay(from).getTime())
    .map((holiday) => {
      const start = startOfDay(holiday.date);
      return {
        key: `holiday-${slugName(holiday.name)}-${isoDay(start)}`,
        title: holiday.name,
        start,
        end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + holiday.days),
        allDay: true,
        notes: `${holiday.meaning}\n${holiday.traditions.join(' · ')}.\nFrom the Salt & Sovereignty app.`,
      };
    });
}

/** The date a holiday event key ends in (holiday-<name>-YYYY-MM-DD), if it has one. */
export function holidayKeyDate(key: string): Date | null {
  const match = /^holiday-.*-(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

// ---------------------------------------------------------------- .ics

const pad = (n: number) => String(n).padStart(2, '0');

function icsUtc(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function icsDate(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

/** RFC 5545 text escaping. */
export function icsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold lines longer than 75 octets, as RFC 5545 asks. */
export function foldLine(line: string): string {
  const bytes = (s: string) => new TextEncoder().encode(s).length;
  if (bytes(line) <= 75) return line;
  const parts: string[] = [];
  let current = '';
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (bytes(current + char) > limit) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join('\r\n ');
}

export const ICS_DOMAIN = 'app.saltandsovereignty.com';

export function toIcs(events: CalendarEventSpec[], now: Date): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Salt & Sovereignty//Rituals//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const event of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.key}@${ICS_DOMAIN}`,
      `DTSTAMP:${icsUtc(now)}`,
      ...(event.allDay
        ? [`DTSTART;VALUE=DATE:${icsDate(event.start)}`, `DTEND;VALUE=DATE:${icsDate(event.end)}`]
        : [`DTSTART:${icsUtc(event.start)}`, `DTEND:${icsUtc(event.end)}`]),
      `SUMMARY:${icsText(event.title)}`,
      `DESCRIPTION:${icsText(event.notes)}`,
      ...(event.alarms ?? []).flatMap((offset) => [
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${icsText(event.title)}`,
        `TRIGGER:${offset < 0 ? '-' : ''}PT${Math.abs(offset)}M`,
        'END:VALARM',
      ]),
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** A link that opens Google Calendar with the event filled in. */
export function googleCalendarUrl(event: CalendarEventSpec): string {
  const dates = event.allDay ? `${icsDate(event.start)}/${icsDate(event.end)}` : `${icsUtc(event.start)}/${icsUtc(event.end)}`;
  const params = [
    ['action', 'TEMPLATE'],
    ['text', event.title],
    ['dates', dates],
    ['details', event.notes],
  ]
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return `https://calendar.google.com/calendar/render?${params}`;
}

/**
 * All-day events for eclipses and for retrograde stations of Mercury
 * through Saturn, with what they mean. Keys end in the date, like holidays.
 */
export function astroEvents(from: Date, days = 365): CalendarEventSpec[] {
  const until = new Date(from.getTime() + days * 86_400_000);
  const specs: CalendarEventSpec[] = [];
  for (const e of eclipsesBetween(from, until)) {
    const start = startOfDay(e.date);
    specs.push({
      key: `astro-eclipse-${e.type}-${isoDay(start)}`,
      title: eclipseLabel(e),
      start,
      end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1),
      allDay: true,
      exact: e.date,
      notes: `Exact at ${clock(e.date)}.\n${eclipseMeaning(e.type, e.kind)}\nFrom the Salt & Sovereignty app.`,
    });
  }
  for (const planet of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const) {
    let cursor = from;
    for (let guard = 0; guard < 12; guard++) {
      const station = nextStation(planet, cursor, days);
      if (!station || station.date.getTime() > until.getTime()) break;
      const start = startOfDay(station.date);
      specs.push({
        key: `astro-station-${planet.toLowerCase()}-${station.turning}-${isoDay(start)}`,
        title: `${planet} ${station.turning === 'retrograde' ? 'turns retrograde' : 'turns direct'}`,
        start,
        end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1),
        allDay: true,
        exact: station.date,
        notes: `${station.turning === 'retrograde' ? RETROGRADE_MEANING[planet] ?? '' : `${planet} moves forward again.`}\nFrom the Salt & Sovereignty app.`,
      });
      cursor = new Date(station.date.getTime() + 86_400_000);
    }
  }
  return specs.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** The date an astro or holiday event key ends in, if it has one. */
export function datedKeyDate(key: string): Date | null {
  const match = /^(?:holiday|astro)-.*-(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}
