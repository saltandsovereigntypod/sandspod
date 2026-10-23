// Supabase reads and writes for covens, the same calls the website makes
// (covens/coven-data.js). Row-level security and the database's functions
// decide who may do what; these only ask.

import { supabase } from '../supabase';
import type {
  AltarItem,
  Application,
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
  'id,slug,name,tagline,description,tradition,tags,meeting_rhythm,joining,visibility,status,moderation_note,application_questions,altar_background,founder_id,created_at,member_count';

async function run<T>(promise: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return data as T;
}

const rpc = <T>(name: string, args: Record<string, unknown>) => run<T>(supabase.rpc(name, args));

// ─── You ─────────────────────────────────────────────────────────────────

export type Me = { profile: Profile | null; siteModerator: boolean; banned: boolean; blocks: string[] };

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

export const fetchMembers = (covenId: string) => run<Member[]>(supabase.from('coven_members').select('*').eq('coven_id', covenId).eq('status', 'active').order('joined_at'));
export const sign = (documentId: string, signedName: string) => run(supabase.from('coven_signatures').insert({ document_id: documentId, signed_name: signedName }));
export const join = (covenId: string) => rpc('join_coven', { p_coven: covenId });
export const apply = (covenId: string, answers: Record<string, string>, message: string) => rpc('apply_to_coven', { p_coven: covenId, p_answers: answers, p_message: message.trim() || null });
export const withdrawApplication = (id: string) => rpc('withdraw_coven_request', { p_kind: 'application', p_id: id });
export const leave = (covenId: string) => rpc('leave_coven', { p_coven: covenId });

// ─── The gathering ───────────────────────────────────────────────────────

export async function fetchMessages(covenId: string, limit = 150): Promise<Message[]> {
  const rows = await run<Message[]>(supabase.from('coven_messages').select('*').eq('coven_id', covenId).order('created_at', { ascending: false }).limit(limit));
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
