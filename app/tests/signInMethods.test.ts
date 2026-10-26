import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

import { SUPPORT_EMAIL } from '../src/lib/community/model.ts';
import { hasPasswordIdentity, providerSummary } from '../src/lib/settings/accountRules.ts';
import {
  canRemove,
  isLinkingDisabled,
  linkErrorMessage,
  linkReturn,
  providerName,
  signInRows,
  unlinkErrorMessage,
  waysToAdd,
} from '../src/lib/settings/signInMethods.ts';

// The website's js/sign-in-methods.js, so the rules and wording can't drift apart.
type Site = {
  SUPPORT_EMAIL: string;
  signInRows: typeof signInRows;
  canRemove: typeof canRemove;
  waysToAdd: typeof waysToAdd;
  linkReturn: typeof linkReturn;
  linkErrorMessage: (error: unknown, provider: string) => string;
  unlinkErrorMessage: (error: unknown, provider: string) => string;
};
function website(): Site {
  const source = readFileSync(new URL('../../js/sign-in-methods.js', import.meta.url), 'utf8');
  const context: { module: { exports: unknown } } = { module: { exports: {} } };
  vm.runInNewContext(source, context);
  return context.module.exports as Site;
}

const apple = { identity_id: 'a1', id: 'apple-sub', provider: 'apple', identity_data: { email: 'x@privaterelay.appleid.com' } };
const google = { identity_id: 'g1', id: 'google-sub', provider: 'google', identity_data: { email: 'ash@gmail.com' } };
const email = { identity_id: 'e1', id: 'user-id', provider: 'email', identity_data: { email: 'ash@example.com' } };

test('rows list Apple, then Google, then email, and never let the last one go', () => {
  const rows = signInRows([email, google, apple]);
  assert.deepEqual(rows.map((r) => r.label), ['Apple', 'Google', 'Email and password']);
  assert.deepEqual(rows.map((r) => r.detail), ['x@privaterelay.appleid.com', 'ash@gmail.com', 'ash@example.com']);
  assert.ok(rows.every((r) => r.removable));

  const only = signInRows([apple]);
  assert.equal(only.length, 1);
  assert.equal(only[0].removable, false);
  assert.equal(canRemove([apple], apple), false);
  assert.equal(canRemove([apple, google], google), true);
  assert.equal(canRemove([apple, google], email), false, 'not one of this account’s');
  assert.equal(canRemove(null, apple), false);
});

test('a password added to an Apple account shows, but can’t be removed or keep another', () => {
  const user = { email: 'x@privaterelay.appleid.com', user_metadata: { password_sign_in: true } };
  const rows = signInRows([apple], user);
  assert.deepEqual(rows.map((r) => [r.label, r.removable]), [['Apple', false], ['Email and password', false]]);
  assert.equal(rows[1].identity, null);
  assert.equal(rows[1].detail, 'x@privaterelay.appleid.com');
  assert.equal(hasPasswordIdentity(user), true);
  assert.equal(hasPasswordIdentity({ identities: [{ provider: 'apple' }] }), false);
  assert.equal(providerSummary({ identities: [{ provider: 'apple' }], user_metadata: { password_sign_in: true } }), 'Email and password and Apple');
});

test('ways to add skip what’s there and what this device can’t offer', () => {
  assert.deepEqual(waysToAdd(signInRows([apple]), { apple: true, google: true, email: true }), ['google', 'email']);
  assert.deepEqual(waysToAdd(signInRows([google]), { apple: false, google: true, email: true }), ['email']);
  assert.deepEqual(waysToAdd(signInRows([google]), { apple: true, google: true, email: false }), ['apple']);
  assert.deepEqual(waysToAdd([], { apple: true, google: true, email: true }), ['apple', 'google', 'email']);
  assert.equal(providerName('github'), 'Github');
});

test('the browser hand-back is read from the query or the fragment', () => {
  assert.deepEqual(linkReturn('saltandsovereignty://auth-callback?code=abc123'), { code: 'abc123' });
  assert.deepEqual(
    linkReturn(
      'https://saltandsovereignty.com/#error=server_error&error_code=identity_already_exists&error_description=Identity+is+already+linked+to+another+user',
    ),
    { error: 'server_error', errorCode: 'identity_already_exists', errorDescription: 'Identity is already linked to another user' },
  );
  assert.deepEqual(linkReturn('https://x.com/?error=access_denied&error_description=User%20cancelled'), {
    error: 'access_denied',
    errorDescription: 'User cancelled',
  });
  assert.deepEqual(linkReturn(''), {});
  assert.deepEqual(linkReturn('https://x.com/?code=%E0%A4%A'), { code: '%E0%A4%A' });
});

