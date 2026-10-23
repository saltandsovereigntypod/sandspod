// The card of the day, found among the readings: a tarot reading kept from
// the "Card of the day" draw, dated today. Small and pure, so Today (app and
// website) can show it without loading the whole deck.

import type { ReadingEntry } from '../craft/hedge/readings.ts';
import { localDateKey } from '../rituals/lifecycle.ts';

/** The first line of a kept card of the day's "What came up". */
export const DAILY_LABEL = 'Card of the day';

export type TodaysCard = { id: string; name: string; reversed: boolean };

/** Today's kept card of the day, if there is one (the newest, if more than one). */
export function todaysCard(list: ReadingEntry[], now: Date): TodaysCard | null {
  const today = localDateKey(now);
  const kept = list
    .filter((e) => e.data.date === today && e.data.method === 'tarot' && e.data.drawn.length > 0 && e.data.cameUp.split('\n')[0] === DAILY_LABEL)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  if (!kept) return null;
  const line = kept.data.cameUp.split('\n')[1] ?? '';
  return { id: kept.id, name: kept.data.drawn[0], reversed: line.startsWith(`${kept.data.drawn[0]}, reversed`) };
}

/** Whether Today offers a card to draw (on unless turned off in Settings). */
export const drawOnToday = (settings: Record<string, unknown> | null | undefined) => settings?.today_draw !== false;
