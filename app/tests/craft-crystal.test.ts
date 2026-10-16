import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TRADITIONAL_LIBRARY } from '../src/lib/library/traditionalData.ts';
import { careBadges, careByKey, CLEANSE_METHODS, findCare, methodWarning, STONE_CARE } from '../src/lib/craft/crystal/care.ts';
import { cleanseStatus, normaliseRule, normaliseStone, sortStones, type Stone } from '../src/lib/craft/crystal/stones.ts';
import { nextPhase } from '../src/lib/moon.ts';

const libraryCrystals = Object.keys(TRADITIONAL_LIBRARY.crystal as Record<string, unknown>);

test('every Library crystal has care data, under the same key', () => {
  assert.ok(libraryCrystals.length >= 45);
  for (const key of libraryCrystals) {
    const c = careByKey(key);
    assert.ok(c, key);
    assert.equal(c!.library, true, key);
  }
  for (const c of STONE_CARE.filter((s) => s.library)) assert.ok(libraryCrystals.includes(c.key), c.key);
});

test('care rows are complete and consistent', () => {
  const methods = new Set(CLEANSE_METHODS.map((m) => m.key));
  const keys = new Set<string>();
  for (const c of STONE_CARE) {
    assert.ok(!keys.has(c.key), c.key);
    keys.add(c.key);
    assert.match(c.mohs, /^\d(\.\d)?(–\d(\.\d)?)?$/, c.key);
    assert.ok(c.cleanse.length >= 1 && c.cleanse.every((m) => methods.has(m)), c.key);
    // Never recommend a method the stone can't take.
    if (c.water !== 'yes') assert.ok(!c.cleanse.includes('water'), `${c.key} water`);
    if (c.salt !== 'yes') assert.ok(!c.cleanse.includes('salt'), `${c.key} salt`);
    if (c.sun !== 'ok') assert.ok(!c.cleanse.includes('sunlight'), `${c.key} sun`);
    if (c.handling === 'toxic') assert.ok(!c.cleanse.includes('earth'), `${c.key} earth`);
    assert.ok(c.note.length > 5, c.key);
    // Soft stones (under Mohs 3) never soak.
    if (parseFloat(c.mohs) < 3) assert.notEqual(c.water, 'yes', `${c.key} soft`);
  }
});

test('the well-known water-unsafe, sun-fading and toxic stones are marked', () => {
  for (const key of ['selenite', 'malachite', 'pyrite', 'hematite', 'lepidolite', 'kyanite', 'celestite', 'azurite', 'turquoise', 'opal', 'halite', 'angelite', 'chrysocolla']) {
    assert.equal(careByKey(key)!.water, 'no', key);
  }
  for (const key of ['amethyst', 'rose_quartz', 'citrine', 'fluorite', 'celestite', 'kunzite', 'green_aventurine', 'ametrine']) {
    assert.equal(careByKey(key)!.sun, 'fades', key);
  }
  for (const key of ['malachite', 'cinnabar', 'galena', 'orpiment', 'realgar', 'stibnite', 'azurite']) {
    assert.equal(careByKey(key)!.handling, 'toxic', key);
  }
  assert.equal(careByKey('clear_quartz')!.water, 'yes');
});

test('finds care from typed names', () => {
  assert.equal(findCare(null, 'Tigers eye')?.key, 'tiger_eye');
  assert.equal(findCare(null, 'tiger’s eye')?.key, 'tiger_eye');
  assert.equal(findCare(null, 'Raw rose quartz')?.key, 'rose_quartz');
  assert.equal(findCare(null, 'quartz point')?.key, 'clear_quartz');
  assert.equal(findCare(null, 'Celestine geode')?.key, 'celestite');
  assert.equal(findCare(null, 'Pink tourmaline')?.key, 'tourmaline');
  assert.equal(findCare(null, 'Black tourmaline')?.key, 'black_tourmaline');
  assert.equal(findCare(null, 'Mystery rock'), null);
  assert.equal(findCare('selenite', 'whatever')?.key, 'selenite');
});

test('warns about unsafe methods', () => {
  assert.match(methodWarning(careByKey('selenite'), 'Running water')!, /shouldn’t go in water/);
  assert.match(methodWarning(careByKey('labradorite'), 'Running water')!, /quick rinse/);
  assert.match(methodWarning(careByKey('amethyst'), 'Sunlight')!, /fades/);
  assert.match(methodWarning(careByKey('malachite'), 'Earth')!, /bury/);
  assert.equal(methodWarning(careByKey('clear_quartz'), 'Running water'), null);
  assert.equal(methodWarning(careByKey('amethyst'), 'Moonlight'), null);
  assert.equal(methodWarning(null, 'Running water'), null);
  assert.ok(careBadges(careByKey('malachite')!).includes('Toxic'));
});

const stone = (care: Stone['care'], name = 'Amethyst'): Stone => normaliseStone({ name, form: 'tumbled', intentions: [], care });

test('cleansing falls due after the chosen days or the next full moon', () => {
  const now = new Date(Date.UTC(2026, 9, 16, 12));
  const days = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();
  const rule = normaliseRule({ kind: 'days', days: 30 });
  assert.equal(cleanseStatus(stone([]), rule, now).due, true);
  assert.equal(cleanseStatus(stone([{ id: 'a', kind: 'cleansed', at: days(31) }]), rule, now).due, true);
  assert.equal(cleanseStatus(stone([{ id: 'a', kind: 'cleansed', at: days(10) }]), rule, now).due, false);
  // Charging doesn't count as cleansing.
  assert.equal(cleanseStatus(stone([{ id: 'a', kind: 'charged', at: days(1) }]), rule, now).due, true);
  const moon = { kind: 'fullMoon' } as const;
  const lastFull = nextPhase(new Date(now.getTime() - 30 * 86_400_000), 'full');
  const before = new Date(lastFull.getTime() - 86_400_000).toISOString();
  const after = new Date(lastFull.getTime() + 86_400_000).toISOString();
  assert.ok(lastFull.getTime() < now.getTime());
  assert.equal(cleanseStatus(stone([{ id: 'a', kind: 'cleansed', at: before }]), moon, now).due, true);
  if (nextPhase(new Date(after), 'full').getTime() > now.getTime()) {
    assert.equal(cleanseStatus(stone([{ id: 'a', kind: 'cleansed', at: after }]), moon, now).due, false);
  }
  assert.deepEqual(normaliseRule({ kind: 'days', days: -4 }), { kind: 'days', days: 30 });
  assert.deepEqual(normaliseRule(null), { kind: 'days', days: 30 });
});

test('stones sort with those due first', () => {
  const now = new Date(Date.UTC(2026, 9, 16, 12));
  const rule = normaliseRule(null);
  const fresh = { data: stone([{ id: 'a', kind: 'cleansed', at: now.toISOString() }], 'Fresh') };
  const due = { data: stone([], 'Due') };
  assert.deepEqual(sortStones([fresh, due], rule, now).map((s) => s.data.name), ['Due', 'Fresh']);
  assert.equal(normaliseStone({ name: '  ', form: 'nonsense' as never }).name, 'Unnamed stone');
  assert.equal(normaliseStone({ name: 'x', form: 'nonsense' as never }).form, 'other');
});
