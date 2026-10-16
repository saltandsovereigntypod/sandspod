// Checks for a new version whenever the app comes to the front and, once one
// has downloaded, offers to restart into it. Without this an update only
// takes effect on the second cold start, which is easy to miss.

import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { releaseScreen } from '../lib/screenOrientation';
import { colors, fonts } from '../theme';

const enabled = Platform.OS !== 'web' && !__DEV__ && Updates.isEnabled;

async function fetchIfAvailable() {
  try {
    const check = await Updates.checkForUpdateAsync();
    if (check.isAvailable) await Updates.fetchUpdateAsync();
  } catch {
    // Offline or the update server is unreachable; try again next time.
  }
}

export function UpdateBanner() {
  const { isUpdatePending } = Updates.useUpdates();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!enabled) return;
    void fetchIfAvailable();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void fetchIfAvailable();
    });
    return () => sub.remove();
  }, []);

  if (!enabled || !isUpdatePending) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="A new version is ready. Restart to use it."
      onPress={() => void releaseScreen().then(() => Updates.reloadAsync())}
      style={[styles.pill, { top: insets.top + 6 }]}
    >
      <Text style={styles.text}>A new version is ready · Restart</Text>
    </Pressable>
  );
}

/** e.g. "Updated Oct 11, 7:36 AM" for the running update, or null for the built-in version. */
export function runningUpdateLabel(): string | null {
  if (!enabled || Updates.isEmbeddedLaunch || !Updates.createdAt) return null;
  return `Updated ${Updates.createdAt.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: colors.gold,
  },
  text: { fontFamily: fonts.body, fontSize: 14, color: colors.night },
});
