// Community Grimoire rules and payloads, matching js/community-grimoire.js and
// js/submissions.js so rows written here look exactly like the website's.

export type SubmissionRow = {
  id: string;
  user_id: string | null;
  parent_submission_id: string | null;
  submission_type: string;
  note_type: string | null;
  title: string;
  body: string;
  display_as: string | null;
  display_name: string | null;
  anonymous: boolean | null;
  tags: string[] | null;
  status: string | null;
  reviewer_response: string | null;
  created_at: string | null;
  updated_at: string | null;
  published_at?: string | null;
  last_activity_at?: string | null;
};

export type MessageRow = {
  id: string;
  submission_id: string;
  user_id: string | null;
  sender_role: string;
  message: string;
  created_at: string | null;
};

/** What people can offer (the website's submit form, in its order). */
export const OFFERING_TYPES = [
  { value: 'community_grimoire', label: 'Community Grimoire' },
  { value: 'podcast', label: 'Podcast Story or Question' },
  { value: 'blog', label: 'Blog or Journal Submission' },
  { value: 'ritual_experience', label: 'Ritual Experience' },
  { value: 'dream_experience', label: 'Dream Experience' },
  { value: 'other', label: 'Other' },
] as const;

/** Filters on the Community Grimoire page. */
export const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'community_grimoire', label: 'Community Grimoire' },
  { value: 'ritual_experience', label: 'Ritual Experiences' },
  { value: 'dream_experience', label: 'Dream Experiences' },
  { value: 'blog', label: 'Blog or Journal' },
  { value: 'podcast', label: 'Podcast Stories' },
  { value: 'other', label: 'Other' },
] as const;

export const NOTE_TYPES = [
  { value: 'reflection', label: 'Reflection' },
  { value: 'outcome', label: 'Outcome' },
  { value: 'substitution', label: 'Substitution' },
  { value: 'question', label: 'Question' },
] as const;

export const DISPLAY_AS = [
  { value: 'anonymous', label: 'Anonymous' },
  { value: 'preferred_name', label: 'Preferred name' },
  { value: 'magical_name', label: 'Magical name' },
] as const;
export type DisplayAs = (typeof DISPLAY_AS)[number]['value'];

export const FIELD_NOTE_MAX = 1200;
export const DISPLAY_NAME_MAX = 60;

const TYPE_LABELS: Record<string, string> = {
  community_grimoire: 'Community Grimoire',
  community_note: 'Field Note',
  podcast: 'Podcast Story or Question',
  blog: 'Blog or Journal Submission',
  ritual_experience: 'Ritual Experience',
  dream_experience: 'Dream Experience',
  other: 'Other',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Not accepted',
  published: 'Published',
  needs_revision: 'Needs revision',
};

export const typeLabel = (type: string | null | undefined) => TYPE_LABELS[type ?? ''] || 'Community Offering';
export const statusLabel = (status: string | null | undefined) => STATUS_LABELS[status ?? ''] || status || 'Pending review';
export const noteTypeLabel = (type: string | null | undefined) =>
  NOTE_TYPES.find((note) => note.value === type)?.label ?? 'Field Note';

export function authorName(entry: Pick<SubmissionRow, 'anonymous' | 'display_name'>): string {
  if (entry.anonymous) return 'Anonymous';
  return entry.display_name || 'Community Member';
}

