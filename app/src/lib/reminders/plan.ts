// Every reminder the phone should hold, in one place: the moon, planned
// rituals, devotions, dreams and look-backs (schedule.ts), and the newer
// kinds chosen in `reminders_v2` (prefs.ts): holidays from the person's
// calendars (Hekate's Deipnon and their deities' sacred days among them),
// tending (plants, altars, offerings, crystals, candles), ritual planning for
// their holidays and covens, and their coven rites. Then quiet hours and the
// pause are kept, a busy day is gathered into one note, and the soonest and
// most important are chosen to fit what the phone will hold.
//
// The website hands the same reminders to a calendar file
// (reminders/reminders-logic.js via js/core/guides.js) with calendarReminders,
// so the same choices give the same events. Pure.

import { altarPhrase, tendingNote, type OfferingDue } from '../altar/offerings.ts';
import { wateringNote, type WateringDue } from '../altar/pottedPlants.ts';
import { occasionLabel, riteReminders, type Ritual, type Rsvp } from '../covens/model.ts';
import { CLEANSE_METHODS, findCare } from '../craft/crystal/care.ts';
import { upcomingPhases } from '../moon.ts';
import type { Place } from '../calendars/types.ts';
import type { RitualPlan } from '../rituals/types.ts';
import { DEIPNON_PROMPT } from '../deipnon.ts';
import { holidayItems, shortMeaning, type HolidayItem } from './holidays.ts';
import { holidayOn, isPaused, leadsOf, readPrefs, type LegacyReminders, type ReminderPrefs, type Repeat } from './prefs.ts';
import { buildSchedule, HORIZON_DAYS, MAX_REMINDERS, type LookBackReminderSource, type Reminder, type ReminderKind, type ReminderSettings } from './schedule.ts';
import { EMPTY_SOURCES, type CrystalSource, type TendingSources } from './sources.ts';

type SettingsLike = Record<string, unknown> | null | undefined;

/** A coven you belong to, as the reminders need it. */
export type CovenSource = {
  id: string;
  slug: string;
  name: string;
  /** Head of the coven, or a position that leads or schedules its rites. */
  leader: boolean;
  /** Can decide its applications and requests to advance (Reminders → Coven requests). */
  reviewer?: boolean;
  /** The coven's own holidays (covens/programs.ts covenHolidaysBetween). */
  holidays: { baseId: string; name: string; date: Date; days: number }[];
  /** Its rites to come, with your answer. */
  rites: { ritual: Pick<Ritual, 'id' | 'title' | 'status' | 'scheduled_for' | 'occasion' | 'occasion_name'>; response: Rsvp['response'] | null }[];
};

export type PlanInput = {
  /** Sanctuary settings: calendars, deities, `deipnon_prompt`, and `reminders_v2`. */
  appSettings: SettingsLike;
  /** The device's moon, ritual, devotion and dream choices (schedule.ts). */
  legacy: ReminderSettings;
  /** The prefs, if already read (otherwise read from appSettings, worked out from `legacy` before they're saved). */
  prefs?: ReminderPrefs;
  plans?: RitualPlan[];
  lookBacks?: LookBackReminderSource[];
  sources?: TendingSources;
  covens?: CovenSource[];
  place?: Place | null;
  now: Date;
  horizonDays?: number;
};

const DAY = 86_400_000;
/** Daily and weekly tending is kept two weeks ahead, as the devotions are, and topped up whenever the app opens. */
export const TENDING_DAYS = 14;
/** Every-N-days counts from here (a Sunday), so "every week" falls on the same day on the phone and the website. */
const EPOCH = new Date(2024, 0, 7);
/** Within this, everything is kept before anything further off is chosen. */
const SOON_MS = 48 * 60 * 60 * 1000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const atMinutes = (day: Date, minutes: number) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(minutes / 60), minutes % 60, 0, 0);
const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hhmm = (minutes: number) => `${pad(Math.floor(minutes / 60))}${pad(minutes % 60)}`;
const dayCount = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);
const longDay = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
const fromKey = (key: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};

/** The days from `from`'s day, for `days` days, that a repeat falls on. */
export function repeatDays(r: Repeat, from: Date, days: number, anchor: Date = EPOCH): Date[] {
  const out: Date[] = [];
  const first = startOfDay(from);
  for (let i = 0; i < days; i++) {
    const d = addDays(first, i);
    if (r.weekdays.length ? r.weekdays.includes(d.getDay()) : (((dayCount(anchor, d) % r.every) + r.every) % r.every) === 0) out.push(d);
  }
  return out;
}

