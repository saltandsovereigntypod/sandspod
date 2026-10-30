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
  // The tools that aren't rituals moved to Craft; Rituals points there once.
  for (const tool of ['/rituals/divination', '/rituals/cycle', '/rituals/sigil', '/rituals/craft/cosmic', 'CRAFT_TOOLS']) {
    assert.ok(!home.includes(tool), `${tool} is on the Craft home now`);
  }
  assert.equal(home.match(/'\/rituals\/craft'/g)?.length, 1);
  assert.match(home, /title="Dedication journeys"/, 'Dedication journeys stay under Rituals');
  assert.match(home, /\/rituals\/premade/);
  assert.match(home, /\/rituals\/community/);
  assert.match(home, /\/rituals\/spell/);
  assert.match(src('app/(tabs)/today/index.tsx'), /<NextWorking now=\{now\} variant="today" \/>/);
});

test('the Craft home (Practice → Craft) holds the tools that aren’t rituals, at their old addresses', () => {
  const craft = src('app/(tabs)/rituals/craft/index.tsx');
  assert.match(craft, /<PracticeSwitch current="craft" \/>/);
  assert.match(src('app/(tabs)/rituals/index.tsx'), /<PracticeSwitch current="rituals" \/>/);
  const at = (label: string) => craft.indexOf(`<SectionLabel>${label}</SectionLabel>`);
  assert.ok(at('Body & moon') > 0 && at('Body & moon') < at('The sky') && at('The sky') < at('Divination & sigils'), 'Body & moon, The sky, then Divination & sigils');
  assert.ok(craft.indexOf('by path') > at('Divination & sigils'), 'then the Craft tools by path');
  for (const href of ['/rituals/cycle', '/rituals/craft/cosmic', '/rituals/craft/cosmic/hours', '/rituals/craft/cosmic/learn', '/rituals/divination', '/rituals/divination/draw', '/rituals/divination/meanings', '/rituals/sigil', '/rituals/settings/practice']) {
    assert.ok(craft.includes(`'${href}'`), `Craft opens ${href}`);
    // Settings pages open through rituals/settings/[page].
    assert.ok(screen(href) || href.startsWith('/rituals/settings/'), `no screen at ${href}`);
  }
  // Dedication journeys stay under Rituals; Craft only points to them.
  assert.match(craft, /title="Dedication journeys"\s+detail="On Rituals/);
  assert.match(src('app/(tabs)/rituals/craft/solitary/index.tsx'), /\/rituals\/journeys/);
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
