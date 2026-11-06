import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DISCREET_BODY, DISCREET_TITLE, discreetAlarm, discreetBody, discreetReminders } from '../src/lib/reminders/discreet.ts';
import { DEFAULT_PREFS, normalizePrefs, summaries, withChange } from '../src/lib/reminders/prefs.ts';
import type { Reminder, ReminderKind } from '../src/lib/reminders/schedule.ts';
import * as server from '../../supabase/functions/coven-notify/discreet.ts';

const CRAFT = /moon|ritual|rite|coven|spell|altar|offering|candle|crystal|sabbat|samhain|yule|witch|magic|tarot|cycle|deipnon|ancestor|plant|herb|god|goddess|craft/i;
const KINDS: ReminderKind[] = ['moon', 'ritual', 'devotion', 'sacred', 'dream', 'meditation', 'lookback', 'offering', 'watering', 'deipnon', 'holiday', 'altar', 'crystal', 'candle', 'planning', 'coven', 'tend', 'cycle', 'year', 'summary'];
const at = new Date(2026, 10, 7, 9, 0);
const list: Reminder[] = KINDS.map((kind, i) => ({ key: `${kind}:${i}`, kind, at, title: `Full Moon in Taurus · ${kind}`, body: `Light a candle for the coven's Samhain rite (${kind})`, url: `/somewhere/${kind}` }));

test('discreet notifications are off unless chosen, and kept with the reminder choices', () => {
  assert.equal(DEFAULT_PREFS.discreet, false);
  assert.equal(normalizePrefs({}).discreet, false);
  assert.equal(normalizePrefs({ discreet: 'yes' }).discreet, false);
  const on = withChange(DEFAULT_PREFS, 'discreet', true);
  assert.equal(on.discreet, true);
  assert.equal(normalizePrefs(JSON.parse(JSON.stringify(on))).discreet, true);
  assert.match(summaries(on, {}, at).quiet, /Discreet wording/);
});

test('off: every reminder keeps its own words', () => {
  assert.deepEqual(discreetReminders(list, false), list);
});

test('on: every kind of reminder says only the app and a neutral line, and keeps its time, key and tap', () => {
  const shown = discreetReminders(list, true);
  assert.equal(shown.length, list.length);
  shown.forEach((r, i) => {
    assert.equal(r.title, DISCREET_TITLE);
    assert.equal(r.body, discreetBody(r.kind));
    assert.doesNotMatch(`${r.title} ${r.body}`, CRAFT, r.kind);
    assert.equal(r.key, list[i].key);
    assert.equal(r.at, list[i].at);
    assert.equal(r.url, list[i].url);
  });
  assert.equal(discreetBody('watering'), 'Something to tend today.');
  assert.equal(discreetBody('ritual'), DISCREET_BODY);
});

test('timer bells follow the choice', () => {
  const bell = { at, title: 'The end of your sit', body: 'Take your time coming back.' };
  assert.deepEqual(discreetAlarm(bell, false), bell);
  const quiet = discreetAlarm(bell, true);
  assert.equal(quiet.title, DISCREET_TITLE);
  assert.equal(quiet.at, at);
  assert.doesNotMatch(quiet.body, CRAFT);
});

test('coven notes from the server use the same words, for those who chose it', () => {
  assert.equal(server.DISCREET_TITLE, DISCREET_TITLE);
  assert.equal(server.DISCREET_BODY, DISCREET_BODY);
  assert.equal(server.isDiscreet(JSON.stringify(withChange(DEFAULT_PREFS, 'discreet', true))), true);
  assert.equal(server.isDiscreet(JSON.stringify(DEFAULT_PREFS)), false);
  assert.equal(server.isDiscreet(null), false);
  assert.equal(server.isDiscreet('not json'), false);
  const note = { to: 'ExponentPushToken[x]', title: 'Willow Grove', body: 'Rowan: the Esbat circle moves to Friday', sound: 'default', channelId: 'coven-chat', data: { source: 'coven-chat', url: '/coven/c/willow/chat' } };
  const quiet = server.discreetPush(note);
  assert.equal(quiet.title, DISCREET_TITLE);
  assert.equal(quiet.body, server.DISCREET_MESSAGE);
  assert.equal(quiet.data.url, note.data.url);
  assert.equal(server.discreetPush({ ...note, data: { source: 'coven-gathering', url: '/x' } }).body, DISCREET_BODY);
  for (const t of [quiet.title, quiet.body, server.DISCREET_BODY]) assert.doesNotMatch(t, CRAFT);
});
