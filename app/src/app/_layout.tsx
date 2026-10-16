import {
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import { SourceSerif4_400Regular, SourceSerif4_600SemiBold } from '@expo-google-fonts/source-serif-4';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { UpdateBanner } from '../components/UpdateBanner';
import { PasswordRecovery } from '../components/PasswordRecovery';
import { useAccessibilityLoaded, useReducedMotion } from '../lib/accessibility/store';
import { AltarProvider } from '../lib/altar/store';
import { GrimoireProvider } from '../lib/grimoire/store';
import { registerServiceWorker } from '../lib/offline/serviceWorker';
import { turnScreen } from '../lib/screenOrientation';
import { SessionProvider, useSession } from '../lib/session';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Upright everywhere; only the full-screen altar turns sideways.
  useEffect(() => {
    void turnScreen(false);
  }, []);
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <SessionProvider>
      <GrimoireProvider>
        {/* App-wide so a running ritual can work the candles on its linked altar. */}
        <AltarProvider>
          <RootStack />
        </AltarProvider>
      </GrimoireProvider>
    </SessionProvider>
  );
}

function RootStack() {
  const { ready, passwordRecovery } = useSession();
  // This device's accessibility choices for the guest or account, read before the first screen shows.
  const accessibilityLoaded = useAccessibilityLoaded();
  const reduceMotion = useReducedMotion();
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    SourceSerif4_400Regular,
    SourceSerif4_600SemiBold,
  });
  // Only the first opening waits on them: a later sign-in switches choices without closing every screen.
  const [opened, setOpened] = useState(false);
  const loaded = opened || (ready && (fontsLoaded || !!fontError) && accessibilityLoaded);
  if (loaded && !opened) setOpened(true);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.ground },
          animation: reduceMotion ? 'none' : 'fade',
        }}
      />
      <UpdateBanner />
      {passwordRecovery && <PasswordRecovery />}
    </>
  );
}
