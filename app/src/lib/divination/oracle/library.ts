// Lenormand and Kipper as Traditional Information in the Grimoire, beside
// tarot, runes and ogham (library.ts puts them in its drop-downs): each
// card's entry, three words, and its page in sections. Pure.

import type { DivinationEntry } from '../library.ts';
import { KIPPER, type KipperCard } from './kipper.ts';
import { LENORMAND, playingCardText, type LenormandCard } from './lenormand.ts';
import { KNOWN_PAIRS, readPair } from './pairs.ts';

export const ORACLE_NOTES = {
  lenormand: 'The Petit Lenormand of thirty-six cards, read in pairs and lines. Pictures from a Belgian printing of the 1890s.',
  kipper: 'The thirty-six Kipper cards of 1890s Munich: people and situations, read around the main person.',
};

export const fromLenormand = (card: LenormandCard): DivinationEntry => ({
  kind: 'lenormand',
  id: card.id,
  name: card.name,
  words: card.words,
  cardId: null,
  glyph: card.playing,
  lenormandId: card.id,
});

export const fromKipper = (card: KipperCard): DivinationEntry => ({
  kind: 'kipper',
  id: card.id,
  name: card.name,
  words: card.words,
  cardId: null,
  glyph: String(card.number),
  lenormandId: null,
});

/** Twelve to a drop-down, so a phone's list stays short. */
const thirds = <T extends { number: number }>(cards: T[], to: (c: T) => DivinationEntry) =>
  [0, 12, 24].map((start) => ({ key: `${start + 1}-${start + 12}`, label: `Cards ${start + 1} to ${start + 12}`, entries: cards.slice(start, start + 12).map(to) }));

export const lenormandSubgroups = () => thirds(LENORMAND, fromLenormand);
export const kipperSubgroups = () => thirds(KIPPER, fromKipper);

/** The sections of a Lenormand card's page, in order. */
export const LENORMAND_SECTIONS = [
  { key: 'image', label: 'The card' },
  { key: 'meaning', label: 'Its meaning' },
  { key: 'subject', label: 'As the subject' },
  { key: 'modifier', label: 'As the modifier' },
  { key: 'pairs', label: 'In pairs' },
  { key: 'timing', label: 'Timing' },
  { key: 'playing', label: 'The playing card' },
  { key: 'house', label: 'As a house in the Grand Tableau' },
  { key: 'question', label: 'A question to sit with' },
] as const;

export const KIPPER_SECTIONS = [
  { key: 'card', label: 'The card' },
  { key: 'meaning', label: 'Its meaning' },
  { key: 'love', label: 'In love and close ties' },
  { key: 'work', label: 'In work and money' },
  { key: 'nearFar', label: 'Near the main person, and far' },
  { key: 'question', label: 'A question to sit with' },
] as const;

/** A few pairs this card is part of, with the readings most readers share. */
function pairsText(card: LenormandCard): string {
  const mine = KNOWN_PAIRS.filter((t) => t.split(' + ').includes(card.name)).slice(0, 3);
  const lines = mine.map((t) => {
    const [a, b] = t.split(' + ');
    const p = readPair(a, b)!;
    return `${p.title}: ${p.text.split('. ')[0]}.`;
  });
  return [
    `Read first, ${card.name} is ${card.noun}; read second, it makes the card before it ${card.adjective}.`,
    ...lines,
  ].join(' ');
}

export function lenormandPage(card: LenormandCard): { eyebrow: string; gloss: string; sections: { key: string; label: string; text: string }[] } {
  const text: Record<string, string> = {
    image: `${card.image} In its corner, the ${card.playingName}.`,
    meaning: `${card.meaning.text}`,
    subject: card.subject,
    modifier: card.modifier,
    pairs: pairsText(card),
    timing: `${card.timing} Timing in Lenormand is a modern art and readers differ; take it as a hint, not a date.`,
    playing: playingCardText(card),
    house: card.house,
    question: card.question,
  };
  return {
    eyebrow: `Lenormand · ${card.number} of 36`,
    gloss: `${card.playingName}`,
    sections: LENORMAND_SECTIONS.map((s) => ({ key: s.key, label: s.label, text: text[s.key] })).filter((s) => s.text),
  };
}

export function kipperPage(card: KipperCard): { eyebrow: string; gloss: string; sections: { key: string; label: string; text: string }[] } {
  const text: Record<string, string> = {
    card: `${card.card} On the German cards: ${card.german}.`,
    meaning: card.meaning.text,
    love: card.love,
    work: card.work,
    nearFar: card.nearFar,
    question: card.question,
  };
  return {
    eyebrow: `Kipper · ${card.number} of 36`,
    gloss: card.german,
    sections: KIPPER_SECTIONS.map((s) => ({ key: s.key, label: s.label, text: text[s.key] })).filter((s) => s.text),
  };
}
