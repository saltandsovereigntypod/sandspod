import { Tabs } from 'expo-router/js-tabs';

import { GuestMigrationPrompt } from '../../components/account/GuestMigrationPrompt';
import { TermSheet } from '../../components/astro/Explain';
import { TabBar } from '../../components/TabBar';
import { WelcomeTour } from '../../components/WelcomeTour';
import { useCandleKeeper } from '../../lib/altar/useCandleKeeper';
import { useAstroKeeper } from '../../lib/astro/store';
import { useCraftAccount } from '../../lib/craft/useCraftAccount';
import { ALTAR_MAX_WIDTH, READING_MAX_WIDTH, useDesktopLayout } from '../../lib/desktopLayout';
import { useCycleKeeper } from '../../lib/cycle/store';
import { useCovenUnreadSync } from '../../lib/covens/unread';
import { useCovenRequestsSync } from '../../lib/covens/requestsBadge';
import { useCovenInvitationsSync } from '../../lib/covens/invitationsBadge';
import { useReminderKeeper } from '../../lib/reminders/useReminderKeeper';
import { useSession } from '../../lib/session';
import { useTendReminderKeeper } from '../../lib/tend/store';
import { useAltarWidgetSync } from '../../lib/altarWidgetSync';
import { useWidgetSync } from '../../lib/widgetSync';
import { colors } from '../../theme';

export default function TabsLayout() {
  useWidgetSync();
  useAltarWidgetSync();
  useCandleKeeper();
  useCraftAccount();
  useCovenUnreadSync();
  useCovenRequestsSync();
  useCovenInvitationsSync();
  useReminderKeeper();
  useTendReminderKeeper();
  // Cycle & Moon's reminders and Today's card are ready from the start (lib/cycle/store.ts).
  const { ready, session } = useSession();
  // On a computer screen (web only): tabs down the left, screens in a centred column.
  const desktop = useDesktopLayout();
  useCycleKeeper(ready ? (session?.user.id ?? null) : undefined);
  // The birth-chart vault too, so Today's line from your chart is ready (lib/astro/store.ts).
  useAstroKeeper(ready ? (session?.user.id ?? null) : undefined);
  return (
    <>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarPosition: desktop ? 'left' : 'bottom',
          sceneStyle: desktop
            ? {
                backgroundColor: colors.ground,
                width: '100%',
                maxWidth: route.name === 'altar' ? ALTAR_MAX_WIDTH : READING_MAX_WIDTH,
                alignSelf: 'center',
              }
            : { backgroundColor: colors.ground },
        })}
      >
        <Tabs.Screen name="today" />
        <Tabs.Screen name="altar" />
        <Tabs.Screen name="grimoire" />
        <Tabs.Screen name="rituals" />
        <Tabs.Screen name="coven" />
        <Tabs.Screen name="more" />
      </Tabs>
      <WelcomeTour />
      <GuestMigrationPrompt />
      {/* The one astrology explanation sheet: any tappable term opens it (components/astro/Explain.tsx). */}
      <TermSheet />
    </>
  );
}
