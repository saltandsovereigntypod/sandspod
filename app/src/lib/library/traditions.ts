// "My path": the traditions someone keeps, used to put their own traditions
// first in the Living Library. By default it follows the calendars switched
// on in Settings → Calendar & holidays; Settings → Living Library → My path
// can choose them by hand or turn the sections off. A hidden calendar (the
// Christian one) is gone here too. Pure, so it can be tested.

import { hiddenTraditions, holidayChoice } from '../holidays.ts';
import type { LibraryEntry, TraditionalRecord } from './types.ts';

export type PathTradition = { id: string; name: string };

/** Every tradition an entry can belong to, as named in the Library's `Traditions` field. */
export const PATH_TRADITIONS: PathTradition[] = [
  { id: 'wheel', name: 'Wheel of the Year' },
  { id: 'celtic', name: 'Celtic' },
  { id: 'norse', name: 'Norse' },
  { id: 'hellenic', name: 'Hellenic' },
  { id: 'roman', name: 'Roman' },
  { id: 'slavic', name: 'Slavic' },
  { id: 'christian', name: 'Christian' },
  { id: 'egyptian', name: 'Egyptian' },
  { id: 'hindu', name: 'Hindu' },
];

// Calendars that map onto a tradition of the same family.
const CALENDAR_TO_PATH: Record<string, string> = { wheel_south: 'wheel', hellenic_monthly: 'hellenic' };
// A deity's pantheon when the entry has no `Traditions` field.
const PANTHEON_TO_PATH: Record<string, string> = { greek: 'hellenic', roman: 'roman', norse: 'norse', celtic: 'celtic', welsh: 'celtic', irish: 'celtic', gaulish: 'celtic', slavic: 'slavic', egyptian: 'egyptian', hindu: 'hindu' };

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

export function myPath(settings: SettingsLike): MyPath {
  const mode = pathMode(settings);
  const hidden = hiddenTraditions(settings);
  const chosen = mode === 'off' ? [] : mode === 'custom' ? csv(settings?.library_path) : calendarPath(settings);
  return {
    mode,
    traditions: PATH_TRADITIONS.map((t) => t.id).filter((id) => chosen.includes(id) && !hidden.includes(id)),
    hideOtherDeities: mode !== 'off' && settings?.library_path_other_deities === 'hide',
    hidden,
  };
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
 * Whether an entry shows at all: a deity whose traditions are all hidden is
 * gone, and with "hide other deities" on, so is any deity outside the path
 * (deities with no listed tradition stay, as do your own My Practice entries).
 */
export function entryVisible(entry: LibraryEntry, path: MyPath): boolean {
  const traditions = entryTraditions(entry.traditional, entry.type);
  if (traditions.length && traditions.every((id) => path.hidden.includes(id)) && !hasOwn(entry)) return false;
  if (entry.type !== 'deity' || !path.hideOtherDeities || !path.traditions.length) return true;
  if (!traditions.length || hasOwn(entry)) return true;
  return traditions.some((id) => path.traditions.includes(id));
}

const hasOwn = (entry: LibraryEntry) => !!entry.myPractice && Object.values(entry.myPractice).some((v) => String(v ?? '').trim());

const HIDDEN_WORDS: Record<string, RegExp> = {
  christian: /\b(christians?|christianity|christ|christmas|church(es)?|saints?|easter|advent|candlemas|lent|lenten|marian|mary|jesus|gospels?|bible|biblical|michaelmas|liturg\w*|priests?|monks?|monaster\w*)\b/i,
};

/**
 * A Traditional record with hidden traditions taken out: dropped from
 * `Traditions`, and the sentences about them removed from `TraditionNotes`.
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
  if (typeof record.TraditionNotes === 'string') {
    const words = hidden.map((id) => HIDDEN_WORDS[id]).filter((re): re is RegExp => !!re);
    next.TraditionNotes = (record.TraditionNotes.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) ?? [])
      .filter((sentence) => !words.some((re) => re.test(sentence)))
      .join('')
      .trim();
  }
  return next;
}

export const isPathTradition = (id: string) => known.has(id);
