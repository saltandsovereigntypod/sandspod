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
  BookPage,
  Coven,
  CovenDocument,
  Member,
  Message,
  Petition,
  Profile,
  Question,
  Rank,
  ReportReason,
  Ritual,
  RitualStep,
  RitualSettings,
  Rsvp,
  Signature,
  StepMark,
  Tending,
} from './model';
import type { Contribution, ParticipationRow } from './contributions';
import type { Assignee } from './picker';
import type { NoticePreview, NoticeRule } from './notices';
import type { AttendanceRow, Checkin, MemberRecord, RecordOverview, RecordSettings } from './record';
import type { RitualRecord } from './script';
import { readOverview, type PathsSettings } from './paths';
import { readChecks, readOverview as readPositionsOverview, type Audience, type RequirementCheck, type RequirementItem } from './positions';
import type { Invitation, InviteLink, InvitePerson, InvitePreview } from './invites';
import { copyPlan } from './courseCopy';
import type { CourseProgram } from './courses/index';
import type { Answers, Attempt, CovenQuiz, DraftQuiz, QuizStanding } from './quiz';
import { FILE_BUCKET, filePath, type DocRead, type DraftDoc, type FileType, type ProgramDoc, type ProgramMessage, type TaskDocLink, type ThreadUnread } from './training';
import { newId } from '../grimoire/ids';
import type { Access } from '../grimoire/access';
import type { Gathering } from '../grimoire/coven';
import type { PageVersion } from '../grimoire/history';
import type { ReviewDecision, Submission, SubmissionBlock } from '../grimoire/submissions';

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

/** Your applications to join still waiting for an answer, with the coven each is for (as the website's directory lists them). */
export async function fetchMyPendingApplications(userId: string): Promise<(Pick<Application, 'id' | 'coven_id' | 'status' | 'created_at'> & { covens: { name: string; slug: string } | null })[]> {
  return run(supabase.from('coven_applications').select('id,coven_id,status,created_at,covens(name,slug)').eq('user_id', userId).eq('status', 'pending').order('created_at', { ascending: false }).limit(50));
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
/** Ask to rise to a position; answers to its own questions go only when it has some (so it still works before the open positions migration). */
export const requestAdvancement = (covenId: string, rankId: string, statement: string, answers?: Record<string, string>) =>
  andNotify('advancement', rpc('request_coven_advancement', { p_coven: covenId, p_rank: rankId, p_statement: statement.trim() || null, ...(answers && Object.keys(answers).length ? { p_answers: answers } : {}) }));
export const withdrawAdvancement = (id: string) => rpc('withdraw_coven_request', { p_kind: 'advancement', p_id: id });
/** Decide a request; `checked` are the custom items and mentor's approval ticked (sent only when there are some). */
export const decideAdvancement = (id: string, approve: boolean, note: string, checked?: string[]) =>
  andNotify('advancement', rpc('decide_coven_advancement', { p_request: id, p_approve: approve, p_note: note.trim() || null, ...(checked && checked.length ? { p_checked: checked } : {}) }));

// ─── Open positions (positions.ts; …_coven_open_positions.sql) ───────────

/** How many hold each position, and each open to you with your checklist; null before the migration. */
export const fetchPositionsOverview = (covenId: string) =>
  rpc<unknown>('coven_positions_overview', { p_coven: covenId }).then(readPositionsOverview).catch(() => null);
/** What a position asks of someone (yourself, or anyone for reviewers). */
export const fetchEligibility = (rankId: string, userId?: string) => rpc<unknown>('coven_rank_eligibility', { p_rank: rankId, ...(userId ? { p_user: userId } : {}) }).then(readChecks);
/** A request's checklist as it stands, ticks included; [] before the migration. */
export const fetchChecklist = (requestId: string) => rpc<unknown>('coven_advancement_checklist', { p_request: requestId }).then(readChecks).catch(() => [] as RequirementCheck[]);
/** Before opening: how many each choice of who hears would reach. */
export const previewPositionNotice = (rankId: string) => rpc<{ everyone: number; eligible: number }>('coven_position_notice_preview', { p_rank: rankId });
/**
 * Let the coven-notify edge function tell people a position has opened
 * (best effort; once per opening, by the leader who opened it). The website
 * does the same (covens/coven-data.js).
 */
export function notifyPositionOpened(rankId: string) {
  let zone = '';
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    // UTC instead.
  }
  void supabase.functions.invoke('coven-notify', { body: { rank_id: rankId, event: 'opened', time_zone: zone } }).catch(() => {});
}
export type OpenResult = { rank: Rank; opening_id: string | null; notify: boolean; closed_full: boolean };
/** Open a position (or change one that's open), and ring phones when it's a new opening with someone to tell. */
export const openPosition = (rankId: string, places: number | null, note: string, closeAt: string | null, notify: Audience) =>
  rpc<OpenResult>('open_coven_position', { p_rank: rankId, p_seat_limit: places, p_note: note.trim() || null, p_close_at: closeAt, p_notify: notify }).then((out) => {
    if (out?.notify) notifyPositionOpened(rankId);
    return out;
  });
