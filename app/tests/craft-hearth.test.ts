import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { OFFERING_FOODS } from '../src/lib/altar/offerings.ts';
import { FILLED_VESSELS } from '../src/lib/altar/offeringDrawer.ts';
import { SEASONAL_OBJECTS } from '../src/lib/altar/seasonal.ts';
import { TIMING_INTENTS } from '../src/lib/craft/cosmic/timing.ts';
import {
  FORAGE_PLANTS,
  FORAGE_RULES,
  forageForHerb,
  forageInMonth,
  matchForage,
  monthsKept,
  normalizeHarvest,
  normalizePatch,
  patchesByPlace,
  patchesInSeason,
  storeCupboard,
  worstLookAlike,
} from '../src/lib/craft/hearth/forage.ts';
import {
  blankNote,
  filterNotes,
  herbsSeen,
  holyDaysOn,
  keepsSouthWheel,
  kindsOf,
  normalizeNote,
  normalizePlace,
  noteHasContent,
  noteTitle,
  thisTimeLastYear,
  wheelOn,
  wheelWords,
  yearMarkers,
} from '../src/lib/craft/hearth/land.ts';
import {
  allRecipes,
  festivalFoodsAhead,
  FESTIVAL_NAMES,
  filterRecipes,
  findRecipePage,
  ingredientLink,
  linesOf,
  linkIngredient,
  normalizeRecipe,
  OFFERING_NAMES,
  recipeBlocks,
  recipeHerbs,
  recipeRef,
  recipesForHerb,
  recipesForHoly,
  SEASONAL_NAMES,
  STARTER_RECIPES,
} from '../src/lib/craft/hearth/recipes.ts';
import { hearthToday } from '../src/lib/craft/hearth/today.ts';
import { holidayChoice } from '../src/lib/holidays.ts';
import { holyPage } from '../src/lib/holy/index.ts';
import { TRADITIONAL_LIBRARY } from '../src/lib/library/traditionalData.ts';

const herbs = (TRADITIONAL_LIBRARY as unknown as Record<string, Record<string, unknown>>).herb;
const entry = <T>(id: string, data: T, createdAt = '2026-01-01T00:00:00Z') => ({ id, createdAt, data });

test('a place and a note read defensively, and the note keeps only what it should', () => {
  assert.equal(normalizePlace({}).name, 'A place');
  assert.equal(normalizePlace({ kind: 'nonsense' }).kind, 'other');
  const note = normalizeNote({ on: '2026-10-01', kinds: ['bloom', 'bogus'], herbs: ['elder', 'elder'], potted: [{ id: 'a:1', name: 'Margaret the pothos' }, { bad: 1 }], frost: 'first', water: 'odd' });
  assert.deepEqual(note.kinds, ['bloom']);
  assert.deepEqual(note.herbs, ['elder']);
  assert.equal(note.potted.length, 1);
  assert.equal(note.water, null);
  assert.deepEqual(kindsOf(note), ['frost', 'bloom']);
  assert.equal(noteTitle(note), 'First frost of the autumn');
  assert.equal(noteHasContent(blankNote(new Date())), false);
});

test('a day sits on the Wheel of the Year, turned for the south, with the holy days of your calendars', () => {
  assert.equal(wheelWords(wheelOn('2026-11-15')), 'Between Samhain and Yule');
  assert.equal(wheelWords(wheelOn('2026-10-31')), 'Samhain');
  assert.equal(wheelWords(wheelOn('2026-11-15', true)), 'Between Beltane and Litha');
  assert.equal(keepsSouthWheel({ traditions: ['wheel_south'], custom: [] }), true);
  assert.equal(keepsSouthWheel({ traditions: ['wheel'], custom: [] }, -33), false, 'your own choice of wheel wins');
  assert.equal(keepsSouthWheel({ traditions: ['hellenic'], custom: [] }, -33), true);
  assert.ok(holyDaysOn('2026-10-31', holidayChoice({})).some((h) => h.name === 'Samhain'));
});

test('this time last year gathers notes from the same weeks of earlier years, across the new year too', () => {
  const now = new Date(2027, 0, 3);
  const notes = [
    entry('a', normalizeNote({ on: '2025-12-28', text: 'Hard frost' })),
    entry('b', normalizeNote({ on: '2026-01-10', text: 'Snowdrops' })),
    entry('c', normalizeNote({ on: '2026-06-01', text: 'Swifts' })),
    entry('d', normalizeNote({ on: '2027-01-02', text: 'This year' })),
  ];
  const groups = thisTimeLastYear(notes, now);
  assert.deepEqual(groups.map((g) => [g.year, g.yearsAgo, g.notes.map((n) => n.id)]), [[2026, 1, ['a', 'b']]]);
});

