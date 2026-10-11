import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '../../components/TabBar';
import { useWidgetSync } from '../../lib/widgetSync';
import { colors } from '../../theme';

export default function TabsLayout() {
  useWidgetSync();
  return (
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
  );
}
