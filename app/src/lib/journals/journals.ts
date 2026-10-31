// The four practice journals: Shadow work, Deity & spirit, Ancestors, and
// Omens & signs. Each is a named collection of craft entries (craft_entries,
// one row per entry, private to its owner and synced like the dream journal),
// so where a journal shows is only a setting: as a section of the Grimoire,
// beside Dreams, or as a journal of its own beside the ritual journal under
// Rituals → Journal. Moving it never touches the entries.
//
// What each entry holds, the prompts, the moon (and for omens the planetary
// hour) at the time of writing, search, tags, links to Grimoire pages and
// dreams, and the gentle prompt on Today. Pure, so the app and the website
// (js/core/practice-a.js) work it out the same way.

import { MOON_SEASON, moonQuarterOn, QUARTER_NAMES, SEASON_NAMES } from '../cycle/model.ts';
import { OFFERING_TYPES, RESPONSES } from '../altar/devotion.ts';
import { appStateOf } from '../altar/livingState.ts';
import type { SavedObject } from '../altar/types.ts';
import { addSymbol, cleanSymbol, parseSymbols } from '../craft/hedge/dreams.ts';
import { moonSign, moonState, type PhaseName, type ZodiacSign } from '../moon.ts';
import { dateFromKey, localDateKey } from '../rituals/lifecycle.ts';

export { addSymbol as addTag, parseSymbols as parseTags, OFFERING_TYPES, RESPONSES };

// ---------------------------------------------------------------------------
// The journals

export type JournalKind = 'shadow' | 'devotion' | 'ancestors' | 'omens';
export type JournalPlace = 'grimoire' | 'journal';

export type JournalDef = {
  kind: JournalKind;
  title: string;
  /** craft_entries collection. */
  collection: string;
  /** Its part of the Grimoire home (lib/grimoire/layout.ts). */
  shelfKey: string;
  /** The setting that says where it lives. */
  setting: string;
  eyebrow: string;
  intro: string;
  /** "Write in your shadow journal". */
  write: string;
  /** What one entry is called. */
  noun: string;
  nouns: string;
  empty: string;
  search: string;
};

export const JOURNALS: JournalDef[] = [
  {
    kind: 'shadow',
    title: 'Shadow work',
    collection: 'journal.shadow',
    shelfKey: 'shadowJournal',
    setting: 'journal_shadow_place',
    eyebrow: 'Gently, at your own pace',
    intro: 'A private place to notice what stirs you, the patterns that keep returning, and what you would like to do with them. The moon you wrote under is noted for you.',
    write: 'Write in your shadow journal',
    noun: 'entry',
    nouns: 'entries',
    empty: 'Nothing written yet. Choose a prompt if you would like one, or simply write what is with you today.',
    search: 'A feeling, a trigger, a tag, a moon',
  },
  {
    kind: 'devotion',
    title: 'Deity & spirit',
    collection: 'journal.devotion',
    shelfKey: 'devotionJournal',
    setting: 'journal_devotion_place',
    eyebrow: 'Devotion',
    intro: 'A log for each god or spirit you honour: offerings given, prayers said, devotional acts, and any signs you noticed. Choose from your own deities or the Living Library, or name one in your own words.',
    write: 'Write in your deity journal',
    noun: 'entry',
    nouns: 'entries',
    empty: 'Nothing written yet. The first offering, prayer or quiet moment you keep with a god or spirit, write it here.',
    search: 'A deity, an offering, a sign, a tag',
  },
  {
    kind: 'ancestors',
    title: 'Ancestors',
    collection: 'journal.ancestors',
    shelfKey: 'ancestorJournal',
    setting: 'journal_ancestors_place',
    eyebrow: 'The beloved dead',
    intro: 'Offerings, dreams of them, family recipes and stories, visits to graves and places, and what you learn as you look into the past. Your people are the ones you keep in Hedge → Ancestors.',
    write: 'Write in your ancestor journal',
    noun: 'entry',
    nouns: 'entries',
    empty: 'Nothing written yet. A recipe someone made, a story told at a table, a dream of someone gone: write it here so it is kept.',
    search: 'A name, a recipe, a place, a tag',
  },
  {
    kind: 'omens',
    title: 'Omens & signs',
    collection: 'journal.omens',
    shelfKey: 'omenJournal',
    setting: 'journal_omens_place',
    eyebrow: 'What the world showed you',
    intro: 'An animal that crossed your path, a number that kept appearing, a turn in the weather, a dream or a coincidence that felt like more. The moon and planetary hour are noted, and later you can say whether it came to pass.',
    write: 'Note a sign',
    noun: 'sign',
    nouns: 'signs',
    empty: 'Nothing noted yet. Next time something catches your attention and will not let go, note it here, then look back later.',
    search: 'A creature, a number, a place, a tag',
  },
];

export const JOURNAL_KINDS = JOURNALS.map((j) => j.kind);
export const isJournalKind = (v: unknown): v is JournalKind => typeof v === 'string' && (JOURNAL_KINDS as string[]).includes(v);
export const journalDef = (kind: JournalKind): JournalDef => JOURNALS.find((j) => j.kind === kind) ?? JOURNALS[0];
export const journalByShelf = (key: string): JournalDef | null => JOURNALS.find((j) => j.shelfKey === key) ?? null;

