import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CRAFT_TOOLS, PSYCHIC_TOOLS } from '../src/lib/craft/practices.ts';

test('every craft tool on My practice opens a route of its own', () => {
  const all = [...Object.values(CRAFT_TOOLS).flat(), ...PSYCHIC_TOOLS];
  assert.ok(all.length > 20);
  for (const tool of all) assert.match(tool.href, /^\/(rituals|grimoire)\//, tool.title);
  assert.equal(new Set(all.map((t) => t.href)).size, all.length);
});
