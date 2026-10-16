import { useLocalSearchParams } from 'expo-router';

import { LibraryEntryView } from '../../../../components/library/LibraryEntryView';
import { ritualsLibraryHref, ritualsPracticeHref } from '../../../../lib/library';

// A Living Library entry opened from a premade ritual's ingredients.
export default function RitualsLibraryEntry() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  return <LibraryEntryView entryId={entryId} back="/rituals/premade" backLabel="Back" hrefFor={ritualsLibraryHref} editHref={ritualsPracticeHref} />;
}
