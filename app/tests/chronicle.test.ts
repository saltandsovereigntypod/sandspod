import assert from 'node:assert/strict';
import { test } from 'node:test';

import { normalizeApothecary } from '../src/lib/altar/apothecary.ts';
import {
  buildTimeline,
  categoriesOf,
  chronicleRecords,
  filterEvents,
  groupEvents,
  milestones,
  recentThreads,
  reflectiveSummary,
  searchWords,
  sortEvents,
  type ChronicleRecord,
  type ChronicleSources,
} from '../src/lib/chronicle.ts';
import type { PageRow } from '../src/lib/grimoire/types.ts';
import { buildLibrary } from '../src/lib/library/model.ts';
import type { JournalRow, RitualSession, TemplateRow } from '../src/lib/rituals/types.ts';

// The website's own fixtures (tests/my-journey.test.js), so both behave alike.
const records: ChronicleRecord[] = [
  { id: 'late', category: 'rituals', title: 'Protection Working', timestamp: '2026-07-20T00:00:00Z', entityId: 'rose' },
  { id: 'early', category: 'pages', title: 'First Page', timestamp: '2026-01-02T00:00:00Z' },
  { id: 'recipe', category: 'apothecary', title: 'Rose Oil', fields: 'rosemary', timestamp: '2026-07-01T00:00:00Z', entityId: 'rose' },
];

test('normalizes, deduplicates, and orders journey events', () => {
  const events = buildTimeline([...records, records[0], { id: 'undated', category: 'pages', title: 'No date', timestamp: null }]);
  assert.equal(events.length, 3);
  assert.deepEqual(sortEvents(events).map((event) => event.id), ['late', 'recipe', 'early']);
  assert.deepEqual(sortEvents(events, 'oldest').map((event) => event.id), ['early', 'recipe', 'late']);
});

test('groups, filters, and searches one normalized event set', () => {
  const events = buildTimeline(records);
  assert.equal(groupEvents(events, 'year')[0].label, '2026');
  assert.equal(groupEvents(sortEvents(events), 'month', 'en-US')[0].label, 'July 2026');
  assert.deepEqual(filterEvents(events, { category: 'rituals' }).map((event) => event.id), ['late']);
  assert.deepEqual(filterEvents(events, { query: 'rosemary' }).map((event) => event.id), ['recipe']);
  assert.deepEqual(filterEvents(events, { query: 'protection-working' }).map((event) => event.id), ['late']);
  assert.deepEqual(categoriesOf(events), ['rituals', 'pages', 'apothecary']);
});

test('derives gentle milestones, summaries, and recent threads', () => {
  const events = buildTimeline(records);
  assert.ok(milestones(events).some((item) => item.label === 'Your first recorded ritual'));
  assert.ok(reflectiveSummary(events).some((line) => line.includes('distinct Living Library')));
  assert.equal(reflectiveSummary(events, 'en-US')[0], 'Your recorded Sanctuary begins on January 2, 2026.');
  assert.equal(recentThreads(events)[0].count, 2);
  assert.doesNotMatch([...reflectiveSummary(events), ...milestones(events).map((item) => item.label)].join(' '), /achievement|streak|overdue/i);
});

test('handles an empty chronicle', () => {
  assert.deepEqual(buildTimeline([]), []);
  assert.deepEqual(milestones([]), []);
  assert.deepEqual(reflectiveSummary([]), []);
});

test('search words leave out ids, pictures and markup', () => {
  const words = searchWords({ entity_id: 'x', image: 'a.png', Notes: '<b>Calm</b> nights', tags: ['moon'] });
  assert.match(words, /Calm\s+nights moon/);
  assert.doesNotMatch(words, /a\.png|<b>|\bx\b/);
  assert.equal(searchWords('0b6f0a52-1c2d-4e5f-8a9b-0c1d2e3f4a5b'), '');
});

test('the chronicle reads the same records the website indexes', () => {
  const library = buildLibrary([
    { entity_id: 'e-rose', name: 'Rose', type: 'herb', image: null, my_practice: { Notes: 'love work' }, community: null, updated_at: '2026-03-01T00:00:00Z' },
    { entity_id: 'e-jar', name: 'Sweet Jar', type: 'apothecary', image: null, my_practice: { Subtype: 'Spell Jar' }, community: null, updated_at: '2026-03-02T00:00:00Z' },
  ]);
  const page = { id: 'p1', title: 'Moon Notes', page_type: 'blank', updated_at: '2026-04-01T00:00:00Z', metadata: {} } as PageRow;
  const journalPage = { id: 'p2', title: 'Ritual: Full Moon', page_type: 'ritual_journal', updated_at: '2026-04-02T00:00:00Z' } as PageRow;
  const sources: ChronicleSources = {
    library,
    relations: [{ from_entity_id: 'e-jar', relation: 'contains', to_entity_id: 'e-rose' }],
    pages: [page, journalPage],
    blocks: [{ id: 'b1', page_id: 'p1', block_type: 'text', content: 'silver light', rich_content: null, metadata: null, sort_order: 0, created_at: null }],
    apothecary: [
      normalizeApothecary({ id: 'a1', name: 'Sweet Jar', type: 'spell-jar', entity_id: 'e-jar', ingredients: [{ label: 'Rose' }], updated_at: '2026-05-01T00:00:00Z' }),
    ],
    journal: [{ id: 'r1', title: 'Full Moon', intention: 'clarity', created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-02T00:00:00Z' } as JournalRow],
    templates: [
      { id: 't1', title: 'Weekly Cleansing', status: 'active', updated_at: '2026-02-01T00:00:00Z' } as TemplateRow,
      { id: 't2', title: 'Old', status: 'archived', updated_at: '2026-02-02T00:00:00Z' } as TemplateRow,
    ],
    active: { id: 's1', title: 'Tonight', status: 'active', started_at: '2026-10-12T20:00:00Z' } as RitualSession,
  };
  const events = buildTimeline(chronicleRecords(sources));
  const byId = new Map(events.map((event) => [event.id, event]));

  // Only entries with the person's own rows, at the time they were saved.
  const rose = byId.get('traditional:herb:rose') ?? events.find((event) => event.title === 'Rose');
  assert.ok(rose);
  assert.equal(rose.category, 'library');
  assert.equal(rose.timestamp, '2026-03-01T00:00:00.000Z');
  assert.equal(rose.description, 'Linked to Sweet Jar');
  assert.equal(rose.target?.kind, 'entry');
  assert.equal(events.filter((event) => event.category === 'library').length, 2);

  assert.equal(byId.get('p1')?.description, 'Book of Shadows Page');
  assert.deepEqual(filterEvents(events, { query: 'silver' }).map((event) => event.id), ['p1']);
  assert.equal(byId.has('p2'), false);

  assert.equal(byId.get('a1')?.description, 'Contains Rose');
  assert.equal(byId.get('a1')?.target?.kind, 'entry');
  assert.equal(byId.get('r1')?.timestamp, '2026-06-02T00:00:00.000Z');
  assert.deepEqual(byId.get('r1')?.target, { kind: 'journal', id: 'r1' });
  assert.equal(byId.get('active:s1')?.description, 'active');
  assert.equal(byId.get('t1')?.description, 'Ritual Template');
  assert.equal(byId.has('t2'), false);

  // With the Traditional layer off, entries without My Practice or Community notes stay out.
  const off = buildTimeline(chronicleRecords({ ...sources, layers: { traditional: false, myPractice: false } }));
  assert.equal(off.filter((event) => event.category === 'library').length, 0);
});
