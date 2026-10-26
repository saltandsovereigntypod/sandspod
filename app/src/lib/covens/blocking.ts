// What blocking someone changes in the coven's messages: their words are
// hidden (in a thread and in the list's previews), and a one-to-one chat with
// them can't be written in until you unblock them. The database also stops
// either of you starting a new conversation with the other, and their
// messages don't ring your phone (supabase/functions/coven-notify). Pure, so
// it can be tested.

import type { Message } from './model.ts';
import { previewLine, type Conversation, type ConversationMember } from './thread.ts';

export const BLOCKED_MESSAGE = 'A message from someone you blocked.';

/** The list's line for a conversation, without the words of someone you've blocked. */
export function blockedPreview(message: Message | undefined, me: string | null, nameOf: (id: string) => string, group: boolean, blocks: string[]): string {
  if (message && !message.deleted_at && message.user_id && message.user_id !== me && blocks.includes(message.user_id)) return BLOCKED_MESSAGE;
  return previewLine(message, me, nameOf, group);
}

/** In a one-to-one chat, the other person when you've blocked them; otherwise null. */
export function blockedPartner(conversation: Conversation | null, members: ConversationMember[], me: string | null, blocks: string[]): string | null {
  if (!conversation || conversation.kind !== 'direct') return null;
  const other = members.find((m) => m.conversation_id === conversation.id && m.user_id !== me);
  return other && blocks.includes(other.user_id) ? other.user_id : null;
}

/** Your block list after blocking or unblocking someone. */
export function withBlock(blocks: string[], userId: string, blocked: boolean): string[] {
  const rest = blocks.filter((id) => id !== userId);
  return blocked ? [...rest, userId] : rest;
}
