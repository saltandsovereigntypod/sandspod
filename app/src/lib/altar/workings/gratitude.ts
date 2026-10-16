// The gratitude bowl: one bead or stone for each thing you're thankful for,
// per altar, kept in the craft store (`altar.gratitude`). The bowl fills over
// a lunar month and empties at the new moon; past moons stay as history.

import { nextPhase } from '../../moon.ts';
import { ingredientColor } from './colors.ts';

export const GRATITUDE_COLLECTION = 'altar.gratitude';
export const GRATITUDE_MAX = 200;
/** Beads that fill the bowl to the brim. */
export const BOWL_CAPACITY = 30;

export const BEADS: { label: string; color: string }[] = [
  { label: 'Rose quartz', color: ingredientColor('rose quartz') },
  { label: 'Citrine', color: ingredientColor('citrine') },
  { label: 'Moonstone', color: ingredientColor('moonstone') },
  { label: 'Green aventurine', color: ingredientColor('green aventurine') },
  { label: 'Amethyst', color: ingredientColor('amethyst') },
  { label: 'Carnelian', color: ingredientColor('carnelian') },
  { label: 'Lapis lazuli', color: ingredientColor('lapis lazuli') },
  { label: 'A river stone', color: '#8f8a80' },
  { label: 'A glass bead', color: '#9fc7c9' },
];

/** One entry of `altar.gratitude`. */
export type GratitudeEntry = {
  altarId: string;
  text: string;
  bead: string;
  color: string;
  at: string;
  /** The lunar month it fell in (its new moon's date, "2026-10-10"). */
  moon: string;
};

export type LunarMonth = { start: Date; end: Date; key: string };

const DAY = 86_400_000;
const keyOf = (d: Date) => d.toISOString().slice(0, 10);

/** The lunar month `at` falls in: from the new moon at or before it to the next. */
export function lunarMonth(at: Date): LunarMonth {
  const end = nextPhase(at, 'new');
  // A lunation is 29.3–29.8 days, so the first new moon after 32 days back is the one this month began with.
  const s = nextPhase(new Date(end.getTime() - 32 * DAY), 'new');
  return { start: s, end, key: keyOf(s) };
}

export function gratitudeEntry(input: { altarId: string; text: string; bead: string; color?: string }, at: Date): GratitudeEntry {
  const bead = BEADS.find((b) => b.label === input.bead);
  return {
    altarId: input.altarId,
    text: input.text.replace(/\s+/g, ' ').trim().slice(0, GRATITUDE_MAX),
    bead: input.bead || 'A river stone',
    color: input.color || bead?.color || '#8f8a80',
    at: at.toISOString(),
    moon: lunarMonth(at).key,
  };
}

/** This altar's beads in the lunar month around `at`, oldest first. */
export function beadsThisMoon<T extends { data: GratitudeEntry }>(entries: T[], altarId: string, at: Date): T[] {
  const { key } = lunarMonth(at);
  return entries.filter((e) => e.data?.altarId === altarId && e.data.moon === key).sort((a, b) => Date.parse(a.data.at) - Date.parse(b.data.at));
}

/** How full the bowl is, 0–1. */
export const bowlFill = (count: number) => Math.min(1, count / BOWL_CAPACITY);

/** Past moons, newest first, each with its beads. */
export function gratitudeHistory<T extends { data: GratitudeEntry }>(entries: T[], altarId: string, at: Date): { moon: string; entries: T[] }[] {
  const current = lunarMonth(at).key;
  const groups = new Map<string, T[]>();
  for (const e of entries) {
    if (e.data?.altarId !== altarId || e.data.moon === current) continue;
    groups.set(e.data.moon, [...(groups.get(e.data.moon) ?? []), e]);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([moon, list]) => ({ moon, entries: list.sort((a, b) => Date.parse(a.data.at) - Date.parse(b.data.at)) }));
}

/**
 * Where each bead lies in the bowl picture, filling from the bottom up in
 * gentle rows. Coordinates are 0–1 across the bowl's opening (x) and down
 * from its rim (y, 1 the bottom); r is the bead's radius.
 */
export function beadPositions(count: number): { x: number; y: number; r: number }[] {
  const out: { x: number; y: number; r: number }[] = [];
  const r = 0.045;
  let row = 0;
  while (out.length < Math.min(count, BOWL_CAPACITY)) {
    // The bowl widens toward the rim.
    const depth = 0.86 - row * 0.075;
    const halfWidth = 0.16 + row * 0.055;
    const perRow = Math.max(2, Math.floor((halfWidth * 2) / (r * 2.1)));
    for (let i = 0; i < perRow && out.length < Math.min(count, BOWL_CAPACITY); i += 1) {
      const t = perRow === 1 ? 0.5 : i / (perRow - 1);
      const jitter = ((out.length * 7919) % 13) / 13 - 0.5;
      out.push({ x: 0.5 - halfWidth + t * halfWidth * 2 + jitter * 0.012, y: depth + jitter * 0.01, r });
    }
    row += 1;
  }
  return out;
}

/** "12 beads since the new moon on 10 Oct." */
export function bowlLine(count: number, month: LunarMonth): string {
  const since = month.start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  if (!count) return `The bowl is empty, fresh since the new moon on ${since}. Add the first bead.`;
  return `${count} bead${count === 1 ? '' : 's'} since the new moon on ${since}.${count >= BOWL_CAPACITY ? ' The bowl is brimming.' : ''}`;
}
