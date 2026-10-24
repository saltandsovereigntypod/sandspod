import { useEffect, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Tabs } from 'expo-router/js-tabs';

import { useAltarFullScreen } from '../lib/altarFullScreen';
import { lastPracticeSection, rememberPracticeSection } from '../lib/practiceSection';
import { colors, fonts } from '../theme';
import { Icon, type IconName } from './Icon';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

// Today · Altar · Practice · Coven · More. Practice holds two routes,
// Grimoire and Rituals (switched at the top of their screens by
// PracticeSwitch); the tab reopens whichever was used last.
const TABS: { key: string; label: string; icon: IconName; routes: string[] }[] = [
  { key: 'today', label: 'Today', icon: 'today', routes: ['today'] },
  { key: 'altar', label: 'Altar', icon: 'altar', routes: ['altar'] },
  { key: 'practice', label: 'Practice', icon: 'grimoire', routes: ['grimoire', 'rituals'] },
  { key: 'coven', label: 'Coven', icon: 'coven', routes: ['coven'] },
  { key: 'more', label: 'More', icon: 'more', routes: ['more'] },
];

export function TabBar({ state, navigation, insets }: TabBarProps) {
  const current = state.routes[state.index]?.name;
  useEffect(() => {
    if (current === 'grimoire' || current === 'rituals') rememberPracticeSection(current);
  }, [current]);
  // The full-screen altar uses the whole screen.
  if (useAltarFullScreen()) return null;
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      {TABS.map((tab) => {
        const focused = tab.routes.includes(current ?? '');
        const name = tab.key === 'practice' ? (focused ? current! : lastPracticeSection()) : tab.routes[0];
        const route = state.routes.find((r) => r.name === name);
        if (!route) return null;
        const color = focused ? colors.gold : colors.tabInactive;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            aria-selected={focused}
            accessibilityLabel={tab.label}
            style={styles.tab}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
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
