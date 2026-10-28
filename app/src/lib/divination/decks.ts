// The tarot decks to draw with, all public domain: Pamela Colman Smith's
// Rider–Waite–Smith (1909), the default; Nicolas Conver's Tarot de Marseille
// (1760, in A. Camoin's printing of about 1890–1900); and the Sola Busca
// (Italy, about 1491), the oldest complete 78-card deck. Every deck uses the
// same 78 card ids; a deck changes the picture, the card's own title where
// the deck names it differently, and the meanings: the Rider–Waite–Smith
// reads with Waite's (tarot.ts), the others with their own
// (deckMeanings/, through `deckMeaning`).
// The deck is a setting (`tarot_deck`, shared with the website) and a kept
// reading remembers the deck it was drawn with (`deck` on a `hedge.readings`
// entry). Pure, so the app and the website share it.

import { MAJORS, TAROT_DECK, type Suit, type TarotCard } from './tarot.ts';

export type DeckId = 'rws' | 'marseille' | 'sola-busca';

export type TarotDeckInfo = {
  id: DeckId;
  /** "Rider–Waite–Smith". */
  name: string;
  /** Who made it and when, in a few words. */
  made: string;
  /** One or two plain sentences about the deck. */
  about: string;
  /** The credit line for its pictures. */
  credit: string;
};

export const DEFAULT_DECK: DeckId = 'rws';

/** The settings key (in `user_settings.settings`, as on the website). */
export const DECK_SETTING = 'tarot_deck';

export const TAROT_DECKS: TarotDeckInfo[] = [
  {
    id: 'rws',
    name: 'Rider–Waite–Smith',
    made: 'Pamela Colman Smith, 1909',
    about: 'The deck most readers learn on, drawn by Pamela Colman Smith for A. E. Waite: every card a scene.',
    credit: 'Rider–Waite–Smith tarot, drawn by Pamela Colman Smith, published by William Rider & Son, London, 1909. Public domain; scans from Wikimedia Commons.',
  },
  {
    id: 'marseille',
    name: 'Tarot de Marseille',
    made: 'Nicolas Conver, 1760',
    about: 'The old French pattern, cut in wood and coloured by stencil. Justice is VIII and Strength XI, and the numbered cards show only their suit signs.',
    credit:
      'Tarot de Marseille after Nicolas Conver (1760), printed by A. Camoin, Marseille, about 1890–1900. Bibliothèque nationale de France, département des Estampes et de la photographie (collection Paul Marteau); public domain, via Wikimedia Commons.',
  },
  {
    id: 'sola-busca',
    name: 'Sola Busca',
    made: 'Italy, about 1491',
    about: 'The oldest complete deck of 78, engraved in Ferrara or Venice and coloured by hand. Its trumps are heroes of Rome and the Bible, and every card is a picture.',
    credit:
      'Sola Busca tarot, engraved in Italy about 1491, attributed to Nicola di Maestro Antonio d’Ancona; the coloured deck in the Pinacoteca di Brera, Milan. Public domain; scans from Wikimedia Commons.',
  },
];

const DECK_IDS = TAROT_DECKS.map((d) => d.id);

export const isDeckId = (value: unknown): value is DeckId => typeof value === 'string' && (DECK_IDS as string[]).includes(value);

/** A deck by id; anything unknown (or missing) is the Rider–Waite–Smith. */
export const deckInfo = (id: unknown): TarotDeckInfo => TAROT_DECKS.find((d) => d.id === id) ?? TAROT_DECKS[0];

/** The deck chosen in settings. */
export const chosenDeck = (settings: Record<string, unknown> | null | undefined): DeckId => (isDeckId(settings?.[DECK_SETTING]) ? (settings![DECK_SETTING] as DeckId) : DEFAULT_DECK);

/** The deck a kept reading was drawn with: its own `deck`, or the Rider–Waite–Smith for readings from before decks. */
export const deckOfReading = (reading: { deck?: unknown } | null | undefined): DeckId => (isDeckId(reading?.deck) ? (reading!.deck as DeckId) : DEFAULT_DECK);

// ─── Card titles in each deck ────────────────────────────────────────────

const ROMAN = ['', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'VIIII', 'X', 'XI', 'XII', 'XIII', 'XIIII', 'XV', 'XVI', 'XVII', 'XVIII', 'XVIIII', 'XX', 'XXI'];

