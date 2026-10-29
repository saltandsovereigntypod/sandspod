// The coven's moon calendar: how the coven counts its days (the ordinary
// date or the moon's months), the moon's choices (month names, the southern
// names, where the year begins, what a Blue Moon is), and the calendars it
// shows beside the date (covens.practice_calendars). Set by those who manage
// the coven; every member sees it in plain words, and may take it for their
// own Settings, or keep their own. Pure, shared with the website
// (js/core/covens.js).
//
// covens.moon_calendar (20261114000000_coven_moon_calendar.sql) is a JSON
// object in the same keys as a person's settings, so taking it is a plain
// copy: { calendar_count_by, calendar_opt_moon_names,
// calendar_opt_moon_southNames, calendar_opt_moon_yearStart,
// calendar_opt_moon_blue }. Until that migration is applied the column is
// missing, and the coven reads as having set nothing.
//
// A person's `calendar_coven` setting (a JSON string) remembers the coven
// whose calendar they took (its id, name and the calendar as it was then)
// and their own settings from before, to put back; and the covens whose
// offer they turned down ("Keep my own"), with the calendar as it was, so a
// later change can ask again. Nothing changes anyone's settings unless they
// choose it.

import { calendarById, calendarChoices, CALENDARS, COUNT_KEY, EXTRA_KEY, lineFor, MOON_CALENDAR, optionKey, primaryCalendar, shownCalendars, type Place } from '../calendars/index.ts';

type SettingsLike = Record<string, unknown> | null | undefined;

export const MOON_CHOICE_KEYS = ['names', 'southNames', 'yearStart', 'blue'] as const;
/** The settings keys a coven's moon calendar holds. */
export const COVEN_MOON_KEYS = [COUNT_KEY, ...MOON_CHOICE_KEYS.map((key) => optionKey('moon', key))];
/** The person's setting that remembers whose calendar they took. */
export const FOLLOWED_KEY = 'calendar_coven';

export type CovenMoonSource = { id?: string; name?: string; practice_calendars?: string[] | null; moon_calendar?: unknown } | null | undefined;

/** The coven's choices, cleaned: only its keys, and only values the app knows. */
export function readCovenMoon(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const source = raw as Record<string, unknown>;
  const count = source[COUNT_KEY];
  if (count === 'moon' || count === 'standard') out[COUNT_KEY] = count;
  for (const choice of MOON_CALENDAR.choices ?? []) {
    const key = optionKey('moon', choice.key);
    const value = source[key];
    if (typeof value === 'string' && choice.options.some((o) => o.value === value)) out[key] = value;
  }
  return out;
}

/** The counting calendars the coven shows beside the date, known ids only, in display order. */
export function covenCalendarIds(coven: CovenMoonSource): string[] {
  const ids = new Set((coven?.practice_calendars ?? []).filter(Boolean));
  return CALENDARS.filter((c) => ids.has(c.id)).map((c) => c.id);
}

/** The coven's calendar as settings, so the calendars' own code reads it as it reads a person's. */
export function covenSettings(coven: CovenMoonSource): Record<string, string> {
  return { ...readCovenMoon(coven?.moon_calendar), [EXTRA_KEY]: covenCalendarIds(coven).join(',') };
}

/** Whether the coven has said anything about counting its days. */
export function hasCovenCounting(coven: CovenMoonSource): boolean {
  return Object.keys(readCovenMoon(coven?.moon_calendar)).length > 0 || covenCalendarIds(coven).length > 0;
}

/** Whether the coven keeps the moon's months, leading or beside the date. */
const usesMoon = (settings: SettingsLike) => primaryCalendar(settings) === 'moon' || shownCalendars(settings).includes('moon');

// ─── In words ────────────────────────────────────────────────────────────

const PHRASES: Record<string, Record<string, string>> = {
  names: {
    folk: 'by their folk full moon names (Wolf, Snow, Worm…)',
    numbered: 'simply counted: First Moon, Second Moon…',
    attic: 'by the Attic months (Hekatombaion, Metageitnion…)',
    coligny: 'by the Coligny months (Samonios, Dumannios…)',
    hindu: 'by the Hindu months (Chaitra, Vaishakha…)',
  },
  southNames: {
    turned: 'turned six months',
    northern: 'kept as in the north',
  },
  yearStart: {
    'winter-solstice': 'at the first new moon on or after the winter solstice',
    'spring-equinox': 'at the first new moon on or after the spring equinox',
    samhain: 'at the first new moon from Samhain',
    attic: 'at the first new moon after the summer solstice (Attic)',
    coligny: 'at the moon in which Samonios begins (Coligny)',
    hindu: 'at the new moon that begins Chaitra (Hindu)',
  },
  blue: {
    seasonal: 'the third of four full moons in a season',
    almanac: 'the third of four full moons in one of the almanac’s equal seasons',
    monthly: 'the second full moon in a calendar month',
  },
};

