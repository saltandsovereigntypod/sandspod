import { useLocalSearchParams } from 'expo-router';

import { GrimoireNewPageScreen } from '../../../components/grimoire/NewPageScreen';

export default function NewPage() {
  const { sectionId } = useLocalSearchParams<{ sectionId?: string }>();
  return <GrimoireNewPageScreen sectionId={sectionId} />;
}
