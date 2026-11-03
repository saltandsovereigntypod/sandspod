// Sit together: a meditation kind of ritual together (lib/together/live.ts).
// The host chooses the length and its bells and, if they like, a time to
// begin; that shared start time (or, without one, the moment the leader
// begins) starts everyone's timer at once, wherever they are, each worked
// out from the same moment. The plan rides in the ritual's `source` (jsonb),
// so it needs no change to the together tables. Pure.

import type { LiveRitual, LiveStart } from '../together/live.ts';
import { cleanPlan, planLine, startClock, type SitClock, type SitPlan } from './timer.ts';

export const SIT_TOGETHER_TITLE = 'Sit together';

/** A sit together, ready for startLive: one step, as long as the whole sit. */
export function sitTogetherStart(plan: SitPlan, startAt: Date | null, title = '', intention = ''): LiveStart {
  const p = cleanPlan(plan);
  const minutes = p.minutes === null ? null : p.settle + p.minutes + p.warm;
  return {
    title: title.trim().slice(0, 120) || SIT_TOGETHER_TITLE,
    intention: intention.trim().slice(0, 500),
    steps: [{ title: 'Sit together', body: `${planLine(p)}. Everyone’s timer starts at the same moment, and the bells ring for each of you where you are.`, spoken: '', minutes }],
    source: { kind: 'sit', sit: { plan: { ...p, minutes: p.minutes === null ? 'open' : p.minutes }, startAt: startAt ? startAt.toISOString() : null } },
  };
}

export const isSitTogether = (live: Pick<LiveRitual, 'source'> | null | undefined) => live?.source?.kind === 'sit' && !!live.source.sit;

/** A sit together's plan and the moment everyone's timer starts (ms), or null before it's known. */
export function sitTogetherOf(live: Pick<LiveRitual, 'source' | 'started_at' | 'status'>): { plan: SitPlan; startAt: number | null } | null {
  if (!isSitTogether(live)) return null;
  const sit = live.source.sit!;
  const plan = cleanPlan(sit.plan);
  const set = sit.startAt ? Date.parse(sit.startAt) : NaN;
  if (Number.isFinite(set)) return { plan, startAt: set };
  const began = live.started_at && live.status !== 'gathering' ? Date.parse(live.started_at) : NaN;
  return { plan, startAt: Number.isFinite(began) ? began : null };
}

/** Everyone's clock: started at the shared moment, so each timer reads the same. */
export const sharedClock = (startAt: number): SitClock => startClock(startAt);

/** Choices for when to begin: when the leader begins, or in a few minutes' time. */
export const START_CHOICES: { minutes: number | null; label: string }[] = [
  { minutes: null, label: 'When the leader begins' },
  { minutes: 2, label: 'In 2 minutes' },
  { minutes: 5, label: 'In 5 minutes' },
  { minutes: 10, label: 'In 10 minutes' },
  { minutes: 15, label: 'In 15 minutes' },
];

/** A start time a few minutes ahead, on the whole minute. */
export function startIn(minutes: number, now: Date): Date {
  const d = new Date(now.getTime() + minutes * 60_000);
  d.setSeconds(0, 0);
  return d.getTime() > now.getTime() ? d : new Date(d.getTime() + 60_000);
}

/** "Everyone’s timer starts at 19:30", "Began together at 19:30", or waiting for the leader. */
export function startLine(startAt: number | null, now: number): string {
  if (startAt === null) return 'Everyone’s timer starts when the leader begins.';
  const d = new Date(startAt);
  const at = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  return startAt > now ? `Everyone’s timer starts at ${at}.` : `Began together at ${at}.`;
}
