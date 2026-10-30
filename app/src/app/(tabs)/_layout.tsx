import { Tabs } from 'expo-router/js-tabs';

import { GuestMigrationPrompt } from '../../components/account/GuestMigrationPrompt';
import { TermSheet } from '../../components/astro/Explain';
import { TabBar } from '../../components/TabBar';
import { WelcomeTour } from '../../components/WelcomeTour';
import { useCandleKeeper } from '../../lib/altar/useCandleKeeper';
import { useAstroKeeper } from '../../lib/astro/store';
import { useCraftAccount } from '../../lib/craft/useCraftAccount';
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
  useCycleKeeper(ready ? (session?.user.id ?? null) : undefined);
  // The birth-chart vault too, so Today's line from your chart is ready (lib/astro/store.ts).
  useAstroKeeper(ready ? (session?.user.id ?? null) : undefined);
  return (
    <>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.ground } }}
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
