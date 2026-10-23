import { Redirect, type Href } from 'expo-router';

import { DREAM_ROUTES } from '../../../../../../lib/grimoire/dreams';

// Symbols and moons live in the Grimoire's Dreams section now.
export default function HedgeDreamSymbols() {
  return <Redirect href={DREAM_ROUTES.patterns as Href} />;
}
