import { useLocalSearchParams } from 'expo-router';

import { PracticeEditor } from '../../../components/library/PracticeEditor';
import { grimoireLibraryHref } from '../../../lib/library';

// New entry (no entryId) or Edit My Practice, from the Grimoire tab.
export default function GrimoirePractice() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  return (
    <PracticeEditor
      entryId={entryId || undefined}
      back={entryId ? grimoireLibraryHref({ id: entryId }) : '/grimoire'}
      backLabel={entryId ? 'Back to the entry' : 'Back to your Grimoire'}
      hrefFor={grimoireLibraryHref}
    />
  );
}
