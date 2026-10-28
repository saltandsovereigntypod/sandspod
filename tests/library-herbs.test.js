const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const L = require("../library/library-logic.js");

const sandbox = { window: {}, TextEncoder, Intl };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(`${fs.readFileSync(path.join(__dirname, "../js/traditional-library.js"), "utf8")}\nglobalThis.TraditionalLibrary = TraditionalLibrary;`, sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/core/library.js"), "utf8"), sandbox);
const core = sandbox.SaltCore.library;
const DATA = sandbox.TraditionalLibrary;

// The second batch of herbs, by their picture folder (the Library key with "-" for "_").
const BATCH_2 = ["anise", "borage", "cardamom", "cinquefoil", "red-clover", "damiana", "eucalyptus", "fennel", "galangal", "heather", "hibiscus", "honeysuckle", "lilac", "mullein", "nutmeg", "passionflower", "pine", "rosehip", "sunflower", "violet"];
const keyOf = (id) => id.replace(/-/g, "_");

test("the website's Library has the new herbs, field for field like rosemary", () => {
  assert.equal(Object.keys(DATA.herb).length, 80);
  const fields = Object.keys(DATA.herb.rosemary).sort();
  for (const id of BATCH_2) {
    const herb = DATA.herb[keyOf(id)];
    assert.ok(herb, id);
    assert.deepEqual(Object.keys(herb).sort(), fields, id);
    for (const field of fields) assert.ok(String(herb[field]).trim(), `${id} ${field}`);
  }
});

test("the new herbs show as Library entries and open by reference", () => {
  const entries = L.buildEntries(core, DATA, [], {});
  for (const id of BATCH_2) {
    const ref = `traditional/herb/${keyOf(id)}`;
    assert.equal(L.findEntry(core, entries, ref)?.id, `traditional:herb:${keyOf(id)}`, id);
  }
});
