import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

import {
  authMessage,
  hasPasswordIdentity,
  isEmailAddress,
  MIN_PASSWORD_LENGTH,
  validateEmailChange,
  validatePasswordPair,
} from '../src/lib/settings/accountRules.ts';

// Load the website's js/account-data.js so the rules and wording can't drift apart.
type WebsiteAccountData = {
  MIN_PASSWORD_LENGTH: number;
  authMessage: (error: unknown, context?: string) => string;
  hasPasswordIdentity: (user: unknown) => boolean;
  validatePasswordPair: (password: string, confirmation: string) => { valid: boolean; message: string };
  validateEmailChange: (current: string, email: string, confirmation: string) => { valid: boolean; message: string; email?: string };
};
function website(): WebsiteAccountData {
  const source = readFileSync(new URL('../../js/account-data.js', import.meta.url), 'utf8');
  const context: { module: { exports: unknown } } = { module: { exports: {} } };
  vm.runInNewContext(source, context);
  return context.module.exports as WebsiteAccountData;
}

test('password rules match the website', () => {
  const site = website();
  assert.equal(MIN_PASSWORD_LENGTH, site.MIN_PASSWORD_LENGTH);
  for (const [password, confirmation] of [
    ['short', 'short'],
    ['long enough', 'long enougH'],
    ['long enough', 'long enough'],
  ]) {
    assert.deepEqual({ ...validatePasswordPair(password, confirmation) }, { ...site.validatePasswordPair(password, confirmation) });
  }
});

test('email change rules match the website', () => {
  const site = website();
  for (const [email, confirmation] of [
    ['not-an-email', 'not-an-email'],
    ['New@Example.com ', 'new@example.com'],
    ['new@example.com', 'other@example.com'],
    ['Ash@Example.com', 'ash@example.com'],
  ]) {
    assert.deepEqual(
      { ...validateEmailChange('ash@example.com', email, confirmation) },
      { ...site.validateEmailChange('ash@example.com', email, confirmation) },
    );
  }
  assert.equal(isEmailAddress(' ash@example.com '), true);
  assert.equal(isEmailAddress('ash@example'), false);
});

test('password identity and error wording match the website', () => {
  const site = website();
  for (const user of [
    { identities: [{ provider: 'google' }] },
    { identities: [{ provider: 'email' }, { provider: 'google' }] },
    { identities: [], app_metadata: { provider: 'email' } },
    null,
  ]) {
    assert.equal(hasPasswordIdentity(user), site.hasPasswordIdentity(user));
  }
  for (const message of [
    'Email rate limit exceeded',
    'New password should be different from the old password.',
    'Failed to fetch',
    'Token has expired',
    'Something odd',
  ]) {
    assert.equal(authMessage({ message }), site.authMessage({ message }));
    assert.equal(authMessage({ message }, 'recovery'), site.authMessage({ message }, 'recovery'));
  }
});
