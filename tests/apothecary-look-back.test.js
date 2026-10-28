const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// "Did it work?" for spell jars, sachets and the rest of My Apothecary on the
// website: the app's own logic (apothecaryLookBack in js/core/lookback.js,
// rituals.js and today.js), kept in apothecary_items.metadata.lookBack.
function sandboxWith(files, extra = {}) {
  const sandbox = { TextEncoder, Intl, crypto: globalThis.crypto, console, ...extra };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  // The bundles read the Traditional Library from the page's own script (scripts/build-core.mjs).
  for (const file of ["js/traditional-library.js", ...files]) vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), sandbox);
  return sandbox;
}
const plain = (value) => JSON.parse(JSON.stringify(value));
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

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

const Normalize = require("../js/apothecary-normalization.js");
const row = (extra = {}) => ({
  id: "a1",
  name: "Money Jar",
  type: "spell-jar",
  intention: "prosperity",
  created_at: "2026-10-18T19:00:00.000Z",
  ingredients: [{ label: "Basil Loose", type: "herb", herb: "basil" }, { label: "Green Candle", type: "candle", color: "green" }],
  metadata: { source: "altar-apothecary", keepMe: 1 },
  ...extra
});

test("the website keeps an item's metadata, and every bundle has the same look-back", () => {
  const item = Normalize.normalize(row());
  assert.deepEqual(item.metadata, { source: "altar-apothecary", keepMe: 1 });
  assert.deepEqual(Normalize.normalize({ id: "b" }).metadata, {});
  const now = new Date(2026, 9, 18, 21);
  const bundles = [
    sandboxWith(["js/core/lookback.js"]).SaltCore.lookback.apothecaryLookBack,
    sandboxWith(["js/core/rituals.js"]).SaltCore.rituals.apothecaryLookBack,
    sandboxWith(["js/core/today.js"]).SaltCore.today.apothecaryLookBack
  ];
  for (const A of bundles) {
    assert.equal(A.itemSuggestedWhen(item), "full_moon");
    const started = A.startItemLookBack(item, "week", now);
    assert.deepEqual(plain(started.metadata), { source: "altar-apothecary", keepMe: 1, lookBack: { date: "2026-10-25", when: "week" } });
    assert.equal(A.dueItems([started], new Date(2026, 9, 26)).length, 1);
  }
});

test("the editor sets the look-back and the row keeps it", () => {
  const source = read("altar/js/features/apothecary.js");
  assert.match(source, /name="look_back"/);
  assert.match(source, /metadata: existingItem\?\.metadata \|\| \{\}/);
  assert.match(source, /\.\.\.\(item\.metadata && typeof item\.metadata === "object" \? item\.metadata : \{\}\),\s*source: "altar-apothecary"/);
});

test("a guest's answer is saved into this browser's apothecary, every other part kept", async () => {
  const storage = memoryStorage({ saltAndSovereigntyApothecaryItems: JSON.stringify([{ ...Normalize.normalize(row()), extra: "x" }, { id: "b", name: "Other" }]) });
  const sandbox = sandboxWith(["js/core/rituals.js", "rituals/js/rituals-logic.js", "js/apothecary-normalization.js"], { localStorage: storage, sessionStorage: memoryStorage() });
  sandbox.getCurrentSaltUser = () => null;
  vm.runInContext(read("rituals/js/rituals-store.js"), sandbox);
  const A = sandbox.SaltCore.rituals.apothecaryLookBack;
  const [item] = await sandbox.RitualsStore.apothecaryItems();
  const started = A.startItemLookBack(item, "week", new Date(2026, 9, 18, 21));
  const answered = A.answerItemLookBack(started, { answer: "partly", outcome: "Some came" }, new Date(2026, 9, 25));
  await sandbox.RitualsStore.saveApothecaryMetadata(answered);
  const saved = JSON.parse(storage.data.saltAndSovereigntyApothecaryItems);
  assert.equal(saved[0].extra, "x");
  assert.equal(saved[0].metadata.keepMe, 1);
  assert.equal(saved[0].metadata.lookBack.answer, "partly");
  assert.equal(saved[1].metadata, undefined);
  // What works for you counts it, with its intention and herbs.
  const works = sandbox.SaltCore.rituals.whatWorks.whatWorks(A.lookBackWorkings((await sandbox.RitualsStore.apothecaryItems())));
  assert.equal(works.answered, 1);
  assert.equal(works.byIntention[0].label, "Prosperity");
  assert.equal(works.byHerb[0].label, "Basil");
});

test("the pages ask on Today, on the Rituals home and on Your moon", () => {
  assert.match(read("today/today.js"), /C\.apothecaryLookBack\.dueItems/);
  assert.match(read("rituals/js/home.js"), /apothecaryLookBack\.dueItems/);
  assert.match(read("rituals/js/insights.js"), /A\.lookBackWorkings\(items\)/);
  for (const page of ["rituals/index.html", "rituals/journal/insights/index.html"]) assert.match(read(page), /apothecary-normalization\.js/);
});
