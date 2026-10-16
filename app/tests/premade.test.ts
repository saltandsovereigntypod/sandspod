import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TRADITIONS } from '../src/lib/holidays.ts';
import { TRADITIONAL_LIBRARY } from '../src/lib/library/traditionalData.ts';
import { PATH_TRADITIONS } from '../src/lib/library/traditions.ts';
import { INTENTIONS } from '../src/lib/rituals/planner.ts';
import {
  filterPremade,
  fitScore,
  forYou,
  myPractices,
  practicesValue,
  PRACTICES,
  PREMADE,
  premadeById,
  premadeDraft,
  type ForYouContext,
} from '../src/lib/rituals/premade/index.ts';

const library = TRADITIONAL_LIBRARY as unknown as Record<string, Record<string, unknown>>;
const holidayIds = new Set(TRADITIONS.flatMap((t) => t.holidays.map((h) => h.id)));
const practiceIds = new Set(PRACTICES.map((p) => p.id));
const pathIds = new Set(PATH_TRADITIONS.map((p) => p.id));
const intentionKeys = new Set(INTENTIONS.map((i) => i.key));

test('every premade working has a unique, stable id and the fields the screens show', () => {
  const ids = new Set<string>();
  for (const p of PREMADE) {
    assert.match(p.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, p.id);
    assert.ok(!ids.has(p.id), `duplicate ${p.id}`);
    ids.add(p.id);
    for (const field of ['title', 'summary', 'preparation', 'closing', 'lore'] as const) assert.ok(p[field].trim(), `${p.id} ${field}`);
    assert.ok(p.steps.length >= 3, `${p.id} steps`);
    for (const s of p.steps) {
      assert.ok(s.title && s.instructions, `${p.id} step`);
      if (s.timed) assert.ok(s.minutes, `${p.id} timed step needs minutes`);
    }
    assert.ok(p.minutes > 0 && p.minutes <= 600, `${p.id} minutes`);
  }
  assert.ok(PREMADE.length >= 150);
});

test('tags point at real practices, paths, intentions, holidays and Library entries', () => {
  for (const p of PREMADE) {
    assert.ok(p.practices.length, `${p.id} practice`);
    for (const id of p.practices) assert.ok(practiceIds.has(id), `${p.id} practice ${id}`);
    for (const id of p.paths) assert.ok(pathIds.has(id), `${p.id} path ${id}`);
    if (p.intention) assert.ok(intentionKeys.has(p.intention), `${p.id} intention`);
    for (const id of p.alsoFor ?? []) assert.ok(intentionKeys.has(id), `${p.id} alsoFor ${id}`);
    for (const id of p.holidays ?? []) assert.ok(holidayIds.has(id), `${p.id} holiday ${id}`);
    for (const item of p.ingredients) {
      if (!item.ref) continue;
      const [prefix, type, key] = item.ref.split('/');
      assert.equal(prefix, 'traditional', item.ref);
      assert.ok(library[type]?.[key], `${p.id} unknown ref ${item.ref}`);
    }
  }
});

test('anything with a flame carries a safety note', () => {
  for (const p of PREMADE) {
    const flame = p.ingredients.some((i) => /candle|tea.?light|taper|incense|lamp|diya|charcoal/i.test(i.name));
    if (flame) assert.ok(p.safety?.trim(), `${p.id} needs safety`);
  }
});

test('every practice and every intention has workings', () => {
  for (const practice of PRACTICES) assert.ok(PREMADE.filter((p) => p.practices.includes(practice.id)).length >= 6, practice.id);
  for (const intention of INTENTIONS) assert.ok(filterPremade(PREMADE, { intention: intention.key }).length >= 3, intention.key);
  for (const sabbat of ['samhain', 'yule', 'imbolc', 'ostara', 'beltane', 'litha', 'lammas', 'mabon'])
    assert.ok(PREMADE.some((p) => p.paths.includes('wicca') && p.holidays?.includes(sabbat)), sabbat);
});

test('a premade working becomes a template draft with timers, flame actions and Library ingredients', () => {
  const p = PREMADE.find((x) => x.steps.some((s) => s.light) && x.steps.some((s) => s.timed))!;
  const draft = premadeDraft(p);
  assert.equal(draft.title, p.title);
  assert.equal(draft.steps.length, p.steps.length);
  const lit = draft.steps[p.steps.findIndex((s) => s.light)];
  assert.deepEqual(lit.actions[0], { type: 'light_all', when: 'start' });
  const timed = draft.steps[p.steps.findIndex((s) => s.timed)];
  assert.equal(timed.completion_mode, 'timed');
  assert.ok(Number(timed.minutes) > 0);
  assert.ok(draft.preparation.startsWith('Gather '));
  assert.ok(draft.ingredients.every((i) => i.ref.startsWith('traditional/')));
  assert.equal(new Set(draft.ingredients.map((i) => i.ref)).size, draft.ingredients.length);
});

test('My practice reads and writes a comma list in the practices’ order', () => {
  assert.deepEqual(myPractices({ my_practice: 'sea, green,nonsense' }), ['green', 'sea']);
  assert.deepEqual(myPractices(null), []);
  assert.equal(practicesValue(['sea', 'green']), 'green,sea');
});

test('For you puts a coming sabbat and your practice first, and keeps other paths back', () => {
  const ctx: ForYouContext = { practices: ['kitchen'], paths: ['wicca'], moon: ['waning'], weekday: 5, holidays: ['samhain'] };
  const picks = forYou(ctx);
  assert.ok(picks.length > 0 && picks.length <= 6);
  assert.ok(picks[0].holidays?.includes('samhain'), picks[0].id);
  const norse = PREMADE.find((p) => p.paths.length === 1 && p.paths[0] === 'norse')!;
  assert.ok(fitScore(norse, ctx) < fitScore(picks[0], ctx));
  // A sabbat far off doesn't push itself forward.
  const yule = PREMADE.find((p) => p.paths.includes('wicca') && p.holidays?.includes('yule'))!;
  assert.ok(!picks.includes(yule));
});

test('search and filters narrow the book', () => {
  const kitchen = filterPremade(PREMADE, { practice: 'kitchen', kind: 'spell' });
  assert.ok(kitchen.length && kitchen.every((p) => p.practices.includes('kitchen') && p.kind === 'spell'));
  assert.ok(filterPremade(PREMADE, { query: 'moon water' }).length >= 1);
  assert.equal(filterPremade(PREMADE, { query: 'zzzz-nothing' }).length, 0);
  assert.equal(premadeById(PREMADE[0].id), PREMADE[0]);
  assert.equal(premadeById('nope'), null);
});
