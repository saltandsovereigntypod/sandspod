// The reminder choices that follow you between the app and the website:
// holidays (which calendars, which holidays, how far ahead), tending (plants,
// altars, offerings, crystals, candles), ritual planning (for your holidays
// and your covens), quiet hours, a pause, and gathering a busy day into one
// note. Kept in Sanctuary settings under one key, `reminders_v2`, as JSON
// (settings/defaults.ts and the website's js/my-settings.js), so they sync
// with the rest of the settings row.
//
// The moon, planned-ritual, devotion and dream choices stay where they were
// (`reminders.settings.v1`, schedule.ts). Before `reminders_v2` is first
// saved, it is worked out from the older choices it replaces: the device's
// sacred-day, offering and watering reminders, and Hekate's Deipnon
// (`deipnon_prompt`), so nothing that rang before goes quiet or rings twice.
// Pure, so the app and the website (js/core/guides.js) read it the same way.

import { holidayGroups, DEIPNON_ID, PATRON_GROUP } from './holidays.ts';
import { offersDeipnon } from '../deipnon.ts';

type SettingsLike = Record<string, unknown> | null | undefined;

export const PREFS_KEY = 'reminders_v2';

/** How often: on chosen weekdays (0 = Sunday), or else every N days. */
export type Repeat = { every: number; weekdays: number[] };

export type HolidayCalendarPrefs = { on: boolean; leads?: number[] };

export type HolidayPrefs = {
  on: boolean;
  /** Minutes after midnight. */
  at: number;
  /** Days before: 0 on the day, 1 the day before, 3, 7 a week before. Any of these. */
  leads: number[];
  /** Each calendar (holidays.ts holidayGroups ids); one not listed is on. */
  calendars: Record<string, HolidayCalendarPrefs>;
  /** Single holidays turned off (holidays.ts baseId). */
  off: string[];
  /** A holiday's own lead times, over its calendar's. */
  leadsFor: Record<string, number[]>;
};

export type PlantMode = 'thirsty' | 'schedule';
export type PlantPrefs = { on?: boolean; mode?: PlantMode; every?: number; weekdays?: number[]; at?: number };

export type ReminderPrefs = {
  version: 2;
  /** Pause everything; until the day given (YYYY-MM-DD, reminders come back that morning) or until turned back on (''). */
  paused: boolean;
  pausedUntil: string;
  /** Nothing rings between start and end (minutes after midnight); what would is moved out of them. */
  quiet: { on: boolean; start: number; end: number };
  /** More than `max` notes on one day become one. */
  bundle: { on: boolean; max: number };
  holidays: HolidayPrefs;
  tending: {
    plants: { on: boolean; at: number; mode: PlantMode } & Repeat & { per: Record<string, PlantPrefs> };
    altars: { on: boolean; at: number; ids: string[] } & Repeat;
    offerings: { on: boolean; at: number; lead: number; refresh: boolean; refreshAt: number } & Repeat;
    crystals: { on: boolean; at: number; cadence: CrystalCadence; weeks: number; off: string[] };
    candles: { relight: boolean; relightAt: number; nearEnd: boolean; nearEndMinutes: number; daily: boolean; dailyAt: number };
  };
  planning: {
    /** "Plan a ritual for Samhain", for the holidays you've chosen above. */
    holidays: boolean;
    days: number;
    at: number;
    /** For your covens' holidays and rites. */
    covens: boolean;
    /** How far ahead for covens you lead (head of the coven, or a position that leads or schedules rites). */
    leaderDays: number;
    /** Each coven: on (leaders' are on unless turned off, others' off unless turned on) and how far ahead. */
    perCoven: Record<string, { on?: boolean; days?: number }>;
  };
  /**
   * Coven requests, sent to your phone (supabase/functions/coven-notify):
   * new applications and requests to advance in covens you review (on, unless
   * turned off for all or for a coven in `off`), and the answer to your own.
   */
  requests: { on: boolean; off: string[]; answers: boolean };
  /**
   * Coven gatherings, sent to your phone (supabase/functions/coven-notify
   * gatherings.ts): a rite or meeting put on a coven's calendar, moved, or
   * taken off it, when the coven's choices say you should hear. On, unless
   * turned off for all or for a coven in `off`.
   */
  gatherings: { on: boolean; off: string[] };
  /**
   * Coven invitations, sent to your phone (supabase/functions/coven-notify
   * invitations.ts): someone invites you to a coven (`on`), and someone
   * accepts an invitation you sent (`accepted`). Both on unless turned off.
   */
  invitations: { on: boolean; accepted: boolean };
};

