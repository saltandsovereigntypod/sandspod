// The card of the day, found among the readings: a tarot reading kept from
// the "Card of the day" draw, dated today. Small and pure, so Today (app and
// website) can show it without loading the meanings.

import type { ReadingEntry } from '../craft/hedge/readings.ts';
import { localDateKey } from '../rituals/lifecycle.ts';
import { deckCardTitle, deckOfReading, type DeckId } from './decks.ts';

/** The first line of a kept card of the day's "What came up". */
export const DAILY_LABEL = 'Card of the day';

export type TodaysCard = {
  id: string;
  name: string;
  reversed: boolean;
  /** The deck it was drawn with, and the card's own name there ("XI · La Force"), if it differs. */
  deck: DeckId;
  title: string | null;
};

/** Today's kept card of the day, if there is one (the newest, if more than one). */
export function todaysCard(list: ReadingEntry[], now: Date): TodaysCard | null {
  const today = localDateKey(now);
  const kept = list
    .filter((e) => e.data.date === today && e.data.method === 'tarot' && e.data.drawn.length > 0 && e.data.cameUp.split('\n')[0] === DAILY_LABEL)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  if (!kept) return null;
  const line = kept.data.cameUp.split('\n')[1] ?? '';
  const name = kept.data.drawn[0];
  const deck = deckOfReading(kept.data);
  return { id: kept.id, name, reversed: line.startsWith(`${name}, reversed`), deck, title: deckCardTitle(deck, name) };
}

/** "Strength (XI · La Force), reversed": the card as Today shows it, with its name in the deck it was drawn with. */
export const todaysCardLabel = (card: Pick<TodaysCard, 'name' | 'reversed' | 'title'>) => `${card.name}${card.title ? ` (${card.title})` : ''}${card.reversed ? ', reversed' : ''}`;

/** Whether Today offers a card to draw (on unless turned off in Settings). */
export const drawOnToday = (settings: Record<string, unknown> | null | undefined) => settings?.today_draw !== false;
