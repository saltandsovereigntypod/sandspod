// Reactions and reply buttons on coven messages, a gathering's chat reminder,
// and the phone notes' choices, timing and words (lib/covens/messageExtras.ts,
// supabase/functions/coven-notify/messages.ts).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cleanPlan } from '../src/lib/covens/builder.ts';
import {
  GATHERING_LABELS as APP_LABELS,
  answerChange,
  answerTally,
  chatReminder,
  cleanReplyButtons,
  myAnswer,
  oneEmoji,
  reactionGroups,
  reactionToggle,
  rsvpFor,
  searchEmoji,
  tallyWords,
  withAnswer,
  withChatReminder,
  withReaction,
  type Answer,
  type Reaction,
} from '../src/lib/covens/messageExtras.ts';
import { normalizePrefs, withChange } from '../src/lib/reminders/prefs.ts';
import { GATHERING_LABELS, answerPushDue, answerSummary, reminderButtons, reminderDue, reminderDueAt, reminderText, wantsMessageNote } from '../../supabase/functions/coven-notify/messages.ts';

const M = 'm1';

test('reactions group by emoji, the quick row first, one per person, and toggle on and off', () => {
  let list: Reaction[] = [
    { message_id: M, user_id: 'a', emoji: '🦉' },
    { message_id: M, user_id: 'b', emoji: '🔥' },
    { message_id: M, user_id: 'a', emoji: '🔥' },
    { message_id: 'other', user_id: 'c', emoji: '🔥' },
  ];
  const groups = reactionGroups(list, M, 'a');
  assert.deepEqual(
    groups.map((g) => [g.emoji, g.count, g.mine]),
    [
      ['🔥', 2, true],
      ['🦉', 1, true],
    ],
  );
  assert.deepEqual(reactionGroups(list, M, 'a', ['b'])[0].who, ['a']);
  assert.equal(reactionToggle(list, M, 'b', '🔥'), 'remove');
  assert.equal(reactionToggle(list, M, 'b', '🌙'), 'add');
  list = withReaction(list, { message_id: M, user_id: 'b', emoji: '🔥' }, false);
  assert.equal(reactionGroups(list, M, 'a')[0].count, 1);
  list = withReaction(withReaction(list, { message_id: M, user_id: 'b', emoji: '🌙' }, true), { message_id: M, user_id: 'b', emoji: '🌙' }, true);
  assert.equal(reactionGroups(list, M, null).find((g) => g.emoji === '🌙')?.count, 1);
});

test('"More": the grid searches by words, and one typed emoji is taken', () => {
  assert.ok(searchEmoji('moon').includes('🌕'));
  assert.ok(searchEmoji('').length > 50);
  assert.equal(oneEmoji(' 🐈‍⬛ cat'), '🐈‍⬛');
  assert.equal(oneEmoji('hello'), null);
  assert.equal(oneEmoji(''), null);
});

test('reply buttons: presets, custom labels (two to four), and a gathering link only with Gathering', () => {
  assert.deepEqual(cleanReplyButtons({ preset: 'gathering', ritual_id: 'r1' }), { labels: ['Coming', 'Running late', 'Can’t make it'], preset: 'gathering', ritual_id: 'r1' });
  assert.deepEqual(cleanReplyButtons({ preset: 'yesno', ritual_id: 'r1' }), { labels: ['Yes', 'No'], preset: 'yesno' });
  assert.deepEqual(cleanReplyButtons({ preset: 'custom', labels: ['  Tea ', '', 'Coffee', 'Water', 'Wine', 'Mead'] })?.labels, ['Tea', 'Coffee', 'Water', 'Wine']);
  assert.equal(cleanReplyButtons({ preset: 'custom', labels: ['Only one'] }), null);
  assert.deepEqual(APP_LABELS, GATHERING_LABELS);
});

test('the tally counts each person once, and answers change or are taken back', () => {
  const buttons = cleanReplyButtons({ preset: 'gathering' })!;
  let answers: Answer[] = [
    { message_id: M, user_id: 'a', choice: 0 },
    { message_id: M, user_id: 'b', choice: 0 },
    { message_id: M, user_id: 'c', choice: 2 },
    { message_id: M, user_id: 'd', choice: 1 },
  ];
  assert.equal(tallyWords(answerTally(buttons, answers, M, 'a')), 'Coming 2 · Late 1 · Can’t 1');
  assert.deepEqual(answerChange(null, 1), { action: 'answer', choice: 1 });
  assert.deepEqual(answerChange(0, 2), { action: 'change', choice: 2 });
  assert.deepEqual(answerChange(2, 2), { action: 'clear', choice: null });
  answers = withAnswer(answers, { message_id: M, user_id: 'a', choice: 2 }, true);
  assert.equal(myAnswer(answers, M, 'a'), 2);
  assert.equal(tallyWords(answerTally(buttons, answers, M, 'a')), 'Coming 1 · Late 1 · Can’t 2');
  answers = withAnswer(answers, { message_id: M, user_id: 'a', choice: 0 }, false);
  assert.equal(myAnswer(answers, M, 'a'), null);
  assert.equal(tallyWords(answerTally(buttons, [], M, null)), 'No answers yet');
});

