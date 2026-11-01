import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { JOURNEY_CATALOG } from '../src/lib/journeys/catalog.ts';
import { JOURNEYS } from '../src/lib/journeys/registry.ts';

// The app fetches each journey's text from js/core/journeys/<id>.json (lib/journeys/texts.ts);
// scripts/build-core.mjs writes them. They must be there, and current.
test('every journey has its text on the website, as built from the registry', () => {
  assert.equal(JOURNEY_CATALOG.length, JOURNEYS.length);
  for (const j of JOURNEYS) {
    const file = new URL(`../../js/core/journeys/${j.id}.json`, import.meta.url);
    assert.ok(existsSync(file), `${j.id}.json is missing: run node scripts/build-core.mjs`);
    assert.equal(readFileSync(file, 'utf8'), JSON.stringify(j), `${j.id}.json is out of date: run node scripts/build-core.mjs`);
  }
});

// Importing either would put megabytes back into the app's bundle.
test('the app loads journey texts and the cities list on demand', () => {
  const texts = readFileSync(new URL('../src/lib/journeys/texts.ts', import.meta.url), 'utf8');
  const places = readFileSync(new URL('../src/lib/astro/placesData.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(texts, /from '\.\/(registry|index)(\.ts)?'/);
  assert.doesNotMatch(places, /require\(|cities\.json'\)/);
});