export const PLACE_OPTIONS: { value: JournalPlace; label: string; note: string }[] = [
  { value: 'grimoire', label: 'In my Grimoire', note: 'A section of your Grimoire, after Dreams.' },
  { value: 'journal', label: 'Its own journal', note: 'Beside your ritual journal, under Rituals → Journal.' },
];

type SettingsLike = Record<string, unknown> | null | undefined;

/** Where a journal lives: in the Grimoire unless chosen otherwise. */
export function journalPlace(settings: SettingsLike, kind: JournalKind): JournalPlace {
  return settings?.[journalDef(kind).setting] === 'journal' ? 'journal' : 'grimoire';
}

/** The settings each journal starts with (lib/settings/defaults.ts, js/my-settings.js). */
export const journalSettingDefaults = (): Record<string, string> => Object.fromEntries(JOURNALS.map((j) => [j.setting, 'grimoire']));

/** The journals shown in the Grimoire, in order. */
export const grimoireJournals = (settings: SettingsLike) => JOURNALS.filter((j) => journalPlace(settings, j.kind) === 'grimoire');

// ---------------------------------------------------------------------------
// Where they are

/** The app's screens for a journal, under the Grimoire or Rituals. */
export function journalRoutes(kind: JournalKind, place: JournalPlace) {
  const base = place === 'journal' ? `/rituals/journals/${kind}` : `/grimoire/journals/${kind}`;
  const query = (params: Record<string, string | undefined>) => {
    const q = Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return q ? `?${q}` : '';
  };
  return {
    list: base,
    write: (params: Record<string, string | undefined> = {}) => `${base}/edit${query(params)}`,
    entry: (id: string) => `${base}/${encodeURIComponent(id)}`,
    edit: (id: string) => `${base}/edit${query({ id })}`,
    search: (q: string) => `${base}${query({ q })}`,
  };
}

/** The hub of all four journals, in the app. */
export const journalsHub = (place: JournalPlace = 'grimoire') => (place === 'journal' ? '/rituals/journals' : '/grimoire/journals');

/** The website's pages for a journal (grimoire/journals/… or rituals/journals/…). */
export function journalWebRoutes(kind: JournalKind, place: JournalPlace) {
  const base = place === 'journal' ? '/rituals/journals/' : '/grimoire/journals/';
  const extra = (params: Record<string, string | undefined>) =>
    Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `&${k}=${encodeURIComponent(v!)}`)
      .join('');
  return {
    hub: base,
    list: `${base}journal/?j=${kind}`,
    write: (params: Record<string, string | undefined> = {}) => `${base}edit/?j=${kind}${extra(params)}`,
    entry: (id: string) => `${base}entry/?j=${kind}&id=${encodeURIComponent(id)}`,
    edit: (id: string) => `${base}edit/?j=${kind}&id=${encodeURIComponent(id)}`,
    search: (q: string) => `${base}journal/?j=${kind}&q=${encodeURIComponent(q)}`,
  };
}

// ---------------------------------------------------------------------------
// An entry

export type HourPlanet = 'Saturn' | 'Jupiter' | 'Mars' | 'Sun' | 'Venus' | 'Mercury' | 'Moon';
export type OmenOutcome = 'waiting' | 'yes' | 'partly' | 'no' | 'unsure';

/** A link from an entry to a Grimoire page, a dream, or another journal entry. */
export type JournalLink = { type: 'page' | 'dream' | 'entry'; id: string; title: string; kind?: JournalKind };

export type JournalEntryData = {
  /** The day it happened or was written, "YYYY-MM-DD". */
  date: string;
  /** "HH:MM", or '' when the time isn't known. */
  time: string;
  title: string;
  text: string;
  tags: string[];
  links: JournalLink[];
  /** The moon at the time, worked out from the date and time. */
  moonPhase: PhaseName;
  moonSign: ZodiacSign;
  /** The planetary hour at the time (omens), when a place was known; '' otherwise. */
  hour: HourPlanet | '';
  /** The prompt written to, if any (its id). */
  prompt: string;
  // Shadow work
  feelings: string;
  trigger: string;
  pattern: string;
  integration: string;
  // Deity & spirit
  deityKey: string;
  deityName: string;
  acts: string[];
  offerings: string[];
  offered: string;
  response: string;
  signs: string;
  prayer: string;
  // Ancestors
  people: string[];
  about: string;
  recipe: string;
  // Omens & signs
  seen: string;
  what: string;
  where: string;
  meaning: string;
  outcome: OmenOutcome;
  outcomeNote: string;
  /** When to look back, "YYYY-MM-DD", or ''. */
  checkOn: string;
};

export type JournalEntry = { id: string; createdAt: string; data: JournalEntryData };

export type Choice = { id: string; label: string; hint?: string };

export const DEVOTION_ACTS: Choice[] = [
  { id: 'offering', label: 'Offering' },
  { id: 'prayer', label: 'Prayer or words' },
  { id: 'devotion', label: 'Devotional act', hint: 'A candle, a walk, a song, a cleaning, a fast' },
  { id: 'sign', label: 'A sign' },
  { id: 'reflection', label: 'Reflection' },
];

