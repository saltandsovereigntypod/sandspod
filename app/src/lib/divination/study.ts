// Study mode for divination: flashcards and a short quiz for each deck in
// the app (the tarot in each deck's own reading, the runes, the ogham,
// Lenormand, Kipper and decks of your own), learnt by Leitner boxes. A card
// answered rightly moves up a box and waits longer before it comes back; one
// missed goes back to the first box. Progress is kept per deck as a craft
// entry (collection `divination.study`). Pure, so it can be tested.

import { deckInfo, TAROT_DECKS, type DeckId } from './decks.ts';
import { deckMeaning } from './deckMeanings/index.ts';
import { KIPPER } from './oracle/kipper.ts';
import { LENORMAND } from './oracle/lenormand.ts';
import { FEDA, RUNES } from './staves.ts';
import { TAROT_DECK } from './tarot.ts';

export const STUDY_COLLECTION = 'divination.study';

export type StudyCard = {
  id: string;
  /** The card's name as the deck gives it. */
  name: string;
  /** A rune's or stave's letter, a Lenormand playing card, or ''. */
  glyph: string;
  /** A few words: the answer to learn. */
  keywords: string;
  /** Two or three sentences more. */
  text: string;
  /** The reversed reading, when the deck has one. */
  reversed?: string;
  /** A tarot card's picture id, a Lenormand id, or an own card's photo. */
  picture?: { kind: 'tarot' | 'lenormand' | 'photo'; id: string };
};

export type StudyDeck = { id: string; name: string; detail: string };

export type OwnDeckLike = { id: string; data: { name: string; cards: { id: string; name: string; keywords: string; meaning: string; reversed: string; photo: string }[] } };

/** Every deck there is to study: the three tarots, runes, ogham, Lenormand, Kipper, and your own. */
export function studyDecks(own: OwnDeckLike[] = []): StudyDeck[] {
  return [
    ...TAROT_DECKS.map((d) => ({ id: `tarot:${d.id}`, name: `Tarot · ${d.name}`, detail: d.id === 'rws' ? 'Waite’s meanings, 78 cards' : `This deck’s own reading, 78 cards` })),
    { id: 'runes', name: 'Runes', detail: 'The Elder Futhark, 24 runes' },
    { id: 'ogham', name: 'Ogham', detail: 'The twenty feda' },
    { id: 'lenormand', name: 'Lenormand', detail: '36 cards' },
    { id: 'kipper', name: 'Kipper', detail: '36 cards' },
    ...own.filter((d) => d.data.cards.some((c) => c.keywords || c.meaning)).map((d) => ({ id: `own:${d.id}`, name: d.data.name || 'Your deck', detail: `Your own deck, ${d.data.cards.length} cards` })),
  ];
}

/** The cards of one deck, in order. Empty for a deck that isn't there. */
export function studyCards(deckId: string, own: OwnDeckLike[] = []): StudyCard[] {
  if (deckId.startsWith('tarot:')) {
    const deck = deckInfo(deckId.slice(6)).id as DeckId;
    return TAROT_DECK.map((card) => {
      const r = deckMeaning(deck, card.id)!;
      return { id: card.id, name: r.title ?? card.name, glyph: '', keywords: r.upright.keywords, text: r.upright.text, reversed: r.reversed.keywords, picture: { kind: 'tarot', id: card.id } };
    });
  }
  if (deckId === 'runes' || deckId === 'ogham') {
    return (deckId === 'runes' ? RUNES : FEDA).map((s) => ({ id: s.name.toLowerCase(), name: `${s.name} (${s.gloss})`, glyph: s.glyph, keywords: s.keywords, text: s.text }));
  }
  if (deckId === 'lenormand') return LENORMAND.map((c) => ({ id: c.id, name: `${c.number}. ${c.name}`, glyph: c.playing, keywords: c.meaning.keywords, text: c.meaning.text, picture: { kind: 'lenormand', id: c.id } }));
  if (deckId === 'kipper') return KIPPER.map((c) => ({ id: c.id, name: `${c.number}. ${c.name}`, glyph: '', keywords: c.meaning.keywords, text: c.meaning.text }));
  if (deckId.startsWith('own:')) {
    const deck = own.find((d) => d.id === deckId.slice(4));
    return (deck?.data.cards ?? [])
      .filter((c) => c.keywords || c.meaning)
      .map((c) => ({
        id: c.id,
        name: c.name,
        glyph: '',
        keywords: c.keywords || c.meaning.split(/[.;]/)[0],
        text: c.meaning,
        reversed: c.reversed || undefined,
        picture: c.photo ? { kind: 'photo' as const, id: c.photo } : undefined,
      }));
  }
  return [];
}