export const closePosition = (rankId: string) => rpc<Rank>('close_coven_position', { p_rank: rankId });
export const setPositionPlaces = (rankId: string, places: number | null) => rpc<Rank>('set_coven_position_places', { p_rank: rankId, p_seat_limit: places });
export const saveRankRequirements = (rankId: string, items: RequirementItem[], questions: Question[]) =>
  rpc<Rank>('save_coven_rank_requirements', { p_rank: rankId, p_items: items, p_questions: questions });

export const fetchMembers = (covenId: string) => run<Member[]>(supabase.from('coven_members').select('*').eq('coven_id', covenId).eq('status', 'active').order('joined_at'));
export const sign = (documentId: string, signedName: string) => run(supabase.from('coven_signatures').insert({ document_id: documentId, signed_name: signedName }));
export const join = (covenId: string) => rpc('join_coven', { p_coven: covenId });
export const apply = (covenId: string, answers: Record<string, string>, message: string) =>
  andNotify('application', rpc('apply_to_coven', { p_coven: covenId, p_answers: answers, p_message: message.trim() || null }));
export const withdrawApplication = (id: string) => rpc('withdraw_coven_request', { p_kind: 'application', p_id: id });
export const leave = (covenId: string) => rpc('leave_coven', { p_coven: covenId });

// ─── Invitations (invites.ts; …_coven_invitations.sql) ───────────────────

/** Whether you may invite people to this coven, and whether its members may; null before the database has invitations. */
export const fetchInviteSettings = (covenId: string) =>
  rpc<{ may_invite: boolean; members_can_invite: boolean }>('coven_invite_settings', { p_coven: covenId }).catch(() => null);
/** The leaders' choice: members in good standing may invite people too. */
export const setMembersCanInvite = (covenId: string, on: boolean) => run(supabase.from('covens').update({ members_can_invite: on }).eq('id', covenId));
export const fetchInviteLinks = (covenId: string) =>
  run<InviteLink[]>(supabase.from('coven_invite_links').select('*').eq('coven_id', covenId).order('created_at', { ascending: false }).limit(200));
export const createInviteLink = (covenId: string, days: number | null, uses: number | null, note = '') =>
  rpc<InviteLink>('create_coven_invite_link', { p_coven: covenId, p_expires_in_days: days, p_max_uses: uses, p_note: note.trim() || null });
export const revokeInviteLink = (linkId: string) => rpc<InviteLink>('revoke_coven_invite_link', { p_link: linkId });
/** What a code shows to anyone, signed in or not. */
export const previewInvite = (code: string) => rpc<InvitePreview>('coven_invite_preview', { p_code: code });
export const acceptInviteLink = (code: string) => rpc<Member>('accept_coven_invite_link', { p_code: code });
export const searchInvitable = (covenId: string, query: string) =>
  rpc<InvitePerson[]>('search_invitable_people', { p_coven: covenId, p_query: query.trim() }).then((rows) => rows ?? []);
/** Invitations waiting in a coven (managers, reviewers and those who sent them see them). */
export const fetchCovenInvitations = (covenId: string) =>
  run<Invitation[]>(supabase.from('coven_invitations').select('*').eq('coven_id', covenId).eq('status', 'pending').order('created_at', { ascending: false }).limit(200));
/** Invitations sent to you and still waiting, with the coven each is for. */
export const fetchMyInvitations = (userId: string) =>
  run<(Invitation & { covens: { name: string; slug: string; tagline: string | null; tradition: string | null } | null })[]>(
    supabase.from('coven_invitations').select('*,covens(name,slug,tagline,tradition)').eq('user_id', userId).eq('status', 'pending').order('created_at', { ascending: false }).limit(50),
  );
/** One invitation sent to you, with its coven. */
export const fetchInvitation = (id: string) =>
  run<(Invitation & { covens: { name: string; slug: string; tagline: string | null; tradition: string | null } | null }) | null>(
    supabase.from('coven_invitations').select('*,covens(name,slug,tagline,tradition)').eq('id', id).maybeSingle(),
  );
/**
 * Let the coven-notify edge function ring phones about an invitation (best
 * effort): just sent, it tells the person invited; just accepted, the one who
 * sent it. The website does the same (covens/coven-data.js).
 */
export function notifyInvitation(row: unknown) {
  const id = (row as { id?: string } | null)?.id;
  if (!id) return;
  void supabase.functions.invoke('coven-notify', { body: { invitation_id: id } }).catch(() => {});
}
export const inviteToCoven = (covenId: string, userId: string, message: string) =>
  rpc<Invitation>('invite_to_coven', { p_coven: covenId, p_user: userId, p_message: message.trim() || null }).then((row) => {
    notifyInvitation(row);
    return row;
  });
