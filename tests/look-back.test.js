const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// "Did it work?" on the website: the app's own look-back logic (js/core/rituals.js
// and the small js/core/lookback.js), and the guest save into this browser's journal.
function sandboxWith(files, extra = {}) {
  const sandbox = { TextEncoder, Intl, crypto: globalThis.crypto, console, ...extra };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const file of files) vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), sandbox);
  return sandbox;
}
const plain = (value) => JSON.parse(JSON.stringify(value));

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    removeItem: (k) => {
      delete data[k];
    }
  };
}

const entry = (extra = {}) => ({
  id: "r1",
  title: "Money candle",
  intention: "prosperity",
  moon_phase: "Waxing Crescent",
  ritual_date: "2026-10-18",
  metadata: { journalVersion: 1, completedSteps: [] },
  altar_snapshot: {},
  ...extra
});

test("the small look-back bundle and the Rituals bundle agree", () => {
  const small = sandboxWith(["js/core/lookback.js"]).SaltCore.lookback;
  const full = sandboxWith(["js/core/rituals.js"]).SaltCore.rituals;
  const now = new Date(2026, 9, 18, 21);
  for (const LB of [small.lookBack, full.lookBack]) {
    assert.equal(LB.suggestedWhen(entry()), "full_moon");
    assert.equal(LB.suggestedWhen(entry({ title: "Cord cutting", intention: "banishing" })), "new_moon");
  }
  assert.deepEqual(plain(small.lookBack.newLookBack(entry(), now)), plain(full.lookBack.newLookBack(entry(), now)));
  assert.deepEqual(plain(small.lookBack.newLookBack(entry(), now, "week")), { date: "2026-10-25", when: "week" });
});

test("an answer is saved into metadata.lookBack, as the app saves it", () => {
  const LB = sandboxWith(["js/core/lookback.js"]).SaltCore.lookback.lookBack;
  const working = { ...entry(), metadata: { ...entry().metadata, lookBack: { date: "2026-10-26", when: "full_moon" } } };
  assert.equal(LB.isDue(working, new Date(2026, 9, 26, 9)), true);
  const answered = LB.answerLookBack(working, { answer: "yes", outcome: "A new client" }, new Date(2026, 9, 27));
  assert.deepEqual(plain(answered.metadata), {
    journalVersion: 1,
    completedSteps: [],
    lookBack: { date: "2026-10-26", when: "full_moon", answer: "yes", outcome: "A new client", outcomeDate: "2026-10-27" }
  });
  // Entries from before look-backs, from either platform, read as having none.
  assert.equal(LB.readLookBack(entry()), null);
  assert.equal(LB.readLookBack({ metadata: null }), null);
});

test("What works for you reads the same answers on the website", () => {
  const R = sandboxWith(["js/core/rituals.js"]).SaltCore.rituals;
  const answered = (id, answer) => R.lookBack.answerLookBack(entry({ id }), { answer, outcome: "" }, new Date(2026, 9, 27));
  const works = R.whatWorks.whatWorks([answered("a", "yes"), answered("b", "partly")]);
  assert.equal(works.answered, 2);
  assert.equal(works.caveat, "Only 2 workings so far, so read these as early notes rather than patterns.");
  assert.equal(R.whatWorks.tallyWords(works.byIntention[0]), "1 of 2 worked, 1 partly");
});

test("a guest's answer reaches both of this browser's journal copies", async () => {
  const working = entry();
  const storage = memoryStorage({
    "saltAndSovereigntyRitualLifecycle:guest": JSON.stringify({ version: 1, activeSessionId: null, sessions: [], journals: [working] }),
    saltAndSovereigntyUserRituals: JSON.stringify([working, { id: "other", title: "Other" }])
  });
  const sandbox = sandboxWith(["js/core/rituals.js", "rituals/js/rituals-logic.js"], { localStorage: storage, sessionStorage: memoryStorage() });
  sandbox.getCurrentSaltUser = () => null;
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../rituals/js/rituals-store.js"), "utf8"), sandbox);
  const LB = sandbox.SaltCore.rituals.lookBack;
  const next = LB.answerLookBack(working, { answer: "not_yet", outcome: "", keepWaiting: { when: "week" } }, new Date(2026, 9, 27));
  await sandbox.RitualsStore.saveJournalMetadata(next);
  const device = JSON.parse(storage.data["saltAndSovereigntyRitualLifecycle:guest"]);
  const mine = JSON.parse(storage.data.saltAndSovereigntyUserRituals);
  assert.equal(device.journals[0].metadata.lookBack.date, "2026-11-03");
  assert.equal(mine[0].metadata.lookBack.waited.length, 1);
  assert.equal(mine[0].title, "Money candle", "the rest of the entry is kept");
  assert.equal(mine[1].metadata, undefined, "other entries are untouched");
  const journal = await sandbox.RitualsStore.journal();
  assert.equal(journal.length, 2);
  assert.equal(LB.readLookBack(journal.find((e) => e.id === "r1")).date, "2026-11-03");
});
