import { createContext, useContext } from 'react';
import type { Href } from 'expo-router';

import type { PageRow } from '../../lib/grimoire/types';

/**
 * Which book the grimoire screens are showing: your own (the Grimoire tab)
 * or a coven's (its Book). The same page, editor and new-page screens serve
 * both; this says where their links go and what this person may do.
 */
export type GrimoireScope = {
  kind: 'personal' | 'coven';
  home: Href;
  page: (pageId: string) => Href;
  edit: (pageId: string) => Href;
  newPage: (sectionId?: string | null) => Href;
  /** May write on this page (the editor). */
  canWrite: (page: PageRow) => boolean;
  /** May take this page out of the book. */
  canRemove: (page: PageRow) => boolean;
  /** Sections a new page can go in (null: no section) — all of them for your own book. */
  canAddIn: (sectionId: string | null) => boolean;
};

export const PERSONAL_SCOPE: GrimoireScope = {
  kind: 'personal',
  home: '/grimoire',
  page: (pageId) => ({ pathname: '/grimoire/[pageId]', params: { pageId } }),
  edit: (pageId) => ({ pathname: '/grimoire/edit/[pageId]', params: { pageId } }),
  newPage: (sectionId) => ({ pathname: '/grimoire/new-page', params: sectionId ? { sectionId } : {} }),
  canWrite: () => true,
  canRemove: () => true,
  canAddIn: () => true,
};

export const GrimoireScopeContext = createContext<GrimoireScope>(PERSONAL_SCOPE);

export const useGrimoireScope = () => useContext(GrimoireScopeContext);
