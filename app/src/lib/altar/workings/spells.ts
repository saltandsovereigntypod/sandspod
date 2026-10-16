// Multi-day spells: a working that runs over days (a seven-day candle, nine
// nights, a jar tended for a moon, a novena), with one small tending each day
// and a reflection to close it. Kept per altar in the synced craft store,
// collection `altar.spells`. A missed day is never a failure: the spell simply
// waits, and the next tending is the next step.

import { dayKey, daysBetween } from '../reading/correspondence.ts';

export const SPELLS_COLLECTION = 'altar.spells';

export type SpellKind = 'seven-day-candle' | 'nine-night' | 'jar-28' | 'novena' | 'custom';

export type SpellTick = { day: number; at: string; note?: string };

/** One entry of `altar.spells`. */
export type SpellEntry = {
  altarId: string;
  /** The altar object it's worked with (altarObjectId), if any. */
  objectUid?: string;
  title: string;
  kind: SpellKind;
  days: number;
  intention?: string;
  startedAt: string;
  ticks: SpellTick[];
  reflection?: string;
  closedAt?: string;
};

type KindInfo = { label: string; days: number; blurb: string; tending: string; first: string; last: string };

export const SPELL_KINDS: Record<SpellKind, KindInfo> = {
  'seven-day-candle': {
    label: 'Seven-day candle',
    days: 7,
    blurb: 'A vigil candle burned a little each day for a week.',
    tending: 'Light the candle, sit with it a while, and say the intention once.',
    first: 'Dress the candle if you like, light it, and say plainly what it’s for.',
    last: 'Let it burn down safely while you watch, and give thanks.',
  },
  'nine-night': {
    label: 'Nine nights',
    days: 9,
    blurb: 'A small candle, or a section of one, each night for nine nights.',
    tending: 'At night, light the candle for this night and speak to it for a minute.',
    first: 'Mark the candle into nine, light it, and burn the first ninth.',
    last: 'Burn the last section to the end. Three times three is complete.',
  },
  'jar-28': {
    label: 'A moon’s jar',
    days: 28,
    blurb: 'A jar kept on the altar and tended daily for one moon.',
    tending: 'Hold the jar, give it a gentle shake, and say one line of its intention.',
    first: 'Set the jar where you’ll see it every day, and tell it why it’s there.',
    last: 'Hold the jar once more and decide: keep it, renew it, or let it go.',
  },
  novena: {
    label: 'Novena',
    days: 9,
    blurb: 'Nine days of the same prayer, with a candle lit each day.',
    tending: 'Light the candle and say the day’s prayer.',
    first: 'Choose your prayer, light the candle and begin.',
    last: 'Say the prayer a final time, and give thanks for what’s been heard.',
  },
  custom: {
    label: 'Your own',
    days: 7,
    blurb: 'Your own number of days.',
    tending: 'Do the day’s small tending, whatever you chose it to be.',
    first: 'Begin as you mean to go on.',
    last: 'Finish, and give thanks.',
  },
};

export const SPELL_DAYS_MAX = 90;

export function newSpell(input: { altarId: string; kind: SpellKind; title?: string; days?: number; objectUid?: string; intention?: string }, now: string): SpellEntry {
  const info = SPELL_KINDS[input.kind] ?? SPELL_KINDS.custom;
  const days = Math.max(1, Math.min(SPELL_DAYS_MAX, Math.round(input.kind === 'custom' ? Number(input.days) || info.days : info.days)));
  const spell: SpellEntry = {
    altarId: input.altarId,
    title: (input.title ?? '').replace(/\s+/g, ' ').trim() || info.label,
    kind: input.kind,
    days,
    startedAt: now,
    ticks: [],
  };
  if (input.objectUid) spell.objectUid = input.objectUid;
  if (input.intention?.trim()) spell.intention = input.intention.trim();
  return spell;
}

const ticksOf = (spell: SpellEntry) => (Array.isArray(spell.ticks) ? spell.ticks : []);

export const isComplete = (spell: SpellEntry) => ticksOf(spell).length >= spell.days;
export const isClosed = (spell: SpellEntry) => !!spell.closedAt;
export const tickedToday = (spell: SpellEntry, now: Date) => ticksOf(spell).some((t) => dayKey(t.at) === dayKey(now));

