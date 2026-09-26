import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Tabs } from 'expo-router/js-tabs';

import { colors, fonts } from '../theme';
import { Icon, type IconName } from './Icon';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TABS: Record<string, { label: string; icon: IconName }> = {
  today: { label: 'Today', icon: 'today' },
  altar: { label: 'Altar', icon: 'altar' },
  grimoire: { label: 'Grimoire', icon: 'grimoire' },
  rituals: { label: 'Rituals', icon: 'rituals' },
  more: { label: 'More', icon: 'more' },
};

export function TabBar({ state, navigation, insets }: TabBarProps) {
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const color = focused ? colors.gold : colors.tabInactive;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            style={styles.tab}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (event.defaultPrevented) return;
              // A tab always opens on its home screen. Links from other tabs (the moon
              // on Today opens Moon reminders) would otherwise leave that screen in
              // the tab, so pressing the tab showed it instead of the tab's home.
              // Navigating to the tab's `index` goes back to it if it's in the tab's
              // stack and opens it if it isn't; after a page reload the tab's stored
              // state can't be relied on, so this doesn't try to read it.
              if (route.name === 'today') {
                if (!focused) navigation.navigate(route.name, route.params);
              } else {
                navigation.navigate(route.name, { screen: 'index' });
              }
            }}
          >
            <Icon name={tab.icon} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.night,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(244,236,216,0.14)',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontFamily: fonts.body, fontSize: 11 },
});
