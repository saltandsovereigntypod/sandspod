import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { asPracticeSection, CRAFT_HOME_ROUTE, PRACTICE_SECTIONS, practiceSectionOf, practiceTabRoute } from '../src/lib/practiceSections.ts';

test('Practice has three sections: Grimoire, Rituals and Craft', () => {
  assert.deepEqual(
    PRACTICE_SECTIONS.map((s) => [s.key, s.label, s.href]),
    [
      ['grimoire', 'Grimoire', '/grimoire'],
      ['rituals', 'Rituals', '/rituals'],
      ['craft', 'Craft', '/rituals/craft'],
    ],
  );
  assert.equal(CRAFT_HOME_ROUTE, 'craft/index');
  assert.equal(practiceTabRoute('grimoire'), 'grimoire');
  assert.equal(practiceTabRoute('rituals'), 'rituals');
  assert.equal(practiceTabRoute('craft'), 'rituals', 'Craft lives in the Rituals stack, so its old addresses keep working');
});

test('a Rituals-stack screen is Craft when it is a tool, Rituals when it is ritual work', () => {
  for (const screen of ['craft/index', 'craft/cosmic/index', 'craft/cosmic/chart', 'craft/green/plant/[id]', 'cycle/index', 'cycle/log', 'divination/index', 'divination/draw', 'divination/[id]', 'sigil', '/rituals/cycle/log', '/rituals/craft/cosmic?tab=transits']) {
    assert.equal(practiceSectionOf('rituals', screen), 'craft', screen);
  }
  for (const screen of ['index', undefined, null, '', 'planner', 'spell', 'premade/index', 'premade/[id]', 'community/index', 'journeys/index', 'journeys/patron', 'journal/index', 'journal/insights', 'apothecary/index', 'templates/index', 'run', '/rituals/premade']) {
    assert.equal(practiceSectionOf('rituals', screen), 'rituals', String(screen));
  }
  assert.equal(practiceSectionOf('grimoire', 'dreams/index'), 'grimoire');
  assert.equal(practiceSectionOf('today', 'index'), null);
  assert.equal(practiceSectionOf(undefined), null);
});

test('a remembered section is read back only if it is one of the three', () => {
  assert.equal(asPracticeSection('craft'), 'craft');
  assert.equal(asPracticeSection('rituals'), 'rituals');
  assert.equal(asPracticeSection('grimoire'), 'grimoire');
  assert.equal(asPracticeSection('practice'), null);
  assert.equal(asPracticeSection(null), null);
});

test('the website sorts its pages the same way, under the same key', () => {
  const nav = readFileSync('../js/site-nav.js', 'utf8');
  assert.match(nav, /\{ key: "craft", label: "Craft", href: "\/practice\/" \}/);
  assert.match(nav, /PRACTICE_KEY = "saltPracticeSection"/);
  assert.match(readFileSync('src/lib/practiceSection.ts', 'utf8'), /KEY = 'saltPracticeSection'/);
});
