import assert from 'node:assert/strict';
import { test } from 'node:test';

import { displayBox } from '../src/lib/altar/geometry.ts';
import { isLit } from '../src/lib/altar/livingState.ts';
import { isPetitionPaper, petitionEntryOf } from '../src/lib/altar/petitions.ts';
import type { AltarDocument } from '../src/lib/altar/snapshot.ts';
import type { Message } from '../src/lib/covens/model.ts';
import { seedPetitionAltar, tendPetitionAltar } from '../src/lib/covens/petitionAltar.ts';
import { listTime, previewLine, threadItems } from '../src/lib/covens/thread.ts';
import { countMessage, covenTotal, threadKey } from '../src/lib/covens/unreadCount.ts';

const msg = (id: string, user: string, at: string, body = 'hi'): Message => ({
  id,
  coven_id: 'c1',
  user_id: user,
  body,
  created_at: at,
  edited_at: null,
  deleted_at: null,
  deleted_by: null,
});

test('a thread reads like a phone’s: runs from one person, a time when a while has passed', () => {
  const now = new Date('2026-10-24T20:00:00');
  const items = threadItems(
    [
      msg('m3', 'u2', new Date('2026-10-24T18:03:00').toISOString()),
      msg('m1', 'u2', new Date('2026-10-24T18:00:00').toISOString()),
      msg('m2', 'u2', new Date('2026-10-24T18:01:00').toISOString()),
      msg('m4', 'u1', new Date('2026-10-24T18:04:00').toISOString()),
      msg('m5', 'u1', new Date('2026-10-24T19:30:00').toISOString()),
    ],
    'u1',
    true,
    now,
  );
  assert.deepEqual(
    items.map((i) => (i.kind === 'time' ? 'time' : i.message.id)),
    ['time', 'm1', 'm2', 'm3', 'm4', 'time', 'm5'],
  );
  const bubbles = items.filter((i) => i.kind === 'message');
  const [m1, m2, m3, m4, m5] = bubbles;
  assert.ok(m1.first && !m1.last && m1.showName, 'their name over the first of the run');
  assert.ok(!m2.first && !m2.last && !m2.showName);
  assert.ok(m3.last);
  assert.ok(m4.mine && m4.first && m4.last && !m4.showName, 'no name over yours');
  assert.ok(m5.first && m5.last);
  const one = threadItems([msg('a', 'u2', now.toISOString()), msg('b', 'u2', now.toISOString())], 'u1', false, now);
  assert.ok(one.every((i) => i.kind === 'time' || !i.showName), 'no names in a one-to-one chat');
});

test('the conversation list shows who said what, and when', () => {
  const nameOf = (id: string) => ({ u2: 'Rowan' })[id] ?? 'Someone';
  assert.equal(previewLine(undefined, 'u1', nameOf, true), 'No messages yet');
  assert.equal(previewLine(msg('a', 'u1', '2026-10-24T10:00:00Z', 'see you\n there'), 'u1', nameOf, true), 'You: see you there');
  assert.equal(previewLine(msg('a', 'u2', '2026-10-24T10:00:00Z', 'yes'), 'u1', nameOf, true), 'Rowan: yes');
  assert.equal(previewLine(msg('a', 'u2', '2026-10-24T10:00:00Z', 'yes'), 'u1', nameOf, false), 'yes');
  assert.equal(previewLine({ ...msg('a', 'u2', '2026-10-24T10:00:00Z'), deleted_at: '2026-10-24T10:01:00Z' }, 'u1', nameOf, true), 'A message was removed');
  assert.equal(listTime(null), '');
  assert.ok(listTime('2026-10-24T10:00:00Z', new Date('2026-10-24T12:00:00Z')).length > 0);
});

test('unread counts each conversation apart, and the coven’s total gathers them', () => {
  const read = { c1: '2026-10-24T10:00:00Z' };
  let counts = countMessage({}, { coven_id: 'c1', conversation_id: 'k1', user_id: 'u2', created_at: '2026-10-24T11:00:00Z' }, 'u1', read, null);
  counts = countMessage(counts, { coven_id: 'c1', conversation_id: null, user_id: 'u2', created_at: '2026-10-24T11:00:00Z' }, 'u1', read, null);
  counts = countMessage(counts, { coven_id: 'c1', conversation_id: 'k1', user_id: 'u3', created_at: '2026-10-24T11:05:00Z' }, 'u1', read, threadKey('c1', 'k1'));
  assert.deepEqual(counts, { 'c1:k1': 1, c1: 1 }, 'the conversation open in front of you stays read');
  counts = countMessage(counts, { coven_id: 'c2', conversation_id: 'k9', user_id: 'u3', created_at: '2026-10-24T11:05:00Z' }, 'u1', read, null);
  assert.equal(covenTotal(counts, 'c1'), 2);
  assert.equal(covenTotal(counts, 'c2'), 1);
});

const empty: AltarDocument = { background: '', backgroundName: '', objects: [], groups: [], activeGroupId: null, extra: {} } as unknown as AltarDocument;

test('a petition gets its own altar: its candle lit, its paper at the candle’s foot', () => {
  const now = '2026-10-24T20:00:00.000Z';
  const petition = { id: 'p1', title: 'Healing for my sister', color: 'green', body: 'She starts treatment Monday.' };
  const seeded = seedPetitionAltar(petition, now)(empty);
  assert.equal(seeded.objects.length, 2);
  const [candle, paper] = seeded.objects;
  assert.equal(candle.type, 'candle');
  assert.ok(isLit(candle), 'its candle is lit');
  assert.match(String(candle.label), /Healing for my sister/);
  assert.ok(isPetitionPaper(paper));
  assert.equal(petitionEntryOf(paper), 'p1');
  assert.equal(seedPetitionAltar(petition, now)(seeded), seeded, 'asking twice sets nothing more out');

  const tended = tendPetitionAltar(petition, 'Rowan', '2026-10-25T08:00:00.000Z')(seeded);
  assert.equal(tended.objects.length, 3);
  const mine = tended.objects[2];
  assert.equal(mine.type, 'candle');
  assert.equal(mine.label, 'Rowan’s candle');
  assert.ok(isLit(mine));
  const again = tendPetitionAltar(petition, 'Wren', '2026-10-25T09:00:00.000Z')(tended);
  assert.equal(again.objects.length, 4);
  const a = displayBox(again.objects[3]);
  const b = displayBox(mine);
  assert.ok(Math.abs(a.cx - b.cx) + Math.abs(a.cy - b.cy) > 0.05, 'each tending stands in its own place');
  const p = displayBox(paper);
  assert.ok(Math.abs(p.cx - displayBox(candle).cx) < 0.01, 'the paper sits at its candle');
});
