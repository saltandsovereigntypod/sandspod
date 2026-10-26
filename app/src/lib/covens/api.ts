// Supabase reads and writes for covens, the same calls the website makes
// (covens/coven-data.js). Row-level security and the database's functions
// decide who may do what; these only ask.

import { supabase } from '../supabase';
import type { Assignment, Enrollment, Grant, Mentorship, Program, ProgramStage, ProgramTask, ProgramTemplate, StagePass, stagesPayload, TaskProgress } from './programs';
import type {
  Advancement,
  AltarItem,
  Application,
  CovenDraft,
  BookDraft,
  BookPage,
  Coven,
  CovenDocument,
  Member,
  Message,
  Petition,
  Profile,
  Rank,
  ReportReason,
  Ritual,
  RitualStep,
  Rsvp,
  Signature,
  StepMark,
  Tending,
} from './model';

const COVEN_FIELDS =
  'id,slug,name,tagline,description,tradition,tags,meeting_rhythm,joining,visibility,status,moderation_note,application_questions,altar_background,member_limit,practice_traditions,practice_holidays,practice_custom,practice_calendars,founder_id,created_at,member_count';

async function run<T>(promise: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return data as T;
}

const rpc = <T>(name: string, args: Record<string, unknown>) => run<T>(supabase.rpc(name, args));

// ─── You ─────────────────────────────────────────────────────────────────

export type Me = { profile: Profile | null; siteModerator: boolean; admin?: boolean; banned: boolean; blocks: string[] };

export async function fetchMe(userId: string): Promise<Me> {
  const [profile, roles, ban, blocks] = await Promise.all([
    run<Profile | null>(supabase.from('coven_profiles').select('*').eq('user_id', userId).maybeSingle()),
    run<{ role: string }[]>(supabase.from('user_roles').select('role').eq('user_id', userId)).catch(() => []),
    run<unknown>(supabase.from('community_bans').select('user_id').eq('user_id', userId).maybeSingle()).catch(() => null),
    run<{ blocked_id: string }[]>(supabase.from('user_blocks').select('blocked_id').eq('blocker_id', userId)).catch(() => []),
  ]);
  return {
    profile,
    siteModerator: roles.some((r) => r.role === 'admin' || r.role === 'moderator'),
    admin: roles.some((r) => r.role === 'admin'),
    banned: !!ban,
    blocks: blocks.map((b) => b.blocked_id),
  };
}

export async function saveProfile(userId: string, fields: { display_name: string; pronouns: string; bio: string }, existing: boolean): Promise<Profile> {
  const row = { display_name: fields.display_name.trim(), pronouns: fields.pronouns.trim() || null, bio: fields.bio.trim() || null };
  if (existing) return run(supabase.from('coven_profiles').update(row).eq('user_id', userId).select().single());
  const now = new Date().toISOString();
  return run(supabase.from('coven_profiles').insert({ ...row, user_id: userId, age_confirmed_at: now, guidelines_agreed_at: now }).select().single());
}

export async function fetchProfiles(ids: string[]): Promise<Profile[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return [];
  return run(supabase.from('coven_profiles').select('user_id,display_name,pronouns,bio').in('user_id', unique));
}

export const block = (userId: string, blockedId: string) => run(supabase.from('user_blocks').insert({ blocker_id: userId, blocked_id: blockedId }));
export const unblock = (userId: string, blockedId: string) => run(supabase.from('user_blocks').delete().eq('blocker_id', userId).eq('blocked_id', blockedId));

export const report = (userId: string, target: { target_type: string; target_id?: string | null; coven_id?: string | null; target_user_id?: string | null }, reason: ReportReason, details: string) =>
  run(
    supabase.from('coven_reports').insert({
      reporter_id: userId,
      target_type: target.target_type,
      target_id: target.target_id ?? null,
      coven_id: target.coven_id ?? null,
      target_user_id: target.target_user_id ?? null,
      reason,
      details: details.trim() || null,
    }),
  );