function aheadWords(lead: number): string {
  if (lead === 0) return 'today';
  if (lead === 1) return 'tomorrow';
  if (lead === 7) return 'in a week';
  if (lead === 14) return 'in two weeks';
  return `in ${lead} days`;
}

// ── Holidays ──────────────────────────────────────────────────────────────

function holidayReminder(item: HolidayItem, lead: number, at: Date): Reminder {
  const date = dayKey(item.date);
  const suffix = lead ? `:${lead}` : '';
  if (item.kind === 'deipnon') {
    return {
      key: `deipnon:${date}${suffix}`,
      kind: 'deipnon',
      at,
      title: `${DEIPNON_PROMPT.title} ${aheadWords(lead)}`,
      body: lead ? `On ${longDay(item.date)}. Time to think of her supper, and of what the house should be cleared of.` : 'Clear and cleanse the house, leave her supper at a crossroads, and draw the Crossroads spread if you like.',
      url: item.url,
    };
  }
  if (item.kind === 'sacred') {
    const key = item.baseId.replace(/^patron-/, '');
    return { key: `sacred-${key}:${date}${suffix}`, kind: 'sacred', at, title: lead ? `${item.title} ${aheadWords(lead)}` : item.title!, body: item.body!, url: item.url };
  }
  const meaning = shortMeaning(item.meaning);
  return {
    key: `holiday:${item.baseId}:${date}${suffix}`,
    kind: 'holiday',
    at,
    title: `${item.name} ${aheadWords(lead)}`,
    body: lead ? `On ${longDay(item.date)}. ${meaning}`.trim() : meaning,
    url: item.url,
  };
}

function holidayReminders(prefs: ReminderPrefs, items: HolidayItem[]): Reminder[] {
  if (!prefs.holidays.on) return [];
  const out: Reminder[] = [];
  for (const item of items) {
    if (!holidayOn(prefs, item.group, item.baseId)) continue;
    for (const lead of leadsOf(prefs, item.group, item.baseId)) out.push(holidayReminder(item, lead, atMinutes(addDays(item.date, -lead), prefs.holidays.at)));
  }
  return out;
}

/** "Plan a ritual for Samhain", for the yearly holidays you've chosen, unless a ritual is already planned for it. */
function holidayPlanning(prefs: ReminderPrefs, items: HolidayItem[], plans: RitualPlan[]): Reminder[] {
  if (!prefs.planning.holidays) return [];
  const planned = plans.filter((p) => !p.doneAt).map((p) => fromKey(p.date)).filter((d): d is Date => !!d);
  const out: Reminder[] = [];
  for (const item of items) {
    if (item.kind === 'sacred' || (item.recurs !== 'yearly' && item.recurs !== 'once') || !holidayOn(prefs, item.group, item.baseId)) continue;
    const from = addDays(item.date, -1).getTime();
    const to = addDays(item.date, item.days - 1).getTime();
    if (planned.some((d) => d.getTime() >= from && d.getTime() <= to)) continue;
    out.push({
      key: `plan:${item.baseId}:${dayKey(item.date)}`,
      kind: 'planning',
      at: atMinutes(addDays(item.date, -prefs.planning.days), prefs.planning.at),
      title: `Plan a ritual for ${item.name}`,
      body: `${item.name} is ${aheadWords(prefs.planning.days)}, on ${longDay(item.date)}. Plan your ritual now and its reminders will follow it.`,
      url: '/rituals/planner',
    });
  }
  return out;
}

// ── Covens ────────────────────────────────────────────────────────────────

/** Whether a coven's planning reminders are on, and how far ahead (leaders' are on unless turned off, earlier). */
export function covenPlanning(prefs: ReminderPrefs, coven: Pick<CovenSource, 'id' | 'leader'>): { on: boolean; days: number } {
  const own = prefs.planning.perCoven[coven.id];
  return { on: prefs.planning.covens && (own?.on ?? coven.leader), days: own?.days ?? (coven.leader ? prefs.planning.leaderDays : prefs.planning.days) };
}