export const ANCESTOR_TOPICS: Choice[] = [
  { id: 'offering', label: 'Offering' },
  { id: 'dream', label: 'A dream of them' },
  { id: 'recipe', label: 'Family recipe' },
  { id: 'story', label: 'Story or memory' },
  { id: 'visit', label: 'A visit', hint: 'A grave, a home, a place they knew' },
  { id: 'research', label: 'Family history', hint: 'Records, names, places found' },
  { id: 'conversation', label: 'Talking to them' },
];

export const OMEN_KINDS: Choice[] = [
  { id: 'animal', label: 'Animal', hint: 'A bird, a creature crossing your path' },
  { id: 'number', label: 'Number', hint: 'A number that keeps appearing' },
  { id: 'weather', label: 'Weather', hint: 'A sudden wind, a rainbow, a storm' },
  { id: 'dream', label: 'Dream' },
  { id: 'synchronicity', label: 'Synchronicity', hint: 'A coincidence that felt like more' },
  { id: 'object', label: 'Something found' },
  { id: 'other', label: 'Other' },
];

export const OUTCOMES: { value: OmenOutcome; label: string }[] = [
  { value: 'waiting', label: 'Waiting to see' },
  { value: 'yes', label: 'It came to pass' },
  { value: 'partly', label: 'In part' },
  { value: 'no', label: 'It didn’t' },
  { value: 'unsure', label: 'Hard to say' },
];

export const choiceLabel = (list: Choice[], id: string) => list.find((c) => c.id === id)?.label ?? '';
export const outcomeLabel = (v: string) => OUTCOMES.find((o) => o.value === v)?.label ?? '';

/** A text field of an entry, as the form shows it. */
export type TextField = { key: keyof JournalEntryData; label: string; placeholder: string; multiline?: boolean; when?: (d: JournalEntryData) => boolean };

export const FIELDS: Record<JournalKind, TextField[]> = {
  shadow: [
    { key: 'text', label: 'What came up', placeholder: 'Write freely. Nobody else reads this.', multiline: true },
    { key: 'feelings', label: 'Feelings', placeholder: 'What you felt, and where in your body', multiline: true },
    { key: 'trigger', label: 'What set it off', placeholder: 'A word, a person, a place, a memory', multiline: true },
    { key: 'pattern', label: 'Have you met this before?', placeholder: 'When it has come up before, and what it tends to do', multiline: true },
    { key: 'integration', label: 'What you would like to do with it', placeholder: 'Something to remember, forgive, ask for, or try next time', multiline: true },
  ],
  devotion: [
    { key: 'text', label: 'What happened', placeholder: 'What you did, and how it felt', multiline: true },
    { key: 'offered', label: 'What you offered', placeholder: 'Bread and honey, a candle, a song, time', when: (d) => d.acts.includes('offering') || d.offerings.length > 0 },
    { key: 'prayer', label: 'Prayer or words', placeholder: 'What you said, or a prayer you keep', multiline: true, when: (d) => d.acts.includes('prayer') },
    { key: 'signs', label: 'Signs', placeholder: 'Anything you noticed, and why it felt like theirs', multiline: true, when: (d) => d.acts.includes('sign') || d.response !== '' },
  ],
  ancestors: [
    { key: 'text', label: 'What you want to keep', placeholder: 'The memory, the dream, what you offered, what you found', multiline: true },
    { key: 'recipe', label: 'The recipe', placeholder: 'Ingredients, method, and whose hands it came through', multiline: true, when: (d) => d.about === 'recipe' },
    { key: 'offered', label: 'What you offered', placeholder: 'A glass of water, their favourite sweets, a flower', when: (d) => d.about === 'offering' },
    { key: 'where', label: 'Where', placeholder: 'A churchyard, a village, a kitchen', when: (d) => d.about === 'visit' || d.about === 'research' },
  ],
  omens: [
    { key: 'what', label: 'What you saw', placeholder: 'A heron by the road, 11:11 three times, a robin at the window' },
    { key: 'where', label: 'Where you were', placeholder: 'Walking to work, at the altar, in the garden' },
    { key: 'text', label: 'What was happening around it', placeholder: 'What you were thinking about or waiting on', multiline: true },
    { key: 'meaning', label: 'What it might mean', placeholder: 'Your own sense first; traditional meanings after', multiline: true },
  ],
};

/** The fields an entry shows in its form and page, in order. */
export const fieldsFor = (kind: JournalKind, d: JournalEntryData) => FIELDS[kind].filter((f) => !f.when || f.when(d));

/** The moon at a day and time ("HH:MM"; noon when no time is known). */
export function journalMoon(date: string, time = ''): { moonPhase: PhaseName; moonSign: ZodiacSign } {
  const at = momentOf(date, time);
  return { moonPhase: moonState(at).name, moonSign: moonSign(at) };
}

/** The moment a day and time stand for. */
export function momentOf(date: string, time = ''): Date {
  const day = dateFromKey(date) ?? new Date();
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  const h = m ? Math.min(23, Number(m[1])) : 12;
  const min = m ? Math.min(59, Number(m[2])) : 0;
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, min);
}

