import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildSpell } from '../src/lib/rituals/spell.ts';
import { intentionByKey } from '../src/lib/rituals/planner.ts';
import { draftFromTemplate, validateDraft } from '../src/lib/rituals/lifecycle.ts';
import { templatePayload } from '../src/lib/rituals/rows.ts';
import { premadeById, PREMADE } from '../src/lib/rituals/premade/index.ts';
import { TIMING_INTENTS } from '../src/lib/craft/cosmic/timing.ts';
import {
  blankSpec,
  defaultName,
  intentFromText,
  METHOD_KEYS,
  methodSteps,
  migrateSpec,
  openDraft,
  openTemplate,
  ownedFirst,
  ownedRefs,
  plannerKeyOf,
  premadeMethod,
  specFromParams,
  specFromPremade,
  specSteps,
  specToDraft,
  spellHistory,
  spellIntent,
  SPELL_INTENTS,
  spellSafety,
  spellText,
  starterIngredients,
  substitutesFor,
  suggestDays,
  suggestDeities,
  suggestMaterials,
  WORDS_STARTERS,
  type SpellSpec,
} from '../src/lib/rituals/spellcraft/index.ts';
import type { JournalRow, TemplateRow } from '../src/lib/rituals/types.ts';

const ing = (ref: string, name: string, type: string) => ({ ref, name, type });

test('the builder offers the same intents as the timing advisor, and reads planner keys too', () => {
  assert.deepEqual(SPELL_INTENTS.map((i) => i.key), TIMING_INTENTS.map((i) => i.key));
  assert.equal(spellIntent('prosperity')?.key, 'money');
  assert.equal(spellIntent('money')?.key, 'money');
  assert.equal(plannerKeyOf({ intent: 'money' }), 'prosperity');
  assert.equal(plannerKeyOf({ intent: 'ancestors' }), null);
  for (const i of SPELL_INTENTS) assert.ok(WORDS_STARTERS[i.key], `words for ${i.key}`);
});

