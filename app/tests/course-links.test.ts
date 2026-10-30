// Course links: a lesson's or step's links into the Sanctuary (courseLinks.ts),
// how they are kept in a copied step's resources, where they open in the app
// and on the website, and that every link any ready-made program carries
// points at something that exists: a holy page, Library entry, closed &
// living traditions entry, ready-made ritual, journey, spread, seasonal
// object, an app route and a website page.

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';

import {
  COURSE_PAGES,
  COVEN_PAGES,
  courseLinkAppHref,
  courseLinkLabel,
  courseLinkMarker,
  courseLinks,
  courseLinkSiteHref,
  holyLinkRef,
  mergeCourseLinks,
  withoutCourseLinks,
  type CourseLink,
} from '../src/lib/covens/courseLinks.ts';
import { copyPlan, linkResources } from '../src/lib/covens/courseCopy.ts';
import { coursePrograms, MODULES, moduleIndex } from '../src/lib/covens/courses/index.ts';
import { LESSON_LINKS } from '../src/lib/covens/courses/links.ts';
import { linkTargetLabel } from '../src/lib/covens/courses/linkTargets.ts';
import { studyLinks, withoutStudyLinks } from '../src/lib/grimoire/coven.ts';

const app = new URL('../src/app/(tabs)/', import.meta.url);
const site = new URL('../../', import.meta.url);

