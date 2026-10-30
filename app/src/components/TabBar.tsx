import { useEffect, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Tabs } from 'expo-router/js-tabs';

import { useAltarFullScreen } from '../lib/altarFullScreen';
import { covenTabCount } from '../lib/covens/requests';
import { usePendingRequests } from '../lib/covens/requestsBadge';
import { useInvitationCount } from '../lib/covens/invitationsBadge';
import { useUnreadTotal } from '../lib/covens/unread';
import { lastPracticeSection, rememberPracticeSection } from '../lib/practiceSection';
import { CRAFT_HOME_ROUTE, practiceSectionOf, practiceTabRoute } from '../lib/practiceSections';
import { colors, fonts } from '../theme';
import { Icon, type IconName } from './Icon';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

// Today · Altar · Practice · Coven · More. Practice holds three sections,
// Grimoire, Rituals and Craft (switched at the top of their homes by
// PracticeSwitch), in two routes: Craft's screens live in the Rituals stack
// (lib/practiceSections.ts). The tab reopens whichever section was used last.
const TABS: { key: string; label: string; icon: IconName; routes: string[] }[] = [
  { key: 'today', label: 'Today', icon: 'today', routes: ['today'] },
  { key: 'altar', label: 'Altar', icon: 'altar', routes: ['altar'] },
  { key: 'practice', label: 'Practice', icon: 'grimoire', routes: ['grimoire', 'rituals'] },
  { key: 'coven', label: 'Coven', icon: 'coven', routes: ['coven'] },
  { key: 'more', label: 'More', icon: 'more', routes: ['more'] },
];

export function TabBar({ state, navigation, insets }: TabBarProps) {
  const focusedRoute = state.routes[state.index];
  const current = focusedRoute?.name;
  // The screen open inside the focused tab's stack (or the one it is opening), to tell Rituals from Craft.
  const inner = focusedRoute?.state
    ? focusedRoute.state.routes[focusedRoute.state.index ?? focusedRoute.state.routes.length - 1]?.name
    : (focusedRoute?.params as { screen?: string } | undefined)?.screen;
  const section = practiceSectionOf(current, inner);
  // Unread messages, invitations waiting for you and, for reviewers, applications and requests to advance.
  const coven = covenTabCount(useUnreadTotal(), usePendingRequests(), useInvitationCount());
  const unread = coven.count;
  useEffect(() => {
    if (section) rememberPracticeSection(section);
  }, [section]);
  // The full-screen altar uses the whole screen.
  if (useAltarFullScreen()) return null;
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      {TABS.map((tab) => {
        const focused = tab.routes.includes(current ?? '');
        const last = tab.key === 'practice' && !focused ? lastPracticeSection() : null;
        const name = tab.key === 'practice' ? (focused ? current! : practiceTabRoute(last!)) : tab.routes[0];
        const route = state.routes.find((r) => r.name === name);
        if (!route) return null;
        const color = focused ? colors.gold : colors.tabInactive;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            aria-selected={focused}
            accessibilityLabel={tab.key === 'coven' && unread ? `${tab.label}, ${coven.label}` : tab.label}
            style={styles.tab}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (focused || event.defaultPrevented) return;
              // Craft last time, but the Rituals stack isn't open yet (a fresh start): open the Craft home.
              if (last === 'craft' && !route.state) navigation.navigate(route.name, { screen: CRAFT_HOME_ROUTE });
              else navigation.navigate(route.name, route.params);
            }}
          >
            <View>
              <Icon name={tab.icon} color={color} />
              {tab.key === 'coven' && unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
                </View>
              )}
            </View>
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
  badge: { position: 'absolute', top: -4, right: -10, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  badgeText: { fontFamily: fonts.body, fontSize: 10, color: colors.night, fontWeight: '700' },
});
