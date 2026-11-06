import { useMemo } from 'react';

import { DREAMS, normalizeDream } from '../../lib/craft/hedge/dreams';
import { methodLabel, normalizeReading, READINGS } from '../../lib/craft/hedge/readings';
import { useCraft } from '../../lib/craft/store';
import { useCycle } from '../../lib/cycle/store';
import { DREAM_ROUTES } from '../../lib/grimoire/dreams';
import { cycleNoteItem, dayOf, type TimelineItem, type TimelineKind } from '../../lib/journal/timeline';
import { entryDetail, entryTitle, journalRoutes, type JournalKind } from '../../lib/journals/journals';
import { BATH_LOG, logTimelineItem } from '../../lib/craft/bath/bath';
import { PSYCHIC_SESSIONS, sessionTimelineItem, type SessionEntry } from '../../lib/craft/psychic/log';
import { kindLabel, normalizeSit, sitLine, SITS } from '../../lib/meditation/log';
import { checkInTimeline } from '../../lib/rituals/checkIns';
import { journalDetail } from '../../lib/rituals/format';
import { useRituals } from '../../lib/rituals/store';
import { useJournal, usePeople } from '../journals/shared';

const firstLine = (s: string) => s.trim().split(/\n/)[0].slice(0, 70);

/** Where "New entry" goes for each kind. Journals open in the Rituals tab, beside this Journal. */
export function newEntryHref(kind: TimelineKind): string {
  switch (kind) {
    case 'ritual':
      return '/rituals/journal/new';
    case 'dream':
      return DREAM_ROUTES.write;
    case 'reading':
      return '/rituals/divination/edit';
    case 'sit':
      return '/rituals/craft/meditation/log';
    case 'cycle':
      return '/rituals/cycle/log';
    case 'bath':
      return '/rituals/craft/bath/log';
    case 'psychic':
      return '/rituals/craft/psychic';
    default:
      return journalRoutes(kind, 'journal').write();
  }
}

function usePracticeJournal(kind: JournalKind, names: Record<string, string>): TimelineItem[] {
  const { list } = useJournal(kind);
  return useMemo(
    () =>
      list.map((e) => ({
        kind,
        id: e.id,
        date: dayOf(e.data.date) || dayOf(e.createdAt),
        at: e.data.time || e.createdAt,
        title: entryTitle(kind, e.data, { people: names }),
        detail: entryDetail(kind, e.data),
        href: journalRoutes(kind, 'journal').entry(e.id),
      })),
    [list, kind, names],
  );
}

/** Every entry from every journal you keep, as rows for the one Journal (lib/journal/timeline.ts merges them). */
export function useTimelineLists(): { lists: TimelineItem[][]; cycleLocked: boolean } {
  const rituals = useRituals();
  const dreams = useCraft<unknown>(DREAMS).entries;
  const readings = useCraft<unknown>(READINGS).entries;
  const sits = useCraft<unknown>(SITS).entries;
  const psychic = useCraft<unknown>(PSYCHIC_SESSIONS).entries;
  const baths = useCraft<unknown>(BATH_LOG).entries;
  const cycle = useCycle();
  const { names } = usePeople();
  const shadow = usePracticeJournal('shadow', names);
  const devotion = usePracticeJournal('devotion', names);
  const ancestors = usePracticeJournal('ancestors', names);
  const omens = usePracticeJournal('omens', names);

  const ritualItems = useMemo<TimelineItem[]>(
    () =>
      rituals.journal.map((e): TimelineItem => ({
        kind: 'ritual',
        id: e.id,
        date: dayOf(e.ritual_date) || dayOf(e.ended_at) || dayOf(e.created_at),
        at: e.ended_at || e.started_at || e.created_at || '',
        title: e.title || 'Untitled Ritual',
        detail: journalDetail(e),
        href: `/rituals/journal/${encodeURIComponent(e.id)}`,
      })).concat(
        // Check-ins written on a working (rituals/checkIns.ts), on the day they were written.
        rituals.journal.flatMap((e) =>
          checkInTimeline(e).map((c): TimelineItem => ({ kind: 'ritual', id: c.id, date: c.date, at: c.date, title: c.title, detail: c.detail, href: `/rituals/journal/${encodeURIComponent(e.id)}` })),
        ),
      ),
    [rituals.journal],
  );
  const dreamItems = useMemo<TimelineItem[]>(
    () =>
      dreams.map((e) => {
        const d = normalizeDream(e.data);
        return {
          kind: 'dream',
          id: e.id,
          date: dayOf(d.date) || dayOf(e.createdAt),
          at: e.createdAt,
          title: d.title.trim() || firstLine(d.dream) || 'A dream',
          detail: [d.moonPhase, d.symbols.slice(0, 3).join(', ') || null, d.lucid ? 'lucid' : null].filter(Boolean).join(' · '),
          href: DREAM_ROUTES.dream(e.id),
        };
      }),
    [dreams],
  );
  const readingItems = useMemo<TimelineItem[]>(
    () =>
      readings.map((e) => {
        const d = normalizeReading(e.data);
        return {
          kind: 'reading',
          id: e.id,
          date: dayOf(d.date) || dayOf(e.createdAt),
          at: e.createdAt,
          title: d.question.trim() || 'A reading',
          detail: [methodLabel(d.method), d.drawn.slice(0, 3).join(', ') || null, d.outcome ? 'looked back' : null].filter(Boolean).join(' · '),
          href: `/rituals/divination/${encodeURIComponent(e.id)}`,
        };
      }),
    [readings],
  );
  const sitItems = useMemo<TimelineItem[]>(
    () =>
      sits.map((e) => {
        const s = normalizeSit(e.data);
        const at = new Date(s.at);
        const local = Number.isNaN(at.getTime()) ? '' : `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`;
        return {
          kind: 'sit',
          id: e.id,
          date: local || dayOf(e.createdAt),
          at: s.at,
          title: kindLabel(s),
          detail: [sitLine(s), s.note ? firstLine(s.note) : null].filter(Boolean).join(' · '),
          href: `/rituals/craft/meditation/log?id=${encodeURIComponent(e.id)}`,
        };
      }),
    [sits],
  );
  const psychicItems = useMemo<TimelineItem[]>(() => psychic.map((e) => sessionTimelineItem(e as unknown as SessionEntry)), [psychic]);
  const bathItems = useMemo<TimelineItem[]>(() => baths.map(logTimelineItem), [baths]);
  const notes = cycle.phase === 'open' ? cycle.data?.notes : undefined;
  const cycleItems = useMemo<TimelineItem[]>(() => (notes ?? []).map(cycleNoteItem).filter((x): x is TimelineItem => !!x), [notes]);

  return {
    lists: [ritualItems, dreamItems, readingItems, sitItems, cycleItems, shadow, devotion, ancestors, omens, psychicItems, bathItems],
    cycleLocked: cycle.phase === 'locked',
  };
}
