// Rituals: the journal, templates, the running session and planned workings.
//
// Signed in, everything reads and writes the website's tables (ritual_templates,
// ritual_template_steps, ritual_sessions, ritual_session_steps, user_rituals,
// ritual_links), with a copy kept on the device for offline reading, as the
// grimoire store does. Guests keep sessions and journal entries on the device,
// as the website does for guests (js/ritual-lifecycle.js); templates need an
// account there, so they do here too.
//
// This is a module-level store (useSyncExternalStore) so both the Rituals tab
// and Today can read it without a provider in the root layout.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useSyncExternalStore } from 'react';

import { useSession } from '../session';
import { supabase } from '../supabase';
import { applyAnswers, createSession, finishSession, journalPayload, uuid, type StartSource } from './lifecycle';
import { isSyncable, mergePlans, planRow, unsyncedPlans, type PlanRow } from './planSync';
import {
  journalLibraryEntry,
  journalLinks,
  journalRow,
  sessionFromRows,
  sessionRow,
  sessionStepRows,
  templateLibraryEntry,
  templateLinks,
  templatePageMetadata,
  templatePayload,
  uniqueLinks,
} from './rows';
import type {
  Ingredient,
  JournalAnswers,
  JournalRow,
  RitualLinkRow,
  RitualPlan,
  RitualSession,
  SessionRow,
  SessionStepRow,
  TemplateDraft,
  TemplateRow,
} from './types';

export type AltarSummary = { id: string; name: string };
type Status = 'idle' | 'loading' | 'ready' | 'offline' | 'error';

export type RitualsState = {
  /** null while nobody is signed in: rituals live on this device. */
  userId: string | null;
  status: Status;
  error: string | null;
  templates: TemplateRow[];
  journal: JournalRow[];
  links: RitualLinkRow[];
  altars: AltarSummary[];
  active: RitualSession | null;
  plans: RitualPlan[];
  /** Guest rituals still on this device after signing in, ready to bring over. */
  deviceCount: number;
  fetchedAt: string | null;
};

type DeviceRituals = { version: 1; activeSessionId: string | null; sessions: RitualSession[]; journals: JournalRow[] };
type Snapshot = Pick<RitualsState, 'templates' | 'journal' | 'links' | 'altars' | 'fetchedAt'>;

// The same key the website uses for guest rituals, so the shape is familiar.
const DEVICE_KEY = 'saltAndSovereigntyRitualLifecycle:guest';
const PLANS_KEY = 'rituals.plans.v1';
// Plans removed while offline, deleted from ritual_plans on the next sync.
const PLAN_DELETES_KEY = 'rituals.plans.deleted.v1';
const snapshotKey = (userId: string) => `rituals.snapshot.${userId}`;
const activeKey = (userId: string) => `rituals.active.${userId}`;
const outboxKey = (userId: string) => `rituals.outbox.${userId}`;

const initial: RitualsState = {
  userId: null,
  status: 'idle',
  error: null,
  templates: [],
  journal: [],
  links: [],
  altars: [],
  active: null,
  plans: [],
  deviceCount: 0,
  fetchedAt: null,
};

