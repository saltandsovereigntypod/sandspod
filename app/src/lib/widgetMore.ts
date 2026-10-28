// What the home screen widgets add from beyond your own calendars and plans:
// your covens' rites, meetings and holidays (lib/covens/today.ts and
// programs.ts), the To tend list's due things and the meeting actions agreed
// to you (lib/tend), the moon days your path keeps (the Hellenic month, or
// Hekate's Deipnon when she is your patron; lib/deipnon.ts) and the card
// you've drawn today. lib/widgetTimeline puts them into each day. Pure, so
// it can be tested; with nothing here (signed out, no covens, offline before
// anything was kept) the widgets show what they always have.

import { nextCovenRite, type CovenTodayInput, type NextCovenRite } from './covens/today.ts';
import { covenHolidaysBetween } from './covens/programs.ts';
import { DEIPNON_PROMPT, deipnonDays, keepsHellenicMonthly, offersDeipnon } from './deipnon.ts';
import { holidayChoice, holidaysBetween } from './holidays.ts';
import { moonSign, moonState } from './moon.ts';
import { KIND_LABEL, tendList, type ListItem, type TendKind, type TendRecord, type Tendable } from './tend/model.ts';
import { clock, dayAndTime, dayStart, daysApart, shortDate, whenWords } from './widgetWords.ts';

const DAY = 86_400_000;
const SCHEME = 'saltandsovereignty:/';

type SettingsLike = Record<string, unknown> | null | undefined;

export type WidgetMore = {
  /** Your covens' rows, as Today loads them (api.fetchCovenToday). */
  coven?: CovenTodayInput | null;
  /** The To tend list: what's gathered (tend/gather.ts) and the list's own records. */
  tend?: { items: Tendable[]; records: TendRecord[] } | null;
  /** Your settings, for the moon days your path keeps. */
  settings?: SettingsLike;
  /** The card you've drawn today (divination/daily.ts), for today only. */
  card?: { name: string; reversed: boolean } | null;
  /** Your covens' holidays, worked out once for a whole timeline (covenHolidaysAhead). */
  covenHolidays?: CovenHoliday[];
  /** When the timeline was made (its first day), for what's only known today. */
  now?: Date;
};

// ─── Your covens' holidays ───────────────────────────────────────────────

export type CovenHoliday = { name: string; meaning: string; date: Date; covenName: string };

