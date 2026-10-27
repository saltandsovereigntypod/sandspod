// Who hears about a coven application or request to advance, and what the
// note says. Pure (no Deno or Supabase), so the app's tests check it against
// the app's own reading of the same choices (app/tests/coven-requests.test.ts).
//
// Reviewers are the coven's founder and everyone in a position that reviews
// or leads (coven_ranks.can_review or can_manage), as coven_permission
// 'review' decides it in the database. Each person's choices come from
// Sanctuary settings (user_settings.reminders_v2, app/src/lib/reminders/prefs.ts):
// `requests.on` and `requests.off` (covens turned off) for new requests,
// `requests.answers` for hearing back about your own, and the pause.

export type MemberRow = { user_id: string; rank_id: string | null; status: string };
export type RankRow = { id: string; can_review?: boolean | null; can_manage?: boolean | null };

/** Everyone in the coven who can decide applications and requests to advance. */
export function reviewersOf(args: { founderId: string | null; covenStatus?: string; members: MemberRow[]; ranks: RankRow[] }): string[] {
  if (args.covenStatus && args.covenStatus !== 'active') return [];
  const powered = new Set(args.ranks.filter((r) => r.can_review || r.can_manage).map((r) => r.id));
  return [
    ...new Set(
      args.members.filter((m) => m.status === 'active' && (m.user_id === args.founderId || (m.rank_id != null && powered.has(m.rank_id)))).map((m) => m.user_id),
    ),
  ];
}

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** Whether reminders are paused (the pause ends the morning of `pausedUntil`). */
function paused(prefs: Record<string, unknown>, now: Date): boolean {
  if (prefs.paused !== true) return false;
  const until = typeof prefs.pausedUntil === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(prefs.pausedUntil) ? prefs.pausedUntil : '';
  if (!until) return true;
  const [y, m, d] = until.split('-').map(Number);
  return now.getTime() < Date.UTC(y, m - 1, d);
}

/**
 * Whether this person wants a phone note: 'new' for a new request in a coven
 * they review (on unless turned off for that coven, or for all), 'answer'
 * for the answer to their own. `saved` is their reminders_v2 value, if any.
 */
export function wantsNotice(saved: unknown, kind: 'new' | 'answer', covenId: string, now: Date = new Date()): boolean {
  let prefs: Record<string, unknown> = {};
  if (typeof saved === 'string' && saved.trim()) {
    try {
      prefs = obj(JSON.parse(saved));
    } catch {
      prefs = {};
    }
  } else prefs = obj(saved);
  if (paused(prefs, now)) return false;
  const r = obj(prefs.requests);
  if (kind === 'answer') return r.answers !== false;
  if (r.on === false) return false;
  return !(Array.isArray(r.off) && r.off.includes(covenId));
}

/** Only a request made in the last few minutes rings, so an old one can't be rung again. */
export const FRESH_MINUTES = 5;
export const isFresh = (at: string | null | undefined, now: Date = new Date()) => !!at && now.getTime() - new Date(at).getTime() <= FRESH_MINUTES * 60 * 1000 && now.getTime() - new Date(at).getTime() >= -60 * 1000;

export type Note = { title: string; body: string; url: string };

const clip = (text: string, n = 140) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);

/** The note to reviewers: "New application · Moon Circle", "Rowan asked to join". */
export function requestNote(args: { kind: 'application' | 'advancement'; covenName: string; covenSlug: string; who: string; rankName?: string | null }): Note {
  const url = `/coven/c/${args.covenSlug}/review`;
  if (args.kind === 'application') return { title: `New application · ${args.covenName}`, body: `${args.who} asked to join`, url };
  return { title: `Request to advance · ${args.covenName}`, body: `${args.who} asked to become ${args.rankName || 'a higher position'}`, url };
}

/** The note to the person who asked, once it's decided (with the reviewer's note, if any). */
export function answerNote(args: { kind: 'application' | 'advancement'; approved: boolean; covenName: string; covenSlug: string; rankName?: string | null; note?: string | null }): Note {
  const note = args.note?.trim() ? ` “${clip(args.note.trim())}”` : '';
  const coven = `/coven/c/${args.covenSlug}`;
  if (args.kind === 'application') {
    return args.approved
      ? { title: args.covenName, body: `Your application was accepted. Welcome to the coven.${note}`, url: coven }
      : { title: args.covenName, body: `Your application wasn’t accepted this time.${note}`, url: '/coven' };
  }
  const rank = args.rankName || 'the position you asked for';
  return args.approved
    ? { title: args.covenName, body: `You’re now ${rank}.${note}`, url: coven }
    : { title: args.covenName, body: `Your request to become ${rank} wasn’t granted this time.${note}`, url: `${coven}/path` };
}

/** The note to those who approve for that part of the coven's Book: "Rowan suggested a page". */
export function bookNote(args: { covenName: string; covenSlug: string; who: string; title: string; changes: boolean; shared: boolean }): Note {
  const what = args.changes ? `changes to “${clip(args.title, 80)}”` : args.shared ? `“${clip(args.title, 80)}” from their own grimoire` : `a page, “${clip(args.title, 80)}”`;
  return { title: `The Book · ${args.covenName}`, body: `${args.who} suggested ${what}`, url: `/coven/c/${args.covenSlug}/book/review` };
}

/** The note to whoever suggested it, once it's decided (with the approver's note, if any). */
export function bookAnswerNote(args: { covenName: string; covenSlug: string; title: string; status: 'approved' | 'returned' | 'declined'; note?: string | null; pageId?: string | null }): Note {
  const note = args.note?.trim() ? ` “${clip(args.note.trim())}”` : '';
  const book = `/coven/c/${args.covenSlug}/book`;
  const title = clip(args.title, 80);
  if (args.status === 'approved') return { title: args.covenName, body: `“${title}” is in the coven’s Book, shared by you.${note}`, url: args.pageId ? `${book}/${args.pageId}` : book };
  if (args.status === 'returned') return { title: args.covenName, body: `“${title}” was sent back to you to change.${note}`, url: `${book}/review` };
  return { title: args.covenName, body: `“${title}” wasn’t taken into the coven’s Book.${note}`, url: `${book}/review` };
}
