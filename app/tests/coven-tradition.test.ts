import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { calendarsForSettings } from '../src/lib/calendars/index.ts';
import { chooser } from '../src/lib/covens/courseCopy.ts';
import { COURSE_TRADITIONS, traditionPath } from '../src/lib/covens/courses/index.ts';
import type { CourseModule } from '../src/lib/covens/courses/types.ts';
import { calendarsForTradition, COVEN_TRADITIONS, covenTraditionName, covenTraditionOf, matchingFirst, pathsForCovens, pathsForTradition } from '../src/lib/covens/covenTradition.ts';
import { CALENDAR_TRADITIONS } from '../src/lib/covens/programs.ts';
import { TRADITIONS } from '../src/lib/holidays.ts';
import { fitScore, forYou, forYouContext, PREMADE } from '../src/lib/rituals/premade/index.ts';
import { PATH_TRADITIONS } from '../src/lib/library/traditions.ts';

test('the coven’s tradition: one of the course sets, read safely', () => {
  assert.deepEqual(COVEN_TRADITIONS.map((t) => t.id), COURSE_TRADITIONS.map((t) => t.id), 'the same list as the course sets');
  assert.equal(covenTraditionOf('norse'), 'norse');
  assert.equal(covenTraditionOf('wicca_south'), 'wicca_south');
  assert.equal(covenTraditionOf('druid'), null);
  assert.equal(covenTraditionOf(3), null);
  assert.equal(covenTraditionName('wheel'), 'Eclectic (Wheel of the Year)');
  assert.equal(covenTraditionName('wicca'), 'Wiccan');
  assert.equal(covenTraditionName(null), '');
  // Every calendar and path it points to exists.
  for (const t of COVEN_TRADITIONS) {
    for (const c of calendarsForTradition(t.id)) assert.ok(TRADITIONS.some((x) => x.id === c), `${t.id}: calendar ${c}`);
    for (const p of pathsForTradition(t.id)) assert.ok(PATH_TRADITIONS.some((x) => x.id === p), `${t.id}: path ${p}`);
    assert.ok(pathsForTradition(t.id).length, `${t.id} has a path`);
  }
  assert.deepEqual(calendarsForTradition('wicca_south'), ['wheel_south']);
  assert.deepEqual(pathsForCovens(['wicca', 'wheel', null, 'nonsense']), ['wicca', 'wheel']);
  assert.deepEqual(matchingFirst([1, 2, 3, 4], (n) => n % 2 === 0), [2, 4, 1, 3]);
});

test('the coven’s course set comes first in the chooser, then its calendars’', () => {
  const mod = (id: string): CourseModule => ({ id, title: id, docs: [], quizzes: [], stages: [{ title: 's', intro: '', passed_by: 'self', tasks: [{ title: 't', kind: 'study', instructions: '', times: 1, response: 'none', checked_by: 'self' }] }] });
  const modules = ['core-seeker', 'norse-seeker', 'hellenic-seeker', 'celtic-seeker'].map(mod);
  const courses = ['norse', 'hellenic', 'celtic'].flatMap((t) => traditionPath(t, modules));
  const none = chooser(courses, [], { practice_traditions: ['hellenic'] });
  assert.deepEqual(none.paths.map((p) => [p.tradition, p.suggested]), [['hellenic', true], ['celtic', false], ['norse', false]]);
  const norse = chooser(courses, [], { practice_traditions: ['hellenic'], course_tradition: 'norse' });
  assert.deepEqual(norse.paths.map((p) => [p.tradition, p.suggested]), [['norse', true], ['hellenic', true], ['celtic', false]]);
  const unknown = chooser(courses, [], { practice_traditions: [], course_tradition: 'druid' });
  assert.ok(unknown.paths.every((p) => !p.suggested), 'an unknown tradition suggests nothing');
});

test('members: their coven’s premade workings and calendars come after their own path’s', () => {
  const now = new Date(2026, 9, 31, 21);
  const sumbel = PREMADE.find((p) => p.id === 'folk-sumbel')!;
  const plain = forYouContext({ my_practice: 'folk' }, now);
  const coven = forYouContext({ my_practice: 'folk' }, now, ['norse']);
  assert.deepEqual(coven.covenPaths, ['norse']);
  assert.equal(plain.covenPaths, undefined);
  assert.ok(fitScore(sumbel, coven) > fitScore(sumbel, plain), 'a Norse coven lifts the Norse workings');
  assert.ok(forYou(coven, PREMADE, 40).some((p) => p.paths.includes('norse')));
  // Calendars: your path's first, then your covens'.
  const list = calendarsForSettings({}, [], ['hellenic']);
  assert.equal(list[0].path, 'hellenic');
  const both = calendarsForSettings({}, ['roman'], ['hellenic']);
  assert.equal(both[0].path, 'roman');
  assert.ok(both.findIndex((c) => c.path === 'hellenic') < both.findIndex((c) => !c.path || !['roman', 'hellenic'].includes(c.path)));
  // The practice calendar's holiday calendars that suit the coven first.
  const ordered = matchingFirst(CALENDAR_TRADITIONS, (t) => calendarsForTradition('norse').includes(t.id));
  assert.equal(ordered[0].id, 'norse');
});

test('the coven’s tradition: a migration with one nullable column, no foreign key, and both clients read it safely', () => {
  const sql = readFileSync('../supabase/migrations/20261119000000_coven_tradition.sql', 'utf8');
  assert.match(sql, /add column if not exists course_tradition text;/);
  assert.doesNotMatch(sql.replace(/--.*$/gm, ''), /references|foreign key/i);
  const api = readFileSync('src/lib/covens/api.ts', 'utf8');
  assert.match(api, /fetchCovenTradition[\s\S]*if \(error \|\| !data\) return null;/, 'missing column reads as unset');
  assert.doesNotMatch(api.match(/const COVEN_FIELDS =[^;]*;/)![0], /course_tradition/, 'not in the coven select, which would fail before the migration');
  const site = readFileSync('../covens/coven-data.js', 'utf8');
  assert.match(site, /fetchCovenTradition\(id\)[\s\S]*if \(error \|\| !data\) return null;/);
  assert.match(readFileSync('../covens/coven/index.html', 'utf8'), /\/covens\/coven\/tradition\.js/);
  assert.match(readFileSync('../covens/coven/manage.js', 'utf8'), /CovenTradition\?\.form\(/);
  assert.match(readFileSync('../covens/coven/course.js', 'utf8'), /course_tradition: tradition/);
  for (const page of ['../rituals/premade/index.html', '../today/index.html']) assert.match(readFileSync(page, 'utf8'), /\/js\/coven-paths\.js/, page);
  assert.match(readFileSync('../js/settings-view.js', 'utf8'), /\/js\/coven-paths\.js/);
});
