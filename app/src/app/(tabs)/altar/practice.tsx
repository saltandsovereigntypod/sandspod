import { useLocalSearchParams } from 'expo-router';

import { PracticeEditor } from '../../../components/library/PracticeEditor';
import { altarLibraryHref } from '../../../lib/library';

// Add or edit My Practice for an entry opened from the altar.
export default function AltarPractice() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  return (
    <PracticeEditor
      entryId={entryId || undefined}
      back={entryId ? altarLibraryHref({ id: entryId }) : '/altar'}
      backLabel={entryId ? 'Back to the entry' : 'Back to the altar'}
      hrefFor={altarLibraryHref}
    />
  );
}