export const respondToInvitation = (id: string, accept: boolean) =>
  rpc<Invitation>('respond_to_coven_invitation', { p_invitation: id, p_accept: accept }).then((row) => {
    if (accept) notifyInvitation(row);
    return row;
  });
export const revokeInvitation = (id: string) => rpc<Invitation>('revoke_coven_invitation', { p_invitation: id });

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
/**
 * Let the coven-notify edge function tell the coven about a gathering (best
 * effort): put on the calendar, moved, or taken off it. It works out what
 * changed itself, so this is called after every save and change of status.
 * The website does the same (covens/coven-data.js).
 */
export function notifyGathering(ritualId: string | null | undefined) {
  if (!ritualId) return;
  let zone = '';
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    // The date is given in UTC instead.
  }
  void supabase.functions.invoke('coven-notify', { body: { ritual_id: ritualId, time_zone: zone } }).catch(() => {});
}
export const saveRitual = (covenId: string, ritualId: string | null, ritual: Record<string, unknown>, steps: Record<string, unknown>[]) =>
  rpc<Ritual>('save_coven_ritual', { p_coven: covenId, p_ritual_id: ritualId, p_ritual: ritual, p_steps: steps }).then((saved) => {
    notifyGathering(saved?.id);
    return saved;
  });
export const setRitualStatus = (ritualId: string, status: 'draft' | 'scheduled' | 'cancelled' | 'deleted') =>
  rpc<Ritual>('set_coven_ritual_status', { p_ritual: ritualId, p_status: status }).then((saved) => {
    notifyGathering(ritualId);
    return saved;
  });

// Who hears about the coven's gatherings (notices.ts; …_coven_gathering_notices.sql).
/** The coven's rules by kind of gathering; none before the migration is applied. */
export const fetchNoticeRules = (covenId: string) =>
  run<NoticeRule[]>(supabase.from('coven_gathering_notice_rules').select('coven_id,scope,who,updated_by,updated_at').eq('coven_id', covenId)).catch(() => [] as NoticeRule[]);
/** Before sending one by hand: how many it goes to (with a one-off choice of who), whether it was announced, when the next may go. */
export const previewNotice = (ritualId: string, who: string[] | null) => rpc<NoticePreview>('coven_gathering_notice_preview', { p_ritual: ritualId, p_who: who && who.length ? who : null });
/** "Send a notification": its scheduled note or a reminder, with a short note of your own. Resolves with what the edge function said, errors included. */
export async function sendNotice(ritualId: string, note: string, who: string[] | null): Promise<{ error?: string; sent?: number; recipients?: number; event?: string } | null> {
  let zone = '';
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    // UTC instead.
  }
  try {
    const { data, error } = await supabase.functions.invoke('coven-notify', { body: { ritual_id: ritualId, manual: true, note, who: who && who.length ? who : null, time_zone: zone } });
    if (!error) return (data as { sent?: number; recipients?: number; event?: string }) ?? {};
    // A refusal (too soon, not allowed) comes back as the function's own answer.
    const context = (error as { context?: { json?: () => Promise<unknown> } }).context;
    const body = context?.json ? await context.json().catch(() => null) : null;
    return (body as { error?: string } | null) ?? { error: 'failed' };
  } catch {
    return null;
  }
}
/** Set the coven's rule for a kind of gathering; an empty list takes it away. */
export const setNoticeRule = (covenId: string, scope: string, who: string[]) => rpc<NoticeRule | null>('set_coven_gathering_notice_rule', { p_coven: covenId, p_scope: scope, p_who: who });
/** Who can be given a part: members, and whether they've signed the coven's current agreements. */
export const ritualPeople = (covenId: string) => rpc<{ user_id: string; eligible: boolean }[]>('coven_ritual_people', { p_coven: covenId });

// What steps ask of people (contributions.ts; …_coven_ritual_contributions.sql).
// Others' come sealed and unnamed as they should, through the database's function.

/** A ritual's contributions as you may see them. */
export const fetchContributions = (ritualId: string) => rpc<Contribution[]>('coven_ritual_contributions_for', { p_ritual: ritualId }).then((rows) => rows ?? []);
/** Your own, across your covens (for what you have to do before a rite). */
export const fetchMyContributions = (userId: string) =>
  run<{ id: string; step_id: string; ritual_id: string; status: string }[]>(supabase.from('coven_ritual_contributions').select('id,step_id,ritual_id,status').eq('user_id', userId).limit(500));
