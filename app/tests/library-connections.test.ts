import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ApothecaryItem } from '../src/lib/altar/apothecary.ts';
import {
  connectionGroups,
  editedRow,
  entryResolver,
  guestRelationRows,
  hasConnection,
  ingredientRelationRows,
  nameMatcher,
  practiceRelationRows,
  practiceTargets,
  storedConnections,
  type RelationRow,
} from '../src/lib/library/connections.ts';
import { buildJourney, EMPTY_JOURNEY_MESSAGE, journeyEvents, type JourneySources } from '../src/lib/library/journey.ts';
import { buildLibrary } from '../src/lib/library/model.ts';
import type { PracticeRow } from '../src/lib/library/types.ts';
import type { JournalRow, TemplateRow } from '../src/lib/rituals/types.ts';

const row = (extra: Partial<PracticeRow>): PracticeRow => ({
  entity_id: 'e1',
  name: 'basil',
  type: 'herb',
  image: null,
  my_practice: {},
  community: {},
  updated_at: null,
  ...extra,
});

const entries = buildLibrary([
  row({ entity_id: 'basil-id', name: 'Basil', my_practice: { Notes: 'Kitchen window' } }),
  row({ entity_id: 'jar-id', name: 'Money Jar', type: 'apothecary', my_practice: { Subtype: 'Spell Jar' } }),
  row({ entity_id: 'moon-id', name: 'Moon Water', type: 'note', my_practice: { Notes: 'Full moon' } }),
]);
const byId = (id: string) => entries.find((entry) => entry.id === id)!;
const basil = byId('traditional:herb:basil');
const rosemary = byId('traditional:herb:rosemary');
const mint = byId('traditional:herb:mint');
const jar = byId('practice:jar-id');

test('Connected To includes the Traditional pairings and substitutions, both ways', () => {
  const groups = connectionGroups(basil, entries, []);
  const names = (relation: string) => groups.find((group) => group.relation === relation)?.entries.map((entry) => entry.name) ?? [];
  assert.ok(names('pairs_with').includes('Rosemary'));
  assert.ok(names('substitutes').includes('Mint'));
  // Mint's page shows basil under "Substitute For" (the reverse relation).
  const mintGroups = connectionGroups(mint, entries, []);
  assert.ok(mintGroups.find((group) => group.relation === 'substitute_for')?.entries.some((entry) => entry.id === basil.id));
  // Groups follow the website's order.
  const order = groups.map((group) => group.relation);
  assert.ok(order.indexOf('pairs_with') < order.indexOf('substitutes'));
});

test('stored relations resolve entity ids and Traditional references; unknown ids and types are left out', () => {
  const rows: RelationRow[] = [
    { from_entity_id: 'jar-id', relation: 'contains', to_entity_id: 'basil-id' },
    { from_entity_id: 'basil-id', relation: 'ingredient_in', to_entity_id: 'jar-id' },
    { from_entity_id: 'basil-id', relation: 'offered_to', to_entity_id: 'traditional/deity/brigid' },
    { from_entity_id: 'basil-id', relation: 'related_to', to_entity_id: 'not-in-this-library' },
    { from_entity_id: 'basil-id', relation: 'made_up', to_entity_id: 'moon-id' },
  ];
  const groups = connectionGroups(basil, entries, rows);
  assert.deepEqual(groups.find((g) => g.relation === 'ingredient_in')?.entries.map((e) => e.id), [jar.id]);
  assert.equal(groups.find((g) => g.relation === 'contains')?.entries[0].id, jar.id);
  const offered = groups.find((g) => g.relation === 'offered_to');
  assert.equal(offered?.entries[0].type, 'deity');
  assert.equal(groups.some((g) => (g.relation as string) === 'made_up'), false);
  assert.equal(groups.some((g) => g.relation === 'related_to'), false);
});

test('pairings are matched by exact name, never loosely', () => {
  const match = nameMatcher(entries);
  assert.equal(match('rosemary')?.id, rosemary.id);
  assert.equal(match('ROSEMARY ')?.id, rosemary.id);
  const { pairs, substitutes } = practiceTargets({ PairsWith: 'Rosemary, Basil, Nothing Here', Substitutions: 'mint' }, basil, match);
  assert.deepEqual(pairs.map((e) => e.id), [rosemary.id]);
  assert.deepEqual(substitutes.map((e) => e.id), [mint.id]);
});

test('a My Practice save makes the website rows, with reverses', () => {
  const rows = practiceRelationRows('a', ['b', 'a'], ['c']);
  assert.deepEqual(
    rows.map((r) => `${r.from_entity_id} ${r.relation} ${r.to_entity_id}`),
    ['a pairs_with b', 'b pairs_with a', 'a substitutes c', 'c substitute_for a'],
  );
  assert.deepEqual(
    ingredientRelationRows('jar', ['x', 'x', 'jar']).map((r) => `${r.from_entity_id} ${r.relation} ${r.to_entity_id}`),
    ['jar contains x', 'x ingredient_in jar'],
  );
});

test('guest relations are read from the website guest Library', () => {
  const rows = guestRelationRows({ relations: [{ id: 'r1', from: 'a', relation: 'pairs_with', to: 'b' }, { from: 'a' }, null] });
  assert.deepEqual(rows, [{ id: 'r1', from_entity_id: 'a', relation: 'pairs_with', to_entity_id: 'b', metadata: {} }]);
  assert.deepEqual(guestRelationRows(null), []);
});