function covenReminders(prefs: ReminderPrefs, covens: CovenSource[], now: Date): Reminder[] {
  const out: Reminder[] = riteReminders(
    covens.flatMap((c) => c.rites.map((r) => ({ coven: { name: c.name, slug: c.slug }, ritual: r.ritual as Ritual, response: r.response }))),
    now.getTime(),
  ).map((r) => ({ ...r, kind: 'coven' as const }));
  for (const coven of covens) {
    const { on, days } = covenPlanning(prefs, coven);
    if (!on) continue;
    const scheduled = coven.rites.filter((r) => r.ritual.status === 'scheduled' && r.ritual.scheduled_for);
    for (const h of coven.holidays) {
      const from = addDays(h.date, -1).getTime();
      const to = addDays(h.date, h.days).getTime();
      if (scheduled.some((r) => {
        const t = new Date(r.ritual.scheduled_for!).getTime();
        return t >= from && t < to;
      })) continue;
      out.push({
        key: `coven-plan:${coven.id}:${h.baseId}:${dayKey(h.date)}`,
        kind: 'planning',
        at: atMinutes(addDays(h.date, -days), prefs.planning.at),
        title: coven.leader ? `Plan ${coven.name}’s ritual for ${h.name}` : `${h.name} with ${coven.name}`,
        body: coven.leader
          ? `${h.name} is ${aheadWords(days)}, on ${longDay(h.date)}, and no rite is on the coven’s calendar for it yet.`
          : `${coven.name} keeps ${h.name} ${aheadWords(days)}, on ${longDay(h.date)}. Ask what is planned, or offer to help.`,
        url: `/coven/c/${coven.slug}`,
      });
    }
    if (!coven.leader) continue;
    for (const { ritual } of scheduled) {
      const start = new Date(ritual.scheduled_for!);
      const label = occasionLabel(ritual);
      out.push({
        key: `coven-prep:${ritual.id}`,
        kind: 'planning',
        at: atMinutes(addDays(start, -days), prefs.planning.at),
        title: `Prepare ${ritual.title}`,
        body: `${coven.name}’s rite is on ${longDay(start)}${label ? ` (${label})` : ''}. Look over its steps and who is doing what.`,
        url: `/coven/c/${coven.slug}/ritual/${ritual.id}`,
      });
    }
  }
  return out;
}

// ── Tending ───────────────────────────────────────────────────────────────

function plantReminders(prefs: ReminderPrefs, sources: TendingSources, now: Date, days: number): Reminder[] {
  const p = prefs.tending.plants;
  if (!p.on) return [];
  const groups = new Map<string, { at: Date; due: WateringDue[] }>();
  const add = (at: Date, due: WateringDue) => {
    const key = `${dayKey(at)}T${hhmm(at.getHours() * 60 + at.getMinutes())}`;
    const group = groups.get(key) ?? { at, due: [] };
    group.due.push(due);
    groups.set(key, group);
  };
  for (const plant of sources.plants) {
    const own = p.per[plant.id] ?? {};
    if (own.on === false) continue;
    const mode = own.mode ?? p.mode;
    const minutes = own.at ?? p.at;
    const due: WateringDue = { altarId: plant.altarId, altarName: plant.altarName, objectId: plant.id.split(':').slice(1).join(':'), who: plant.who, named: plant.named, dueAt: plant.dueAt ?? 0 };
    if (mode === 'thirsty') {
      // When it's actually thirsty: on the day it comes due, or the next time round if that's past.
      if (plant.dueAt == null) continue;
      let at = atMinutes(new Date(plant.dueAt), minutes);
      while (at.getTime() <= now.getTime()) at = atMinutes(addDays(at, 1), minutes);
      add(at, due);
    } else {
      const r: Repeat = { every: own.every ?? p.every, weekdays: own.weekdays ?? p.weekdays };
      const anchor = (!r.weekdays.length && fromKey(plant.lastWatered)) || EPOCH;
      for (const d of repeatDays(r, now, Math.min(days, TENDING_DAYS) + 1, anchor)) add(atMinutes(d, minutes), due);
    }
  }
  return [...groups.entries()].map(([key, g]) => {
    const oneAltar = g.due.every((d) => d.altarId === g.due[0].altarId);
    return {
      key: `watering:${key}`,
      kind: 'watering' as const,
      at: g.at,
      title: g.due.length === 1 ? 'A plant would like water' : 'Your plants would like water',
      body: wateringNote(g.due, { oneAltar: oneAltar && g.due.length > 1 }) ?? '',
      url: oneAltar && g.due[0].altarId ? `/altar/${g.due[0].altarId}` : '/altar',
    };
  });
}

