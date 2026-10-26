// The holidays a person can be reminded of, by calendar: the calendars they
// keep (Settings → Calendar & holidays: the Wheel, Celtic, Norse, Hellenic and
// the rest, their own days and single holidays picked into them), the
// traditional calendars they show beside the date (Hindu, Kemetic, Roman…),
// Hekate's Deipnon (deipnon.ts) and the sacred days of their patron and
// dedicated deities. Each holiday has a stable id that doesn't change from
// year to year ("wheel-samhain", "calendar:hindu" → "hindu-diwali",
// "patron-hekate"), which is what the pick-and-choose list saves. Pure, so
// the app and the website (js/core/guides.js) give the same answer.

import { calendarById, calendarEventsBetween, shownCalendars, type Place } from '../calendars/index.ts';
import { DEIPNON_PROMPT, deipnonDays, offersDeipnon } from '../deipnon.ts';
import { holidayChoice, holidaysBetween, TRADITIONS, type Holiday, type HolidayChoice, type Recurrence } from '../holidays.ts';
import { sacredReminders, sacredSources } from '../patron/index.ts';

type SettingsLike = Record<string, unknown> | null | undefined;

/** The calendar a reminder belongs to: a tradition id, 'custom', 'calendar:<id>' or 'patron'. */
export type HolidayGroup = { id: string; name: string; detail: string };

export type HolidayItem = {
  /** Stable from year to year: what the pick-and-choose list saves. */
  baseId: string;
  group: string;
  name: string;
  meaning: string;
  /** Local start day. */
  date: Date;
  days: number;
  recurs: Recurrence;
  /** 'deipnon' and 'sacred' keep their own words and keys. */
  kind: 'holiday' | 'deipnon' | 'sacred';
  /** For sacred days: what the reminder says. */
  title?: string;
  body?: string;
  url: string;
};

export const PATRON_GROUP = 'patron';
export const DEIPNON_ID = 'hellenic_monthly-deipnon';
const DAY = 86_400_000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** A holiday's id without the date holidays.ts adds ("wheel-samhain-2026-9-31" → "wheel-samhain"). */
export const baseIdOf = (id: string) => id.replace(/-\d{4}-\d{1,2}-\d{1,2}$/, '');

/** The calendar a holiday from holidays.ts is kept under: the tradition kept whole, else your own calendar (picked singles). */
function groupOf(holiday: Holiday, choice: HolidayChoice): string {
  const kept = holiday.traditionIds.find((id) => id !== 'custom' && choice.traditions.includes(id));
  return kept ?? 'custom';
}

const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();
const firstWord = (name: string) => name.split(' ')[0].toLowerCase();

/** The traditional calendars that can remind (not the moon's months: the moon has its own reminders). */
const remindingCalendars = (settings: SettingsLike) => shownCalendars(settings).filter((id) => id !== 'moon');

/** Every calendar this person has that could remind them, in a steady order. */
export function holidayGroups(settings: SettingsLike): HolidayGroup[] {
  const choice = holidayChoice(settings);
  const out: HolidayGroup[] = [];
  for (const tradition of TRADITIONS) {
    if (tradition.id === 'custom' || !choice.traditions.includes(tradition.id)) continue;
    out.push({ id: tradition.id, name: tradition.name, detail: tradition.description });
  }
  // Hekate's Deipnon comes from the Hellenic monthly days even for her patrons who don't keep them.
  if (!out.some((g) => g.id === 'hellenic_monthly') && offersDeipnon(settings)) {
    const monthly = TRADITIONS.find((t) => t.id === 'hellenic_monthly');
    out.push({ id: 'hellenic_monthly', name: monthly?.name ?? 'Hellenic monthly days', detail: 'Hekate’s Deipnon, as Hekate is your patron.' });
  }
  if (choice.traditions.includes('custom') && (choice.custom.length || (choice.picked ?? []).length)) {
    out.push({ id: 'custom', name: 'Your own days', detail: 'Your own events, and single holidays picked into your calendar.' });
  }
  for (const id of remindingCalendars(settings)) {
    const def = calendarById(id);
    if (def) out.push({ id: `calendar:${id}`, name: def.name, detail: 'Shown beside the date (Settings → Calendar & holidays).' });
  }
  if (sacredSources(settings).length) out.push({ id: PATRON_GROUP, name: 'Your deities’ sacred days', detail: 'For your patron and dedicated deities (Settings → My deities).' });
  return out;
}

/** The first sentence of a meaning, for a notification's body. */
export function shortMeaning(meaning: string): string {
  const text = meaning.trim();
  const end = text.search(/[.!?](\s|$)/);
  const first = end > 0 ? text.slice(0, end + 1) : text;
  return first.length > 160 ? `${first.slice(0, 157).trimEnd()}…` : first;
}

