// Supabase reads and writes for the coven's shared shelf, its duties rota and
// its year in review (supabase/migrations/20261125000000_coven_shelf_rota_sits.sql).
// Until that migration is applied the tables aren't there: reads come back
// empty and marked not ready, so the screens stay quiet rather than failing.

import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../supabase';
import type { RotaDuty, RotaGathering, RotaSwap } from './rota';
import { fromRow, type CovenShelfRow, type CovenShelfThing } from './shelf';
import type { ReviewRitual, YearReviewInput } from './yearReview';

type PgError = { code?: string; message?: string } | null;

/** The table isn't in the database yet. */
export function notReady(error: PgError): boolean {
  if (!error) return false;
  return /PGRST20[25]|PGRST202|42P01|42883/.test(error.code ?? '') || /does not exist|Could not find the (table|function)|schema cache/i.test(error.message ?? '');
}

export type Loaded<T> = { rows: T; ready: boolean };

async function read<T>(promise: PromiseLike<{ data: unknown; error: PgError }>, empty: T): Promise<Loaded<T>> {
  try {
    const { data, error } = await promise;
    if (error) {
      if (notReady(error)) return { rows: empty, ready: false };
      throw new Error(error.message);
    }
    return { rows: (data as T) ?? empty, ready: true };
  } catch (e) {
    if (e instanceof Error && /fetch|network/i.test(e.message)) return { rows: empty, ready: false };
    throw e;
  }
}

async function write<T>(promise: PromiseLike<{ data: unknown; error: PgError }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(notReady(error) ? 'This isn’t open yet. Please try again soon.' : error.message ?? 'Please try again.');
  return data as T;
}

// ─── The shared shelf ────────────────────────────────────────────────────

export async function fetchShelf(covenId: string): Promise<Loaded<CovenShelfThing[]>> {
  const r = await read<CovenShelfRow[]>(supabase.from('coven_shelf_items').select('*').eq('coven_id', covenId).order('name').limit(1000), []);
  return { rows: r.rows.map(fromRow), ready: r.ready };
}
export const addShelfThing = (covenId: string, row: Record<string, unknown>) => write(supabase.from('coven_shelf_items').insert({ ...row, coven_id: covenId }).select().single());
export const saveShelfThing = (id: string, row: Record<string, unknown>) => write(supabase.from('coven_shelf_items').update(row).eq('id', id).select().single());
export const removeShelfThing = (id: string) => write(supabase.from('coven_shelf_items').delete().eq('id', id));

/** The coven's shelf, loaded once per coven and kept while the screen is open. */
export function useCovenShelf(covenId: string | null | undefined) {
  const [state, setState] = useState<{ covenId: string; things: CovenShelfThing[]; ready: boolean } | null>(null);
  const load = useCallback(async () => {
    if (!covenId) return;
    try {
      const r = await fetchShelf(covenId);
      setState({ covenId, things: r.rows, ready: r.ready });
    } catch {
      setState({ covenId, things: [], ready: false });
    }
  }, [covenId]);
  useEffect(() => {
    void load();
  }, [load]);
  const mine = state && state.covenId === covenId ? state : null;
  return { things: mine?.things ?? [], ready: mine?.ready ?? false, loaded: !!mine, reload: load };
}

// ─── The duties rota ─────────────────────────────────────────────────────

export type RotaData = { duties: RotaDuty[]; swaps: RotaSwap[]; gatherings: RotaGathering[]; away: Record<string, string[]>; ready: boolean };

const GATHERING_FIELDS = 'id,coven_id,scheduled_for,status,kind';

/** Duties, swaps (recent), the gatherings they turn at, and who has said they can't come. For one or more covens. */
export async function fetchRota(covenIds: string[]): Promise<RotaData> {
  const empty: RotaData = { duties: [], swaps: [], gatherings: [], away: {}, ready: false };
  if (!covenIds.length) return empty;
  const duties = await read<RotaDuty[]>(supabase.from('coven_rota_duties').select('*').in('coven_id', covenIds).eq('active', true).order('sort_order'), []).catch(() => ({ rows: [], ready: false }));
  if (!duties.ready) return empty;
  if (!duties.rows.length) return { ...empty, ready: true };
  const from = duties.rows.map((d) => d.starts_at).sort()[0];
  const [gatherings, swaps] = await Promise.all([
    read<RotaGathering[]>(supabase.from('coven_rituals').select(GATHERING_FIELDS).in('coven_id', covenIds).gte('scheduled_for', from).neq('status', 'cancelled').order('scheduled_for').limit(1000), []),
    read<RotaSwap[]>(supabase.from('coven_rota_swaps').select('*').in('coven_id', covenIds).gte('created_at', from).order('created_at').limit(1000), []),
  ]);
  const upcoming = gatherings.rows.filter((g) => g.status === 'scheduled' || g.status === 'live').map((g) => g.id);
  const rsvps = upcoming.length
    ? await read<{ ritual_id: string; user_id: string; response: string }[]>(supabase.from('coven_ritual_rsvps').select('ritual_id,user_id,response').in('ritual_id', upcoming.slice(0, 200)).eq('response', 'not_going'), []).catch(() => ({ rows: [], ready: false }))
    : { rows: [] };
  const away: Record<string, string[]> = {};
  for (const r of rsvps.rows) (away[r.ritual_id] ??= []).push(r.user_id);
  return { duties: duties.rows, swaps: swaps.rows, gatherings: gatherings.rows, away, ready: true };
}

