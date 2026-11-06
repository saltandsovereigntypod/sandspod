// Supabase reads and writes for telepathy sessions (telepathy.ts). Until the
// migration (20261128000000_telepathy.sql) is applied the tables aren't there:
// each call comes back not ready and the screens stay quiet about it.

import { fetchAllMembers, fetchMyCovens, fetchProfiles } from '../../covens/api';
import { notReady } from '../../covens/sharedApi';
import { supabase } from '../../supabase';
import type { Guess, Participant, Round, TelepathySession } from './telepathy';

const ROUND_COLS = 'n,sender_id,options,starts_at,reveal_at,ends_at';

export type Snapshot = { ready: boolean; session: TelepathySession | null; people: Participant[]; rounds: Round[]; guesses: Guess[]; targets: Record<number, string>; names: Record<string, string> };

const EMPTY: Snapshot = { ready: false, session: null, people: [], rounds: [], guesses: [], targets: {}, names: {} };

const fail = (error: { code?: string; message?: string }): never => {
  throw new Error(notReady(error) ? 'Telepathy sessions aren’t open yet. Please try again soon.' : error.message ?? 'Please try again.');
};

/** Your sessions: mine and the ones I am in, newest first (plus coven sessions open to me). */
export async function fetchMySessions(): Promise<{ ready: boolean; sessions: TelepathySession[] }> {
  const { data, error } = await supabase.from('telepathy_sessions').select('*').order('starts_at', { ascending: false }).limit(60);
  if (error) {
    if (notReady(error)) return { ready: false, sessions: [] };
    throw new Error(error.message);
  }
  return { ready: true, sessions: (data ?? []) as TelepathySession[] };
}

/** One session as it stands: who is in, the rounds (never their targets), guesses you may see, and the targets you may see. */
export async function fetchSnapshot(id: string): Promise<Snapshot> {
  const s = await supabase.from('telepathy_sessions').select('*').eq('id', id).maybeSingle();
  if (s.error) {
    if (notReady(s.error)) return EMPTY;
    throw new Error(s.error.message);
  }
  if (!s.data) return { ...EMPTY, ready: true };
  const [p, r, g, t] = await Promise.all([
    supabase.from('telepathy_participants').select('user_id,status,joined_at').eq('session_id', id).order('joined_at'),
    supabase.from('telepathy_rounds').select(ROUND_COLS).eq('session_id', id).order('n'),
    supabase.from('telepathy_guesses').select('round_n,user_id,guess,impressions').eq('session_id', id),
    supabase.rpc('telepathy_targets', { sid: id }),
  ]);
  const people = (p.data ?? []) as Participant[];
  const profiles = await fetchProfiles(people.map((x) => x.user_id)).catch(() => []);
  return {
    ready: true,
    session: s.data as TelepathySession,
    people,
    rounds: (r.data ?? []) as Round[],
    guesses: (g.data ?? []) as Guess[],
    targets: Object.fromEntries(((t.data ?? []) as { n: number; target: string }[]).map((x) => [x.n, x.target])),
    names: Object.fromEntries(profiles.map((x) => [x.user_id, x.display_name])),
  };
}

export async function createSession(row: Record<string, unknown>): Promise<TelepathySession> {
  const { data, error } = await supabase.from('telepathy_sessions').insert(row).select().single();
  if (error) fail(error);
  return data as TelepathySession;
}

export async function joinWithCode(code: string): Promise<string> {
  const { data, error } = await supabase.rpc('telepathy_join', { code });
  if (error) fail(error);
  return data as string;
}

export async function inviteMember(sid: string, who: string): Promise<void> {
  const { error } = await supabase.rpc('telepathy_invite', { sid, who });
  if (error) fail(error);
}

/** Makes the rounds on the server once it is time; harmless to call again. */
export async function beginSession(sid: string): Promise<void> {
  const { error } = await supabase.rpc('telepathy_begin', { sid });
  if (error && !/not time yet/i.test(error.message ?? '')) fail(error);
}

export async function lockIn(sid: string, round: number, guess: string, impressions: string): Promise<void> {
  const { error } = await supabase.from('telepathy_guesses').insert({ session_id: sid, round_n: round, guess, impressions: impressions.trim().slice(0, 1000) || null });
  if (error && error.code !== '23505') fail(error);
}

export async function cancelSession(sid: string): Promise<void> {
  const { error } = await supabase.from('telepathy_sessions').update({ status: 'cancelled' }).eq('id', sid);
  if (error) fail(error);
}

/** Your covens and, for each, its other members with their names (to invite one to a pair). */
export async function fetchCovenPeople(userId: string): Promise<{ covens: { id: string; name: string }[]; members: { id: string; name: string; covenId: string }[] }> {
  const covens = await fetchMyCovens(userId).catch(() => []);
  const rows = await Promise.all(covens.map((c) => fetchAllMembers(c.id).then((m) => m.filter((x) => x.status === 'active' && x.user_id !== userId).map((x) => ({ user_id: x.user_id, covenId: c.id }))).catch(() => [])));
  const flat = rows.flat();
  const profiles = await fetchProfiles(flat.map((x) => x.user_id)).catch(() => []);
  const name = new Map(profiles.map((p) => [p.user_id, p.display_name]));
  return { covens: covens.map((c) => ({ id: c.id, name: c.name })), members: flat.map((x) => ({ id: x.user_id, name: name.get(x.user_id) ?? 'A member', covenId: x.covenId })) };
}
