import { router, type Href } from 'expo-router';

import { divinationReadingRoute, refForDrawn } from '../../lib/divination/links';
import { useMySettings } from '../../lib/settings/store';
import { Button } from '../Button';

/**
 * "Read more" under a drawn card's or stave's meaning: its page in the
 * Grimoire's Traditional Information, opened on top of the reading so Back
 * returns to it. Hidden when Traditional Information is turned off, as the
 * rest of that shelf is. A tarot card's page opens in the deck it was
 * drawn with (`deck`).
 */
export function ReadMore({ name, deck }: { name: string; deck?: string | null }) {
  const { settings } = useMySettings();
  const ref = refForDrawn(name);
  if (!ref || settings?.library_traditional_enabled === false) return null;
  return <Button label="Read more" variant="text" onPress={() => router.push(divinationReadingRoute(ref, deck) as Href)} />;
}
