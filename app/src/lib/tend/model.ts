// To tend: one list of everything you look after, wherever it began. A
// petition on your own altar, a candle still burning, an offering going over,
// a pot that would like water, a coven petition you asked or have held, what
// you wrote in a coven ritual and are still holding, a journey's practice for
// today, a "Did it work?" whose day has come, what a rite asks you to write
// before it, a mentee waiting for a check-in, an action agreed at a coven
// meeting. Each one is tended by its own
// source's tending (gather.ts says how), so the altar and everything else
// stay as they are everywhere.
//
// What the list adds is kept in the craft collection `tend.rhythms` (one
// entry per thing tended, synced like the practice tools, no new table): how
// often you mean to tend it (a rhythm), whether to be reminded, the words
// you've added, and how it ended. Pure, so it can be tested; the website
// reaches it through js/core/tend.js.

import { deipnonDays } from '../deipnon.ts';
import { lunationNear, julianDayToDate, phaseJde } from '../moon.ts';
import { scoreEntry } from '../covens/picker.ts';

export const TEND_COLLECTION = 'tend.rhythms';

// ─── What can be tended ──────────────────────────────────────────────────

export type TendKind =
  | 'petition'
  | 'candle'
  | 'offering'
  | 'plant'
  | 'coven-petition'
  | 'contribution'
  | 'journey'
  | 'lookback'
  | 'coven-task'
  | 'checkin'
  | 'action';

/** What can be done from the list, each by its own source's tending. */
export type TendAction =
  | 'light' // light the candle (its own, or the one a petition sits under)
  | 'snuff' // let a burning candle rest
  | 'word' // add a word to it
  | 'tend' // tend a coven petition (a candle in your name), or keep holding what you wrote
  | 'refresh' // a fresh offering
  | 'water' // water the plant
  | 'practice' // a journey's practice, done
  | 'answer' // "Did it work?"
  | 'write' // write what a rite asks of you
  | 'checkin' // log a mentor's check-in
  | 'done' // an action from a coven meeting, done
  | 'open'; // open it where it lives

/** How something ends. */
export type TendEnd = 'answered' | 'closed' | 'released' | 'burned' | 'buried' | 'returned' | 'let-go';

export const END_WORDS: Record<TendEnd, { label: string; done: string }> = {
  answered: { label: 'It was answered', done: 'Marked answered. Blessed be.' },
  closed: { label: 'Close it', done: 'Closed, with thanks.' },
  released: { label: 'Release it', done: 'Released.' },
  burned: { label: 'Burn it', done: 'Burned. It stays in the box’s history.' },
  buried: { label: 'Bury it', done: 'Buried. It stays in the box’s history.' },
  returned: { label: 'Return it to the earth', done: 'Returned to the earth.' },
  'let-go': { label: 'Let it go', done: 'Let go. It won’t ask to be tended again.' },
};

export type TendGroup = 'altar' | 'coven' | 'journey' | 'rituals';

export type Tendable = {
  /** Stable across visits and devices: "<kind>:<id>". */
  key: string;
  kind: TendKind;
  group: TendGroup;
  title: string;
  /** A line under the title: how it stands now. */
  detail: string;
  /** Where it came from: "Your altar · Hearth", "Coven · Deipnon, 26 Oct". */
  source: string;
  /** When it wants tending, as its source says (ms), or null when it asks for nothing by a day. */
  dueAt: number | null;
  /** The last time it was tended at its source (ms), if known. */
  tendedAt: number | null;
  actions: TendAction[];
  ends: TendEnd[];
  /** Private to you: only you ever see it (a sealed contribution, a petition only you read). */
  private: boolean;
  /** Words to search by beyond the title. */
  keywords: string[];
  /** Where it lives, to open it: an app route and the website's page. */
  href: string;
  webHref: string;
  /** What the source's tending needs (ids). */
  ref: Record<string, string>;
};

