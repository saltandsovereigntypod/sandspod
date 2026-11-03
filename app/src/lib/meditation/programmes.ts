// Meditation programmes: "7 days of grounding" (a day's focus each day),
// "28-day moon cycle" (each day's focus set by the moon's phase that day) and
// "Sabbat sits" (one for each festival in your calendars this year). Nothing
// new is stored: a sit made for a programme carries its id and day (or
// festival) in its own record (meditation.sits), and progress is read back
// from the log. Beginning day 1 again starts a fresh run. Shown on
// Meditation → Programmes and on Today; a programme can be added to To tend
// with "Count my meditations" on. Also suggestions for today: a sit for the
// moon's phase, for a festival today, and with the deities you keep. Pure.

import { holidaysBetween, type HolidayChoice } from '../holidays.ts';
import { moonState, type PhaseName } from '../moon.ts';
import { localDateKey } from '../rituals/lifecycle.ts';
import type { SitEntry, SitKind } from './log.ts';
import type { ScriptId } from './scripts.ts';

export type ProgrammeId = 'grounding7' | 'moon28' | 'sabbats';

export const PROGRAMMES: { id: ProgrammeId; title: string; line: string; days: number | null }[] = [
  { id: 'grounding7', title: '7 days of grounding', line: 'Ten minutes a day for a week, each day with its own focus.', days: 7 },
  { id: 'moon28', title: '28-day moon cycle', line: 'A sit a day through a whole moon, its focus set by the phase each night.', days: 28 },
  { id: 'sabbats', title: 'Sabbat sits', line: 'A sit for each festival in your calendars this year.', days: null },
];
export const programmeOf = (id: unknown) => PROGRAMMES.find((p) => p.id === id) ?? null;

export type Focus = { title: string; line: string; script: ScriptId | null; kind: SitKind };

export const GROUNDING_DAYS: Focus[] = [
  { title: 'Roots', line: 'Grow roots into the earth and feel yourself held.', script: 'grounding', kind: 'grounding' },
  { title: 'Breath', line: 'Simply follow the breath in and out, and come back each time you wander.', script: null, kind: 'breath' },
  { title: 'The body', line: 'Move your attention slowly from your feet to your crown.', script: 'body', kind: 'body' },
  { title: 'Clearing', line: 'Breathe out what you carry, and set a clear space around you.', script: 'clearing', kind: 'breath' },
  { title: 'The elements', line: 'Earth, air, fire and water, one after another.', script: 'elements', kind: 'visualisation' },
  { title: 'Centre', line: 'Find the still point at your heart, between earth and sky.', script: 'grounding', kind: 'grounding' },
  { title: 'Rest', line: 'Lie down and rest awake. You have made a week of it.', script: 'rest', kind: 'body' },
];

export const MOON_FOCUS: Record<PhaseName, Focus> = {
  'New Moon': { title: 'Seeds', line: 'In the dark of the moon, sit with what you would like to begin.', script: 'cauldrons', kind: 'visualisation' },
  'Waxing Crescent': { title: 'Intention', line: 'Hold the first sliver of light, and say what you are growing.', script: 'grounding', kind: 'grounding' },
  'First Quarter': { title: 'Courage', line: 'Half lit: sit with what needs effort, and draw up strength.', script: 'elements', kind: 'visualisation' },
  'Waxing Gibbous': { title: 'Tending', line: 'Nearly full: notice what is ripening, and what it needs.', script: 'body', kind: 'body' },
  'Full Moon': { title: 'Light', line: 'Under the full moon, sit in its light and see clearly.', script: 'guide', kind: 'pathworking' },
  'Waning Gibbous': { title: 'Thanks', line: 'As the light begins to wane, give thanks for what has come.', script: null, kind: 'devotional' },
  'Last Quarter': { title: 'Release', line: 'Half dark: breathe out what you are ready to let go.', script: 'clearing', kind: 'breath' },
  'Waning Crescent': { title: 'Rest', line: 'The last thin moon: rest deeply before the dark.', script: 'rest', kind: 'body' },
};

export type Run = {
  /** Days sat in this run. */
  done: number;
  /** The run's length (7, 28), or null for Sabbat sits. */
  of: number | null;
  /** Sat for it today already. */
  today: boolean;
  /** The day to sit next (1-based); equal to `done` when today's is done. */
  next: number;
  complete: boolean;
  /** When the run's first sit was, or null before any. */
  started: string | null;
  /** When it was last sat. */
  last: string | null;
};

/** The current run of a day-by-day programme: from its latest day 1 on, counting the days sat. */
export function programmeRun(sits: SitEntry[], id: ProgrammeId, now: Date): Run {
  const of = programmeOf(id)?.days ?? null;
  const mine = sits.filter((s) => s.data.programme === id).sort((a, b) => a.data.at.localeCompare(b.data.at));
  let from = 0;
  mine.forEach((s, i) => {
    if (s.data.step === '1') from = i;
  });
  const run = mine.slice(from);
  const days = new Set(run.map((s) => localDateKey(new Date(s.data.at))));
  const today = days.has(localDateKey(now));
  const done = of === null ? days.size : Math.min(of, days.size);
  const complete = of !== null && done >= of;
  return { done, of, today, next: today || complete ? Math.max(1, done) : done + 1, complete, started: run[0]?.data.at ?? null, last: run[run.length - 1]?.data.at ?? null };
}

