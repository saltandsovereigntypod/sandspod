import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cycleNoteItem, dayOf, isTimelineKind, kindCounts, mergeTimeline, searchTimeline, TIMELINE_KINDS, type TimelineItem } from '../src/lib/journal/timeline.ts';

const item = (kind: TimelineItem['kind'], id: string, date: string, at = '', title = id): TimelineItem => ({ kind, id, date, at, title, detail: '', href: `/x/${id}` });

test('merges every journal newest first, by day then moment, undated last', () => {
  const merged = mergeTimeline([
    [item('ritual', 'r1', '2026-10-01'), item('ritual', 'r2', '2026-11-02', '2026-11-02T20:00')],
    [item('dream', 'd1', '2026-11-02', '2026-11-02T07:00')],
    [item('sit', 's1', ''), item('shadow', 'h1', '2026-11-03')],
  ]);
  assert.deepEqual(
    merged.map((i) => i.id),
    ['h1', 'r2', 'd1', 'r1', 's1'],
  );
});

test('filters by kind and searches title, detail and kind', () => {
  const lists = [[item('ritual', 'r1', '2026-10-01', '', 'Full moon release')], [item('reading', 'q1', '2026-10-02', '', 'Should I move?')]];
  assert.deepEqual(mergeTimeline(lists, 'reading').map((i) => i.id), ['q1']);
  const all = mergeTimeline(lists);
  assert.deepEqual(searchTimeline(all, 'moon').map((i) => i.id), ['r1']);
  assert.deepEqual(searchTimeline(all, 'reading').map((i) => i.id), ['q1']);
  assert.equal(searchTimeline(all, '  ').length, 2);
  assert.deepEqual(kindCounts(all), { ritual: 1, reading: 1 });
});

test('kinds, days and cycle notes', () => {
  assert.equal(TIMELINE_KINDS.length, 9);
  assert.ok(isTimelineKind('omens'));
  assert.ok(!isTimelineKind('nope'));
  assert.equal(dayOf('2026-11-04T10:00:00Z'), '2026-11-04');
  assert.equal(dayOf(null), '');
  assert.equal(cycleNoteItem({ date: '2026-11-01', mood: '', text: '' }), null);
  const note = cycleNoteItem({ date: '2026-11-01', text: 'Tired\nand slow', symptoms: { cramps: 2 } });
  assert.equal(note?.title, 'Tired');
  assert.equal(note?.href, '/rituals/cycle/log?date=2026-11-01');
  assert.match(note?.detail ?? '', /1 thing noted/);
});
