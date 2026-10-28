import assert from 'node:assert/strict';
import { test } from 'node:test';

import { traditionalEntries } from '../src/lib/library/model.ts';
import { searchEverything, snippet } from '../src/lib/search.ts';
import { normalizeReading } from '../src/lib/craft/hedge/readings.ts';
import { normalizeDream } from '../src/lib/craft/hedge/dreams.ts';
import type { BlockRow, PageRow } from '../src/lib/grimoire/types.ts';
import type { JournalRow, TemplateRow } from '../src/lib/rituals/types.ts';

const page = (id: string, title: string): PageRow => ({ id, title, book_id: 'b', section_id: null, page_type: 'blank', sort_order: 0, metadata: null, created_at: null, updated_at: null });
const block = (page_id: string, html: string): BlockRow => ({ id: `${page_id}-b`, page_id, block_type: 'text', content: null, rich_content: { html }, metadata: null, sort_order: 0, created_at: null });

const sources = {
  library: traditionalEntries(),
  pages: [page('p1', 'Door wash'), page('p2', 'Rosemary notes'), page('p3', 'Moon water')],
  blocks: [block('p1', '<p>Steep <b>rosemary</b> and salt, then wash the threshold.</p>'), block('p3', '<p>Leave a jar out.</p>')],
  journal: [
    { id: 'j1', title: 'Protection rite', what_happened_during: 'Burned rosemary at the door and felt the room settle.' } as JournalRow,
    { id: 'j2', title: 'Tea and quiet', notes: 'Nothing much.' } as JournalRow,
  ],
  templates: [{ id: 't1', title: 'House blessing', intention: 'Bless the home', preparation: null, closing: null, ritual_template_steps: [{ title: 'Sweep', instructions: 'Sweep with a rosemary bundle', spoken_text: null }] } as unknown as TemplateRow],
};

test('one search finds the herb, the pages, the journal and the templates', () => {
  const hits = searchEverything(sources, 'rosemary');
  assert.equal(hits.library[0].title, 'Rosemary');
  assert.deepEqual(hits.page.map((h) => h.id), ['p2', 'p1'], 'a title match comes first');
  assert.match(hits.page[1].detail, /rosemary and salt/);
  assert.deepEqual(hits.journal.map((h) => h.id), ['j1']);
  assert.match(hits.journal[0].detail, /Burned rosemary at the door/);
  assert.deepEqual(hits.template.map((h) => h.id), ['t1']);
});

test('short or empty queries find nothing, and case doesn’t matter', () => {
  assert.equal(searchEverything(sources, 'r').journal.length, 0);
  assert.equal(searchEverything(sources, '  ').library.length, 0);
  assert.equal(searchEverything(sources, 'MOON WATER').page[0].id, 'p3');
});

test('search covers divination readings and dreams too, and still works without them', () => {
  const entry = <T>(id: string, data: T) => ({ id, data, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' });
  const readings = [
    entry('r1', normalizeReading({ date: '2026-10-20', method: 'tarot', question: 'Should I move house?', drawn: ['The Tower', 'Six of Cups'], interpretation: 'Change is coming' })),
    entry('r2', normalizeReading({ date: '2026-10-21', method: 'runes', question: 'The garden', drawn: ['Fehu'], cameUp: 'A rosemary hedge kept turning up' })),
  ];
  const dreams = [entry('d1', normalizeDream({ date: '2026-10-22', title: 'The flooded house', dream: 'Water rose through the floor', symbols: ['water'] }))];
  const withMore = { ...sources, readings, dreams } as unknown as Parameters<typeof searchEverything>[0];

  const tower = searchEverything(withMore, 'tower');
  assert.deepEqual(tower.reading.map((h) => h.id), ['r1'], 'a drawn card finds its reading');
  assert.match(tower.reading[0].detail, /2026-10-20 · The Tower, Six of Cups/);

  const rosemary = searchEverything(withMore, 'rosemary');
  assert.deepEqual(rosemary.reading.map((h) => h.id), ['r2']);
  assert.match(rosemary.reading[0].detail, /rosemary hedge/, 'says why it matched');

  const water = searchEverything(withMore, 'water');
  assert.deepEqual(water.dream.map((h) => h.id), ['d1']);
  assert.equal(water.dream[0].title, 'The flooded house');

  const house = searchEverything(withMore, 'house');
  assert.deepEqual(house.dream.map((h) => h.id), ['d1']);
  assert.deepEqual(house.reading.map((h) => h.id), ['r1']);

  // Callers that don't pass readings or dreams get empty groups.
  const plain = searchEverything(sources, 'rosemary');
  assert.deepEqual(plain.reading, []);
  assert.deepEqual(plain.dream, []);
  assert.deepEqual(searchEverything(withMore, 'x').dream, []);
});

test('snippets show a little either side of the match', () => {
  const text = 'a'.repeat(100) + ' rosemary ' + 'b'.repeat(100);
  const s = snippet(text, 'rosemary', 10);
  assert.ok(s.startsWith('…') && s.endsWith('…') && s.includes('rosemary'));
});
