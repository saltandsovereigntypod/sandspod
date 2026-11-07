// Water-bowl scrying: a quiet timed sit with a dark bowl, then a few words on
// what came. It is kept as a reading in your divination log (`hedge.readings`,
// method "scrying") like every other reading, and in the ritual journal when
// that's available. Older sits kept only in `altar.scrying` are copied into
// the log once (scryingReadingsToAdd; the old entries are kept, marked).

import type { JournalAnswers } from '../../rituals/types.ts';
import { lookBackFrom, moonForReading, type Reading } from '../../craft/hedge/readings.ts';
import { localDateKey } from '../../rituals/lifecycle.ts';

export const SCRYING_COLLECTION = 'altar.scrying';
export const SCRYING_MINUTES = [5, 10, 15] as const;

export type ScryingNotes = { saw: string; symbols: string; feelings: string };

/** What you scry in: the water bowl, a dark mirror (or crystal ball) on the altar, or the cauldron filled with water. */
export type ScryVessel = 'bowl' | 'mirror' | 'cauldron';
export const SCRY_VESSELS: Record<ScryVessel, { title: string; lede: string; with: string; image: string }> = {
  bowl: { title: 'Water-bowl scrying', lede: 'Dim the lights. Let your eyes soften on the water, and let whatever comes, come.', with: 'the water bowl', image: 'A dark bowl of still water, faint light moving on its surface' },
  mirror: {
    title: 'Mirror scrying',
    lede: 'The altar dims. Let your eyes rest on the dark glass, past the candlelight in it, and let whatever comes, come.',
    with: 'the scrying mirror',
    image: 'A black mirror in the dark, candlelight reflected in the glass',
  },
  cauldron: { title: 'Cauldron scrying', lede: 'The altar dims. Let your eyes soften on the water in the cauldron, and let whatever comes, come.', with: 'the cauldron', image: 'Dark water in a cauldron, faint light moving on its surface' },
};
export const scryVessel = (v: unknown): ScryVessel => (v === 'mirror' || v === 'cauldron' ? v : 'bowl');
/** The altar's History line. */
export const scryLine = (vessel: ScryVessel, minutes: number) => `Scried with ${SCRY_VESSELS[vessel].with} for ${Math.max(1, Math.round(minutes))} minute${Math.round(minutes) > 1 ? 's' : ''}.`;

/** One entry of `altar.scrying` (the fallback store). */
export type ScryingEntry = ScryingNotes & {
  altarId: string;
  minutes: number;
  /** Minutes actually sat, if it was ended early. */
  satMinutes: number;
  /** What it was scried in (missing on older entries: the water bowl). */
  vessel?: ScryVessel;
  moonPhase: string;
  at: string;
};

export const SCRYING_PROMPTS: { key: keyof ScryingNotes; label: string; placeholder: string }[] = [
  { key: 'saw', label: 'What you saw', placeholder: 'Shapes in the dark water, a face, a road, nothing at all…' },
  { key: 'symbols', label: 'Symbols', placeholder: 'A key, a bird, a spiral…' },
  { key: 'feelings', label: 'How it felt', placeholder: 'Calm, uneasy, drowsy, lit up…' },
];

/** Seconds left, as "4:59". */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Seconds left at `now` for a sit that began at `startedAt` (ms). */
export const secondsLeft = (minutes: number, startedAt: number, now: number) => Math.max(0, minutes * 60 - (now - startedAt) / 1000);

export const hasNotes = (notes: ScryingNotes) => !!(notes.saw.trim() || notes.symbols.trim() || notes.feelings.trim());

/** The ritual journal's answers for a scrying (saveJournal({ session: null, answers })). */
export function scryingJournalAnswers(notes: ScryingNotes, input: { minutes: number; moonPhase: string; altarName?: string; date: Date; vessel?: ScryVessel }): JournalAnswers {
  const d = input.date;
  const v = SCRY_VESSELS[scryVessel(input.vessel)];
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    title: v.title,
    intention: input.altarName ? `Scrying at ${input.altarName}` : 'Scrying',
    moon_phase: input.moonPhase,
    feelings_before: '',
    what_happened_during: notes.saw.trim(),
    feelings_during: notes.feelings.trim(),
    signs_and_symbols: notes.symbols.trim(),
    what_happened_after: '',
    feelings_after: '',
    dreams_and_follow_up: '',
    results: '',
    changes_for_next_time: '',
    notes: `${input.minutes} minutes with ${v.with}.`,
    manual_minutes: String(input.minutes),
    ritual_date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
  };
}

