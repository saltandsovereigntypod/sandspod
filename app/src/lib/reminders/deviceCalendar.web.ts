// Browsers can't reach the calendar, so the web build offers an .ics file
// (Apple Calendar, Outlook, Google all import it) and a Google Calendar link.

import { googleCalendarUrl, type CalendarEventSpec } from './calendarEvent';

export type CalendarMode = 'device' | 'link' | 'file';
export const calendarMode: CalendarMode = 'file';

export type CalendarAccess = 'granted' | 'denied' | 'unavailable';
export type CalendarChoice = { id: string; title: string; primary: boolean };

export async function calendarAccess(_ask: boolean): Promise<CalendarAccess> {
  return 'unavailable';
}

export async function writableCalendars(): Promise<CalendarChoice[]> {
  return [];
}

export async function writeEvent(_calendarId: string, _spec: CalendarEventSpec, _existingId?: string | null): Promise<string> {
  throw new Error('The web app cannot write to your calendar.');
}

export async function deleteEvent(_id: string): Promise<void> {}

export async function openInGoogleCalendar(spec: CalendarEventSpec): Promise<void> {
  const open = (globalThis as { open?: (url: string, target: string, features: string) => unknown }).open;
  open?.(googleCalendarUrl(spec), '_blank', 'noopener');
}

export const canDownloadIcs = true;

export function downloadIcs(ics: string, filename: string): boolean {
  const doc = (globalThis as { document?: Document }).document;
  if (!doc || typeof Blob === 'undefined' || typeof URL === 'undefined') return false;
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const link = doc.createElement('a');
  link.href = url;
  link.download = filename;
  doc.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
