// Local notifications on iPhone and Android (expo-notifications, SDK 57).
// Local notifications work in Expo Go; only push needs a development build.
// The web build uses notifier.web.ts instead, which schedules nothing.

import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { openThread } from '../covens/unread';
import { threadKey } from '../covens/unreadCount';
import { CHANNELS, channelOf } from './channels';
import type { Reminder } from './schedule';

export const remindersSupported = true;

const SOURCE = 'sanctuary-reminders';
/** The first channel, kept for the ritual step timer and coven rites (and so older reminders keep their place in Settings). */
const CHANNEL = 'moon-reminders';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // A coven message for the conversation already open in front of you stays quiet.
    const data = notification.request.content.data as { source?: string; covenId?: string; conversationId?: string | null } | undefined;
    const here = data?.source === 'coven-chat' && !!data.covenId && openThread() === threadKey(data.covenId, data.conversationId ?? null);
    return { shouldPlaySound: !here, shouldSetBadge: false, shouldShowBanner: !here, shouldShowList: !here };
  },
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

let channelsMade = false;

/**
 * One Android channel for each kind of reminder, so each can be muted or
 * given its own sound in the phone's settings. Made at run time (no native
 * build needed). Android 13+ only shows the permission prompt once a channel exists.
 */
async function ensureChannel() {
  if (Platform.OS !== 'android' || channelsMade) return;
  for (const channel of CHANNELS) {
    await Notifications.setNotificationChannelAsync(channel.id, {
      name: channel.name,
      description: channel.description,
      importance: channel.quiet ? Notifications.AndroidImportance.DEFAULT : Notifications.AndroidImportance.HIGH,
      lightColor: '#e2c36d',
    });
  }
  channelsMade = true;
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
      // Coven rites used to be scheduled on their own ('coven-rites'); they come with the rest now.
      .filter((n) => n.content.data?.source === SOURCE || n.content.data?.source === 'coven-rites')
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
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.at, channelId: channelOf(reminder.kind) },
      });
      set += 1;
    } catch {
      // One bad date shouldn't stop the rest.
    }
  }
  return set;
}

const STEP_SOURCE = 'sanctuary-ritual-step';
const STEP_ID = 'ritual-step-alarm';

/** Ring when the ritual step's timer ends (or cancel the ring). Only one is ever waiting. */
export async function setStepAlarm(alarm: { at: Date; title: string; body: string } | null): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(STEP_ID);
    if (!alarm || (await permissionState()) !== 'granted') return;
    await ensureChannel();
    await Notifications.scheduleNotificationAsync({
      identifier: STEP_ID,
      content: { title: alarm.title, body: alarm.body, sound: true, data: { source: STEP_SOURCE, url: '/rituals/run' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: alarm.at, channelId: CHANNEL },
    });
  } catch {
    // The on-screen timer still runs.
  }
}

/** Open the screen a tapped reminder points at. */
export function useReminderTaps() {
  useEffect(() => {
    const open = (notification: Notifications.Notification) => {
      const data = notification.request.content.data;
      // 'coven-rites' are coven rite reminders (lib/covens/reminders.ts); 'coven-chat' a coven message (supabase/functions/coven-notify).
      if ((data?.source === SOURCE || data?.source === STEP_SOURCE || data?.source === 'coven-rites' || data?.source === 'coven-chat') && typeof data.url === 'string') router.push(data.url as Href);
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
