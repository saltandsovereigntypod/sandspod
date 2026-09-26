import assert from 'node:assert/strict';
import test from 'node:test';

import { buildLibrary } from '../src/lib/library/model.ts';
import type { PracticeRow } from '../src/lib/library/types.ts';
import {
  customIngredient,
  entryForIngredient,
  ingredientFromEntry,
  isCustom,
  pickerMatches,
  togglePick,
} from '../src/lib/rituals/ingredients.ts';
import { journalLinks, templateLinks } from '../src/lib/rituals/rows.ts';
import { buildSpell } from '../src/lib/rituals/spell.ts';
import type { JournalRow } from '../src/lib/rituals/types.ts';

const mine = { entity_id: 'practice/oil/road-opener', name: 'Road Opener Oil', type: 'oil', image: null, my_practice: { Notes: 'My blend' }, community: null, updated_at: null } as PracticeRow;
const library = buildLibrary([mine]);

test('search reaches the whole Library, any type, including your own entries', () => {
  const tools = pickerMatches(library, 'athame');
  assert.ok(tools.entries.some((e) => e.type === 'tool'), 'tools are offered, not only candles, herbs and crystals');
  const own = pickerMatches(library, 'road opener oil');
  assert.equal(own.entries[0]?.name, 'Road Opener Oil');
  assert.equal(own.custom, null, 'an exact Library name is not offered again as your own');
});

test('anything can be typed in as your own', () => {
  const match = pickerMatches(library, '  Grandma’s  thimble ');
  assert.deepEqual(match.custom, { ref: match.custom?.ref, name: 'Grandma’s thimble', type: 'custom' });
  assert.ok(match.custom && isCustom(match.custom));
  assert.equal(customIngredient('   '), null);
});

test('Library ingredients use the website references, so suggestions and search agree', () => {
  const rosemary = library.find((e) => e.name === 'Rosemary');
  assert.ok(rosemary);
  const item = ingredientFromEntry(rosemary);
  assert.equal(item.ref, 'traditional/herb/rosemary');
  assert.equal(entryForIngredient(library, item.ref)?.id, rosemary.id);
  assert.equal(entryForIngredient(library, 'practice/oil/road-opener')?.name, 'Road Opener Oil');
  const once = togglePick([], item);
  assert.equal(once.length, 1);
  assert.deepEqual(togglePick(once, { ...item }), []);
  const thimble = customIngredient('Thimble');
  assert.ok(thimble);
  assert.deepEqual(togglePick([thimble], customIngredient('thimble')!), [], 'the same custom name toggles off');
});

test('custom items go into the spell but are never linked to a Library entry', () => {
  const thimble = customIngredient('Thimble')!;
  const rosemary = ingredientFromEntry(library.find((e) => e.name === 'Rosemary')!);
  const spell = buildSpell({ name: '', intention: null, purpose: '', petition: '', ingredients: [rosemary, thimble], focusMinutes: '' });
  assert.match(spell.preparation, /Thimble/);
  assert.ok(spell.steps.some((s) => s.instructions.includes('Thimble')));
  assert.deepEqual(templateLinks('t1', 'u1', [rosemary, thimble]).map((l) => l.entity_id), ['traditional/herb/rosemary']);
  const journal = { id: 'j1', linked_altar_id: null } as JournalRow;
  assert.deepEqual(journalLinks(journal, 'u1', [thimble, rosemary]).map((l) => l.entity_id), ['traditional/herb/rosemary']);
});