test('year markers keep the last spring frost and the first autumn frost, and the firsts', () => {
  const notes = [
    entry('a', normalizeNote({ on: '2026-04-02', frost: 'last' })),
    entry('b', normalizeNote({ on: '2026-04-20', frost: 'last' })),
    entry('c', normalizeNote({ on: '2026-10-30', frost: 'first' })),
    entry('d', normalizeNote({ on: '2026-02-10', kinds: ['birdsong'], herbs: ['hawthorn'] })),
    entry('e', normalizeNote({ on: '2026-05-01', kinds: ['bloom'], herbs: ['hawthorn'] })),
  ];
  const [y] = yearMarkers(notes);
  assert.equal(y.lastFrost, '2026-04-20');
  assert.equal(y.firstFrost, '2026-10-30');
  assert.equal(y.firsts.birdsong, '2026-02-10');
  assert.deepEqual(herbsSeen(notes)[0], { key: 'hawthorn', name: 'Hawthorn', count: 2, last: '2026-05-01' });
  assert.deepEqual(filterNotes(notes, { herb: 'hawthorn' }).map((n) => n.id), ['e', 'd']);
  assert.deepEqual(filterNotes(notes, { kind: 'frost' }).map((n) => n.id), ['c', 'b', 'a']);
});

test('every forage plant is honest: months, how to know it, a caution, and a real Library link', () => {
  assert.ok(FORAGE_RULES.length >= 8 && FORAGE_RULES.some((r) => /fungi/i.test(r.title)));
  for (const p of FORAGE_PLANTS) {
    assert.ok(p.months.length && p.months.every((m) => m >= 1 && m <= 12), p.key);
    assert.ok(p.know && p.care && p.caution && p.where, p.key);
    if (p.library) assert.ok(herbs[p.library], `${p.key}: no Library herb ${p.library}`);
    for (const l of p.lookAlikes) if (l.library) assert.ok(herbs[l.library], `${p.key}: no Library herb ${l.library}`);
    for (const r of p.recipes ?? []) assert.ok(STARTER_RECIPES.some((s) => s.id === r), `${p.key}: no recipe ${r}`);
  }
  assert.equal(worstLookAlike(FORAGE_PLANTS.find((p) => p.key === 'wild_garlic')!)?.danger, 'deadly');
  assert.equal(worstLookAlike(FORAGE_PLANTS.find((p) => p.key === 'pine')!)?.name, 'Yew');
});

test('the foraging calendar turns for the southern hemisphere', () => {
  const north = forageInMonth(10, 'north').map((p) => p.key);
  assert.ok(north.includes('sloe') && north.includes('rosehip') && !north.includes('wild_garlic'));
  assert.ok(forageInMonth(10, 'south').some((p) => p.key === 'wild_garlic'), 'October in the south is April in the north');
  assert.equal(forageForHerb('elder').length, 2);
  assert.equal(matchForage('Blackberries')?.key, 'blackberry');
  assert.equal(matchForage('anything', 'hawthorn')?.key, 'hawthorn');
});

test('patches group by place, and harvests keep a store cupboard', () => {
  const patches = [entry('p1', normalizePatch({ name: 'Sloes', forage: 'sloe', placeId: 'wood' })), entry('p2', normalizePatch({ name: 'Mint', placeId: 'gone' }))];
  const groups = patchesByPlace(patches, ['wood']);
  assert.deepEqual(groups.map((g) => [g.placeId, g.patches.length]), [['wood', 1], [null, 1]]);
  assert.equal(patchesInSeason(patches, 10, 'north').length, 1);
  const harvests = [
    entry('h1', normalizeHarvest({ on: '2026-06-01', name: 'Elderflower', kept: true, storedOn: '2026-06-02' })),
    entry('h2', normalizeHarvest({ on: '2026-09-01', name: 'Hips', kept: true })),
    entry('h3', normalizeHarvest({ on: '2026-09-02', name: 'Eaten', kept: false })),
  ];
  assert.deepEqual(storeCupboard(harvests).map((h) => h.id), ['h1', 'h2']);
  assert.equal(monthsKept(harvests[0].data, new Date(2026, 9, 30)), 4);
  assert.equal(normalizeHarvest({ use: 'weird' }).use, 'kitchen');
});

test('starter recipes link only to real intents, holy pages, seasonal things, offerings and Library entries', () => {
  const intents = new Set(TIMING_INTENTS.map((t) => t.key));
  const seasonal = new Map(SEASONAL_OBJECTS.map((o) => [o.id, o.name]));
  for (const [id, name] of Object.entries(SEASONAL_NAMES)) assert.equal(seasonal.get(id), name, id);
  for (const [id, name] of Object.entries(OFFERING_NAMES)) {
    if (id === 'milk') assert.ok(FILLED_VESSELS.some((v) => v.name === name));
    else assert.equal(OFFERING_FOODS.find((f) => f.id === id)?.name, name, id);
  }
  for (const ref of Object.keys(FESTIVAL_NAMES)) assert.ok(holyPage(ref), `no holy page ${ref}`);
  const ids = new Set<string>();
  for (const r of STARTER_RECIPES) {
    assert.ok(!ids.has(r.id), r.id);
    ids.add(r.id);
    assert.ok(r.intent && intents.has(r.intent), r.id);
    assert.notEqual(r.origin, 'mine');
    assert.ok(r.about.length > 60 && r.method.length >= 3 && r.ingredients.length >= 2, r.id);
    for (const f of r.festivals) assert.ok(FESTIVAL_NAMES[f], `${r.id}: ${f}`);
    for (const s of r.seasonal) assert.ok(SEASONAL_NAMES[s], `${r.id}: ${s}`);
    if (r.offering) assert.ok(OFFERING_NAMES[r.offering], r.id);
    for (const ing of r.ingredients) if (ing.herb || ing.pantry) assert.ok(ingredientLink(ing), `${r.id}: ${ing.text}`);
    assert.ok(!/!/.test(`${r.about}${r.method.join('')}${r.words}`), `${r.id}: no exclamation marks`);
  }
  assert.ok(STARTER_RECIPES.some((r) => r.origin === 'traditional') && STARTER_RECIPES.some((r) => r.origin === 'modern'));
});

