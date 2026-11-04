// What a divination at the altar answered, held on the stage for a while:
// the pendulum's yes or no, the card or rune drawn from a deck, a scrying
// sit, a candle read after its burn. A small card in the stage's corner shows
// it until it is put away (or another divination takes its place), with room
// for notes that are kept on the reading itself (its "What you make of it"),
// so they show wherever readings show. Pure, so the app and the website share
// it and it can be tested.

import { lookBackFrom, METHODS, methodLabel, moonForReading, type Reading, type ReadingMethod } from '../craft/hedge/readings.ts';
import { localDateKey } from '../rituals/lifecycle.ts';
import { readingText, readingsOf, type FlameReading } from './ceromancy.ts';
import { appStateOf, setAppState } from './livingState.ts';
import type { SavedObject } from './types.ts';
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
  /** A candle read after its burn: its notes are kept on the candle's reading, not in the reading log. */
  candle?: { objectId: string; readingId: string };
  /** For a card someone else laid on a coven altar: what to log as your own reading when you add notes to it. */
  method?: ReadingMethod;
  drawn?: string[];
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
export function ceromancyResult(summary: string, notes: string, at: string, candle?: { objectId: string; readingId: string }): DivinationResult {
  return { kind: 'ceromancy', eyebrow: KIND_LABEL.ceromancy, answer: clip(summary, 120) || 'Read', detail: '', question: '', readingId: null, notes: notes.trim(), at, ...(candle ? { candle } : {}) };
}

/** New notes on a candle's reading (and its text, which carries them); a blank `readingId` means its latest. */
export function withCandleNotes(object: SavedObject, readingId: string, notes: string, now: string): SavedObject {
  const list = readingsOf(object);
  if (!readingId) readingId = list[list.length - 1]?.id ?? '';
  if (!readingId || !list.some((r) => r.id === readingId)) return object;
  const readings = list.map((r): FlameReading => (r.id === readingId ? { ...r, notes: notes.trim(), text: readingText({ flame: r.flame, smoke: r.smoke, wax: r.wax, notes }) } : r));
  return setAppState(object, { readings }, now);
}

type LaidReading = { id?: unknown; drawn?: unknown; method?: unknown };
const laidOf = (o: SavedObject): LaidReading | null => {
  const r = appStateOf(o).reading as LaidReading | undefined;
  return r && typeof r.drawn === 'string' && r.drawn ? r : null;
};

/**
 * Cards, runes and staves laid on the altar since `seen` (the ids of what was
 * there): the coven's draws, as they arrive. Those whose reading is in `mine`
 * are left out (you drew them, and their card is already showing).
 */
export function newlyLaid(objects: SavedObject[], seen: ReadonlySet<string>, mine: ReadonlySet<string>): SavedObject[] {
  return objects.filter((o) => {
    const id = String(o.altarObjectId || '');
    const r = laidOf(o);
    return !!id && !!r && !seen.has(id) && !mine.has(String(r.id ?? ''));
  });
}

/** A card someone else laid on the coven altar. It has no reading of yours yet: notes on it start one. */
export function laidResult(object: SavedObject, keywords: string | null, at: string): DivinationResult | null {
  const r = laidOf(object);
  if (!r) return null;
  const drawn = String(r.drawn);
  const method = METHODS.some((m) => m.id === r.method) ? (r.method as ReadingMethod) : 'other';
  const reversed = /, reversed$/.test(drawn);
  const name = drawn.replace(/, reversed$/, '');
  const kind = method === 'tarot' || method === 'runes' || method === 'ogham' ? method : 'reading';
  const base = drawResult(kind, [{ name, reversed, keywords }], '', null, at, method);
  return { ...base, eyebrow: `${base.eyebrow} · drawn at the coven altar`, method, drawn: [drawn] };
}

/** Your own reading of a card drawn for the coven, made when you first add notes to it. */
export function readingForResult(r: DivinationResult, notes: string, now: Date): Reading {
  const date = localDateKey(now);
  return {
    date,
    method: r.method ?? 'other',
    question: r.question,
    drawn: r.drawn ?? [],
    cameUp: [`${r.eyebrow}`, r.answer, r.detail].filter(Boolean).join('\n'),
    interpretation: notes.trim(),
    lookBack: lookBackFrom(date, 7),
    outcome: '',
    outcomeDate: '',
    moonPhase: moonForReading(date),
  };
}

/** Whether a result's notes can be kept: on a reading, on a candle, or (for the coven's draw) on a new reading of yours. */
export const canKeepNotes = (r: DivinationResult) => !!r.readingId || !!r.candle || !!r.drawn?.length;

/** The help line under the card. */
export const RESULT_HELP = 'Kept in your readings. Add what you make of it now or later; it stays with the reading.';

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
