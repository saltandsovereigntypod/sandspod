// The Grimoire's page on each of the 78 cards: three quick words, then the
// card in depth (its image, upright, reversed, correspondences, and how it
// reads in love, work and practice, with a question to sit with). The words
// are in deep/, a batch per arcana and suit. Shared with the website through
// scripts/core/divination-library.ts. Pure.

import { CUPS_DEEP } from './deep/tarotCups.ts';
import { MAJORS_DEEP } from './deep/tarotMajors.ts';
import { PENTACLES_DEEP } from './deep/tarotPentacles.ts';
import { SWORDS_DEEP } from './deep/tarotSwords.ts';
import { WANDS_DEEP } from './deep/tarotWands.ts';
import type { TarotDeep, ThreeWords } from './deep/types.ts';
import { TAROT_DECK, type TarotCard } from './tarot.ts';

export type { TarotDeep, ThreeWords } from './deep/types.ts';

export const TAROT_DEEP: Record<string, TarotDeep> = { ...MAJORS_DEEP, ...WANDS_DEEP, ...CUPS_DEEP, ...SWORDS_DEEP, ...PENTACLES_DEEP };

/** The sections of a card's page, in order. */
export const TAROT_SECTIONS: { key: Exclude<keyof TarotDeep, 'words'>; label: string }[] = [
  { key: 'image', label: 'The image' },
  { key: 'upright', label: 'Upright' },
  { key: 'reversed', label: 'Reversed' },
  { key: 'correspondences', label: 'Correspondences' },
  { key: 'love', label: 'In love and relationships' },
  { key: 'work', label: 'In work and money' },
  { key: 'spirit', label: 'In spirit and practice' },
  { key: 'question', label: 'A question to sit with' },
];

/** "Beginnings · trust · freedom", the card's one-line summary. */
export const wordsLine = (words: ThreeWords) => words.map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(' · ');

export const tarotDeep = (id: string): TarotDeep | null => TAROT_DEEP[id] ?? null;

/** The deck in the Grimoire's order, Major Arcana then Wands, Cups, Swords and Pentacles, each with its group. */
export const TAROT_GROUPS: { key: string; label: string; cards: TarotCard[] }[] = [
  { key: 'major', label: 'Major Arcana', cards: TAROT_DECK.filter((c) => c.arcana === 'major') },
  ...(['Wands', 'Cups', 'Swords', 'Pentacles'] as const).map((suit) => ({
    key: suit.toLowerCase(),
    label: suit,
    cards: TAROT_DECK.filter((c) => c.suit === suit),
  })),
];
