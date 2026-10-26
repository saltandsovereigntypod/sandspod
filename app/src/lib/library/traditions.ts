// "My path": the traditions someone keeps, used to put their own traditions
// first in the Living Library. By default it follows the calendars switched
// on in Settings → Calendar & holidays; Settings → Living Library → My path
// can choose them by hand or turn the sections off. A hidden calendar (the
// Christian one) is gone here too. Pure, so it can be tested.

import { hiddenTraditions, holidayChoice, TRADITIONS } from '../holidays.ts';
import type { LibraryEntry, TraditionalRecord } from './types.ts';

export type PathTradition = { id: string; name: string };

/** Every tradition an entry can belong to, as named in the Library's `Traditions` field. */
export const PATH_TRADITIONS: PathTradition[] = [
  { id: 'wheel', name: 'Wheel of the Year' },
  // Modern Wicca keeps the Wheel's sabbats and the full-moon esbats. Library
  // entries describe Wiccan use under the Wheel of the Year, so choosing it
  // shapes premade rituals and spells rather than adding a Library section.
  { id: 'wicca', name: 'Wicca' },
  { id: 'celtic', name: 'Celtic' },
  { id: 'norse', name: 'Norse' },
  { id: 'hellenic', name: 'Hellenic' },
  { id: 'roman', name: 'Roman' },
  { id: 'slavic', name: 'Slavic' },
  { id: 'christian', name: 'Christian' },
  { id: 'egyptian', name: 'Egyptian' },
  { id: 'hindu', name: 'Hindu' },
  // Traditions with gods in the Library but no calendar of their own yet.
  { id: 'mesopotamian', name: 'Mesopotamian' },
  { id: 'canaanite', name: 'Canaanite' },
  { id: 'baltic', name: 'Baltic' },
  { id: 'finnish', name: 'Finnish' },
  { id: 'anglo-saxon', name: 'Anglo-Saxon' },
  { id: 'etruscan', name: 'Etruscan' },
  { id: 'basque', name: 'Basque' },
  { id: 'shinto', name: 'Shinto' },
];

// Calendars that map onto a tradition of the same family.
const CALENDAR_TO_PATH: Record<string, string> = { wheel_south: 'wheel', hellenic_monthly: 'hellenic' };
// A deity's pantheon when the entry has no `Traditions` field.
const PANTHEON_TO_PATH: Record<string, string> = { greek: 'hellenic', roman: 'roman', norse: 'norse', celtic: 'celtic', welsh: 'celtic', irish: 'celtic', gaulish: 'celtic', slavic: 'slavic', egyptian: 'egyptian', hindu: 'hindu', wiccan: 'wicca', mesopotamian: 'mesopotamian', canaanite: 'canaanite', baltic: 'baltic', finnish: 'finnish', 'anglo-saxon': 'anglo-saxon', etruscan: 'etruscan', basque: 'basque', shinto: 'shinto' };

const byName = new Map(PATH_TRADITIONS.map((t) => [t.name.toLowerCase(), t.id]));
const known = new Set(PATH_TRADITIONS.map((t) => t.id));

export type PathMode = 'calendars' | 'custom' | 'off';

export type MyPath = {
  mode: PathMode;
  /** Tradition ids, in PATH_TRADITIONS order. Empty when off. */
  traditions: string[];
  /** Hide deities from traditions outside the path. */
  hideOtherDeities: boolean;
  /** Traditions hidden from view entirely (Settings → Calendar → Hide). */
  hidden: string[];
};

type SettingsLike = Record<string, unknown> | null | undefined;

const csv = (value: unknown) =>
  typeof value === 'string' ? value.split(',').map((id) => id.trim()).filter(Boolean) : [];

export function pathMode(settings: SettingsLike): PathMode {
  const mode = settings?.library_path_mode;
  return mode === 'custom' || mode === 'off' ? mode : 'calendars';
}

/** The traditions the calendars stand for (Wheel south counts as the Wheel, and so on). */
export function calendarPath(settings: SettingsLike): string[] {
  const ids = holidayChoice(settings).traditions.map((id) => CALENDAR_TO_PATH[id] ?? id);
  return PATH_TRADITIONS.map((t) => t.id).filter((id) => ids.includes(id));
}

/**
 * Traditions that never sort the Library into a My Path section: modern
 * Pagan practice (the Wheel of the Year) uses nearly every herb, stone and
 * candle, so a section for it would just hold everything. Entries still say
 * how it uses them under In the Traditions.
 */