// ─── Covens ──────────────────────────────────────────────────────────────

export const fetchDirectory = () =>
  run<Coven[]>(supabase.from('covens').select(COVEN_FIELDS).eq('status', 'active').eq('visibility', 'listed').order('created_at', { ascending: false }).limit(500));

export async function fetchMyCovens(userId: string): Promise<Coven[]> {
  const rows = await run<{ covens: Coven | null }[]>(supabase.from('coven_members').select(`covens(${COVEN_FIELDS})`).eq('user_id', userId).eq('status', 'active'));
  return rows.map((r) => r.covens).filter((c): c is Coven => !!c);
}

/** Your covens with your place in each (membership and the coven's positions), for planning reminders. */
export async function fetchMyStandings(userId: string): Promise<{ coven: Coven; membership: Member; ranks: Rank[] }[]> {
  const rows = await run<(Member & { covens: Coven | null })[]>(
    supabase.from('coven_members').select(`coven_id,user_id,rank_id,status,muted_until,joined_at,covens(${COVEN_FIELDS})`).eq('user_id', userId).eq('status', 'active'),
  );
  const mine = rows.filter((r) => !!r.covens);
  if (!mine.length) return [];
  const ranks = await run<Rank[]>(supabase.from('coven_ranks').select('*').in('coven_id', mine.map((r) => r.coven_id)));
  return mine.map(({ covens, ...membership }) => ({ coven: covens!, membership, ranks: ranks.filter((k) => k.coven_id === membership.coven_id) }));
}

export type CovenSnapshot = {
  coven: Coven;
  ranks: Rank[];
  documents: CovenDocument[];
  membership: Member | null;
  signatures: Signature[];
  application: Application | null;
};

export async function fetchCoven(slug: string, userId: string | null): Promise<CovenSnapshot | null> {
  const coven = await run<Coven | null>(supabase.from('covens').select(COVEN_FIELDS).eq('slug', slug).maybeSingle());
  if (!coven) return null;
  const [ranks, documents, membership, signatures, applications] = await Promise.all([
    run<Rank[]>(supabase.from('coven_ranks').select('*').eq('coven_id', coven.id).order('level')),
    run<CovenDocument[]>(supabase.from('coven_documents').select('*').eq('coven_id', coven.id).order('position')),
    userId ? run<Member | null>(supabase.from('coven_members').select('*').eq('coven_id', coven.id).eq('user_id', userId).maybeSingle()) : Promise.resolve(null),
    userId ? run<Signature[]>(supabase.from('coven_signatures').select('document_id,version,user_id').eq('coven_id', coven.id).eq('user_id', userId)) : Promise.resolve([]),
    userId
      ? run<Application[]>(supabase.from('coven_applications').select('*').eq('coven_id', coven.id).eq('user_id', userId).order('created_at', { ascending: false }).limit(1))
      : Promise.resolve([]),
  ]);
  return { coven, ranks, documents, membership, signatures, application: applications[0] ?? null };
}

// ─── Founding and managing (the database checks who may) ───────────────

export const createCoven = (draft: CovenDraft) =>
  rpc<Coven>('create_coven', {
    p_name: draft.name.trim(),
    p_slug: draft.slug,
    p_tagline: draft.tagline?.trim() || null,
    p_description: draft.description?.trim() || null,
    p_tradition: draft.tradition?.trim() || null,
    p_tags: draft.tags ?? [],
    p_joining: draft.joining ?? 'application',
    p_visibility: draft.visibility ?? 'listed',
    p_meeting_rhythm: draft.meeting_rhythm?.trim() || null,
    p_founder_rank: draft.founder_rank?.trim() || null,
  });
