const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const L = require("../library/library-logic.js");

const sandbox = { window: {}, TextEncoder, Intl };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/core/library.js"), "utf8"), sandbox);
vm.runInContext(`${fs.readFileSync(path.join(__dirname, "../js/traditional-library.js"), "utf8")}\nglobalThis.TraditionalLibrary = TraditionalLibrary;`, sandbox);
const core = sandbox.SaltCore.library;
const DATA = sandbox.TraditionalLibrary;

// The second batch of crystals, by their picture folder (the Library key with "-" for "_").
const BATCH_2 = ["aragonite", "azurite", "orange-calcite", "charoite", "danburite", "dalmatian-jasper", "larimar", "prehnite", "rutilated-quartz", "snowflake-obsidian", "tourmalinated-quartz", "ocean-jasper", "mookaite", "pink-tourmaline", "iolite", "morganite", "amazonite", "blue-apatite", "spirit-quartz", "desert-rose"];
const keyOf = (id) => id.replace(/-/g, "_");

test("the website's Library has the new crystals, field for field like amethyst", () => {
  assert.equal(Object.keys(DATA.crystal).length, 70);
  const fields = Object.keys(DATA.crystal.amethyst).sort();
  for (const id of BATCH_2) {
    const crystal = DATA.crystal[keyOf(id)];
    assert.ok(crystal, id);
    assert.deepEqual(Object.keys(crystal).sort(), fields, id);
    for (const field of fields) assert.ok(String(crystal[field]).trim(), `${id} ${field}`);
  }
});

test("the new crystals show as Library entries and open by reference", () => {
  const entries = L.buildEntries(core, DATA, [], {});
  for (const id of BATCH_2) {
    const ref = `traditional/crystal/${keyOf(id)}`;
    assert.equal(L.findEntry(core, entries, ref)?.id, `traditional:crystal:${keyOf(id)}`, id);
  }
});

test("the website's stone care knows them as Library stones", () => {
  const box = { window: {}, TextEncoder, Intl };
  box.window = box;
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/traditional-library.js"), "utf8"), box);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/core/practice-b.js"), "utf8"), box);
  const care = box.SaltCore["practice-b"].care;
  for (const id of BATCH_2) assert.equal(care.careByKey(keyOf(id))?.library, true, id);
});