let state: RitualsState = initial;
let boundScope: string | undefined;
let plansLoaded = false;
let lastFinished: RitualSession | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<RitualsState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export function subscribeRituals(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRituals(): RitualsState {
  return state;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown) {
  try {
    if (value === null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable: the in-memory copy still works this session.
  }
}

const emptyDevice = (): DeviceRituals => ({ version: 1, activeSessionId: null, sessions: [], journals: [] });

async function readDevice(): Promise<DeviceRituals> {
  const stored = await readJson<Partial<DeviceRituals>>(DEVICE_KEY, {});
  return {
    version: 1,
    activeSessionId: stored.activeSessionId ?? null,
    sessions: Array.isArray(stored.sessions) ? stored.sessions : [],
    journals: Array.isArray(stored.journals) ? stored.journals : [],
  };
}

function deviceActive(device: DeviceRituals): RitualSession | null {
  return device.sessions.find((s) => s.id === device.activeSessionId && (s.status === 'active' || s.status === 'paused')) ?? null;
}

function throwIf(result: { error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
}

// ---------------------------------------------------------------- loading

async function bind(userId: string | null) {
  const scope = userId ?? 'device';
  if (boundScope === scope) return;
  boundScope = scope;

  if (!plansLoaded) {
    plansLoaded = true;
    const plans = await readJson<RitualPlan[]>(PLANS_KEY, []);
    set({ plans: Array.isArray(plans) ? plans : [] });
  }

  const device = await readDevice();
  if (boundScope !== scope) return;

  if (!userId) {
    set({
      ...initial,
      plans: state.plans,
      status: 'ready',
      journal: device.journals,
      active: deviceActive(device),
    });
    return;
  }

  const [cached, active] = await Promise.all([
    readJson<Snapshot | null>(snapshotKey(userId), null),
    readJson<RitualSession | null>(activeKey(userId), null),
  ]);
  if (boundScope !== scope) return;
  set({
    ...initial,
    plans: state.plans,
    userId,
    status: 'loading',
    ...(cached ?? {}),
    active,
    deviceCount: device.sessions.filter((s) => s.status === 'completed' || s.status === 'abandoned').length + device.journals.length,
  });
  await refresh();
}

async function fetchSnapshot(): Promise<{ snapshot: Snapshot; remoteActive: RitualSession | null }> {
  // Row-level security limits every query to the signed-in person's rows.
  const [templates, journal, links, altars, open] = await Promise.all([
    supabase
      .from('ritual_templates')
      .select('*, ritual_template_steps(*)')
      .neq('status', 'archived')
      .order('updated_at', { ascending: false }),
    supabase.from('user_rituals').select('*').order('created_at', { ascending: false }),
    supabase.from('ritual_links').select('*'),
    supabase.from('saved_altars').select('id,name').order('updated_at', { ascending: false }),
    supabase.from('ritual_sessions').select('*').in('status', ['active', 'paused']).order('updated_at', { ascending: false }).limit(1),
  ]);
  [templates, journal, links, altars, open].forEach(throwIf);

  let remoteActive: RitualSession | null = null;
  const openRow = (open.data?.[0] ?? null) as SessionRow | null;
  if (openRow) {
    const steps = await supabase.from('ritual_session_steps').select('*').eq('session_id', openRow.id).order('sort_order');
    throwIf(steps);
    remoteActive = sessionFromRows(openRow, (steps.data ?? []) as SessionStepRow[]);
  }

  return {
    remoteActive,
    snapshot: {
      fetchedAt: new Date().toISOString(),
      templates: ((templates.data ?? []) as TemplateRow[]).map((t) => ({
        ...t,
        ritual_template_steps: [...(t.ritual_template_steps ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      })),
      journal: (journal.data ?? []) as JournalRow[],
      links: (links.data ?? []) as RitualLinkRow[],
      altars: (altars.data ?? []) as AltarSummary[],
    },
  };
}

export async function refresh() {
  const userId = state.userId;
  if (!userId) {
    const device = await readDevice();
    set({ journal: device.journals, active: deviceActive(device), status: 'ready' });
    return;
  }
  set({ status: 'loading', error: null });
  try {
    await flushOutbox(userId);
    const { snapshot, remoteActive } = await fetchSnapshot();
    if (state.userId !== userId) return;
    // A ritual running on this phone wins; otherwise pick up one begun on the website.
    const active = state.active ?? remoteActive;
    set({ ...snapshot, active, status: 'ready' });
    await writeJson(snapshotKey(userId), snapshot);
    if (active && !state.active) await writeJson(activeKey(userId), active);
    await syncPlans(userId);
  } catch (e) {
    if (state.userId !== userId) return;
    set({ error: e instanceof Error ? e.message : String(e), status: 'offline' });
  }
}

// ---------------------------------------------------------------- sessions

async function pushSession(session: RitualSession, userId: string) {
  throwIf(await supabase.from('ritual_sessions').upsert(sessionRow(session, userId)));
  const steps = sessionStepRows(session, userId);
  if (steps.length) throwIf(await supabase.from('ritual_session_steps').upsert(steps));
}

/** Sessions that couldn't reach Supabase wait here and are sent on the next refresh. */
async function flushOutbox(userId: string) {
  const outbox = await readJson<RitualSession[]>(outboxKey(userId), []);
  if (!outbox.length) return;
  const left: RitualSession[] = [];
  for (const session of outbox) {
    try {
      await pushSession(session, userId);
    } catch {
      left.push(session);
    }
  }
  await writeJson(outboxKey(userId), left.length ? left : null);
}

async function queue(session: RitualSession, userId: string) {
  const outbox = await readJson<RitualSession[]>(outboxKey(userId), []);
  await writeJson(outboxKey(userId), [...outbox.filter((s) => s.id !== session.id), session]);
}

async function storeActive(session: RitualSession | null) {
  const userId = state.userId;
  if (userId) {
    await writeJson(activeKey(userId), session && (session.status === 'active' || session.status === 'paused') ? session : null);
    return;
  }
  const device = await readDevice();
  if (session) {
    const others = device.sessions.filter((s) => s.id !== session.id);
    device.sessions = [...others, session];
    device.activeSessionId = session.status === 'active' || session.status === 'paused' ? session.id : null;
  }
  await writeJson(DEVICE_KEY, device);
}

/** Save the running session locally, then send it to the account in the background. */
async function persist(session: RitualSession, mustSync = false) {
  set({ active: session.status === 'active' || session.status === 'paused' ? session : null });
  await storeActive(session);
  const userId = state.userId;
  if (!userId) return;
  const send = pushSession(session, userId).catch(() => queue(session, userId));
  if (mustSync) await send;
}

export async function startRitual(source: StartSource): Promise<RitualSession> {
  if (state.active) throw new Error('A ritual is already under way. Finish it before beginning another.');
  const session = createSession(source, { userId: state.userId, now: new Date() });
  await persist(session);
  return session;
}

export async function updateActive(change: (session: RitualSession) => RitualSession) {
  if (!state.active) return;
  const next = change(state.active);
  if (next !== state.active) await persist(next);
}

export async function finishActive(status: 'completed' | 'abandoned'): Promise<RitualSession | null> {
  if (!state.active) return null;
  const finished = finishSession(state.active, status, new Date());
  lastFinished = finished;
  await persist(finished, true);
  return finished;
}

/** A finished session by id, from this device (for journaling right after a ritual). */
export async function findSession(id: string): Promise<RitualSession | null> {
  if (state.active?.id === id) return state.active;
  if (lastFinished?.id === id) return lastFinished;
  const device = await readDevice();
  const local = device.sessions.find((s) => s.id === id);
  if (local) return local;
  const userId = state.userId;
  if (!userId) return null;
  const outbox = await readJson<RitualSession[]>(outboxKey(userId), []);
  const queued = outbox.find((s) => s.id === id);
  if (queued) return queued;
  const [row, steps] = await Promise.all([
    supabase.from('ritual_sessions').select('*').eq('id', id).maybeSingle(),
    supabase.from('ritual_session_steps').select('*').eq('session_id', id).order('sort_order'),
  ]);
  if (row.error || !row.data) return null;
  return sessionFromRows(row.data as SessionRow, (steps.data ?? []) as SessionStepRow[]);
}

// ---------------------------------------------------------------- journal

function buildEntry(session: RitualSession | null, answers: JournalAnswers, userId: string | null, existing: JournalRow | null, now: Date) {
  // Editing a saved entry keeps what the ritual recorded; only the answers change.
  if (!session && existing) return applyAnswers(existing, answers, now);
  return journalPayload({ session, answers, userId, id: existing?.id ?? uuid(), existing, now });
}

/**
 * Save a journal entry, as the website's ritual journal does: one user_rituals
 * row per session (updated if it exists), its links, and its Living Library entry.
 */
export async function saveJournal(input: {
  session: RitualSession | null;
  answers: JournalAnswers;
  existingId?: string | null;
}): Promise<JournalRow> {
  const now = new Date();
  const userId = state.userId;
  const ingredients = (input.session?.metadata?.ingredients as Ingredient[] | undefined) ?? [];

  if (!userId) {
    const device = await readDevice();
    const existing =
      device.journals.find((j) => j.id === input.existingId) ??
      (input.session ? device.journals.find((j) => j.session_id === input.session?.id) : undefined) ??
      null;
    const entry = buildEntry(input.session, input.answers, null, existing, now);
    device.journals = [entry, ...device.journals.filter((j) => j.id !== entry.id)];
    await writeJson(DEVICE_KEY, device);
    set({ journal: device.journals });
    return entry;
  }

  let existing: JournalRow | null = state.journal.find((j) => j.id === input.existingId) ?? null;
  if (!existing && input.session) {
    const found = await supabase.from('user_rituals').select('*').eq('session_id', input.session.id).limit(1).maybeSingle();
    throwIf(found);
    existing = (found.data as JournalRow | null) ?? null;
  }
  const entry = buildEntry(input.session, input.answers, userId, existing, now);
  const saved = await supabase.from('user_rituals').upsert(journalRow(entry, userId)).select('*').single();
  throwIf(saved);
  const row = saved.data as JournalRow;

  const links = uniqueLinks(journalLinks(row, userId, ingredients), state.links.filter((l) => l.ritual_id === row.id));
  if (links.length) {
    const inserted = await supabase.from('ritual_links').insert(links).select('*');
    if (!inserted.error) set({ links: [...state.links, ...((inserted.data ?? []) as RitualLinkRow[])] });
  }
  // The website's "My Practice" lists rituals through the Living Library.
  await supabase.from('living_library_entries').upsert(journalLibraryEntry(row, userId, now), { onConflict: 'user_id,entity_id' });

  set({ journal: [row, ...state.journal.filter((j) => j.id !== row.id)] });
  void writeJson(snapshotKey(userId), snapshotOf());
  return row;
}

export async function deleteJournal(id: string) {
  const userId = state.userId;
  if (!userId) {
    const device = await readDevice();
    device.journals = device.journals.filter((j) => j.id !== id);
    await writeJson(DEVICE_KEY, device);
    set({ journal: device.journals });
    return;
  }
  throwIf(await supabase.from('user_rituals').delete().eq('id', id));
  set({ journal: state.journal.filter((j) => j.id !== id), links: state.links.filter((l) => l.ritual_id !== id) });
  void writeJson(snapshotKey(userId), snapshotOf());
}

// ---------------------------------------------------------------- templates

async function ensureTemplatePage(userId: string, template: TemplateRow): Promise<string> {
  const metadata = templatePageMetadata(template);
  if (template.grimoire_page_id) {
    const updated = await supabase
      .from('grimoire_pages')
      .update({ title: template.title, page_type: 'ritual_template', icon: '🌙', metadata })
      .eq('id', template.grimoire_page_id)
      .select('id');
    throwIf(updated);
    if (updated.data?.length) return template.grimoire_page_id;
  }

  // Same place the website's template editor files templates: the first book's
  // "Ritual Templates" section, creating either if needed.
  let book = await supabase.from('grimoire_books').select('id').order('created_at', { ascending: true }).limit(1).maybeSingle();
  throwIf(book);
  if (!book.data) {
    book = await supabase.from('grimoire_books').insert({ user_id: userId, title: 'Book of Shadows' }).select('id').single();
    throwIf(book);
  }
  const bookId = (book.data as { id: string }).id;
  let section = await supabase
    .from('grimoire_sections')
    .select('id')
    .eq('book_id', bookId)
    .eq('title', 'Ritual Templates')
    .limit(1)
    .maybeSingle();
  throwIf(section);
  if (!section.data) {
    section = await supabase
      .from('grimoire_sections')
      .insert({ user_id: userId, book_id: bookId, title: 'Ritual Templates', sort_order: 0 })
      .select('id')
      .single();
    throwIf(section);
  }
  const page = await supabase
    .from('grimoire_pages')
    .insert({
      user_id: userId,
      book_id: bookId,
      section_id: (section.data as { id: string }).id,
      title: template.title,
      icon: '🌙',
      page_type: 'ritual_template',
      metadata,
    })
    .select('id')
    .single();
  throwIf(page);
  return (page.data as { id: string }).id;
}

/** Save a template the way the website's template editor does. Needs an account. */
export async function saveTemplate(draft: TemplateDraft): Promise<TemplateRow> {
  const userId = state.userId;
  if (!userId) throw new Error('Sign in to keep ritual templates.');
  const now = new Date();
  const id = draft.id ?? uuid();
  const { template, steps } = templatePayload(draft, { userId, id, stepIds: draft.steps.map(() => uuid()) });

  const saved = await supabase.from('ritual_templates').upsert(template).select('*').single();
  throwIf(saved);
  const row = saved.data as TemplateRow;

  const pageId = await ensureTemplatePage(userId, row);
  if (pageId !== row.grimoire_page_id) {
    throwIf(await supabase.from('ritual_templates').update({ grimoire_page_id: pageId }).eq('id', row.id));
    row.grimoire_page_id = pageId;
  }

  // Steps are replaced as a whole, as on the website.
  throwIf(await supabase.from('ritual_template_steps').delete().eq('template_id', row.id));
  if (steps.length) throwIf(await supabase.from('ritual_template_steps').insert(steps));

  const existingLinks = state.links.filter((l) => l.template_id === row.id);
  const links = uniqueLinks(templateLinks(row.id, userId, draft.ingredients), existingLinks);
  if (links.length) await supabase.from('ritual_links').insert(links);

  await supabase
    .from('living_library_entries')
    .upsert(templateLibraryEntry(row, userId, now), { onConflict: 'user_id,entity_id' });

  const full: TemplateRow = { ...row, ritual_template_steps: steps };
  set({ templates: [full, ...state.templates.filter((t) => t.id !== row.id)] });
  void writeJson(snapshotKey(userId), snapshotOf());
  return full;
}

export async function archiveTemplate(id: string) {
  const userId = state.userId;
  if (!userId) return;
  throwIf(await supabase.from('ritual_templates').update({ status: 'archived' }).eq('id', id));
  set({ templates: state.templates.filter((t) => t.id !== id) });
  void writeJson(snapshotKey(userId), snapshotOf());
}

// ---------------------------------------------------------------- plans

async function writePlans(plans: RitualPlan[]) {
  set({ plans });
  await writeJson(PLANS_KEY, plans);
}

/**
 * Bring this account's plans and this phone's together: send removals and plans
 * not saved yet, then show what the account holds. Failing quietly is fine here;
 * the plans stay on the phone and the next refresh tries again.
 */
async function syncPlans(userId: string) {
  try {
    const deletes = await readJson<string[]>(PLAN_DELETES_KEY, []);
    if (deletes.length) {
      throwIf(await supabase.from('ritual_plans').delete().in('id', deletes));
      await writeJson(PLAN_DELETES_KEY, null);
    }
    const pending = unsyncedPlans(state.plans);
    if (pending.length) throwIf(await supabase.from('ritual_plans').upsert(pending.map((plan) => planRow(plan, userId))));
    const remote = await supabase.from('ritual_plans').select('*');
    throwIf(remote);
    if (state.userId !== userId) return;
    await writePlans(mergePlans(state.plans.map((plan) => (pending.includes(plan) ? { ...plan, syncedTo: userId } : plan)), (remote.data ?? []) as PlanRow[], userId));
  } catch {
    // Offline or refused: keep the phone's plans as they are.
  }
}

export async function savePlan(plan: RitualPlan) {
  const userId = state.userId;
  let saved: RitualPlan = { ...plan, syncedTo: null };
  if (userId && isSyncable(plan)) {
    try {
      throwIf(await supabase.from('ritual_plans').upsert(planRow(plan, userId)));
      saved = { ...plan, syncedTo: userId };
    } catch {
      // Kept on the phone unsynced; the next refresh sends it.
    }
  }
  await writePlans([...state.plans.filter((p) => p.id !== plan.id), saved]);
}

export async function removePlan(id: string) {
  const plan = state.plans.find((p) => p.id === id);
  await writePlans(state.plans.filter((p) => p.id !== id));
  if (!plan?.syncedTo || !state.userId) return;
  try {
    throwIf(await supabase.from('ritual_plans').delete().eq('id', id));
  } catch {
    const deletes = await readJson<string[]>(PLAN_DELETES_KEY, []);
    await writeJson(PLAN_DELETES_KEY, [...new Set([...deletes, id])]);
  }
}

/** Plans are device-wide, so reminders keep working signed in or out. */
export async function loadPlans(): Promise<RitualPlan[]> {
  if (!plansLoaded) {
    plansLoaded = true;
    const plans = await readJson<RitualPlan[]>(PLANS_KEY, []);
    set({ plans: Array.isArray(plans) ? plans : [] });
  }
  return state.plans;
}

// ---------------------------------------------------------------- guest to account

/**
 * Bring rituals kept on this device as a guest into the signed-in account,
 * like the website's guest-account migration: sessions and steps first, then
 * the journal entries that point at them.
 */
export async function bringDeviceRitualsToAccount(): Promise<number> {
  const userId = state.userId;
  if (!userId) return 0;
  const device = await readDevice();
  let moved = 0;
  const sent = new Set<string>();
  for (const session of device.sessions) {
    if (session.status === 'active' || session.status === 'paused') continue;
    await pushSession({ ...session, user_id: userId }, userId);
    sent.add(session.id);
    moved += 1;
  }
  for (const journal of device.journals) {
    const row = journalRow({ ...journal, session_id: journal.session_id && sent.has(journal.session_id) ? journal.session_id : null }, userId);
    throwIf(await supabase.from('user_rituals').upsert(row));
    moved += 1;
  }
  const running = deviceActive(device);
  await writeJson(DEVICE_KEY, running ? { ...emptyDevice(), activeSessionId: running.id, sessions: [running] } : null);
  set({ deviceCount: 0 });
  await refresh();
  return moved;
}

function snapshotOf(): Snapshot {
  return { templates: state.templates, journal: state.journal, links: state.links, altars: state.altars, fetchedAt: state.fetchedAt };
}

// ---------------------------------------------------------------- hook

/** The rituals store for whoever is signed in (or this device, for guests). */
export function useRituals(): RitualsState {
  const { session, ready } = useSession();
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (ready) void bind(userId);
  }, [ready, userId]);
  const snapshot = useSyncExternalStore(subscribeRituals, getRituals, getRituals);
  // Until the store has caught up with a new sign-in, don't show the old person's rituals.
  return useMemo(() => (snapshot.userId === userId ? snapshot : { ...initial, plans: snapshot.plans }), [snapshot, userId]);
}