/** How full the moon was then, for drawing it beside an entry. */
export function entryMoonDisc(d: Pick<JournalEntryData, 'date' | 'time'>): { illumination: number; waxing: boolean } {
  const { illumination, waxing } = moonState(momentOf(d.date, d.time));
  return { illumination, waxing };
}

/** The moon's inner season that day, as Cycle & Moon names it ("inner autumn, waning moon"). */
export function moonSeasonOn(date: string): string {
  const quarter = moonQuarterOn(date);
  return `${SEASON_NAMES[MOON_SEASON[quarter]]}, ${QUARTER_NAMES[quarter]}`;
}

const pad = (n: number) => String(n).padStart(2, '0');
export const clockOf = (at: Date) => `${pad(at.getHours())}:${pad(at.getMinutes())}`;

/** A new entry, written now. */
export function blankEntry(kind: JournalKind, now: Date, extra: Partial<JournalEntryData> = {}): JournalEntryData {
  const date = localDateKey(now);
  const time = clockOf(now);
  const base: JournalEntryData = {
    date,
    time,
    title: '',
    text: '',
    tags: [],
    links: [],
    ...journalMoon(date, time),
    hour: '',
    prompt: '',
    feelings: '',
    trigger: '',
    pattern: '',
    integration: '',
    deityKey: '',
    deityName: '',
    acts: [],
    offerings: [],
    offered: '',
    response: '',
    signs: '',
    prayer: '',
    people: [],
    about: kind === 'ancestors' ? 'story' : '',
    recipe: '',
    seen: kind === 'omens' ? 'animal' : '',
    what: '',
    where: '',
    meaning: '',
    outcome: 'waiting',
    outcomeNote: '',
    checkOn: '',
  };
  return { ...base, ...extra };
}

const HOURS: HourPlanet[] = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const OUTCOME_VALUES = OUTCOMES.map((o) => o.value);
const PHASES: PhaseName[] = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];

/** A saved entry read defensively: older or partial copies still show. */
export function normalizeEntry(raw: unknown): JournalEntryData {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const strs = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string' && !!s) : []);
  const date = dateFromKey(str(r.date)) ? str(r.date) : localDateKey(new Date());
  const time = /^\d{1,2}:\d{2}$/.test(str(r.time)) ? str(r.time) : '';
  const moon = journalMoon(date, time);
  const links = Array.isArray(r.links)
    ? r.links
        .filter((l): l is Record<string, unknown> => !!l && typeof l === 'object')
        .filter((l) => (l.type === 'page' || l.type === 'dream' || l.type === 'entry') && typeof l.id === 'string' && !!l.id)
        .map((l) => ({ type: l.type as JournalLink['type'], id: l.id as string, title: str(l.title), ...(isJournalKind(l.kind) ? { kind: l.kind } : {}) }))
    : [];
  return {
    date,
    time,
    title: str(r.title),
    text: str(r.text),
    tags: strs(r.tags).map(cleanSymbol).filter(Boolean),
    links,
    moonPhase: PHASES.includes(r.moonPhase as PhaseName) ? (r.moonPhase as PhaseName) : moon.moonPhase,
    moonSign: str(r.moonSign) ? (r.moonSign as ZodiacSign) : moon.moonSign,
    hour: HOURS.includes(r.hour as HourPlanet) ? (r.hour as HourPlanet) : '',
    prompt: str(r.prompt),
    feelings: str(r.feelings),
    trigger: str(r.trigger),
    pattern: str(r.pattern),
    integration: str(r.integration),
    deityKey: str(r.deityKey),
    deityName: str(r.deityName),
    acts: strs(r.acts),
    offerings: strs(r.offerings),
    offered: str(r.offered),
    response: str(r.response),
    signs: str(r.signs),
    prayer: str(r.prayer),
    people: strs(r.people),
    about: str(r.about),
    recipe: str(r.recipe),
    seen: str(r.seen),
    what: str(r.what),
    where: str(r.where),
    meaning: str(r.meaning),
    outcome: OUTCOME_VALUES.includes(r.outcome as OmenOutcome) ? (r.outcome as OmenOutcome) : 'waiting',
    outcomeNote: str(r.outcomeNote),
    checkOn: dateFromKey(str(r.checkOn)) ? str(r.checkOn) : '',
  };
}

/** Text fields trimmed, ready to keep; null when there's nothing to keep yet. */
export function readyToKeep(kind: JournalKind, d: JournalEntryData): JournalEntryData | null {
  const out = { ...d };
  for (const key of ['title', 'text', 'feelings', 'trigger', 'pattern', 'integration', 'deityName', 'offered', 'signs', 'prayer', 'recipe', 'what', 'where', 'meaning', 'outcomeNote'] as const) {
    out[key] = out[key].trim();
  }
  const said = [out.title, out.text, out.trigger, out.pattern, out.integration, out.feelings, out.offered, out.prayer, out.signs, out.recipe, out.what, out.meaning].some(Boolean);
  if (!said) return null;
  if (kind === 'devotion' && !out.deityName) return null;
  return out;
}

