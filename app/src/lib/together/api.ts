// Supabase reads and writes for rituals together and mentorship, the same
// calls the website makes (rituals/together/together.js,
// covens/mentorship/mentorship.js). Row-level security and the database's
// functions (supabase/migrations/20261120000000_rituals_together_mentorship.sql)
// decide who may do what; these only ask.

import { supabase } from '../supabase';
import type { LiveAction, LiveMessage, LivePerson, LiveRitual, LiveStart } from './live';
import type { CovenPair, MentorListing, Mentorship, MentorshipCheckin, MentorshipItem, MentorshipMessage, MentorRole } from './mentorship';
import type { CourseLink } from '../covens/courseLinks';

async function run<T>(promise: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return data as T;
}
const rpc = <T>(name: string, args: Record<string, unknown>) => run<T>(supabase.rpc(name, args));
const ring = (body: Record<string, unknown>) => void supabase.functions.invoke('coven-notify', { body }).catch(() => {});

// ─── Rituals together ────────────────────────────────────────────────────

/** What the Begin together buttons hand to the start screen (one at a time, in memory). */
let pending: (LiveStart & { coven_id?: string | null; gathering_id?: string | null }) | null = null;
export const setPendingStart = (start: typeof pending) => {
  pending = start;
};
export const takePendingStart = () => pending;

export async function startLive(start: LiveStart, coven: { coven_id?: string | null; gathering_id?: string | null } = {}): Promise<LiveRitual> {
  const row = await rpc<LiveRitual>('start_live_ritual', {
    p_title: start.title,
    p_intention: start.intention,
    p_steps: start.steps,
    p_source: start.source,
    p_coven: coven.coven_id ?? null,
    p_gathering: coven.gathering_id ?? null,
  });
  // A gathering's people hear that it has begun together (coven-notify together.ts).
  if (row?.coven_ritual_id) ring({ live_ritual_id: row.id });
  return row;
}

export const previewLive = (code: string) =>
  rpc<{ found: boolean; id?: string; title?: string; intention?: string | null; status?: string; host_name?: string | null; coven_name?: string | null; people?: number }>('live_ritual_preview', { p_code: code });
export const joinLive = (id: string | null, code: string | null) => rpc<LiveRitual>('join_live_ritual', { p_live: id, p_code: code });

export async function fetchLive(id: string): Promise<{ live: LiveRitual | null; people: LivePerson[]; messages: LiveMessage[] }> {
  const [live, people, messages] = await Promise.all([
    run<LiveRitual | null>(supabase.from('live_rituals').select('*').eq('id', id).maybeSingle()),
    run<LivePerson[]>(supabase.from('live_ritual_people').select('*').eq('live_id', id)),
    run<LiveMessage[]>(supabase.from('live_ritual_messages').select('*').eq('live_id', id).is('deleted_at', null).order('created_at', { ascending: true }).limit(300)).catch(() => []),
  ]);
  return { live, people, messages };
}

/** Your rituals together still open: hosting or joined. */
export async function myLive(userId: string): Promise<LiveRitual[]> {
  const mine = await run<{ live_id: string }[]>(supabase.from('live_ritual_people').select('live_id').eq('user_id', userId).is('removed_at', null).is('left_at', null));
  if (!mine.length) return [];
  return run(supabase.from('live_rituals').select('*').in('id', mine.map((m) => m.live_id)).neq('status', 'ended').order('updated_at', { ascending: false }));
}

/** Rituals together begun from a coven's gatherings, still open. */
export const covenLive = (covenId: string) => run<LiveRitual[]>(supabase.from('live_rituals').select('*').eq('coven_id', covenId).neq('status', 'ended').order('updated_at', { ascending: false }));

export function actLive(id: string, version: number, action: LiveAction) {
  return rpc<LiveRitual>('live_ritual_act', {
    p_live: id,
    p_action: action.type,
    p_version: version,
    p_step: action.type === 'go' ? action.step : null,
    p_to: action.type === 'pass' ? action.to : null,
    p_on: action.type === 'quiet' ? action.on : null,
  });
}
export const hereLive = (id: string) => rpc<null>('live_ritual_here', { p_live: id });
export const leaveLive = (id: string) => rpc<null>('live_ritual_leave', { p_live: id });
export const removeFromLive = (id: string, userId: string) => rpc<null>('live_ritual_remove', { p_live: id, p_user: userId });
export const mineLive = (id: string, change: { done?: boolean; quiet?: boolean }) => rpc<null>('live_ritual_mine', { p_live: id, p_done: change.done ?? null, p_quiet: change.quiet ?? null });
export const sayLive = (id: string, userId: string, body: string) =>
  run<LiveMessage>(supabase.from('live_ritual_messages').insert({ live_id: id, user_id: userId, body: body.trim() }).select().single());
export const hideLiveMessage = (messageId: string) => rpc<null>('live_ritual_hide_message', { p_message: messageId });

/** Follow a ritual together as it changes; `onChange` reloads. Returns the presence ids as they change, and a stop. */
export function followLive(id: string, userId: string, name: string, onChange: () => void, onHere: (ids: string[]) => void): () => void {
  const channel = supabase.channel(`live-ritual:${id}`, { config: { presence: { key: userId } } });
  for (const [table, column] of [['live_rituals', 'id'], ['live_ritual_people', 'live_id'], ['live_ritual_messages', 'live_id']] as const) {
    channel.on('postgres_changes' as never, { event: '*', schema: 'public', table, filter: `${column}=eq.${id}` } as never, () => onChange());
  }
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState() as Record<string, { user_id?: string }[]>;
    onHere(Object.keys(state));
  });
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      void channel.track({ user_id: userId, name });
      onChange();
    }
  });
  return () => {
    void supabase.removeChannel(channel);
  };
}

