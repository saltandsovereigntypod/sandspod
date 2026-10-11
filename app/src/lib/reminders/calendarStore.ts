// "Add to calendar", always optional. Choices and the ids of events written to
// the phone's calendar live on the device, so an edited plan updates its event,
// a removed plan removes it, and nothing is added twice.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { startOfDay } from '../calendar';
import { DEFAULT_TRADITIONS, type HolidayChoice } from '../holidays';
import type { PrincipalPhase } from '../moon';
import { getRituals, removePlan, savePlan } from '../rituals/store';
import type { RitualPlan, TemplateRow } from '../rituals/types';
import {
  astroEvents,
  datedKeyDate,
  DEFAULT_STYLE,
  holidayEvents,
  moonEvents,
  normalizeStyle,
  planEvent,
  SKY_KINDS,
  skyKindOf,
  styleEvent,
  toIcs,
  type CalendarEventSpec,
  type EventStyle,
  type SkyKind,
} from './calendarEvent';
import {
  calendarAccess,
  calendarMode,
  deleteEvent,
  downloadIcs,
  openInGoogleCalendar,
  writableCalendars,
  writeEvent,
  type CalendarAccess,
  type CalendarChoice,
} from './deviceCalendar';

const KEY = 'calendar.settings.v1';

type CalendarSettings = {
  calendarId: string | null;
  /** Put the moon phases chosen for reminders in the calendar too. */
  phases: boolean;
  sabbats: boolean;
  /** Eclipses and retrograde stations. */
  astro: boolean;
  /** Sky event key → calendar event id, for the phases and sabbats written. */
  skyEvents: Record<string, string>;
  /** How each kind of sky event goes into the calendar. */
  styles: Record<SkyKind, EventStyle>;
  /** The styles the events now in the calendar were written with, to tell when they need rewriting. */
  appliedStyles: Partial<Record<SkyKind, string>>;
};

const defaultStyles = (): Record<SkyKind, EventStyle> => ({ moon: DEFAULT_STYLE, holiday: DEFAULT_STYLE, astro: DEFAULT_STYLE });

type CalendarState = CalendarSettings & { loaded: boolean; access: CalendarAccess; calendars: CalendarChoice[] };

let state: CalendarState = {
  loaded: false,
  access: 'unavailable',
  calendars: [],
  calendarId: null,
  phases: false,
  sabbats: false,
  astro: false,
  skyEvents: {},
  styles: defaultStyles(),
  appliedStyles: {},
};
const listeners = new Set<() => void>();
let loading: Promise<void> | null = null;

function set(patch: Partial<CalendarState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

async function persist() {
  const { calendarId, phases, sabbats, astro, skyEvents, styles, appliedStyles } = state;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({ calendarId, phases, sabbats, astro, skyEvents, styles, appliedStyles }));
  } catch {
    // Kept in memory for this session.
  }
}

function load(): Promise<void> {
  loading ??= (async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const saved = raw ? (JSON.parse(raw) as Partial<CalendarSettings>) : {};
      set({
        calendarId: saved.calendarId ?? null,
        phases: saved.phases === true,
        sabbats: saved.sabbats === true,
        astro: saved.astro === true,
        skyEvents: saved.skyEvents && typeof saved.skyEvents === 'object' ? saved.skyEvents : {},
        styles: Object.fromEntries(SKY_KINDS.map((kind) => [kind, normalizeStyle(saved.styles?.[kind])])) as Record<SkyKind, EventStyle>,
        // Saves from before event settings were written all day with no alert.
        appliedStyles:
          saved.appliedStyles && typeof saved.appliedStyles === 'object'
            ? saved.appliedStyles
            : Object.fromEntries(SKY_KINDS.map((kind) => [kind, JSON.stringify(DEFAULT_STYLE)])),
      });
    } catch {
      // Defaults.
    }
    set({ loaded: true, access: await calendarAccess(false) });
    if (state.access === 'granted') await refreshCalendars();
  })();
  return loading;
}

