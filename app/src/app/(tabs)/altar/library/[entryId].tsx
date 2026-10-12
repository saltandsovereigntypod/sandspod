import { useLocalSearchParams } from 'expo-router';

import { LibraryEntryView } from '../../../../components/library/LibraryEntryView';
import { altarLibraryHref, altarPracticeHref } from '../../../../lib/library';

// A Living Library entry opened from an altar object's About sheet.
export default function AltarLibraryEntry() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  return <LibraryEntryView entryId={entryId} back="/altar" backLabel="Back to the altar" hrefFor={altarLibraryHref} editHref={altarPracticeHref} />;
}
