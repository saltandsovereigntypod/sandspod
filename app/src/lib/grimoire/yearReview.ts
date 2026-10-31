// Year in review: a personal look back over one year of practice, by the
// person's own new year (yearSpan.ts). Rituals done and planned, workings and
// whether they worked, the full and new moons kept, the holidays kept,
// Grimoire pages and dreams, the cards drawn most, Cycle & Moon (only for
// someone who keeps it, and never on the shareable card), journeys and
// courses, offerings, coven gatherings and changes at the altar; then a few
// reflection prompts drawn from the year itself, which can become a year-end
// page in the Grimoire. Shown at Grimoire → Your year
// (app/src/app/(tabs)/grimoire/year.tsx) and on the website at /grimoire/year/.
// Private: nothing here is sent anywhere; the shareable card holds counts only.
// Pure, so it can be tested; the screens gather the records and pass them in.

import type { ReadingEntry } from '../craft/hedge/readings.ts';
import type { DreamEntry } from '../craft/hedge/dreams.ts';
import type { CycleData } from '../cycle/types.ts';
import { divinationPatterns, type CardCount } from '../divination/patterns.ts';
import { holidaysBetween, type Holiday, type HolidayChoice } from '../holidays.ts';
import { fullMoonName, lunation, lunationOf } from '../calendars/moon.ts';
import { holyRef } from '../holy/refs.ts';
import type { JourneyProgress } from '../journeys/progress.ts';
import { journalDate, journalThemes } from '../rituals/insights.ts';
import { dateFromKey, localDateKey } from '../rituals/lifecycle.ts';
import { readLookBack, type Outcome } from '../rituals/lookBack.ts';
import type { JournalRow, RitualPlan } from '../rituals/types.ts';
import { offeringsOf } from '../altar/devotion.ts';
import { placedAtOf } from '../altar/livingState.ts';
import type { AltarData } from '../altar/types.ts';
import type { YearSpan } from './yearSpan.ts';

/** Something dated, from wherever it's kept: an offering, a gathering, a change at the altar. */
export type Dated = { at: string; label: string; detail?: string; id?: string };

export type JourneyInput = { id: string; title: string; progress: JourneyProgress };
export type CourseInput = { id: string; title: string; startedAt?: string | null; completedAt?: string | null; /** When each step (lesson, task) was done. */ steps: string[]; total?: number };

export type YearInput = {
  journal: JournalRow[];
  plans: RitualPlan[];
  readings: ReadingEntry[];
  dreams: DreamEntry[];
  /** Grimoire pages, with when each was made. */
  pages: { id: string; title: string | null; created_at?: string | null }[];
  holidayChoice: HolidayChoice;
  offerings: Dated[];
  gatherings: Dated[];
  altarChanges: Dated[];
  journeys: JourneyInput[];
  courses: CourseInput[];
  /** Cycle & Moon, only when kept and open on this device; null otherwise. */
  cycle: CycleData | null;
  south?: boolean;
};

const DAY_MS = 86_400_000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A moment (ISO time or "YYYY-MM-DD") as a local day key, or null. */
export function dayKeyOf(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return dateFromKey(value) ? value : null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? localDateKey(new Date(t)) : null;
}
const within = (key: string | null, span: YearSpan) => !!key && key >= span.startKey && key <= span.lastKey;
const journalKey = (e: JournalRow) => {
  const d = journalDate(e);
  return d ? localDateKey(d) : null;
};
const near = (key: string, target: Date, before: number, after: number) => {
  const d = dateFromKey(key);
  if (!d) return false;
  const diff = Math.round((d.getTime() - new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime()) / DAY_MS);
  return diff >= -before && diff <= after;
};

export type MonthBar = { key: string; label: string; count: number };
export type MoonKept = { kind: 'full' | 'new'; date: string; name: string; kept: boolean; past: boolean };
export type HolidayKept = { id: string; name: string; date: string; ref: string; kept: boolean; planned: boolean; past: boolean };