export type CrystalCadence = 'full' | 'new' | 'both' | 'weeks';

export const LEAD_DAY_CHOICES = [0, 1, 3, 7] as const;
export const PLAN_DAY_CHOICES = [3, 7, 14, 21, 30] as const;
export const EVERY_CHOICES = [1, 2, 3, 4, 5, 7, 10, 14, 21, 28] as const;
export const BUNDLE_CHOICES = [2, 3, 4, 5] as const;
export const NEAR_END_CHOICES = [15, 30, 60] as const;
export const CRYSTAL_CADENCES: { value: CrystalCadence; label: string }[] = [
  { value: 'full', label: 'Each full moon' },
  { value: 'new', label: 'Each new moon' },
  { value: 'both', label: 'Full and new moons' },
  { value: 'weeks', label: 'Every few weeks' },
];
export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DEFAULT_PREFS: ReminderPrefs = {
  version: 2,
  paused: false,
  pausedUntil: '',
  quiet: { on: false, start: 22 * 60, end: 7 * 60 },
  bundle: { on: true, max: 3 },
  holidays: { on: false, at: 9 * 60, leads: [0], calendars: {}, off: [], leadsFor: {} },
  tending: {
    plants: { on: false, at: 9 * 60, mode: 'thirsty', every: 7, weekdays: [], per: {} },
    altars: { on: false, at: 19 * 60, every: 7, weekdays: [], ids: [] },
    offerings: { on: false, at: 18 * 60, lead: 0, refresh: false, refreshAt: 9 * 60, every: 7, weekdays: [] },
    crystals: { on: false, at: 20 * 60, cadence: 'full', weeks: 4, off: [] },
    candles: { relight: false, relightAt: 20 * 60, nearEnd: false, nearEndMinutes: 30, daily: false, dailyAt: 20 * 60 },
  },
  planning: { holidays: false, days: 7, at: 10 * 60, covens: true, leaderDays: 14, perCoven: {} },
  requests: { on: true, off: [], answers: true },
  gatherings: { on: true, off: [] },
  invitations: { on: true, accepted: true },
};

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
function minuteOfDay(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n < 24 * 60 ? n : fallback;
}
function intIn(v: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}
const day = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '');
const strings = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter((s): s is string => typeof s === 'string' && !!s))] : []);
function leadList(v: unknown, fallback: number[]): number[] {
  if (!Array.isArray(v)) return fallback;
  const out = [...new Set(v.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 30))].sort((a, b) => a - b);
  return out.length ? out : fallback;
}
function weekdays(v: unknown): number[] {
  return Array.isArray(v) ? [...new Set(v.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6))].sort() : [];
}
function repeat(raw: Record<string, unknown>, fallback: Repeat): Repeat {
  return { every: intIn(raw.every, 1, 90, fallback.every), weekdays: weekdays(raw.weekdays) };
}