test('suggestions come from the Library, never suggest poisonous plants, and fit the planet', () => {
  for (const intent of SPELL_INTENTS) {
    const s = suggestMaterials(intent);
    assert.ok(s.herb.length > 0, `herbs for ${intent.key}`);
    assert.ok(s.crystal.length > 0, `stones for ${intent.key}`);
    for (const x of [...s.herb, ...s.crystal, ...s.candle]) {
      assert.equal(x.danger, false, x.name);
      assert.match(x.ref, /^traditional\/(herb|crystal|candle)\//);
    }
  }
  const love = suggestMaterials(spellIntent('love')!);
  assert.ok(love.herb.some((h) => h.name === 'Rose'));
  assert.ok(love.candle.some((c) => /Pink|Red/.test(c.name)));
  assert.equal(starterIngredients(spellIntent('love')!).length, 4);
});

test('substitutes: herbs from the Library, candles from their alternative colours, stones by clear quartz', () => {
  const basil = substitutesFor('traditional/herb/basil');
  assert.ok(basil.some((s) => s.name === 'Mint' && s.ref === 'traditional/herb/mint'));
  const green = substitutesFor('traditional/candle/green').map((s) => s.name);
  assert.ok(green.includes('Gold Candle') && green.includes('White Candle'));
  assert.deepEqual(substitutesFor('traditional/crystal/amethyst').map((s) => s.name), ['Clear Quartz']);
});

test('deities: planet ties first with their ancient or modern link, then Library domains', () => {
  const love = suggestDeities(spellIntent('love')!);
  assert.equal(love[0].name, 'Aphrodite');
  assert.equal(love[0].link, 'ancient');
  assert.ok(love[0].days.some((d) => d.basis === 'modern'));
  assert.ok(love.some((d) => d.link === 'modern' || d.link === null));
  const days = suggestDays(spellIntent('love')!);
  assert.equal(days[0].day, 'Friday');
});

test('safety: the form, dangerous plants, skin and sourcing', () => {
  const spec: SpellSpec = {
    ...blankSpec('protection', 'oil'),
    ingredients: [ing('traditional/herb/rue', 'Rue', 'herb'), ing('traditional/herb/cinnamon', 'Cinnamon', 'herb')],
  };
  const notes = spellSafety(spec);
  assert.ok(notes.some((n) => n.level === 'danger' && n.ref === 'traditional/herb/rue'));
  assert.ok(notes.some((n) => n.ref === 'traditional/herb/cinnamon'));
  assert.ok(notes.some((n) => /patch test/.test(n.text)));
  const candle = spellSafety({ ...blankSpec('love', 'candle'), ingredients: [] });
  assert.ok(candle.some((n) => /Never leave a flame/.test(n.text)));
});

test('every form gives steps that make a valid ritual, with the words spoken', () => {
  for (const method of METHOD_KEYS) {
    const spec: SpellSpec = {
      ...blankSpec('love', method),
      words: 'Let love come.',
      ingredients: [ing('traditional/herb/rose', 'Rose', 'herb'), ing('traditional/candle/pink', 'Pink Candle', 'candle')],
      deities: [{ key: 'aphrodite', name: 'Aphrodite' }],
    };
    const draft = specToDraft(spec);
    assert.equal(validateDraft(draft), null, method);
    assert.equal(draft.kind, 'spell');
    assert.ok(draft.steps.some((s) => s.spoken_text === 'Let love come.'), method);
    assert.ok(draft.steps.some((s) => /Aphrodite/.test(s.title)), method);
    assert.ok(draft.steps.some((s) => s.completion_mode === 'timed' && s.minutes === '10'), method);
  }
});

test('the candle form keeps the first builder’s steps exactly', () => {
  const ingredients = [ing('traditional/candle/green', 'Green Candle', 'candle'), ing('traditional/herb/basil', 'Basil', 'herb')];
  const old = buildSpell({ name: '', intention: intentionByKey('prosperity'), purpose: 'steady work', petition: 'Let it come.', ingredients, focusMinutes: '10' });
  const spec: SpellSpec = { ...blankSpec('money', 'candle'), purpose: 'steady work', words: 'Let it come.', ingredients };
  assert.deepEqual(methodSteps(spec, 'Money & luck'), old.steps);
});

test('your own steps are kept as they are; null follows the form', () => {
  const spec = { ...blankSpec('love', 'jar') };
  assert.equal(specSteps(spec)[1].title, 'Prepare the jar');
  const own = { ...spec, steps: [{ ...specSteps(spec)[0], title: 'Mine' }] };
  assert.equal(specSteps(own)[0].title, 'Mine');
  assert.equal(specSteps(own).length, 1);
  assert.equal(defaultName(spec), 'Love spell jar');
  assert.equal(defaultName(blankSpec(null, 'candle')), 'My spell');
});

test('a spell saves into the template metadata and opens again unchanged', () => {
  const spec: SpellSpec = {
    ...blankSpec('money', 'jar'),
    words: 'Coin to coin.',
    ingredients: [ing('traditional/herb/basil', 'Basil', 'herb')],
    deities: [{ key: 'lakshmi', name: 'Lakshmi' }],
    planet: 'Jupiter',
    moon: 'waxing',
    notes: 'Keep it by the door.',
  };
  const draft = specToDraft(spec);
  const { template, steps } = templatePayload(draft, { userId: 'u', id: 't1', stepIds: draft.steps.map((_, i) => `s${i}`) });
  assert.equal((template.metadata.spell as SpellSpec).method, 'jar');
  const row: TemplateRow = { ...template, description: null, ritual_template_steps: steps } as TemplateRow;
  const back = openTemplate(row);
  assert.equal(back.method, 'jar');
  assert.equal(back.planet, 'Jupiter');
  assert.equal(back.steps, null);
  assert.deepEqual(back.deities, spec.deities);
  // The template editor keeps the builder's choices.
  assert.ok(draftFromTemplate(row).spell);
  // Steps changed elsewhere come back as your own steps.
  const edited = { ...row, ritual_template_steps: steps.map((s, i) => (i === 0 ? { ...s, title: 'Changed on the website' } : s)) };
  assert.equal(openTemplate(edited).steps?.[0].title, 'Changed on the website');
});

test('older spells (no spell metadata) are read forward without losing a word', () => {
  const ingredients = [ing('traditional/candle/green', 'Green Candle', 'candle'), ing('custom/abc', 'My own oil', 'herb')];
  const old = buildSpell({ name: 'Rent', intention: intentionByKey('prosperity'), purpose: '', petition: 'Pay the rent.', ingredients, focusMinutes: '15' });
  const { template, steps } = templatePayload(old, { userId: 'u', id: 't2', stepIds: old.steps.map((_, i) => `s${i}`) });
  assert.equal(template.metadata.spell, undefined);
  const row = { ...template, description: null, ritual_template_steps: steps } as TemplateRow;
  const spec = openTemplate(row);
  assert.equal(spec.intent, 'money');
  assert.equal(spec.method, 'candle');
  assert.equal(spec.words, 'Pay the rent.');
  assert.equal(spec.focusMinutes, '15');
  assert.equal(spec.name, 'Rent');
  assert.deepEqual(spec.ingredients, ingredients);
  assert.deepEqual(specSteps(spec).map((s) => [s.title, s.instructions, s.spoken_text]), old.steps.map((s) => [s.title, s.instructions, s.spoken_text]));
  // A plan's draft from before, too.
  assert.equal(openDraft(old).words, 'Pay the rent.');
  assert.equal(intentFromText('Prosperity'), 'money');
  assert.equal(intentFromText('Steady work that pays the rent'), null);
});

test('migrateSpec tidies anything stored', () => {
  assert.deepEqual(migrateSpec(null), blankSpec());
  const m = migrateSpec({ method: 'nonsense', moon: 'blue', ingredients: [{ name: 'Salt' }, null, 4], petition: 'old words', steps: 'x' });
  assert.equal(m.method, 'candle');
  assert.equal(m.moon, null);
  assert.equal(m.ingredients[0].ref, 'own/salt');
  assert.equal(m.words, 'old words');
  assert.equal(m.steps, null);
});

test('premade workings adapt into the builder with their own steps', () => {
  const p = PREMADE.find((x) => x.kind === 'spell')!;
  const spec = specFromPremade(p);
  assert.equal(spec.steps?.length, p.steps.length);
  assert.ok(spec.name.includes(p.title));
  assert.ok(premadeById(p.id));
  assert.equal(premadeMethod({ title: 'Honey jar', summary: '' }), 'jar');
  assert.equal(premadeMethod({ title: 'A walk', summary: 'outside' }), 'own');
});

test('links into the builder: intent, Library refs, deity and planet', () => {
  const spec = specFromParams(
    { intention: 'love', add: 'traditional/crystal/rose_quartz,nonsense', deity: 'aphrodite', planet: 'Venus', method: 'sachet' },
    () => [],
    (k) => (k === 'aphrodite' ? 'Aphrodite' : null),
  );
  assert.equal(spec.intent, 'love');
  assert.equal(spec.method, 'sachet');
  assert.deepEqual(spec.ingredients.map((i) => i.name), ['Rose Quartz']);
  assert.deepEqual(spec.deities, [{ key: 'aphrodite', name: 'Aphrodite' }]);
  assert.equal(spec.planet, 'Venus');
});

test('owned things are found and put first', () => {
  const items = [ing('traditional/herb/basil', 'Basil', 'herb'), ing('traditional/crystal/citrine', 'Citrine', 'crystal')];
  const owned = ownedRefs(items, { objects: [], stones: [{ name: 'Citrine' } as never] });
  assert.ok(owned.has('traditional/crystal/citrine'));
  assert.equal(ownedFirst(items, owned)[0].name, 'Citrine');
});

test('history: this spell’s answers and what your look-backs say about its things', () => {
  const entry = (id: string, answer: string | null, template_id = 't1'): JournalRow =>
    ({
      id,
      title: 'Love jar',
      template_id,
      ritual_date: '2026-10-01',
      metadata: { ingredients: [{ name: 'Rose', type: 'herb' }], ...(answer ? { lookBack: { when: 'week', date: '2026-10-08', answer, outcome: '', answeredAt: '2026-10-08' } } : {}) },
      altar_snapshot: {},
      day_of_week: 'Friday',
    }) as unknown as JournalRow;
  const h = spellHistory([entry('a', 'yes'), entry('b', 'no'), entry('c', null), entry('d', 'yes', 'other')], { ingredients: [ing('traditional/herb/rose', 'Rose', 'herb')] }, { templateId: 't1' });
  assert.equal(h.workings.length, 3);
  assert.match(h.line ?? '', /Worked 1 of 2 times/);
  assert.equal(h.materials[0].name, 'Rose');
});

test('the spell prints as plain text', () => {
  const t = spellText({ ...blankSpec('love', 'candle'), words: 'Come.', planet: 'Venus', moon: 'waxing' });
  assert.match(t, /Love spell/);
  assert.match(t, /Waxing moon · Friday \(Venus\)/);
  assert.match(t, /Steps\n1\. Cleanse/);
});
