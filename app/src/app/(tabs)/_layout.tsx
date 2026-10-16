import { Tabs } from 'expo-router/js-tabs';

import { GuestMigrationPrompt } from '../../components/account/GuestMigrationPrompt';
import { TabBar } from '../../components/TabBar';
import { WelcomeTour } from '../../components/WelcomeTour';
import { useCandleKeeper } from '../../lib/altar/useCandleKeeper';
import { useAltarWidgetSync } from '../../lib/altarWidgetSync';
import { useWidgetSync } from '../../lib/widgetSync';
import { colors } from '../../theme';

export default function TabsLayout() {
  useWidgetSync();
  useAltarWidgetSync();
  useCandleKeeper();
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
        <Tabs.Screen name="more" />
      </Tabs>
      <WelcomeTour />
      <GuestMigrationPrompt />
    </>
  );
}