function altarReminders(prefs: ReminderPrefs, sources: TendingSources, now: Date, days: number): Reminder[] {
  const a = prefs.tending.altars;
  if (!a.on) return [];
  const altars = a.ids.length ? sources.altars.filter((x) => a.ids.includes(x.id)) : sources.altars;
  // Altars chosen by name that are gone now: nothing to tend.
  if (a.ids.length && !altars.length) return [];
  const one = altars.length === 1 ? altars[0] : null;
  const body = one
    ? `A few minutes with ${altarPhrase(one.name)}: dust it, refresh its water, and light what wants lighting.`
    : altars.length > 1
      ? `A few minutes with your altars (${altars.map((x) => x.name || 'unnamed').slice(0, 3).join(', ')}${altars.length > 3 ? ' and more' : ''}): dust, refresh, relight.`
      : 'A few minutes with your altar: dust it, refresh its water, and light what wants lighting.';
  return repeatDays(a, now, Math.min(days, TENDING_DAYS) + 1).map((d) => ({
    key: `altar:${dayKey(d)}`,
    kind: 'altar' as const,
    at: atMinutes(d, a.at),
    title: altars.length > 1 ? 'Tend your altars' : 'Tend your altar',
    body,
    url: one ? `/altar/${one.id}` : '/altar',
  }));
}

function offeringReminders(prefs: ReminderPrefs, sources: TendingSources, now: Date, days: number): Reminder[] {
  const o = prefs.tending.offerings;
  const out: Reminder[] = [];
  if (o.on && sources.offerings.length) {
    const byDay = new Map<string, { at: Date; due: OfferingDue[] }>();
    for (const due of sources.offerings) {
      const when = new Date(due.dueAt);
      let at = atMinutes(addDays(when, -o.lead), o.at);
      // On the day: the time after it goes over. The evening before: unless that's past, then on the day.
      if (o.lead === 0 && at.getTime() < due.dueAt) at = atMinutes(addDays(at, 1), o.at);
      if (o.lead > 0 && at.getTime() <= now.getTime()) {
        at = atMinutes(when, o.at);
        if (at.getTime() < due.dueAt) at = atMinutes(addDays(at, 1), o.at);
      }
      const key = dayKey(at);
      const day = byDay.get(key) ?? { at, due: [] };
      day.due.push(due);
      byDay.set(key, day);
    }
    for (const [key, day] of byDay) {
      const first = day.due[0];
      const oneAltar = day.due.every((d) => d.altarId === first.altarId);
      out.push({
        key: `offering:${key}`,
        kind: 'offering',
        at: day.at,
        title: day.due.length === 1 ? 'An offering wants tending' : 'Your offerings want tending',
        body: tendingNote(day.due) ?? '',
        url: oneAltar && first.altarId ? `/altar/${first.altarId}` : '/altar',
      });
    }
  }
  if (o.refresh) {
    for (const d of repeatDays(o, now, Math.min(days, TENDING_DAYS) + 1)) {
      out.push({
        key: `offering-refresh:${dayKey(d)}`,
        kind: 'offering',
        at: atMinutes(d, o.refreshAt),
        title: 'Refresh your offerings',
        body: 'Fresh water, a flower, or a little food for your altar, as suits you today.',
        url: '/altar',
      });
    }
  }
  return out;
}

const methodLabel = (key: string) => (CLEANSE_METHODS.find((m) => m.key === key)?.label ?? key).toLowerCase();

