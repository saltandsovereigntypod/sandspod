import assert from 'node:assert/strict';
import { test } from 'node:test';

import { archiveAltarWords, badgeLabel, canDeleteAltar, chatButtonLabel, chatPanelFrame, deleteAltarWords, myConversations } from '../src/lib/covens/altarPanel.ts';
import type { Conversation, ConversationMember } from '../src/lib/covens/thread.ts';

test('an altar is deleted only by its keepers, never the main altar, never during a ritual', () => {
  const altar = { is_main: false };
  assert.deepEqual(canDeleteAltar(altar, { keeper: true, ritual_id: null }), { ok: true, reason: null });
  assert.equal(canDeleteAltar(altar, { keeper: false, ritual_id: null }).ok, false);
  assert.match(canDeleteAltar(altar, { keeper: false, ritual_id: null }).reason!, /keeper/);
  assert.equal(canDeleteAltar({ is_main: true }, { keeper: true, ritual_id: null }).ok, false);
  assert.match(canDeleteAltar({ is_main: true }, { keeper: true, ritual_id: null }).reason!, /ritual altar stays/);
  assert.match(canDeleteAltar(altar, { keeper: true, ritual_id: 'r1' }).reason!, /ritual is under way/);
  // Still loading: no button and nothing to explain yet.
  assert.deepEqual(canDeleteAltar(null, { keeper: true, ritual_id: null }), { ok: false, reason: null });
  assert.deepEqual(canDeleteAltar(altar, null), { ok: false, reason: null });
});

test('deleting asks plainly, and says it cannot be undone', () => {
  const words = deleteAltarWords(' Healing altar ');
  assert.equal(words.title, 'Delete Healing altar?');
  assert.equal(words.body, 'This removes the altar and everything on it for the whole coven. This can’t be undone.');
  assert.equal(deleteAltarWords('  ').title, 'Delete this altar?');
  for (const text of Object.values(words)) assert.ok(!text.includes('!'));
});

test('the chat window lists only the conversations you are still in, newest first', () => {
  const c = (id: string, last: string | null): Conversation => ({ id, coven_id: 'c1', kind: 'direct', name: null, created_by: 'u1', created_at: '2026-10-01T00:00:00Z', last_message_at: last });
  const m = (conversation_id: string, user_id: string, left_at: string | null = null): ConversationMember => ({ conversation_id, coven_id: 'c1', user_id, left_at, muted: false, last_read_at: null });
  const list = [c('old', '2026-10-02T00:00:00Z'), c('new', '2026-10-20T00:00:00Z'), c('left', '2026-10-25T00:00:00Z'), c('notmine', '2026-10-26T00:00:00Z'), c('quiet', null)];
  const members = [m('old', 'me'), m('new', 'me'), m('left', 'me', '2026-10-21T00:00:00Z'), m('notmine', 'u2'), m('quiet', 'me')];
  assert.deepEqual(myConversations(list, members, 'me').map((x) => x.id), ['new', 'old', 'quiet']);
  assert.deepEqual(myConversations(list, members, null), []);
});

test('the chat button counts what you have not read', () => {
  assert.equal(badgeLabel(0), '0');
  assert.equal(badgeLabel(7), '7');
  assert.equal(badgeLabel(120), '99+');
  assert.equal(chatButtonLabel(0, false), 'Messages');
  assert.equal(chatButtonLabel(3, false), 'Messages, 3 unread');
  assert.equal(chatButtonLabel(3, true), 'Close messages, 3 unread');
});

test('the chat window sits along the bottom of an upright screen and down the side of a wide one', () => {
  const phone = chatPanelFrame(390, 844);
  assert.equal(phone.side, 'bottom');
  assert.equal(phone.width, 390);
  assert.ok(phone.height < 844 * 0.6 && phone.height >= 280, 'leaves the altar in view');
  const small = chatPanelFrame(320, 480);
  assert.equal(small.height, 280);
  const sideways = chatPanelFrame(844, 390);
  assert.equal(sideways.side, 'right');
  assert.equal(sideways.height, 390);
  assert.ok(sideways.width >= 300 && sideways.width <= 400);
  assert.equal(chatPanelFrame(1280, 1400).side, 'right');
});

test('archive keeps the altar and says it can be restored; delete is the only word for good', () => {
  const words = archiveAltarWords(' Healing altar ');
  assert.equal(words.title, 'Archive Healing altar?');
  assert.equal(words.confirm, 'Archive');
  assert.equal(words.restore, 'Restore');
  assert.match(words.body, /restore/);
  assert.ok(!/delete|for good/i.test(Object.values(words).join(' ')));
  assert.equal(archiveAltarWords('').title, 'Archive this altar?');
  assert.equal(archiveAltarWords('').restored, 'The altar is back among the coven’s altars.');
  // Deleting points to archiving as the gentler choice, in the same words.
  assert.match(deleteAltarWords('x').gentler, /^Archiving it/);
  for (const text of Object.values(words)) assert.ok(!text.includes('!'));
});
