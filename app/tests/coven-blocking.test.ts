import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BLOCKED_MESSAGE, blockedPartner, blockedPreview, withBlock } from '../src/lib/covens/blocking.ts';
import type { Message } from '../src/lib/covens/model.ts';
import type { Conversation, ConversationMember } from '../src/lib/covens/thread.ts';

const msg = (user: string | null, body = 'hello', deleted = false): Message => ({
  id: 'm1',
  coven_id: 'c1',
  user_id: user,
  body,
  created_at: '2026-10-26T10:00:00Z',
  edited_at: null,
  deleted_at: deleted ? '2026-10-26T10:05:00Z' : null,
  deleted_by: null,
});
const names = (id: string) => ({ u2: 'Rowan', u3: 'Hazel' })[id] ?? 'Someone';

test('the list never shows the words of someone you blocked', () => {
  assert.equal(blockedPreview(msg('u2', 'cruel words'), 'me', names, true, ['u2']), BLOCKED_MESSAGE);
  assert.equal(blockedPreview(msg('u2', 'cruel words'), 'me', names, false, ['u2']), BLOCKED_MESSAGE);
  assert.equal(blockedPreview(msg('u3', 'see you there'), 'me', names, true, ['u2']), 'Hazel: see you there');
  assert.equal(blockedPreview(msg('me', 'on my way'), 'me', names, true, ['u2']), 'You: on my way');
  assert.equal(blockedPreview(msg('u2', 'gone', true), 'me', names, true, ['u2']), 'A message was removed');
  assert.equal(blockedPreview(undefined, 'me', names, true, ['u2']), 'No messages yet');
});

const conversation = (kind: Conversation['kind']): Conversation => ({
  id: 'k1',
  coven_id: 'c1',
  kind,
  name: kind === 'group' ? 'Circle' : null,
  created_by: 'me',
  created_at: '2026-10-20T10:00:00Z',
  last_message_at: null,
});
const member = (user: string): ConversationMember => ({ conversation_id: 'k1', coven_id: 'c1', user_id: user, left_at: null, muted: false, last_read_at: null });

test('a one-to-one chat with someone you blocked is closed to writing', () => {
  const people = [member('me'), member('u2')];
  assert.equal(blockedPartner(conversation('direct'), people, 'me', ['u2']), 'u2');
  assert.equal(blockedPartner(conversation('direct'), people, 'me', []), null);
  assert.equal(blockedPartner(conversation('direct'), people, 'me', ['u3']), null);
  // Groups stay open: their words are hidden, the others still talk.
  assert.equal(blockedPartner(conversation('group'), [...people, member('u3')], 'me', ['u2']), null);
  assert.equal(blockedPartner(null, people, 'me', ['u2']), null);
});

test('blocking and unblocking keep the list tidy', () => {
  assert.deepEqual(withBlock([], 'u2', true), ['u2']);
  assert.deepEqual(withBlock(['u2'], 'u2', true), ['u2']);
  assert.deepEqual(withBlock(['u2', 'u3'], 'u2', false), ['u3']);
  assert.deepEqual(withBlock(['u3'], 'u2', false), ['u3']);
});
