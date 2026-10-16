// Journey progress, kept with the practice tools' synced store: one craft
// entry per started journey in 'journeys.progress', on the phone at once and
// in the account when signed in. The rules are in ./progress.ts.

import { useCallback, useEffect, useMemo } from 'react';

import { addEntry, updateEntry, useCraft, type CraftEntry } from '../craft/store';
import { holidayChoice, hiddenTraditions } from '../holidays';
import { findSession, useRituals } from '../rituals/store';
import { useMySettings } from '../settings/store';
import { journeyById } from './index';
import {
  journeyStatus,
  newProgress,
  normalizeProgress,
  PROGRESS_COLLECTION,
  progressFor,
  riteDone,
  type CadenceContext,
  type JourneyProgress,
} from './progress';
import type { Journey, StageKind } from './types';

export type ProgressEntry = CraftEntry<JourneyProgress>;

/** Every journey begun, newest first, with old copies filled in. */
export function useJourneyProgress(): { entries: ProgressEntry[]; ready: boolean } {
  const { entries, ready } = useCraft<JourneyProgress>(PROGRESS_COLLECTION);
  const list = useMemo(
    () => entries.filter((e) => e.data && typeof e.data.journeyId === 'string').map((e) => ({ ...e, data: normalizeProgress(e.data) })),
    [entries],
  );
  return { entries: list, ready };
}

/** The calendars the person keeps, for holy days and sabbats. */
export function useCadence(): CadenceContext {
  const { settings } = useMySettings();
  return useMemo(() => ({ choice: holidayChoice(settings), hidden: hiddenTraditions(settings) }), [settings]);
}

export async function startJourney(journeyId: string): Promise<ProgressEntry> {
  return addEntry<JourneyProgress>(PROGRESS_COLLECTION, newProgress(journeyId, new Date()));
}

export async function saveProgress(entryId: string, data: JourneyProgress): Promise<void> {
  await updateEntry<JourneyProgress>(PROGRESS_COLLECTION, entryId, data);
}

export type JourneyHandle = {
  journey: Journey | null;
  entry: ProgressEntry | null;
  progress: JourneyProgress | null;
  ready: boolean;
  /** Change the progress (no-op before the journey is begun). */
  change: (fn: (p: JourneyProgress) => JourneyProgress) => Promise<void>;
};

/**
 * One journey and its progress. While a rite begun from it is waiting to be
 * noticed, the finished ritual (on this phone or in the journal) marks it done;
 * for the dedication, that's the day of dedication.
 */
export function useJourney(journeyId: string | null | undefined): JourneyHandle {
  const journey = journeyById(journeyId);
  const { entries, ready } = useJourneyProgress();
  const rituals = useRituals();
  const entry = journey ? progressFor(entries, journey.id) : null;
  const progress = entry?.data ?? null;

  const change = useCallback(
    async (fn: (p: JourneyProgress) => JourneyProgress) => {
      if (!entry) return;
      const next = fn(entry.data);
      if (next !== entry.data) await saveProgress(entry.id, next);
    },
    [entry],
  );

  const waiting = progress
    ? (Object.entries(progress.riteSessions ?? {}) as [StageKind, string][]).filter(([kind]) => !progress.ritesDoneAt?.[kind])
    : [];
  const waitingKey = waiting.map(([k, id]) => `${k}:${id}`).join(',');
  const activeId = rituals.active?.id ?? null;
  const journalKey = rituals.journal.map((j) => j.session_id).join(',');

  useEffect(() => {
    if (!entry || !waiting.length || journeyStatus(entry.data) === 'stopped') return;
    let live = true;
    void (async () => {
      let next = entry.data;
      for (const [kind, sessionId] of waiting) {
        if (sessionId === activeId) continue;
        const journaled = rituals.journal.find((j) => j.session_id === sessionId);
        const session = journaled ? null : await findSession(sessionId).catch(() => null);
        const endedAt = journaled ? journaled.started_at ?? journaled.ritual_date : session?.status === 'completed' ? session.ended_at : null;
        if (journaled || session?.status === 'completed') next = riteDone(next, kind, endedAt ? new Date(endedAt) : new Date());
      }
      if (live && next !== entry.data) await saveProgress(entry.id, next);
    })();
    return () => {
      live = false;
    };
    // Re-run when the rite sessions, the running ritual or the journal change.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the keys stand in for the lists they summarise
  }, [entry?.id, waitingKey, activeId, journalKey]);

  return { journey, entry, progress, ready, change };
}
