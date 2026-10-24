import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

import { ingredientColor } from '../src/lib/altar/workings/colors.ts';
import { careByKey, findCare } from '../src/lib/craft/crystal/care.ts';
import { findByName, traditionalEntries } from '../src/lib/library/model.ts';
import { entryTraditions, PATH_TRADITIONS } from '../src/lib/library/traditions.ts';
import { TRADITIONAL_LIBRARY } from '../src/lib/library/traditionalData.ts';

type Crystal = Record<string, string | string[]>;
const crystals = TRADITIONAL_LIBRARY.crystal as unknown as Record<string, Crystal>;

// The second batch of crystals, by the folder name their cabinet pictures use
// (assets/altar/objects/crystals/<id>/<id>-tumbled.png): the Library key with "_" for "-".
const BATCH_2 = [
  'aragonite', 'azurite', 'orange-calcite', 'charoite', 'danburite', 'dalmatian-jasper', 'larimar', 'prehnite',
  'rutilated-quartz', 'snowflake-obsidian', 'tourmalinated-quartz', 'ocean-jasper', 'mookaite', 'pink-tourmaline',
  'iolite', 'morganite', 'amazonite', 'blue-apatite', 'spirit-quartz', 'desert-rose',
];
const keyOf = (id: string) => id.replaceAll('-', '_');
const text = (c: Crystal, ...fields: string[]) => fields.map((f) => String(c[f] ?? '')).join(' ');

test('every new crystal is in the Library with every field the others have', () => {
  const older = Object.entries(crystals).filter(([key]) => !BATCH_2.includes(key.replaceAll('_', '-')));
  const fields = new Set(older.flatMap(([, c]) => Object.keys(c)));
  for (const id of BATCH_2) {
    const c = crystals[keyOf(id)];
    assert.ok(c, `${id} is missing`);
    for (const field of fields) {
      const value = c[field];
      assert.ok(Array.isArray(value) ? value.length : String(value ?? '').trim(), `${id} has no ${field}`);
    }
    assert.deepEqual(Object.keys(c).filter((f) => !fields.has(f)), [], `${id} has fields the others don't`);
    assert.equal(c.Category, 'Crystal');
    // Its display name is its folder name, so the cabinet and the Library agree.
    assert.equal(String(c.DisplayName).toLowerCase().replaceAll(' ', '-'), id);
    assert.ok(['Fire', 'Water', 'Air', 'Earth', 'Spirit'].includes(String(c.Element)), `${id} element`);
    assert.ok(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(String(c.Planet)), `${id} planet`);
    assert.match(String(c.HowToUse), /^Start here: /, id);
    assert.equal((c.tags as string[]).length, 6, `${id} tags`);
    // The mineral's hardness in the overview, and honesty about where its meanings come from.
    assert.match(String(c.Overview), /Mohs \d/, `${id} hardness`);
    assert.match(text(c, 'TraditionNotes', 'SafetyAndRespect', 'TraditionalMeaning'), /modern/i, `${id} modern lore`);
  }
  assert.equal(Object.keys(crystals).length, 70);
});

test('the app and the website hold the same entries', () => {
  const source = readFileSync(new URL('../../js/traditional-library.js', import.meta.url), 'utf8');
  const context: { TraditionalLibrary?: { crystal: Record<string, Crystal> } } = {};
  vm.runInNewContext(`${source}\nthis.TraditionalLibrary = TraditionalLibrary;`, context);
  for (const id of BATCH_2) assert.deepEqual(JSON.parse(JSON.stringify(context.TraditionalLibrary!.crystal[keyOf(id)])), crystals[keyOf(id)], id);
});

