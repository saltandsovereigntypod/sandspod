// Two things a coven altar offers beside the altar itself: a small chat window
// over it (the coven's chat, or one of your conversations, without leaving the
// altar) and deleting an altar for good. Pure, so the app and the website
// (js/core/covens.js, SaltCore.covens.altarPanel) decide them the same way.

import type { Conversation, ConversationMember } from './thread.ts';

// ─── Deleting an altar ──────────────────────────────────────────────────

/** Who may delete an altar mirrors who may clear it away (delete_coven_altar, archive_coven_altar). */
export type DeleteCheck = { ok: boolean; reason: string | null };

/**
 * Whether you may delete this altar for good: its keepers can (the coven's
 * head, positions that keep altars, whoever started it, the site's
 * moderators), never the coven's main ritual altar, and not while a ritual is
 * under way at it. The database decides in the end.
 */
export function canDeleteAltar(
  altar: { is_main: boolean } | null | undefined,
  access: { keeper: boolean; ritual_id: string | null } | null | undefined,
): DeleteCheck {
  if (!altar || !access) return { ok: false, reason: null };
  if (altar.is_main) return { ok: false, reason: 'The coven’s ritual altar stays. Clear things from it instead.' };
  if (!access.keeper) return { ok: false, reason: 'Only the altar’s keeper deletes it.' };
  if (access.ritual_id) return { ok: false, reason: 'A ritual is under way at this altar. Delete it once the ritual ends.' };
  return { ok: true, reason: null };
}

/** The question asked before an altar is deleted, word for word in the app and on the website. */
export function deleteAltarWords(name: string) {
  return {
    title: `Delete ${name.trim() || 'this altar'}?`,
    body: 'This removes the altar and everything on it for the whole coven. This can’t be undone.',
    confirm: 'Delete the altar',
    // Offered beside it, for keeping the altar out of sight instead.
    gentler: 'Clearing it away hides it instead, and its keepers can bring it back.',
  };
}

// ─── The chat window over an altar ──────────────────────────────────────

/** Your conversations in this coven that you're still in, newest first (as the Messages list shows them). */
export function myConversations(conversations: Conversation[], members: ConversationMember[], me: string | null): Conversation[] {
  if (!me) return [];
  return conversations
    .filter((c) => members.some((m) => m.conversation_id === c.id && m.user_id === me && !m.left_at))
    .sort((a, b) => (b.last_message_at ?? b.created_at ?? '').localeCompare(a.last_message_at ?? a.created_at ?? ''));
}

/** An unread count as a badge shows it. */
export const badgeLabel = (count: number) => (count > 99 ? '99+' : String(Math.max(0, Math.floor(count))));

/** What the chat button says to a screen reader. */
export const chatButtonLabel = (count: number, open: boolean) =>
  `${open ? 'Close messages' : 'Messages'}${count > 0 ? `, ${badgeLabel(count)} unread` : ''}`;

/**
 * Where the chat window sits so the altar stays in view: along the bottom,
 * a little over half the screen, when the screen is upright; down the right
 * side when it's wide (a tablet, a sideways phone, a wide browser window).
 */
export function chatPanelFrame(width: number, height: number): { side: 'bottom' | 'right'; width: number; height: number } {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  if (w >= 720 || w > h * 1.2) return { side: 'right', width: Math.round(Math.min(400, Math.max(300, w * 0.4))), height: h };
  return { side: 'bottom', width: w, height: Math.round(Math.min(520, Math.max(280, h * 0.55))) };
}
