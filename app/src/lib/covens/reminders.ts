// Phone reminders for coven rites you've said you'll come to (or might):
// the day before and an hour before. They're kept apart from the moon and
// ritual reminders (their own `source`), so neither clears the other, and a
// tap opens the rite (lib/reminders/notifier.ts handles taps for both).
// The web build uses reminders.web.ts, which schedules nothing.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { permissionState, requestPermission } from '../reminders/notifier';
import { fetchMyRites } from './api';
import { riteReminders } from './model';

export const COVEN_REMINDER_SOURCE = 'coven-rites';
const CHANNEL = 'moon-reminders';

/** Replace this app's coven rite reminders with the ones due now. Returns how many are set. */
export async function syncCovenReminders(userId: string | null, { ask = false } = {}): Promise<number> {
  try {
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      existing.filter((n) => n.content.data?.source === COVEN_REMINDER_SOURCE).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
    if (!userId) return 0;
    const reminders = riteReminders(await fetchMyRites(userId));
    if (!reminders.length) return 0;
    const permission = ask ? await requestPermission() : await permissionState();
    if (permission !== 'granted') return 0;
    let set = 0;
    for (const reminder of reminders) {
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: reminder.key,
          content: { title: reminder.title, body: reminder.body, data: { source: COVEN_REMINDER_SOURCE, url: reminder.url } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.at, ...(Platform.OS === 'android' ? { channelId: CHANNEL } : {}) },
        });
        set += 1;
      } catch {
        // One bad date shouldn't stop the rest.
      }
    }
    return set;
  } catch {
    // Offline or notifications unavailable: the rite still shows in the app.
    return 0;
  }
}
