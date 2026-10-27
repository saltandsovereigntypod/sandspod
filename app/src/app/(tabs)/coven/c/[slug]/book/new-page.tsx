import { useLocalSearchParams } from 'expo-router';

import { GrimoireNewPageScreen } from '../../../../../../components/grimoire/NewPageScreen';

// A new page in the coven's book, in a section you may write in.
export default function NewCovenBookPage() {
  const { sectionId } = useLocalSearchParams<{ sectionId?: string }>();
  return <GrimoireNewPageScreen sectionId={sectionId} />;
}
