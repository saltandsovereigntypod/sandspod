// Local notifications on iPhone and Android (expo-notifications, SDK 57).
// Local notifications work in Expo Go; only push needs a development build.
// The web build uses notifier.web.ts instead, which schedules nothing.

import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import type { Reminder } from './schedule';

export const remindersSupported = true;

const SOURCE = 'sanctuary-reminders';
const CHANNEL = 'moon-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export async function permissionState(): Promise<PermissionState> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return 'granted';
    return settings.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'unavailable';
  }
}

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  // Android 13+ only shows the permission prompt once a channel exists.
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Moon and ritual reminders',
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: '#e2c36d',
  });
}

export async function requestPermission(): Promise<PermissionState> {
  try {
    await ensureChannel();
    const current = await permissionState();
    if (current === 'granted') return current;
    await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
    return permissionState();
  } catch {
    return 'unavailable';
  }
}

/** Replace every reminder this app scheduled with `reminders`. Returns how many are set. */
export async function applySchedule(reminders: Reminder[]): Promise<number> {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    existing
      .filter((n) => n.content.data?.source === SOURCE)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (!reminders.length || (await permissionState()) !== 'granted') return 0;
  await ensureChannel();
  let set = 0;
  for (const reminder of reminders) {
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: reminder.key,
        content: { title: reminder.title, body: reminder.body, data: { source: SOURCE, url: reminder.url } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.at, channelId: CHANNEL },
      });
      set += 1;
    } catch {
      // One bad date shouldn't stop the rest.
    }
  }
  return set;
}

/** Open the screen a tapped reminder points at. */
export function useReminderTaps() {
  useEffect(() => {
    const open = (notification: Notifications.Notification) => {
      const data = notification.request.content.data;
      if (data?.source === SOURCE && typeof data.url === 'string') router.push(data.url as Href);
    };
    try {
      const last = Notifications.getLastNotificationResponse();
      if (last?.notification) {
        open(last.notification);
        Notifications.clearLastNotificationResponse();
      }
    } catch {
      // Not available on every platform version.
    }
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => open(response.notification));
    return () => subscription.remove();
  }, []);
}
