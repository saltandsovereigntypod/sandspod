// Self-dedication journeys: the registry (generated from ./data by
// scripts/gen-journeys-index.mjs) and ways to find one. Pure, so it can be
// tested; progress lives in ./progress.ts and ./store.ts. The finding itself
// is in ./lookup.ts, which works on any list (the website uses ./catalog.ts).

import {
  deityGroupsIn,
  forPathIn,
  journeyForDeityRefIn,
  pathsMineFirstIn,
  searchJourneysIn,
  pathJourneys as pathJourneysIn,
  deityJourneys as deityJourneysIn,
  type JourneyGroup,
} from './lookup.ts';
import { JOURNEYS } from './registry.ts';
import type { Journey } from './types.ts';

export { JOURNEYS };
export type * from './types.ts';
export type { JourneyGroup };
export { findLesson, findPractice, nextLesson, normalizeRef } from './lookup.ts';

const byId = new Map(JOURNEYS.map((j) => [j.id, j]));

export const journeyById = (id: string | null | undefined): Journey | null => (id ? byId.get(id) ?? null : null);

/** Path journeys, in the Library's tradition order. */
export const pathJourneys = (list: Journey[] = JOURNEYS): Journey[] => pathJourneysIn(list);

/** Deity journeys, by their first path, then by name. */
export const deityJourneys = (list: Journey[] = JOURNEYS): Journey[] => deityJourneysIn(list);

/** The journey for a Living Library deity, by its ref or Library id. */
export const journeyForDeityRef = (ref: string | null | undefined): Journey | null => journeyForDeityRefIn(JOURNEYS, ref);

/** Journeys that belong to any of these paths (PATH_TRADITIONS ids), paths first. */
export const forPath = (paths: string[], list: Journey[] = JOURNEYS): Journey[] => forPathIn(list, paths);

/**
 * Deity journeys grouped by their first path (their pantheon), with the
 * groups for `mine` (My path's traditions) first and the rest in the
 * Library's order.
 */
export const deityGroups = (mine: string[] = [], list: Journey[] = JOURNEYS): JourneyGroup[] => deityGroupsIn(list, mine);

/** Path journeys with My path's first. */
export const pathsMineFirst = (mine: string[] = [], list: Journey[] = JOURNEYS): Journey[] => pathsMineFirstIn(list, mine);

/** Journeys whose title, summary or paths hold every word of the query. */
export const searchJourneys = (query: string, list: Journey[] = JOURNEYS): Journey[] => searchJourneysIn(list, query);

/**
 * Whether the journeys show in the app. Off until every journey has had its
 * fact-check pass; the screens exist, but nothing links to them.
 */
export const JOURNEYS_LIVE = true;
