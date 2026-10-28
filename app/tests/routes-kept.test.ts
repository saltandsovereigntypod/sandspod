import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { CRAFT_TOOLS, MY_CHRONICLE, NEW_LIBRARY_NOTE, WORKINGS_LIBRARY, YOUR_CRAFTS } from '../src/lib/names.ts';

// The Practice / Grimoire reorganisation renamed and moved things. Every old
// route must still open something: notifications, widgets, help, saved links
// and the reading log all use them.
const screen = (href: string) => {
  const base = `src/app/(tabs)${href.replace(/\/$/, '')}`;
  return existsSync(`${base}.tsx`) || existsSync(`${base}/index.tsx`);
};
const src = (path: string) => readFileSync(`src/${path}`, 'utf8');

test('old routes still open', () => {
  for (const href of [
    '/more/library',
    '/more/library/sourcing',
    '/more/library/closed',
    '/more/reminders',
    '/rituals/reminders',
    '/today/reminders',
    '/rituals/craft',
    '/rituals/craft/cosmic/chart',
    '/rituals/divination',
    '/rituals/divination/draw',
    '/rituals/divination/decks',
    '/rituals/premade',
    '/rituals/apothecary',
    '/rituals/planner',
    '/rituals/sigil',
    '/more/journey',
    '/more/settings/practice',
    '/more/settings/book',
    '/grimoire/practice',
    '/grimoire/suggest',
  ]) {
    assert.ok(screen(href), `no screen at ${href}`);
  }
  assert.ok(existsSync('src/app/(tabs)/rituals/divination/[id].tsx'), 'a reading opens by id');
});

test('the new places exist, and More’s Library goes to the Grimoire’s', () => {
  for (const href of ['/grimoire/library', '/grimoire/library/sourcing', '/grimoire/library/closed', '/grimoire/offer', '/rituals/divination/meanings']) {
    assert.ok(screen(href), `no screen at ${href}`);
  }
  assert.ok(existsSync('src/app/(tabs)/more/reading/[id].tsx') && existsSync('src/app/(tabs)/more/dream/[id].tsx'), 'search results open in More');
  assert.match(src('app/(tabs)/more/library/index.tsx'), /<Redirect href="\/grimoire\/library" \/>/);
});

test('the Rituals home is grouped Do / Learn / Record, without Reminders or "Plan a night"', () => {
  const home = src('app/(tabs)/rituals/index.tsx');
  const at = (label: string) => home.indexOf(`<SectionLabel>${label}</SectionLabel>`);
  assert.ok(at('Do') > 0 && at('Do') < at('Learn') && at('Learn') < at('Record'), 'Do, then Learn, then Record');
  assert.doesNotMatch(home, /\/rituals\/reminders|title="Reminders"/);
  assert.doesNotMatch(home, /Plan a night|Divination &amp; sigils/);
  assert.match(home, /<NextWorking now=\{now\} variant="rituals" \/>/);
  // Build a spell and the Sigil maker sit together, and Divination is one row.
  assert.ok(home.indexOf('title="Sigil maker"') - home.indexOf('title="Build a spell"') < 300);
  assert.equal(home.match(/\/rituals\/divination/g)?.length, 1);
  assert.doesNotMatch(src('app/(tabs)/rituals/craft/index.tsx'), /rituals\/journeys/, 'Journeys left the Craft hub');
  assert.match(src('app/(tabs)/today/index.tsx'), /<NextWorking now=\{now\} variant="today" \/>/);
});

test('the names', () => {
  assert.equal(CRAFT_TOOLS, 'Craft tools');
  assert.equal(YOUR_CRAFTS, 'Your crafts');
  assert.equal(WORKINGS_LIBRARY, 'Workings library');
  assert.equal(MY_CHRONICLE, 'My chronicle');
  assert.equal(NEW_LIBRARY_NOTE, 'New Library note');
  const more = src('app/(tabs)/more/index.tsx');
  for (const gone of ["'/more/library'", "'/rituals/craft'", "'/rituals/craft/cosmic/chart'"]) assert.ok(!more.includes(gone), `More no longer lists ${gone}`);
});