async function refreshCalendars() {
  try {
    const calendars = await writableCalendars();
    const keep = calendars.some((c) => c.id === state.calendarId);
    set({ calendars, calendarId: keep ? state.calendarId : calendars[0]?.id ?? null });
    await persist();
  } catch {
    set({ calendars: [] });
  }
}

/** Ask for calendar access the first time someone chooses "Add to calendar". */
export async function ensureCalendar(): Promise<string | null> {
  await load();
  if (calendarMode !== 'device') return null;
  if (state.access !== 'granted') set({ access: await calendarAccess(true) });
  if (state.access !== 'granted') return null;
  if (!state.calendarId || !state.calendars.length) await refreshCalendars();
  return state.calendarId;
}

export async function chooseCalendar(id: string) {
  set({ calendarId: id });
  await persist();
}

function templateFor(plan: RitualPlan): TemplateRow | null {
  return plan.templateId ? getRituals().templates.find((t) => t.id === plan.templateId) ?? null : null;
}

export type CalendarOutcome = 'written' | 'offered' | 'denied' | 'failed' | 'none';

/**
 * Save a plan and bring its calendar event in line: written or updated when
 * the plan asks for it, removed when it no longer does.
 */
export async function savePlanWithCalendar(plan: RitualPlan): Promise<CalendarOutcome> {
  let next = plan;
  let outcome: CalendarOutcome = 'none';
  if (plan.addToCalendar && calendarMode === 'device') {
    const calendarId = plan.calendarId ?? (await ensureCalendar());
    const spec = planEvent(plan, templateFor(plan));
    if (!calendarId) outcome = 'denied';
    else if (spec) {
      try {
        const eventId = await writeEvent(calendarId, spec, plan.calendarEventId);
        next = { ...plan, calendarEventId: eventId, calendarId };
        outcome = 'written';
      } catch {
        outcome = 'failed';
      }
    }
  } else if (plan.addToCalendar) {
    outcome = 'offered';
  } else if (plan.calendarEventId) {
    await deleteEvent(plan.calendarEventId);
    next = { ...plan, calendarEventId: null, calendarId: null };
  }
  await savePlan(next);
  return outcome;
}

export async function removePlanWithCalendar(plan: RitualPlan) {
  if (plan.calendarEventId) await deleteEvent(plan.calendarEventId);
  await removePlan(plan.id);
}

/** For the web and Expo Go: hand the plan to Google Calendar. */
export async function openPlanInGoogle(plan: RitualPlan) {
  const spec = planEvent(plan, templateFor(plan));
  if (spec) await openInGoogleCalendar(spec);
}

export function downloadPlan(plan: RitualPlan): boolean {
  const spec = planEvent(plan, templateFor(plan));
  return !!spec && downloadIcs(toIcs([spec], new Date()), `${slug(plan.title)}.ics`);
}

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ritual';
}

// The calendars chosen in Settings → Calendar & holidays (set by the Today screen).
let holidaySelection: HolidayChoice = { traditions: DEFAULT_TRADITIONS, custom: [] };

/** Use these calendars for holiday events. Returns true when the choice changed. */
export function setHolidaySelection(choice: HolidayChoice): boolean {
  if (JSON.stringify(choice) === JSON.stringify(holidaySelection)) return false;
  holidaySelection = choice;
  return true;
}

const styled = (kind: SkyKind, specs: CalendarEventSpec[]) => specs.map((spec) => styleEvent(spec, state.styles[kind]));

function skySpecs(phases: Record<PrincipalPhase, boolean>, now: Date): CalendarEventSpec[] {
  return [
    ...(state.phases ? styled('moon', moonEvents(phases, now)) : []),
    ...(state.sabbats ? styled('holiday', holidayEvents(now, 365, holidaySelection)) : []),
    ...(state.astro ? styled('astro', astroEvents(now, 365)) : []),
  ];
}

/** The next event of a kind as it would go into the calendar, for the settings preview. */
export function sampleEvent(kind: SkyKind, phases: Record<PrincipalPhase, boolean>, style: EventStyle): CalendarEventSpec | null {
  const now = new Date();
  const anyPhase = Object.values(phases).some(Boolean) ? phases : { new: true, firstQuarter: true, full: true, lastQuarter: true };
  const specs =
    kind === 'moon' ? moonEvents(anyPhase, now, 40) : kind === 'holiday' ? holidayEvents(now, 365, holidaySelection) : astroEvents(now, 365);
  return specs[0] ? styleEvent(specs[0], style) : null;
}

