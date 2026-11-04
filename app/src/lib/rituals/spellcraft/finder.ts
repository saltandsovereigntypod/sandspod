// The correspondence finder: choose an intention, or look by a herb, stone,
// colour, planet, day or moon phase, and see what the Living Library (and your
// own correspondences) holds for it. What you pick goes to the spell builder
// as its ingredients, with the intention and a time that suits it. Pure: the
// Library and your notes come in as data.

import { PLANET_GUIDES } from '../../astro/planetGuides.ts';
import type { Classical } from '../../astro/signs.ts';
import { TIMING_INTENTS, type TimingIntent } from '../../craft/cosmic/timing.ts';
import { pairNames, type MyCorrespondence } from '../../craft/eclectic/correspondences.ts';
import { TRADITIONAL_LIBRARY } from '../../library/traditionalData.ts';
import type { TraditionalLibraryData, TraditionalRecord } from '../../library/types.ts';
import type { MoonTide } from '../planner.ts';
import type { Ingredient } from '../types.ts';
import { intentWords, spellIntent, suggestionOf, TIDE_LABELS, WEEKDAY_OF, type Suggestion, type SuggestType } from './suggest.ts';

export const FINDER_TYPES: { type: SuggestType; label: string }[] = [
  { type: 'herb', label: 'Herbs' },
  { type: 'crystal', label: 'Stones' },
  { type: 'candle', label: 'Candle colours' },
];

