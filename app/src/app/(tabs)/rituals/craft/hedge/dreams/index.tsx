import { Redirect, type Href } from 'expo-router';

import { DREAM_ROUTES } from '../../../../../../lib/grimoire/dreams';

// The dream journal is a section of the Grimoire now; older links (reminders,
// bookmarks, help) arrive there.
export default function HedgeDreams() {
  return <Redirect href={DREAM_ROUTES.journal as Href} />;
}