export const updateCoven = (id: string, changes: Partial<Coven>) => run<Coven>(supabase.from('covens').update(changes).eq('id', id).select(COVEN_FIELDS).single());
export const moderateCoven = (id: string, status: Coven['status'], note?: string) => rpc('moderate_coven', { p_coven: id, p_status: status, p_note: note?.trim() || null });
export const saveRank = (rank: Partial<Rank>) =>
  rank.id ? run<Rank>(supabase.from('coven_ranks').update(rank).eq('id', rank.id).select().single()) : run<Rank>(supabase.from('coven_ranks').insert(rank).select().single());
export const deleteRank = (id: string) => run(supabase.from('coven_ranks').delete().eq('id', id));
export const saveDocument = (doc: Partial<CovenDocument>) =>
  doc.id ? run<CovenDocument>(supabase.from('coven_documents').update(doc).eq('id', doc.id).select().single()) : run<CovenDocument>(supabase.from('coven_documents').insert(doc).select().single());
export const deleteDocument = (id: string) => run(supabase.from('coven_documents').delete().eq('id', id));

/** Every membership, former members too (leaders and moderators see them all). */
export const fetchAllMembers = (covenId: string) => run<Member[]>(supabase.from('coven_members').select('*').eq('coven_id', covenId).order('joined_at'));
export const fetchCovenSignatures = (covenId: string) => run<Signature[]>(supabase.from('coven_signatures').select('document_id,version,user_id').eq('coven_id', covenId));
export const updateMember = (covenId: string, userId: string, changes: { rank_id?: string; status?: Member['status']; muted_until?: string; clear_mute?: boolean }) =>
  rpc('update_coven_member', {
    p_coven: covenId,
    p_user: userId,
    p_rank: changes.rank_id ?? null,
    p_status: changes.status ?? null,
    p_muted_until: changes.muted_until ?? null,
    p_clear_mute: !!changes.clear_mute,
  });
export const transferCoven = (covenId: string, userId: string) => rpc('transfer_coven', { p_coven: covenId, p_user: userId });

export function fetchApplications(covenId: string, status: Application['status'] | 'all' = 'pending') {
  let query = supabase.from('coven_applications').select('*').eq('coven_id', covenId).order('created_at', { ascending: status === 'pending' }).limit(100);
  if (status !== 'all') query = query.eq('status', status);
  return run<Application[]>(query);
}
/**
 * Let the coven-notify edge function ring phones about a request (best
 * effort): just made, it tells the coven's reviewers; just decided, it tells
 * the one who asked. The website does the same (covens/coven-data.js).
 */
export function notifyRequest(kind: 'application' | 'advancement', row: unknown) {
  const id = (row as { id?: string } | null)?.id;
  if (!id) return;
  void supabase.functions.invoke('coven-notify', { body: kind === 'application' ? { application_id: id } : { advancement_id: id } }).catch(() => {});
}
async function andNotify<T>(kind: 'application' | 'advancement', call: Promise<T>): Promise<T> {
  const row = await call;
  notifyRequest(kind, row);
  return row;
}

export const decideApplication = (id: string, approve: boolean, note: string) =>
  andNotify('application', rpc('decide_coven_application', { p_application: id, p_approve: approve, p_note: note.trim() || null }));
export const fetchAdvancements = (covenId: string) =>
  run<Advancement[]>(supabase.from('coven_advancement_requests').select('*').eq('coven_id', covenId).eq('status', 'pending').order('created_at'));
export const fetchMyAdvancements = (covenId: string, userId: string) =>
  run<Advancement[]>(supabase.from('coven_advancement_requests').select('*').eq('coven_id', covenId).eq('user_id', userId).order('created_at', { ascending: false }).limit(20));
export const requestAdvancement = (covenId: string, rankId: string, statement: string) =>
  andNotify('advancement', rpc('request_coven_advancement', { p_coven: covenId, p_rank: rankId, p_statement: statement.trim() || null }));
