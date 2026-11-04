// A coven's year in review: gatherings held, rites by kind and sabbat,
// attendance highlights, new members, pages added to the coven's books, what
// went on the coven's altars most, and a few other counts. Worked out from
// what the reader can already see, so privacy holds as elsewhere: everyone's
// attendance only for those who may see the coven's record (its leaders and
// record keepers); anyone else sees their own. Nothing from anyone's journal.
// Pure; the screen is app/(tabs)/coven/c/[slug]/year.tsx.

import { OCCASIONS } from './model.ts';

export type ReviewRitual = {
  id: string;
  title: string;
  kind?: 'rite' | 'meeting' | null;
  status: string;
  occasion: string | null;
  occasion_name: string | null;
  scheduled_for: string | null;
  started_at?: string | null;
  ended_at?: string | null;
};

export type YearReviewInput = {
  year: number;
  userId: string | null;
  rituals: ReviewRitual[];
  /** coven_ritual_attendance rows the reader can see. */
  attendance: { ritual_id: string; user_id: string; present: boolean | null }[];
  /** Whether those rows are everyone's (leaders, record keepers) or only the reader's own. */
  seesAllAttendance: boolean;
  members: { user_id: string; joined_at: string | null; status?: string }[];
  /** Pages added to the coven's grimoire and Book of Shadows. */
  pages: { title: string; created_at: string }[];
  /** Things set on the coven's altars (their names or labels). */
  altarThings: { label: string; at: string }[];
  petitions: { created_at: string }[];
  shelfAdded: { created_at: string }[];
};

export type YearReview = {
  year: number;
  held: number;
  rites: number;
  meetings: number;
  byOccasion: { label: string; count: number }[];
  sabbats: string[];
  busiestMonth: { month: string; count: number } | null;
  longestMinutes: number | null;
  attendance: {
    best: { title: string; count: number } | null;
    average: number | null;
    /** Those at every gathering they could be (only when the reader sees everyone's). */
    steadfast: string[];
    mine: { came: number; of: number } | null;
  };
  newMembers: string[];
  pages: { count: number; titles: string[] };
  altarTop: { label: string; count: number }[];
  petitions: number;
  shelfAdded: number;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const inYear = (iso: string | null | undefined, year: number) => {
  if (!iso) return false;
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) && d.getFullYear() === year;
};

/** Held: done, or under way, and on the calendar in that year. */
export const wasHeld = (r: ReviewRitual, year: number) => (r.status === 'done' || r.status === 'live') && inYear(r.scheduled_for ?? r.started_at, year);

const occasionName = (r: ReviewRitual) => {
  const base = OCCASIONS.find((o) => o.value === r.occasion)?.label;
  if (r.occasion === 'sabbat') return r.occasion_name?.trim() || 'Sabbat';
  return base ?? (r.kind === 'meeting' ? 'Meeting' : 'Other gathering');
};

