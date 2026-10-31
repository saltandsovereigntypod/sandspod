// A Year and a Day's progress, kept with the practice tools' synced store:
// one craft entry in 'yearday.progress', on the phone at once and in the
// account when signed in (as journey progress is). The rules are in
// ./progress.ts; this keeps the phone's reminders in step with it.

import { useCallback, useEffect, useMemo } from 'react';

import { addEntry, updateEntry, useCraft, type CraftEntry } from '../craft/store';
import { setYearReminders } from '../reminders/store';
import { config, currentYear, newYear, YEAR_COLLECTION, yearStatus, type YearProgress } from './progress';
import { dayKey, yearReminders } from './schedule';
import type { TrackId } from './plan';

export type YearEntry = CraftEntry<YearProgress>;

export type YearHandle = {
  entry: YearEntry | null;
  progress: YearProgress | null;
  ready: boolean;
  /** Change the progress (no-op before the year is begun). */
  change: (fn: (p: YearProgress) => YearProgress) => Promise<void>;
  begin: (track: TrackId, startDate: string, south?: boolean) => Promise<void>;
};

/** The year in hand, and ways to change it. Keeps its reminders scheduled while it's shown. */
export function useYear(): YearHandle {
  const { entries, ready } = useCraft<unknown>(YEAR_COLLECTION);
  const entry = useMemo(() => currentYear(entries) as YearEntry | null, [entries]);
  const progress = entry?.data ?? null;

  const change = useCallback(
    async (fn: (p: YearProgress) => YearProgress) => {
      if (!entry) return;
      const next = fn(entry.data);
      if (next !== entry.data) await updateEntry<YearProgress>(YEAR_COLLECTION, entry.id, next);
    },
    [entry],
  );
  const begin = useCallback(async (track: TrackId, startDate: string, south = false) => {
    await addEntry<YearProgress>(YEAR_COLLECTION, newYear(track, startDate, new Date(), south));
  }, []);

  const remindKey = progress ? `${progress.startDate}|${progress.remind}|${progress.stoppedAt ?? ''}|${progress.dedicatedAt ?? ''}` : '';
  useEffect(() => {
    if (!ready) return;
    const now = new Date();
    const on = !!progress && progress.remind && ['waiting', 'active', 'complete'].includes(yearStatus(progress, dayKey(now)));
    setYearReminders(on && progress ? yearReminders(config(progress), now) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the key stands in for the parts of the progress that change the reminders
  }, [ready, remindKey]);

  return { entry, progress, ready, change, begin };
}