/** Saved prefs from any older or partial shape, with defaults filled in. */
export function normalizePrefs(input: unknown): ReminderPrefs {
  const raw = obj(input);
  const d = DEFAULT_PREFS;
  const quiet = obj(raw.quiet);
  const bundle = obj(raw.bundle);
  const h = obj(raw.holidays);
  const t = obj(raw.tending);
  const plants = obj(t.plants);
  const altars = obj(t.altars);
  const offerings = obj(t.offerings);
  const crystals = obj(t.crystals);
  const candles = obj(t.candles);
  const p = obj(raw.planning);
  const r = obj(raw.requests);
  const g = obj(raw.gatherings);
  const inv = obj(raw.invitations);

  const calendars: Record<string, HolidayCalendarPrefs> = {};
  for (const [id, value] of Object.entries(obj(h.calendars))) {
    const c = obj(value);
    calendars[id] = { on: c.on !== false, ...(Array.isArray(c.leads) ? { leads: leadList(c.leads, d.holidays.leads) } : {}) };
  }
  const leadsFor: Record<string, number[]> = {};
  for (const [id, value] of Object.entries(obj(h.leadsFor))) if (Array.isArray(value)) leadsFor[id] = leadList(value, d.holidays.leads);
  const per: Record<string, PlantPrefs> = {};
  for (const [id, value] of Object.entries(obj(plants.per))) {
    const v = obj(value);
    const entry: PlantPrefs = {};
    if (typeof v.on === 'boolean') entry.on = v.on;
    if (v.mode === 'thirsty' || v.mode === 'schedule') entry.mode = v.mode;
    if (v.every != null) entry.every = intIn(v.every, 1, 90, d.tending.plants.every);
    if (Array.isArray(v.weekdays)) entry.weekdays = weekdays(v.weekdays);
    if (v.at != null) entry.at = minuteOfDay(v.at, d.tending.plants.at);
    per[id] = entry;
  }
  const perCoven: Record<string, { on?: boolean; days?: number }> = {};
  for (const [id, value] of Object.entries(obj(p.perCoven))) {
    const v = obj(value);
    perCoven[id] = { ...(typeof v.on === 'boolean' ? { on: v.on } : {}), ...(v.days != null ? { days: intIn(v.days, 1, 60, d.planning.days) } : {}) };
  }
  const cadence = ['full', 'new', 'both', 'weeks'].includes(String(crystals.cadence)) ? (crystals.cadence as CrystalCadence) : d.tending.crystals.cadence;

  return {
    version: 2,
    paused: raw.paused === true,
    pausedUntil: day(raw.pausedUntil),
    quiet: { on: quiet.on === true, start: minuteOfDay(quiet.start, d.quiet.start), end: minuteOfDay(quiet.end, d.quiet.end) },
    bundle: { on: bool(bundle.on, d.bundle.on), max: intIn(bundle.max, 1, 20, d.bundle.max) },
    holidays: {
      on: h.on === true,
      at: minuteOfDay(h.at, d.holidays.at),
      leads: leadList(h.leads, d.holidays.leads),
      calendars,
      off: strings(h.off),
      leadsFor,
    },
    tending: {
      plants: { on: plants.on === true, at: minuteOfDay(plants.at, d.tending.plants.at), mode: plants.mode === 'schedule' ? 'schedule' : 'thirsty', ...repeat(plants, d.tending.plants), per },
      altars: { on: altars.on === true, at: minuteOfDay(altars.at, d.tending.altars.at), ...repeat(altars, d.tending.altars), ids: strings(altars.ids) },
      offerings: {
        on: offerings.on === true,
        at: minuteOfDay(offerings.at, d.tending.offerings.at),
        lead: intIn(offerings.lead, 0, 1, 0),
        refresh: offerings.refresh === true,
        refreshAt: minuteOfDay(offerings.refreshAt, d.tending.offerings.refreshAt),
        ...repeat(offerings, d.tending.offerings),
      },
      crystals: { on: crystals.on === true, at: minuteOfDay(crystals.at, d.tending.crystals.at), cadence, weeks: intIn(crystals.weeks, 1, 12, d.tending.crystals.weeks), off: strings(crystals.off) },
      candles: {
        relight: candles.relight === true,
        relightAt: minuteOfDay(candles.relightAt, d.tending.candles.relightAt),
        nearEnd: candles.nearEnd === true,
        nearEndMinutes: (NEAR_END_CHOICES as readonly number[]).includes(Number(candles.nearEndMinutes)) ? Number(candles.nearEndMinutes) : d.tending.candles.nearEndMinutes,
        daily: candles.daily === true,
        dailyAt: minuteOfDay(candles.dailyAt, d.tending.candles.dailyAt),
      },
    },
    planning: {
      holidays: p.holidays === true,
      days: intIn(p.days, 1, 60, d.planning.days),
      at: minuteOfDay(p.at, d.planning.at),
      covens: bool(p.covens, d.planning.covens),
      leaderDays: intIn(p.leaderDays, 1, 60, d.planning.leaderDays),
      perCoven,
    },
    requests: { on: bool(r.on, d.requests.on), off: strings(r.off), answers: bool(r.answers, d.requests.answers) },
    gatherings: { on: bool(g.on, d.gatherings.on), off: strings(g.off) },
    invitations: { on: bool(inv.on, d.invitations.on), accepted: bool(inv.accepted, d.invitations.accepted) },
  };
}

