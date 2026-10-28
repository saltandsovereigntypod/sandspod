// Supabase calls for daughter covens and leadership (lineage.ts;
// supabase/migrations/20261112000000_coven_lineage.sql), the same calls the
// website makes (covens/coven/lineage.js). The database decides who may.
// Reads come back null or empty before that migration is applied.

import { supabase } from '../supabase';
import type { Rank } from './model';
import type { CopyChoice, CopyKind, DaughterRequest, Disclosure, HeadReport, LibraryItem, Lineage, LineageEvent, MembershipChoice, OldHeadChoice, PushPreview, ReleaseRequest, Succession } from './lineage';

async function run<T>(promise: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return data as T;
}
const rpc = <T>(name: string, args: Record<string, unknown>) => run<T>(supabase.rpc(name, args));

/** Tell coven-notify about what you just did (best effort): lineage lines, overrides, leadership changes. */
export function notifyLineage(covenId: string | null | undefined) {
  if (covenId) void supabase.functions.invoke('coven-notify', { body: { lineage_coven_id: covenId } }).catch(() => {});
}
export function notifyLeadership(covenId: string | null | undefined) {
  if (covenId) void supabase.functions.invoke('coven-notify', { body: { leadership_coven_id: covenId } }).catch(() => {});
}
async function andTell<T>(covenId: string, call: Promise<T>, which: 'lineage' | 'leadership' = 'lineage'): Promise<T> {
  const result = await call;
  if (which === 'lineage') notifyLineage(covenId);
  else notifyLeadership(covenId);
  return result;
}

// ─── Lineage ─────────────────────────────────────────────────────────────

export const fetchLineage = (covenId: string) => rpc<Lineage | null>('coven_lineage', { p_coven: covenId }).catch(() => null);
/** What a daughter coven tells anyone before they join (null when it isn't one, or before the migration). */
export const fetchDisclosure = (slug: string) => rpc<Disclosure | null>('coven_disclosure', { p_slug: slug }).catch(() => null);
export const fetchLineageLog = (covenId: string) =>
  run<LineageEvent[]>(supabase.from('coven_lineage_events').select('*').eq('coven_id', covenId).order('created_at', { ascending: false }).limit(100)).catch(() => [] as LineageEvent[]);

// ─── Founding ────────────────────────────────────────────────────────────

export type DaughterDraft = { name: string; slug: string; tagline?: string; description?: string; tradition?: string; joining?: string; visibility?: string; founder_rank?: string };

export const requestDaughter = (motherId: string, draft: DaughterDraft, copy: Partial<Record<CopyChoice, boolean>>, membership: MembershipChoice, note: string) =>
  andTell(motherId, rpc<DaughterRequest>('request_daughter_coven', { p_mother: motherId, p_draft: draft, p_copy: copy, p_membership: membership, p_note: note.trim() || null }));
export const withdrawDaughterRequest = (motherId: string, id: string) => andTell(motherId, rpc<DaughterRequest>('withdraw_daughter_request', { p_request: id }));
export const decideDaughterRequest = (motherId: string, id: string, approve: boolean, note: string, headId: string | null, copy: Partial<Record<CopyChoice, boolean>> | null) =>
  andTell(motherId, rpc<DaughterRequest>('decide_daughter_request', { p_request: id, p_approve: approve, p_note: note.trim() || null, p_head: headId, p_copy: copy }));
export const fetchDaughterRequests = (motherId: string) =>
  run<DaughterRequest[]>(supabase.from('coven_daughter_requests').select('*').eq('mother_coven_id', motherId).order('created_at', { ascending: false }).limit(50)).catch(() => [] as DaughterRequest[]);
export const fetchMyDaughterRequests = (motherId: string, userId: string) =>
  run<DaughterRequest[]>(supabase.from('coven_daughter_requests').select('*').eq('mother_coven_id', motherId).eq('requested_by', userId).order('created_at', { ascending: false }).limit(5)).catch(() => [] as DaughterRequest[]);
export const fetchDaughterFounders = (covenId: string) =>
  run<{ user_id: string }[]>(supabase.from('coven_daughter_founders').select('user_id').eq('coven_id', covenId)).catch(() => [] as { user_id: string }[]);
export const setDaughterFounder = (covenId: string, userId: string, on: boolean) => rpc<boolean>('set_coven_daughter_founder', { p_coven: covenId, p_user: userId, p_enabled: on });
/** A position's "may ask to found a daughter coven" power. */
export const setRankFoundsDaughters = (rank: Pick<Rank, 'id'>, on: boolean) => run(supabase.from('coven_ranks').update({ can_found_daughter: on }).eq('id', rank.id));

// ─── Sharing, the library, pushing ───────────────────────────────────────

export const setShared = (covenId: string, kind: CopyKind, itemId: string, shared: boolean) =>
  rpc<boolean>('set_coven_shared_with_daughters', { p_coven: covenId, p_kind: kind, p_item: itemId, p_shared: shared });
export const fetchMotherLibrary = (daughterId: string) => rpc<LibraryItem[]>('coven_mother_library', { p_daughter: daughterId }).catch(() => [] as LibraryItem[]);
export const copyFromMother = (daughterId: string, kind: CopyKind, itemId: string) =>
  andTell(daughterId, rpc<{ kind: CopyKind; item_id: string }>('copy_from_mother_coven', { p_daughter: daughterId, p_kind: kind, p_item: itemId }));
export const pushPreview = (daughterId: string, kind: CopyKind, itemId: string) => rpc<PushPreview>('coven_push_preview', { p_daughter: daughterId, p_kind: kind, p_item: itemId });
export const pushToDaughter = (daughterId: string, kind: CopyKind, itemId: string) =>
  andTell(daughterId, rpc<{ kind: CopyKind; item_id: string }>('push_to_daughter_coven', { p_daughter: daughterId, p_kind: kind, p_item: itemId }));
