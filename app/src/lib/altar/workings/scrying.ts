// Water-bowl scrying: a quiet timed sit with a dark bowl, then a few words on
// what came. The words go to the ritual journal (its JournalAnswers shape)
// when that's available; otherwise to the craft store, `altar.scrying`.

import type { JournalAnswers } from '../../rituals/types.ts';

export const SCRYING_COLLECTION = 'altar.scrying';
export const SCRYING_MINUTES = [5, 10, 15] as const;

export type ScryingNotes = { saw: string; symbols: string; feelings: string };

/** One entry of `altar.scrying` (the fallback store). */
export type ScryingEntry = ScryingNotes & {
  altarId: string;
  minutes: number;
  /** Minutes actually sat, if it was ended early. */
  satMinutes: number;
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
export function scryingJournalAnswers(notes: ScryingNotes, input: { minutes: number; moonPhase: string; altarName?: string; date: Date }): JournalAnswers {
  const d = input.date;
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    title: 'Water-bowl scrying',
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
    notes: `${input.minutes} minutes with the water bowl.`,
    manual_minutes: String(input.minutes),
    ritual_date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
  };
}

export function scryingEntry(notes: ScryingNotes, input: { altarId: string; minutes: number; satMinutes: number; moonPhase: string; at: string }): ScryingEntry {
  return {
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