export type YearReview = {
  span: YearSpan;
  /** Whether the year is still going (and how much is left). */
  ongoing: boolean;
  rituals: { done: number; byMonth: MonthBar[]; themes: { label: string; count: number }[]; titles: { id: string; title: string; date: string }[] };
  plans: { planned: number; done: number; ahead: number; items: { id: string; title: string; date: string; done: boolean }[] };
  workings: { lookedBack: number; worked: number; partly: number; notYet: number; no: number; waiting: number; boreOut: { id: string; title: string; outcome: Outcome }[] };
  moons: { full: number; fullKept: number; new: number; newKept: number; list: MoonKept[] };
  holidays: { total: number; kept: number; list: HolidayKept[] };
  pages: { made: number; titles: { id: string; title: string }[] };
  dreams: { count: number; lucid: number; recurring: number; symbols: { symbol: string; count: number }[] };
  readings: { count: number; draws: number; top: CardCount[] };
  cycle: { bleeds: number; averageLength: number | null; notedDays: number } | null;
  journeys: { id: string; title: string; started: boolean; dedicated: boolean; lessons: number; practices: number; stages: number }[];
  courses: { id: string; title: string; started: boolean; completed: boolean; steps: number; total?: number }[];
  offerings: { count: number; to: { label: string; count: number }[] };
  gatherings: { count: number; list: Dated[] };
  altar: { count: number; list: Dated[] };
  /** Is there anything at all in the year? */
  empty: boolean;
};

function monthBars(keys: string[], span: YearSpan): MonthBar[] {
  const out: MonthBar[] = [];
  for (let d = new Date(span.start.getFullYear(), span.start.getMonth(), 1); d < span.end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ key, label: `${MONTHS[d.getMonth()]}${d.getMonth() === 0 || out.length === 0 ? ` ${d.getFullYear()}` : ''}`, count: keys.filter((k) => k.startsWith(key)).length });
  }
  return out;
}

const counted = (labels: string[], limit: number) =>
  [...labels.reduce((m, l) => m.set(l, (m.get(l) ?? 0) + 1), new Map<string, number>()).entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);