// ─── Mentorship ──────────────────────────────────────────────────────────

export const myListing = (userId: string) => run<MentorListing | null>(supabase.from('mentor_listings').select('*').eq('user_id', userId).maybeSingle());

export function saveListing(userId: string, listing: Omit<MentorListing, 'user_id' | 'adult_confirmed_at' | 'boundaries_agreed_at' | 'updated_at'>, existing: boolean) {
  if (existing) return run<MentorListing>(supabase.from('mentor_listings').update(listing).eq('user_id', userId).select().single());
  // The database stamps both confirmations (guard_mentor_listing); they are asked for on the screen first.
  const now = new Date().toISOString();
  return run<MentorListing>(supabase.from('mentor_listings').insert({ ...listing, user_id: userId, adult_confirmed_at: now, boundaries_agreed_at: now }).select().single());
}
export const removeListing = (userId: string) => run(supabase.from('mentor_listings').delete().eq('user_id', userId));

/** Every listing shown to you (row-level security keeps it to eligible adults, the directory and your covens). */
export const directory = () => run<MentorListing[]>(supabase.from('mentor_listings').select('*').order('updated_at', { ascending: false }).limit(500));

export const myMentorships = () => run<Mentorship[]>(supabase.from('mentorships').select('*').order('created_at', { ascending: false }).limit(200));
export const fetchMentorship = (id: string) => run<Mentorship | null>(supabase.from('mentorships').select('*').eq('id', id).maybeSingle());

const notify = (m: Mentorship | null, event: string) => {
  if (m?.id) ring({ mentorship_id: m.id, event });
  return m as Mentorship;
};
export const askMentorship = (other: string, as: MentorRole, covenId: string | null, note: string) =>
  rpc<Mentorship>('ask_mentorship', { p_other: other, p_as: as, p_coven: covenId, p_note: note.trim() || null }).then((m) => notify(m, 'asked'));
export const pairMentorship = (covenId: string, mentor: string, mentee: string, note: string) =>
  rpc<Mentorship>('pair_mentorship', { p_coven: covenId, p_mentor: mentor, p_mentee: mentee, p_note: note.trim() || null }).then((m) => notify(m, 'paired'));
export const answerMentorship = (id: string, yes: boolean) =>
  rpc<Mentorship>('answer_mentorship', { p_mentorship: id, p_yes: yes }).then((m) => (m.status === 'active' ? notify(m, 'accepted') : m.status === 'declined' ? notify(m, 'declined') : m));
export const endMentorship = (id: string) => rpc<Mentorship>('end_mentorship', { p_mentorship: id }).then((m) => notify(m, 'ended'));
export const covenPairs = (covenId: string) => rpc<CovenPair[]>('coven_mentorship_pairs', { p_coven: covenId });

export async function fetchPairing(id: string) {
  const [messages, items, checkins] = await Promise.all([
    run<MentorshipMessage[]>(supabase.from('mentorship_messages').select('*').eq('mentorship_id', id).order('created_at', { ascending: true }).limit(500)),
    run<MentorshipItem[]>(supabase.from('mentorship_items').select('*').eq('mentorship_id', id)),
    run<MentorshipCheckin[]>(supabase.from('mentorship_checkins').select('*').eq('mentorship_id', id).order('created_at', { ascending: false }).limit(50)),
  ]);
  return { messages, items, checkins };
}

export async function sayToMentor(id: string, userId: string, body: string) {
  const row = await run<MentorshipMessage>(supabase.from('mentorship_messages').insert({ mentorship_id: id, user_id: userId, body: body.trim() }).select().single());
  ring({ mentorship_message_id: row.id });
  return row;
}
export async function checkIn(id: string, userId: string, body: string) {
  const row = await run<MentorshipCheckin>(supabase.from('mentorship_checkins').insert({ mentorship_id: id, user_id: userId, body: body.trim() }).select().single());
  ring({ mentorship_checkin_id: row.id });
  return row;
}
export const addItem = (id: string, userId: string, item: { kind: 'goal' | 'reading'; title: string; detail: string; link: CourseLink | null }) =>
  run<MentorshipItem>(
    supabase.from('mentorship_items').insert({ mentorship_id: id, created_by: userId, kind: item.kind, title: item.title.trim(), detail: item.detail.trim() || null, link: item.link }).select().single(),
  );
export const tickItem = (itemId: string, done: boolean) => run<MentorshipItem>(supabase.from('mentorship_items').update({ done_at: done ? new Date().toISOString() : null }).eq('id', itemId).select().single());
export const removeItem = (itemId: string) => run(supabase.from('mentorship_items').delete().eq('id', itemId));

/** Follow a pairing's conversation and its state as they change. */
export function followPairing(id: string, onChange: () => void): () => void {
  const channel = supabase.channel(`mentorship:${id}:${Math.random().toString(36).slice(2, 8)}`);
  channel.on('postgres_changes' as never, { event: '*', schema: 'public', table: 'mentorship_messages', filter: `mentorship_id=eq.${id}` } as never, () => onChange());
  channel.on('postgres_changes' as never, { event: '*', schema: 'public', table: 'mentorships', filter: `id=eq.${id}` } as never, () => onChange());
  channel.subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

/** A coven's name and slug, for a coven pairing's links (null when it isn't shown to you). */
export const covenOf = (covenId: string) => run<{ name: string; slug: string } | null>(supabase.from('covens').select('name,slug').eq('id', covenId).maybeSingle()).catch(() => null);