export const KIND_LABEL: Record<TendKind, { label: string; plural: string; one: string; many: string }> = {
  petition: { label: 'Petition', plural: 'Petitions', one: 'petition', many: 'petitions' },
  candle: { label: 'Candle', plural: 'Candles', one: 'candle', many: 'candles' },
  offering: { label: 'Offering', plural: 'Offerings', one: 'offering', many: 'offerings' },
  plant: { label: 'Plant', plural: 'Plants', one: 'plant', many: 'plants' },
  'coven-petition': { label: 'Coven petition', plural: 'Coven petitions', one: 'coven petition', many: 'coven petitions' },
  contribution: { label: 'From a coven ritual', plural: 'From coven rituals', one: 'thing you hold from a ritual', many: 'things you hold from rituals' },
  journey: { label: 'Journey', plural: 'Journeys', one: 'journey practice', many: 'journey practices' },
  lookback: { label: 'Did it work?', plural: 'Did it work?', one: 'look-back', many: 'look-backs' },
  'coven-task': { label: 'Before the rite', plural: 'Before the rite', one: 'task before a rite', many: 'tasks before a rite' },
  checkin: { label: 'Mentor check-in', plural: 'Mentor check-ins', one: 'mentor check-in', many: 'mentor check-ins' },
  action: { label: 'From a meeting', plural: 'From meetings', one: 'action from a meeting', many: 'actions from meetings' },
};

// ─── Rhythms ─────────────────────────────────────────────────────────────

/**
 * How often you mean to tend it: as it asks (its own day: a plant's thirst,
 * an offering going over, a journey's practice), every day, every week, at a
 * moon (new, full, or the dark moon the night before the new), or every day
 * until a day (the next Deipnon, the full moon, a date of your own), when
 * it's time to end it.
 */
export type RhythmKind = 'asks' | 'daily' | 'weekly' | 'moon' | 'until';
export type MoonMark = 'new' | 'full' | 'dark';
export type Rhythm = { kind: RhythmKind; moon?: MoonMark; until?: string; untilWhy?: string };

export const RHYTHMS: { value: RhythmKind; label: string }[] = [
  { value: 'asks', label: 'As it asks' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'moon', label: 'By the moon' },
  { value: 'until', label: 'Until a day' },
];

export const MOON_MARKS: { value: MoonMark; label: string }[] = [
  { value: 'new', label: 'New moon' },
  { value: 'full', label: 'Full moon' },
  { value: 'dark', label: 'Dark moon' },
];

/** The rhythm each kind keeps until you choose another. */
export function defaultRhythm(kind: TendKind): Rhythm {
  if (kind === 'petition' || kind === 'coven-petition') return { kind: 'daily' };
  if (kind === 'contribution') return { kind: 'weekly' };
  return { kind: 'asks' };
}

/** Whether a kind has a day of its own to fall back on ("as it asks"). */
export const asksOfItself = (kind: TendKind) => !['petition', 'coven-petition', 'contribution'].includes(kind);

/** The hour (minutes after midnight) a reminder rings for each kind until you choose: candles and petitions in the evening, the rest in the morning. */
export function defaultReminderAt(kind: TendKind): number {
  return kind === 'petition' || kind === 'coven-petition' || kind === 'candle' || kind === 'contribution' ? 20 * 60 : 9 * 60;
}

/** What `tend.rhythms` keeps for one thing. */
export type TendRecord = {
  key: string;
  kind: TendKind;
  /** Its title and source when last seen, so a reminder can name it. */
  title: string;
  source: string;
  href: string;
  /** Null: the kind's own (defaultRhythm). */
  rhythm: Rhythm | null;
  remind: boolean;
  /** Minutes after midnight. */
  at: number;
  /** When it was last tended from the list (ISO), or ''. */
  tendedAt: string;
  /** How many times it has been tended from the list (absent on records from before it was counted). */
  times?: number;
  /** Words added to it, oldest first. */
  words: { at: string; text: string }[];
  /** How it ended, once it did. */
  ended: { how: TendEnd; at: string; note: string; pageId?: string } | null;
};

export const WORDS_MAX = 60;
export const WORD_MAX = 500;
export const NOTE_MAX = 2000;

