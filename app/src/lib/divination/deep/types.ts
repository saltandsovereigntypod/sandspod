// The shapes of the Grimoire's longer pages on each tarot card, rune and
// ogham stave (Traditional Information → Divination). The words live in the
// files beside this one, a batch each; tarotDeep.ts and stavesDeep.ts put
// them together. Pure data.

/** Three quick words, upright: the card's one-line summary. */
export type ThreeWords = readonly [string, string, string];

export type TarotDeep = {
  words: ThreeWords;
  /** What Pamela Colman Smith painted, and its key symbols. */
  image: string;
  upright: string;
  reversed: string;
  /** Golden Dawn element, astrology and Hebrew letter; suit, number and decan; court pairing. */
  correspondences: string;
  love: string;
  work: string;
  spirit: string;
  /** A question to sit with. */
  question: string;
};

export type StaveDeep = {
  words: ThreeWords;
  /** Its shape, its name, what the name means, and its sound. */
  stave: string;
  /** Traditional meaning: the rune poems, or the word-oghams. */
  meaning: string;
  /** Reversed or merkstave, where it's commonly read (runes only; modern practice). */
  reversed?: string;
  /** Aett and position, or aicme, tree and letter. */
  correspondences: string;
  /** In readings, bindrunes and charms. */
  practice: string;
  question: string;
};
