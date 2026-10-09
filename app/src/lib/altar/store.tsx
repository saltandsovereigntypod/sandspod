import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { isTransient, retryDelay, type SendError } from '../grimoire/edits';
import { useSession } from '../session';
import { supabase } from '../supabase';
// Registers the artwork sizes the geometry needs.
import './assets';
import {
  customBackgroundFromRow,
  customItemFromLocal,
  customItemFromRow,
  type CustomBackgroundRow,
  type CustomCabinetRow,
} from './cabinet';
import { applyOps, enqueue, parsePending, type AltarOp, type FailedAltarOp } from './outbox';
import {
  altarDataFromDocument,
  altarFromRow,
  draftFromDocument,
  LOCAL_ALTARS_KEY,
  LOCAL_CUSTOM_CABINET_KEY,
  localSave,
  parseLocalAltars,
  sortAltars,
  WORKING_DRAFT_KEY,
  type AltarDocument,
} from './snapshot';
import type { AltarBackground, CabinetItem, SavedAltar, SavedAltarRow } from './types';
import { newId } from './uid';

// Signed in: saved_altars, custom_cabinet_items, custom_altar_backgrounds and
// custom_cabinet_image_overrides from Supabase, with an offline copy on the
// device (the same pattern as the grimoire store). Saves and deletions are
// queued on the device and sent when there is a connection (outbox.ts).
// Guest: the same localStorage keys and shapes the website uses for guests.

type Status = 'idle' | 'loading' | 'ready' | 'offline' | 'error';
export type SyncState = 'idle' | 'saving' | 'offline' | 'error';

type AltarSnapshot = {
  fetchedAt: string;
  altars: SavedAltar[];
  customItems: CabinetItem[];
  backgrounds: AltarBackground[];
  overrides: Record<string, string>;
};

type SaveRequest = { id: string | null; name: string; doc: AltarDocument };
/** saved: in the account (or on the device, for guests); pending: kept on the
 *  device until there is a connection; failed: the account refused it. */
export type SaveResult = { id: string; outcome: 'saved' | 'pending' | 'failed' };

type AltarState = {
  signedIn: boolean;
  status: Status;
  error: string | null;
  altars: SavedAltar[];
  customItems: CabinetItem[];
  backgrounds: AltarBackground[];
  overrides: Record<string, string>;
  draft: SavedAltar | null;
  /** Signed in: whether queued saves and deletions have reached the account. */
  sync: SyncState;
  pendingCount: number;
  failed: FailedAltarOp[];
  retryFailed: () => void;
  discardFailed: () => void;
  refresh: () => Promise<void>;
  /** Save to an existing altar (id) or as a new one (id null). */
  save: (request: SaveRequest) => Promise<SaveResult>;
  remove: (id: string) => Promise<void>;
  saveDraft: (doc: AltarDocument, sourceId: string | null) => void;
  clearDraft: () => Promise<void>;
  draftSourceId: string | null;
};

const AltarContext = createContext<AltarState | null>(null);

const cacheKey = (userId: string) => `altar.snapshot.${userId}`;
const pendingKey = (userId: string) => `altar.pending.${userId}`;
/** App-only: which saved altar the working draft came from. */
const DRAFT_SOURCE_KEY = 'altar.app.draftSource';
/** How long Save waits for the account before reporting the altar as kept on the device. */
const SAVE_WAIT_MS = 8000;

const ALTAR_FIELDS = 'id,name,altar_data,created_at,updated_at';

function problem(result: { error: { code?: string; message?: string } | null; status?: number }): SendError | null {
  return result.error ? { status: result.status, code: result.error.code, message: result.error.message } : null;
}

/** Sends one queued operation. Returns null once it is in saved_altars. */
async function sendOp(op: AltarOp, userId: string): Promise<SendError | null> {
  const table = () => supabase.from('saved_altars');
  if (op.kind === 'delete') return problem(await table().delete().eq('id', op.id).eq('user_id', userId));

  const fields = { name: op.name, altar_data: op.data, updated_at: op.updatedAt };
  if (op.isNew) {
    const inserted = await table().insert({ id: op.id, user_id: userId, ...fields });
    // 23505: an earlier try got through, so write this version over it.
    if (inserted.error?.code !== '23505') return problem(inserted);
  }
  const updated = await table().update(fields).eq('id', op.id).eq('user_id', userId).select('id');
  if (updated.error) return problem(updated);
  if (updated.data?.length) return null;
  // Deleted elsewhere while this was waiting: put it back rather than lose the changes.
  const restored = await table().insert({ id: op.id, user_id: userId, ...fields });
  return restored.error?.code === '23505' ? null : problem(restored);
}