// Conver's trumps as printed, by the app's card number. Justice and Strength
// swap places: the app's 8 (Strength) is Conver's XI, its 11 (Justice) his VIII.
const MARSEILLE_MAJORS: Record<number, string> = {
  0: 'Le Mat',
  1: 'I · Le Bateleur',
  2: 'II · La Papesse',
  3: 'III · L’Impératrice',
  4: 'IIII · L’Empereur',
  5: 'V · Le Pape',
  6: 'VI · L’Amoureux',
  7: 'VII · Le Chariot',
  8: 'XI · La Force',
  9: 'VIIII · L’Hermite',
  10: 'X · La Roue de Fortune',
  11: 'VIII · La Justice',
  12: 'XII · Le Pendu',
  13: 'XIII · the card without a name',
  14: 'XIIII · Tempérance',
  15: 'XV · Le Diable',
  16: 'XVI · La Maison Dieu',
  17: 'XVII · L’Étoile',
  18: 'XVIII · La Lune',
  19: 'XVIIII · Le Soleil',
  20: 'XX · Le Jugement',
  21: 'XXI · Le Monde',
};

const FRENCH_RANKS = ['As', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix', 'Valet', 'Cavalier', 'Reyne', 'Roy'];
const FRENCH_SUITS: Record<Suit, string> = { Wands: 'Bâton', Cups: 'Coupe', Swords: 'Épée', Pentacles: 'Deniers' };

// The Sola Busca's trumps are named figures, numbered 0 to XXI; mapped by number.
const SOLA_BUSCA_MAJORS = [
  'Mato',
  'Panfilio',
  'Postumio',
  'Lenpio',
  'Mario',
  'Catulo',
  'Sesto',
  'Deo Tauro',
  'Nerone',
  'Falco',
  'Venturio',
  'Tulio',
  'Carbone',
  'Catone',
  'Bocho',
  'Metelo',
  'Olivo',
  'Ipeo',
  'Lentulo',
  'Sabino',
  'Nenbroto',
  'Nabuchodenasor',
];

const SOLA_BUSCA_SUITS: Record<Suit, string> = { Wands: 'Batons', Cups: 'Cups', Swords: 'Swords', Pentacles: 'Coins' };

const majorNumber = (card: TarotCard) => Number(card.id.slice(0, 2));
const minorRank = (card: TarotCard) => Number(card.id.slice(-2)) - 1;

/**
 * The card's own title in a deck, where it differs from the name the
 * meanings use: "XI · La Force" for Strength in the Marseille, "VIII ·
 * Nerone" in the Sola Busca, "Three of Coins" for the Three of Pentacles.
 * Null for the Rider–Waite–Smith, whose titles are the app's own.
 */
export function deckCardTitle(deck: DeckId, idOrName: string): string | null {
  const card = TAROT_DECK.find((c) => c.id === idOrName || c.name === idOrName);
  if (!card || deck === 'rws') return null;
  if (deck === 'marseille') {
    if (card.arcana === 'major') return MARSEILLE_MAJORS[majorNumber(card)];
    const rank = FRENCH_RANKS[minorRank(card)];
    const suit = FRENCH_SUITS[card.suit!];
    return `${rank} ${/^[AÉ]/.test(suit) ? 'd’' : 'de '}${suit}`;
  }
  if (card.arcana === 'major') {
    const n = majorNumber(card);
    return n === 0 ? SOLA_BUSCA_MAJORS[0] : `${ROMAN[n]} · ${SOLA_BUSCA_MAJORS[n]}`;
  }
  const suit = SOLA_BUSCA_SUITS[card.suit!];
  return suit === card.suit ? null : card.name.replace(card.suit!, suit);
}

/** "The Fool", or "Strength (XI · La Force)" where the deck titles it differently. */
export function cardLabelIn(deck: DeckId, idOrName: string): string {
  const card = TAROT_DECK.find((c) => c.id === idOrName || c.name === idOrName);
  if (!card) return idOrName;
  const title = deckCardTitle(deck, card.id);
  return title ? `${card.name} (${title})` : card.name;
}

// ─── Pictures ────────────────────────────────────────────────────────────

/** Where a card's picture is on the website: the Rider–Waite–Smith where it always was, the others by deck. */
export function deckImagePath(deck: DeckId, cardId: string): string {
  return deck === 'rws' ? `/assets/divination/tarot/${cardId}.webp` : `/assets/divination/decks/${deck}/${cardId}.webp`;
}

/** Who drew a deck's pictures, for a picture's description: "Pamela Colman Smith’s picture". */
export function deckPictureLabel(deck: DeckId): string {
  if (deck === 'marseille') return 'from Nicolas Conver’s Tarot de Marseille';
  if (deck === 'sola-busca') return 'from the Sola Busca tarot';
  return 'Pamela Colman Smith’s picture';
}

/** All 78 ids, the same in every deck. */
export const DECK_CARD_IDS: string[] = TAROT_DECK.map((c) => c.id);
export const MAJOR_IDS: string[] = MAJORS.map((c) => c.id);
