// Phone reminders for your covens: rites you've said you'll come to (or
// might), the day before and an hour before; and, for covens you lead,
// time to plan a ritual for the coven's holidays and to prepare its rites
// (Reminders → Ritual planning). This reads your covens and hands them to
// the reminders (lib/reminders/store.ts), which schedule them with
// everything else, so quiet hours, the pause and the phone's limit hold for
// them too, and a tap opens the rite or the coven.
// The web build uses reminders.web.ts, which schedules nothing.

import { permissionState, requestPermission } from '../reminders/notifier';
import { covenSources } from '../reminders/covens';
import { setCovenSources } from '../reminders/store';
import { fetchMyRites, fetchMyStandings } from './api';
import { riteReminders } from './model';

export const COVEN_REMINDER_SOURCE = 'coven-rites';

/** Read your covens and their rites and hand them to the reminders. Returns how many rite reminders are set. */
export async function syncCovenReminders(userId: string | null, { ask = false } = {}): Promise<number> {
  try {
    if (!userId) {
      setCovenSources([]);
      return 0;
    }
    const [rites, standings] = await Promise.all([fetchMyRites(userId), fetchMyStandings(userId).catch(() => [])]);
    setCovenSources(covenSources(standings, rites, userId, new Date()));
    const count = riteReminders(rites).length;
    if (!count) return 0;
    const permission = ask ? await requestPermission() : await permissionState();
    return permission === 'granted' ? count : 0;
  } catch {
    // Offline or notifications unavailable: the rite still shows in the app.
    return 0;
  }
}