export const withdrawAdvancement = (id: string) => rpc('withdraw_coven_request', { p_kind: 'advancement', p_id: id });
export const decideAdvancement = (id: string, approve: boolean, note: string) =>
  andNotify('advancement', rpc('decide_coven_advancement', { p_request: id, p_approve: approve, p_note: note.trim() || null }));

export const fetchMembers = (covenId: string) => run<Member[]>(supabase.from('coven_members').select('*').eq('coven_id', covenId).eq('status', 'active').order('joined_at'));
export const sign = (documentId: string, signedName: string) => run(supabase.from('coven_signatures').insert({ document_id: documentId, signed_name: signedName }));
export const join = (covenId: string) => rpc('join_coven', { p_coven: covenId });
export const apply = (covenId: string, answers: Record<string, string>, message: string) =>
  andNotify('application', rpc('apply_to_coven', { p_coven: covenId, p_answers: answers, p_message: message.trim() || null }));
export const withdrawApplication = (id: string) => rpc('withdraw_coven_request', { p_kind: 'application', p_id: id });
export const leave = (covenId: string) => rpc('leave_coven', { p_coven: covenId });

// ─── The gathering ───────────────────────────────────────────────────────

export async function fetchMessages(covenId: string, limit = 150): Promise<Message[]> {
  const rows = await run<Message[]>(supabase.from('coven_messages').select('*').eq('coven_id', covenId).is('conversation_id', null).order('created_at', { ascending: false }).limit(limit));
  return rows.reverse();
}
export const sendMessage = (covenId: string, body: string) => run<Message>(supabase.from('coven_messages').insert({ coven_id: covenId, body }).select().single());
export const removeMessage = (id: string) => rpc('remove_coven_message', { p_message: id });

// ─── The altar ───────────────────────────────────────────────────────────

export const fetchAltar = (covenId: string) => run<AltarItem[]>(supabase.from('coven_altar_items').select('*').eq('coven_id', covenId).order('z'));
export const placeOnAltar = (item: Partial<AltarItem>) => run<AltarItem>(supabase.from('coven_altar_items').insert(item).select().single());
export const tendAltarItem = (id: string, changes: Partial<AltarItem>) => run<AltarItem>(supabase.from('coven_altar_items').update(changes).eq('id', id).select().single());
export const clearAltarItem = (id: string) => run(supabase.from('coven_altar_items').delete().eq('id', id));

// ─── Rituals and rites ───────────────────────────────────────────────────

export const fetchRituals = (covenId: string) => run<Ritual[]>(supabase.from('coven_rituals').select('*').eq('coven_id', covenId).order('created_at', { ascending: false }).limit(200));
export async function fetchSteps(ritualIds: string[]): Promise<RitualStep[]> {
  if (!ritualIds.length) return [];
  return run(supabase.from('coven_ritual_steps').select('*').in('ritual_id', ritualIds).order('position'));
}
export async function fetchRsvps(ritualIds: string[]): Promise<Rsvp[]> {
  if (!ritualIds.length) return [];
  return run(supabase.from('coven_ritual_rsvps').select('*').in('ritual_id', ritualIds));
}
export const fetchMarks = (ritualId: string) => run<StepMark[]>(supabase.from('coven_ritual_step_marks').select('*').eq('ritual_id', ritualId));
export const rsvp = (ritualId: string, response: Rsvp['response'] | null) => rpc<Rsvp | null>('rsvp_coven_ritual', { p_ritual: ritualId, p_response: response });
export const startRitual = (ritualId: string) => rpc<Ritual>('start_coven_ritual', { p_ritual: ritualId });
export const finishStep = (stepId: string) => rpc<Ritual>('finish_coven_ritual_step', { p_step: stepId });
export const goToStep = (ritualId: string, stepId: string | null) => rpc<Ritual>('go_to_coven_ritual_step', { p_ritual: ritualId, p_step: stepId });
export const performStepAction = (stepId: string) => rpc('perform_coven_step_action', { p_step: stepId });
export const saveRitual = (covenId: string, ritualId: string | null, ritual: Record<string, unknown>, steps: Record<string, unknown>[]) =>
  rpc<Ritual>('save_coven_ritual', { p_coven: covenId, p_ritual_id: ritualId, p_ritual: ritual, p_steps: steps });
