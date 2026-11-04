// The garden and foraging calendar: a month's sowing, gathering and foraging,
// turned for the southern hemisphere as Settings say, and what of your own
// garden, patches, pots and shelves is in season.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calendarHemisphere, gardenCalendar, seasonPlantFor, yearGrid } from '../src/lib/craft/green/calendar.ts';
import { newPlant } from '../src/lib/craft/green/garden.ts';
import { blankPatch } from '../src/lib/craft/hearth/forage.ts';

test('the hemisphere follows the setting, then the place', () => {
  assert.equal(calendarHemisphere({ calendar_hemisphere: 'south' }, 51.5), 'south');
  assert.equal(calendarHemisphere(null, -33.9), 'south');
  assert.equal(calendarHemisphere(null, null), 'north');
});

test('a month in the south is the northern month six months on', () => {
  const north = gardenCalendar(5, 'north');
  const south = gardenCalendar(11, 'south');
  assert.deepEqual(south.sow.map((p) => p.key), north.sow.map((p) => p.key));
  assert.deepEqual(south.forage.map((p) => p.key), north.forage.map((p) => p.key));
  assert.ok(north.forage.some((p) => p.key === 'wild_garlic'), 'wild garlic in May');
  assert.ok(!gardenCalendar(5, 'south').forage.some((p) => p.key === 'wild_garlic'), 'not in a southern May');
});

test('your own plants, patches, pots and shelf herbs show in their months', () => {
  const basil = newPlant({ name: 'Basil on the sill', herb: 'basil', place: 'kitchen' } as never, new Date(2026, 4, 1));
  const gone = { ...newPlant({ name: 'Old basil', herb: 'basil', place: '' } as never, new Date(2026, 4, 1)), goneOn: '2026-06-01' };
  const patch = { ...blankPatch(), name: 'Ramsons by the brook', forage: 'wild_garlic', spot: 'by the brook' };
  const cal = gardenCalendar(7, 'north', {
    garden: [{ id: 'g1', data: basil }, { id: 'g2', data: gone }],
    patches: [{ id: 'p1', data: patch }],
    potted: [{ id: 'a:o', name: 'Margaret the basil' }],
    shelves: [{ id: 's1', item: { name: 'Dried basil', ref: 'traditional/herb/basil', shelf: 'herbs' } }, { id: 's2', item: { name: 'Basil oil', ref: '', shelf: 'oils' } }],
  });
  assert.deepEqual(cal.yours.map((y) => [y.kind, y.key]), [
    ['gather', 'garden:g1:gather'],
    ['gather', 'potted:a:o'],
    ['restock', 'shelf:s1'],
  ]);
  assert.equal(cal.yours[0].href, '/rituals/craft/green/plant/g1');
  const spring = gardenCalendar(4, 'north', { patches: [{ id: 'p1', data: patch }] });
  assert.equal(spring.yours[0].kind, 'forage');
  assert.match(spring.yours[0].href, /harvest-edit\?patch=p1$/);
});

test('names find their garden plant', () => {
  assert.equal(seasonPlantFor(null, 'Margaret the basil')?.key, 'basil');
  assert.equal(seasonPlantFor('bay', 'anything')?.key, 'bay');
  assert.equal(seasonPlantFor(null, 'Pothos'), null);
});

test('the whole year has twelve months for each plant', () => {
  const north = yearGrid('north');
  const south = yearGrid('south');
  const garlic = north.find((r) => r.key === 'forage:wild_garlic')!;
  assert.equal(garlic.gather.length, 12);
  assert.deepEqual(garlic.gather.map((on, i) => (on ? i + 1 : 0)).filter(Boolean), [3, 4, 5]);
  assert.deepEqual(south.find((r) => r.key === 'forage:wild_garlic')!.gather.map((on, i) => (on ? i + 1 : 0)).filter(Boolean), [9, 10, 11]);
});