/** A run still under way: begun, not finished, and sat within the last week. */
export function runActive(run: Run, now: Date): boolean {
  return !!run.last && !run.complete && now.getTime() - Date.parse(run.last) < 7 * 86_400_000;
}

/** The focus for a day of a programme (`on` gives the moon's phase for the moon cycle). */
export function focusFor(id: ProgrammeId, day: number, on: Date): Focus {
  if (id === 'grounding7') return GROUNDING_DAYS[Math.max(0, Math.min(6, day - 1))];
  if (id === 'moon28') return MOON_FOCUS[moonState(on).name];
  return { title: 'The festival', line: 'Sit with the season and what the festival means to you.', script: 'grounding', kind: 'devotional' };
}

export type Festival = { id: string; name: string; date: string };

/** The festivals in your calendars this year that come once a year (not each month or week), in order. */
export function yearFestivals(now: Date, choice: HolidayChoice): Festival[] {
  const from = new Date(now.getFullYear(), 0, 1);
  const to = new Date(now.getFullYear(), 11, 31, 23, 59);
  const seen = new Set<string>();
  const out: Festival[] = [];
  for (const h of holidaysBetween(from, to, choice)) {
    if (h.recurs !== 'yearly' || seen.has(h.id)) continue;
    seen.add(h.id);
    out.push({ id: h.id, name: h.name, date: localDateKey(h.date) });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** Which of the year's festivals have had their sit (one sat for that festival this year), and the next to come. */
export function sabbatProgress(sits: SitEntry[], festivals: Festival[], now: Date): { done: string[]; total: number; today: Festival | null; next: Festival | null } {
  const year = String(now.getFullYear());
  const sat = new Set(sits.filter((s) => s.data.programme === 'sabbats' && s.data.at.startsWith(year) && s.data.step).map((s) => s.data.step!));
  const key = localDateKey(now);
  return {
    done: festivals.filter((f) => sat.has(f.id)).map((f) => f.id),
    total: festivals.length,
    today: festivals.find((f) => f.date === key) ?? null,
    next: festivals.find((f) => f.date > key) ?? null,
  };
}

/** "Day 3 of 7", "Day 7 of 7, finished", "2 of 8 festivals". */
export function runLine(run: Run): string {
  if (run.of === null) return `${run.done} sat`;
  if (run.complete) return `All ${run.of} days sat`;
  if (!run.started) return `${run.of} days`;
  return `Day ${run.next} of ${run.of}${run.today ? ', sat today' : ''}`;
}

/** For Today: the programmes under way ("7 days of grounding · Day 3 of 7"), and a Sabbat sit when a festival is today. */
export function todayProgrammes(sits: SitEntry[], festivalsToday: Festival[], now: Date): { title: string; line: string; done: boolean }[] {
  const out: { title: string; line: string; done: boolean }[] = [];
  for (const p of PROGRAMMES) {
    if (p.days === null) continue;
    const run = programmeRun(sits, p.id, now);
    if (!runActive(run, now) && !(run.today && !run.complete)) continue;
    const f = focusFor(p.id, run.next, now);
    out.push({ title: p.title, line: `${runLine(run)} · ${run.today ? 'done for today' : f.title}`, done: run.today });
  }
  const year = String(now.getFullYear());
  for (const f of festivalsToday) {
    const sat = sits.some((s) => s.data.programme === 'sabbats' && s.data.step === f.id && s.data.at.startsWith(year));
    out.push({ title: `A sit for ${f.name}`, line: sat ? 'Sat today' : 'A Sabbat sit, for the festival today', done: sat });
  }
  return out;
}

export type Suggestion ={ title: string; line: string; script: ScriptId | null; kind: SitKind; intention?: string; programme?: ProgrammeId; step?: string };

/** A few sits for today: for the moon's phase, for a festival today, and with the deities you keep closest. */
export function suggestionsFor(now: Date, festivalsToday: Festival[], deities: { name: string; level: string }[]): Suggestion[] {
  const phase = moonState(now).name;
  const moon = MOON_FOCUS[phase];
  const out: Suggestion[] = [{ title: `${phase}: ${moon.title}`, line: moon.line, script: moon.script, kind: moon.kind }];
  for (const f of festivalsToday.slice(0, 2)) out.push({ title: `A sit for ${f.name}`, line: 'Sit with the season and what the festival means to you.', script: 'grounding', kind: 'devotional', intention: `For ${f.name}`, programme: 'sabbats', step: f.id });
  const close = deities.filter((d) => d.level === 'patron' || d.level === 'dedicated').slice(0, 2);
  for (const d of close) out.push({ title: `Sitting with ${d.name}`, line: 'A quiet devotional sit: an offering of your attention.', script: null, kind: 'devotional', intention: `Time with ${d.name}` });
  return out;
}