export type SpellToday = {
  /** Which day's tending is next (1-based), or the last day when complete. */
  step: number;
  status: 'tend' | 'done-today' | 'complete' | 'closed';
  /** What to do. */
  instruction: string;
  /** "Day 3 of 7". */
  label: string;
  /** Days the spell waited, gently said, or ''. */
  waited: string;
};

/** Today's step for a spell: what to do, or that today's is done, or that it's ready to close. */
export function spellToday(spell: SpellEntry, now: Date): SpellToday {
  const info = SPELL_KINDS[spell.kind] ?? SPELL_KINDS.custom;
  const done = ticksOf(spell).length;
  const missed = missedDays(spell, now);
  const waited = missed > 0 ? `It waited ${missed === 1 ? 'a day' : `${missed} days`} for you. Nothing is lost; carry on from here.` : '';
  if (isClosed(spell)) return { step: spell.days, status: 'closed', instruction: 'Closed. Its reflection is kept with it.', label: `${spell.days} of ${spell.days}`, waited: '' };
  if (isComplete(spell)) {
    return { step: spell.days, status: 'complete', instruction: 'Every day is tended. Close it with a few words on how it went.', label: `${spell.days} of ${spell.days}`, waited: '' };
  }
  if (tickedToday(spell, now)) {
    return { step: done, status: 'done-today', instruction: 'Today’s tending is done. Come back tomorrow.', label: `Day ${done} of ${spell.days}`, waited: '' };
  }
  const step = done + 1;
  const instruction = step === 1 ? info.first : step === spell.days ? info.last : info.tending;
  return { step, status: 'tend', instruction, label: `Day ${step} of ${spell.days}`, waited };
}

/**
 * Days that passed without a tending since the spell began (or since its last
 * tending), not counting today. The spell doesn't fail: this only lets the
 * app say it waited.
 */
export function missedDays(spell: SpellEntry, now: Date): number {
  if (isComplete(spell) || isClosed(spell)) return 0;
  const ticks = ticksOf(spell);
  const last = ticks.length ? ticks[ticks.length - 1].at : null;
  if (!last) return Math.max(0, daysBetween(spell.startedAt, now));
  return Math.max(0, daysBetween(last, now) - 1);
}

/** Tend today: the next day's tick, unless today's is already done or it's complete. */
export function tickSpell(spell: SpellEntry, now: Date, note = ''): SpellEntry {
  if (isComplete(spell) || isClosed(spell) || tickedToday(spell, now)) return spell;
  const tick: SpellTick = { day: ticksOf(spell).length + 1, at: now.toISOString() };
  if (note.trim()) tick.note = note.replace(/\s+/g, ' ').trim().slice(0, 280);
  return { ...spell, ticks: [...ticksOf(spell), tick] };
}

/** Close a spell with its reflection (once every day is tended, or early if you choose). */
export function closeSpell(spell: SpellEntry, reflection: string, now: Date): SpellEntry {
  return { ...spell, reflection: reflection.trim(), closedAt: now.toISOString() };
}

/** 0–1, for a progress ring. */
export const spellProgress = (spell: SpellEntry) => Math.min(1, ticksOf(spell).length / Math.max(1, spell.days));

/** An altar's spells: open ones first (those needing today's tending at the top), then closed. */
export function spellsForAltar<T extends { data: SpellEntry }>(entries: T[], altarId: string, now: Date): T[] {
  const rank = (s: SpellEntry) => {
    const status = spellToday(s, now).status;
    return status === 'tend' ? 0 : status === 'complete' ? 1 : status === 'done-today' ? 2 : 3;
  };
  return entries
    .filter((e) => e.data?.altarId === altarId)
    .sort((a, b) => rank(a.data) - rank(b.data) || Date.parse(b.data.startedAt) - Date.parse(a.data.startedAt));
}

/** Spells worked with one object, still open. */
export const openSpellsFor = (spells: SpellEntry[], objectUid: string) => spells.filter((s) => s.objectUid === objectUid && !isClosed(s));
