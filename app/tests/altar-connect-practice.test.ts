import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { ancestorOf, ancestorPanel, ancestorRite, memorialObject, refreshMemorial, shrineChoices } from '../src/lib/altar/connect/ancestor.ts';
import { checkIngredients, foundWords, haveLine, premadeNeeds, templateNeeds } from '../src/lib/altar/connect/ingredients.ts';
import {
  careWarnings,
  drawnOf,
  plantIdOf,
  plantObject,
  readingIdOf,
  readingObject,
  stoneCareFromAltar,
  stoneIdOf,
  stoneObject,
  stonePanel,
  tonightsReading,
} from '../src/lib/altar/connect/practice.ts';
import { parseLivingState } from '../src/lib/altar/livingState.ts';
import { normalizeApothecary } from '../src/lib/altar/apothecary.ts';
import type { AncestorEntry } from '../src/lib/craft/hedge/ancestors.ts';
import { blankReading, type Reading } from '../src/lib/craft/hedge/readings.ts';
import type { Stone } from '../src/lib/craft/crystal/stones.ts';
import type { Plant } from '../src/lib/craft/green/garden.ts';
import { PREMADE } from '../src/lib/rituals/premade/index.ts';
import type { Premade } from '../src/lib/rituals/premade/types.ts';

const NOW = new Date(2026, 9, 16, 21);
const iso = NOW.toISOString();

const grandma: AncestorEntry = {
  id: 'anc-1',
  createdAt: iso,
  data: { name: 'Margaret', relation: 'grandmother', born: { year: 1932, month: 10, day: 18 }, died: { year: 2019, month: 3, day: 2 }, loved: 'strong tea and marigolds', memory: 'Shelling peas on the back step.' },
};

test('an ancestor goes on the altar as a named memorial candle', () => {
  const candle = memorialObject(grandma, [], iso, { color: 'purple', form: 'vigil' });
  assert.equal(candle.type, 'candle');
  assert.equal(candle.color, 'purple');
  assert.equal(candle.form, 'vigil');
  assert.equal(candle.label, 'Candle for Margaret');
  assert.deepEqual(ancestorOf(candle), { id: 'anc-1', name: 'Margaret' });
  assert.ok(candle.imagePath);
  const fallback = memorialObject(grandma, [], iso, { color: 'nonsense', form: 'nope' });
  assert.equal(fallback.color, 'white');
  assert.equal(fallback.form, 'tea-light');

  const renamed = refreshMemorial(candle, { ...grandma, data: { ...grandma.data, name: 'Maggie' } }, iso);
  assert.equal(renamed.label, 'Candle for Maggie');
  assert.equal(refreshMemorial(renamed, { ...grandma, data: { ...grandma.data, name: 'Maggie' } }, iso), renamed);

  const choices = shrineChoices([grandma, { ...grandma, id: 'anc-2', data: { ...grandma.data, name: 'Albert' } }], [candle]);
  assert.equal(choices[0].entry.id, 'anc-2');
  assert.equal(choices[1].placed, true);
});

test('the memorial panel shows their days, what they loved and a memory', () => {
  const panel = ancestorPanel(grandma, NOW);
  assert.equal(panel.lifespan, '1932–2019');
  assert.equal(panel.days[0].kind, 'birth');
  assert.equal(panel.days[0].inDays, 2);
  assert.equal(panel.days[0].when, 'In 2 days');
  assert.match(panel.days[0].words, /94/);
  assert.equal(panel.loved, 'strong tea and marigolds');
  assert.equal(panel.today, null);
  const rite = ancestorRite(grandma, 'altar-1');
  assert.equal(rite.linked_altar_id, 'altar-1');
  assert.match(rite.title, /Margaret/);
});

const stone = (data: Partial<Stone>): Stone => ({ name: 'Stone', form: 'tumbled', intentions: [], care: [], ...data });

test('a stone from the collection becomes a crystal linked by its id', () => {
  const rq = stoneObject({ id: 'st-1', createdAt: iso, data: stone({ key: 'rose_quartz', name: 'My rose quartz', form: 'point' }) }, [], iso);
  assert.equal(rq.type, 'crystal');
  assert.equal(rq.crystal, 'rose_quartz');
  assert.equal(rq.form, 'point');
  assert.equal(rq.label, 'My rose quartz');
  assert.equal(stoneIdOf(rq), 'st-1');
  const typed = stoneObject({ id: 'st-2', createdAt: iso, data: stone({ name: 'Tigers eye from Whitby' }) }, [], iso);
  assert.equal(typed.crystal, 'tiger_eye');
  const unknown = stoneObject({ id: 'st-3', createdAt: iso, data: stone({ name: 'Pebble from the beach' }) }, [], iso);
  assert.equal(unknown.crystal, 'clear_quartz');
  assert.equal(unknown.label, 'Pebble from the beach');
});

test('stone care shows its status, and an altar cleansing joins its log once', () => {
  const s = stone({ key: 'selenite', name: 'Selenite wand' });
  const panel = stonePanel(s, { kind: 'days', days: 30 }, NOW);
  assert.equal(panel.due, true);
  assert.ok(panel.badges.some((b) => /Water/.test(b)));
  const cleansed = stoneCareFromAltar(s, { kind: 'cleansed', at: iso, methods: ['Moonlight', 'Sound'], altarName: 'Hearth' }, 'c1');
  assert.equal(cleansed.care.length, 1);
  assert.equal(cleansed.care[0].method, 'Moonlight, Sound');
  assert.match(cleansed.care[0].note ?? '', /Hearth/);
  assert.equal(stoneCareFromAltar(cleansed, { kind: 'cleansed', at: iso, methods: ['Sound'] }).care.length, 1);
  assert.equal(stonePanel(cleansed, { kind: 'days', days: 30 }, NOW).due, false);
  assert.ok(careWarnings(s, ['Running water']).length > 0);
});