/** The older device choices this replaces (schedule.ts ReminderSettings), as far as they matter here. */
export type LegacyReminders = { sacredDays?: boolean; sacredAt?: number; offerings?: boolean; offeringsAt?: number; watering?: boolean; wateringAt?: number } | null | undefined;

/**
 * Prefs worked out from the older choices, before any are saved: the Deipnon
 * (on unless `deipnon_prompt` is off, for those it's offered to) and your
 * deities' sacred days become holiday reminders for just those, with every
 * other calendar left off; offering and watering reminders carry over.
 */
export function migratePrefs(settings: SettingsLike, legacy: LegacyReminders): ReminderPrefs {
  const prefs = normalizePrefs({});
  const deipnon = offersDeipnon(settings);
  const sacred = legacy?.sacredDays === true;
  if (deipnon || sacred) {
    prefs.holidays.on = true;
    prefs.holidays.at = minuteOfDay(legacy?.sacredAt, prefs.holidays.at);
    for (const group of holidayGroups(settings)) prefs.holidays.calendars[group.id] = { on: false };
    if (deipnon) {
      prefs.holidays.calendars.hellenic_monthly = { on: true };
      prefs.holidays.off = ['hellenic_monthly-noumenia', 'hellenic_monthly-agathos_daimon'];
    }
    if (sacred) prefs.holidays.calendars[PATRON_GROUP] = { on: true };
  }
  if (settings?.deipnon_prompt === false) prefs.holidays.off = [...new Set([...prefs.holidays.off, DEIPNON_ID])];
  if (legacy?.offerings === true) {
    prefs.tending.offerings.on = true;
    prefs.tending.offerings.at = minuteOfDay(legacy.offeringsAt, prefs.tending.offerings.at);
  }
  if (legacy?.watering === true) {
    prefs.tending.plants.on = true;
    prefs.tending.plants.at = minuteOfDay(legacy.wateringAt, prefs.tending.plants.at);
  }
  return prefs;
}

/** Whether prefs have been saved yet (otherwise they're worked out from the older choices). */
export function prefsSaved(settings: SettingsLike): boolean {
  const raw = settings?.[PREFS_KEY];
  if (typeof raw !== 'string' || !raw.trim()) return false;
  try {
    return !!JSON.parse(raw) && typeof JSON.parse(raw) === 'object';
  } catch {
    return false;
  }
}

/** The prefs for this person: as saved, or worked out from the older choices. */
export function readPrefs(settings: SettingsLike, legacy?: LegacyReminders): ReminderPrefs {
  if (!prefsSaved(settings)) return migratePrefs(settings, legacy);
  return normalizePrefs(JSON.parse(String(settings![PREFS_KEY])));
}

/** The settings value to save. */
export const prefsValue = (prefs: ReminderPrefs) => JSON.stringify(normalizePrefs(prefs));

/** Prefs with a change made at a path ("tending.plants.on"), for the settings screens. */
export function withChange(prefs: ReminderPrefs, path: string, value: unknown): ReminderPrefs {
  const next = JSON.parse(JSON.stringify(prefs)) as Record<string, unknown>;
  const parts = path.split('.');
  let at: Record<string, unknown> = next;
  for (const part of parts.slice(0, -1)) {
    if (!at[part] || typeof at[part] !== 'object') at[part] = {};
    at = at[part] as Record<string, unknown>;
  }
  at[parts[parts.length - 1]] = value;
  return normalizePrefs(next);
}

// ── Choices for one holiday ───────────────────────────────────────────────

