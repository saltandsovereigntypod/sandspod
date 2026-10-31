// When each moon of A Year and a Day falls, what it holds once its dates are
// known (the festivals of the track's calendar and the moon's own rite), the
// days to suggest for beginning, and the reminders. Pure, so it can be tested.
//
// Dates are local calendar days as 'YYYY-MM-DD'. Moons 1–12 last about a
// lunar month each from the day chosen; begun at a new moon, each begins on
// the day of the next new moon. Moon 13 is the short moon that ends on the
// day of dedication, a year and a day after the start.

import { holidaysBetween } from '../holidays.ts';
import { holyRef } from '../holy/refs.ts';
import { nextPhase, upcomingPhases } from '../moon.ts';
import { festivalLesson, MOONS, READINGS, trackById, type Moon, type PracticeKind, type Track, type TrackId } from './plan.ts';
import type { CourseLink } from '../covens/courseLinks.ts';

/** The mean lunar month, in days. */
export const LUNATION = 29.530588853;
const DAY = 86_400_000;

const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function fromKey(key: string | null | undefined): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key ?? ''));
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getMonth() === +m[2] - 1 ? d : null;
}
export const isDayKey = (key: unknown): key is string => typeof key === 'string' && !!fromKey(key);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** Whole days from one key to another. */
export const daysBetween = (from: string, to: string) => Math.round((fromKey(to)!.getTime() - fromKey(from)!.getTime()) / DAY);

/** The new moon nearest a day, as its local day. */
function nearestNewMoon(day: Date): Date {
  const noon = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12);
  const at = nextPhase(new Date(noon.getTime() - (LUNATION / 2) * DAY), 'new');
  return new Date(at.getFullYear(), at.getMonth(), at.getDate());
}

/** Whether a day is (within a day of) a new moon, so the moons can keep to the real ones. */
export function nearNewMoon(key: string): boolean {
  const day = fromKey(key);
  if (!day) return false;
  return Math.abs(nearestNewMoon(day).getTime() - day.getTime()) <= 1.5 * DAY;
}

export type MoonWindow = {
  /** 1–13. */
  n: number;
  id: string;
  start: string;
  /** Exclusive: the day the next moon begins (for moon 13, the day of dedication). */
  end: string;
};

export type Schedule = {
  start: string;
  /** The day of dedication: a year and a day after the start. */
  day: string;
  /** Whether the moons keep to the real new moons (begun at a new moon). */
  aligned: boolean;
  windows: MoonWindow[];
};

/** The year's moons from a start day. */
export function yearSchedule(startKey: string): Schedule {
  const start = fromKey(startKey) ?? new Date(2000, 0, 1);
  const key = dayKey(start);
  const dedication = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate() + 1);
  const aligned = nearNewMoon(key);
  const starts: Date[] = [start];
  for (let k = 1; k < MOONS.length; k++) {
    const mean = addDays(start, Math.round(k * LUNATION));
    starts.push(aligned ? nearestNewMoon(mean) : mean);
  }
  const windows = MOONS.map((m, i) => ({
    n: m.n,
    id: m.id,
    start: dayKey(starts[i]),
    end: dayKey(i + 1 < starts.length ? starts[i + 1] : dedication),
  }));
  return { start: key, day: dayKey(dedication), aligned, windows };
}

export type Position = { phase: 'before' } | { phase: 'moon'; n: number } | { phase: 'day' } | { phase: 'after' };

/** Where a day falls in the year. */
export function positionOn(schedule: Schedule, key: string): Position {
  if (key < schedule.start) return { phase: 'before' };
  if (key === schedule.day) return { phase: 'day' };
  if (key > schedule.day) return { phase: 'after' };
  const w = schedule.windows.find((x) => key >= x.start && key < x.end);
  return w ? { phase: 'moon', n: w.n } : { phase: 'after' };
}

// ── Beginning ────────────────────────────────────────────────────────────

export type StartChoice = { key: string; date: string; label: string; detail: string };

const longDay = (key: string) => fromKey(key)!.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

/** The track's calendar, north or south. */
export const calendarOf = (track: Track, south = false) => (south && track.south ? track.south : track.calendar);

