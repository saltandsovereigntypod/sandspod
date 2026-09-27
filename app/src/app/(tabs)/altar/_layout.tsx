import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AltarProvider } from '../../../lib/altar/store';
import { colors } from '../../../theme';

// The altar's gestures (drag, pinch, twist) need a gesture-handler root. It
// wraps just this tab so the rest of the app is untouched.
export default function AltarLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AltarProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }} />
      </AltarProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.ground } });
