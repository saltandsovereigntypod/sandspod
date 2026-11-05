// Precognition: "Tomorrow's card". Today you say what you think the card of the
// day will be tomorrow (a suit or the major arcana, a number or court rank,
// or only your impressions). Once the day has come and its card has been drawn
// in Divination, the guess is resolved against it and scored. Pure.

import { tarotCard } from '../../divination/tarot.ts';
import { dateFromKey, localDateKey } from '../../rituals/lifecycle.ts';

export type PrecogSuit = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';

export const PRECOG_SUITS: { id: PrecogSuit; label: string }[] = [
  { id: 'major', label: 'A major arcana card' },
  { id: 'wands', label: 'Wands' },
  { id: 'cups', label: 'Cups' },
  { id: 'swords', label: 'Swords' },
  { id: 'pentacles', label: 'Pentacles' },
];

/** Court ranks sit above ten, as the card ids do: 11 Page, 12 Knight, 13 Queen, 14 King. */
export const MINOR_RANKS: { n: number; label: string }[] = [
  { n: 1, label: 'Ace' },
  ...Array.from({ length: 9 }, (_, i) => ({ n: i + 2, label: String(i + 2) })),
  { n: 11, label: 'Page' },
  { n: 12, label: 'Knight' },
  { n: 13, label: 'Queen' },
  { n: 14, label: 'King' },
];

export type PrecogGuess = {
  /** Suit or major arcana, or '' to leave it. */
  suit: PrecogSuit | '';
  /** The number or rank: 0 to 21 for a major, 1 to 14 for a minor, or null. */
  number: number | null;
  /** Your impressions, in your words. */
  text: string;
};

export type DrawnCard = { id: string; name: string; suit: PrecogSuit; number: number };

/** A tarot card by name or id, as suit-or-major and number. Null when it isn't a tarot card. */
export function describeCard(nameOrId: string): DrawnCard | null {
  const card = tarotCard(nameOrId);
  if (!card) return null;
  const n = Number(card.id.match(/(\d+)$/)?.[1] ?? card.id.match(/^(\d+)/)?.[1]);
  const number = card.arcana === 'major' ? Number(card.id.slice(0, 2)) : n;
  return { id: card.id, name: card.name, suit: card.arcana === 'major' ? 'major' : (card.suit!.toLowerCase() as PrecogSuit), number };
}

/** The chance a suit-or-major call is right by luck: 22 majors and 14 of each suit, of 78. */
export const suitChance = (suit: PrecogSuit) => (suit === 'major' ? 22 : 14) / 78;

export type PrecogScore = {
  exact: boolean;
  /** The suit (or major arcana) matched, or null when none was named. */
  suit: boolean | null;
  number: boolean | null;
  /** Major or minor matched (major guesses and minor guesses both count); null when no suit was named. */
  arcana: boolean | null;
};

/** Score a guess against the card that came. */
export function scorePrecog(guess: PrecogGuess, card: DrawnCard): PrecogScore {
  const suit = guess.suit ? guess.suit === card.suit : null;
  const number = guess.number === null ? null : guess.number === card.number;
  const arcana = guess.suit ? (guess.suit === 'major') === (card.suit === 'major') : null;
  return { exact: suit === true && number === true, suit, number, arcana };
}

/** Whether the guess names something that can be scored. */
export const isScorable = (g: PrecogGuess) => !!g.suit;

export type PrecogEntry = {
  /** The day the guess was made. */
  date: string;
  /** The day whose card it is about. */
  forDate: string;
  guess: PrecogGuess;
  status: 'waiting' | 'resolved' | 'missed';
  card?: DrawnCard;
  score?: PrecogScore;
};

/** The day after a day key. */
export function nextDay(key: string): string {
  const d = dateFromKey(key) ?? new Date();
  return localDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
}

/** How many days after its day a guess still waits for a card to be drawn before it is let go. */
export const WAIT_DAYS = 7;

/**
 * Resolve a waiting guess. `cardFor(day)` is the card of the day drawn on that
 * day (Divination's "Card of the day"), if any. Nothing before the day itself
 * has ended; a guess whose day has passed with no card drawn is let go after a
 * week. Returns the entry unchanged while it still waits.
 */
export function resolvePrecog(entry: PrecogEntry, cardFor: (day: string) => string | null, today: string): PrecogEntry {
  if (entry.status !== 'waiting' || entry.forDate > today) return entry;
  const name = cardFor(entry.forDate);
  const card = name ? describeCard(name) : null;
  if (card) return { ...entry, status: 'resolved', card, score: scorePrecog(entry.guess, card) };
  const lapse = dateFromKey(entry.forDate);
  const now = dateFromKey(today);
  if (lapse && now && (now.getTime() - lapse.getTime()) / 86_400_000 > WAIT_DAYS) return { ...entry, status: 'missed' };
  return entry;
}
