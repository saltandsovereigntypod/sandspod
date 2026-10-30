// The eclectic Wheel of the Year course set (courses/wheel/), checked to the
// Hellenic set's standard, and kept free of Wiccan theology it must not assume.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkSet, loadSet } from './courseSetChecks.ts';

const modules = await loadSet('wheel');
checkSet('wheel', modules, 'wheel');

test('wheel: honest history is taught (Gardner, Nichols and Kelly) and Wicca is never required', () => {
  const tradition = modules.find((m) => m.id === 'wheel-tradition')!;
  const all = tradition.docs.map((d) => d.body).join('\n');
  for (const name of ['Gardner', 'Nichols', 'Kelly', 'Bede', 'Murray']) assert.match(all, new RegExp(name), name);
  const everything = modules.flatMap((m) => m.docs.map((d) => d.body)).join('\n');
  assert.doesNotMatch(everything, /you must (cast|honour the Goddess)/i);
  assert.match(everything, /southern hemisphere/i);
});
