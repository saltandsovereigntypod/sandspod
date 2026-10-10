import { useLocalSearchParams } from 'expo-router';

import { LibraryEntryView } from '../../../../components/library/LibraryEntryView';
import { libraryHref, libraryPracticeHref } from '../../../../lib/library';

export default function LibraryEntryPage() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  return <LibraryEntryView entryId={entryId} back="/more/library" backLabel="Back to the Library" hrefFor={libraryHref} editHref={libraryPracticeHref} />;
}
