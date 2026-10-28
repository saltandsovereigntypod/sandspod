import assert from 'node:assert/strict';
import { test } from 'node:test';

import { itemIndex, searchItems } from '../src/lib/altar/itemIndex.ts';

const found = (q: string) => searchItems(itemIndex(), q, { limit: 400 });

test('the cabinet finds things by what they are for, not just their names', () => {
  const heal = found('heal');
  assert.ok(heal.length > 20);
  for (const cat of ['herbs', 'crystals', 'deities']) assert.ok(heal.some((e) => e.category === cat), `heal finds ${cat}`);
  const ancestors = found('ancestors').map((e) => e.label);
  assert.ok(ancestors.some((l) => /Hel Statue|Anubis Statue/.test(l)));
});

test('letters inside a name count less than what a thing is for', () => {
  const love = found('love');
  const clove = love.findIndex((e) => /^Clove/.test(e.label));
  const rose = love.findIndex((e) => /^Rose/.test(e.label));
  assert.ok(rose >= 0 && (clove === -1 || rose < clove));
});