/** Active members of these covens (for the rota on Today). */
export const fetchActiveMembers = (covenIds: string[]) =>
  read<{ coven_id: string; user_id: string }[]>(supabase.from('coven_members').select('coven_id,user_id').in('coven_id', covenIds).eq('status', 'active').limit(2000), [])
    .then((r) => r.rows)
    .catch(() => [] as { coven_id: string; user_id: string }[]);

export const saveDuty =(covenId: string, id: string | null, row: Record<string, unknown>) =>
  id ? write<RotaDuty>(supabase.from('coven_rota_duties').update(row).eq('id', id).select().single()) : write<RotaDuty>(supabase.from('coven_rota_duties').insert({ ...row, coven_id: covenId }).select().single());
export const removeDuty = (id: string) => write(supabase.from('coven_rota_duties').update({ active: false }).eq('id', id));

/** Tell the other person (best effort; the coven-notify function rings them). */
const ringSwap = (id: string, event: 'asked' | 'answered') => void supabase.functions.invoke('coven-notify', { body: { rota_swap_id: id, event } }).catch(() => {});

export async function askSwap(row: { coven_id: string; ritual_id: string; duty_id: string; from_user: string; to_user: string; exchange_duty_id: string | null; note: string | null }, reassign = false) {
  const saved = await write<RotaSwap>(supabase.from('coven_rota_swaps').insert({ ...row, status: reassign ? 'accepted' : 'pending' }).select().single());
  ringSwap(saved.id, reassign ? 'answered' : 'asked');
  return saved;
}
export async function answerSwap(id: string, status: 'accepted' | 'declined' | 'withdrawn') {
  const saved = await write<RotaSwap>(supabase.from('coven_rota_swaps').update({ status }).eq('id', id).select().single());
  if (status !== 'withdrawn') ringSwap(id, 'answered');
  return saved;
}

// ─── The year in review ──────────────────────────────────────────────────

const quiet = <T,>(p: PromiseLike<{ data: unknown; error: PgError }>, empty: T) => read<T>(p, empty).then((r) => r.rows).catch(() => empty);

export async function fetchYearInput(covenId: string, year: number, userId: string | null, seesAllAttendance: boolean): Promise<Omit<YearReviewInput, 'year' | 'userId' | 'seesAllAttendance'>> {
  const from = new Date(year, 0, 1).toISOString();
  const to = new Date(year + 1, 0, 1).toISOString();
  const rituals = await quiet<ReviewRitual[]>(
    supabase.from('coven_rituals').select('id,title,kind,status,occasion,occasion_name,scheduled_for,started_at,ended_at').eq('coven_id', covenId).gte('scheduled_for', from).lt('scheduled_for', to).limit(1000),
    [],
  );
  const ids = rituals.map((r) => r.id);
  let attendanceQuery = supabase.from('coven_ritual_attendance').select('ritual_id,user_id,present').in('ritual_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
  if (!seesAllAttendance && userId) attendanceQuery = attendanceQuery.eq('user_id', userId);
  const [attendance, members, grimoire, book, altarItems, altarObjects, petitions, shelf] = await Promise.all([
    ids.length ? quiet<YearReviewInput['attendance']>(attendanceQuery, []) : Promise.resolve([]),
    quiet<YearReviewInput['members']>(supabase.from('coven_members').select('user_id,joined_at,status').eq('coven_id', covenId), []),
    quiet<{ title: string; created_at: string }[]>(supabase.from('coven_grimoire_pages').select('title,created_at').eq('coven_id', covenId).gte('created_at', from).lt('created_at', to).limit(1000), []),
    quiet<{ title: string; published_at: string }[]>(supabase.from('coven_book_pages').select('title,published_at').eq('coven_id', covenId).gte('published_at', from).lt('published_at', to).limit(1000), []),
    quiet<{ label: string | null; image: string; created_at: string }[]>(supabase.from('coven_altar_items').select('label,image,created_at').eq('coven_id', covenId).gte('created_at', from).lt('created_at', to).limit(2000), []),
    quiet<{ data: { name?: string; label?: string } | null; updated_at: string }[]>(supabase.from('coven_altar_objects').select('data,updated_at').eq('coven_id', covenId).gte('updated_at', from).lt('updated_at', to).limit(2000), []),
    quiet<{ created_at: string }[]>(supabase.from('coven_petitions').select('created_at').eq('coven_id', covenId).gte('created_at', from).lt('created_at', to).limit(2000), []),
    quiet<{ created_at: string }[]>(supabase.from('coven_shelf_items').select('created_at').eq('coven_id', covenId).gte('created_at', from).lt('created_at', to).limit(2000), []),
  ]);
  const picture = (image: string) => image.split('/').pop()?.replace(/\.[a-z]+$/i, '').replace(/[-_]+/g, ' ') ?? '';
  return {
    rituals,
    attendance,
    members,
    pages: [...grimoire, ...book.map((b) => ({ title: b.title, created_at: b.published_at }))],
    altarThings: [
      ...altarItems.map((a) => ({ label: (a.label?.trim() || picture(a.image)).replace(/^\w/, (c) => c.toUpperCase()), at: a.created_at })),
      ...altarObjects.map((o) => ({ label: String(o.data?.label || o.data?.name || '').trim(), at: o.updated_at })),
    ].filter((a) => a.label),
    petitions,
    shelfAdded: shelf,
  };
}