export const UNSECTIONED_TRADITIONS = ['wheel'];

/** The traditions someone can put on their path in Settings → Living Library. */
export const PATH_CHOICES = PATH_TRADITIONS.filter((t) => !UNSECTIONED_TRADITIONS.includes(t.id));

export function myPath(settings: SettingsLike): MyPath {
  const mode = pathMode(settings);
  const hidden = hiddenTraditions(settings);
  const chosen = mode === 'off' ? [] : mode === 'custom' ? csv(settings?.library_path) : calendarPath(settings);
  return {
    mode,
    traditions: PATH_CHOICES.map((t) => t.id).filter((id) => chosen.includes(id) && !hidden.includes(id)),
    hideOtherDeities: mode !== 'off' && settings?.library_path_other_deities === 'hide',
    hidden,
  };
}

/**
 * The settings Today reads its traditions from. Someone who chose their path
 * (Settings → Living Library) but never set up the calendars gets that path's
 * holidays and its way of naming the day, ahead of the Wheel; once they choose
 * calendars in Settings → Calendar, those win.
 */
export function todaySettings<T extends SettingsLike>(settings: T): T {
  if (typeof settings?.calendar_traditions === 'string' || pathMode(settings) !== 'custom') return settings;
  const path = myPath(settings).traditions.map((id) => (id === 'wicca' ? 'wheel' : id));
  const ids = [...new Set([...path, 'wheel'])].filter((id) => TRADITIONS.some((t) => t.id === id));
  return { ...settings, calendar_traditions: ids.join(',') } as T;
}

export const pathName = (id: string) => PATH_TRADITIONS.find((t) => t.id === id)?.name ?? id;

/** The traditions an entry belongs to: its `Traditions` field, else (for a deity) its pantheon. */
export function entryTraditions(record: TraditionalRecord | null | undefined, type?: string): string[] {
  if (!record) return [];
  const listed = typeof record.Traditions === 'string' ? record.Traditions : '';
  const ids = listed
    .split(',')
    .map((name) => byName.get(name.trim().toLowerCase()))
    .filter((id): id is string => !!id);
  if (ids.length || type !== 'deity') return [...new Set(ids)];
  const pantheon = typeof record.Pantheon === 'string' ? record.Pantheon.toLowerCase() : '';
  const match = Object.keys(PANTHEON_TO_PATH).find((key) => pantheon.includes(key));
  return match ? [PANTHEON_TO_PATH[match]] : [];
}

export const inPath = (entry: LibraryEntry, path: MyPath) =>
  entryTraditions(entry.traditional, entry.type).some((id) => path.traditions.includes(id));

/**
 * Whether an entry shows at all. Herbs, crystals, candles and the rest
 * belong to many traditions and always show (a hidden tradition only takes
 * its part out of their notes). A deity whose traditions are all hidden is
 * gone, and with "hide other deities" on, so is any deity outside the path
 * (deities with no listed tradition stay, as do your own My Practice entries).
 */
export function entryVisible(entry: LibraryEntry, path: MyPath): boolean {
  if (entry.type !== 'deity') return true;
  const traditions = entryTraditions(entry.traditional, entry.type);
  if (traditions.length && traditions.every((id) => path.hidden.includes(id)) && !hasOwn(entry)) return false;
  if (!path.hideOtherDeities || !path.traditions.length) return true;
  if (!traditions.length || hasOwn(entry)) return true;
  return traditions.some((id) => path.traditions.includes(id));
}

const hasOwn = (entry: LibraryEntry) => !!entry.myPractice && Object.values(entry.myPractice).some((v) => String(v ?? '').trim());

