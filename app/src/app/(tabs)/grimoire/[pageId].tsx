import { router, useLocalSearchParams } from 'expo-router';

import { Button } from '../../../components/Button';
import { GrimoirePageScreen } from '../../../components/grimoire/PageScreen';

// A page of your own grimoire. Any page can be suggested to a coven you're in.
export default function GrimoirePage() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  return (
    <GrimoirePageScreen
      pageId={String(pageId ?? '')}
      extras={(page) => (
        <Button
          label="Suggest to a coven"
          variant="outline"
          accessibilityHint="Sends a copy of this page to a coven’s book, for those who approve its pages"
          onPress={() => router.push({ pathname: '/grimoire/suggest', params: { pageId: page.id } })}
        />
      )}
    />
  );
}
