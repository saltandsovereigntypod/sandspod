import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  closeSpell,
  isComplete,
  missedDays,
  newSpell,
  spellProgress,
  spellsForAltar,
  spellToday,
  tickSpell,
} from '../src/lib/altar/workings/spells.ts';

const day = (n: number, h = 20) => new Date(2026, 9, 16 + n, h);

test('a new spell takes its length from its kind', () => {
  assert.equal(newSpell({ altarId: 'a', kind: 'seven-day-candle' }, day(0).toISOString()).days, 7);
  assert.equal(newSpell({ altarId: 'a', kind: 'jar-28' }, day(0).toISOString()).days, 28);
  const custom = newSpell({ altarId: 'a', kind: 'custom', days: 400, title: '  My   working ' }, day(0).toISOString());
  assert.equal(custom.days, 90);
  assert.equal(custom.title, 'My working');
});

test('today’s step moves on one tending at a time, once a day', () => {
  let spell = newSpell({ altarId: 'a', kind: 'nine-night', objectUid: 'c1' }, day(0).toISOString());
  let today = spellToday(spell, day(0));
  assert.equal(today.status, 'tend');
  assert.equal(today.step, 1);
  assert.match(today.instruction, /first ninth/);
  spell = tickSpell(spell, day(0), 'felt warm');
  assert.equal(spell.ticks[0].note, 'felt warm');
  assert.equal(tickSpell(spell, day(0, 23)), spell, 'only once a day');
  today = spellToday(spell, day(0, 22));
  assert.equal(today.status, 'done-today');
  assert.equal(spellToday(spell, day(1)).step, 2);
});

test('a missed day doesn’t fail it: it waits, and the next tending is the next step', () => {
  let spell = newSpell({ altarId: 'a', kind: 'seven-day-candle' }, day(0).toISOString());
  spell = tickSpell(spell, day(0));
  assert.equal(missedDays(spell, day(1)), 0);
  assert.equal(missedDays(spell, day(4)), 3);
  const today = spellToday(spell, day(4));
  assert.equal(today.status, 'tend');
  assert.equal(today.step, 2);
  assert.match(today.waited, /waited 3 days/);
  spell = tickSpell(spell, day(4));
  assert.equal(spell.ticks[1].day, 2);
  assert.equal(missedDays(newSpell({ altarId: 'a', kind: 'novena' }, day(0).toISOString()), day(2)), 2);
});

test('completion, the last day’s step, and closing with a reflection', () => {
  let spell = newSpell({ altarId: 'a', kind: 'custom', days: 3 }, day(0).toISOString());
  for (let n = 0; n < 3; n += 1) {
    if (n === 2) assert.match(spellToday(spell, day(n)).instruction, /give thanks/i);
    spell = tickSpell(spell, day(n));
  }
  assert.equal(isComplete(spell), true);
  assert.equal(spellProgress(spell), 1);
  assert.equal(spellToday(spell, day(5)).status, 'complete');
  assert.equal(missedDays(spell, day(9)), 0);
  assert.equal(tickSpell(spell, day(5)), spell);
  const closed = closeSpell(spell, ' It worked gently. ', day(5));
  assert.equal(closed.reflection, 'It worked gently.');
  assert.equal(spellToday(closed, day(6)).status, 'closed');
});

test('an altar’s spells, those needing tending first', () => {
  const a = newSpell({ altarId: 'x', kind: 'novena' }, day(0).toISOString());
  const b = tickSpell(newSpell({ altarId: 'x', kind: 'novena' }, day(0).toISOString()), day(1));
  const c = newSpell({ altarId: 'other', kind: 'novena' }, day(0).toISOString());
  const list = spellsForAltar([{ data: b }, { data: a }, { data: c }], 'x', day(1));
  assert.deepEqual(list.map((e) => e.data), [a, b]);
});
