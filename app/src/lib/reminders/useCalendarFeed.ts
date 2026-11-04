// Keeps the calendar feed's holidays and moon phases fresh: while you have a
// feed link and are signed in, the next thirteen months are written to your
// `calendar.feed` craft entry once a day, or when your calendars or chosen
// phases change. Run by the reminder keeper, so it happens whichever tab opens.

import { useEffect } from 'react';

import { addEntry, updateEntry, useCraft } from '../craft/store';
import { holidayChoice } from '../holidays';
import { FEED_COLLECTION, FEED_TOKEN_KEY, skySnapshot, snapshotKey } from './calendarFeed';
import type { PrincipalPhase } from '../moon';

let writing = false;

export function useCalendarFeedKeeper(signedIn: boolean, settings: Record<string, unknown> | null, phases: Record<PrincipalPhase, boolean>) {
  const { entries, ready } = useCraft<{ key?: string }>(FEED_COLLECTION);
  const on = signedIn && typeof settings?.[FEED_TOKEN_KEY] === 'string' && !!settings[FEED_TOKEN_KEY];
  const choice = JSON.stringify(holidayChoice(settings));
  const phaseKey = JSON.stringify(phases);
  const current = entries[0] ?? null;
  useEffect(() => {
    if (!on || !ready || writing) return;
    const now = new Date();
    const parsedChoice = JSON.parse(choice);
    const parsedPhases = JSON.parse(phaseKey) as Record<PrincipalPhase, boolean>;
    const key = snapshotKey(parsedPhases, parsedChoice, now);
    if (current?.data?.key === key) return;
    writing = true;
    const data = { ...skySnapshot(parsedPhases, parsedChoice, now), key };
    (current ? updateEntry(FEED_COLLECTION, current.id, data) : addEntry(FEED_COLLECTION, data).then(() => undefined))
      .catch(() => undefined)
      .finally(() => {
        writing = false;
      });
  }, [on, ready, choice, phaseKey, current]);
}
