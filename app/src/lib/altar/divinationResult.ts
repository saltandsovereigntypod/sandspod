// What a divination at the altar answered, held on the stage for a while:
// the pendulum's yes or no, the card or rune drawn from a deck, a scrying
// sit, a candle read after its burn. A small card in the stage's corner shows
// it until it is put away (or another divination takes its place), with room
// for notes that are kept on the reading itself (its "What you make of it"),
// so they show wherever readings show. Pure, so the app and the website share
// it and it can be tested.

import { lookBackFrom, methodLabel, moonForReading, type Reading } from '../craft/hedge/readings.ts';
import { localDateKey } from '../rituals/lifecycle.ts';
import type { ScryingNotes } from './workings/scrying.ts';

export type ResultKind = 'pendulum' | 'tarot' | 'runes' | 'ogham' | 'reading' | 'scrying' | 'ceromancy';

export type DivinationResult = {
  kind: ResultKind;
  /** Small line above: "Pendulum", "Tarot", "Scrying · the bowl". */
  eyebrow: string;
  /** The answer itself: "Yes", "The Star, upright", "Scrying · 10 min". */
  answer: string;
  /** A few words under it: keywords, or what was asked. */
  detail: string;
  question: string;
  /** The reading in the reading log (hedge.readings) its notes are kept on; null when there is none. */
  readingId: string | null;
  notes: string;
  at: string;
};

/** The first two or three keywords of a meaning's keyword list. */
export function firstKeywords(keywords: string | null | undefined, n = 3): string {
  return String(keywords ?? '')
    .split(/[,;·]/)
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, n)
    .join(', ');
}

const clip = (s: string, n: number) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

const KIND_LABEL: Record<ResultKind, string> = {
  pendulum: 'Pendulum',
  tarot: 'Tarot',
  runes: 'Runes',
  ogham: 'Ogham',
  reading: 'Reading',
  scrying: 'Scrying',
  ceromancy: 'Candle reading',
};

export function pendulumResult(answer: string, question: string, readingId: string | null, at: string): DivinationResult {
  const q = question.trim();
  return { kind: 'pendulum', eyebrow: KIND_LABEL.pendulum, answer, detail: q ? `“${clip(q, 80)}”` : '', question: q, readingId, notes: '', at };
}

export type DrawnSummary = { name: string; reversed?: boolean; keywords?: string | null };

/** A card's name with which way up it fell (tarot only; runes and staves are named as they are). */
export const drawnName = (item: DrawnSummary, withWay: boolean) => (withWay ? `${item.name}, ${item.reversed ? 'reversed' : 'upright'}` : `${item.name}${item.reversed ? ', reversed' : ''}`);

/** A draw from a deck on the altar, or a reading laid on it from the log (`kind` 'reading', `method` its method). */
export function drawResult(kind: 'tarot' | 'runes' | 'ogham' | 'reading', items: DrawnSummary[], question: string, readingId: string | null, at: string, method?: string): DivinationResult {
  const tarot = kind === 'tarot' || method === 'tarot';
  const answer = items.map((i) => drawnName(i, tarot)).join(' · ') || 'Nothing drawn';
  const detail = items.length === 1 ? firstKeywords(items[0].keywords) : items.map((i) => firstKeywords(i.keywords, 1)).filter(Boolean).join(' · ');
  const eyebrow = kind === 'reading' ? (method ? methodLabel(method) : KIND_LABEL.reading) : KIND_LABEL[kind];
  return { kind, eyebrow, answer: clip(answer, 120), detail: clip(detail, 120), question: question.trim(), readingId, notes: '', at };
}

/** "Scrying · 10 min", with what was seen beneath it. */
export function scryingResult(vessel: string, minutes: number, saw: string, readingId: string | null, at: string): DivinationResult {
  const m = Math.max(1, Math.round(minutes));
  return { kind: 'scrying', eyebrow: `Scrying · ${vessel}`, answer: `Scrying · ${m} min`, detail: clip(saw, 100), question: '', readingId, notes: '', at };
}

/** A candle read after its burn: the summary of its signs; its notes live on the candle. */
export function ceromancyResult(summary: string, notes: string, at: string): DivinationResult {
  return { kind: 'ceromancy', eyebrow: KIND_LABEL.ceromancy, answer: clip(summary, 120) || 'Read', detail: '', question: '', readingId: null, notes: notes.trim(), at };
}

/** The card put away to a chip: "Pendulum · Yes". */
export function resultChip(r: DivinationResult): string {
  return clip(r.kind === 'scrying' ? r.answer : `${KIND_LABEL[r.kind]} · ${r.answer}`, 48);
}

/** Notes kept on the reading as its "What you make of it". */
export function withNotes(reading: Reading, notes: string): Reading {
  return { ...reading, interpretation: notes.trim() };
}

/** A scrying sit as a reading in the reading log, so it sits with the other divinations. */
export function scryingReading(notes: ScryingNotes, input: { vessel: string; minutes: number; date: Date }): Reading {
  const date = localDateKey(input.date);
  const m = Math.max(1, Math.round(input.minutes));
  const lines = [
    `Scrying · ${input.vessel} · ${m} minute${m === 1 ? '' : 's'}`,
    notes.saw.trim() && `Saw: ${notes.saw.trim()}`,
    notes.symbols.trim() && `Symbols: ${notes.symbols.trim()}`,
    notes.feelings.trim() && `Felt: ${notes.feelings.trim()}`,
  ].filter(Boolean);
  return {
    date,
    method: 'scrying',
    question: '',
    drawn: [],
    cameUp: lines.join('\n'),
    interpretation: '',
    lookBack: lookBackFrom(date, 7),
    outcome: '',
    outcomeDate: '',
    moonPhase: moonForReading(date),
  };
}
