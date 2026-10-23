// What works for you: once workings have been looked back on ("Did it
// work?", lookBack.ts), how often they worked by moon phase, intention,
// weekday and its planet, and the candle colours, herbs and stones the entry
// records. Small numbers are said plainly as small numbers. Pure, so every
// sentence can be tested.

import { dayRuler } from '../calendar.ts';
import { journalDate, journalPhase, journalThemes, PHASE_NAMES } from './insights.ts';
import { readLookBack, type Outcome } from './lookBack.ts';
import type { JournalRow } from './types.ts';

/** Fewer answers than this in a group is a note, not a pattern. */
export const MIN_PATTERN = 3;
/** Fewer answers than this overall, and the whole section says so. */
export const MIN_OVERALL = 5;

export type Tally = {
  label: string;
  total: number;
  yes: number;
  partly: number;
  notYet: number;
  no: number;
  /** 0–1: a yes counts whole, a partly counts half. */
  rate: number;
  /** "only 2 so far" when there are too few to read anything into. */
  caveat: string | null;
};

export type WhatWorks = {
  /** Workings with an answer. */
  answered: number;
  /** Workings with a look-back still to come or still to answer. */
  waiting: number;
  overall: Tally | null;
  byPhase: Tally[];
  byIntention: Tally[];
  byDay: Tally[];
  byCandle: Tally[];
  byHerb: Tally[];
  byCrystal: Tally[];
  /** Sentences worth saying, most telling first. */
  lines: string[];
  /** Said over the whole section while there are only a few answers. */
  caveat: string | null;
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const titleCase = (s: string) => s.replace(/\s+/g, ' ').trim().replace(/^./, (c) => c.toUpperCase());

function tally(label: string, answers: Outcome[]): Tally {
  const count = (o: Outcome) => answers.filter((a) => a === o).length;
  const yes = count('yes');
  const partly = count('partly');
  const total = answers.length;
  return {
    label,
    total,
    yes,
    partly,
    notYet: count('not_yet'),
    no: count('no'),
    rate: total ? (yes + partly / 2) / total : 0,
    caveat: total < MIN_PATTERN ? `only ${total} so far` : null,
  };
}

/** "3 of 4 worked, 1 partly" (or "1 of 2 partly worked" when none fully did) */
export function tallyWords(t: Tally): string {
  if (!t.yes && t.partly) return `${t.partly} of ${t.total} partly worked`;
  return `${t.yes} of ${t.total} worked${t.partly ? `, ${t.partly} partly` : ''}`;
}

/** The candle colours, herbs and stones an entry records: from the spell builder's ingredients and the altar it was done at. */
export function entryMaterials(entry: Pick<JournalRow, 'metadata' | 'altar_snapshot'>): { candles: string[]; herbs: string[]; crystals: string[] } {
  const candles = new Set<string>();
  const herbs = new Set<string>();
  const crystals = new Set<string>();
  const candleColour = (name: string) => titleCase(name.replace(/\bcandles?\b/i, '').trim());
  const ingredients = Array.isArray(entry.metadata?.ingredients) ? (entry.metadata.ingredients as { name?: unknown; type?: unknown }[]) : [];
  for (const item of ingredients) {
    const name = typeof item?.name === 'string' ? item.name.trim() : '';
    if (!name) continue;
    if (item.type === 'candle') candles.add(candleColour(name) || 'Candle');
    else if (item.type === 'herb' || item.type === 'oil') herbs.add(titleCase(name));
    else if (item.type === 'crystal') crystals.add(titleCase(name));
  }
  const objects = (entry.altar_snapshot as { objects?: unknown } | null)?.objects;
  for (const raw of Array.isArray(objects) ? objects : []) {
    const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const text = (k: string) => (typeof o[k] === 'string' ? (o[k] as string).trim() : '');
    if (o.type === 'candle') {
      const colour = text('color') && !text('color').startsWith('#') ? text('color') : candleColour(text('label'));
      if (colour) candles.add(titleCase(colour));
    } else if (o.type === 'herb' || o.type === 'oil') {
      const name = text('herb') || text('label');
      if (name) herbs.add(titleCase(name));
    } else if (o.type === 'crystal') {
      const name = text('crystal') || text('label');
      if (name) crystals.add(titleCase(name));
    }
  }
  return { candles: [...candles], herbs: [...herbs], crystals: [...crystals] };
}

function group(items: { keys: string[]; answer: Outcome }[], order?: string[]): Tally[] {
  const map = new Map<string, Outcome[]>();
  for (const { keys, answer } of items) for (const key of keys) map.set(key, [...(map.get(key) ?? []), answer]);
  const tallies = [...map.entries()].map(([label, answers]) => tally(label, answers));
  if (order) return tallies.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  return tallies.sort((a, b) => b.total - a.total || b.rate - a.rate || a.label.localeCompare(b.label));
}

/** The weekday and its planet: "Friday · Venus". */
function dayLabel(entry: JournalRow): string | null {
  const recorded = WEEKDAYS.indexOf(String(entry.day_of_week ?? ''));
  const date = journalDate(entry);
  const day = recorded >= 0 ? recorded : date ? date.getDay() : -1;
  if (day < 0) return null;
  // Any date with that weekday gives its ruler.
  return `${WEEKDAYS[day]} · ${dayRuler(new Date(2026, 0, 4 + day)).planet}`;
}

/** One sentence for a dimension, if its numbers say anything yet. */
function lineFor(tallies: Tally[], words: (label: string) => string): string | null {
  const solid = tallies.filter((t) => t.total >= MIN_PATTERN).sort((a, b) => b.rate - a.rate);
  if (!solid.length) return null;
  const best = solid[0];
  const worst = solid[solid.length - 1];
  if (solid.length >= 2 && best.rate - worst.rate >= 0.25) {
    return `${words(best.label)} have worked best for you (${tallyWords(best)}); ${words(worst.label).replace(/^./, (c) => c.toLowerCase())} least (${tallyWords(worst)}).`;
  }
  if (solid.length === 1 && best.rate >= 0.6) return `${words(best.label)} have worked for you: ${tallyWords(best)}.`;
  return null;
}

export function whatWorks(entries: JournalRow[]): WhatWorks {
  const answered: { entry: JournalRow; answer: Outcome }[] = [];
  let waiting = 0;
  for (const entry of entries) {
    const lookBack = readLookBack(entry);
    if (lookBack?.answer) answered.push({ entry, answer: lookBack.answer });
    else if (lookBack?.date) waiting += 1;
  }

  const each = (keys: (entry: JournalRow) => (string | null)[]) =>
    answered.map(({ entry, answer }) => ({ keys: keys(entry).filter((k): k is string => !!k), answer }));
  const materials = new Map(answered.map(({ entry }) => [entry.id, entryMaterials(entry)]));

  const byPhase = group(each((e) => [journalPhase(e)]), PHASE_NAMES);
  const byIntention = group(each((e) => journalThemes(e)));
  const byDay = group(
    each((e) => [dayLabel(e)]),
    WEEKDAYS.map((d, i) => `${d} · ${dayRuler(new Date(2026, 0, 4 + i)).planet}`),
  );
  const byCandle = group(each((e) => materials.get(e.id)!.candles)).slice(0, 8);
  const byHerb = group(each((e) => materials.get(e.id)!.herbs)).slice(0, 8);
  const byCrystal = group(each((e) => materials.get(e.id)!.crystals)).slice(0, 8);

  const total = answered.length;
  const overall = total ? tally('All', answered.map((a) => a.answer)) : null;
  const lines: string[] = [];
  if (overall) {
    lines.push(
      `Of ${plural(total, 'working')} you’ve looked back on, ${overall.yes} worked${overall.partly ? `, ${overall.partly} partly` : ''}${
        overall.notYet ? `, ${overall.notYet} not yet` : ''
      }${overall.no ? ` and ${overall.no} didn’t` : ''}.`,
    );
    for (const line of [
      lineFor(byPhase, (label) => `Workings under the ${label}`),
      lineFor(byIntention, (label) => `${label} workings`),
      lineFor(byDay, (label) => `${label.split(' · ')[0]} workings`),
      lineFor(byCandle, (label) => `${label} candles`),
      lineFor(byHerb, (label) => `Workings with ${label.toLowerCase()}`),
      lineFor(byCrystal, (label) => `Workings with ${label.toLowerCase()}`),
    ]) {
      if (line) lines.push(line);
    }
  }

  const caveat =
    total === 0
      ? null
      : total < MIN_OVERALL
        ? `Only ${plural(total, 'working')} so far, so read these as early notes rather than patterns.`
        : null;

  return { answered: total, waiting, overall, byPhase, byIntention, byDay, byCandle, byHerb, byCrystal, lines, caveat };
}
