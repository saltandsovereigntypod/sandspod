// Writing events to the phone's calendar with expo-calendar (SDK 57 object API).
//
// expo-calendar is not included in Expo Go on SDK 57 (the docs say so, and the
// package swaps in a stub there). In Expo Go this falls back to opening a
// Google Calendar link; development and store builds write to the calendar
// the person chooses. The web build uses deviceCalendar.web.ts.

import { isRunningInExpoGo } from 'expo';
import * as Calendar from 'expo-calendar';
import { Linking, Platform } from 'react-native';

import { googleCalendarUrl, type CalendarEventSpec } from './calendarEvent';

/** device: write to the phone's calendar. link: open Google Calendar. file: download an .ics. */
export type CalendarMode = 'device' | 'link' | 'file';

export const calendarMode: CalendarMode = isRunningInExpoGo() ? 'link' : 'device';

export type CalendarAccess = 'granted' | 'denied' | 'unavailable';
export type CalendarChoice = { id: string; title: string; primary: boolean };

export async function calendarAccess(ask: boolean): Promise<CalendarAccess> {
  if (calendarMode !== 'device') return 'unavailable';
  try {
    const response = ask ? await Calendar.requestCalendarPermissions() : await Calendar.getCalendarPermissions();
    return response.granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

/** Calendars the app may add events to, the person's default first. */
export async function writableCalendars(): Promise<CalendarChoice[]> {
  const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
  let defaultId: string | null = null;
  if (Platform.OS === 'ios') {
    try {
      defaultId = Calendar.getDefaultCalendarSync().id;
    } catch {
      // No default calendar set.
    }
  }
  return calendars
    .filter((c) => c.allowsModifications)
    .map((c) => ({ id: c.id, title: c.title, primary: c.id === defaultId || !!c.isPrimary }))
    .sort((a, b) => Number(b.primary) - Number(a.primary) || a.title.localeCompare(b.title));
}

function details(spec: CalendarEventSpec) {
  if (spec.allDay && Platform.OS === 'android') {
    // Android stores all-day events at UTC midnight.
    const utc = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    return { title: spec.title, notes: spec.notes, allDay: true, startDate: utc(spec.start), endDate: utc(spec.end), timeZone: 'UTC' };
  }
  let timeZone: string | undefined;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    timeZone = undefined;
  }
  return { title: spec.title, notes: spec.notes, allDay: spec.allDay, startDate: spec.start, endDate: spec.end, ...(timeZone ? { timeZone } : {}) };
}

/**
 * Add or update an event. With a known id the existing event is updated; if it
 * was deleted in the calendar app meanwhile, a new one is added. Returns the id.
 */
export async function writeEvent(calendarId: string, spec: CalendarEventSpec, existingId?: string | null): Promise<string> {
  if (existingId) {
    try {
      const event = await Calendar.ExpoCalendarEvent.get(existingId);
      await event.update(details(spec));
      return existingId;
    } catch {
      // Gone from the calendar: add it again below.
    }
  }
  const calendar = await Calendar.ExpoCalendar.get(calendarId);
  const event = await calendar.createEvent(details(spec));
  return event.id;
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    const event = await Calendar.ExpoCalendarEvent.get(id);
    await event.delete();
  } catch {
    // Already removed in the calendar app.
  }
}

export async function openInGoogleCalendar(spec: CalendarEventSpec): Promise<void> {
  await Linking.openURL(googleCalendarUrl(spec));
}

/** Only the web build can hand over a file. */
export const canDownloadIcs = false;

export function downloadIcs(_ics: string, _filename: string): boolean {
  return false;
}
