// Supabase reads and writes for coven meetings, the same calls the website
// makes (covens/coven/meeting.js), against
// supabase/migrations/20261107000200_coven_meetings.sql. Row-level security and
// the database's functions decide who may do what (who a meeting is for, when
// its chat is open, who reads it afterwards); these only ask.

import { supabase } from '../supabase';
import type { Assignee } from './picker';
import { cleanState, type MeetingAction, type MeetingState } from './meetings';
import type { Message } from './model';

async function run<T>(promise: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return data as T;
}
const rpc = <T>(name: string, args: Record<string, unknown>) => run<T>(supabase.rpc(name, args));

/** A meeting's chat message (coven_meeting_messages): the coven chat's shape, with its meeting. */
export type MeetingMessage = Message & { ritual_id: string };

const ACTION_FIELDS = 'id,ritual_id,coven_id,step_id,body,assignees,due_on,status,done_by,done_at,created_by,created_at';

// ─── The meeting as it happens ───────────────────────────────────────────

export async function fetchMeetingState(ritualId: string): Promise<MeetingState> {
  const row = await run<unknown>(supabase.from('coven_meeting_state').select('*').eq('ritual_id', ritualId).maybeSingle()).catch(() => null);
  return cleanState(row, ritualId);
}

export const setChat = (ritualId: string, what: 'open' | 'close' | 'extend', minutes = 15) => rpc('set_coven_meeting_chat', { p_ritual: ritualId, p_what: what, p_minutes: minutes });
export const setFloor = (ritualId: string, userId: string | null) => rpc('set_coven_meeting_floor', { p_ritual: ritualId, p_user: userId });
export const raiseHand = (ritualId: string, up: boolean) => rpc('raise_coven_meeting_hand', { p_ritual: ritualId, p_up: up });
export const setNotes = (stepId: string, notes: string) => rpc('set_coven_meeting_notes', { p_step: stepId, p_notes: notes });
export const secondMotion = (stepId: string, on: boolean) => rpc('second_coven_meeting_motion', { p_step: stepId, p_on: on });
export const proposeAmendment = (stepId: string, text: string) => rpc('propose_coven_meeting_amendment', { p_step: stepId, p_text: text.trim() });
export const decideAmendment = (stepId: string, amendmentId: string, status: 'accepted' | 'rejected' | 'proposed') =>
  rpc('decide_coven_meeting_amendment', { p_step: stepId, p_amendment: amendmentId, p_status: status });
export const callVote = (stepId: string) => rpc('call_coven_meeting_vote', { p_step: stepId });
export const extendItem = (stepId: string, minutes: number) => rpc('extend_coven_meeting_item', { p_step: stepId, p_minutes: minutes });

// ─── Who reads the chat afterwards (the coven's head) ────────────────────

export const setChatReaders = (ritualId: string, readers: string[] | null) => rpc<string[] | null>('set_coven_meeting_chat_readers', { p_ritual: ritualId, p_readers: readers });
export const setMeetingDefaults = (covenId: string, readers: string[] | null) => rpc<string[] | null>('set_coven_meeting_defaults', { p_coven: covenId, p_readers: readers });
export async function fetchMeetingDefaults(covenId: string): Promise<string[] | null> {
  const row = await run<{ meeting_chat_readers: string[] | null } | null>(supabase.from('coven_ritual_settings').select('meeting_chat_readers').eq('coven_id', covenId).maybeSingle()).catch(() => null);
  return row?.meeting_chat_readers ?? null;
}

// ─── The chat ────────────────────────────────────────────────────────────

/** The meeting's chat, oldest first (what row-level security lets you read). */
export async function fetchMeetingMessages(ritualId: string, limit = 300): Promise<MeetingMessage[]> {
  const rows = await run<MeetingMessage[]>(supabase.from('coven_meeting_messages').select('*').eq('ritual_id', ritualId).order('created_at', { ascending: false }).limit(limit));
  return rows.reverse();
}
export const sendMeetingMessage = (ritualId: string, covenId: string, body: string) =>
  run<MeetingMessage>(supabase.from('coven_meeting_messages').insert({ ritual_id: ritualId, coven_id: covenId, body }).select().single());
export const removeMeetingMessage = (id: string) => rpc('remove_coven_meeting_message', { p_message: id });

// ─── Actions ─────────────────────────────────────────────────────────────

/** Actions for these meetings (this one and the ones before it), or every one you can see in a coven. */
export const fetchActions = (covenId: string) =>
  run<MeetingAction[]>(supabase.from('coven_meeting_actions').select(ACTION_FIELDS).eq('coven_id', covenId).order('created_at').limit(1000)).catch(() => [] as MeetingAction[]);
/** Every open action you can see, across your covens (for To tend and reminders; filtered to yours there). */
export const fetchOpenActions = (covenIds: string[]) =>
  covenIds.length
    ? run<MeetingAction[]>(supabase.from('coven_meeting_actions').select(ACTION_FIELDS).in('coven_id', covenIds).eq('status', 'open').limit(1000)).catch(() => [] as MeetingAction[])
    : Promise.resolve([] as MeetingAction[]);
export const addAction = (ritualId: string, stepId: string | null, body: string, assignees: Assignee[], due: string | null) =>
  rpc<MeetingAction>('add_coven_meeting_action', { p_ritual: ritualId, p_step: stepId, p_body: body.trim(), p_assignees: assignees, p_due: due || null });
export const setActionStatus = (actionId: string, status: MeetingAction['status']) => rpc<MeetingAction>('set_coven_meeting_action', { p_action: actionId, p_status: status });
export const removeAction = (actionId: string) => rpc<boolean>('remove_coven_meeting_action', { p_action: actionId });

// ─── Minutes ─────────────────────────────────────────────────────────────

/** Onto the Book's Meeting minutes shelf; the same page each time. `view`: who reads them (left out: as the meeting's settings say). */
export const saveMinutes = (ritualId: string, title: string, blocks: unknown[], view: 'audience' | 'coven' | null = null) =>
  rpc<{ status: string; page_id: string }>('save_coven_meeting_minutes', { p_ritual: ritualId, p_title: title.slice(0, 200), p_blocks: blocks, p_view: view });

// ─── Live ────────────────────────────────────────────────────────────────

export type MeetingChange = { table: 'coven_meeting_messages' | 'coven_meeting_state' | 'coven_meeting_actions'; eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: Record<string, unknown> };

/** Live changes for one meeting: its chat, its state and its actions. Returns a function that stops listening. */
export function listenMeeting(ritualId: string, onChange: (change: MeetingChange) => void): () => void {
  const channel = supabase.channel(`meeting:${ritualId}`);
  for (const table of ['coven_meeting_messages', 'coven_meeting_state', 'coven_meeting_actions'] as MeetingChange['table'][]) {
    channel.on('postgres_changes' as never, { event: '*', schema: 'public', table, filter: `ritual_id=eq.${ritualId}` } as never, (payload: { eventType: MeetingChange['eventType']; new: Record<string, unknown> }) =>
      onChange({ table, eventType: payload.eventType, new: payload.new ?? {} }),
    );
  }
  channel.subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
