// A position opened for applications: who wants to hear, and what the note
// says. Pure (no Deno or Supabase), so the app's and the website's tests
// check it (app/tests/coven-positions.test.ts, tests/coven-positions.test.js,
// through js/core/covens.js).
//
// The leader who opened it chose who hears (everyone who could apply, or
// only those who already meet what it asks); the database works out who that
// is (coven_position_opening_recipients). Each person's own choices come from
// Sanctuary settings (user_settings.reminders_v2, app/src/lib/reminders/prefs.ts):
// `positions.on`, `positions.off` (covens turned off), and the pause.

export type Note = { title: string; body: string; url: string };

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const clip = (text: string, n = 180) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);

/**
 * Whether this person wants to hear that a position in this coven is open:
 * on unless turned off for all (`positions.on`) or for this coven
 * (`positions.off`), or reminders are paused. `saved` is their reminders_v2
 * value, if any (as app/src/lib/reminders/prefs.ts positionsOn reads it).
 */
export function wantsPosition(saved: unknown, covenId: string, now: Date = new Date()): boolean {
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
  const p = obj(prefs.positions);
  if (p.on === false) return false;
  return !(Array.isArray(p.off) && p.off.includes(covenId));
}

/** Whether a time zone is one Intl knows. */
function knownZone(zone: unknown): zone is string {
  if (typeof zone !== 'string' || !zone || zone.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/** "Thursday 30 October", in the coven's zone, else the opener's, else UTC; the year only when it isn't this one. */
export function closeDateWords(at: string, zone?: string | null, now: Date = new Date()): string {
  const z = knownZone(zone) ? zone : 'UTC';
  const parts = (d: Date) => Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: z, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(d).map((p) => [p.type, p.value]));
  const p = parts(new Date(at));
  return `${p.weekday} ${p.day} ${p.month}${p.year !== parts(now).year ? ` ${p.year}` : ''}`;
}

/** "2 places · applications close Thursday 30 October"; "1 place"; "Applications close …"; "" when neither. */
export function placesAndDate(placesLeft: number | null | undefined, closeAt: string | null | undefined, zone?: string | null, now: Date = new Date()): string {
  const parts: string[] = [];
  if (placesLeft != null && Number.isFinite(placesLeft) && placesLeft > 0) parts.push(`${placesLeft} ${placesLeft === 1 ? 'place' : 'places'}`);
  if (closeAt) parts.push(`applications close ${closeDateWords(closeAt, zone, now)}`);
  const line = parts.join(' · ');
  return line ? `${line[0].toUpperCase()}${line.slice(1)}` : '';
}

/**
 * The note: "Initiate is open in Moon Circle", "2 places · applications
 * close Thursday 30 October", then the leader's note. Opens My standing,
 * where the open position, what it asks and Apply are.
 */
export function openedNote(args: {
  rankName: string;
  covenName: string;
  covenSlug: string;
  placesLeft?: number | null;
  closeAt?: string | null;
  note?: string | null;
  zone?: string | null;
  now?: Date;
}): Note {
  const line = placesAndDate(args.placesLeft, args.closeAt, args.zone, args.now ?? new Date());
  const note = String(args.note ?? '').replace(/\s+/g, ' ').trim();
  const body = [line, note ? clip(note) : ''].filter(Boolean).join('\n') || 'Tap to see what it asks.';
  return { title: `${args.rankName} is open in ${args.covenName}`, body, url: `/coven/c/${args.covenSlug}/path` };
}