export const setRitualStatus = (ritualId: string, status: 'draft' | 'scheduled' | 'cancelled' | 'deleted') => rpc<Ritual>('set_coven_ritual_status', { p_ritual: ritualId, p_status: status });
/** Who can be given a part: members, and whether they've signed the coven's current agreements. */
export const ritualPeople = (covenId: string) => rpc<{ user_id: string; eligible: boolean }[]>('coven_ritual_people', { p_coven: covenId });

/** Your rites across every coven you're in, with your answers (for phone reminders). */
export async function fetchMyRites(userId: string): Promise<{ coven: Coven; ritual: Ritual; response: Rsvp['response'] | null }[]> {
  const covens = await fetchMyCovens(userId);
  if (!covens.length) return [];
  const rituals = await run<Ritual[]>(
    supabase.from('coven_rituals').select('*').in('coven_id', covens.map((c) => c.id)).eq('status', 'scheduled').gte('scheduled_for', new Date().toISOString()).limit(200),
  );
  const answers = await run<Rsvp[]>(supabase.from('coven_ritual_rsvps').select('*').eq('user_id', userId)).catch(() => [] as Rsvp[]);
  return rituals.map((ritual) => ({ coven: covens.find((c) => c.id === ritual.coven_id)!, ritual, response: answers.find((a) => a.ritual_id === ritual.id)?.response ?? null }));
}

// ─── The coven's Book of Shadows ─────────────────────────────────────────

export const fetchBookPages = (covenId: string) => run<BookPage[]>(supabase.from('coven_book_pages').select('*').eq('coven_id', covenId).order('title').limit(500));
export const fetchBookDrafts = (covenId: string) =>
  run<BookDraft[]>(supabase.from('coven_book_drafts').select('*').eq('coven_id', covenId).neq('status', 'published').order('updated_at', { ascending: false }).limit(200));
export const saveBookDraft = (covenId: string, draftId: string | null, pageId: string | null, fields: { title: string; section: string; body: string }, submit: boolean) =>
  rpc<BookDraft>('save_coven_book_draft', { p_coven: covenId, p_draft: draftId, p_page: pageId, p_title: fields.title.trim(), p_section: fields.section.trim() || null, p_body: fields.body, p_submit: submit });
export const reviewBookDraft = (draftId: string, approve: boolean, note: string) => rpc<BookDraft>('review_coven_book_draft', { p_draft: draftId, p_approve: approve, p_note: note.trim() || null });

// ─── Petitions ───────────────────────────────────────────────────────────

export const fetchPetitions = (covenId: string) => run<Petition[]>(supabase.from('coven_petitions').select('*').eq('coven_id', covenId).order('created_at', { ascending: false }).limit(100));
export async function fetchTendings(petitionIds: string[]): Promise<Tending[]> {
  if (!petitionIds.length) return [];
  return run(supabase.from('coven_petition_tendings').select('*').in('petition_id', petitionIds).order('created_at', { ascending: false }).limit(1000));
}
export const askPetition = (covenId: string, title: string, body: string, color: string) => rpc<Petition>('ask_coven_petition', { p_coven: covenId, p_title: title.trim(), p_body: body.trim() || null, p_color: color });
export const tendPetition = (petitionId: string, note: string) => rpc<Petition>('tend_coven_petition', { p_petition: petitionId, p_note: note.trim() || null });
export const closePetition = (petitionId: string, status: 'answered' | 'closed', note: string) => rpc<Petition>('close_coven_petition', { p_petition: petitionId, p_status: status, p_note: note.trim() || null });

// ─── Initiation and training ─────────────────────────────────────────────

