// Coven conversations: the whole coven's chat, one-to-one chats and small
// groups (see supabase/migrations/20261029000000_coven_conversations_petition_altars.sql),
// and per-coven notification settings. After a message is sent, the
// coven-notify edge function tells the others' phones.

import { supabase } from '../supabase';
import type { Answer, Reaction, ReplyButtons } from './messageExtras';
import type { Message } from './model';
import type { Conversation, ConversationMember } from './thread';

export type { Conversation, ConversationMember } from './thread';
export type ChatSettings = { notify_coven: boolean; notify_direct: boolean };

/** The thread a route names: 'coven' is the whole coven's chat. */
export const COVEN_THREAD = 'coven';

async function run<T>(query: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as T;
}

/** Your conversations in a coven, newest first, with who's in each. */
export async function fetchConversations(covenId: string): Promise<{ conversations: Conversation[]; members: ConversationMember[] }> {
  const [conversations, members] = await Promise.all([
    run<Conversation[]>(supabase.from('coven_conversations').select('*').eq('coven_id', covenId).order('last_message_at', { ascending: false, nullsFirst: false })),
    run<ConversationMember[]>(supabase.from('coven_conversation_members').select('conversation_id,coven_id,user_id,left_at,muted,last_read_at').eq('coven_id', covenId)),
  ]);
  return { conversations, members };
}

/** The latest messages in a thread, oldest first. */
export async function fetchThread(covenId: string, conversationId: string | null, limit = 200): Promise<Message[]> {
  let query = supabase.from('coven_messages').select('*').eq('coven_id', covenId).order('created_at', { ascending: false }).limit(limit);
  query = conversationId ? query.eq('conversation_id', conversationId) : query.is('conversation_id', null);
  const rows = await run<Message[]>(query);
  return rows.reverse();
}

/** The newest message in each of these conversations (for the list's previews). */
export async function fetchPreviews(covenId: string, conversationIds: string[]): Promise<Record<string, Message>> {
  const out: Record<string, Message> = {};
  await Promise.all(
    [null, ...conversationIds].map(async (id) => {
      const [last] = await fetchThreadLatest(covenId, id);
      if (last) out[id ?? COVEN_THREAD] = last;
    }),
  );
  return out;
}
async function fetchThreadLatest(covenId: string, conversationId: string | null): Promise<Message[]> {
  let query = supabase.from('coven_messages').select('*').eq('coven_id', covenId).order('created_at', { ascending: false }).limit(1);
  query = conversationId ? query.eq('conversation_id', conversationId) : query.is('conversation_id', null);
  return run<Message[]>(query);
}

/** Send a message (a reply to another with `replyTo`, as a card drawn into a coven reading is; with reply buttons), then let the others' phones know (best effort). */
export async function sendMessage(covenId: string, conversationId: string | null, body: string, replyTo: string | null = null, buttons: ReplyButtons | null = null): Promise<Message> {
  const row = await run<Message>(
    supabase
      .from('coven_messages')
      .insert({ coven_id: covenId, conversation_id: conversationId, body, ...(replyTo ? { reply_to: replyTo } : {}), ...(buttons ? { reply_buttons: buttons } : {}) })
      .select()
      .single(),
  );
  void supabase.functions.invoke('coven-notify', { body: { message_id: row.id } }).catch(() => {});
  return row;
}

const rpc = <T>(name: string, args: Record<string, unknown>) => run<T>(supabase.rpc(name, args));
export const openDirect = (covenId: string, userId: string) => rpc<Conversation>('coven_open_direct', { p_coven: covenId, p_user: userId });
export const createGroup = (covenId: string, name: string, userIds: string[]) => rpc<Conversation>('coven_create_group', { p_coven: covenId, p_name: name, p_users: userIds });
export const addToGroup = (conversationId: string, userIds: string[]) => rpc<number>('coven_add_to_group', { p_conversation: conversationId, p_users: userIds });
export const leaveConversation = (conversationId: string) => rpc<boolean>('coven_leave_conversation', { p_conversation: conversationId });
export const muteConversation = (conversationId: string, muted: boolean) => rpc<boolean>('coven_set_conversation', { p_conversation: conversationId, p_muted: muted, p_read: false });

export async function fetchChatSettings(covenId: string, userId: string): Promise<ChatSettings> {
  const { data } = await supabase.from('coven_chat_settings').select('notify_coven,notify_direct').eq('coven_id', covenId).eq('user_id', userId).maybeSingle();
  return (data as ChatSettings | null) ?? { notify_coven: true, notify_direct: true };
}
export const saveChatSettings = (covenId: string, userId: string, settings: ChatSettings) =>
  run(supabase.from('coven_chat_settings').upsert({ user_id: userId, coven_id: covenId, ...settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id,coven_id' }));

// ─── Reactions and reply buttons (messageExtras.ts) ──────────────────────

/** The reactions and answers on these messages. */
export async function fetchExtras(messageIds: string[]): Promise<{ reactions: Reaction[]; answers: Answer[] }> {
  if (!messageIds.length) return { reactions: [], answers: [] };
  const ids = messageIds.slice(-300);
  const [reactions, answers] = await Promise.all([
    run<Reaction[]>(supabase.from('coven_message_reactions').select('id,message_id,user_id,emoji,created_at').in('message_id', ids)).catch(() => [] as Reaction[]),
    run<Answer[]>(supabase.from('coven_message_answers').select('id,message_id,user_id,choice,updated_at').in('message_id', ids)).catch(() => [] as Answer[]),
  ]);
  return { reactions, answers };
}

/** Add your reaction (and let the writer's phone know, if they want it), or take it back. */
export async function react(messageId: string, userId: string, emoji: string, on: boolean): Promise<void> {
  if (!on) {
    await run(supabase.from('coven_message_reactions').delete().eq('message_id', messageId).eq('user_id', userId).eq('emoji', emoji));
    return;
  }
  const row = await run<Reaction>(supabase.from('coven_message_reactions').insert({ message_id: messageId, emoji }).select('id').single());
  if (row?.id) void supabase.functions.invoke('coven-notify', { body: { reaction_id: row.id } }).catch(() => {});
}

/** Answer a message's reply buttons (or change your answer), or take it back (null); the writer hears in a summary. */
export async function answerButtons(messageId: string, userId: string, choice: number | null): Promise<void> {
  if (choice == null) {
    await run(supabase.from('coven_message_answers').delete().eq('message_id', messageId).eq('user_id', userId));
    return;
  }
  await run(supabase.from('coven_message_answers').upsert({ message_id: messageId, user_id: userId, choice }, { onConflict: 'message_id,user_id' }));
  void supabase.functions.invoke('coven-notify', { body: { answer_message_id: messageId } }).catch(() => {});
}

/** Ask for this coven's due gathering reminders (posted in its chat, once each). */
export const askDueReminders = (covenId: string) => void supabase.functions.invoke('coven-notify', { body: { due_coven_id: covenId } }).catch(() => {});

export { conversationTitle, othersIn } from './thread';
