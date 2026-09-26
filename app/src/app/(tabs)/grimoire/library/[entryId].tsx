import { useLocalSearchParams } from 'expo-router';

import { LibraryEntryScreen } from '../../../../components/library/LibraryEntryScreen';
import { grimoireLibraryHref } from '../../../../lib/grimoire/libraryShelves';

// A Living Library entry opened from the Book of Shadows shelves, kept in the
// Grimoire tab so Back returns to the book.
export default function GrimoireLibraryEntry() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  return <LibraryEntryScreen entryId={entryId} back="/grimoire" backLabel="Back to the Book of Shadows" hrefFor={grimoireLibraryHref} />;
}
