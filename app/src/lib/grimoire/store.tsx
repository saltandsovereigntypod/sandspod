import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useSession } from '../session';
import { supabase } from '../supabase';
import type { BlockRow, BookRow, GrimoireSnapshot, PageLinkRow, PageRow, SectionRow } from './types';

const cacheKey = (userId: string) => `grimoire.snapshot.${userId}`;

type Status = 'idle' | 'loading' | 'ready' | 'offline' | 'error';

type GrimoireState = {
  snapshot: GrimoireSnapshot | null;
  status: Status;
  error: string | null;
  refresh: () => Promise<void>;
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

export function GrimoireProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [snapshot, setSnapshot] = useState<GrimoireSnapshot | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setStatus('loading');
    setError(null);
    try {
      const fresh = await fetchSnapshot();
      setSnapshot(fresh);
      setStatus('ready');
      await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(fresh));
    } catch (e) {
      // Keep showing the cached copy; say we're offline rather than failing.
      setError(e instanceof Error ? e.message : String(e));
      setStatus((prev) => (prev === 'loading' ? 'offline' : prev));
    }
  }, [userId]);

  useEffect(() => {
    setSnapshot(null);
    setStatus('idle');
    if (!userId) return;
    let active = true;
    AsyncStorage.getItem(cacheKey(userId))
      .then((cached) => {
        if (active && cached) setSnapshot(JSON.parse(cached) as GrimoireSnapshot);
      })
      .catch(() => {})
      .finally(() => {
        if (active) refresh();
      });
    return () => {
      active = false;
    };
  }, [userId, refresh]);

  const value = useMemo(() => ({ snapshot, status, error, refresh }), [snapshot, status, error, refresh]);
  return <GrimoireContext.Provider value={value}>{children}</GrimoireContext.Provider>;
}

export function useGrimoire(): GrimoireState {
  const value = useContext(GrimoireContext);
  if (!value) throw new Error('useGrimoire must be used inside GrimoireProvider');
  return value;
}
