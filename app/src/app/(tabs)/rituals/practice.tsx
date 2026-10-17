import { useLocalSearchParams } from 'expo-router';

import { PracticeEditor } from '../../../components/library/PracticeEditor';
import { ritualsLibraryHref } from '../../../lib/library';

// Add or edit My Practice for an entry opened from a ritual.
export default function RitualsPractice() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  return (
    <PracticeEditor
      entryId={entryId || undefined}
      back={entryId ? ritualsLibraryHref({ id: entryId }) : '/rituals'}
      backLabel={entryId ? 'Back to the entry' : 'Back to Rituals'}
      hrefFor={ritualsLibraryHref}
    />
  );
}