/** Whether a calendar reminds (on unless turned off). */
export const calendarOn = (prefs: ReminderPrefs, group: string) => prefs.holidays.calendars[group]?.on !== false;

/** Whether a holiday reminds: its calendar is on and it isn't turned off. */
export const holidayOn = (prefs: ReminderPrefs, group: string, baseId: string) => calendarOn(prefs, group) && !prefs.holidays.off.includes(baseId);

/** How far ahead a holiday reminds: its own choice, else its calendar's, else everyone's. */
export function leadsOf(prefs: ReminderPrefs, group: string, baseId: string): number[] {
  return prefs.holidays.leadsFor[baseId] ?? prefs.holidays.calendars[group]?.leads ?? prefs.holidays.leads;
}

export const PATRON_GROUP_ID = PATRON_GROUP;

/**
 * One calendar's reminders on or off from elsewhere (My deities). Turning one
 * on while holiday reminders are off turns them on for that calendar alone.
 */
export function withCalendarOn(prefs: ReminderPrefs, settings: SettingsLike, group: string, on: boolean): ReminderPrefs {
  const calendars = { ...prefs.holidays.calendars };
  if (on && !prefs.holidays.on) for (const g of holidayGroups(settings)) calendars[g.id] = { ...calendars[g.id], on: false };
  calendars[group] = { ...calendars[group], on };
  return normalizePrefs({ ...prefs, holidays: { ...prefs.holidays, on: on || prefs.holidays.on, calendars } });
}

/** Turn a whole calendar's holidays on or off at once ("All" / "None"), clearing single picks within it. */
export function setCalendar(prefs: ReminderPrefs, group: string, baseIds: string[], on: boolean): ReminderPrefs {
  const off = prefs.holidays.off.filter((id) => !baseIds.includes(id));
  return normalizePrefs({ ...prefs, holidays: { ...prefs.holidays, off, calendars: { ...prefs.holidays.calendars, [group]: { ...prefs.holidays.calendars[group], on } } } });
}

/** Turn one holiday on or off (turning one on also turns its calendar on, with its other holidays off if the calendar was off). */
export function setHoliday(prefs: ReminderPrefs, group: string, baseId: string, on: boolean, siblings: string[] = []): ReminderPrefs {
  let off = prefs.holidays.off.filter((id) => id !== baseId);
  const calendars = { ...prefs.holidays.calendars };
  if (on && !calendarOn(prefs, group)) {
    off = [...new Set([...off, ...siblings.filter((id) => id !== baseId)])];
    calendars[group] = { ...calendars[group], on: true };
  }
  if (!on) off.push(baseId);
  return normalizePrefs({ ...prefs, holidays: { ...prefs.holidays, off, calendars } });
}

// ── Coven requests ────────────────────────────────────────────────────────

/** Whether new applications and requests to advance in this coven ring your phone (on unless turned off). */
export const requestsOn = (prefs: ReminderPrefs, covenId: string) => prefs.requests.on && !prefs.requests.off.includes(covenId);

/** Turn one coven's request notes on or off (turning one on also turns them on overall, with the others as they were). */
export function setRequestsFor(prefs: ReminderPrefs, covenId: string, on: boolean, covenIds: string[] = []): ReminderPrefs {
  let off = prefs.requests.off.filter((id) => id !== covenId);
  if (!on) off.push(covenId);
  else if (!prefs.requests.on) off = [...new Set([...off, ...covenIds.filter((id) => id !== covenId)])];
  return normalizePrefs({ ...prefs, requests: { ...prefs.requests, on: on || prefs.requests.on, off } });
}

// ── Coven gatherings ──────────────────────────────────────────────────────

/** Whether a coven's gatherings (put on its calendar, moved, taken off) ring your phone (on unless turned off). */
export const gatheringsOn = (prefs: ReminderPrefs, covenId: string) => prefs.gatherings.on && !prefs.gatherings.off.includes(covenId);

