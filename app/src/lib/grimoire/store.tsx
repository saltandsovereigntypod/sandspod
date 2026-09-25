import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useSession } from '../session';
import { supabase } from '../supabase';
import {
  alreadyApplied,
  applyOps,
  blockInsert,
  blockMetadataPatch,
  blockTextPatch,
  deleteOp,
  enqueue,
  ensureBook,
  isTransient,
  pageInsert,
  pageLinkInsert,
  pageTitlePatch,
  reorder,
  retryDelay,
  sectionInsert,
  sectionRename,
  sortOrderOps,
  type FailedOp,
  type Op,
  type SendError,
} from './edits';
import { newId } from './ids';
import { pageBlocks } from './structure';
import type { BlockRow, BlockType, BookRow, GrimoireSnapshot, PageLinkRow, PageRow, SectionRow } from './types';

const cacheKey = (userId: string) => `grimoire.snapshot.${userId}`;
const pendingKey = (userId: string) => `grimoire.pending.${userId}`;

type Status = 'idle' | 'loading' | 'ready' | 'offline' | 'error';

/** Where unsaved changes stand: all sent, sending, waiting for a connection,
 *  or some refused by the server (kept on the phone until retried). */
export type SyncState = 'idle' | 'saving' | 'offline' | 'error';

export type GrimoireActions = {
  createSection: (title: string) => string | null;
  renameSection: (sectionId: string, title: string) => void;
  deleteSection: (sectionId: string) => void;
  createPage: (input: { title: string; sectionId: string | null; templateKey: string }) => string | null;
  renamePage: (pageId: string, title: string) => void;
  deletePage: (pageId: string) => void;
  addBlock: (pageId: string, type: BlockType) => string | null;
  saveBlockText: (blockId: string, value: string) => void;
  saveBlockMetadata: (blockId: string, fields: Record<string, unknown>) => void;
  moveBlock: (blockId: string, direction: 'up' | 'down') => void;
  /** Returns false for a page's only element, which the website keeps. */
  deleteBlock: (blockId: string) => boolean;
  linkPage: (sourcePageId: string, targetPageId: string) => void;
  unlinkPage: (linkId: string) => void;
  retryFailed: () => void;
  discardFailed: () => void;
};

type GrimoireState = {
  snapshot: GrimoireSnapshot | null;
  status: Status;
  error: string | null;
  refresh: () => Promise<void>;
  /** Signed in with a copy of the book on hand. */
  canEdit: boolean;
  sync: SyncState;
  pendingCount: number;
  failed: FailedOp[];
  actions: GrimoireActions;
};

const GrimoireContext = createContext<GrimoireState | null>(null);

async function fetchSnapshot(): Promise<GrimoireSnapshot> {
  // Row-level security limits every query to the signed-in person's rows.
  const [books, sections, pages, blocks, links] = await Promise.all([
    supabase.from('grimoire_books').select('id,title,created_at,updated_at').order('created_at'),
    supabase.from('grimoire_sections').select('id,book_id,title,sort_order,created_at'),
    supabase
      .from('grimoire_pages')
      .select('id,book_id,section_id,title,page_type,sort_order,metadata,created_at,updated_at'),
    supabase.from('grimoire_blocks').select('id,page_id,block_type,content,rich_content,metadata,sort_order,created_at'),
    supabase.from('grimoire_page_links').select('id,source_page_id,target_page_id,link_label'),
  ]);
  const failed = [books, sections, pages, blocks, links].find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);

  return {
    fetchedAt: new Date().toISOString(),
    books: (books.data ?? []) as BookRow[],
    sections: (sections.data ?? []) as SectionRow[],
    pages: (pages.data ?? []) as PageRow[],
    blocks: (blocks.data ?? []) as BlockRow[],
    links: (links.data ?? []) as PageLinkRow[],
  };
}

type SendResult = { ok: true } | { ok: false; retry: boolean; message: string };

async function sendOp(op: Op): Promise<SendResult> {
  try {
    const table = supabase.from(op.table);
    const response =
      op.kind === 'insert'
        ? await table.insert(op.row)
        : op.kind === 'update'
          ? await table.update(op.patch).eq('id', op.id)
          : await table.delete().eq('id', op.id);
    if (!response.error) return { ok: true };
    const error: SendError = { status: response.status, code: response.error.code, message: response.error.message };
    if (alreadyApplied(op, error)) return { ok: true };
    return { ok: false, retry: isTransient(error), message: error.message ?? 'Not saved' };
  } catch (e) {
    return { ok: false, retry: true, message: e instanceof Error ? e.message : String(e) };
  }
}

