import assert from 'node:assert/strict';
import { test } from 'node:test';

import { todaySettings as path } from '../src/lib/library/traditions.ts';

const todaySettings = (s: Record<string, unknown> | null) => path(s);

test('Today follows My path when no calendars are chosen', () => {
  const s = todaySettings({ library_path_mode: 'custom', library_path: 'norse,wicca' });
  assert.equal(s?.calendar_traditions, 'wheel,norse');
  assert.equal(todaySettings({ library_path_mode: 'custom', library_path: 'norse' })?.calendar_traditions, 'norse,wheel');
});

test('chosen calendars win over My path', () => {
  const settings = { library_path_mode: 'custom', library_path: 'norse', calendar_traditions: 'hellenic' };
  assert.equal(todaySettings(settings), settings);
});

test('no path chosen leaves the settings alone', () => {
  const settings = { library_path_mode: 'calendars' };
  assert.equal(todaySettings(settings), settings);
  assert.equal(todaySettings(null), null);
});