test('a Gathering answer on a linked message sets the RSVP', () => {
  const linked = cleanReplyButtons({ preset: 'gathering', ritual_id: 'r1' });
  assert.equal(rsvpFor(linked, 0), 'going');
  assert.equal(rsvpFor(linked, 1), 'going');
  assert.equal(rsvpFor(linked, 2), 'not_going');
  assert.equal(rsvpFor(linked, null), null);
  assert.equal(rsvpFor(cleanReplyButtons({ preset: 'gathering' }), 0), undefined);
  assert.equal(rsvpFor(cleanReplyButtons({ preset: 'yesno' }), 0), undefined);
});

test('the plan keeps its chat reminder (10, 15, 30 or 60 minutes)', () => {
  assert.equal(chatReminder(cleanPlan(withChatReminder(cleanPlan({}), 15))), 15);
  assert.equal(chatReminder(cleanPlan({ chatReminder: 20 })), null);
  assert.equal('chatReminder' in withChatReminder({ chatReminder: 10 }, null), false);
});

test('the reminder is due its minutes before, until it begins, once scheduled', () => {
  const at = '2026-11-02T20:00:00Z';
  const ritual = { status: 'scheduled', scheduled_for: at, plan: { chatReminder: 10 } };
  assert.equal(reminderDueAt(at, 10)?.toISOString(), '2026-11-02T19:50:00.000Z');
  assert.equal(reminderDue(ritual, new Date('2026-11-02T19:49:00Z')), false);
  assert.equal(reminderDue(ritual, new Date('2026-11-02T19:50:00Z')), true);
  assert.equal(reminderDue(ritual, new Date('2026-11-02T20:00:00Z')), false);
  assert.equal(reminderDue({ ...ritual, status: 'draft' }, new Date('2026-11-02T19:55:00Z')), false);
  assert.equal(reminderDue({ ...ritual, plan: {} }, new Date('2026-11-02T19:55:00Z')), false);
  assert.equal(reminderText('Full Moon Rite', at, new Date('2026-11-02T19:50:00Z')), 'Gentle reminder: Full Moon Rite begins in 10 minutes.');
  assert.equal(reminderText('Full Moon Rite', at, new Date('2026-11-02T19:00:00Z')), 'Gentle reminder: Full Moon Rite begins in an hour.');
  assert.deepEqual(reminderButtons('r1', at), { labels: GATHERING_LABELS, preset: 'gathering', ritual_id: 'r1', reminder_at: '2026-11-02T20:00:00.000Z' });
});

test('answer summaries ring at most once per message every five minutes', () => {
  const now = new Date('2026-11-02T12:00:00Z');
  assert.equal(answerPushDue(null, now), true);
  assert.equal(answerPushDue('2026-11-02T11:57:00Z', now), false);
  assert.equal(answerPushDue('2026-11-02T11:55:00Z', now), true);
  assert.equal(answerSummary(GATHERING_LABELS, [0, 0, 2]), '3 people answered: 2 Coming, 1 Can’t make it');
  assert.equal(answerSummary(['Yes', 'No'], [1]), '1 person answered: 1 No');
});

test('choices: reactions off unless turned on, answers on unless turned off, both quiet while paused', () => {
  const prefs = normalizePrefs({});
  assert.deepEqual(prefs.messages, { reactions: false, answers: true });
  assert.equal(wantsMessageNote(null, 'reactions'), false);
  assert.equal(wantsMessageNote(null, 'answers'), true);
  const on = withChange(withChange(prefs, 'messages.reactions', true), 'messages.answers', false);
  assert.equal(wantsMessageNote(JSON.stringify(on), 'reactions'), true);
  assert.equal(wantsMessageNote(on, 'answers'), false);
  assert.equal(wantsMessageNote({ paused: true, messages: { answers: true } }, 'answers'), false);
});
