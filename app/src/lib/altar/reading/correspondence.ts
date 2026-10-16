// What an altar object (or an ingredient, or a typed name) stands for in the
// Living Library: its element, planet and traditional uses. Shared by the
// workings (jars, sachets, dressings) and the altar reading. Pure: give it the
// Library entries from useLibrary(), or it falls back to the Traditional
// Library alone.

import { normalizeName, splitList, traditionalEntries } from '../../library/model.ts';
import type { LibraryEntry } from '../../library/types.ts';
import { ingredientLibraryRef, type Ingredient } from '../apothecary.ts';
import { resolveAltarEntry } from '../companion.ts';
import type { SavedObject } from '../types.ts';

export const ELEMENTS = ['Fire', 'Water', 'Air', 'Earth'] as const;
export type Element = (typeof ELEMENTS)[number];
export type ElementOrSpirit = Element | 'Spirit';

/** The seven classical planets, in weekday order from Sunday. */
export const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
export type Planet = (typeof PLANETS)[number];

/** Each planet's day of the week (0 = Sunday), the traditional planetary days. */
export const PLANET_DAY: Record<Planet, number> = { Sun: 0, Moon: 1, Mars: 2, Mercury: 3, Jupiter: 4, Venus: 5, Saturn: 6 };
export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const planetOfWeekday = (day: number): Planet => PLANETS[((day % 7) + 7) % 7];

/** "the Sun", "the Moon", "Mars". */
export const planetName = (planet: Planet) => (planet === 'Sun' || planet === 'Moon' ? `the ${planet}` : planet);

/** The possessive the app writes: "the Sun’s", "Mars’s". */
export const planetPossessive = (planet: Planet) => (planet === 'Sun' || planet === 'Moon' ? `the ${planet}’s` : `${planet}’s`);

export type Correspondence = {
  /** The Library entry it was read from, if any. */
  entry: LibraryEntry | null;
  name: string;
  element: ElementOrSpirit | null;
  planet: Planet | null;
  /** Traditional uses, lower case, most important first. */
  uses: string[];
};

const USE_KEYS = ['Uses', 'Domains', 'Purpose', 'UsedFor', 'TraditionallyUsedFor', 'BestFor'];

const asText = (value: unknown) => (typeof value === 'string' ? value : Array.isArray(value) ? value.map(String).join(', ') : '');

function firstOf<T extends string>(raw: string, allowed: readonly T[]): T | null {
  // "Fire, Water" or "Fire/Earth": the first one named.
  for (const part of raw.split(/[,/;&]| and /i)) {
    const word = part.trim().toLowerCase();
    const hit = allowed.find((a) => a.toLowerCase() === word);
    if (hit) return hit;
  }
  return null;
}

/** An entry's correspondences, My Practice notes over the Traditional Library. */
export function correspondenceOf(entry: LibraryEntry | null, fallbackName = ''): Correspondence {
  if (!entry) return { entry: null, name: fallbackName, element: null, planet: null, uses: [] };
  const source = { ...(entry.traditional ?? {}), ...(entry.myPractice ?? {}) } as Record<string, unknown>;
  const element = firstOf(asText(source.Element), [...ELEMENTS, 'Spirit'] as const);
  const planet = firstOf(asText(source.Planet), PLANETS);
  const uses: string[] = [];
  for (const key of USE_KEYS) {
    for (const use of splitList(asText(source[key]))) {
      const clean = use.trim().toLowerCase();
      if (clean && clean.length <= 32 && !uses.includes(clean)) uses.push(clean);
    }
  }
  for (const tag of entry.tags) {
    const clean = tag.toLowerCase();
    if (!uses.includes(clean) && !ELEMENTS.some((e) => e.toLowerCase() === clean) && clean !== 'solar' && clean !== 'lunar') uses.push(clean);
  }
  return { entry, name: entry.name, element, planet, uses };
}