test('errors are explained plainly, with the support address where it helps', () => {
  const other = linkErrorMessage({ code: 'identity_already_exists', message: 'Identity is already linked to another user' }, 'apple');
  assert.match(other, /^That Apple ID already has its own Salt & Sovereignty account\./);
  assert.ok(other.includes(SUPPORT_EMAIL));
  assert.match(linkErrorMessage({ code: 'identity_already_exists', message: 'Identity is already linked to another user' }, 'google'), /^That Google account/);
  assert.equal(linkErrorMessage({ code: 'identity_already_exists', message: 'Identity is already linked' }, 'google'), 'Google is already one of your ways to sign in.');

  assert.ok(isLinkingDisabled({ code: 'manual_linking_disabled', message: 'Manual linking is disabled' }));
  assert.ok(isLinkingDisabled({ message: 'Manual linking is disabled' }));
  assert.ok(!isLinkingDisabled({ message: 'Something else' }));
  assert.match(linkErrorMessage({ code: 'manual_linking_disabled' }, 'google'), /isn’t switched on yet\. Nothing has changed/);
  assert.match(unlinkErrorMessage({ code: 'manual_linking_disabled' }, 'google'), /Google still works/);

  assert.equal(unlinkErrorMessage({ code: 'single_identity_not_deletable' }, 'apple'), 'This is your only way to sign in, so it has to stay. Add another way first.');
  assert.match(unlinkErrorMessage({ code: 'email_conflict_identity_not_deletable' }, 'google'), /has to stay for now/);
  assert.match(linkErrorMessage({ message: 'Failed to fetch' }, 'apple'), /could not be reached/);
  assert.equal(linkErrorMessage({ message: 'odd' }, 'google'), 'Google couldn’t be added just now. Nothing has changed; please try again.');
  for (const message of [linkErrorMessage({}, 'apple'), unlinkErrorMessage({}, 'apple'), other]) assert.doesNotMatch(message, /!/);
});

test('the website’s rules and wording match the app’s', () => {
  const site = website();
  assert.equal(site.SUPPORT_EMAIL, SUPPORT_EMAIL);
  const user = { email: 'ash@example.com', user_metadata: { password_sign_in: true } };
  for (const list of [[apple], [google, apple], [email, google, apple], []]) {
    assert.deepEqual(JSON.parse(JSON.stringify(site.signInRows(list, user))), JSON.parse(JSON.stringify(signInRows(list, user))));
    for (const identity of [apple, google, email]) assert.equal(site.canRemove(list, identity), canRemove(list, identity));
    for (const offer of [{ apple: true, google: true, email: true }, { apple: false, google: true, email: false }])
      assert.deepEqual([...site.waysToAdd(signInRows(list), offer)], waysToAdd(signInRows(list), offer));
  }
  for (const url of ['a://b?code=1', 'https://x/#error=e&error_code=c&error_description=d+e', 'https://x/?a=1#code=2']) {
    assert.deepEqual({ ...site.linkReturn(url) }, linkReturn(url));
  }
  const errors = [
    { code: 'identity_already_exists', message: 'Identity is already linked to another user' },
    { code: 'identity_already_exists', message: 'Identity is already linked' },
    { code: 'manual_linking_disabled', message: 'Manual linking is disabled' },
    { code: 'single_identity_not_deletable' },
    { code: 'email_conflict_identity_not_deletable' },
    { code: 'identity_not_found' },
    { code: 'provider_disabled', message: 'Unsupported provider: provider is not enabled' },
    { code: 'reauthentication_needed' },
    { code: 'weak_password', message: 'Password should be at least 8 characters' },
    { message: 'Failed to fetch' },
    { message: 'JWT expired' },
    { message: 'odd' },
    null,
  ];
  for (const error of errors) {
    for (const provider of ['apple', 'google', 'email']) {
      assert.equal(site.linkErrorMessage(error, provider), linkErrorMessage(error, provider));
      assert.equal(site.unlinkErrorMessage(error, provider), unlinkErrorMessage(error, provider));
    }
  }
});
