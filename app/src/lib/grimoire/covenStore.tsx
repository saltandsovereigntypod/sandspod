import { useMemo, type ReactNode } from 'react';

import { supabase } from '../supabase';
import { COVEN_TABLES, covenOpPayload } from './coven';
import type { Op } from './edits';
import { GrimoireProvider, sendResult, type GrimoireSource, type SendResult } from './store';
import type { BlockRow, BookRow, GrimoireSnapshot, PageLinkRow, PageRow, SectionRow } from './types';

// A coven's Book of Shadows in the same store as your own grimoire: the
// screens under it (the coven's book/ routes) read and write it through
// useGrimoire(), with the same editor. Row-level security leaves out what
// this person can't open; every change goes through apply_coven_grimoire_op,
// which checks it.

async function fetchCovenBook(covenId: string): Promise<GrimoireSnapshot> {
  const opened = await supabase.rpc('open_coven_grimoire', { p_coven: covenId });
  if (opened.error) throw new Error(opened.error.message);
  const book = opened.data as BookRow & { id: string };
  const [sections, pages, blocks, links] = await Promise.all([
    supabase.from(COVEN_TABLES.grimoire_sections).select('*').eq('book_id', book.id),
    supabase.from(COVEN_TABLES.grimoire_pages).select('*').eq('book_id', book.id),
    supabase.from(COVEN_TABLES.grimoire_blocks).select('*').eq('book_id', book.id),
    supabase.from(COVEN_TABLES.grimoire_page_links).select('*').eq('book_id', book.id),
  ]);
  const failed = [sections, pages, blocks, links].find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
  return {
    fetchedAt: new Date().toISOString(),
    books: [book],
    sections: (sections.data ?? []) as SectionRow[],
    pages: (pages.data ?? []) as PageRow[],
    blocks: (blocks.data ?? []) as BlockRow[],
    links: (links.data ?? []) as PageLinkRow[],
  };
}

async function sendCovenOp(covenId: string, op: Op): Promise<SendResult> {
  try {
    const response = await supabase.rpc('apply_coven_grimoire_op', { p_coven: covenId, p_op: covenOpPayload(op) });
    return sendResult(op, response);
  } catch (e) {
    return { ok: false, retry: true, message: e instanceof Error ? e.message : String(e) };
  }
}

export function covenSource(covenId: string): GrimoireSource {
  return { key: `coven.${covenId}`, fetch: () => fetchCovenBook(covenId), send: (op) => sendCovenOp(covenId, op), report: false };
}

export function CovenGrimoireProvider({ covenId, children }: { covenId: string; children: ReactNode }) {
  const source = useMemo(() => covenSource(covenId), [covenId]);
  return (
    <GrimoireProvider key={covenId} source={source}>
      {children}
    </GrimoireProvider>
  );
}
