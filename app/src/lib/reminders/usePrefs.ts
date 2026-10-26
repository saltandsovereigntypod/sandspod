// The synced reminder choices (prefs.ts) for the screens: read from Sanctuary
// settings (or worked out from the older choices before they're first
// saved), and saved back with the rest of the settings row.

import { useCallback, useMemo } from 'react';

import { useMySettings } from '../settings/store';
import { PREFS_KEY, prefsValue, readPrefs, type ReminderPrefs } from './prefs';
import { remindersPrefsChanged, useReminders } from './store';

export function useReminderPrefs() {
  const { settings, save } = useMySettings();
  const { settings: legacy } = useReminders();
  const prefs = useMemo(() => readPrefs(settings, legacy), [settings, legacy]);
  const update = useCallback(
    async (next: ReminderPrefs) => {
      if (!settings) return;
      try {
        await save({ ...settings, [PREFS_KEY]: prefsValue(next) });
      } catch {
        // Kept on this phone; it syncs the next time settings are saved.
      }
      await remindersPrefsChanged(next);
    },
    [settings, save],
  );
  return { prefs, update, settings, ready: !!settings };
}