function tally<T>(items: T[], key: (t: T) => string): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const it of items) {
    const k = key(it).trim();
    if (k) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function yearReview(input: YearReviewInput): YearReview {
  const { year } = input;
  const held = input.rituals.filter((r) => wasHeld(r, year)).sort((a, b) => (a.scheduled_for ?? '').localeCompare(b.scheduled_for ?? ''));
  const heldIds = new Set(held.map((r) => r.id));
  const rites = held.filter((r) => r.kind !== 'meeting');
  const meetings = held.length - rites.length;

  const months = tally(held, (r) => MONTHS[new Date(r.scheduled_for ?? r.started_at ?? '').getMonth()] ?? '');
  const lengths = held
    .map((r) => (r.started_at && r.ended_at ? (Date.parse(r.ended_at) - Date.parse(r.started_at)) / 60000 : NaN))
    .filter((m) => Number.isFinite(m) && m > 0 && m < 24 * 60);

  const present = input.attendance.filter((a) => a.present === true && heldIds.has(a.ritual_id));
  let best: YearReview['attendance']['best'] = null;
  let average: number | null = null;
  let steadfast: string[] = [];
  if (input.seesAllAttendance && present.length) {
    const per = tally(present, (a) => a.ritual_id);
    const top = per[0];
    const r = held.find((x) => x.id === top.label);
    if (r) best = { title: r.title, count: top.count };
    average = Math.round((present.length / Math.max(1, per.length)) * 10) / 10;
    // At every gathering held since they joined (at least three).
    const joined = new Map(input.members.map((m) => [m.user_id, m.joined_at ? Date.parse(m.joined_at) : 0]));
    steadfast = [...new Set(present.map((a) => a.user_id))]
      .filter((u) => {
        const since = joined.get(u) ?? 0;
        const theirs = held.filter((r) => Date.parse(r.scheduled_for ?? r.started_at ?? '') >= since);
        return theirs.length >= 3 && theirs.every((r) => present.some((a) => a.ritual_id === r.id && a.user_id === u));
      })
      .sort();
  }
  const mine = input.userId ? { came: present.filter((a) => a.user_id === input.userId).length, of: held.length } : null;

  return {
    year,
    held: held.length,
    rites: rites.length,
    meetings,
    byOccasion: tally(rites, occasionName),
    sabbats: [...new Set(rites.filter((r) => r.occasion === 'sabbat').map(occasionName))],
    busiestMonth: months[0] && months[0].count > 1 ? { month: months[0].label, count: months[0].count } : null,
    longestMinutes: lengths.length ? Math.round(Math.max(...lengths)) : null,
    attendance: { best, average, steadfast, mine: mine && mine.of ? mine : null },
    newMembers: input.members.filter((m) => inYear(m.joined_at, year) && m.status !== 'removed').map((m) => m.user_id),
    pages: (() => {
      const p = input.pages.filter((x) => inYear(x.created_at, year)).sort((a, b) => a.created_at.localeCompare(b.created_at));
      return { count: p.length, titles: p.slice(0, 5).map((x) => x.title) };
    })(),
    altarTop: tally(
      input.altarThings.filter((a) => inYear(a.at, year)),
      (a) => a.label,
    ).slice(0, 5),
    petitions: input.petitions.filter((p) => inYear(p.created_at, year)).length,
    shelfAdded: input.shelfAdded.filter((p) => inYear(p.created_at, year)).length,
  };
}

/** The year to offer on the coven's home: December, and January for the year just gone; otherwise none. */
export function reviewYearNear(now: Date): number | null {
  if (now.getMonth() === 11) return now.getFullYear();
  if (now.getMonth() === 0) return now.getFullYear() - 1;
  return null;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const list = (items: string[]) => (items.length <= 1 ? items[0] ?? '' : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

/** The year as plain text, to share. */
export function yearReviewText(review: YearReview, covenName: string, nameOf: (id: string) => string): string {
  const lines: string[] = [`${covenName}: our ${review.year}`, ''];
  if (!review.held) lines.push('No gatherings were held this year.');
  else {
    lines.push(`We gathered ${plural(review.held, 'time')}: ${plural(review.rites, 'rite')}${review.meetings ? ` and ${plural(review.meetings, 'meeting')}` : ''}.`);
    if (review.byOccasion.length) lines.push(`Rites: ${review.byOccasion.map((o) => `${o.label} ${o.count}`).join(', ')}.`);
    if (review.sabbats.length) lines.push(`Sabbats kept: ${list(review.sabbats)}.`);
    if (review.busiestMonth) lines.push(`Busiest month: ${review.busiestMonth.month} (${plural(review.busiestMonth.count, 'gathering')}).`);
    if (review.longestMinutes) lines.push(`Longest rite: ${plural(review.longestMinutes, 'minute')}.`);
  }
  const a = review.attendance;
  if (a.best) lines.push(`Best attended: ${a.best.title} (${a.best.count} there).`);
  if (a.average) lines.push(`On average ${a.average} in the circle.`);
  if (a.steadfast.length) lines.push(`At every gathering: ${list(a.steadfast.map(nameOf))}.`);
  if (review.newMembers.length) lines.push(`Welcomed: ${list(review.newMembers.map(nameOf))}.`);
  if (review.pages.count) lines.push(`${plural(review.pages.count, 'page')} added to the coven’s books.`);
  if (review.altarTop.length) lines.push(`Most often on the altar: ${list(review.altarTop.slice(0, 3).map((t) => t.label))}.`);
  if (review.petitions) lines.push(`${plural(review.petitions, 'petition')} held by the circle.`);
  if (review.shelfAdded) lines.push(`${plural(review.shelfAdded, 'thing')} added to the shared shelf.`);
  return lines.join('\n');
}
