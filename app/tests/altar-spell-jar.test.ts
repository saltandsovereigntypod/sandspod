import assert from 'node:assert/strict';
import { test } from 'node:test';

import { normalizeApothecary } from '../src/lib/altar/apothecary.ts';
import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { lightCandle, parseLivingState } from '../src/lib/altar/livingState.ts';
import { appStateOf } from '../src/lib/altar/workings/appState.ts';
import {
  addLayer,
  daysSinceRenewal,
  dripCandles,
  emptyJar,
  JAR_LAYER_MAX,
  jarLayer,
  jarObject,
  jarProblem,
  jarStateOf,
  layerBands,
  removeLayer,
  sealJar,
  sealLine,
  shakeToRenew,
} from '../src/lib/altar/workings/spellJar.ts';

const NOW = '2026-10-16T20:00:00.000Z';
const later = (days: number) => new Date(Date.parse(NOW) + days * 86_400_000).toISOString();

const candle = (color: string, lit = false) => {
  const item = builtInCabinet.find((i) => i.id === `candles:${color}-candle`)!;
  const object = objectFromForm(item, item.forms.find((f) => f.form === 'taper')!, [], NOW);
  return lit ? lightCandle(object, NOW) : object;
};

function sealedJar() {
  let jar = emptyJar('Money');
  jar = addLayer(jar, jarLayer({ label: 'Rice', source: 'salt' }, NOW));
  jar = addLayer(jar, jarLayer({ label: 'Basil', source: 'library', herb: 'basil', spoken: '  Grow, and keep growing ' }, NOW));
  jar = addLayer(jar, jarLayer({ label: 'Citrine', source: 'library', crystal: 'citrine' }, NOW));
  return sealJar(jar, 'green', NOW);
}

