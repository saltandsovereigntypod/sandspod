import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CovenBookScope } from '../../../../../../components/grimoire/covenBook';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { CovenGrimoireProvider } from '../../../../../../lib/grimoire/covenStore';
import { colors } from '../../../../../../theme';

// The coven's Book of Shadows: the same grimoire, editor and templates as
// your own, kept for the coven (lib/grimoire/covenStore.tsx). Every screen
// under book/ reads it through useGrimoire().
export const unstable_settings = { initialRouteName: 'index' };

export default function CovenBookLayout() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  if (!covenId) {
    return (
      <View style={styles.wait}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  return (
    <CovenGrimoireProvider covenId={covenId}>
      <CovenBookScope>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }} />
      </CovenBookScope>
    </CovenGrimoireProvider>
  );
}

const styles = StyleSheet.create({ wait: { flex: 1, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' } });
