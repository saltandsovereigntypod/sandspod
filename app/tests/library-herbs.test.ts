import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

import { ingredientColor } from '../src/lib/altar/workings/colors.ts';
import { pantryItem } from '../src/lib/craft/kitchen/pantry.ts';
import { SEASON_PLANTS } from '../src/lib/craft/green/season.ts';
import { findByName, traditionalEntries } from '../src/lib/library/model.ts';
import { entryTraditions, PATH_TRADITIONS } from '../src/lib/library/traditions.ts';
import { TRADITIONAL_LIBRARY } from '../src/lib/library/traditionalData.ts';

type Herb = Record<string, string | string[]>;
const herbs = TRADITIONAL_LIBRARY.herb as unknown as Record<string, Herb>;

// The second batch of herbs, by the folder name their cabinet pictures use
// (assets/altar/objects/herbs/<id>/<id>-sprig.png): the Library key with "_" for "-".
const BATCH_2 = [
  'anise', 'borage', 'cardamom', 'cinquefoil', 'red-clover', 'damiana', 'eucalyptus', 'fennel', 'galangal', 'heather',
  'hibiscus', 'honeysuckle', 'lilac', 'mullein', 'nutmeg', 'passionflower', 'pine', 'rosehip', 'sunflower', 'violet',
];
const keyOf = (id: string) => id.replaceAll('-', '_');
// Herbs sold as a true, steam-distilled essential oil.
const ESSENTIAL_OILS = ['anise', 'cardamom', 'eucalyptus', 'fennel', 'galangal', 'nutmeg', 'pine'];

const text = (h: Herb, ...fields: string[]) => fields.map((f) => String(h[f] ?? '')).join(' ');

