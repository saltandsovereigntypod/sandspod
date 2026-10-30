// The Learn Astrology course: its chapters in order, lookups, and where each
// lesson link opens in the app and on the website. Pure; shared with the
// website as SaltCore["astro-course"] (scripts/core/astro-course.ts).

import { courseLinkAppHref, courseLinkLabel, courseLinkSiteHref } from '../../covens/courseLinks.ts';
import { BASICS, PLANETS, SKY } from './chapters1.ts';
import { ASPECTS_CHAPTER, HOUSES_CHAPTER, SIGNS_CHAPTER } from './chapters2.ts';
import { DIGNITIES, READING, TRANSITS_CHAPTER } from './chapters3.ts';
import { MAGIC, MOON_CHAPTER, PROGRESSIONS } from './chapters4.ts';
import type { AstroChapter, AstroLesson, AstroLink, AstroPage } from './types.ts';

export type { AstroChapter, AstroLesson, AstroLink, AstroPage, YourChartKind } from './types.ts';

export const COURSE_ID = 'learn-astrology';
export const COURSE_TITLE = 'Learn astrology';

export const CHAPTERS: AstroChapter[] = [BASICS, SKY, PLANETS, SIGNS_CHAPTER, HOUSES_CHAPTER, ASPECTS_CHAPTER, READING, DIGNITIES, TRANSITS_CHAPTER, PROGRESSIONS, MOON_CHAPTER, MAGIC];

export const ALL_LESSONS: AstroLesson[] = CHAPTERS.flatMap((c) => c.lessons);

export const chapterById = (id: string | null | undefined): AstroChapter | null => CHAPTERS.find((c) => c.id === id) ?? null;
export const lessonById = (id: string | null | undefined): AstroLesson | null => ALL_LESSONS.find((l) => l.id === id) ?? null;
export const chapterOfLesson = (id: string): AstroChapter | null => CHAPTERS.find((c) => c.lessons.some((l) => l.id === id)) ?? null;

/** The lesson after this one (across chapters), or null at the end. */
export function nextLesson(id: string): AstroLesson | null {
  const i = ALL_LESSONS.findIndex((l) => l.id === id);
  return i >= 0 ? ALL_LESSONS[i + 1] ?? null : null;
}

/** "Chapter 3 · Lesson 2 of 4" for a lesson. */
export function lessonPlace(id: string): string {
  const c = chapterOfLesson(id);
  if (!c) return '';
  const n = CHAPTERS.indexOf(c) + 1;
  return `Chapter ${n} · Lesson ${c.lessons.findIndex((l) => l.id === id) + 1} of ${c.lessons.length}`;
}

const CHART_TABS: Record<string, string> = { placements: 'Your placements', aspects: 'Your aspects', balance: 'Your balance', reading: 'Your reading in full', transits: 'Your transits', returns: 'Your returns', progressions: 'Your progressions', craft: 'Your chart and the craft' };

/** The astrology pages, by id: their name, and where they open. */
export function astroPage(id: AstroPage): { label: string; app: string; site: string } | null {
  if (id === 'chart') return { label: 'Your chart', app: '/rituals/craft/cosmic/chart', site: '/practice/cosmic/chart/' };
  if (id.startsWith('chart:')) {
    const tab = id.slice('chart:'.length);
    if (!CHART_TABS[tab]) return null;
    return { label: CHART_TABS[tab], app: `/rituals/craft/cosmic/chart?tab=${tab}`, site: `/practice/cosmic/chart/?tab=${tab}` };
  }
  if (id.startsWith('planet:')) {
    const planet = id.slice('planet:'.length);
    if (!PLANET_GUIDES.includes(planet)) return null;
    return { label: `${planet}: the planet's guide`, app: `/rituals/craft/cosmic/planet?planet=${encodeURIComponent(planet)}`, site: `/practice/cosmic/planet/?planet=${encodeURIComponent(planet)}` };
  }
  const fixed: Record<string, { label: string; app: string; site: string }> = {
    charts: { label: 'Your charts', app: '/rituals/craft/cosmic/charts', site: '/practice/cosmic/charts/' },
    hours: { label: 'Planetary days and hours', app: '/rituals/craft/cosmic/hours', site: '/practice/cosmic/hours/' },
    learn: { label: 'The astrology glossary', app: '/rituals/craft/cosmic/learn', site: '/practice/cosmic/learn/' },
    sky: { label: 'The sky today', app: '/today/sky', site: '/today/sky/' },
  };
  return fixed[id] ?? null;
}

/** The planets with a guide page (lib/astro/planetGuides.ts: the seven classical planets). */
export const PLANET_GUIDES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

/**
 * What a lesson link's button says. A glossary term's name comes from the
 * glossary (`termName`), which the course itself doesn't load, so the website
 * can keep the course in its own small script.
 */
export function astroLinkLabel(link: AstroLink, termName?: (id: string) => string | null | undefined): string {
  if (link.label?.trim()) return link.label.trim();
  if (link.kind === 'term') return termName?.(link.id) ?? link.id;
  if (link.kind === 'astro') return astroPage(link.id)?.label ?? link.id;
  return courseLinkLabel(link);
}

/** Where a lesson link opens in the app (a glossary term opens in place: null). */
export function astroLinkAppHref(link: AstroLink): string | null {
  if (link.kind === 'term') return null;
  if (link.kind === 'astro') return astroPage(link.id)?.app ?? null;
  return courseLinkAppHref(link);
}

/** Where a lesson link opens on the website (a glossary term opens in place: null). */
export function astroLinkSiteHref(link: AstroLink): string | null {
  if (link.kind === 'term') return null;
  if (link.kind === 'astro') return astroPage(link.id)?.site ?? null;
  return courseLinkSiteHref(link);
}

export const COURSE_HREF = { app: '/rituals/craft/cosmic/course', site: '/practice/cosmic/course/' };
export const lessonAppHref = (id: string) => `/rituals/craft/cosmic/lesson?l=${encodeURIComponent(id)}`;
export const quizAppHref = (chapterId: string) => `/rituals/craft/cosmic/quiz?c=${encodeURIComponent(chapterId)}`;
export const lessonSiteHref = (id: string) => `/practice/cosmic/course/?l=${encodeURIComponent(id)}`;
export const quizSiteHref = (chapterId: string) => `/practice/cosmic/course/?quiz=${encodeURIComponent(chapterId)}`;
