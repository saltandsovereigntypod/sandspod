// The shape of a tarot deck's own meanings, card by card: what the deck's
// picture shows, how it reads upright and reversed, and a note on how it
// differs from the Rider–Waite–Smith or where the reading comes from. Shared
// by every deck that has its own reading (marseille.ts, solaBusca.ts). Pure.

import type { Meaning } from '../tarot.ts';

export type DeckCardMeaning = {
  /** The card's name in this deck, when it differs ("Il Bagatto", "Panfilio"); else omit. */
  title?: string;
  /** What this deck's picture shows, one or two sentences. */
  picture: string;
  upright: Meaning; // { keywords, text } as in tarot.ts
  reversed: Meaning;
  /** Optional: how this card differs from the RWS reading, or a note on sources. */
  note?: string;
};

export type DeckMeanings = Record<string /* card id as in tarot.ts, e.g. "00-the-fool", "cups-07" */, DeckCardMeaning>;