export function parseTags(value: string): string[] {
  return String(value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function paragraphs(body: string | null | undefined): string[] {
  return String(body || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Same matching as the website: type filter plus a plain substring search. */
export function filterEntries(entries: SubmissionRow[], search: string, type: string): SubmissionRow[] {
  const term = search.trim().toLowerCase();
  return entries.filter((entry) => {
    const matchesType = type === 'all' || entry.submission_type === type;
    if (!matchesType) return false;
    if (!term) return true;
    const searchable = [entry.title, entry.body, entry.display_name, entry.submission_type, ...(entry.tags || [])]
      .join(' ')
      .toLowerCase();
    return searchable.includes(term);
  });
}

export function notesFor(notes: SubmissionRow[], entryId: string): SubmissionRow[] {
  return notes.filter((note) => note.parent_submission_id === entryId);
}

export type OfferingInput = {
  submissionType: string;
  title: string;
  body: string;
  displayAs: DisplayAs;
  tags: string;
  originalWorkConfirmed: boolean;
  termsAgreed: boolean;
};

type Result<T> = { ok: true; payload: T } | { ok: false; message: string };

/** The name the website records for each "Publish or reference as" choice. */
export function offeringDisplayName(displayAs: DisplayAs, names: { preferred_name?: string; magical_name?: string }) {
  if (displayAs === 'preferred_name') return names.preferred_name || 'Preferred Name';
  if (displayAs === 'magical_name') return names.magical_name || 'Magical Name';
  return 'Anonymous';
}

export function offeringPayload(
  input: OfferingInput,
  context: { userId: string | null; names: { preferred_name?: string; magical_name?: string } },
): Result<Record<string, unknown>> {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) return { ok: false, message: 'Please add a title and your offering.' };
  if (!OFFERING_TYPES.some((type) => type.value === input.submissionType))
    return { ok: false, message: 'Choose what you would like to offer.' };
  if (!input.originalWorkConfirmed)
    return { ok: false, message: 'Please confirm this is your own work, or that you may share it.' };
  if (!input.termsAgreed) return { ok: false, message: 'Please agree to the Submission Terms.' };
  return {
    ok: true,
    payload: {
      user_id: context.userId,
      submission_type: input.submissionType,
      title,
      body,
      display_as: input.displayAs,
      display_name: offeringDisplayName(input.displayAs, context.names),
      anonymous: input.displayAs === 'anonymous',
      tags: parseTags(input.tags),
      original_work_confirmed: true,
      terms_agreed: true,
      status: 'pending',
    },
  };
}

export type FieldNoteInput = { noteType: string; displayName: string; body: string; termsAgreed: boolean };

export function fieldNotePayload(
  input: FieldNoteInput,
  context: { userId: string | null; parent: Pick<SubmissionRow, 'id' | 'title'> },
): Result<Record<string, unknown>> {
  const body = input.body.trim().slice(0, FIELD_NOTE_MAX);
  const displayName = input.displayName.trim().slice(0, DISPLAY_NAME_MAX);
  const noteType = NOTE_TYPES.some((note) => note.value === input.noteType) ? input.noteType : 'reflection';
  if (!body) return { ok: false, message: 'Please write your Field Note before offering it.' };
  if (!input.termsAgreed) return { ok: false, message: 'Please confirm you understand Field Notes are reviewed first.' };
  return {
    ok: true,
    payload: {
      user_id: context.userId,
      parent_submission_id: context.parent.id,
      submission_type: 'community_note',
      note_type: noteType,
      title: `Field Note on: ${context.parent.title || 'Community Grimoire Page'}`,
      body,
      display_as: displayName ? 'custom' : 'anonymous',
      display_name: displayName || 'Anonymous',
      anonymous: !displayName,
      tags: ['field-note', noteType],
      original_work_confirmed: true,
      terms_agreed: true,
      status: 'pending',
    },
  };
}

export function replyPayload(submissionId: string, userId: string, message: string) {
  const text = message.trim();
  if (!text) return null;
  return { submission_id: submissionId, user_id: userId, sender_role: 'user', message: text };
}

/** After a reply the website moves the thread back to the active folder. */
export function replyActivity(now: Date = new Date()) {
  const at = now.toISOString();
  return { admin_folder: 'active', archived_at: null, last_activity_at: at, updated_at: at };
}

export function senderLabel(message: Pick<MessageRow, 'sender_role'>): string {
  return message.sender_role === 'admin' ? 'Salt & Sovereignty' : 'You';
}

export function communityDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export const SUBMISSION_TERMS = [
  'Thank you for contributing to Salt & Sovereignty.',
  'By submitting content, you confirm that your submission is your own work, or that you have permission to share it.',
  'You continue to own your original work. By submitting it, you give Salt & Sovereignty permission to edit, publish, reproduce, distribute, adapt, archive, and feature your submission, in whole or in part, on the website, Community Grimoire, podcast, blog, newsletter, social media, books, or future Salt & Sovereignty projects.',
  'Submissions may be edited for spelling, grammar, formatting, length, clarity, safety, or privacy while preserving the intended meaning whenever possible.',
  'Submitting content does not guarantee publication.',
  'If you choose to submit anonymously, Salt & Sovereignty will not intentionally publish identifying information.',
  'Please do not include private information about another identifiable person without their permission.',
  'Published content may remain part of previously released podcasts, articles, videos, newsletters, archives, or other media, even if you later request removal.',
  'Salt & Sovereignty may decline, edit, remove, or choose not to publish any submission for any reason.',
];