test('layers are coloured by what they are, and keep their spoken line', () => {
  const basil = jarLayer({ label: 'Basil', source: 'library', herb: 'basil', spoken: '  Grow,   and keep growing ' }, NOW);
  assert.equal(basil.spoken, 'Grow, and keep growing');
  assert.equal(basil.element, 'Fire');
  assert.match(basil.entryId!, /^traditional:herb:basil$/);
  assert.equal(jarLayer({ label: 'Dried lavender buds', source: 'typed' }, NOW).color, jarLayer({ label: 'Lavender', source: 'typed' }, NOW).color);
  assert.match(jarLayer({ label: 'Something unknown', source: 'typed' }, NOW).color, /^#[0-9a-f]{6}$/);
});

test('the jar fills bottom up, to its shoulder at eight layers, and stops at its neck', () => {
  let jar = emptyJar('Calm');
  assert.deepEqual(layerBands(jar.layers), []);
  for (let i = 0; i < JAR_LAYER_MAX + 3; i += 1) jar = addLayer(jar, jarLayer({ label: `Layer ${i}`, source: 'typed' }, NOW));
  assert.equal(jar.layers.length, JAR_LAYER_MAX);
  const bands = layerBands(jar.layers);
  assert.equal(bands[0].from, 0);
  assert.ok(Math.abs(bands[bands.length - 1].to - 0.9) < 1e-9);
  const two = layerBands(jar.layers.slice(0, 2));
  assert.ok(two[1].to < 0.3, 'two layers only fill the bottom');
  assert.equal(removeLayer(jar, 0).layers.length, JAR_LAYER_MAX - 1);
});

test('a jar needs an intention, a layer and a seal; a sealed jar takes no more layers', () => {
  assert.equal(jarProblem(emptyJar('')), 'Choose what the jar is for first.');
  assert.equal(jarProblem(emptyJar('Money')), 'Add at least one layer.');
  const unsealed = addLayer(emptyJar('Money'), jarLayer({ label: 'Rice', source: 'salt' }, NOW));
  assert.equal(jarProblem(unsealed), 'Seal it with wax to finish.');
  const jar = sealedJar();
  assert.equal(jarProblem(jar), null);
  assert.equal(addLayer(jar, jarLayer({ label: 'More', source: 'typed' }, NOW)), jar);
  assert.equal(sealLine(jar.seal), 'Sealed with green wax');
});

test('wax can drip from a lit candle on the altar, and takes that candle’s colour', () => {
  const lit = candle('red', true);
  const unlit = candle('blue');
  assert.deepEqual(dripCandles([lit, unlit]), [lit]);
  const jar = sealJar(addLayer(emptyJar('Courage'), jarLayer({ label: 'Basil', source: 'typed' }, NOW)), 'white', NOW, lit);
  assert.equal(jar.seal!.color, 'red');
  assert.equal(jar.seal!.dripFromUid, lit.altarObjectId);
  assert.match(sealLine(jar.seal), /dripped from Red Candle/);
  // An unlit candle can't drip.
  assert.equal(sealJar(jar, 'white', NOW, unlit).seal!.dripFromUid, undefined);
});

test('the finished jar is an apothecary spell jar the website can show, layers in livingState.app.jar', () => {
  const { item, object } = jarObject(sealedJar(), [], NOW, undefined, 'jar-1');
  assert.equal(object.type, 'apothecary');
  assert.equal(object.form, 'spell-jar');
  assert.equal(object.apothecaryType, 'Spell Jar');
  assert.equal(object.apothecaryItemId, 'jar-1');
  assert.equal(object.apothecaryIntention, 'Money');
  assert.match(String(object.imagePath), /spell-jar-two/);
  const ingredients = JSON.parse(String(object.apothecaryIngredients));
  assert.deepEqual(ingredients.map((i: { label: string }) => i.label), ['Rice', 'Basil', 'Citrine']);
  assert.equal(ingredients[1].spoken, 'Grow, and keep growing');
  assert.equal(ingredients[2].crystal, 'citrine');
  // The website's normaliser keeps it as a spell jar with its ingredients.
  const round = normalizeApothecary(item as unknown as Record<string, unknown>);
  assert.equal(round.type, 'spell-jar');
  assert.equal(round.ingredients.length, 3);
  const state = parseLivingState(object)!;
  assert.equal((state.apothecary as { activationState: string }).activationState, 'Sealed with green wax');
  assert.ok((state.apothecary as { nextTendingAt: string }).nextTendingAt);
  const jar = jarStateOf(object)!;
  assert.equal(jar.layers.length, 3);
  assert.equal(jar.seal!.color, 'green');
  assert.equal(item.name, 'Money jar');
});

test('shake to renew logs the renewal and moves the next tending on, keeping everything else', () => {
  const { object } = jarObject(sealedJar(), [], NOW);
  const shaken = shakeToRenew(object, later(10), ' still growing ');
  const jar = jarStateOf(shaken)!;
  assert.equal(jar.renewals.length, 1);
  assert.equal(jar.renewals[0].note, 'still growing');
  assert.equal(jar.lastRenewedAt, later(10));
  assert.equal(jar.layers.length, 3);
  const state = parseLivingState(shaken)!;
  assert.equal((state.apothecary as { nextTendingAt: string }).nextTendingAt, later(40));
  assert.equal((state.apothecary as { activationState: string }).activationState, 'Sealed with green wax');
  assert.equal(daysSinceRenewal(jar, Date.parse(later(13))), 3);
  // Not a jar: unchanged.
  const plain = candle('red');
  assert.equal(shakeToRenew(plain, NOW), plain);
});

test('other app state and unknown livingState keys survive', () => {
  const { object } = jarObject(sealedJar(), [], NOW);
  const state = JSON.parse(String(object.livingState));
  state.app.other = { kept: true };
  state.newerWebsiteKey = 'x';
  const withExtra = { ...object, livingState: JSON.stringify(state) };
  const shaken = shakeToRenew(withExtra, later(1));
  assert.deepEqual(appStateOf(shaken).other, { kept: true });
  assert.equal(parseLivingState(shaken)!.newerWebsiteKey, 'x');
});