let skySync: Promise<void> = Promise.resolve();

/** Bring the phone calendar's moon and sabbat events in line with the choices. Serialized, so quick changes never add an event twice. */
export function syncSkyCalendar(phases: Record<PrincipalPhase, boolean>): Promise<void> {
  skySync = skySync.then(() => syncSkyNow(phases)).catch(() => undefined);
  return skySync;
}

async function syncSkyNow(phases: Record<PrincipalPhase, boolean>) {
  await load();
  if (calendarMode !== 'device' || state.access !== 'granted' || !state.calendarId) return;
  const now = new Date();
  const wanted = new Map(skySpecs(phases, now).map((s) => [s.key, s]));
  const skyEvents = { ...state.skyEvents };
  for (const [key, id] of Object.entries(skyEvents)) {
    if (!wanted.has(key)) {
      // Remove what is no longer chosen; events that have simply passed stay in the calendar.
      const phase = key.startsWith('moon-') ? (key.split('-')[1] as PrincipalPhase) : null;
      // A holiday still to come that isn't wanted belongs to a calendar no longer chosen.
      const keyDate = datedKeyDate(key);
      const deselected = !!keyDate && keyDate.getTime() >= startOfDay(now).getTime();
      const stillChosen = phase
        ? state.phases && phases[phase]
        : key.startsWith('astro-')
          ? state.astro && !deselected
          : state.sabbats && !deselected;
      if (!stillChosen) await deleteEvent(id);
      delete skyEvents[key];
    }
  }
  // A kind whose settings changed since its events were written gets them rewritten.
  const restyled = new Set(SKY_KINDS.filter((kind) => state.appliedStyles[kind] !== JSON.stringify(state.styles[kind])));
  const appliedStyles = { ...state.appliedStyles };
  let complete = true;
  for (const [key, spec] of wanted) {
    const kind = skyKindOf(key);
    const existing = skyEvents[key];
    if (existing && !(kind && restyled.has(kind))) continue;
    try {
      skyEvents[key] = await writeEvent(state.calendarId, spec, existing ?? null);
    } catch {
      // Try again next time.
      complete = false;
    }
  }
  if (complete) for (const kind of SKY_KINDS) appliedStyles[kind] = JSON.stringify(state.styles[kind]);
  set({ skyEvents, appliedStyles });
  await persist();
}

export async function setSkyChoices(change: Partial<Pick<CalendarSettings, 'phases' | 'sabbats' | 'astro'>>, phases: Record<PrincipalPhase, boolean>) {
  const turningOn = change.phases || change.sabbats || change.astro;
  if (turningOn && calendarMode === 'device' && !(await ensureCalendar())) return 'denied' as const;
  set(change);
  await persist();
  await syncSkyCalendar(phases);
  return 'ok' as const;
}

/** Change how one kind of sky event goes into the calendar; events already there are updated to match. */
export async function setEventStyle(kind: SkyKind, style: EventStyle, phases: Record<PrincipalPhase, boolean>) {
  await load();
  set({ styles: { ...state.styles, [kind]: normalizeStyle(style) } });
  await persist();
  await syncSkyCalendar(phases);
}

/** The chosen moon phases and sabbats as one .ics file (web). */
export function downloadSky(phases: Record<PrincipalPhase, boolean>): boolean {
  const now = new Date();
  const specs = [
    ...styled('moon', moonEvents(phases, now)),
    ...styled('holiday', holidayEvents(now, 365, holidaySelection)),
    ...styled('astro', astroEvents(now, 365)),
  ];
  return specs.length > 0 && downloadIcs(toIcs(specs, now), 'moon-holidays-and-sky.ics');
}

export function useCalendar(): CalendarState {
  useEffect(() => {
    void load();
  }, []);
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

export { calendarMode };
