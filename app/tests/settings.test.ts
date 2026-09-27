import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

import {
  deletePhraseMatches,
  interpretDeleteResponse,
  isRecentSignIn,
  providerSummary,
} from '../src/lib/settings/accountRules.ts';
import { defaultSettings, greetingName, layerOrder, normalizeSettings, settingsRow } from '../src/lib/settings/defaults.ts';

// Load the website's getDefaultMySettings so the two lists can't drift apart.
function websiteDefaults(): Record<string, unknown> {
  const source = readFileSync(new URL('../../js/my-settings.js', import.meta.url), 'utf8');
  const context: Record<string, unknown> = { window: { addEventListener() {} }, document: { addEventListener() {} } };
  vm.runInNewContext(`${source}\nthis.defaults = getDefaultMySettings();`, context);
  return context.defaults as Record<string, unknown>;
}

test('defaults are exactly the website’s', () => {
  assert.deepEqual({ ...defaultSettings() }, { ...websiteDefaults() });
});

test('rows from the website normalize with column values winning', () => {
  const settings = normalizeSettings({
    user_id: 'u',
    preferred_name: 'Ash',
    magical_name: null,
    updated_at: 'x',
    settings: { preferred_name: 'Old', grimoire_page_font: 'handwritten', library_community_enabled: true, future_key: 'kept' },
  });
  assert.equal(settings.preferred_name, 'Ash');
  assert.equal(settings.magical_name, '');
  assert.equal(settings.grimoire_page_font, 'handwritten');
  assert.equal(settings.library_community_enabled, true);
  assert.equal(settings.future_key, 'kept');
  assert.equal('user_id' in settings || 'settings' in settings || 'updated_at' in settings, false);
});

test('the saved row has the website’s shape', () => {
  const row = settingsRow({ ...defaultSettings(), preferred_name: 'Ash', default_mundane_mode: true }, 'u1', new Date('2026-09-25T00:00:00Z'));
  assert.deepEqual(Object.keys(row), [
    'user_id',
    'preferred_name',
    'pronouns',
    'magical_name',
    'default_mundane_mode',
    'default_altar_background',
    'settings',
    'updated_at',
  ]);
  assert.equal(row.settings.preferred_name, 'Ash');
  assert.equal(row.default_mundane_mode, true);
  assert.equal(row.updated_at, '2026-09-25T00:00:00.000Z');
});

test('greeting name and layer order', () => {
  const s = { ...defaultSettings(), preferred_name: 'Ash', magical_name: 'Nightshade' };
  assert.equal(greetingName(s), 'Ash');
  assert.equal(greetingName({ ...s, sanctuary_greeting_name: 'magical' }), 'Nightshade');
  assert.equal(greetingName({ ...s, sanctuary_greeting_name: 'none' }), '');
  assert.deepEqual(layerOrder({ ...s, library_layer_order: 'community,bogus' }), ['community', 'myPractice', 'traditional']);
});

test('account deletion rules', () => {
  assert.equal(deletePhraseMatches(' DELETE MY SALT AND SOVEREIGNTY ACCOUNT '), true);
  assert.equal(deletePhraseMatches('delete my salt and sovereignty account'), false);
  const now = new Date('2026-09-25T12:00:00Z');
  assert.equal(isRecentSignIn({ last_sign_in_at: '2026-09-25T11:45:00Z' }, now), true);
  assert.equal(isRecentSignIn({ last_sign_in_at: '2026-09-25T10:00:00Z' }, now), false);
  assert.equal(isRecentSignIn({}, now), false);
  assert.equal(providerSummary({ identities: [{ provider: 'email' }], app_metadata: { provider: 'google' } }), 'Email and password and Google');
  assert.equal(interpretDeleteResponse(200, { complete: true, completed: [] }).ok, true);
  assert.equal(interpretDeleteResponse(200, { complete: false }).ok, false);
  const partial = interpretDeleteResponse(500, { complete: false, error: 'deletion_incomplete' });
  assert.ok(!partial.ok && /part way/.test(partial.message));
  const missing = interpretDeleteResponse(404, null);
  assert.ok(!missing.ok && /Nothing was deleted/.test(missing.message));
});