export const fetchGrants = (covenId: string) => run<Grant[]>(supabase.from('coven_grants').select('coven_id,user_id,power').eq('coven_id', covenId));
export const setGrant = (covenId: string, userId: string, power: Grant['power'], enabled: boolean) =>
  rpc<boolean>('set_coven_grant', { p_coven: covenId, p_user: userId, p_power: power, p_enabled: enabled });
export const fetchMentors = (covenId: string) => run<Mentorship[]>(supabase.from('coven_mentors').select('coven_id,user_id,mentor_id,assigned_at').eq('coven_id', covenId));
export const setMentor = (covenId: string, userId: string, mentorId: string | null) => rpc('set_coven_mentor', { p_coven: covenId, p_user: userId, p_mentor: mentorId });
export const fetchPrograms = (covenId: string) => run<Program[]>(supabase.from('coven_programs').select('*').eq('coven_id', covenId).order('position'));
export async function fetchProgramParts(programIds: string[]): Promise<{ stages: ProgramStage[]; tasks: ProgramTask[] }> {
  if (!programIds.length) return { stages: [], tasks: [] };
  const [stages, tasks] = await Promise.all([
    run<ProgramStage[]>(supabase.from('coven_program_stages').select('*').in('program_id', programIds).order('position')),
    run<ProgramTask[]>(supabase.from('coven_program_tasks').select('*').in('program_id', programIds).order('position')),
  ]);
  return { stages, tasks };
}
export const fetchProgramTemplates = () => run<ProgramTemplate[]>(supabase.from('coven_program_templates').select('*').order('position'));
export const saveProgram = (covenId: string, programId: string | null, program: Record<string, unknown>, stages: ReturnType<typeof stagesPayload>) =>
  rpc<Program>('save_coven_program', { p_coven: covenId, p_program_id: programId, p_program: program, p_stages: stages });
export const setProgramStatus = (programId: string, status: Program['status'] | 'deleted') => rpc<Program>('set_coven_program_status', { p_program: programId, p_status: status });
export const fetchAssignments = (covenId: string) => run<Assignment[]>(supabase.from('coven_program_assignments').select('*').eq('coven_id', covenId));
export const assignProgram = (programId: string, userId: string | null, rankId: string | null) => rpc<number>('assign_coven_program', { p_program: programId, p_user: userId, p_rank: rankId });
export const unassignProgram = (assignmentId: string) => rpc<boolean>('unassign_coven_program', { p_assignment: assignmentId });
export const startProgram = (programId: string) => rpc<Enrollment>('start_coven_program', { p_program: programId });
export const fetchEnrollments = (covenId: string) => run<Enrollment[]>(supabase.from('coven_program_enrollments').select('*').eq('coven_id', covenId).order('started_at').limit(1000));
export const fetchProgress = (covenId: string) => run<TaskProgress[]>(supabase.from('coven_program_progress').select('*').eq('coven_id', covenId).limit(5000));
export const fetchStagePasses = (covenId: string) => run<StagePass[]>(supabase.from('coven_program_stage_passes').select('*').eq('coven_id', covenId).limit(2000));
export const recordTask = (enrollmentId: string, taskId: string, response: string, count: number) =>
  rpc<TaskProgress>('record_coven_task', { p_enrollment: enrollmentId, p_task: taskId, p_response: response.trim() || null, p_count: count });
export const checkTask = (progressId: string, approve: boolean, feedback: string) => rpc<TaskProgress>('check_coven_task', { p_progress: progressId, p_approve: approve, p_feedback: feedback.trim() || null });
export const passStage = (enrollmentId: string, note: string, override = false) => rpc<Enrollment>('pass_coven_stage', { p_enrollment: enrollmentId, p_note: note.trim() || null, p_override: override });
export const setEnrollmentStatus = (enrollmentId: string, status: 'active' | 'paused' | 'withdrawn') => rpc<Enrollment>('set_coven_enrollment_status', { p_enrollment: enrollmentId, p_status: status });
export const saveCalendar = (covenId: string, traditions: string[], holidays: string[], custom: { id: string; name: string; month: number; day: number; meaning: string }[]) =>
  run<Coven>(supabase.from('covens').update({ practice_traditions: traditions, practice_holidays: holidays, practice_custom: custom }).eq('id', covenId).select(COVEN_FIELDS).single());


