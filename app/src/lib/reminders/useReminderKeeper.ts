// Keeps the reminders going from the moment the app opens, whichever tab is
// first: loads Sanctuary settings (holidays and the synced choices come from
// them) and your covens (planning reminders and rites), and starts the
// reminders, which reschedule each time the app comes to the front.

import { useEffect } from 'react';
import { AppState } from 'react-native';

import { syncCovenReminders } from '../covens/reminders';
import { useSession } from '../session';
import { useMySettings } from '../settings/store';
import { useReminders } from './store';

export function useReminderKeeper() {
  useReminders();
  useMySettings();
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  useEffect(() => {
    void syncCovenReminders(userId);
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void syncCovenReminders(userId);
    });
    return () => sub.remove();
  }, [userId]);
}
