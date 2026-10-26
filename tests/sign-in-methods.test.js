const test = require("node:test");
const assert = require("node:assert/strict");

const Methods = require("../js/sign-in-methods.js");
const Account = require("../js/account-data.js");

const apple = { identity_id: "a1", provider: "apple", identity_data: { email: "x@privaterelay.appleid.com" } };
const google = { identity_id: "g1", provider: "google", identity_data: { email: "ash@gmail.com" } };

test("Ways to Sign In lists each identity and keeps the last one", () => {
  const rows = Methods.signInRows([google, apple]);
  assert.deepEqual(rows.map((row) => row.label), ["Apple", "Google"]);
  assert.ok(rows.every((row) => row.removable));
  assert.equal(Methods.signInRows([google])[0].removable, false);
  assert.equal(Methods.canRemove([google], google), false);
  assert.deepEqual(Methods.waysToAdd(Methods.signInRows([google]), { apple: true, google: true, email: true }), ["apple", "email"]);
});

test("a password added to a Google account counts as email and password", () => {
  const user = { email: "ash@gmail.com", identities: [google], user_metadata: { password_sign_in: true } };
  assert.equal(Account.hasPasswordIdentity(user), true);
  assert.equal(Account.providerSummary(user), "Email and password and Google");
  assert.equal(Account.providerSummary({ identities: [apple] }), "Apple");
  const rows = Methods.signInRows([google], user);
  assert.deepEqual(rows.map((row) => [row.label, row.removable]), [["Google", false], ["Email and password", false]]);
});

test("linking errors read plainly, including the one for a second account", () => {
  const back = Methods.linkReturn("https://saltandsovereignty.com/#error=server_error&error_code=identity_already_exists&error_description=Identity+is+already+linked+to+another+user");
  const message = Methods.linkErrorMessage({ code: back.errorCode, message: back.errorDescription }, "google");
  assert.match(message, /^That Google account already has its own Salt & Sovereignty account\./);
  assert.ok(message.includes(Methods.SUPPORT_EMAIL));
  assert.match(Methods.linkErrorMessage({ code: "manual_linking_disabled" }, "apple"), /isn’t switched on yet/);
  assert.match(Methods.unlinkErrorMessage({ code: "single_identity_not_deletable" }, "apple"), /only way to sign in/);
});
