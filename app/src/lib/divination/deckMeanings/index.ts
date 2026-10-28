// Each tarot deck's own meanings. The Rider–Waite–Smith reads with A. E.
// Waite's meanings (tarot.ts); the Tarot de Marseille and the Sola Busca
// have readings of their own (marseille.ts, solaBusca.ts), in the shape of
// types.ts. `deckMeaning` is the one way to a card's meaning in a deck: the
// deck's own where it has one, else Waite's, and it says whose it is. Shared
// with the website through js/core. Pure.

import { deckCardTitle, deckInfo, isDeckId, type DeckId } from '../decks.ts';
import { tarotCard, type Meaning } from '../tarot.ts';
import { MARSEILLE_MEANINGS } from './marseille.ts';
import { SOLA_BUSCA_MEANINGS } from './solaBusca.ts';
import type { DeckMeanings } from './types.ts';

export type { DeckCardMeaning, DeckMeanings } from './types.ts';

export const DECK_MEANINGS: Record<DeckId, DeckMeanings | null> = {
  rws: null,
  marseille: MARSEILLE_MEANINGS,
  'sola-busca': SOLA_BUSCA_MEANINGS,
};

/** A few words on how each deck with its own reading is read, for the top of its readings. */
export const DECK_READING_NOTES: Partial<Record<DeckId, string>> = {
  marseille:
    'The Tarot de Marseille is read here in its own way: the trumps by their French pictures and the cartomancy of the 18th to 20th centuries, the numbered cards by number and suit. Many Marseille readers don’t read reversals at all; the reversed meanings are given gently, for those who do.',
};

export type DeckReading = {
  /** The deck asked for. */
  deck: DeckId;
  /** Whose reading this is: the deck's own, or the Rider–Waite–Smith's (Waite's) when it has none for this card. */
  reading: DeckId;
  /** The card's name in the deck ("XI · La Force"), or null where it is the app's own. */
  title: string | null;
  /** What the deck's picture shows (null for the Rider–Waite–Smith, whose picture is on the card's page). */
  picture: string | null;
  upright: Meaning;
  reversed: Meaning;
  note: string | null;
};

/**
 * A card's meaning in a deck: the deck's own reading, or Waite's for the
 * Rider–Waite–Smith and for any card a deck has no reading for yet. Null
 * only for a card id that isn't one of the 78.
 */
export function deckMeaning(deck: unknown, cardId: string): DeckReading | null {
  const card = tarotCard(cardId);
  if (!card) return null;
  const id: DeckId = isDeckId(deck) ? deck : 'rws';
  const own = DECK_MEANINGS[id]?.[card.id];
  const title = own?.title ?? deckCardTitle(id, card.id);
  if (own) return { deck: id, reading: id, title, picture: own.picture, upright: own.upright, reversed: own.reversed, note: own.note ?? null };
  return { deck: id, reading: 'rws', title, picture: null, upright: card.upright, reversed: card.reversed, note: null };
}

/** Whether a deck reads this card in its own way (not Waite's). */
export const hasOwnReading = (r: DeckReading | null | undefined) => !!r && r.reading !== 'rws';

/** "In the Tarot de Marseille", the heading for a deck's own reading. */
export const readingHeading = (deck: DeckId) => `In the ${deckInfo(deck).name}`;

/**
 * A short line saying whose reading is shown, for a deck other than the
 * Rider–Waite–Smith: "Read as the Tarot de Marseille reads it", or, where
 * the deck has no reading of its own for the card yet, that it is Waite's.
 * Null for the Rider–Waite–Smith itself.
 */
export function readingSource(r: DeckReading | null | undefined): string | null {
  if (!r || r.deck === 'rws') return null;
  const name = deckInfo(r.deck).name;
  if (hasOwnReading(r)) return `Read as the ${name} reads it.`;
  return `A. E. Waite’s Rider–Waite–Smith meaning, as the ${name} has no reading of its own here yet.`;
}

/** The heading over the Rider–Waite–Smith's in-depth sections on a card's page, when another deck's reading leads. */
export const RWS_TRADITION = 'In the Rider–Waite–Smith tradition';

export type DeckPageSection = { key: 'picture' | 'upright' | 'reversed' | 'note'; label: string; keywords: string | null; text: string };

export type DeckPage = {
  /** "In the Tarot de Marseille". */
  heading: string;
  /** The card's name in the deck, if it differs. */
  title: string | null;
  /** How the deck is read, in a few words. */
  about: string | null;
  sections: DeckPageSection[];
};

/**
 * A card's page leads with its own deck's reading, for a deck other than
 * the Rider–Waite–Smith that has one: the picture, upright, reversed and a
 * note. Null for the Rider–Waite–Smith, and for a card the deck has no
 * reading of its own for yet (the page then reads as Waite's, with
 * `readingSource` saying so). App and website alike.
 */
export function deckPage(deck: unknown, cardId: string): DeckPage | null {
  const r = deckMeaning(deck, cardId);
  if (!r || !hasOwnReading(r)) return null;
  const sections: DeckPageSection[] = [
    { key: 'picture', label: 'The picture', keywords: null, text: r.picture ?? '' },
    { key: 'upright', label: 'Upright', keywords: r.upright.keywords, text: r.upright.text },
    { key: 'reversed', label: 'Reversed', keywords: r.reversed.keywords, text: r.reversed.text },
    { key: 'note', label: 'A note', keywords: null, text: r.note ?? '' },
  ];
  return { heading: readingHeading(r.deck), title: r.title, about: DECK_READING_NOTES[r.deck] ?? null, sections: sections.filter((s) => s.text) };
}

/**
 * The lines under a drawn card's name, for a deck other than the
 * Rider–Waite–Smith: its name in the deck, what the deck's picture shows,
 * and whose reading follows. Empty for the Rider–Waite–Smith. The app's
 * draw and reading screens and the website's show the same.
 */
export function deckReadingLines(r: DeckReading | null | undefined): string[] {
  if (!r || r.deck === 'rws') return [];
  return [r.title ? `In the ${deckInfo(r.deck).name}: ${r.title}` : null, r.picture, readingSource(r)].filter((l): l is string => !!l);
}
