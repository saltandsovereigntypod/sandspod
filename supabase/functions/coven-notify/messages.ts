// Reactions, reply buttons and chat reminders on coven messages: the phone
// notes' words, each person's choices, when a gathering's reminder is due and
// when a summary of answers may ring. Pure (no Deno or Supabase), so the
// app's and the website's tests check it (app/tests/coven-message-extras.test.ts,
// tests/coven-message-extras.test.js, through js/core/covens.js).
//
// Choices (reminders_v2 `messages`, app/src/lib/reminders/prefs.ts):
// `reactions` (someone reacts to your message) is off unless turned on;
// `answers` (people answer your reply buttons) is on unless turned off.
// Answers are summed up: at most one note per message in ANSWER_GAP_MINUTES,
// covering the answers since the last.

export type Note = { title: string; body: string; url: string };

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const clip = (text: string, n = 80) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);

/** Whether this person wants the note: 'reactions' (off unless on) or 'answers' (on unless off). `saved` is their reminders_v2 value. */
export function wantsMessageNote(saved: unknown, kind: 'reactions' | 'answers', now: Date = new Date()): boolean {
  let prefs: Record<string, unknown> = {};
  if (typeof saved === 'string' && saved.trim()) {
    try {
      prefs = obj(JSON.parse(saved));
    } catch {
      prefs = {};
    }
  } else prefs = obj(saved);
  if (prefs.paused === true) {
    const until = typeof prefs.pausedUntil === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(prefs.pausedUntil) ? prefs.pausedUntil : '';
    if (!until) return false;
    const [y, m, d] = until.split('-').map(Number);
    if (now.getTime() < Date.UTC(y, m - 1, d)) return false;
  }
  const m = obj(prefs.messages);
  return kind === 'reactions' ? m.reactions === true : m.answers !== false;
}

// ─── Answers ─────────────────────────────────────────────────────────────

/** One summary of answers per message in this long. */
export const ANSWER_GAP_MINUTES = 5;

/** Whether a summary may ring now: never before, or the last was at least the gap ago. */
export function answerPushDue(lastPushedAt: string | null | undefined, now: Date = new Date(), gapMinutes = ANSWER_GAP_MINUTES): boolean {
  if (!lastPushedAt) return true;
  const last = new Date(lastPushedAt).getTime();
  return !Number.isFinite(last) || now.getTime() - last >= gapMinutes * 60 * 1000;
}

/** "3 people answered: 2 Coming, 1 Can’t make it" (the answers since the last note, as they stand now). */
export function answerSummary(labels: string[], choices: number[]): string {
  const counts = labels.map((label, i) => ({ label, n: choices.filter((c) => c === i).length })).filter((c) => c.n > 0);
  const total = counts.reduce((s, c) => s + c.n, 0);
  const lead = total === 1 ? '1 person answered' : `${total} people answered`;
  return `${lead}: ${counts.map((c) => `${c.n} ${c.label}`).join(', ')}`;
}

/** To the message's writer: the summary, with the message's opening words as the title. */
export function answersNote(args: { labels: string[]; choices: number[]; body: string; covenName: string; covenSlug: string; conversationId: string | null }): Note {
  return {
    title: `${args.covenName}: “${clip(args.body.split('\n')[0], 50)}”`,
    body: answerSummary(args.labels, args.choices),
    url: `/coven/c/${args.covenSlug}/chat/${args.conversationId || 'coven'}`,
  };
}

/** To the message's writer: "Hazel reacted 🔥 to “See you at the crossroads”". */
export function reactionNote(args: { who: string; emoji: string; body: string; covenName: string; covenSlug: string; conversationId: string | null }): Note {
  return {
    title: args.covenName,
    body: `${args.who} reacted ${args.emoji} to “${clip(args.body.split('\n')[0], 60)}”`,
    url: `/coven/c/${args.covenSlug}/chat/${args.conversationId || 'coven'}`,
  };
}

// ─── The chat reminder before a gathering ───────────────────────────────

export const REMINDER_MINUTES = [10, 15, 30, 60];
/** The Gathering buttons a reminder carries (messageExtras.ts REPLY_PRESETS). */
export const GATHERING_LABELS = ['Coming', 'Running late', 'Can’t make it'];

/** The plan's reminder, minutes before; null when off (as messageExtras.ts chatReminder). */
export function planReminder(plan: unknown): number | null {
  const v = obj(plan).chatReminder;
  return typeof v === 'number' && REMINDER_MINUTES.includes(v) ? v : null;
}

/** When the reminder is due: its minutes before the start. Null without a start or a reminder. */
export function reminderDueAt(scheduledFor: string | null | undefined, minutes: number | null): Date | null {
  const start = scheduledFor ? new Date(scheduledFor).getTime() : NaN;
  if (!Number.isFinite(start) || !minutes) return null;
  return new Date(start - minutes * 60 * 1000);
}

/** Whether to post it now: scheduled, its time come, the gathering not yet begun. */
export function reminderDue(ritual: { status: string; scheduled_for: string | null; plan?: unknown }, now: Date = new Date()): boolean {
  if (ritual.status !== 'scheduled') return false;
  const due = reminderDueAt(ritual.scheduled_for, planReminder(ritual.plan));
  if (!due) return false;
  const start = new Date(ritual.scheduled_for as string).getTime();
  return now.getTime() >= due.getTime() && now.getTime() < start;
}

/** "Gentle reminder: Full Moon Rite begins in 10 minutes." (the minutes left, if it is late going out). */
export function reminderText(title: string, scheduledFor: string, now: Date = new Date()): string {
  const left = Math.max(1, Math.round((new Date(scheduledFor).getTime() - now.getTime()) / 60000));
  const when = left >= 60 && left % 60 === 0 ? (left === 60 ? 'in an hour' : `in ${left / 60} hours`) : `in ${left} minute${left === 1 ? '' : 's'}`;
  return `Gentle reminder: ${String(title || '').trim() || 'The gathering'} begins ${when}.`;
}

/** The reminder's buttons (coven_messages.reply_buttons): Gathering, linked to it, once for this start time. */
export function reminderButtons(ritualId: string, scheduledFor: string) {
  return { labels: GATHERING_LABELS, preset: 'gathering', ritual_id: ritualId, reminder_at: new Date(scheduledFor).toISOString() };
}