async function fetchSnapshot(): Promise<AltarSnapshot> {
  // Row-level security limits every query to the signed-in person's rows.
  const [altars, items, backgrounds, overrides] = await Promise.all([
    supabase.from('saved_altars').select(ALTAR_FIELDS).order('created_at', { ascending: false }),
    supabase
      .from('custom_cabinet_items')
      .select('id,category,name,keywords,entity_id,image_url,item_type,form_label,forms')
      .order('created_at', { ascending: false }),
    supabase.from('custom_altar_backgrounds').select('id,name,image_url').order('created_at', { ascending: false }),
    supabase.from('custom_cabinet_image_overrides').select('override_key,image_url'),
  ]);
  const failed = [altars, items, backgrounds, overrides].find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
  return {
    fetchedAt: new Date().toISOString(),
    altars: ((altars.data ?? []) as SavedAltarRow[]).map(altarFromRow),
    customItems: ((items.data ?? []) as CustomCabinetRow[]).map(customItemFromRow),
    backgrounds: ((backgrounds.data ?? []) as CustomBackgroundRow[]).map(customBackgroundFromRow),
    overrides: Object.fromEntries(
      ((overrides.data ?? []) as { override_key: string; image_url: string }[]).map((r) => [r.override_key, r.image_url]),
    ),
  };
}

async function readLocal(): Promise<AltarSnapshot> {
  const [altarsRaw, itemsRaw] = await Promise.all([
    AsyncStorage.getItem(LOCAL_ALTARS_KEY),
    AsyncStorage.getItem(LOCAL_CUSTOM_CABINET_KEY),
  ]);
  let items: CabinetItem[] = [];
  try {
    const parsed = itemsRaw ? JSON.parse(itemsRaw) : [];
    items = Array.isArray(parsed) ? parsed.map(customItemFromLocal).filter((i): i is CabinetItem => !!i) : [];
  } catch {
    items = [];
  }
  return { fetchedAt: new Date().toISOString(), altars: parseLocalAltars(altarsRaw), customItems: items, backgrounds: [], overrides: {} };
}

