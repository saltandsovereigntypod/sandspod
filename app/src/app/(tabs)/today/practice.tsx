import { useLocalSearchParams } from 'expo-router';

import { PracticeEditor } from '../../../components/library/PracticeEditor';
import { todayLibraryHref } from '../../../lib/library';

// Add or edit My Practice for an entry opened from Today.
export default function TodayPractice() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  return (
    <PracticeEditor
      entryId={entryId || undefined}
      back={entryId ? todayLibraryHref({ id: entryId }) : '/today'}
      backLabel={entryId ? 'Back to the entry' : 'Back to Today'}
      hrefFor={todayLibraryHref}
    />
  );
}
