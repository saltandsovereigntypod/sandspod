import { deckReadingLines, type DeckReading } from '../../lib/divination/deckMeanings';
import { Body } from '../rituals/ui';

/**
 * Under a drawn tarot card's name, for a deck other than the
 * Rider–Waite–Smith: its name in that deck, what the deck's picture shows,
 * and whose reading follows (the deck's own, or Waite's). As on the website.
 */
export function DeckReadingLines({ reading }: { reading?: DeckReading | null }) {
  return (
    <>
      {deckReadingLines(reading).map((line, i) => (
        <Body key={i} muted>
          {line}
        </Body>
      ))}
    </>
  );
}
