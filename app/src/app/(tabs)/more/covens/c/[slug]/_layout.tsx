import { Stack, useLocalSearchParams } from 'expo-router';

import { CovenProvider } from '../../../../../../lib/covens/CovenContext';
import { colors } from '../../../../../../theme';

// Every screen of one coven shares its state and one live connection.
export default function CovenLayout() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return (
    <CovenProvider slug={String(slug ?? '')}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }} />
    </CovenProvider>
  );
}
