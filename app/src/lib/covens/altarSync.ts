// A coven altar, shared live. The altar editor works on one AltarDocument as it
// does for your own altars; this keeps that document in step with the coven's
// copy, where the altar's scene is one coven_altars row and every object on it
// is its own coven_altar_objects row (keyed by its altarObjectId), so two
// people tending two things never overwrite each other.
//
// Every change you make is sent to the others at once over the altar's live
// channel (so a candle being dragged moves on their screens as it moves on
// yours) and written to the database a moment later. What others do arrives
// the same way and is folded into your document object by object. Who may
// change the altar is the database's call (coven_altar_can_edit); the editor
// asks coven_altar_access so it can say why not.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { AltarDocument } from '../altar/snapshot';
import type { SavedObject } from '../altar/types';
import { supabase } from '../supabase';
import { diff, documentFromRows, keyed, keyOf, sceneFromAltar, sceneOf, sortAltars, withObject, withScene, type AltarAccess, type AltarEditor, type Change, type CovenAltar, type Scene } from './altarDoc';
import type { CovenAltarsInput } from './altarsAcross';
import * as api from './api';
import { permissions, standing, unsignedAgreements, type CovenDocument, type Signature } from './model';

export * from './altarDoc';

type ObjectRow = { altar_id: string; object_key: string; coven_id: string; position: number; data: SavedObject; updated_by: string | null };

/** A transform the editor applies to its document without counting it as your edit. */
export type RemoteTransform = (doc: AltarDocument) => AltarDocument;

/** What the altar editor needs to tend a shared altar (components/altar/AltarEditor.tsx). */
export type SharedAltar = {
  /** The coven altar's id: the editor treats it as the altar it has open. */
  key: string;
  name: string;
  /** The coven's name, shown with the altar's on the home screen widget. */
  covenName?: string;
  /** The altar as it stood when it loaded; null while loading. */
  initial: AltarDocument | null;
  missing: boolean;
  canEdit: boolean;
  /** Why you can't change it, when you can't. */
  reason: string;
  /** A short line for the editor's header: who's here, or that changes are on their way. */
  status: string;
  /** The editor hands over its apply function; returns a function that lets go of it. */
  attach: (apply: (transform: RemoteTransform) => void) => () => void;
  /** The editor's document after every change you make. */
  push: (doc: AltarDocument) => void;
};

export type Presence = { user_id: string; name: string };

export const ALTAR_FIELDS = 'id,coven_id,name,is_main,edit_mode,locked,background,background_name,groups,active_group_id,extra,archived_at,created_by,updated_by,created_at,updated_at';

/** The coven's altars, the main ritual altar first, then the newest. */
export async function fetchCovenAltars(covenId: string): Promise<CovenAltar[]> {
  const { data, error } = await supabase.from('coven_altars').select(ALTAR_FIELDS).eq('coven_id', covenId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return sortAltars((data ?? []) as CovenAltar[]);
}

/** How many things are on each altar. */
export async function fetchAltarCounts(covenId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('coven_altar_objects').select('altar_id').eq('coven_id', covenId).limit(10000);
  if (error) throw new Error(error.message);
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { altar_id: string }[]) counts[row.altar_id] = (counts[row.altar_id] ?? 0) + 1;
  return counts;
}

/**
 * Every coven altar you can see, for the Altar tab's Coven half: for each
 * coven you belong to (and that is open), its altars, the things on each, and
 * whether you may start altars there or keep them all (the coven's own Altars
 * page works these out the same way, through CovenContext). The database still
 * decides every change. Grouped and ordered by altarsAcross.ts.
 */
