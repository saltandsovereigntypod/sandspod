// Discreet notifications: someone who has turned on "Discreet notifications"
// (Settings → Reminders → Quiet hours and pause; user_settings.reminders_v2
// `discreet`, app/src/lib/reminders/prefs.ts) gets every coven note with the
// app's name and a neutral line, so nothing about the coven or the craft
// shows on their lock screen. Where a tap opens is kept. The same words as
// the app's own reminders (app/src/lib/reminders/discreet.ts; the app's
// tests check they match). Pure (no Deno or Supabase).

export const DISCREET_TITLE = "Salt & Sovereignty";
export const DISCREET_BODY = "You have a reminder.";
export const DISCREET_MESSAGE = "You have a new message.";

/** Whether someone's saved reminder choices (the reminders_v2 JSON) ask for discreet wording. */
export function isDiscreet(saved: string | null | undefined): boolean {
  if (!saved) return false;
  try {
    return (JSON.parse(saved) as { discreet?: unknown } | null)?.discreet === true;
  } catch {
    return false;
  }
}

/** A push as a discreet person's phone will show it: the app's name and a plain line, nothing else. */
export function discreetPush<T extends { title: string; body: string; data: Record<string, unknown> }>(note: T): T {
  const chat = note.data?.source === "coven-chat";
  return { ...note, title: DISCREET_TITLE, body: chat ? DISCREET_MESSAGE : DISCREET_BODY };
}
