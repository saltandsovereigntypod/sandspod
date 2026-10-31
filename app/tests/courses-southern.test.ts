import assert from 'node:assert/strict';
import { test } from 'node:test';

import { COURSE_TRADITIONS, coursePrograms, MODULES, traditionPath } from '../src/lib/covens/courses/index.ts';
import { southernModule, southernRenames, southernText } from '../src/lib/covens/courses/southern.ts';
import type { CourseModule } from '../src/lib/covens/courses/types.ts';

test('southern dates come first, the northern kept beside them', () => {
  assert.equal(
    southernText('Yule is kept at the winter solstice, around 21 December in the northern hemisphere (21 June in the south): the longest night.'),
    'Yule is kept at the winter solstice, around 21 June in the southern hemisphere (21 December in the north): the longest night.',
  );
  assert.equal(
    southernText('Samhain, kept on the evening of 31 October in the northern hemisphere (the end of April in the south), is'),
    'Samhain, kept at the end of April in the southern hemisphere (31 October in the north), is',
  );
  assert.equal(
    southernText('kept from the evening of 31 October into 1 November in the northern hemisphere, and from 30 April into 1 May in the south.'),
    'kept from the evening of 30 April into 1 May in the southern hemisphere, and from 31 October into 1 November in the north.',
  );
  assert.equal(southernText('around 21 June in the northern hemisphere and 21 December in the south'), 'around 21 December in the southern hemisphere and 21 June in the north');
  assert.equal(southernText('Samhain: the turn of October into November (late April into May in the south)'), 'Samhain: late April into May (the turn of October into November in the north)');
  assert.equal(southernText('Walk sunwise (clockwise in the northern hemisphere).'), 'Walk sunwise (clockwise in the northern hemisphere).', 'only dates are turned round');
});

test('a southern module: its own ids where the words change, the southern Wheel’s days, the rest untouched', () => {
  const m: CourseModule = {
    id: 'wicca-lore',
    title: 'Lore',
    docs: [
      { id: 'wicca-lore-yule', title: 'Yule', summary: 's', minutes: 5, body: 'Yule, around 21 December in the northern hemisphere (21 June in the south).' },
      { id: 'wicca-lore-plain', title: 'Plain', summary: 's', minutes: 5, body: 'Nothing about dates.' },
    ],
    quizzes: [],
    stages: [{ title: 'S', intro: '', passed_by: 'self', tasks: [{ title: 'Keep Yule', kind: 'ritual', instructions: 'Keep it.', times: 1, response: 'none', checked_by: 'self', holiday: 'wheel/yule', docs: ['wicca-lore-yule', 'wicca-lore-plain', 'wheel-lore-yule'] }] }],
  };
  const renamed = new Map([...southernRenames([m], 'wicca', 'wicca_south'), ['wheel-lore-yule', 'wheel_south-lore-yule']]);
  const south = southernModule(m, 'wicca', 'wicca_south', renamed);
  assert.equal(south.id, 'wicca_south-lore');
  assert.deepEqual(south.docs.map((d) => d.id), ['wicca_south-lore-yule', 'wicca-lore-plain']);
  assert.match(south.docs[0].body, /21 June in the southern hemisphere/);
  assert.equal(south.docs[1], m.docs[1], 'unchanged lessons are shared');
  assert.equal(south.stages[0].tasks[0].holiday, 'wheel_south/yule');
  assert.deepEqual(south.stages[0].tasks[0].docs, ['wicca_south-lore-yule', 'wicca-lore-plain', 'wheel_south-lore-yule']);
});

test('Wicca has a southern set beside the southern Wheel, and every lesson a step names exists', () => {
  assert.ok(COURSE_TRADITIONS.some((t) => t.id === 'wicca_south'));
  const north = traditionPath('wicca');
  const south = traditionPath('wicca_south');
  assert.equal(south.length, north.length);
  assert.ok(south.every((p) => p.missing.length === 0), 'every module written');
  const tasks = south.flatMap((p) => p.stages.flatMap((s) => s.tasks));
  assert.ok(tasks.some((t) => t.holiday?.startsWith('wheel_south/')));
  assert.ok(!tasks.some((t) => t.holiday?.startsWith('wheel/')), 'no northern days in the southern set');
  const text = JSON.stringify(south);
  assert.match(text, /in the southern hemisphere \(31 October in the north\)/);
  assert.doesNotMatch(text, /in the northern hemisphere \(the end of April in the south\)/);
  // The southern Wheel reads the same way now.
  assert.doesNotMatch(JSON.stringify(traditionPath('wheel_south')), /\d+ \w+ in the northern hemisphere and [^.]* in the south/);
  // Lesson and test ids stay unique across every module.
  const docIds = new Map<string, string>();
  for (const m of MODULES) for (const d of m.docs) {
    const seen = docIds.get(d.id);
    assert.ok(!seen || seen === d.body, `${d.id} has one text`);
    docIds.set(d.id, d.body);
  }
  for (const p of coursePrograms()) for (const s of p.stages) for (const t of s.tasks) for (const id of t.docs ?? []) assert.ok(p.docs.some((d) => d.id === id), `${p.id}: ${id}`);
  // The northern set is untouched.
  assert.ok(north.flatMap((p) => p.stages.flatMap((s) => s.tasks)).some((t) => t.holiday?.startsWith('wheel/')));
});
