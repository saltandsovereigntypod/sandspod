import assert from 'node:assert/strict';
import { test } from 'node:test';

import { customDate, customsAhead, customsInMonth, FOLK_CUSTOMS, type FolkCustom } from '../src/lib/craft/folk/calendar.ts';
import { filterLore, lorePlaces, loreCounts, normalizeLore, type LoreEntry } from '../src/lib/craft/folk/lore.ts';
import { ANY_MONTH, BY_MONTH, seasonalMonth } from '../src/lib/craft/folk/weather.ts';
import { PREMADE } from '../src/lib/rituals/premade/index.ts';

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const on = (id: string, year: number) => key(customDate(FOLK_CUSTOMS.find((c) => c.id === id)!.rule, year));

test('every custom has a unique id, a region, what people did and a way to keep it', () => {
  assert.ok(FOLK_CUSTOMS.length >= 45, `${FOLK_CUSTOMS.length}`);
  const ids = new Set<string>();
  const premade = new Set(PREMADE.map((p) => p.id));
  for (const c of FOLK_CUSTOMS) {
    assert.match(c.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, c.id);
    assert.ok(!ids.has(c.id), `duplicate ${c.id}`);
    ids.add(c.id);
    assert.ok(c.name && c.region && c.did.length > 40 && c.keep.length > 20, c.id);
    if (c.premade) assert.ok(premade.has(c.premade), `${c.id} premade ${c.premade}`);
  }
  // Every month has customs.
  for (let m = 1; m <= 12; m++) assert.ok(customsInMonth(m, 2026).length >= 2, `month ${m}`);
});

test('fixed days, with the moves some places make for Sundays', () => {
  assert.equal(on('st-swithins-day', 2026), '2026-07-15');
  assert.equal(on('old-twelvy', 2026), '2026-01-17');
  assert.equal(on('haxey-hood', 2030), '2030-01-05', '6 January 2030 is a Sunday');
  assert.equal(on('haxey-hood', 2026), '2026-01-06');
  assert.equal(on('padstow-oss', 2022), '2022-05-02', '1 May 2022 was a Sunday');
  assert.equal(on('helston-flora', 2022), '2022-05-07', '8 May 2022 was a Sunday');
  assert.equal(on('helston-flora', 2023), '2023-05-06', '8 May 2023 was a Monday');
  assert.equal(on('helston-flora', 2026), '2026-05-08');
  assert.equal(on('tynwald-day', 2025), '2025-07-07');
  assert.equal(on('tynwald-day', 2026), '2026-07-06');
});

test('movable feasts follow Easter', () => {
  // Easter 2026 is 5 April; 2027 is 28 March.
  assert.equal(on('shrove-tuesday', 2026), '2026-02-17');
  assert.equal(on('fat-thursday', 2026), '2026-02-12');
  assert.equal(on('mothering-sunday', 2026), '2026-03-15');
  assert.equal(on('flowering-sunday', 2026), '2026-03-29');
  assert.equal(on('good-friday', 2026), '2026-04-03');
  assert.equal(on('pace-egging', 2026), '2026-04-06');
  assert.equal(on('rogationtide', 2026), '2026-05-10');
  assert.equal(on('well-dressing', 2026), '2026-05-14', 'Ascension Day');
  assert.equal(on('whitsun', 2026), '2026-05-24');
  assert.equal(on('shrove-tuesday', 2027), '2027-02-09');
});

test('weekday rules', () => {
  assert.equal(on('plough-monday', 2026), '2026-01-12');
  assert.equal(on('plough-monday', 2025), '2025-01-13', 'the Monday after a Monday Epiphany');
  assert.equal(on('up-helly-aa', 2026), '2026-01-27');
  assert.equal(on('up-helly-aa', 2025), '2025-01-28');
  assert.equal(on('midsommar', 2026), '2026-06-19');
  assert.equal(on('midsommar', 2025), '2025-06-20');
  assert.equal(on('garland-sunday', 2026), '2026-07-26');
  assert.equal(on('horn-dance', 2026), '2026-09-07');
  assert.equal(on('horn-dance', 2022), '2022-09-12', '4 Sept 2022 was itself a Sunday, so Wakes Sunday was the 11th');
  assert.equal(on('punkie-night', 2026), '2026-10-29');
  assert.equal(on('stir-up-sunday', 2026), '2026-11-22');
});

test('customs in the next 30 days, including ones already running and across the new year', () => {
  const ahead = customsAhead(new Date(2026, 9, 16, 18));
  const ids = ahead.map((c) => c.custom.id);
  assert.deepEqual(ids.slice(0, 3), ['punkie-night', 'halloween', 'souling']);
  assert.ok(ids.includes('martinmas'));
  assert.ok(!ids.includes('st-andrews-eve'));
  const winter = customsAhead(new Date(2026, 11, 28), 10).map((c) => c.custom.id);
  assert.ok(winter.includes('mari-lwyd'), 'running since Christmas Eve');
  assert.ok(winter.includes('hogmanay') && winter.includes('calennig') && winter.includes('epiphany-chalking'));
  const running = customsAhead(new Date(2026, 11, 28), 10).find((c) => c.custom.id === 'mari-lwyd')!;
  assert.equal(running.inDays, 0);
});

const lore = (id: string, data: Record<string, unknown>, createdAt: string): LoreEntry => ({ id, createdAt, data: normalizeLore(data) });

test('local lore filters by kind and searches', () => {
  const list = [
    lore('a', { kind: 'place', title: 'The Wishing Well', where: 'Madron', lore: 'Rags tied to the thorn' }, '2026-10-01'),
    lore('b', { kind: 'spirit', title: 'Black dog of the lane', where: 'madron', source: 'Mrs Penrose' }, '2026-10-03'),
    lore('c', { kind: 'saying', title: 'When Carn Galver wears a hat', where: 'Zennor' }, '2026-10-02'),
  ];
  assert.deepEqual(filterLore(list, null, '').map((e) => e.id), ['b', 'c', 'a']);
  assert.deepEqual(filterLore(list, 'spirit', '').map((e) => e.id), ['b']);
  assert.deepEqual(filterLore(list, null, 'penrose').map((e) => e.id), ['b']);
  assert.deepEqual(filterLore(list, null, 'madron thorn').map((e) => e.id), ['a']);
  assert.equal(loreCounts(list).place, 1);
  assert.deepEqual(lorePlaces(list), [
    { where: 'Madron', count: 2 },
    { where: 'Zennor', count: 1 },
  ]);
  assert.equal(normalizeLore({ kind: 'nonsense' }).kind, 'other');
});

test('weather sayings: four to six a month, each with a verdict and a note', () => {
  assert.equal(BY_MONTH.length, 12);
  for (const month of BY_MONTH) {
    assert.ok(month.length >= 4 && month.length <= 6);
    for (const s of [...month, ...ANY_MONTH]) assert.ok(s.saying && s.note.length > 20 && ['sound', 'partly', 'no'].includes(s.verdict), s.saying);
  }
  assert.ok(ANY_MONTH.some((s) => s.saying.startsWith('Red sky at night')));
  assert.ok(BY_MONTH[6].some((s) => s.saying.includes('Swithin')));
  assert.ok(BY_MONTH[4].some((s) => s.saying.includes('clout')));
});

test('south of the equator, the sayings follow the season', () => {
  assert.equal(seasonalMonth(6, 51.5), 6);
  assert.equal(seasonalMonth(6, -33.9), 0);
  assert.equal(seasonalMonth(1, -33.9), 7);
  assert.equal(seasonalMonth(9, null), 9);
});

// Keeps the type in use for the compiler.
export type _Custom = FolkCustom;