/** What to say when an entry can't be kept yet. */
export function notReadyWords(kind: JournalKind, d: JournalEntryData): string {
  if (kind === 'devotion' && !d.deityName.trim()) return 'Choose the god or spirit this is for, or name them in your own words.';
  if (kind === 'omens') return 'Write a word or two about what you saw first.';
  return 'Write a little first, even a line.';
}

type Names = { people?: Record<string, string> };

/** An entry's title: its own, or one made from what it holds. */
export function entryTitle(kind: JournalKind, d: JournalEntryData, names: Names = {}): string {
  if (d.title.trim()) return d.title.trim();
  const first = (s: string) => s.trim().split(/\n/)[0].slice(0, 60);
  if (kind === 'devotion') {
    const act = d.acts.map((a) => choiceLabel(DEVOTION_ACTS, a)).filter(Boolean)[0];
    return [d.deityName || 'A god or spirit', act].filter(Boolean).join(' · ');
  }
  if (kind === 'ancestors') {
    const who = d.people.map((id) => names.people?.[id]).filter(Boolean).join(', ');
    return [choiceLabel(ANCESTOR_TOPICS, d.about) || 'Ancestors', who].filter(Boolean).join(' · ');
  }
  if (kind === 'omens') return first(d.what) || choiceLabel(OMEN_KINDS, d.seen) || 'A sign';
  return first(d.text) || first(d.trigger) || 'Shadow work';
}

