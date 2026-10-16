// Self-dedication journeys: the registry (generated from ./data by
// scripts/gen-journeys-index.mjs) and ways to find one. Pure, so it can be
// tested; progress lives in ./progress.ts and ./store.ts.

import { PATH_TRADITIONS } from '../library/traditions.ts';
import { JOURNEYS } from './registry.ts';
import type { Journey } from './types.ts';

export { JOURNEYS };
export type * from './types.ts';

const PATH_ORDER = PATH_TRADITIONS.map((t) => t.id);
const pathRank = (id: string | undefined) => {
  const at = id ? PATH_ORDER.indexOf(id) : -1;
  return at < 0 ? PATH_ORDER.length : at;
};

const byId = new Map(JOURNEYS.map((j) => [j.id, j]));

export const journeyById = (id: string | null | undefined): Journey | null => (id ? byId.get(id) ?? null : null);

/** Path journeys, in the Library's tradition order. */
export const pathJourneys = (list: Journey[] = JOURNEYS): Journey[] =>
  list.filter((j) => j.kind === 'path').sort((a, b) => pathRank(a.paths[0]) - pathRank(b.paths[0]) || a.title.localeCompare(b.title));

/** Deity journeys, by their first path, then by name. */
export const deityJourneys = (list: Journey[] = JOURNEYS): Journey[] =>
  list.filter((j) => j.kind === 'deity').sort((a, b) => pathRank(a.paths[0]) - pathRank(b.paths[0]) || a.title.localeCompare(b.title));

/** "traditional/deity/hekate" or the Library id "traditional:deity:hekate" → "traditional/deity/hekate". */
export const normalizeRef = (ref: string) => ref.trim().toLowerCase().replace(/:/g, '/');

const byDeity = new Map(JOURNEYS.filter((j) => j.deityRef).map((j) => [normalizeRef(j.deityRef!), j]));

/** The journey for a Living Library deity, by its ref or Library id. */
export const journeyForDeityRef = (ref: string | null | undefined): Journey | null => (ref ? byDeity.get(normalizeRef(ref)) ?? null : null);

/** Journeys that belong to any of these paths (PATH_TRADITIONS ids), paths first. */
export function forPath(paths: string[], list: Journey[] = JOURNEYS): Journey[] {
  const want = new Set(paths);
  const hits = list.filter((j) => j.paths.some((p) => want.has(p)));
  return [...pathJourneys(hits), ...deityJourneys(hits)];
}

export type JourneyGroup = { path: string; journeys: Journey[] };

/**
 * Deity journeys grouped by their first path (their pantheon), with the
 * groups for `mine` (My path's traditions) first and the rest in the
 * Library's order.
 */
export function deityGroups(mine: string[] = [], list: Journey[] = JOURNEYS): JourneyGroup[] {
  const groups = new Map<string, Journey[]>();
  for (const j of deityJourneys(list)) {
    const path = j.paths[0] ?? 'other';
    groups.set(path, [...(groups.get(path) ?? []), j]);
  }
  const rank = (path: string) => (mine.includes(path) ? mine.indexOf(path) - mine.length : pathRank(path));
  return [...groups.entries()].map(([path, journeys]) => ({ path, journeys })).sort((a, b) => rank(a.path) - rank(b.path));
}

/** Path journeys with My path's first. */
export function pathsMineFirst(mine: string[] = [], list: Journey[] = JOURNEYS): Journey[] {
  const paths = pathJourneys(list);
  const isMine = (j: Journey) => j.paths.some((p) => mine.includes(p));
  return [...paths.filter(isMine), ...paths.filter((j) => !isMine(j))];
}

const fold = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Journeys whose title, summary or paths hold every word of the query. */
export function searchJourneys(query: string, list: Journey[] = JOURNEYS): Journey[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return list;
  return list.filter((j) => {
    const names = j.paths.map((p) => PATH_TRADITIONS.find((t) => t.id === p)?.name ?? p);
    const text = fold([j.title, j.summary, ...names].join(' '));
    return words.every((w) => text.includes(w));
  });
}

/** A lesson and the stage it belongs to. */
export function findLesson(journey: Journey | null, lessonId: string | null | undefined) {
  if (!journey || !lessonId) return null;
  for (const [index, stage] of journey.stages.entries()) {
    const lesson = stage.lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, stage, index };
  }
  return null;
}

/** A practice and the stage it belongs to. */
export function findPractice(journey: Journey | null, practiceId: string | null | undefined) {
  if (!journey || !practiceId) return null;
  for (const [index, stage] of journey.stages.entries()) {
    const practice = stage.practices.find((p) => p.id === practiceId);
    if (practice) return { practice, stage, index };
  }
  return null;
}

/** The lesson after this one in the same stage, if any. */
export function nextLesson(journey: Journey | null, lessonId: string) {
  const found = findLesson(journey, lessonId);
  if (!found) return null;
  const at = found.stage.lessons.findIndex((l) => l.id === lessonId);
  return found.stage.lessons[at + 1] ?? null;
}

/**
 * Whether the journeys show in the app. Off until every journey has had its
 * fact-check pass; the screens exist, but nothing links to them.
 */
export const JOURNEYS_LIVE = true;
