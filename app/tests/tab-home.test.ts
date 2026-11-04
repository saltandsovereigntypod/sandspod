import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tabHomeHref, tabHomeReset } from '../src/lib/tabHome.ts';

const stack = (...names: string[]) => ({ routes: names.map((name) => ({ name })) });
const tab = (name: string, state?: ReturnType<typeof stack>, params?: object) => ({ name, state, params });

test('a stack that starts on its main page pops to it by itself', () => {
  assert.equal(tabHomeReset(tab('altar', stack('index', '[altarId]'))), null);
  assert.equal(tabHomeReset(tab('more', stack('index'))), null);
  assert.equal(tabHomeReset(tab('rituals', stack('craft/index', 'divination/index'))), null);
});

test('a tab not opened yet has nothing to reset', () => {
  assert.equal(tabHomeReset(tab('grimoire')), null);
  assert.equal(tabHomeReset(tab('grimoire', stack())), null);
});

test('a stack opened from another tab gets its main page back', () => {
  assert.equal(tabHomeReset(tab('more', stack('settings/index'))), 'index');
  assert.equal(tabHomeReset(tab('grimoire', stack('library/index', 'library/[id]'))), 'index');
  assert.equal(tabHomeReset(tab('rituals', stack('journal/index'))), 'index');
  // A Craft page opened on its own goes back to the Craft home, not Rituals'.
  assert.equal(tabHomeReset(tab('rituals', stack('divination/meanings'))), 'craft/index');
});

test('a stack opened by a link and not touched since holds just the linked screen', () => {
  assert.equal(tabHomeReset(tab('rituals', undefined, { screen: 'divination/draw', params: {} })), 'craft/index');
  assert.equal(tabHomeReset(tab('more', undefined, { screen: 'settings/index', initial: true })), 'index');
  // Opened with the main page kept underneath: the stack pops to it by itself.
  assert.equal(tabHomeReset(tab('grimoire', undefined, { screen: 'library/index', initial: false })), null);
});

test('the path of a tab’s main page', () => {
  assert.equal(tabHomeHref('more', 'index'), '/more');
  assert.equal(tabHomeHref('rituals', 'craft/index'), '/rituals/craft');
});
