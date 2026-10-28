// Coven invitations: who hears, and what the note says. Pure (no Deno or
// Supabase), so the app's tests check it against the app's own reading of
// the same choices (app/tests/coven-invites.test.ts).
//
// An invitation sent in the app tells the person invited ("You're invited
// to Moon Circle", from whoever sent it); accepting it tells the one who
// sent it. Each person's choices come from Sanctuary settings
// (user_settings.reminders_v2, app/src/lib/reminders/prefs.ts):
// `invitations.on` for invitations to you, `invitations.accepted` for
// hearing that one you sent was accepted, and the pause.

export type Note = { title: string; body: string; url: string };

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const clip = (text: string, n = 140) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);

/** Whether this person wants the note: 'new' (invited) or 'answer' (their invitation accepted). `saved` is their reminders_v2 value, if any. */
export function wantsInvitation(saved: unknown, kind: 'new' | 'answer', now: Date = new Date()): boolean {
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
  const inv = obj(prefs.invitations);
  return kind === 'new' ? inv.on !== false : inv.accepted !== false;
}

/** The note to the person invited: "You're invited to Moon Circle", "From Hazel: “Come and sit with us”". */
export function invitedNote(args: { covenName: string; invitationId: string; who: string; message?: string | null }): Note {
  const message = args.message?.trim() ? `: “${clip(args.message.trim())}”` : '';
  return { title: `You’re invited to ${args.covenName}`, body: `From ${args.who}${message}`, url: `/coven/invitation/${args.invitationId}` };
}

/** The note to whoever sent it, once it's accepted: "Rowan accepted your invitation". */
export function acceptedNote(args: { covenName: string; covenSlug: string; who: string }): Note {
  return { title: args.covenName, body: `${args.who} accepted your invitation and joined the coven.`, url: `/coven/c/${args.covenSlug}/members` };
}
