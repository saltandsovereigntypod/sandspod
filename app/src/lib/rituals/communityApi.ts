// Supabase reads and writes for Community Rituals (lib/rituals/community.ts),
// the same queries and functions the website's rituals/js/community.js uses.
// Until the migration (20261116000000_community_rituals.sql) is applied, the
// tables aren't there: reads come back "not ready" and the screens say the
// section is on its way, rather than failing.

import { useCallback } from 'react';

import { fetchLibrary, fetchMyStandings, saveLibrary, type LibraryRow } from '../covens/api';
import { permissions } from '../covens/model';
import { useCachedQuery } from '../more/useCachedQuery';
import { useSession } from '../session';
import { supabase } from '../supabase';
import { covenBodyFromCommunity, type PublishedRitual, type RitualReviewAction, type SharedRitual } from './community';

type PgError = { code?: string; message?: string } | null;

/** The section's tables or functions aren't in the database yet. */
export function notReady(error: PgError): boolean {
  if (!error) return false;
  return /PGRST20[25]|PGRST202|42P01|42883/.test(error.code ?? '') || /does not exist|Could not find the (table|function)|schema cache/i.test(error.message ?? '');
}

const NOT_READY = 'Community Rituals isn’t open yet. Please try again soon.';

function fail(error: PgError): never {
  throw new Error(notReady(error) ? NOT_READY : error?.message || 'Please try again.');
}

export type PublishedSnapshot = { ready: boolean; rituals: PublishedRitual[] };

export async function fetchPublishedRituals(): Promise<PublishedSnapshot> {
  const { data, error } = await supabase.from('community_rituals_published').select('*').order('published_at', { ascending: false }).limit(500);
  if (error) {
    if (notReady(error)) return { ready: false, rituals: [] };
    throw new Error(error.message);
  }
  return { ready: true, rituals: (data ?? []) as PublishedRitual[] };
}

export function usePublishedRituals() {
  const { session } = useSession();
  // Per account: who you've blocked is left out on the server.
  return useCachedQuery(`community.rituals.${session?.user.id ?? 'guest'}`, fetchPublishedRituals);
}

/** Your own shares, and those made for covens whose rituals you lead. */
export async function fetchMyShares(userId: string): Promise<{ ready: boolean; mine: SharedRitual[]; covens: SharedRitual[] }> {
  const [mine, covens] = await Promise.all([
    supabase.from('community_rituals').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(200),
    supabase.from('community_rituals').select('*').neq('user_id', userId).not('coven_id', 'is', null).order('created_at', { ascending: false }).limit(200),
  ]);
  if (mine.error) {
    if (notReady(mine.error)) return { ready: false, mine: [], covens: [] };
    throw new Error(mine.error.message);
  }
  return { ready: true, mine: (mine.data ?? []) as SharedRitual[], covens: covens.error ? [] : ((covens.data ?? []) as SharedRitual[]) };
}

export function useMyShares() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const fetcher = useCallback(() => fetchMyShares(userId as string), [userId]);
  return useCachedQuery(userId ? `community.rituals.mine.${userId}` : null, fetcher);
}

/** One of your shares (or a coven's you lead, or any, for moderators). */
export async function fetchShared(id: string): Promise<SharedRitual | null> {
  const { data, error } = await supabase.from('community_rituals').select('*').eq('id', id).maybeSingle();
  if (error) fail(error);
  return (data as SharedRitual | null) ?? null;
}

export async function fetchIsModerator(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_community_moderator');
  return !error && data === true;
}

export function useIsRitualModerator() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const { data } = useCachedQuery(userId ? `community.rituals.moderator.${userId}` : null, fetchIsModerator);
  return data === true;
}

export async function fetchReviewQueue(): Promise<SharedRitual[]> {
  const { data, error } = await supabase.from('community_rituals').select('*').order('submitted_at', { ascending: false }).limit(500);
  if (error) fail(error);
  return (data ?? []) as SharedRitual[];
}

export async function shareRitual(args: Record<string, unknown>): Promise<string> {
  const { data, error } = await supabase.rpc('share_community_ritual', args);
  if (error) fail(error);
  return data as string;
}

export async function withdrawRitual(id: string): Promise<void> {
  const { error } = await supabase.rpc('withdraw_community_ritual', { p_id: id });
  if (error) fail(error);
}

export async function reviewRitual(id: string, action: RitualReviewAction, note: string): Promise<void> {
  const { error } = await supabase.rpc('review_community_ritual', { p_id: id, p_action: action, p_note: note.trim() || null });
  if (error) fail(error);
}

/** Count a save once per person. A failure never undoes the save itself. */
export async function noteSaved(id: string, to: 'mine' | 'coven'): Promise<void> {
  await supabase.rpc('note_community_ritual_saved', { p_id: id, p_to: to });
}

// ─── Covens ─────────────────────────────────────────────────────────────────

export type LeadCoven = { id: string; name: string; slug: string };

/** Your covens where you lead rituals (or are the head): the ones you can share for and add to. */
export async function fetchCovensILead(userId: string): Promise<LeadCoven[]> {
  const rows = await fetchMyStandings(userId).catch(() => []);
  return rows
    .filter(({ coven, membership, ranks }) => {
      const p = permissions({ coven, membership, ranks, userId });
      return p.founder || p.lead;
    })
    .map(({ coven }) => ({ id: coven.id, name: coven.name, slug: coven.slug }));
}

export function useCovensILead() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const fetcher = useCallback(() => fetchCovensILead(userId as string), [userId]);
  return useCachedQuery(userId ? `community.rituals.lead.${userId}` : null, fetcher);
}

export async function fetchCovenTemplates(covenId: string): Promise<LibraryRow[]> {
  return (await fetchLibrary(covenId)).filter((row) => row.kind === 'template');
}

/** "Add to a coven's rituals": a coven template, credited. */
export async function addToCoven(covenId: string, row: PublishedRitual): Promise<void> {
  const { title, body } = covenBodyFromCommunity(row);
  await saveLibrary(covenId, null, 'template', title, body);
  await noteSaved(row.id, 'coven');
}