let fallback: LibraryEntry[] | null = null;
/** The entries to read from: those given, or the Traditional Library. */
export function libraryOr(entries?: LibraryEntry[] | null): LibraryEntry[] {
  if (entries && entries.length) return entries;
  fallback = fallback ?? traditionalEntries();
  return fallback;
}

/** Names compared loosely: case, punctuation and spacing aside ("St. John’s Wort" = "st_johns_wort"). */
const loose = (value: unknown) =>
  normalizeName(value)
    .replace(/[’'.]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Find an entry by a name someone typed or picked ("Rose oil", "lavender", "Red candle"). */
export function entryByName(name: string, entries?: LibraryEntry[] | null, type?: string): LibraryEntry | null {
  const pool = libraryOr(entries);
  const wanted = loose(name)
    .replace(/\b(essential )?oil\b/, '')
    .replace(/\b(sprig|loose|incense|chips|tumbled|point|cluster|statue|dried|fresh|powder)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!wanted) return null;
  const scoped = type ? pool.filter((e) => e.type === type) : pool;
  return (
    scoped.find((e) => loose(e.name) === wanted) ??
    scoped.find((e) => loose(e.id.split(':')[2] ?? '') === wanted) ??
    scoped.find((e) => loose(e.name).startsWith(`${wanted} `)) ??
    null
  );
}

/** An altar object's correspondences. A crafted working reads as all its ingredients together. */
export function objectCorrespondence(object: SavedObject, entries?: LibraryEntry[] | null): Correspondence {
  const pool = libraryOr(entries);
  const entry = resolveAltarEntry(pool, object);
  if (entry) return correspondenceOf(entry, object.label || '');
  if (object.type === 'oil' && object.herb) return correspondenceOf(entryByName(String(object.herb), pool, 'herb'), object.label || '');
  return correspondenceOf(entryByName(String(object.label || ''), pool), object.label || '');
}

/** One ingredient of a working (from apothecaryIngredients), as the Library knows it. */
export function ingredientCorrespondence(ingredient: Ingredient, entries?: LibraryEntry[] | null): Correspondence {
  const pool = libraryOr(entries);
  const ref = ingredientLibraryRef(ingredient);
  const typed = ref.libraryType === 'candle' ? 'candle' : ['herb', 'crystal', 'tool', 'vessel', 'deity'].includes(ref.libraryType) ? ref.libraryType : undefined;
  const entry = entryByName(ref.libraryName, pool, typed) ?? entryByName(ingredient.label, pool);
  return correspondenceOf(entry, ingredient.label);
}

/** The ingredients saved on a crafted object. */
export function objectIngredients(object: SavedObject): Ingredient[] {
  try {
    const list = JSON.parse(String(object.apothecaryIngredients || '[]'));
    return Array.isArray(list) ? list.filter((i) => i && typeof i.label === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Everything an object brings: itself, or for a crafted working (a spell jar,
 * a sachet) each ingredient in it.
 */
export function objectCorrespondences(object: SavedObject, entries?: LibraryEntry[] | null): Correspondence[] {
  if (object.type === 'apothecary') {
    const parts = objectIngredients(object).map((i) => ingredientCorrespondence(i, entries)).filter((c) => c.entry);
    if (parts.length) return parts;
  }
  return [objectCorrespondence(object, entries)];
}

/** Count things by key, most first. */
export function tally<T extends string>(values: (T | null | undefined)[]): { key: T; count: number }[] {
  const counts = new Map<T, number>();
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

/** A list in plain English: "a, b and c". */
export function listing(items: string[], joiner = 'and'): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} ${joiner} ${items[items.length - 1]}`;
}

/** The object's stable id on the altar (the website's altarObjectId). */
export const objectUid = (object: SavedObject) => String(object.altarObjectId || object.instanceId || '');

/** A local calendar day, "2026-10-16". */
export function dayKey(date: Date | string | number): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Whole local days from a to b (b later is positive). */
export function daysBetween(a: Date | string | number, b: Date | string | number): number {
  const start = new Date(a);
  const end = new Date(b);
  const s = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const e = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((e - s) / 86_400_000);
}