export async function fetchAltarsAcrossCovens(userId: string): Promise<CovenAltarsInput[]> {
  const standings = (await api.fetchMyStandings(userId)).filter((s) => s.coven.status === 'active');
  if (!standings.length) return [];
  const ids = standings.map((s) => s.coven.id);
  const [me, documents, signatures] = await Promise.all([
    api.fetchMe(userId).catch(() => null),
    supabase
      .from('coven_documents')
      .select('*')
      .in('coven_id', ids)
      .then(({ data }) => (data ?? []) as CovenDocument[], () => [] as CovenDocument[]),
    supabase
      .from('coven_signatures')
      .select('document_id,version,user_id')
      .eq('user_id', userId)
      .in('coven_id', ids)
      .then(({ data }) => (data ?? []) as Signature[], () => [] as Signature[]),
  ]);
  return Promise.all(
    standings.map(async ({ coven, membership, ranks }) => {
      const [altars, counts] = await Promise.all([fetchCovenAltars(coven.id), fetchAltarCounts(coven.id).catch(() => ({}) as Record<string, number>)]);
      const perms = permissions({ coven, membership, ranks, userId, siteModerator: me?.siteModerator });
      const unsigned = unsignedAgreements(documents.filter((d) => d.coven_id === coven.id), signatures, userId);
      return {
        coven: { id: coven.id, slug: coven.slug, name: coven.name },
        altars,
        counts,
        canStart: perms.startAltars && standing(perms, unsigned, !!me?.banned).ok,
        keeps: perms.founder || perms.manage || perms.keepAltars || perms.site,
      };
    }),
  );
}

export async function fetchAltarEditors(altarId: string): Promise<AltarEditor[]> {
  const { data, error } = await supabase.from('coven_altar_editors').select('id,altar_id,coven_id,user_id,rank_id,active').eq('altar_id', altarId);
  if (error) throw new Error(error.message);
  return (data ?? []) as AltarEditor[];
}

async function call<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export const createAltar = (covenId: string, name: string, editMode: CovenAltar['edit_mode']) =>
  call<CovenAltar>('create_coven_altar', { p_coven: covenId, p_name: name, p_edit_mode: editMode });
export const setAltar = (altarId: string, name: string, editMode: CovenAltar['edit_mode'], locked: boolean) =>
  call<CovenAltar>('set_coven_altar', { p_altar: altarId, p_name: name, p_edit_mode: editMode, p_locked: locked });
export const setAltarEditor = (altarId: string, who: { userId?: string | null; rankId?: string | null }, enabled: boolean) =>
  call<boolean>('set_coven_altar_editor', { p_altar: altarId, p_user: who.userId ?? null, p_rank: who.rankId ?? null, p_enabled: enabled });
export const archiveAltar = (altarId: string, archived: boolean) => call<boolean>('archive_coven_altar', { p_altar: altarId, p_archived: archived });
/** Delete an altar for good, with everything on it (its keepers only; rituals held there go back to the main altar). */
export const deleteAltar = (altarId: string) => call<boolean>('delete_coven_altar', { p_altar: altarId });
export const altarAccess = (altarId: string) => call<AltarAccess>('coven_altar_access', { p_altar: altarId });
export const setRitualAltar = (ritualId: string, altarId: string | null, access: ('assigned' | 'everyone' | 'leader' | 'chosen')[] | null) =>
  call('set_coven_ritual_altar', { p_ritual: ritualId, p_altar: altarId, p_access: access });

// ─── The document, as rows ──────────────────────────────────────────────

// ─── One-off changes (a ritual step's candle) ───────────────────────────

/** Load an altar, change it, and save what changed (for actions taken away from the altar screen). */
export async function changeAltarOnce(altarId: string, change: (doc: AltarDocument) => AltarDocument): Promise<void> {
  const [{ data: altar, error: altarError }, { data: rows, error: rowError }] = await Promise.all([
    supabase.from('coven_altars').select(ALTAR_FIELDS).eq('id', altarId).single(),
    supabase.from('coven_altar_objects').select('object_key,position,data').eq('altar_id', altarId),
  ]);
  if (altarError || rowError || !altar) throw new Error((altarError ?? rowError)?.message ?? 'That altar was not found.');
  const doc = documentFromRows(altar as CovenAltar, (rows ?? []) as ObjectRow[]);
  const saved = new Map(doc.objects.map((o) => [keyOf(o), JSON.stringify(o)]));
  const positions = new Map(((rows ?? []) as ObjectRow[]).map((r) => [r.object_key, r.position]));
  const next = keyed(change(doc));
  await write(altar as CovenAltar, diff(next, saved, JSON.stringify(sceneOf(doc))), positions, next);
}

