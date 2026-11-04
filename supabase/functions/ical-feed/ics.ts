// The calendar feed's text: planned rituals, coven gatherings, the holidays
// and moon phases the app last worked out for the person (their calendars
// and choices, kept as one craft entry), and their ancestors' days as yearly
// events. Pure, with no imports, so the edge function (index.ts) and the
// app's tests (app/tests/ical-feed.test.ts) share it.

export const FEED_PARTS = ['rituals', 'covens', 'holidays', 'moon', 'ancestors'] as const;
export type FeedPart = (typeof FEED_PARTS)[number];

/** The parts chosen in settings (`calendar_feed_parts`, comma-separated); all of them when unset. */
export function feedParts(value: unknown): Set<FeedPart> {
  if (typeof value !== 'string' || !value.trim()) return new Set(FEED_PARTS);
  return new Set(value.split(',').map((s) => s.trim()).filter((s): s is FeedPart => (FEED_PARTS as readonly string[]).includes(s)));
}

/** A token long enough to be a secret: 32 to 128 letters, digits, - or _. */
export const isFeedToken = (t: unknown): t is string => typeof t === 'string' && /^[A-Za-z0-9_-]{32,128}$/.test(t);

export type FeedEvent =
  | { uid: string; title: string; description?: string; kind: 'allDay'; date: string; days?: number; yearly?: boolean }
  | { uid: string; title: string; description?: string; kind: 'floating'; date: string; time: string; minutes: number }
  | { uid: string; title: string; description?: string; kind: 'utc'; start: string; minutes: number; cancelled?: boolean };