export const saveContribution = (stepId: string, body: string, items: unknown[], isPrivate: boolean, anonymous: boolean) =>
  rpc<Contribution>('save_coven_ritual_contribution', { p_step: stepId, p_body: body.trim(), p_items: items, p_private: isPrivate, p_anonymous: anonymous });
export const removeContribution = (id: string) => rpc<boolean>('remove_coven_ritual_contribution', { p_contribution: id });
export const offerContribution = (id: string) => rpc<{ contribution: Contribution; petition: Petition | null }>('offer_coven_ritual_contribution', { p_contribution: id });
export const supportContribution = (id: string, kind: 'candle' | 'holding', on: boolean) => rpc<number>('support_coven_ritual_contribution', { p_contribution: id, p_kind: kind, p_on: on });
export const tendContribution = (id: string, status: 'held' | 'answered' | 'closed', note: string) =>
  rpc<Contribution>('tend_coven_ritual_contribution', { p_contribution: id, p_status: status, p_note: note.trim() || null });
/** How many have done each step's asking, and (for those allowed) who has and hasn't. */
export const fetchParticipation = (ritualId: string) => rpc<ParticipationRow[]>('coven_ritual_participation', { p_ritual: ritualId }).then((rows) => rows ?? []);
export const fetchRitualSettings = (covenId: string) => run<RitualSettings | null>(supabase.from('coven_ritual_settings').select('coven_id,participation_viewers').eq('coven_id', covenId).maybeSingle());
export const setParticipationViewers = (covenId: string, viewers: Assignee[]) => rpc<RitualSettings>('set_coven_participation_viewers', { p_coven: covenId, p_viewers: viewers });

// ─── The ritual builder (supabase/migrations/20261103000000_coven_ritual_builder.sql) ───
// Each quietly returns nothing before the database has it.

/** The coven's templates, its own actions and saved blocks of steps. */
export type LibraryRow = { id: string; coven_id: string; kind: 'template' | 'action' | 'block'; title: string; body: Record<string, unknown>; updated_at: string };
export const fetchLibrary = (covenId: string) =>
  run<LibraryRow[]>(supabase.from('coven_ritual_library').select('id,coven_id,kind,title,body,updated_at').eq('coven_id', covenId).order('title').limit(300)).catch(() => [] as LibraryRow[]);
export const saveLibrary = (covenId: string, id: string | null, kind: LibraryRow['kind'], title: string, body: Record<string, unknown>) =>
  rpc<LibraryRow>('save_coven_ritual_library', { p_coven: covenId, p_id: id, p_kind: kind, p_title: title.trim(), p_body: body });
export const removeLibrary = (id: string) => rpc<boolean>('remove_coven_ritual_library', { p_id: id });

/** The checklist: how many have ticked each thing, whether you have, and who (for those who see participation). */
export type PrepRow = { item_id: string; done: number; mine: boolean; users: string[] | null };
export const fetchPrep = (ritualId: string) => rpc<PrepRow[]>('coven_ritual_prep', { p_ritual: ritualId }).then((rows) => rows ?? []).catch(() => [] as PrepRow[]);
export const tickPrep = (ritualId: string, itemId: string, done: boolean) => rpc<boolean>('tick_coven_ritual_prep', { p_ritual: ritualId, p_item: itemId, p_done: done });
/** Your own ticks, across your covens (for reminders). */
export const fetchMyPrepTicks = (userId: string) =>
  run<{ ritual_id: string; item_id: string }[]>(supabase.from('coven_ritual_prep_ticks').select('ritual_id,item_id').eq('user_id', userId).limit(1000)).catch(() => []);

/** A ritual's votes as you may see them. */
export type VoteRow = { step_id: string; counts: Record<string, number> | null; total: number; mine: string | null; ballots: { user_id: string; choice: string }[] | null; closed: boolean };
export const fetchVotes = (ritualId: string) => rpc<VoteRow[]>('coven_ritual_votes_for', { p_ritual: ritualId }).then((rows) => rows ?? []).catch(() => [] as VoteRow[]);
export const castVote = (stepId: string, choice: string) => rpc<boolean>('cast_coven_ritual_vote', { p_step: stepId, p_choice: choice });
export const closeVote = (stepId: string) => rpc('close_coven_ritual_vote', { p_step: stepId });

/** One at a time: the one whose turn it is is done, or the leader moves on (skip) or starts the turns again. */
export const nextTurn = (stepId: string, skip = false) => rpc<RitualStep>('next_coven_ritual_turn', { p_step: stepId, p_skip: skip });
export const restartTurns = (stepId: string) => rpc<RitualStep>('set_coven_ritual_turns', { p_step: stepId, p_order: null });

/** The altar's quiet time after a rite, ended early. */
export const releaseAltarHold = (altarId: string) => rpc('release_coven_altar_hold', { p_altar: altarId });