/** Days to begin on: today, the next new moon, and the track's next festivals (within about four months). */
export function startChoices(now: Date, trackId: TrackId, south = false): StartChoice[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = dayKey(today);
  const out: StartChoice[] = [{ key: 'today', date: todayKey, label: 'Today', detail: 'Begin now, and the moons follow from today.' }];
  const newMoon = nearNewMoon(todayKey) && nearestNewMoon(today).getTime() >= today.getTime() ? nearestNewMoon(today) : (() => {
    const at = nextPhase(today, 'new');
    return new Date(at.getFullYear(), at.getMonth(), at.getDate());
  })();
  const nm = dayKey(newMoon);
  out.push({ key: 'new-moon', date: nm, label: nm === todayKey ? 'Tonight’s new moon' : 'The next new moon', detail: `${longDay(nm)}. Each moon of the year then begins at a new moon.` });
  const track = trackById(trackId);
  const festivals = holidaysBetween(today, addDays(today, 130), { traditions: [calendarOf(track, south)], custom: [] }).slice(0, 2);
  for (const h of festivals) {
    const date = dayKey(h.date);
    out.push({ key: `festival:${holyRef(h.id)}`, date, label: h.name, detail: `${longDay(date)}. Begin at a festival of your year.` });
  }
  const seen = new Set<string>();
  return out
    .filter((c) => c.date >= todayKey && (seen.has(c.key) ? false : (seen.add(c.key), true)))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

// ── A moon, with its dates ───────────────────────────────────────────────

export type Reading = { id: string; title: string; minutes: number; /** For a festival in this moon. */ festival?: string };

export type Item = {
  /** Unique across the year: progress keeps what's done by it. */
  key: string;
  kind: PracticeKind;
  title: string;
  detail: string;
  links: CourseLink[];
  /** The day it falls on, for a festival or the moon's rite. */
  date?: string;
};

export type YearConfig = { track: TrackId; startDate: string; south?: boolean };

export type MoonView = {
  moon: Moon;
  window: MoonWindow;
  track: Track;
  readings: Reading[];
  practices: Item[];
};

const reading = (id: string, festival?: string): Reading => ({ id, title: READINGS[id]?.title ?? id, minutes: READINGS[id]?.minutes ?? 15, ...(festival ? { festival } : {}) });

/** A moon's own lessons for a track: the shared ones, then the track's (the Wheel's when the track has none here). */
export function moonReadings(moon: Moon, trackId: TrackId): string[] {
  const lens = trackId === 'eclectic' ? null : moon.lens?.[trackId];
  return [...new Set([...moon.core, ...(lens?.length ? lens : moon.wheel)])];
}

const dayWords = (key: string) => fromKey(key)!.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

/** The festivals and the moon's rite that fall in a window. */
export function datedItems(window: MoonWindow, track: Track, south = false): { items: Item[]; readings: Reading[] } {
  const from = fromKey(window.start)!;
  const to = addDays(fromKey(window.end)!, -1);
  const items: Item[] = [];
  const readings: Reading[] = [];
  const phaseEvents = upcomingPhases(new Date(from.getTime() - 1), 10).filter((e) => e.phase === track.moonPhase && dayKey(e.date) >= window.start && dayKey(e.date) < window.end);
  for (const e of phaseEvents) {
    const date = dayKey(e.date);
    const hellenic = track.moonPhase === 'new';
    items.push({
      key: `${track.moonPhase}:${date}`,
      kind: 'moon',
      title: hellenic ? 'Noumenia: the new month' : 'The full moon’s rite',
      detail: `${dayWords(date)}. ${hellenic ? 'Greet the new month at your household shrine with incense and a simple offering.' : 'Keep a rite at the full moon, simple or full, and write a line in your journal after.'}`,
      links: [{ kind: 'holy', id: hellenic ? 'moon-new' : 'moon-full', label: hellenic ? 'The moon: New Moon' : 'The moon: Full Moon' }, { kind: 'premade', id: track.moonRite }],
      date,
    });
  }
  const calendar = calendarOf(track, south);
  for (const h of holidaysBetween(from, to, { traditions: [calendar], custom: [] })) {
    const date = dayKey(h.date);
    if (date < window.start || date >= window.end) continue;
    const ref = holyRef(h.id);
    const base = ref.slice(ref.indexOf('-') + 1);
    items.push({
      key: `festival:${ref}:${date}`,
      kind: 'festival',
      title: `Keep ${h.name}`,
      detail: `${dayWords(date)}${h.days > 1 ? `, for ${h.days} days` : ''}. Keep it your way, simply or fully, and read its page for where it comes from and how people keep it now.`,
      links: [{ kind: 'holy', id: ref, label: `Holy day: ${h.name}` }, { kind: 'page', id: 'planner' }],
      date,
    });
    const lessons = [festivalLesson(track.set, base), track.set === 'wicca' ? festivalLesson('wheel', base) : null].filter((id): id is string => !!id);
    for (const id of lessons) readings.push(reading(id, h.name));
  }
  items.sort((a, b) => (a.date! < b.date! ? -1 : a.date! > b.date! ? 1 : 0));
  return { items, readings };
}

/** One moon, with its readings, its practices and what falls in it. */
export function moonView(config: YearConfig, n: number): MoonView | null {
  const moon = MOONS.find((m) => m.n === n);
  if (!moon) return null;
  const track = trackById(config.track);
  const window = yearSchedule(config.startDate).windows[n - 1];
  const dated = datedItems(window, track, !!config.south);
  const own = moonReadings(moon, track.id).map((id) => reading(id));
  const seen = new Set(own.map((r) => r.id));
  return {
    moon,
    window,
    track,
    readings: [...own, ...dated.readings.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)))],
    practices: [...moon.practices.map((p): Item => ({ key: `${moon.id}:${p.id}`, kind: p.kind, title: p.title, detail: p.detail, links: p.links })), ...dated.items],
  };
}

