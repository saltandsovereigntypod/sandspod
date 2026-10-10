// Supabase reads and writes for the Community Grimoire and My Submissions.
// Queries match the website's; row-level security does the rest (anyone can
// read published rows and offer pending ones; you read only your own).

import { useCallback } from 'react';

import { useCachedQuery } from '../more/useCachedQuery';
import { useSession } from '../session';
import { supabase } from '../supabase';
import {
  adminMessagePayload,
  notesPatch,
  replyActivity,
  replyPayload,
  reviewPatch,
  unreadCounts,
  type MessageRow,
  type ReviewAction,
  type SubmissionRow,
} from './model';

export type PublishedSnapshot = { entries: SubmissionRow[]; notes: SubmissionRow[] };

export async function fetchPublished(): Promise<PublishedSnapshot> {
  const [entries, notes] = await Promise.all([
    supabase
      .from('community_submissions')
      .select('*')
      .eq('status', 'published')
      .is('parent_submission_id', null)
      .order('updated_at', { ascending: false }),
    supabase
      .from('community_submissions')
      .select('*')
      .eq('status', 'published')
      .eq('submission_type', 'community_note')
      .not('parent_submission_id', 'is', null)
      .order('created_at', { ascending: true }),
  ]);
  if (entries.error) throw new Error(entries.error.message);
  return {
    entries: (entries.data ?? []) as SubmissionRow[],
    // The website shows the page even if Field Notes fail to load.
    notes: notes.error ? [] : ((notes.data ?? []) as SubmissionRow[]),
  };
}

export async function fetchMine(userId: string): Promise<SubmissionRow[]> {
  const { data, error } = await supabase
    .from('community_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SubmissionRow[];
}

export async function fetchMessages(submissionId: string): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from('community_submission_messages')
    .select('*')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MessageRow[];
}

/**
 * Inserts a pending offering or Field Note. No `.select()` afterwards:
 * pending rows aren't readable by guests, so asking for them back would fail.
 */
export async function insertSubmission(payload: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('community_submissions').insert(payload);
  if (error) throw new Error(error.message);
}

export async function sendReply(submissionId: string, userId: string, message: string): Promise<void> {
  const payload = replyPayload(submissionId, userId, message);
  if (!payload) throw new Error('Write a reply first.');
  const { error } = await supabase.from('community_submission_messages').insert(payload);
  if (error) throw new Error(error.message);
  // Like the website, a failed activity update doesn't undo the sent reply.
  await supabase.from('community_submissions').update(replyActivity()).eq('id', submissionId);
}

export function usePublished() {
  return useCachedQuery('community.published', fetchPublished);
}

export function useMySubmissions() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const fetcher = useCallback(() => fetchMine(userId as string), [userId]);
  return useCachedQuery(userId ? `community.mine.${userId}` : null, fetcher);
}

export function useMessages(submissionId: string | undefined) {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const fetcher = useCallback(() => fetchMessages(submissionId as string), [submissionId]);
  return useCachedQuery(userId && submissionId ? `community.messages.${userId}.${submissionId}` : null, fetcher);
}

// ─── Review (admins only), as js/admin-submissions.js does it ─────────────

/** Whether this account may review submissions (user_roles.role = 'admin'). */
export async function fetchIsReviewer(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return !!data;
}

export function useIsReviewer() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const fetcher = useCallback(() => fetchIsReviewer(userId as string), [userId]);
  const { data } = useCachedQuery(userId ? `community.reviewer.${userId}` : null, fetcher);
  return data === true;
}

export type ReviewSnapshot = { submissions: SubmissionRow[]; unread: ReturnType<typeof unreadCounts> };

/**
 * Every submission (newest first) plus unread replies. Like the website,
 * finished work quiet for 90 days moves to Archived first.
 */
export async function fetchReview(): Promise<ReviewSnapshot> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  await supabase
    .from('community_submissions')
    .update({ admin_folder: 'archived', archived_at: now.toISOString(), updated_at: now.toISOString() })
    .in('status', ['published', 'rejected', 'needs_revision'])
    .eq('admin_folder', 'active')
    .lt('last_activity_at', cutoff.toISOString());

  const [submissions, unread] = await Promise.all([
    supabase.from('community_submissions').select('*').order('created_at', { ascending: false }).limit(500),
    supabase
      .from('community_submission_messages')
      .select('submission_id, community_submissions(status)')
      .eq('sender_role', 'user')
      .eq('read_by_admin', false),
  ]);
  if (submissions.error) throw new Error(submissions.error.message);
  const unreadRows = ((unread.data ?? []) as unknown as { submission_id: string; community_submissions: { status: string | null } | null }[]).map(
    (row) => ({ submission_id: row.submission_id, status: row.community_submissions?.status ?? null }),
  );
  return { submissions: (submissions.data ?? []) as SubmissionRow[], unread: unreadCounts(unreadRows) };
}

export function useReview() {
  const isReviewer = useIsReviewer();
  const { session } = useSession();
  return useCachedQuery(isReviewer && session ? `community.review.${session.user.id}` : null, fetchReview);
}

export async function setReviewStatus(submissionId: string, action: ReviewAction, notes: string): Promise<void> {
  const { error } = await supabase.from('community_submissions').update(reviewPatch(action, notes)).eq('id', submissionId);
  if (error) throw new Error(error.message);
}

export async function saveModeratorNotes(submissionId: string, notes: string): Promise<void> {
  const { error } = await supabase.from('community_submissions').update(notesPatch(notes)).eq('id', submissionId);
  if (error) throw new Error(error.message);
}

export async function sendAdminMessage(submissionId: string, userId: string, message: string): Promise<void> {
  const payload = adminMessagePayload(submissionId, userId, message);
  if (!payload) throw new Error('Write a message first.');
  const { error } = await supabase.from('community_submission_messages').insert(payload);
  if (error) throw new Error(error.message);
  await supabase.from('community_submissions').update(replyActivity()).eq('id', submissionId);
}

export async function markRepliesRead(submissionId: string): Promise<void> {
  await supabase
    .from('community_submission_messages')
    .update({ read_by_admin: true })
    .eq('submission_id', submissionId)
    .eq('sender_role', 'user')
    .eq('read_by_admin', false);
}