/** What gatherings left behind (counts, never anyone's words). */
export const fetchRecords = (covenId: string) =>
  run<RitualRecord[]>(supabase.from('coven_ritual_records').select('*').eq('coven_id', covenId).order('ended_at', { ascending: false }).limit(200)).catch(() => [] as RitualRecord[]);
export const fetchRecord = (ritualId: string) => run<RitualRecord | null>(supabase.from('coven_ritual_records').select('*').eq('ritual_id', ritualId).maybeSingle()).catch(() => null);
export const setRecordNotes = (ritualId: string, notes: string) => rpc<RitualRecord>('set_coven_ritual_record_notes', { p_ritual: ritualId, p_notes: notes });

/** Your rites across every coven you're in, with your answers (for phone reminders). */
// ─── The members' record (supabase/migrations/20261102000000_coven_member_record.sql) ───

export const fetchRecordSettings = (covenId: string) =>
  run<RecordSettings | null>(supabase.from('coven_ritual_settings').select('coven_id,record_viewers,mentees_see_checkins').eq('coven_id', covenId).maybeSingle());
export const setRecordViewers = (covenId: string, viewers: Assignee[], menteesSeeCheckins: boolean) =>
  rpc<RecordSettings>('set_coven_record_viewers', { p_coven: covenId, p_viewers: viewers, p_mentees_see_checkins: menteesSeeCheckins });
export const fetchRecordOverview = (covenId: string, since: string | null) => rpc<RecordOverview>('coven_member_record_overview', { p_coven: covenId, p_since: since });
export const fetchMemberRecord = (covenId: string, userId: string) => rpc<MemberRecord>('coven_member_record', { p_coven: covenId, p_user: userId });
/** Called when you open a ritual that's under way (once is enough; quietly does nothing before the database has it). */
export const recordPresence = (ritualId: string) => rpc<AttendanceRow | null>('record_coven_ritual_presence', { p_ritual: ritualId }).catch(() => null);
export const fetchAttendance = (ritualId: string) => run<AttendanceRow[]>(supabase.from('coven_ritual_attendance').select('ritual_id,coven_id,user_id,present,joined_at,marked_by,apology,apology_at,excused').eq('ritual_id', ritualId));
export const markAttendance = (ritualId: string, userId: string, present: boolean | null) => rpc<AttendanceRow>('mark_coven_ritual_attendance', { p_ritual: ritualId, p_user: userId, p_present: present });
export const sendApology = (ritualId: string, note: string | null) => rpc<AttendanceRow>('send_coven_ritual_apology', { p_ritual: ritualId, p_note: note?.trim() || null });
export const excuseAbsence = (ritualId: string, userId: string, excused: boolean) => rpc<AttendanceRow>('excuse_coven_ritual_absence', { p_ritual: ritualId, p_user: userId, p_excused: excused });
export const logCheckin = (covenId: string, userId: string, metOn: string, note: string) =>
  rpc<Checkin>('log_coven_mentor_checkin', { p_coven: covenId, p_user: userId, p_met_on: metOn, p_note: note.trim() || null });
export const removeCheckin = (id: string) => rpc<boolean>('remove_coven_mentor_checkin', { p_checkin: id });
export const addMemberNote = (covenId: string, userId: string, body: string) => rpc('add_coven_member_note', { p_coven: covenId, p_user: userId, p_body: body.trim() });
export const removeMemberNote = (id: string) => rpc<boolean>('remove_coven_member_note', { p_note: id });
/** Remove or ban someone, keeping the reason with their record. */
export const removeMember = (covenId: string, userId: string, status: 'removed' | 'banned', reason: string) =>
  rpc<Member>('remove_coven_member', { p_coven: covenId, p_user: userId, p_status: status, p_reason: reason.trim() || null });

// ─── Paths in the coven (supabase/migrations/20261105000000_coven_paths_overview.sql) ───

/** Whether the head shows the overview to the whole coven (null before the database has it). */
export const fetchPathsSettings = (covenId: string) =>
  run<PathsSettings | null>(supabase.from('coven_ritual_settings').select('coven_id,paths_visible_to_all').eq('coven_id', covenId).maybeSingle());
export const setPathsVisible = (covenId: string, visible: boolean) => rpc<PathsSettings>('set_coven_paths_visible', { p_coven: covenId, p_visible: visible });
/** Only counts, never who: the database leaves out anyone fewer than three share. */
export const fetchPathsOverview = (covenId: string) => rpc<unknown>('coven_paths_overview', { p_coven: covenId }).then(readOverview);