export function GrimoireProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [snapshot, setSnapshot] = useState<GrimoireSnapshot | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncState>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [failed, setFailed] = useState<FailedOp[]>([]);

  // The source of truth lives in refs so quick successive edits never read a
  // stale render; state mirrors it for the screens.
  const userRef = useRef<string | null>(userId);
  const snapRef = useRef<GrimoireSnapshot | null>(null);
  const queueRef = useRef<Op[]>([]);
  const failedRef = useRef<FailedOp[]>([]);
  const flushRef = useRef<Promise<void> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);

  const publish = useCallback(() => {
    setSnapshot(snapRef.current);
    setPendingCount(queueRef.current.length);
    setFailed(failedRef.current);
  }, []);

  const persist = useCallback(async () => {
    const id = userRef.current;
    if (!id) return;
    try {
      // The queue first: it's the part that can't be fetched again.
      await AsyncStorage.setItem(pendingKey(id), JSON.stringify({ queue: queueRef.current, failed: failedRef.current }));
      if (snapRef.current) await AsyncStorage.setItem(cacheKey(id), JSON.stringify(snapRef.current));
    } catch {
      // Storage full or unavailable (private browsing): keep going in memory.
    }
  }, []);

  const flush = useCallback((): Promise<void> => {
    if (flushRef.current) return flushRef.current;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const owner = userRef.current;
    if (!owner || queueRef.current.length === 0) {
      setSync(failedRef.current.length ? 'error' : 'idle');
      return Promise.resolve();
    }

    const run = (async () => {
      setSync('saving');
      let waiting = false;
      while (queueRef.current.length && userRef.current === owner) {
        const op = queueRef.current[0];
        const result = await sendOp(op);
        if (userRef.current !== owner) return;
        const drop = () => {
          const at = queueRef.current.indexOf(op);
          if (at >= 0) queueRef.current = [...queueRef.current.slice(0, at), ...queueRef.current.slice(at + 1)];
        };
        if (result.ok) {
          drop();
          attemptRef.current = 0;
        } else if (result.retry) {
          waiting = true;
          break;
        } else {
          // Refused (not a connection problem). Keep it, and what the person
          // typed stays on the phone, until they retry or discard it.
          drop();
          failedRef.current = [...failedRef.current, { op, message: result.message }];
        }
        setPendingCount(queueRef.current.length);
      }
      publish();
      await persist();
      if (waiting) {
        attemptRef.current += 1;
        setSync('offline');
        timerRef.current = setTimeout(() => void flush(), retryDelay(attemptRef.current));
      } else {
        setSync(failedRef.current.length ? 'error' : 'idle');
      }
    })().finally(() => {
      flushRef.current = null;
      // Edits made while the last save was finishing.
      if (queueRef.current.length && !timerRef.current && userRef.current === owner) {
        timerRef.current = setTimeout(() => void flush(), 400);
      }
    });
    flushRef.current = run;
    return run;
  }, [persist, publish]);

  const scheduleFlush = useCallback(
    (delay = 400) => {
      if (flushRef.current) {
        // Whatever is sending now will pick up new work before it stops.
        return;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void flush(), delay);
    },
    [flush],
  );

  const commit = useCallback(
    (ops: Op[]) => {
      if (!snapRef.current || !userRef.current || ops.length === 0) return;
      const locked = flushRef.current ? 1 : 0;
      snapRef.current = applyOps(snapRef.current, ops);
      queueRef.current = ops.reduce((queue, op) => enqueue(queue, op, locked), queueRef.current);
      publish();
      void persist();
      scheduleFlush();
    },
    [persist, publish, scheduleFlush],
  );

  const refresh = useCallback(async () => {
    const owner = userRef.current;
    if (!owner) return;
    setStatus('loading');
    setError(null);
    await flush();
    try {
      const fresh = await fetchSnapshot();
      if (userRef.current !== owner) return;
      // Anything not yet saved stays on top of what the server sent.
      snapRef.current = applyOps(fresh, [...queueRef.current, ...failedRef.current.map((f) => f.op)]);
      publish();
      setStatus('ready');
      await persist();
    } catch (e) {
      // Keep showing the cached copy; say we're offline rather than failing.
      setError(e instanceof Error ? e.message : String(e));
      setStatus((prev) => (prev === 'loading' ? 'offline' : prev));
    }
  }, [flush, persist, publish]);

  useEffect(() => {
    userRef.current = userId;
    snapRef.current = null;
    queueRef.current = [];
    failedRef.current = [];
    attemptRef.current = 0;
    if (timerRef.current) clearTimeout(timerRef.current);
    publish();
    setStatus('idle');
    setSync('idle');
    if (!userId) return;
    let active = true;
    Promise.all([AsyncStorage.getItem(cacheKey(userId)), AsyncStorage.getItem(pendingKey(userId))])
      .then(([cached, pending]) => {
        if (!active) return;
        if (pending) {
          const saved = JSON.parse(pending) as { queue?: Op[]; failed?: FailedOp[] };
          queueRef.current = saved.queue ?? [];
          failedRef.current = saved.failed ?? [];
        }
        if (cached) snapRef.current = JSON.parse(cached) as GrimoireSnapshot;
        publish();
      })
      .catch(() => {})
      .finally(() => {
        if (active) refresh();
      });
    return () => {
      active = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userId, refresh, publish]);

  // Try again as soon as the app comes back to the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && queueRef.current.length) void flush();
    });
    return () => sub.remove();
  }, [flush]);

  const actions = useMemo<GrimoireActions>(() => {
    const ctx = () => ({ userId: userRef.current ?? '', now: new Date().toISOString() });
    const snap = () => snapRef.current;
    const findBlock = (id: string) => snap()?.blocks.find((b) => b.id === id) ?? null;
    const findPage = (id: string) => snap()?.pages.find((p) => p.id === id) ?? null;

    return {
      createSection(title) {
        const s = snap();
        if (!s || !userRef.current || !title.trim()) return null;
        const { bookId, ops } = ensureBook(s, ctx(), newId);
        const id = newId();
        commit([...ops, sectionInsert(applyOps(s, ops), ctx(), { id, bookId, title })]);
        return id;
      },
      renameSection(sectionId, title) {
        const section = snap()?.sections.find((x) => x.id === sectionId);
        const op = section ? sectionRename(ctx(), section, title) : null;
        if (op) commit([op]);
      },
      deleteSection(sectionId) {
        commit([deleteOp('grimoire_sections', sectionId)]);
      },
      createPage({ title, sectionId, templateKey }) {
        const s = snap();
        if (!s || !userRef.current) return null;
        const { bookId, ops } = ensureBook(s, ctx(), newId);
        const id = newId();
        commit([...ops, ...pageInsert(applyOps(s, ops), ctx(), { id, bookId, sectionId, title, templateKey }, newId)]);
        return id;
      },
      renamePage(pageId, title) {
        const page = findPage(pageId);
        const op = page ? pageTitlePatch(ctx(), page, title) : null;
        if (op) commit([op]);
      },
      deletePage(pageId) {
        commit([deleteOp('grimoire_pages', pageId)]);
      },
      addBlock(pageId, type) {
        const s = snap();
        const page = findPage(pageId);
        if (!s || !page) return null;
        const id = newId();
        commit([blockInsert(s, ctx(), { id, page, type })]);
        return id;
      },
      saveBlockText(blockId, value) {
        const block = findBlock(blockId);
        if (block) commit([blockTextPatch(ctx(), block, value)]);
      },
      saveBlockMetadata(blockId, fields) {
        const block = findBlock(blockId);
        if (block) commit([blockMetadataPatch(ctx(), block, fields)]);
      },
      moveBlock(blockId, direction) {
        const s = snap();
        const block = findBlock(blockId);
        if (!s || !block) return;
        commit(sortOrderOps('grimoire_blocks', reorder(pageBlocks(s, block.page_id), blockId, direction)));
      },
      deleteBlock(blockId) {
        const s = snap();
        const block = findBlock(blockId);
        if (!s || !block) return false;
        if (pageBlocks(s, block.page_id).length <= 1) return false;
        commit([deleteOp('grimoire_blocks', blockId)]);
        return true;
      },
      linkPage(sourcePageId, targetPageId) {
        const source = findPage(sourcePageId);
        const target = findPage(targetPageId);
        if (!source || !target || source.id === target.id) return;
        commit([pageLinkInsert(ctx(), { id: newId(), source, target })]);
      },
      unlinkPage(linkId) {
        commit([deleteOp('grimoire_page_links', linkId)]);
      },
      retryFailed() {
        if (!failedRef.current.length) return;
        // Behind whatever is being sent right now, ahead of newer edits.
        const keep = flushRef.current ? 1 : 0;
        queueRef.current = [
          ...queueRef.current.slice(0, keep),
          ...failedRef.current.map((f) => f.op),
          ...queueRef.current.slice(keep),
        ];
        failedRef.current = [];
        attemptRef.current = 0;
        publish();
        void persist();
        scheduleFlush(0);
      },
      discardFailed() {
        failedRef.current = [];
        publish();
        void persist().then(refresh);
      },
    };
  }, [commit, persist, publish, refresh, scheduleFlush]);

  const value = useMemo(
    () => ({
      snapshot,
      status,
      error,
      refresh,
      canEdit: !!userId && !!snapshot,
      sync,
      pendingCount,
      failed,
      actions,
    }),
    [snapshot, status, error, refresh, userId, sync, pendingCount, failed, actions],
  );
  return <GrimoireContext.Provider value={value}>{children}</GrimoireContext.Provider>;
}

export function useGrimoire(): GrimoireState {
  const value = useContext(GrimoireContext);
  if (!value) throw new Error('useGrimoire must be used inside GrimoireProvider');
  return value;
}
