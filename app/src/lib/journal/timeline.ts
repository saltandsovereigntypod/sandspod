// The one Journal: every kind of entry you keep, newest first, in one list
// that can be narrowed to a kind. The entries stay where they are kept (the
// ritual journal, craft entries for dreams, readings, sits and the four
// practice journals, and the cycle's own store); this only merges what those
// stores already hold, and each row opens that kind's own page. Pure, so it
// can be tested.

export type TimelineKind = 'ritual' | 'dream' | 'reading' | 'sit' | 'cycle' | 'shadow' | 'devotion' | 'ancestors' | 'omens' | 'psychic' | 'bath';

export type TimelineItem = {
  kind: TimelineKind;
  id: string;
  /** The day it belongs to, "YYYY-MM-DD" ('' when unknown). */
  date: string;
  /** A finer moment for ordering within a day (ISO or "HH:MM"); optional. */
  at?: string;
  title: string;
  detail: string;
  href: string;
};

/** Every kind, in the order the filter and the "New entry" picker show them. */
export const TIMELINE_KINDS: readonly { kind: TimelineKind; label: string; one: string; write: string }[] = [
  { kind: 'ritual', label: 'Rituals', one: 'Ritual', write: 'Record a ritual' },
  { kind: 'dream', label: 'Dreams', one: 'Dream', write: 'Write down a dream' },
  { kind: 'reading', label: 'Readings', one: 'Reading', write: 'Log a reading' },
  { kind: 'sit', label: 'Meditation', one: 'Sit', write: 'Log a sit' },
  { kind: 'cycle', label: 'Cycle notes', one: 'Cycle note', write: 'Note today in Cycle & Moon' },
  { kind: 'shadow', label: 'Shadow work', one: 'Shadow work', write: 'Write in Shadow work' },
  { kind: 'devotion', label: 'Deity & spirit', one: 'Deity & spirit', write: 'Write in Deity & spirit' },
  { kind: 'ancestors', label: 'Ancestors', one: 'Ancestors', write: 'Write in Ancestors' },
  { kind: 'omens', label: 'Omens & signs', one: 'Omen', write: 'Note an omen or sign' },
  { kind: 'psychic', label: 'Psychic development', one: 'Psychic development', write: 'Start a psychic exercise' },
  { kind: 'bath', label: 'Baths', one: 'Bath', write: 'Log a bath' },
];

export const isTimelineKind = (v: unknown): v is TimelineKind => TIMELINE_KINDS.some((k) => k.kind === v);
export const timelineKindLabel = (kind: TimelineKind) => TIMELINE_KINDS.find((k) => k.kind === kind)?.one ?? '';

/** The day part of a date or ISO moment, "YYYY-MM-DD", or ''. */
export function dayOf(value: string | null | undefined): string {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(value ?? ''));
  return m ? m[1] : '';
}

/** Newest first: by day, then by the finer moment; entries with no day go last. */
export function compareItems(a: TimelineItem, b: TimelineItem): number {
  if (!a.date !== !b.date) return a.date ? -1 : 1;
  const byDay = b.date.localeCompare(a.date);
  if (byDay) return byDay;
  return (b.at ?? '').localeCompare(a.at ?? '');
}

/** All the lists merged, newest first, narrowed to one kind (or none for every kind). */
export function mergeTimeline(lists: readonly TimelineItem[][], only: TimelineKind | null = null): TimelineItem[] {
  return lists
    .flat()
    .filter((item) => !only || item.kind === only)
    .sort(compareItems);
}

/** How many of each kind there are (only kinds with entries). */
export function kindCounts(items: readonly TimelineItem[]): Partial<Record<TimelineKind, number>> {
  const counts: Partial<Record<TimelineKind, number>> = {};
  for (const item of items) counts[item.kind] = (counts[item.kind] ?? 0) + 1;
  return counts;
}

/** Entries whose title or detail holds every word of the query. */
export function searchTimeline(items: readonly TimelineItem[], query: string): TimelineItem[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [...items];
  return items.filter((item) => {
    const text = `${item.title} ${item.detail} ${timelineKindLabel(item.kind)}`.toLowerCase();
    return words.every((w) => text.includes(w));
  });
}

const firstLine = (s: string | null | undefined, max = 70) => String(s ?? '').trim().split(/\n/)[0].slice(0, max);

/** A cycle day note as a row, if anything was written or noted that day. */
export function cycleNoteItem(note: {
  date: string;
  mood?: string;
  body?: string;
  dreams?: string;
  text?: string;
  updatedAt?: string;
  symptoms?: Record<string, unknown>;
  custom?: Record<string, unknown>;
  energy?: number | null;
  intuition?: number | null;
}): TimelineItem | null {
  const words = firstLine(note.text) || firstLine(note.mood) || firstLine(note.body) || firstLine(note.dreams);
  const marks = Object.keys(note.symptoms ?? {}).length + Object.keys(note.custom ?? {}).length;
  if (!words && !marks && note.energy == null && note.intuition == null) return null;
  const date = dayOf(note.date);
  return {
    kind: 'cycle',
    id: `note:${date}`,
    date,
    at: note.updatedAt ?? '',
    title: words || 'Cycle note',
    detail: [note.mood && words !== firstLine(note.mood) ? note.mood : null, marks ? `${marks} ${marks === 1 ? 'thing' : 'things'} noted` : null].filter(Boolean).join(' · '),
    href: `/rituals/cycle/log?date=${encodeURIComponent(date)}`,
  };
}
