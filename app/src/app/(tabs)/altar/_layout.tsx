import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '../../../theme';

// Opening one of this tab's pages from elsewhere keeps the tab's home
// underneath it, so Back always has somewhere to go.
export const unstable_settings = { initialRouteName: 'index' };

// The altar's gestures (drag, pinch, twist) need a gesture-handler root. It
// wraps just this tab so the rest of the app is untouched. The altar store
// itself is provided in the root layout.
export default function AltarLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.ground } });