export async function fetchMyRites(userId: string): Promise<{ coven: Coven; ritual: Ritual; response: Rsvp['response'] | null }[]> {
  const covens = await fetchMyCovens(userId);
  if (!covens.length) return [];
  const rituals = await run<Ritual[]>(
    supabase.from('coven_rituals').select('*').in('coven_id', covens.map((c) => c.id)).eq('status', 'scheduled').gte('scheduled_for', new Date().toISOString()).limit(200),
  );
  const answers = await run<Rsvp[]>(supabase.from('coven_ritual_rsvps').select('*').eq('user_id', userId)).catch(() => [] as Rsvp[]);
  return rituals.map((ritual) => ({ coven: covens.find((c) => c.id === ritual.coven_id)!, ritual, response: answers.find((a) => a.ritual_id === ritual.id)?.response ?? null }));
}

/** Gatherings ended in the last week across your covens (for reminders after a rite: clearing the altar, a follow-up). */
export async function fetchRecentlyEnded(userId: string): Promise<(Ritual & { coven_id: string })[]> {
  const covens = await fetchMyCovens(userId);
  if (!covens.length) return [];
  return run<Ritual[]>(
    supabase.from('coven_rituals').select('*').in('coven_id', covens.map((c) => c.id)).eq('status', 'done').gte('ended_at', new Date(Date.now() - 8 * 86400000).toISOString()).limit(100),
  ).catch(() => [] as Ritual[]);
}

// ─── The coven's Book of Shadows ─────────────────────────────────────────

// The book itself (pages, blocks, sections) is read and written by the
// grimoire store (lib/grimoire/covenStore.tsx); these are the rest
// (supabase/migrations/20261106000000_coven_grimoire.sql).

/**
 * The pages the ritual builder links words from, as plain text, only those
 * you can open. Pages named in `ids` that you can't open come back marked
 * hidden (shown as "A page you can't open").
 */
export const fetchBookPages = (covenId: string, ids: string[] = []) =>
  rpc<BookPage[]>('coven_grimoire_page_texts', { p_coven: covenId, p_ids: ids.length ? ids : null }).then((rows) => (rows ?? []).sort((a, b) => a.title.localeCompare(b.title)));

/** The coven's book and its sections you can see (for choosing where a suggestion goes). */
export async function fetchBookSections(covenId: string): Promise<{ bookId: string; sections: { id: string; title: string; shelf: string | null; sort_order: number }[] }> {
  const book = await rpc<{ id: string }>('open_coven_grimoire', { p_coven: covenId });
  const sections = await run<{ id: string; title: string; shelf: string | null; sort_order: number }[]>(
    supabase.from('coven_grimoire_sections').select('id,title,shelf,sort_order').eq('book_id', book.id).order('sort_order'),
  );
  return { bookId: book.id, sections };
}

/** Suggestions for the coven's book you may see (your own, and those you approve). */
export const fetchSubmissions = (covenId: string) =>
  run<Submission[]>(supabase.from('coven_grimoire_submissions').select('*').eq('coven_id', covenId).order('updated_at', { ascending: false }).limit(200)).catch(() => [] as Submission[]);
/** Your suggestions in every coven (for a page of your own grimoire). */
export const fetchMySubmissions = (userId: string) =>
  run<Submission[]>(supabase.from('coven_grimoire_submissions').select('*').eq('submitted_by', userId).order('updated_at', { ascending: false }).limit(200)).catch(() => [] as Submission[]);

/** A suggestion (rings those who approve it), or the answer to one (rings whoever shared it). */
export function notifyBook(row: unknown) {
  const id = (row as { id?: string } | null)?.id;
  const status = (row as { status?: string } | null)?.status;
  if (!id || status === 'draft') return;
  void supabase.functions.invoke('coven-notify', { body: { grimoire_submission_id: id } }).catch(() => {});
}

export async function submitPage(input: {
  covenId: string;
  sectionId: string | null;
  pageId?: string | null;
  title: string;
  pageType?: string | null;
  blocks: SubmissionBlock[];
  note?: string;
  sourcePageId?: string | null;
  submissionId?: string | null;
  send?: boolean;
}): Promise<Submission> {
  const row = await rpc<Submission>('submit_coven_grimoire_page', {
    p_coven: input.covenId,
    p_section: input.sectionId,
    p_page: input.pageId ?? null,
    p_title: input.title.trim(),
    p_page_type: input.pageType ?? null,
    p_blocks: input.blocks,
    p_note: input.note?.trim() || null,
    p_source_page: input.sourcePageId ?? null,
    p_submission: input.submissionId ?? null,
    p_send: input.send ?? true,
  });
  notifyBook(row);
  return row;
}

export async function reviewSubmission(id: string, decision: ReviewDecision, note: string, changes: { title?: string; sectionId?: string | null; blocks?: SubmissionBlock[] } = {}): Promise<Submission> {
  const row = await rpc<Submission>('review_coven_grimoire_submission', {
    p_submission: id,
    p_decision: decision,
    p_note: note.trim() || null,
    p_title: changes.title?.trim() || null,
    p_section: changes.sectionId ?? null,
    p_blocks: changes.blocks ?? null,
  });
  notifyBook(row);
  return row;
}