/** The moon's choices in force for these settings, as sentences. */
export function moonChoiceSentences(settings: SettingsLike): string[] {
  const c = calendarChoices(settings, 'moon');
  const followed = !['folk', 'numbered'].includes(c.names);
  return [
    `The months are named ${PHRASES.names[c.names] ?? c.names}.`,
    `The year begins ${PHRASES.yearStart[c.yearStart] ?? c.yearStart}.`,
    ...(followed ? [] : [`South of the equator, the folk names are ${PHRASES.southNames[c.southNames] ?? c.southNames}.`]),
    `A Blue Moon is ${PHRASES.blue[c.blue] ?? c.blue}.`,
  ];
}

/** What the coven follows, in plain words, for its page. */
export function covenFollowsLines(coven: CovenMoonSource): string[] {
  if (!hasCovenCounting(coven)) return [];
  const settings = covenSettings(coven);
  const lines: string[] = [];
  const moon = readCovenMoon(coven?.moon_calendar);
  if (moon[COUNT_KEY]) lines.push(primaryCalendar(settings) === 'moon' ? 'The coven counts its days by the moon’s months, from new moon to new moon.' : 'The coven counts its days by the ordinary date.');
  const shown = shownCalendars(settings).map(theName);
  if (shown.length) lines.push(`Beside the date it shows ${listWords(shown)}.`);
  if (usesMoon(settings)) lines.push(...moonChoiceSentences(settings));
  return lines;
}

