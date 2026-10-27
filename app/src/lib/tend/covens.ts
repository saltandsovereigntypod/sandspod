// What you tend in your covens, for the To tend list (gather.ts
// covenTendables): open petitions you asked or have tended, your own
// contributions to rituals (row-level security gives you only your own),
// the rites coming with what they ask of you, and your mentees with your
// check-ins. Kept on the phone between visits, like Today's coven section.

import { useMemo } from 'react';

import { useCachedQuery } from '../more/useCachedQuery';
import { supabase } from '../supabase';
import type { CovenPart } from './gather';

type Rows = Omit<CovenPart, 'nameOf'> & { names: Record<string, string>; myName: string };

async function rows<T>(query: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}
const quiet = <T,>(p: Promise<T[]>) => p.catch(() => [] as T[]);

export async function fetchTendCovens(userId: string): Promise<Rows | null> {
  const memberships = await rows<CovenPart['memberships'][number]>(supabase.from('coven_members').select('coven_id,user_id,rank_id,status').eq('user_id', userId).eq('status', 'active'));
  const ids = memberships.map((m) => m.coven_id);
  if (!ids.length) return null;
  const [covens, tendings, petitions, contributions, upcoming, mentorships, checkins, me] = await Promise.all([
    rows<CovenPart['covens'][number]>(supabase.from('covens').select('id,slug,name').in('id', ids).eq('status', 'active')),
    quiet(rows<CovenPart['tendings'][number]>(supabase.from('coven_petition_tendings').select('petition_id,user_id,note,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(1000))),
    quiet(rows<CovenPart['petitions'][number]>(supabase.from('coven_petitions').select('id,coven_id,user_id,title,body,color,status,last_tended_at,altar_id,source_ritual_id,created_at').in('coven_id', ids).eq('status', 'open').limit(1000))),
    quiet(rows<CovenPart['contributions'][number]>(supabase.from('coven_ritual_contributions').select('id,step_id,ritual_id,coven_id,kind,body,private,anonymous,visibility,fate,status,petition_id,updated_at,created_at').eq('user_id', userId).limit(500))),
    quiet(rows<CovenPart['rituals'][number]>(supabase.from('coven_rituals').select('id,coven_id,title,status,scheduled_for,created_at').in('coven_id', ids).in('status', ['scheduled', 'live']).limit(200))),
    quiet(rows<CovenPart['mentorships'][number]>(supabase.from('coven_mentors').select('coven_id,user_id,mentor_id,assigned_at').eq('mentor_id', userId))),
    quiet(rows<CovenPart['checkins'][number]>(supabase.from('coven_mentor_checkins').select('coven_id,user_id,mentor_id,met_on').eq('mentor_id', userId).order('met_on', { ascending: false }).limit(1000))),
    quiet(rows<{ user_id: string; display_name: string | null }>(supabase.from('coven_profiles').select('user_id,display_name').eq('user_id', userId))),
  ]);
  const tended = new Set(tendings.map((t) => t.petition_id));
  const mine = petitions.filter((p) => p.user_id === userId || tended.has(p.id));
  // The rituals your petitions and contributions came from, for where each began.
  const known = new Set(upcoming.map((r) => r.id));
  const wanted = [...new Set([...contributions.map((c) => c.ritual_id), ...mine.map((p) => p.source_ritual_id ?? '')])].filter((id) => id && !known.has(id));
  const [earlier, steps] = await Promise.all([
    wanted.length ? quiet(rows<CovenPart['rituals'][number]>(supabase.from('coven_rituals').select('id,coven_id,title,status,scheduled_for,created_at').in('id', wanted.slice(0, 200)))) : Promise.resolve([]),
    upcoming.length
      ? quiet(rows<CovenPart['steps'][number]>(supabase.from('coven_ritual_steps').select('id,ritual_id,title,contribution,assignees,assigned_user_id,assigned_rank_id').in('ritual_id', upcoming.map((r) => r.id))))
      : Promise.resolve([]),
  ]);
  const people = [...new Set([...mine.map((p) => p.user_id), ...mentorships.map((m) => m.user_id)])].filter((id) => id !== userId);
  const profiles = people.length ? await quiet(rows<{ user_id: string; display_name: string | null }>(supabase.from('coven_profiles').select('user_id,display_name').in('user_id', people))) : [];
  const names = Object.fromEntries(profiles.map((p) => [p.user_id, p.display_name || 'A member']));
  return {
    userId,
    covens,
    memberships,
    petitions: mine,
    tendings,
    contributions,
    rituals: [...upcoming, ...earlier],
    steps,
    mentorships,
    checkins,
    names,
    myName: me[0]?.display_name || 'A member',
  };
}

/** Your covens' part of the list, kept on the phone between visits. */
export function useMoreCachedCovens(userId: string | null) {
  const { data, refresh, status } = useCachedQuery(userId ? `tend-covens-${userId}` : null, () => fetchTendCovens(userId!));
  const part = useMemo<CovenPart | null>(() => (data ? { ...data, nameOf: (id: string) => data.names[id] || 'A member' } : null), [data]);
  return { part, myName: data?.myName ?? 'A member', refresh, status };
}
