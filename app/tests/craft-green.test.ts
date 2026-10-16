import assert from 'node:assert/strict';
import { test } from 'node:test';

import { addEvent, asPlant, history, markGone, moonOn, newEvent, newPlant, plantSummary, removeEvent, sortPlants } from '../src/lib/craft/green/garden.ts';
import { gardenNights, nextQuarterChange, quarterOf, QUARTERS, signNote } from '../src/lib/craft/green/moonGarden.ts';
import { hemisphereOf, inSeason, isTropical, localMonths, monthSpan, northernMonth, SEASON_PLANTS } from '../src/lib/craft/green/season.ts';
import { TRADITIONAL_LIBRARY } from '../src/lib/library/traditionalData.ts';
import { SIGNS, upcomingPhases } from '../src/lib/moon.ts';

const herbs = (TRADITIONAL_LIBRARY as unknown as Record<string, Record<string, unknown>>).herb;

test('the four garden quarters follow the moon fraction', () => {
  assert.equal(quarterOf(0), 'leaf');
  assert.equal(quarterOf(0.2), 'leaf');
  assert.equal(quarterOf(0.25), 'fruit');
  assert.equal(quarterOf(0.49), 'fruit');
  assert.equal(quarterOf(0.5), 'root');
  assert.equal(quarterOf(0.74), 'root');
  assert.equal(quarterOf(0.8), 'rest');
  assert.equal(quarterOf(1), 'leaf');
  for (const q of Object.values(QUARTERS)) assert.ok(q.tasks.length >= 3 && q.headline && q.why);
});

test('the night after a full moon is a root night, and after new a leaf night', () => {
  const [a, b] = upcomingPhases(new Date('2026-10-16T12:00:00Z'), 4).filter((p) => p.phase === 'full' || p.phase === 'new');
  for (const p of [a, b]) {
    const next = new Date(p.date.getTime() + 30 * 3_600_000);
    assert.equal(quarterOf(gardenNights(next, 1)[0].fraction), p.phase === 'full' ? 'root' : 'leaf');
  }
});

test('fourteen nights ahead each carry a sign, and a quarter change is found within a week and a bit', () => {
  const nights = gardenNights(new Date(2026, 9, 16), 14);
  assert.equal(nights.length, 14);
  assert.ok(nights.every((n) => SIGNS.includes(n.sign)));
  assert.ok(nights.some((n) => n.turning));
  const change = nextQuarterChange(new Date(2026, 9, 16, 21));
  assert.ok(change && change.date.getTime() - new Date(2026, 9, 16, 21).getTime() < 8 * 86_400_000);
});

test('the almanac signs: water fruitful, earth and Libra half, fire and air barren, Virgo barren', () => {
  assert.equal(signNote('Cancer').fertility, 'fruitful');
  assert.equal(signNote('Pisces').fertility, 'fruitful');
  assert.equal(signNote('Taurus').fertility, 'semi-fruitful');
  assert.equal(signNote('Aries').fertility, 'barren');
  assert.equal(signNote('Aquarius').fertility, 'barren');
  assert.equal(signNote('Virgo').fertility, 'barren');
  assert.equal(signNote('Libra').fertility, 'semi-fruitful');
});

test('every seasonal plant marked as in the Library has a herb page there', () => {
  const keys = new Set<string>();
  for (const p of SEASON_PLANTS) {
    assert.ok(!keys.has(p.key), `duplicate ${p.key}`);
    keys.add(p.key);
    if (p.library) assert.ok(herbs[p.key], `${p.key} is not a Library herb`);
    else assert.ok(!herbs[p.key], `${p.key} is in the Library; mark it`);
    for (const m of [...p.sow, ...p.harvest]) assert.ok(m >= 1 && m <= 12, `${p.key} month ${m}`);
    assert.ok(p.sow.length || p.wild, `${p.key} has nothing to sow`);
    assert.ok(p.harvest.length, `${p.key} has nothing to gather`);
  }
});

test('the toxic plants all carry a caution', () => {
  for (const key of ['foxglove', 'mugwort', 'rue', 'wormwood', 'comfrey', 'elder', 'saffron', 'angelica', 'st_johns_wort']) {
    assert.ok(SEASON_PLANTS.find((p) => p.key === key)?.caution, key);
  }
  assert.match(SEASON_PLANTS.find((p) => p.key === 'mugwort')!.caution!, /never eat/i);
});