// ─── Site moderation (Salt & Sovereignty's moderators) ──────────────────

export type Report = {
  id: string;
  reporter_id: string | null;
  coven_id: string | null;
  target_type: string;
  target_id: string | null;
  target_user_id: string | null;
  reason: string;
  details: string | null;
  snapshot: string | null;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  resolution_note: string | null;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
  covens?: { name: string; slug: string } | null;
};
export type Ban = { user_id: string; reason: string | null; banned_by: string | null; created_at: string };
export type Moderator = { user_id: string; email: string | null; display_name: string | null; role: string };

export const fetchReports = (status: Report['status'] | 'all') => {
  let query = supabase.from('coven_reports').select('*, covens(name,slug)').order('created_at', { ascending: false }).limit(200);
  if (status !== 'all') query = query.eq('status', status);
  return run<Report[]>(query);
};
export const resolveReport = (id: string, userId: string, status: Report['status'], note: string) =>
  run(
    supabase
      .from('coven_reports')
      .update({ status, resolution_note: note.trim() || null, resolved_by: userId, resolved_at: status === 'open' || status === 'reviewing' ? null : new Date().toISOString() })
      .eq('id', id),
  );
export const fetchAllCovens = () => run<Coven[]>(supabase.from('covens').select(COVEN_FIELDS).order('created_at', { ascending: false }).limit(1000));
export const fetchBans = () => run<Ban[]>(supabase.from('community_bans').select('*').order('created_at', { ascending: false }));
export const banEveryCoven = (userId: string, by: string, reason: string) => run(supabase.from('community_bans').insert({ user_id: userId, reason: reason.trim() || null, banned_by: by }));
export const liftBan = (userId: string) => run(supabase.from('community_bans').delete().eq('user_id', userId));
export const fetchModerators = () => rpc<Moderator[]>('list_community_moderators', {});
export const setModerator = (email: string, enabled: boolean) => rpc('set_community_moderator', { p_email: email.trim(), p_enabled: enabled });

// ─── Live ────────────────────────────────────────────────────────────────

export type LiveTable = 'coven_messages' | 'coven_altar_items' | 'coven_rituals' | 'coven_ritual_steps' | 'coven_ritual_rsvps' | 'coven_ritual_step_marks' | 'coven_petitions';
export type LiveChange = { table: LiveTable; eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: Record<string, unknown>; old: Record<string, unknown> };

/** Live changes for one coven, and who else is here. Returns a function that stops listening. */
export function listen(
  covenId: string,
  me: { userId: string; name: string },
  onChange: (change: LiveChange) => void,
  onPresence: (people: { user_id: string; name: string; place?: string }[]) => void,
): { track: (place: string) => void; stop: () => void } {
  const channel = supabase.channel(`coven:${covenId}`, { config: { presence: { key: me.userId } } });
  const tables: LiveTable[] = ['coven_messages', 'coven_altar_items', 'coven_rituals', 'coven_ritual_steps', 'coven_ritual_rsvps', 'coven_ritual_step_marks', 'coven_petitions'];
  for (const table of tables) {
    channel.on('postgres_changes' as never, { event: '*', schema: 'public', table, filter: `coven_id=eq.${covenId}` } as never, (payload: { eventType: LiveChange['eventType']; new: Record<string, unknown>; old: Record<string, unknown> }) =>
      onChange({ table, eventType: payload.eventType, new: payload.new ?? {}, old: payload.old ?? {} }),
    );
  }
  // Deletes can't be filtered by coven; ids the app doesn't hold are ignored.
  for (const table of ['coven_altar_items', 'coven_rituals', 'coven_ritual_steps'] as LiveTable[]) {
    channel.on('postgres_changes' as never, { event: 'DELETE', schema: 'public', table } as never, (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) =>
      onChange({ table, eventType: 'DELETE', new: {}, old: payload.old ?? {} }),
    );
  }
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState() as Record<string, { user_id: string; name: string; place?: string }[]>;
    onPresence(Object.values(state).map((list) => list[0]).filter(Boolean));
  });
  let place = 'coven';
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') void channel.track({ user_id: me.userId, name: me.name, place });
  });
  return {
    track(next: string) {
      place = next;
      void channel.track({ user_id: me.userId, name: me.name, place }).catch(() => {});
    },
    stop() {
      void supabase.removeChannel(channel);
    },
  };
}

