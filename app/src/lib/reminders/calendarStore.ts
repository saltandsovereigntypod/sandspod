// "Add to calendar", always optional. Choices and the ids of events written to
// the phone's calendar live on the device, so an edited plan updates its event,
// a removed plan removes it, and nothing is added twice.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import type { PrincipalPhase } from '../moon';
import { getRituals, removePlan, savePlan } from '../rituals/store';
import type { RitualPlan, TemplateRow } from '../rituals/types';
import { moonEvents, planEvent, sabbatEvents, toIcs, type CalendarEventSpec } from './calendarEvent';
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
  /** Sky event key → calendar event id, for the phases and sabbats written. */
  skyEvents: Record<string, string>;
};

type CalendarState = CalendarSettings & { loaded: boolean; access: CalendarAccess; calendars: CalendarChoice[] };

let state: CalendarState = {
  loaded: false,
  access: 'unavailable',
  calendars: [],
  calendarId: null,
  phases: false,
  sabbats: false,
  skyEvents: {},
};
const listeners = new Set<() => void>();
let loading: Promise<void> | null = null;

function set(patch: Partial<CalendarState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

async function persist() {
  const { calendarId, phases, sabbats, skyEvents } = state;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({ calendarId, phases, sabbats, skyEvents }));
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
        skyEvents: saved.skyEvents && typeof saved.skyEvents === 'object' ? saved.skyEvents : {},
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

function skySpecs(phases: Record<PrincipalPhase, boolean>, now: Date): CalendarEventSpec[] {
  return [...(state.phases ? moonEvents(phases, now) : []), ...(state.sabbats ? sabbatEvents(now) : [])];
}

/** Bring the phone calendar's moon and sabbat events in line with the choices. */
export async function syncSkyCalendar(phases: Record<PrincipalPhase, boolean>) {
  await load();
  if (calendarMode !== 'device' || state.access !== 'granted' || !state.calendarId) return;
  const now = new Date();
  const wanted = new Map(skySpecs(phases, now).map((s) => [s.key, s]));
  const skyEvents = { ...state.skyEvents };
  for (const [key, id] of Object.entries(skyEvents)) {
    if (!wanted.has(key)) {
      // Remove what is no longer chosen; events that have simply passed stay in the calendar.
      const phase = key.startsWith('moon-') ? (key.split('-')[1] as PrincipalPhase) : null;
      const stillChosen = phase ? state.phases && phases[phase] : state.sabbats;
      if (!stillChosen) await deleteEvent(id);
      delete skyEvents[key];
    }
  }
  for (const [key, spec] of wanted) {
    if (skyEvents[key]) continue;
    try {
      skyEvents[key] = await writeEvent(state.calendarId, spec, null);
    } catch {
      // Try again next time.
    }
  }
  set({ skyEvents });
  await persist();
}

export async function setSkyChoices(change: Partial<Pick<CalendarSettings, 'phases' | 'sabbats'>>, phases: Record<PrincipalPhase, boolean>) {
  const turningOn = change.phases || change.sabbats;
  if (turningOn && calendarMode === 'device' && !(await ensureCalendar())) return 'denied' as const;
  set(change);
  await persist();
  await syncSkyCalendar(phases);
  return 'ok' as const;
}

/** The chosen moon phases and sabbats as one .ics file (web). */
export function downloadSky(phases: Record<PrincipalPhase, boolean>): boolean {
  const now = new Date();
  const specs = [...moonEvents(phases, now), ...sabbatEvents(now)];
  return specs.length > 0 && downloadIcs(toIcs(specs, now), 'moon-and-sabbats.ics');
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
