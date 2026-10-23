// Browsers can't schedule notifications for a date in the future, so the web
// app sets no rite reminders; the phone app does (reminders.ts).

export const COVEN_REMINDER_SOURCE = 'coven-rites';

export async function syncCovenReminders(_userId: string | null, _options: { ask?: boolean } = {}): Promise<number> {
  return 0;
}
