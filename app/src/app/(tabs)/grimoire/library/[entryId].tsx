import { useLocalSearchParams } from 'expo-router';

import { LibraryEntryView } from '../../../../components/library/LibraryEntryView';
import { grimoireLibraryHref, grimoirePracticeHref } from '../../../../lib/library';

// A Living Library entry opened from the Grimoire's My Practice or
// Traditional Information shelves, as on the website's Book of Shadows.
export default function GrimoireLibraryEntry() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  return <LibraryEntryView entryId={entryId} back="/grimoire" backLabel="Back to your Grimoire" hrefFor={grimoireLibraryHref} editHref={grimoirePracticeHref} />;
}