export const removeSubmission = (id: string) => rpc('remove_coven_grimoire_submission', { p_submission: id });
export const setBookAccess = (kind: 'book' | 'section' | 'page', id: string, access: Access) => rpc<Access>('set_coven_grimoire_access', { p_kind: kind, p_id: id, p_access: access });
export const setBookLayout = (bookId: string, layout: Record<string, unknown>) => rpc('set_coven_grimoire_layout', { p_book: bookId, p_layout: layout });
export const fetchVersions = (pageId: string) =>
  run<PageVersion[]>(supabase.from('coven_grimoire_versions').select('*').eq('page_id', pageId).order('saved_at', { ascending: false }).limit(100));
export const restoreVersion = (versionId: string) => rpc('restore_coven_grimoire_version', { p_version: versionId });

/** What the ritual builder saves into the Book: a rite, an agenda, a record or minutes, once per gathering. */
export async function saveGathering(covenId: string, ritualId: string, what: Gathering, title: string, blocks: unknown[]): Promise<{ status: string; page_id: string | null; submission_id?: string }> {
  const result = await rpc<{ status: string; page_id: string | null; submission_id?: string }>('save_coven_grimoire_gathering', {
    p_coven: covenId,
    p_ritual: ritualId,
    p_what: what,
    p_title: title.slice(0, 200),
    p_blocks: blocks,
  });
  if (result.submission_id) notifyBook({ id: result.submission_id, status: result.status });
  return result;
}

// ─── Petitions ───────────────────────────────────────────────────────────

export const fetchPetitions = (covenId: string) => run<Petition[]>(supabase.from('coven_petitions').select('*').eq('coven_id', covenId).order('created_at', { ascending: false }).limit(1000));
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
// ─── Lessons, tests, practice and each step's conversation ──────────────
// (supabase/migrations/20261110000100_coven_courses.sql; the website's twin is covens/coven-data.js)

/** The coven's lessons and which step each is on, and lessons read by these people. Before the migration, none. */
export async function fetchTraining(covenId: string, userIds: string[]): Promise<{ docs: ProgramDoc[]; links: TaskDocLink[]; reads: DocRead[] }> {
  const [docs, links, reads] = await Promise.all([
    run<ProgramDoc[]>(supabase.from('coven_program_documents').select('*').eq('coven_id', covenId).order('title').limit(2000)).catch(() => [] as ProgramDoc[]),
    run<TaskDocLink[]>(supabase.from('coven_program_task_documents').select('*').eq('coven_id', covenId).limit(5000)).catch(() => [] as TaskDocLink[]),
    userIds.length
      ? run<DocRead[]>(supabase.from('coven_program_doc_reads').select('*').eq('coven_id', covenId).in('user_id', userIds).limit(5000)).catch(() => [] as DocRead[])
      : Promise.resolve([] as DocRead[]),
  ]);
  return { docs, links, reads };
}
export const saveDoc = (covenId: string, id: string | null, doc: DraftDoc) =>
  rpc<ProgramDoc>('save_coven_program_document', { p_coven: covenId, p_id: id, p_doc: { ...doc, title: doc.title.trim(), summary: doc.summary.trim() } });
export async function deleteDoc(id: string) {
  const removed = await rpc<ProgramDoc>('delete_coven_program_document', { p_id: id });
  if (removed?.file_path) await supabase.storage.from(FILE_BUCKET).remove([removed.file_path]).catch(() => undefined);
  return removed;
}
export const markDocRead = (docId: string, read: boolean) => rpc<boolean>('mark_coven_doc_read', { p_document: docId, p_read: read });
/** Put a lesson's file in the coven's private folder. */
export async function uploadLessonFile(covenId: string, body: Blob | ArrayBuffer | Uint8Array, type: FileType, name: string) {
  const path = filePath(covenId, newId(), type);
  const { error } = await supabase.storage.from(FILE_BUCKET).upload(path, body as Blob, { contentType: type, upsert: false });
  if (error) throw new Error(error.message);
  return { file_path: path, file_name: name.slice(0, 200), file_type: type };
}
/** A link to a lesson's file that works for an hour (the bucket is private). */
export async function lessonFileUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(FILE_BUCKET).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) throw new Error(error?.message || 'That file couldn’t be opened.');
  return data.signedUrl;
}

