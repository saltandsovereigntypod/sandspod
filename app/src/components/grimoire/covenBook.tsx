import type { Href } from 'expo-router';
import { useMemo, type ReactNode } from 'react';

import { covenHref } from '../covens/CovenScreen';
import { allows, type AccessWhat } from '../../lib/grimoire/access';
import { bookChain, covenViewer, pageChain, sectionChain } from '../../lib/grimoire/coven';
import { useGrimoire } from '../../lib/grimoire/store';
import type { PageRow, SectionRow } from '../../lib/grimoire/types';
import { useCoven } from '../../lib/covens/CovenContext';
import { GrimoireScopeContext, type GrimoireScope } from './scope';

/**
 * Who may do what in this coven's book, from the coven's permissions and the
 * book's own rules (lib/grimoire/access.ts; the database decides the same).
 */
export function useCovenBook() {
  const coven = useCoven();
  const grimoire = useGrimoire();
  const viewer = useMemo(() => covenViewer({ userId: coven.userId, perms: coven.perms, standingOk: coven.standing.ok }), [coven.userId, coven.perms, coven.standing.ok]);
  const { snapshot } = grimoire;
  return useMemo(() => {
    const canPage = (page: PageRow | null, what: AccessWhat) => !!page && allows(viewer, pageChain(snapshot, page), what);
    const canSection = (section: SectionRow | null, what: AccessWhat) => (section ? allows(viewer, sectionChain(snapshot, section), what) : allows(viewer, bookChain(snapshot), what));
    const canBook = (what: AccessWhat) => allows(viewer, bookChain(snapshot), what);
    const sectionOf = (id: string | null) => (id ? (snapshot?.sections.find((s) => s.id === id) ?? null) : null);
    const href = (sub = '') => covenHref(coven.slug, `book${sub ? `/${sub}` : ''}`);
    return { coven, grimoire, viewer, snapshot, book: snapshot?.books[0] ?? null, canPage, canSection, canBook, sectionOf, href };
  }, [coven, grimoire, viewer, snapshot]);
}

/** The grimoire screens' links and rights, for this coven's book. */
export function CovenBookScope({ children }: { children: ReactNode }) {
  const book = useCovenBook();
  const { canPage, canSection, sectionOf, href } = book;
  const scope = useMemo<GrimoireScope>(
    () => ({
      kind: 'coven',
      home: href(),
      page: (pageId) => href(pageId) as Href,
      edit: (pageId) => href(`edit/${pageId}`) as Href,
      newPage: (sectionId) => `${href('new-page')}${sectionId ? `?sectionId=${encodeURIComponent(sectionId)}` : ''}` as Href,
      canWrite: (page) => canPage(page, 'write'),
      canRemove: (page) => canPage(page, 'approve'),
      canAddIn: (sectionId) => canSection(sectionOf(sectionId), 'write'),
    }),
    [canPage, canSection, sectionOf, href],
  );
  return <GrimoireScopeContext.Provider value={scope}>{children}</GrimoireScopeContext.Provider>;
}
