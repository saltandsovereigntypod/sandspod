// Founding a coven: the founder's training (seven modules, each a lesson, a
// private reflection and a short test) and the application for a coven to be
// listed in Find a coven, which the Salt & Sovereignty moderators approve, ask
// to change, or decline with a note. Anyone may found a coven and practise in
// it by invitation; only the listing waits. The database decides
// (supabase/migrations/20261129000000_coven_founders_live.sql: the
// covens_listing_guard trigger, record_leader_training, submit_coven_listing,
// review_coven_listing); these say what the screens show.
//
// Pure: shared with the website as SaltCore.covens.founding
// (covens/leading/, covens/moderation/, covens/new/).

import { autoScore, maxPoints, passes, type Answers } from './quiz.ts';
import type { CourseDoc, CourseModule, Quiz } from './courses/types.ts';

/** The modules, in order (the database's leader_training_modules()). */
export const FOUNDER_MODULES: { id: string; slug: string; title: string }[] = [
  { id: 'core-founder-holding-space', slug: 'holding-space', title: 'Holding space and consent' },
  { id: 'core-founder-safeguarding', slug: 'safeguarding', title: 'Safeguarding and boundaries' },
  { id: 'core-founder-rites-in-app', slug: 'rites-in-app', title: 'Running rites and meetings in the app' },
  { id: 'core-founder-conflict-endings', slug: 'conflict-endings', title: 'Conflict and endings' },
  { id: 'core-founder-cultural-respect', slug: 'cultural-respect', title: 'Cultural respect and closed traditions' },
  { id: 'core-founder-crisis-signposting', slug: 'crisis-signposting', title: 'Mental health and crisis signposting' },
  { id: 'core-founder-legal-basics', slug: 'legal-basics', title: 'Age, privacy and money' },
];

/** The reflection asked after each lesson (courses/core/founder.ts puts the same in each step). */
export const FOUNDER_REFLECTIONS: Record<string, string> = {
  'holding-space': 'Think of a time you felt safe in a group, and a time you didn’t. What made the difference, and what will you do so your members feel the first?',
  safeguarding: 'Which warning sign of abuse of power would be hardest for you to notice in yourself? Who will you ask to tell you if they see it?',
  'rites-in-app': 'Plan your coven’s first gathering: what happens, who does what, and how a newcomer will know what to expect.',
  'conflict-endings': 'Write the words you would use to ask someone to leave the coven, kindly and plainly. Then write how you would close the coven if you had to.',
  'cultural-respect': 'List anything in your practice borrowed from a tradition not your own. For each, what do you know of where it comes from, and will you keep it?',
  'crisis-signposting': 'Where would you send a member in crisis, in their country? Write the steps you would take, so you have them ready.',
  'legal-basics': 'Write your coven’s lines on money and privacy, as you will put them in its rules.',
};

export const TRAINING_TITLE = 'Leading a coven: the founder’s training';
export const BADGE_LABEL = 'Trained to lead';
export const PASS_PERCENT = 80;

/** Titles a founder may choose (or write their own). */
export const LEADER_TITLES = ['High Priestess', 'High Priest', 'Leader'] as const;
export const DEFAULT_LEADER_TITLE = 'Leader';

// ─── Training ────────────────────────────────────────────────────────────

/** A passed module (coven_leader_training). */
export type TrainingRow = { module_id: string; score: number; max: number; passed_at: string };

export type TrainingStatus = { passed: Set<string>; count: number; total: number; done: boolean; next: (typeof FOUNDER_MODULES)[number] | null; line: string };

export function trainingStatus(rows: Pick<TrainingRow, 'module_id'>[] | null | undefined): TrainingStatus {
  const known = new Set(FOUNDER_MODULES.map((m) => m.id));
  const passed = new Set((rows ?? []).map((r) => r.module_id).filter((id) => known.has(id)));
  const total = FOUNDER_MODULES.length;
  const count = passed.size;
  const done = count >= total;
  const next = FOUNDER_MODULES.find((m) => !passed.has(m.id)) ?? null;
  const line = done ? `${BADGE_LABEL}: all ${total} modules passed.` : count ? `${count} of ${total} modules passed.` : `${total} short modules: a lesson, a reflection and a test each.`;
  return { passed, count, total, done, next, line };
}

export const moduleBySlug = (slug: string | null | undefined) => FOUNDER_MODULES.find((m) => m.slug === slug || m.id === slug) ?? null;

/** One module's lesson and test from the fetched course (js/core/course-programs.json `founder`). */
export function moduleParts(course: Pick<CourseModule, 'docs' | 'quizzes'> | null | undefined, slug: string): { doc: CourseDoc | null; quiz: Quiz | null } {
  const m = moduleBySlug(slug);
  if (!m || !course) return { doc: null, quiz: null };
  return {
    doc: course.docs.find((d) => d.id === m.id) ?? null,
    quiz: course.quizzes.find((q) => q.id === `quiz-${m.id}`) ?? null,
  };
}

/** A fetched course, if it's sound. */
export function readFounderCourse(raw: unknown): CourseModule | null {
  const v = raw as Partial<CourseModule> | null;
  if (!v || typeof v !== 'object' || !Array.isArray(v.docs) || !Array.isArray(v.quizzes)) return null;
  return v as CourseModule;
}