/** Turn one coven's gathering notes on or off (turning one on also turns them on overall, with the others as they were). */
export function setGatheringsFor(prefs: ReminderPrefs, covenId: string, on: boolean, covenIds: string[] = []): ReminderPrefs {
  let off = prefs.gatherings.off.filter((id) => id !== covenId);
  if (!on) off.push(covenId);
  else if (!prefs.gatherings.on) off = [...new Set([...off, ...covenIds.filter((id) => id !== covenId)])];
  return normalizePrefs({ ...prefs, gatherings: { on: on || prefs.gatherings.on, off } });
}

// ── Words ─────────────────────────────────────────────────────────────────

/** "9:00 am" for minutes after midnight. */
export function timeLabel(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  return `${h % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

/** "On the day", "The day before", "3 days before", "A week before". */
export function leadLabel(days: number): string {
  if (days === 0) return 'On the day';
  if (days === 1) return 'The day before';
  if (days === 7) return 'A week before';
  if (days === 14) return 'Two weeks before';
  return `${days} days before`;
}

/** "on the day and a week before". */
export function leadsLabel(leads: number[]): string {
  const words = leads.map((d) => leadLabel(d).toLowerCase());
  if (words.length <= 1) return words[0] ?? 'on the day';
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

/** "Every day", "Every 3 days", "Mondays and Thursdays". */
export function repeatLabel(r: Repeat): string {
  if (r.weekdays.length) {
    if (r.weekdays.length === 7) return 'Every day';
    const names = r.weekdays.map((d) => `${WEEKDAY_NAMES[d]}s`);
    return names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  }
  if (r.every === 1) return 'Every day';
  if (r.every === 7) return 'Every week';
  if (r.every === 14) return 'Every two weeks';
  return `Every ${r.every} days`;
}

const shortDate = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

/** Whether reminders are paused at `now`. */
export function isPaused(prefs: ReminderPrefs, now: Date): boolean {
  if (!prefs.paused) return false;
  if (!prefs.pausedUntil) return true;
  const [y, m, d] = prefs.pausedUntil.split('-').map(Number);
  return now.getTime() < new Date(y, m - 1, d).getTime();
}

export type Summaries = { holidays: string; tending: string; planning: string; quiet: string };

/** One line for each kind, for the Reminders screen: "3 calendars · the day before at 9:00 am". */
export function summaries(prefs: ReminderPrefs, settings: SettingsLike, now: Date = new Date()): Summaries {
  const groups = holidayGroups(settings);
  const on = groups.filter((g) => calendarOn(prefs, g.id));
  const holidays = !prefs.holidays.on
    ? 'Off'
    : !groups.length
      ? 'On · no calendars chosen yet'
      : `${on.length === groups.length && on.length > 1 ? `All ${on.length} calendars` : on.length === 1 ? on[0].name : `${on.length} calendars`} · ${leadsLabel(prefs.holidays.leads)} at ${timeLabel(prefs.holidays.at)}`;
  const t = prefs.tending;
  const tendingOn = [t.plants.on && 'plants', t.altars.on && 'altars', t.offerings.on || t.offerings.refresh ? 'offerings' : false, t.crystals.on && 'crystals', t.candles.relight || t.candles.nearEnd || t.candles.daily ? 'candles' : false].filter(
    (x): x is string => !!x,
  );
  const tending = tendingOn.length ? `${tendingOn[0][0].toUpperCase()}${tendingOn.join(', ').slice(1)}` : 'Off';
  const planningParts = [prefs.planning.holidays ? `${prefs.planning.days} days before your holidays` : '', prefs.planning.covens ? `covens you lead, ${prefs.planning.leaderDays} days ahead` : ''].filter(Boolean);
  const planning = planningParts.length ? `${planningParts[0][0].toUpperCase()}${planningParts.join(' · ').slice(1)}` : 'Off';
  const quietParts = [
    isPaused(prefs, now) ? (prefs.pausedUntil ? `Paused until ${shortDate(prefs.pausedUntil)}` : 'Paused') : '',
    prefs.quiet.on ? `Quiet ${timeLabel(prefs.quiet.start)} to ${timeLabel(prefs.quiet.end)}` : '',
    prefs.bundle.on ? `More than ${prefs.bundle.max} a day become one` : '',
  ].filter(Boolean);
  return { holidays, tending, planning, quiet: quietParts.join(' · ') || 'Off' };
}