/** The coven's tests in full, for those who manage programs (the table is theirs alone). */
export const fetchQuizzes = (covenId: string) => run<CovenQuiz[]>(supabase.from('coven_program_quizzes').select('*').eq('coven_id', covenId).limit(1000)).catch(() => [] as CovenQuiz[]);
/** A test as this person may see it (without the key for those taking it). */
export const quizView = (quizId: string, enrollmentId: string | null) => rpc<CovenQuiz | null>('coven_quiz_view', { p_quiz: quizId, p_enrollment: enrollmentId });
export const saveQuiz = (covenId: string, id: string | null, quiz: DraftQuiz) => rpc<CovenQuiz>('save_coven_program_quiz', { p_coven: covenId, p_id: id, p_quiz: quiz });
export const fetchAttempts = (covenId: string) =>
  run<Attempt[]>(supabase.from('coven_quiz_attempts').select('*').eq('coven_id', covenId).order('submitted_at', { ascending: false }).limit(2000)).catch(() => [] as Attempt[]);
export const quizStanding = (enrollmentId: string, taskId: string) => rpc<QuizStanding | null>('coven_quiz_standing', { p_enrollment: enrollmentId, p_task: taskId });
export const submitQuiz = (enrollmentId: string, taskId: string, answers: Answers) => rpc<Attempt>('submit_coven_quiz', { p_enrollment: enrollmentId, p_task: taskId, p_answers: answers });
export const scoreQuiz = (attemptId: string, scores: Record<string, { points: number; comment: string }>, feedback: string, final: boolean) =>
  rpc<Attempt>('score_coven_quiz', { p_attempt: attemptId, p_scores: scores, p_feedback: feedback.trim() || null, p_final: final });
export const allowRetake = (enrollmentId: string, taskId: string) => rpc<QuizStanding>('allow_coven_quiz_retake', { p_enrollment: enrollmentId, p_task: taskId });

export const logPractice = (enrollmentId: string, taskId: string, on: string, minutes: number, note: string) =>
  rpc<TaskProgress>('log_coven_practice', { p_enrollment: enrollmentId, p_task: taskId, p_on: on, p_minutes: minutes, p_note: note.trim() || null });
export const removePractice = (enrollmentId: string, taskId: string, index: number) => rpc<TaskProgress>('remove_coven_practice', { p_enrollment: enrollmentId, p_task: taskId, p_index: index });

export const fetchProgramMessages = (enrollmentId: string, taskId: string) =>
  run<ProgramMessage[]>(supabase.from('coven_program_messages').select('*').eq('enrollment_id', enrollmentId).eq('task_id', taskId).order('created_at').limit(500));
export async function postProgramMessage(enrollmentId: string, taskId: string, body: string, attemptId: string | null = null) {
  const saved = await rpc<ProgramMessage>('post_coven_program_message', { p_enrollment: enrollmentId, p_task: taskId, p_body: body.trim(), p_attempt: attemptId });
  // Phones hear about it (best effort): the trainee, or those who oversee them.
  if (saved?.id) void supabase.functions.invoke('coven-notify', { body: { program_thread_message_id: saved.id } }).catch(() => {});
  return saved;
}
/** New messages on a step as they're written (row-level security keeps it to those who may read it). */
export function listenProgramThread(enrollmentId: string, onNew: () => void): () => void {
  const channel = supabase.channel(`coven-training:${enrollmentId}:${Math.random().toString(36).slice(2, 8)}`);
  channel.on('postgres_changes' as never, { event: '*', schema: 'public', table: 'coven_program_messages', filter: `enrollment_id=eq.${enrollmentId}` } as never, () => onNew());
  channel.subscribe();
  return () => void supabase.removeChannel(channel);
}
export const removeProgramMessage = (id: string) => rpc<boolean>('remove_coven_program_message', { p_message: id });
export const readProgramThread = (enrollmentId: string, taskId: string) => rpc<boolean>('read_coven_program_thread', { p_enrollment: enrollmentId, p_task: taskId }).catch(() => false);
export const programUnread = (covenId: string) =>
  rpc<ThreadUnread[]>('coven_program_unread', { p_coven: covenId })
    .then((rows) => rows || [])
    .catch(() => [] as ThreadUnread[]);

/**
 * Copy a ready-made course program into the coven: its lessons and tests
 * (those already copied are kept as the coven has them), then the program as
 * a draft. `onStep` hears how far it's come.
 */
export async function copyCourseProgram(covenId: string, program: CourseProgram, awardRankId: string | null, onStep?: (done: number, of: number) => void): Promise<Program> {
  const plan = copyPlan(program, awardRankId);
  const of = plan.batches.length + 1;
  for (let i = 0; i < plan.batches.length; i += 1) {
    onStep?.(i, of);
    await rpc('import_coven_course', { p_coven: covenId, p_docs: plan.batches[i].docs, p_quizzes: plan.batches[i].quizzes });
  }
  onStep?.(of - 1, of);
  return rpc<Program>('save_coven_program', { p_coven: covenId, p_program_id: null, p_program: plan.head, p_stages: plan.stages });
}

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
  return { userId, covens, memberships, programCovens, rituals, steps, rsvps, programs, stages: parts.stages, tasks: parts.tasks, enrollments, progress, mentors, ranks };
}