/** The holidays your covens keep from `from`'s day for `days` days, soonest first (one of each, if two covens keep it). */
export function covenHolidaysAhead(coven: CovenTodayInput | null | undefined, from: Date, days: number): CovenHoliday[] {
  if (!coven?.covens?.length) return [];
  const start = dayStart(from);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + days);
  const out: CovenHoliday[] = [];
  for (const c of coven.covens) {
    for (const h of covenHolidaysBetween(c, start, end)) {
      if (h.date.getTime() < start.getTime()) continue;
      const holiday = { name: h.name, meaning: h.meaning, date: dayStart(h.date), covenName: c.name };
      if (!out.some((x) => sameHoliday(x, holiday))) out.push(holiday);
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** The same holiday on the same day, whoever keeps it. */
export const sameHoliday = (a: { name: string; date: Date }, b: { name: string; date: Date }) =>
  a.name.trim().toLowerCase() === b.name.trim().toLowerCase() && dayStart(a.date).getTime() === dayStart(b.date).getTime();

/** Your covens' holidays that aren't already in your own calendars. */
export const notAlreadyYours = (coven: CovenHoliday[], own: { name: string; date: Date }[]) => coven.filter((c) => !own.some((o) => sameHoliday(o, c)));

// ─── Your next working, from your coven ──────────────────────────────────

const answerOf = (input: CovenTodayInput, ritualId: string) => input.rsvps.find((x) => x.ritual_id === ritualId && x.user_id === input.userId)?.response;
const yoursWords = (answer: string | undefined) => (answer === 'going' ? 'You’re going' : answer === 'maybe' ? 'You might come' : 'Will you come?');
const riteUrl = (slug: string, id: string) => (slug ? `${SCHEME}/coven/c/${encodeURIComponent(slug)}/ritual/${encodeURIComponent(id)}` : `${SCHEME}/coven`);
const fromWords = (covenName: string, meeting: boolean, answer: string | undefined) => `${covenName}${meeting ? ' meeting' : ''} · ${yoursWords(answer)}`;

/** The soonest rite or meeting from `day` on that you haven't said you'll miss. */
export const nextRiteOn = (coven: CovenTodayInput | null | undefined, day: Date): NextCovenRite | null => nextCovenRite(coven ?? null, day);

/** Next Ritual's props for a coven's rite or meeting. */
export function riteDetails(rite: NextCovenRite, coven: CovenTodayInput, day: Date) {
  const when = dayAndTime(day, rite.at);
  return {
    ritual: `${rite.title} · ${when}`,
    ritualId: rite.ritualId,
    ritualTitle: rite.title,
    ritualWhen: when,
    ritualStart: rite.at.toISOString(),
    ritualIntention: '',
    ritualMoon: `${moonState(rite.at).name} in ${moonSign(rite.at)}`,
    ritualNeeds: [] as string[],
    ritualPrep: '',
    ritualKind: (rite.meeting ? 'meeting' : 'rite') as 'meeting' | 'rite',
    ritualFrom: fromWords(rite.covenName, rite.meeting, answerOf(coven, rite.ritualId)),
    ritualUrl: riteUrl(rite.covenSlug, rite.ritualId),
  };
}

// ─── Coming Up ───────────────────────────────────────────────────────────

export type WidgetComing = {
  kind: 'rite' | 'meeting' | 'holiday' | 'action' | 'tend';
  name: string;
  /** A short line under it: "Moon Circle · You’re going", "Kept by Moon Circle", "Would like water". */
  detail: string;
  /** "Mon, Oct 26". */
  date: string;
  /** "today", "tomorrow", "Friday", "in 12 days", "9:00 pm" (later today), "overdue". */
  when: string;
  /** The SF Symbol beside it (drawn to match on Android). */
  symbol: string;
};

const COMING_LENGTH = 8;
const ALTAR_TEND: TendKind[] = ['offering', 'plant', 'candle'];

/**
 * What wants tending on `day` from your altars (offerings going over, pots
 * wanting water, candles burning) and the meeting actions agreed to you that
 * are due within three days (or a week overdue), by the list's own rules.
 */
export function tendOn(tend: WidgetMore['tend'], day: Date, now: Date = day): { altar: ListItem[]; actions: ListItem[] } {
  if (!tend?.items?.length) return { altar: [], actions: [] };
  const list = tendList(tend.items, tend.records ?? [], day);
  const start = dayStart(day).getTime();
  const all = [...list.today, ...list.ongoing];
  const altar = all.filter((i) => {
    if (!ALTAR_TEND.includes(i.kind)) return false;
    if (i.kind !== 'candle') return list.today.includes(i);
    // A burning candle, until the day it burns down (with no end in sight, today only).
    const lit = i.actions.includes('snuff');
    return lit && (i.dueAt != null ? i.dueAt >= start : daysApart(now, day) === 0);
  });
  const actions = all.filter((i) => {
    if (i.kind !== 'action' || i.dueAt == null) return false;
    const apart = daysApart(day, new Date(i.dueAt + DAY));
    return apart >= -7 && apart <= 3;
  });
  return { altar, actions };
}

const TEND_DETAIL: Partial<Record<TendKind, string>> = { plant: 'Would like water', offering: 'Wants refreshing' };
const TEND_SYMBOL: Partial<Record<TendKind, string>> = { plant: 'drop', offering: 'gift', candle: 'flame' };

/** "2 plants and 1 candle". */
function kindsWords(items: ListItem[]): string {
  const counts = new Map<TendKind, number>();
  for (const i of items) counts.set(i.kind, (counts.get(i.kind) ?? 0) + 1);
  const parts = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([kind, n]) => `${n} ${n === 1 ? KIND_LABEL[kind].one : KIND_LABEL[kind].many}`);
  return parts.join(', ').replace(/, ([^,]*)$/, ' and $1');
}

/**
 * Coming Up, soonest first: what wants tending today, your covens' rites and
 * meetings (not those you'll miss), meeting actions due soon, and the
 * holidays ahead, yours and your covens' (`holidays`, already merged).
 */
export function comingUp(day: Date, holidays: { name: string; date: Date; from?: string }[], more: WidgetMore = {}): WidgetComing[] {
  const start = dayStart(day);
  const out: (WidgetComing & { at: number })[] = [];
  const dayWord = (date: Date) => whenWords(day, date).replace(/^tonight$/, 'today');

  const { altar, actions } = tendOn(more.tend, day, more.now ?? day);
  if (altar.length >= 3) {
    out.push({ kind: 'tend', name: `${altar.length} things want tending`, detail: kindsWords(altar), date: shortDate(start), when: 'today', symbol: 'hands.sparkles', at: start.getTime() });
  } else {
    for (const i of altar) {
      out.push({ kind: 'tend', name: i.title, detail: TEND_DETAIL[i.kind] ?? i.detail, date: shortDate(start), when: 'today', symbol: TEND_SYMBOL[i.kind] ?? 'hands.sparkles', at: start.getTime() });
    }
  }
  for (const i of actions) {
    const due = dayStart(i.dueAt! + DAY);
    const overdue = due.getTime() < start.getTime();
    out.push({ kind: 'action', name: i.title, detail: overdue ? `From a meeting · was due ${shortDate(due)}` : 'From a meeting', date: shortDate(due), when: overdue ? 'overdue' : dayWord(due), symbol: 'checkmark.circle', at: due.getTime() });
  }

  const coven = more.coven;
  if (coven) {
    const end = start.getTime() + 14 * DAY;
    const rites = coven.rituals
      .filter((r) => r.status === 'scheduled' && r.scheduled_for)
      .map((r) => ({ r, at: new Date(r.scheduled_for!) }))
      .filter(({ r, at }) => at.getTime() >= start.getTime() && at.getTime() < end && answerOf(coven, r.id) !== 'not_going')
      .sort((a, b) => a.at.getTime() - b.at.getTime())
      .slice(0, 4);
    for (const { r, at } of rites) {
      const meeting = r.kind === 'meeting';
      const covenName = coven.covens.find((c) => c.id === r.coven_id)?.name ?? 'Your coven';
      out.push({
        kind: meeting ? 'meeting' : 'rite',
        name: r.title,
        detail: fromWords(covenName, meeting, answerOf(coven, r.id)),
        date: shortDate(at),
        when: daysApart(day, at) === 0 ? clock(at) : dayWord(at),
        symbol: meeting ? 'person.3' : 'moon.stars',
        at: at.getTime(),
      });
    }
  }

  for (const h of holidays.slice(0, COMING_LENGTH)) {
    out.push({ kind: 'holiday', name: h.name, detail: h.from ? `Kept by ${h.from}` : '', date: shortDate(h.date), when: dayWord(h.date), symbol: 'sparkles', at: dayStart(h.date).getTime() });
  }

  return out
    .sort((a, b) => a.at - b.at)
    .slice(0, COMING_LENGTH)
    .map(({ at: _at, ...item }) => item);
}

// ─── The moon days your path keeps ───────────────────────────────────────

const firstSentence = (text: string) => {
  const s = text.split(/(?<=\.)\s/)[0] ?? '';
  return s.trim();
};

/**
 * The next moon day your path keeps, from `day` on, within a fortnight: the
 * Noumenia, Agathos Daimon and Hekate's Deipnon when you keep the Hellenic
 * month, or the Deipnon when Hekate is your patron (as Today and the
 * reminders decide). Today's is left out when it's already today's holiday.
 */
export function moonObservance(day: Date, settings: SettingsLike, todaysHolidays: string[] = []): { observance: string; observanceMeaning: string } {
  const none = { observance: '', observanceMeaning: '' };
  if (!settings) return none;
  const from = dayStart(day);
  const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 15);
  const days: { name: string; meaning: string; date: Date }[] = [];
  if (keepsHellenicMonthly(settings)) {
    for (const h of holidaysBetween(from, to, holidayChoice(settings))) {
      if (h.id.startsWith('hellenic_monthly-') && h.date.getTime() >= from.getTime()) days.push({ name: h.name, meaning: h.meaning, date: dayStart(h.date) });
    }
  }
  if (offersDeipnon(settings)) {
    for (const date of deipnonDays(from, 15)) {
      if (!days.some((d) => /deipnon/i.test(d.name) && d.date.getTime() === date.getTime())) days.push({ name: DEIPNON_PROMPT.title, meaning: DEIPNON_PROMPT.detail, date });
    }
  }
  const shown = new Set(todaysHolidays.map((n) => n.trim().toLowerCase()));
  const next = days
    .filter((d) => !(d.date.getTime() === from.getTime() && shown.has(d.name.trim().toLowerCase())))
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  if (!next) return none;
  return { observance: `${next.name} ${whenWords(day, next.date)}`, observanceMeaning: firstSentence(next.meaning) };
}

/** "The Star, reversed". */
export const cardWords = (card: WidgetMore['card']) => (card?.name ? `${card.name}${card.reversed ? ', reversed' : ''}` : '');
