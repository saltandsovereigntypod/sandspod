// Opt-in chart sharing with a coven (supabase/migrations/20261127000000_coven_chart_shares.sql).
// Only planet positions are shared (sign and degree), never birth date, time or
// place, and nothing is shared unless the person turns it on. Every call
// degrades quietly if the table isn't there yet.

import type { Chart } from '../astro/natal';
import { supabase } from '../supabase';

export type SharedPosition = { p: string; l: number };
export type ChartShare = { user_id: string; positions: SharedPosition[] };

const SHARED = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

/** The positions that travel: the seven classical planets, to the whole degree. */
export const positionsToShare = (chart: Chart): SharedPosition[] =>
  chart.positions.filter((p) => SHARED.includes(p.point)).map((p) => ({ p: p.point, l: Math.round(p.longitude) % 360 }));

export async function fetchShares(covenId: string): Promise<{ rows: ChartShare[]; ready: boolean }> {
  try {
    const { data, error } = await supabase.from('coven_chart_shares').select('user_id, positions').eq('coven_id', covenId);
    if (error) return { rows: [], ready: false };
    return { rows: (data ?? []) as ChartShare[], ready: true };
  } catch {
    return { rows: [], ready: false };
  }
}

export async function shareChart(covenId: string, userId: string, positions: SharedPosition[]): Promise<boolean> {
  try {
    const { error } = await supabase.from('coven_chart_shares').upsert({ coven_id: covenId, user_id: userId, positions, updated_at: new Date().toISOString() });
    return !error;
  } catch {
    return false;
  }
}

export async function stopSharing(covenId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('coven_chart_shares').delete().eq('coven_id', covenId).eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}
