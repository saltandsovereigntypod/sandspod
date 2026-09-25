import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseCalendarDate } from '../src/lib/calendar.ts';
import { listItems, parseRichText, plainText } from '../src/lib/grimoire/richText.ts';
import { pageFacts, tableOfContents } from '../src/lib/grimoire/structure.ts';
import type { GrimoireSnapshot, PageRow } from '../src/lib/grimoire/types.ts';

test('plain text passes through untouched', () => {
  assert.deepEqual(parseRichText('Light the candle.'), [{ text: 'Light the candle.' }]);
});

test('the website’s allowed tags become styled runs', () => {
  assert.deepEqual(parseRichText('Speak <b>clearly</b> and <i>slowly</i><br>then rest'), [
    { text: 'Speak ' },
    { text: 'clearly', bold: true },
    { text: ' and ' },
    { text: 'slowly', italic: true },
    { text: '\nthen rest' },
  ]);
});

test('entities decode and unknown tags keep only their text', () => {
  assert.equal(plainText('Salt &amp; <script>x</script>Sovereignty&nbsp;&#39;26'), "Salt & xSovereignty '26");
});

test('only http links stay links', () => {
  const [safe] = parseRichText('<a href="https://saltandsovereignty.com">site</a>');
  assert.equal(safe.href, 'https://saltandsovereignty.com');
  const [unsafe] = parseRichText('<a href="javascript:alert(1)">x</a>');
  assert.equal(unsafe.href, undefined);
});

test('list blocks split into trimmed lines', () => {
  assert.deepEqual(listItems(' bay leaf \n\ncedar<br>white candle'), ['bay leaf', 'cedar', 'white candle']);
});

const page = (id: string, extra: Partial<PageRow> = {}): PageRow => ({
  id,
  book_id: 'b',
  section_id: null,
  title: id,
  page_type: 'blank',
  sort_order: 0,
  metadata: {},
  created_at: '2026-01-01T00:00:00Z',
  updated_at: null,
  ...extra,
});

test('table of contents follows sort order, loose pages first', () => {
  const snapshot: GrimoireSnapshot = {
    fetchedAt: '',
    books: [{ id: 'b', title: 'Book of Shadows', created_at: null, updated_at: null }],
    sections: [
      { id: 's2', book_id: 'b', title: 'Spells', sort_order: 2, created_at: null },
      { id: 's1', book_id: 'b', title: 'Rituals', sort_order: 1, created_at: null },
    ],
    pages: [
      page('late', { section_id: 's1', sort_order: 1, created_at: '2026-03-01T00:00:00Z' }),
      page('early', { section_id: 's1', sort_order: 1, created_at: '2026-02-01T00:00:00Z' }),
      page('spell', { section_id: 's2' }),
      page('loose'),
      page('orphan', { section_id: 'gone' }),
      page('other-book', { book_id: 'x' }),
    ],
    blocks: [],
    links: [],
  };
  const groups = tableOfContents(snapshot, 'b');
  assert.deepEqual(
    groups.map((g) => [g.section?.title ?? null, g.pages.map((p) => p.id)]),
    [
      [null, ['loose', 'orphan']],
      ['Rituals', ['early', 'late']],
      ['Spells', ['spell']],
    ],
  );
});

test('ritual journal facts come from the altar’s metadata', () => {
  const facts = pageFacts(
    page('j', {
      page_type: 'ritual_journal',
      metadata: {
        ritualDate: '2026-09-22',
        moonPhase: 'Waxing Gibbous',
        durationSeconds: 1830,
        altarItems: [{ label: 'White candle' }, { label: 'White candle' }, { label: 'Bay' }, { type: 'x' }],
      },
    }),
  );
  assert.deepEqual(facts, { date: '2026-09-22', moonPhase: 'Waxing Gibbous', minutes: 31, altarItems: ['White candle', 'Bay'] });
});

test('plain ritual dates stay on their calendar day in every time zone', () => {
  const date = parseCalendarDate('2026-09-22');
  assert.ok(date);
  assert.equal(date.getDate(), 22);
  assert.equal(date.getHours(), 0);
});
