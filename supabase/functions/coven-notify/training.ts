// Training messages: a note on a step of a coven program, between the person
// going through it and those who oversee them (their mentor, those who
// manage programs, the coven's head). Who hears is the database's
// coven_program_thread_people (supabase/migrations/20261110000000_coven_courses.sql);
// this says whether each wants it and what the note says. Pure (no Deno or
// Supabase), so the app's tests check it (app/tests/coven-courses.test.ts).
//
// Each person's choice comes from Sanctuary settings (user_settings.reminders_v2,
// app/src/lib/reminders/prefs.ts): `training.on` ("Training messages", on
// unless turned off), and the pause.

export type Note = { title: string; body: string; url: string };

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const clip = (text: string, n = 160) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);

/** Whether this person wants training messages on their phone. `saved` is their reminders_v2 value, if any. */
export function wantsTraining(saved: unknown, now: Date = new Date()): boolean {
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
  return obj(prefs.training).on !== false;
}

/**
 * The note: "Hazel · Pouring a libation", "Your mentor wrote: …". It opens the
 * step: the trainee's own path, or the trainee's path for those overseeing.
 */
export function trainingNote(args: {
  covenSlug: string;
  who: string;
  taskTitle: string;
  body: string;
  programId: string;
  taskId: string;
  traineeId: string;
  toTrainee: boolean;
}): Note {
  const person = args.toTrainee ? '' : `person=${encodeURIComponent(args.traineeId)}&`;
  return {
    title: `${args.who} · ${clip(args.taskTitle, 60)}`,
    body: clip(args.body.replace(/\s+/g, ' ').trim()),
    url: `/coven/c/${args.covenSlug}/programs/${args.programId}?${person}task=${encodeURIComponent(args.taskId)}`,
  };
}
