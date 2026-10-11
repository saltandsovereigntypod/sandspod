import { useLocalSearchParams } from 'expo-router';

import { LibraryEntryView } from '../../../../components/library/LibraryEntryView';
import { todayLibraryHref, todayPracticeHref } from '../../../../lib/library';

// A Living Library entry opened from Today's correspondences.
export default function TodayLibraryEntry() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  return <LibraryEntryView entryId={entryId} back="/today" backLabel="Back to Today" hrefFor={todayLibraryHref} editHref={todayPracticeHref} />;
}