const DAY = 86_400_000;
const isDay = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (key: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};
export const startOfDay = (d: Date | number) => {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function cleanRhythm(raw: unknown): Rhythm | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<Rhythm>;
  if (!RHYTHMS.some((x) => x.value === r.kind)) return null;
  if (r.kind === 'moon') return { kind: 'moon', moon: MOON_MARKS.some((m) => m.value === r.moon) ? r.moon : 'full' };
  if (r.kind === 'until') {
    if (!isDay(r.until)) return null;
    return { kind: 'until', until: r.until, untilWhy: typeof r.untilWhy === 'string' ? r.untilWhy.slice(0, 120) : '' };
  }
  return { kind: r.kind as RhythmKind };
}

const KINDS = Object.keys(KIND_LABEL) as TendKind[];
const ENDS = Object.keys(END_WORDS) as TendEnd[];

/** A saved record from any older or partial shape. */
export function normalizeRecord(raw: unknown): TendRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<TendRecord>;
  if (typeof r.key !== 'string' || !r.key) return null;
  const kind = KINDS.includes(r.kind as TendKind) ? (r.kind as TendKind) : (r.key.split(':')[0] as TendKind);
  if (!KINDS.includes(kind)) return null;
  const at = Number(r.at);
  const ended = r.ended && typeof r.ended === 'object' && ENDS.includes(r.ended.how) ? { how: r.ended.how, at: String(r.ended.at || ''), note: String(r.ended.note || '').slice(0, NOTE_MAX), ...(r.ended.pageId ? { pageId: String(r.ended.pageId) } : {}) } : null;
  return {
    key: r.key,
    kind,
    title: String(r.title || '').slice(0, 200),
    source: String(r.source || '').slice(0, 200),
    href: String(r.href || ''),
    rhythm: cleanRhythm(r.rhythm),
    remind: r.remind === true,
    at: Number.isInteger(at) && at >= 0 && at < 1440 ? at : defaultReminderAt(kind),
    tendedAt: typeof r.tendedAt === 'string' ? r.tendedAt : '',
    ...(Number.isInteger(r.times) && (r.times as number) > 0 ? { times: r.times } : {}),
    words: Array.isArray(r.words) ? r.words.filter((w) => w && typeof w.text === 'string' && typeof w.at === 'string').slice(-WORDS_MAX) : [],
    ended,
  };
}

/** A new record for something on the list. */
export function newRecord(item: Pick<Tendable, 'key' | 'kind' | 'title' | 'source' | 'href'>): TendRecord {
  return { key: item.key, kind: item.kind, title: item.title, source: item.source, href: item.href, rhythm: null, remind: false, at: defaultReminderAt(item.kind), tendedAt: '', words: [], ended: null };
}

/** Tended from the list just now, with a word if one was added. */
export function recordTended(record: TendRecord, now: Date, word = ''): TendRecord {
  const text = word.trim().slice(0, WORD_MAX);
  // Older records weren't counted: they count from one tending, or from the words added since.
  const before = record.times ?? (record.tendedAt ? Math.max(1, record.words.length) : 0);
  return { ...record, tendedAt: now.toISOString(), times: before + 1, words: text ? [...record.words, { at: now.toISOString(), text }].slice(-WORDS_MAX) : record.words };
}

export function recordEnded(record: TendRecord, how: TendEnd, note: string, now: Date, pageId?: string): TendRecord {
  return { ...record, remind: false, ended: { how, at: now.toISOString(), note: note.trim().slice(0, NOTE_MAX), ...(pageId ? { pageId } : {}) } };
}

/** The rhythm it keeps: yours, or its kind's own. */
export const rhythmOf = (item: Pick<Tendable, 'kind'>, record: TendRecord | null | undefined): Rhythm => record?.rhythm ?? defaultRhythm(item.kind);

// ─── The moon ────────────────────────────────────────────────────────────

/** The local days of a moon from `from`'s day for `days` days: the new moon, the full moon, or the dark moon (the day before the new). */
export function moonDays(mark: MoonMark, from: Date, days: number): Date[] {
  const start = startOfDay(from).getTime();
  const end = start + days * DAY;
  const out: Date[] = [];
  for (let k = lunationNear(new Date(start)) - 1; out.length < 40; k++) {
    const at = julianDayToDate(phaseJde(k + (mark === 'full' ? 0.5 : 0), mark === 'full' ? 'full' : 'new'));
    const day = mark === 'dark' ? addDays(startOfDay(at), -1) : startOfDay(at);
    if (day.getTime() > end) break;
    if (day.getTime() >= start) out.push(day);
  }
  return out;
}

