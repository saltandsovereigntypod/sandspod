// Finding dedication journeys in a list: by path, by deity, by search, and a
// lesson or practice within one. Kept apart from the registry so the website
// can use it with its small catalog (./catalog.ts) and load each journey only
// when it's opened. Pure; ./index.ts gives the same functions over every journey.

import { PATH_TRADITIONS } from '../library/traditions.ts';
import type { Journey } from './types.ts';

/** What the lists need of a journey: a whole journey, or its catalog entry. */
export type JourneyLike = Pick<Journey, 'id' | 'kind' | 'paths' | 'title' | 'summary'> & { deityRef?: string };

const PATH_ORDER = PATH_TRADITIONS.map((t) => t.id);
const pathRank = (id: string | undefined) => {
  const at = id ? PATH_ORDER.indexOf(id) : -1;
  return at < 0 ? PATH_ORDER.length : at;
};

/** Path journeys, in the Library's tradition order. */
export const pathJourneys = <T extends JourneyLike>(list: T[]): T[] =>
  list.filter((j) => j.kind === 'path').sort((a, b) => pathRank(a.paths[0]) - pathRank(b.paths[0]) || a.title.localeCompare(b.title));

/** Deity journeys, by their first path, then by name. */
export const deityJourneys = <T extends JourneyLike>(list: T[]): T[] =>
  list.filter((j) => j.kind === 'deity').sort((a, b) => pathRank(a.paths[0]) - pathRank(b.paths[0]) || a.title.localeCompare(b.title));

/** "traditional/deity/hekate" or the Library id "traditional:deity:hekate" → "traditional/deity/hekate". */
export const normalizeRef = (ref: string) => ref.trim().toLowerCase().replace(/:/g, '/');

/** The journey for a Living Library deity, by its ref or Library id. */
export function journeyForDeityRefIn<T extends JourneyLike>(list: T[], ref: string | null | undefined): T | null {
  if (!ref) return null;
  const want = normalizeRef(ref);
  return list.find((j) => j.deityRef && normalizeRef(j.deityRef) === want) ?? null;
}

/** Journeys that belong to any of these paths (PATH_TRADITIONS ids), paths first. */
export function forPathIn<T extends JourneyLike>(list: T[], paths: string[]): T[] {
  const want = new Set(paths);
  const hits = list.filter((j) => j.paths.some((p) => want.has(p)));
  return [...pathJourneys(hits), ...deityJourneys(hits)];
}

export type JourneyGroup<T extends JourneyLike = Journey> = { path: string; journeys: T[] };

/**
 * Deity journeys grouped by their first path (their pantheon), with the
 * groups for `mine` (My path's traditions) first and the rest in the
 * Library's order.
 */
export function deityGroupsIn<T extends JourneyLike>(list: T[], mine: string[] = []): JourneyGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const j of deityJourneys(list)) {
    const path = j.paths[0] ?? 'other';
    groups.set(path, [...(groups.get(path) ?? []), j]);
  }
  const rank = (path: string) => (mine.includes(path) ? mine.indexOf(path) - mine.length : pathRank(path));
  return [...groups.entries()].map(([path, journeys]) => ({ path, journeys })).sort((a, b) => rank(a.path) - rank(b.path));
}

/** Path journeys with My path's first. */
export function pathsMineFirstIn<T extends JourneyLike>(list: T[], mine: string[] = []): T[] {
  const paths = pathJourneys(list);
  const isMine = (j: T) => j.paths.some((p) => mine.includes(p));
  return [...paths.filter(isMine), ...paths.filter((j) => !isMine(j))];
}

const fold = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Journeys whose title, summary or paths hold every word of the query. */
export function searchJourneysIn<T extends JourneyLike>(list: T[], query: string): T[] {
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