test('every new herb is in the Library with every field the others have', () => {
  const older = Object.entries(herbs).filter(([key]) => !BATCH_2.includes(key.replaceAll('_', '-')));
  const fields = new Set(older.flatMap(([, h]) => Object.keys(h)));
  for (const id of BATCH_2) {
    const h = herbs[keyOf(id)];
    assert.ok(h, `${id} is missing`);
    for (const field of fields) {
      const value = h[field];
      assert.ok(Array.isArray(value) ? value.length : String(value ?? '').trim(), `${id} has no ${field}`);
    }
    assert.deepEqual(Object.keys(h).filter((f) => !fields.has(f)), [], `${id} has fields the others don't`);
    assert.equal(h.Category, 'Herb');
    assert.ok(['Fire', 'Water', 'Air', 'Earth'].includes(String(h.Element)), `${id} element`);
    assert.ok(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(String(h.Planet)), `${id} planet`);
    assert.match(String(h.HowToUse), /^Start here: /, id);
    assert.equal((h.tags as string[]).length, 6, `${id} tags`);
    // A botanical name and the scent in the overview; the planet's source in the notes.
    assert.match(String(h.Overview), /\([A-Z][a-z]+ [a-z-]+/, `${id} botanical name`);
    assert.match(String(h.Overview), /smell|scent/i, `${id} scent`);
    assert.match(String(h.TraditionNotes), /(Culpeper|correspondence tables)[^.]*(masculine|feminine)/, `${id} planet source and gender`);
  }
  assert.equal(Object.keys(herbs).length, 80);
});

test('the app and the website hold the same entries', () => {
  const source = readFileSync(new URL('../../js/traditional-library.js', import.meta.url), 'utf8');
  const context: { TraditionalLibrary?: { herb: Record<string, Herb> } } = {};
  vm.runInNewContext(`${source}\nthis.TraditionalLibrary = TraditionalLibrary;`, context);
  for (const id of BATCH_2) assert.deepEqual(JSON.parse(JSON.stringify(context.TraditionalLibrary!.herb[keyOf(id)])), herbs[keyOf(id)], id);
});

test('each tradition named has its own note, and only known traditions are named', () => {
  const known = new Set(PATH_TRADITIONS.map((t) => t.name));
  for (const id of BATCH_2) {
    const h = herbs[keyOf(id)];
    const listed = String(h.Traditions).split(',').map((t) => t.trim());
    for (const name of listed) assert.ok(known.has(name), `${id}: ${name}`);
    assert.equal(entryTraditions(h, 'herb').length, listed.length, id);
    const labels = String(h.TraditionNotes).split('\n\n').map((p) => p.slice(0, p.indexOf(':')));
    assert.deepEqual(labels, [...listed, 'Folk & wider practice'], id);
  }
});

test('the warnings each herb needs are there', () => {
  const warn = (id: string) => text(herbs[keyOf(id)], 'TraditionalWarnings', 'SafetyAndRespect');
  assert.match(warn('nutmeg'), /myristicin/);
  assert.match(warn('nutmeg'), /large doses|two teaspoons/);
  assert.match(warn('passionflower'), /sedat/i);
  assert.match(warn('passionflower'), /pregnancy/);
  assert.match(warn('mullein'), /seeds are toxic|seeds/);
  assert.match(warn('mullein'), /hairs/);
  assert.match(warn('mullein'), /strain/i);
  assert.match(warn('eucalyptus'), /toxic if swallowed|poisonous if swallowed/);
  assert.match(warn('eucalyptus'), /children/);
  assert.match(warn('eucalyptus'), /cats/);
  assert.match(warn('pine'), /livestock|cattle/);
  assert.match(warn('pine'), /irritat/);
  assert.match(warn('anise'), /Japanese star anise/);
  assert.match(warn('borage'), /pyrrolizidine/);
  assert.match(warn('borage'), /Do not eat it|not suggest eating/);
  assert.match(warn('damiana'), /pregnancy/);
  assert.match(warn('hibiscus'), /blood pressure/);
  assert.match(warn('fennel'), /hemlock/);
  assert.match(warn('rosehip'), /hairs/);
  assert.match(warn('honeysuckle'), /berries/);
  assert.match(warn('lilac'), /Persian lilac/);
  assert.match(warn('violet'), /roots and seeds/);
  for (const id of BATCH_2) {
    const h = herbs[keyOf(id)];
    assert.ok(String(h.TraditionalWarnings).length > 40 && String(h.SafetyAndRespect).length > 80, id);
  }
  // Essential oils: dilute, never swallowed, kept from pets.
  for (const id of ESSENTIAL_OILS) {
    const w = warn(id);
    assert.match(w, /dilut/i, `${id} dilute`);
    assert.match(w, /internal|swallow/i, `${id} not internal`);
    assert.match(w, /pets|cats/i, `${id} pets`);
  }
});

test('galangal names its hoodoo name respectfully, as a name and not instructions', () => {
  const galangal = herbs.galangal;
  for (const field of Object.keys(galangal).filter((f) => f !== 'TraditionNotes')) {
    assert.doesNotMatch(String(galangal[field]), /Little John|chewing John/, field);
  }
  assert.match(String(galangal.TraditionNotes), /living African American tradition, the root is known as ‘Little John to chew’/);
  assert.match(String(galangal.TraditionNotes), /belong to that tradition/);
});

test('the new herbs are registered where the other herbs are', () => {
  const entries = traditionalEntries();
  for (const id of BATCH_2) {
    const h = herbs[keyOf(id)];
    // In the Library, by name.
    assert.equal(findByName(entries, String(h.DisplayName))?.id, `traditional:herb:${keyOf(id)}`, id);
    // A colour of its own in jars and sachets (not its element's fallback).
    assert.equal(ingredientColor(String(h.DisplayName), 'Fire'), ingredientColor(String(h.DisplayName), 'Water'), `${id} colour`);
    // Its pairings and substitutions open Library entries.
    for (const name of [...String(h.PairsWith).split(','), ...String(h.Substitutions).split(',')]) {
      assert.ok(findByName(entries, name.trim()), `${id}: ${name}`);
    }
  }
  // The kitchen links its spices to their pages.
  assert.equal(pantryItem('nutmeg')?.library, 'nutmeg');
  assert.equal(pantryItem('cardamom')?.library, 'cardamom');
  // The garden calendar marks them as Library plants.
  for (const id of ['borage', 'fennel', 'mullein', 'red-clover', 'sunflower', 'violet']) {
    assert.equal(SEASON_PLANTS.find((p) => p.key === keyOf(id))?.library, true, id);
  }
});
