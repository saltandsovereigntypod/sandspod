import { useLocalSearchParams } from 'expo-router';

import { GrimoireEditScreen } from '../../../../../../../components/grimoire/EditScreen';

// Writing on a page of the coven's book: the grimoire's own editor.
export default function EditCovenBookPage() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  return <GrimoireEditScreen pageId={String(pageId ?? '')} />;
}
