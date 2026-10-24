// Counting unread coven chat (unread.ts keeps the counts live).

/** What a new message does to the unread counts: yours, and ones in the chat you're reading, don't count. */
export function countMessage(counts: Record<string, number>, message: { coven_id: string; user_id: string | null; created_at: string }, me: string, read: Record<string, string>, open: string | null) {
  if (!message.coven_id || message.user_id === me || message.coven_id === open) return counts;
  const since = read[message.coven_id];
  if (since && message.created_at <= since) return counts;
  return { ...counts, [message.coven_id]: (counts[message.coven_id] ?? 0) + 1 };
}
