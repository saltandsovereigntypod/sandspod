// Counting unread coven messages (unread.ts keeps the counts live). Each
// thread has its own count: a coven's whole chat is kept under the coven's
// id, and each conversation under "<coven id>:<conversation id>".

export type Incoming = { coven_id: string; conversation_id?: string | null; user_id: string | null; created_at: string };

export const threadKey = (covenId: string, conversationId?: string | null) => (conversationId ? `${covenId}:${conversationId}` : covenId);

/** What a new message does to the unread counts: yours, and ones in the thread you're reading, don't count. */
export function countMessage(counts: Record<string, number>, message: Incoming, me: string, read: Record<string, string>, open: string | null) {
  const key = threadKey(message.coven_id, message.conversation_id);
  if (!message.coven_id || message.user_id === me || key === open) return counts;
  const since = read[key];
  if (since && message.created_at <= since) return counts;
  return { ...counts, [key]: (counts[key] ?? 0) + 1 };
}

/** A coven's unread messages across its chat and conversations. */
export const covenTotal = (counts: Record<string, number>, covenId: string) =>
  Object.entries(counts).reduce((sum, [key, n]) => (key === covenId || key.startsWith(`${covenId}:`) ? sum + n : sum), 0);
