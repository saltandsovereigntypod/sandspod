// Phone notes about coven gatherings, rites and meetings: put on the
// calendar, moved, or taken off it. Pure (no Deno or Supabase), so the app's
// and the website's tests check it (app/tests/coven-gathering-notices.test.ts,
// tests/coven-gathering-notices.test.js, through js/core/covens.js).
//
// What happened is worked out from the gathering as it is now and the notes
// already sent for it (coven_gathering_notices), so a call after any save
// sends at most one note, and a second call sends nothing:
//   'scheduled'  it is on the calendar, in the future, and nothing has been
//                said since it was last taken off (or ever);
//   'moved'      it was announced and its date or time is now different;
//   'cancelled'  it was announced for a time still to come, and now it is a
//                draft, cancelled, or deleted.
// Drafts never ring, nor gatherings already past.
//
// Sent by hand ("Send a notification" on the gathering's page), it is the
// 'scheduled' note when the gathering hasn't been announced since it last
// came off the calendar (those planned before these notes existed), and
// otherwise a 'reminder' (manualEvent), with the sender's short note, if any,
// as a second line (cleanNote).

export type GatheringEvent = 'scheduled' | 'moved' | 'cancelled' | 'reminder';
export type SentNotice = { seq: number; event: GatheringEvent; scheduled_for: string | null; recipients?: string[] | null };
/** The gathering as it is now; null when it has been deleted. */
export type GatheringNow = { status: string; scheduled_for: string | null } | null;

const time = (at: string | null | undefined) => (at ? new Date(at).getTime() : NaN);

/** The notes since it was last taken off the calendar (all of them, if it never was). */
export function sinceCancelled(sent: SentNotice[]): SentNotice[] {
  const ordered = [...sent].sort((a, b) => a.seq - b.seq);
  const last = ordered.map((n) => n.event).lastIndexOf('cancelled');
  return ordered.slice(last + 1);
}

/** What to say now, if anything, and who heard before (for a move or a cancellation). */
export function gatheringEvent(now: GatheringNow, sent: SentNotice[], at: Date = new Date()): { event: GatheringEvent; heard: string[]; previous: string | null } | null {
  const live = sinceCancelled(sent);
  const heard = [...new Set(live.flatMap((n) => n.recipients ?? []))];
  // Reminders don't change when it was said to be.
  const told = live.filter((n) => n.event !== 'reminder');
  const last = told[told.length - 1] ?? null;
  const previous = last?.scheduled_for ?? null;
  const when = time(now?.scheduled_for);
  if (now && now.status === 'scheduled' && Number.isFinite(when) && when > at.getTime()) {
    if (!last) return { event: 'scheduled', heard: [], previous: null };
    if (time(last.scheduled_for) !== when) return { event: 'moved', heard, previous };
    return null;
  }
  const off = !now || now.status === 'draft' || now.status === 'cancelled';
  if (off && last && time(previous) > at.getTime()) return { event: 'cancelled', heard, previous };
  return null;
}

/** What a note sent by hand is: its 'scheduled' note if it hasn't been announced since it last came off the calendar, else a reminder. Null when it isn't on the calendar ahead. */
export function manualEvent(now: GatheringNow, sent: SentNotice[], at: Date = new Date()): { event: 'scheduled' | 'reminder'; heard: string[] } | null {
  const when = time(now?.scheduled_for);
  if (!now || now.status !== 'scheduled' || !Number.isFinite(when) || when <= at.getTime()) return null;
  const live = sinceCancelled(sent);
  const heard = [...new Set(live.flatMap((n) => n.recipients ?? []))];
  return { event: live.some((n) => n.event === 'scheduled' || n.event === 'moved') ? 'reminder' : 'scheduled', heard };
}

/** One send by hand per gathering in this long (the database keeps it: limit_manual_coven_gathering_notices). */
export const MANUAL_GAP_MINUTES = 30;

/** The sender's own short note: one line, no control characters or markup, at most 200 characters. */
export function cleanNote(raw: unknown): string {
  return String(raw ?? '')
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)
    .trim();
}

// ─── Each person's choice ────────────────────────────────────────────────

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/**
 * Whether this person wants notes about this coven's gatherings: on unless
 * turned off for all (`gatherings.on`) or for this coven (`gatherings.off`),
 * or reminders are paused. `saved` is their reminders_v2 value, if any (as
 * app/src/lib/reminders/prefs.ts gatheringsOn reads it).
 */
