// A time chosen in "Find a good time" (craft/cosmic/timing.tsx), carried into
// the builders so it becomes a set ritual: the template editor (saved, then
// planned for that time) or the coven ritual builder (dated for it).
// The website's twin is in practice/cosmic/timing.js.

import { uuid } from './lifecycle.ts';
import type { RitualPlan } from './types.ts';

/** What travels in the link: the window's day and time, its planetary hour, the advisor's intent, and why it was chosen. */
export type SetFor = {
  date: string;
  time: string;
  hour: string | null;
  intent: string | null;
  why: string | null;
};

export type SetForParams = { setDate?: string; setTime?: string; setHour?: string; setIntent?: string; setWhy?: string };

export function setForParams(s: SetFor): Record<string, string> {
  return {
    setDate: s.date,
    setTime: s.time,
    ...(s.hour ? { setHour: s.hour } : {}),
    ...(s.intent ? { setIntent: s.intent } : {}),
    ...(s.why ? { setWhy: s.why.slice(0, 600) } : {}),
  };
}

/** The time back out of a link, or null when it isn't one (or doesn't read). */
export function readSetFor(p: SetForParams): SetFor | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.setDate ?? '') || !/^\d{2}:\d{2}$/.test(p.setTime ?? '')) return null;
  return { date: p.setDate!, time: p.setTime!, hour: p.setHour || null, intent: p.setIntent || null, why: p.setWhy || null };
}

/** The plan that sets a saved ritual for the chosen time (as the planner would save it). */
export function planFor(
  s: Pick<SetFor, 'date' | 'time'>,
  ritual: { id: string; title: string; intention?: string | null },
  intention: { label: string; plannerKey: string | null } | null,
  now: Date = new Date(),
): RitualPlan {
  return {
    id: uuid(),
    date: s.date,
    time: s.time,
    title: ritual.title.trim() || (intention ? `${intention.label} working` : 'A working'),
    intention: ritual.intention?.trim() || intention?.label || null,
    intentionKey: intention?.plannerKey ?? null,
    templateId: ritual.id,
    draft: null,
    ingredients: [],
    createdAt: now.toISOString(),
    addToCalendar: false,
  };
}