/** "the Attic (Athenian) calendar", "the moon’s months". */
const theName = (id: string) => {
  const name = calendarById(id)?.name ?? id;
  return /^the /i.test(name) ? `t${name.slice(1)}` : `the ${name}`;
};
const listWords = (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

/** The coven's moon date for a day, when it keeps the moon's months, or ''. */
export function covenMoonLine(coven: CovenMoonSource, day: Date, place: Place | null): string {
  const settings = covenSettings(coven);
  if (!usesMoon(settings)) return '';
  return lineFor(MOON_CALENDAR, day, settings, place)?.short ?? '';
}

/**
 * The coven's moon date for a day, only when it differs from the person's own
 * (theirs is already on the screen, or they don't count by the moon).
 */
export function covenMoonLineIfDifferent(coven: CovenMoonSource, mine: SettingsLike, day: Date, place: Place | null): string {
  const theirs = covenMoonLine(coven, day, place);
  if (!theirs) return '';
  const own = usesMoon(mine) ? (lineFor(MOON_CALENDAR, day, mine, place)?.short ?? '') : '';
  return own === theirs ? '' : theirs;
}

// ─── Taking it for your own ──────────────────────────────────────────────

type Followed = { coven: string; name: string; sig: string; prev: Record<string, string> };
export type FollowedState = { followed?: Followed; kept?: Record<string, string> };

/** The person's `calendar_coven` setting, read safely. */
export function readFollowed(settings: SettingsLike): FollowedState {
  const raw = settings?.[FOLLOWED_KEY];
  if (typeof raw !== 'string' || !raw) return {};
  try {
    const parsed = JSON.parse(raw) as FollowedState;
    const out: FollowedState = {};
    const f = parsed?.followed;
    if (f && typeof f.coven === 'string' && typeof f.sig === 'string' && f.prev && typeof f.prev === 'object') {
      const prev: Record<string, string> = {};
      for (const [k, v] of Object.entries(f.prev)) if (typeof v === 'string' && (k === EXTRA_KEY || COVEN_MOON_KEYS.includes(k))) prev[k] = v;
      out.followed = { coven: f.coven, name: typeof f.name === 'string' ? f.name : '', sig: f.sig, prev };
    }
    if (parsed?.kept && typeof parsed.kept === 'object') {
      out.kept = {};
      for (const [k, v] of Object.entries(parsed.kept)) if (typeof v === 'string') out.kept[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

const writeFollowed = (state: FollowedState) => (state.followed || (state.kept && Object.keys(state.kept).length) ? JSON.stringify(state) : '');

/** A fingerprint of the coven's calendar, to notice when it changes. */
export function covenCalendarSignature(coven: CovenMoonSource): string {
  const s = covenSettings(coven);
  return [...COVEN_MOON_KEYS, EXTRA_KEY].map((k) => `${k}=${s[k] ?? ''}`).join('|');
}

export type CalendarChange = { label: string; from: string; to: string };

const countWord = (settings: SettingsLike) => (primaryCalendar(settings) === 'moon' ? 'The moon' : 'Standard');
const optionLabel = (key: string, value: string) => MOON_CALENDAR.choices?.find((c) => c.key === key)?.options.find((o) => o.value === value)?.label ?? value;

/**
 * What taking the coven's calendar would change in these settings: the
 * settings to save (the coven's choices, and its calendars added to those
 * already shown), and each change in words. Calendars you show are kept.
 */
export function covenCalendarChanges(mine: SettingsLike, coven: CovenMoonSource): { changes: Record<string, string>; lines: CalendarChange[] } {
  const theirs = covenSettings(coven);
  const moon = readCovenMoon(coven?.moon_calendar);
  const changes: Record<string, string> = {};
  const lines: CalendarChange[] = [];
  // Its calendars, added to yours.
  const myShown = new Set(String(mine?.[EXTRA_KEY] ?? '').split(',').map((x) => x.trim()).filter(Boolean));
  const adding = covenCalendarIds(coven).filter((id) => !myShown.has(id));
  if (adding.length) {
    changes[EXTRA_KEY] = [...myShown, ...adding].join(',');
    lines.push({ label: 'Also show', from: '', to: `adds ${listWords(adding.map(theName))}` });
  }
  if (moon[COUNT_KEY] && primaryCalendar(mine) !== primaryCalendar(theirs)) {
    changes[COUNT_KEY] = moon[COUNT_KEY];
    lines.push({ label: 'Count my days by', from: countWord(mine), to: countWord(theirs) });
  }
  if (usesMoon(theirs)) {
    // Read yours as it will be with the coven's calendars shown, so a choice that follows one compares fairly.
    const after = { ...(mine ?? {}), ...changes };
    const own = calendarChoices(after, 'moon');
    const wanted = calendarChoices(theirs, 'moon');
    for (const choice of MOON_CALENDAR.choices ?? []) {
      if (own[choice.key] === wanted[choice.key]) continue;
      changes[optionKey('moon', choice.key)] = wanted[choice.key];
      lines.push({ label: choice.label, from: optionLabel(choice.key, own[choice.key]), to: optionLabel(choice.key, wanted[choice.key]) });
    }
  }
  return { changes, lines };
}

export type CovenCalendarState =
  /** The coven has set nothing about counting days. */
  | 'none'
  /** Your settings already count as the coven does. */
  | 'same'
  /** You took it, and it hasn't changed since. */
  | 'applied'
  /** You took it, and the coven has changed it since. */
  | 'changed'
  /** You chose to keep your own (for the calendar as it is now). */
  | 'kept'
  /** Not yet answered. */
  | 'offer';

export function covenCalendarState(mine: SettingsLike, coven: CovenMoonSource): CovenCalendarState {
  if (!coven?.id || !hasCovenCounting(coven)) return 'none';
  const state = readFollowed(mine);
  const sig = covenCalendarSignature(coven);
  const pending = covenCalendarChanges(mine, coven).lines.length > 0;
  if (state.followed?.coven === coven.id) {
    if (state.followed.sig === sig || !pending) return 'applied';
    return 'changed';
  }
  if (!pending) return 'same';
  if (state.kept?.[coven.id] === sig) return 'kept';
  return 'offer';
}

/** Whether you can put back your own settings from before you took this coven's calendar. */
export const canRestore = (mine: SettingsLike, coven: CovenMoonSource) => !!coven?.id && readFollowed(mine).followed?.coven === coven.id;

/** The settings to save to take the coven's calendar for your own (remembering yours, to put back). */
export function takeCovenCalendar(mine: SettingsLike, coven: CovenMoonSource): Record<string, string> {
  const { changes } = covenCalendarChanges(mine, coven);
  const state = readFollowed(mine);
  // Taking an update keeps what you had before you first took it.
  const again = state.followed && state.followed.coven === coven?.id ? state.followed : null;
  const prev: Record<string, string> = again ? { ...again.prev } : {};
  if (!again) {
    for (const key of [EXTRA_KEY, ...COVEN_MOON_KEYS]) prev[key] = typeof mine?.[key] === 'string' ? (mine[key] as string) : '';
  }
  const kept = { ...(state.kept ?? {}) };
  if (coven?.id) delete kept[coven.id];
  const followed: Followed = { coven: coven?.id ?? '', name: coven?.name ?? '', sig: covenCalendarSignature(coven), prev };
  return { ...changes, [FOLLOWED_KEY]: writeFollowed({ followed, kept }) };
}

/** The settings to save to keep your own (asked again only if the coven changes its calendar). */
export function keepMyCalendar(mine: SettingsLike, coven: CovenMoonSource): Record<string, string> {
  const state = readFollowed(mine);
  const kept = { ...(state.kept ?? {}), ...(coven?.id ? { [coven.id]: covenCalendarSignature(coven) } : {}) };
  const followed = state.followed?.coven === coven?.id ? undefined : state.followed;
  return { [FOLLOWED_KEY]: writeFollowed({ followed, kept }) };
}

/**
 * The settings to save to put back what you had before taking the coven's
 * calendar. The coven's offer then counts as answered "Keep my own", until
 * the coven changes its calendar.
 */
export function restoreMyCalendar(mine: SettingsLike): Record<string, string> {
  const state = readFollowed(mine);
  if (!state.followed) return {};
  const kept = { ...(state.kept ?? {}), [state.followed.coven]: state.followed.sig };
  return { ...state.followed.prev, [FOLLOWED_KEY]: writeFollowed({ kept }) };
}