/** The new and full moons of the year, and whether a ritual or reading met each (on the day, or the day either side). */
export function moonsOfYear(span: YearSpan, activity: string[], now: Date, south = false): MoonKept[] {
  const out: MoonKept[] = [];
  const today = localDateKey(now);
  for (let k = lunationOf(span.start).k - 1; ; k++) {
    const l = lunation(k);
    if (l.newMoon >= span.end) break;
    for (const [kind, at] of [
      ['new', l.newMoon],
      ['full', l.full],
    ] as const) {
      const key = localDateKey(at);
      if (!within(key, span)) continue;
      out.push({ kind, date: key, name: kind === 'full' ? fullMoonName(at, south).name : 'New Moon', kept: activity.some((a) => near(a, at, 1, 1)), past: key <= today });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** Everything the year holds, by the person's own year. */
export function yearReview(input: YearInput, span: YearSpan, now: Date): YearReview {
  const today = localDateKey(now);
  const journal = input.journal.filter((e) => within(journalKey(e), span));
  const ritualKeys = journal.map(journalKey).filter((k): k is string => !!k);

  const plans = input.plans.filter((p) => within(dayKeyOf(p.date), span)).sort((a, b) => a.date.localeCompare(b.date));

  let worked = 0;
  let partly = 0;
  let notYet = 0;
  let no = 0;
  let waiting = 0;
  const workedList: { id: string; title: string; outcome: Outcome }[] = [];
  for (const e of journal) {
    const lb = readLookBack(e);
    if (!lb) continue;
    if (!lb.answer) {
      waiting++;
      continue;
    }
    if (lb.answer === 'yes') worked++;
    else if (lb.answer === 'partly') partly++;
    else if (lb.answer === 'not_yet') notYet++;
    else no++;
    if (lb.answer === 'yes' || lb.answer === 'partly') workedList.push({ id: e.id, title: e.title || 'A working', outcome: lb.answer });
  }

  const readings = input.readings.filter((e) => within(e.data.date, span));
  const patterns = divinationPatterns(readings, now, { limit: 5 });
  const readingKeys = readings.map((e) => e.data.date);

  const offerings = input.offerings.filter((o) => within(dayKeyOf(o.at), span));
  const activity = [...ritualKeys, ...readingKeys, ...offerings.map((o) => dayKeyOf(o.at)!)];
  const moons = moonsOfYear(span, activity, now, input.south);

  const holidays: HolidayKept[] = holidaysBetween(span.start, span.end, input.holidayChoice)
    .filter((h: Holiday) => within(localDateKey(h.date), span))
    .map((h) => {
      const key = localDateKey(h.date);
      const days = Math.max(1, h.days);
      return {
        id: h.id,
        name: h.name,
        date: key,
        ref: holyRef(h.id),
        kept: activity.some((a) => near(a, h.date, 1, days)),
        planned: plans.some((p) => near(p.date, h.date, 1, days)),
        past: key <= today,
      };
    });

  const pages = input.pages.filter((p) => within(dayKeyOf(p.created_at), span));
  const dreams = input.dreams.filter((d) => within(d.data.date, span));

  const cycle = input.cycle ? cycleSummary(input.cycle, span) : null;

  const journeys = input.journeys
    .map(({ id, title, progress: p }) => {
      const lessons = Object.values(p.lessonsRead ?? {}).filter((at) => within(dayKeyOf(at), span)).length;
      const practices = Object.values(p.practiceLog ?? {})
        .flat()
        .filter((x) => within(dayKeyOf(x?.at), span)).length;
      const stages = Object.values(p.stageDoneAt ?? {}).filter((at) => within(dayKeyOf(at), span)).length;
      return { id, title, started: within(dayKeyOf(p.startedAt), span), dedicated: within(dayKeyOf(p.dedicatedAt), span), lessons, practices, stages };
    })
    .filter((j) => j.started || j.dedicated || j.lessons || j.practices || j.stages);

  const courses = input.courses
    .map((c) => ({
      id: c.id,
      title: c.title,
      started: within(dayKeyOf(c.startedAt), span),
      completed: within(dayKeyOf(c.completedAt), span),
      steps: c.steps.filter((s) => within(dayKeyOf(s), span)).length,
      ...(c.total ? { total: c.total } : {}),
    }))
    .filter((c) => c.started || c.completed || c.steps);

  const gatherings = input.gatherings.filter((g) => within(dayKeyOf(g.at), span)).sort((a, b) => a.at.localeCompare(b.at));
  const altar = input.altarChanges.filter((a) => within(dayKeyOf(a.at), span)).sort((a, b) => a.at.localeCompare(b.at));

  const review: YearReview = {
    span,
    ongoing: today <= span.lastKey,
    rituals: {
      done: journal.length,
      byMonth: monthBars(ritualKeys, span),
      themes: counted(journal.flatMap(journalThemes), 5),
      titles: journal
        .map((e) => ({ id: e.id, title: e.title || 'A ritual', date: journalKey(e) ?? '' }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    },
    plans: {
      planned: plans.length,
      done: plans.filter((p) => !!p.doneAt).length,
      ahead: plans.filter((p) => !p.doneAt && p.date >= today).length,
      items: plans.map((p) => ({ id: p.id, title: p.title || 'A planned working', date: p.date, done: !!p.doneAt })),
    },
    workings: { lookedBack: worked + partly + notYet + no, worked, partly, notYet, no, waiting, boreOut: workedList },
    moons: {
      full: moons.filter((m) => m.kind === 'full' && m.past).length,
      fullKept: moons.filter((m) => m.kind === 'full' && m.kept).length,
      new: moons.filter((m) => m.kind === 'new' && m.past).length,
      newKept: moons.filter((m) => m.kind === 'new' && m.kept).length,
      list: moons,
    },
    holidays: { total: holidays.filter((h) => h.past).length, kept: holidays.filter((h) => h.kept).length, list: holidays },
    pages: { made: pages.length, titles: pages.map((p) => ({ id: p.id, title: p.title || 'Untitled page' })) },
    dreams: {
      count: dreams.length,
      lucid: dreams.filter((d) => d.data.lucid).length,
      recurring: dreams.filter((d) => d.data.recurring).length,
      symbols: counted(
        dreams.flatMap((d) => [...new Set(d.data.symbols)]),
        8,
      )
        .filter((s) => s.count >= 2)
        .map((s) => ({ symbol: s.label, count: s.count })),
    },
    readings: { count: patterns.readings, draws: patterns.draws, top: patterns.top },
    cycle,
    journeys,
    courses,
    offerings: { count: offerings.length, to: counted(offerings.map((o) => o.detail || o.label), 5) },
    gatherings: { count: gatherings.length, list: gatherings },
    altar: { count: altar.length, list: altar },
    empty: false,
  };
  review.empty =
    !journal.length && !plans.length && !readings.length && !dreams.length && !pages.length && !offerings.length && !gatherings.length && !altar.length && !journeys.length && !courses.length && !(cycle && cycle.bleeds);
  return review;
}

/** Cycle & Moon over the year: how many bleeds began, the average length between them, and days with a note. Private. */
export function cycleSummary(data: CycleData, span: YearSpan): YearReview['cycle'] {
  const starts = (data.bleeds ?? [])
    .map((b) => b.start)
    .filter((k) => within(k, span))
    .sort();
  const gaps: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    const gap = Math.round((dateFromKey(starts[i])!.getTime() - dateFromKey(starts[i - 1])!.getTime()) / DAY_MS);
    if (gap >= 15 && gap <= 60) gaps.push(gap);
  }
  const noted = new Set((data.notes ?? []).map((n) => n.date).filter((k) => within(k, span))).size;
  return { bleeds: starts.length, averageLength: gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null, notedDays: noted };
}

/**
 * From saved altars: each offering made to a deity on them (devotion.ts), and
 * each change at the altar (a thing placed, the altar saved), as dated records.
 */
export function altarRecords(altars: (AltarData & { id: string; name: string; savedAt?: string; updatedAt?: string })[], now: Date): { offerings: Dated[]; changes: Dated[] } {
  const offerings: Dated[] = [];
  const changes: Dated[] = [];
  const iso = now.toISOString();
  for (const altar of altars) {
    const name = altar.name || 'Your altar';
    if (altar.savedAt) changes.push({ at: altar.savedAt, label: `${name} first saved`, id: altar.id });
    if (altar.updatedAt && altar.updatedAt !== altar.savedAt) changes.push({ at: altar.updatedAt, label: `${name} last changed`, id: altar.id });
    for (const object of altar.objects ?? []) {
      const placed = placedAtOf(object);
      const label = object.label || 'Something';
      if (Number.isFinite(placed)) changes.push({ at: new Date(placed).toISOString(), label: `${label} placed on ${name}`, id: altar.id });
      if (object.type !== 'deity') continue;
      for (const o of offeringsOf(object, iso)) {
        if (!o.occurredAt) continue;
        const given = (o.items ?? []).map((i) => i.label).filter(Boolean).join(', ') || (o.types ?? []).join(', ') || 'An offering';
        offerings.push({ at: o.occurredAt, label: given, detail: label, id: altar.id });
      }
    }
  }
  return { offerings, changes };
}

/**
 * From the coven tables (read by the screens, each limited to your own rows by
 * the database): the gatherings you were at (marked present, or joined live),
 * and your coven programs as courses (when you began and finished, and each
 * task you did).
 */
export function covenRecords(rows: {
  attendance: { ritual_id: string; present: boolean | null; joined_at: string | null }[];
  rituals: { id: string; coven_id: string; title: string; scheduled_for: string | null; ended_at: string | null }[];
  covens: { id: string; name: string }[];
  enrollments: { id: string; program_id: string; started_at: string; completed_at: string | null; status?: string }[];
  programs: { id: string; title: string }[];
  progress: { enrollment_id: string; submitted_at: string | null; checked_at: string | null; updated_at?: string | null }[];
}): { gatherings: Dated[]; courses: CourseInput[] } {
  const was = new Set(rows.attendance.filter((a) => a.present === true || (a.present !== false && !!a.joined_at)).map((a) => a.ritual_id));
  const gatherings = rows.rituals
    .filter((r) => was.has(r.id))
    .map((r) => ({ at: r.scheduled_for || r.ended_at || '', label: r.title || 'A gathering', detail: rows.covens.find((c) => c.id === r.coven_id)?.name, id: r.id }))
    .filter((g) => !!g.at);
  const courses = rows.enrollments.map((e) => ({
    id: e.id,
    title: rows.programs.find((p) => p.id === e.program_id)?.title || 'A coven program',
    startedAt: e.started_at,
    completedAt: e.completed_at,
    steps: rows.progress
      .filter((p) => p.enrollment_id === e.id)
      .map((p) => p.submitted_at || p.checked_at || p.updated_at || '')
      .filter(Boolean),
  }));
  return { gatherings, courses };
}

/** The astrology course (`astro.course`) as a course: when each lesson was read and each quiz last taken. */
/** The astrology course's name, as its pages give it (astro/course/index.ts COURSE_TITLE). */
export const COURSE_TITLE = 'Learn astrology';

export function astroCourse(progress: { read?: Record<string, string>; quizzes?: Record<string, { lastAt?: string }>; startedAt?: string } | null | undefined, title: string): CourseInput | null {
  if (!progress) return null;
  const steps = [...Object.values(progress.read ?? {}), ...Object.values(progress.quizzes ?? {}).map((q) => q?.lastAt ?? '')].filter((s): s is string => typeof s === 'string' && !!s);
  return { id: 'astro-course', title, startedAt: progress.startedAt ?? null, completedAt: null, steps };
}

/** The year in a few plain sentences. */
export function yearLines(r: YearReview): string[] {
  const out: string[] = [];
  const n = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
  if (r.rituals.done) out.push(`You kept ${n(r.rituals.done, 'ritual', 'rituals')}${r.rituals.themes[0] ? `, most often for ${r.rituals.themes[0].label.toLowerCase()}` : ''}.`);
  if (r.workings.lookedBack) out.push(`Of ${n(r.workings.lookedBack, 'working', 'workings')} you looked back on, ${r.workings.worked} worked and ${r.workings.partly} partly did.`);
  if (r.moons.fullKept || r.moons.newKept) out.push(`You met ${r.moons.fullKept} of ${r.moons.full} full moons and ${r.moons.newKept} of ${r.moons.new} new moons with a ritual, a reading or an offering.`);
  if (r.holidays.kept) out.push(`You kept ${n(r.holidays.kept, 'holiday', 'holidays')} of ${r.holidays.total}.`);
  if (r.readings.count) out.push(`You drew ${n(r.readings.count, 'reading', 'readings')}${r.readings.top[0] && r.readings.top[0].count >= 2 ? `; ${r.readings.top[0].name} came most` : ''}.`);
  if (r.dreams.count) out.push(`You wrote down ${n(r.dreams.count, 'dream', 'dreams')}${r.dreams.symbols[0] ? `; ${r.dreams.symbols[0].symbol} came back most` : ''}.`);
  if (r.pages.made) out.push(`Your Grimoire gained ${n(r.pages.made, 'page', 'pages')}.`);
  if (r.offerings.count) out.push(`You made ${n(r.offerings.count, 'offering', 'offerings')}.`);
  if (r.gatherings.count) out.push(`You gathered with your coven ${n(r.gatherings.count, 'time', 'times')}.`);
  return out;
}

/** Gentle questions for a year-end Grimoire entry, drawn from what the year held. */
export function reflectionPrompts(r: YearReview): string[] {
  const out: string[] = ['Looking back over this year, what are you most glad you made time for?'];
  if (r.rituals.done) out.push(`Of the ${r.rituals.done === 1 ? 'ritual' : `${r.rituals.done} rituals`} you kept, which stays with you most, and why?`);
  if (r.workings.worked + r.workings.partly) out.push('Think of the workings that bore out. What did they have in common?');
  if (r.workings.no + r.workings.notYet) out.push('Some workings didn’t come to pass, or haven’t yet. What have they taught you?');
  const card = r.readings.top[0];
  if (card && card.count >= 3) out.push(`${card.name} came to you ${card.count} times. What do you think it was saying?`);
  const symbol = r.dreams.symbols[0];
  if (symbol) out.push(`${symbol.symbol[0].toUpperCase()}${symbol.symbol.slice(1)} came in ${symbol.count} of your dreams. Where is it in your waking life?`);
  if (r.holidays.kept) out.push('Which festival felt most alive this year, and what made it so?');
  const journey = r.journeys[0];
  if (journey) out.push(`How has walking ${journey.title} changed you?`);
  if (r.gatherings.count) out.push('What did your coven give you this year, and what did you give it?');
  out.push('What will you carry into the year ahead, and what will you leave behind?');
  return out;
}

/** A small card to share: counts only. No questions, cards, dreams, workings, titles, deities or Cycle & Moon. */
export function shareCard(r: YearReview): { title: string; lines: string[] } {
  const lines = [
    r.rituals.done ? `${r.rituals.done} ${r.rituals.done === 1 ? 'ritual' : 'rituals'}` : null,
    r.moons.fullKept ? `${r.moons.fullKept} full ${r.moons.fullKept === 1 ? 'moon' : 'moons'} kept` : null,
    r.holidays.kept ? `${r.holidays.kept} ${r.holidays.kept === 1 ? 'holiday' : 'holidays'} kept` : null,
    r.readings.count ? `${r.readings.count} ${r.readings.count === 1 ? 'reading' : 'readings'}` : null,
    r.dreams.count ? `${r.dreams.count} ${r.dreams.count === 1 ? 'dream' : 'dreams'} written down` : null,
    r.pages.made ? `${r.pages.made} Grimoire ${r.pages.made === 1 ? 'page' : 'pages'}` : null,
    r.offerings.count ? `${r.offerings.count} ${r.offerings.count === 1 ? 'offering' : 'offerings'}` : null,
    r.gatherings.count ? `${r.gatherings.count} coven ${r.gatherings.count === 1 ? 'gathering' : 'gatherings'}` : null,
  ].filter((l): l is string => !!l);
  return { title: `My year in practice: ${r.span.label}`, lines };
}

/** The shareable card as plain text, signed off with where it came from. */
export const shareText = (r: YearReview) => {
  const card = shareCard(r);
  return [card.title, ...card.lines.map((l) => `· ${l}`), '', 'Salt & Sovereignty'].join('\n');
};

/** The tag a year-end page carries in the Grimoire, so it's found again rather than made twice. */
export const yearPageRef = (span: YearSpan) => `year-review-${span.kind}-${span.startKey}`;
export const YEAR_SECTION = 'Year in review';

const html = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The year-end Grimoire page: the year in a few lines, then each prompt with room to write (holyOps.ts block shapes). */
export function yearPage(r: YearReview, prompts: string[] = reflectionPrompts(r)): { ref: string; title: string; sectionTitle: string; blocks: { type: string; content: string }[] } {
  const lines = yearLines(r);
  return {
    ref: yearPageRef(r.span),
    title: `My year: ${r.span.label}`,
    sectionTitle: YEAR_SECTION,
    blocks: [
      { type: 'callout', content: html(`${r.span.range}.`) },
      ...(lines.length ? [{ type: 'heading', content: 'The year in brief' }, { type: 'bulleted_list', content: lines.map(html).join('\n') }] : []),
      ...prompts.flatMap((p) => [
        { type: 'heading', content: html(p) },
        { type: 'text', content: '' },
      ]),
    ],
  };
}
