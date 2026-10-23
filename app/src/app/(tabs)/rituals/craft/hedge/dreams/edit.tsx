import { Redirect, useLocalSearchParams, type Href } from 'expo-router';

import { DREAM_ROUTES } from '../../../../../../lib/grimoire/dreams';

// Writing a dream happens in the Grimoire's Dreams section now.
export default function HedgeDreamEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <Redirect href={(id ? DREAM_ROUTES.edit(id) : DREAM_ROUTES.write) as Href} />;
}
