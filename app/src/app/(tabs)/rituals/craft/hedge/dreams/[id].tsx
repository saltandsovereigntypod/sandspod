import { Redirect, useLocalSearchParams, type Href } from 'expo-router';

import { DREAM_ROUTES } from '../../../../../../lib/grimoire/dreams';

// A dream opens on its page in the Grimoire now.
export default function HedgeDream() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={DREAM_ROUTES.dream(id) as Href} />;
}
