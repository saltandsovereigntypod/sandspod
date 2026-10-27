import { useLocalSearchParams } from 'expo-router';

import { GrimoireEditScreen } from '../../../../components/grimoire/EditScreen';

export default function EditGrimoirePage() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  return <GrimoireEditScreen pageId={String(pageId ?? '')} />;
}
