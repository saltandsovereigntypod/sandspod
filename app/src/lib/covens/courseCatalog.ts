// The ready-made course programs, fetched from the website when someone opens
// Design and assign (js/core/course-programs.json, built from courses/index.ts
// by scripts/build-course-programs.mjs). The courses hold every lesson, about
// a megabyte, so they stay out of the app's bundle. Without them (offline, or
// before the website has them) the database's older templates stand in.

import { WEBSITE_ORIGIN } from '../altar/assetPaths';
import type { CourseProgram } from './courses/index';

export type CourseCatalog = { label: string; names: Record<string, string>; programs: CourseProgram[] };

export const CATALOG_URL = `${WEBSITE_ORIGIN}/js/core/course-programs.json`;

/** A fetched catalog, if it's sound. */
export function readCatalog(raw: unknown): CourseCatalog | null {
  const v = raw as { label?: unknown; traditions?: unknown; programs?: unknown } | null;
  if (!v || typeof v !== 'object' || !Array.isArray(v.programs)) return null;
  const programs = (v.programs as CourseProgram[]).filter(
    (p) => p && typeof p.id === 'string' && typeof p.title === 'string' && Array.isArray(p.stages) && Array.isArray(p.docs) && Array.isArray(p.quizzes),
  );
  const names: Record<string, string> = {};
  if (Array.isArray(v.traditions)) for (const t of v.traditions as { id?: unknown; name?: unknown }[]) if (typeof t?.id === 'string' && typeof t.name === 'string') names[t.id] = t.name;
  return { label: typeof v.label === 'string' ? v.label : '', names, programs };
}

let cached: Promise<CourseCatalog> | null = null;

export function loadCourseCatalog(): Promise<CourseCatalog> {
  if (!cached) {
    cached = fetch(CATALOG_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => readCatalog(json) ?? { label: '', names: {}, programs: [] })
      .catch(() => {
        cached = null;
        return { label: '', names: {}, programs: [] };
      });
  }
  return cached;
}