async function write(altar: CovenAltar, changes: Change[], positions: Map<string, number>, doc: AltarDocument) {
  let top = Math.max(0, ...positions.values());
  for (const change of changes) {
    if (change.kind === 'scene') {
      const { error } = await supabase
        .from('coven_altars')
        .update({ background: change.scene.background, background_name: change.scene.backgroundName, groups: change.scene.groups, active_group_id: change.scene.activeGroupId, extra: change.scene.extra })
        .eq('id', altar.id);
      if (error) throw Object.assign(new Error(error.message), { code: error.code });
    } else if (change.data == null) {
      const { error } = await supabase.from('coven_altar_objects').delete().eq('altar_id', altar.id).eq('object_key', change.key);
      if (error) throw Object.assign(new Error(error.message), { code: error.code });
      positions.delete(change.key);
    } else {
      let position = positions.get(change.key);
      if (position == null) {
        // New things go on top of what's there, in the order they sit in the document.
        const index = doc.objects.findIndex((o) => keyOf(o) === change.key);
        position = Math.max(top + 1, index);
        top = position;
        positions.set(change.key, position);
      }
      const { error } = await supabase
        .from('coven_altar_objects')
        .upsert({ altar_id: altar.id, object_key: change.key, coven_id: altar.coven_id, position, data: change.data }, { onConflict: 'altar_id,object_key' });
      if (error) throw Object.assign(new Error(error.message), { code: error.code });
    }
  }
}

// ─── The live hook ──────────────────────────────────────────────────────

const BROADCAST_MS = 60;
const WRITE_MS = 400;

type Wire = { from: string; key?: string; data?: SavedObject | null; scene?: Scene };

/**
 * One coven altar, open and live. `me` names you to the others. Returns what
 * the editor needs, plus the altar row, who's here, and a reload.
 */
