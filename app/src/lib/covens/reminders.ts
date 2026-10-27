// Phone reminders for your covens: rites you've said you'll come to (or
// might), the day before and an hour before; and, for covens you lead,
// time to plan a ritual for the coven's holidays and to prepare its rites
// (Reminders → Ritual planning); and what a rite asks you to write or bring
// ahead of time, two days before it. This reads your covens and hands them to
// the reminders (lib/reminders/store.ts), which schedule them with
// everything else, so quiet hours, the pause and the phone's limit hold for
// them too, and a tap opens the rite or the coven.
// The web build uses reminders.web.ts, which schedules nothing.

import { permissionState, requestPermission } from '../reminders/notifier';
import { covenSources } from '../reminders/covens';
import { setCovenSources } from '../reminders/store';
import { fetchMyContributions, fetchMyPrepTicks, fetchMyRites, fetchMyStandings, fetchRecentlyEnded, fetchSteps } from './api';
import { afterwardsTasks, prepTasks } from './builder';
import { ritualTasks } from './contributions';
import { riteReminders } from './model';
import { assigneesOf } from './picker';

export const COVEN_REMINDER_SOURCE = 'coven-rites';

/** Read your covens and their rites and hand them to the reminders. Returns how many rite reminders are set. */
export async function syncCovenReminders(userId: string | null, { ask = false } = {}): Promise<number> {
  try {
    if (!userId) {
      setCovenSources([]);
      return 0;
    }
    const [rites, standings] = await Promise.all([fetchMyRites(userId), fetchMyStandings(userId).catch(() => [])]);
    // What you're asked to write or bring before each rite, reminded two days ahead.
    const [steps, mine] = await Promise.all([fetchSteps(rites.map((r) => r.ritual.id)).catch(() => []), fetchMyContributions(userId).catch(() => [])]);
    const done = mine.map((c) => ({ step_id: c.step_id, mine: true }));
    // The checklist before each rite you're coming to, and after a rite: clearing the altar (its leader) and any follow-up.
    const [ticks, ended] = await Promise.all([fetchMyPrepTicks(userId), fetchRecentlyEnded(userId).catch(() => [])]);
    const coming = rites.filter((r) => r.response === 'going' || r.response === 'maybe');
    const tasks = standings.flatMap((st) => {
      const here = (list: typeof rites) => list.filter((r) => r.coven.id === st.coven.id);
      return [
        ...ritualTasks(here(rites).map((r) => r.ritual), steps, done, st.membership, userId, assigneesOf),
        ...prepTasks(here(coming).map((r) => r.ritual), ticks),
        ...afterwardsTasks(ended.filter((r) => r.coven_id === st.coven.id), userId),
      ].map((t) => ({ ...t, covenId: st.coven.id }));
    });
    setCovenSources(covenSources(standings, rites, userId, new Date(), 90, tasks));
    const count = riteReminders(rites).length;
    if (!count) return 0;
    const permission = ask ? await requestPermission() : await permissionState();
    return permission === 'granted' ? count : 0;
  } catch {
    // Offline or notifications unavailable: the rite still shows in the app.
    return 0;
  }
}
