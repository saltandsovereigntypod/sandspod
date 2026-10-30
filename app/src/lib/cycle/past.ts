// Cycle & Moon: logging past periods, many at once. Start days (and, if
// known, an end day or how many days it lasted) picked on a calendar, typed,
// or pasted as a list of dates; each checked before it's kept: not in the
// future, not overlapping another bleed or each other, an end after its
// start, and not implausibly long. Editing one checks it the same way. Pure,
// so the app and the website (js/core/cycle.js) agree.

import { addDays, bleedDays, dayKey, daysBetween, fromKey, isDayKey, putBleed, sortedBleeds } from './model.ts';
import type { Bleed, CycleData } from './types.ts';

/** A past bleed to add: its first day, and its last day if known. */
export type PastEntry = { start: string; end: string | null };

export type PastProblemReason = 'invalid' | 'future' | 'end-before-start' | 'too-long' | 'overlap' | 'duplicate';
export type PastProblem = { start: string; reason: PastProblemReason; message: string };

/** The longest a single bleed may be logged as. */
export const MAX_BLEED_DAYS = 14;

/** The days a bleed covers: to its end, or as long as it's taken to last. */
function span(b: { start: string; end: string | null; flow?: Bleed['flow'] }): [string, string] {
  return [b.start, b.end ?? addDays(b.start, bleedDays({ id: '', start: b.start, end: null, flow: b.flow ?? {}, updatedAt: '' }) - 1)];
}
const overlaps = (a: [string, string], b: [string, string]) => daysBetween(a[0], b[1]) >= 0 && daysBetween(b[0], a[1]) >= 0;

const pretty = (key: string) => {
  const d = fromKey(key);
  return d ? `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear()}` : key;
};

/** Why one entry can't be kept as it is, against the bleeds already kept (`others`) and today, or null if it can. */
export function pastProblem(entry: PastEntry, others: { start: string; end: string | null; flow?: Bleed['flow'] }[], today: string): PastProblem | null {
  const { start, end } = entry;
  const fail = (reason: PastProblemReason, message: string): PastProblem => ({ start, reason, message });
  if (!isDayKey(start) || (end != null && !isDayKey(end))) return fail('invalid', `“${start}” isn’t a date Cycle & Moon can read.`);
  if (daysBetween(today, start) > 0) return fail('future', `${pretty(start)} is in the future. Past periods only; log one when it begins.`);
  if (end && daysBetween(today, end) > 0) return fail('future', `The bleed from ${pretty(start)} ends in the future. Leave the end empty if it’s still going.`);
  if (end && daysBetween(start, end) < 0) return fail('end-before-start', `The bleed from ${pretty(start)} ends before it begins.`);
  if (end && daysBetween(start, end) + 1 > MAX_BLEED_DAYS) return fail('too-long', `The bleed from ${pretty(start)} would last ${daysBetween(start, end) + 1} days. Check the end date; bleeding for more than a week or so is worth mentioning to a doctor.`);
  const mine = span(entry);
  for (const o of others) {
    if (o.start === start) return fail('duplicate', `A bleed beginning ${pretty(start)} is already logged.`);
    if (overlaps(mine, span(o))) return fail('overlap', `${pretty(start)} overlaps the bleed logged from ${pretty(o.start)}. Edit that one instead, or check the dates.`);
  }
  return null;
}

/** Sort the entries out into those that can be kept and the problems with the rest (checked against each other too). */
export function checkPastBleeds(data: CycleData, entries: PastEntry[], today: string): { ok: PastEntry[]; problems: PastProblem[] } {
  const ok: PastEntry[] = [];
  const problems: PastProblem[] = [];
  const kept: { start: string; end: string | null }[] = [...data.bleeds];
  for (const e of [...entries].sort((a, b) => (a.start < b.start ? -1 : 1))) {
    const p = pastProblem(e, kept, today);
    if (p) problems.push(p);
    else {
      ok.push(e);
      kept.push(e);
    }
  }
  return { ok, problems };
}

/** Add past bleeds: those that pass the checks are kept, the rest come back as problems to show. */
export function addPastBleeds(data: CycleData, entries: PastEntry[], makeId: () => string, now: Date): { data: CycleData; added: number; problems: PastProblem[] } {
  const { ok, problems } = checkPastBleeds(data, entries, dayKey(now));
  let next = data;
  for (const e of ok) next = putBleed(next, { id: makeId(), start: e.start, end: e.end, flow: {}, updatedAt: '' }, now);
  return { data: next, added: ok.length, problems };
}

/** Change a bleed's start and end, checked against the others. Flow logged outside the new days is dropped. */
export function editBleed(data: CycleData, id: string, start: string, end: string | null, now: Date): { data: CycleData; problem: PastProblem | null } {
  const bleed = data.bleeds.find((b) => b.id === id);
  if (!bleed) return { data, problem: null };
  const problem = pastProblem({ start, end }, data.bleeds.filter((b) => b.id !== id), dayKey(now));
  if (problem) return { data, problem };
  const flow: Bleed['flow'] = {};
  for (const [k, v] of Object.entries(bleed.flow)) if (daysBetween(start, k) >= 0 && (!end || daysBetween(k, end) >= 0)) flow[k] = v;
  return { data: putBleed(data, { ...bleed, start, end, flow }, now), problem: null };
}

/** An entry from a start and, optionally, how many days it lasted. */
export const entryWithLength = (start: string, days: number | null): PastEntry => ({ start, end: days && days > 0 ? addDays(start, Math.min(days, MAX_BLEED_DAYS + 1) - 1) : null });

// ── Reading a pasted list ────────────────────────────────────────────────

const MONTH_WORDS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6,
  jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