test('the relationship manager lists stored rows, collapses duplicates and keeps the entry on its end when edited', () => {
  const resolve = entryResolver(entries);
  const rows: RelationRow[] = [
    { from_entity_id: 'basil-id', relation: 'related_to', to_entity_id: 'moon-id' },
    { from_entity_id: 'basil-id', relation: 'related_to', to_entity_id: 'moon-id' },
    { from_entity_id: 'jar-id', relation: 'contains', to_entity_id: 'basil-id' },
  ];
  const list = storedConnections(basil, rows, resolve);
  assert.equal(list.length, 2);
  assert.equal(list[0].row.relation, 'contains');
  assert.equal(list[0].outgoing, false);
  assert.ok(hasConnection(basil, 'related_to', byId('practice:moon-id'), rows, resolve));
  assert.ok(!hasConnection(basil, 'related_to', byId('practice:moon-id'), rows, resolve, list[1].key));
  assert.deepEqual(editedRow(list[0], 'used_in', 'other'), { from_entity_id: 'other', relation: 'used_in', to_entity_id: 'basil-id', id: undefined });
  assert.equal(editedRow(list[1], 'pairs_with', 'other').to_entity_id, 'other');
});

const journal = (extra: Partial<JournalRow>): JournalRow =>
  ({
    id: 'j1',
    user_id: 'u',
    title: 'Prosperity working',
    source: 'digital_altar',
    template_id: null,
    grimoire_page_id: null,
    ritual_date: '2026-03-04',
    ended_at: null,
    created_at: '2026-03-04T20:00:00Z',
    altar_snapshot: {},
    ...extra,
  }) as JournalRow;

const sources = (extra: Partial<JourneySources>): JourneySources => ({
  journal: [],
  ritualLinks: [],
  templates: [],
  pages: [],
  apothecary: [],
  relations: [],
  ...extra,
});

test('the journey gathers rituals, templates, recipes and pages', () => {
  const data = sources({
    journal: [
      journal({ id: 'j1', altar_snapshot: { objects: [{ entityId: 'basil-id' }, { entityId: 'traditional/herb/rosemary' }] } }),
      journal({ id: 'j2', title: 'Second', ended_at: '2026-05-01T21:00:00Z', grimoire_page_id: 'p9', source: 'manual' }),
      journal({ id: 'j3', title: 'Unrelated' }),
    ],
    ritualLinks: [{ user_id: 'u', ritual_id: 'j2', link_type: 'used_entity', entity_id: 'traditional/herb/basil', metadata: {} }],
    templates: [
      { id: 't1', title: 'Money spell', updated_at: '2026-02-01T00:00:00Z', metadata: { ingredients: [{ ref: 'traditional/herb/basil', name: 'Basil' }] } } as unknown as TemplateRow,
    ],
    apothecary: [
      {
        id: 'a1',
        name: 'Money Jar',
        entityId: 'jar-id',
        createdAt: '2026-04-01T00:00:00Z',
        updatedAt: '',
        ingredients: [{ label: 'Basil', herb: 'basil' }, { label: 'Rosemary', entityId: 'traditional/herb/rosemary' }],
      } as unknown as ApothecaryItem,
    ],
    pages: [{ id: 'p1', book_id: 'b', section_id: null, title: 'Basil notes', page_type: 'blank', sort_order: 0, metadata: { entityIds: ['basil-id'] }, created_at: null, updated_at: '2026-01-15T00:00:00Z' }],
    relations: [{ from_entity_id: 'basil-id', relation: 'related_to', to_entity_id: 'moon-id' }],
  });

  const events = journeyEvents(basil, entries, data);
  assert.deepEqual(events.map((e) => e.id), ['page:p1', 'template:t1', 'ritual:j1', 'recipe:a1', 'ritual:j2']);

  const journey = buildJourney(basil, entries, data);
  assert.equal(journey.hasHistory, true);
  assert.equal(journey.timesUsed, 5);
  const summary = Object.fromEntries(journey.summary.map((s) => [s.label, s.value]));
  assert.match(summary['First Worked With'], /2026/);
  assert.match(summary['Most Recently Used'], /^Second · /);
  assert.equal(summary['Times Used'], '5 recorded appearances');
  // One manual, one digital altar: a tie goes alphabetically.
  assert.equal(summary['Most Common Ritual Type'], 'Digital Altar');

  assert.equal(journey.pairings[0].entry.id, rosemary.id);
  assert.equal(journey.pairings[0].frequency, 2);
  assert.ok(journey.pairings.some((p) => p.entry.id === jar.id));

  const group = (key: string) => journey.groups.find((g) => g.key === key);
  assert.deepEqual(group('rituals')?.items.map((i) => i.target), [
    { kind: 'journal', id: 'j1' },
    { kind: 'journal', id: 'j2' },
  ]);
  assert.equal(group('journals')?.items.length, 2);
  assert.deepEqual(group('pages')?.items.map((i) => i.target?.id), ['p1', 'p9']);
  assert.deepEqual(group('templates')?.items.map((i) => i.target), [{ kind: 'template', id: 't1' }]);
  assert.deepEqual(group('recipes')?.items.map((i) => i.target), [{ kind: 'entry', id: jar.id }]);
  const relationships = group('relationships')!.items;
  assert.ok(relationships.some((i) => i.target?.id === 'practice:moon-id' && i.detail.endsWith('Related To')));
  assert.ok(relationships.some((i) => i.target?.id === rosemary.id));

  assert.deepEqual(journey.recent.map((i) => i.key), ['ritual:j2', 'recipe:a1', 'ritual:j1', 'template:t1', 'page:p1']);
});

test('an entry nobody has used yet gets the website’s empty message', () => {
  const journey = buildJourney(mint, entries, sources({}));
  assert.equal(journey.hasHistory, false);
  assert.equal(journey.emptyMessage, EMPTY_JOURNEY_MESSAGE);
  assert.deepEqual(journey.summary, []);
  // Traditional connections still show under Library Relationships.
  assert.ok(journey.groups.some((g) => g.key === 'relationships'));
});