/** Every lesson the year could give, for a track (for the tests and for prefetching). */
export function allReadings(trackId: TrackId): string[] {
  return [...new Set(MOONS.flatMap((m) => moonReadings(m, trackId)))];
}

// ── Reminders ────────────────────────────────────────────────────────────

export type YearReminder = { key: string; at: Date; title: string; body: string; url: string };

const at = (key: string, minutes: number) => {
  const d = fromKey(key)!;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(minutes / 60), minutes % 60, 0, 0);
};

/**
 * Gentle notes for the year: each moon's beginning (in the morning), its
 * reflection two days before it ends (in the evening), and the day of
 * dedication and the day before. Within `days` of `now`, soonest first.
 */
export function yearReminders(config: YearConfig, now: Date, days = 60, morning = 9 * 60, evening = 19 * 60): YearReminder[] {
  const s = yearSchedule(config.startDate);
  const horizon = now.getTime() + days * DAY;
  const out: YearReminder[] = [];
  for (const w of s.windows) {
    const moon = MOONS[w.n - 1];
    out.push({
      key: `year:${s.start}:begin:${w.id}`,
      at: at(w.start, morning),
      title: `Moon ${w.n} of 13 begins: ${moon.title}`,
      body: moon.theme,
      url: `/rituals/year/moon/${w.n}`,
    });
    const reflect = dayKey(addDays(fromKey(w.end)!, -2));
    if (reflect > w.start) {
      out.push({
        key: `year:${s.start}:reflect:${w.id}`,
        at: at(reflect, evening),
        title: `Moon ${w.n} of 13: time to reflect`,
        body: 'A few lines on this moon before the next begins. Private, and never graded.',
        url: `/rituals/year/moon/${w.n}`,
      });
    }
  }
  out.push({ key: `year:${s.start}:eve`, at: at(dayKey(addDays(fromKey(s.day)!, -1)), evening), title: 'Tomorrow is your day of dedication', body: 'A year and a day. Gather your words and your token tonight, if you are ready.', url: '/rituals/year/day' });
  out.push({ key: `year:${s.start}:day`, at: at(s.day, morning), title: 'A year and a day', body: 'Today is your day of dedication, if you choose it.', url: '/rituals/year/day' });
  return out.filter((r) => r.at.getTime() > now.getTime() && r.at.getTime() <= horizon).sort((a, b) => a.at.getTime() - b.at.getTime());
}
