import { useEffect, type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import type { Tabs } from 'expo-router/js-tabs';

import { useAltarFullScreen, useAltarRitualMode } from '../lib/altarFullScreen';
import { SIDEBAR_RAIL_WIDTH, SIDEBAR_WIDTH, useDesktopLayout } from '../lib/desktopLayout';
import { useRememberedTab } from '../lib/rememberedTab';
import { covenTabCount } from '../lib/covens/requests';
import { usePendingRequests } from '../lib/covens/requestsBadge';
import { useInvitationCount } from '../lib/covens/invitationsBadge';
import { useUnreadTotal } from '../lib/covens/unread';
import { lastPracticeSection, rememberPracticeSection } from '../lib/practiceSection';
import { CRAFT_HOME_ROUTE, practiceSectionOf, practiceTabRoute } from '../lib/practiceSections';
import { tabHomeHref, tabHomeReset } from '../lib/tabHome';
import { colors, fonts } from '../theme';
import { Icon, type IconName } from './Icon';
import { hoverTitle, SidebarSiteLinks, SiteSmallPrint } from './SiteLinks';

// Remembered on this device: the side bar folded to a rail of icons, the bottom bar tucked away.
const SIDEBAR_KEY = 'salt.menu.sidebar';
const BOTTOM_BAR_KEY = 'salt.menu.bottomBar';
const asSidebar = (v: unknown) => (v === 'open' || v === 'rail' ? v : null);
const asBottomBar = (v: unknown) => (v === 'shown' || v === 'tucked' ? v : null);

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
  // On a computer screen (web) the tabs run down the left as a side bar.
  const desktop = useDesktopLayout();
  const [sidebar, setSidebar] = useRememberedTab(SIDEBAR_KEY, asSidebar);
  const [bottomBar, setBottomBar] = useRememberedTab(BOTTOM_BAR_KEY, asBottomBar);
  const ritual = useAltarRitualMode();
  // The full-screen altar uses the whole screen.
  if (useAltarFullScreen()) return null;
  const rail = desktop && sidebar === 'rail';
  if (!desktop) {
    // Ritual mode on an altar: the bar steps aside until it ends.
    if (ritual) return null;
    if (bottomBar === 'tucked') {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show the menu"
          onPress={() => setBottomBar('shown')}
          style={({ pressed }) => [styles.restore, { bottom: Math.max(insets.bottom, 10) + 6, right: 16 + insets.right }, pressed && { opacity: 0.8 }]}
        >
          <Icon name="more" color={colors.gold} size={20} />
        </Pressable>
      );
    }
  }

  const tabs = TABS.map((tab) => {
    const focused = tab.routes.includes(current ?? '');
    const last = tab.key === 'practice' && !focused ? lastPracticeSection() : null;
    const name = tab.key === 'practice' ? (focused ? current! : practiceTabRoute(last!)) : tab.routes[0];
    const route = state.routes.find((r) => r.name === name);
    if (!route) return null;
    const color = focused ? colors.gold : colors.tabInactive;
    return (
      <Pressable
        key={tab.key}
        ref={hoverTitle(rail ? tab.label : null)}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        aria-selected={focused}
        accessibilityLabel={tab.key === 'coven' && unread ? `${tab.label}, ${coven.label}` : tab.label}
        style={desktop ? [styles.sideTab, rail && styles.railTab] : styles.tab}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (event.defaultPrevented) return;
          if (focused) {
            // The stack pops to its main page by itself; one opened from another tab
            // (nothing underneath the page it opened on) gets its main page back.
            const home = tabHomeReset(route as Parameters<typeof tabHomeReset>[0]);
            // In the next frame, after the stack's own pop to top: its first page becomes the main page.
            if (home) requestAnimationFrame(() => router.dismissTo(tabHomeHref(route.name, home) as Href));
            return;
          }
          // Craft last time, but the Rituals stack isn't open yet (a fresh start): open the Craft home.
          if (last === 'craft' && !route.state) navigation.navigate(route.name, { screen: CRAFT_HOME_ROUTE });
          // A tab already open shows the page you left it on. Its params can still hold the
          // screen a link once opened it on; passing them again would open that page again.
          else if (route.state) navigation.navigate(route.name);
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
        {!rail && <Text style={[desktop ? styles.sideLabel : styles.label, { color }]}>{tab.label}</Text>}
      </Pressable>
    );
  });

  if (desktop) {
    return (
      <View accessibilityRole="tablist" style={[styles.side, rail && styles.sideRail]}>
        <ScrollView contentContainerStyle={styles.sideContent} showsVerticalScrollIndicator={false}>
          {rail ? (
            <Text style={styles.mark} accessibilityLabel="Salt & Sovereignty">
              S&amp;S
            </Text>
          ) : (
            <Text style={styles.brand} numberOfLines={1}>
              Salt &amp; Sovereignty
            </Text>
          )}
          {tabs}
          <SidebarSiteLinks rail={rail} />
          <View style={styles.grow} />
          <Pressable
            ref={hoverTitle(rail ? 'Expand the menu' : 'Fold the menu')}
            accessibilityRole="button"
            accessibilityLabel={rail ? 'Expand the menu' : 'Fold the menu to icons'}
            onPress={() => setSidebar(rail ? 'open' : 'rail')}
            style={({ pressed }) => [styles.fold, rail && styles.railFold, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.foldText}>{rail ? '»' : '«'}</Text>
          </Pressable>
          {!rail && <SiteSmallPrint />}
        </ScrollView>
      </View>
    );
  }

  return (
    <View accessibilityRole="tablist" style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tuck the menu away"
        hitSlop={{ top: 10, bottom: 6, left: 24, right: 24 }}
        onPress={() => setBottomBar('tucked')}
        style={styles.handle}
      >
        <View style={styles.handleGrip} />
      </Pressable>
      <View style={styles.row}>{tabs}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.night,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(244,236,216,0.14)',
    paddingTop: 2,
    paddingHorizontal: 8,
  },
  row: { flexDirection: 'row' },
  handle: { alignSelf: 'center', paddingHorizontal: 16, paddingTop: 2, paddingBottom: 4 },
  handleGrip: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(244,236,216,0.28)' },
  restore: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.night,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  side: {
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.night,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(244,236,216,0.14)',
  },
  sideRail: { width: SIDEBAR_RAIL_WIDTH },
  sideContent: { flexGrow: 1, paddingTop: 28, paddingBottom: 8, paddingHorizontal: 8, gap: 4 },
  brand: { fontFamily: fonts.display, fontSize: 19, color: colors.cream, paddingHorizontal: 12, marginBottom: 20 },
  mark: { fontFamily: fonts.display, fontSize: 18, color: colors.gold, textAlign: 'center', marginBottom: 20 },
  railTab: { justifyContent: 'center', paddingHorizontal: 0 },
  railFold: { alignItems: 'center', paddingHorizontal: 0 },
  grow: { flexGrow: 1, minHeight: 16 },
  fold: { minHeight: 36, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 10 },
  foldText: { fontFamily: fonts.body, fontSize: 20, color: colors.tabInactive },
  sideTab: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingHorizontal: 12, borderRadius: 10 },
  sideLabel: { fontFamily: fonts.body, fontSize: 16 },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontFamily: fonts.body, fontSize: 11 },
  badge: { position: 'absolute', top: -4, right: -10, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  badgeText: { fontFamily: fonts.body, fontSize: 10, color: colors.night, fontWeight: '700' },
});