export const FINDER_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;
export const FINDER_COLOURS = ['White', 'Black', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Silver', 'Gold', 'Brown'] as const;
export const FINDER_TIDES: MoonTide[] = ['new', 'waxing', 'full', 'waning'];

/** What to look for. Every part given must match. */
export type FinderQuery = {
  /** A timing-advisor intent key ("protection"). */
  intent?: string | null;
  /** Words: a herb, a stone, a use ("rosemary", "sleep"). */
  text?: string;
  planet?: string | null;
  /** A weekday ("Friday"): its planet's things. */
  day?: string | null;
  colour?: string | null;
  /** The things for work suited to this moon. */
  moon?: MoonTide | null;
};

/** One of your own correspondences, as the finder shows it. */
export type MineHit = { id: string; name: string; meaning: string; ref: string | null; why: string };

export type FinderHit = Suggestion & {
  score: number;
  /** Your own notes on this entry (My correspondences linked to it), in short. */
  mine: string[];
};

export type FinderResult = Record<SuggestType, FinderHit[]> & {
  /** Your correspondences that match but aren't Library entries the finder lists. */
  mine: MineHit[];
  /** True when nothing was asked yet. */
  empty: boolean;
};

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const text = (r: TraditionalRecord, k: string): string => (typeof r[k] === 'string' ? (r[k] as string) : '');
const tagsOf = (r: TraditionalRecord): string[] => (Array.isArray(r.tags) ? (r.tags as unknown[]).map((t) => String(t).toLowerCase()) : []);

/** The planet of a weekday ("Friday" → "Venus"), or null. */
export function planetOfDay(day: string | null | undefined): string | null {
  const want = fold(day ?? '');
  return Object.entries(WEEKDAY_OF).find(([, d]) => fold(d) === want)?.[0] ?? null;
}

/** The intents whose best moon is this one: new for beginnings, waning for banishing… */
export function intentsForTide(tide: MoonTide): TimingIntent[] {
  return TIMING_INTENTS.filter((i) => i.tides[0] === tide);
}

/** Your entry is about this Library entry ("traditional:herb:basil" ↔ "traditional/herb/basil"). */
const entryIdOf = (ref: string) => ref.replace(/\//g, ':');

function records(library: TraditionalLibraryData, type: SuggestType): [string, TraditionalRecord][] {
  const group = (library[type] ?? {}) as Record<string, TraditionalRecord>;
  return Object.entries(group).filter(([key, r]) => !key.startsWith('_') && r && typeof r === 'object' && typeof r.DisplayName === 'string' && typeof r.Uses === 'string');
}

/** Does a list of words hit this text? The words that did. */
const hitsIn = (haystack: string, tags: string[], words: string[]) => words.filter((w) => tags.includes(w) || haystack.includes(w));

export function isEmptyQuery(q: FinderQuery): boolean {
  return !q.intent && !(q.text ?? '').trim() && !q.planet && !q.day && !q.colour && !q.moon;
}

/**
 * Everything that matches, best first, by kind. Dangerous plants only appear
 * when asked for by name (so their warning can be read), and never chosen
 * for you.
 */
export function findCorrespondences(
  q: FinderQuery,
  options: { library?: TraditionalLibraryData; mine?: { id: string; data: MyCorrespondence }[]; limit?: number } = {},
): FinderResult {
  const library = options.library ?? TRADITIONAL_LIBRARY;
  const mine = options.mine ?? [];
  const limit = options.limit ?? 12;
  const out: FinderResult = { herb: [], crystal: [], candle: [], mine: [], empty: isEmptyQuery(q) };
  if (out.empty) return out;

  const intent = spellIntent(q.intent);
  const intentW = intent ? intentWords(intent) : [];
  const moonW = q.moon ? [...new Set(intentsForTide(q.moon).flatMap(intentWords))] : [];
  const words = fold(q.text ?? '').split(' ').filter((w) => w.length > 1);
  const planet = q.planet || null;
  const dayPlanet = planetOfDay(q.day);
  const colour = q.colour ? fold(q.colour) : null;

  // Your own words, by the entry they're about, and as matches of their own.
  const notesFor = new Map<string, string[]>();
  for (const { data } of mine) {
    if (data.ref) notesFor.set(data.ref, [...(notesFor.get(data.ref) ?? []), data.meaning.trim() || data.name]);
  }
  const mineText = (c: MyCorrespondence) => fold([c.name, c.meaning, c.element, c.planet, c.day, c.colour, c.pairs].filter(Boolean).join(' '));
  const mineMatches = (c: MyCorrespondence): string[] | null => {
    const t = mineText(c);
    const why: string[] = [];
    if (intent) {
      const hit = intentW.filter((w) => t.includes(fold(w)));
      if (!hit.length) return null;
      why.push(`your words: ${hit[0]}`);
    }
    if (words.length && !words.every((w) => t.includes(w))) return null;
    if (planet && fold(c.planet) !== fold(planet)) return null;
    if (dayPlanet && fold(c.day) !== fold(q.day ?? '') && fold(c.planet) !== fold(dayPlanet)) return null;
    if (colour && !fold(c.colour).includes(colour)) return null;
    if (q.moon && !moonW.some((w) => t.includes(fold(w)))) return null;
    return why;
  };
  const mineHitRefs = new Set<string>();
  for (const { id, data } of mine) {
    const why = mineMatches(data);
    if (!why) continue;
    if (data.ref) mineHitRefs.add(data.ref);
    out.mine.push({ id, name: data.name, meaning: data.meaning, ref: data.ref ?? null, why: why.join(' · ') || 'Your correspondence' });
  }

  for (const { type } of FINDER_TYPES) {
    const hits: FinderHit[] = [];
    for (const [key, r] of records(library, type)) {
      const s = suggestionOf(type, key, r);
      const id = entryIdOf(s.ref);
      const own = notesFor.get(id) ?? [];
      const uses = text(r, 'Uses').toLowerCase();
      const tags = tagsOf(r);
      const name = fold(s.name);
      const hay = fold([s.name, uses, text(r, 'PairsWith'), tags.join(' '), own.join(' ')].join(' '));
      let score = 0;
      const why: string[] = [];

      if (intent) {
        const hit = hitsIn(uses, tags, intentW);
        const yours = mineHitRefs.has(id);
        if (!hit.length && !yours) continue;
        score += hit.length * 2 + (yours ? 4 : 0);
        why.push(hit.length ? `For ${hit.slice(0, 2).join(', ')}` : 'By your own correspondence');
      }
      if (words.length) {
        if (!words.every((w) => hay.includes(w))) continue;
        score += words.every((w) => name.includes(w)) ? 6 : 2;
      } else if (s.danger) continue;
      const own_planet = text(r, 'Planet');
      if (planet) {
        if (fold(own_planet) !== fold(planet)) continue;
        score += 2;
        why.push(planet);
      }
      if (dayPlanet) {
        if (fold(own_planet) !== fold(dayPlanet)) continue;
        score += 2;
        why.push(`${WEEKDAY_OF[dayPlanet]} (${dayPlanet})`);
      }
      if (colour) {
        const guide = PLANET_GUIDES[own_planet as Classical];
        const own_colour = type === 'candle' ? name.includes(colour) || fold(key).includes(colour) : false;
        const paired = fold(text(r, 'PairsWith')).includes(colour);
        const ofPlanet = !!guide?.colours.some((c) => fold(c) === colour);
        if (!own_colour && !paired && !ofPlanet) continue;
        score += own_colour ? 6 : paired ? 2 : 1;
        why.push(own_colour ? 'The colour itself' : paired ? `Pairs with ${q.colour!.toLowerCase()}` : `${q.colour} is ${own_planet}’s colour`);
      }
      if (q.moon) {
        const hit = hitsIn(uses, tags, moonW);
        if (!hit.length) continue;
        score += hit.length;
        why.push(`${TIDE_LABELS[q.moon]}: ${hit[0]}`);
      }
      if (own.length) score += 1;
      hits.push({ ...s, why: why.join(' · '), score, mine: own });
    }
    out[type] = hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, limit);
  }
  // Your entries already shown on their Library entry needn't show twice.
  const shown = new Set(FINDER_TYPES.flatMap(({ type }) => out[type].map((h) => entryIdOf(h.ref))));
  out.mine = out.mine.filter((m) => !m.ref || !shown.has(m.ref));
  return out;
}

/** The intent a search points to, for the builder: the one chosen, or the moon's first, or none. */
export function finderIntent(q: FinderQuery): string | null {
  if (spellIntent(q.intent)) return spellIntent(q.intent)!.key;
  if (q.moon) return intentsForTide(q.moon)[0]?.key ?? null;
  return null;
}

export type BuildChoice = { intent: string | null; moon: MoonTide | null; planet: string | null };

/** The moon and day to suggest: the ones searched for, else the intent's best. */
export function suggestedTiming(q: FinderQuery): BuildChoice {
  const intent = spellIntent(finderIntent(q));
  const planet = q.planet && WEEKDAY_OF[q.planet] ? q.planet : planetOfDay(q.day) ?? intent?.planets[0] ?? null;
  return { intent: intent?.key ?? null, moon: q.moon ?? intent?.tides[0] ?? null, planet };
}

/**
 * The spell builder's link for what was chosen: the intent, the Library
 * ingredients by ref, your own things by name, and the timing. `from=finder`
 * tells the builder not to add its own starters.
 */
export function builderParams(chosen: Pick<Ingredient, 'ref' | 'name'>[], own: string[], timing: BuildChoice): Record<string, string> {
  const params: Record<string, string> = { from: 'finder' };
  if (timing.intent) params.intent = timing.intent;
  if (timing.moon) params.moon = timing.moon;
  if (timing.planet) params.planet = timing.planet;
  const refs = chosen.map((c) => c.ref).filter((r) => r.startsWith('traditional/'));
  if (refs.length) params.add = refs.join(',');
  const names = [...new Set(own.map((n) => n.replace(/[|]/g, ' ').trim()).filter(Boolean))];
  if (names.length) params.own = names.join('|');
  return params;
}

/** Your pairings for an entry you chose, as more names to bring along. */
export const pairingsOf = (mine: { data: MyCorrespondence }[], entryId: string): string[] =>
  [...new Set(mine.filter((m) => m.data.ref === entryId).flatMap((m) => pairNames(m.data)))];
