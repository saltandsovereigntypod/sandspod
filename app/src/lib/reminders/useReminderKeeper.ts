// Keeps the reminders going from the moment the app opens, whichever tab is
// first: loads Sanctuary settings (holidays and the synced choices come from
// them) and your covens (planning reminders and rites), and starts the
// reminders, which reschedule each time the app comes to the front.

import { useEffect } from 'react';
import { AppState } from 'react-native';

import { syncCovenReminders } from '../covens/reminders';
import { ANCESTORS, normalizeAncestor } from '../craft/hedge/ancestors';
import { useCraft } from '../craft/store';
import { useSession } from '../session';
import { useMySettings } from '../settings/store';
import { setAncestorSources, useReminders } from './store';
import { useCalendarFeedKeeper } from './useCalendarFeed';

export function useReminderKeeper() {
  const reminders = useReminders();
  const { settings } = useMySettings();
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  useCalendarFeedKeeper(!!userId, settings as Record<string, unknown> | null, reminders.settings.phases);
  const people = useCraft<unknown>(ANCESTORS);
  useEffect(() => {
    if (people.ready) setAncestorSources(people.entries.map((e) => ({ id: e.id, createdAt: e.createdAt, data: normalizeAncestor(e.data) })));
  }, [people.entries, people.ready]);
  useEffect(() => {
    void syncCovenReminders(userId);
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void syncCovenReminders(userId);
    });
    return () => sub.remove();
  }, [userId]);
}