// Words that name a hidden tradition, for text outside the per-tradition notes.
// Capitalised where the lower-case word means something else (lent, advent);
// "pre-Christian" is about the older religion and stays; St John's wort is a plant.
const HIDDEN_WORDS: Record<string, RegExp> = {
  christian:
    /\b(?<![Pp]re-)(?:[Cc]hristians?|[Cc]hristianity|[Cc]hrist|[Cc]hristmas\w*|[Cc]hurch(?:es|yards?)?|[Ss]aints?|[Ee]aster(?:tide)?|[Cc]andlemas|[Mm]ichaelmas|[Ll]enten|[Mm]arian|[Jj]esus|[Gg]ospels?|[Bb]ibles?|[Bb]iblical|[Ll]iturg\w*|[Mm]onaster(?:y|ies)|[Pp]opes?|[Aa]postles?|[Aa]rchangels?|[Cc]rucifix\w*|[Rr]osar(?:y|ies)|[Pp]entecost|[Ww]hitsun\w*|[Mm]adonna|Lent|Mary|Advent|Epiphany|Annunciation|Assumption|Holy Week|Good Friday|Palm Sunday|All Saints|All Souls)\b|\bS(?:ain)?t\.? (?!John['’]?s[- ][Ww]ort)[A-Z]/,
};

/**
 * A Traditional record with hidden traditions taken out: dropped from
 * `Traditions`, and their parts removed from `TraditionNotes`. Notes are a
 * paragraph per tradition ("Norse: …"), so a hidden tradition's paragraph
 * goes; older single-paragraph notes lose the sentences that name it.
 */
export function withoutHidden(record: TraditionalRecord, hidden: string[]): TraditionalRecord {
  if (!hidden.length) return record;
  const next: TraditionalRecord = { ...record };
  if (typeof record.Traditions === 'string') {
    next.Traditions = record.Traditions.split(',')
      .map((name) => name.trim())
      .filter((name) => name && !hidden.includes(byName.get(name.toLowerCase()) ?? ''))
      .join(', ');
  }
  if (typeof record.TraditionNotes === 'string' && /^[A-Z][^:\n]{1,40}: /m.test(record.TraditionNotes) && record.TraditionNotes.includes('\n\n')) {
    next.TraditionNotes = record.TraditionNotes.split(/\n\s*\n/)
      .filter((paragraph) => {
        const label = /^([^:\n]{1,40}):/.exec(paragraph.trim())?.[1]?.trim().toLowerCase() ?? '';
        return !hidden.includes(byName.get(label) ?? '');
      })
      .join('\n\n')
      .trim();
  } else if (typeof record.TraditionNotes === 'string') {
    const words = hidden.map((id) => HIDDEN_WORDS[id]).filter((re): re is RegExp => !!re);
    next.TraditionNotes = (record.TraditionNotes.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) ?? [])
      .filter((sentence) => !words.some((re) => re.test(sentence)))
      .join('')
      .trim();
  }
  return next;
}

/** Whether a piece of text names a hidden tradition. */
function namesHidden(text: string, words: RegExp[]): boolean {
  return words.some((re) => re.test(text));
}

/** Text with the sentences (or, for a plain list, the items) that name a hidden tradition taken out. */
function scrubText(text: string, words: RegExp[]): string {
  if (!words.length || !namesHidden(text, words)) return text;
  const isList = !/[.!?](\s|$)/.test(text.trim()) && text.includes(',');
  if (isList) return text.split(',').map((item) => item.trim()).filter((item) => item && !namesHidden(item, words)).join(', ');
  return text
    .split(/(\n\s*\n)/)
    .map((part) =>
      /^\n/.test(part)
        ? part
        : (part.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) ?? []).filter((sentence) => !namesHidden(sentence, words)).join('').trim(),
    )
    .join('')
    .replace(/(\n\s*\n){2,}/g, '\n\n')
    .trim();
}

function scrubValue(value: unknown, words: RegExp[]): unknown {
  if (typeof value === 'string') return scrubText(value, words);
  if (Array.isArray(value)) return value.filter((item) => typeof item !== 'string' || !namesHidden(item, words)).map((item) => scrubValue(item, words));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrubValue(v, words)]));
  return value;
}

/**
 * The Library as someone with hidden traditions sees it, everywhere in the
 * app: deities that belong only to hidden traditions are gone, and every
 * Traditional field loses what names a hidden tradition (its paragraph in
 * TraditionNotes, its sentences or list items elsewhere). Their own My
 * Practice notes are never changed.
 */
export function hideTraditions<T extends LibraryEntry>(entries: T[], hidden: string[]): T[] {
  if (!hidden.length) return entries;
  const path: MyPath = { mode: 'off', traditions: [], hideOtherDeities: false, hidden };
  const words = hidden.map((id) => HIDDEN_WORDS[id]).filter((re): re is RegExp => !!re);
  return entries
    .filter((entry) => entryVisible(entry, path))
    .map((entry) => {
      if (!entry.traditional) return entry;
      const record = withoutHidden(entry.traditional, hidden);
      const scrubbed = Object.fromEntries(
        Object.entries(record).map(([key, value]) => [key, key === 'Traditions' || key === 'TraditionNotes' ? value : scrubValue(value, words)]),
      ) as TraditionalRecord;
      return { ...entry, traditional: scrubbed };
    });
}

export const isPathTradition = (id: string) => known.has(id);