const pad = (n: number) => String(n).padStart(2, '0');
const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** RFC 5545 text escaping. */
export function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold a line at 75 octets, as RFC 5545 asks; continuation lines begin with a space. */
export function foldLine(line: string): string {
  const bytes = (s: string) => new TextEncoder().encode(s).length;
  if (bytes(line) <= 75) return line;
  const parts: string[] = [];
  let current = '';
  for (const char of line) {
    if (bytes(current + char) > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = char;
    } else current += char;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const utcStamp = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

/** "2026-11-04" plus n days, as YYYYMMDD. */
function dateValue(day: string, plus = 0): string {
  const m = DAY.exec(day)!;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + plus));
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

/** A wall-clock time with no zone ("floating"): it shows at that hour wherever the calendar is. */
function floatingValue(day: string, time: string, plusMinutes = 0): string {
  const m = DAY.exec(day)!;
  const [h, min] = time.split(':').map(Number);
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), h, min + plusMinutes));
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00`;
}

function eventLines(e: FeedEvent, stamp: string, domain: string): string[] {
  const out = ['BEGIN:VEVENT', `UID:${e.uid}@${domain}`, `DTSTAMP:${stamp}`];
  if (e.kind === 'allDay') {
    out.push(`DTSTART;VALUE=DATE:${dateValue(e.date)}`, `DTEND;VALUE=DATE:${dateValue(e.date, Math.max(1, e.days ?? 1))}`);
    if (e.yearly) out.push(e.date.slice(5) === '02-29' ? 'RRULE:FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=-1' : 'RRULE:FREQ=YEARLY');
    out.push('TRANSP:TRANSPARENT');
  } else if (e.kind === 'floating') {
    out.push(`DTSTART:${floatingValue(e.date, e.time)}`, `DTEND:${floatingValue(e.date, e.time, e.minutes)}`);
  } else {
    const start = new Date(e.start);
    out.push(`DTSTART:${utcStamp(start)}`, `DTEND:${utcStamp(new Date(start.getTime() + e.minutes * 60_000))}`);
    if (e.cancelled) out.push('STATUS:CANCELLED');
  }
  out.push(`SUMMARY:${escapeText(e.title)}`);
  if (e.description) out.push(`DESCRIPTION:${escapeText(e.description)}`);
  out.push('END:VEVENT');
  return out;
}

export const FEED_DOMAIN = 'app.saltandsovereignty.com';

/** The whole calendar, CRLF line endings, folded. */
export function buildCalendar(events: FeedEvent[], now: Date, name = 'Salt & Sovereignty'): string {
  const stamp = utcStamp(now);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Salt & Sovereignty//Calendar feed//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(name)}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    ...events.flatMap((e) => eventLines(e, stamp, FEED_DOMAIN)),
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

// ── From the person's data ──────────────────────────────────────────────────

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const FOOTER = 'From the Salt & Sovereignty app.';

export type PlanRow = { id: string; planned_date: string; planned_time: string; title: string; intention: string | null; done_at: string | null };

/** Planned rituals from a month ago on, at their own time of day, an hour long. */
export function planEvents(rows: PlanRow[], now: Date): FeedEvent[] {
  const from = new Date(now.getTime() - 31 * 86_400_000).toISOString().slice(0, 10);
  return rows
    .filter((r) => DAY.test(r.planned_date) && r.planned_date >= from && !!r.title)
    .map((r) => ({
      uid: `plan-${r.id}`,
      title: r.title,
      description: [r.intention ?? '', FOOTER].filter(Boolean).join('\n'),
      kind: 'floating' as const,
      date: r.planned_date,
      time: /^\d{1,2}:\d{2}$/.test(r.planned_time) ? r.planned_time.padStart(5, '0') : '21:00',
      minutes: 60,
    }));
}

export type CovenRitualRow = { id: string; coven_id: string; title: string; scheduled_for: string | null; status: string; kind?: string | null; occasion_name?: string | null; intention?: string | null };

/** A coven's gatherings: scheduled, under way, or called off (so a calendar drops them), about ninety minutes each. */
export function covenEvents(rows: CovenRitualRow[], covenNames: Record<string, string>): FeedEvent[] {
  return rows
    .filter((r) => r.scheduled_for && ['scheduled', 'live', 'cancelled'].includes(r.status))
    .map((r) => ({
      uid: `coven-ritual-${r.id}`,
      title: `${r.title}${covenNames[r.coven_id] ? ` · ${covenNames[r.coven_id]}` : ''}`,
      description: [r.occasion_name ?? '', r.intention ?? '', r.kind === 'meeting' ? 'A coven meeting.' : 'A coven rite.', FOOTER].filter(Boolean).join('\n'),
      kind: 'utc' as const,
      start: r.scheduled_for!,
      minutes: 90,
      cancelled: r.status === 'cancelled',
    }));
}

export type SkySnapshot = { events?: { key?: unknown; title?: unknown; date?: unknown; days?: unknown; notes?: unknown; kind?: unknown }[] };

/** The holidays and moon phases the app worked out, as all-day events. */
export function skyEvents(snapshot: SkySnapshot | null | undefined, parts: Set<FeedPart>): FeedEvent[] {
  const out: FeedEvent[] = [];
  for (const e of snapshot?.events ?? []) {
    const kind = str(e.kind);
    const date = str(e.date);
    const title = str(e.title);
    if (!DAY.test(date) || !title || !str(e.key)) continue;
    if (kind === 'moon' ? !parts.has('moon') : !parts.has('holidays')) continue;
    const days = Math.min(14, Math.max(1, Math.round(Number(e.days) || 1)));
    out.push({ uid: str(e.key).replace(/[^\w-]/g, '-'), title, description: str(e.notes) || undefined, kind: 'allDay', date, days });
  }
  return out;
}

type DatePart = { year?: unknown; month?: unknown; day?: unknown };

/** Each ancestor's birthday, death day and kept days, as all-day events that come round every year. */
export function ancestorEvents(entries: { id: string; data: unknown }[], now: Date): FeedEvent[] {
  const out: FeedEvent[] = [];
  const year = now.getUTCFullYear() - 1;
  const add = (id: string, key: string, title: string, month: number, day: number, since: number | null, words: string) => {
    if (!(month >= 1 && month <= 12 && day >= 1 && day <= 31)) return;
    // 29 February starts in a leap year and falls on the last day of February otherwise.
    const startYear = month === 2 && day === 29 ? year - (year % 4) : year;
    out.push({
      uid: `ancestor-${id}-${key}`,
      title,
      description: [since ? `${words} ${since}.` : '', FOOTER].filter(Boolean).join('\n'),
      kind: 'allDay',
      date: `${startYear}-${pad(month)}-${pad(day)}`,
      yearly: true,
    });
  };
  for (const e of entries) {
    const a = (e.data && typeof e.data === 'object' ? e.data : {}) as { name?: unknown; born?: DatePart; died?: DatePart; days?: { month?: unknown; day?: unknown; name?: unknown }[] };
    const name = str(a.name).trim() || 'Unnamed';
    const num = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) ? v : 0);
    if (a.born) add(e.id, 'birth', `${name}’s birthday`, num(a.born.month), num(a.born.day), num(a.born.year) || null, 'Born in');
    if (a.died) add(e.id, 'death', `The day ${name} died`, num(a.died.month), num(a.died.day), num(a.died.year) || null, 'Died in');
    (Array.isArray(a.days) ? a.days : []).slice(0, 12).forEach((k, i) => {
      const label = str(k?.name).trim();
      if (label) add(e.id, `kept-${i}`, `${name}: ${label}`, num(k.month), num(k.day), null, '');
    });
  }
  return out;
}