/** The line under an entry's title in a list. */
export function entryDetail(kind: JournalKind, d: JournalEntryData, withDate = true): string {
  const day = withDate ? dayLabel(d.date) : null;
  const moon = `${d.moonPhase} in ${d.moonSign}`;
  const extra =
    kind === 'omens'
      ? [choiceLabel(OMEN_KINDS, d.seen), d.hour ? `hour of ${d.hour}` : null, d.outcome !== 'waiting' ? outcomeLabel(d.outcome) : null]
      : kind === 'devotion'
        ? [d.offerings.slice(0, 2).join(', ') || null]
        : [];
  return [day, moon, ...extra, d.tags.slice(0, 3).join(' · ') || null].filter(Boolean).join(' · ');
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "14 March" this year, "14 March 2025" otherwise. */
export function dayLabel(date: string, now = new Date()): string {
  const d = dateFromKey(date);
  if (!d) return date;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear() === now.getFullYear() ? '' : ` ${d.getFullYear()}`}`;
}

/** Newest first (by the day, then the time, then when written). */
export function sortEntries<T extends JournalEntry>(list: T[]): T[] {
  const key = (e: T) => `${e.data.date} ${e.data.time || '12:00'}`;
  return [...list].sort((a, b) => (key(a) === key(b) ? (a.createdAt < b.createdAt ? 1 : -1) : key(a) < key(b) ? 1 : -1));
}

/** Entries grouped by month, newest month first. */
export function groupEntries<T extends JournalEntry>(list: T[]): { month: string; entries: T[] }[] {
  const groups: { month: string; entries: T[] }[] = [];
  for (const entry of sortEntries(list)) {
    const d = dateFromKey(entry.data.date);
    const month = d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : 'Undated';
    const last = groups[groups.length - 1];
    if (last && last.month === month) last.entries.push(entry);
    else groups.push({ month, entries: [entry] });
  }
  return groups;
}

/** Every word an entry could be found by. */
export function entryWords(kind: JournalKind, d: JournalEntryData, names: Names = {}): string {
  return [
    entryTitle(kind, d, names),
    d.text,
    d.feelings,
    d.trigger,
    d.pattern,
    d.integration,
    d.deityName,
    d.acts.map((a) => choiceLabel(DEVOTION_ACTS, a)).join(' '),
    d.offerings.join(' '),
    d.offered,
    d.response,
    d.signs,
    d.prayer,
    d.people.map((id) => names.people?.[id] ?? '').join(' '),
    choiceLabel(ANCESTOR_TOPICS, d.about),
    d.recipe,
    choiceLabel(OMEN_KINDS, d.seen),
    d.what,
    d.where,
    d.meaning,
    d.outcome !== 'waiting' ? outcomeLabel(d.outcome) : '',
    d.outcomeNote,
    d.tags.join(' '),
    d.links.map((l) => l.title).join(' '),
    d.moonPhase,
    d.moonSign,
    d.hour,
  ]
    .join(' ')
    .toLowerCase();
}

/** Entries matching every word of a search (any field, tag, name or moon). */
export function searchEntries<T extends JournalEntry>(kind: JournalKind, list: T[], query: string, names: Names = {}): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return list;
  return list.filter((e) => {
    const hay = entryWords(kind, e.data, names);
    return words.every((w) => hay.includes(w));
  });
}

/** Entries carrying a tag. */
export const withTag = <T extends JournalEntry>(list: T[], tag: string): T[] => list.filter((e) => e.data.tags.includes(tag));

/** Tags by how often they're used, most first; ties alphabetical. */
export function tagCounts(list: JournalEntry[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of list) for (const t of new Set(e.data.tags)) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Add tags typed as a list ("grief, mother; anger") to the ones there. */
export function withTags(list: string[], typed: string): string[] {
  let next = list;
  for (const t of parseSymbols(typed)) next = addSymbol(next, t);
  return next;
}

/** The line under a journal on the Grimoire's contents or the journals hub. */
export function shelfLine(kind: JournalKind, list: JournalEntry[], names: Names = {}): string {
  const def = journalDef(kind);
  if (!list.length) return def.intro.split('. ')[0] + '.';
  const last = sortEntries(list)[0];
  return `${list.length} ${list.length === 1 ? def.noun : def.nouns} · last: ${entryTitle(kind, last.data, names)}, ${dayLabel(last.data.date)}`;
}

// ---------------------------------------------------------------------------
// Links

/** Add a link unless it's already there. */
export function withLink(links: JournalLink[], link: JournalLink): JournalLink[] {
  return links.some((l) => l.type === link.type && l.id === link.id) ? links : [...links, link];
}
export const withoutLink = (links: JournalLink[], link: Pick<JournalLink, 'type' | 'id'>) => links.filter((l) => !(l.type === link.type && l.id === link.id));

/** Entries (of every journal) that link to a Grimoire page or a dream: the backlinks shown on it. */
export function linkingTo<T extends JournalEntry>(byKind: Partial<Record<JournalKind, T[]>>, type: JournalLink['type'], id: string): { kind: JournalKind; entry: T }[] {
  const out: { kind: JournalKind; entry: T }[] = [];
  for (const kind of JOURNAL_KINDS) for (const entry of byKind[kind] ?? []) if (entry.data.links.some((l) => l.type === type && l.id === id)) out.push({ kind, entry });
  return out;
}

// ---------------------------------------------------------------------------
// Deity & spirit

export type DeityChoice = { key: string; name: string; note: string };

/** Deities to choose from: your own first (patron, dedicated, exploring), then the Living Library's. */
export function deityChoices(mine: { key: string | null; name: string; level: string }[], library: { key: string; name: string; pantheon?: string }[]): DeityChoice[] {
  const out: DeityChoice[] = mine.map((d) => ({ key: d.key ?? '', name: d.name, note: d.level === 'patron' ? 'Your patron' : d.level === 'dedicated' ? 'Dedicated' : 'Exploring' }));
  const kept = new Set(out.map((d) => d.key).filter(Boolean));
  for (const d of library) if (!kept.has(d.key)) out.push({ key: d.key, name: d.name, note: d.pantheon ?? '' });
  return out;
}

/** The entries for one deity (by Library key, else by name). */
export function entriesFor<T extends JournalEntry>(list: T[], key: string, name = ''): T[] {
  return list.filter((e) => (key ? e.data.deityKey === key : !e.data.deityKey && e.data.deityName.toLowerCase() === name.trim().toLowerCase()));
}

/** Each deity written about, with how many entries and the last, most recent first. */
export function deityLog(list: JournalEntry[]): { key: string; name: string; count: number; last: string; offerings: number }[] {
  const map = new Map<string, { key: string; name: string; count: number; last: string; offerings: number }>();
  for (const e of list) {
    const id = e.data.deityKey || `name:${e.data.deityName.toLowerCase()}`;
    const have = map.get(id) ?? { key: e.data.deityKey, name: e.data.deityName || 'Unnamed', count: 0, last: '', offerings: 0 };
    have.count += 1;
    if (e.data.date > have.last) have.last = e.data.date;
    if (e.data.acts.includes('offering') || e.data.offerings.length) have.offerings += 1;
    map.set(id, have);
  }
  return [...map.values()].sort((a, b) => (a.last === b.last ? a.name.localeCompare(b.name) : a.last < b.last ? 1 : -1));
}

// ---------------------------------------------------------------------------
// Ancestors

/** Entries about one of your people. */
export const entriesAbout = <T extends JournalEntry>(list: T[], personId: string): T[] => list.filter((e) => e.data.people.includes(personId));

type AltarLike = { id: string; name?: string; altar_data?: { objects?: SavedObject[] } | null; objects?: SavedObject[] };

/**
 * Photos in the ancestor frames on your altars that are linked to one of
 * your people (lib/altar/frame.ts keeps `{ photo, aged }` in
 * livingState.app.frame and the link in livingState.app.ancestor), to show
 * beside their name. Nothing is copied: the photo stays on the altar.
 */
export function framesFor(altars: AltarLike[], ancestorId: string): { photo: string; aged: boolean; altarId: string; altarName: string }[] {
  const out: { photo: string; aged: boolean; altarId: string; altarName: string }[] = [];
  for (const altar of altars) {
    for (const object of altar.objects ?? altar.altar_data?.objects ?? []) {
      if (!object || object.type !== 'tool' || object.tool !== 'ancestor-frame') continue;
      const app = appStateOf(object);
      const linked = app.ancestor as { id?: string } | undefined;
      const frame = (app.frame && typeof app.frame === 'object' ? app.frame : {}) as { photo?: unknown; aged?: unknown };
      if (linked?.id === ancestorId && typeof frame.photo === 'string' && frame.photo) {
        out.push({ photo: frame.photo, aged: frame.aged === true, altarId: altar.id, altarName: altar.name || 'Your altar' });
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Omens & signs

/** Signs still waiting whose look-back day has come, oldest first. */
export function omensToCheck<T extends JournalEntry>(list: T[], now: Date): T[] {
  const today = localDateKey(now);
  return list.filter((e) => e.data.outcome === 'waiting' && !!e.data.checkOn && e.data.checkOn <= today).sort((a, b) => (a.data.checkOn < b.data.checkOn ? -1 : 1));
}

/** Look-back choices for a new sign, from its day. */
export function checkOnChoices(date: string): { label: string; value: string }[] {
  const day = dateFromKey(date) ?? new Date();
  const at = (days: number) => localDateKey(new Date(day.getFullYear(), day.getMonth(), day.getDate() + days));
  return [
    { label: 'In a week', value: at(7) },
    { label: 'In a moon', value: at(29) },
    { label: 'In three months', value: at(91) },
    { label: 'No look-back', value: '' },
  ];
}

/** How the signs you've looked back on turned out. */
export function outcomeCounts(list: JournalEntry[]): { value: OmenOutcome; label: string; count: number }[] {
  return OUTCOMES.map((o) => ({ ...o, count: list.filter((e) => e.data.outcome === o.value).length })).filter((o) => o.count > 0);
}

/** Words in what was seen that match a name in a reference (a dream symbol, a Library entry): for "places to start". */
export function matchingNames<T>(text: string, items: T[], namesOf: (item: T) => string[], max = 4): T[] {
  const hay = ` ${text.toLowerCase().replace(/[^a-z0-9' -]+/g, ' ')} `;
  const out: T[] = [];
  for (const item of items) {
    if (out.length >= max) break;
    if (namesOf(item).some((n) => !!n && (hay.includes(` ${n.toLowerCase()} `) || (n.length > 3 && hay.includes(` ${n.toLowerCase()}s `))))) out.push(item);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Prompts

export type JournalPrompt = { id: string; text: string; group: string };

/** Said wherever shadow work is: honest about what this is and isn't. */
export const SHADOW_NOTE =
  'Shadow work here means gentle, reflective journalling: noticing what stirs you, without judging it. It isn’t therapy and can’t replace it. If something comes up that feels too big to hold alone, a counsellor or therapist can help you with it, and if you are in crisis, the Support page lists people you can talk to now. Stop whenever you need to.';

/** A short note on where shadow work comes from (modern, after Jung). */
export const SHADOW_SOURCE =
  'The idea of a “shadow”, the parts of ourselves we push out of sight, comes from the psychologist Carl Jung in the early twentieth century. Journalling it as a spiritual practice is modern, popular in witchcraft since the 2010s, and often kept on the waning and dark moon.';

export const PROMPTS: Record<JournalKind, JournalPrompt[]> = {
  shadow: [
    { id: 'sh-notice-1', group: 'Noticing', text: 'What stirred you today more than it seemed to deserve? Describe it without judging yourself for it.' },
    { id: 'sh-notice-2', group: 'Noticing', text: 'Where in your body do you feel it when you are hurt, angry or ashamed? What does it feel like there?' },
    { id: 'sh-notice-3', group: 'Noticing', text: 'What is a feeling you rarely let yourself show? What do you imagine would happen if you did?' },
    { id: 'sh-notice-4', group: 'Noticing', text: 'What did you need today that you didn’t ask for?' },
    { id: 'sh-trigger-1', group: 'Triggers', text: 'Think of someone who irritates you. What, exactly, do they do? Is there any of that in you, or something you were never allowed to be?' },
    { id: 'sh-trigger-2', group: 'Triggers', text: 'A moment this week you reacted more strongly than you meant to: what happened just before it?' },
    { id: 'sh-trigger-3', group: 'Triggers', text: 'Whose approval do you still find yourself working for? What would it mean to put that down?' },
    { id: 'sh-trigger-4', group: 'Triggers', text: 'Which words, said to you, sting the most? Who said them first?' },
    { id: 'sh-pattern-1', group: 'Patterns', text: 'What keeps happening in your life, with different people or in different places? What part do you play in it?' },
    { id: 'sh-pattern-2', group: 'Patterns', text: 'What were you praised for as a child, and what were you told off for? How do both still show up?' },
    { id: 'sh-pattern-3', group: 'Patterns', text: 'What do you do when you feel unsafe: go quiet, take charge, make everyone laugh, leave? When did that begin?' },
    { id: 'sh-pattern-4', group: 'Patterns', text: 'What do you envy in others? Envy often points at something you want but haven’t allowed yourself.' },
    { id: 'sh-whole-1', group: 'Integration', text: 'Write a few kind words to the part of you that you find hardest to like.' },
    { id: 'sh-whole-2', group: 'Integration', text: 'What gift might be hidden in a trait you were taught to hide: your anger, your softness, your ambition, your need?' },
    { id: 'sh-whole-3', group: 'Integration', text: 'What would you say to a friend who told you what you have written here?' },
    { id: 'sh-whole-4', group: 'Integration', text: 'One small thing you could do differently the next time this comes up.' },
    { id: 'sh-moon-1', group: 'By the moon', text: 'The moon is waning: what are you ready to let go of, or at least to loosen your grip on?' },
    { id: 'sh-moon-2', group: 'By the moon', text: 'In the dark of the moon: what have you been avoiding looking at? Just name it; you needn’t solve it.' },
    { id: 'sh-moon-3', group: 'By the moon', text: 'The moon is full and everything shows: what came to light this month that you would rather not have seen?' },
  ],
  devotion: [
    { id: 'dv-1', group: 'Devotion', text: 'What drew you to them in the first place? Has that changed?' },
    { id: 'dv-2', group: 'Devotion', text: 'What did you offer today, and why that?' },
    { id: 'dv-3', group: 'Devotion', text: 'If they spoke to you plainly, what do you think they would ask of you this month?' },
    { id: 'dv-4', group: 'Devotion', text: 'What have you read about them lately, from older sources or from people who honour them now?' },
    { id: 'dv-5', group: 'Devotion', text: 'A quiet moment in their presence: what did you notice, outside and inside?' },
    { id: 'dv-6', group: 'Devotion', text: 'Write a short prayer of thanks in your own words.' },
  ],
  ancestors: [
    { id: 'an-1', group: 'Remembering', text: 'A dish someone in your family always made. Who made it, and how did the kitchen smell?' },
    { id: 'an-2', group: 'Remembering', text: 'A story told about someone you never met. Who told it, and why do you think it was kept?' },
    { id: 'an-3', group: 'Remembering', text: 'Something you do the way they did: a saying, a habit, the way you fold a cloth.' },
    { id: 'an-4', group: 'Remembering', text: 'What would you want to tell them about your life now?' },
    { id: 'an-5', group: 'Remembering', text: 'Your ancestors include the ones you would not have chosen. Is there anything you want to leave with them, or refuse to carry on?' },
    { id: 'an-6', group: 'Remembering', text: 'The places they came from: what do you know, and what would you like to find out?' },
  ],
  omens: [
    { id: 'om-1', group: 'Signs', text: 'What caught your attention today and wouldn’t let go?' },
    { id: 'om-2', group: 'Signs', text: 'Was there a question on your mind when you saw it?' },
    { id: 'om-3', group: 'Signs', text: 'What does this creature, number or thing mean to you, before any book says?' },
    { id: 'om-4', group: 'Signs', text: 'Look back over your signs: has anything come round more than once?' },
  ],
};

export const promptById = (kind: JournalKind, id: string) => PROMPTS[kind].find((p) => p.id === id) ?? null;

const dayNumber = (now: Date) => Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);

/** A prompt for today: the same all day, a different one tomorrow; shadow prompts follow the moon when it is waning, dark or full. */
export function promptOfDay(kind: JournalKind, now: Date): JournalPrompt {
  const list = PROMPTS[kind];
  if (kind === 'shadow') {
    const phase = moonState(now).name;
    const moonly = phase === 'New Moon' || phase === 'Waning Crescent' ? 'sh-moon-2' : phase === 'Full Moon' ? 'sh-moon-3' : phase === 'Last Quarter' || phase === 'Waning Gibbous' ? 'sh-moon-1' : null;
    if (moonly && dayNumber(now) % 2 === 0) return promptById(kind, moonly)!;
    const rest = list.filter((p) => p.group !== 'By the moon');
    return rest[dayNumber(now) % rest.length];
  }
  return list[dayNumber(now) % list.length];
}

// ---------------------------------------------------------------------------
// Today

export type TodayJournalPrompt = { kind: JournalKind; title: string; line: string; action: string; params?: Record<string, string> };

/**
 * One gentle line on Today, when there's a reason for it: a sign to look
 * back on, a day for the dead, a kept deity's holy day, or the waning and
 * dark moon for shadow work. Otherwise nothing.
 */
export function todayJournalPrompt(
  now: Date,
  ctx: { omensDue?: { id: string; title: string }[]; ancestorDay?: string | null; deityDay?: { name: string; key: string } | null },
): TodayJournalPrompt | null {
  const due = ctx.omensDue ?? [];
  if (due.length) {
    return {
      kind: 'omens',
      title: 'Did it come to pass?',
      line: due.length === 1 ? `You asked to look back on “${due[0].title}”.` : `${due.length} signs are waiting for you to look back on them.`,
      action: 'Look back',
    };
  }
  if (ctx.ancestorDay) {
    return { kind: 'ancestors', title: ctx.ancestorDay, line: promptOfDay('ancestors', now).text, action: 'Write in your ancestor journal' };
  }
  if (ctx.deityDay) {
    return {
      kind: 'devotion',
      title: ctx.deityDay.name,
      line: 'A day to keep with them. If you make an offering or say a prayer, you can note it in your deity journal.',
      action: 'Write in your deity journal',
      params: ctx.deityDay.key ? { deity: ctx.deityDay.key } : undefined,
    };
  }
  const phase = moonState(now).name;
  if (phase === 'Waning Crescent' || phase === 'New Moon') {
    const prompt = promptOfDay('shadow', now);
    return { kind: 'shadow', title: phase === 'New Moon' ? 'The dark of the moon' : 'The waning moon', line: prompt.text, action: 'Write, if you would like to', params: { prompt: prompt.id } };
  }
  return null;
}