test('the southern hemisphere turns the table by six months', () => {
  assert.equal(hemisphereOf(-33.9), 'south');
  assert.equal(hemisphereOf(51.5), 'north');
  assert.equal(hemisphereOf(null), 'north');
  assert.equal(northernMonth(1, 'south'), 7);
  assert.equal(northernMonth(10, 'south'), 4);
  assert.equal(northernMonth(10, 'north'), 10);
  const northOct = inSeason(10, 'north');
  const southApr = inSeason(4, 'south');
  assert.deepEqual(
    northOct.sow.map((p) => p.key),
    southApr.sow.map((p) => p.key),
  );
  assert.ok(northOct.sow.some((p) => p.key === 'garlic'));
  assert.ok(inSeason(4, 'north').sow.some((p) => p.key === 'basil'));
  assert.ok(!inSeason(4, 'south').sow.some((p) => p.key === 'basil'));
  assert.ok(inSeason(10, 'south').sow.some((p) => p.key === 'basil'));
  assert.ok(isTropical(10) && !isTropical(-40));
});

test('month spans read naturally, wrapping the year', () => {
  assert.equal(monthSpan([3, 4, 5, 6]), 'Mar–Jun');
  assert.equal(monthSpan([10, 11, 2, 3]), 'Feb–Mar, Oct–Nov');
  assert.equal(monthSpan([11, 12, 1, 2]), 'Nov–Feb');
  assert.equal(monthSpan([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), 'All year');
  assert.equal(monthSpan([]), '—');
  assert.equal(monthSpan(localMonths([3, 4, 5], 'south')), 'Sep–Nov');
});

test('a new plant starts its history with its sowing, under that day’s moon', () => {
  const now = new Date(2026, 9, 16, 10);
  const plant = newPlant({ name: '  Rosemary ', herb: 'rosemary', place: 'Pot by the door', started: '2026-10-10', startedBy: 'planted' }, now);
  assert.equal(plant.name, 'Rosemary');
  assert.equal(plant.events.length, 1);
  assert.equal(plant.events[0].kind, 'planted');
  assert.equal(plant.events[0].moon, moonOn('2026-10-10', now));
  const none = newPlant({ name: 'Mystery seedling' }, now);
  assert.equal(none.events.length, 0);
  assert.equal(none.started, null);
});

test('logging, harvest amounts, removing and marking gone', () => {
  const now = new Date(2026, 9, 16, 10);
  let plant = newPlant({ name: 'Mint', started: '2026-05-01', startedBy: 'sowed' }, now);
  plant = addEvent(plant, newEvent({ kind: 'harvested', on: '2026-07-01', amount: ' a handful ' }, now, 'h1'));
  plant = addEvent(plant, newEvent({ kind: 'tended', on: '2026-07-01', amount: 'ignored', note: 'Fed with nettle tea' }, now, 't1'));
  plant = addEvent(plant, newEvent({ kind: 'harvested', on: '2026-08-12', amount: '3 bundles' }, now, 'h2'));
  assert.deepEqual(history(plant).map((e) => e.id).slice(0, 3), ['h2', 't1', 'h1']);
  assert.equal(plant.events.find((e) => e.id === 'h1')!.amount, 'a handful');
  assert.equal(plant.events.find((e) => e.id === 't1')!.amount, undefined);
  const s = plantSummary(plant);
  assert.equal(s.harvests, 2);
  assert.equal(s.lastHarvest!.amount, '3 bundles');
  plant = removeEvent(plant, 'h2');
  assert.equal(plantSummary(plant).harvests, 1);
  const gone = markGone(plant, '2026-10-01', ' frost ');
  assert.equal(gone.goneOn, '2026-10-01');
  assert.equal(gone.goneNote, 'frost');
  const sorted = sortPlants([
    { createdAt: '2026-01-01T00:00:00Z', data: gone },
    { createdAt: '2026-01-01T00:00:00Z', data: newPlant({ name: 'Sage', started: '2026-03-01' }, now) },
  ]);
  assert.equal(sorted[0].data.name, 'Sage');
});

test('stored plants read defensively', () => {
  const p = asPlant({ name: 'Thyme', events: [{ id: 'a', on: '2026-01-01', kind: 'note', moon: 'Full Moon' }, null, { nope: 1 }] });
  assert.equal(p.events.length, 1);
  assert.equal(asPlant(null).name, 'A plant');
});