/** What the coven has that can be shared, by kind (the share screen's lists). */
export async function fetchShareables(covenId: string): Promise<{ kind: CopyKind; id: string; title: string; detail?: string }[]> {
  const [docs, ranks, programs, sections, pages, library] = await Promise.all([
    run<{ id: string; title: string; kind: string }[]>(supabase.from('coven_documents').select('id,title,kind').eq('coven_id', covenId).order('position')).catch(() => []),
    run<{ id: string; name: string }[]>(supabase.from('coven_ranks').select('id,name').eq('coven_id', covenId).order('level')).catch(() => []),
    run<{ id: string; title: string; status: string }[]>(supabase.from('coven_programs').select('id,title,status').eq('coven_id', covenId).neq('status', 'archived').order('position')).catch(() => []),
    run<{ id: string; title: string; shelf: string | null; access: Record<string, unknown> }[]>(supabase.from('coven_grimoire_sections').select('id,title,shelf,access').eq('coven_id', covenId).order('sort_order')).catch(() => []),
    run<{ id: string; title: string; section_id: string | null; access: Record<string, unknown> }[]>(supabase.from('coven_grimoire_pages').select('id,title,section_id,access').eq('coven_id', covenId).order('sort_order').limit(500)).catch(() => []),
    run<{ id: string; title: string; kind: string }[]>(supabase.from('coven_ritual_library').select('id,title,kind').eq('coven_id', covenId).order('title')).catch(() => []),
  ]);
  const closed = new Set(sections.filter((s) => s.shelf === 'records' || s.shelf === 'minutes' || Array.isArray(s.access?.view)).map((s) => s.id));
  return [
    ...docs.filter((d) => ['creed', 'rules', 'requirements', 'agreement'].includes(d.kind)).map((d) => ({ kind: 'document' as const, id: d.id, title: d.title })),
    ...ranks.map((r) => ({ kind: 'rank' as const, id: r.id, title: r.name })),
    ...programs.map((p) => ({ kind: 'program' as const, id: p.id, title: p.title, detail: p.status === 'draft' ? 'Draft' : undefined })),
    ...sections.filter((s) => !closed.has(s.id)).map((s) => ({ kind: 'book_section' as const, id: s.id, title: s.title })),
    ...pages.filter((p) => !(p.section_id && closed.has(p.section_id)) && !Array.isArray(p.access?.view)).map((p) => ({ kind: 'book_page' as const, id: p.id, title: p.title })),
    ...library.map((l) => ({ kind: 'ritual_library' as const, id: l.id, title: l.title, detail: l.kind === 'template' ? 'Template' : l.kind === 'action' ? 'Action' : 'Saved block' })),
    { kind: 'calendar' as const, id: covenId, title: 'The practice calendar' },
  ];
}

// ─── Releasing ───────────────────────────────────────────────────────────

export const releaseDaughter = (daughterId: string, note: string) => andTell(daughterId, rpc('release_daughter_coven', { p_daughter: daughterId, p_note: note.trim() || null }));
export const askRelease = (daughterId: string, note: string) => andTell(daughterId, rpc<ReleaseRequest>('ask_to_release_daughter_coven', { p_daughter: daughterId, p_note: note.trim() || null }));
export const decideRelease = (daughterId: string, id: string, approve: boolean, note: string) =>
  andTell(daughterId, rpc<ReleaseRequest>('decide_release_request', { p_request: id, p_approve: approve, p_note: note.trim() || null }));

// ─── Leadership ──────────────────────────────────────────────────────────

/** Hand on leadership, choosing what the head who steps back keeps (falls back to transfer_coven before the migration). */
export async function handOn(covenId: string, userId: string, oldHead: OldHeadChoice, stepTo: string | null) {
  const result = await run<{ kind: string }>(supabase.rpc('hand_on_coven', { p_coven: covenId, p_user: userId, p_old: oldHead, p_old_rank: oldHead === 'step_down' ? stepTo : null })).catch(async (error: Error) => {
    if (!/hand_on_coven/.test(error.message)) throw error;
    return run<{ kind: string }>(supabase.rpc('transfer_coven', { p_coven: covenId, p_user: userId }));
  });
  notifyLeadership(covenId);
  notifyLineage(covenId);
  return result;
}
export const fetchSuccession = (covenId: string) => run<Succession | null>(supabase.from('coven_succession').select('*').eq('coven_id', covenId).maybeSingle()).catch(() => null);
export const setSuccessors = (covenId: string, first: string | null, second: string | null) =>
  andTell(covenId, rpc<Succession>('set_coven_successors', { p_coven: covenId, p_first: first, p_second: second }), 'leadership');
export const reportHeadUnreachable = (covenId: string, note: string) => rpc('report_coven_head_unreachable', { p_coven: covenId, p_note: note.trim() || null });
export const fetchMyHeadReport = (covenId: string, userId: string) =>
  run<{ id: string; status: string; created_at: string } | null>(
    supabase.from('coven_head_reports').select('id,status,created_at').eq('coven_id', covenId).eq('reported_by', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ).catch(() => null);
export const fetchHeadReports = () => rpc<HeadReport[]>('coven_head_reports_queue', {});
export async function resolveHeadReport(report: HeadReport, transferTo: string | null, note: string) {
  const result = await rpc('resolve_coven_head_report', { p_report: report.id, p_transfer_to: transferTo, p_note: note.trim() || null });
  if (transferTo) notifyLeadership(report.coven.id);
  return result;
}
