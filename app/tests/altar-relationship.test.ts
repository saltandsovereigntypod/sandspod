import assert from 'node:assert/strict';
import { test } from 'node:test';

import { dedicateCrystal, recordOffering, type OfferingInput } from '../src/lib/altar/devotion.ts';
import { deityName, deityRelationship, feastDays, FEASTS, offeringSteps } from '../src/lib/altar/relationship.ts';
import { TRADITIONS } from '../src/lib/holidays.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const DAY = 86_400_000;
const start = Date.UTC(2026, 2, 1, 12);
const iso = (days: number) => new Date(start + days * DAY).toISOString();
const offering = (days: number, extra: Partial<OfferingInput> = {}): OfferingInput => ({
  types: ['Food'],
  supports: [],
  customItems: 'bread',
  intention: 'gratitude',
  message: '',
  status: 'Offered',
  customStatus: '',
  response: '',
  responseNotes: '',
  occurredAt: iso(days),
  ...extra,
});
const hekate = (): SavedObject => ({ type: 'deity', deity: 'hekate', label: 'Hekate Statue', altarObjectId: 'h1' });

test('every feast named for a deity is a real holiday in holidays.ts', () => {
  for (const [deity, picks] of Object.entries(FEASTS)) {
    for (const pick of picks) {
      const [t, h] = pick.split('/');
      assert.ok(TRADITIONS.find((x) => x.id === t)?.holidays.some((d) => d.id === h), `${deity}: ${pick}`);
    }
  }
});

test('the name is said plainly', () => {
  assert.equal(deityName(hekate()), 'Hekate');
  assert.equal(deityName({ type: 'deity', deity: 'brigid' }), 'Brigid');
});

test('the relationship: offerings, signs, dedications, first and last', () => {
  let deity = hekate();
  deity = recordOffering(deity, offering(0), iso(0));
  deity = recordOffering(deity, offering(10, { response: 'Strong presence felt' }), iso(10));
  deity = recordOffering(deity, offering(20, { response: 'Not yet known' }), iso(20));
  const stone = dedicateCrystal({ type: 'crystal', label: 'Obsidian', altarObjectId: 'o1' }, { type: 'Deity', entityId: '', dedicatedTo: 'Hekate of the crossroads', intention: '', duration: 'Until manually removed', reviewAt: '', notes: '' }, iso(1));
  const other = dedicateCrystal({ type: 'crystal', label: 'Rose quartz', altarObjectId: 'r1' }, { type: 'Self', entityId: '', dedicatedTo: 'Myself', intention: '', duration: 'Until manually removed', reviewAt: '', notes: '' }, iso(1));
  const r = deityRelationship(deity, [deity, stone, other], new Date(start + 24 * DAY));
  assert.equal(r.offerings, 3);
  assert.equal(r.signs, 1);
  assert.deepEqual(r.dedications, ['Obsidian']);
  assert.equal(r.firstAt, iso(0));
  assert.equal(r.lastAt, iso(20));
  assert.match(r.summary, /3 offerings since/);
  assert.match(r.summary, /the last 4 days ago/);
  assert.match(r.summary, /Obsidian is dedicated to Hekate/);
});

test('no offerings yet says so', () => {
  const r = deityRelationship(hekate(), [], new Date(start));
  assert.equal(r.offerings, 0);
  assert.match(r.summary, /No offerings to Hekate/);
});

test('feast days come from the deity’s own tradition, soonest first', () => {
  const from = new Date(2026, 9, 16);
  const hek = feastDays(hekate(), from);
  assert.equal(hek.length, 1);
  assert.match(hek[0].name, /Deipnon/);
  assert.ok(hek[0].date.getTime() >= new Date(2026, 9, 16).getTime() - DAY && hek[0].date.getTime() < from.getTime() + 32 * DAY);
  const brigid = feastDays({ type: 'deity', deity: 'brigid' }, from);
  assert.ok(brigid.length >= 1);
  assert.equal(brigid[0].date.getMonth(), 1);
  assert.equal(brigid[0].date.getDate(), 1);
  for (let i = 1; i < brigid.length; i++) assert.ok(brigid[i].date >= brigid[i - 1].date);
  assert.deepEqual(feastDays({ type: 'deity', deity: 'odin' }, from), [], 'none listed: none made up');
});

test('the offering moment: pour when poured, set it down, then speak', () => {
  const wine = offeringSteps({ types: ['Drink'], items: ['red wine'], message: 'For the crossroads.', name: 'Hekate' });
  assert.deepEqual(wine.map((s) => s.id), ['pour', 'set', 'speak']);
  assert.match(wine[2].line, /For the crossroads/);
  const bread = offeringSteps({ types: ['Food'], items: ['bread'], message: '', name: 'Hekate' });
  assert.deepEqual(bread.map((s) => s.id), ['set', 'speak']);
  assert.match(bread[0].line, /bread before Hekate/);
  const song = offeringSteps({ types: ['Song or music'], items: [], message: '', name: 'Brigid' });
  assert.deepEqual(song.map((s) => s.id), ['speak']);
  assert.equal(song[0].title, 'Sing');
});
