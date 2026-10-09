import assert from 'node:assert/strict';
import { test } from 'node:test';

import { applyOps, enqueue, parsePending, type AltarOp } from '../src/lib/altar/outbox.ts';
import type { AltarData, SavedAltar } from '../src/lib/altar/types.ts';

const data = (name: string): AltarData => ({ name, background: 'bg.png', objects: [] }) as unknown as AltarData;

function save(id: string, name: string, isNew = false, at = '2026-10-09T10:00:00.000Z'): AltarOp {
  return { kind: 'save', id, name, data: data(name), isNew, createdAt: at, updatedAt: at };
}

test('a later save of the same altar replaces the queued one, keeping it new', () => {
  const first = save('a', 'First', true, '2026-10-09T10:00:00.000Z');
  const second = save('a', 'Second', false, '2026-10-09T11:00:00.000Z');
  const queue = enqueue(enqueue([], first), second);
  assert.equal(queue.length, 1);
  const op = queue[0];
  assert.equal(op.kind, 'save');
  if (op.kind !== 'save') return;
  assert.equal(op.name, 'Second');
  assert.equal(op.isNew, true);
  assert.equal(op.createdAt, '2026-10-09T10:00:00.000Z');
  assert.equal(op.updatedAt, '2026-10-09T11:00:00.000Z');
});

test('deleting an altar that never reached the account just drops it', () => {
  const queue = enqueue(enqueue([save('b', 'Kept'), save('a', 'Offline only', true)], { kind: 'delete', id: 'a' }), save('c', 'Other'));
  assert.deepEqual(
    queue.map((o) => o.id),
    ['b', 'c'],
  );
});

test('deleting an altar already in the account queues the deletion', () => {
  const queue = enqueue([save('a', 'Edited')], { kind: 'delete', id: 'a' });
  assert.deepEqual(queue, [{ kind: 'delete', id: 'a' }]);
});

test('an operation being sent is never changed; later ones go after it', () => {
  const sending = save('a', 'Sending', true);
  const queue = enqueue([sending], save('a', 'Newer'), 1);
  assert.equal(queue.length, 2);
  assert.equal(queue[0], sending);
  const deleted = enqueue([sending], { kind: 'delete', id: 'a' }, 1);
  assert.deepEqual(
    deleted.map((o) => o.kind),
    ['save', 'delete'],
  );
});

test('the list shows queued saves and hides queued deletions', () => {
  const server: SavedAltar[] = [
    { ...data('Old name'), id: 'a', name: 'Old name', savedAt: '2026-01-01T00:00:00.000Z' },
    { ...data('Gone'), id: 'b', name: 'Gone' },
  ];
  const result = applyOps(server, [save('a', 'New name'), { kind: 'delete', id: 'b' }, save('c', 'Made offline', true)]);
  assert.deepEqual(
    result.map((a) => [a.id, a.name]),
    [
      ['c', 'Made offline'],
      ['a', 'New name'],
    ],
  );
  assert.equal(result.find((a) => a.id === 'c')?.updatedAt, '2026-10-09T10:00:00.000Z');
});

test('pending changes survive a round trip and junk is dropped', () => {
  const queue = [save('a', 'One', true), { kind: 'delete', id: 'b' } as AltarOp];
  const failed = [{ op: save('c', 'Refused'), message: 'permission denied' }];
  const raw = JSON.stringify({ queue: [...queue, { kind: 'save', id: 'x' }, null], failed: [...failed, { op: {} }] });
  assert.deepEqual(parsePending(raw), { queue, failed });
  assert.deepEqual(parsePending('not json'), { queue: [], failed: [] });
  assert.deepEqual(parsePending(null), { queue: [], failed: [] });
});
