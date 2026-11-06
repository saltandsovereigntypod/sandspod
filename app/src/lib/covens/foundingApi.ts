// Supabase reads and writes for the founder's training and listing
// applications, the same calls the website makes (covens/leading/leading.js,
// covens/moderation/moderation.js). The database decides who may do what
// (supabase/migrations/20261129000000_coven_founders_live.sql); these only ask.

import { CATALOG_URL } from './courseCatalog';
import type { CourseModule } from './courses/types';
import { APPLICATION_FIELDS, readFounderCourse, type ApplicationDraft, type ListingApplication, type TrainingRow } from './founding';
import { supabase } from '../supabase';

async function run<T>(promise: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return data as T;
}
const rpc = <T>(name: string, args: Record<string, unknown>) => run<T>(supabase.rpc(name, args));
const ring = (body: Record<string, unknown>) => void supabase.functions.invoke('coven-listing-notify', { body }).catch(() => {});

// ─── The course ──────────────────────────────────────────────────────────

let course: Promise<CourseModule | null> | null = null;
/** The founder's training, fetched with the coven courses (js/core/course-programs.json `founder`). */
export function loadFounderCourse(): Promise<CourseModule | null> {
  if (!course) {
    course = fetch(CATALOG_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => readFounderCourse((json as { founder?: unknown } | null)?.founder))
      .then((found) => {
        if (!found) course = null;
        return found;
      })
      .catch(() => {
        course = null;
        return null;
      });
  }
  return course;
}

// ─── Training ────────────────────────────────────────────────────────────

export const fetchTraining = (userId: string) =>
  run<TrainingRow[]>(supabase.from('coven_leader_training').select('module_id,score,max,passed_at').eq('user_id', userId)).catch(() => [] as TrainingRow[]);
/** Records a passed module; answers when the whole training was finished (null until then). */
export const recordTraining = (moduleId: string, score: number, max: number) => rpc<string | null>('record_leader_training', { p_module: moduleId, p_score: score, p_max: max });
/** When someone finished the training (the badge), or null. */
export const trainingDone = (userId: string) => rpc<string | null>('leader_training_done', { p_user: userId }).catch(() => null);

// ─── Listing ─────────────────────────────────────────────────────────────

/** The coven's latest listing application, if any. */
export const latestListing = (covenId: string) =>
  run<ListingApplication | null>(
    supabase.from('coven_listing_applications').select(APPLICATION_FIELDS).eq('coven_id', covenId).order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
  ).catch(() => null);

export async function submitListing(covenId: string, d: ApplicationDraft): Promise<ListingApplication> {
  const row = await rpc<ListingApplication>('submit_coven_listing', {
    p_coven: covenId,
    p_title: d.leader_title.trim(),
    p_path: d.path.trim(),
    p_experience: d.experience.trim(),
    p_why: d.why.trim(),
    p_safety: d.safety.trim(),
    p_agree: d.agree,
    p_adult: d.adult,
  });
  // The moderators hear of it (coven-listing-notify).
  if (row?.id) ring({ listing_application_id: row.id });
  return row;
}
export const withdrawListing = (id: string) => rpc<ListingApplication>('withdraw_coven_listing', { p_application: id });

/** For the moderators: applications waiting, and the latest answered, with their covens. */
export type ListingForReview = ListingApplication & { covens: { name: string; slug: string; tagline: string | null; description: string | null; tradition: string | null; joining: string; created_at: string } | null };
export const listingsForReview = () =>
  run<ListingForReview[]>(
    supabase
      .from('coven_listing_applications')
      .select(`${APPLICATION_FIELDS},covens(name,slug,tagline,description,tradition,joining,created_at)`)
      .in('status', ['pending', 'changes', 'approved', 'declined'])
      .order('submitted_at', { ascending: false })
      .limit(100),
  );

export async function reviewListing(id: string, decision: 'approved' | 'changes' | 'declined', note: string): Promise<ListingApplication> {
  const row = await rpc<ListingApplication>('review_coven_listing', { p_application: id, p_decision: decision, p_note: note.trim() || null });
  // The founder hears the answer (coven-listing-notify).
  ring({ listing_application_id: id });
  return row;
}