test('ingredients typed as lines link to the longest matching Library herb or pantry item', () => {
  assert.deepEqual(linkIngredient('3 sprigs of rosemary'), { text: '3 sprigs of rosemary', herb: 'rosemary', pantry: null });
  assert.equal(linkIngredient('A pinch of sea salt').pantry, 'sea_salt');
  assert.equal(linkIngredient('2 tbsp honey').pantry, 'honey');
  assert.equal(linkIngredient('1 cinnamon stick').herb, 'cinnamon');
  assert.equal(linkIngredient('Some water and love').herb, null);
  assert.deepEqual(linesOf('- one\n\n2. two\n• three'), ['one', 'two', 'three']);
});

test('recipes are found by festival, herb and intent; festival foods come from your calendars', () => {
  const mine = [{ id: 'x', data: { title: 'Rose water', intent: 'love', ingredients: [{ text: 'rose petals', herb: 'rose' }], festivals: ['wheel-beltane'] } }];
  const all = allRecipes(mine);
  assert.equal(all[0].id, 'x');
  assert.ok(recipesForHoly('wheel-beltane', all).some((r) => r.id === 'x'));
  assert.ok(recipesForHerb('rose', all).some((r) => r.id === 'honey-cake'));
  assert.ok(filterRecipes(all, { intent: 'love' }).every((r) => r.recipe.intent === 'love'));
  assert.deepEqual(recipeHerbs(normalizeRecipe(mine[0].data)), ['rose']);
  const ahead = festivalFoodsAhead(new Date(2026, 9, 25), holidayChoice({}), 10);
  assert.equal(ahead[0].ref, 'wheel-samhain');
  assert.ok(ahead[0].recipes.some((r) => r.id === 'soul-cakes'));
  assert.equal(normalizeRecipe({ intent: 'nonsense', allergens: ['egg', 'x'] }).intent, null);
});

test('a recipe kept in the Grimoire is tagged so it is found again', () => {
  const blocks = recipeBlocks(STARTER_RECIPES[0]);
  assert.equal(blocks[0].type, 'callout');
  assert.ok(blocks.some((b) => b.type === 'numbered_list'));
  assert.ok(blocks.some((b) => b.content === 'Allergies and safety'));
  assert.equal(findRecipePage([{ id: 'p', metadata: { holyRef: recipeRef('soul-cakes') } }], 'soul-cakes')?.id, 'p');
});

test('Today’s Hearth & land line: a festival food first, then the hedgerow', () => {
  const choice = holidayChoice({});
  assert.equal(hearthToday(['cosmic'], new Date(2026, 9, 30), { place: null, choice }), null);
  assert.match(hearthToday(['kitchen'], new Date(2026, 9, 30), { place: null, choice })!.line, /^Samhain tomorrow: soul cakes$/);
  const line = hearthToday(['green'], new Date(2026, 8, 5), { place: null, choice })!;
  assert.match(line.line, /^In the hedgerow now:/);
  assert.equal(line.href, '/rituals/craft/hearth/forage');
});

test('the Hearth & land screens exist on the app and the website', () => {
  const root = new URL('../../', import.meta.url);
  for (const path of ['', 'land', 'land/place', 'land/place-edit', 'land/note', 'land/note-edit', 'land/last-year', 'forage', 'forage/plant', 'forage/patch-edit', 'forage/harvests', 'forage/harvest-edit', 'forage/safety', 'recipes', 'recipes/recipe', 'recipes/edit']) {
    const app = path ? `app/src/app/(tabs)/rituals/craft/hearth/${path}.tsx` : 'app/src/app/(tabs)/rituals/craft/hearth/index.tsx';
    const appFile = readFileSync(new URL(app.replace(/forage\.tsx$|land\.tsx$|recipes\.tsx$/, (m) => `${m.replace('.tsx', '')}/index.tsx`), root), 'utf8');
    assert.ok(appFile.length > 100, app);
    assert.match(readFileSync(new URL(`practice/hearth/${path ? `${path}/` : ''}index.html`, root), 'utf8'), /data-view="hearth/);
  }
});
