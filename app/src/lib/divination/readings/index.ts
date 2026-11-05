import { READINGS as MAJORS } from './majors.ts';
import { READINGS as WANDS_CUPS } from './wands-cups.ts';
import { READINGS as SWORDS_PENTACLES } from './swords-pentacles.ts';
import type { CardReading, CardReadings } from './types.ts';

export type { CardReading, CardReadings, Lean, ReadTopic } from './types.ts';

export const TAROT_READINGS: CardReadings = { ...MAJORS, ...WANDS_CUPS, ...SWORDS_PENTACLES };

/** The written reading for a tarot card id ("00-the-fool", "cups-07"), upright or reversed. */
export function readingFor(cardId: string, reversed: boolean): CardReading | null {
  const r = TAROT_READINGS[cardId];
  return r ? (reversed ? r.rev : r.up) : null;
}