const key = (y: number, m: number, d: number) => {
  const k = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return isDayKey(k) ? k : null;
};
const fullYear = (y: string) => (y.length <= 2 ? 2000 + Number(y) : Number(y));
/** With no year given: the latest such day not after today. */
function noYear(m: number, d: number, today: string): string | null {
  const y = Number(today.slice(0, 4));
  const k = key(y, m, d);
  if (!k) return key(y - 1, m, d);
  return daysBetween(today, k) > 0 ? key(y - 1, m, d) : k;
}

const MONTH = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?';
const PATTERNS: { re: RegExp; read: (m: RegExpExecArray, order: 'dmy' | 'mdy', today: string) => string | null }[] = [
  // 2026-03-04, 2026/3/4, 2026.03.04
  { re: /\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/y, read: (m) => key(+m[1], +m[2], +m[3]) },
  // 4/3/2026, 04.03.26 (day or month first, as chosen; a number over 12 settles it)
  {
    re: /\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4}|\d{2})\b/y,
    read: (m, order) => {
      const y = fullYear(m[3]);
      const [day, month] = order === 'dmy' ? [+m[1], +m[2]] : [+m[2], +m[1]];
      return month > 12 && day <= 12 ? key(y, day, month) : key(y, month, day);
    },
  },
  // 4 March 2026, 4th Mar, 4 Mar 26
  {
    re: new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${MONTH}(?:,?\\s+(\\d{4}))?\\b`, 'iy'),
    read: (m, _o, today) => (m[3] ? key(+m[3], MONTH_WORDS[m[2].toLowerCase()], +m[1]) : noYear(MONTH_WORDS[m[2].toLowerCase()], +m[1], today)),
  },
  // March 4, 2026; Mar 4th; March 4
  {
    re: new RegExp(`\\b${MONTH}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`, 'iy'),
    read: (m, _o, today) => (m[3] ? key(+m[3], MONTH_WORDS[m[1].toLowerCase()], +m[2]) : noYear(MONTH_WORDS[m[1].toLowerCase()], +m[2], today)),
  },
];

/** Every date in a line, in order. */
function datesIn(line: string, order: 'dmy' | 'mdy', today: string): { dates: string[]; bad: boolean } {
  const dates: string[] = [];
  let bad = false;
  for (let i = 0; i < line.length; i++) {
    if (i > 0 && /[\w]/.test(line[i - 1])) continue;
    for (const p of PATTERNS) {
      p.re.lastIndex = i;
      const m = p.re.exec(line);
      if (!m) continue;
      const k = p.read(m, order, today);
      if (k) dates.push(k);
      else bad = true;
      i += m[0].length - 1;
      break;
    }
  }
  return { dates, bad };
}

/**
 * Read a pasted list of past periods: one per line (or separated by
 * semicolons). A line may hold a start date; a start and an end ("3 March
 * 2026 to 7 March 2026"); a start and how long ("2026-03-03, 5 days"); or
 * several start dates. Two dates more than two weeks apart are two starts.
 * Slashed dates are read day first or month first as chosen. What can't be
 * read comes back in `unread`.
 */
export function parsePastList(text: string, order: 'dmy' | 'mdy', today: string): { entries: PastEntry[]; unread: string[] } {
  const entries: PastEntry[] = [];
  const unread: string[] = [];
  for (const raw of String(text || '').split(/[\n;]+/)) {
    const line = raw.trim();
    if (!line) continue;
    const { dates, bad } = datesIn(line, order, today);
    if (!dates.length) {
      unread.push(line);
      continue;
    }
    if (bad) unread.push(line);
    const length = /(\d{1,2})\s*(?:days?|d)\b/i.exec(line.replace(/\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/g, ''));
    if (dates.length === 1) entries.push(entryWithLength(dates[0], length ? +length[1] : null));
    else if (dates.length === 2 && daysBetween(dates[0], dates[1]) >= 0 && daysBetween(dates[0], dates[1]) < MAX_BLEED_DAYS) entries.push({ start: dates[0], end: dates[1] });
    else for (const d of dates) entries.push({ start: d, end: null });
  }
  return { entries, unread };
}

/** Which way round a slashed date is usually written where the person is (the US and a few others put the month first). */
export function dateOrderFor(locale: string | undefined): 'dmy' | 'mdy' {
  return /^en-(US|PH|CA)\b|^en-US/i.test(locale ?? '') || /-(US|PH|FM|MH|PW)$/i.test(locale ?? '') ? 'mdy' : 'dmy';
}

// ── A month to pick days on ──────────────────────────────────────────────

export type CalendarDay = { key: string; day: number; inMonth: boolean; future: boolean; bleeding: boolean; start: boolean; picked: boolean };

/**
 * The weeks of a month (Monday first), each day marked: in this month, in
 * the future (not pickable), within a logged bleed, the start of one, or
 * picked as a new start.
 */
export function calendarMonth(data: CycleData, year: number, month: number, picked: string[], today: string): CalendarDay[][] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const begin = dayKey(new Date(year, month, 1 - lead));
  const spans = sortedBleeds(data).map(span);
  const weeks: CalendarDay[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const k = addDays(begin, w * 7 + i);
      const d = fromKey(k)!;
      week.push({
        key: k,
        day: d.getDate(),
        inMonth: d.getMonth() === month,
        future: daysBetween(today, k) > 0,
        bleeding: spans.some((s) => daysBetween(s[0], k) >= 0 && daysBetween(k, s[1]) >= 0),
        start: spans.some((s) => s[0] === k),
        picked: picked.includes(k),
      });
    }
    if (w >= 4 && !week.some((d) => d.inMonth)) break;
    weeks.push(week);
  }
  return weeks;
}

export const MONTH_TITLES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
