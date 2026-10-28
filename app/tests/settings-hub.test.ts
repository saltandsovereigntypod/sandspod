// Settings as one hub: settings save themselves (gathered for a moment, saved
// on leaving, kept when a save fails), open inside the tab they came from,
// mundane mode moves from the phone into the synced setting once, and the
// coven notification choices are gathered per coven from where they're kept.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { autosaveNote, createAutosave, type AutosaveState } from '../src/lib/settings/autosave.ts';
import { dreamPromptOnToday, settingsHref, tabOf } from '../src/lib/settings/links.ts';
import { migrateMundane } from '../src/lib/grimoire/mundaneSetting.ts';
import { covenNotifyRows, covensLine, wantsCovenPush } from '../src/lib/reminders/covenNotifications.ts';
import { normalizePrefs, setGatheringsFor, setPositionsFor, setRequestsFor } from '../src/lib/reminders/prefs.ts';

type S = { a?: string; b?: boolean };

function fakeTimers() {
  let next = 1;
  const timers = new Map<number, () => void>();
  return {
    setTimer: (run: () => void) => {
      const id = next++;
      timers.set(id, run);
      return id;
    },
    clearTimer: (id: unknown) => void timers.delete(id as number),
    fire: () => {
      const all = [...timers.values()];
      timers.clear();
      all.forEach((run) => run());
    },
    count: () => timers.size,
  };
}

test('a run of changes is saved once, after the pause, with only the changed keys', async () => {
  const t = fakeTimers();
  const saves: Partial<S>[] = [];
  const states: AutosaveState[] = [];
  const auto = createAutosave<S>({ save: async (c) => void saves.push(c), setTimer: t.setTimer, clearTimer: t.clearTimer, onState: (s) => states.push(s) });
  auto.change('a', 'H');
  auto.change('a', 'He');
  auto.change('b', true);
  assert.equal(t.count(), 1, 'one timer, restarted');
  assert.equal(saves.length, 0);
  assert.equal(auto.pending(), true);
  t.fire();
  await auto.flush();
  assert.deepEqual(saves, [{ a: 'He', b: true }]);
  assert.equal(auto.pending(), false);
  assert.equal(states.at(-1), 'saved');
});

test('leaving the screen saves straight away, and nothing is saved twice', async () => {
  const t = fakeTimers();
  const saves: Partial<S>[] = [];
  const auto = createAutosave<S>({ save: async (c) => void saves.push(c), setTimer: t.setTimer, clearTimer: t.clearTimer });
  auto.change('a', 'Hekate');
  await auto.flush();
  assert.deepEqual(saves, [{ a: 'Hekate' }]);
  assert.equal(t.count(), 0, 'the waiting timer is cancelled');
  await auto.flush();
  assert.equal(saves.length, 1);
});

test('a failed save keeps its changes and tries again with the next', async () => {
  const t = fakeTimers();
  const saves: Partial<S>[] = [];
  let fail = true;
  const auto = createAutosave<S>({
    save: async (c) => {
      if (fail) throw new Error('offline');
      saves.push(c);
    },
    setTimer: t.setTimer,
    clearTimer: t.clearTimer,
  });
  auto.change('a', 'x');
  await auto.flush();
  assert.equal(auto.state(), 'failed');
  assert.equal(auto.pending(), true);
  fail = false;
  auto.change('b', false);
  await auto.flush();
  assert.deepEqual(saves, [{ a: 'x', b: false }]);
  assert.equal(auto.state(), 'saved');
});

test('saves run one at a time, in order', async () => {
  const order: string[] = [];
  let release: () => void = () => {};
  const auto = createAutosave<S>({
    save: (c) =>
      new Promise<void>((resolve) => {
        order.push(`start ${c.a}`);
        if (c.a === '1') release = () => (order.push('end 1'), resolve());
        else (order.push(`end ${c.a}`), resolve());
      }),
    setTimer: () => 0,
    clearTimer: () => {},
  });
  auto.change('a', '1');
  const first = auto.flush();
  auto.change('a', '2');
  const second = auto.flush();
  await Promise.resolve();
  release();
  await first;
  await second;
  assert.deepEqual(order, ['start 1', 'end 1', 'start 2', 'end 2']);
});

test('the saved note is quiet and says where', () => {
  assert.equal(autosaveNote('idle', true), null);
  assert.equal(autosaveNote('saving', true), 'Saving…');
  assert.equal(autosaveNote('saved', true), 'Saved to your account.');
  assert.equal(autosaveNote('saved', false), 'Saved on this device.');
  assert.match(autosaveNote('failed', true)!, /couldn’t be saved/);
});

