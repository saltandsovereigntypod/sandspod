import assert from 'node:assert/strict';
import { test } from 'node:test';

import { mergeEntries, type CraftEntry } from '../src/lib/craft/merge.ts';

const e = (id: string, updatedAt: string, extra: Partial<CraftEntry<{ v: number }>> = {}): CraftEntry<{ v: number }> => ({
  id,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt,
  data: { v: Number(updatedAt.slice(8, 10)) },
  ...extra,
});

test('the newer copy of an entry wins, from either side', () => {
  const merged = mergeEntries([e('a', '2026-10-05T00:00:00.000Z'), e('b', '2026-10-02T00:00:00.000Z')], [e('a', '2026-10-03T00:00:00.000Z'), e('b', '2026-10-04T00:00:00.000Z')]);
  assert.equal(merged.find((x) => x.id === 'a')!.data.v, 5);
  assert.equal(merged.find((x) => x.id === 'b')!.data.v, 4);
});

test('a delete made later beats an older edit, and entries only on one side are kept', () => {
  const merged = mergeEntries([e('a', '2026-10-06T00:00:00.000Z', { deletedAt: '2026-10-06T00:00:00.000Z' })], [e('a', '2026-10-05T00:00:00.000Z'), e('c', '2026-10-01T00:00:00.000Z')]);
  assert.ok(merged.find((x) => x.id === 'a')!.deletedAt);
  assert.ok(merged.some((x) => x.id === 'c'));
});

test('at the same moment the saved copy is preferred, and newest entries come first', () => {
  const merged = mergeEntries([e('a', '2026-10-05T00:00:00.000Z')], [e('a', '2026-10-05T00:00:00.000Z', { syncedTo: 'u1' })]);
  assert.equal(merged[0].syncedTo, 'u1');
  const order = mergeEntries([e('x', '2026-10-01T00:00:00.000Z', { createdAt: '2026-01-01T00:00:00.000Z' }), e('y', '2026-10-01T00:00:00.000Z', { createdAt: '2026-05-01T00:00:00.000Z' })], []);
  assert.deepEqual(order.map((x) => x.id), ['y', 'x']);
});
