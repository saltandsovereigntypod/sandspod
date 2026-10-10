import { useLocalSearchParams } from 'expo-router';

import { PracticeEditor } from '../../../../components/library/PracticeEditor';
import { libraryHref } from '../../../../lib/library';

// Edit My Practice from More → Living Library.
export default function LibraryPractice() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  return (
    <PracticeEditor
      entryId={entryId || undefined}
      back={entryId ? libraryHref({ id: entryId }) : '/more/library'}
      backLabel={entryId ? 'Back to the entry' : 'Back to the Library'}
      hrefFor={libraryHref}
    />
  );
}