/** The test's score on the device (choice questions only): what record_leader_training is sent. */
export function scoreModule(quiz: Pick<Quiz, 'questions' | 'passPercent'>, answers: Answers): { score: number; max: number; passed: boolean; unanswered: number } {
  const max = maxPoints(quiz.questions);
  const score = autoScore(quiz.questions, answers);
  const unanswered = quiz.questions.filter((q) => {
    const a = answers[q.id];
    return a === undefined || (Array.isArray(a) && !a.length) || a === '';
  }).length;
  return { score, max, passed: passes(score, max, quiz.passPercent || PASS_PERCENT), unanswered };
}

/** Where a reflection is kept on the device (private: never sent). */
export const reflectionKey = (slug: string) => `coven.founderReflection.${slug}`;

// ─── Listing ─────────────────────────────────────────────────────────────

export type ListingStatus = 'pending' | 'changes' | 'approved' | 'declined' | 'withdrawn';

/** A listing application (coven_listing_applications). */
export type ListingApplication = {
  id: string;
  coven_id: string;
  user_id: string;
  status: ListingStatus;
  leader_title: string;
  path: string;
  experience: string;
  why: string;
  safety: string;
  agreed_guidelines_at: string;
  confirmed_adult_at: string;
  training_completed_at: string | null;
  moderator_note: string | null;
  reviewer_id: string | null;
  submitted_at: string;
  decided_at: string | null;
  updated_at: string;
};

export const APPLICATION_FIELDS = 'id,coven_id,user_id,status,leader_title,path,experience,why,safety,agreed_guidelines_at,confirmed_adult_at,training_completed_at,moderator_note,reviewer_id,submitted_at,decided_at,updated_at';

export const STATUS_WORDS: Record<ListingStatus, string> = {
  pending: 'Waiting for the moderators',
  changes: 'Changes asked for',
  approved: 'Approved',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
};

export type ListingState = {
  key: 'listed' | 'approved' | 'pending' | 'changes' | 'declined' | 'none';
  /** One line for the founder. */
  line: string;
  /** Whether they may (re)apply now. */
  canApply: boolean;
};

/** Where a coven stands with Find a coven, from the coven and its latest application. */
export function listingState(coven: { listing_approved_at?: string | null; visibility: string }, latest: Pick<ListingApplication, 'status' | 'moderator_note'> | null | undefined): ListingState {
  if (coven.listing_approved_at) {
    return coven.visibility === 'listed'
      ? { key: 'listed', line: 'Listed in Find a coven.', canApply: false }
      : { key: 'approved', line: 'Approved for Find a coven. It is unlisted for now; choose Listed in the coven’s details to show it.', canApply: false };
  }
  if (latest?.status === 'pending') return { key: 'pending', line: 'Your application to be listed is with the moderators. You’ll hear when they answer.', canApply: false };
  if (latest?.status === 'changes') return { key: 'changes', line: 'The moderators asked for changes before listing this coven. See their note and send it again.', canApply: true };
  if (latest?.status === 'declined') return { key: 'declined', line: 'The moderators declined to list this coven. It can still practise by invitation.', canApply: true };
  return { key: 'none', line: 'Unlisted: found only by invitation. To appear in Find a coven, finish the founder’s training and apply.', canApply: true };
}

export type ApplicationDraft = { leader_title: string; path: string; experience: string; why: string; safety: string; agree: boolean; adult: boolean };

export const emptyDraft = (from?: Partial<ListingApplication> | null): ApplicationDraft => ({
  leader_title: from?.leader_title ?? DEFAULT_LEADER_TITLE,
  path: from?.path ?? '',
  experience: from?.experience ?? '',
  why: from?.why ?? '',
  safety: from?.safety ?? '',
  agree: false,
  adult: false,
});

/** The questions, as the form asks them. */
export const QUESTIONS: { key: 'path' | 'experience' | 'why' | 'safety'; label: string; hint: string; max: number }[] = [
  { key: 'path', label: 'Your path or tradition', hint: 'What you practise, and what the coven will practise.', max: 2000 },
  { key: 'experience', label: 'Your experience', hint: 'How long you have practised, any training or initiation, and any experience leading groups.', max: 4000 },
  { key: 'why', label: 'Why you are founding this coven', hint: 'Who it is for and what you hope it will be.', max: 4000 },
  { key: 'safety', label: 'How you will keep members safe', hint: 'Consent, boundaries, who members can go to with a concern, and what you will do if something goes wrong.', max: 4000 },
];

export function validateApplication(d: ApplicationDraft, trained: boolean): string[] {
  const errors: string[] = [];
  if (!trained) errors.push('Finish the founder’s training first.');
  const title = d.leader_title.trim();
  if (!title || title.length > 60) errors.push('Choose your title as leader.');
  for (const q of QUESTIONS) {
    const v = d[q.key].trim();
    if (!v) errors.push(`Answer “${q.label}”.`);
    else if (v.length > q.max) errors.push(`Keep “${q.label}” to ${q.max.toLocaleString('en-GB')} characters.`);
  }
  if (!d.agree) errors.push('Agree to lead by the coven guidelines.');
  if (!d.adult) errors.push('Confirm you are 18 or older.');
  return errors;
}

/** For the moderators: a decision's note is needed unless it's an approval. */
export function validateDecision(decision: 'approved' | 'changes' | 'declined', note: string): string | null {
  if (decision !== 'approved' && !note.trim()) return 'Write a note so the founder knows what to change, or why.';
  if (note.length > 2000) return 'Keep the note to 2,000 characters.';
  return null;
}

/** What the founding form says about the directory. */
export const LISTING_NOTE =
  'Every coven starts unlisted, found only by invitation, so you can practise with friends straight away. To appear in Find a coven, finish the founder’s training and apply; the Salt & Sovereignty moderators read every application.';
