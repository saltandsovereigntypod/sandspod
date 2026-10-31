// Rituals together and mentorship: who hears, and what the note says. Pure
// (no Deno or Supabase), so the app's tests check it against the app's own
// reading of the same choices (app/tests/together.test.ts).
//
// - A ritual together begun from a coven gathering tells those the gathering
//   is for ("Hazel has begun Full moon esbat together. Join from wherever you are.").
// - Mentorship: being asked (or paired by your coven's leaders), the answer,
//   the pairing ending, a new message, and a check-in.
//
// Each person's choices come from Sanctuary settings (user_settings.reminders_v2,
// app/src/lib/reminders/prefs.ts): `together.live` for rituals together,
// `together.mentorship` for everything about a mentorship, and the pause.

export type Note = { title: string; body: string; url: string };
export type MentorshipEvent = 'asked' | 'paired' | 'accepted' | 'declined' | 'ended';

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const clip = (text: string, n = 140) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);

/** Whether this person wants the note: 'live' (a ritual together) or 'mentorship'. `saved` is their reminders_v2 value, if any. */
export function wantsTogether(saved: unknown, kind: 'live' | 'mentorship', now: Date = new Date()): boolean {
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
  const t = obj(prefs.together);
  return kind === 'live' ? t.live !== false : t.mentorship !== false;
}

/** A ritual together has begun from a coven gathering. */
export function liveNote(args: { title: string; who: string; covenName: string; liveId: string }): Note {
  return { title: `${args.covenName}: a ritual together`, body: `${args.who} has begun ${clip(args.title, 80)} together. Join from wherever you are.`, url: `/rituals/together/${args.liveId}` };
}

/** Something happened to a pairing: to the other person (or, when a coven's leaders paired them, to both). */
export function mentorshipNote(args: { event: MentorshipEvent; who: string; role: 'mentor' | 'mentee'; mentorshipId: string; covenName?: string | null }): Note {
  const url = `/coven/mentorship/${args.mentorshipId}`;
  // role: the recipient's role in the pairing.
  switch (args.event) {
    case 'asked':
      return { title: 'Mentorship', body: args.role === 'mentor' ? `${args.who} asks you to mentor them.` : `${args.who} offers to mentor you.`, url };
    case 'paired':
      return { title: args.covenName ? `${args.covenName}: mentorship` : 'Mentorship', body: `${args.who} suggests a mentorship for you. It begins only if you both say yes.`, url };
    case 'accepted':
      return { title: 'Mentorship', body: `${args.who} said yes. Your mentorship has begun.`, url };
    case 'declined':
      return { title: 'Mentorship', body: `${args.who} isn’t able to take up the mentorship just now.`, url };
    case 'ended':
      return { title: 'Mentorship', body: `${args.who} has ended the mentorship. Thank you both for the time you shared.`, url };
  }
}

/** A message in a pairing's conversation (the words clipped). */
export function mentorMessageNote(args: { who: string; body: string; mentorshipId: string }): Note {
  return { title: args.who, body: clip(args.body.replace(/\s+/g, ' ').trim()), url: `/coven/mentorship/${args.mentorshipId}` };
}

/** A check-in from the other side. */
export function checkinNote(args: { who: string; mentorshipId: string }): Note {
  return { title: 'Mentorship', body: `${args.who} checked in.`, url: `/coven/mentorship/${args.mentorshipId}` };
}
