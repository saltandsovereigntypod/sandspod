// How a conversation reads, like a phone's messages: bubbles grouped into runs
// from the same person (their name over the first one, in a group), and a
// time between runs when a while has passed; and what a conversation is
// called. Pure, so it can be tested (and built into js/core/covens.js).

import type { Message } from './model.ts';

export type Conversation = {
  id: string;
  coven_id: string;
  kind: 'direct' | 'group';
  name: string | null;
  created_by: string | null;
  created_at: string;
  last_message_at: string | null;
};
export type ConversationMember = { conversation_id: string; coven_id: string; user_id: string; left_at: string | null; muted: boolean; last_read_at: string | null };

export type ThreadItem =
  | { kind: 'time'; key: string; label: string }
  | {
      kind: 'message';
      key: string;
      message: Message & { hidden?: boolean };
      mine: boolean;
      /** First and last of a run from the same person (rounded corners, name, gap). */
      first: boolean;
      last: boolean;
      showName: boolean;
    };

const RUN_MS = 5 * 60_000;
const TIME_MS = 30 * 60_000;

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Today 7:42 pm", "Yesterday 9:05 am", "Tuesday 8:00 pm", "12 Oct 8:00 pm". */
export function timeLabel(at: Date, now: Date = new Date()): string {
  const time = at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (sameDay(at, now)) return `Today ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(at, yesterday)) return `Yesterday ${time}`;
  if (now.getTime() - at.getTime() < 6 * 86_400_000) return `${at.toLocaleDateString(undefined, { weekday: 'long' })} ${time}`;
  return `${at.toLocaleDateString(undefined, { day: 'numeric', month: 'short', ...(at.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) })} ${time}`;
}

/** The thread, oldest first, as bubbles and times. `group` shows names (the coven chat and groups). */
export function threadItems(messages: (Message & { hidden?: boolean })[], me: string | null, group: boolean, now: Date = new Date()): ThreadItem[] {
  const sorted = [...messages].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const items: ThreadItem[] = [];
  sorted.forEach((message, i) => {
    const at = new Date(message.created_at);
    const prev = sorted[i - 1];
    const next = sorted[i + 1];
    const gapBefore = prev ? at.getTime() - new Date(prev.created_at).getTime() : Infinity;
    const gapAfter = next ? new Date(next.created_at).getTime() - at.getTime() : Infinity;
    if (!prev || gapBefore > TIME_MS || !sameDay(new Date(prev.created_at), at)) items.push({ kind: 'time', key: `t-${message.id}`, label: timeLabel(at, now) });
    const timeBreakBefore = !prev || gapBefore > TIME_MS || !sameDay(new Date(prev.created_at), at);
    const timeBreakAfter = !next || gapAfter > TIME_MS || !sameDay(new Date(next.created_at), at);
    const first = timeBreakBefore || prev.user_id !== message.user_id || gapBefore > RUN_MS;
    const last = timeBreakAfter || next.user_id !== message.user_id || gapAfter > RUN_MS;
    const mine = !!me && message.user_id === me;
    items.push({ kind: 'message', key: message.id, message, mine, first, last, showName: group && first && !mine });
  });
  return items;
}

/** A short line for a conversation in the list: "You: see you there", or theirs. */
export function previewLine(message: Message | undefined, me: string | null, nameOf: (id: string) => string, group: boolean): string {
  if (!message) return 'No messages yet';
  if (message.deleted_at) return 'A message was removed';
  const words = message.body.replace(/\s+/g, ' ').trim();
  if (message.user_id === me) return `You: ${words}`;
  return group && message.user_id ? `${nameOf(message.user_id)}: ${words}` : words;
}

/** When, for the list: a time today, a weekday this week, else a date. */
export function listTime(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return '';
  const at = new Date(iso);
  if (sameDay(at, now)) return at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (now.getTime() - at.getTime() < 6 * 86_400_000) return at.toLocaleDateString(undefined, { weekday: 'short' });
  return at.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** What a conversation is called for you: the other person, or the group's name. */
export function conversationTitle(conversation: Conversation, members: ConversationMember[], me: string | null, nameOf: (id: string) => string): string {
  if (conversation.kind === 'group') return conversation.name || 'Group';
  const other = members.find((m) => m.conversation_id === conversation.id && m.user_id !== me);
  return other ? nameOf(other.user_id) : 'Conversation';
}

/** Who else is in a conversation, still. */
export const othersIn = (conversationId: string, members: ConversationMember[], me: string | null) =>
  members.filter((m) => m.conversation_id === conversationId && m.user_id !== me && !m.left_at).map((m) => m.user_id);