/** The route file an app path opens: a page of its own, a folder's index, or a [param] page. */
function appRouteExists(href: string): boolean {
  const path = href.split('?')[0].replace(/^\//, '').replace(/\/$/, '');
  const parts = path.split('/');
  const tryAt = (dir: URL, rest: string[]): boolean => {
    if (!rest.length) return existsSync(new URL('index.tsx', dir));
    const [head, ...tail] = rest;
    if (!tail.length && existsSync(new URL(`${head}.tsx`, dir))) return true;
    if (existsSync(new URL(`${head}/`, dir)) && tryAt(new URL(`${head}/`, dir), tail)) return true;
    if (!tail.length && existsSync(new URL('[ref].tsx', dir))) return true;
    for (const param of ['[id]', '[entryId]', '[ref]', '[slug]', '[page]']) {
      if (!tail.length && existsSync(new URL(`${param}.tsx`, dir))) return true;
      if (tail.length && existsSync(new URL(`${param}/`, dir)) && tryAt(new URL(`${param}/`, dir), tail)) return true;
    }
    return false;
  };
  return tryAt(app, parts);
}

/** The website page a link opens: its folder holds an index.html. */
const sitePageExists = (href: string) => existsSync(new URL(`${href.split('?')[0].replace(/^\//, '')}index.html`, site));

test('a link is kept in a step’s resources as a marker and read back', () => {
  const link: CourseLink = { kind: 'library', id: 'traditional:herb:rosemary', label: 'Herb: Rosemary' };
  assert.equal(courseLinkMarker(link), '[[go:library:traditional:herb:rosemary|Herb: Rosemary]]');
  const text = `Bring a candle.\n${courseLinkMarker(link)}\n[[book:0b6f7a52-6f7d-4e57-9b0c-1d2e3f4a5b6c|Our Imbolc]]\n${courseLinkMarker({ kind: 'page', id: 'calendar' })}`;
  assert.deepEqual(courseLinks(text), [link, { kind: 'page', id: 'calendar', label: 'Calendars and holy days' }]);
  assert.equal(withoutCourseLinks(withoutStudyLinks(text)), 'Bring a candle.');
  assert.equal(studyLinks(text).length, 1, 'the Book’s own links are untouched');
  assert.equal(courseLinkMarker({ kind: 'premade', id: 'x', label: 'A [weird] | name' }), '[[go:premade:x|A weird name]]');
  assert.deepEqual(courseLinks('[[go:nonsense:x|Y]]'), [], 'unknown kinds are ignored');
  assert.deepEqual(mergeCourseLinks([link], [{ ...link, label: 'Other' }], [{ kind: 'page', id: 'calendar' }]).length, 2);
});

test('where each kind of link opens, in the app and on the website', () => {
  const slugHref = (tab: string) => `/covens/coven/?c=our-coven&tab=${tab}`;
  const cases: [CourseLink, string, string][] = [
    [{ kind: 'holy', id: 'wheel_south/imbolc' }, '/today/holy/wheel-imbolc', '/today/holy/?ref=wheel-imbolc'],
    [{ kind: 'holy', id: 'moon-full' }, '/today/holy/moon-full', '/today/holy/?ref=moon-full'],
    [{ kind: 'library', id: 'traditional:deity:brigid' }, '/more/library/traditional%3Adeity%3Abrigid', '/library/entry/?entity=traditional%2Fdeity%2Fbrigid'],
    [{ kind: 'closed', id: 'initiatory-wicca' }, '/more/library/closed/initiatory-wicca', '/library/closed/?id=initiatory-wicca'],
    [{ kind: 'closed', id: '' }, '/more/library/closed', '/library/closed/'],
    [{ kind: 'premade', id: 'folk-simple-blot' }, '/rituals/premade/folk-simple-blot', '/rituals/premade/?id=folk-simple-blot'],
    [{ kind: 'journey', id: 'deity-brigid' }, '/rituals/journeys/deity-brigid', '/rituals/journeys/?id=deity-brigid'],
    [{ kind: 'spread', id: 'samhain' }, '/rituals/divination/draw?spread=samhain', '/divination/draw/?spread=samhain'],
    [{ kind: 'seasonal', id: 'brigids-cross' }, '/altar', '/altar/'],
    [{ kind: 'page', id: 'cycle' }, '/rituals/cycle', '/rituals/cycle/'],
    [{ kind: 'coven', id: 'ritual-builder' }, '/coven/c/our-coven/ritual/plan', '/covens/coven/?c=our-coven&tab=rituals'],
  ];
  for (const [link, appHref, siteHref] of cases) {
    assert.equal(courseLinkAppHref(link, 'our-coven'), appHref, `${link.kind}:${link.id} in the app`);
    assert.equal(courseLinkSiteHref(link, slugHref), siteHref, `${link.kind}:${link.id} on the website`);
  }
  assert.equal(courseLinkAppHref({ kind: 'coven', id: 'book' }, null), null, 'a coven page needs its coven');
  assert.equal(holyLinkRef('hellenic_monthly/deipnon'), 'hellenic_monthly-deipnon');
  assert.equal(courseLinkLabel({ kind: 'holy', id: 'wheel/samhain' }), 'Holy day: Samhain');
});

test('every Sanctuary page and coven page a course may open exists in the app and on the website', () => {
  for (const [id, p] of Object.entries(COURSE_PAGES)) {
    assert.ok(appRouteExists(p.app), `page ${id}: app route ${p.app}`);
    assert.ok(sitePageExists(p.site), `page ${id}: website ${p.site}`);
  }
  for (const [id, p] of Object.entries(COVEN_PAGES)) assert.ok(appRouteExists(`/coven/c/x/${p.app}`), `coven page ${id}: app route ${p.app}`);
  for (const pattern of ['/today/holy/x', '/more/library/x', '/more/library/closed/x', '/rituals/premade/x', '/rituals/journeys/x', '/rituals/divination/draw']) assert.ok(appRouteExists(pattern), pattern);
  for (const page of ['/today/holy/', '/library/entry/', '/library/closed/', '/rituals/premade/', '/rituals/journeys/', '/divination/draw/', '/altar/']) assert.ok(sitePageExists(page), page);
});

test('the older lessons’ links belong to lessons that exist, and every lesson links somewhere', () => {
  const docs = moduleIndex().docs;
  for (const id of Object.keys(LESSON_LINKS)) assert.ok(docs.has(id), `LESSON_LINKS: no lesson ${id}`);
  const bare = [...docs.values()].filter((d) => !(d.links ?? []).length && !(LESSON_LINKS[d.id] ?? []).length).map((d) => d.id);
  assert.deepEqual(bare, [], 'lessons with no links');
});

test('every link in every lesson and ready-made program points at something that exists', () => {
  const seen = new Set<string>();
  const check = (link: CourseLink, where: string) => {
    const key = `${link.kind}:${link.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    assert.ok(linkTargetLabel(link), `${where}: ${key} doesn’t exist`);
    const appHref = courseLinkAppHref(link, 'our-coven');
    assert.ok(appHref && appRouteExists(appHref), `${where}: ${key} opens no app page (${appHref})`);
    const siteHref = courseLinkSiteHref(link, (tab) => `/covens/coven/?c=our-coven&tab=${tab}`);
    assert.ok(siteHref && sitePageExists(siteHref), `${where}: ${key} opens no website page (${siteHref})`);
  };
  for (const m of MODULES) for (const d of m.docs) for (const l of [...(d.links ?? []), ...(LESSON_LINKS[d.id] ?? [])]) check(l, d.id);
  for (const p of coursePrograms()) for (const s of p.stages) for (const t of s.tasks) for (const l of t.links ?? []) check(l, `${p.id} ${t.title}`);
  assert.ok(seen.size > 150, `${seen.size} distinct link targets`);
});

test('composed steps carry their lessons’ links, named, and their holy day’s page', () => {
  for (const p of coursePrograms()) {
    for (const s of p.stages) {
      for (const t of s.tasks) {
        for (const l of t.links ?? []) assert.ok(l.label, `${p.id} ${t.title}: ${l.kind}:${l.id} is named`);
        if (t.holiday) assert.ok(t.links?.some((l) => l.kind === 'holy' && l.id === t.holiday), `${p.id} ${t.title}: links its holy day`);
        for (const id of t.docs ?? []) {
          const doc = p.docs.find((d) => d.id === id)!;
          for (const l of doc.links ?? []) assert.ok(t.links?.some((x) => x.kind === l.kind && x.id === l.id), `${t.title}: carries ${id}’s ${l.kind}:${l.id}`);
        }
      }
    }
  }
  const lore = coursePrograms().find((p) => p.id === 'wheel_south-initiate')!;
  const imbolc = lore.stages.flatMap((s) => s.tasks).find((t) => t.holiday === 'wheel_south/imbolc')!;
  assert.ok(imbolc, 'the southern Wheel keeps its own days');
  assert.equal(courseLinkAppHref(imbolc.links!.find((l) => l.kind === 'holy')!, 'x'), '/today/holy/wheel-imbolc', 'and opens the shared page');
});

test('a copied step keeps its links within the resources column, and the step reads them back', () => {
  for (const p of coursePrograms()) {
    const plan = copyPlan(p, null);
    plan.stages.forEach((s, i) =>
      s.tasks.forEach((t, j) => {
        const links = p.stages[i].tasks[j].links ?? [];
        if (!links.length) return assert.equal(t.resources, null);
        assert.ok(t.resources && t.resources.length <= 4000, `${p.id} ${t.title}: resources fit`);
        assert.deepEqual(
          courseLinks(t.resources).map((l) => `${l.kind}:${l.id}`),
          links.slice(0, courseLinks(t.resources).length).map((l) => `${l.kind}:${l.id}`),
        );
      }),
    );
  }
  const many = Array.from({ length: 200 }, (_, i): CourseLink => ({ kind: 'premade', id: `ritual-${i}`, label: 'A ready-made ritual with a long name' }));
  assert.ok(linkResources(many)!.length <= 4000);
  assert.equal(linkResources([]), null);
});

test('every tradition with courses offers all five programs, with links on most steps', () => {
  const programs = coursePrograms();
  for (const t of ['hellenic', 'wheel', 'wheel_south', 'wicca']) {
    const mine = programs.filter((p) => p.tradition === t);
    assert.deepEqual(mine.map((p) => p.path), ['seeker', 'devotee', 'initiate', 'elder', 'high-priestess'], t);
    for (const p of mine) {
      assert.deepEqual(p.missing, [], `${p.id} has every module`);
      // Every step with a lesson links somewhere (a test's own step, or "say hello", may not).
      const tasks = p.stages.flatMap((s) => s.tasks).filter((x) => (x.docs ?? []).length);
      const unlinked = tasks.filter((x) => !(x.links ?? []).length).map((x) => x.title);
      assert.deepEqual(unlinked, [], `${p.id}: steps with lessons but no links`);
    }
  }
});