/** The next day a moon falls, today counted. */
export const nextMoonDay = (mark: MoonMark, from: Date) => moonDays(mark, from, 40)[0] ?? null;

/** Days to tend something until: the next Deipnon, the dark moon, the new and full moons. Soonest first. */
export function untilChoices(now: Date): { id: string; label: string; date: string; why: string }[] {
  const out: { id: string; label: string; date: string; why: string }[] = [];
  const deipnon = deipnonDays(addDays(now, 1), 40)[0];
  if (deipnon) out.push({ id: 'deipnon', label: 'The next Deipnon', date: dayKey(deipnon), why: 'Hekate’s Deipnon' });
  for (const mark of MOON_MARKS) {
    const day = nextMoonDay(mark.value, addDays(now, 1));
    if (day) out.push({ id: mark.value, label: `The ${mark.label.toLowerCase()}`, date: dayKey(day), why: `The ${mark.label.toLowerCase()}` });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

// ─── When it's due ───────────────────────────────────────────────────────

export type DueState = 'due' | 'ending' | 'later' | 'resting';

export type Due = {
  state: DueState;
  /** When it next wants tending (start of that day for a rhythm, the source's own time otherwise), or null. */
  at: number | null;
  /** "Due today", "Next on the full moon, 5 Nov", "Its day has come". */
  line: string;
};

const shortDay = (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/** "today", "tomorrow", "Thursday", "5 Nov". */
export function dayWords(at: number, now: Date): string {
  const days = Math.round((startOfDay(at).getTime() - startOfDay(now).getTime()) / DAY);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 7) return new Date(at).toLocaleDateString(undefined, { weekday: 'long' });
  return shortDay(new Date(at));
}

/**
 * When something wants tending: by your rhythm (counted from when it was
 * last tended, here or at its source), or as it asks.
 */
export function dueOf(item: Pick<Tendable, 'kind' | 'dueAt' | 'tendedAt'>, record: TendRecord | null | undefined, now: Date): Due {
  const rhythm = rhythmOf(item, record);
  const today = startOfDay(now).getTime();
  const tomorrow = addDays(startOfDay(now), 1).getTime();
  const last = Math.max(item.tendedAt ?? 0, record?.tendedAt ? Date.parse(record.tendedAt) || 0 : 0);
  const tendedToday = last >= today;

  if (rhythm.kind === 'asks') {
    if (item.dueAt == null) return { state: 'resting', at: null, line: '' };
    if (item.dueAt < tomorrow) return { state: 'due', at: item.dueAt, line: 'Wants tending today' };
    return { state: 'later', at: item.dueAt, line: `Next ${dayWords(item.dueAt, now)}` };
  }
  if (rhythm.kind === 'daily') {
    return tendedToday ? { state: 'later', at: tomorrow, line: 'Tended today. Again tomorrow' } : { state: 'due', at: today, line: 'Every day · due today' };
  }
  if (rhythm.kind === 'weekly') {
    const next = last ? addDays(startOfDay(last), 7).getTime() : today;
    return next <= today ? { state: 'due', at: next, line: 'Every week · due today' } : { state: 'later', at: next, line: `Every week · next ${dayWords(next, now)}` };
  }
  if (rhythm.kind === 'moon') {
    const mark = rhythm.moon ?? 'full';
    const name = MOON_MARKS.find((m) => m.value === mark)!.label.toLowerCase();
    const day = nextMoonDay(mark, now);
    if (day && day.getTime() === today && !tendedToday) return { state: 'due', at: today, line: `The ${name} is today` };
    const next = day && day.getTime() === today ? nextMoonDay(mark, addDays(now, 1)) : day;
    return next ? { state: 'later', at: next.getTime(), line: `At the ${name}, ${dayWords(next.getTime(), now)}` } : { state: 'later', at: null, line: `At the ${name}` };
  }
  // Until a day: every day until then, and on the day, time to end it.
  const until = fromKey(rhythm.until ?? '');
  const why = rhythm.untilWhy || (until ? shortDay(until) : 'its day');
  if (until && until.getTime() <= today) return { state: 'ending', at: until.getTime(), line: `${why}: its day has come. End it when you’re ready` };
  const untilWords = `until ${why}${until && rhythm.untilWhy ? `, ${shortDay(until)}` : ''}`;
  return tendedToday ? { state: 'later', at: tomorrow, line: `Every day ${untilWords}. Tended today` } : { state: 'due', at: today, line: `Every day ${untilWords}` };
}

export function rhythmLabel(rhythm: Rhythm): string {
  if (rhythm.kind === 'moon') return `At each ${MOON_MARKS.find((m) => m.value === (rhythm.moon ?? 'full'))!.label.toLowerCase()}`;
  if (rhythm.kind === 'until') {
    const until = fromKey(rhythm.until ?? '');
    return `Every day until ${rhythm.untilWhy ? `${rhythm.untilWhy}, ` : ''}${until ? shortDay(until) : 'its day'}`;
  }
  return RHYTHMS.find((r) => r.value === rhythm.kind)!.label;
}

// ─── The list ────────────────────────────────────────────────────────────

export type ListItem = Tendable & { due: Due; record: TendRecord | null };

/**
 * The list: each thing with when it's due, without those you've ended (or
 * let go), due today first (soonest), then the rest (soonest, then by name).
 */
export function tendList(items: Tendable[], records: TendRecord[], now: Date): { today: ListItem[]; ongoing: ListItem[] } {
  const byKey = new Map(records.map((r) => [r.key, r]));
  const seen = new Set<string>();
  const list: ListItem[] = [];
  for (const item of items) {
    if (seen.has(item.key)) continue;
    seen.add(item.key);
    const record = byKey.get(item.key) ?? null;
    if (record?.ended) continue;
    list.push({ ...item, record, due: dueOf(item, record, now) });
  }
  const end = addDays(startOfDay(now), 1).getTime();
  const isToday = (i: ListItem) => i.due.state === 'due' || i.due.state === 'ending' || (i.due.at != null && i.due.at < end && i.due.state !== 'resting');
  const order = (a: ListItem, b: ListItem) => (a.due.at ?? Infinity) - (b.due.at ?? Infinity) || a.title.localeCompare(b.title);
  return { today: list.filter(isToday).sort(order), ongoing: list.filter((i) => !isToday(i)).sort(order) };
}

/** A search over the list: its title, kind, source and words, as the coven pickers search (picker.ts). */
export function filterList<T extends Tendable>(items: T[], query: string): T[] {
  if (!query.trim()) return items;
  return items
    .map((item, index) => ({
      item,
      index,
      score: scoreEntry({ key: item.key, label: item.title, detail: item.source, keywords: [item.detail, KIND_LABEL[item.kind].label, KIND_LABEL[item.kind].plural, ...item.keywords] }, query),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.item);
}

export const GROUP_FILTERS: { value: 'all' | TendGroup; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'altar', label: 'My altars' },
  { value: 'coven', label: 'Covens' },
  { value: 'journey', label: 'Journeys' },
  { value: 'rituals', label: 'Rituals and spells' },
];

/** Today's card: how many want tending today, by kind ("2 petitions, 1 plant"), and the first few. */
export function todaySummary(list: { today: ListItem[]; ongoing: ListItem[] }, top = 3): { count: number; ongoing: number; line: string; top: ListItem[] } {
  const counts = new Map<TendKind, number>();
  for (const i of list.today) counts.set(i.kind, (counts.get(i.kind) ?? 0) + 1);
  const parts = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([kind, n]) => `${n} ${n === 1 ? KIND_LABEL[kind].one : KIND_LABEL[kind].many}`);
  const line = !list.today.length
    ? list.ongoing.length
      ? `Nothing wants tending today. ${list.ongoing.length} ${list.ongoing.length === 1 ? 'thing is' : 'things are'} in your keeping.`
      : 'Nothing to tend yet. Petitions, candles, offerings and plants gather here as you set them out.'
    : parts.length > 3
      ? `${list.today.length} things want tending today.`
      : `${parts.join(', ').replace(/, ([^,]*)$/, ' and $1')} ${list.today.length === 1 ? 'wants' : 'want'} tending today.`;
  return { count: list.today.length, ongoing: list.ongoing.length, line: line.charAt(0).toUpperCase() + line.slice(1), top: list.today.slice(0, top) };
}

// ─── Reminders ───────────────────────────────────────────────────────────

export type TendReminder = { key: string; at: Date; title: string; body: string; url: string };

/**
 * The reminders a record asks for over the next `days` days: each day it
 * falls by its rhythm, at its hour. "As it asks" rings nothing here (plants,
 * offerings, journeys, look-backs and rites remind in their own ways).
 */
export function tendReminders(records: TendRecord[], now: Date, days = 14): TendReminder[] {
  const out: TendReminder[] = [];
  for (const record of records) {
    if (!record.remind || record.ended) continue;
    const rhythm = record.rhythm ?? defaultRhythm(record.kind);
    const at = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(record.at / 60), record.at % 60);
    const title = record.title || KIND_LABEL[record.kind].label;
    const body = record.source ? `${record.source}. Tend it from your list.` : 'Tend it from your list.';
    const url = '/today/tend';
    const push = (d: Date, suffix = '') => out.push({ key: `tend:${record.key}:${dayKey(d)}`, at: at(d), title: suffix || title, body: suffix ? `${title}. ${body}` : body, url });
    let dates: Date[] = [];
    if (rhythm.kind === 'daily') dates = Array.from({ length: days }, (_, i) => addDays(startOfDay(now), i));
    else if (rhythm.kind === 'weekly') {
      const last = record.tendedAt ? startOfDay(Date.parse(record.tendedAt)) : startOfDay(now);
      for (let d = addDays(last, record.tendedAt ? 7 : 0); d.getTime() < addDays(now, days).getTime(); d = addDays(d, 7)) dates.push(d);
    } else if (rhythm.kind === 'moon') dates = moonDays(rhythm.moon ?? 'full', now, days);
    else if (rhythm.kind === 'until') {
      const until = fromKey(rhythm.until ?? '');
      if (!until) continue;
      for (let d = startOfDay(now); d.getTime() < until.getTime() && d.getTime() < addDays(now, days).getTime(); d = addDays(d, 1)) dates.push(d);
      if (until.getTime() < addDays(now, days).getTime()) push(until, `Time to end “${title}”`);
    }
    for (const d of dates) push(d);
  }
  return out.filter((r) => r.at.getTime() > now.getTime()).sort((a, b) => a.at.getTime() - b.at.getTime());
}

// ─── Endings, kept in the Grimoire ───────────────────────────────────────

/**
 * "How did it go?" kept as a page in your Grimoire (grimoire/holyOps.ts
 * writes it, tagged so it's found again), under "How it went".
 */
export const ENDINGS_SECTION = 'How it went';

const esc = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function endingPage(item: Pick<Tendable, 'key' | 'title' | 'source' | 'kind'>, record: Pick<TendRecord, 'words'> | null, how: TendEnd, note: string, now: Date): { ref: string; title: string; sectionTitle: string; blocks: { type: string; content: string }[] } {
  const when = now.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  const ended = { answered: 'Answered', closed: 'Closed', released: 'Released', burned: 'Burned', buried: 'Buried', returned: 'Returned to the earth', 'let-go': 'Let go' }[how];
  const blocks: { type: string; content: string }[] = [{ type: 'callout', content: esc(`${KIND_LABEL[item.kind].label}${item.source ? ` · ${item.source}` : ''}. ${ended} on ${when}.`) }];
  if (note.trim()) blocks.push({ type: 'heading', content: 'How did it go?' }, ...note.trim().split(/\n\s*\n/).map((p) => ({ type: 'text', content: esc(p.trim()) })));
  const words = record?.words ?? [];
  if (words.length) blocks.push({ type: 'heading', content: 'Words along the way' }, { type: 'bulleted_list', content: words.map((w) => esc(`${new Date(w.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}: ${w.text.replace(/\n+/g, ' ')}`)).join('\n') });
  return { ref: `tend:${item.key}`, title: item.title.slice(0, 120) || 'How it went', sectionTitle: ENDINGS_SECTION, blocks };
}
