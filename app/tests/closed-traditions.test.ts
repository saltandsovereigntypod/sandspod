import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CLOSED_GUIDE_LIVE,
  CLOSED_TRADITIONS,
  closedById,
  closedGroups,
  correctionUrl,
  fold,
  relatedTo,
  searchClosed,
  SOURCING_NOTES,
  sourcingFor,
  sourcingForEntry,
  sourcingNotes,
  SUPPORT_EMAIL,
  type ClosedTradition,
  type SourcingNote,
} from '../src/lib/library/closed/index.ts';

const make = (over: Partial<ClosedTradition> & Pick<ClosedTradition, 'id' | 'name' | 'group'>): ClosedTradition => ({
  aka: [],
  openness: 'closed',
  peoples: 'A people',
  summary: 'A summary.',
  sections: [],
  howPeopleComeIn: 'Through family.',
  openAndClosed: 'Mostly closed.',
  myths: [],
  please: [],
  learn: 'Learn from the people.',
  reading: [],
  ...over,
});

const SAMPLE: ClosedTradition[] = [
  make({ id: 'vodou', name: 'Haitian Vodou', aka: ['Vodun', 'Voodoo'], group: 'african-diaspora', openness: 'initiatory', related: ['santeria', 'missing', 'vodou'] }),
  make({ id: 'santeria', name: 'Lucumí', aka: ['Santería', 'Regla de Ocha'], group: 'african-diaspora', openness: 'initiatory' }),
  make({ id: 'curanderismo', name: 'Curanderismo', group: 'other', openness: 'debated' }),
];

const NOTES: SourcingNote[] = [
  { ref: 'traditional/herb/white-sage', name: 'White sage (Salvia apiana)', concern: 'Overharvested.', instead: 'Grow garden sage.' },
  { ref: 'traditional/herb/sandalwood', name: 'Sandalwood', concern: 'Endangered.', instead: 'Buy certified.' },
  { name: 'Palo santo', concern: 'Wild-harvested.', instead: 'Check it is from fallen wood.' },
];

test('the guide stays hidden until reviewed', () => {
  assert.equal(CLOSED_GUIDE_LIVE, false);
});

test('the real data is well formed (empty or full)', () => {
  const ids = new Set<string>();
  for (const t of CLOSED_TRADITIONS) {
    assert.match(t.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, t.id);
    assert.ok(!ids.has(t.id), `duplicate id ${t.id}`);
    ids.add(t.id);
    assert.ok(t.name && t.summary && t.learn, t.id);
    assert.equal(closedById(t.id), t);
    assert.ok(searchClosed(t.name).includes(t));
    for (const aka of t.aka) assert.ok(searchClosed(aka).includes(t), `${t.id} by ${aka}`);
  }
  for (const t of CLOSED_TRADITIONS) for (const r of t.related ?? []) assert.ok(ids.has(r), `${t.id} relates to unknown ${r}`);
  const grouped = closedGroups().flatMap((g) => g.items);
  assert.equal(grouped.length, CLOSED_TRADITIONS.length);
  for (const n of SOURCING_NOTES) {
    assert.ok(n.name && n.concern && n.instead, n.name);
    assert.ok(sourcingFor(n.ref ?? n.name), n.name);
    if (n.tradition && CLOSED_TRADITIONS.length) assert.ok(ids.has(n.tradition), `${n.name} names unknown tradition ${n.tradition}`);
  }
  assert.equal(sourcingNotes().length, SOURCING_NOTES.length);
});

test('lookups by id and groups in order', () => {
  assert.equal(closedById('vodou', SAMPLE)?.name, 'Haitian Vodou');
  assert.equal(closedById('nope', SAMPLE), null);
  assert.equal(closedById(null, SAMPLE), null);
  const groups = closedGroups(SAMPLE);
  assert.deepEqual(groups.map((g) => g.group), ['african-diaspora', 'other']);
  assert.deepEqual(groups[0].items.map((t) => t.id), ['vodou', 'santeria']);
  assert.deepEqual(closedGroups([]), []);
});

test('search matches names and other names, ignoring case and accents', () => {
  assert.equal(searchClosed('', SAMPLE).length, 3);
  assert.deepEqual(searchClosed('voodoo', SAMPLE).map((t) => t.id), ['vodou']);
  assert.deepEqual(searchClosed('santeria', SAMPLE).map((t) => t.id), ['santeria']);
  assert.deepEqual(searchClosed('LUCUMI', SAMPLE).map((t) => t.id), ['santeria']);
  assert.deepEqual(searchClosed('xyz', SAMPLE), []);
  assert.equal(fold('Santería!'), 'santeria');
});

test('related skips missing ids and itself', () => {
  assert.deepEqual(relatedTo(SAMPLE[0], SAMPLE).map((t) => t.id), ['santeria']);
  assert.deepEqual(relatedTo(SAMPLE[1], SAMPLE), []);
});

test('sourcing matches by ref, then by name', () => {
  assert.equal(sourcingFor('traditional/herb/sandalwood', NOTES)?.name, 'Sandalwood');
  assert.equal(sourcingFor('White sage', NOTES)?.name, 'White sage (Salvia apiana)');
  assert.equal(sourcingFor('palo santo', NOTES)?.name, 'Palo santo');
  assert.equal(sourcingFor('traditional/incense/palo-santo', NOTES)?.name, 'Palo santo');
  assert.equal(sourcingFor('Sage', NOTES), null);
  assert.equal(sourcingFor('traditional/herb/rosemary', NOTES), null);
  assert.equal(sourcingFor('', NOTES), null);
  assert.equal(sourcingFor(null, NOTES), null);
  assert.equal(sourcingForEntry({ traditionalRef: null, name: 'Sandalwood' }, NOTES)?.name, 'Sandalwood');
  assert.equal(sourcingForEntry({ traditionalRef: 'traditional/herb/white-sage', name: 'Sage, white' }, NOTES)?.ref, 'traditional/herb/white-sage');
  assert.deepEqual(sourcingNotes(NOTES).map((n) => n.name), ['Palo santo', 'Sandalwood', 'White sage (Salvia apiana)']);
  assert.equal(sourcingFor('Sandalwood', []), null);
});

test('a correction email names the tradition and its id', () => {
  const url = correctionUrl(SAMPLE[0]);
  assert.ok(url.startsWith(`mailto:${SUPPORT_EMAIL}?subject=`));
  assert.ok(url.includes(encodeURIComponent('Correction: Haitian Vodou')));
  assert.ok(decodeURIComponent(url).includes('closed/vodou'));
  assert.ok(correctionUrl().includes(encodeURIComponent('Closed & living traditions')));
});