test('a garden plant becomes a sprig of its herb, or a symbol when it has no picture', () => {
  const plant: Plant = { name: 'Rosemary by the door', herb: 'rosemary', place: 'front step', notes: '', events: [] };
  const sprig = plantObject({ id: 'p1', createdAt: iso, data: plant }, [], iso);
  assert.equal(sprig.type, 'herb');
  assert.equal(sprig.herb, 'rosemary');
  assert.equal(sprig.form, 'sprig');
  assert.equal(sprig.label, 'Rosemary by the door');
  assert.equal(plantIdOf(sprig), 'p1');
  const odd = plantObject({ id: 'p2', createdAt: iso, data: { ...plant, name: 'Sweet pea', herb: null } }, [], iso);
  assert.equal(odd.imagePath, '');
  assert.equal(odd.fallbackSymbol, '❦');
  assert.ok(parseLivingState(odd));
});

test('tonight’s card or rune goes on the altar as a small named tool', () => {
  const reading = (date: string, method: Reading['method'], drawn: string[]): { id: string; createdAt: string; data: Reading } => ({ id: `${date}-${method}`, createdAt: iso, data: { ...blankReading(NOW), date, method, drawn } });
  const list = [reading('2026-10-10', 'runes', ['Algiz']), reading('2026-10-16', 'tarot', ['The Star', 'Three of Cups'])];
  const tonight = tonightsReading(list, NOW)!;
  assert.equal(tonight.data.method, 'tarot');
  const card = readingObject(tonight, 'The Star', [], iso);
  assert.equal(card.type, 'tool');
  assert.equal(card.tool, 'tarot-deck');
  assert.equal(card.label, 'The Star');
  assert.equal(drawnOf(card), 'The Star');
  assert.equal(readingIdOf(card), tonight.id);
  const rune = readingObject(list[0], 'Algiz', [], iso);
  assert.equal(rune.imagePath, '');
  assert.equal(rune.fallbackSymbol, 'ᛉ');
  assert.equal(tonightsReading([], NOW), null);
});

const placeFrom = (id: string, form?: string) => {
  const item = builtInCabinet.find((i) => i.id === id)!;
  return objectFromForm(item, form ? item.forms.find((f) => f.form === form)! : item.forms.find((f) => !!f.image)!, [], iso);
};

test('ingredient checks find things on the altar, in the apothecary, stones and garden', () => {
  const working: Pick<Premade, 'ingredients'> = {
    ingredients: [
      { name: 'A white candle', ref: 'traditional/candle/white' },
      { name: 'A sprig of rosemary', ref: 'traditional/herb/rosemary' },
      { name: 'A moonstone', ref: 'traditional/crystal/moonstone' },
      { name: 'Bay leaves', ref: 'traditional/herb/bay' },
      { name: 'Moon water' },
      { name: 'A chalice', ref: 'traditional/tool/chalice' },
      { name: 'A notebook and pen' },
      { name: 'Lavender', ref: 'traditional/herb/lavender', optional: true },
    ],
  };
  const result = checkIngredients(premadeNeeds(working), {
    objects: [placeFrom('candles:white-candle', 'taper'), placeFrom('herbs:rosemary', 'loose')],
    apothecary: [normalizeApothecary({ id: 'a1', name: 'Full moon water', type: 'oil-tincture', ingredients: [{ label: 'Bay leaf' }] })],
    stones: [stone({ key: 'moonstone', name: 'Moonstone' })],
    plants: [{ name: 'Lavender bush', herb: 'lavender', place: '', notes: '', events: [] }],
  });
  assert.equal(result.total, 7);
  assert.deepEqual(result.have.map((h) => h.name), ['A white candle', 'A sprig of rosemary', 'A moonstone', 'Moon water']);
  assert.equal(result.haveCount, 4);
  assert.equal(result.line, 'You have 4 of the 7.');
  assert.deepEqual(result.missing.map((m) => m.name), ['Bay leaves', 'A chalice', 'A notebook and pen']);
  assert.equal(result.optionalHave[0].found[0].source, 'garden');
  assert.equal(foundWords(result.have[0]), 'On this altar');
  assert.equal(foundWords(result.have[2]), 'Among your stones: Moonstone');
  assert.equal(haveLine(3, 3), 'You have all 3.');
  assert.equal(haveLine(0, 0), 'Nothing to gather.');
});

test('template needs come from the spell builder’s ingredients, and every premade checks', () => {
  assert.deepEqual(templateNeeds({ metadata: { ingredients: [{ ref: 'traditional/herb/bay', name: 'Bay', type: 'herb' }] } }), [{ name: 'Bay', ref: 'traditional/herb/bay' }]);
  assert.deepEqual(templateNeeds({ ingredients: [] }), []);
  for (const p of PREMADE) {
    const r = checkIngredients(premadeNeeds(p), { objects: [] });
    assert.equal(r.haveCount, 0, p.id);
    assert.equal(r.total, p.ingredients.filter((i) => !i.optional).length);
  }
});
