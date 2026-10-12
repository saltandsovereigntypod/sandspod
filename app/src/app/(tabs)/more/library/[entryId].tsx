import { useLocalSearchParams } from 'expo-router';

import { LibraryEntryScreen } from '../../../../components/library/LibraryEntryScreen';
import { libraryHref } from '../../../../lib/library';

export default function LibraryEntryPage() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  return <LibraryEntryScreen entryId={entryId} back="/more/library" backLabel="Back to the Library" hrefFor={libraryHref} />;
}