/**
 * Every holiday from the person's calendars starting from `from`'s day for
 * `days` days, soonest first, each once. Hekate's Deipnon is left out when
 * it's turned off (`deipnon_prompt`), and a deity's sacred day that is the
 * Deipnon itself gives way to it.
 */
export function holidayItems(settings: SettingsLike, from: Date, days: number, place: Place | null = null): HolidayItem[] {
  const start = startOfDay(from);
  const end = addDays(start, days);
  const choice = holidayChoice(settings);
  const out: HolidayItem[] = [];
  const offerDeipnon = offersDeipnon(settings);

  for (const h of holidaysBetween(start, end, choice)) {
    if (h.date.getTime() < start.getTime()) continue;
    const baseId = baseIdOf(h.id);
    const deipnon = baseId === DEIPNON_ID;
    if (deipnon && !offerDeipnon) continue;
    out.push({ baseId, group: groupOf(h, choice), name: h.name, meaning: h.meaning, date: h.date, days: h.days, recurs: h.recurs, kind: deipnon ? 'deipnon' : 'holiday', url: '/today' });
  }

  if (offerDeipnon && !out.some((i) => i.baseId === DEIPNON_ID)) {
    for (const date of deipnonDays(start, days)) {
      out.push({ baseId: DEIPNON_ID, group: 'hellenic_monthly', name: DEIPNON_PROMPT.title, meaning: DEIPNON_PROMPT.detail, date, days: 1, recurs: 'monthly', kind: 'deipnon', url: '/today' });
    }
  }

  // The traditional calendars shown beside the date; a day already there (by its first word) isn't added twice.
  if (remindingCalendars(settings).length) {
    const events = calendarEventsBetween(start, end, settings, place).filter((e) => e.calendar !== 'moon');
    // The lunar days that come round every fortnight or month (Ekadashi, Purnima) say so, so planning leaves them be.
    const times = new Map<string, number>();
    for (const e of events) times.set(e.id, (times.get(e.id) ?? 0) + 1);
    for (const e of events) {
      const date = startOfDay(e.date);
      if (date.getTime() < start.getTime()) continue;
      if (out.some((i) => sameDay(i.date, date) && firstWord(i.name) === firstWord(e.name))) continue;
      out.push({ baseId: e.id, group: `calendar:${e.calendar}`, name: e.name, meaning: e.meaning, date, days: Math.max(1, e.days), recurs: e.recurs ?? ((times.get(e.id) ?? 0) > 1 ? 'monthly' : 'yearly'), kind: 'holiday', url: '/today' });
    }
  }

  const deipna = new Set(out.filter((i) => i.kind === 'deipnon').map((i) => i.date.getTime()));
  for (const r of sacredReminders(sacredSources(settings), start, days + 1)) {
    const date = startOfDay(r.date);
    if (date.getTime() < start.getTime() || date.getTime() > end.getTime()) continue;
    if (r.key === 'hekate' && deipna.has(date.getTime())) continue;
    out.push({
      baseId: `patron-${r.key}`,
      group: PATRON_GROUP,
      name: r.title,
      meaning: r.body,
      date,
      days: 1,
      recurs: 'yearly',
      kind: 'sacred',
      title: r.title,
      body: r.body,
      url: `/today/library/traditional:deity:${r.key}`,
    });
  }

  return out.sort((a, b) => a.date.getTime() - b.date.getTime() || a.name.localeCompare(b.name));
}

export type CatalogItem = { baseId: string; name: string; next: Date; recurs: Recurrence };
export type CatalogGroup = HolidayGroup & { items: CatalogItem[] };

/**
 * The pick-and-choose list: each calendar with its holidays (once each, with
 * when it next comes), over the coming year. Sacred days are listed by deity.
 */
export function holidayCatalog(settings: SettingsLike, now: Date, place: Place | null = null): CatalogGroup[] {
  const items = holidayItems(settings, now, 400, place);
  return holidayGroups(settings).map((group) => {
    const seen = new Map<string, CatalogItem>();
    for (const item of items) {
      if (item.group !== group.id || seen.has(item.baseId)) continue;
      const name = item.kind === 'sacred' ? `${item.name.split(':')[0]}’s sacred days` : item.name;
      seen.set(item.baseId, { baseId: item.baseId, name, next: item.date, recurs: item.recurs });
    }
    return { ...group, items: [...seen.values()] };
  });
}

/** Whole days from `from`'s day to `date`'s day. */
export const daysUntil = (from: Date, date: Date) => Math.round((startOfDay(date).getTime() - startOfDay(from).getTime()) / DAY);