export function useCovenAltar(altarId: string, me: { userId: string; name: string } | null, covenName?: string) {
  const [altar, setAltar] = useState<CovenAltar | null>(null);
  const [initial, setInitial] = useState<AltarDocument | null>(null);
  const [missing, setMissing] = useState(false);
  const [access, setAccess] = useState<AltarAccess | null>(null);
  const [here, setHere] = useState<Presence[]>([]);
  const [problem, setProblem] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // What the database is known to hold, object by object (JSON) and the scene.
  const saved = useRef(new Map<string, string>());
  const savedScene = useRef('');
  const positions = useRef(new Map<string, number>());
  // Your changes not yet written, and not yet sent to the others.
  const unwritten = useRef(new Map<string, Change>());
  const unsent = useRef(new Map<string, Change>());
  const applyRef = useRef<((transform: RemoteTransform) => void) | null>(null);
  const latest = useRef<AltarDocument | null>(null);
  const altarRef = useRef<CovenAltar | null>(null);
  const accessRef = useRef<AltarAccess | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timers = useRef<{ send: ReturnType<typeof setTimeout> | null; write: ReturnType<typeof setTimeout> | null }>({ send: null, write: null });
  const userId = me?.userId ?? '';
  useEffect(() => {
    altarRef.current = altar;
    accessRef.current = access;
  }, [altar, access]);
  const flushWriteRef = useRef<() => Promise<void>>(async () => {});

  const checkAccess = useCallback(async () => {
    try {
      const next = await altarAccess(altarId);
      setAccess(next);
    } catch {
      // Keep what we had; the database still decides each change.
    }
  }, [altarId]);

  /** Read the altar again and lay it over what's open (after a refusal, or coming back online). */
  const load = useCallback(
    async (replace: boolean) => {
      const [{ data: row, error: altarError }, { data: rows, error: rowError }] = await Promise.all([
        supabase.from('coven_altars').select(ALTAR_FIELDS).eq('id', altarId).maybeSingle(),
        supabase.from('coven_altar_objects').select('altar_id,object_key,coven_id,position,data,updated_by').eq('altar_id', altarId),
      ]);
      if (altarError || rowError) {
        setProblem('The altar couldn’t be loaded. Check your connection and try again.');
        return;
      }
      if (!row) {
        setMissing(true);
        return;
      }
      const loadedAltar = row as CovenAltar;
      const doc = documentFromRows(loadedAltar, (rows ?? []) as ObjectRow[]);
      saved.current = new Map(doc.objects.map((o) => [keyOf(o), JSON.stringify(o)]));
      savedScene.current = JSON.stringify(sceneOf(doc));
      positions.current = new Map(((rows ?? []) as ObjectRow[]).map((r) => [r.object_key, r.position]));
      setAltar(loadedAltar);
      setProblem(null);
      if (replace && applyRef.current) {
        unwritten.current.clear();
        unsent.current.clear();
        applyRef.current(() => doc);
      } else setInitial((current) => current ?? doc);
    },
    [altarId],
  );

  useEffect(() => {
    void load(false);
    void checkAccess();
  }, [load, checkAccess]);

  /** Something changed on someone else's screen, or in the database. */
  const receive = useCallback((key: string, data: SavedObject | null) => {
    // Your own change that hasn't gone yet wins; it's on its way.
    if (unwritten.current.has(key)) return;
    if (data == null) saved.current.delete(key);
    else saved.current.set(key, JSON.stringify({ ...data, altarObjectId: key }));
    applyRef.current?.((doc) => withObject(doc, key, data));
  }, []);
  const receiveScene = useCallback((scene: Scene) => {
    if (unwritten.current.has('scene')) return;
    savedScene.current = JSON.stringify(scene);
    applyRef.current?.((doc) => withScene(doc, scene));
  }, []);

  // The altar's live channel: changes in the database, changes as they're
  // made (broadcast), who's here, and anything that changes who may tend it.
  useEffect(() => {
    if (!altarId || !userId || !altar?.coven_id) return;
    const covenId = altar.coven_id;
    const channel = supabase.channel(`coven-altar:${altarId}`, { config: { presence: { key: userId }, broadcast: { self: false } } });
    channelRef.current = channel;
    channel.on('postgres_changes' as never, { event: '*', schema: 'public', table: 'coven_altar_objects', filter: `altar_id=eq.${altarId}` } as never, (payload: { eventType: string; new: ObjectRow; old: Partial<ObjectRow> }) => {
      if (payload.eventType === 'DELETE') return;
      positions.current.set(payload.new.object_key, payload.new.position);
      if (payload.new.updated_by === userId) return;
      receive(payload.new.object_key, payload.new.data);
    });
    // Deletes can't be filtered; ones for other altars are ignored.
    channel.on('postgres_changes' as never, { event: 'DELETE', schema: 'public', table: 'coven_altar_objects' } as never, (payload: { old: Partial<ObjectRow> }) => {
      if (payload.old.altar_id !== altarId || !payload.old.object_key) return;
      positions.current.delete(payload.old.object_key);
      receive(payload.old.object_key, null);
    });
    channel.on('postgres_changes' as never, { event: 'UPDATE', schema: 'public', table: 'coven_altars', filter: `id=eq.${altarId}` } as never, (payload: { new: CovenAltar }) => {
      setAltar(payload.new);
      void checkAccess();
      if (payload.new.updated_by !== userId) receiveScene(sceneFromAltar(payload.new));
    });
    // Deleted by its keeper while you're here (deletes can't be filtered either).
    channel.on('postgres_changes' as never, { event: 'DELETE', schema: 'public', table: 'coven_altars' } as never, (payload: { old: Partial<CovenAltar> }) => {
      if (payload.old.id === altarId) setMissing(true);
    });
    for (const table of ['coven_rituals', 'coven_ritual_steps', 'coven_altar_editors', 'coven_members']) {
      channel.on('postgres_changes' as never, { event: '*', schema: 'public', table, filter: `coven_id=eq.${covenId}` } as never, () => void checkAccess());
    }
    channel.on('broadcast', { event: 'change' }, ({ payload }: { payload: Wire }) => {
      if (!payload || payload.from === userId) return;
      if (payload.scene) receiveScene(payload.scene);
      else if (payload.key) receive(payload.key, payload.data ?? null);
    });
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as Record<string, Presence[]>;
      setHere(Object.values(state).map((list) => list[0]).filter(Boolean));
    });
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') void channel.track({ user_id: userId, name: me?.name ?? 'A member' });
      // Coming back after a dropped connection: catch up with what happened meanwhile.
      if (status === 'SUBSCRIBED' && latest.current) void load(true);
    });
    return () => {
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one channel per altar; the name only labels you
  }, [altarId, userId, altar?.coven_id, receive, receiveScene, checkAccess, load]);

  const flushSend = useCallback(() => {
    timers.current.send = null;
    const channel = channelRef.current;
    const changes = [...unsent.current.values()];
    unsent.current.clear();
    if (!channel) return;
    for (const change of changes) {
      const payload: Wire = change.kind === 'scene' ? { from: userId, scene: change.scene } : { from: userId, key: change.key, data: change.data };
      void channel.send({ type: 'broadcast', event: 'change', payload });
    }
  }, [userId]);

  const flushWrite = useCallback(async () => {
    timers.current.write = null;
    const current = altarRef.current;
    if (!current || !unwritten.current.size) return;
    const changes = [...unwritten.current.values()];
    unwritten.current.clear();
    setSending(true);
    try {
      await write(current, changes, positions.current, latest.current ?? { ...sceneFromAltar(current), objects: [] });
      for (const change of changes) {
        if (change.kind === 'scene') savedScene.current = JSON.stringify(change.scene);
        else if (change.data == null) saved.current.delete(change.key);
        else saved.current.set(change.key, JSON.stringify(change.data));
      }
      setProblem(null);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === '42501' || code === 'P0001' || code === '23514') {
        // Refused (the ritual moved on, the keeper locked it, or it broke a rule): back to how it really is.
        setProblem(error instanceof Error ? error.message : 'That change wasn’t accepted.');
        void checkAccess();
        void load(true);
      } else {
        // Offline or a hiccup: keep them and try again shortly.
        for (const change of changes) {
          const key = change.kind === 'scene' ? 'scene' : change.key;
          if (!unwritten.current.has(key)) unwritten.current.set(key, change);
        }
        setProblem('Offline. Your changes will be saved when you’re back.');
        timers.current.write = setTimeout(() => void flushWriteRef.current(), 4000);
      }
    }
    setSending(false);
  }, [checkAccess, load]);
  useEffect(() => {
    flushWriteRef.current = flushWrite;
  }, [flushWrite]);

  const push = useCallback(
    (doc: AltarDocument) => {
      latest.current = doc;
      if (!accessRef.current?.can_edit) return;
      // Compare with what's saved, counting changes already on their way as saved.
      const known = new Map(saved.current);
      let knownScene = savedScene.current;
      for (const [key, change] of unwritten.current) {
        if (change.kind === 'scene') knownScene = JSON.stringify(change.scene);
        else if (change.data == null) known.delete(key);
        else known.set(key, JSON.stringify(change.data));
      }
      const changes = diff(keyed(doc), known, knownScene);
      if (!changes.length) return;
      for (const change of changes) {
        const key = change.kind === 'scene' ? 'scene' : change.key;
        unwritten.current.set(key, change);
        unsent.current.set(key, change);
      }
      if (!timers.current.send) timers.current.send = setTimeout(flushSend, BROADCAST_MS);
      if (timers.current.write) clearTimeout(timers.current.write);
      timers.current.write = setTimeout(() => void flushWrite(), WRITE_MS);
    },
    [flushSend, flushWrite],
  );

  // Leaving the altar sends anything still waiting.
  useEffect(
    () => () => {
      const t = timers.current;
      if (t.send) clearTimeout(t.send);
      if (t.write) clearTimeout(t.write);
      if (unwritten.current.size) void flushWrite();
    },
    [flushWrite],
  );

  const attach = useCallback((apply: (transform: RemoteTransform) => void) => {
    applyRef.current = apply;
    return () => {
      if (applyRef.current === apply) applyRef.current = null;
    };
  }, []);

  const others = here.filter((p) => p.user_id !== userId);
  // What the bar says: saving is automatic, so it shows whether your last
  // change has reached the coven (or what went wrong). Who's here is shown apart.
  const status = problem
    ? problem
    : sending
      ? 'Saving…'
      : access && !access.can_edit
        ? 'View only'
        : 'Saved ✓';

  const shared = useMemo<SharedAltar>(
    () => ({
      key: altarId,
      name: altar?.name ?? 'Coven altar',
      covenName,
      initial,
      missing,
      canEdit: !!access?.can_edit,
      reason: access?.reason ?? 'You can watch this altar here.',
      status,
      attach,
      push,
    }),
    [altarId, altar?.name, covenName, initial, missing, access, status, attach, push],
  );

  return { shared, altar, access, here, others, problem, reload: () => load(true), checkAccess };
}
