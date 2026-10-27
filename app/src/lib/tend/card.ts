// The one "To tend" card on the Altar tab. When something on your altars
// wants tending, its words are the most pressing thing ("The bay sprig on your
// Healing altar has faded. 2 more offerings want tending too.") and it can
// open that altar; otherwise it says what the To tend list holds. Either way
// a tap opens the To tend list. Pure, so it can be tested.

import { tendingNote, type OfferingDue } from '../altar/offerings.ts';
import { wateringNote, type WateringDue } from '../altar/pottedPlants.ts';

export const TEND_CARD_GENERAL = 'Every petition, candle, offering and plant you tend, and what you hold in your covens, in one list.';

export type TendCard = {
  /** What the card says. */
  body: string;
  /** Something specific wants tending now. */
  pressing: boolean;
  /** The altar the most pressing thing is on, to open it directly; null when nothing is due. */
  altarId: string | null;
  altarName: string;
};

/** The card's words, from the offerings due and the plants that want water (each soonest first). */
export function tendCard(due: OfferingDue[], thirsty: WateringDue[]): TendCard {
  const note = [tendingNote(due), wateringNote(thirsty)].filter(Boolean).join(' ');
  if (!note) return { body: TEND_CARD_GENERAL, pressing: false, altarId: null, altarName: '' };
  const first = due[0] ?? null;
  const plant = thirsty[0] ?? null;
  return {
    body: note,
    pressing: true,
    altarId: first?.altarId ?? plant?.altarId ?? null,
    altarName: (first?.altarName ?? plant?.altarName ?? '').trim(),
  };
}