export function scryingEntry(notes: ScryingNotes, input: { altarId: string; minutes: number; satMinutes: number; moonPhase: string; at: string; vessel?: ScryVessel }): ScryingEntry {
  return {
    ...(input.vessel && input.vessel !== 'bowl' ? { vessel: input.vessel } : {}),
    altarId: input.altarId,
    minutes: input.minutes,
    satMinutes: Math.max(0, Math.round(input.satMinutes)),
    moonPhase: input.moonPhase,
    at: input.at,
    saw: notes.saw.trim(),
    symbols: notes.symbols.trim(),
    feelings: notes.feelings.trim(),
  };
}

/**
 * The slow drift of reflections on the water: for each of `count` glints, a
 * start point, radius and loop length (ms). Deterministic, so the picture is
 * the same every time; the still image under reduced motion uses phase 0.
 */
export function reflectionPaths(count = 4): { cx: number; cy: number; rx: number; ry: number; driftX: number; driftY: number; period: number; opacity: number }[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i * 137.5 * Math.PI) / 180;
    return {
      cx: 0.5 + 0.18 * Math.cos(a),
      cy: 0.5 + 0.12 * Math.sin(a),
      rx: 0.1 + 0.03 * (i % 3),
      ry: 0.025 + 0.01 * (i % 2),
      driftX: 0.05 * Math.cos(a + 1),
      driftY: 0.03 * Math.sin(a + 2),
      period: 14_000 + i * 3_700,
      opacity: 0.08 + 0.04 * ((i + 1) % 3),
    };
  });
}

const VESSEL_WORD: Record<ScryVessel, string> = { bowl: 'a water bowl', mirror: 'a black mirror', cauldron: 'the cauldron' };

/** A scrying sit as a reading in the divination log (method "scrying"). */
export function scryingReading(entry: ScryingEntry): Reading {
  const date = Number.isNaN(Date.parse(entry.at)) ? localDateKey(new Date()) : localDateKey(new Date(entry.at));
  const vessel = scryVessel(entry.vessel);
  const sat = entry.satMinutes || entry.minutes;
  return {
    date,
    method: 'scrying',
    question: '',
    drawn: [],
    cameUp: [entry.saw.trim(), entry.symbols.trim() ? `Symbols: ${entry.symbols.trim()}` : ''].filter(Boolean).join('\n'),
    interpretation: [entry.feelings.trim() ? `Felt: ${entry.feelings.trim()}` : '', `Scried in ${VESSEL_WORD[vessel]} for ${Math.max(1, Math.round(sat))} minute${Math.round(sat) > 1 ? 's' : ''}, on the altar.`].filter(Boolean).join('\n'),
    lookBack: lookBackFrom(date, 30),
    outcome: '',
    outcomeDate: '',
    moonPhase: (entry.moonPhase || moonForReading(date)) as Reading['moonPhase'],
  };
}

/** Migration on read: the old altar.scrying entries not yet in the log (they are marked with readingId once copied, never removed). */
export function scryingReadingsToAdd(entries: { id: string; data: unknown; deletedAt?: string | null }[]): { id: string; entry: ScryingEntry; reading: Reading }[] {
  const out: { id: string; entry: ScryingEntry; reading: Reading }[] = [];
  for (const e of entries) {
    const d = (e.data && typeof e.data === 'object' ? e.data : {}) as Partial<ScryingEntry> & { readingId?: string };
    if (e.deletedAt || d.readingId || typeof d.at !== 'string') continue;
    const entry: ScryingEntry = { altarId: String(d.altarId ?? ''), minutes: Number(d.minutes) || 0, satMinutes: Number(d.satMinutes) || 0, moonPhase: String(d.moonPhase ?? ''), at: d.at, saw: String(d.saw ?? ''), symbols: String(d.symbols ?? ''), feelings: String(d.feelings ?? ''), ...(d.vessel ? { vessel: scryVessel(d.vessel) } : {}) };
    out.push({ id: e.id, entry, reading: scryingReading(entry) });
  }
  return out;
}