// ── Leitner boxes ─────────────────────────────────────────────────────────

/** Days to wait before a card in each box (1–5) comes back. */
export const BOX_DAYS = [0, 1, 3, 7, 14, 30];
export const TOP_BOX = 5;

export type CardState = { box: number; due: string; seen: number; right: number };
export type StudyState = { deck: string; cards: Record<string, CardState>; lastDay?: string };

const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (key: string, n: number) => {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
};

export const emptyStudy = (deck: string): StudyState => ({ deck, cards: {} });

export function normalizeStudy(raw: unknown, deck: string): StudyState {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const cards: Record<string, CardState> = {};
  const src = r.cards && typeof r.cards === 'object' ? (r.cards as Record<string, Record<string, unknown>>) : {};
  for (const [id, c] of Object.entries(src)) {
    const box = Math.min(TOP_BOX, Math.max(1, Math.round(Number(c?.box) || 1)));
    const due = typeof c?.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.due) ? c.due : '1970-01-01';
    cards[id] = { box, due, seen: Math.max(0, Number(c?.seen) || 0), right: Math.max(0, Number(c?.right) || 0) };
  }
  return { deck: typeof r.deck === 'string' ? r.deck : deck, cards, ...(typeof r.lastDay === 'string' ? { lastDay: r.lastDay } : {}) };
}

/** After an answer: right moves a card up a box and away for longer; wrong sends it back to the first box, for tomorrow. */
export function review(state: StudyState, cardId: string, right: boolean, today: Date): StudyState {
  const key = dayKey(today);
  const was = state.cards[cardId];
  const box = right ? Math.min(TOP_BOX, (was?.box ?? 0) + 1) : 1;
  const next: CardState = { box, due: addDays(key, BOX_DAYS[box]), seen: (was?.seen ?? 0) + 1, right: (was?.right ?? 0) + (right ? 1 : 0) };
  return { ...state, cards: { ...state.cards, [cardId]: next }, lastDay: key };
}

/**
 * Today's study: cards that are due (most overdue and lowest box first),
 * then up to `newCards` never seen, in the deck's order. At most `limit`.
 */
export function dueCards<T extends { id: string }>(cards: T[], state: StudyState, today: Date, limit = 20, newCards = 7): T[] {
  const key = dayKey(today);
  const due = cards
    .filter((c) => state.cards[c.id] && state.cards[c.id].due <= key)
    .sort((a, b) => state.cards[a.id].due.localeCompare(state.cards[b.id].due) || state.cards[a.id].box - state.cards[b.id].box);
  const fresh = cards.filter((c) => !state.cards[c.id]).slice(0, newCards);
  return [...due, ...fresh].slice(0, limit);
}

export type DeckProgress = { total: number; seen: number; learning: number; known: number; due: number; boxes: number[] };

/** How far through a deck: seen, known (box 4 and up), due today, and how many in each box. */
export function deckProgress(cards: { id: string }[], state: StudyState, today: Date): DeckProgress {
  const key = dayKey(today);
  const boxes = [0, 0, 0, 0, 0];
  let due = 0;
  for (const c of cards) {
    const s = state.cards[c.id];
    if (!s) continue;
    boxes[s.box - 1] += 1;
    if (s.due <= key) due += 1;
  }
  const seen = boxes.reduce((a, b) => a + b, 0);
  const known = boxes[3] + boxes[4];
  return { total: cards.length, seen, learning: seen - known, known, due, boxes };
}

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

/** A card to learn today: one of the least known (unseen, or lowest box), the same all day. */
export function cardToLearn<T extends { id: string }>(cards: T[], state: StudyState, today: Date): T | null {
  if (!cards.length) return null;
  const level = (c: T) => state.cards[c.id]?.box ?? 0;
  const lowest = Math.min(...cards.map(level));
  const pool = cards.filter((c) => level(c) === lowest);
  return pool[hash(`${state.deck}:${dayKey(today)}`) % pool.length];
}

/** Four answers to choose from for a card: its own keywords and three others from the deck, in a set order for the day. */
export function quizChoices(cards: StudyCard[], card: StudyCard, seed: string, n = 4): string[] {
  const others = cards
    .filter((c) => c.id !== card.id && c.keywords && c.keywords !== card.keywords)
    .map((c) => c.keywords)
    .filter((k, i, all) => all.indexOf(k) === i)
    .sort((a, b) => hash(`${seed}:${a}`) - hash(`${seed}:${b}`))
    .slice(0, n - 1);
  return [card.keywords, ...others].sort((a, b) => hash(`${seed}:${card.id}:${a}`) - hash(`${seed}:${card.id}:${b}`));
}