test('each tradition named has its own note, and only known traditions are named', () => {
  const known = new Set(PATH_TRADITIONS.map((t) => t.name));
  for (const id of BATCH_2) {
    const c = crystals[keyOf(id)];
    const listed = String(c.Traditions).split(',').map((t) => t.trim());
    for (const name of listed) assert.ok(known.has(name), `${id}: ${name}`);
    assert.equal(entryTraditions(c, 'crystal').length, listed.length, id);
    const labels = String(c.TraditionNotes).split('\n\n').map((p) => p.slice(0, p.indexOf(':')));
    assert.deepEqual(labels, [...listed, 'Folk & wider practice'], id);
  }
});

test('the warnings each stone needs are there', () => {
  const warn = (id: string) => text(crystals[keyOf(id)], 'TraditionalWarnings', 'CleansingNotes', 'SafetyAndRespect');
  // Soft or water-soluble: no water soaks or salt.
  for (const id of ['desert-rose', 'aragonite', 'orange-calcite']) {
    assert.match(warn(id), /soak/, id);
    assert.match(warn(id), /salt/, id);
  }
  assert.match(warn('desert-rose'), /gypsum/i);
  assert.match(warn('desert-rose'), /dissolve/);
  assert.match(warn('aragonite'), /acids|vinegar/);
  assert.match(warn('orange-calcite'), /acid/);
  assert.match(warn('azurite'), /copper/);
  assert.match(warn('azurite'), /elixir/);
  assert.match(warn('amazonite'), /lead/);
  assert.match(warn('amazonite'), /elixir/);
  assert.match(warn('blue-apatite'), /soft/);
  assert.match(warn('larimar'), /dyed howlite/i);
  assert.match(warn('larimar'), /fade/);
  assert.match(warn('pink-tourmaline'), /dyed quartz|glass/);
  assert.match(warn('morganite'), /heat-treated/);
  assert.match(warn('spirit-quartz'), /fragile/i);
  assert.match(warn('snowflake-obsidian'), /sharp/);
  assert.match(warn('iolite'), /untested theory/);
  for (const id of BATCH_2) {
    const c = crystals[keyOf(id)];
    assert.ok(String(c.TraditionalWarnings).length > 40 && String(c.SafetyAndRespect).length > 80, id);
  }
  // Dated as modern where they are.
  assert.match(text(crystals.larimar, 'Overview', 'TraditionNotes'), /1974|1975|1970s/);
  assert.match(text(crystals.charoite, 'Overview', 'TraditionNotes'), /1978/);
  assert.match(text(crystals.ocean_jasper, 'Overview', 'TraditionNotes'), /2000/);
  assert.match(text(crystals.spirit_quartz, 'Overview'), /South Africa/);
});

test('the new crystals are registered where the other crystals are', () => {
  const entries = traditionalEntries();
  for (const id of BATCH_2) {
    const c = crystals[keyOf(id)];
    // In the Library, by name.
    assert.equal(findByName(entries, String(c.DisplayName))?.id, `traditional:crystal:${keyOf(id)}`, id);
    // A colour of its own in jars and on the altar (not its element's fallback).
    assert.equal(ingredientColor(String(c.DisplayName), 'Fire'), ingredientColor(String(c.DisplayName), 'Water'), `${id} colour`);
    // Its pairings open Library entries.
    for (const name of String(c.PairsWith).split(',')) assert.ok(findByName(entries, name.trim()), `${id}: ${name}`);
    // Stone care, linked to the Library, by key and by name.
    const care = careByKey(keyOf(id));
    assert.ok(care?.library, `${id} care`);
    assert.equal(findCare(null, String(c.DisplayName))?.key, keyOf(id), id);
    // The care row and the Library's cleansing methods agree on water.
    if (care!.water !== 'yes') assert.doesNotMatch(String(c.Cleansing), /water/i, `${id} cleansing`);
    if (care!.sun !== 'ok') assert.doesNotMatch(String(c.Cleansing), /sun/i, `${id} sun`);
  }
  // Gypsum and copper stones are kept dry; azurite is marked toxic.
  assert.equal(careByKey('desert_rose')!.water, 'no');
  assert.equal(careByKey('azurite')!.handling, 'toxic');
});
