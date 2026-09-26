// Supabase reads and writes for the Community Grimoire and My Submissions.
// Queries match the website's; row-level security does the rest (anyone can
// read published rows and offer pending ones; you read only your own).

import { useCallback } from 'react';

import { useCachedQuery } from '../more/useCachedQuery';
import { useSession } from '../session';
import { supabase } from '../supabase';
import { replyActivity, replyPayload, type MessageRow, type SubmissionRow } from './model';

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
