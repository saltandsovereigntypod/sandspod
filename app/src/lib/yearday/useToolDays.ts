// The days a tool has its own record for, for a challenge on that theme
// (lib/yearday/challenges.ts TOOL_THEMES): daily devotion, meditation sits,
// Cycle & Moon notes, and cards drawn into your readings.

import { useMemo } from 'react';

import { READINGS } from '../craft/hedge/readings';
import { useCraft } from '../craft/store';
import { useCycle } from '../cycle/store';
import { SITS } from '../meditation/log';
import { localDateKey } from '../rituals/lifecycle';
import type { ThemeId } from './challenges';

const DEVOTIONS = 'solitary.devotions';

/** Every tool theme's days at once (for the list of challenges). */
export function useToolDaysByTheme(): Partial<Record<ThemeId, string[]>> {
  const devotions = useCraft<{ date?: string; morning?: boolean; evening?: boolean }>(DEVOTIONS);
  const sits = useCraft<{ at?: string }>(SITS);
  const readings = useCraft<{ date?: string; drawn?: unknown[] }>(READINGS);
  const cycle = useCycle();
  return useMemo(() => {
    const keyOf = (iso: unknown) => (typeof iso === 'string' && !Number.isNaN(Date.parse(iso)) ? localDateKey(new Date(iso)) : '');
    return {
      devotion: devotions.entries.filter((e) => e.data?.morning || e.data?.evening).map((e) => String(e.data.date ?? '')),
      grounding: sits.entries.map((e) => keyOf(e.data?.at)),
      moon: (cycle.data?.notes ?? []).map((n) => n.date),
      tarot: readings.entries.filter((e) => Array.isArray(e.data?.drawn) && e.data.drawn.length > 0).map((e) => String(e.data.date ?? '')),
    };
  }, [devotions.entries, sits.entries, readings.entries, cycle.data]);
}

export function useToolDays(theme: ThemeId | null | undefined): string[] {
  const all = useToolDaysByTheme();
  return useMemo(() => (theme ? all[theme] ?? [] : []), [all, theme]);
}
