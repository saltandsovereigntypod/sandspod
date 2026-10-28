// A settings page opened from Today, the Altar, the Grimoire or Rituals, shown
// inside that tab (`<tab>/settings/[page]`, from lib/settings/links.ts
// settingsHref), so Back returns where you came from. The pages themselves
// live under More → Settings; an unknown page opens the Settings list.

import { Redirect, useLocalSearchParams } from 'expo-router';
import type { ReactElement } from 'react';

import CalendarSettings from '../../app/(tabs)/more/settings/calendar';
import DeitySettings from '../../app/(tabs)/more/settings/deities';
import DivinationSettings from '../../app/(tabs)/more/settings/divination';
import LocationSettings from '../../app/(tabs)/more/settings/location';
import Notifications from '../../app/(tabs)/more/settings/notifications';
import PracticeSettings from '../../app/(tabs)/more/settings/practice';
import TodaySettings from '../../app/(tabs)/more/settings/today';
import { isTabSettingsPage, type TabSettingsPage as Page } from '../../lib/settings/links';

const PAGES: Record<Page, () => ReactElement> = {
  practice: PracticeSettings,
  deities: DeitySettings,
  calendar: CalendarSettings,
  today: TodaySettings,
  location: LocationSettings,
  divination: DivinationSettings,
  notifications: Notifications,
};

export function TabSettingsPage() {
  const { page } = useLocalSearchParams<{ page?: string }>();
  if (!isTabSettingsPage(page)) return <Redirect href="/more/settings" />;
  const Shown = PAGES[page];
  return <Shown />;
}