export function wantsGathering(saved: unknown, covenId: string, now: Date = new Date()): boolean {
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
  const g = obj(prefs.gatherings);
  if (g.on === false) return false;
  return !(Array.isArray(g.off) && g.off.includes(covenId));
}

// ─── Words ─────────────────────────────────────────────────────────────────

/** Whether a time zone is one Intl knows. */
export function validZone(zone: unknown): zone is string {
  if (typeof zone !== 'string' || !zone || zone.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/**
 * "Thursday 30 October", in the coven's time zone when it has one (then with
 * the time: "Thursday 30 October at 8:00 pm"), else in the zone of whoever
 * planned it (the date only), else UTC. The year only when it isn't this one.
 */
export function whenWords(at: string, zones: { coven?: string | null; planner?: string | null }, now: Date = new Date()): string {
  const withTime = validZone(zones.coven);
  const zone = withTime ? (zones.coven as string) : validZone(zones.planner) ? (zones.planner as string) : 'UTC';
  const date = new Date(at);
  const parts = (d: Date) => Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d).map((p) => [p.type, p.value]));
  const p = parts(date);
  const year = p.year !== parts(now).year ? ` ${p.year}` : '';
  let words = `${p.weekday} ${p.day} ${p.month}${year}`;
  if (withTime) {
    const h = Number(p.hour) % 24;
    words += ` at ${h % 12 || 12}:${p.minute} ${h < 12 ? 'am' : 'pm'}`;
  }
  return words;
}

export type GatheringNote = { title: string; body: string; url: string };

/** The gathering by name: a rite as it is called; a meeting as "A meeting, Full moon planning," unless its name says meeting already. */
export function gatheringName(kind: string | null | undefined, title: string): string {
  const name = String(title || '').trim() || (kind === 'meeting' ? 'A meeting' : 'A gathering');
  if (kind !== 'meeting' || /\bmeeting\b/i.test(name)) return name;
  return `A meeting, ${name},`;
}

/** The note: "Deipnon is on Salt & Sovereignty’s calendar for Thursday 30 October. Tap to RSVP." */
export function gatheringNote(args: {
  event: GatheringEvent;
  kind?: string | null;
  title: string;
  covenName: string;
  covenSlug: string;
  ritualId: string;
  scheduledFor: string | null;
  previous?: string | null;
  zones?: { coven?: string | null; planner?: string | null };
  now?: Date;
  /** The sender's own words, sent by hand: a second line. */
  note?: string | null;
}): GatheringNote {
  const base = baseNote(args);
  const note = cleanNote(args.note);
  return note ? { ...base, body: `${base.body}\n${note}` } : base;
}

function baseNote(args: Parameters<typeof gatheringNote>[0]): GatheringNote {
  const name = gatheringName(args.kind, args.title);
  const zones = args.zones ?? {};
  const now = args.now ?? new Date();
  const page = `/coven/c/${args.covenSlug}/ritual/${args.ritualId}`;
  // "A meeting, X," reads on into what follows; a bare name doesn't need the comma.
  const lead = (n: string) => n.replace(/,$/, '');
  if (args.event === 'scheduled') {
    const when = args.scheduledFor ? ` for ${whenWords(args.scheduledFor, zones, now)}` : '';
    return { title: args.covenName, body: `${name} is on ${args.covenName}’s calendar${when}. Tap to RSVP.`, url: page };
  }
  if (args.event === 'reminder') {
    const when = args.scheduledFor ? ` is ${whenWords(args.scheduledFor, zones, now)}` : ' is coming up';
    const what = args.kind === 'meeting' && !/\bmeeting\b/i.test(args.title) ? `the ${String(args.title || '').trim()} meeting` : lead(name);
    return { title: args.covenName, body: `Reminder: ${what} with ${args.covenName}${when}. Tap to see it.`, url: page };
  }
  if (args.event === 'moved') {
    const when = args.scheduledFor ? whenWords(args.scheduledFor, zones, now) : 'another day';
    return { title: args.covenName, body: `${name} has moved to ${when}. Tap to see the details.`, url: page };
  }
  const was = args.previous ? `, planned for ${whenWords(args.previous, zones, now)},` : '';
  return { title: args.covenName, body: `${was ? lead(name) : name}${was} is off the calendar.`, url: `/coven/c/${args.covenSlug}/rituals` };
}