/** How to cleanse this stone, safely: "Selenite: moonlight or smoke, and keep it dry." */
export function crystalAdvice(crystal: Pick<CrystalSource, 'name' | 'key'>, moon: boolean): string {
  const care = findCare(crystal.key, crystal.name);
  if (!care) return `${crystal.name}: moonlight, smoke or sound suit almost every stone.`;
  const methods = [...care.cleanse];
  if (moon && methods.includes('moonlight')) {
    methods.splice(methods.indexOf('moonlight'), 1);
    methods.unshift('moonlight');
  }
  const how = methods.slice(0, 2).map(methodLabel).join(' or ').replace(/^running water/, 'a rinse under running water');
  const cautions: string[] = [];
  if (care.water === 'no') cautions.push('keep it dry');
  else if (care.water === 'brief') cautions.push('a quick rinse at most');
  if (care.salt === 'no' && care.water !== 'no') cautions.push('no salt');
  if (care.sun === 'fades') cautions.push('out of strong sun');
  else if (care.sun === 'heat') cautions.push('away from heat and sun');
  const name = crystal.name === care.name || !crystal.name ? care.name : crystal.name;
  return `${name}: ${how}${cautions.length ? `, and ${cautions.join(', ')}` : ''}.`;
}

function crystalReminders(prefs: ReminderPrefs, sources: TendingSources, now: Date, days: number): Reminder[] {
  const c = prefs.tending.crystals;
  if (!c.on) return [];
  const chosen = sources.crystals.filter((x) => !c.off.includes(x.id));
  if (sources.crystals.length && !chosen.length) return [];
  // The same stone on an altar and in My stones is mentioned once.
  const seen = new Set<string>();
  const stones = chosen.filter((x) => {
    const id = (x.key ?? x.name).toLowerCase();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  const bodyFor = (moon: boolean) => {
    if (!stones.length) return 'Moonlight, smoke or sound suit almost every stone. Keep soft stones such as selenite dry.';
    const lines = stones.slice(0, 3).map((s) => crystalAdvice(s, moon));
    return `${lines.join(' ')}${stones.length > 3 ? ` And ${stones.length - 3} more.` : ''}`;
  };
  const out: Reminder[] = [];
  if (c.cadence === 'weeks') {
    for (const d of repeatDays({ every: c.weeks * 7, weekdays: [] }, now, days + 1)) {
      out.push({ key: `crystal:${dayKey(d)}`, kind: 'crystal', at: atMinutes(d, c.at), title: 'Time to cleanse your crystals', body: bodyFor(false), url: '/rituals/craft/crystal' });
    }
    return out;
  }
  const until = now.getTime() + (days + 1) * DAY;
  for (const e of upcomingPhases(addDays(now, -1), Math.ceil(days / 7) + 6)) {
    if (e.date.getTime() > until) break;
    if (!(e.phase === 'full' && c.cadence !== 'new') && !(e.phase === 'new' && c.cadence !== 'full')) continue;
    const full = e.phase === 'full';
    out.push({
      key: `crystal:${dayKey(e.date)}`,
      kind: 'crystal',
      at: atMinutes(e.date, c.at),
      title: full ? 'Full moon: cleanse and charge your crystals' : 'New moon: cleanse your crystals and set them to an intention',
      body: bodyFor(true),
      url: '/rituals/craft/crystal',
    });
  }
  return out;
}

function candleReminders(prefs: ReminderPrefs, sources: TendingSources, now: Date, days: number): Reminder[] {
  const k = prefs.tending.candles;
  const out: Reminder[] = [];
  if (k.nearEnd) {
    for (const candle of sources.candles) {
      if (!candle.lit || candle.burnoutAt == null) continue;
      const at = new Date(candle.burnoutAt - k.nearEndMinutes * 60_000);
      out.push({
        key: `candle-end:${candle.id}:${candle.burnoutAt}`,
        kind: 'candle',
        at,
        title: `Your ${candle.name} is nearly burned down`,
        body: `About ${k.nearEndMinutes} minutes left on ${altarPhrase(candle.altarName)}. Stay with it to the end, or snuff it and finish another day.`,
        url: `/altar/${candle.altarId}`,
      });
    }
  }
  const working = sources.candles.filter((x) => x.working);
  if (k.relight && working.length) {
    const first = working[0];
    const hours = Math.max(1, Math.round(first.remainingMs / 3_600_000));
    const body =
      working.length === 1
        ? `Light the ${first.name} on ${altarPhrase(first.altarName)} again: about ${hours} ${hours === 1 ? 'hour' : 'hours'} left to burn.`
        : `${working.length} candles are waiting to be lit again, the ${first.name} among them.`;
    for (let d = 0; d <= Math.min(days, 7); d++) {
      const day = addDays(now, d);
      out.push({ key: `candle-relight:${dayKey(day)}`, kind: 'candle', at: atMinutes(day, k.relightAt), title: 'Your candle working', body, url: working.length === 1 ? `/altar/${first.altarId}` : '/altar' });
    }
  }
  if (k.daily) {
    for (let d = 0; d <= Math.min(days, TENDING_DAYS); d++) {
      const day = addDays(now, d);
      out.push({ key: `candle-daily:${dayKey(day)}`, kind: 'candle', at: atMinutes(day, k.dailyAt), title: 'Candle practice', body: 'Light a candle and sit with its flame for a few minutes.', url: '/altar' });
    }
  }
  return out;
}

// ── Keeping quiet, gathering, choosing ────────────────────────────────────

/** Reminders that are about a set moment: they come before quiet hours rather than after, and are never gathered. */
export const isUrgent = (r: Pick<Reminder, 'kind' | 'key'>) => r.kind === 'ritual' || r.kind === 'coven' || r.key.startsWith('candle-end:') || r.key.startsWith('moon-exact:');

/** Gathered into the day's note when there are many: everything but the moon, rituals, rites and the daily practices. */
const GATHERED = new Set<ReminderKind>(['holiday', 'deipnon', 'sacred', 'planning', 'lookback', 'offering', 'watering', 'altar', 'crystal', 'candle']);

const PRIORITY: Record<ReminderKind, number> = {
  ritual: 5,
  coven: 5,
  planning: 4,
  holiday: 3,
  deipnon: 3,
  sacred: 3,
  lookback: 3,
  moon: 3,
  summary: 3,
  offering: 2,
  watering: 2,
  altar: 2,
  crystal: 2,
  candle: 2,
  devotion: 1,
  dream: 1,
};
export const priorityOf = (r: Pick<Reminder, 'kind' | 'key'>) => (isUrgent(r) ? 5 : PRIORITY[r.kind] ?? 1);

/** Inside quiet hours, a reminder moves to when they end; one about a set moment comes just before they begin. */
export function outOfQuiet(r: Reminder, quiet: ReminderPrefs['quiet']): Reminder {
  if (!quiet.on || quiet.start === quiet.end) return r;
  const m = r.at.getHours() * 60 + r.at.getMinutes();
  const wraps = quiet.start > quiet.end;
  const inside = wraps ? m >= quiet.start || m < quiet.end : m >= quiet.start && m < quiet.end;
  if (!inside) return r;
  const day = startOfDay(r.at);
  // Which night's quiet this is: it began the day before when we're past midnight in a quiet that wraps.
  const began = wraps && m < quiet.end ? addDays(day, -1) : day;
  if (isUrgent(r)) return { ...r, at: atMinutes(began, Math.max(0, quiet.start - 15)) };
  return { ...r, at: atMinutes(wraps ? addDays(began, 1) : began, quiet.end) };
}

/** With the pause on: nothing, or nothing before the day it ends. */
export function withoutPaused(list: Reminder[], prefs: ReminderPrefs, now: Date): Reminder[] {
  if (!isPaused(prefs, now)) return list;
  const until = fromKey(prefs.pausedUntil);
  return until ? list.filter((r) => r.at.getTime() >= until.getTime()) : [];
}

/** More than `max` gathered reminders on one day become one note at the first of their times. */
export function gather(list: Reminder[], max: number): Reminder[] {
  const byDay = new Map<string, Reminder[]>();
  for (const r of list) {
    if (!GATHERED.has(r.kind) || isUrgent(r)) continue;
    const key = dayKey(r.at);
    byDay.set(key, [...(byDay.get(key) ?? []), r]);
  }
  const gathered = new Set<Reminder>();
  const notes: Reminder[] = [];
  for (const [key, day] of byDay) {
    if (day.length <= max) continue;
    day.sort((a, b) => a.at.getTime() - b.at.getTime() || priorityOf(b) - priorityOf(a));
    day.forEach((r) => gathered.add(r));
    const titles = [...day].sort((a, b) => priorityOf(b) - priorityOf(a)).map((r) => r.title);
    const body = titles.join(' · ');
    notes.push({
      key: `summary:${key}`,
      kind: 'summary',
      at: day[0].at,
      title: `${day.length} things today`,
      body: body.length > 220 ? `${body.slice(0, 217).trimEnd()}…` : body,
      url: '/today',
    });
  }
  return [...list.filter((r) => !gathered.has(r)), ...notes];
}

/**
 * At most `cap`: everything in the next two days first, soonest first; then
 * the most important of the rest, soonest first among equals. The rest are
 * scheduled when the app next opens and the window has moved on.
 */
export function choose(list: Reminder[], cap: number, now: Date): Reminder[] {
  if (list.length <= cap) return [...list].sort((a, b) => a.at.getTime() - b.at.getTime());
  const soon = now.getTime() + SOON_MS;
  const ranked = [...list].sort((a, b) => {
    const sa = a.at.getTime() <= soon ? 0 : 1;
    const sb = b.at.getTime() <= soon ? 0 : 1;
    if (sa !== sb) return sa - sb;
    if (sa === 1 && priorityOf(a) !== priorityOf(b)) return priorityOf(b) - priorityOf(a);
    return a.at.getTime() - b.at.getTime();
  });
  return ranked.slice(0, cap).sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** The newer kinds (holidays, tending, planning, coven rites), with quiet hours and the pause kept, before gathering and choosing. */
export function calendarReminders(input: PlanInput): Reminder[] {
  const { now } = input;
  const horizonDays = input.horizonDays ?? HORIZON_DAYS;
  const prefs = input.prefs ?? readPrefs(input.appSettings, input.legacy as LegacyReminders);
  const sources = input.sources ?? EMPTY_SOURCES;
  const longest = Math.max(30, ...prefs.holidays.leads, ...Object.values(prefs.holidays.leadsFor).flat(), prefs.planning.days);
  const items = prefs.holidays.on || prefs.planning.holidays ? holidayItems(input.appSettings, now, horizonDays + longest, input.place ?? null) : [];
  const list = [
    ...holidayReminders(prefs, items),
    ...holidayPlanning(prefs, items, input.plans ?? []),
    ...covenReminders(prefs, input.covens ?? [], now),
    ...plantReminders(prefs, sources, now, horizonDays),
    ...altarReminders(prefs, sources, now, horizonDays),
    ...offeringReminders(prefs, sources, now, horizonDays),
    ...crystalReminders(prefs, sources, now, horizonDays),
    ...candleReminders(prefs, sources, now, horizonDays),
  ];
  return settle(list, prefs, now, horizonDays);
}

function settle(list: Reminder[], prefs: ReminderPrefs, now: Date, horizonDays: number): Reminder[] {
  const horizon = now.getTime() + horizonDays * DAY;
  const seen = new Set<string>();
  return withoutPaused(list, prefs, now)
    .map((r) => outOfQuiet(r, prefs.quiet))
    .filter((r) => r.at.getTime() > now.getTime() && r.at.getTime() <= horizon)
    .filter((r) => (seen.has(r.key) ? false : (seen.add(r.key), true)))
    .sort((a, b) => a.at.getTime() - b.at.getTime());
}

/**
 * Everything for the phone: the device's moon, ritual, devotion, dream and
 * look-back reminders and the newer kinds, out of quiet hours, a busy day
 * gathered into one, and at most `cap` of them.
 */
export function planReminders(input: PlanInput, options: { cap?: number; gather?: boolean } = {}): Reminder[] {
  const { now } = input;
  const horizonDays = input.horizonDays ?? HORIZON_DAYS;
  const prefs = input.prefs ?? readPrefs(input.appSettings, input.legacy as LegacyReminders);
  // Sacred days, offerings and watering now come from the prefs (and the Deipnon with the holidays), so the older switches don't ring them twice.
  const device = buildSchedule({ ...input.legacy, sacredDays: false, offerings: false, watering: false }, input.plans ?? [], now, horizonDays, [], input.lookBacks ?? [], [], [], [], Infinity);
  let list = [...settle(device, prefs, now, horizonDays), ...calendarReminders({ ...input, prefs, horizonDays })];
  if (options.gather !== false && prefs.bundle.on) list = gather(list, prefs.bundle.max);
  return choose(list, options.cap ?? MAX_REMINDERS, now);
}

/** Whether anything at all could ring, to know whether to ask for notifications. */
export function anyPlanned(prefs: ReminderPrefs): boolean {
  const t = prefs.tending;
  return prefs.holidays.on || prefs.planning.holidays || prefs.planning.covens || t.plants.on || t.altars.on || t.offerings.on || t.offerings.refresh || t.crystals.on || t.candles.relight || t.candles.nearEnd || t.candles.daily;
}
