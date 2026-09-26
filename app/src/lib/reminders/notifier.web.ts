// Browsers can't schedule notifications for a date in the future, so on the web
// reminders are only saved; they're delivered by the phone app.

import type { Reminder } from './schedule';

export const remindersSupported = false;

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export async function permissionState(): Promise<PermissionState> {
  return 'unavailable';
}

export async function requestPermission(): Promise<PermissionState> {
  return 'unavailable';
}

export async function applySchedule(_reminders: Reminder[]): Promise<number> {
  return 0;
}

export function useReminderTaps() {}
