import { Redirect, type Href } from 'expo-router';

import { DREAM_ROUTES } from '../../../../lib/grimoire/dreams';

// Symbols and moons are on the one Patterns page now.
export default function DreamSymbolsMoved() {
  return <Redirect href={DREAM_ROUTES.patterns as Href} />;
}