// ─── Today ───────────────────────────────────────────────────────────────

/** Everything Today's coven section needs, across this person's covens (see today.ts). */
export async function fetchCovenToday(userId: string): Promise<import('./today').CovenTodayInput | null> {
  const memberships = await run<Member[]>(supabase.from('coven_members').select('coven_id,user_id,rank_id,status,muted_until,joined_at').eq('user_id', userId).eq('status', 'active'));
  const ids = memberships.map((m) => m.coven_id);
  if (!ids.length) return null;
  const [covens, ranks, grants, rituals, rsvps, enrollments, progress, mentors] = await Promise.all([
    run<Coven[]>(supabase.from('covens').select(COVEN_FIELDS).in('id', ids).eq('status', 'active')),
    run<Rank[]>(supabase.from('coven_ranks').select('id,coven_id,name,level,can_manage,can_manage_programs').in('coven_id', ids)),
    run<Grant[]>(supabase.from('coven_grants').select('coven_id,user_id,power').eq('user_id', userId)).catch(() => [] as Grant[]),
    run<Ritual[]>(supabase.from('coven_rituals').select('*').in('coven_id', ids).in('status', ['scheduled', 'live']).limit(100)),
    run<Rsvp[]>(supabase.from('coven_ritual_rsvps').select('*').eq('user_id', userId)).catch(() => [] as Rsvp[]),
    run<Enrollment[]>(supabase.from('coven_program_enrollments').select('*').in('coven_id', ids).limit(500)).catch(() => [] as Enrollment[]),
    run<TaskProgress[]>(supabase.from('coven_program_progress').select('*').in('coven_id', ids).limit(3000)).catch(() => [] as TaskProgress[]),
    run<Mentorship[]>(supabase.from('coven_mentors').select('coven_id,user_id,mentor_id,assigned_at').in('coven_id', ids)).catch(() => [] as Mentorship[]),
  ]);
  const live = rituals.filter((r) => r.status === 'live').map((r) => r.id);
  const programIds = [...new Set([...enrollments.filter((e) => e.user_id === userId).map((e) => e.program_id), ...progress.filter((p) => p.status === 'submitted').map((p) => p.program_id)])];
  const [steps, programs, parts] = await Promise.all([
    live.length ? fetchSteps(live) : Promise.resolve([] as RitualStep[]),
    programIds.length ? run<Program[]>(supabase.from('coven_programs').select('*').in('id', programIds)) : Promise.resolve([] as Program[]),
    fetchProgramParts(programIds),
  ]);
  const programCovens = covens
    .filter((c) => {
      const m = memberships.find((x) => x.coven_id === c.id);
      const rank = ranks.find((r) => r.id === m?.rank_id);
      return c.founder_id === userId || rank?.can_manage || rank?.can_manage_programs || grants.some((g) => g.coven_id === c.id && g.power === 'manage_programs');
    })
    .map((c) => c.id);
  return { userId, covens, memberships, programCovens, rituals, steps, rsvps, programs, stages: parts.stages, tasks: parts.tasks, enrollments, progress, mentors };
}