export function AltarProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [snapshot, setSnapshot] = useState<AltarSnapshot | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<SavedAltar | null>(null);
  const [draftSourceId, setDraftSourceId] = useState<string | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Signed in: saves and deletions not yet in saved_altars, oldest first, and
  // those the account refused. Both are kept on the device per account.
  const [sync, setSync] = useState<SyncState>('idle');
  const [queued, setQueued] = useState<AltarOp[]>([]);
  const [failed, setFailed] = useState<FailedAltarOp[]>([]);
  const userRef = useRef<string | null>(userId);
  const queueRef = useRef<AltarOp[]>([]);
  const failedRef = useRef<FailedAltarOp[]>([]);
  const flushRef = useRef<Promise<void> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attempts = useRef(0);
  /** flush, for the retry timer it schedules for itself. */
  const flushLater = useRef<() => Promise<void>>(() => Promise.resolve());

  const publish = useCallback(() => {
    setQueued(queueRef.current);
    setFailed(failedRef.current);
  }, []);

  const persist = useCallback(async (id: string) => {
    try {
      await AsyncStorage.setItem(pendingKey(id), JSON.stringify({ queue: queueRef.current, failed: failedRef.current }));
    } catch {
      // Storage full or unavailable: the queue still lives in memory.
    }
  }, []);

  /** Folds an operation that reached the account into the cached server copy. */
  const applySent = useCallback((id: string, op: AltarOp) => {
    setSnapshot((prev) => {
      const base = prev ?? { fetchedAt: '', altars: [], customItems: [], backgrounds: [], overrides: {} };
      const next = { ...base, altars: applyOps(base.altars, [op]) };
      AsyncStorage.setItem(cacheKey(id), JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const flush = useCallback((): Promise<void> => {
    if (flushRef.current) return flushRef.current;
    const id = userRef.current;
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryTimer.current = null;
    if (!id || !queueRef.current.length) {
      setSync(failedRef.current.length ? 'error' : 'idle');
      return Promise.resolve();
    }
    const run = (async () => {
      setSync('saving');
      let waiting = false;
      while (queueRef.current.length && userRef.current === id) {
        const op = queueRef.current[0];
        const trouble = await sendOp(op, id).catch((e): SendError => ({ message: e instanceof Error ? e.message : String(e) }));
        if (userRef.current !== id) return;
        if (trouble && isTransient(trouble)) {
          waiting = true;
          break;
        }
        queueRef.current = queueRef.current.slice(1);
        if (trouble) failedRef.current = [...failedRef.current, { op, message: trouble.message || 'Your account didn’t accept this change.' }];
        else {
          attempts.current = 0;
          applySent(id, op);
        }
        publish();
        await persist(id);
      }
      if (waiting) {
        attempts.current += 1;
        setSync('offline');
        retryTimer.current = setTimeout(() => void flushLater.current(), retryDelay(attempts.current));
      } else {
        setSync(failedRef.current.length ? 'error' : 'idle');
      }
    })().finally(() => {
      flushRef.current = null;
    });
    flushRef.current = run;
    return run;
  }, [applySent, persist, publish]);

  useEffect(() => {
    flushLater.current = flush;
  }, [flush]);

  /** Queues a save or deletion for the signed-in account and starts sending it. */
  const queueOp = useCallback(
    async (id: string, op: AltarOp) => {
      // A newer save or deletion replaces anything refused for the same altar.
      failedRef.current = failedRef.current.filter((f) => f.op.id !== op.id);
      queueRef.current = enqueue(queueRef.current, op, flushRef.current ? 1 : 0);
      publish();
      await persist(id);
      return flush();
    },
    [flush, persist, publish],
  );

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      if (!userId) {
        setSnapshot(await readLocal());
        setStatus('ready');
        return;
      }
      await flush();
      const fresh = await fetchSnapshot();
      setSnapshot(fresh);
      setStatus('ready');
      await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(fresh));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus('offline');
    }
  }, [userId, flush]);

  useEffect(() => {
    userRef.current = userId;
    setSnapshot(null);
    setStatus('idle');
    queueRef.current = [];
    failedRef.current = [];
    attempts.current = 0;
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryTimer.current = null;
    publish();
    setSync('idle');
    let active = true;
    const cached = userId ? AsyncStorage.getItem(cacheKey(userId)) : Promise.resolve(null);
    const pending = userId ? AsyncStorage.getItem(pendingKey(userId)) : Promise.resolve(null);
    Promise.all([cached, pending, AsyncStorage.getItem(WORKING_DRAFT_KEY), AsyncStorage.getItem(DRAFT_SOURCE_KEY)])
      .then(([cachedSnapshot, pendingRaw, draftRaw, source]) => {
        if (!active) return;
        if (cachedSnapshot) setSnapshot(JSON.parse(cachedSnapshot) as AltarSnapshot);
        const saved = parsePending(pendingRaw);
        queueRef.current = saved.queue;
        failedRef.current = saved.failed;
        publish();
        try {
          const parsed = draftRaw ? JSON.parse(draftRaw) : null;
          setDraft(parsed && Array.isArray(parsed.objects) ? (parsed as SavedAltar) : null);
        } catch {
          setDraft(null);
        }
        setDraftSourceId(source || null);
      })
      .catch(() => {})
      .finally(() => {
        if (active) refresh();
      });
    return () => {
      active = false;
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [userId, refresh, publish]);

  // Coming back to the app is a good moment to try the queue again.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && queueRef.current.length) void flush();
    });
    return () => sub.remove();
  }, [flush]);

  const writeLocalAltars = useCallback(async (altars: SavedAltar[]) => {
    await AsyncStorage.setItem(LOCAL_ALTARS_KEY, JSON.stringify(altars));
    setSnapshot((prev) => ({ ...(prev ?? { fetchedAt: '', customItems: [], backgrounds: [], overrides: {} }), altars }));
  }, []);

  // The altar list as this person sees it: the account's copy, with their
  // queued and refused changes on top.
  const altars = useMemo(
    () => applyOps(snapshot?.altars ?? [], [...failed.map((f) => f.op), ...queued]),
    [snapshot, failed, queued],
  );

  const save = useCallback(
    async ({ id, name, doc }: SaveRequest): Promise<SaveResult> => {
      const now = new Date().toISOString();
      const cleanName = name.trim() || 'My Altar';
      const data = altarDataFromDocument(doc, cleanName, now);

      if (!userId) {
        // Guest: storage.js saveAltar/renameSavedAltar on localStorage.
        const local = parseLocalAltars(await AsyncStorage.getItem(LOCAL_ALTARS_KEY));
        const index = id ? local.findIndex((a) => a.id === id) : -1;
        if (index >= 0) {
          local[index] = { ...local[index], ...data, id: local[index].id, name: cleanName, updatedAt: now };
          await writeLocalAltars(local);
          return { id: local[index].id, outcome: 'saved' };
        }
        const created = localSave(data);
        await writeLocalAltars([created, ...local]);
        return { id: created.id, outcome: 'saved' };
      }

      // Signed in: kept on the device first, so nothing is lost offline. A new
      // altar gets its id here, as the website does for guest altars it uploads.
      const altarId = id ?? newId();
      const createdAt = altars.find((a) => a.id === altarId)?.savedAt ?? now;
      const sending = queueOp(userId, {
        kind: 'save',
        id: altarId,
        name: cleanName,
        data,
        isNew: !id,
        createdAt,
        updatedAt: now,
      });
      await Promise.race([sending, new Promise((resolve) => setTimeout(resolve, SAVE_WAIT_MS))]);
      if (failedRef.current.some((f) => f.op.id === altarId)) return { id: altarId, outcome: 'failed' };
      if (queueRef.current.some((o) => o.id === altarId)) return { id: altarId, outcome: 'pending' };
      return { id: altarId, outcome: 'saved' };
    },
    [userId, altars, queueOp, writeLocalAltars],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!userId) {
        const local = parseLocalAltars(await AsyncStorage.getItem(LOCAL_ALTARS_KEY));
        await writeLocalAltars(local.filter((a) => a.id !== id));
        return;
      }
      void queueOp(userId, { kind: 'delete', id });
    },
    [userId, queueOp, writeLocalAltars],
  );

  const retryFailed = useCallback(() => {
    const id = userRef.current;
    if (!id || !failedRef.current.length) return;
    let queue = queueRef.current;
    for (const { op } of failedRef.current) queue = enqueue(queue, op, flushRef.current ? 1 : 0);
    queueRef.current = queue;
    failedRef.current = [];
    attempts.current = 0;
    publish();
    void persist(id).then(() => flush());
  }, [flush, persist, publish]);

  const discardFailed = useCallback(() => {
    const id = userRef.current;
    if (!id) return;
    failedRef.current = [];
    publish();
    setSync(queueRef.current.length ? 'saving' : 'idle');
    void persist(id).then(() => refresh());
  }, [persist, publish, refresh]);

  // The website keeps one working draft, saved 250 ms after each change.
  const saveDraft = useCallback((doc: AltarDocument, sourceId: string | null) => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      const next = draftFromDocument(doc, new Date().toISOString());
      setDraft(next);
      setDraftSourceId(sourceId);
      AsyncStorage.setItem(WORKING_DRAFT_KEY, JSON.stringify(next)).catch(() => {});
      if (sourceId) AsyncStorage.setItem(DRAFT_SOURCE_KEY, sourceId).catch(() => {});
      else AsyncStorage.removeItem(DRAFT_SOURCE_KEY).catch(() => {});
    }, 250);
  }, []);

  const clearDraft = useCallback(async () => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    setDraft(null);
    setDraftSourceId(null);
    await AsyncStorage.multiRemove([WORKING_DRAFT_KEY, DRAFT_SOURCE_KEY]);
  }, []);

  const value = useMemo<AltarState>(
    () => ({
      signedIn: !!userId,
      status,
      error,
      altars: sortAltars(altars),
      customItems: snapshot?.customItems ?? [],
      backgrounds: snapshot?.backgrounds ?? [],
      overrides: snapshot?.overrides ?? {},
      draft,
      draftSourceId,
      sync,
      pendingCount: queued.length,
      failed,
      retryFailed,
      discardFailed,
      refresh,
      save,
      remove,
      saveDraft,
      clearDraft,
    }),
    [userId, status, error, snapshot, altars, draft, draftSourceId, sync, queued, failed, retryFailed, discardFailed, refresh, save, remove, saveDraft, clearDraft],
  );

  return <AltarContext.Provider value={value}>{children}</AltarContext.Provider>;
}

export function useAltars(): AltarState {
  const value = useContext(AltarContext);
  if (!value) throw new Error('useAltars must be used inside AltarProvider');
  return value;
}