test('settings opened from a tab stay in that tab', () => {
  assert.equal(settingsHref('practice', '/today'), '/today/settings/practice');
  assert.equal(settingsHref('practice', '/rituals/craft'), '/rituals/settings/practice');
  assert.equal(settingsHref('deities', '/grimoire/library/traditional:deity:hekate'), '/grimoire/settings/deities');
  assert.equal(settingsHref('deities', '/altar/abc'), '/altar/settings/deities');
  assert.equal(settingsHref('deities', '/more/library/x'), '/more/settings/deities');
  assert.equal(settingsHref('notifications', '/coven/c/x/chat'), '/coven/settings/notifications');
  assert.equal(settingsHref('calendar', '/community'), '/more/settings/calendar');
  assert.equal(settingsHref('location', null), '/more/settings/location');
  assert.equal(tabOf('/today/sky'), 'today');
  assert.equal(tabOf('/'), null);
});

test('the dream prompt on Today is on unless turned off', () => {
  assert.equal(dreamPromptOnToday(null), true);
  assert.equal(dreamPromptOnToday({}), true);
  assert.equal(dreamPromptOnToday({ today_dream_prompt: false }), false);
  assert.equal(dreamPromptOnToday({ today_dream_prompt: 'false' }), false);
});

test('mundane mode: the phone’s old choice moves into the setting once', () => {
  assert.deepEqual(migrateMundane('true', false), { value: true, save: true, clear: true });
  assert.deepEqual(migrateMundane('false', false), { value: false, save: false, clear: true });
  assert.deepEqual(migrateMundane('false', true), { value: false, save: true, clear: true });
  assert.deepEqual(migrateMundane(null, true), { value: true, save: false, clear: false });
  assert.deepEqual(migrateMundane(undefined, false), { value: false, save: false, clear: false });
  assert.deepEqual(migrateMundane('maybe', true), { value: true, save: false, clear: true });
});

test('coven notifications are gathered per coven from where each is kept', () => {
  const covens = [
    { id: 'c2', slug: 'willow', name: 'Willow', reviewer: true },
    { id: 'c1', slug: 'ash', name: 'Ash' },
  ];
  let prefs = normalizePrefs({});
  prefs = setGatheringsFor(prefs, 'c1', false, ['c1', 'c2']);
  prefs = setRequestsFor(prefs, 'c2', true, ['c2']);
  prefs = setPositionsFor(prefs, 'c2', false, ['c1', 'c2']);
  const rows = covenNotifyRows(covens, prefs, { c1: { notify_coven: true, notify_direct: false } });
  assert.deepEqual(
    rows.map((r) => [r.name, r.chat, r.conversations, r.gatherings, r.positions, r.applications]),
    [
      ['Ash', true, false, false, true, null],
      ['Willow', null, null, true, false, true],
    ],
  );
  assert.equal(rows[0].summary, 'Chat, positions');
  assert.equal(rows[1].summary, 'Gatherings, applications');
  assert.equal(wantsCovenPush(rows, prefs), true);
  assert.equal(covensLine(rows, true, true), '2 covens · on this phone');
  assert.equal(covensLine([rows[0]], false, true), 'Ash · off on this phone');
  assert.equal(covensLine([], null, false), 'Sign in to hear from your covens');
});

test('nothing on reads as Nothing', () => {
  let prefs = normalizePrefs({});
  prefs = setGatheringsFor(prefs, 'c1', false);
  prefs = setPositionsFor(prefs, 'c1', false);
  const [row] = covenNotifyRows([{ id: 'c1', slug: 'a', name: 'A' }], { ...prefs, requests: { ...prefs.requests, answers: false } }, { c1: { notify_coven: false, notify_direct: false } });
  assert.equal(row.summary, 'Nothing');
  assert.equal(wantsCovenPush([row], { ...prefs, requests: { ...prefs.requests, answers: false }, invitations: { on: false, accepted: false }, training: { on: false } }), false);
  // Training messages are reason enough too.
  assert.equal(wantsCovenPush([row], { ...prefs, requests: { ...prefs.requests, answers: false }, invitations: { on: false, accepted: false } }), true);
  // Invitations to you are reason enough to sign the phone up.
  assert.equal(wantsCovenPush([row], { ...prefs, requests: { ...prefs.requests, answers: false } }), true);
});
